import { test, expect, _electron } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { loadJourney } from '../../backend/src/journey.js';
import { readCsvFile } from '../../backend/src/csv.js';
import { journeyStorageKey, createJourneyState, reduceJourney } from '../../frontend/src/store/journeyStore.js';
import { unterdrueckeOnboardingPopups } from './helpers.js';

test.use({ serviceWorkers: 'block' });
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const service = loadJourney(path.join(repo, 'content'));
const topics = service.getSummary().readyTopics.filter(item => item.fieldId === 'LF1').map(item => service.getTopic(item.id));
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
  if (index < 2) continue;
  test(`${topic.title}: vollständiger Lernablauf, passende Auswertung und Fortsetzung`, async ({ page }) => {
    test.setTimeout(120_000);
    await setup(page); await seed(page, topics.slice(0, index).map(item => stateAt(item)));
    const originals = await Promise.all(topics.slice(0, index).map(item => rawOf(page, item)));
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
    expect(await Promise.all(topics.slice(0, index).map(item => rawOf(page, item)))).toEqual(originals);
    await page.reload(); await saved(page);
    await expect(page.getByRole('heading', { name: 'Deine Auswertung' })).toBeVisible();
    if (topic.nextTopic) await expect(page.getByRole('link', { name: `Nächstes Thema: ${topic.nextTopic.title}` })).toBeVisible();
    await page.getByRole('link', { name: 'Zur Lernreise', exact: true }).click();
    await expect(page.getByText(`LF1: ${index + 1} von 6 Themen bestanden.`, { exact: false })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'LF1 in der Lernreise abgeschlossen', exact: true })).toHaveCount(index === 5 ? 1 : 0);
  });
}

test('Geführte Reihenfolge schließt die Lücke zwischen fachlicher Voraussetzung und vorherigem Thema', async ({ page }) => {
  await setup(page); await seed(page, [stateAt(topics[0])]);
  await page.goto(route(topics[2]));
  await expect(page.getByRole('heading', { name: 'Zuerst die Grundlage abschließen' })).toBeVisible();
  await expect(page.getByRole('link', { name: `${topics[1].title} öffnen` })).toBeVisible();
  expect(await rawOf(page, topics[2])).toBeNull();
  await seed(page, [stateAt(topics[1])]); await page.reload();
  await expect(page.getByRole('button', { name: 'Abschnitt beginnen', exact: true })).toBeVisible();
});

test('LF1-Abschluss verlangt alle sechs gültigen Stände, reagiert auf andere Tabs und bleibt mobil erreichbar', async ({ page, context }, info) => {
  await setup(page); await seed(page, topics.map(item => stateAt(item)));
  await page.reload();
  const completed = page.getByRole('heading', { name: 'LF1 in der Lernreise abgeschlossen', exact: true });
  await expect(completed).toBeVisible();
  await expect(page.getByText('Die FIAE-Lernreise geht weiter', { exact: false })).toBeVisible();
  const other = await context.newPage(); await setup(other);
  const middle = topics[3];
  const original = await rawOf(other, middle);
  await other.evaluate(key => localStorage.setItem(key, '{broken-test'), journeyStorageKey(middle.id));
  await expect(completed).toHaveCount(0);
  await expect(page.getByText('LF1: 5 von 6 Themen bestanden.', { exact: false })).toBeVisible();
  await other.evaluate(({ key, raw }) => localStorage.setItem(key, raw), { key: journeyStorageKey(middle.id), raw: original });
  await expect(completed).toBeVisible(); await other.close();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('link', { name: 'Lernreise fortsetzen', exact: true }).focus();
  await expect(page.getByRole('link', { name: 'Lernreise fortsetzen', exact: true })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.screenshot({ path: info.outputPath('lf1-complete-mobile.png'), fullPage: true });
});

test('Electron: sechs Themen und Rückblick bleiben nach vollständigem Neustart im eigenen Profil', { tag: '@desktop' }, async ({}, info) => {
  test.skip(process.platform !== 'win32', 'Windows-Electron-Matrix'); test.setTimeout(90_000);
  const profile = info.outputPath('lf1-complete-profile');
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
    first = await launch(); await seed(first.page, topics.map(item => stateAt(item)));
    const originals = await Promise.all(topics.map(item => rawOf(first.page, item)));
    await first.page.goto(`${first.origin}/lernreise?fr=FIAE`);
    await expect(first.page.getByRole('heading', { name: 'LF1 in der Lernreise abgeschlossen', exact: true })).toBeVisible();
    await first.app.close(); first.app = null;
    second = await launch(); await second.page.goto(`${second.origin}/lernreise?fr=FIAE`);
    await expect(second.page.getByRole('heading', { name: 'LF1 in der Lernreise abgeschlossen', exact: true })).toBeVisible();
    expect(await Promise.all(topics.map(item => rawOf(second.page, item)))).toEqual(originals);
    await second.page.goto(`${second.origin}${route(last)}`); await saved(second.page);
    await clickSaved(second.page, last, 'Mini-Test wiederholen');
    expect(JSON.parse(await rawOf(second.page, last)).reflection.done).toContain(last.interview[1].id);
    expect(await Promise.all(topics.slice(0, -1).map(item => rawOf(second.page, item)))).toEqual(originals.slice(0, -1));
  } finally { await second?.app?.close(); await first?.app?.close(); }
});
