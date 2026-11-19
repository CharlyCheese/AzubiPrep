const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const vm = require('node:vm');
const { spawn } = require('node:child_process');
const { createJourneyStore, MAX_JOURNEY_BYTES, JOURNEY_FOLDER } = require('../journey-storage.cjs');

async function fixture(t) {
  const temporary = await fs.realpath(os.tmpdir());
  const root = await fs.mkdtemp(path.join(temporary, 'azubiprep-journey-test-'));
  t.after(async () => {
    const resolved = path.resolve(root);
    assert.equal(path.dirname(resolved), temporary);
    assert.ok(path.basename(resolved).startsWith('azubiprep-journey-test-'));
    assert.equal((await fs.lstat(resolved)).isSymbolicLink(), false);
    await fs.rm(resolved, { recursive: true, force: true });
  });
  return root;
}

const rawState = (revision = 1, patch = {}) => JSON.stringify({
  schemaVersion: 1, revision, track: 'FIAE', topicId: 'common-lf1-role',
  topicVersion: 'test-v1', planVersion: 'test-plan-v1', phase: 'theory', index: 0,
  completedBlocks: [], quiz: {}, reflection: {}, cards: {}, exam: {}, history: [],
  bestResult: null, optionOrder: {}, createdAt: '2026-11-10T10:00:00.000Z',
  updatedAt: '2026-11-10T10:00:00.000Z', ...patch,
});
const GOALS_TOPIC = 'common-lf1-goals';
const goalsRaw = (revision = 1, patch = {}) => rawState(revision, { topicId: GOALS_TOPIC, ...patch });

test('74 native Ablagen erhalten begrenzte LF7–LF9-Labore und verweigern fremde Felder', async t => {
  const { LAB_TOPICS, createLab } = await import('../../frontend/src/utils/journeyLabs.js');
  const plan = JSON.parse(await fs.readFile(path.join(__dirname, '../../content/learning-journey/fiae.v1.json'), 'utf8'));
  const ids = plan.topics.filter(item => ['LF1', 'WISO', 'PM', 'LF2', 'LF3', 'LF4', 'LF5', 'LF6', 'LF7', 'LF8', 'LF9'].includes(item.fieldId)).map(item => item.id);
  assert.equal(ids.length, 74);
  const profile = await fixture(t); const store = createJourneyStore(profile);
  for (const topicId of ids) await store.save({ topicId, raw: rawState(1, { topicId, ...(LAB_TOPICS.includes(topicId) ? { lab: createLab(topicId) } : {}) }), expectedRaw: null });
  const originals = await Promise.all(ids.map(id => store.load(id)));
  for (const topicId of LAB_TOPICS) {
    const initial = createLab(topicId); const before = await store.load(topicId);
    const changes = [v => v.extra = true, v => v.stage = 3, v => v.answers = [], v => v.answers[0].injected = true, v => v.checked = 'true'];
    if (topicId === LAB_TOPICS[0]) changes.push(v => v.source = 'x'.repeat(4097), v => v.testedSource = 'unmatched');
    if (topicId === LAB_TOPICS[1]) changes.push(v => v.requests = Array(17).fill({ payload: '{}', auth: 'allowed', transport: 'https' }), v => v.payload = 'x'.repeat(4097), v => v.auth = 'real-token');
    if (topicId === LAB_TOPICS[2]) changes.push(v => v.cases[0].address = '../../private', v => v.cases[0].running = 'true', v => v.index = -1);
    for (const change of changes) {
      const lab = structuredClone(initial); change(lab);
      await assert.rejects(store.save({ topicId, raw: rawState(2, { topicId, lab }), expectedRaw: before }), /Lernlabor/);
      assert.equal(await store.load(topicId), before);
    }
    await assert.rejects(store.save({ topicId: ids[0], raw: rawState(2, { lab: initial }), expectedRaw: originals[0] }), /Lernlabor/);
  }
  const reopened = createJourneyStore(profile);
  assert.deepEqual(await Promise.all(ids.map(id => reopened.load(id))), originals);
  assert.equal((await fs.readdir(path.join(profile, JOURNEY_FOLDER))).length, 74);
});

test('57 native Ablagen: begrenzte LF4–LF6-Praxis bleibt themengebunden und nach Wiederöffnung erhalten', async t => {
  const { PRACTICE_TOPICS, createPractice } = await import('../../frontend/src/utils/journeyPractices.js');
  const plan = JSON.parse(await fs.readFile(path.join(__dirname, '../../content/learning-journey/fiae.v1.json'), 'utf8'));
  const ids = plan.topics.filter(item => ['LF1', 'WISO', 'PM', 'LF2', 'LF3', 'LF4', 'LF5', 'LF6'].includes(item.fieldId)).map(item => item.id);
  assert.equal(ids.length, 57);
  const profile = await fixture(t); const store = createJourneyStore(profile);
  for (const topicId of ids) await store.save({ topicId, raw: rawState(1, { topicId, ...(PRACTICE_TOPICS.includes(topicId) ? { practice: createPractice(topicId) } : {}) }), expectedRaw: null });
  const before = await Promise.all(ids.map(id => store.load(id)));
  const reopened = createJourneyStore(profile); assert.deepEqual(await Promise.all(ids.map(id => reopened.load(id))), before);
  for (const topicId of PRACTICE_TOPICS) {
    const valid = createPractice(topicId); const raw = await store.load(topicId);
    for (const practice of [{ ...valid, extra: true }, { ...valid, step: -1 }, { ...valid, answers: [] }, { ...valid, answers: valid.answers.map((answer, i) => i ? answer : { ...answer, injected: 'value' }) }]) {
      await assert.rejects(store.save({ topicId, raw: rawState(2, { topicId, practice }), expectedRaw: raw }));
    }
    await assert.rejects(store.save({ topicId: 'common-lf1-role', raw: rawState(2, { practice: valid }), expectedRaw: before[0] }));
    assert.equal(await store.load(topicId), raw);
  }
  const topicId = 'common-lf5-testing'; const raw = await store.load(topicId);
  await assert.rejects(store.save({ topicId, raw: rawState(2, { topicId, practice: { ...createPractice(topicId), code: 'x'.repeat(4097) } }), expectedRaw: raw }));
  assert.equal((await fs.readdir(path.join(profile, JOURNEY_FOLDER))).length, 57);
  assert.deepEqual(await Promise.all(ids.map(id => reopened.load(id))), before);
});

test('39 Ablagen: begrenztes Netzwerklabor wird ausschließlich im Diagnosethema gespeichert', async t => {
  const { createNetwork } = await import('../../frontend/src/utils/journeyNetwork.js');
  const plan = JSON.parse(await fs.readFile(path.join(__dirname, '../../content/learning-journey/fiae.v1.json'), 'utf8'));
  const ids = plan.topics.filter(item => ['LF1', 'WISO', 'PM', 'LF2', 'LF3'].includes(item.fieldId)).map(item => item.id);
  assert.equal(ids.length, 39);
  const profile = await fixture(t); const store = createJourneyStore(profile);
  for (const topicId of ids) await store.save({ topicId, raw: rawState(1, { topicId }), expectedRaw: null });
  const topicId = 'common-lf3-diagnosis'; const others = ids.filter(id => id !== topicId);
  const originals = await Promise.all(others.map(id => store.load(id)));
  const network = createNetwork(); const raw = rawState(2, { topicId, network });
  await store.save({ topicId, raw, expectedRaw: rawState(1, { topicId }) });
  assert.equal(await createJourneyStore(profile).load(topicId), raw);
  for (const mutate of [v => v.extra = 1, v => v.index = 4, v => v.cases.pop(), v => v.cases[0].ip = '../../secret', v => v.cases[0].ip = '1'.repeat(16), v => v.cases[0].diagnosis = 'other', v => v.cases[0].done = 'true']) {
    const invalid = structuredClone(network); mutate(invalid);
    await assert.rejects(store.save({ topicId, raw: rawState(3, { topicId, network: invalid }), expectedRaw: raw }), /Netzwerklabor/);
    assert.equal(await store.load(topicId), raw);
  }
  await assert.rejects(store.save({ raw: rawState(2, { network }), expectedRaw: originals[0] }), /Netzwerklabor/);
  assert.deepEqual(await Promise.all(others.map(id => store.load(id))), originals);
  assert.equal((await fs.readdir(path.join(profile, JOURNEY_FOLDER))).length, 39);
});

test('33 Ablagen erlauben nur die begrenzte LF2-Modellübung im richtigen Thema', async t => {
  const { createWorkplace, updateWorkplace } = await import('../../frontend/src/utils/journeyWorkplace.js');
  const plan = JSON.parse(await fs.readFile(path.join(__dirname, '../../content/learning-journey/fiae.v1.json'), 'utf8'));
  const ids = plan.topics.filter(item => ['LF1', 'WISO', 'PM', 'LF2'].includes(item.fieldId)).map(item => item.id);
  assert.equal(ids.length, 33);
  const profile = await fixture(t); const store = createJourneyStore(profile);
  for (const topicId of ids) await store.save({ topicId, raw: rawState(1, { topicId }), expectedRaw: null });
  const topicId = 'common-lf2-handover'; const others = ids.filter(id => id !== topicId);
  const originals = await Promise.all(others.map(id => store.load(id)));
  const workplace = updateWorkplace(createWorkplace(), { type: 'configure', field: 'device', value: 'power' });
  const raw = rawState(2, { topicId, workplace });
  await store.save({ topicId, raw, expectedRaw: rawState(1, { topicId }) });
  assert.equal(await createJourneyStore(profile).load(topicId), raw);
  for (const invalid of [{ ...workplace, path: '../../secret' }, { ...workplace, device: 'unknown' }, { ...workplace, opened: true }, { ...workplace, file: true }, { ...workplace, updated: 1 }]) {
    await assert.rejects(store.save({ topicId, raw: rawState(3, { topicId, workplace: invalid }), expectedRaw: raw }), /Einrichtungsübung/);
    assert.equal(await store.load(topicId), raw);
  }
  await assert.rejects(store.save({ raw: rawState(2, { workplace }), expectedRaw: originals[0] }), /Einrichtungsübung/);
  assert.deepEqual(await Promise.all(others.map(id => store.load(id))), originals);
  assert.equal((await fs.readdir(path.join(profile, JOURNEY_FOLDER))).length, 33);
});

test('26 Themen und begrenzte Rechentabellen bleiben nach erneutem Öffnen getrennt', async t => {
  const profile = await fixture(t);
  const oldIds = [
    ...['role', 'goals', 'market', 'value-chain', 'organization', 'presentation'].map(suffix => `common-lf1-${suffix}`),
    ...['training', 'employment', 'representation', 'social-security', 'pay', 'consumer', 'economy', 'change', 'career', 'europe'].map(suffix => `common-wiso-${suffix}`),
  ];
  const pmIds = ['project', 'stakeholders', 'methods', 'planning', 'schedule', 'costs', 'pricing', 'feasibility', 'control', 'closure'].map(suffix => `common-pm-${suffix}`);
  const store = createJourneyStore(profile);
  for (const topicId of [...oldIds, ...pmIds]) await store.save({ topicId, raw: rawState(1, { topicId }), expectedRaw: null });
  const old = await Promise.all(oldIds.map(topicId => store.load(topicId)));
  for (const [topicId, count] of [['common-pm-costs', 7], ['common-pm-pricing', 8], ['common-pm-feasibility', 10]]) {
    const calculation = { cells: Object.fromEntries(Array.from({ length: count }, (_, i) => [`B${i + 1}`, i === 0 ? '=B2+' : ''])) };
    const raw = rawState(2, { topicId, calculation });
    await store.save({ topicId, raw, expectedRaw: rawState(1, { topicId }) });
    assert.equal(await createJourneyStore(profile).load(topicId), raw);
    for (const invalid of [{ ...calculation, extra: 1 }, { cells: { ...calculation.cells, B99: '1' } }, { cells: { ...calculation.cells, B1: 'x'.repeat(161) } }]) {
      await assert.rejects(store.save({ topicId, raw: rawState(3, { topicId, calculation: invalid }), expectedRaw: raw }), /Kalkulation/);
      assert.equal(await store.load(topicId), raw);
    }
  }
  await assert.rejects(store.save({ raw: rawState(2, { calculation: { cells: { B1: '1' } } }), expectedRaw: old[0] }), /Kalkulation/);
  assert.deepEqual(await Promise.all(oldIds.map(topicId => store.load(topicId))), old);
  assert.equal((await fs.readdir(path.join(profile, JOURNEY_FOLDER))).length, 26);
});

test('16 feste Ablagen: WISO ergänzt LF1 ohne Migration; fremde Sicherungen überschreiben nichts', async t => {
  const profile = await fixture(t);
  const ids = [
    ...['role', 'goals', 'market', 'value-chain', 'organization', 'presentation'].map(id => `common-lf1-${id}`),
    ...['training', 'employment', 'representation', 'social-security', 'pay', 'consumer', 'economy', 'change', 'career', 'europe'].map(id => `common-wiso-${id}`),
  ];
  const store = createJourneyStore(profile);
  const originals = new Map(ids.map(topicId => [topicId, rawState(1, { topicId })]));
  await Promise.all(ids.map(topicId => store.save({ topicId, raw: originals.get(topicId), expectedRaw: null })));
  const reopened = createJourneyStore(profile);
  assert.equal((await fs.readdir(path.join(profile, JOURNEY_FOLDER))).length, 16);
  for (const topicId of ids) {
    assert.equal(await reopened.load(topicId), originals.get(topicId));
    const foreign = ids.find(other => other !== topicId);
    await assert.rejects(reopened.save({ topicId, raw: originals.get(foreign), expectedRaw: originals.get(topicId) }), /ungültiges Format/);
    assert.equal(await reopened.load(topicId), originals.get(topicId));
  }
  assert.equal(await fs.readFile(path.join(profile, JOURNEY_FOLDER, 'journey.json'), 'utf8'), originals.get(ids[0]));
  await assert.rejects(reopened.load('common-pm-test'), /nicht unterstützt/);
});

test('Sechs feste LF1-Ablagen: Änderungen und falscher Import lassen alle Nachbarthemen unverändert', async t => {
  const profile = await fixture(t);
  const ids = ['role', 'goals', 'market', 'value-chain', 'organization', 'presentation'].map(id => `common-lf1-${id}`);
  const store = createJourneyStore(profile);
  const originals = new Map(ids.map((topicId, index) => [topicId, rawState(1, { topicId, index })]));
  await Promise.all(ids.map(topicId => store.save({ topicId, raw: originals.get(topicId), expectedRaw: null })));
  const reopened = createJourneyStore(profile);
  for (const topicId of ids) assert.equal(await reopened.load(topicId), originals.get(topicId));
  assert.equal((await fs.readdir(path.join(profile, JOURNEY_FOLDER))).length, 6);
  const changedId = ids.at(-1);
  await reopened.save({ topicId: changedId, raw: rawState(2, { topicId: changedId }), expectedRaw: originals.get(changedId) });
  for (const topicId of ids.slice(0, -1)) assert.equal(await reopened.load(topicId), originals.get(topicId));
  for (const topicId of ids.slice(2)) {
    const before = await reopened.load(topicId);
    await assert.rejects(reopened.save({ topicId, raw: rawState(2), expectedRaw: before }), /ungültiges Format/);
    assert.equal(await reopened.load(topicId), before);
  }
});

test('Zwei feste Themendateien behalten voneinander unabhängige Daten und Revisionen', async t => {
  const profile = await fixture(t);
  const first = createJourneyStore(profile);
  const role = rawState(1, { index: 2 });
  await first.save({ raw: role, expectedRaw: null });
  const rolePath = path.join(profile, JOURNEY_FOLDER, 'journey.json');
  const before = await fs.readFile(rolePath);
  const goals = goalsRaw();
  await first.save({ topicId: GOALS_TOPIC, raw: goals, expectedRaw: null });
  assert.deepEqual(await fs.readFile(rolePath), before);
  assert.deepEqual((await fs.readdir(path.join(profile, JOURNEY_FOLDER))).sort(), ['common-lf1-goals.json', 'journey.json']);
  const reopened = createJourneyStore(profile);
  assert.equal(await reopened.load(), role);
  assert.equal(await reopened.load('common-lf1-role'), role);
  assert.equal(await reopened.load(GOALS_TOPIC), goals);
  const results = await Promise.allSettled([
    first.save({ topicId: GOALS_TOPIC, raw: goalsRaw(2, { index: 1 }), expectedRaw: goals }),
    reopened.save({ topicId: GOALS_TOPIC, raw: goalsRaw(2, { index: 2 }), expectedRaw: goals }),
    reopened.save({ raw: rawState(2, { index: 3 }), expectedRaw: role }),
  ]);
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 2);
  assert.match(results.find(result => result.status === 'rejected').reason.message, /^CONFLICT:/);
  assert.equal(await reopened.load(), rawState(2, { index: 3 }));
  assert.equal(JSON.parse(await reopened.load(GOALS_TOPIC)).revision, 2);
});

test('Ein laufender atomarer Schreibvorgang sperrt nur sein eigenes Thema', async t => {
  const profile = await fixture(t);
  const store = createJourneyStore(profile);
  const role = rawState();
  const goals = goalsRaw();
  await store.save({ raw: role, expectedRaw: null });
  await store.save({ topicId: GOALS_TOPIC, raw: goals, expectedRaw: null });
  let release;
  let entered;
  const gate = new Promise(resolve => { release = resolve; });
  const started = new Promise(resolve => { entered = resolve; });
  const rename = fs.rename;
  const mock = t.mock.method(fs, 'rename', async (source, target) => {
    if (path.basename(target) === 'journey.json') { entered(); await gate; }
    return rename(source, target);
  });
  const savingRole = store.save({ raw: rawState(2), expectedRaw: role });
  let timer;
  try {
    await started;
    const savingGoals = createJourneyStore(profile).save({ topicId: GOALS_TOPIC, raw: goalsRaw(2), expectedRaw: goals });
    assert.equal(await Promise.race([
      savingGoals,
      new Promise((_, reject) => { timer = setTimeout(() => reject(Error('Das andere Thema ist fälschlich mit gesperrt.')), 2000); }),
    ]), goalsRaw(2));
  } finally {
    clearTimeout(timer);
    release();
    await savingRole;
    mock.mock.restore();
  }
  assert.equal(await store.load(), rawState(2));
});

test('Themen und Payloads werden vor Pfadzugriff strikt geprüft; fremde Kandidaten bleiben ungeschrieben', async t => {
  const profile = await fixture(t);
  const store = createJourneyStore(profile);
  for (const id of ['unknown', '__proto__', 'constructor', '../journey', 'common-lf1-role/../journey', '', null, {}]) {
    await assert.rejects(store.load(id), /nicht unterstützt/);
    await assert.rejects(store.save({ topicId: id, raw: goalsRaw(), expectedRaw: null }), /nicht unterstützt/);
  }
  assert.deepEqual(await fs.readdir(profile), [], 'unknown IDs never create storage paths');
  const role = rawState();
  const goals = goalsRaw();
  await store.save({ raw: role, expectedRaw: null });
  await store.save({ topicId: GOALS_TOPIC, raw: goals, expectedRaw: null });
  const inheritedTopic = Object.assign(Object.create({ topicId: GOALS_TOPIC }), { raw: goalsRaw(2), expectedRaw: goals });
  const inheritedRaw = Object.assign(Object.create({ raw: goalsRaw(2) }), { topicId: GOALS_TOPIC, expectedRaw: goals });
  const inheritedExpected = Object.assign(Object.create({ expectedRaw: goals }), { topicId: GOALS_TOPIC, raw: goalsRaw(2) });
  const missingStateField = JSON.parse(goalsRaw(2));
  delete missingStateField.phase;
  for (const payload of [
    { raw: goalsRaw(2), expectedRaw: role },
    { topicId: GOALS_TOPIC, raw: rawState(2), expectedRaw: goals },
    { topicId: undefined, raw: rawState(2), expectedRaw: role },
    { topicId: GOALS_TOPIC, raw: goalsRaw(2), expectedRaw: goals, path: '../journey.json' },
    { topicId: GOALS_TOPIC, raw: goalsRaw(2), expectedRaw: goals, [Symbol('hidden')]: true },
    { topicId: GOALS_TOPIC, raw: JSON.stringify(missingStateField), expectedRaw: goals },
    inheritedTopic, inheritedRaw, inheritedExpected,
  ]) {
    await assert.rejects(store.save(payload));
    assert.equal(await store.load(), role);
    assert.equal(await store.load(GOALS_TOPIC), goals);
  }
});

test('Beschädigte zweite Datei, Ersatz und fremdes Thema berühren die erste Datei nicht', async t => {
  const profile = await fixture(t);
  const store = createJourneyStore(profile);
  const role = rawState();
  await store.save({ raw: role, expectedRaw: null });
  const target = path.join(profile, JOURNEY_FOLDER, 'common-lf1-goals.json');
  for (const previous of ['{broken', '{ "schemaVersion": 99, "revision": 19 }', role]) {
    await fs.writeFile(target, previous);
    assert.equal(await store.load(GOALS_TOPIC), previous);
    await assert.rejects(store.save({ topicId: GOALS_TOPIC, raw: goalsRaw(), expectedRaw: null }), /^Error: CONFLICT:/);
    assert.equal(await fs.readFile(target, 'utf8'), previous);
    const revision = previous.includes('99') ? 20 : previous === role ? 2 : 1;
    await store.save({ topicId: GOALS_TOPIC, raw: goalsRaw(revision), expectedRaw: previous });
    assert.equal(await store.load(), role);
  }
});

test('Eine verknüpfte zweite Zieldatei wird weder gelesen noch ersetzt', async t => {
  const profile = await fixture(t);
  const store = createJourneyStore(profile);
  const role = rawState();
  await store.save({ raw: role, expectedRaw: null });
  const outside = path.join(profile, 'synthetisches-ziel');
  await fs.mkdir(outside);
  const sentinel = path.join(outside, 'bleibt.txt');
  await fs.writeFile(sentinel, 'synthetischer unveränderter Inhalt');
  const linked = path.join(profile, JOURNEY_FOLDER, 'common-lf1-goals.json');
  await fs.symlink(outside, linked, 'junction');
  await assert.rejects(store.load(GOALS_TOPIC), /bleibt erhalten/);
  await assert.rejects(store.save({ topicId: GOALS_TOPIC, raw: goalsRaw(), expectedRaw: null }), /bleibt erhalten/);
  assert.equal((await fs.lstat(linked)).isSymbolicLink(), true);
  assert.equal(await fs.readFile(sentinel, 'utf8'), 'synthetischer unveränderter Inhalt');
  assert.equal(await store.load(), role);
});

test('Getrennte Themendateien werden nach echtem Prozessneustart fortgesetzt', async t => {
  const profile = await fixture(t);
  const storageModule = path.resolve(__dirname, '../journey-storage.cjs');
  const run = (script) => new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['-e', script, profile, storageModule], { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '';
    let errors = '';
    child.stdout.on('data', chunk => { output += chunk; });
    child.stderr.on('data', chunk => { errors += chunk; });
    child.once('error', reject);
    child.once('close', code => code === 0 ? resolve(JSON.parse(output)) : reject(Error(errors || 'Testprozess fehlgeschlagen.')));
  });
  const role = rawState(1, { reflection: { synthetic: 'Erstes Thema bleibt bytegleich.' } });
  const goals = goalsRaw(1, { index: 1 });
  const first = await run(`
    const store = require(process.argv[2]).createJourneyStore(process.argv[1]);
    (async () => {
      await store.save({ raw: ${JSON.stringify(role)}, expectedRaw: null });
      await store.save({ topicId: 'common-lf1-goals', raw: ${JSON.stringify(goals)}, expectedRaw: null });
      process.stdout.write(JSON.stringify([await store.load(), await store.load('common-lf1-goals')]));
    })().catch(error => { process.stderr.write(error.message); process.exitCode = 1; });
  `);
  assert.deepEqual(first, [role, goals]);
  const roleBefore = await fs.readFile(path.join(profile, JOURNEY_FOLDER, 'journey.json'));
  const second = await run(`
    const store = require(process.argv[2]).createJourneyStore(process.argv[1]);
    (async () => {
      const old = await store.load('common-lf1-goals');
      const next = JSON.stringify({ ...JSON.parse(old), revision: 2, index: 2 });
      await store.save({ topicId: 'common-lf1-goals', raw: next, expectedRaw: old });
      process.stdout.write(JSON.stringify([await store.load(), await store.load('common-lf1-goals')]));
    })().catch(error => { process.stderr.write(error.message); process.exitCode = 1; });
  `);
  assert.equal(second[0], role);
  assert.equal(JSON.parse(second[1]).revision, 2);
  assert.equal(JSON.parse(second[1]).index, 2);
  assert.deepEqual(await fs.readFile(path.join(profile, JOURNEY_FOLDER, 'journey.json')), roleBefore);
  assert.equal(await createJourneyStore(profile).load(GOALS_TOPIC), second[1]);
});

test('Reisestand bleibt nach neuer Instanz im eigenen profilbezogenen Speicher bytegleich erhalten', async t => {
  const profile = await fixture(t);
  const first = createJourneyStore(profile);
  assert.equal(await first.load(), null);
  const raw = rawState();
  assert.equal(await first.save({ raw, expectedRaw: null }), raw);
  assert.equal(await createJourneyStore(profile).load(), raw);
  assert.deepEqual(await fs.readdir(profile), [JOURNEY_FOLDER]);
  const second = rawState(2, { index: 1 });
  await first.save({ raw: second, expectedRaw: raw });
  assert.equal(await createJourneyStore(profile).load(), second);
});

test('Gleichzeitige Speicherungen vergleichen atomar: genau ein neuer Stand gewinnt', async t => {
  const store = createJourneyStore(await fixture(t));
  const initial = rawState();
  await store.save({ raw: initial, expectedRaw: null });
  const outcomes = await Promise.allSettled([
    store.save({ raw: rawState(2, { index: 1 }), expectedRaw: initial }),
    store.save({ raw: rawState(2, { index: 2 }), expectedRaw: initial }),
  ]);
  assert.equal(outcomes.filter(result => result.status === 'fulfilled').length, 1);
  assert.match(outcomes.find(result => result.status === 'rejected').reason.message, /^CONFLICT:/);
  assert.equal(await store.load(), outcomes.find(result => result.status === 'fulfilled').value);
});

test('Mehrere Store-Objekte desselben Profils teilen den atomaren Vergleich', async t => {
  const profile = await fixture(t);
  const first = createJourneyStore(profile);
  const second = createJourneyStore(path.join(profile, '.'));
  const initial = rawState();
  await first.save({ raw: initial, expectedRaw: null });
  const outcomes = await Promise.allSettled([
    first.save({ raw: rawState(2, { index: 1 }), expectedRaw: initial }),
    second.save({ raw: rawState(2, { index: 2 }), expectedRaw: initial }),
  ]);
  assert.equal(outcomes.filter(result => result.status === 'fulfilled').length, 1);
  assert.match(outcomes.find(result => result.status === 'rejected').reason.message, /^CONFLICT:/);
  assert.equal(await first.load(), outcomes.find(result => result.status === 'fulfilled').value);
  assert.equal(await second.load(), await first.load());
});

test('CAS verwendet den tatsächlich gespeicherten Text und erzwingt die nächste Revision', async t => {
  const profile = await fixture(t);
  const store = createJourneyStore(profile);
  const initial = rawState();
  await store.save({ raw: initial, expectedRaw: null });
  await assert.rejects(store.save({ raw: rawState(1), expectedRaw: initial }), /^Error: CONFLICT:/);
  await assert.rejects(store.save({ raw: rawState(3), expectedRaw: initial }), /^Error: CONFLICT:/);
  const external = rawState(2, { index: 3 });
  await fs.writeFile(path.join(profile, JOURNEY_FOLDER, 'journey.json'), external);
  await assert.rejects(store.save({ raw: rawState(2), expectedRaw: initial }), /^Error: CONFLICT:/);
  assert.equal(await store.load(), external);
  await store.save({ raw: rawState(3), expectedRaw: external });
});

test('Ungültige Payloads, fremde Felder und zu große UTF8-Daten erhalten den letzten Stand', async t => {
  const store = createJourneyStore(await fixture(t));
  const initial = rawState();
  await store.save({ raw: initial, expectedRaw: null });
  const invalid = [null, [], {}, { raw: rawState(2) },
    { raw: rawState(2), expectedRaw: initial, path: 'anderer-ort' },
    { raw: {}, expectedRaw: initial }, { raw: rawState(2), expectedRaw: {} },
    ...['[]', 'null', '{}', 'kein JSON', rawState(2, { schemaVersion: 2 }),
      rawState(2, { track: 'FISI' }), rawState(2, { topicId: 'foreign' }),
      rawState(2, { extra: true }), rawState(1.5), rawState(Number.MAX_SAFE_INTEGER + 1),
      rawState(2, { reflection: 'ä'.repeat(MAX_JOURNEY_BYTES / 2) }),
    ].map(raw => ({ raw, expectedRaw: initial })),
  ];
  for (const payload of invalid) {
    await assert.rejects(store.save(payload));
    assert.equal(await store.load(), initial);
  }
  const base = rawState(2, { reflection: '' });
  const boundary = rawState(2, { reflection: 'x'.repeat(MAX_JOURNEY_BYTES - Buffer.byteLength(base)) });
  assert.equal(Buffer.byteLength(boundary), MAX_JOURNEY_BYTES);
  await store.save({ raw: boundary, expectedRaw: initial });
  assert.equal(await store.load(), boundary);
});

test('Unbekannte und beschädigte Altstände werden roh geladen und nur per explizitem CAS ersetzt', async t => {
  const profile = await fixture(t);
  const store = createJourneyStore(profile);
  await store.load();
  const target = path.join(profile, JOURNEY_FOLDER, 'journey.json');
  for (const previous of ['{ nicht lesbares JSON', '{ "schemaVersion": 99, "revision": 20, "future": true }']) {
    await fs.writeFile(target, previous);
    assert.equal(await createJourneyStore(profile).load(), previous);
    await assert.rejects(store.save({ raw: rawState(), expectedRaw: null }), /^Error: CONFLICT:/);
    assert.equal(await fs.readFile(target, 'utf8'), previous);
    const replacement = rawState(previous.includes('99') ? 21 : 1);
    await store.save({ raw: replacement, expectedRaw: previous });
    assert.equal(await store.load(), replacement);
  }
});

test('Schreib-/Platzmangel vor dem Commit erhält den alten Stand und gibt keine Pfade weiter', async t => {
  const profile = await fixture(t);
  const store = createJourneyStore(profile);
  const initial = rawState();
  await store.save({ raw: initial, expectedRaw: null });
  const original = fs.open;
  const mock = t.mock.method(fs, 'open', async (name, flags, ...args) => {
    const handle = await original(name, flags, ...args);
    if (flags === 'wx') handle.writeFile = async () => { throw Object.assign(Error('SYNTHETISCHER PFAD mit Payload'), { code: 'ENOSPC' }); };
    return handle;
  });
  await assert.rejects(store.save({ raw: rawState(2), expectedRaw: initial }), error => {
    assert.match(error.message, /bisherige Stand bleibt erhalten/);
    assert.doesNotMatch(error.message, /SYNTHETISCH|Payload/);
    return true;
  });
  mock.mock.restore();
  assert.equal(await createJourneyStore(profile).load(), initial);
  assert.deepEqual(await fs.readdir(path.join(profile, JOURNEY_FOLDER)), ['journey.json']);
  await store.save({ raw: rawState(2), expectedRaw: initial });
});

test('Fehlgeschlagenes atomisches Ersetzen erhält den bisherigen Stand auch nach Neustart', async t => {
  const profile = await fixture(t);
  const store = createJourneyStore(profile);
  const initial = rawState();
  await store.save({ raw: initial, expectedRaw: null });
  const mock = t.mock.method(fs, 'rename', async () => { throw Object.assign(Error('synthetischer Schreibfehler'), { code: 'EACCES' }); });
  await assert.rejects(store.save({ raw: rawState(2), expectedRaw: initial }), /bisherige Stand bleibt erhalten/);
  mock.mock.restore();
  assert.equal(await createJourneyStore(profile).load(), initial);
  await fs.writeFile(path.join(profile, JOURNEY_FOLDER, 'journey.abgebrochen.tmp'), rawState(2));
  assert.equal(await createJourneyStore(profile).load(), initial);
});

test('Laden wartet auf die bereits angeforderte Speicherung', async t => {
  const store = createJourneyStore(await fixture(t));
  const raw = rawState();
  const saving = store.save({ raw, expectedRaw: null });
  const loading = store.load();
  assert.equal(await loading, raw);
  await saving;
});

test('Verknüpfter Speicherordner und übergroße Altdateien bleiben unverändert', async t => {
  const profile = await fixture(t);
  const outside = path.join(profile, 'synthetisches-ziel');
  await fs.mkdir(outside);
  const linked = path.join(profile, JOURNEY_FOLDER);
  await fs.symlink(outside, linked, 'junction');
  await assert.rejects(createJourneyStore(profile).save({ raw: rawState(), expectedRaw: null }), /nicht verfügbar/);
  assert.deepEqual(await fs.readdir(outside), []);
  await fs.unlink(linked);
  const store = createJourneyStore(profile);
  await store.load();
  const target = path.join(profile, JOURNEY_FOLDER, 'journey.json');
  const oversized = 'x'.repeat(MAX_JOURNEY_BYTES + 1);
  await fs.writeFile(target, oversized);
  await assert.rejects(store.load(), /bleibt erhalten/);
  await assert.rejects(store.save({ raw: rawState(), expectedRaw: null }), /bleibt erhalten/);
  assert.equal(await fs.readFile(target, 'utf8'), oversized);
});

test('Preload stellt nur die eingefrorene begrenzte Journey-Brücke bereit', async () => {
  let exposed;
  const calls = [];
  const electron = {
    contextBridge: { exposeInMainWorld: (name, value) => { assert.equal(name, 'azubiDesktop'); exposed = value; } },
    ipcRenderer: { invoke: (...args) => { calls.push(args); return Promise.resolve(null); } },
  };
  vm.runInNewContext(await fs.readFile(path.join(__dirname, '../preload.cjs'), 'utf8'), { require: name => { assert.equal(name, 'electron'); return electron; } });
  assert.ok(Object.isFrozen(exposed));
  assert.ok(Object.isFrozen(exposed.journey));
  assert.deepEqual(Object.keys(exposed.journey), ['load', 'save']);
  await exposed.journey.load();
  await exposed.journey.save({ raw: 'test', expectedRaw: null, path: 'wird nicht übertragen' });
  assert.equal(calls[0][0], 'journey:load');
  assert.equal(calls[0][1], 'common-lf1-role');
  assert.equal(calls[1][0], 'journey:save');
  assert.deepEqual(JSON.parse(JSON.stringify(calls[1][1])), { raw: 'test', expectedRaw: null });
  await exposed.journey.load(GOALS_TOPIC);
  await exposed.journey.save({ topicId: GOALS_TOPIC, raw: 'second', expectedRaw: 'previous', path: 'wird nicht übertragen' });
  assert.deepEqual(calls[2], ['journey:load', GOALS_TOPIC]);
  assert.deepEqual(JSON.parse(JSON.stringify(calls[3][1])), { topicId: GOALS_TOPIC, raw: 'second', expectedRaw: 'previous' });
  await exposed.journey.save(Object.assign(Object.create({ topicId: GOALS_TOPIC, raw: 'inherited' }), { expectedRaw: null }));
  assert.equal(Object.hasOwn(calls[4][1], 'topicId'), true);
  assert.equal(calls[4][1].topicId, undefined);
  assert.equal(calls[4][1].raw, undefined);
});

test('Beide Journey-IPC-Aufrufe erlauben ausschließlich den Hauptframe des App-Hauptfensters', async t => {
  const profile = await fixture(t);
  const handlers = new Map();
  const electron = {
    app: { commandLine: { getSwitchValue: () => '' }, getPath: name => { assert.equal(name, 'userData'); return profile; }, requestSingleInstanceLock: () => true, whenReady: () => ({ then() {} }), on() {} },
    protocol: { registerSchemesAsPrivileged() {} },
    ipcMain: { handle: (name, action) => handlers.set(name, action) },
  };
  const context = vm.createContext({
    require: name => {
      if (name === 'electron') return electron;
      if (name === './pilot-inspector.cjs' || name === './js-pilot.cjs') return {};
      return name.startsWith('.') ? require(path.join(__dirname, '..', name)) : require(name);
    },
    URL, __dirname: path.join(__dirname, '..'),
  });
  vm.runInContext(await fs.readFile(path.join(__dirname, '../main.js'), 'utf8'), context);
  vm.runInContext(`appOrigin = 'http://127.0.0.1:45678'; hauptfenster = { isDestroyed: () => false, webContents: { mainFrame: { url: appOrigin + '/lernreise' } } }; registerPilot();`, context);
  const contents = vm.runInContext('hauptfenster.webContents', context);
  const valid = { sender: contents, senderFrame: contents.mainFrame };
  const invalid = [
    {}, { sender: {}, senderFrame: contents.mainFrame },
    { sender: contents, senderFrame: { url: contents.mainFrame.url } },
    { sender: contents, senderFrame: { url: 'azubi-preview://preview/index.html' } },
    { sender: contents, senderFrame: { url: 'azubi-js-pilot://runner/index.html' } },
    { sender: {}, senderFrame: { url: 'devtools://devtools/bundled/inspector.html' } },
  ];
  for (const channel of ['journey:load', 'journey:save']) {
    assert.equal(typeof handlers.get(channel), 'function');
    for (const event of invalid) assert.throws(() => handlers.get(channel)(event, { raw: rawState(), expectedRaw: null }), /Nicht freigegebener/);
  }
  assert.equal(await handlers.get('journey:load')(valid), null);
  await handlers.get('journey:save')(valid, { raw: rawState(), expectedRaw: null });
  assert.equal(await handlers.get('journey:load')(valid), rawState());
  await handlers.get('journey:save')(valid, { topicId: GOALS_TOPIC, raw: goalsRaw(), expectedRaw: null });
  assert.equal(await handlers.get('journey:load')(valid, GOALS_TOPIC), goalsRaw());
  assert.equal(await handlers.get('journey:load')(valid), rawState());
  await assert.rejects(handlers.get('journey:load')(valid, '../journey.json'), /nicht unterstützt/);
  await assert.rejects(handlers.get('journey:save')(valid, { topicId: GOALS_TOPIC, raw: rawState(2), expectedRaw: goalsRaw() }), /ungültiges Format/);
  contents.mainFrame.url = 'http://127.0.0.1:45679/lernreise';
  assert.throws(() => handlers.get('journey:load')(valid), /Nicht freigegebener/);
});

async function mainContext(electron) {
  const context = vm.createContext({
    require: name => name === 'electron' ? electron : name.startsWith('.') ? {} : require(name),
    URL, __dirname: path.join(__dirname, '..'),
  });
  vm.runInContext(await fs.readFile(path.join(__dirname, '../main.js'), 'utf8'), context);
  return context;
}

test('Prozesssperre wird nach der Profilwahl angefordert und beendet Zweitstarts vor Backend und IPC', async t => {
  const profile = await fixture(t);
  for (const primary of [false, true]) {
    const actions = [];
    const handlers = new Map();
    const electron = {
      app: {
        commandLine: { getSwitchValue: () => profile },
        setPath: (name, value) => { assert.equal(name, 'userData'); assert.equal(value, profile); actions.push('profile'); },
        requestSingleInstanceLock: () => { actions.push('lock'); return primary; },
        quit: () => actions.push('quit'),
        whenReady: () => { actions.push('ready'); return { then() {} }; },
        on: (name, handler) => handlers.set(name, handler),
      },
      protocol: { registerSchemesAsPrivileged() {} },
    };
    const context = await mainContext(electron);
    assert.deepEqual(actions, primary ? ['profile', 'lock', 'ready'] : ['profile', 'lock', 'quit']);
    if (!primary) { assert.equal(handlers.size, 0); continue; }
    context.windowActions = actions;
    vm.runInContext(`hauptfenster = { isDestroyed: () => false, isMinimized: () => true, restore: () => windowActions.push('restore'), show: () => windowActions.push('show'), focus: () => windowActions.push('focus') };`, context);
    handlers.get('second-instance')();
    assert.deepEqual(actions.slice(-3), ['restore', 'show', 'focus']);
  }
});

test('Lernreise-Quellen öffnen nur auf den konkreten freigegebenen HTTPS-Hosts extern', async () => {
  const opened = [];
  const context = await mainContext({
    app: { commandLine: { getSwitchValue: () => '' }, requestSingleInstanceLock: () => false, quit() {} },
    protocol: { registerSchemesAsPrivileged() {} },
    shell: { openExternal: target => { opened.push(target); return Promise.resolve(); } },
  });
  const open = vm.runInContext('openExternalTarget', context);
  for (const url of ['https://www.kmk.org/fileadmin/Dateien/pdf/test.pdf', 'https://www.gesetze-im-internet.de/bbig_2005/', 'https://www.existenzgruendungsportal.de/SharedDocs/test']) {
    assert.equal(open({ url }).action, 'deny');
  }
  assert.equal(opened.length, 3);
  for (const url of ['http://www.kmk.org/test', 'https://kmk.org/test', 'https://www.kmk.org.foreign.invalid/test', 'https://user@www.kmk.org/test', 'file:///test.pdf', 'https://foreign.invalid/test', 'https://www.existenzgruendungsportal.de.foreign.invalid/test', 'https://user@www.existenzgruendungsportal.de/test']) {
    assert.equal(open({ url }).action, 'deny');
  }
  assert.equal(opened.length, 3);
});

test('Alle veröffentlichten Lernreise-Quellen öffnen extern; ähnliche Fremdhosts bleiben gesperrt', async () => {
  const opened = [];
  const context = await mainContext({
    app: { commandLine: { getSwitchValue: () => '' }, requestSingleInstanceLock: () => false, quit() {} },
    protocol: { registerSchemesAsPrivileged() {} },
    shell: { openExternal: target => { opened.push(target); return Promise.resolve(); } },
  });
  const open = vm.runInContext('openExternalTarget', context);
  const root = path.resolve(__dirname, '../../content/learning-journey');
  const manifest = JSON.parse(await fs.readFile(path.join(root, 'fiae.v1.json'), 'utf8'));
  const urls = new Set();
  for (const topic of manifest.topics.filter(topic => topic.status === 'content-ready')) {
    const doc = JSON.parse(await fs.readFile(path.join(root, topic.contentFile), 'utf8'));
    doc.sources.forEach(source => urls.add(source.url));
  }
  for (const url of urls) {
    const before = opened.length;
    open({ url });
    assert.equal(opened.length, before + 1, `Quelle nicht erreichbar: ${url}`);
    const foreign = new URL(url); foreign.hostname += '.foreign.invalid';
    const credentials = new URL(url); credentials.username = 'user';
    const http = new URL(url); http.protocol = 'http:';
    for (const candidate of [foreign.href, credentials.href, http.href]) open({ url: candidate });
    assert.equal(opened.length, before + 1);
  }
});

test('Echte Electron-Prozesse sperren dasselbe synthetische Profil und geben es beim Beenden frei', { timeout: 45000 }, async t => {
  const executable = path.join(__dirname, '../node_modules/electron/dist', process.platform === 'win32' ? 'electron.exe' : 'electron');
  try { await fs.access(executable); } catch { t.skip('Die Electron-Laufzeit ist nicht installiert; Prozesssperre zusätzlich mit bereitgestellter Laufzeit prüfen.'); return; }
  const root = await fixture(t);
  const helper = path.join(root, 'lock-check.cjs');
  const main = path.resolve(__dirname, '../main.js');
  // Führt die echte main.js-Profilwahl/Sperre aus, startet aber keine Fenster,
  // Backends, Konten- oder Materialdienste. Electron erhält nur Testprofile.
  await fs.writeFile(helper, `
const { app } = require('electron');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
let acquired;
const report = () => process.stdout.write('JOURNEY_LOCK:' + acquired + '\\n');
const bridge = {
  commandLine: app.commandLine,
  setPath: (...args) => app.setPath(...args),
  requestSingleInstanceLock: () => (acquired = app.requestSingleInstanceLock()),
  quit: () => { report(); app.quit(); },
  whenReady: () => ({ then() {} }),
  on: (...args) => app.on(...args),
};
vm.runInNewContext(fs.readFileSync(${JSON.stringify(main)}, 'utf8'), {
  require: name => name === 'electron' ? { app: bridge, protocol: { registerSchemesAsPrivileged() {} } } : name.startsWith('.') ? {} : require(name),
  URL, __dirname: path.dirname(${JSON.stringify(main)}),
});
if (acquired) {
  app.whenReady().then(report);
  process.stdin.resume();
  process.stdin.once('data', () => app.quit());
}
`, 'utf8');
  const children = [];
  const stop = async child => {
    if (child.exitCode !== null || child.signalCode !== null) return;
    await new Promise(resolve => {
      const timer = setTimeout(() => child.kill(), 3000);
      child.once('exit', () => { clearTimeout(timer); resolve(); });
      child.stdin.end('quit\n');
    });
  };
  t.after(async () => { for (const child of children) await stop(child); });
  const start = async profile => {
    await fs.mkdir(profile, { recursive: true });
    const env = { ...process.env };
    delete env.ELECTRON_RUN_AS_NODE;
    const child = spawn(executable, [helper, '--user-data-dir=' + profile], { env, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
    children.push(child);
    const acquired = await new Promise((resolve, reject) => {
      let output = '';
      const timer = setTimeout(() => reject(Error('Electron-Prozesssperre antwortet nicht.')), 12000);
      child.on('error', error => { clearTimeout(timer); reject(error); });
      child.on('exit', () => { clearTimeout(timer); if (!output.includes('JOURNEY_LOCK:')) reject(Error('Electron-Testprozess wurde vor dem Sperrergebnis beendet.')); });
      child.stdout.on('data', data => {
        output += data.toString();
        const match = /JOURNEY_LOCK:(true|false)/.exec(output);
        if (match) { clearTimeout(timer); resolve(match[1] === 'true'); }
      });
    });
    return { child, acquired };
  };
  try {
    const profileA = path.join(root, 'profil-a');
    const first = await start(profileA);
    assert.equal(first.acquired, true);
    assert.equal((await start(profileA)).acquired, false);
    assert.equal((await start(path.join(root, 'profil-b'))).acquired, true);
    await stop(first.child);
    assert.equal((await start(profileA)).acquired, true);
  } finally { for (const child of children) await stop(child); }
});
