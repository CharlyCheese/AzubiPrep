import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadJourney } from '../../backend/src/journey.js';
import { parseCsv } from '../../backend/src/csv.js';
import { createJourneyState, reduceJourney, validateJourneyState, exportJourney, parseJourneyBackup, journeyStorageKey } from '../../frontend/src/store/journeyStore.js';
import { LAB_TOPICS, LAB_STEPS, createLab, validLab, labPassed, updateLab, prepareReport, receiveReport, replayReports, reportTestsPassed, probeService } from '../../frontend/src/utils/journeyLabs.js';

const CONTROL = 'function control(t, c) { if (c !== true || !Number.isFinite(t) || t < -20 || t > 80) return "fault"; return t >= 30 ? "on" : "off"; }';
const payload = (total = 30) => JSON.stringify({ batchId: 'demo-01', rows: [{ region: 'Nord', total }, { region: 'Süd', total: 5 }] });
function finish(id) {
  let v = createLab(id); const act = action => { v = updateLab(id, v, action); };
  for (let stage = 0; stage < 3; stage++) {
    for (const f of LAB_STEPS[id][stage].fields) act({ type: 'answer', field: f.key, value: String(f.expected) });
    if (stage !== 1) act({ type: 'check' });
    else if (id === LAB_TOPICS[0]) { act({ type: 'code', value: CONTROL }); act({ type: 'code-result', source: CONTROL, passed: true }); }
    else if (id === LAB_TOPICS[1]) {
      act({ type: 'send' });
      act({ type: 'request-edit', field: 'payload', value: payload() }); act({ type: 'send' }); act({ type: 'send' });
      act({ type: 'request-edit', field: 'payload', value: payload(31) }); act({ type: 'send' });
    } else for (let i = 0; i < 3; i++) {
      act({ type: 'probe' });
      for (const [field, value] of Object.entries({ dns: '198.51.100.10', running: true, policy: 'staff', diagnosis: ['dns', 'service', 'policy'][i] })) act({ type: 'configure', field, value });
      act({ type: 'probe' }); act({ type: 'finish-case' });
    }
    act({ type: 'next' });
  }
  return v;
}
for (const id of LAB_TOPICS) test(`${id}: Reihenfolge, Fehler, erneute Prüfung und abgeschlossenes Protokoll`, () => {
  const initial = createLab(id); assert.equal(validLab(id, initial), true);
  assert.throws(() => updateLab(id, initial, { type: 'next' }));
  const checked = updateLab(id, initial, { type: 'check' }); assert.throws(() => updateLab(id, checked, { type: 'next' }));
  const f = LAB_STEPS[id][0].fields[0]; const changed = updateLab(id, checked, { type: 'answer', field: f.key, value: f.expected }); assert.equal(changed.checked, false);
  const done = finish(id); assert.equal(labPassed(id, done), true);
  assert.throws(() => updateLab(id, done, { type: 'check' }));
  for (const invalid of [{ ...initial, stage: 1 }, { ...initial, stage: -1 }, { ...done, checked: false }, { ...done, answers: [] }, { ...done, extra: true }]) assert.equal(validLab(id, invalid), false);
  assert.equal(validLab('common-lf1-role', done), false);
});
test('Energieeinheiten und Dezimalkomma werden fachlich geprüft', () => {
  let v = createLab(LAB_TOPICS[0]); for (const f of LAB_STEPS[LAB_TOPICS[0]][0].fields) v = updateLab(LAB_TOPICS[0], v, { type: 'answer', field: f.key, value: String(f.expected).replace('.', ',') });
  v = updateLab(LAB_TOPICS[0], v, { type: 'check' }); assert.equal(updateLab(LAB_TOPICS[0], v, { type: 'next' }).stage, 1);
  assert.throws(() => updateLab(LAB_TOPICS[0], v, { type: 'answer', field: 'power', value: 'process.exit()' }));
});
test('Bereinigung und Join liefern nachweisbar drei Aufträge, zwei Regionen und 35 Euro', () => {
  const a = { mapping: 'fields', duplicates: 'once', missing: 'quarantine', join: 'id', group: 'region' }; const report = prepareReport(a);
  assert.deepEqual([report.input, report.duplicates, report.quarantined, report.accepted.length, report.joined.length], [5, 1, 1, 3, 3]);
  assert.deepEqual(report.rows, [{ region: 'Nord', total: 30 }, { region: 'Süd', total: 5 }]);
  assert.equal(prepareReport({ ...a, duplicates: 'twice' }).rows[0].total, 50);
  assert.equal(prepareReport({ ...a, missing: 'guess' }).rows[0].total, 37);
  assert.equal(prepareReport({ ...a, join: 'amount' }).rows.length, 0);
  assert.equal(prepareReport({ ...a, mapping: 'swapped' }).rows.length, 0);
});
test('Schnittstelle: atomare Validierung, Berechtigung, semantische Wiederholung und Konflikt', () => {
  const request = (p, patch = {}) => ({ payload: p, auth: 'allowed', transport: 'https', ...patch });
  for (const [input, expected] of [[request('{'), 400], [request(payload(), { auth: 'denied' }), 401], [request(payload(), { transport: 'http' }), 426], [request(payload('30')), 422], [request(payload(-1)), 422], [request(payload(1.5)), 422], [request(payload(1000001)), 422]]) {
    const result = receiveReport(null, input); assert.equal(result.status, expected); assert.equal(result.receiver, null);
  }
  const valid = receiveReport(null, request(payload())); assert.equal(valid.status, 201);
  const reversed = JSON.stringify({ rows: [{ total: 5, region: 'Süd' }, { total: 30, region: 'Nord' }], batchId: 'demo-01' });
  assert.equal(receiveReport(valid.receiver, request(reversed)).status, 200);
  assert.equal(receiveReport(valid.receiver, request(payload(31))).status, 409);
  assert.equal(receiveReport(valid.receiver, request(payload(31))).receiver, valid.receiver);
  for (const malformed of [{ batchId: 'demo-01', rows: [{ region: 'Nord', total: 30 }, { region: 'Nord', total: 5 }] }, { batchId: '../secret', rows: valid.receiver.rows }, { ...valid.receiver, extra: true }, { batchId: 'demo-01', rows: [{ region: 'Nord', total: 30 }, { region: 'Süd', total: '5' }] }]) assert.equal(receiveReport(null, request(JSON.stringify(malformed))).status, 422);
  const sequence = [request(payload('30')), request(payload()), request(reversed), request(payload(31))];
  assert.equal(reportTestsPassed(sequence), true); assert.equal(reportTestsPassed(sequence.slice(1)), false);
  const otherBatch = request(payload(31).replace('demo-01', 'demo-02'));
  assert.equal(reportTestsPassed([...sequence.slice(0, 3), otherBatch]), false);
  assert.equal(reportTestsPassed([sequence[0], sequence[1], sequence[3], sequence[2], otherBatch]), false);
  assert.deepEqual(replayReports(sequence).receiver, valid.receiver);
});
test('Netzprobe fordert Mitarbeitererfolg UND Gastablehnung statt Ausfall für beide', () => {
  const good = finish(LAB_TOPICS[2]).cases[0]; assert.equal(probeService(good).passed, true);
  for (const patch of [{ running: false }, { policy: 'all' }, { policy: 'none' }, { dns: '198.51.100.11' }, { address: '198.51.100.40' }, { prefix: '26' }, { port: '80' }, { gateway: '192.0.2.1' }]) assert.equal(probeService({ ...good, ...patch }).passed, false);
  const initial = createLab(LAB_TOPICS[2]); initial.cases[1].observed = true; assert.equal(validLab(LAB_TOPICS[2], initial), false);
});
test('Quelltextprüfung ist gebunden und Anfragen sind begrenzt', () => {
  const done = finish(LAB_TOPICS[0]); assert.equal(validLab(LAB_TOPICS[0], { ...done, source: 'function control() { return "on"; }' }), false);
  assert.equal(validLab(LAB_TOPICS[0], { ...done, source: 'x'.repeat(4097) }), false);
  const data = finish(LAB_TOPICS[1]); assert.equal(validLab(LAB_TOPICS[1], { ...data, requests: Array(17).fill(data.requests[0]) }), false);
  assert.equal(validLab(LAB_TOPICS[1], { ...data, requests: data.requests.map(r => ({ ...r, auth: 'denied' })) }), false);
});
const content = fileURLToPath(new URL('../../content/', import.meta.url));
for (const id of LAB_TOPICS) test(`${id}: Phasen-/Importsperre, Bestätigung und Sicherung`, () => {
  const service = loadJourney(content); const topic = service.getTopic(id); let state = createJourneyState(topic);
  const act = a => { state = reduceJourney(state, a, topic); }; const done = finish(id);
  assert.throws(() => act({ type: 'lab-action', action: { type: 'check' } }));
  assert.throws(() => validateJourneyState({ ...state, lab: done }, topic), /erste abgeschlossene/);
  topic.blocks.forEach(() => act({ type: 'read-block' }));
  const questions = parseCsv(fs.readFileSync(content + `learning-journey/questions/${id}.v1.csv`, 'utf8')).records;
  for (const questionId of topic.quiz.questionIds) { const answer = questions.find(q => q.id === questionId).antwort; act({ type: 'select-answer', questionId, answer }); act({ type: 'quiz-feedback', feedback: service.check(id, { version: topic.version, questionId, answer }) }); act({ type: 'next-quiz' }); }
  act({ type: 'reflection-reveal' }); act({ type: 'reflection-done' }); act({ type: 'reflection-reveal' });
  assert.throws(() => act({ type: 'reflection-done', practiceConfirmed: true }));
  state = validateJourneyState({ ...state, lab: done }, topic);
  assert.deepEqual(parseJourneyBackup(exportJourney(state, topic), topic).lab, done);
  assert.throws(() => act({ type: 'reflection-done', practiceConfirmed: false }));
  act({ type: 'reflection-done', practiceConfirmed: true }); act({ type: 'previous' });
  assert.throws(() => act({ type: 'lab-action', action: { type: 'check' } }), /gesperrt/);
  assert.throws(() => validateJourneyState({ ...state, lab: createLab(id) }, topic));
});
test('94 Themenablagen sind getrennt und alle neuen Anfangsstände exportierbar', () => {
  const service = loadJourney(content); const topics = service.getSummary().readyTopics;
  assert.equal(topics.length, 94); assert.equal(new Set(topics.map(t => journeyStorageKey(t.id))).size, 94);
  for (const item of topics) { const topic = service.getTopic(item.id); const state = createJourneyState(topic); assert.equal(Object.hasOwn(state, 'lab'), LAB_TOPICS.includes(topic.id)); assert.deepEqual(parseJourneyBackup(exportJourney(state, topic), topic), state); }
});
