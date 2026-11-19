import { NETWORK_TOPIC, createNetwork, networkPassed } from '../../frontend/src/utils/journeyNetwork.js';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import test from 'node:test';
import { parseCsv } from '../../backend/src/csv.js';
import { calculationSheet, createCalculation } from '../../frontend/src/utils/journeyCalculation.js';
import { WORKPLACE_TOPIC, createWorkplace } from '../../frontend/src/utils/journeyWorkplace.js';
import {
  KEY, journeyStorageKey, createJourneyState, validateJourneyState, reduceJourney,
  createJourneyStore, exportJourney, parseJourneyBackup, latestObjectiveScores,
} from '../../frontend/src/store/journeyStore.js';

const read = (relative) => fs.readFileSync(new URL(relative, import.meta.url), 'utf8');
const topic = JSON.parse(read('../../content/learning-journey/topics/common-lf1-role.v1.json'));
topic.planVersion = JSON.parse(read('../../content/learning-journey/fiae.v1.json')).version;
topic.track = 'FIAE';
const questions = parseCsv(read('../../content/learning-journey/questions/common-lf1-role.v1.csv')).records;
for (const phase of ['quiz', 'exam']) {
  topic[phase].questions = topic[phase].questionIds.map((id) => {
    const question = questions.find((item) => item.id === id);
    return Object.fromEntries(['id', 'typ', 'frage', 'option_a', 'option_b', 'option_c', 'option_d'].map((key) => [key, question[key]]));
  });
}
const NOW = '2026-11-10T09:00:00.000Z';
const uuid = (n = 1) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const fresh = () => createJourneyState(topic, { now: NOW });
const step = (state, action) => reduceJourney(state, action, topic);
const clone = (state) => JSON.parse(JSON.stringify(state));

function feedback(questionId, selected) {
  const question = questions.find(({ id }) => id === questionId);
  const link = topic.questionLinks.find((item) => item.questionId === questionId);
  return {
    questionId, answer: selected, correct: selected === question.antwort, expected: question.antwort,
    explanation: question.erklaerung, blockIds: [...link.blockIds], objectiveIds: [...link.objectiveIds],
  };
}

function examIntro() {
  let state = fresh();
  for (const block of topic.blocks) state = step(state, { type: 'read-block' });
  for (const questionId of topic.quiz.questionIds) {
    state = step(state, { type: 'select-answer', questionId, answer: 'a' });
    state = step(state, { type: 'quiz-feedback', feedback: feedback(questionId, 'a') });
    state = step(state, { type: 'next-quiz' });
  }
  for (const item of topic.interview) {
    state = step(state, { type: 'reflection-draft', text: `Mein eigener Vergleich für ${item.id}.` });
    state = step(state, { type: 'reflection-reveal' });
    state = step(state, { type: 'reflection-done' });
  }
  for (const card of topic.cards) {
    state = step(state, { type: 'card-reveal' });
    state = step(state, { type: 'card-rate', rating: 'repeat' });
  }
  return state;
}

function answeredExam(correct = 7, attempt = 1, state = examIntro()) {
  state = step(state, { type: 'start-exam', attemptId: uuid(attempt) });
  topic.exam.questionIds.forEach((questionId, index) => {
    const expected = questions.find(({ id }) => id === questionId).antwort;
    const answer = index < correct ? expected : expected === 'a' ? 'b' : 'a';
    state = step(state, { type: 'select-answer', questionId, answer });
    state = step(state, { type: 'next-exam' });
  });
  return state;
}

function resultFor(state) {
  const results = topic.exam.questionIds.map((id) => feedback(id, state.exam.answers[id]));
  const correct = results.filter((row) => row.correct).length;
  return {
    attemptId: state.exam.attemptId, version: topic.version, total: 8, correct,
    percent: correct / 8 * 100, passed: correct / 8 * 100 >= topic.exam.passPercent, results,
    objectives: topic.objectives.map(({ id }) => {
      const rows = results.filter((row) => row.objectiveIds.includes(id));
      const count = rows.filter((row) => row.correct).length;
      return { id, total: rows.length, correct: count, percent: count / rows.length * 100 };
    }),
  };
}

const finish = (state) => step(state, { type: 'exam-result', result: resultFor(state), completedAt: NOW });

function memoryStorage(raw = null) {
  return {
    raw, writes: 0, quota: false,
    getItem(key) { assert.equal(key, KEY); return this.raw; },
    setItem(key, value) {
      assert.equal(key, KEY);
      if (this.quota) throw Object.assign(new Error('Full'), { name: 'QuotaExceededError' });
      this.raw = value;
      this.writes += 1;
    },
  };
}

function serialLocks() {
  let tail = Promise.resolve();
  return {
    calls: 0,
    request(name, options, callback) {
      assert.equal(name, KEY);
      assert.equal(options.mode, 'exclusive');
      this.calls += 1;
      const result = tail.then(callback);
      tail = result.catch(() => {});
      return result;
    },
  };
}

function multiTopicStorage() {
  const values = new Map();
  const lockNames = [];
  const queues = new Map();
  return {
    storage: {
      getItem: key => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
    },
    locks: {
      request(name, options, callback) {
        assert.equal(options.mode, 'exclusive');
        lockNames.push(name);
        const result = (queues.get(name) || Promise.resolve()).then(callback);
        queues.set(name, result.catch(() => {}));
        return result;
      },
    },
    values, lockNames,
  };
}

function goalsTopic() {
  return {
    ...JSON.parse(read('../../content/learning-journey/topics/common-lf1-goals.v1.json')),
    track: 'FIAE', planVersion: topic.planVersion,
  };
}

function lf1Topic(suffix) {
  return { ...JSON.parse(read(`../../content/learning-journey/topics/common-lf1-${suffix}.v1.json`)), planVersion: topic.planVersion, track: 'FIAE' };
}

test('Alle sechs LF1-Themen speichern getrennt; neue Sicherung berührt die beiden Altstände nicht', async () => {
  const environment = multiTopicStorage();
  const store = createJourneyStore({ ...environment, native: null });
  const all = ['role', 'goals', 'market', 'value-chain', 'organization', 'presentation'].map(lf1Topic);
  const saved = await Promise.all(all.map(item => store.save(createJourneyState(item), null, item)));
  const originals = all.map(item => store.load(item).raw);
  const last = all.at(-1);
  const updated = await store.save(reduceJourney(saved.at(-1), { type: 'read-block' }, last), 1, last);
  assert.equal(updated.index, 1);
  all.slice(0, -1).forEach((item, i) => assert.equal(store.load(item).raw, originals[i]));
  const backup = parseJourneyBackup(exportJourney(saved.at(-1), last), last);
  await store.replace(backup, store.load(last).raw, last);
  all.slice(0, -1).forEach((item, i) => assert.equal(store.load(item).raw, originals[i]));
  for (const other of all.slice(0, -1)) assert.throws(() => parseJourneyBackup(exportJourney(updated, last), other), { code: 'INVALID_STATE' });
  assert.equal(new Set(all.map(item => journeyStorageKey(item.id))).size, 6);
});

test('16 Themen: WISO-Sicherungen und konkurrierendes Speichern erhalten alle LF1-Stände', async () => {
  const environment = multiTopicStorage();
  const store = createJourneyStore({ ...environment, native: null });
  const lf1 = ['role', 'goals', 'market', 'value-chain', 'organization', 'presentation'].map(lf1Topic);
  const wiso = ['training', 'employment', 'representation', 'social-security', 'pay', 'consumer', 'economy', 'change', 'career', 'europe'].map(suffix => ({
    ...JSON.parse(read(`../../content/learning-journey/topics/common-wiso-${suffix}.v1.json`)), planVersion: topic.planVersion, track: 'FIAE',
  }));
  const all = [...lf1, ...wiso];
  await Promise.all(all.map(item => store.save(createJourneyState(item), null, item)));
  const originals = all.map(item => store.load(item).raw);
  for (const item of wiso) {
    const initial = store.load(item).state;
    const draft = reduceJourney(initial, { type: 'read-block' }, item);
    const race = await Promise.allSettled([store.save(draft, 1, item), store.save(draft, 1, item)]);
    assert.equal(race.filter(result => result.status === 'fulfilled').length, 1);
    assert.equal(race.find(result => result.status === 'rejected').reason.code, 'CONFLICT');
    const saved = store.load(item);
    const backup = exportJourney(saved.state, item);
    for (const other of all.filter(other => other.id !== item.id)) assert.throws(() => parseJourneyBackup(backup, other), { code: 'INVALID_STATE' });
    await store.replace(parseJourneyBackup(backup, item), saved.raw, item);
    lf1.forEach((old, index) => assert.equal(store.load(old).raw, originals[index]));
  }
  const reopened = createJourneyStore({ ...environment, native: null });
  assert.equal(new Set(all.map(item => journeyStorageKey(item.id))).size, 16);
  for (const item of wiso) assert.equal(reopened.load(item).state.index, 1);
  assert.throws(() => journeyStorageKey('common-pm-test'), { code: 'INVALID_STATE' });
});

test('26 Themen mit Tabellen: lokale Entwürfe, Fehlformeln und Sicherungen bleiben themengetrennt', async () => {
  const environment = multiTopicStorage();
  const store = createJourneyStore({ ...environment, native: null });
  const plan = JSON.parse(read('../../content/learning-journey/fiae.v1.json'));
  const all = plan.topics.filter(item => item.status === 'content-ready' && ['LF1', 'WISO', 'PM'].includes(item.fieldId)).map(item => ({
    ...JSON.parse(read(`../../content/learning-journey/${item.contentFile}`)), track: 'FIAE', planVersion: plan.version,
  }));
  assert.equal(all.length, 26);
  await Promise.all(all.map(item => store.save(createJourneyState(item), null, item)));
  const originals = all.slice(0, 16).map(item => store.load(item).raw);
  for (const item of all.filter(item => calculationSheet(item.id))) {
    let state = store.load(item).state;
    const cellId = `B${calculationSheet(item.id).inputs + 1}`;
    state = reduceJourney(state, { type: 'calculation-cell', cellId, text: '=B1+' }, item);
    state = await store.save(state, 1, item);
    assert.equal(store.load(item).state.calculation.cells[cellId], '=B1+');
    const backup = exportJourney(state, item);
    const reopened = createJourneyStore({ ...environment, native: null });
    await reopened.replace(parseJourneyBackup(backup, item), reopened.load(item).raw, item);
    assert.equal(reopened.load(item).state.calculation.cells[cellId], '=B1+');
    assert.throws(() => reduceJourney(state, { type: 'calculation-cell', cellId: 'B99', text: '1' }, item), { code: 'INVALID_ACTION' });
    assert.throws(() => reduceJourney(state, { type: 'calculation-cell', cellId, text: 'x'.repeat(161) }, item), { code: 'INVALID_ACTION' });
  }
  all.slice(0, 16).forEach((item, index) => assert.equal(store.load(item).raw, originals[index]));
  const illegal = { ...store.load(all[0]).state, calculation: createCalculation('common-pm-costs') };
  assert.throws(() => validateJourneyState(illegal, all[0]), { code: 'INVALID_STATE' });
  assert.equal(new Set(all.map(item => journeyStorageKey(item.id))).size, 26);
});

test('33 Ablagen: Einrichtungsübung braucht Modellprüfung, Bestätigung und bewahrt alte Stände und Sicherungen', async () => {
  const plan = JSON.parse(read('../../content/learning-journey/fiae.v1.json'));
  const all = plan.topics.filter(item => item.status === 'content-ready' && ['LF1', 'WISO', 'PM', 'LF2'].includes(item.fieldId)).map(item => ({ ...JSON.parse(read(`../../content/learning-journey/${item.contentFile}`)), track: 'FIAE', planVersion: plan.version }));
  assert.equal(all.length, 33);
  const target = all.find(item => item.id === WORKPLACE_TOPIC);
  const records = parseCsv(read('../../content/learning-journey/questions/common-lf2-handover.v1.csv')).records;
  const environment = multiTopicStorage(); const store = createJourneyStore({ ...environment, native: null });
  for (const item of all) await store.save(createJourneyState(item), null, item);
  const others = all.filter(item => item.id !== target.id);
  const originals = others.map(item => store.load(item).raw);
  let state = store.load(target).state;
  const act = action => { state = reduceJourney(state, action, target); };
  assert.throws(() => act({ type: 'workplace-action', action: { type: 'check' } }), { code: 'INVALID_ACTION' });
  target.blocks.forEach(() => act({ type: 'read-block' }));
  for (const questionId of target.quiz.questionIds) {
    const question = records.find(item => item.id === questionId); const mapping = target.questionLinks.find(item => item.questionId === questionId);
    act({ type: 'select-answer', questionId, answer: question.antwort });
    act({ type: 'quiz-feedback', feedback: { questionId, answer: question.antwort, correct: true, expected: question.antwort, explanation: question.erklaerung, blockIds: mapping.blockIds, objectiveIds: mapping.objectiveIds } });
    act({ type: 'next-quiz' });
  }
  act({ type: 'reflection-reveal' }); act({ type: 'reflection-done' }); act({ type: 'reflection-reveal' });
  assert.throws(() => act({ type: 'reflection-done', practiceConfirmed: true }), /Modellarbeitsplatz/);
  for (const [field, value] of Object.entries({ device: 'power', software: 'approved', account: 'standard', displays: '2', updated: true })) act({ type: 'workplace-action', action: { type: 'configure', field, value } });
  for (const type of ['create-folder', 'create-file', 'open-file', 'check']) act({ type: 'workplace-action', action: { type } });
  assert.throws(() => act({ type: 'reflection-done', practiceConfirmed: false }), { code: 'INVALID_ACTION' });
  state = await store.save(state, 1, target);
  const restored = parseJourneyBackup(exportJourney(state, target), target);
  assert.deepEqual(restored.workplace, state.workplace);
  const reopened = createJourneyStore({ ...environment, native: null });
  state = await reopened.replace(restored, reopened.load(target).raw, target);
  act({ type: 'workplace-action', action: { type: 'configure', field: 'device', value: 'office' } });
  assert.equal(state.workplace.checked, false);
  assert.throws(() => act({ type: 'reflection-done', practiceConfirmed: true }), /Modellarbeitsplatz/);
  act({ type: 'workplace-action', action: { type: 'check' } });
  act({ type: 'reflection-done', practiceConfirmed: true });
  assert.equal(state.index, 2);
  assert.equal(parseJourneyBackup(exportJourney(state, target), target).workplace.checked, true);
  act({ type: 'previous' });
  assert.throws(() => act({ type: 'workplace-action', action: { type: 'configure', field: 'device', value: 'compact' } }), /Bestätigung gesperrt/);
  for (const workplace of [undefined, { ...state.workplace, checked: false }, { ...state.workplace, device: 'compact' }, { ...state.workplace, file: false }]) {
    const invalid = { ...state, workplace }; if (workplace === undefined) delete invalid.workplace;
    assert.throws(() => validateJourneyState(invalid, target), { code: 'INVALID_STATE' });
  }
  assert.throws(() => validateJourneyState({ ...createJourneyState(all[0]), workplace: createWorkplace() }, all[0]), { code: 'INVALID_STATE' });
  assert.deepEqual(others.map(item => store.load(item).raw), originals);
  assert.equal(new Set(all.map(item => journeyStorageKey(item.id))).size, 33);
});

test('39 Ablagen: drei Netzwerkfälle, Bestätigung, Sicherung und alte Lernstände bleiben konsistent', async () => {
  const plan = JSON.parse(read('../../content/learning-journey/fiae.v1.json'));
  const all = plan.topics.filter(item => item.status === 'content-ready' && ['LF1', 'WISO', 'PM', 'LF2', 'LF3'].includes(item.fieldId)).map(item => ({ ...JSON.parse(read(`../../content/learning-journey/${item.contentFile}`)), track: 'FIAE', planVersion: plan.version }));
  assert.equal(all.length, 39);
  const target = all.find(item => item.id === NETWORK_TOPIC);
  const records = parseCsv(read('../../content/learning-journey/questions/common-lf3-diagnosis.v1.csv')).records;
  const environment = multiTopicStorage(); const store = createJourneyStore({ ...environment, native: null });
  for (const item of all) await store.save(createJourneyState(item), null, item);
  const others = all.filter(item => item.id !== target.id);
  const originals = others.map(item => store.load(item).raw);
  let state = store.load(target).state;
  const act = action => { state = reduceJourney(state, action, target); };
  assert.throws(() => act({ type: 'network-action', action: { type: 'test' } }), { code: 'INVALID_ACTION' });
  target.blocks.forEach(() => act({ type: 'read-block' }));
  for (const questionId of target.quiz.questionIds) {
    const question = records.find(item => item.id === questionId); const mapping = target.questionLinks.find(item => item.questionId === questionId);
    act({ type: 'select-answer', questionId, answer: question.antwort });
    act({ type: 'quiz-feedback', feedback: { questionId, answer: question.antwort, correct: true, expected: question.antwort, explanation: question.erklaerung, blockIds: mapping.blockIds, objectiveIds: mapping.objectiveIds } });
    act({ type: 'next-quiz' });
  }
  act({ type: 'reflection-reveal' }); act({ type: 'reflection-done' }); act({ type: 'reflection-reveal' });
  assert.throws(() => act({ type: 'reflection-done', practiceConfirmed: true }), /Netzwerklabor/);
  for (let i = 0; i < 3; i++) {
    act({ type: 'network-action', action: { type: 'test' } });
    for (const [field, value] of Object.entries({ linked: true, ip: '192.0.2.25', prefix: '24', gateway: '192.0.2.1', dns: '192.0.2.53', diagnosis: ['link', 'address', 'dns'][i] })) act({ type: 'network-action', action: { type: 'configure', field, value } });
    assert.throws(() => act({ type: 'network-action', action: { type: 'finish' } }));
    act({ type: 'network-action', action: { type: 'test' } });
    act({ type: 'network-action', action: { type: 'finish' } });
    if (i < 2) assert.throws(() => act({ type: 'reflection-done', practiceConfirmed: true }), /Netzwerklabor/);
  }
  assert.throws(() => act({ type: 'reflection-done', practiceConfirmed: false }), { code: 'INVALID_ACTION' });
  state = await store.save(state, 1, target);
  const restored = parseJourneyBackup(exportJourney(state, target), target);
  assert.deepEqual(restored.network, state.network);
  const tooEarly = { ...createJourneyState(target), network: structuredClone(state.network) };
  assert.throws(() => validateJourneyState(tooEarly, target), /erste abgeschlossene Selbstreflexion/);
  assert.throws(() => parseJourneyBackup(JSON.stringify({ format: 'azubiprep-journey', version: 1, state: tooEarly }), target), /erste abgeschlossene Selbstreflexion/);
  const reopened = createJourneyStore({ ...environment, native: null });
  state = await reopened.replace(restored, reopened.load(target).raw, target);
  act({ type: 'reflection-done', practiceConfirmed: true });
  assert.equal(state.index, 2);
  assert.equal(networkPassed(parseJourneyBackup(exportJourney(state, target), target).network), true);
  act({ type: 'previous' });
  assert.throws(() => act({ type: 'network-action', action: { type: 'configure', field: 'ip', value: '192.0.2.27' } }), /Bestätigung gesperrt/);
  const corrupted = structuredClone(state.network); corrupted.cases[1].done = false;
  for (const network of [undefined, createNetwork(), corrupted]) {
    const invalid = { ...state, network }; if (network === undefined) delete invalid.network;
    assert.throws(() => validateJourneyState(invalid, target), { code: 'INVALID_STATE' });
  }
  assert.throws(() => validateJourneyState({ ...createJourneyState(all[0]), network: createNetwork() }, all[0]), { code: 'INVALID_STATE' });
  assert.deepEqual(others.map(item => store.load(item).raw), originals);
  assert.equal(new Set(all.map(item => journeyStorageKey(item.id))).size, 39);
});

test('Praktische Präsentation verlangt bewusste Bestätigung und erhält danach den bearbeiteten Schritt', () => {
  const target = lf1Topic('presentation');
  const records = parseCsv(read('../../content/learning-journey/questions/common-lf1-presentation.v1.csv')).records;
  let state = createJourneyState(target);
  const act = action => { state = reduceJourney(state, action, target); };
  target.blocks.forEach(() => act({ type: 'read-block' }));
  for (const questionId of target.quiz.questionIds) {
    const question = records.find(item => item.id === questionId);
    const mapping = target.questionLinks.find(item => item.questionId === questionId);
    act({ type: 'select-answer', questionId, answer: question.antwort });
    act({ type: 'quiz-feedback', feedback: { questionId, answer: question.antwort, correct: true, expected: question.antwort, explanation: question.erklaerung, blockIds: mapping.blockIds, objectiveIds: mapping.objectiveIds } });
    act({ type: 'next-quiz' });
  }
  act({ type: 'reflection-reveal' }); act({ type: 'reflection-done' });
  const practiceId = target.interview[1].id;
  assert.ok(target.interview[1].practice);
  act({ type: 'reflection-reveal' });
  for (const confirmation of [undefined, false, 1, 'true']) {
    assert.throws(() => reduceJourney(state, { type: 'reflection-done', practiceConfirmed: confirmation }, target), { code: 'INVALID_ACTION' });
    assert.equal(state.reflection.done.includes(practiceId), false);
  }
  act({ type: 'reflection-done', practiceConfirmed: true });
  const restored = parseJourneyBackup(exportJourney(state, target), target);
  assert.equal(restored.index, 2);
  assert.equal(restored.reflection.done.includes(practiceId), true);
  assert.equal(restored.phase, 'reflection');
});

test('one store resumes two topics independently and keeps the original Web key and bytes unchanged', async () => {
  const goals = goalsTopic();
  const environment = multiTopicStorage();
  const first = createJourneyStore({ ...environment, native: null });
  assert.equal(journeyStorageKey(topic.id), KEY);
  assert.equal(KEY, 'azubiprep.journey.fiae.v1');
  assert.notEqual(journeyStorageKey(goals.id), KEY);
  const original = await first.save(answeredExam(7), null, topic);
  const originalRaw = environment.storage.getItem(KEY);
  const second = await first.save(reduceJourney(createJourneyState(goals), { type: 'read-block' }, goals), null, goals);
  assert.equal(environment.storage.getItem(KEY), originalRaw);
  assert.deepEqual(first.load(topic).state, original);
  const reopened = createJourneyStore({ ...environment, native: null });
  assert.deepEqual(reopened.load(goals).state, second);
  assert.deepEqual(reopened.load(topic).state, original);
  assert.equal(second.revision, 1);
  assert.deepEqual(environment.lockNames, [KEY, journeyStorageKey(goals.id)]);
});

test('topic conflicts and backup replacement affect exactly their own storage and lock', async () => {
  const goals = goalsTopic();
  const environment = multiTopicStorage();
  const first = createJourneyStore({ ...environment, native: null });
  const second = createJourneyStore({ ...environment, native: null });
  const [roleState, goalsState] = await Promise.all([
    first.save(fresh(), null, topic), first.save(createJourneyState(goals), null, goals),
  ]);
  const roleRaw = first.load(topic).raw;
  const goalsRaw = first.load(goals).raw;
  const nextGoals = reduceJourney(goalsState, { type: 'read-block' }, goals);
  const raced = await Promise.allSettled([
    first.save(nextGoals, goalsState.revision, goals),
    second.save(nextGoals, goalsState.revision, goals),
  ]);
  assert.equal(raced.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal(raced.find(result => result.status === 'rejected').reason.code, 'CONFLICT');
  assert.equal(first.load(topic).raw, roleRaw);
  await assert.rejects(first.replace(goalsState, goalsRaw, goals), { code: 'CONFLICT' });
  assert.throws(() => parseJourneyBackup(exportJourney(roleState, topic), goals), { code: 'INVALID_STATE' });
  assert.throws(() => parseJourneyBackup(exportJourney(goalsState, goals), topic), { code: 'INVALID_STATE' });
  await assert.rejects(first.replace(roleState, first.load(goals).raw, goals), { code: 'INVALID_STATE' });
  await assert.rejects(first.save(goalsState, roleState.revision, topic), { code: 'INVALID_STATE' });
  const replacement = parseJourneyBackup(exportJourney(goalsState, goals), goals);
  const imported = await first.replace(replacement, first.load(goals).raw, goals);
  assert.equal(imported.revision, 3);
  assert.equal(first.load(topic).raw, roleRaw);
});

test('unknown topic IDs and corrupt data cannot write another topic', async () => {
  const goals = goalsTopic();
  const environment = multiTopicStorage();
  const store = createJourneyStore({ ...environment, native: null });
  const saved = await store.save(fresh(), null, topic);
  const roleRaw = store.load(topic).raw;
  for (const id of ['foreign', '__proto__', 'constructor', '../common-lf1-role', '', undefined]) {
    assert.throws(() => journeyStorageKey(id), { code: 'INVALID_STATE' });
    const unknown = { ...goals, id };
    assert.equal(store.load(unknown).error.code, 'INVALID_STATE');
    await assert.rejects(store.save({ ...saved, topicId: id }, null, unknown), { code: 'INVALID_STATE' });
  }
  for (const corrupt of ['{broken', JSON.stringify({ ...createJourneyState(goals), schemaVersion: 99 }), roleRaw]) {
    environment.storage.setItem(journeyStorageKey(goals.id), corrupt);
    assert.ok(store.load(goals).error);
    await assert.rejects(store.save(createJourneyState(goals), null, goals));
    assert.equal(store.load(goals).raw, corrupt);
    assert.equal(store.load(topic).raw, roleRaw);
  }
  const corruptRole = '{preserve old first topic';
  environment.storage.setItem(KEY, corruptRole);
  const imported = await store.replace(createJourneyState(goals), store.load(goals).raw, goals);
  assert.equal(imported.topicId, goals.id);
  assert.equal(environment.storage.getItem(KEY), corruptRole);
});

test('guided journey keeps fixed option permutations and completes exactly one attempt', () => {
  const initial = fresh();
  assert.equal(initial.phase, 'theory');
  assert.equal(initial.revision, 0);
  assert.equal(initial.createdAt, NOW);
  for (const order of Object.values(initial.optionOrder)) assert.deepEqual([...order].sort(), ['a', 'b', 'c', 'd']);
  assert.equal(Object.keys(initial.optionOrder).length, 14);
  const progressed = step(initial, { type: 'read-block' });
  assert.deepEqual(progressed.optionOrder, initial.optionOrder);
  assert.equal(initial.index, 0, 'reducer does not mutate prior snapshots');
  const state = answeredExam();
  const result = finish(state);
  assert.equal(result.phase, 'result');
  assert.equal(result.exam.result.passed, true);
  assert.equal(result.history.length, 1);
  assert.equal(result.bestResult.correct, 7);
  assert.equal(result.bestResult.percent, 87.5);
  assert.equal(step(result, { type: 'exam-result', result: resultFor(state), completedAt: 'later ignored' }), result);
  assert.deepEqual(parseJourneyBackup(exportJourney(result, topic), topic), result);
  assert.equal(finish(answeredExam(6)).exam.result.passed, false);
});

test('phase order, current question, explicit comparison and local note limits are enforced', () => {
  let state = fresh();
  assert.throws(() => step(state, { type: 'start-exam', attemptId: uuid() }), { code: 'INVALID_ACTION' });
  assert.throws(() => step(state, { type: 'next-quiz' }), { code: 'INVALID_ACTION' });
  for (let i = 0; i < 4; i += 1) state = step(state, { type: 'read-block' });
  assert.throws(() => step(state, { type: 'next-quiz' }), { code: 'INVALID_ACTION' });
  assert.throws(() => step(state, { type: 'select-answer', questionId: topic.quiz.questionIds[1], answer: 'a' }), { code: 'INVALID_ACTION' });
  for (const questionId of topic.quiz.questionIds) {
    state = step(state, { type: 'select-answer', questionId, answer: 'a' });
    assert.throws(() => step(state, { type: 'quiz-feedback', feedback: feedback(questionId, 'b') }), { code: 'INVALID_STATE' });
    state = step(state, { type: 'quiz-feedback', feedback: feedback(questionId, 'a') });
    assert.throws(() => step(state, { type: 'select-answer', questionId, answer: 'b' }), { code: 'INVALID_ACTION' });
    state = step(state, { type: 'next-quiz' });
  }
  assert.throws(() => step(state, { type: 'reflection-done' }), { code: 'INVALID_ACTION' });
  assert.throws(() => step(state, { type: 'reflection-draft', text: 'x'.repeat(2001) }), { code: 'INVALID_ACTION' });
  state = step(state, { type: 'reflection-draft', text: 'x'.repeat(2000) });
  assert.equal(state.reflection.drafts[topic.interview[0].id].length, 2000);
  for (let i = 0; i < 3; i += 1) {
    state = step(state, { type: 'reflection-reveal' });
    state = step(state, { type: 'reflection-done' });
  }
  assert.throws(() => step(state, { type: 'card-rate', rating: 'known' }), { code: 'INVALID_ACTION' });
});

test('previous preserves selected answers, drafts and the current attempt', () => {
  let state = answeredExam();
  const before = clone(state);
  state = step(state, { type: 'previous' });
  assert.equal(state.index, 6);
  assert.deepEqual(state.exam, before.exam);
  assert.deepEqual(state.reflection, before.reflection);
  state = step(state, { type: 'select-answer', questionId: topic.exam.questionIds[6], answer: 'd' });
  assert.equal(state.exam.answers[topic.exam.questionIds[6]], 'd');
  assert.equal(state.exam.attemptId, before.exam.attemptId);
  assert.equal(step(fresh(), { type: 'previous' }).phase, 'theory');
});

test('incomplete and inconsistent results cannot create a completed attempt', () => {
  const state = answeredExam();
  const incomplete = step(examIntro(), { type: 'start-exam', attemptId: uuid() });
  assert.throws(() => step(incomplete, { type: 'exam-result', result: resultFor(state), completedAt: NOW }), { code: 'INVALID_STATE' });
  const changes = [
    (result) => { result.attemptId = uuid(2); },
    (result) => { result.results.pop(); },
    (result) => { result.results[0] = result.results[1]; },
    (result) => { result.results[0].questionId = 'foreign'; },
    (result) => { result.results[0].answer = 'z'; },
    (result) => { result.results[0].expected = result.results[0].expected === 'a' ? 'b' : 'a'; },
    (result) => { result.results[0].correct = !result.results[0].correct; },
    (result) => { result.correct = 8; },
    (result) => { result.percent = 88; },
    (result) => { result.passed = false; },
    (result) => { result.results[0].objectiveIds = [topic.objectives[2].id]; },
    (result) => { result.results[0].blockIds = []; },
    (result) => { result.objectives[0].percent += 1; },
    (result) => { result.objectives[0].correct = 0; },
    (result) => { result.objectives.pop(); },
    (result) => { result.objectives[0].aiJudgement = 'passed'; },
  ];
  for (const change of changes) {
    const result = resultFor(state);
    change(result);
    assert.throws(() => step(state, { type: 'exam-result', result, completedAt: NOW }), { code: 'INVALID_STATE' });
    assert.equal(state.history.length, 0);
  }
  const oldVersion = resultFor(state);
  oldVersion.version = '9.0.0';
  assert.throws(() => step(state, { type: 'exam-result', result: oldVersion, completedAt: NOW }), { code: 'CONTENT_VERSION_MISMATCH' });
});

test('history is bounded; repeating keeps the best attempt even when it leaves the recent ten', () => {
  let state = finish(answeredExam(8));
  const best = clone(state.bestResult);
  for (let i = 2; i <= 12; i += 1) {
    state = step(state, { type: 'repeat-exam' });
    assert.equal(state.phase, 'exam-intro');
    assert.equal(state.exam.attemptId, null);
    state = finish(answeredExam(6, i, state));
  }
  assert.equal(state.history.length, 10);
  assert.equal(state.history[0].attemptId, uuid(3));
  assert.deepEqual(state.bestResult, best);
  assert.ok(!state.history.some(({ attemptId }) => attemptId === best.attemptId));
  const ready = step(state, { type: 'repeat-exam' });
  assert.throws(() => step(ready, { type: 'start-exam', attemptId: uuid(12) }), { code: 'INVALID_ACTION' });
  assert.throws(() => step(ready, { type: 'start-exam', attemptId: uuid(1) }), { code: 'INVALID_ACTION' });
});

test('Lernzielergebnisse überleben eine offene Wiederholung samt Export und Neuladen', () => {
  const completed = finish(answeredExam(7));
  const expected = completed.exam.result.objectives.map(({ id, total, correct }) => ({ id, total, correct }));
  completed.exam.result.results.reverse();
  const repeat = step(completed, { type: 'repeat-exam' });
  const restored = parseJourneyBackup(exportJourney(repeat, topic), topic);
  assert.deepEqual(latestObjectiveScores(restored, topic), expected);
  const invalid = { ...restored, lastExamMarks: Array(8).fill(false) };
  assert.throws(() => validateJourneyState(invalid, topic), /Lernzielübersicht/);
  const oldRepeat = structuredClone(repeat);
  delete oldRepeat.lastExamMarks;
  assert.deepEqual(latestObjectiveScores(validateJourneyState(oldRepeat, topic), topic), []);
  const newer = finish(answeredExam(5, 2, restored));
  assert.equal(Object.hasOwn(newer, 'lastExamMarks'), false);
  assert.deepEqual(latestObjectiveScores(newer, topic), newer.exam.result.objectives);
});

test('Ein erfundener Bestwert außerhalb des ungekürzten Verlaufs gibt keine Etappe frei', () => {
  let state = finish(answeredExam(2));
  for (let attempt = 1; attempt <= 9; attempt += 1) {
    const inconsistent = clone(state);
    inconsistent.bestResult = { ...inconsistent.bestResult, attemptId: uuid(99), correct: 8, percent: 100, passed: true };
    assert.throws(() => validateJourneyState(inconsistent, topic), /fehlt im noch vollständigen Verlauf/);
    assert.equal(validateJourneyState(state, topic).bestResult.passed, false);
    if (attempt < 9) state = finish(answeredExam(2, attempt + 1, step(state, { type: 'repeat-exam' })));
  }
});

test('strict snapshots reject unknown private fields, impossible phases and damaged option orders', () => {
  const base = finish(answeredExam());
  const changes = [
    (state) => { state.rag = { documents: ['private'] }; },
    (state) => { state.quiz.aiConversation = []; },
    (state) => { state.reflection.model = 'free-form'; },
    (state) => { state.cards.scheduler = {}; },
    (state) => { state.exam.privatePrompt = 'private'; },
    (state) => { state.history[0].raw = {}; },
    (state) => { state.bestResult.summary = 'custom'; },
    (state) => { state.exam.result.results[0].sourceDocument = {}; },
    (state) => { state.reflection.drafts[topic.interview[0].id] = { text: 'nested' }; },
    (state) => { state.reflection.drafts.foreign = 'unknown'; },
    (state) => { state.optionOrder[topic.quiz.questionIds[0]] = ['a', 'a', 'c', 'd']; },
    (state) => { state.index = 1; },
    (state) => { state.completedBlocks.pop(); },
    (state) => { state.quiz.feedback = {}; },
    (state) => { state.reflection.done = []; },
    (state) => { state.cards.ratings = {}; },
    (state) => { state.revision = -1; },
    (state) => { state.history.push(clone(state.history[0])); },
    (state) => { state.history.push({ ...state.history[0], attemptId: uuid(2) }); },
  ];
  for (const change of changes) {
    const state = clone(base);
    change(state);
    assert.throws(() => validateJourneyState(state, topic), { code: 'INVALID_STATE' });
  }
  const skipped = fresh();
  skipped.phase = 'exam-intro';
  assert.throws(() => validateJourneyState(skipped, topic), { code: 'INVALID_STATE' });
  const newer = { ...fresh(), schemaVersion: 2, futureField: true };
  assert.throws(() => validateJourneyState(newer, topic), { code: 'UNSUPPORTED_VERSION' });
  assert.throws(() => validateJourneyState({ ...fresh(), topicVersion: '2.0.0' }, topic), { code: 'CONTENT_VERSION_MISMATCH' });
});

test('backups are inert strict JSON and limited to 128 KiB of UTF-8, including the envelope', () => {
  const text = exportJourney(examIntro(), topic);
  assert.deepEqual(parseJourneyBackup(text, topic), JSON.parse(text).state);
  assert.throws(() => parseJourneyBackup(text.replace('"version":1', '"version":2'), topic), { code: 'UNSUPPORTED_VERSION' });
  assert.throws(() => parseJourneyBackup(JSON.stringify({ ...JSON.parse(text), rag: {} }), topic), { code: 'INVALID_STATE' });
  assert.throws(() => parseJourneyBackup('globalThis.executed = true;', topic), { code: 'INVALID_STATE' });
  assert.throws(() => parseJourneyBackup('{"format":"azubiprep-journey","version":1,"state":{"__proto__":{"polluted":true}}}', topic));
  assert.equal({}.polluted, undefined);
  const exact = text + ' '.repeat(128 * 1024 - Buffer.byteLength(text));
  assert.ok(parseJourneyBackup(exact, topic));
  assert.throws(() => parseJourneyBackup(exact + ' ', topic), { code: 'TOO_LARGE' });
  assert.throws(() => parseJourneyBackup('💾'.repeat(40000), topic), { code: 'TOO_LARGE' });
});

test('save precedes successful reload, uses increasing revisions and preserves raw invalid/newer data', async () => {
  const storage = memoryStorage();
  const locks = serialLocks();
  const store = createJourneyStore({ storage, locks, native: null });
  assert.deepEqual(store.load(topic), { state: null, raw: null, error: null });
  const first = await store.save(fresh(), null, topic);
  assert.equal(first.revision, 1);
  const second = await store.save(step(first, { type: 'read-block' }), first.revision, topic);
  assert.equal(second.revision, 2);
  assert.deepEqual(store.load(topic).state, second);
  assert.equal(locks.calls, 2);
  for (const raw of ['broken JSON', JSON.stringify({ ...fresh(), schemaVersion: 9 }), JSON.stringify({ ...fresh(), topicVersion: '9.0.0' })]) {
    storage.raw = raw;
    const loaded = store.load(topic);
    assert.equal(loaded.state, null);
    assert.equal(loaded.raw, raw);
    assert.ok(loaded.error.code);
    await assert.rejects(store.save(fresh(), 0, topic));
    assert.equal(storage.raw, raw, 'neither loading nor ordinary saving discards an invalid old state');
  }
});

test('two tabs serialize compare-and-swap; stale revision cannot overwrite the winner', async () => {
  const storage = memoryStorage();
  const locks = serialLocks();
  const tab1 = createJourneyStore({ storage, locks, native: null });
  const tab2 = createJourneyStore({ storage, locks, native: null });
  const initial = await tab1.save(fresh(), 0, topic);
  const changed = step(initial, { type: 'read-block' });
  const results = await Promise.allSettled([tab1.save(changed, 1, topic), tab2.save(changed, 1, topic)]);
  assert.equal(results.filter(({ status }) => status === 'fulfilled').length, 1);
  assert.equal(results.find(({ status }) => status === 'rejected').reason.code, 'CONFLICT');
  assert.equal(tab1.load(topic).state.revision, 2);
  assert.equal(storage.writes, 2);
});

test('quota and unavailable locking leave the previous saved state intact and the draft reusable', async () => {
  const storage = memoryStorage();
  const store = createJourneyStore({ storage, locks: serialLocks(), native: null });
  const initial = await store.save(fresh(), null, topic);
  const previousRaw = storage.raw;
  const draft = step(initial, { type: 'read-block' });
  storage.quota = true;
  await assert.rejects(store.save(draft, initial.revision, topic), { code: 'STORAGE_WRITE_FAILED' });
  assert.equal(storage.raw, previousRaw);
  assert.equal(draft.completedBlocks.length, 1);
  const unsupported = createJourneyStore({ storage, locks: null, native: null });
  await assert.rejects(unsupported.save(draft, 1, topic), { code: 'LOCKS_UNAVAILABLE' });
  assert.equal(storage.raw, previousRaw);
  storage.quota = false;
  assert.equal((await store.save(draft, 1, topic)).revision, 2);
  const denied = createJourneyStore({ storage: { getItem() { throw new Error('denied'); } }, locks: serialLocks(), native: null });
  assert.equal(denied.load(topic).error.code, 'STORAGE_UNAVAILABLE');
});

test('confirmed replacement requires the exact preview raw and retains monotonic revisions', async () => {
  const oldRaw = JSON.stringify({ schemaVersion: 9, revision: 41, privateUnrecognizedField: 'kept until confirmed' });
  const storage = memoryStorage(oldRaw);
  const store = createJourneyStore({ storage, locks: serialLocks(), native: null });
  await assert.rejects(store.replace(fresh(), 'stale preview', topic), { code: 'CONFLICT' });
  assert.equal(storage.raw, oldRaw);
  const replaced = await store.replace(fresh(), oldRaw, topic);
  assert.equal(replaced.revision, 42);
  assert.deepEqual(store.load(topic).state, replaced);
  storage.raw = '{invalid';
  assert.equal((await store.replace(fresh(), storage.raw, topic)).revision, 1);
});

test('write confirmation catches a non-cooperating overwrite instead of reporting success', async () => {
  const storage = memoryStorage();
  storage.setItem = function setItem() { this.raw = 'external write'; };
  const store = createJourneyStore({ storage, locks: serialLocks(), native: null });
  await assert.rejects(store.save(fresh(), null, topic), { code: 'CONFLICT' });
  assert.equal(storage.raw, 'external write');
});

test('native adapter uses fresh raw CAS, maps conflicts and does not require Web Locks', async () => {
  let raw = null;
  let writes = 0;
  const native = {
    async load() { return raw; },
    async save({ raw: candidate, expectedRaw }) {
      if (raw !== expectedRaw) throw new Error('CONFLICT: stale window');
      raw = candidate;
      writes += 1;
      return raw;
    },
  };
  const store = createJourneyStore({ native, storage: null, locks: null });
  assert.deepEqual(await store.load(topic), { state: null, raw: null, error: null });
  const initial = await store.save(fresh(), null, topic);
  const next = step(initial, { type: 'read-block' });
  const race = await Promise.allSettled([store.save(next, 1, topic), store.save(next, 1, topic)]);
  assert.equal(race.filter(({ status }) => status === 'fulfilled').length, 1);
  assert.equal(race.find(({ status }) => status === 'rejected').reason.code, 'CONFLICT');
  assert.equal(writes, 2);
  assert.equal((await store.load(topic)).state.revision, 2);
  raw = JSON.stringify({ schemaVersion: 8, revision: 5 });
  const loaded = await store.load(topic);
  assert.equal(loaded.error.code, 'UNSUPPORTED_VERSION');
  assert.equal(loaded.raw, raw);
  assert.equal((await store.replace(fresh(), loaded.raw, topic)).revision, 6);
});

test('real desktop profile store resumes through a new adapter and accepts state-checked backups', async () => {
  const require = createRequire(import.meta.url);
  const { createJourneyStore: desktopStore } = require('../../desktop/journey-storage.cjs');
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'azubiprep-journey-state-'));
  try {
    const first = createJourneyStore({ native: desktopStore(profile), locks: null, storage: null });
    const saved = await first.save(answeredExam(7), null, topic);
    const roleRaw = (await first.load(topic)).raw;
    const goals = goalsTopic();
    const goalsSaved = await first.save(reduceJourney(createJourneyState(goals), { type: 'read-block' }, goals), null, goals);
    assert.equal((await first.load(topic)).raw, roleRaw);
    const reopened = createJourneyStore({ native: desktopStore(profile), locks: null, storage: null });
    const resumed = await reopened.load(topic);
    assert.deepEqual(resumed.state, saved);
    assert.deepEqual((await reopened.load(goals)).state, goalsSaved);
    assert.equal(resumed.state.exam.attemptId, saved.exam.attemptId);
    const completed = await reopened.save(finish(resumed.state), saved.revision, topic);
    const backup = parseJourneyBackup(exportJourney(completed, topic), topic);
    const imported = await reopened.replace(backup, (await reopened.load(topic)).raw, topic);
    assert.equal(imported.revision, 3);
    assert.equal(imported.history.length, 1);
    assert.deepEqual((await reopened.load(goals)).state, goalsSaved);
  } finally {
    // This directory was created above solely for this test; no user profile is read.
    assert.equal(path.dirname(path.resolve(profile)), path.resolve(os.tmpdir()));
    assert.ok(path.basename(profile).startsWith('azubiprep-journey-state-'));
    fs.rmSync(profile, { recursive: true, force: true });
  }
});
