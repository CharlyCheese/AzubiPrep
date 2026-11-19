import { PRACTICE_TOPICS, practiceSteps } from '../../frontend/src/utils/journeyPractices.js';
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
const allTopics = service.getSummary().readyTopics.filter(item => ['LF1','WISO','PM','LF2','LF3','LF4','LF5','LF6'].includes(item.fieldId)).map(item => service.getTopic(item.id));
const lf1 = allTopics.filter(item => !['LF4', 'LF5', 'LF6'].includes(item.fieldId));
const topics = allTopics.filter(item => ['LF4', 'LF5', 'LF6'].includes(item.fieldId));
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
  } else if (PRACTICE_TOPICS.includes(topic.id) && item.practice) {
    for (const [i, step] of practiceSteps(topic.id).entries()) {
      for (const field of step.fields) act({ type: 'practice-action', action: { type: 'answer', field: field.key, value: field.expected } });
      if (topic.fieldId === 'LF5' && i < 4) act({ type: 'practice-action', action: { type: 'preview' } });
      if (topic.fieldId === 'LF5' && i === 4) {
        act({ type: 'practice-action', action: { type: 'code', value: SOLUTION } });
        act({ type: 'practice-action', action: { type: 'code-result', source: SOLUTION, passed: true } });
      } else act({ type: 'practice-action', action: { type: 'check' } });
      act({ type: 'practice-action', action: { type: 'next' } });
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

const SOLUTION = 'function available(quantity, requested) { if (!Number.isInteger(quantity) || !Number.isInteger(requested) || quantity < 0 || requested < 0 || quantity > 1000 || requested > 1000) return null; return requested <= quantity; }';

test('LF5: SQL-Auswahl, falscher Code, Zeitgrenze, Sicherung und mobile Tastaturbedienung', async ({ page }, info) => {
  test.setTimeout(120_000);
  const topic = topics.find(t => t.id === 'common-lf5-testing');
  await setup(page); await seed(page, allTopics.slice(0, allTopics.indexOf(topic)).map(t => stateAt(t)));
  await seed(page, [stateAt(topic, 'reflection')]); await page.goto(route(topic)); await saved(page);
  await clickSaved(page, topic, 'Kernpunkte ansehen'); await clickSaved(page, topic, 'Verglichen – weiter');
  const next = page.getByRole('button', { name: 'Geprüften Schritt übernehmen', exact: true });
  for (const [i, step] of practiceSteps(topic.id).slice(0, 4).entries()) {
    for (const field of step.fields) await configure(page, topic, field.label, field.expected);
    if (i === 2) {
      await configure(page, topic, 'Auswahlbedingung', 'all');
      await clickSaved(page, topic, 'Auswahl ansehen'); await clickSaved(page, topic, 'Ausführen und prüfen');
      await expect(next).toBeDisabled();
      await configure(page, topic, 'Auswahlbedingung', 'id2');
      await expect(page.getByRole('button', { name: 'Ausführen und prüfen', exact: true })).toBeDisabled();
    }
    await clickSaved(page, topic, 'Auswahl ansehen'); await clickSaved(page, topic, 'Ausführen und prüfen');
    if (i === 0) {
      const result = page.getByRole('table', { name: 'Abfrageergebnis', exact: true });
      await expect(result).toContainText('Adapter'); await expect(result).toContainText('Maus'); await expect(result).not.toContainText('Kabel');
      await expect(result.locator('tbody tr').first()).toContainText('Adapter');
    }
    await clickSaved(page, topic, 'Geprüften Schritt übernehmen');
  }
  const editor = page.getByRole('textbox', { name: 'Deine Bestandsfunktion', exact: true });
  await clickSaved(page, topic, 'Funktion prüfen');
  await expect(page.getByText('Die Funktion braucht noch eine Korrektur.', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Praxis abschließen', exact: true })).toBeDisabled();
  await editor.fill('function available() { while (true) {} }'); await saved(page);
  await clickSaved(page, topic, 'Funktion prüfen');
  await page.getByText('Erwartungen und Prüfergebnisse', { exact: true }).click();
  await expect(page.getByText('Zeitgrenze erreicht.', { exact: false })).toBeVisible();
  await editor.fill(SOLUTION); await saved(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await editor.focus(); await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Funktion prüfen', exact: true })).toBeFocused();
  const before = JSON.parse(await rawOf(page, topic)).revision;
  await page.keyboard.press('Enter');
  await expect.poll(async () => JSON.parse(await rawOf(page, topic)).revision, { timeout: 30000 }).toBeGreaterThan(before); await saved(page);
  await expect(page.getByText('Alle Funktionsfälle bestanden.', { exact: true })).toBeVisible();
  const backup = exportJourney(JSON.parse(await rawOf(page, topic)), topic);
  await editor.fill('function available() { return true; }'); await saved(page);
  await expect(page.getByRole('button', { name: 'Praxis abschließen', exact: true })).toBeDisabled();
  await page.getByText('Nachlesen, Sicherung und Quellen', { exact: true }).click();
  await page.getByLabel('Lernreise-Sicherung einlesen').setInputFiles({ name: 'lf5-uebung.json', mimeType: 'application/json', buffer: Buffer.from(backup) });
  await clickSaved(page, topic, 'Diesen Reisestand ersetzen'); await page.reload(); await saved(page);
  await expect(editor).toHaveValue(SOLUTION);
  await expect(page.getByText('Alle Funktionsfälle bestanden.', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.getByRole('region', { name: 'Praktische Übung: Datenanwendung', exact: true }).screenshot({ path: info.outputPath('lf5-praxis-mobil.png') });
  await clickSaved(page, topic, 'Praxis abschließen');
  await expect(editor).toHaveCount(0);
});

for (const field of ['LF4', 'LF5', 'LF6']) test(`${field}: frühere Etappe bleibt Voraussetzung`, async ({ page }) => {
  await setup(page); const topic = topics.find(t => t.fieldId === field);
  const previous = allTopics[allTopics.indexOf(topic) - 1];
  await seed(page, [stateAt(previous)]); await page.goto(route(topic));
  await expect(page.getByRole('heading', { name: 'Zuerst die Grundlage abschließen' })).toBeVisible();
  expect(await rawOf(page, topic)).toBeNull();
});
async function completePractice(page, topic) {
  for (const [i, step] of practiceSteps(topic.id).entries()) {
    for (const field of step.fields) await configure(page, topic, field.label, field.expected);
    if (topic.fieldId === 'LF5' && i < 4) await clickSaved(page, topic, 'Auswahl ansehen');
    if (topic.fieldId === 'LF5' && i === 4) {
      await page.getByRole('textbox', { name: 'Deine Bestandsfunktion', exact: true }).fill(SOLUTION); await saved(page);
      await clickSaved(page, topic, 'Funktion prüfen');
      await expect(page.getByText('Alle Funktionsfälle bestanden.', { exact: true })).toBeVisible();
    } else await clickSaved(page, topic, topic.fieldId === 'LF5' ? 'Ausführen und prüfen' : 'Schritt prüfen');
    await clickSaved(page, topic, i === practiceSteps(topic.id).length - 1 ? 'Praxis abschließen' : 'Geprüften Schritt übernehmen');
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
      if (item.practice) { await expect(page.getByRole('region', { name: 'Praktischer Arbeitsauftrag' })).toBeVisible(); await completePractice(page, topic); }
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
    await expect(page.getByText(`${topic.fieldId}: ${topics.slice(0, index + 1).filter(t => t.fieldId === topic.fieldId).length} von ${topics.filter(t => t.fieldId === topic.fieldId).length} Themen bestanden.`, { exact: false })).toBeVisible();
    await expect(page.getByRole('heading', { name: `${topic.fieldId} in der Lernreise abgeschlossen`, exact: true })).toHaveCount(PRACTICE_TOPICS.includes(topic.id) ? 1 : 0);
  });
}

test('Electron: 57 Themen und drei neue Praxisprotokolle überstehen vollständigen Neustart', { tag: '@desktop' }, async ({}, info) => {
  test.skip(process.platform !== 'win32', 'Windows-Electron-Matrix'); test.setTimeout(90_000);
  const profile = info.outputPath('lf456-complete-profile');
  const launch = async () => {
    const env = { ...process.env, DATABASE_URL: '', AI_ENABLED: 'false', AZUBIPREP_AI_DIR: path.join(profile, 'local-ai'), AZUBIPREP_RAG_DIR: path.join(profile, 'local-rag') }; delete env.ELECTRON_RUN_AS_NODE;
    const app = await _electron.launch({ executablePath: path.join(repo, 'desktop/node_modules/electron/dist/electron.exe'), args: [path.join(repo, 'desktop'), `--user-data-dir=${profile}`], env });
    const page = await app.firstWindow(); await page.waitForURL(/^http:\/\/127\.0\.0\.1:/); const origin = new URL(page.url()).origin;
    await unterdrueckeOnboardingPopups(page); await page.route('**/api/ai/**', handler => handler.abort()); return { app, page, origin };
  };
  let first; let second;
  try {
    first = await launch(); await seed(first.page, allTopics.map(item => stateAt(item))); const originals = await Promise.all(allTopics.map(item => rawOf(first.page, item)));
    await first.page.goto(`${first.origin}/lernreise?fr=FIAE`); await expect(first.page.getByRole('heading', { name: 'LF6 in der Lernreise abgeschlossen', exact: true })).toBeVisible();
    await first.app.close(); first.app = null;
    second = await launch(); await second.page.goto(`${second.origin}${route(last)}`); await saved(second.page);
    expect(await Promise.all(allTopics.map(item => rawOf(second.page, item)))).toEqual(originals);
    await second.page.getByText('Praxisprotokoll nachlesen', { exact: true }).click();
    await expect(second.page.getByText('Alle Schritte erfolgreich geprüft.', { exact: false })).toBeVisible();
    await expect(second.page.getByRole('button', { name: 'Schritt prüfen', exact: true })).toHaveCount(0);
    await clickSaved(second.page, last, 'Mini-Test wiederholen');
    expect(JSON.parse(await rawOf(second.page, last)).practice.done).toBe(true);
    expect(await Promise.all(allTopics.slice(0, -1).map(item => rawOf(second.page, item)))).toEqual(originals.slice(0, -1));
  } finally { await second?.app?.close(); await first?.app?.close(); }
});

