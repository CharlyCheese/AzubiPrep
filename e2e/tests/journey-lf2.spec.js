import { test, expect, _electron } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { loadJourney } from '../../backend/src/journey.js';
import { readCsvFile } from '../../backend/src/csv.js';
import { journeyStorageKey, createJourneyState, reduceJourney, exportJourney } from '../../frontend/src/store/journeyStore.js';
import { WORKPLACE_TOPIC } from '../../frontend/src/utils/journeyWorkplace.js';
import { unterdrueckeOnboardingPopups } from './helpers.js';

test.use({ serviceWorkers: 'block' });
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const service = loadJourney(path.join(repo, 'content'));
const allTopics = service.getSummary().readyTopics.filter(item => ['LF1', 'WISO', 'PM', 'LF2'].includes(item.fieldId)).map(item => service.getTopic(item.id));
const lf1 = allTopics.filter(item => item.fieldId !== 'LF2');
const topics = allTopics.filter(item => item.fieldId === 'LF2');
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
  topic.interview.forEach(item => { if (topic.id === WORKPLACE_TOPIC && item.practice) {
    for (const [field, value] of Object.entries({ device: 'office', software: 'approved', account: 'standard', displays: '2', updated: true })) act({ type: 'workplace-action', action: { type: 'configure', field, value } });
    for (const type of ['create-folder', 'create-file', 'open-file', 'check']) act({ type: 'workplace-action', action: { type } });
  } act({ type: 'reflection-reveal' }); act({ type: 'reflection-done', ...(item.practice ? { practiceConfirmed: true } : {}) }); });
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

async function configure(page, topic, label, value) {
  const before = JSON.parse(await rawOf(page, topic)).revision;
  await page.getByRole('combobox', { name: label, exact: true }).selectOption(value);
  await expect.poll(async () => JSON.parse(await rawOf(page, topic)).revision).toBeGreaterThan(before); await saved(page);
}
async function completeWorkplace(page, topic, device = 'office') {
  for (const [label, value] of [['Gerätemodell', device], ['Browser', 'approved'], ['Benutzerkonto', 'standard'], ['Eingerichtete Bildschirme', '2']]) await configure(page, topic, label, value);
  const updates = page.getByRole('checkbox', { name: 'Freigegebene Systemupdates im Modell anwenden', exact: true });
  await expect(updates).not.toBeChecked(); await updates.click();
  await expect.poll(async () => JSON.parse(await rawOf(page, topic)).workplace.updated).toBe(true); await saved(page);
  await expect(updates).toBeChecked();
  for (const name of ['Arbeitsordner erstellen', 'Testdatei anlegen', 'Testdatei öffnen', 'Funktionen prüfen']) await clickSaved(page, topic, name);
  await expect(page.getByRole('status', { name: 'Ergebnis der Einrichtungsübung', exact: true })).toContainText('Die Modellprüfung ist bestanden.');
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
      if (item.practice) { await expect(page.getByRole('region', { name: 'Praktische Einrichtungsaufgabe' })).toBeVisible(); await completeWorkplace(page, topic); }
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
    await expect(page.getByText(`LF2: ${index + 1} von 7 Themen bestanden.`, { exact: false })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'LF2 in der Lernreise abgeschlossen', exact: true })).toHaveCount(index === 6 ? 1 : 0);
  });
}

test('Einrichtungsübung: Fehler beheben, alternative Ausstattung, Sicherung und schmale Ansicht', async ({ page }, info) => {
  const topic = last;
  await setup(page); await seed(page, allTopics.slice(0, -1).map(item => stateAt(item)));
  let initial = stateAt(topic, 'reflection');
  initial = reduceJourney(initial, { type: 'reflection-reveal' }, topic);
  initial = reduceJourney(initial, { type: 'reflection-done' }, topic);
  await seed(page, [initial]);
  const originals = await Promise.all(allTopics.slice(0, -1).map(item => rawOf(page, item)));
  await page.goto(route(topic)); await saved(page);
  await clickSaved(page, topic, 'Kernpunkte ansehen');
  const next = page.getByRole('button', { name: 'Verglichen – weiter', exact: true });
  await page.getByLabel(topic.interview[1].practice.confirmation, { exact: true }).check();
  await expect(next).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Testdatei anlegen', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Testdatei öffnen', exact: true })).toBeDisabled();
  await configure(page, topic, 'Gerätemodell', 'compact');
  await clickSaved(page, topic, 'Funktionen prüfen');
  const result = page.getByRole('status', { name: 'Ergebnis der Einrichtungsübung', exact: true });
  await expect(result).toContainText('Hardwarebedarf: noch offen');
  await expect(result).toContainText('Dateiablage: noch offen');
  await completeWorkplace(page, topic, 'power');
  await expect(page.getByRole('region', { name: 'Übergabeprotokoll der Modellübung', exact: true })).toContainText('Leistung');
  await expect(page.getByText('Test des Büroarbeitsplatzes: Ticketportal und Wissenssuche. Umlaute: ä ö ü ß.', { exact: true })).toBeVisible();
  const backup = exportJourney(JSON.parse(await rawOf(page, topic)), topic);
  await page.reload(); await saved(page);
  await expect(page.getByRole('combobox', { name: 'Gerätemodell', exact: true })).toHaveValue('power');
  await expect(result).toContainText('Die Modellprüfung ist bestanden.');
  await expect(next).toBeDisabled();
  await configure(page, topic, 'Benutzerkonto', 'admin');
  await expect(result).toHaveCount(0);
  await clickSaved(page, topic, 'Funktionen prüfen');
  await expect(result).toContainText('Benutzerrechte: noch offen');
  await page.getByText('Nachlesen, Sicherung und Quellen', { exact: true }).click();
  await page.getByLabel('Lernreise-Sicherung einlesen').setInputFiles({ name: 'lf2-einrichtung.json', mimeType: 'application/json', buffer: Buffer.from(backup) });
  await expect(page.getByRole('heading', { name: 'Sicherung vor der Übernahme prüfen' })).toBeVisible();
  await clickSaved(page, topic, 'Diesen Reisestand ersetzen');
  await expect(page.getByRole('combobox', { name: 'Benutzerkonto', exact: true })).toHaveValue('standard');
  await expect(result).toContainText('Die Modellprüfung ist bestanden.');
  expect(await Promise.all(allTopics.slice(0, -1).map(item => rawOf(page, item)))).toEqual(originals);
  await page.setViewportSize({ width: 390, height: 844 });
  const device = page.getByRole('combobox', { name: 'Gerätemodell', exact: true }); await device.focus(); await expect(device).toBeFocused();
  await expect(device).toHaveAccessibleDescription('Leistung: 32 GB Arbeitsspeicher, 1024 GB SSD und 2 digitale Bildschirmausgänge.');
  await expect(page.getByText('Leistung: 32 GB Arbeitsspeicher, 1024 GB SSD und 2 digitale Bildschirmausgänge.', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.getByRole('region', { name: 'Einrichtungsübung', exact: true }).screenshot({ path: info.outputPath('lf2-einrichtung-mobil.png') });
  await page.getByLabel(topic.interview[1].practice.confirmation, { exact: true }).check();
  await clickSaved(page, topic, 'Verglichen – weiter');
  await page.getByText('Einrichtungsübung nachlesen', { exact: true }).click();
  await expect(device).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Funktionen prüfen', exact: true })).toBeDisabled();
});

test('LF2 verlangt alle bisherigen Etappen; vollständiger Rückblick führt zum verfügbaren LF3', async ({ page, context }) => {
  await setup(page); await seed(page, [stateAt(lf1.at(-1))]);
  await page.goto(route(topics[0]));
  await expect(page.getByRole('heading', { name: 'Zuerst die Grundlage abschließen' })).toBeVisible();
  expect(await rawOf(page, topics[0])).toBeNull();
  await page.goto('/lernreise?fr=FIAE');
  await page.evaluate(() => { for (const key of Object.keys(localStorage)) if (key.startsWith('azubiprep.journey.fiae')) localStorage.removeItem(key); });
  await seed(page, allTopics.map(item => stateAt(item))); await page.reload();
  const completed = page.getByRole('heading', { name: 'LF2 in der Lernreise abgeschlossen', exact: true });
  await expect(completed).toBeVisible();
  await expect(page.getByText('LF2: 7 von 7 Themen bestanden.', { exact: false })).toBeVisible();
  await expect(page.getByText('Als Nächstes folgt LF3 mit Netzwerkwegen', { exact: false })).toBeVisible();
  const other = await context.newPage(); await setup(other);
  await other.evaluate(key => localStorage.setItem(key, '{broken'), journeyStorageKey(topics[3].id));
  await expect(completed).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Gespeicherten Stand prüfen', exact: true })).toBeVisible();
  await other.close();
});

test('Electron: 33 Themen und bestätigte LF2-Modellübung überstehen vollständigen Neustart', { tag: '@desktop' }, async ({}, info) => {
  test.skip(process.platform !== 'win32', 'Windows-Electron-Matrix'); test.setTimeout(90_000);
  const profile = info.outputPath('lf2-complete-profile');
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
    await expect(first.page.getByRole('heading', { name: 'LF2 in der Lernreise abgeschlossen', exact: true })).toBeVisible();
    await first.app.close(); first.app = null;
    second = await launch(); await second.page.goto(`${second.origin}/lernreise?fr=FIAE`);
    await expect(second.page.getByRole('heading', { name: 'LF2 in der Lernreise abgeschlossen', exact: true })).toBeVisible();
    expect(await Promise.all(allTopics.map(item => rawOf(second.page, item)))).toEqual(originals);
    await second.page.goto(`${second.origin}${route(last)}`); await saved(second.page);
    await second.page.getByText('Einrichtungsübung nachlesen', { exact: true }).click();
    await expect(second.page.getByRole('combobox', { name: 'Gerätemodell', exact: true })).toHaveValue('office');
    await expect(second.page.getByRole('status', { name: 'Ergebnis der Einrichtungsübung', exact: true })).toContainText('Die Modellprüfung ist bestanden.');
    await expect(second.page.getByRole('button', { name: 'Funktionen prüfen', exact: true })).toBeDisabled();
    await clickSaved(second.page, last, 'Mini-Test wiederholen');
    expect(JSON.parse(await rawOf(second.page, last)).workplace.checked).toBe(true);
    expect(await Promise.all(allTopics.slice(0, -1).map(item => rawOf(second.page, item)))).toEqual(originals.slice(0, -1));
  } finally { await second?.app?.close(); await first?.app?.close(); }
});

