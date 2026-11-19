import { test, expect, _electron } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { loadJourney } from '../../backend/src/journey.js';
import { readCsvFile } from '../../backend/src/csv.js';
import { journeyStorageKey, createJourneyState, reduceJourney, exportJourney } from '../../frontend/src/store/journeyStore.js';
import { calculationSheet } from '../../frontend/src/utils/journeyCalculation.js';
import { unterdrueckeOnboardingPopups } from './helpers.js';

test.use({ serviceWorkers: 'block' });
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const service = loadJourney(path.join(repo, 'content'));
const allTopics = service.getSummary().readyTopics.filter(item => ['LF1', 'WISO', 'PM'].includes(item.fieldId)).map(item => service.getTopic(item.id));
const lf1 = allTopics.filter(item => item.fieldId !== 'PM');
const topics = allTopics.filter(item => item.fieldId === 'PM');
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
    await expect(page.getByText(`PM: ${index + 1} von 10 Themen bestanden.`, { exact: false })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'PM in der Lernreise abgeschlossen', exact: true })).toHaveCount(index === 9 ? 1 : 0);
  });
}

for (const [suffix, expected] of [['costs', '3.760'], ['pricing', '5.593'], ['feasibility', '3.000']]) {
  test(`Kalkulation ${suffix}: selbst rechnen, prüfen, sichern und nach Neuladen fortsetzen`, async ({ page }, info) => {
    const topic = topics.find(item => item.id === `common-pm-${suffix}`);
    await setup(page);
    const preceding = allTopics.slice(0, allTopics.findIndex(item => item.id === topic.id));
    await seed(page, preceding.map(item => stateAt(item)));
    let initial = createJourneyState(topic);
    for (let i = 0; i < 3; i++) initial = reduceJourney(initial, { type: 'read-block' }, topic);
    await seed(page, [{ ...initial, revision: 1 }]);
    const beforeOthers = await Promise.all(preceding.map(item => rawOf(page, item)));
    await page.goto(route(topic)); await saved(page);
    const area = page.getByRole('region', { name: 'Kalkulation zum Thema', exact: true });
    await expect(area).toBeVisible();
    await area.getByRole('button', { name: 'Rechnung prüfen', exact: true }).click();
    await expect(area.getByRole('status', { name: 'Prüfergebnis der Kalkulation', exact: true })).toContainText('Prüfe deinen Rechenweg');
    const sheet = calculationSheet(topic.id);
    for (const [index, row] of sheet.rows.entries()) {
      if (!row.formula) continue;
      const id = `B${index + 1}`;
      await area.getByRole('textbox', { name: `${id} ${row.label}`, exact: true }).fill(row.formula);
      await expect.poll(async () => JSON.parse(await rawOf(page, topic)).calculation.cells[id]).toBe(row.formula);
    }
    await saved(page);
    await area.getByRole('button', { name: 'Rechnung prüfen', exact: true }).click();
    await expect(area.getByRole('status', { name: 'Prüfergebnis der Kalkulation', exact: true })).toContainText('Die Rechnung passt zu deinen Vorgaben.');
    await expect(area).toContainText(expected);
    const raw = await rawOf(page, topic);
    const backup = exportJourney(JSON.parse(raw), topic);
    await page.reload(); await saved(page);
    const firstResult = sheet.inputs + 1; const resultId = `B${firstResult}`;
    const input = area.getByRole('textbox', { name: `${resultId} ${sheet.rows[firstResult - 1].label}`, exact: true });
    await expect(input).toHaveValue(sheet.rows[firstResult - 1].formula);
    await input.fill(`=${resultId}`); await saved(page);
    await expect(area).toContainText('Kreisbezug');
    await page.getByText('Nachlesen, Sicherung und Quellen', { exact: true }).click();
    await page.getByLabel('Lernreise-Sicherung einlesen').setInputFiles({ name: 'pm-rechnung.json', mimeType: 'application/json', buffer: Buffer.from(backup) });
    await expect(page.getByRole('heading', { name: 'Sicherung vor der Übernahme prüfen' })).toBeVisible();
    await clickSaved(page, topic, 'Diesen Reisestand ersetzen');
    await expect(input).toHaveValue(sheet.rows[firstResult - 1].formula);
    expect(await Promise.all(preceding.map(item => rawOf(page, item)))).toEqual(beforeOthers);
    if (suffix === 'feasibility') {
      await area.getByRole('textbox', { name: 'B1 Fixkosten der Periode', exact: true }).fill('12000,01');
      await expect.poll(async () => JSON.parse(await rawOf(page, topic)).calculation.cells.B1).toBe('12000,01');
      await area.getByRole('button', { name: 'Rechnung prüfen', exact: true }).click();
      await expect(area.getByLabel('B8 Rechenwert', { exact: true })).toContainText('≈ 200 Stück');
      await expect(area.getByRole('status', { name: 'Prüfergebnis der Kalkulation', exact: true })).toContainText('201 Stück');
    }
    if (suffix === 'costs') {
      await area.getByText('Rechenhilfe öffnen', { exact: true }).click();
      await area.getByLabel('Deine Rechnung, zum Beispiel (80*35)*20/100').fill('(80*35)*20/100');
      await area.getByRole('button', { name: 'Ausrechnen', exact: true }).click();
      await expect(area.getByRole('status').filter({ hasText: 'Ergebnis:' })).toContainText('560');
      await page.setViewportSize({ width: 390, height: 844 });
      await input.focus(); await expect(input).toBeFocused();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      await area.scrollIntoViewIfNeeded(); await page.screenshot({ path: info.outputPath('pm-calculation-mobile.png') });
    }
  });
}

test('PM braucht die vollständigen Grundlagen; Abschluss führt zum verfügbaren LF2', async ({ page, context }) => {
  await setup(page); await seed(page, [stateAt(lf1.at(-1))]);
  await page.goto(route(topics[0]));
  await expect(page.getByRole('heading', { name: 'Zuerst die Grundlage abschließen' })).toBeVisible();
  expect(await rawOf(page, topics[0])).toBeNull();
  await page.goto('/lernreise?fr=FIAE');
  await page.evaluate(() => { for (const key of Object.keys(localStorage)) if (key.startsWith('azubiprep.journey.fiae')) localStorage.removeItem(key); });
  await seed(page, allTopics.map(item => stateAt(item))); await page.reload();
  const completed = page.getByRole('heading', { name: 'PM in der Lernreise abgeschlossen', exact: true });
  await expect(completed).toBeVisible();
  await expect(page.getByText('PM: 10 von 10 Themen bestanden.', { exact: false })).toBeVisible();
  await expect(page.getByText('Als Nächstes folgt LF2 mit Anforderungen', { exact: false })).toBeVisible();
  const other = await context.newPage(); await setup(other);
  await other.evaluate(key => localStorage.setItem(key, '{broken'), journeyStorageKey(topics[4].id));
  await expect(completed).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Gespeicherten Stand prüfen', exact: true })).toBeVisible();
  await other.close();
});

test('Electron: 26 Themen und PM-Rückblick bleiben nach vollständigem Neustart im eigenen Profil', { tag: '@desktop' }, async ({}, info) => {
  test.skip(process.platform !== 'win32', 'Windows-Electron-Matrix'); test.setTimeout(90_000);
  const profile = info.outputPath('pm-complete-profile');
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
    const costTopic = topics.find(topic => topic.id === 'common-pm-costs');
    await first.page.goto(`${first.origin}${route(costTopic)}`); await saved(first.page);
    await first.page.getByText('Kalkulation und Rechenhilfe', { exact: true }).click();
    await first.page.getByRole('textbox', { name: 'B5 Personalkosten', exact: true }).fill('=B1*B2');
    await expect.poll(async () => JSON.parse(await rawOf(first.page, costTopic)).calculation.cells.B5).toBe('=B1*B2');
    const originals = await Promise.all(allTopics.map(item => rawOf(first.page, item)));
    await first.page.goto(`${first.origin}/lernreise?fr=FIAE`);
    await expect(first.page.getByRole('heading', { name: 'PM in der Lernreise abgeschlossen', exact: true })).toBeVisible();
    await first.app.close(); first.app = null;
    second = await launch(); await second.page.goto(`${second.origin}/lernreise?fr=FIAE`);
    await expect(second.page.getByRole('heading', { name: 'PM in der Lernreise abgeschlossen', exact: true })).toBeVisible();
    expect(await Promise.all(allTopics.map(item => rawOf(second.page, item)))).toEqual(originals);
    await second.page.goto(`${second.origin}${route(costTopic)}`); await saved(second.page);
    await second.page.getByText('Kalkulation und Rechenhilfe', { exact: true }).click();
    await expect(second.page.getByRole('textbox', { name: 'B5 Personalkosten', exact: true })).toHaveValue('=B1*B2');
    await second.page.goto(`${second.origin}${route(last)}`); await saved(second.page);
    await clickSaved(second.page, last, 'Mini-Test wiederholen');
    expect(JSON.parse(await rawOf(second.page, last)).reflection.done).toContain(last.interview[2].id);
    expect(await Promise.all(allTopics.slice(0, -1).map(item => rawOf(second.page, item)))).toEqual(originals.slice(0, -1));
  } finally { await second?.app?.close(); await first?.app?.close(); }
});
