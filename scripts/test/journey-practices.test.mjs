import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadJourney } from '../../backend/src/journey.js';
import { parseCsv } from '../../backend/src/csv.js';
import fs from 'node:fs';
import { PRACTICE_TOPICS, createPractice, validPractice, practicePassed, updatePractice, practiceSteps, initialStock, stockBefore, applyDataCommand, dataCommand } from '../../frontend/src/utils/journeyPractices.js';
import { createJourneyState, reduceJourney, validateJourneyState, exportJourney, parseJourneyBackup, journeyStorageKey } from '../../frontend/src/store/journeyStore.js';

const dataId = PRACTICE_TOPICS[1];
const solution = 'function available(q, r) { if (!Number.isInteger(q) || !Number.isInteger(r) || q < 0 || r < 0 || q > 1000 || r > 1000) return null; return r <= q; }';
function finishPractice(id) {
  let value = createPractice(id);
  const act = action => { value = updatePractice(id, value, action); };
  for (const [index, step] of practiceSteps(id).entries()) {
    step.fields.forEach(field => act({ type: 'answer', field: field.key, value: field.expected }));
    if (id === dataId && index < 4) act({ type: 'preview' });
    if (id === dataId && index === 4) { act({ type: 'code', value: solution }); act({ type: 'code-result', source: solution, passed: true }); }
    else act({ type: 'check' });
    act({ type: 'next' });
  }
  return value;
}

for (const id of PRACTICE_TOPICS) {
  test(`${id}: falsche Auswahl, Korrektur, Reihenfolge und unveränderliches Protokoll`, () => {
    let value = createPractice(id); const act = action => { value = updatePractice(id, value, action); };
    assert.equal(validPractice(id, value), true); assert.equal(practicePassed(id, value), false);
    assert.throws(() => act({ type: 'next' }));
    if (id === dataId) { assert.throws(() => act({ type: 'check' })); act({ type: 'preview' }); }
    act({ type: 'check' }); assert.throws(() => act({ type: 'next' }));
    const field = practiceSteps(id)[0].fields[0];
    act({ type: 'answer', field: field.key, value: field.expected });
    assert.equal(value.checked, false); if (id === dataId) assert.equal(value.previewed, false);
    const completed = finishPractice(id);
    assert.equal(practicePassed(id, completed), true);
    assert.throws(() => updatePractice(id, completed, { type: 'answer', field: field.key, value: '' }));
    const skipped = createPractice(id); skipped.step = 1;
    assert.equal(validPractice(id, skipped), false);
    const future = createPractice(id); const nextField = practiceSteps(id)[1].fields[0]; future.answers[1][nextField.key] = nextField.expected;
    assert.equal(validPractice(id, future), false);
    for (const invalid of [{ ...completed, step: 99 }, { ...completed, injected: true }, { ...completed, checked: false }, { ...completed, answers: [] }, { ...completed, done: 'true' }]) assert.equal(validPractice(id, invalid), false);
    assert.equal(validPractice('common-lf1-role', completed), false);
  });
}

test('SQL-Modell führt Auswahl und drei gezielte Änderungen aus, prüft Schlüssel und begrenzt Fragmente', () => {
  const rows = initialStock();
  const query = { operation: 'select', target: 'low', sort: 'name' };
  assert.deepEqual(applyDataCommand(rows, 0, query).affected.map(row => row.name), ['Adapter', 'Maus']);
  assert.equal(dataCommand(0, query), 'SELECT id, name, quantity FROM stocks WHERE quantity < 3 ORDER BY name;');
  assert.equal(dataCommand(0, { ...query, sort: 'name; DROP TABLE stocks' }), null);
  assert.match(applyDataCommand(rows, 1, { operation: 'insert', id: '2', quantity: '5' }).error, /belegt/);
  const all = applyDataCommand(rows, 3, { operation: 'delete', target: 'all' });
  assert.equal(all.rows.length, 0); assert.equal(rows.length, 3); // Vorschau arbeitet auf einer Kopie.
  assert.deepEqual(stockBefore(finishPractice(dataId)), [{ id: 1, name: 'Kabel', quantity: 8 }, { id: 2, name: 'Maus', quantity: 6 }, { id: 4, name: 'Tastatur', quantity: 5 }]);
});

test('Codeänderungen verwerfen die Prüfung; verspätete Resultate und übergroßer Code werden abgewiesen', () => {
  const done = finishPractice(dataId); assert.equal(validPractice(dataId, { ...done, code: 'function available() { return true; }' }), false); let value = { ...done, done: false };
  value = updatePractice(dataId, value, { type: 'code', value: 'function available() { return false; }' });
  assert.equal(value.codePassed, false); assert.equal(value.checked, false);
  assert.throws(() => updatePractice(dataId, value, { type: 'next' }));
  assert.throws(() => updatePractice(dataId, value, { type: 'code-result', source: solution, passed: true }));
  assert.throws(() => updatePractice(dataId, value, { type: 'code', value: 'x'.repeat(4097) }));
  assert.equal(validPractice(dataId, { ...value, codePassed: true }), false);
});

const contentRoot = fileURLToPath(new URL('../../content/', import.meta.url));
for (const id of PRACTICE_TOPICS) {
  test(`${id}: Reisephase, Sicherung, bewusste Bestätigung und Importprüfung`, () => {
    const service = loadJourney(contentRoot); const topic = service.getTopic(id);
    let state = createJourneyState(topic); const act = action => { state = reduceJourney(state, action, topic); };
    assert.throws(() => act({ type: 'practice-action', action: { type: 'check' } }));
    const completed = finishPractice(id);
    assert.throws(() => validateJourneyState({ ...state, practice: completed }, topic), /erste abgeschlossene/);
    topic.blocks.forEach(() => act({ type: 'read-block' }));
    const answers = parseCsv(fs.readFileSync(path.join(contentRoot, `learning-journey/questions/${id}.v1.csv`), 'utf8')).records;
    for (const questionId of topic.quiz.questionIds) {
      const answer = answers.find(row => row.id === questionId).antwort;
      act({ type: 'select-answer', questionId, answer }); act({ type: 'quiz-feedback', feedback: service.check(id, { version: topic.version, questionId, answer }) }); act({ type: 'next-quiz' });
    }
    act({ type: 'reflection-reveal' }); act({ type: 'reflection-done' }); act({ type: 'reflection-reveal' });
    assert.throws(() => act({ type: 'reflection-done', practiceConfirmed: true }));
    state = validateJourneyState({ ...state, practice: completed }, topic);
    assert.throws(() => act({ type: 'reflection-done', practiceConfirmed: false }));
    state = parseJourneyBackup(exportJourney(state, topic), topic);
    assert.deepEqual(state.practice, completed);
    act({ type: 'reflection-done', practiceConfirmed: true });
    assert.equal(state.index, 2); act({ type: 'previous' });
    assert.throws(() => act({ type: 'practice-action', action: { type: 'check' } }), /gesperrt/);
    assert.throws(() => validateJourneyState({ ...state, practice: createPractice(id) }, topic));
    const early = { ...createJourneyState(topic), practice: completed };
    assert.throws(() => parseJourneyBackup(JSON.stringify({ format: 'azubiprep-journey', version: 1, state: early }), topic));
    const other = service.getTopic('common-lf1-role');
    assert.throws(() => validateJourneyState({ ...createJourneyState(other), practice: completed }, other));
  });
}

test('57 voneinander getrennte Ablagen erhalten die ersten 39 Schlüssel', () => {
  const service = loadJourney(contentRoot); const topics = service.getSummary().readyTopics.filter(t => ['LF1','WISO','PM','LF2','LF3','LF4','LF5','LF6'].includes(t.fieldId));
  assert.equal(topics.length, 57);
  assert.equal(new Set(topics.map(t => journeyStorageKey(t.id))).size, 57);
  for (const summary of topics) {
    const topic = service.getTopic(summary.id); const state = createJourneyState(topic);
    assert.equal(Object.hasOwn(state, 'practice'), PRACTICE_TOPICS.includes(topic.id));
    assert.deepEqual(parseJourneyBackup(exportJourney(state, topic), topic), state);
  }
});
