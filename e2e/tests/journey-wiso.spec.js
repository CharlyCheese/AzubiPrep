import { test, expect, _electron } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { loadJourney } from '../../backend/src/journey.js';
import { readCsvFile } from '../../backend/src/csv.js';
import { journeyStorageKey, createJourneyState, reduceJourney, exportJourney } from '../../frontend/src/store/journeyStore.js';
import { unterdrueckeOnboardingPopups } from './helpers.js';

test.use({ serviceWorkers: 'block' });
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const service = loadJourney(path.join(repo, 'content'));
const allTopics = service.getSummary().readyTopics.filter(item => ['LF1', 'WISO'].includes(item.fieldId)).map(item => service.getTopic(item.id));
const lf1 = allTopics.filter(item => item.fieldId === 'LF1');
const topics = allTopics.filter(item => item.fieldId === 'WISO');
const last = topics.at(-1);
const route = topic => `/lernreise/fiae/${topic.id}`;
const answers = topic => Object.fromEntries(readCsvFile(path.join(repo, `content/learning-journey/questions/${topic.id}.v1.csv`)).records.map(row => [row.id, row.antwort]));
const rawOf = (page, topic) => page.evaluate(async ({ id, key }) => window.azubiDesktop?.journey
  ? window.azubiDesktop.journey.load(id) : localStorage.getItem(key), { id: topic.id, key: journeyStorageKey(topic.id) });
const saved = page => expect(page.locator('.journey-status')).toHaveText('Gespeichert');

function stateAt(topic, phase = 'result') {
  const answerMap = answers(topic);
  let state = createJourneyState(topic);
  const act = action => { state = reduceJourney(state, action, topic); };
  if (phase === 'theory') return { ...state, revision: 1 };
  topic.blocks.forEach(() => act({ type: 'read-block' }));
  for (const questionId of topic.quiz.questionIds) {
    const answer = answerMap[questionId];
    act({ type: 'select-answer', questionId, answer });
    act({ type: 'quiz-feedback', feedback: service.check(topic.id, { version: topic.version, questionId, answer }) });
    act({ type: 'next-quiz' });
  }
  if (phase === 'reflection') return { ...state, revision: 1 };
  topic.interview.forEach(item => { act({ type: 'reflection-reveal' }); act({ type: 'reflection-done', ...(item.practice ? { practiceConfirmed: true } : {}) }); });
  topic.cards.forEach(() => { act({ type: 'card-reveal' }); act({ type: 'card-rate', rating: 'known' }); });
  const attemptId = randomUUID();
  act({ type: 'start-exam', attemptId });
  topic.exam.questionIds.forEach((questionId, index) => {
    act({ type: 'select-answer', questionId, answer: answerMap[questionId] });
    if (index < 7) act({ type: 'next-exam' });
  });
  if (phase === 'exam') return { ...state, revision: 1 };
  const result = service.evaluate(topic.id, { version: topic.version, attemptId, answers: topic.exam.questionIds.map(questionId => ({ questionId, answer: answerMap[questionId] })) });
  act({ type: 'exam-result', result, completedAt: new Date().toISOString() });
  return { ...state, revision: 1 };
}

async function setup(page) {
  await unterdrueckeOnboardingPopups(page);
  await page.route('**/api/ai/**', handler => handler.abort());
  await page.goto('/lernreise?fr=FIAE');
}
async function seed(page, states) {
  await page.evaluate(async items => {
    for (const { key, state } of items) {
      const raw = JSON.stringify(state);
      if (window.azubiDesktop?.journey) await window.azubiDesktop.journey.save({ topicId: state.topicId, raw, expectedRaw: null });
      else localStorage.setItem(key, raw);
    }
  }, states.map(state => ({ key: journeyStorageKey(state.topicId), state })));
}
async function clickSaved(page, topic, name) {
  const before = JSON.parse(await rawOf(page, topic))?.revision ?? 0;
  await page.getByRole('button', { name, exact: true }).click();
  await expect.poll(async () => JSON.parse(await rawOf(page, topic))?.revision ?? 0).toBeGreaterThan(before);
  await saved(page);
}
async function choose(page, topic, questionId) {
  const before = JSON.parse(await rawOf(page, topic)).revision;
  await page.locator(`input[name="${questionId}"][value="${answers(topic)[questionId]}"]`).check();
  await expect.poll(async () => JSON.parse(await rawOf(page, topic)).revision).toBeGreaterThan(before);
}

for (const [index, topic] of topics.entries()) {
  test(`${topic.title}: vollständiger Lernablauf, passende Auswertung und Fortsetzung`, async ({ page }) => {
    test.setTimeout(120_000);
    await setup(page); await seed(page, [...lf1, ...topics.slice(0, index)].map(item => stateAt(item)));
    const originals = await Promise.all([...lf1, ...topics.slice(0, index)].map(item => rawOf(page, item)));
    await page.goto('/lernreise?fr=FIAE');
    await page.getByRole('link', { name: 'Lernreise fortsetzen', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${route(topic)}$`));
    await clickSaved(page, topic, 'Abschnitt beginnen');
    await clickSaved(page, topic, 'Gelesen – weiter');
    await page.reload(); await saved(page);
    await expect(page.getByRole('heading', { name: topic.blocks[1].title, exact: true })).toBeVisible();
    await clickSaved(page, topic, 'Gelesen – weiter'); await clickSaved(page, topic, 'Gelesen – weiter'); await clickSaved(page, topic, 'Gelesen – zum Quiz');
    for (const [i, questionId] of topic.quiz.questionIds.entries()) {
      await choose(page, topic, questionId); await clickSaved(page, topic, 'Antwort prüfen');
      await expect(page.getByRole('region', { name: 'Aktueller Lernschritt' })).toContainText('Richtig.');
      await clickSaved(page, topic, i === 5 ? 'Weiter zur Selbstreflexion' : 'Nächste Frage');
    }
    for (const [i, item] of topic.interview.entries()) {
      if (item.practice) await expect(page.getByRole('region', { name: 'Praktische Präsentationsaufgabe' })).toBeVisible();
      await clickSaved(page, topic, 'Kernpunkte ansehen');
      const next = i === 2 ? 'Verglichen – zu den Karteikarten' : 'Verglichen – weiter';
      if (item.practice) {
        await expect(page.getByRole('button', { name: next, exact: true })).toBeDisabled();
        await page.getByLabel(item.practice.confirmation, { exact: true }).check();
        await page.reload(); await saved(page);
        await expect(page.getByRole('button', { name: next, exact: true })).toBeDisabled();
        await page.getByLabel(item.practice.confirmation, { exact: true }).check();
      }
      await clickSaved(page, topic, next);
    }
    for (const card of topic.cards) { await clickSaved(page, topic, 'Kartenantwort zeigen'); await clickSaved(page, topic, 'Gewusst – weiter'); }
    await clickSaved(page, topic, 'Mini-Test beginnen');
    for (const [i, questionId] of topic.exam.questionIds.entries()) {
      await choose(page, topic, questionId);
      if (i < 7) await clickSaved(page, topic, 'Nächste Testfrage');
    }
    await clickSaved(page, topic, 'Mini-Test abgeben');
    await expect(page.getByText('8 von 8 richtig (100 %).', { exact: false })).toBeVisible();
    const final = JSON.parse(await rawOf(page, topic));
    expect(final.exam.result.objectives).toHaveLength(topic.objectives.length);
    expect(final.bestResult.passed).toBe(true);
    expect(await Promise.all([...lf1, ...topics.slice(0, index)].map(item => rawOf(page, item)))).toEqual(originals);
    await page.reload(); await saved(page);
    await expect(page.getByRole('heading', { name: 'Deine Auswertung' })).toBeVisible();
    if (topic.nextTopic) await expect(page.getByRole('link', { name: `Nächstes Thema: ${topic.nextTopic.title}` })).toBeVisible();
    await page.getByRole('link', { name: 'Zur Lernreise', exact: true }).click();
    await expect(page.getByText(`WISO: ${index + 1} von 10 Themen bestanden.`, { exact: false })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'WISO in der Lernreise abgeschlossen', exact: true })).toHaveCount(index === 9 ? 1 : 0);
  });
}

test('WISO-Sicherung wird nur nach Vorschau übernommen und lässt LF1 bytegleich erhalten', async ({ page }) => {
  await setup(page); await seed(page, lf1.map(item => stateAt(item)));
  const topic = topics[0];
  const originals = await Promise.all(lf1.map(item => rawOf(page, item)));
  await page.goto(route(topic)); await clickSaved(page, topic, 'Abschnitt beginnen');
  const initial = JSON.parse(await rawOf(page, topic));
  await clickSaved(page, topic, 'Gelesen – weiter');
  await page.getByText('Nachlesen, Sicherung und Quellen', { exact: true }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Lernreise sichern', exact: true }).click();
  expect((await download).suggestedFilename()).toBe(`AzubiPrep-Lernreise-${topic.id}.json`);
  const upload = page.getByLabel('Lernreise-Sicherung einlesen');
  const before = await rawOf(page, topic);
  await upload.setInputFiles({ name: 'fremd.json', mimeType: 'application/json', buffer: Buffer.from(exportJourney(JSON.parse(originals[0]), lf1[0])) });
  await expect(page.getByRole('alert')).toContainText('nicht zu diesem Abschnitt');
  expect(await rawOf(page, topic)).toBe(before);
  await upload.setInputFiles({ name: 'wiso.json', mimeType: 'application/json', buffer: Buffer.from(exportJourney(initial, topic)) });
  await expect(page.getByRole('heading', { name: 'Sicherung vor der Übernahme prüfen' })).toBeVisible();
  expect(await rawOf(page, topic)).toBe(before);
  await clickSaved(page, topic, 'Diesen Reisestand ersetzen');
  expect(JSON.parse(await rawOf(page, topic)).index).toBe(0);
  expect(await Promise.all(lf1.map(item => rawOf(page, item)))).toEqual(originals);
});

test('WISO verlangt alle LF1-Themen; fremder oder beschädigter Stand öffnet keine Abkürzung', async ({ page }) => {
  await setup(page);
  await seed(page, [stateAt(lf1[0]), stateAt(lf1.at(-1))]);
  await page.goto(route(topics[0]));
  await expect(page.getByRole('heading', { name: 'Zuerst die Grundlage abschließen' })).toBeVisible();
  await expect(page.getByRole('link', { name: `${lf1[1].title} öffnen`, exact: true })).toBeVisible();
  expect(await rawOf(page, topics[0])).toBeNull();
  await seed(page, lf1.slice(1, -1).map(item => stateAt(item)));
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Dein nächster Schritt in WISO', exact: true })).toBeVisible();
  await page.goto(route(topics[2]));
  await expect(page.getByRole('heading', { name: 'Zuerst die Grundlage abschließen' })).toBeVisible();
});

test('WISO-Abschluss, Reihenfolge, verfügbares PM und Tastatur bleiben mobil nachvollziehbar', async ({ page, context }, info) => {
  await setup(page); await seed(page, allTopics.map(item => stateAt(item))); await page.reload();
  const completed = page.getByRole('heading', { name: 'WISO in der Lernreise abgeschlossen', exact: true });
  await expect(completed).toBeVisible();
  await expect(page.getByText('WISO: 10 von 10 Themen bestanden.', { exact: false })).toBeVisible();
  const stages = page.locator('.journey-stage');
  await expect(stages).toHaveCount(14);
  const labels = await stages.locator(':scope > summary').allTextContents();
  expect(labels[0]).toContain('LF1'); expect(labels[1]).toContain('Wirtschafts- und Sozialkunde');
  expect(labels[2]).toContain('Projektmanagement'); expect(labels[3]).toContain('LF2');
  await expect(page.getByRole('heading', { name: 'PM in der Lernreise abgeschlossen', exact: true })).toHaveCount(0);
  const other = await context.newPage(); await setup(other);
  const original = await rawOf(other, topics[4]);
  await other.evaluate(key => localStorage.setItem(key, '{broken-test'), journeyStorageKey(topics[4].id));
  await expect(completed).toHaveCount(0);
  await expect(page.getByText('WISO: 9 von 10 Themen bestanden.', { exact: false })).toBeVisible();
  await other.evaluate(({key, raw}) => localStorage.setItem(key, raw), { key: journeyStorageKey(topics[4].id), raw: original });
  await expect(completed).toBeVisible(); await other.close();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.journey-directory > summary').click();
  const summary = stages.nth(1).locator('summary');
  await summary.focus(); await page.keyboard.press('Enter');
  await expect(stages.nth(1)).toHaveAttribute('open', '');
  await expect(page.getByRole('link', { name: `${topics[0].title}: öffnen`, exact: true })).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(stages.nth(1)).not.toHaveAttribute('open', '');
  if (!(await stages.nth(2).getAttribute('open') !== null)) await stages.nth(2).locator('summary').click();
  await expect(stages.nth(2)).toContainText('Projektauftrag und klare Ziele');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.screenshot({ path: info.outputPath('wiso-complete-mobile.png'), fullPage: true });
});

test('Freie Modulreise ordnet WISO und PM vor LF2 ein und behält alle Module', async ({ page }) => {
  await setup(page);
  await page.getByRole('link', { name: 'Freie Modulreise', exact: true }).click();
  await page.getByRole('button', { name: 'Listenansicht', exact: true }).click();
  const links = await page.locator('.reise-tabelle tbody a').evaluateAll(items => items.map(item => item.getAttribute('href')));
  expect(links).toHaveLength(10);
  expect(links.indexOf('/lernen/WISO')).toBeLessThan(links.indexOf('/lernen/PM'));
  expect(links.indexOf('/lernen/PM')).toBeLessThan(links.indexOf('/lernen/HARDWARE'));
  const station = page.locator('.reise-tabelle a[href="/lernen/HARDWARE"]');
  await station.click();
  await page.getByRole('link', { name: 'Theorie lernen →' }).click();
  await page.getByRole('link', { name: 'Glossar', exact: true }).click();
  await page.getByRole('link', { name: '← Zum Modul HARDWARE' }).click();
  await page.getByRole('main').getByRole('link', { name: '← Lernreise', exact: true }).click();
  await expect(station).toBeFocused();
});

test('Electron: 16 Themen und WISO-Rückblick bleiben nach vollständigem Neustart im eigenen Profil', { tag: '@desktop' }, async ({}, info) => {
  test.skip(process.platform !== 'win32', 'Windows-Electron-Matrix'); test.setTimeout(90_000);
  const profile = info.outputPath('wiso-complete-profile');
  const launch = async () => {
    const env = { ...process.env, DATABASE_URL: '', AI_ENABLED: 'false', AZUBIPREP_AI_DIR: path.join(profile, 'local-ai'), AZUBIPREP_RAG_DIR: path.join(profile, 'local-rag') };
    delete env.ELECTRON_RUN_AS_NODE;
    const app = await _electron.launch({ executablePath: path.join(repo, 'desktop/node_modules/electron/dist/electron.exe'), args: [path.join(repo, 'desktop'), `--user-data-dir=${profile}`], env });
    const page = await app.firstWindow(); await page.waitForURL(/^http:\/\/127\.0\.0\.1:/);
    const origin = new URL(page.url()).origin;
    await unterdrueckeOnboardingPopups(page); await page.route('**/api/ai/**', handler => handler.abort());
    return { app, page, origin };
  };
  let first; let second;
  try {
    first = await launch(); await seed(first.page, allTopics.map(item => stateAt(item)));
    const originals = await Promise.all(allTopics.map(item => rawOf(first.page, item)));
    await first.page.goto(`${first.origin}/lernreise?fr=FIAE`);
    await expect(first.page.getByRole('heading', { name: 'WISO in der Lernreise abgeschlossen', exact: true })).toBeVisible();
    await first.app.close(); first.app = null;
    second = await launch(); await second.page.goto(`${second.origin}/lernreise?fr=FIAE`);
    await expect(second.page.getByRole('heading', { name: 'WISO in der Lernreise abgeschlossen', exact: true })).toBeVisible();
    expect(await Promise.all(allTopics.map(item => rawOf(second.page, item)))).toEqual(originals);
    await second.page.goto(`${second.origin}${route(last)}`); await saved(second.page);
    await clickSaved(second.page, last, 'Mini-Test wiederholen');
    expect(JSON.parse(await rawOf(second.page, last)).reflection.done).toContain(last.interview[2].id);
    expect(await Promise.all(allTopics.slice(0, -1).map(item => rawOf(second.page, item)))).toEqual(originals.slice(0, -1));
  } finally { await second?.app?.close(); await first?.app?.close(); }
});
