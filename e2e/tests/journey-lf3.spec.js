import { test, expect, _electron } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { loadJourney } from '../../backend/src/journey.js';
import { readCsvFile } from '../../backend/src/csv.js';
import { journeyStorageKey, createJourneyState, reduceJourney, exportJourney } from '../../frontend/src/store/journeyStore.js';
import { NETWORK_TOPIC } from '../../frontend/src/utils/journeyNetwork.js';
import { WORKPLACE_TOPIC } from '../../frontend/src/utils/journeyWorkplace.js';
import { unterdrueckeOnboardingPopups } from './helpers.js';

test.use({ serviceWorkers: 'block' });
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const service = loadJourney(path.join(repo, 'content'));
const allTopics = service.getSummary().readyTopics.filter(item => ['LF1', 'WISO', 'PM', 'LF2', 'LF3'].includes(item.fieldId)).map(item => service.getTopic(item.id));
const lf1 = allTopics.filter(item => item.fieldId !== 'LF3');
const topics = allTopics.filter(item => item.fieldId === 'LF3');
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
  } else if (topic.id === NETWORK_TOPIC && item.practice) {
    for (let i = 0; i < 3; i++) {
      act({ type: 'network-action', action: { type: 'test' } });
      for (const [field, value] of Object.entries({ linked: true, ip: '192.0.2.25', prefix: '24', gateway: '192.0.2.1', dns: '192.0.2.53', diagnosis: ['link', 'address', 'dns'][i] })) act({ type: 'network-action', action: { type: 'configure', field, value } });
      act({ type: 'network-action', action: { type: 'test' } }); act({ type: 'network-action', action: { type: 'finish' } });
    }
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
async function fillNetwork(page, topic, label, value) {
  const before = JSON.parse(await rawOf(page, topic)).revision;
  await page.getByRole('textbox', { name: label, exact: true }).fill(value);
  await expect.poll(async () => JSON.parse(await rawOf(page, topic)).revision).toBeGreaterThan(before); await saved(page);
}
async function completeNetwork(page, topic) {
  for (let i = 0; i < 3; i++) {
    await clickSaved(page, topic, 'Ausgangsprobe abrufen');
    await configure(page, topic, 'Ursache des Ausgangsfehlers', ['link', 'address', 'dns'][i]);
    if (i === 0) await configure(page, topic, 'Verbindung', 'true');
    if (i === 1) await fillNetwork(page, topic, 'IPv4-Adresse', '192.0.2.25');
    if (i === 2) await fillNetwork(page, topic, 'DNS-Server', '192.0.2.53');
    await clickSaved(page, topic, 'Erneut prüfen');
    await expect(page.getByRole('status', { name: 'Ergebnis der Netzwerkprobe' })).toContainText('Die Verbindung funktioniert im Modell.');
    await clickSaved(page, topic, i < 2 ? 'Fall abschließen – weiter' : 'Labor abschließen');
  }
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
      if (item.practice) { await expect(page.getByRole('region', { name: 'Praktisches Netzwerklabor' })).toBeVisible(); await completeNetwork(page, topic); }
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
    await expect(page.getByText(`LF3: ${index + 1} von 6 Themen bestanden.`, { exact: false })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'LF3 in der Lernreise abgeschlossen', exact: true })).toHaveCount(index === 5 ? 1 : 0);
  });
}

test('Netzwerklabor: Befunde unterscheiden, Alternativen, Sicherung und mobile Bedienung', async ({ page }, info) => {
  test.setTimeout(60_000);
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
  await expect(page.getByRole('textbox', { name: 'IPv4-Adresse', exact: true })).toBeDisabled();
  await clickSaved(page, topic, 'Ausgangsprobe abrufen');
  const result = page.getByRole('status', { name: 'Ergebnis der Netzwerkprobe', exact: true });
  await expect(result).toContainText('Kein Verbindungssignal');
  await configure(page, topic, 'Ursache des Ausgangsfehlers', 'dns');
  await configure(page, topic, 'Verbindung', 'true');
  await clickSaved(page, topic, 'Erneut prüfen');
  await expect(result).toContainText('Die Verbindung funktioniert');
  await expect(page.getByRole('button', { name: 'Fall abschließen – weiter' })).toBeDisabled();
  await configure(page, topic, 'Ursache des Ausgangsfehlers', 'link');
  await expect(result).toHaveCount(0);
  await clickSaved(page, topic, 'Erneut prüfen'); await clickSaved(page, topic, 'Fall abschließen – weiter');
  await clickSaved(page, topic, 'Ausgangsprobe abrufen');
  await expect(result).toContainText('IP-Konfiguration: Fehler');
  await configure(page, topic, 'Ursache des Ausgangsfehlers', 'address');
  await fillNetwork(page, topic, 'IPv4-Adresse', '192.0.2.25');
  await configure(page, topic, 'Netzpräfix', '25');
  await clickSaved(page, topic, 'Erneut prüfen'); await expect(result).toContainText('IP-Konfiguration: Fehler');
  await configure(page, topic, 'Netzpräfix', '24');
  await clickSaved(page, topic, 'Erneut prüfen'); await expect(result).toContainText('Die Verbindung funktioniert');
  const backup = exportJourney(JSON.parse(await rawOf(page, topic)), topic);
  await fillNetwork(page, topic, 'IPv4-Adresse', '192.0.2.10');
  await clickSaved(page, topic, 'Erneut prüfen'); await expect(result).toContainText('IP-Konfiguration: Fehler');
  await page.getByText('Nachlesen, Sicherung und Quellen', { exact: true }).click();
  await page.getByLabel('Lernreise-Sicherung einlesen').setInputFiles({ name: 'lf3-labor.json', mimeType: 'application/json', buffer: Buffer.from(backup) });
  await expect(page.getByRole('heading', { name: 'Sicherung vor der Übernahme prüfen' })).toBeVisible();
  await clickSaved(page, topic, 'Diesen Reisestand ersetzen');
  await page.reload(); await saved(page);
  await expect(page.getByRole('textbox', { name: 'IPv4-Adresse', exact: true })).toHaveValue('192.0.2.25');
  await expect(result).toContainText('Die Verbindung funktioniert');
  await expect(next).toBeDisabled();
  await clickSaved(page, topic, 'Fall abschließen – weiter');
  await clickSaved(page, topic, 'Ausgangsprobe abrufen');
  await expect(result).toContainText('Probe zur Server-IP 198.51.100.20: im Modell erfolgreich');
  await expect(result).toContainText('Namensauflösung: Fehler');
  await page.setViewportSize({ width: 390, height: 844 });
  const dns = page.getByRole('textbox', { name: 'DNS-Server', exact: true }); await dns.focus(); await expect(dns).toBeFocused();
  await configure(page, topic, 'Ursache des Ausgangsfehlers', 'dns');
  await fillNetwork(page, topic, 'DNS-Server', '192.0.2.53');
  await dns.focus(); await page.keyboard.press('Tab');
  await expect(page.getByRole('combobox', { name: 'Netzpräfix', exact: true })).toBeFocused();
  await page.keyboard.press('Tab'); await expect(page.getByRole('combobox', { name: 'Ursache des Ausgangsfehlers', exact: true })).toBeFocused();
  await page.keyboard.press('Tab'); await expect(page.getByRole('button', { name: 'Erneut prüfen', exact: true })).toBeFocused();
  const beforeKeyboard = JSON.parse(await rawOf(page, topic)).revision;
  await page.keyboard.press('Enter');
  await expect.poll(async () => JSON.parse(await rawOf(page, topic)).revision).toBeGreaterThan(beforeKeyboard); await saved(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.getByRole('region', { name: 'Netzwerklabor', exact: true }).screenshot({ path: info.outputPath('lf3-netzwerklabor-mobil.png') });
  await clickSaved(page, topic, 'Labor abschließen');
  await expect(page.getByText('Alle drei Fälle sind geprüft und abgeschlossen.', { exact: false })).toBeVisible();
  await page.getByLabel(topic.interview[1].practice.confirmation, { exact: true }).check();
  await clickSaved(page, topic, 'Verglichen – weiter');
  await page.getByText('Netzwerklabor nachlesen', { exact: true }).click();
  await page.getByText('Fall 2: IP-Konfiguration – behoben', { exact: true }).click();
  await expect(page.getByRole('region', { name: 'Netzwerkprotokoll', exact: true })).toContainText('192.0.2.25/24');
  await expect(page.getByRole('button', { name: 'Erneut prüfen', exact: true })).toHaveCount(0);
  expect(await Promise.all(allTopics.slice(0, -1).map(item => rawOf(page, item)))).toEqual(originals);
});

test('LF3 verlangt alle bisherigen Etappen und führt nach sechs Themen zu LF4', async ({ page, context }) => {
  await setup(page); await seed(page, [stateAt(lf1.at(-1))]); await page.goto(route(topics[0]));
  await expect(page.getByRole('heading', { name: 'Zuerst die Grundlage abschließen' })).toBeVisible();
  expect(await rawOf(page, topics[0])).toBeNull();
  await page.goto('/lernreise?fr=FIAE');
  await page.evaluate(() => { for (const key of Object.keys(localStorage)) if (key.startsWith('azubiprep.journey.fiae')) localStorage.removeItem(key); });
  await seed(page, allTopics.map(item => stateAt(item))); await page.reload();
  const complete = page.getByRole('heading', { name: 'LF3 in der Lernreise abgeschlossen', exact: true });
  await expect(complete).toBeVisible(); await expect(page.getByText('LF3: 6 von 6 Themen bestanden.', { exact: false })).toBeVisible();
  await expect(page.getByText('Als Nächstes folgt LF4 mit', { exact: false })).toBeVisible();
  const other = await context.newPage(); await setup(other);
  await other.evaluate(key => localStorage.setItem(key, '{broken'), journeyStorageKey(topics[2].id));
  await expect(complete).toHaveCount(0); await expect(page.getByRole('link', { name: 'Gespeicherten Stand prüfen', exact: true })).toBeVisible(); await other.close();
});

test('Electron: 39 Themen und drei Netzwerkfälle überstehen vollständigen Neustart', { tag: '@desktop' }, async ({}, info) => {
  test.skip(process.platform !== 'win32', 'Windows-Electron-Matrix'); test.setTimeout(90_000);
  const profile = info.outputPath('lf3-complete-profile');
  const launch = async () => {
    const env = { ...process.env, DATABASE_URL: '', AI_ENABLED: 'false', AZUBIPREP_AI_DIR: path.join(profile, 'local-ai'), AZUBIPREP_RAG_DIR: path.join(profile, 'local-rag') }; delete env.ELECTRON_RUN_AS_NODE;
    const app = await _electron.launch({ executablePath: path.join(repo, 'desktop/node_modules/electron/dist/electron.exe'), args: [path.join(repo, 'desktop'), `--user-data-dir=${profile}`], env });
    const page = await app.firstWindow(); await page.waitForURL(/^http:\/\/127\.0\.0\.1:/); const origin = new URL(page.url()).origin;
    await unterdrueckeOnboardingPopups(page); await page.route('**/api/ai/**', handler => handler.abort()); return { app, page, origin };
  };
  let first; let second;
  try {
    first = await launch(); await seed(first.page, allTopics.map(item => stateAt(item))); const originals = await Promise.all(allTopics.map(item => rawOf(first.page, item)));
    await first.page.goto(`${first.origin}/lernreise?fr=FIAE`); await expect(first.page.getByRole('heading', { name: 'LF3 in der Lernreise abgeschlossen', exact: true })).toBeVisible();
    await first.app.close(); first.app = null;
    second = await launch(); await second.page.goto(`${second.origin}${route(last)}`); await saved(second.page);
    expect(await Promise.all(allTopics.map(item => rawOf(second.page, item)))).toEqual(originals);
    await second.page.getByText('Netzwerklabor nachlesen', { exact: true }).click();
    await expect(second.page.getByText('Alle drei Fälle sind geprüft und abgeschlossen.', { exact: false })).toBeVisible();
    await expect(second.page.getByRole('button', { name: 'Erneut prüfen', exact: true })).toHaveCount(0);
    await clickSaved(second.page, last, 'Mini-Test wiederholen');
    expect(JSON.parse(await rawOf(second.page, last)).network.cases.every(c => c.done)).toBe(true);
    expect(await Promise.all(allTopics.slice(0, -1).map(item => rawOf(second.page, item)))).toEqual(originals.slice(0, -1));
  } finally { await second?.app?.close(); await first?.app?.close(); }
});

