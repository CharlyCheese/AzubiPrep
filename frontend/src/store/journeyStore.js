import { LAB_TOPICS, createLab, validLab, labStarted, labPassed, updateLab } from '../utils/journeyLabs.js';
import { PRACTICE_TOPICS, createPractice, validPractice, practiceStarted, practicePassed, updatePractice } from '../utils/journeyPractices.js';
// A deliberately separate local store. Reflection drafts never enter account sync.
import { createCalculation, validCalculation, MAX_CELL_LENGTH } from '../utils/journeyCalculation.js';
import { WORKPLACE_TOPIC, createWorkplace, validWorkplace, checkWorkplace, updateWorkplace } from '../utils/journeyWorkplace.js';
import { NETWORK_TOPIC, createNetwork, validNetwork, networkPassed, updateNetwork } from '../utils/journeyNetwork.js';
export const KEY = 'azubiprep.journey.fiae.v1';
const STORAGE_KEYS = Object.freeze({
  'common-lf1-role': KEY,
  'common-lf1-goals': 'azubiprep.journey.fiae.common-lf1-goals.v1',
  'common-lf1-market': 'azubiprep.journey.fiae.common-lf1-market.v1',
  'common-lf1-value-chain': 'azubiprep.journey.fiae.common-lf1-value-chain.v1',
  'common-lf1-organization': 'azubiprep.journey.fiae.common-lf1-organization.v1',
  'common-lf1-presentation': 'azubiprep.journey.fiae.common-lf1-presentation.v1',
  'common-wiso-training': 'azubiprep.journey.fiae.common-wiso-training.v1',
  'common-wiso-employment': 'azubiprep.journey.fiae.common-wiso-employment.v1',
  'common-wiso-representation': 'azubiprep.journey.fiae.common-wiso-representation.v1',
  'common-wiso-social-security': 'azubiprep.journey.fiae.common-wiso-social-security.v1',
  'common-wiso-pay': 'azubiprep.journey.fiae.common-wiso-pay.v1',
  'common-wiso-consumer': 'azubiprep.journey.fiae.common-wiso-consumer.v1',
  'common-wiso-economy': 'azubiprep.journey.fiae.common-wiso-economy.v1',
  'common-wiso-change': 'azubiprep.journey.fiae.common-wiso-change.v1',
  'common-wiso-career': 'azubiprep.journey.fiae.common-wiso-career.v1',
  'common-wiso-europe': 'azubiprep.journey.fiae.common-wiso-europe.v1',
  'common-pm-project': 'azubiprep.journey.fiae.common-pm-project.v1',
  'common-pm-stakeholders': 'azubiprep.journey.fiae.common-pm-stakeholders.v1',
  'common-pm-methods': 'azubiprep.journey.fiae.common-pm-methods.v1',
  'common-pm-planning': 'azubiprep.journey.fiae.common-pm-planning.v1',
  'common-pm-schedule': 'azubiprep.journey.fiae.common-pm-schedule.v1',
  'common-pm-costs': 'azubiprep.journey.fiae.common-pm-costs.v1',
  'common-pm-pricing': 'azubiprep.journey.fiae.common-pm-pricing.v1',
  'common-pm-feasibility': 'azubiprep.journey.fiae.common-pm-feasibility.v1',
  'common-pm-control': 'azubiprep.journey.fiae.common-pm-control.v1',
  'common-pm-closure': 'azubiprep.journey.fiae.common-pm-closure.v1',
  'common-lf2-requirements': 'azubiprep.journey.fiae.common-lf2-requirements.v1',
  'common-lf2-hardware': 'azubiprep.journey.fiae.common-lf2-hardware.v1',
  'common-lf2-software': 'azubiprep.journey.fiae.common-lf2-software.v1',
  'common-lf2-workplace': 'azubiprep.journey.fiae.common-lf2-workplace.v1',
  'common-lf2-comparison': 'azubiprep.journey.fiae.common-lf2-comparison.v1',
  'common-lf2-procurement': 'azubiprep.journey.fiae.common-lf2-procurement.v1',
  'common-lf2-handover': 'azubiprep.journey.fiae.common-lf2-handover.v1',
  'common-lf3-physical': 'azubiprep.journey.fiae.common-lf3-physical.v1',
  'common-lf3-protocols': 'azubiprep.journey.fiae.common-lf3-protocols.v1',
  'common-lf3-addressing': 'azubiprep.journey.fiae.common-lf3-addressing.v1',
  'common-lf3-services': 'azubiprep.journey.fiae.common-lf3-services.v1',
  'common-lf3-access': 'azubiprep.journey.fiae.common-lf3-access.v1',
  'common-lf3-diagnosis': 'azubiprep.journey.fiae.common-lf3-diagnosis.v1',
  'common-lf4-goals': 'azubiprep.journey.fiae.common-lf4-goals.v1',
  'common-lf4-assets': 'azubiprep.journey.fiae.common-lf4-assets.v1',
  'common-lf4-privacy': 'azubiprep.journey.fiae.common-lf4-privacy.v1',
  'common-lf4-assessment': 'azubiprep.journey.fiae.common-lf4-assessment.v1',
  'common-lf4-measures': 'azubiprep.journey.fiae.common-lf4-measures.v1',
  'common-lf5-requirements': 'azubiprep.journey.fiae.common-lf5-requirements.v1',
  'common-lf5-types': 'azubiprep.journey.fiae.common-lf5-types.v1',
  'common-lf5-control': 'azubiprep.journey.fiae.common-lf5-control.v1',
  'common-lf5-functions': 'azubiprep.journey.fiae.common-lf5-functions.v1',
  'common-lf5-objects': 'azubiprep.journey.fiae.common-lf5-objects.v1',
  'common-lf5-storage': 'azubiprep.journey.fiae.common-lf5-storage.v1',
  'common-lf5-sql': 'azubiprep.journey.fiae.common-lf5-sql.v1',
  'common-lf5-testing': 'azubiprep.journey.fiae.common-lf5-testing.v1',
  'common-lf6-intake': 'azubiprep.journey.fiae.common-lf6-intake.v1',
  'common-lf6-priority': 'azubiprep.journey.fiae.common-lf6-priority.v1',
  'common-lf6-diagnosis': 'azubiprep.journey.fiae.common-lf6-diagnosis.v1',
  'common-lf6-solution': 'azubiprep.journey.fiae.common-lf6-solution.v1',
  'common-lf6-closure': 'azubiprep.journey.fiae.common-lf6-closure.v1',
  'common-lf7-components': 'azubiprep.journey.fiae.common-lf7-components.v1',
  'common-lf7-signals': 'azubiprep.journey.fiae.common-lf7-signals.v1',
  'common-lf7-extension': 'azubiprep.journey.fiae.common-lf7-extension.v1',
  'common-lf7-logic': 'azubiprep.journey.fiae.common-lf7-logic.v1',
  'common-lf7-verification': 'azubiprep.journey.fiae.common-lf7-verification.v1',
  'common-lf8-sources': 'azubiprep.journey.fiae.common-lf8-sources.v1',
  'common-lf8-formats': 'azubiprep.journey.fiae.common-lf8-formats.v1',
  'common-lf8-queries': 'azubiprep.journey.fiae.common-lf8-queries.v1',
  'common-lf8-interfaces': 'azubiprep.journey.fiae.common-lf8-interfaces.v1',
  'common-lf8-integrity': 'azubiprep.journey.fiae.common-lf8-integrity.v1',
  'common-lf8-delivery': 'azubiprep.journey.fiae.common-lf8-delivery.v1',
  'common-lf9-requirements': 'azubiprep.journey.fiae.common-lf9-requirements.v1',
  'common-lf9-design': 'azubiprep.journey.fiae.common-lf9-design.v1',
  'common-lf9-services': 'azubiprep.journey.fiae.common-lf9-services.v1',
  'common-lf9-security': 'azubiprep.journey.fiae.common-lf9-security.v1',
  'common-lf9-monitoring': 'azubiprep.journey.fiae.common-lf9-monitoring.v1',
  'common-lf9-handover': 'azubiprep.journey.fiae.common-lf9-handover.v1',
  'fiae-lf10a-process': 'azubiprep.journey.fiae.fiae-lf10a-process.v1',
  'fiae-lf10a-prototype': 'azubiprep.journey.fiae.fiae-lf10a-prototype.v1',
  'fiae-lf10a-layout': 'azubiprep.journey.fiae.fiae-lf10a-layout.v1',
  'fiae-lf10a-forms': 'azubiprep.journey.fiae.fiae-lf10a-forms.v1',
  'fiae-lf10a-usability': 'azubiprep.journey.fiae.fiae-lf10a-usability.v1',
  'fiae-lf10a-value': 'azubiprep.journey.fiae.fiae-lf10a-value.v1',
  'fiae-lf11a-model': 'azubiprep.journey.fiae.fiae-lf11a-model.v1',
  'fiae-lf11a-architecture': 'azubiprep.journey.fiae.fiae-lf11a-architecture.v1',
  'fiae-lf11a-algorithms': 'azubiprep.journey.fiae.fiae-lf11a-algorithms.v1',
  'fiae-lf11a-data-access': 'azubiprep.journey.fiae.fiae-lf11a-data-access.v1',
  'fiae-lf11a-security': 'azubiprep.journey.fiae.fiae-lf11a-security.v1',
  'fiae-lf11a-testing': 'azubiprep.journey.fiae.fiae-lf11a-testing.v1',
  'fiae-lf11a-versions': 'azubiprep.journey.fiae.fiae-lf11a-versions.v1',
  'fiae-lf12a-scope': 'azubiprep.journey.fiae.fiae-lf12a-scope.v1',
  'fiae-lf12a-alternatives': 'azubiprep.journey.fiae.fiae-lf12a-alternatives.v1',
  'fiae-lf12a-planning': 'azubiprep.journey.fiae.fiae-lf12a-planning.v1',
  'fiae-lf12a-implementation': 'azubiprep.journey.fiae.fiae-lf12a-implementation.v1',
  'fiae-lf12a-acceptance': 'azubiprep.journey.fiae.fiae-lf12a-acceptance.v1',
  'fiae-lf12a-training': 'azubiprep.journey.fiae.fiae-lf12a-training.v1',
  'fiae-lf12a-review': 'azubiprep.journey.fiae.fiae-lf12a-review.v1',
});
const MAX_BYTES = 128 * 1024;
const PHASES = ['theory', 'quiz', 'reflection', 'cards', 'exam-intro', 'exam', 'result'];
const OPTIONS = ['a', 'b', 'c', 'd'];
const STATE_KEYS = ['schemaVersion', 'revision', 'track', 'topicId', 'topicVersion', 'planVersion', 'phase', 'index', 'completedBlocks', 'quiz', 'reflection', 'cards', 'exam', 'history', 'bestResult', 'optionOrder', 'createdAt', 'updatedAt'];
const FEEDBACK_KEYS = ['questionId', 'answer', 'correct', 'expected', 'explanation', 'blockIds', 'objectiveIds'];
const SUMMARY_KEYS = ['attemptId', 'version', 'total', 'correct', 'percent', 'passed', 'completedAt'];

function fail(code, message) {
  const error = new Error(message);
  error.code = code;
  throw error;
}

function check(condition, message, code = 'INVALID_STATE') {
  if (!condition) fail(code, message);
}

export function journeyStorageKey(topicId) {
  check(typeof topicId === 'string' && Object.hasOwn(STORAGE_KEYS, topicId), 'Dieser Lernreise-Abschnitt wird nicht unterstützt.');
  return STORAGE_KEYS[topicId];
}

function object(value, label) {
  check(value !== null && typeof value === 'object' && !Array.isArray(value)
    && [Object.prototype, null].includes(Object.getPrototypeOf(value)), `${label} ist kein gültiges Objekt.`);
}

function fields(value, keys, label) {
  object(value, label);
  const actual = Object.keys(value);
  check(actual.length === keys.length && actual.every((key) => keys.includes(key)), `${label} enthält fehlende oder unbekannte Felder.`);
}

function mapping(value, ids, label) {
  object(value, label);
  check(Object.keys(value).every((key) => ids.includes(key)), `${label} enthält unbekannte IDs.`);
}

function idList(value, ids, label) {
  check(Array.isArray(value) && value.every((id) => typeof id === 'string' && ids.includes(id))
    && new Set(value).size === value.length, `${label} enthält ungültige oder doppelte IDs.`);
}

function sameList(value, expected, label) {
  idList(value, expected, label);
  check(value.length === expected.length && expected.every((id) => value.includes(id)), `${label} stimmt nicht mit dem Inhalt überein.`);
}

function prefix(value, ids, label) {
  idList(value, ids, label);
  check(value.every((id, index) => id === ids[index]), `${label} überspringt einen Schritt.`);
  return value.length;
}

function mapPrefix(value, ids, label) {
  mapping(value, ids, label);
  const count = Object.keys(value).length;
  check(ids.slice(0, count).every((id) => Object.hasOwn(value, id)), `${label} überspringt einen Schritt.`);
  return count;
}

function iso(value, label) {
  check(typeof value === 'string' && Number.isFinite(Date.parse(value))
    && new Date(value).toISOString() === value, `${label} ist kein gültiger Zeitpunkt.`);
}

function attemptId(value) {
  check(typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value), 'Die Versuch-ID ist ungültig.');
}

function answer(value) {
  check(OPTIONS.includes(value), 'Die Antwort muss eine der vorgegebenen Optionen sein.');
}

function limited(text) {
  check(typeof text === 'string', 'Die Sicherung muss Text enthalten.', 'INVALID_BACKUP');
  check(new TextEncoder().encode(text).byteLength <= MAX_BYTES, 'Der Reisestand ist größer als die erlaubten 128 KiB.', 'TOO_LARGE');
  return text;
}

function serialized(value) {
  let text;
  try { text = JSON.stringify(value); } catch { fail('INVALID_STATE', 'Der Reisestand kann nicht gespeichert werden.'); }
  return limited(text);
}

function parsed(text) {
  limited(text);
  try { return JSON.parse(text); } catch { fail('INVALID_STATE', 'Der gespeicherte Reisestand ist kein gültiges JSON.'); }
}

function idsFor(topic) {
  return {
    blocks: topic.blocks.map(({ id }) => id), quiz: topic.quiz.questionIds,
    reflection: topic.interview.map(({ id }) => id), cards: topic.cards.map(({ id }) => id),
    exam: topic.exam.questionIds, objectives: topic.objectives.map(({ id }) => id),
  };
}

function validateFeedback(feedback, questionId, selected, topic) {
  fields(feedback, FEEDBACK_KEYS, 'Die Rückmeldung');
  check(feedback.questionId === questionId && feedback.answer === selected, 'Die Rückmeldung gehört nicht zur gewählten Antwort.');
  answer(feedback.answer);
  answer(feedback.expected);
  check(typeof feedback.correct === 'boolean' && feedback.correct === (feedback.answer === feedback.expected), 'Die Rückmeldung widerspricht der erwarteten Antwort.');
  check(typeof feedback.explanation === 'string' && feedback.explanation.length > 0 && feedback.explanation.length <= 4000, 'Die Erklärung ist ungültig.');
  const link = topic.questionLinks.find((item) => item.questionId === questionId);
  check(Boolean(link), 'Die Frage gehört nicht zu diesem Abschnitt.');
  sameList(feedback.blockIds, link.blockIds, 'Die Theorieverweise');
  sameList(feedback.objectiveIds, link.objectiveIds, 'Die Lernzielverweise');
}

function validateScore(score, topic) {
  const total = topic.exam.questionIds.length;
  check(score.version === topic.version, 'Das Ergebnis gehört zu einer anderen Inhaltsversion.', 'CONTENT_VERSION_MISMATCH');
  check(score.total === total && Number.isInteger(score.correct) && score.correct >= 0 && score.correct <= total,
    'Die Ergebnisanzahl ist ungültig.');
  check(score.percent === score.correct / total * 100
    && typeof score.passed === 'boolean' && score.passed === (score.percent >= topic.exam.passPercent), 'Punktzahl und Bestehensgrenze widersprechen sich.');
}

function validateSummary(summary, topic) {
  fields(summary, SUMMARY_KEYS, 'Der Versuchseintrag');
  attemptId(summary.attemptId);
  validateScore(summary, topic);
  iso(summary.completedAt, 'Der Abschlusszeitpunkt');
}

function validateResult(result, exam, topic) {
  fields(result, ['attemptId', 'version', 'total', 'correct', 'percent', 'passed', 'results', 'objectives'], 'Das Testergebnis');
  check(result.attemptId === exam.attemptId, 'Das Ergebnis gehört zu einem anderen Versuch.');
  validateScore(result, topic);
  const ids = idsFor(topic);
  check(Object.keys(exam.answers).length === ids.exam.length, 'Für die Auswertung fehlen Antworten.');
  check(Array.isArray(result.results), 'Die einzelnen Testergebnisse fehlen.');
  sameList(result.results.map((row) => row?.questionId), ids.exam, 'Die ausgewerteten Fragen');
  result.results.forEach((row) => validateFeedback(row, row.questionId, exam.answers[row.questionId], topic));
  check(result.correct === result.results.filter((row) => row.correct).length, 'Die Gesamtpunktzahl widerspricht den einzelnen Antworten.');
  check(Array.isArray(result.objectives), 'Die Lernzielauswertung fehlt.');
  sameList(result.objectives.map((item) => item?.id), ids.objectives, 'Die ausgewerteten Lernziele');
  for (const objective of result.objectives) {
    fields(objective, ['id', 'total', 'correct', 'percent'], 'Das Lernzielergebnis');
    const rows = result.results.filter((row) => row.objectiveIds.includes(objective.id));
    const correct = rows.filter((row) => row.correct).length;
    check(objective.total === rows.length && objective.correct === correct
      && objective.percent === (rows.length ? correct / rows.length * 100 : 0), 'Die Lernzielpunktzahl widerspricht den Antworten.');
  }
}

function summaryFor(result, completedAt) {
  return Object.fromEntries(SUMMARY_KEYS.map((key) => [key, key === 'completedAt' ? completedAt : result[key]]));
}

function sameSummary(left, right) {
  return SUMMARY_KEYS.every((key) => left[key] === right[key]);
}

export function createJourneyState(topic, { now = new Date().toISOString() } = {}) {
  const optionOrder = {};
  for (const id of [...topic.quiz.questionIds, ...topic.exam.questionIds]) {
    const order = [...OPTIONS];
    for (let i = order.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    optionOrder[id] = order;
  }
  const state = {
    schemaVersion: 1, revision: 0, track: 'FIAE', topicId: topic.id,
    topicVersion: topic.version, planVersion: topic.planVersion,
    phase: 'theory', index: 0, completedBlocks: [], quiz: { answers: {}, feedback: {} },
    reflection: { drafts: {}, revealed: [], done: [] }, cards: { revealed: [], ratings: {} },
    exam: { attemptId: null, answers: {}, result: null }, history: [], bestResult: null,
    optionOrder, createdAt: now, updatedAt: now,
  };
  const calculation = createCalculation(topic.id);
  if (calculation) state.calculation = calculation;
  if (topic.id === WORKPLACE_TOPIC) state.workplace = createWorkplace();
  if (topic.id === NETWORK_TOPIC) state.network = createNetwork();
  if (PRACTICE_TOPICS.includes(topic.id)) state.practice = createPractice(topic.id);
  if (LAB_TOPICS.includes(topic.id)) state.lab = createLab(topic.id);
  return validateJourneyState(state, topic);
}

export function latestObjectiveScores(state, topic) {
  if (state.exam.result) return state.exam.result.objectives;
  if (!state.lastExamMarks) return [];
  const tested = topic.exam.questionIds.map((id, index) => ({
    goals: topic.questionLinks.find(link => link.questionId === id).objectiveIds,
    correct: state.lastExamMarks[index],
  }));
  return topic.objectives.map(({ id }) => {
    const rows = tested.filter(row => row.goals.includes(id));
    return { id, total: rows.length, correct: rows.filter(row => row.correct).length };
  });
}

export function validateJourneyState(state, topic) {
  journeyStorageKey(topic?.id);
  object(state, 'Der Reisestand');
  check(state.schemaVersion === 1, 'Diese Version des Reisestands wird noch nicht unterstützt.', 'UNSUPPORTED_VERSION');
  const hasCalculation = Object.hasOwn(state, 'calculation');
  const hasWorkplace = Object.hasOwn(state, 'workplace');
  const hasNetwork = Object.hasOwn(state, 'network');
  const hasPractice = Object.hasOwn(state, 'practice');
  const hasLab = Object.hasOwn(state, 'lab');
  const hasLastMarks = Object.hasOwn(state, 'lastExamMarks');
  fields(state, [...STATE_KEYS, ...(hasLastMarks ? ['lastExamMarks'] : []), ...(hasCalculation ? ['calculation'] : []), ...(hasWorkplace ? ['workplace'] : []), ...(hasNetwork ? ['network'] : []), ...(hasPractice ? ['practice'] : []), ...(hasLab ? ['lab'] : [])], 'Der Reisestand');
  if (hasLab) check(validLab(topic.id, state.lab), 'Das Lernlabor gehört nicht zu diesem Abschnitt oder ist ungültig.');
  if (hasPractice) check(validPractice(topic.id, state.practice), 'Die praktische Übung gehört nicht zu diesem Abschnitt oder ist ungültig.');
  if (hasCalculation) check(validCalculation(topic.id, state.calculation), 'Die Kalkulation gehört nicht zu diesem Abschnitt oder enthält ungültige Eingaben.');
  if (hasWorkplace) check(topic.id === WORKPLACE_TOPIC && validWorkplace(state.workplace), 'Die Einrichtungsübung gehört nicht zu diesem Abschnitt oder ist ungültig.');
  if (hasNetwork) check(topic.id === NETWORK_TOPIC && validNetwork(state.network), 'Das Netzwerklabor gehört nicht zu diesem Abschnitt oder ist ungültig.');
  check(state.track === 'FIAE' && state.track === topic.track && state.topicId === topic.id, 'Der Reisestand gehört nicht zu diesem Abschnitt.');
  check(state.topicVersion === topic.version && state.planVersion === topic.planVersion,
    'Der Reisestand gehört zu einer anderen Inhaltsversion. Sichere ihn vor einem bestätigten Ersatz.', 'CONTENT_VERSION_MISMATCH');
  check(Number.isSafeInteger(state.revision) && state.revision >= 0, 'Die Speicherrevision ist ungültig.');
  iso(state.createdAt, 'Der Beginn');
  iso(state.updatedAt, 'Die letzte Änderung');
  const ids = idsFor(topic);
  const phase = PHASES.indexOf(state.phase);
  check(phase >= 0, 'Die Lernphase ist unbekannt.');
  const count = [ids.blocks.length, ids.quiz.length, ids.reflection.length, ids.cards.length, 1, ids.exam.length, 1][phase];
  check(Number.isInteger(state.index) && state.index >= 0 && state.index < count, 'Die Position in der Lernphase ist ungültig.');
  const completed = prefix(state.completedBlocks, ids.blocks, 'Die gelesenen Blöcke');
  check(phase === 0 ? completed < ids.blocks.length && state.index <= completed : completed === ids.blocks.length, 'Die Theorie wurde übersprungen.');

  fields(state.quiz, ['answers', 'feedback'], 'Das Themenquiz');
  const quizAnswers = mapPrefix(state.quiz.answers, ids.quiz, 'Die Quizantworten');
  const quizFeedback = mapPrefix(state.quiz.feedback, ids.quiz, 'Die Quizrückmeldungen');
  Object.values(state.quiz.answers).forEach(answer);
  for (const [id, feedback] of Object.entries(state.quiz.feedback)) validateFeedback(feedback, id, state.quiz.answers[id], topic);
  check(quizAnswers >= quizFeedback && quizAnswers <= quizFeedback + 1, 'Die Quizantworten passen nicht zum Fortschritt.');
  check(phase === 0 ? quizAnswers === 0 : phase === 1 ? state.index <= quizFeedback : quizFeedback === ids.quiz.length, 'Das Themenquiz wurde übersprungen.');

  fields(state.reflection, ['drafts', 'revealed', 'done'], 'Die Selbstreflexion');
  mapping(state.reflection.drafts, ids.reflection, 'Die Reflexionsentwürfe');
  const reflectionDone = prefix(state.reflection.done, ids.reflection, 'Die abgeschlossenen Reflexionen');
  if (topic.id === WORKPLACE_TOPIC && reflectionDone >= 2) check(state.workplace?.checked && checkWorkplace(state.workplace).passed, 'Die bestätigte Einrichtungsübung benötigt eine erfolgreiche Modellprüfung.');
  if (topic.id === NETWORK_TOPIC && reflectionDone >= 2) check(networkPassed(state.network), 'Das bestätigte Netzwerklabor benötigt drei abgeschlossene Fälle.');
  if (topic.id === NETWORK_TOPIC && state.network?.cases.some(c => c.observed)) check(reflectionDone >= 1, 'Das begonnene Netzwerklabor benötigt die erste abgeschlossene Selbstreflexion.');
  if (PRACTICE_TOPICS.includes(topic.id) && reflectionDone >= 2) check(practicePassed(topic.id, state.practice), 'Die Praxis muss vor der Bestätigung erfolgreich abgeschlossen sein.');
  if (hasPractice && practiceStarted(topic.id, state.practice)) check(reflectionDone >= 1, 'Die Praxis benötigt die erste abgeschlossene Selbstreflexion.');
  if (LAB_TOPICS.includes(topic.id) && reflectionDone >= 2) check(labPassed(topic.id, state.lab), 'Das Lernlabor muss vor der Bestätigung abgeschlossen sein.');
  if (hasLab && labStarted(topic.id, state.lab)) check(reflectionDone >= 1, 'Das Lernlabor benötigt die erste abgeschlossene Selbstreflexion.');
  const reflectionRevealed = prefix(state.reflection.revealed, ids.reflection, 'Die geöffneten Musterantworten');
  check(reflectionRevealed >= reflectionDone && reflectionRevealed <= reflectionDone + 1, 'Die Reflexion benötigt zuerst ihre Musterantwort.');
  for (const [id, text] of Object.entries(state.reflection.drafts)) {
    check(typeof text === 'string' && text.length <= 2000 && ids.reflection.indexOf(id) <= reflectionDone, 'Ein Reflexionsentwurf ist zu lang oder gehört zu einem späteren Schritt.');
  }
  check(phase < 2 ? reflectionRevealed === 0 && Object.keys(state.reflection.drafts).length === 0
    : phase === 2 ? reflectionDone < ids.reflection.length && state.index <= reflectionDone
      : reflectionDone === ids.reflection.length, 'Die Selbstreflexion wurde übersprungen.');

  fields(state.cards, ['revealed', 'ratings'], 'Die Kartenrunde');
  const cardRevealed = prefix(state.cards.revealed, ids.cards, 'Die geöffneten Karten');
  const cardRatings = mapPrefix(state.cards.ratings, ids.cards, 'Die Karteneinschätzungen');
  check(Object.values(state.cards.ratings).every((rating) => ['known', 'repeat'].includes(rating)), 'Die Karteneinschätzung ist ungültig.');
  check(cardRevealed >= cardRatings && cardRevealed <= cardRatings + 1, 'Die Kartenantwort muss zuerst geöffnet werden.');
  check(phase < 3 ? cardRevealed === 0 : phase === 3 ? cardRatings < ids.cards.length && state.index <= cardRatings
    : cardRatings === ids.cards.length, 'Die Kartenrunde wurde übersprungen.');

  fields(state.exam, ['attemptId', 'answers', 'result'], 'Der Mini-Test');
  const examAnswers = mapPrefix(state.exam.answers, ids.exam, 'Die Testantworten');
  Object.values(state.exam.answers).forEach(answer);
  if (phase < 5) {
    check(state.exam.attemptId === null && examAnswers === 0 && state.exam.result === null, 'Vor dem Test darf kein laufender Versuch gespeichert sein.');
  } else {
    attemptId(state.exam.attemptId);
    if (phase === 5) check(state.exam.result === null && state.index <= examAnswers, 'Die Testposition überspringt eine Antwort.');
    else validateResult(state.exam.result, state.exam, topic);
  }

  check(Array.isArray(state.history) && state.history.length <= 10, 'Es dürfen höchstens zehn Versuche gespeichert werden.');
  state.history.forEach((summary) => validateSummary(summary, topic));
  if (hasLastMarks) {
    const marks = state.lastExamMarks;
    check(['exam-intro', 'exam'].includes(state.phase) && Array.isArray(marks) && marks.length === ids.exam.length
      && marks.every(mark => typeof mark === 'boolean') && marks.filter(Boolean).length === state.history.at(-1)?.correct,
      'Die Lernzielübersicht der letzten Abgabe ist ungültig.');
  }
  check(new Set(state.history.map((summary) => summary.attemptId)).size === state.history.length, 'Ein Versuch wurde mehrfach abgeschlossen.');
  check(phase >= 4 || state.history.length === 0, 'Vor der ersten Kartenrunde darf kein Testergebnis vorliegen.');
  if (state.history.length === 0) check(state.bestResult === null, 'Das beste Ergebnis benötigt einen abgeschlossenen Versuch.');
  else {
    validateSummary(state.bestResult, topic);
    check(state.history.every((summary) => summary.percent <= state.bestResult.percent), 'Das beste Ergebnis stimmt nicht mit dem Verlauf überein.');
    const matching = state.history.find((summary) => summary.attemptId === state.bestResult.attemptId);
    check(Boolean(matching) || state.history.length === 10, 'Das beste Ergebnis fehlt im noch vollständigen Verlauf.');
    check(!matching || sameSummary(matching, state.bestResult), 'Das beste Ergebnis widerspricht dem Verlauf.');
  }
  if (phase === 5) check(!state.history.some((summary) => summary.attemptId === state.exam.attemptId)
    && state.bestResult?.attemptId !== state.exam.attemptId, 'Dieser Versuch wurde bereits abgeschlossen.');
  if (phase === 6) {
    const summary = state.history.at(-1);
    check(Boolean(summary) && summary.attemptId === state.exam.attemptId
      && sameSummary(summary, summaryFor(state.exam.result, summary.completedAt)), 'Das aktuelle Ergebnis fehlt am Ende des Verlaufs.');
  }

  const allQuestions = [...ids.quiz, ...ids.exam];
  fields(state.optionOrder, allQuestions, 'Die Reihenfolge der Antwortoptionen');
  Object.values(state.optionOrder).forEach((order) => sameList(order, OPTIONS, 'Die Antwortoptionen'));
  serialized(state);
  return state;
}

export function reduceJourney(state, action, topic) {
  validateJourneyState(state, topic);
  object(action, 'Die Aktion');
  const next = JSON.parse(JSON.stringify(state));
  const ids = idsFor(topic);
  const requirePhase = (...phases) => check(phases.includes(state.phase), 'Dieser Schritt ist in der aktuellen Lernphase nicht möglich.', 'INVALID_ACTION');
  const currentId = (phase) => ids[phase][state.index];
  const advance = (phase, nextPhase) => {
    if (state.index + 1 < ids[phase].length) next.index += 1;
    else { next.phase = nextPhase; next.index = 0; }
  };
  const append = (list, value) => { if (!list.includes(value)) list.push(value); };
  switch (action.type) {
    case 'lab-action': {
      requirePhase('reflection');
      check(LAB_TOPICS.includes(topic.id) && state.index === 1 && !state.reflection.done.includes(ids.reflection[1]), 'Das Lernlabor gehört zur zweiten Selbstreflexion und ist danach gesperrt.', 'INVALID_ACTION');
      try { next.lab = updateLab(topic.id, state.lab || createLab(topic.id), action.action); } catch (error) { fail('INVALID_ACTION', error.message); }
      break;
    }
    case 'practice-action': {
      requirePhase('reflection');
      check(PRACTICE_TOPICS.includes(topic.id) && state.index === 1 && !state.reflection.done.includes(ids.reflection[1]), 'Die praktische Übung gehört zur zweiten Selbstreflexion und ist danach gesperrt.', 'INVALID_ACTION');
      try { next.practice = updatePractice(topic.id, state.practice || createPractice(topic.id), action.action); }
      catch (error) { fail('INVALID_ACTION', error.message); }
      break;
    }
    case 'network-action': {
      requirePhase('reflection');
      check(topic.id === NETWORK_TOPIC && state.index === 1 && !state.reflection.done.includes(ids.reflection[1]), 'Das Netzwerklabor gehört zur zweiten Selbstreflexion und ist nach Bestätigung gesperrt.', 'INVALID_ACTION');
      try { next.network = updateNetwork(state.network || createNetwork(), action.action); }
      catch { fail('INVALID_ACTION', 'Dieser Schritt passt nicht zum Netzwerklabor.'); }
      break;
    }
    case 'workplace-action': {
      requirePhase('reflection');
      check(topic.id === WORKPLACE_TOPIC && state.index === 1 && !state.reflection.done.includes(ids.reflection[1]), 'Die Einrichtungsübung gehört zur zweiten Selbstreflexion und ist nach Bestätigung gesperrt.', 'INVALID_ACTION');
      try { next.workplace = updateWorkplace(state.workplace || createWorkplace(), action.action); }
      catch { fail('INVALID_ACTION', 'Dieser Schritt passt nicht zur Einrichtungsübung.'); }
      break;
    }
    case 'calculation-cell': {
      const calculation = next.calculation || createCalculation(topic.id);
      check(Boolean(calculation) && Object.hasOwn(calculation.cells, action.cellId)
        && typeof action.text === 'string' && action.text.length <= MAX_CELL_LENGTH,
      'Diese Tabellenzelle oder Eingabe ist ungültig.', 'INVALID_ACTION');
      calculation.cells[action.cellId] = action.text;
      next.calculation = calculation;
      break;
    }
    case 'read-block':
      requirePhase('theory');
      append(next.completedBlocks, currentId('blocks'));
      advance('blocks', 'quiz');
      break;
    case 'previous':
      if (next.index === 0) return state;
      next.index -= 1;
      break;
    case 'select-answer': {
      requirePhase('quiz', 'exam');
      const phase = state.phase;
      check(action.questionId === currentId(phase), 'Die Antwort gehört nicht zur aktuellen Frage.', 'INVALID_ACTION');
      answer(action.answer);
      if (phase === 'quiz' && state.quiz.feedback[action.questionId]) {
        check(state.quiz.answers[action.questionId] === action.answer, 'Eine bereits ausgewertete Quizantwort kann nicht verändert werden.', 'INVALID_ACTION');
        return state;
      }
      next[phase].answers[action.questionId] = action.answer;
      break;
    }
    case 'quiz-feedback': {
      requirePhase('quiz');
      const id = currentId('quiz');
      validateFeedback(action.feedback, id, state.quiz.answers[id], topic);
      if (state.quiz.feedback[id]) {
        check(serialized(state.quiz.feedback[id]) === serialized(action.feedback), 'Für diese Frage liegt bereits eine andere Rückmeldung vor.', 'INVALID_ACTION');
        return state;
      }
      next.quiz.feedback[id] = JSON.parse(JSON.stringify(action.feedback));
      break;
    }
    case 'next-quiz':
      requirePhase('quiz');
      check(Boolean(state.quiz.feedback[currentId('quiz')]), 'Lass die Antwort zuerst auswerten.', 'INVALID_ACTION');
      advance('quiz', 'reflection');
      break;
    case 'reflection-draft':
      requirePhase('reflection');
      check(typeof action.text === 'string' && action.text.length <= 2000, 'Deine Notiz darf höchstens 2000 Zeichen enthalten.', 'INVALID_ACTION');
      next.reflection.drafts[currentId('reflection')] = action.text;
      break;
    case 'reflection-reveal':
      requirePhase('reflection');
      append(next.reflection.revealed, currentId('reflection'));
      break;
    case 'reflection-done':
      requirePhase('reflection');
      check(state.reflection.revealed.includes(currentId('reflection')), 'Öffne zuerst die Musterantwort zum Vergleich.', 'INVALID_ACTION');
      check(!topic.interview[state.index].practice || action.practiceConfirmed === true,
        'Führe zuerst die praktische Aufgabe durch und bestätige deine eigene Prüfung.', 'INVALID_ACTION');
      if (topic.id === WORKPLACE_TOPIC && state.index === 1) check(state.workplace?.checked && checkWorkplace(state.workplace).passed,
        'Richte zuerst den Modellarbeitsplatz ein und prüfe seine Funktionen erfolgreich.', 'INVALID_ACTION');
      if (topic.id === NETWORK_TOPIC && state.index === 1) check(networkPassed(state.network), 'Bearbeite zuerst alle drei Fälle im Netzwerklabor und prüfe ihre Korrekturen.', 'INVALID_ACTION');
      if (PRACTICE_TOPICS.includes(topic.id) && state.index === 1) check(practicePassed(topic.id, state.practice), 'Schließe zuerst alle Schritte der praktischen Übung erfolgreich ab.', 'INVALID_ACTION');
      if (LAB_TOPICS.includes(topic.id) && state.index === 1) check(labPassed(topic.id, state.lab), 'Schließe zuerst alle Schritte des Lernlabors ab.', 'INVALID_ACTION');
      append(next.reflection.done, currentId('reflection'));
      advance('reflection', 'cards');
      break;
    case 'card-reveal':
      requirePhase('cards');
      append(next.cards.revealed, currentId('cards'));
      break;
    case 'card-rate':
      requirePhase('cards');
      check(state.cards.revealed.includes(currentId('cards')) && ['known', 'repeat'].includes(action.rating), 'Öffne die Kartenantwort und wähle eine Einschätzung.', 'INVALID_ACTION');
      next.cards.ratings[currentId('cards')] = action.rating;
      advance('cards', 'exam-intro');
      break;
    case 'start-exam':
      requirePhase('exam-intro');
      attemptId(action.attemptId);
      check(!state.history.some((entry) => entry.attemptId === action.attemptId) && state.bestResult?.attemptId !== action.attemptId,
        'Für die Wiederholung wird eine neue Versuch-ID benötigt.', 'INVALID_ACTION');
      next.phase = 'exam';
      next.index = 0;
      next.exam = { attemptId: action.attemptId, answers: {}, result: null };
      break;
    case 'next-exam':
      requirePhase('exam');
      check(Boolean(state.exam.answers[currentId('exam')]), 'Wähle zuerst eine Antwort.', 'INVALID_ACTION');
      if (state.index + 1 === ids.exam.length) return state;
      next.index += 1;
      break;
    case 'exam-result': {
      requirePhase('exam', 'result');
      validateResult(action.result, state.exam, topic);
      if (state.phase === 'result') {
        check(serialized(state.exam.result) === serialized(action.result), 'Dieser Versuch wurde bereits mit einem anderen Ergebnis abgeschlossen.', 'INVALID_ACTION');
        return state;
      }
      iso(action.completedAt, 'Der Abschlusszeitpunkt');
      delete next.lastExamMarks;
      next.exam.result = JSON.parse(JSON.stringify(action.result));
      const summary = summaryFor(action.result, action.completedAt);
      next.history = [...state.history, summary].slice(-10);
      if (!next.bestResult || summary.percent > next.bestResult.percent) next.bestResult = { ...summary };
      next.phase = 'result';
      next.index = 0;
      break;
    }
    case 'repeat-exam':
      requirePhase('result');
      next.lastExamMarks = ids.exam.map(id => state.exam.result.results.find(row => row.questionId === id).correct);
      next.phase = 'exam-intro';
      next.index = 0;
      next.exam = { attemptId: null, answers: {}, result: null };
      break;
    default:
      fail('INVALID_ACTION', 'Dieser Lernschritt ist unbekannt.');
  }
  next.updatedAt = new Date().toISOString();
  return validateJourneyState(next, topic);
}

export function exportJourney(state, topic) {
  validateJourneyState(state, topic);
  return serialized({ format: 'azubiprep-journey', version: 1, state });
}

export function parseJourneyBackup(text, topic) {
  const backup = parsed(text);
  fields(backup, ['format', 'version', 'state'], 'Die Sicherung');
  check(backup.format === 'azubiprep-journey', 'Diese Datei ist keine Lernreise-Sicherung.', 'INVALID_BACKUP');
  check(backup.version === 1, 'Diese Sicherungsversion wird noch nicht unterstützt.', 'UNSUPPORTED_VERSION');
  return validateJourneyState(backup.state, topic);
}

function revisionFromRaw(raw) {
  if (raw === null) return 0;
  try {
    const current = JSON.parse(raw);
    return Number.isSafeInteger(current?.revision) && current.revision >= 0 ? current.revision : 0;
  } catch { return 0; }
}

function storageError(error, writing = false) {
  if (error?.code && ['CONFLICT', 'INVALID_STATE', 'UNSUPPORTED_VERSION', 'CONTENT_VERSION_MISMATCH', 'TOO_LARGE', 'LOCKS_UNAVAILABLE', 'STORAGE_UNAVAILABLE', 'STORAGE_WRITE_FAILED'].includes(error.code)) return error;
  const conflict = String(error?.message || '').includes('CONFLICT:');
  const result = new Error(conflict ? 'Der Reisestand wurde inzwischen in einem anderen Fenster geändert. Lade ihn erneut, bevor du fortfährst.'
    : writing ? 'Dein Fortschritt konnte nicht gespeichert werden. Deine aktuellen Eingaben bleiben hier erhalten. Sichere sie und versuche es erneut.'
      : 'Der lokale Reisestand kann gerade nicht gelesen werden.');
  result.code = conflict ? 'CONFLICT' : writing ? 'STORAGE_WRITE_FAILED' : 'STORAGE_UNAVAILABLE';
  return result;
}

export function createJourneyStore(options = {}) {
  let storage;
  let accessError;
  try { storage = Object.hasOwn(options, 'storage') ? options.storage : globalThis.localStorage; }
  catch (error) { accessError = error; }
  const locks = Object.hasOwn(options, 'locks') ? options.locks : globalThis.navigator?.locks;
  const native = Object.hasOwn(options, 'native') ? options.native : globalThis.window?.azubiDesktop?.journey;
  const read = (topic) => {
    const key = journeyStorageKey(topic?.id);
    if (native) return native.load(topic.id);
    if (accessError || !storage || typeof storage.getItem !== 'function') fail('STORAGE_UNAVAILABLE', 'Der lokale Speicher steht gerade nicht zur Verfügung.');
    return storage.getItem(key);
  };
  const unpack = (raw, topic) => {
    try { return { state: raw === null ? null : validateJourneyState(parsed(raw), topic), raw, error: null }; }
    catch (error) { return { state: null, raw, error: storageError(error) }; }
  };
  const load = (topic) => {
    try {
      const raw = read(topic);
      if (native) return Promise.resolve(raw).then((value) => unpack(value, topic), (error) => ({ state: null, raw: null, error: storageError(error) }));
      return unpack(raw, topic);
    } catch (error) { return { state: null, raw: null, error: storageError(error) }; }
  };
  const atomic = async (topic, operation) => {
    try {
      const key = journeyStorageKey(topic?.id);
      if (native) return await operation();
      if (!locks || typeof locks.request !== 'function') fail('LOCKS_UNAVAILABLE', 'Dieser Browser unterstützt den sicheren Schutz vor gleichzeitigen Änderungen nicht. Der Fortschritt wurde nicht gespeichert.');
      return await locks.request(key, { mode: 'exclusive' }, operation);
    } catch (error) { throw storageError(error, true); }
  };
  const write = async (state, previousRaw, topic) => {
    const stored = { ...state, revision: revisionFromRaw(previousRaw) + 1, updatedAt: new Date().toISOString() };
    validateJourneyState(stored, topic);
    const raw = serialized(stored);
    if (native) {
      const confirmed = await native.save({ raw, expectedRaw: previousRaw, topicId: topic.id });
      check(confirmed === raw, 'Der gespeicherte Reisestand wurde während des Schreibens geändert.', 'CONFLICT');
    } else {
      const key = journeyStorageKey(topic.id);
      storage.setItem(key, raw);
      check(storage.getItem(key) === raw, 'Der gespeicherte Reisestand wurde während des Schreibens geändert.', 'CONFLICT');
    }
    return stored;
  };
  return {
    load,
    async save(state, expectedRevision, topic) {
      validateJourneyState(state, topic);
      check(expectedRevision === null || Number.isSafeInteger(expectedRevision) && expectedRevision >= 0, 'Die erwartete Speicherrevision ist ungültig.');
      return atomic(topic, async () => {
        const raw = await read(topic);
        const current = raw === null ? null : validateJourneyState(parsed(raw), topic);
        check(current ? current.revision === expectedRevision : expectedRevision === null || expectedRevision === 0,
          'Der Reisestand wurde inzwischen in einem anderen Fenster geändert. Lade ihn erneut, bevor du fortfährst.', 'CONFLICT');
        return write(state, raw, topic);
      });
    },
    async replace(state, expectedRaw, topic) {
      validateJourneyState(state, topic);
      check(expectedRaw === null || typeof expectedRaw === 'string', 'Der zu ersetzende Reisestand ist ungültig.');
      return atomic(topic, async () => {
        const raw = await read(topic);
        check(raw === expectedRaw, 'Der Reisestand wurde seit der Importvorschau geändert. Prüfe die Sicherung erneut.', 'CONFLICT');
        return write(state, raw, topic);
      });
    },
  };
}
