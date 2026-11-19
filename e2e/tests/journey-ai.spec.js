import { test, expect, _electron } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadJourney } from '../../backend/src/journey.js';
import { readCsvFile } from '../../backend/src/csv.js';
import { KEY, createJourneyState, reduceJourney } from '../../frontend/src/store/journeyStore.js';
import { unterdrueckeOnboardingPopups } from './helpers.js';

test.use({ serviceWorkers: 'block' });
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const service = loadJourney(path.join(repo, 'content'));
const topic = service.getTopic('common-lf1-role');
const journeyPath = '/lernreise/fiae/common-lf1-role';
const preferenceKey = 'azubiprep.ai.settings.v1';
const cloudConsent = 'Öffentlichen Lernkontext und meine Eingaben an ChatGPT senden';
const preference = provider => ({ version: 2, provider, qwenModel: 'qwen3:4b', chatgptModel: 'synthetic-model' });
const answers = Object.fromEntries(readCsvFile(path.join(repo, 'content/learning-journey/questions/common-lf1-role.v1.csv')).records.map(row => [row.id, row.antwort]));
const tutor = page => page.getByRole('region', { name: 'KI-Lernbegleitung im Abschnitt', exact: true });
const stateOf = page => page.evaluate(key => JSON.parse(localStorage.getItem(key)), KEY);

function reflectionState() {
  let state = createJourneyState(topic);
  for (const block of topic.blocks) state = reduceJourney(state, { type: 'read-block' }, topic);
  for (const questionId of topic.quiz.questionIds) {
    const answer = answers[questionId];
    state = reduceJourney(state, { type: 'select-answer', questionId, answer }, topic);
    state = reduceJourney(state, { type: 'quiz-feedback', feedback: service.check(topic.id, { version: topic.version, questionId, answer }) }, topic);
    state = reduceJourney(state, { type: 'next-quiz' }, topic);
  }
  return { ...state, revision: 1 };
}

// Every AI endpoint is intercepted: even an unexpected call cannot reach a real
// account, model or local material service. All markers and answers are synthetic.
async function mockAi(page, options = {}) {
  const calls = { starts: [], turns: [], ends: [], unexpected: [] };
  const sessions = new Map();
  await page.route('**/api/ai/**', async route => {
    const request = route.request();
    const endpoint = new URL(request.url()).pathname.replace('/api/ai/', '');
    const body = request.method() === 'POST' ? request.postDataJSON() : null;
    if (endpoint === 'status') return route.fulfill({ json: { state: 'ready', models: [{ name: 'synthetic-model', label: 'Synthetisches Modell' }, { name: 'qwen3:4b' }], defaultModel: body?.provider === 'qwen' ? 'qwen3:4b' : 'synthetic-model' } });
    if (endpoint === 'chatgpt/status') return route.fulfill({ json: { connected: true, planEnabled: true, activeId: 'synthetic-account', accounts: [{ id: 'synthetic-account', label: 'Synthetisches Konto', connected: true }], loginState: 'idle', revision: 'synthetic' } });
    if (endpoint === 'chatgpt/cancel') return route.fulfill({ json: { cancelled: true } });
    if (endpoint === 'material/status') return route.fulfill({ json: options.material ? options.material() : { state: 'ready', revision: 'synthetic-material', documents: [] } });
    if (endpoint === 'journey/start') {
      calls.starts.push(body);
      const sessionId = `synthetic-session-${calls.starts.length}`;
      const target = body.kind === 'theory' ? topic.blocks.find(block => block.id === body.targetId) : topic.interview.find(item => item.id === body.targetId);
      const session = { sessionId, privacy: body.useMaterial ? 'local-private' : 'public', opening: 'Synthetischer Gesprächsstart: Erkläre Leistung und Nutzen.', maxTurns: 4, objectiveIds: target.objectiveIds };
      const reply = async () => {
        sessions.set(sessionId, { ...session, turn: 0 });
        await route.fulfill({ json: session });
      };
      if (options.start) return options.start({ route, body, calls, reply });
      return reply();
    }
    if (endpoint === 'journey/turn') {
      calls.turns.push(body);
      const session = sessions.get(body.sessionId);
      const reply = async (overrides = {}) => {
        session.turn++;
        await route.fulfill({ json: { sessionId: body.sessionId, requestId: body.requestId, text: `SYNTHETIC-DIALOG-${session.turn}`, followUp: `Synthetische Rückfrage ${session.turn}: Woran erkennst du den Nutzen?`, objectiveIds: session.objectiveIds, turn: session.turn, remainingTurns: 4 - session.turn, privacy: session.privacy, ...overrides } });
      };
      if (options.turn) return options.turn({ route, body, calls, reply });
      return reply();
    }
    if (endpoint === 'journey/end') {
      calls.ends.push(body);
      return route.fulfill({ json: { ended: true } });
    }
    calls.unexpected.push(endpoint);
    return route.fulfill({ status: 503, json: { error: 'Synthetischer Test: Dieser Aufruf ist nicht freigegeben.' } });
  });
  return calls;
}

async function seed(page, provider = 'qwen', state = reflectionState()) {
  await unterdrueckeOnboardingPopups(page);
  await page.addInitScript(({ key, value, settingsKey, settings }) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(value));
    if (!localStorage.getItem(settingsKey)) localStorage.setItem(settingsKey, JSON.stringify(settings));
  }, { key: KEY, value: state, settingsKey: preferenceKey, settings: preference(provider) });
  await page.goto(journeyPath);
  await expect(page.locator('.journey-status')).toHaveText('Gespeichert');
}

async function openTutor(page, kind = 'reflection') {
  await page.getByText(kind === 'theory' ? 'Optional: Erklärung mit KI' : 'Optional: KI-Fachgespräch', { exact: true }).click();
  return tutor(page);
}

async function startTutor(page, provider = 'qwen') {
  const region = tutor(page);
  if (provider === 'chatgpt') await region.getByRole('checkbox', { name: cloudConsent, exact: true }).check();
  await region.getByRole('button', { name: 'KI-Gespräch beginnen', exact: true }).click();
  await expect(region).toContainText('Synthetischer Gesprächsstart: Erkläre Leistung und Nutzen.');
}

async function sendAnswer(page, answer, turn) {
  const region = tutor(page);
  await region.getByRole('textbox', { name: 'Deine Antwort oder Rückfrage', exact: true }).fill(answer);
  await region.getByRole('button', { name: 'Antwort senden', exact: true }).click();
  await expect(region.getByLabel('KI-Rückmeldung').filter({ hasText: `SYNTHETIC-DIALOG-${turn}` })).toBeVisible();
}

test('Ohne KI bleibt die feste Selbstreflexion ohne Modellaufruf nutzbar', async ({ page }) => {
  const calls = await mockAi(page);
  await seed(page, 'none');
  await page.getByLabel('Deine Antwort (optional, nur lokal)').fill('Eine gemeinsame Übersicht ist die Leistung.');
  await expect(page.locator('.journey-status')).toHaveText('Gespeichert');
  await page.getByRole('button', { name: 'Kernpunkte ansehen', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Vergleiche deine Erklärung' })).toBeVisible();
  await page.getByRole('button', { name: 'Verglichen – weiter', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Selbstreflexion 2 von 3', exact: true })).toBeVisible();
  expect(calls.starts).toEqual([]); expect(calls.turns).toEqual([]); expect(calls.unexpected).toEqual([]);
});

for (const provider of ['qwen', 'chatgpt']) {
  test(`${provider}: ausdrücklicher Start, Kontext und zwei Rückfragen ohne Reisestand- oder Sicherungsänderung`, async ({ page }) => {
    const calls = await mockAi(page);
    await seed(page, provider);
    const before = await stateOf(page);
    const region = await openTutor(page);
    expect(calls.starts).toEqual([]); expect(calls.turns).toEqual([]);
    await region.getByText('Gesendeten Lernkontext ansehen', { exact: true }).click();
    await expect(region).toContainText(topic.interview[0].prompt);
    await expect(region).toContainText(topic.interview[0].keyPoints[0]);
    await expect(region).toContainText(topic.interview[0].acceptableAlternatives[0]);
    await expect(region).not.toContainText(topic.interview[0].sampleAnswer);
    for (const question of topic.exam.questions) await expect(region).not.toContainText(question.frage);
    if (provider === 'chatgpt') await expect(region.getByRole('button', { name: 'KI-Gespräch beginnen', exact: true })).toBeDisabled();
    await startTutor(page, provider);
    expect(calls.starts).toEqual([{ topicId: topic.id, version: topic.version, kind: 'reflection', targetId: topic.interview[0].id, provider, model: provider === 'qwen' ? 'qwen3:4b' : 'synthetic-model', useMaterial: false }]);
    expect(calls.turns).toEqual([]);
    await sendAnswer(page, 'SYNTHETIC-ANSWER-1: Eine Übersicht ist die Leistung.', 1);
    await expect(region).toContainText('Synthetische Rückfrage 1');
    await sendAnswer(page, 'SYNTHETIC-ANSWER-2: Weniger Suchaufwand ist der erhoffte Nutzen.', 2);
    await expect(region).toContainText('Synthetische Rückfrage 2');
    expect(calls.turns).toHaveLength(2);
    for (const request of calls.turns) {
      expect(Object.keys(request).sort()).toEqual(['answer', 'requestId', 'sessionId']);
      expect(request.sessionId).toBe('synthetic-session-1');
    }
    expect(calls.turns[0].requestId).not.toBe(calls.turns[1].requestId);
    expect(await stateOf(page)).toEqual(before);
    await page.getByText('Nachlesen, Sicherung und Quellen', { exact: true }).click();
    const pendingDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Lernreise sichern', exact: true }).click();
    const download = await pendingDownload;
    const stream = await download.createReadStream();
    let backup = '';
    for await (const chunk of stream) backup += chunk.toString('utf8');
    expect(JSON.parse(backup).state).toEqual(before);
    expect(backup).not.toMatch(/SYNTHETIC-ANSWER|SYNTHETIC-DIALOG|synthetic-session/);
    await page.reload();
    await openTutor(page);
    await expect(tutor(page).getByLabel('KI-Rückmeldung')).toHaveCount(0);
    expect(await stateOf(page)).toEqual(before);
    expect(calls.unexpected).toEqual([]);
  });
}

test('Theoriehilfe bindet den aktuellen Block und bleibt von Lernfortschritt getrennt', async ({ page }) => {
  const calls = await mockAi(page);
  await seed(page, 'qwen', { ...createJourneyState(topic), revision: 1 });
  const before = await stateOf(page);
  await openTutor(page, 'theory'); await startTutor(page);
  expect(calls.starts[0]).toMatchObject({ kind: 'theory', targetId: topic.blocks[0].id, useMaterial: false });
  await sendAnswer(page, 'Erkläre die Unterscheidung an einer gemeinsamen Übersicht.', 1);
  expect(await stateOf(page)).toEqual(before);
  await page.getByRole('button', { name: 'Gelesen – weiter', exact: true }).click();
  await expect(page.getByRole('heading', { name: topic.blocks[1].title, exact: true })).toBeVisible();
  await expect.poll(() => calls.ends.length).toBe(1);
  await openTutor(page, 'theory'); await startTutor(page);
  expect(calls.starts[1]).toMatchObject({ targetId: topic.blocks[1].id });
});

test('Private lokale Sitzung wird bei Quellen- und Anbieterwechsel samt Entwurf verworfen', async ({ page }) => {
  const marker = 'SYNTHETIC-PRIVATE-DERIVED';
  const calls = await mockAi(page);
  await seed(page);
  const before = await stateOf(page);
  let region = await openTutor(page);
  await region.getByRole('combobox', { name: 'Lernquelle für die KI', exact: true }).selectOption('private');
  await startTutor(page);
  await sendAnswer(page, `${marker}: Die lokale Unterlage beschreibt eine Übersicht.`, 1);
  await region.getByRole('textbox', { name: 'Deine Antwort oder Rückfrage', exact: true }).fill(`${marker}-UNSENT`);
  await region.getByRole('combobox', { name: 'Lernquelle für die KI', exact: true }).selectOption('public');
  await expect.poll(() => calls.ends.length).toBe(1);
  await expect(region.getByLabel('KI-Rückmeldung')).toHaveCount(0);
  await startTutor(page);
  await expect(region.getByRole('textbox', { name: 'Deine Antwort oder Rückfrage', exact: true })).toHaveValue('');
  await page.goto('/einstellungen');
  await page.getByRole('combobox', { name: 'KI-Anbieter', exact: true }).selectOption('chatgpt');
  await page.goto(journeyPath);
  region = await openTutor(page);
  const source = region.getByRole('combobox', { name: 'Lernquelle für die KI', exact: true });
  await expect(source).toHaveValue('public');
  const privateOption = source.locator('option[value="private"]');
  if (await privateOption.count()) await expect(privateOption).toBeDisabled();
  await startTutor(page, 'chatgpt');
  await expect(region.getByRole('textbox', { name: 'Deine Antwort oder Rückfrage', exact: true })).toHaveValue('');
  await sendAnswer(page, 'Was ist der Unterschied zwischen Leistung und Nutzen?', 1);
  expect(calls.starts[0]).toMatchObject({ provider: 'qwen', useMaterial: true });
  const cloudStart = calls.starts.find(item => item.provider === 'chatgpt');
  expect(cloudStart).toMatchObject({ useMaterial: false });
  const cloudSession = `synthetic-session-${calls.starts.indexOf(cloudStart) + 1}`;
  expect(JSON.stringify(calls.turns.filter(item => item.sessionId === cloudSession))).not.toContain(marker);
  expect(await stateOf(page)).toEqual(before);
  expect(JSON.stringify(await stateOf(page))).not.toContain(marker);
  expect(calls.unexpected).toEqual([]);
});

test('Abbruch verwirft verspätete Antworten und Doppelklick sendet nur einmal', async ({ page }) => {
  let release;
  const held = new Promise(resolve => { release = resolve; });
  const calls = await mockAi(page, { turn: async ({ reply }) => { await held; await reply({ text: 'SYNTHETIC-LATE-REPLY' }).catch(() => {}); } });
  await seed(page); const before = await stateOf(page);
  const region = await openTutor(page); await startTutor(page);
  await region.getByRole('textbox', { name: 'Deine Antwort oder Rückfrage', exact: true }).fill('Synthetische wartende Antwort.');
  await region.getByRole('button', { name: 'Antwort senden', exact: true }).evaluate(button => { button.click(); button.click(); });
  await expect.poll(() => calls.turns.length).toBe(1);
  await region.getByRole('button', { name: 'Anfrage abbrechen', exact: true }).click();
  release();
  await expect.poll(() => calls.ends.length).toBe(1);
  await expect(region).not.toContainText('SYNTHETIC-LATE-REPLY');
  await expect(region.getByRole('button', { name: 'KI-Gespräch beginnen', exact: true })).toBeEnabled();
  expect(calls.turns).toHaveLength(1); expect(await stateOf(page)).toEqual(before);
  await page.getByRole('button', { name: 'Kernpunkte ansehen', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Vergleiche deine Erklärung' })).toBeVisible();
});

test('Nach vier Antworten endet die begrenzte Sitzung ohne Bewertung oder Fortschritt', async ({ page }) => {
  const calls = await mockAi(page);
  await seed(page); const before = await stateOf(page);
  const region = await openTutor(page); await startTutor(page);
  for (let turn = 1; turn <= 4; turn++) await sendAnswer(page, `Synthetische Erklärung ${turn}.`, turn);
  const send = region.getByRole('button', { name: 'Antwort senden', exact: true });
  if (await send.count()) await expect(send).toBeDisabled();
  expect(calls.turns).toHaveLength(4);
  expect(await stateOf(page)).toEqual(before);
  await region.getByRole('button', { name: 'Ohne KI weiter', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Kernpunkte ansehen', exact: true })).toBeVisible();
  expect((await stateOf(page)).reflection.done).toEqual([]);
});

test('Anbieterfehler lässt die Antwort und den Rückweg zur festen Selbstreflexion erreichbar', async ({ page }) => {
  const calls = await mockAi(page, { turn: ({ route }) => route.fulfill({ status: 503, json: { error: 'Synthetisch: Der gewählte Anbieter ist nicht erreichbar.' } }) });
  await seed(page); const before = await stateOf(page);
  const region = await openTutor(page); await startTutor(page);
  const answer = region.getByRole('textbox', { name: 'Deine Antwort oder Rückfrage', exact: true });
  await answer.fill('Synthetischer Entwurf bei Verbindungsfehler.');
  await region.getByRole('button', { name: 'Antwort senden', exact: true }).click();
  await expect(region.getByRole('alert')).toContainText('nicht erreichbar');
  await expect(answer).toHaveValue('Synthetischer Entwurf bei Verbindungsfehler.');
  expect(await stateOf(page)).toEqual(before);
  await region.getByRole('button', { name: 'Ohne KI weiter', exact: true }).click();
  await page.getByRole('button', { name: 'Kernpunkte ansehen', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Vergleiche deine Erklärung' })).toBeVisible();
  expect(calls.turns).toHaveLength(1);
});

test('Erneutes Senden nach Anbieterfehler verwendet dieselbe Anfrage und zählt nur eine Antwort', async ({ page }) => {
  const calls = await mockAi(page, { turn: ({ route, calls, reply }) => calls.turns.length === 1
    ? route.fulfill({ status: 503, json: { error: 'Synthetischer vorübergehender Anbieterfehler.' } })
    : reply() });
  await seed(page); const before = await stateOf(page);
  const region = await openTutor(page); await startTutor(page);
  const answer = region.getByRole('textbox', { name: 'Deine Antwort oder Rückfrage', exact: true });
  const text = 'SYNTHETIC-RETRY: Weniger Suchaufwand ist der gewünschte Nutzen.';
  await answer.fill(text);
  await region.getByRole('button', { name: 'Antwort senden', exact: true }).click();
  await expect(region.getByRole('alert')).toContainText('vorübergehender Anbieterfehler');
  await expect(answer).toHaveValue(text);
  await region.getByRole('button', { name: 'Antwort senden', exact: true }).click();
  await expect(region.getByLabel('KI-Rückmeldung')).toContainText('SYNTHETIC-DIALOG-1');
  expect(calls.turns).toHaveLength(2);
  expect(calls.turns[1]).toEqual(calls.turns[0]);
  await expect(region.getByLabel('KI-Rückmeldung')).toHaveCount(1);
  await expect(region).toContainText('Noch 3 Beiträge möglich');
  expect(await stateOf(page)).toEqual(before);
});

test('Änderung der lokalen Materialrevision verwirft private Rückmeldungen und ungesendeten Entwurf', async ({ page }) => {
  let revision = 'synthetic-material-before';
  let observedRevision = '';
  const calls = await mockAi(page, { material: () => { observedRevision = revision; return { state: 'ready', revision, documents: [] }; } });
  await seed(page); const before = await stateOf(page);
  const region = await openTutor(page);
  await region.getByRole('combobox', { name: 'Lernquelle für die KI', exact: true }).selectOption('private');
  await expect.poll(() => observedRevision).toBe(revision);
  await startTutor(page);
  await sendAnswer(page, 'SYNTHETIC-PRIVATE-BEFORE-REVISION', 1);
  await region.getByRole('textbox', { name: 'Deine Antwort oder Rückfrage', exact: true }).fill('SYNTHETIC-PRIVATE-UNSENT-REVISION');
  revision = 'synthetic-material-after';
  await page.evaluate(() => window.dispatchEvent(new Event('azubiprep-material-changed')));
  await expect.poll(() => observedRevision).toBe(revision);
  await expect.poll(() => calls.ends.length).toBe(1);
  expect(calls.ends[0]).toEqual({ sessionId: 'synthetic-session-1' });
  await expect(region.getByLabel('KI-Rückmeldung')).toHaveCount(0);
  await expect(region).not.toContainText('SYNTHETIC-PRIVATE-BEFORE-REVISION');
  await startTutor(page);
  await expect(region.getByRole('textbox', { name: 'Deine Antwort oder Rückfrage', exact: true })).toHaveValue('');
  expect(calls.starts[1]).toMatchObject({ provider: 'qwen', useMaterial: true });
  expect(await stateOf(page)).toEqual(before);
});

test('Verspäteter Start nach Quellenwechsel wird beendet und ersetzt die neue Sitzung nicht', async ({ page }) => {
  let release;
  const held = new Promise(resolve => { release = resolve; });
  const calls = await mockAi(page, { start: async ({ calls, reply }) => { if (calls.starts.length === 1) await held; await reply(); } });
  await seed(page); const before = await stateOf(page);
  // A deliberately non-cancellable synthetic start transport delivers the stale
  // response, so this checks the UI generation guard as well as /journey/end.
  await page.evaluate(() => {
    const original = window.fetch.bind(window);
    window.fetch = (url, options) => original(url, String(url).endsWith('/ai/journey/start') ? { ...options, signal: undefined } : options);
  });
  const region = await openTutor(page);
  await region.getByRole('button', { name: 'KI-Gespräch beginnen', exact: true }).click();
  await expect.poll(() => calls.starts.length).toBe(1);
  await region.getByRole('combobox', { name: 'Lernquelle für die KI', exact: true }).selectOption('private');
  await startTutor(page);
  expect(calls.starts[1]).toMatchObject({ provider: 'qwen', useMaterial: true });
  release();
  await expect.poll(() => calls.ends.length).toBe(1);
  expect(calls.ends[0]).toEqual({ sessionId: 'synthetic-session-1' });
  await sendAnswer(page, 'SYNTHETIC-PRIVATE-NEW-SESSION', 1);
  expect(calls.turns[0].sessionId).toBe('synthetic-session-2');
  expect(await stateOf(page)).toEqual(before);
});

test('HTML und Skripttext aus der Modellantwort werden ausschließlich als Text angezeigt', async ({ page }) => {
  const markup = '<img src="synthetic-invalid-image" onerror="window.syntheticInjected=true">';
  const script = '<script>window.syntheticInjected=true</script>';
  await mockAi(page, { turn: ({ reply }) => reply({ text: markup, followUp: script }) });
  await seed(page);
  const region = await openTutor(page); await startTutor(page);
  await region.getByRole('textbox', { name: 'Deine Antwort oder Rückfrage', exact: true }).fill('Synthetische Frage zur Textdarstellung.');
  await region.getByRole('button', { name: 'Antwort senden', exact: true }).click();
  const feedback = region.getByLabel('KI-Rückmeldung');
  await expect(feedback).toContainText(markup);
  await expect(feedback).toContainText(script);
  await expect(feedback.locator('img, script')).toHaveCount(0);
  expect(await page.evaluate(() => window.syntheticInjected)).toBeUndefined();
});

test('Schmale Ansicht und Tastatur erreichen Start, Eingabe, Senden und Abbruch', async ({ page }, info) => {
  await mockAi(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await seed(page);
  const summary = page.getByText('Optional: KI-Fachgespräch', { exact: true });
  await summary.focus(); await page.keyboard.press('Enter');
  const region = tutor(page);
  await region.getByRole('button', { name: 'KI-Gespräch beginnen', exact: true }).focus(); await page.keyboard.press('Enter');
  const answer = region.getByRole('textbox', { name: 'Deine Antwort oder Rückfrage', exact: true });
  await expect(answer).toBeEnabled(); await answer.focus(); await page.keyboard.type('Eine Uebersicht ist eine Leistung.');
  await page.keyboard.press('Tab');
  await expect(region.getByRole('button', { name: 'Antwort senden', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(region.getByLabel('KI-Rückmeldung')).toContainText('SYNTHETIC-DIALOG-1');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.screenshot({ path: info.outputPath('journey-ai-mobile.png'), fullPage: true });
  await region.getByRole('button', { name: 'Gespräch verwerfen', exact: true }).focus(); await page.keyboard.press('Enter');
  await expect(region.getByLabel('KI-Rückmeldung')).toHaveCount(0);
});

test('Electron: optionale Lernbegleitung nutzt isolierte Einstellungen und verändert den nativen Reisestand nicht', { tag: '@desktop' }, async ({}, info) => {
  test.skip(process.platform !== 'win32', 'Windows-Electron-Matrix'); test.setTimeout(90_000);
  const profile = info.outputPath('journey-ai-profile');
  const env = { ...process.env, DATABASE_URL: '', AI_ENABLED: 'false', AZUBIPREP_AI_DIR: path.join(profile, 'local-ai'), AZUBIPREP_RAG_DIR: path.join(profile, 'local-rag') };
  delete env.ELECTRON_RUN_AS_NODE;
  const app = await _electron.launch({ executablePath: path.join(repo, 'desktop/node_modules/electron/dist/electron.exe'), args: [path.join(repo, 'desktop'), `--user-data-dir=${profile}`], env });
  try {
    const page = await app.firstWindow(); await page.waitForURL(/^http:\/\/127\.0\.0\.1:/);
    const origin = new URL(page.url()).origin;
    const calls = await mockAi(page);
    await unterdrueckeOnboardingPopups(page);
    const raw = JSON.stringify(reflectionState());
    await page.evaluate(async ({ value, raw }) => {
      await window.azubiDesktop.saveAiPreferences(value);
      await window.azubiDesktop.journey.save({ raw, expectedRaw: null });
    }, { value: preference('qwen'), raw });
    await page.goto(`${origin}${journeyPath}`);
    await expect(page.locator('.journey-status')).toHaveText('Gespeichert');
    await openTutor(page); await startTutor(page);
    await sendAnswer(page, 'SYNTHETIC-DESKTOP-ANSWER', 1);
    expect(await page.evaluate(() => window.azubiDesktop.journey.load())).toBe(raw);
    expect(calls.starts[0]).toMatchObject({ provider: 'qwen', model: 'qwen3:4b' });
    await page.reload(); await openTutor(page);
    await expect(tutor(page).getByLabel('KI-Rückmeldung')).toHaveCount(0);
    expect(await page.evaluate(() => window.azubiDesktop.journey.load())).toBe(raw);
    expect(calls.unexpected).toEqual([]);
  } finally { await app.close(); }
});
