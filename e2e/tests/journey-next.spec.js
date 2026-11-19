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
const first = service.getTopic('common-lf1-role');
const second = service.getTopic('common-lf1-goals');
const route = topic => `/lernreise/fiae/${topic.id}`;
const rows = topic => readCsvFile(path.join(repo, `content/learning-journey/questions/${topic.id}.v1.csv`)).records;
const answers = topic => Object.fromEntries(rows(topic).map(row => [row.id, row.antwort]));
const saved = page => expect(page.locator('.journey-status')).toHaveText('Gespeichert');
const rawOf = (page, topic) => page.evaluate(async ({ id, key }) => window.azubiDesktop?.journey
  ? window.azubiDesktop.journey.load(id) : localStorage.getItem(key), { id: topic.id, key: journeyStorageKey(topic.id) });

function passedState(topic) {
  const answerMap = answers(topic);
  let state = createJourneyState(topic);
  const act = action => { state = reduceJourney(state, action, topic); };
  topic.blocks.forEach(() => act({ type: 'read-block' }));
  for (const questionId of topic.quiz.questionIds) {
    const answer = answerMap[questionId];
    act({ type: 'select-answer', questionId, answer });
    act({ type: 'quiz-feedback', feedback: service.check(topic.id, { version: topic.version, questionId, answer }) });
    act({ type: 'next-quiz' });
  }
  topic.interview.forEach(() => { act({ type: 'reflection-reveal' }); act({ type: 'reflection-done' }); });
  topic.cards.forEach(() => { act({ type: 'card-reveal' }); act({ type: 'card-rate', rating: 'known' }); });
  const attemptId = randomUUID();
  act({ type: 'start-exam', attemptId });
  topic.exam.questionIds.forEach((questionId, index) => {
    act({ type: 'select-answer', questionId, answer: answerMap[questionId] });
    if (index < topic.exam.questionIds.length - 1) act({ type: 'next-exam' });
  });
  const result = service.evaluate(topic.id, { version: topic.version, attemptId, answers: topic.exam.questionIds.map(questionId => ({ questionId, answer: answerMap[questionId] })) });
  act({ type: 'exam-result', result, completedAt: new Date().toISOString() });
  return { ...state, revision: 1 };
}

async function setup(page) {
  await unterdrueckeOnboardingPopups(page);
  // Fail closed: these progress checks never contact a model or local documents.
  await page.route('**/api/ai/**', handler => handler.abort());
  await page.goto('/lernreise?fr=FIAE');
}
async function seed(page, topic, state) {
  await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), { key: journeyStorageKey(topic.id), raw: JSON.stringify(state) });
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
  await saved(page);
}

test('Zweites Thema bleibt ohne bestandenen Vorgänger auch über direkte URL gesperrt', async ({ page }) => {
  await setup(page);
  await expect(page.getByText('94 von 94 geplanten Themen sind verfügbar.', { exact: false })).toBeVisible();
  await expect(page.getByRole('link', { name: `${second.title}: beginnen`, exact: true })).toHaveCount(0);
  await page.goto(route(second));
  await expect(page.getByRole('heading', { name: 'Zuerst die Grundlage abschließen' })).toBeVisible();
  expect(await rawOf(page, second)).toBeNull();
  await seed(page, first, { ...createJourneyState(first), revision: 1 });
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Zuerst die Grundlage abschließen' })).toBeVisible();
  const corrupt = '{synthetic-unreadable';
  await page.evaluate(({ key, corrupt }) => localStorage.setItem(key, corrupt), { key: journeyStorageKey(first.id), corrupt });
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('Vorgängerthemas');
  expect(await rawOf(page, first)).toBe(corrupt);
  expect(await rawOf(page, second)).toBeNull();
});

test('Später Direktlink bietet genau einen bearbeitbaren Einstieg und die Lernreiseübersicht', async ({ page }) => {
  await setup(page);
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto('/lernreise/fiae/fiae-lf12a-review');
  const next = page.getByRole('link', { name: `${first.title} öffnen`, exact: true });
  await expect(next).toBeInViewport();
  await expect(page.locator('main a:visible')).toHaveCount(2);
  await next.click();
  await expect(page.getByRole('button', { name: 'Abschnitt beginnen' })).toBeInViewport();
  await expect(page.locator('main .journey-detail')).not.toHaveAttribute('open', '');
});

test('Zweites LF1-Thema durchläuft alle Phasen, Fortsetzung und acht passende Testfragen', async ({ page }, info) => {
  test.setTimeout(120_000);
  await setup(page);
  await seed(page, first, passedState(first));
  const oldRaw = await rawOf(page, first);
  await page.goto(route(first)); await saved(page);
  await page.getByRole('link', { name: `Nächstes Thema: ${second.title}` }).click();
  await clickSaved(page, second, 'Abschnitt beginnen');
  await clickSaved(page, second, 'Gelesen – weiter');
  await page.reload(); await saved(page);
  await expect(page.getByRole('heading', { name: second.blocks[1].title, exact: true })).toBeVisible();
  await clickSaved(page, second, 'Gelesen – weiter'); await clickSaved(page, second, 'Gelesen – weiter'); await clickSaved(page, second, 'Gelesen – zum Quiz');
  for (const [index, questionId] of second.quiz.questionIds.entries()) {
    await choose(page, second, questionId);
    await clickSaved(page, second, 'Antwort prüfen');
    await expect(page.getByRole('region', { name: 'Aktueller Lernschritt' })).toContainText('Richtig');
    await clickSaved(page, second, index === 5 ? 'Weiter zur Selbstreflexion' : 'Nächste Frage');
  }
  for (let index = 0; index < second.interview.length; index++) {
    await clickSaved(page, second, 'Kernpunkte ansehen');
    await clickSaved(page, second, index === second.interview.length - 1 ? 'Verglichen – zu den Karteikarten' : 'Verglichen – weiter');
  }
  for (let index = 0; index < second.cards.length; index++) {
    await clickSaved(page, second, 'Kartenantwort zeigen'); await clickSaved(page, second, 'Gewusst – weiter');
  }
  await clickSaved(page, second, 'Mini-Test beginnen');
  for (const [index, questionId] of second.exam.questionIds.entries()) {
    await choose(page, second, questionId);
    if (index < 7) await clickSaved(page, second, 'Nächste Testfrage');
  }
  await clickSaved(page, second, 'Mini-Test abgeben');
  await expect(page.getByText('8 von 8 richtig (100 %).', { exact: false })).toBeVisible();
  const result = JSON.parse(await rawOf(page, second));
  expect(result.exam.result.objectives).toHaveLength(2);
  expect(result.bestResult.passed).toBe(true);
  expect(await rawOf(page, first)).toBe(oldRaw);
  await page.reload(); await saved(page);
  await expect(page.getByRole('heading', { name: 'Deine Auswertung' })).toBeVisible();
  await page.getByRole('link', { name: 'Zur Lernreise', exact: true }).click();
  await expect(page.getByText('LF1: 2 von 6 Themen bestanden.', { exact: false })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'LF1 in der Lernreise abgeschlossen' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Lernreise fortsetzen', exact: true })).toHaveAttribute('href', '/lernreise/fiae/common-lf1-market');
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.screenshot({ path: info.outputPath('lf1-two-topics-mobile.png'), fullPage: true });
});

test('Themenstände und Sicherungen bleiben getrennt; fremder Import ersetzt nichts', async ({ page, context }) => {
  await setup(page); await seed(page, first, passedState(first));
  const oldRaw = await rawOf(page, first);
  await page.goto('/lernreise?fr=FIAE');
  await page.getByRole('link', { name: 'Lernreise fortsetzen', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`${route(second)}$`));
  await clickSaved(page, second, 'Abschnitt beginnen');
  const initial = JSON.parse(await rawOf(page, second));
  const firstTab = await context.newPage(); await setup(firstTab); await firstTab.goto(route(first)); await saved(firstTab);
  await clickSaved(page, second, 'Gelesen – weiter');
  await expect(firstTab.locator('.journey-status')).toHaveText('Gespeichert');
  await page.getByText('Nachlesen, Sicherung und Quellen', { exact: true }).click();
  const upload = page.getByLabel('Lernreise-Sicherung einlesen');
  const before = await rawOf(page, second);
  await upload.setInputFiles({ name: 'erstes-thema.json', mimeType: 'application/json', buffer: Buffer.from(exportJourney(JSON.parse(oldRaw), first)) });
  await expect(page.getByRole('alert')).toContainText('nicht zu diesem Abschnitt');
  expect(await rawOf(page, second)).toBe(before);
  await upload.setInputFiles({ name: 'zweites-thema.json', mimeType: 'application/json', buffer: Buffer.from(exportJourney(initial, second)) });
  await expect(page.getByRole('heading', { name: 'Sicherung vor der Übernahme prüfen' })).toBeVisible();
  expect(await rawOf(page, second)).toBe(before);
  await clickSaved(page, second, 'Diesen Reisestand ersetzen');
  expect(JSON.parse(await rawOf(page, second)).index).toBe(0);
  expect(await rawOf(page, first)).toBe(oldRaw);
  await firstTab.close();
});

test('Entfernte Voraussetzung sperrt das zweite Thema ohne dessen Stand zu löschen', async ({ page, context }) => {
  await setup(page); await seed(page, first, passedState(first));
  await page.goto(route(second)); await clickSaved(page, second, 'Abschnitt beginnen');
  const secondRaw = await rawOf(page, second);
  const other = await context.newPage(); await setup(other);
  await seed(other, first, { ...createJourneyState(first), revision: 2 });
  await expect(page.getByRole('heading', { name: 'Zuerst die Grundlage abschließen' })).toBeVisible();
  expect(await rawOf(page, second)).toBe(secondRaw);
  await seed(other, first, passedState(first));
  await saved(page);
  expect(await rawOf(page, second)).toBe(secondRaw);
  await other.close();
});

test('Electron: beide Themen bleiben nach vollständigem Neustart getrennt erhalten', { tag: '@desktop' }, async ({}, info) => {
  test.skip(process.platform !== 'win32', 'Windows-Electron-Matrix'); test.setTimeout(90_000);
  const profile = info.outputPath('two-topic-profile');
  const launch = async () => {
    const env = { ...process.env, DATABASE_URL: '', AI_ENABLED: 'false', AZUBIPREP_AI_DIR: path.join(profile, 'local-ai'), AZUBIPREP_RAG_DIR: path.join(profile, 'local-rag') };
    delete env.ELECTRON_RUN_AS_NODE;
    const app = await _electron.launch({ executablePath: path.join(repo, 'desktop/node_modules/electron/dist/electron.exe'), args: [path.join(repo, 'desktop'), `--user-data-dir=${profile}`], env });
    const page = await app.firstWindow(); await page.waitForURL(/^http:\/\/127\.0\.0\.1:/);
    const origin = new URL(page.url()).origin;
    await unterdrueckeOnboardingPopups(page); await page.route('**/api/ai/**', handler => handler.abort());
    return { app, page, origin };
  };
  let one; let two;
  try {
    one = await launch();
    await one.page.evaluate(async state => window.azubiDesktop.journey.save({ raw: JSON.stringify(state), expectedRaw: null }), passedState(first));
    const firstRaw = await rawOf(one.page, first);
    await one.page.goto(`${one.origin}${route(second)}`);
    await clickSaved(one.page, second, 'Abschnitt beginnen'); await clickSaved(one.page, second, 'Gelesen – weiter');
    const secondRaw = await rawOf(one.page, second);
    await one.app.close(); one.app = null;
    two = await launch(); await two.page.goto(`${two.origin}${route(second)}`); await saved(two.page);
    await expect(two.page.getByRole('heading', { name: second.blocks[1].title, exact: true })).toBeVisible();
    expect(await rawOf(two.page, first)).toBe(firstRaw);
    expect(await rawOf(two.page, second)).toBe(secondRaw);
    await clickSaved(two.page, second, 'Gelesen – weiter');
    expect(await rawOf(two.page, first)).toBe(firstRaw);
  } finally { await two?.app?.close(); await one?.app?.close(); }
});
