import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { writeCsv } from '../../backend/src/csv.js';
import { loadJourney, validateJourney } from '../validate-learning-journey.mjs';

const CONTENT_FILE = 'topics/common-lf1-role.v1.json';
const QUESTION_FILE = 'questions/common-lf1-role.v1.csv';
const GOALS_CONTENT_FILE = 'topics/common-lf1-goals.v1.json';
const GOALS_QUESTION_FILE = 'questions/common-lf1-goals.v1.csv';
const COLUMNS = 'id;fachrichtung;modul_id;thema;typ;frage;option_a;option_b;option_c;option_d;antwort;erklaerung;schwierigkeit;quelle;lernfeld'.split(';');
const VALIDATOR = fileURLToPath(new URL('../validate-learning-journey.mjs', import.meta.url));

// Small, independent contracts keep negative tests useful even when prose changes.
function fixture() {
  const source = { id: 'public-source', title: 'Öffentliche Rahmenquelle', url: 'https://example.org/source', checkedAt: '2026-11-10' };
  const objectives = ['value', 'team', 'responsibility'].map((id) => ({ id: `common-lf1-role-${id}`, text: `Konkretes Lernziel ${id} erklären.` }));
  const fieldIds = [...Array.from({ length: 9 }, (_, i) => `LF${i + 1}`), 'WISO', 'LF10a', 'LF11a', 'LF12a'];
  const topics = fieldIds.map((fieldId, i) => ({
    id: i === 0 ? 'common-lf1-role' : `topic-${fieldId.toLowerCase()}`,
    title: `Thema ${fieldId}`,
    fieldId,
    scope: fieldId.endsWith('a') ? 'specialization' : 'common',
    prerequisites: i === 0 ? [] : ['common-lf1-role'],
    objectives: i === 0 ? objectives : [{ id: `topic-${fieldId.toLowerCase()}-explain`, text: `${fieldId} im Arbeitsalltag erklären.` }],
    status: i === 0 ? 'content-ready' : 'planned',
    contentFile: i === 0 ? CONTENT_FILE : null,
    gaps: i === 0 ? [] : ['Theorie und Aufgaben sind offen.'],
  }));
  const manifest = {
    schemaVersion: 1, id: 'fiae-journey', version: '1.0.0', title: 'FIAE-Lernreise', track: 'FIAE', publicationStatus: 'content-only',
    sourceIds: [source.id], sources: [source],
    fields: topics.map((topic) => ({ id: topic.fieldId, title: `Lernfeld ${topic.fieldId}`, scope: topic.scope, topicIds: [topic.id] })),
    sequence: topics.map((topic) => topic.id), topics,
  };
  const blocks = Array.from({ length: 4 }, (_, i) => ({
    id: `block-${i + 1}`, title: `Theorieblock ${i + 1}`, objectiveIds: [objectives[i % 3].id], sourceIds: [source.id],
    paragraphs: ['Eine klare Erklärung für das zugeordnete Lernziel.'],
    example: { title: 'Beispiel', text: 'Ein konkreter Vorgang in einem Ausbildungsbetrieb.' },
    misconception: { claim: 'Eine typische falsche Annahme.', correction: 'Die fachlich richtige Einordnung.' },
    takeaway: 'Ein hilfreicher Merksatz.',
  }));
  const quizIds = Array.from({ length: 6 }, (_, i) => `LJ-LF1-ROLE-Q${String(i + 1).padStart(2, '0')}`);
  const examIds = Array.from({ length: 8 }, (_, i) => `LJ-LF1-ROLE-E${String(i + 1).padStart(2, '0')}`);
  const mapping = (i) => ({ objectiveIds: [objectives[i % 3].id], blockIds: [blocks[i % 3].id] });
  const doc = {
    schemaVersion: 1, id: topics[0].id, version: '1.0.0', title: topics[0].title, fieldId: 'LF1', scope: 'common', prerequisites: [],
    sourceIds: [source.id], sources: [{ ...source, note: 'Öffentliche Grundlage für den eigenen Lerntext.' }], objectives: structuredClone(objectives),
    caseStudy: { title: 'Unser Ausbildungsbetrieb', text: 'Ein eigener durchgängiger Fall.' }, blocks,
    quiz: { questionIds: quizIds },
    exam: { questionIds: examIds, passPercent: 80, scoring: 'all-or-nothing-per-question', timed: false },
    questionFile: QUESTION_FILE,
    questionLinks: [...quizIds.map((questionId, i) => ({ questionId, phase: 'quiz', ...mapping(i) })), ...examIds.map((questionId, i) => ({ questionId, phase: 'exam', ...mapping(i) }))],
    interview: Array.from({ length: 3 }, (_, i) => ({
      id: `interview-${i + 1}`, prompt: 'Wie würdest du den Fall erklären?', ...mapping(i), keyPoints: ['Erwarteter fachlicher Kernpunkt.'],
      acceptableAlternatives: ['Eine sinngleiche Erklärung in eigenen Worten.'], misconceptions: ['Eine typische Verwechslung.'],
      sampleAnswer: 'Eine vollständige und nachvollziehbare Beispielantwort.', followUp: 'Wie würdest du im nächsten Schritt handeln?',
    })),
    cards: Array.from({ length: 6 }, (_, i) => ({ id: `card-${i + 1}`, front: 'Was ist hier entscheidend?', back: 'Die fachlich begründete Antwort.', ...mapping(i) })),
    review: { status: 'reviewed', checkedAt: '2026-11-10' },
  };
  const records = [...quizIds, ...examIds].map((id) => ({
    id, fachrichtung: 'ALLE', modul_id: 'WISO', thema: doc.title, typ: 'SC', frage: `Wie wird der Vorgang ${id} eingeordnet?`,
    option_a: 'Begründete Antwort.', option_b: 'Erste alternative Antwort.', option_c: 'Zweite alternative Antwort.', option_d: 'Dritte alternative Antwort.',
    antwort: 'a', erklaerung: 'Die Antwort folgt aus der zuvor erläuterten Theorie.', schwierigkeit: 'leicht', quelle: source.title, lernfeld: 'LF1',
  }));
  return { manifest, topicDocs: { [CONTENT_FILE]: doc }, questionsByFile: { [QUESTION_FILE]: records } };
}

const validate = ({ manifest, topicDocs, questionsByFile }) => validateJourney(manifest, topicDocs, questionsByFile);
const docOf = (data) => data.topicDocs[CONTENT_FILE];
const rowsOf = (data) => data.questionsByFile[QUESTION_FILE];

function twoTopicFixture() {
  const data = fixture();
  const convert = (value) => {
    if (Array.isArray(value)) return value.map(convert);
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, convert(item)]));
    if (typeof value !== 'string') return value;
    return value.replaceAll('common-lf1-role', 'common-lf1-goals')
      .replaceAll('LJ-LF1-ROLE', 'LJ-LF1-GOALS')
      .replaceAll('common-lf1-goals-value', 'common-lf1-goals-classify')
      .replaceAll('common-lf1-goals-team', 'common-lf1-goals-balance')
      .replaceAll('common-lf1-goals-responsibility', 'common-lf1-goals-classify')
      .replace(/^(block|interview|card)-/, 'goals-$1-');
  };
  const topic = convert(data.manifest.topics[0]);
  const doc = convert(docOf(data));
  topic.title = doc.title = 'Unternehmensziele und Zielkonflikte';
  topic.objectives = topic.objectives.slice(0, 2);
  doc.objectives = structuredClone(topic.objectives);
  topic.prerequisites = doc.prerequisites = ['common-lf1-role'];
  data.manifest.topics.splice(1, 0, topic);
  data.manifest.sequence.splice(1, 0, topic.id);
  data.manifest.fields[0].topicIds.push(topic.id);
  data.topicDocs[GOALS_CONTENT_FILE] = doc;
  data.questionsByFile[GOALS_QUESTION_FILE] = convert(rowsOf(data)).map(row => ({ ...row, thema: doc.title }));
  return data;
}

const goalsDocOf = (data) => data.topicDocs[GOALS_CONTENT_FILE];
const LF1_IDS = ['role', 'goals', 'market', 'value-chain', 'organization', 'presentation'].map((suffix) => `common-lf1-${suffix}`);
const WISO_CONTRACTS = [
  ['training', ['roles', 'contract', 'plans'], ['common-lf1-role']],
  ['employment', ['contract', 'protection', 'termination'], ['common-wiso-training']],
  ['representation', ['roles', 'scope', 'conflict'], ['common-wiso-employment', 'common-lf1-organization']],
  ['social-security', ['branches', 'principles', 'advice'], ['common-wiso-employment']],
  ['pay', ['positions', 'calculate'], ['common-wiso-social-security']],
  ['consumer', ['budget', 'contracts', 'rights'], ['common-wiso-pay']],
  ['economy', ['cycle', 'price', 'policy'], ['common-lf1-market', 'common-wiso-consumer']],
  ['change', ['impact', 'conduct', 'learning'], ['common-lf1-goals', 'common-wiso-employment']],
  ['career', ['path', 'life', 'business'], ['common-wiso-change', 'common-wiso-economy']],
  ['europe', ['mobility', 'trade', 'sustainability'], ['common-wiso-economy', 'common-wiso-career']],
];
const WISO_IDS = WISO_CONTRACTS.map(([suffix]) => `common-wiso-${suffix}`);
const PM_CONTRACTS = [
  ['project', ['purpose', 'goals', 'scope'], 'common-wiso-europe'],
  ['stakeholders', ['needs', 'roles', 'communication'], 'common-pm-project'],
  ['methods', ['compare', 'scrum', 'choose'], 'common-pm-stakeholders'],
  ['planning', ['structure', 'estimate', 'uncertainty'], 'common-pm-methods'],
  ['schedule', ['dependencies', 'capacity', 'milestones'], 'common-pm-planning'],
  ['costs', ['cost-types', 'calculate', 'assumptions'], 'common-pm-schedule'],
  ['pricing', ['markup', 'margin', 'price'], 'common-pm-costs'],
  ['feasibility', ['contribution', 'break-even', 'payback'], 'common-pm-pricing'],
  ['control', ['risks', 'variance', 'change'], 'common-pm-feasibility'],
  ['closure', ['acceptance', 'handover', 'learning'], 'common-pm-control'],
];
const PM_IDS = PM_CONTRACTS.map(([suffix]) => `common-pm-${suffix}`);
const PRE_LF2_IDS = [...LF1_IDS, ...WISO_IDS, ...PM_IDS];
const LF2_CONTRACTS = [
  ['requirements', ['clarify', 'plan'], ['common-lf1-role']],
  ['hardware', ['parts', 'fit'], ['common-lf2-requirements']],
  ['software', ['fit', 'license'], ['common-lf2-hardware']],
  ['workplace', ['risk', 'energy', 'lifecycle'], ['common-lf2-hardware']],
  ['comparison', ['criteria', 'cost'], ['common-lf2-software', 'common-lf2-workplace']],
  ['procurement', ['offer', 'order', 'deviation'], ['common-lf2-comparison', 'common-wiso-consumer']],
  ['handover', ['setup', 'handover', 'review'], ['common-lf2-procurement']],
];
const LF2_IDS = LF2_CONTRACTS.map(([suffix]) => `common-lf2-${suffix}`);
const PRE_LF3_IDS = [...PRE_LF2_IDS, ...LF2_IDS];
const LF3_CONTRACTS = [
  ['physical', ['path', 'medium'], ['common-lf2-hardware']],
  ['protocols', ['layers', 'units'], ['common-lf3-physical']],
  ['addressing', ['ipv4', 'ipv6'], ['common-lf3-protocols']],
  ['services', ['configure', 'explain'], ['common-lf3-addressing']],
  ['access', ['identity', 'connection'], ['common-lf3-services']],
  ['diagnosis', ['isolate', 'record'], ['common-lf3-access']],
];
const LF3_IDS = LF3_CONTRACTS.map(([suffix]) => `common-lf3-${suffix}`);
const ALL_IDS = [...PRE_LF3_IDS, ...LF3_IDS];
const NEW_CONTRACTS = [
  [
    "common-lf4-goals",
    "LF4",
    [
      "distinguish",
      "guideline"
    ],
    [
      "common-lf1-value-chain"
    ]
  ],
  [
    "common-lf4-assets",
    "LF4",
    [
      "inventory",
      "scenario",
      "dependence"
    ],
    [
      "common-lf4-goals"
    ]
  ],
  [
    "common-lf4-privacy",
    "LF4",
    [
      "identify",
      "principles",
      "clarify"
    ],
    [
      "common-lf4-assets"
    ]
  ],
  [
    "common-lf4-assessment",
    "LF4",
    [
      "classify",
      "separate",
      "document"
    ],
    [
      "common-lf4-privacy"
    ]
  ],
  [
    "common-lf4-measures",
    "LF4",
    [
      "select",
      "check",
      "responsibility"
    ],
    [
      "common-lf4-assessment",
      "common-lf3-access"
    ]
  ],
  [
    "common-lf5-requirements",
    "LF5",
    [
      "data",
      "scope",
      "tests"
    ],
    [
      "common-lf2-requirements",
      "common-lf4-privacy"
    ]
  ],
  [
    "common-lf5-types",
    "LF5",
    [
      "choose",
      "trace"
    ],
    [
      "common-lf5-requirements"
    ]
  ],
  [
    "common-lf5-control",
    "LF5",
    [
      "branch",
      "loop"
    ],
    [
      "common-lf5-types"
    ]
  ],
  [
    "common-lf5-functions",
    "LF5",
    [
      "model",
      "function"
    ],
    [
      "common-lf5-control"
    ]
  ],
  [
    "common-lf5-objects",
    "LF5",
    [
      "model",
      "instances"
    ],
    [
      "common-lf5-functions"
    ]
  ],
  [
    "common-lf5-storage",
    "LF5",
    [
      "compare",
      "keys"
    ],
    [
      "common-lf5-objects"
    ]
  ],
  [
    "common-lf5-sql",
    "LF5",
    [
      "read",
      "change",
      "protect"
    ],
    [
      "common-lf5-storage"
    ]
  ],
  [
    "common-lf5-testing",
    "LF5",
    [
      "cases",
      "repair",
      "document"
    ],
    [
      "common-lf5-sql"
    ]
  ],
  [
    "common-lf6-intake",
    "LF6",
    [
      "questions",
      "ticket"
    ],
    [
      "common-lf1-role",
      "common-lf3-diagnosis"
    ]
  ],
  [
    "common-lf6-priority",
    "LF6",
    [
      "agreement",
      "priority",
      "level"
    ],
    [
      "common-lf6-intake"
    ]
  ],
  [
    "common-lf6-diagnosis",
    "LF6",
    [
      "hypothesis",
      "evidence"
    ],
    [
      "common-lf6-priority",
      "common-lf5-testing"
    ]
  ],
  [
    "common-lf6-solution",
    "LF6",
    [
      "select",
      "explain",
      "english"
    ],
    [
      "common-lf6-diagnosis",
      "common-lf4-measures"
    ]
  ],
  [
    "common-lf6-closure",
    "LF6",
    [
      "verify",
      "record",
      "improve"
    ],
    [
      "common-lf6-solution"
    ]
  ],
  ["common-lf7-components", "LF7", ["roles", "flow"], ["common-lf3-physical", "common-lf5-control"]],
  ["common-lf7-signals", "LF7", ["signal", "flows", "communication"], ["common-lf7-components", "common-lf3-protocols"]],
  ["common-lf7-extension", "LF7", ["requirements", "selection", "plan"], ["common-lf7-signals", "common-lf2-workplace"]],
  ["common-lf7-logic", "LF7", ["implement", "failure"], ["common-lf7-extension", "common-lf5-functions"]],
  ["common-lf7-verification", "LF7", ["test", "energy", "record"], ["common-lf7-logic", "common-lf4-measures"]],
  ["common-lf8-sources", "LF8", ["inspect", "quality"], ["common-lf5-storage", "common-lf4-privacy"]],
  ["common-lf8-formats", "LF8", ["read", "mapping"], ["common-lf8-sources", "common-lf5-types"]],
  ["common-lf8-queries", "LF8", ["join", "aggregate", "check"], ["common-lf8-formats", "common-lf5-sql"]],
  ["common-lf8-interfaces", "LF8", ["contract", "transfer", "team"], ["common-lf8-queries", "common-lf3-services", "common-lf5-functions"]],
  ["common-lf8-integrity", "LF8", ["validate", "transaction", "rights"], ["common-lf8-interfaces", "common-lf4-measures"]],
  ["common-lf8-delivery", "LF8", ["test", "guide", "reflect"], ["common-lf8-integrity"]],
  ["common-lf9-requirements", "LF9", ["collect", "criteria"], ["common-lf3-diagnosis", "common-lf2-requirements"]],
  ["common-lf9-design", "LF9", ["structure", "compare"], ["common-lf9-requirements", "common-lf3-addressing"]],
  ["common-lf9-services", "LF9", ["configure", "dependencies"], ["common-lf9-design", "common-lf3-services"]],
  ["common-lf9-security", "LF9", ["access", "continuity", "updates"], ["common-lf9-services", "common-lf4-measures"]],
  ["common-lf9-monitoring", "LF9", ["observe", "isolate", "privacy"], ["common-lf9-security", "common-lf6-diagnosis"]],
  ["common-lf9-handover", "LF9", ["evidence", "handover", "improve"], ["common-lf9-monitoring", "common-lf6-closure"]]
];
const NEW_IDS = NEW_CONTRACTS.map(([id]) => id);
const DIAGNOSIS_FILE = 'topics/common-lf3-diagnosis.v1.json';
const HANDOVER_FILE = 'topics/common-lf2-handover.v1.json';
const STAGE_IDS = ['LF1', 'WISO', 'PM', ...Array.from({ length: 8 }, (_, index) => `LF${index + 2}`), 'LF10a', 'LF11a', 'LF12a'];
const EUROPE_FILE = 'topics/common-wiso-europe.v1.json';
const PRESENTATION_FILE = 'topics/common-lf1-presentation.v1.json';

function sixTopicFixture() {
  const data = twoTopicFixture();
  const original = fixture();
  for (const [suffix, goalSuffixes, prerequisiteSuffixes] of [
    ['market', ['relations', 'offer'], ['role']],
    ['value-chain', ['steps', 'contribution'], ['market']],
    ['organization', ['structure', 'legalform', 'authority'], ['value-chain']],
    ['presentation', ['prepare', 'present', 'improve'], ['goals', 'organization']],
  ]) {
    const id = `common-lf1-${suffix}`;
    const goalMap = new Map(['value', 'team', 'responsibility'].map((goal, index) => [`common-lf1-role-${goal}`, `${id}-${goalSuffixes[index % goalSuffixes.length]}`]));
    const convert = (value) => {
      if (Array.isArray(value)) return value.map(convert);
      if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, convert(item)]));
      if (typeof value !== 'string') return value;
      return goalMap.get(value) ?? value.replaceAll('common-lf1-role', id).replaceAll('LJ-LF1-ROLE', `LJ-LF1-${suffix.toUpperCase()}`).replace(/^(block|interview|card)-/, `${suffix}-$1-`);
    };
    const entry = convert(original.manifest.topics[0]);
    const doc = convert(docOf(original));
    entry.objectives = doc.objectives = entry.objectives.slice(0, goalSuffixes.length);
    entry.prerequisites = doc.prerequisites = prerequisiteSuffixes.map((item) => `common-lf1-${item}`);
    const index = data.manifest.fields[0].topicIds.length;
    data.manifest.topics.splice(index, 0, entry);
    data.manifest.sequence.splice(index, 0, id);
    data.manifest.fields[0].topicIds.push(id);
    data.topicDocs[entry.contentFile] = doc;
    data.questionsByFile[doc.questionFile] = convert(rowsOf(original));
    if (suffix === 'presentation') {
      doc.interview[1].practice = { task: 'Erstelle eine Darstellung und trage sie vor.', checklist: ['Prüfe die Zielgruppe.', 'Verbessere die Darstellung.'], confirmation: 'Ich habe die Darstellung erstellt, vorgetragen und geprüft.' };
      doc.interview[2].blockIds.push(doc.blocks[3].id);
      for (const link of doc.questionLinks.filter((item) => item.phase === 'exam')) link.blockIds.push(doc.blocks[3].id);
      doc.fieldReview = { fieldId: 'LF1', topicIds: [...LF1_IDS], blockIds: [doc.blocks[3].id], interviewIds: [doc.interview[2].id], questionIds: [...doc.exam.questionIds] };
    }
  }
  return data;
}

function rejectsReview(name, mutate, expected) {
  test(name, () => {
    const data = sixTopicFixture();
    mutate(data.topicDocs[PRESENTATION_FILE], data);
    assert.match(validate(data).join('\n'), expected);
  });
}

function rejectsSecond(name, mutate, expected) {
  test(name, () => {
    const data = twoTopicFixture();
    mutate(data, goalsDocOf(data));
    assert.match(validate(data).join('\n'), expected);
  });
}

function rejects(name, mutate, expected) {
  test(name, () => {
    const data = fixture();
    mutate(data);
    const errors = validate(data);
    assert.ok(errors.length, 'Die verletzte Inhaltsregel wurde nicht erkannt.');
    assert.match(errors.join('\n'), expected);
  });
}

function writeFixture(t) {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'azubiprep-journey-test-'));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  const root = path.join(temp, 'journey');
  fs.mkdirSync(path.join(root, 'topics'), { recursive: true });
  fs.mkdirSync(path.join(root, 'questions'));
  const data = fixture();
  fs.writeFileSync(path.join(root, 'fiae.v1.json'), JSON.stringify(data.manifest));
  fs.writeFileSync(path.join(root, CONTENT_FILE), JSON.stringify(docOf(data)));
  fs.writeFileSync(path.join(root, QUESTION_FILE), writeCsv(COLUMNS, rowsOf(data)));
  return { root, temp, data };
}

test('vollständiges eigenständiges Inhaltsfixture ist gültig', () => {
  assert.deepEqual(validate(fixture()), []);
});

test('ausgelieferte Lernreise erfüllt den Inhaltsvertrag', () => {
  assert.deepEqual(validate(loadJourney()), []);
});

test('zweites Thema hat zwei Lernziele bei unverändertem Vertrag des ersten', () => {
  const data = twoTopicFixture();
  assert.equal(docOf(data).objectives.length, 3);
  assert.equal(goalsDocOf(data).objectives.length, 2);
  assert.deepEqual(validate(data), []);
});

test('additive Freigabe erhält Manifestversion und liefert 94 getrennte Themen', () => {
  const data = loadJourney();
  const ready = data.manifest.topics.filter((topic) => topic.status === 'content-ready');
  assert.equal(data.manifest.version, '1.0.0');
  assert.equal(data.manifest.topics.length, 94);
  assert.equal(data.manifest.fields.length, 14);
  assert.equal(data.manifest.topics.reduce((sum, topic) => sum + topic.objectives.length, 0), 248);
  assert.deepEqual(data.manifest.plannedStages, []);
  assert.deepEqual(data.manifest.stageOrder, STAGE_IDS);
  assert.deepEqual(ready.map(topic => topic.id), data.manifest.sequence);
  assert.deepEqual(ready.slice(0, 74).map(topic => topic.id), [...ALL_IDS, ...NEW_IDS]);
  assert.deepEqual(['LF10a', 'LF11a', 'LF12a'].map(field => ready.filter(t => t.fieldId === field && t.scope === 'specialization').length), [6, 7, 7]);
  assert.deepEqual(goalsDocOf(data).prerequisites, ['common-lf1-role']);
  assert.deepEqual(goalsDocOf(data).objectives.map((goal) => goal.id), ['common-lf1-goals-classify', 'common-lf1-goals-balance']);
  assert.equal(docOf(data).version, '1.0.0');
  assert.equal(goalsDocOf(data).version, '1.0.0');
  const firstIds = new Set(rowsOf(data).map((row) => row.id));
  assert.equal(data.questionsByFile[GOALS_QUESTION_FILE].length, 14);
  assert.ok(data.questionsByFile[GOALS_QUESTION_FILE].every((row) => !firstIds.has(row.id)));
  const allQuestions = Object.values(data.questionsByFile).flat();
  assert.equal(allQuestions.length, 1316);
  assert.equal(new Set(allQuestions.map((question) => question.id)).size, 1316);
  const docs = Object.values(data.topicDocs);
  assert.deepEqual(['objectives', 'blocks', 'interview', 'cards'].map((key) => docs.reduce((sum, doc) => sum + doc[key].length, 0)), [248, 376, 282, 564]);
  assert.equal(data.manifest.topics.filter((topic) => topic.status === 'planned').length, 0);
  for (const {id} of ready) {
    const doc = data.topicDocs[`topics/${id}.v1.json`];
    assert.deepEqual([doc.blocks.length, doc.quiz.questionIds.length, doc.exam.questionIds.length, doc.interview.length, doc.cards.length], [4, 6, 8, 3, 6]);
  }
});

test('jedes der 248 Lernziele wird erklärt, geübt, reflektiert, wiederholt und geprüft', () => {
  const { topicDocs } = loadJourney();
  let count = 0;
  for (const topic of Object.values(topicDocs)) {
    const quiz = topic.questionLinks.filter(link => topic.quiz.questionIds.includes(link.questionId));
    const exam = topic.questionLinks.filter(link => topic.exam.questionIds.includes(link.questionId));
    for (const goal of topic.objectives) {
      const blocks = topic.blocks.filter(block => block.objectiveIds.includes(goal.id));
      assert.ok(blocks.length, goal.id);
      for (const phase of [quiz, topic.interview, topic.cards, exam]) {
        assert.ok(phase.some(item => item.objectiveIds.includes(goal.id) &&
          item.blockIds.some(id => blocks.some(block => block.id === id))), goal.id);
      }
      count++;
    }
  }
  assert.equal(count, 248);
});

test('FIAE-Fragen müssen zur Fachrichtung und Quellenlektion passen', () => {
  const data = loadJourney();
  const id = 'fiae-lf11a-security';
  const doc = data.topicDocs[`topics/${id}.v1.json`];
  data.questionsByFile[doc.questionFile][0].fachrichtung = 'ALLE';
  assert.ok(validate(data).some(issue => issue.includes('fachrichtung')));
});

test('sechs eigenständige Themen mit Praxisaufgabe und vollständigem Rückblick sind gültig', () => {
  assert.deepEqual(validate(sixTopicFixture()), []);
});

rejectsReview('veröffentlichte Präsentation braucht einen Rückblick', (doc) => { delete doc.fieldReview; }, /fieldReview: Objekt erwartet/);
rejectsReview('Rückblick lehnt unbekannte Felder ab', (doc) => { doc.fieldReview.passed = true; }, /fieldReview.*Genau diese Felder/);
rejectsReview('Rückblick braucht LF1', (doc) => { doc.fieldReview.fieldId = 'LF2'; }, /fieldReview.fieldId.*Erwartet: LF1/);
rejectsReview('Rückblick braucht alle sechs Themen', (doc) => { doc.fieldReview.topicIds.pop(); }, /fieldReview.topicIds/);
rejectsReview('Rückblick braucht die veröffentlichte Reihenfolge', (doc) => { doc.fieldReview.topicIds.reverse(); }, /fieldReview.topicIds.*Reihenfolge/);
rejectsReview('Rückblick lehnt fremde Themen ab', (doc) => { doc.fieldReview.topicIds[0] = 'topic-lf2'; }, /fieldReview.topicIds.*Alle Themen/);
rejectsReview('Rückblick darf kein geplantes Thema als veröffentlicht ausgeben', (_doc, data) => { data.manifest.topics[2].status = 'planned'; }, /fieldReview.topics.common-lf1-market.status.*content-ready/);
rejectsReview('Rückblick braucht den vierten Block', (doc) => { doc.fieldReview.blockIds = [doc.blocks[0].id]; }, /fieldReview.blockIds.*stimmen nicht/);
rejectsReview('Rückblick braucht die dritte Reflexion', (doc) => { doc.fieldReview.interviewIds = [doc.interview[1].id]; }, /fieldReview.interviewIds.*stimmen nicht/);
rejectsReview('Rückblick braucht alle acht Testfragen', (doc) => { doc.fieldReview.questionIds.pop(); }, /fieldReview.questionIds/);
rejectsReview('Rückblick darf keine Quizfrage als Test ausgeben', (doc) => { doc.fieldReview.questionIds[0] = doc.quiz.questionIds[0]; }, /fieldReview.questionIds.*stimmen nicht/);
rejectsReview('Rückblick darf keine fremde Testfrage verwenden', (doc) => { doc.fieldReview.questionIds[0] = 'LJ-LF1-ROLE-E01'; }, /fieldReview.questionIds.*stimmen nicht/);
rejectsReview('Rückblickreflexion muss auf den Rückblickblock verweisen', (doc) => { doc.interview[2].blockIds.pop(); }, /fieldReview.interviewIds.*vierten Theorieblock/);
rejectsReview('Abschlusstest muss auf den Rückblickblock verweisen', (doc) => { doc.questionLinks.find((link) => link.phase === 'exam').blockIds.pop(); }, /fieldReview.questionIds.*Rückblickblock/);
rejectsReview('Praxisaufgabe muss in der zweiten Reflexion vorliegen', (doc) => { delete doc.interview[1].practice; }, /practice: Objekt erwartet/);
rejectsReview('Praxisaufgabe darf nicht zur ersten Reflexion wandern', (doc) => { doc.interview[0].practice = doc.interview[1].practice; delete doc.interview[1].practice; }, /practice.*nur in der zweiten/);
rejectsReview('Praxisaufgabe verlangt eine konkrete Aufgabe', (doc) => { doc.interview[1].practice.task = ''; }, /practice.task.*Nichtleerer/);
rejectsReview('Praxisaufgabe verlangt eine Selbstprüfliste', (doc) => { doc.interview[1].practice.checklist = []; }, /practice.checklist.*Mindestens 1/);
rejectsReview('Praxisaufgabe lehnt leere Prüfkriterien ab', (doc) => { doc.interview[1].practice.checklist = [' ']; }, /practice.checklist.*Nichtleerer/);
rejectsReview('Praxisaufgabe lehnt doppelte Prüfkriterien ab', (doc) => { doc.interview[1].practice.checklist = ['Prüfen', 'Prüfen']; }, /practice.checklist.*Doppelte/);
rejectsReview('Praxisaufgabe braucht einen bewussten Bestätigungstext', (doc) => { delete doc.interview[1].practice.confirmation; }, /practice.confirmation.*Nichtleerer/);
rejectsReview('Praxisaufgabe darf keine objektive Bewertung behaupten', (doc) => { doc.interview[1].practice.passed = true; }, /practice.*Genau diese Felder/);
rejectsReview('andere Themen dürfen keinen Rückblick erklären', (doc, data) => { docOf(data).fieldReview = doc.fieldReview; }, /fieldReview.*nur im Präsentations-/);
rejectsReview('andere Themen dürfen keine Präsentationsbestätigung fordern', (doc, data) => { docOf(data).interview[1].practice = doc.interview[1].practice; }, /practice.*nur in der zweiten Präsentations-/);

for (const suffix of ['market', 'value-chain', 'organization', 'presentation']) {
  test(`neues Thema ${suffix} bindet Umfang, Lernziele, Voraussetzungen und eigenen Fragenpool`, () => {
    const mutations = [
      [(doc) => { doc.blocks.pop(); }, /blocks.*4/],
      [(doc) => { doc.interview.pop(); }, /interview.*3/],
      [(doc) => { doc.cards.pop(); }, /cards.*6/],
      [(doc) => { doc.quiz.questionIds[0] = 'LJ-LF1-ROLE-Q01'; }, /quiz.questionIds.*stimmen nicht/],
      [(doc) => { doc.exam.questionIds[0] = 'LJ-LF1-ROLE-E01'; }, /exam.questionIds.*stimmen nicht/],
      [(doc) => { doc.prerequisites = []; }, /prerequisites.*stimmen nicht/],
      [(doc) => { doc.objectives[0].id = `${doc.id}-invented`; }, /objectives.*stimmen nicht/],
      [(doc) => { doc.questionFile = QUESTION_FILE; }, /questionFile.*Erwartet/],
      [(doc) => { doc.review = { status: 'pending', checkedAt: null }; }, /review.status.*reviewed/],
    ];
    for (const [mutate, expected] of mutations) {
      const data = sixTopicFixture();
      mutate(data.topicDocs[`topics/common-lf1-${suffix}.v1.json`]);
      assert.match(validate(data).join('\n'), expected);
    }
  });
}

test('Themen dürfen dieselbe öffentliche Quelle an unterschiedlichen Tagen prüfen', () => {
  const data = twoTopicFixture();
  goalsDocOf(data).sources[0].checkedAt = '2026-11-11';
  assert.equal(data.manifest.sources[0].checkedAt, '2026-11-10');
  assert.deepEqual(validate(data), []);
});

rejectsSecond('zweites Thema benötigt ebenfalls vier Theorieblöcke', (_data, doc) => { doc.blocks.pop(); }, /blocks.*Mindestens 4/);
rejectsSecond('zusätzlicher Theorieblock verletzt den vereinbarten Umfang', (_data, doc) => {
  doc.blocks.push({ ...doc.blocks[0], id: 'goals-extra-block' });
}, /blocks.length.*Erwartet: 4/);
rejectsSecond('zweites Thema benötigt sechs getrennte Quizfragen', (_data, doc) => { doc.quiz.questionIds.pop(); }, /quiz.questionIds.*stimmen nicht/);
rejectsSecond('zweites Thema benötigt acht getrennte Testfragen', (_data, doc) => { doc.exam.questionIds.pop(); }, /exam.questionIds.*stimmen nicht/);
rejectsSecond('zweites Thema benötigt drei Gesprächsimpulse', (_data, doc) => { doc.interview.pop(); }, /interview.*Mindestens 3/);
rejectsSecond('zweites Thema benötigt sechs Karten', (_data, doc) => { doc.cards.pop(); }, /cards.*Mindestens 6/);
rejectsSecond('zweites Thema darf kein erfundenes drittes Lernziel erhalten', (data, doc) => {
  const extra = { id: 'common-lf1-goals-extra', text: 'Ein unvereinbartes weiteres Lernziel.' };
  data.manifest.topics[1].objectives.push(extra);
  doc.objectives.push(extra);
}, /objectives: IDs stimmen nicht/);
rejectsSecond('zweites Thema lehnt fremden Fragenpräfix ab', (_data, doc) => { doc.quiz.questionIds[0] = 'LJ-LF1-ROLE-Q01'; }, /quiz.questionIds.*stimmen nicht/);
rejectsSecond('Fragen-IDs dürfen zwischen freigegebenen Themen nicht geteilt werden', (data) => {
  data.questionsByFile[GOALS_QUESTION_FILE][0].id = rowsOf(data)[0].id;
}, /Fragen-ID wird in mehreren Dateien/);
rejectsSecond('zweites Thema hält ebenfalls an Single Choice fest', (data) => {
  data.questionsByFile[GOALS_QUESTION_FILE][0].typ = 'MC';
  data.questionsByFile[GOALS_QUESTION_FILE][0].antwort = 'a,b';
}, /typ.*Erwartet: SC/);
rejectsSecond('zweites Thema verlangt die feste LF1-Zuordnung', (data) => {
  data.questionsByFile[GOALS_QUESTION_FILE][0].lernfeld = 'LF2';
}, /lernfeld.*Erwartet: LF1/);
rejectsSecond('zweites Thema bleibt bis zum unabhängigen Review gesperrt', (_data, doc) => {
  doc.review = { status: 'pending', checkedAt: null };
}, /review.status.*Erwartet: reviewed/);
rejectsSecond('abweichende Quellen-URL bleibt trotz eigenem Prüfdatum ungültig', (_data, doc) => {
  doc.sources[0].url = 'https://example.org/another-source';
}, /sources.*url.*Erwartet/);

for (const phase of ['quiz', 'exam', 'interview', 'cards']) {
  rejectsSecond(`zweites Thema deckt beide Lernziele in ${phase} ab`, (_data, doc) => {
    const items = ['quiz', 'exam'].includes(phase)
      ? doc.questionLinks.filter((link) => link.phase === phase) : doc[phase];
    for (const item of items) {
      item.objectiveIds = ['common-lf1-goals-classify'];
      item.blockIds = ['goals-block-1'];
    }
  }, new RegExp(`${phase}: Lernziel nicht abgedeckt: common-lf1-goals-balance`));
}

test('Loader liest JSON und quote-feste CSV ohne App-Konfiguration', (t) => {
  const { root, data } = writeFixture(t);
  rowsOf(data)[0].erklaerung = 'Ein Beispiel; mit "Anführungszeichen"\nund einem Absatz.';
  fs.writeFileSync(path.join(root, QUESTION_FILE), '\uFEFF' + writeCsv(COLUMNS, rowsOf(data)));
  const loaded = loadJourney(root);
  assert.deepEqual(validate(loaded), []);
  assert.equal(rowsOf(loaded)[0].erklaerung, rowsOf(data)[0].erklaerung);
});

rejects('unbekannte Fragen-ID fällt auf', (data) => { docOf(data).quiz.questionIds[0] = 'LJ-LF1-ROLE-Q99'; }, /Unbekannte Referenz/);
rejects('Übungsfrage darf nicht in den Mini-Test gelangen', (data) => { docOf(data).exam.questionIds[0] = docOf(data).quiz.questionIds[0]; }, /Poolüberschneidung/);
rejects('doppelte CSV-Fragen-IDs fallen auf', (data) => { rowsOf(data)[1].id = rowsOf(data)[0].id; }, /Doppelte ID/);
rejects('doppelte Themen-IDs fallen auf', (data) => { data.manifest.topics.push(structuredClone(data.manifest.topics[0])); }, /Doppelte ID/);
rejects('doppelte Karten-IDs fallen auf', (data) => { docOf(data).cards[1].id = docOf(data).cards[0].id; }, /Doppelte ID/);
rejects('Inhalts-IDs bleiben auch über Sammlungen hinweg eindeutig', (data) => { docOf(data).cards[0].id = docOf(data).blocks[0].id; }, /Doppelte Inhalts-ID/);
rejects('unbekannte Voraussetzung fällt auf', (data) => { data.manifest.topics[1].prerequisites.push('unknown-topic'); }, /Unbekannte Referenz/);
rejects('Voraussetzungszyklus wird erkannt', (data) => { data.manifest.topics[0].prerequisites.push(data.manifest.topics[1].id); }, /Zyklus/);
rejects('Selbstabhängigkeit wird erkannt', (data) => { data.manifest.topics[1].prerequisites.push(data.manifest.topics[1].id); }, /Zyklus/);
rejects('bekannte, aber zu späte Voraussetzung fällt auf', (data) => { data.manifest.topics[1].prerequisites.push(data.manifest.topics[2].id); }, /muss früher/);
rejects('Spezialisierung vor einem gemeinsamen Thema fällt auf', (data) => { data.manifest.sequence.splice(1, 0, data.manifest.sequence.pop()); }, /gemeinsamen Themen/);
rejects('unvollständige Reihenfolge fällt auf', (data) => { data.manifest.sequence.pop(); }, /manifest.sequence.*stimmen nicht/);
rejects('doppelte Sequenz-ID fällt auf', (data) => { data.manifest.sequence.push(data.manifest.sequence[0]); }, /manifest.sequence.*Doppelte/);
rejects('WISO als Pflichtbereich darf nicht verschwinden', (data) => { data.manifest.fields = data.manifest.fields.filter((field) => field.id !== 'WISO'); }, /Pflicht-Lernfeld fehlt: WISO/);
rejects('falsche Lernfeldzuordnung im Dokument fällt auf', (data) => { docOf(data).fieldId = 'LF2'; }, /fieldId.*Erwartet: LF1/);
rejects('abweichender Lernzieltext fällt auf', (data) => { docOf(data).objectives[0].text = 'Ein anderes Lernziel.'; }, /objectives.*text.*Erwartet/);
rejects('fehlende Theorie wird erkannt', (data) => { docOf(data).blocks.splice(0, 2); }, /blocks.*Mindestens 4/);
rejects('falscher Theorieblock erklärt das zugeordnete Ziel nicht', (data) => { docOf(data).questionLinks[0].blockIds = ['block-2']; }, /Theorie erklärt Lernziel/);
rejects('unbekannter Theorieblock fällt auf', (data) => { docOf(data).questionLinks[0].blockIds = ['unknown-block']; }, /Unbekannte Referenz: unknown-block/);
rejects('Quiz muss alle Lernziele abdecken', (data) => {
  for (const link of docOf(data).questionLinks.filter((item) => item.phase === 'quiz')) {
    link.objectiveIds = ['common-lf1-role-value']; link.blockIds = ['block-1'];
  }
}, /quiz: Lernziel nicht abgedeckt/);
rejects('Mini-Test muss alle Lernziele abdecken', (data) => {
  for (const link of docOf(data).questionLinks.filter((item) => item.phase === 'exam')) {
    link.objectiveIds = ['common-lf1-role-value']; link.blockIds = ['block-1'];
  }
}, /exam: Lernziel nicht abgedeckt/);
rejects('Gesprächsimpulse müssen alle Lernziele abdecken', (data) => {
  docOf(data).interview[1].objectiveIds = ['common-lf1-role-value']; docOf(data).interview[1].blockIds = ['block-1'];
}, /interview: Lernziel nicht abgedeckt/);
rejects('Karten müssen alle Lernziele abdecken', (data) => {
  for (const card of docOf(data).cards) { card.objectiveIds = ['common-lf1-role-value']; card.blockIds = ['block-1']; }
}, /cards: Lernziel nicht abgedeckt/);
rejects('leerer Erwartungshorizont wird erkannt', (data) => { docOf(data).interview[0].keyPoints = []; }, /keyPoints.*Mindestens 1/);
rejects('fehlende akzeptierte Alternativen werden erkannt', (data) => { docOf(data).interview[0].acceptableAlternatives = ['   ']; }, /acceptableAlternatives.*Nichtleerer/);
rejects('fehlende Kartenrückseite wird erkannt', (data) => { docOf(data).cards[0].back = ''; }, /back.*Nichtleerer/);
rejects('planned verlangt eine sichtbare Lücke', (data) => { data.manifest.topics[1].gaps = []; }, /Geplante Themen/);
rejects('planned darf kein fertiges Dokument behaupten', (data) => { data.manifest.topics[1].contentFile = CONTENT_FILE; }, /contentFile.*Erwartet: null/);
rejects('content-ready braucht ein Dokument', (data) => { delete data.topicDocs[CONTENT_FILE]; }, /Themendokument fehlt/);
rejects('content-ready ist mit pending-Review unvereinbar', (data) => { docOf(data).review = { status: 'pending', checkedAt: null }; }, /review.status.*Erwartet: reviewed/);
rejects('content-ready darf keine Inhaltslücke enthalten', (data) => { data.manifest.topics[0].gaps = ['Theorie fehlt.']; }, /Fertige Inhalte/);
rejects('CSV muss vollständig einem Pool angehören', (data) => { rowsOf(data).push({ ...rowsOf(data)[0], id: 'LJ-LF1-ROLE-Q99' }); }, /questions\/pools.*stimmen nicht/);
rejects('jede Frage braucht eine Zuordnung', (data) => { docOf(data).questionLinks.pop(); }, /questionLinks.*stimmen nicht/);
rejects('Zuordnung in den falschen Pool fällt auf', (data) => { docOf(data).questionLinks[0].phase = 'exam'; }, /angegebenen Pool/);
rejects('leere Antwort wird erkannt', (data) => { rowsOf(data)[0].antwort = ''; }, /SC verlangt/);
rejects('ungültige SC-Antwort wird erkannt', (data) => { rowsOf(data)[0].antwort = 'a,b'; }, /SC verlangt/);
rejects('MC-Antwort darf keine Buchstaben doppeln', (data) => { rowsOf(data)[0].typ = 'MC'; rowsOf(data)[0].antwort = 'a,a'; }, /MC verlangt/);
rejects('Pilot bleibt bei SC', (data) => { rowsOf(data)[0].typ = 'MC'; rowsOf(data)[0].antwort = 'a,b'; }, /typ.*Erwartet: SC/);
rejects('gleichlautende Optionen werden trotz Großschreibung erkannt', (data) => { rowsOf(data)[0].option_b = '  BEGRÜNDETE ANTWORT. '; }, /Doppelte Antwortoptionen/);
rejects('falscher Lernfeldwert in CSV fällt auf', (data) => { rowsOf(data)[0].lernfeld = 'LF2'; }, /lernfeld.*Erwartet: LF1/);
rejects('abweichender Thementitel in CSV fällt wie im Backend auf', (data) => { rowsOf(data)[0].thema = 'Fremdes Thema'; }, /thema.*Erwartet:/);
rejects('fehlende CSV-Spalte fällt auf', (data) => { delete rowsOf(data)[0].quelle; }, /quelle.*Nichtleerer/);
rejects('Quelle ohne HTTPS fällt auf', (data) => { data.manifest.sources[0].url = 'http://example.org/source'; }, /HTTPS/);
rejects('Quelle mit Zugangsdaten fällt auf', (data) => { data.manifest.sources[0].url = 'https://name:password@example.org/source'; }, /HTTPS/);
rejects('unbekannte Blockquelle fällt auf', (data) => { docOf(data).blocks[0].sourceIds = ['unknown-source']; }, /Unbekannte Referenz: unknown-source/);
rejects('ungültiges Kalenderdatum fällt auf', (data) => { data.manifest.sources[0].checkedAt = '2026-02-30'; }, /Gültiges Datum/);
rejects('ungültige Inhaltsversion fällt auf', (data) => { docOf(data).version = 'v1'; }, /MAJOR.MINOR.PATCH/);
rejects('nicht vorgesehener Veröffentlichungsstatus fällt auf', (data) => { data.manifest.publicationStatus = 'published'; }, /publicationStatus.*content-only/);
rejects('fehlendes Objekt wird als Fehler gemeldet', (data) => { docOf(data).exam = null; }, /exam: Objekt erwartet/);
rejects('falscher Arraytyp wird als Fehler gemeldet', (data) => { docOf(data).questionLinks = {}; }, /questionLinks: Array erwartet/);
rejects('Objekt statt Themen-ID wird ohne Abbruch gemeldet', (data) => { data.manifest.topics[0].id = { toString: null }; }, /Gültige stabile ID/);
rejects('Objekt statt Dokument-ID wird ohne Abbruch gemeldet', (data) => { docOf(data).id = { toString: null }; }, /Unbekannte Themen-ID/);
rejects('Objekt statt Fragenpfad wird ohne Abbruch gemeldet', (data) => { docOf(data).questionFile = { toString: null }; }, /Sicherer relativer/);

test('unvollständige und falsche Strukturen liefern Fehlerarrays statt Abbrüchen', () => {
  for (const value of [undefined, null, true, 'text', [], {}, { topics: [null, {}], fields: [null], sequence: [] }]) {
    assert.ok(validateJourney(value, null, null).length > 0);
  }
});

for (const unsafe of ['../outside.json', 'topics/../../outside.json', '/topics/outside.json', 'topics\\outside.json', 'C:/topics/outside.json', 'https://example.org/topics/outside.json', 'topics//outside.json', 'topics/./outside.json', 'topics/.../outside.json', 'topics/%2e%2e/outside.json']) {
  test(`Loader blockiert unsicheren Dokumentpfad ${unsafe}`, (t) => {
    const { root, data } = writeFixture(t);
    data.manifest.topics[0].contentFile = unsafe;
    fs.writeFileSync(path.join(root, 'fiae.v1.json'), JSON.stringify(data.manifest));
    assert.throws(() => loadJourney(root), /Ungültiger contentFile-Pfad/);
    assert.match(validate(data).join('\n'), /Sicherer relativer/);
  });
}

test('Loader blockiert Traversal auch im Fragenpfad', (t) => {
  const { root, data } = writeFixture(t);
  docOf(data).questionFile = '../outside.csv';
  fs.writeFileSync(path.join(root, CONTENT_FILE), JSON.stringify(docOf(data)));
  assert.throws(() => loadJourney(root), /Ungültiger questionFile-Pfad/);
});

test('Loader blockiert ausbrechende Verzeichnisverknüpfung vor dem Lesen', (t) => {
  const { root, temp } = writeFixture(t);
  const outside = path.join(temp, 'outside');
  fs.mkdirSync(outside);
  const link = path.join(root, 'topics');
  fs.unlinkSync(path.join(root, CONTENT_FILE));
  fs.rmdirSync(link);
  fs.symlinkSync(outside, link, process.platform === 'win32' ? 'junction' : 'dir');
  assert.throws(() => loadJourney(root), /Symbolische Verknüpfungen/);
});

test('Loader erkennt unvereinbare CSV-Kopfzeile', (t) => {
  const { root } = writeFixture(t);
  fs.writeFileSync(path.join(root, QUESTION_FILE), 'id;antwort\nLJ-LF1-ROLE-Q01;a\n');
  assert.throws(() => loadJourney(root), /15 Spalten/);
});

test('Loader erkennt überzählige CSV-Felder statt sie still zu verwerfen', (t) => {
  const { root, data } = writeFixture(t);
  const csv = writeCsv(COLUMNS, rowsOf(data)).trimEnd().split('\n');
  csv[1] += ';extra';
  fs.writeFileSync(path.join(root, QUESTION_FILE), csv.join('\n') + '\n');
  assert.throws(() => loadJourney(root), /genau 15 Spalten/);
});

test('Loader meldet ungültiges JSON ohne Dateiinhalte auszugeben', (t) => {
  const { root } = writeFixture(t);
  fs.writeFileSync(path.join(root, CONTENT_FILE), 'THIS_IS_TEST_CONTENT_AND_MUST_NOT_APPEAR');
  assert.throws(() => loadJourney(root), (error) => /Ungültiges JSON/.test(error.message) && !error.message.includes('THIS_IS_TEST_CONTENT'));
});

test('CLI ignoriert Datenpfad-Umgebungsvariablen und lehnt alternative Pfade ab', () => {
  const env = { PATH: process.env.PATH, SystemRoot: process.env.SystemRoot, CONTENT_DIR: 'C:/intentionally-not-used', DATABASE_URL: 'invalid-test-value' };
  const rejected = spawnSync(process.execPath, [VALIDATOR, '../outside'], { encoding: 'utf8', env });
  assert.equal(rejected.status, 1);
  assert.match(rejected.stderr, /keine Pfadargumente/);
  const ordinary = spawnSync(process.execPath, [VALIDATOR], { encoding: 'utf8', env, cwd: os.tmpdir() });
  assert.equal(ordinary.status, 0, ordinary.stderr);
  assert.match(ordinary.stdout, /Lernreise gültig/);
  assert.match(ordinary.stdout, /94 freigegebene Abschnitte, 1316 Fragen/);
  assert.doesNotMatch(ordinary.stdout, /Keine App-Anbindung/);
});


function sixteenTopicFixture() {
  const data = sixTopicFixture();
  const original = fixture();
  data.manifest.topics = data.manifest.topics.filter((topic) => topic.fieldId !== 'WISO');
  data.manifest.sequence = data.manifest.sequence.filter((id) => id !== 'topic-wiso');
  data.manifest.fields.find((field) => field.id === 'WISO').topicIds = [...WISO_IDS];
  data.manifest.stageOrder = [...STAGE_IDS];
  data.manifest.plannedStages = [{ id: 'PM', title: 'Projektmanagement', status: 'planned' }];
  for (const [index, [suffix, goals, prerequisites]] of WISO_CONTRACTS.entries()) {
    const id = `common-wiso-${suffix}`;
    const goalMap = new Map(['value', 'team', 'responsibility'].map((goal, index) => [`common-lf1-role-${goal}`, `${id}-${goals[index % goals.length]}`]));
    const convert = (value) => {
      if (Array.isArray(value)) return value.map(convert);
      if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, convert(item)]));
      if (typeof value !== 'string') return value;
      return goalMap.get(value) ?? value.replaceAll('common-lf1-role', id).replaceAll('LJ-LF1-ROLE', `LJ-WISO-${suffix.toUpperCase()}`).replace(/^(block|interview|card)-/, `wiso-${suffix}-$1-`);
    };
    const entry = convert(original.manifest.topics[0]);
    const doc = convert(docOf(original));
    entry.objectives = doc.objectives = entry.objectives.slice(0, goals.length);
    entry.prerequisites = doc.prerequisites = [...prerequisites];
    entry.fieldId = doc.fieldId = 'WISO';
    data.manifest.topics.splice(6 + index, 0, entry);
    data.manifest.sequence.splice(6 + index, 0, id);
    data.topicDocs[entry.contentFile] = doc;
    data.questionsByFile[doc.questionFile] = convert(rowsOf(original)).map((row) => ({ ...row, lernfeld: 'KEIN_LF' }));
    if (suffix === 'europe') {
      doc.interview[2].blockIds.push(doc.blocks[3].id);
      for (const link of doc.questionLinks.filter((item) => item.phase === 'exam')) link.blockIds.push(doc.blocks[3].id);
      doc.fieldReview = { fieldId: 'WISO', topicIds: [...WISO_IDS], blockIds: [doc.blocks[3].id], interviewIds: [doc.interview[2].id], questionIds: [...doc.exam.questionIds] };
    }
  }
  return data;
}

function twentySixTopicFixture() {
  const data = sixteenTopicFixture();
  const original = fixture();
  data.manifest.fields.push({ id: 'PM', title: 'Projektmanagement', scope: 'common', topicIds: [...PM_IDS] });
  data.manifest.plannedStages = [];
  for (const [index, [suffix, goals, prerequisite]] of PM_CONTRACTS.entries()) {
    const id = `common-pm-${suffix}`;
    const goalMap = new Map(['value', 'team', 'responsibility'].map((goal, index) => [`common-lf1-role-${goal}`, `${id}-${goals[index]}`]));
    const convert = (value) => {
      if (Array.isArray(value)) return value.map(convert);
      if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, convert(item)]));
      if (typeof value !== 'string') return value;
      return goalMap.get(value) ?? value.replaceAll('common-lf1-role', id).replaceAll('LJ-LF1-ROLE', `LJ-PM-${suffix.toUpperCase()}`).replace(/^(block|interview|card)-/, `pm-${suffix}-$1-`);
    };
    const entry = convert(original.manifest.topics[0]);
    const doc = convert(docOf(original));
    entry.prerequisites = doc.prerequisites = [prerequisite];
    entry.fieldId = doc.fieldId = 'PM';
    data.manifest.topics.splice(16 + index, 0, entry);
    data.manifest.sequence.splice(16 + index, 0, id);
    data.topicDocs[entry.contentFile] = doc;
    data.questionsByFile[doc.questionFile] = convert(rowsOf(original)).map((row) => ({ ...row, modul_id: 'PM', lernfeld: 'KEIN_LF' }));
    if (suffix === 'closure') {
      doc.interview[2].blockIds.push(doc.blocks[3].id);
      for (const link of doc.questionLinks.filter((item) => item.phase === 'exam')) link.blockIds.push(doc.blocks[3].id);
      doc.fieldReview = { fieldId: 'PM', topicIds: [...PM_IDS], blockIds: [doc.blocks[3].id], interviewIds: [doc.interview[2].id], questionIds: [...doc.exam.questionIds] };
    }
  }
  return data;
}

test('26 unabhängige Themen unterstützen PM als zusätzliche Etappe ohne Praxisbestätigung', () => {
  const data = twentySixTopicFixture();
  assert.deepEqual(validate(data), []);
  for (const id of PM_IDS) assert.ok(data.topicDocs[`topics/${id}.v1.json`].interview.every((item) => !Object.hasOwn(item, 'practice')));
  assert.deepEqual(data.topicDocs['topics/common-pm-closure.v1.json'].fieldReview.topicIds, PM_IDS);
  delete data.manifest.stageOrder; delete data.manifest.plannedStages;
  assert.deepEqual(validate(data), []);
});

for (const [label, mutate, expected] of [
  ['fehlender Rückblick', (doc) => { delete doc.fieldReview; }, /fieldReview/],
  ['falsche Etappe', (doc) => { doc.fieldReview.fieldId = 'WISO'; }, /fieldReview.fieldId/],
  ['fehlendes Thema', (doc) => { doc.fieldReview.topicIds.pop(); }, /fieldReview.topicIds/],
  ['fremdes Thema', (doc) => { doc.fieldReview.topicIds[0] = WISO_IDS[0]; }, /fieldReview.topicIds/],
  ['vertauschte Themen', (doc) => { doc.fieldReview.topicIds.reverse(); }, /fieldReview.topicIds/],
  ['falscher Block', (doc) => { doc.fieldReview.blockIds = [doc.blocks[0].id]; }, /fieldReview.blockIds/],
  ['falsche Reflexion', (doc) => { doc.fieldReview.interviewIds = [doc.interview[1].id]; }, /fieldReview.interviewIds/],
  ['fehlende Testfrage', (doc) => { doc.fieldReview.questionIds.pop(); }, /fieldReview.questionIds/],
  ['Quizfrage', (doc) => { doc.fieldReview.questionIds[0] = doc.quiz.questionIds[0]; }, /fieldReview.questionIds/],
  ['fremde Testfrage', (doc) => { doc.fieldReview.questionIds[0] = 'LJ-PM-COSTS-E01'; }, /fieldReview.questionIds/],
  ['fehlender Theoriebezug in Reflexion', (doc) => { doc.interview[2].blockIds = [doc.blocks[0].id]; }, /fieldReview.interviewIds/],
  ['fehlender Theoriebezug im Test', (doc) => { doc.questionLinks.find((link) => link.phase === 'exam').blockIds = [doc.blocks[0].id]; }, /fieldReview.questionIds/],
  ['zusätzliche Abschlussaussage', (doc) => { doc.fieldReview.completed = true; }, /fieldReview/],
]) {
  test(`PM-Rückblick verhindert ${label}`, () => {
    const data = twentySixTopicFixture(); mutate(data.topicDocs['topics/common-pm-closure.v1.json']);
    assert.match(validate(data).join('\n'), expected);
  });
}

for (const id of PM_IDS) {
  test(`PM-Vertrag für ${id} bindet Metadaten, Umfang, Quellen und eigene Pools`, () => {
    const file = `topics/${id}.v1.json`;
    for (const mutate of [
      (doc) => { doc.fieldId = 'WISO'; },
      (doc) => { doc.prerequisites = []; },
      (doc) => { doc.objectives.pop(); },
      (doc) => { doc.blocks.pop(); },
      (doc) => { doc.quiz.questionIds.pop(); },
      (doc) => { doc.exam.questionIds[0] = 'LJ-WISO-EUROPE-E01'; },
      (doc) => { doc.interview.pop(); },
      (doc) => { doc.cards.pop(); },
      (doc) => { doc.questionFile = 'questions/common-wiso-europe.v1.csv'; },
      (doc) => { doc.sources[0].url = 'https://example.org/unregistered'; },
      (doc) => { doc.sources[0].url = 'http://example.org/source'; },
      (doc) => { doc.review.status = 'pending'; doc.review.checkedAt = null; },
      (doc) => { doc.questionLinks[0].blockIds = ['block-1']; },
      (doc) => { doc.interview[1].practice = { task: 'Aufgabe', checklist: ['Prüfung'], confirmation: 'Bestätigen' }; },
    ]) {
      const data = twentySixTopicFixture(); mutate(data.topicDocs[file]);
      assert.notDeepEqual(validate(data), []);
    }
    for (const [key, invalid, expected] of [['lernfeld', 'PM', /lernfeld.*KEIN_LF/], ['modul_id', 'WISO', /modul_id.*PM/]]) {
      const data = twentySixTopicFixture();
      data.questionsByFile[`questions/${id}.v1.csv`][0][key] = invalid;
      assert.match(validate(data).join('\n'), expected);
    }
  });
}

for (const [label, mutate] of [
  ['PM gleichzeitig als geplant', (data) => { data.manifest.plannedStages = [{ id: 'PM', title: 'Projektmanagement', status: 'planned' }]; }],
  ['PM mit fremdem Thema', (data) => { data.manifest.fields.find((field) => field.id === 'PM').topicIds[0] = WISO_IDS[0]; }],
  ['PM mit unvollständiger Themenliste', (data) => { data.manifest.fields.find((field) => field.id === 'PM').topicIds.pop(); }],
  ['PM mit falsch geformter Themenliste', (data) => { data.manifest.fields.find((field) => field.id === 'PM').topicIds = 'common-pm-project'; }],
  ['PM außerhalb der gemeinsamen Grundlagen', (data) => { data.manifest.fields.find((field) => field.id === 'PM').scope = 'specialization'; }],
  ['PM vor WISO', (data) => { [data.manifest.sequence[15], data.manifest.sequence[16]] = [data.manifest.sequence[16], data.manifest.sequence[15]]; }],
  ['zusätzliche freie Etappe', (data) => { data.manifest.fields.push({ id: 'CUSTOM', title: 'Frei', scope: 'common', topicIds: [] }); }],
  ...[...LF1_IDS, ...WISO_IDS, ...PM_IDS.slice(0, -1)].map((id) => [`fehlende Freigabe ${id}`, (data) => { data.manifest.topics.find((topic) => topic.id === id).status = 'planned'; }]),
]) {
  test(`PM-Etappenvertrag verhindert ${label}`, () => {
    const data = twentySixTopicFixture(); mutate(data);
    assert.notDeepEqual(validate(data), []);
  });
}

test('16 unabhängige Themen und optionale Etappenmetadaten sind gültig', () => {
  const data = sixteenTopicFixture();
  assert.deepEqual(validate(data), []);
  delete data.manifest.stageOrder; delete data.manifest.plannedStages;
  assert.deepEqual(validate(data), []);
});

for (const [label, mutate, expected] of [
  ['fehlender Rückblick', (doc) => { delete doc.fieldReview; }, /fieldReview/],
  ['falsche Etappe', (doc) => { doc.fieldReview.fieldId = 'LF1'; }, /fieldReview.fieldId/],
  ['fehlendes Thema', (doc) => { doc.fieldReview.topicIds.pop(); }, /fieldReview.topicIds/],
  ['fremdes Thema', (doc) => { doc.fieldReview.topicIds[0] = LF1_IDS[0]; }, /fieldReview.topicIds/],
  ['vertauschte Themen', (doc) => { doc.fieldReview.topicIds.reverse(); }, /fieldReview.topicIds/],
  ['falscher Block', (doc) => { doc.fieldReview.blockIds = [doc.blocks[0].id]; }, /fieldReview.blockIds/],
  ['falsche Reflexion', (doc) => { doc.fieldReview.interviewIds = [doc.interview[1].id]; }, /fieldReview.interviewIds/],
  ['fehlende Testfrage', (doc) => { doc.fieldReview.questionIds.pop(); }, /fieldReview.questionIds/],
  ['Quizfrage', (doc) => { doc.fieldReview.questionIds[0] = doc.quiz.questionIds[0]; }, /fieldReview.questionIds/],
  ['fremde Testfrage', (doc) => { doc.fieldReview.questionIds[0] = 'LJ-WISO-TRAINING-E01'; }, /fieldReview.questionIds/],
  ['fehlender Theoriebezug in Reflexion', (doc) => { doc.interview[2].blockIds = [doc.blocks[0].id]; }, /fieldReview.interviewIds/],
  ['fehlender Theoriebezug im Test', (doc) => { doc.questionLinks.find((link) => link.phase === 'exam').blockIds = [doc.blocks[0].id]; }, /fieldReview.questionIds/],
  ['zusätzliche Abschlussaussage', (doc) => { doc.fieldReview.completed = true; }, /fieldReview/],
  ['unerlaubte Praxispflicht', (doc) => { doc.interview[1].practice = { task: 'Aufgabe', checklist: ['Prüfung'], confirmation: 'Bestätigen' }; }, /practice/],
]) {
  test(`WISO-Rückblick verhindert ${label}`, () => {
    const data = sixteenTopicFixture(); mutate(data.topicDocs[EUROPE_FILE]);
    assert.match(validate(data).join('\n'), expected);
  });
}

for (const id of WISO_IDS) {
  test(`WISO-Vertrag für ${id} bindet Metadaten, Umfang, Quellen und eigene Pools`, () => {
    const file = `topics/${id}.v1.json`;
    for (const mutate of [
      (doc) => { doc.fieldId = 'LF1'; },
      (doc) => { doc.prerequisites = []; },
      (doc) => { doc.objectives.pop(); },
      (doc) => { doc.blocks.pop(); },
      (doc) => { doc.quiz.questionIds.pop(); },
      (doc) => { doc.exam.questionIds[0] = 'LJ-LF1-ROLE-E01'; },
      (doc) => { doc.interview.pop(); },
      (doc) => { doc.cards.pop(); },
      (doc) => { doc.questionFile = 'questions/common-lf1-role.v1.csv'; },
      (doc) => { doc.sources[0].url = 'https://example.org/unregistered'; },
      (doc) => { doc.review.status = 'pending'; doc.review.checkedAt = null; },
      (doc) => { doc.questionLinks[0].blockIds = ['block-1']; },
    ]) {
      const data = sixteenTopicFixture(); mutate(data.topicDocs[file]);
      assert.notDeepEqual(validate(data), []);
    }
    const data = sixteenTopicFixture();
    data.questionsByFile[`questions/${id}.v1.csv`][0].lernfeld = 'WISO';
    assert.match(validate(data).join('\n'), /lernfeld.*KEIN_LF/);
  });
}

for (const [label, mutate] of [
  ['falsche Etappenfolge', (data) => { data.manifest.stageOrder.reverse(); }],
  ['fehlende PM-Etappe', (data) => { data.manifest.stageOrder = STAGE_IDS.filter((id) => id !== 'PM'); }],
  ['falscher PM-Status', (data) => { data.manifest.plannedStages[0].status = 'content-ready'; }],
  ['freie PM-Ablage', (data) => { data.manifest.plannedStages[0].contentFile = '../../private.json'; }],
  ['zusätzliches Lernfeld für PM', (data) => { data.manifest.fields.push({ id: 'PM', title: 'Projektmanagement', topicIds: [] }); }],
  ['WISO vor vollständigem LF1', (data) => { data.manifest.topics.find((topic) => topic.id === LF1_IDS[5]).status = 'planned'; }],
  ['vertauschte WISO-Reihenfolge', (data) => { [data.manifest.sequence[6], data.manifest.sequence[7]] = [data.manifest.sequence[7], data.manifest.sequence[6]]; }],
]) {
  test(`Etappenvertrag verhindert ${label}`, () => {
    const data = sixteenTopicFixture(); mutate(data);
    assert.notDeepEqual(validate(data), []);
  });
}


function thirtyThreeTopicFixture() {
  const data = twentySixTopicFixture();
  const original = fixture();
  data.manifest.topics = data.manifest.topics.filter((topic) => topic.fieldId !== 'LF2');
  data.manifest.sequence = data.manifest.sequence.filter((id) => id !== 'topic-lf2');
  data.manifest.fields.find((field) => field.id === 'LF2').topicIds = [...LF2_IDS];
  for (const [index, [suffix, goals, prerequisites]] of LF2_CONTRACTS.entries()) {
    const id = `common-lf2-${suffix}`;
    const goalMap = new Map(['value', 'team', 'responsibility'].map((goal, index) => [`common-lf1-role-${goal}`, `${id}-${goals[index % goals.length]}`]));
    const convert = (value) => {
      if (Array.isArray(value)) return value.map(convert);
      if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, convert(item)]));
      if (typeof value !== 'string') return value;
      return goalMap.get(value) ?? value.replaceAll('common-lf1-role', id).replaceAll('LJ-LF1-ROLE', `LJ-LF2-${suffix.toUpperCase()}`).replace(/^(block|interview|card)-/, `lf2-${suffix}-$1-`);
    };
    const entry = convert(original.manifest.topics[0]);
    const doc = convert(docOf(original));
    entry.objectives = doc.objectives = entry.objectives.slice(0, goals.length);
    entry.prerequisites = doc.prerequisites = [...prerequisites];
    entry.fieldId = doc.fieldId = 'LF2';
    data.manifest.topics.splice(26 + index, 0, entry);
    data.manifest.sequence.splice(26 + index, 0, id);
    data.topicDocs[entry.contentFile] = doc;
    data.questionsByFile[doc.questionFile] = convert(rowsOf(original)).map((row) => ({ ...row, modul_id: 'HARDWARE', lernfeld: 'LF2' }));
    if (suffix === 'handover') {
      doc.interview[1].practice = { task: 'Führe die Modellprobe aus.', checklist: ['Prüfe den Auftrag.'], confirmation: 'Ich habe die Modellprobe ausgeführt und geprüft.' };
      doc.interview[2].blockIds.push(doc.blocks[3].id);
      for (const link of doc.questionLinks.filter((item) => item.phase === 'exam')) link.blockIds.push(doc.blocks[3].id);
      doc.fieldReview = { fieldId: 'LF2', topicIds: [...LF2_IDS], blockIds: [doc.blocks[3].id], interviewIds: [doc.interview[2].id], questionIds: [...doc.exam.questionIds] };
    }
  }
  return data;
}

test('33 unabhängige Themen binden LF2 an sieben Verträge mit eigener Übergabepraxis', () => {
  const data = thirtyThreeTopicFixture();
  assert.deepEqual(validate(data), []);
  assert.deepEqual(data.manifest.topics.filter((topic) => topic.status === 'content-ready').map((topic) => topic.id), PRE_LF3_IDS);
  assert.equal(LF2_IDS.reduce((sum, id) => sum + data.topicDocs[`topics/${id}.v1.json`].objectives.length, 0), 17);
  assert.deepEqual(data.topicDocs[HANDOVER_FILE].fieldReview.topicIds, LF2_IDS);
  delete data.manifest.stageOrder; delete data.manifest.plannedStages;
  assert.deepEqual(validate(data), []);
});

for (const [label, mutate, expected] of [
  ['fehlender Rückblick', (doc) => { delete doc.fieldReview; }, /fieldReview/],
  ['falsche Etappe', (doc) => { doc.fieldReview.fieldId = 'PM'; }, /fieldReview.fieldId/],
  ['fehlendes Thema', (doc) => { doc.fieldReview.topicIds.pop(); }, /fieldReview.topicIds/],
  ['fremdes Thema', (doc) => { doc.fieldReview.topicIds[0] = PM_IDS[0]; }, /fieldReview.topicIds/],
  ['vertauschte Themen', (doc) => { doc.fieldReview.topicIds.reverse(); }, /fieldReview.topicIds/],
  ['falscher Block', (doc) => { doc.fieldReview.blockIds = [doc.blocks[0].id]; }, /fieldReview.blockIds/],
  ['falsche Reflexion', (doc) => { doc.fieldReview.interviewIds = [doc.interview[1].id]; }, /fieldReview.interviewIds/],
  ['fehlende Testfrage', (doc) => { doc.fieldReview.questionIds.pop(); }, /fieldReview.questionIds/],
  ['Quizfrage', (doc) => { doc.fieldReview.questionIds[0] = doc.quiz.questionIds[0]; }, /fieldReview.questionIds/],
  ['fremde Testfrage', (doc) => { doc.fieldReview.questionIds[0] = 'LJ-LF2-REQUIREMENTS-E01'; }, /fieldReview.questionIds/],
  ['fehlender Theoriebezug in Reflexion', (doc) => { doc.interview[2].blockIds.pop(); }, /fieldReview.interviewIds/],
  ['fehlender Theoriebezug im Test', (doc) => { doc.questionLinks.find((link) => link.phase === 'exam').blockIds.pop(); }, /fieldReview.questionIds/],
  ['zusätzliche Abschlussaussage', (doc) => { doc.fieldReview.completed = true; }, /fieldReview/],
  ['fehlende Praxis', (doc) => { delete doc.interview[1].practice; }, /practice/],
  ['falsche Praxisposition', (doc) => { doc.interview[0].practice = doc.interview[1].practice; delete doc.interview[1].practice; }, /practice/],
  ['leere Praxis', (doc) => { doc.interview[1].practice.task = ' '; }, /practice.task/],
  ['fehlende Prüfliste', (doc) => { doc.interview[1].practice.checklist = []; }, /practice.checklist/],
  ['doppelte Prüfliste', (doc) => { doc.interview[1].practice.checklist = ['Prüfen', 'Prüfen']; }, /practice.checklist/],
  ['fehlende Bestätigung', (doc) => { delete doc.interview[1].practice.confirmation; }, /practice/],
  ['erfundener Prüfstatus', (doc) => { doc.interview[1].practice.passed = true; }, /practice/],
]) {
  test(`LF2-Abschluss verhindert ${label}`, () => {
    const data = thirtyThreeTopicFixture(); mutate(data.topicDocs[HANDOVER_FILE]);
    assert.match(validate(data).join('\n'), expected);
  });
}

for (const id of LF2_IDS) {
  test(`LF2-Vertrag für ${id} bindet Metadaten, Umfang, Quellen und eigene Pools`, () => {
    for (const mutate of [
      (doc) => { doc.fieldId = 'PM'; },
      (doc) => { doc.prerequisites = []; },
      (doc) => { doc.objectives.pop(); },
      (doc) => { doc.blocks.pop(); },
      (doc) => { doc.quiz.questionIds.pop(); },
      (doc) => { doc.exam.questionIds[0] = 'LJ-PM-CLOSURE-E01'; },
      (doc) => { doc.interview.pop(); },
      (doc) => { doc.cards.pop(); },
      (doc) => { doc.questionFile = 'questions/common-pm-closure.v1.csv'; },
      (doc) => { doc.sources[0].url = 'https://example.org/unregistered'; },
      (doc) => { doc.review.status = 'pending'; doc.review.checkedAt = null; },
      (doc) => { doc.questionLinks[0].blockIds = ['block-1']; },
      (doc) => { doc.interview[0].practice = { task: 'Aufgabe', checklist: ['Prüfung'], confirmation: 'Bestätigen' }; },
    ]) {
      const data = thirtyThreeTopicFixture(); mutate(data.topicDocs[`topics/${id}.v1.json`]);
      assert.notDeepEqual(validate(data), []);
    }
    for (const [key, invalid, expected] of [['lernfeld', 'KEIN_LF', /lernfeld.*LF2/], ['modul_id', 'PM', /modul_id.*HARDWARE/]]) {
      const data = thirtyThreeTopicFixture(); data.questionsByFile[`questions/${id}.v1.csv`][0][key] = invalid;
      assert.match(validate(data).join('\n'), expected);
    }
  });
}

for (const [label, mutate] of [
  ['LF2 mit fremdem Thema', (data) => { data.manifest.fields.find((field) => field.id === 'LF2').topicIds[0] = PM_IDS[0]; }],
  ['LF2 mit unvollständiger Themenliste', (data) => { data.manifest.fields.find((field) => field.id === 'LF2').topicIds.pop(); }],
  ['LF2 vor PM', (data) => { [data.manifest.sequence[25], data.manifest.sequence[26]] = [data.manifest.sequence[26], data.manifest.sequence[25]]; }],
  ['vertauschte LF2-Reihenfolge', (data) => { [data.manifest.sequence[27], data.manifest.sequence[28]] = [data.manifest.sequence[28], data.manifest.sequence[27]]; }],
  ...[...PRE_LF2_IDS, ...LF2_IDS.slice(0, -1)].map((id) => [`fehlende Freigabe ${id}`, (data) => { const topic = data.manifest.topics.find((item) => item.id === id); topic.status = 'planned'; topic.contentFile = null; topic.gaps = ['Inhalt noch offen.']; }]),
]) {
  test(`LF2-Etappenvertrag verhindert ${label}`, () => {
    const data = thirtyThreeTopicFixture(); mutate(data);
    assert.notDeepEqual(validate(data), []);
  });
}

function thirtyNineTopicFixture() {
  const data = thirtyThreeTopicFixture();
  const original = fixture();
  data.manifest.topics = data.manifest.topics.filter((topic) => topic.fieldId !== 'LF3');
  data.manifest.sequence = data.manifest.sequence.filter((id) => id !== 'topic-lf3');
  data.manifest.fields.find((field) => field.id === 'LF3').topicIds = [...LF3_IDS];
  for (const [index, [suffix, goals, prerequisites]] of LF3_CONTRACTS.entries()) {
    const id = `common-lf3-${suffix}`;
    const goalMap = new Map(['value', 'team', 'responsibility'].map((goal, index) => [`common-lf1-role-${goal}`, `${id}-${goals[index % goals.length]}`]));
    const convert = (value) => {
      if (Array.isArray(value)) return value.map(convert);
      if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, convert(item)]));
      if (typeof value !== 'string') return value;
      return goalMap.get(value) ?? value.replaceAll('common-lf1-role', id).replaceAll('LJ-LF1-ROLE', `LJ-LF3-${suffix.toUpperCase()}`).replace(/^(block|interview|card)-/, `lf3-${suffix}-$1-`);
    };
    const entry = convert(original.manifest.topics[0]);
    const doc = convert(docOf(original));
    entry.objectives = doc.objectives = entry.objectives.slice(0, goals.length);
    entry.prerequisites = doc.prerequisites = [...prerequisites];
    entry.fieldId = doc.fieldId = 'LF3';
    data.manifest.topics.splice(33 + index, 0, entry);
    data.manifest.sequence.splice(33 + index, 0, id);
    data.topicDocs[entry.contentFile] = doc;
    data.questionsByFile[doc.questionFile] = convert(rowsOf(original)).map((row) => ({ ...row, modul_id: 'NETZ-GRUND', lernfeld: 'LF3' }));
    if (suffix === 'diagnosis') {
      doc.interview[1].practice = { task: 'Führe die Modellprobe aus.', checklist: ['Prüfe den Auftrag.'], confirmation: 'Ich habe die Modellprobe ausgeführt und geprüft.' };
      doc.interview[2].blockIds.push(doc.blocks[3].id);
      for (const link of doc.questionLinks.filter((item) => item.phase === 'exam')) link.blockIds.push(doc.blocks[3].id);
      doc.fieldReview = { fieldId: 'LF3', topicIds: [...LF3_IDS], blockIds: [doc.blocks[3].id], interviewIds: [doc.interview[2].id], questionIds: [...doc.exam.questionIds] };
    }
  }
  return data;
}

test('39 unabhängige Themen binden LF3 an sechs Verträge mit eigener Diagnosepraxis', () => {
  const data = thirtyNineTopicFixture();
  assert.deepEqual(validate(data), []);
  assert.deepEqual(data.manifest.topics.filter((topic) => topic.status === 'content-ready').map((topic) => topic.id), ALL_IDS);
  assert.equal(LF3_IDS.reduce((sum, id) => sum + data.topicDocs[`topics/${id}.v1.json`].objectives.length, 0), 12);
  assert.deepEqual(data.topicDocs[DIAGNOSIS_FILE].fieldReview.topicIds, LF3_IDS);
  delete data.manifest.stageOrder; delete data.manifest.plannedStages;
  assert.deepEqual(validate(data), []);
});

for (const [label, mutate, expected] of [
  ['fehlender Rückblick', (doc) => { delete doc.fieldReview; }, /fieldReview/],
  ['falsche Etappe', (doc) => { doc.fieldReview.fieldId = 'PM'; }, /fieldReview.fieldId/],
  ['fehlendes Thema', (doc) => { doc.fieldReview.topicIds.pop(); }, /fieldReview.topicIds/],
  ['fremdes Thema', (doc) => { doc.fieldReview.topicIds[0] = PM_IDS[0]; }, /fieldReview.topicIds/],
  ['vertauschte Themen', (doc) => { doc.fieldReview.topicIds.reverse(); }, /fieldReview.topicIds/],
  ['falscher Block', (doc) => { doc.fieldReview.blockIds = [doc.blocks[0].id]; }, /fieldReview.blockIds/],
  ['falsche Reflexion', (doc) => { doc.fieldReview.interviewIds = [doc.interview[1].id]; }, /fieldReview.interviewIds/],
  ['fehlende Testfrage', (doc) => { doc.fieldReview.questionIds.pop(); }, /fieldReview.questionIds/],
  ['Quizfrage', (doc) => { doc.fieldReview.questionIds[0] = doc.quiz.questionIds[0]; }, /fieldReview.questionIds/],
  ['fremde Testfrage', (doc) => { doc.fieldReview.questionIds[0] = 'LJ-LF3-PHYSICAL-E01'; }, /fieldReview.questionIds/],
  ['fehlender Theoriebezug in Reflexion', (doc) => { doc.interview[2].blockIds.pop(); }, /fieldReview.interviewIds/],
  ['fehlender Theoriebezug im Test', (doc) => { doc.questionLinks.find((link) => link.phase === 'exam').blockIds.pop(); }, /fieldReview.questionIds/],
  ['zusätzliche Abschlussaussage', (doc) => { doc.fieldReview.completed = true; }, /fieldReview/],
  ['fehlende Praxis', (doc) => { delete doc.interview[1].practice; }, /practice/],
  ['falsche Praxisposition', (doc) => { doc.interview[0].practice = doc.interview[1].practice; delete doc.interview[1].practice; }, /practice/],
  ['leere Praxis', (doc) => { doc.interview[1].practice.task = ' '; }, /practice.task/],
  ['fehlende Prüfliste', (doc) => { doc.interview[1].practice.checklist = []; }, /practice.checklist/],
  ['doppelte Prüfliste', (doc) => { doc.interview[1].practice.checklist = ['Prüfen', 'Prüfen']; }, /practice.checklist/],
  ['fehlende Bestätigung', (doc) => { delete doc.interview[1].practice.confirmation; }, /practice/],
  ['erfundener Prüfstatus', (doc) => { doc.interview[1].practice.passed = true; }, /practice/],
]) {
  test(`LF3-Abschluss verhindert ${label}`, () => {
    const data = thirtyNineTopicFixture(); mutate(data.topicDocs[DIAGNOSIS_FILE]);
    assert.match(validate(data).join('\n'), expected);
  });
}

for (const id of LF3_IDS) {
  test(`LF3-Vertrag für ${id} bindet Metadaten, Umfang, Quellen und eigene Pools`, () => {
    for (const mutate of [
      (doc) => { doc.fieldId = 'PM'; },
      (doc) => { doc.prerequisites = []; },
      (doc) => { doc.objectives.pop(); },
      (doc) => { doc.blocks.pop(); },
      (doc) => { doc.quiz.questionIds.pop(); },
      (doc) => { doc.exam.questionIds[0] = 'LJ-PM-CLOSURE-E01'; },
      (doc) => { doc.interview.pop(); },
      (doc) => { doc.cards.pop(); },
      (doc) => { doc.questionFile = 'questions/common-pm-closure.v1.csv'; },
      (doc) => { doc.sources[0].url = 'https://example.org/unregistered'; },
      (doc) => { doc.review.status = 'pending'; doc.review.checkedAt = null; },
      (doc) => { doc.questionLinks[0].blockIds = ['block-1']; },
      (doc) => { doc.interview[0].practice = { task: 'Aufgabe', checklist: ['Prüfung'], confirmation: 'Bestätigen' }; },
    ]) {
      const data = thirtyNineTopicFixture(); mutate(data.topicDocs[`topics/${id}.v1.json`]);
      assert.notDeepEqual(validate(data), []);
    }
    for (const [key, invalid, expected] of [['lernfeld', 'KEIN_LF', /lernfeld.*LF3/], ['modul_id', 'PM', /modul_id.*NETZ-GRUND/]]) {
      const data = thirtyNineTopicFixture(); data.questionsByFile[`questions/${id}.v1.csv`][0][key] = invalid;
      assert.match(validate(data).join('\n'), expected);
    }
  });
}

for (const [label, mutate] of [
  ['LF3 mit fremdem Thema', (data) => { data.manifest.fields.find((field) => field.id === 'LF3').topicIds[0] = PM_IDS[0]; }],
  ['LF3 mit unvollständiger Themenliste', (data) => { data.manifest.fields.find((field) => field.id === 'LF3').topicIds.pop(); }],
  ['LF3 vor LF2', (data) => { [data.manifest.sequence[32], data.manifest.sequence[33]] = [data.manifest.sequence[33], data.manifest.sequence[32]]; }],
  ['vertauschte LF3-Reihenfolge', (data) => { [data.manifest.sequence[34], data.manifest.sequence[35]] = [data.manifest.sequence[35], data.manifest.sequence[34]]; }],
  ...[...PRE_LF3_IDS, ...LF3_IDS.slice(0, -1)].map((id) => [`fehlende Freigabe ${id}`, (data) => { const topic = data.manifest.topics.find((item) => item.id === id); topic.status = 'planned'; topic.contentFile = null; topic.gaps = ['Inhalt noch offen.']; }]),
]) {
  test(`LF3-Etappenvertrag verhindert ${label}`, () => {
    const data = thirtyNineTopicFixture(); mutate(data);
    assert.notDeepEqual(validate(data), []);
  });
}

for (const id of LF3_IDS) {
  test(`LF3-Zielabdeckung in jeder Lernphase für ${id}`, () => {
    for (const phase of ['quiz', 'exam', 'interview', 'cards', 'blocks']) {
      const data = thirtyNineTopicFixture();
      const doc = data.topicDocs[`topics/${id}.v1.json`];
      const goal = doc.objectives[1].id;
      const items = ['quiz', 'exam'].includes(phase) ? doc.questionLinks.filter((item) => item.phase === phase) : doc[phase];
      for (const item of items) item.objectiveIds = [doc.objectives[0].id];
      assert.match(validate(data).join('\n'), new RegExp(goal));
    }
  });
}

for (const [label, mutate] of [
  ['Praxis', (doc, review) => { doc.interview[1].practice = review.interview[1].practice; }],
  ['Rückblick', (doc, review) => { doc.fieldReview = review.fieldReview; }],
]) for (const id of LF3_IDS.slice(0, -1)) {
  test(`LF3 begrenzt ${label} auf das Diagnosethema: ${id}`, () => {
    const data = thirtyNineTopicFixture();
    mutate(data.topicDocs[`topics/${id}.v1.json`], data.topicDocs[DIAGNOSIS_FILE]);
    assert.notDeepEqual(validate(data), []);
  });
}

function seventyFourTopicFixture() {
  const data = thirtyNineTopicFixture(); const original = fixture();
  for (const field of ['LF4', 'LF5', 'LF6', 'LF7', 'LF8', 'LF9']) {
    data.manifest.topics = data.manifest.topics.filter(t => t.fieldId !== field);
    data.manifest.sequence = data.manifest.sequence.filter(id => id !== 'topic-' + field.toLowerCase());
    data.manifest.fields.find(f => f.id === field).topicIds = NEW_CONTRACTS.filter(row => row[1] === field).map(row => row[0]);
  }
  for (const [index, [id, fieldId, goals, prerequisites]] of NEW_CONTRACTS.entries()) {
    const prefix = 'LJ-' + id.slice(7).toUpperCase();
    const goalMap = new Map(['value', 'team', 'responsibility'].map((goal, i) => ['common-lf1-role-' + goal, id + '-' + goals[i % goals.length]]));
    const convert = value => {
      if (Array.isArray(value)) return value.map(convert);
      if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, v]) => [key, convert(v)]));
      return typeof value === 'string' ? goalMap.get(value) ?? value.replaceAll('common-lf1-role', id).replaceAll('LJ-LF1-ROLE', prefix).replace(/^(block|interview|card)-/, id + '-$1-') : value;
    };
    const entry = convert(original.manifest.topics[0]); const doc = convert(docOf(original));
    entry.objectives = doc.objectives = entry.objectives.slice(0, goals.length);
    entry.prerequisites = doc.prerequisites = [...prerequisites]; entry.fieldId = doc.fieldId = fieldId;
    data.manifest.topics.splice(39 + index, 0, entry); data.manifest.sequence.splice(39 + index, 0, id);
    data.topicDocs[entry.contentFile] = doc;
    data.questionsByFile[doc.questionFile] = convert(rowsOf(original)).map(row => ({ ...row, modul_id: { LF4: 'IT-SEC-GRUND', LF5: 'LF5-GRUND', LF6: 'SERVICE-GRUND', LF7: 'CPS-GRUND', LF8: 'DATEN-GRUND', LF9: 'NETZ-GRUND' }[fieldId], lernfeld: fieldId }));
    if (['common-lf4-measures', 'common-lf5-testing', 'common-lf6-closure', 'common-lf7-verification', 'common-lf8-delivery', 'common-lf9-handover'].includes(id)) {
      doc.interview[1].practice = { task: 'Bearbeite das Modell.', checklist: ['Prüfe das Ergebnis.'], confirmation: 'Ich habe das Modell bearbeitet und geprüft.' };
      doc.interview[2].blockIds.push(doc.blocks[3].id);
      for (const link of doc.questionLinks.filter(link => link.phase === 'exam')) link.blockIds.push(doc.blocks[3].id);
      doc.fieldReview = { fieldId, topicIds: NEW_CONTRACTS.filter(row => row[1] === fieldId).map(row => row[0]), blockIds: [doc.blocks[3].id], interviewIds: [doc.interview[2].id], questionIds: [...doc.exam.questionIds] };
    }
  }
  return data;
}

test('74 unabhängige Inhaltsverträge decken LF4–LF9 mit getrennten Pools und Abschlüssen ab', () => {
  const data = seventyFourTopicFixture(); assert.deepEqual(validate(data), []);
  assert.deepEqual(data.manifest.topics.filter((topic) => topic.status === 'content-ready').map((topic) => topic.id), [...ALL_IDS, ...NEW_IDS]);
  assert.equal(Object.values(data.topicDocs).flatMap(doc => doc.exam.questionIds).length, 592);
  delete data.manifest.stageOrder; delete data.manifest.plannedStages;
  assert.deepEqual(validate(data), []);
});
for (const [id, fieldId] of NEW_CONTRACTS) {
  test(id + ': Thema, Metadaten, Review, Umfang und Zielabdeckung bleiben verbindlich', () => {
    for (const mutate of [
      doc => { doc.prerequisites = []; }, doc => { doc.review.status = 'pending'; doc.review.checkedAt = null; },
      doc => { doc.blocks.pop(); }, doc => { doc.cards.pop(); }, doc => { doc.quiz.questionIds.pop(); },
      doc => { doc.exam.questionIds[0] = doc.quiz.questionIds[0]; }, doc => { doc.interview[0].blockIds = ['fremder-block']; },
      doc => { doc.objectives[0].id += '-falsch'; }, doc => { doc.fieldId = 'LF1'; },
      doc => { doc.questionFile = 'questions/common-lf3-diagnosis.v1.csv'; },
      doc => { doc.sources[0].url = 'https://example.org/unregistered'; },
      doc => { doc.questionLinks[0].blockIds = ['block-1']; },
    ]) {
      const data = seventyFourTopicFixture(); mutate(data.topicDocs['topics/' + id + '.v1.json']); assert.notDeepEqual(validate(data), []);
    }
    for (const [key, invalid] of [['lernfeld', 'LF1'], ['modul_id', 'PM'], ['fachrichtung', 'FIAE'], ['typ', 'MC']]) {
      const data = seventyFourTopicFixture();
      data.questionsByFile['questions/' + id + '.v1.csv'][0][key] = invalid;
      assert.notDeepEqual(validate(data), []);
    }
    const missing = seventyFourTopicFixture(); const preceding = missing.manifest.topics.find(t => t.id === 'common-lf3-physical'); preceding.status = 'planned'; preceding.contentFile = null; preceding.gaps = ['Offen.']; assert.notDeepEqual(validate(missing), []);
    const mismatch = seventyFourTopicFixture(); mismatch.manifest.fields.find(f => f.id === fieldId).topicIds.reverse(); assert.notDeepEqual(validate(mismatch), []);
  });
}
for (const [id] of NEW_CONTRACTS) {
  test(id + ': jedes Lernziel bleibt in Theorie, Quiz, Test, Reflexion und Karten nachweisbar', () => {
    for (const phase of ['quiz', 'exam', 'interview', 'cards', 'blocks']) {
      const data = seventyFourTopicFixture();
      const doc = data.topicDocs[`topics/${id}.v1.json`];
      const missingGoal = doc.objectives[1].id;
      const items = ['quiz', 'exam'].includes(phase) ? doc.questionLinks.filter((item) => item.phase === phase) : doc[phase];
      for (const item of items) item.objectiveIds = [doc.objectives[0].id];
      assert.match(validate(data).join('\n'), new RegExp(missingGoal));
    }
  });
}
for (const id of ['common-lf4-measures', 'common-lf5-testing', 'common-lf6-closure', 'common-lf7-verification', 'common-lf8-delivery', 'common-lf9-handover']) {
  test(id + ': vollständiger Rückblick und Praxis vor der Bestätigung erforderlich', () => {
    for (const mutate of [
      doc => { delete doc.fieldReview; }, doc => { delete doc.interview[1].practice; },
      doc => { doc.fieldReview.topicIds.pop(); }, doc => { doc.fieldReview.topicIds.reverse(); },
      doc => { doc.fieldReview.fieldId = 'LF3'; }, doc => { doc.fieldReview.blockIds = [doc.blocks[0].id]; },
      doc => { doc.fieldReview.interviewIds = [doc.interview[1].id]; },
      doc => { doc.fieldReview.questionIds.pop(); }, doc => { doc.fieldReview.questionIds[0] = doc.quiz.questionIds[0]; },
      doc => { doc.interview[2].blockIds = [doc.blocks[0].id]; },
      doc => { doc.questionLinks.find(link => link.phase === 'exam').blockIds = [doc.blocks[0].id]; },
      doc => { doc.interview[0].practice = doc.interview[1].practice; delete doc.interview[1].practice; },
      doc => { doc.interview[1].practice.task = ' '; }, doc => { doc.interview[1].practice.checklist = []; },
      doc => { doc.interview[1].practice.checklist = ['Prüfen', 'Prüfen']; },
      doc => { delete doc.interview[1].practice.confirmation; }, doc => { doc.interview[1].practice.passed = true; },
    ]) {
      const data = seventyFourTopicFixture(); mutate(data.topicDocs['topics/' + id + '.v1.json']); assert.notDeepEqual(validate(data), []);
    }
  });
}
for (const [id, fieldId] of NEW_CONTRACTS.filter(([id]) => !['common-lf4-measures', 'common-lf5-testing', 'common-lf6-closure', 'common-lf7-verification', 'common-lf8-delivery', 'common-lf9-handover'].includes(id))) {
  test(id + ': Praxis und Feldrückblick bleiben dem Abschlussthema vorbehalten', () => {
    for (const key of ['practice', 'fieldReview']) {
      const data = seventyFourTopicFixture();
      const doc = data.topicDocs[`topics/${id}.v1.json`];
      const finalId = NEW_CONTRACTS.filter(([, field]) => field === fieldId).at(-1)[0];
      const final = data.topicDocs[`topics/${finalId}.v1.json`];
      if (key === 'practice') doc.interview[1].practice = structuredClone(final.interview[1].practice);
      else doc.fieldReview = structuredClone(final.fieldReview);
      assert.notDeepEqual(validate(data), []);
    }
  });
}

test('alter 57-Themen-Stand bleibt ohne die drei neuen Lernfelder gültig', () => { const data = seventyFourTopicFixture(); for (const entry of data.manifest.topics.filter(t => ['LF7','LF8','LF9'].includes(t.fieldId))) { const doc = data.topicDocs[entry.contentFile]; delete data.questionsByFile[doc.questionFile]; delete data.topicDocs[entry.contentFile]; entry.status = 'planned'; entry.contentFile = null; entry.gaps = ['Offen.']; } assert.deepEqual(validate(data), []); });
