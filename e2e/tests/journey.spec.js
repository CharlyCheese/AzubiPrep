import { test, expect, _electron } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadJourney } from '../../backend/src/journey.js';
import { readCsvFile } from '../../backend/src/csv.js';
import { KEY, createJourneyState, reduceJourney, exportJourney } from '../../frontend/src/store/journeyStore.js';
import { unterdrueckeOnboardingPopups } from './helpers.js';

test.use({ serviceWorkers: 'block' });
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const service = loadJourney(path.join(repo, 'content'));
const topic = service.getTopic('common-lf1-role');
const route = '/lernreise/fiae/common-lf1-role';
const rows = readCsvFile(path.join(repo, 'content/learning-journey/questions/common-lf1-role.v1.csv')).records;
const answers = Object.fromEntries(rows.map(row => [row.id, row.antwort]));
const saved = page => expect(page.locator('.journey-status')).toHaveText('Gespeichert');
const stateOf = page => page.evaluate(key => JSON.parse(localStorage.getItem(key)), KEY);

async function clickSaved(page, name) {
  const revisionOf = () => page.evaluate(async key => {
    const raw = window.azubiDesktop?.journey ? await window.azubiDesktop.journey.load() : localStorage.getItem(key);
    try { return JSON.parse(raw)?.revision ?? 0; } catch { return 0; }
  }, KEY);
  const revision = await revisionOf();
  await page.getByRole('button', { name, exact: true }).click();
  await expect.poll(revisionOf).toBeGreaterThan(revision);
  await saved(page);
}
async function begin(page) {
  await unterdrueckeOnboardingPopups(page);
  await page.goto('/lernreise?fr=FIAE');
  await page.getByRole('link', { name: 'Lernreise beginnen', exact: true }).click();
  await clickSaved(page, 'Abschnitt beginnen');
}
async function choose(page, questionId, correct = true) {
  const answer = correct ? answers[questionId] : ['a', 'b', 'c', 'd'].find(value => value !== answers[questionId]);
  await page.locator(`input[name="${questionId}"][value="${answer}"]`).check();
  await saved(page);
}
function quizState() {
  let state = createJourneyState(topic);
  for (let i = 0; i < 4; i++) state = reduceJourney(state, { type: 'read-block' }, topic);
  return { ...state, revision: 1 };
}
function reflectionState() {
  let state = quizState();
  for (const questionId of topic.quiz.questionIds) {
    const answer = answers[questionId];
    state = reduceJourney(state, { type: 'select-answer', questionId, answer }, topic);
    state = reduceJourney(state, { type: 'quiz-feedback', feedback: service.check(topic.id, { version: topic.version, questionId, answer }) }, topic);
    state = reduceJourney(state, { type: 'next-quiz' }, topic);
  }
  return state;
}
function examState() {
  let state = reflectionState();
  for (let i = 0; i < 3; i++) {
    state = reduceJourney(state, { type: 'reflection-reveal' }, topic);
    state = reduceJourney(state, { type: 'reflection-done' }, topic);
  }
  for (let i = 0; i < 6; i++) {
    state = reduceJourney(state, { type: 'card-reveal' }, topic);
    state = reduceJourney(state, { type: 'card-rate', rating: 'known' }, topic);
  }
  return state;
}
async function simulateQuota(page) {
  await page.evaluate(key => {
    const originalSet = Storage.prototype.setItem;
    window.journeyQuota = true;
    Storage.prototype.setItem = function (name, value) {
      if (name === key && window.journeyQuota) throw new DOMException('Synthetic quota', 'QuotaExceededError');
      return originalSet.call(this, name, value);
    };
  }, KEY);
}
async function seed(page, state) {
  await unterdrueckeOnboardingPopups(page);
  await page.goto('/lernreise?fr=FIAE');
  await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), { key: KEY, value: state });
  await page.goto(route); await saved(page);
}
async function testRound(page, correctCount) {
  await clickSaved(page, 'Mini-Test beginnen');
  for (let i = 0; i < 8; i++) {
    await choose(page, topic.exam.questionIds[i], i < correctCount);
    if (i < 7) await clickSaved(page, 'Nächste Testfrage');
  }
  await clickSaved(page, 'Mini-Test abgeben');
  await expect(page.getByRole('heading', { name: 'Deine Auswertung' })).toBeVisible();
}

test('LF1 vollständig: Theorie, getrenntes Quiz, Reflexion, Karten, 6/8 und 7/8 mit Fortsetzung', async ({ page }) => {
  test.setTimeout(120_000);
  await begin(page);
  await clickSaved(page, 'Gelesen – weiter');
  await page.reload(); await saved(page);
  await expect(page.getByRole('heading', { name: '2. Vom Kundenwunsch zu einer prüfbaren Aufgabe' })).toBeFocused();
  await clickSaved(page, 'Gelesen – weiter'); await clickSaved(page, 'Gelesen – weiter'); await clickSaved(page, 'Gelesen – zum Quiz');
  for (let i = 0; i < 6; i++) {
    await choose(page, topic.quiz.questionIds[i], i > 0);
    await clickSaved(page, 'Antwort prüfen');
    if (i === 0) {
      await page.getByRole('button', { name: 'Theorie: 1. Was leistet das Unternehmen?' }).click();
      await expect(page.getByRole('region', { name: 'Theorie nachlesen' })).toBeVisible();
      await page.getByRole('button', { name: 'Zurück zum Lernschritt' }).click();
    }
    await clickSaved(page, i === 5 ? 'Weiter zur Selbstreflexion' : 'Nächste Frage');
  }
  await page.getByLabel('Deine Antwort (optional, nur lokal)').fill('Die Leistung ist die Statusseite. Der Nutzen ist weniger Suchaufwand.');
  await saved(page); await page.reload(); await saved(page);
  await expect(page.getByLabel('Deine Antwort (optional, nur lokal)')).toHaveValue(/weniger Suchaufwand/);
  for (let i = 0; i < 3; i++) {
    await clickSaved(page, 'Kernpunkte ansehen');
    await clickSaved(page, i === 2 ? 'Verglichen – zu den Karteikarten' : 'Verglichen – weiter');
  }
  for (let i = 0; i < 6; i++) {
    await clickSaved(page, 'Kartenantwort zeigen');
    await clickSaved(page, i === 0 ? 'Noch üben – weiter' : 'Gewusst – weiter');
  }
  await testRound(page, 6);
  await expect(page.getByText(/Noch nicht bestanden/)).toBeVisible();
  expect((await stateOf(page)).history).toHaveLength(1);
  await clickSaved(page, 'Mini-Test wiederholen');
  await expect(page.getByText(/Wiederholung mit denselben acht Aufgaben/)).toBeVisible();
  await testRound(page, 7);
  await expect(page.getByText('Erster Themenabschnitt bestanden.', { exact: false })).toBeVisible();
  await page.reload(); await saved(page);
  const state = await stateOf(page);
  expect(state.history).toHaveLength(2); expect(state.bestResult.correct).toBe(7);
  await page.getByRole('link', { name: 'Zur Lernreise', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Lernreise fortsetzen', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'FISI', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Lernreise fortsetzen', exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Module zum freien Lernen' })).toBeVisible();
});

test('Speicherfehler hält alten Stand und erlaubt Sichern und erneutes Speichern', async ({ page }) => {
  await begin(page);
  const original = await stateOf(page);
  await simulateQuota(page);
  await page.getByRole('button', { name: 'Gelesen – weiter', exact: true }).click();
  await expect(page.locator('.journey-status')).toContainText('Nicht gespeichert');
  expect(await stateOf(page)).toEqual(original);
  await expect(page.getByRole('heading', { name: topic.blocks[0].title })).toBeVisible();
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '0');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Aktuellen Stand sichern' }).click();
  expect((await download).suggestedFilename()).toBe('AzubiPrep-Lernreise-FIAE.json');
  await page.evaluate(() => { window.journeyQuota = false; });
  await clickSaved(page, 'Speichern erneut versuchen');
  expect((await stateOf(page)).index).toBe(1);
});

test('Zwei Tabs überschreiben sich nicht; Neuladen übernimmt bestätigten Stand', async ({ page, context }) => {
  await begin(page);
  const second = await context.newPage(); await unterdrueckeOnboardingPopups(second);
  await second.goto(route); await saved(second);
  await clickSaved(page, 'Gelesen – weiter');
  await expect(second.getByRole('alert')).toContainText('anderer Tab');
  await expect(second.getByRole('button', { name: 'Gelesen – weiter', exact: true })).toBeDisabled();
  await second.getByRole('button', { name: 'Gespeicherten Stand laden', exact: true }).click(); await saved(second);
  await expect(second.getByRole('heading', { name: '2. Vom Kundenwunsch zu einer prüfbaren Aufgabe' })).toBeVisible();
  await second.close();
});

test('Sicherung mit Vorschau, unbekannte Felder und neuere Altstände bleiben geschützt', async ({ page }) => {
  await begin(page); const initial = await stateOf(page);
  await clickSaved(page, 'Gelesen – weiter');
  await page.getByText('Nachlesen, Sicherung und Quellen', { exact: true }).click();
  const upload = page.getByLabel('Lernreise-Sicherung einlesen');
  await upload.setInputFiles({ name: 'sicherung.json', mimeType: 'application/json', buffer: Buffer.from(exportJourney(initial, topic)) });
  expect((await stateOf(page)).index).toBe(1);
  await expect(page.getByRole('heading', { name: 'Sicherung vor der Übernahme prüfen' })).toBeVisible();
  await clickSaved(page, 'Diesen Reisestand ersetzen');
  expect((await stateOf(page)).index).toBe(0);
  const valid = await stateOf(page);
  const invalid = JSON.parse(exportJourney(valid, topic)); invalid.state.privateContext = 'synthetic-only';
  await upload.setInputFiles({ name: 'ungueltig.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(invalid)) });
  await expect(page.getByRole('alert')).toBeVisible(); expect(await stateOf(page)).toEqual(valid);
  const newer = JSON.stringify({ ...valid, schemaVersion: 999 });
  await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), { key: KEY, raw: newer });
  await page.reload();
  await expect(page.getByRole('button', { name: 'Originalstand sichern' })).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), KEY)).toBe(newer);
  await expect(page.getByRole('button', { name: 'Abschnitt beginnen' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Neuen Stand vorbereiten' }).click();
  await expect(page.getByRole('heading', { name: 'Sicherung vor der Übernahme prüfen' })).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), KEY)).toBe(newer);
  await clickSaved(page, 'Diesen Reisestand ersetzen');
  expect((await stateOf(page)).schemaVersion).toBe(1);
  expect((await stateOf(page)).completedBlocks).toHaveLength(0);
  await page.evaluate(key => localStorage.setItem(key, ''), KEY); await page.reload();
  await expect(page.getByRole('button', { name: 'Originalstand sichern' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Neuen Stand vorbereiten' })).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), KEY)).toBe('');
});

test('Bestanden erscheint erst nach gespeicherter Auswertung; erneutes Speichern zählt denselben Versuch', async ({ page }) => {
  let state = reduceJourney(examState(), { type: 'start-exam', attemptId: 'bad54aa0-9011-4ab4-b622-e50c43ecfb9d' }, topic);
  for (let i = 0; i < 8; i++) {
    const questionId = topic.exam.questionIds[i];
    state = reduceJourney(state, { type: 'select-answer', questionId, answer: answers[questionId] }, topic);
    if (i < 7) state = reduceJourney(state, { type: 'next-exam' }, topic);
  }
  await seed(page, state); await simulateQuota(page);
  await page.getByRole('button', { name: 'Mini-Test abgeben', exact: true }).click();
  await expect(page.locator('.journey-status')).toContainText('Nicht gespeichert');
  await expect(page.getByRole('heading', { name: 'Deine Auswertung' })).toHaveCount(0);
  await expect(page.getByText('Erster Themenabschnitt bestanden.', { exact: false })).toHaveCount(0);
  expect((await stateOf(page)).history).toHaveLength(0);
  await page.evaluate(() => { window.journeyQuota = false; });
  await clickSaved(page, 'Speichern erneut versuchen');
  await expect(page.getByText('Erster Themenabschnitt bestanden.', { exact: false })).toBeVisible();
  expect((await stateOf(page)).history).toHaveLength(1);
});

test('Sicherungsübernahme sperrt Eingaben; danach bleibt neue Reflexion gespeichert', async ({ page }) => {
  await seed(page, reflectionState());
  const restored = { ...reflectionState(), reflection: { ...reflectionState().reflection, drafts: { [topic.interview[0].id]: 'Aus der Sicherung.' } } };
  await page.getByText('Nachlesen, Sicherung und Quellen', { exact: true }).click();
  await page.getByLabel('Lernreise-Sicherung einlesen').setInputFiles({ name: 'sicherung.json', mimeType: 'application/json', buffer: Buffer.from(exportJourney(restored, topic)) });
  await page.evaluate(() => {
    const originalRequest = navigator.locks.request.bind(navigator.locks);
    navigator.locks.request = (...args) => new Promise(resolve => { window.releaseJourneyWrite = resolve; }).then(() => originalRequest(...args));
  });
  await page.getByRole('button', { name: 'Diesen Reisestand ersetzen' }).click();
  await expect(page.getByLabel('Deine Antwort (optional, nur lokal)')).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Diesen Reisestand ersetzen' })).toBeDisabled();
  await page.evaluate(() => window.releaseJourneyWrite()); await saved(page);
  const input = page.getByLabel('Deine Antwort (optional, nur lokal)');
  await expect(input).toHaveValue('Aus der Sicherung.');
  await input.fill('Mein neuer Entwurf.');
  await expect(input).toBeEnabled();
  await input.fill('Mein vollständiger neuer Entwurf.');
  // Both queued writes can finish; the newest draft must survive the older confirmation.
  await page.evaluate(() => window.releaseJourneyWrite());
  await expect.poll(async () => (await stateOf(page)).reflection.drafts[topic.interview[0].id]).toBe('Mein neuer Entwurf.');
  await page.evaluate(() => window.releaseJourneyWrite()); await saved(page);
  await page.reload(); await saved(page);
  await expect(page.getByLabel('Deine Antwort (optional, nur lokal)')).toHaveValue('Mein vollständiger neuer Entwurf.');
});

test('Fehlende Verbindung verliert die Quizantwort nicht und erzeugt keinen Erfolg', async ({ page }) => {
  await seed(page, quizState());
  await choose(page, topic.quiz.questionIds[0]);
  await page.route('**/api/journey/fiae/topics/*/check', handler => handler.abort());
  await page.getByRole('button', { name: 'Antwort prüfen', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Auswahl bleibt erhalten');
  expect((await stateOf(page)).quiz.feedback).toEqual({});
  await page.unroute('**/api/journey/fiae/topics/*/check');
  await clickSaved(page, 'Antwort prüfen');
  expect((await stateOf(page)).quiz.feedback[topic.quiz.questionIds[0]].correct).toBe(true);
});

test('Testversuch und Optionenmischung bleiben nach Neuladen gleich; Doppelabgabe bleibt einmalig', async ({ page }) => {
  await seed(page, examState());
  await clickSaved(page, 'Mini-Test beginnen');
  await choose(page, topic.exam.questionIds[0]); await clickSaved(page, 'Nächste Testfrage');
  const before = await stateOf(page);
  await page.reload(); await saved(page);
  const after = await stateOf(page);
  expect(after.exam).toEqual(before.exam); expect(after.optionOrder).toEqual(before.optionOrder); expect(after.index).toBe(1);
  for (let i = 1; i < 8; i++) {
    await choose(page, topic.exam.questionIds[i]);
    if (i < 7) await clickSaved(page, 'Nächste Testfrage');
  }
  await page.getByRole('button', { name: 'Mini-Test abgeben', exact: true }).evaluate(button => { button.click(); button.click(); });
  await expect(page.getByRole('heading', { name: 'Deine Auswertung' })).toBeVisible(); await saved(page);
  expect((await stateOf(page)).history).toHaveLength(1);
});

test('Schmale Ansicht, Darstellungszoom und Tastatur behalten erreichbare Aktionen', async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 }); await begin(page);
  await page.getByRole('button', { name: 'Gelesen – weiter', exact: true }).focus(); await page.keyboard.press('Enter'); await saved(page);
  await expect(page.getByRole('heading', { name: '2. Vom Kundenwunsch zu einer prüfbaren Aufgabe' })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.screenshot({ path: info.outputPath('lf1-mobile.png'), fullPage: true });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.evaluate(() => { document.documentElement.style.zoom = '2'; });
  await page.getByRole('button', { name: 'Gelesen – weiter', exact: true }).scrollIntoViewIfNeeded();
  await expect(page.getByRole('button', { name: 'Gelesen – weiter', exact: true })).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.screenshot({ path: info.outputPath('lf1-display-zoom.png'), fullPage: true });
});

test('Electron: Lernabschnitt nach vollständigem Neustart im selben Profil fortsetzen', { tag: '@desktop' }, async ({}, info) => {
  test.skip(process.platform !== 'win32', 'Windows-Electron-Matrix'); test.setTimeout(90_000);
  const profile = info.outputPath('journey-profile');
  const launch = async () => {
    const env = { ...process.env, DATABASE_URL: '', AI_ENABLED: 'false', AZUBIPREP_AI_DIR: path.join(profile, 'local-ai'), AZUBIPREP_RAG_DIR: path.join(profile, 'local-rag') };
    delete env.ELECTRON_RUN_AS_NODE;
    const app = await _electron.launch({ executablePath: path.join(repo, 'desktop/node_modules/electron/dist/electron.exe'), args: [path.join(repo, 'desktop'), `--user-data-dir=${profile}`], env });
    const page = await app.firstWindow(); await page.waitForURL(/^http:\/\/127\.0\.0\.1:/);
    const origin = new URL(page.url()).origin;
    await unterdrueckeOnboardingPopups(page); await page.goto(`${origin}${route}`);
    return { app, page, origin };
  };
  let first; let second;
  try {
    first = await launch(); await clickSaved(first.page, 'Abschnitt beginnen'); await clickSaved(first.page, 'Gelesen – weiter');
    const original = await first.page.evaluate(() => window.azubiDesktop.journey.load());
    expect(JSON.parse(original).index).toBe(1);
    await first.app.close(); first.app = null;
    second = await launch(); await saved(second.page);
    await expect(second.page.getByRole('heading', { name: '2. Vom Kundenwunsch zu einer prüfbaren Aufgabe' })).toBeVisible();
    expect(await second.page.evaluate(() => window.azubiDesktop.journey.load())).toBe(original);
    await clickSaved(second.page, 'Gelesen – weiter');
    expect(JSON.parse(await second.page.evaluate(() => window.azubiDesktop.journey.load())).index).toBe(2);
  } finally { await second?.app?.close(); await first?.app?.close(); }
});
