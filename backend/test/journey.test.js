import { afterEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import express from 'express';
import request from 'supertest';
import { loadJourney } from '../src/journey.js';
import { buildJourneyRoutes } from '../src/routes/journey.routes.js';
import { parseCsv, writeCsv } from '../src/csv.js';

// Integration ohne .env, Konto, DB, KI oder private lokale Verzeichnisse.
vi.mock('../src/config.js', async () => {
  const { fileURLToPath } = await import('node:url');
  const contentDir = fileURLToPath(new URL('../../content/', import.meta.url));
  return { config: { contentDir, databaseUrl: '', jwtSecret: 'journey-test-only', rateLimitMax: 10000, frontendDist: `${contentDir}/missing-frontend`, demoEndpoints: false } };
});
vi.mock('../src/routes/ai.routes.js', async () => {
  const { Router } = await import('express');
  return { buildAiRoutes: () => Router() };
});
import { config } from '../src/config.js';
import { createApp } from '../src/app.js';

const CONTENT_DIR = fileURLToPath(new URL('../../content/', import.meta.url));
const BASE = '/api/journey/fiae';
const TOPIC_ID = 'common-lf1-role';
const TOPIC = `${BASE}/topics/${TOPIC_ID}`;
const GOALS_ID = 'common-lf1-goals';
const GOALS = `${BASE}/topics/${GOALS_ID}`;
const TOPIC_IDS = ['role', 'goals', 'market', 'value-chain', 'organization', 'presentation'].map((suffix) => `common-lf1-${suffix}`);
const WISO_IDS = ['training', 'employment', 'representation', 'social-security', 'pay', 'consumer', 'economy', 'change', 'career', 'europe'].map((suffix) => `common-wiso-${suffix}`);
const PM_IDS = ['project', 'stakeholders', 'methods', 'planning', 'schedule', 'costs', 'pricing', 'feasibility', 'control', 'closure'].map((suffix) => `common-pm-${suffix}`);
const PRE_PM_IDS = [...TOPIC_IDS, ...WISO_IDS];
const PRE_LF2_IDS = [...PRE_PM_IDS, ...PM_IDS];
const LF2_IDS = ['requirements', 'hardware', 'software', 'workplace', 'comparison', 'procurement', 'handover'].map((suffix) => `common-lf2-${suffix}`);
const PRE_LF3_IDS = [...PRE_LF2_IDS, ...LF2_IDS];
const LF3_IDS = ['physical', 'protocols', 'addressing', 'services', 'access', 'diagnosis'].map((suffix) => `common-lf3-${suffix}`);
const ALL_TOPIC_IDS = [...PRE_LF3_IDS, ...LF3_IDS];
const NEW_CONTRACTS = [
  [
    "common-lf4-goals",
    "LF4",
    [
      "common-lf4-goals-distinguish",
      "common-lf4-goals-guideline"
    ],
    [
      "common-lf1-value-chain"
    ]
  ],
  [
    "common-lf4-assets",
    "LF4",
    [
      "common-lf4-assets-inventory",
      "common-lf4-assets-scenario",
      "common-lf4-assets-dependence"
    ],
    [
      "common-lf4-goals"
    ]
  ],
  [
    "common-lf4-privacy",
    "LF4",
    [
      "common-lf4-privacy-identify",
      "common-lf4-privacy-principles",
      "common-lf4-privacy-clarify"
    ],
    [
      "common-lf4-assets"
    ]
  ],
  [
    "common-lf4-assessment",
    "LF4",
    [
      "common-lf4-assessment-classify",
      "common-lf4-assessment-separate",
      "common-lf4-assessment-document"
    ],
    [
      "common-lf4-privacy"
    ]
  ],
  [
    "common-lf4-measures",
    "LF4",
    [
      "common-lf4-measures-select",
      "common-lf4-measures-check",
      "common-lf4-measures-responsibility"
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
      "common-lf5-requirements-data",
      "common-lf5-requirements-scope",
      "common-lf5-requirements-tests"
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
      "common-lf5-types-choose",
      "common-lf5-types-trace"
    ],
    [
      "common-lf5-requirements"
    ]
  ],
  [
    "common-lf5-control",
    "LF5",
    [
      "common-lf5-control-branch",
      "common-lf5-control-loop"
    ],
    [
      "common-lf5-types"
    ]
  ],
  [
    "common-lf5-functions",
    "LF5",
    [
      "common-lf5-functions-model",
      "common-lf5-functions-function"
    ],
    [
      "common-lf5-control"
    ]
  ],
  [
    "common-lf5-objects",
    "LF5",
    [
      "common-lf5-objects-model",
      "common-lf5-objects-instances"
    ],
    [
      "common-lf5-functions"
    ]
  ],
  [
    "common-lf5-storage",
    "LF5",
    [
      "common-lf5-storage-compare",
      "common-lf5-storage-keys"
    ],
    [
      "common-lf5-objects"
    ]
  ],
  [
    "common-lf5-sql",
    "LF5",
    [
      "common-lf5-sql-read",
      "common-lf5-sql-change",
      "common-lf5-sql-protect"
    ],
    [
      "common-lf5-storage"
    ]
  ],
  [
    "common-lf5-testing",
    "LF5",
    [
      "common-lf5-testing-cases",
      "common-lf5-testing-repair",
      "common-lf5-testing-document"
    ],
    [
      "common-lf5-sql"
    ]
  ],
  [
    "common-lf6-intake",
    "LF6",
    [
      "common-lf6-intake-questions",
      "common-lf6-intake-ticket"
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
      "common-lf6-priority-agreement",
      "common-lf6-priority-priority",
      "common-lf6-priority-level"
    ],
    [
      "common-lf6-intake"
    ]
  ],
  [
    "common-lf6-diagnosis",
    "LF6",
    [
      "common-lf6-diagnosis-hypothesis",
      "common-lf6-diagnosis-evidence"
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
      "common-lf6-solution-select",
      "common-lf6-solution-explain",
      "common-lf6-solution-english"
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
      "common-lf6-closure-verify",
      "common-lf6-closure-record",
      "common-lf6-closure-improve"
    ],
    [
      "common-lf6-solution"
    ]
  ],
  ["common-lf7-components", "LF7", ["common-lf7-components-roles", "common-lf7-components-flow"], ["common-lf3-physical", "common-lf5-control"]],
  ["common-lf7-signals", "LF7", ["common-lf7-signals-signal", "common-lf7-signals-flows", "common-lf7-signals-communication"], ["common-lf7-components", "common-lf3-protocols"]],
  ["common-lf7-extension", "LF7", ["common-lf7-extension-requirements", "common-lf7-extension-selection", "common-lf7-extension-plan"], ["common-lf7-signals", "common-lf2-workplace"]],
  ["common-lf7-logic", "LF7", ["common-lf7-logic-implement", "common-lf7-logic-failure"], ["common-lf7-extension", "common-lf5-functions"]],
  ["common-lf7-verification", "LF7", ["common-lf7-verification-test", "common-lf7-verification-energy", "common-lf7-verification-record"], ["common-lf7-logic", "common-lf4-measures"]],
  ["common-lf8-sources", "LF8", ["common-lf8-sources-inspect", "common-lf8-sources-quality"], ["common-lf5-storage", "common-lf4-privacy"]],
  ["common-lf8-formats", "LF8", ["common-lf8-formats-read", "common-lf8-formats-mapping"], ["common-lf8-sources", "common-lf5-types"]],
  ["common-lf8-queries", "LF8", ["common-lf8-queries-join", "common-lf8-queries-aggregate", "common-lf8-queries-check"], ["common-lf8-formats", "common-lf5-sql"]],
  ["common-lf8-interfaces", "LF8", ["common-lf8-interfaces-contract", "common-lf8-interfaces-transfer", "common-lf8-interfaces-team"], ["common-lf8-queries", "common-lf3-services", "common-lf5-functions"]],
  ["common-lf8-integrity", "LF8", ["common-lf8-integrity-validate", "common-lf8-integrity-transaction", "common-lf8-integrity-rights"], ["common-lf8-interfaces", "common-lf4-measures"]],
  ["common-lf8-delivery", "LF8", ["common-lf8-delivery-test", "common-lf8-delivery-guide", "common-lf8-delivery-reflect"], ["common-lf8-integrity"]],
  ["common-lf9-requirements", "LF9", ["common-lf9-requirements-collect", "common-lf9-requirements-criteria"], ["common-lf3-diagnosis", "common-lf2-requirements"]],
  ["common-lf9-design", "LF9", ["common-lf9-design-structure", "common-lf9-design-compare"], ["common-lf9-requirements", "common-lf3-addressing"]],
  ["common-lf9-services", "LF9", ["common-lf9-services-configure", "common-lf9-services-dependencies"], ["common-lf9-design", "common-lf3-services"]],
  ["common-lf9-security", "LF9", ["common-lf9-security-access", "common-lf9-security-continuity", "common-lf9-security-updates"], ["common-lf9-services", "common-lf4-measures"]],
  ["common-lf9-monitoring", "LF9", ["common-lf9-monitoring-observe", "common-lf9-monitoring-isolate", "common-lf9-monitoring-privacy"], ["common-lf9-security", "common-lf6-diagnosis"]],
  ["common-lf9-handover", "LF9", ["common-lf9-handover-evidence", "common-lf9-handover-handover", "common-lf9-handover-improve"], ["common-lf9-monitoring", "common-lf6-closure"]]
];
const NEW_IDS = NEW_CONTRACTS.map(([id]) => id);
const RELEASED_IDS = [...ALL_TOPIC_IDS, ...NEW_IDS];
const NEW_FIELDS = Object.fromEntries(['LF4', 'LF5', 'LF6', 'LF7', 'LF8', 'LF9'].map(field => [field, NEW_CONTRACTS.filter(row => row[1] === field).map(row => row[0])]));
const DIAGNOSIS_ID = LF3_IDS.at(-1);
const HANDOVER_ID = LF2_IDS.at(-1);
const EUROPE_ID = WISO_IDS.at(-1);
const CLOSURE_ID = PM_IDS.at(-1);
const STAGE_IDS = ['LF1', 'WISO', 'PM', ...Array.from({ length: 8 }, (_, index) => `LF${index + 2}`), 'LF10a', 'LF11a', 'LF12a'];
const PRESENTATION_ID = TOPIC_IDS.at(-1);
const PRESENTATION_FILE = `topics/${PRESENTATION_ID}.v1.json`;
const FILES = ['fiae.v1.json', ...ALL_TOPIC_IDS.flatMap((id) => [`topics/${id}.v1.json`, `questions/${id}.v1.csv`])];
const VERSION = '1.0.0';
const QUESTION_DATA = parseCsv(fs.readFileSync(path.join(CONTENT_DIR, 'learning-journey', FILES[2]), 'utf8'));
const GOALS_QUESTION_DATA = parseCsv(fs.readFileSync(path.join(CONTENT_DIR, 'learning-journey', FILES[4]), 'utf8'));
const TEMP_DIRS = [];

function appFor(contentDir = CONTENT_DIR) {
  const app = express();
  app.use(express.json({ limit: '256kb' }));
  app.use('/api/journey', buildJourneyRoutes(contentDir));
  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  return app;
}

const SPECIAL_FIELDS = Object.fromEntries(Object.entries({
  LF10a: ['process', 'prototype', 'layout', 'forms', 'usability', 'value'],
  LF11a: ['model', 'architecture', 'algorithms', 'data-access', 'security', 'testing', 'versions'],
  LF12a: ['scope', 'alternatives', 'planning', 'implementation', 'acceptance', 'training', 'review'],
}).map(([field, topics]) => [field, topics.map(suffix => `fiae-${field.toLowerCase()}-${suffix}`)]));
const SPECIAL_IDS = Object.values(SPECIAL_FIELDS).flat();
const SPECIAL_GOAL_COUNTS = [3, 2, 2, 3, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3];
const FULL_IDS = [...RELEASED_IDS, ...SPECIAL_IDS];
const FULL_FIELDS = { ...NEW_FIELDS, ...SPECIAL_FIELDS };

function fixture(includeNew = false) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'azubiprep-journey-test-'));
  TEMP_DIRS.push(root);
  for (const file of FILES.slice(0, 53)) {
    const destination = path.join(root, 'learning-journey', file);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(path.join(CONTENT_DIR, 'learning-journey', file), destination);
  }
  // LF2–LF9 guards are independent of the public prose and its review status.
  changeJson(root, FILES[0], (plan) => {
    for (const entry of plan.topics.filter(t => NEW_IDS.includes(t.id) || SPECIAL_IDS.includes(t.id))) { entry.status = 'planned'; entry.contentFile = null; entry.gaps = ['Inhalt noch offen.']; }
    for (const id of [...LF2_IDS, ...LF3_IDS, ...(includeNew ? NEW_IDS.filter(id => includeNew !== 'lf456' || !/^common-lf[789]-/.test(id)) : [])]) {
      const fieldId = NEW_CONTRACTS.find(row => row[0] === id)?.[1] || (LF3_IDS.includes(id) ? 'LF3' : 'LF2');
      const moduleId = { LF2: 'HARDWARE', LF3: 'NETZ-GRUND', LF4: 'IT-SEC-GRUND', LF5: 'LF5-GRUND', LF6: 'SERVICE-GRUND', LF7: 'CPS-GRUND', LF8: 'DATEN-GRUND', LF9: 'NETZ-GRUND' }[fieldId];
      const entry = plan.topics.find((item) => item.id === id);
      entry.status = 'content-ready'; entry.contentFile = `topics/${id}.v1.json`; entry.gaps = [];
      const source = { ...plan.sources[0], note: 'Synthetische Testgrundlage.' };
      const mapping = (index) => ({ objectiveIds: [entry.objectives[index % 3 % entry.objectives.length].id], blockIds: [`${id}-block-${index % 3 + 1}`] });
      const quizIds = Array.from({ length: 6 }, (_, index) => `LJ-${fieldId}-${id.slice(11).toUpperCase()}-Q${String(index + 1).padStart(2, '0')}`);
      const examIds = Array.from({ length: 8 }, (_, index) => `LJ-${fieldId}-${id.slice(11).toUpperCase()}-E${String(index + 1).padStart(2, '0')}`);
      const doc = {
        schemaVersion: 1, id, version: VERSION, title: entry.title, fieldId, scope: 'common', prerequisites: entry.prerequisites, objectives: entry.objectives,
        questionFile: `questions/${id}.v1.csv`, review: { status: 'reviewed', checkedAt: '2026-11-11' },
        sourceIds: [source.id], sources: [source], caseStudy: { title: 'Modellauftrag', text: 'Eine fiktive Einrichtung wird geplant.' },
        blocks: Array.from({ length: 4 }, (_, index) => ({ id: `${id}-block-${index + 1}`, title: `Block ${index + 1}`, objectiveIds: [entry.objectives[index % entry.objectives.length].id], sourceIds: [source.id], paragraphs: [`Synthetische Erklärung ${index + 1}.`], example: { title: 'Beispiel', text: 'Ein vorgegebener Fall.' }, misconception: { claim: 'Eine Verwechslung.', correction: 'Eine richtige Einordnung.' }, takeaway: 'Den Auftrag prüfen.' })),
        interview: Array.from({ length: 3 }, (_, index) => ({ id: `${id}-reflection-${index + 1}`, ...mapping(index), prompt: 'Wie begründest du die Wahl?', keyPoints: ['Den Bedarf prüfen.'], acceptableAlternatives: ['Anforderungen abgleichen.'], misconceptions: ['Ungeprüfte Wahl.'], sampleAnswer: 'Die Wahl erfüllt den Bedarf.', followUp: 'Welcher Test passt dazu?' })),
        cards: Array.from({ length: 6 }, (_, index) => ({ id: `${id}-card-${index + 1}`, ...mapping(index), front: 'Was ist zu prüfen?', back: 'Die vorgegebenen Anforderungen.' })),
        quiz: { questionIds: quizIds }, exam: { questionIds: examIds, passPercent: 80, timed: false, scoring: 'all-or-nothing-per-question' },
        questionLinks: [...quizIds.map((questionId, index) => ({ questionId, phase: 'quiz', ...mapping(index) })), ...examIds.map((questionId, index) => ({ questionId, phase: 'exam', ...mapping(index) }))],
      };
      if ([HANDOVER_ID, DIAGNOSIS_ID, 'common-lf4-measures', 'common-lf5-testing', 'common-lf6-closure', 'common-lf7-verification', 'common-lf8-delivery', 'common-lf9-handover'].includes(id)) {
        doc.interview[1].practice = { task: 'Führe die Modellprobe aus.', checklist: ['Prüfe den Auftrag.'], confirmation: 'Ich habe die Modellprobe geprüft.' };
        doc.interview[2].blockIds.push(doc.blocks[3].id);
        for (const link of doc.questionLinks.filter((item) => item.phase === 'exam')) link.blockIds.push(doc.blocks[3].id);
        doc.fieldReview = { fieldId, topicIds: [...(NEW_FIELDS[fieldId] || (fieldId === 'LF3' ? LF3_IDS : LF2_IDS))], blockIds: [doc.blocks[3].id], interviewIds: [doc.interview[2].id], questionIds: [...examIds] };
      }
      const questions = [...quizIds, ...examIds].map((questionId) => ({ id: questionId, fachrichtung: 'ALLE', modul_id: moduleId, thema: entry.title, typ: 'SC', frage: `Synthetische Frage ${questionId}?`, option_a: 'Passende Auswahl.', option_b: 'Andere Auswahl.', option_c: 'Dritte Auswahl.', option_d: 'Vierte Auswahl.', antwort: 'a', erklaerung: 'Die Auswahl erfüllt den Auftrag.', schwierigkeit: 'leicht', quelle: source.title, lernfeld: fieldId }));
      fs.writeFileSync(path.join(root, 'learning-journey', entry.contentFile), JSON.stringify(doc));
      fs.writeFileSync(path.join(root, 'learning-journey', doc.questionFile), writeCsv(QUESTION_DATA.header, questions));
    }
  });
  return root;
}

function changeJson(root, file, mutate) {
  const filename = path.join(root, 'learning-journey', file);
  const value = JSON.parse(fs.readFileSync(filename, 'utf8'));
  mutate(value);
  fs.writeFileSync(filename, JSON.stringify(value));
}

function legacyPlan(plan) {
  for (const topic of plan.topics.filter((item) => [...LF2_IDS, ...LF3_IDS].includes(item.id))) { topic.status = 'planned'; topic.contentFile = null; }
  plan.topics = plan.topics.filter((topic) => !PM_IDS.includes(topic.id));
  plan.sequence = plan.sequence.filter((id) => !PM_IDS.includes(id));
  plan.fields = plan.fields.filter((field) => field.id !== 'PM');
  delete plan.stageOrder;
  delete plan.plannedStages;
}

function examInput(correctCount = 8, data = QUESTION_DATA) {
  const questions = data.records.filter((item) => /-E\d{2}$/.test(item.id));
  return {
    attemptId: randomUUID(), version: VERSION,
    answers: questions.map((item, index) => ({ questionId: item.id, answer: index < correctCount ? item.antwort : item.antwort === 'a' ? 'b' : 'a' })),
  };
}

afterEach(() => {
  config.contentDir = CONTENT_DIR;
  for (const root of TEMP_DIRS.splice(0)) {
    // Nur selbst erzeugte, aufgelöste Testverzeichnisse entfernen.
    const relative = path.relative(os.tmpdir(), root);
    if (!relative.startsWith('azubiprep-journey-test-') || relative.includes(path.sep)) throw new Error('Unsicherer Testpfad');
    fs.rmSync(root, { recursive: true, force: true });
  }
});

describe('Öffentliche Lernreise-API', () => {
  const publicApp = appFor();
  it('liefert den Plan mit 94 verfügbaren Themen und getrennten Rückblicken bis LF12a', async () => {
    const response = await request(publicApp).get(BASE);
    expect(response.status).toBe(200);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.body).toMatchObject({ id: 'fiae-journey', version: VERSION, totalTopics: 94 });
    expect(response.body.readyTopics.map((topic) => topic.id)).toEqual(FULL_IDS);
    expect(response.body.readyTopics.slice(0, 2)).toEqual([
      { id: TOPIC_ID, title: 'Unternehmen, Kunden und die eigene Rolle', fieldId: 'LF1', version: VERSION, prerequisites: [], navigationPrerequisites: [] },
      { id: GOALS_ID, title: 'Unternehmensziele und Zielkonflikte', fieldId: 'LF1', version: VERSION, prerequisites: [TOPIC_ID], navigationPrerequisites: [TOPIC_ID] },
    ]);
    expect(response.body.fields.reduce((sum, item) => sum + item.total, 0)).toBe(94);
    expect(response.body.fields.reduce((sum, item) => sum + item.available, 0)).toBe(94);
    expect(response.body.fields.find((item) => item.id === 'LF1')).toMatchObject({ total: 6, available: 6, topicIds: TOPIC_IDS, reviewTopicId: PRESENTATION_ID });
    expect(response.body.fields).toHaveLength(14);
    expect(response.body.fields.find((item) => item.id === 'WISO')).toMatchObject({ total: 10, available: 10, topicIds: WISO_IDS, reviewTopicId: EUROPE_ID });
    expect(response.body.stages.map((stage) => stage.id)).toEqual(STAGE_IDS);
    expect(response.body.stages.find((stage) => stage.id === 'PM')).toEqual({ id: 'PM', title: 'Projektmanagement', status: 'content-ready', topicIds: PM_IDS, reviewTopicId: CLOSURE_ID, total: 10, available: 10 });
    expect(response.body.stages.find((stage) => stage.id === 'LF2')).toMatchObject({ id: 'LF2', status: 'content-ready', topicIds: LF2_IDS, reviewTopicId: HANDOVER_ID, total: 7, available: 7 });
    expect(response.body.stages.find((stage) => stage.id === 'LF3')).toMatchObject({ id: 'LF3', status: 'content-ready', topicIds: LF3_IDS, reviewTopicId: DIAGNOSIS_ID, total: 6, available: 6 });
    for (const [fieldId, topicIds] of Object.entries(FULL_FIELDS)) {
      expect(response.body.stages.find((stage) => stage.id === fieldId)).toMatchObject({ id: fieldId, status: 'content-ready', topicIds, reviewTopicId: topicIds.at(-1), total: topicIds.length, available: topicIds.length });
    }
    expect(response.body.fields.every(item => item.available === item.total && item.reviewTopicId === item.topicIds.at(-1))).toBe(true);
  });

  it.each(FULL_IDS.map((id, index) => [id, SPECIAL_GOAL_COUNTS[SPECIAL_IDS.indexOf(id)] ?? NEW_CONTRACTS.find(row => row[0] === id)?.[2].length ?? (LF3_IDS.includes(id) ? 2 : LF2_IDS.includes(id) ? [2, 2, 2, 3, 2, 3, 3][LF2_IDS.indexOf(id)] : [3, 2, 2, 2, 3, 3, 3, 3, 3, 3, 2, 3, 3, 3, 3, 3][index] ?? 3)]))('liefert %s vollständig und ohne Fragenlösungen', async (topicId, objectives) => {
    const { status, body, headers } = await request(publicApp).get(`${BASE}/topics/${topicId}`);
    expect(status).toBe(200);
    expect(headers['cache-control']).toBe('no-store');
    expect(body).toMatchObject({ id: topicId, version: VERSION, planVersion: VERSION, track: 'FIAE', exam: { passPercent: 80, timed: false } });
    expect(body.objectives).toHaveLength(objectives);
    expect(body.blocks).toHaveLength(4);
    expect(body.quiz.questions).toHaveLength(6);
    expect(body.interview).toHaveLength(3);
    expect(body.cards).toHaveLength(6);
    expect(body.exam.questions).toHaveLength(8);
    expect(body.interview[0].sampleAnswer).toBeTruthy();
    for (const question of [...body.quiz.questions, ...body.exam.questions]) {
      expect(Object.keys(question).sort()).toEqual(['id', 'typ', 'frage', 'option_a', 'option_b', 'option_c', 'option_d'].sort());
      expect(question).not.toHaveProperty('antwort');
      expect(question).not.toHaveProperty('erklaerung');
    }
    expect(body).not.toHaveProperty('review');
    expect(body).not.toHaveProperty('questionFile');
  });

  it('liefert den Fortschrittsabgleich aller 94 Themen zusammen ohne Frageninhalte oder Lösungen', async () => {
    const response = await request(publicApp).get(`${BASE}/progress-catalog`);
    expect(response.status).toBe(200);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.body.readyTopics.map(topic => topic.id)).toEqual(FULL_IDS);
    for (const topic of response.body.readyTopics) {
      expect(topic.questionLinks).toHaveLength(14);
      expect(topic.exam.questionIds).toHaveLength(8);
      expect(topic.exam).not.toHaveProperty('questions');
      expect(topic.quiz).not.toHaveProperty('questions');
      expect(Object.keys(topic.interview[0])).toEqual(['id']);
      expect(Object.keys(topic.blocks[0])).toEqual(['id']);
    }
  });

  it('trennt fachliche Voraussetzungen von geführter Reihenfolge und veröffentlichtem Rückblick', async () => {
    const app = publicApp;
    const first = (await request(app).get(TOPIC)).body;
    const second = (await request(app).get(GOALS)).body;
    expect(first.prerequisites).toEqual([]);
    expect(first.prerequisiteTopics).toEqual([]);
    expect(first.nextTopic).toEqual({ id: second.id, title: second.title });
    expect(second.prerequisites).toEqual([first.id]);
    expect(second.prerequisiteTopics).toEqual([{ id: first.id, title: first.title }]);
    const allTopics = await Promise.all(FULL_IDS.map(async (id) => (await request(app).get(`${BASE}/topics/${id}`)).body));
    for (const [index, current] of allTopics.entries()) {
      const previous = allTopics[index - 1];
      const next = allTopics[index + 1];
      const expected = [...new Set([...(FULL_FIELDS[current.fieldId] ? FULL_IDS.slice(0, FULL_IDS.indexOf(FULL_FIELDS[current.fieldId][0])) : current.fieldId === 'LF3' ? PRE_LF3_IDS : current.fieldId === 'LF2' ? PRE_LF2_IDS : current.fieldId === 'PM' ? PRE_PM_IDS : current.fieldId === 'WISO' ? TOPIC_IDS : []), ...current.prerequisites, ...(previous ? [previous.id] : [])])];
      expect(current.navigationPrerequisites).toEqual(expected);
      expect(current.prerequisiteTopics).toEqual(expected.map((id) => ({ id, title: allTopics.find((topic) => topic.id === id).title })));
      expect(current.nextTopic).toEqual(next ? { id: next.id, title: next.title } : null);
      const fieldTopicIds = { LF1: TOPIC_IDS, WISO: WISO_IDS, PM: PM_IDS, LF2: LF2_IDS, LF3: LF3_IDS, ...FULL_FIELDS }[current.fieldId];
      expect(current.field).toEqual({ id: current.fieldId, title: expect.any(String), topicIds: fieldTopicIds, reviewTopicId: fieldTopicIds.at(-1) });
      expect(current).not.toHaveProperty('completed');
    }
    expect(allTopics[2].prerequisites).toEqual([TOPIC_ID]);
    expect(allTopics[2].navigationPrerequisites).toEqual([TOPIC_ID, GOALS_ID]);
    const presentation = allTopics.find((topic) => topic.id === PRESENTATION_ID);
    const europe = allTopics.find((topic) => topic.id === EUROPE_ID);
    const closure = allTopics.find((topic) => topic.id === CLOSURE_ID);
    const handover = allTopics.find((topic) => topic.id === HANDOVER_ID);
    const diagnosis = allTopics.find(topic => topic.id === DIAGNOSIS_ID);
    expect(diagnosis.id).toBe(DIAGNOSIS_ID);
    expect(diagnosis.nextTopic.id).toBe(NEW_IDS[0]);
    expect(diagnosis.fieldReview).toEqual({ fieldId: 'LF3', topicIds: LF3_IDS, blockIds: [diagnosis.blocks[3].id], interviewIds: [diagnosis.interview[2].id], questionIds: diagnosis.exam.questionIds });
    expect(europe.nextTopic.id).toBe(PM_IDS[0]);
    expect(closure.nextTopic.id).toBe(LF2_IDS[0]);
    expect(handover.nextTopic.id).toBe(LF3_IDS[0]);
    expect(handover.fieldReview).toEqual({ fieldId: 'LF2', topicIds: LF2_IDS, blockIds: [handover.blocks[3].id], interviewIds: [handover.interview[2].id], questionIds: handover.exam.questionIds });
    expect(Object.keys(handover.interview[1].practice).sort()).toEqual(['checklist', 'confirmation', 'task']);
    expect(handover).not.toHaveProperty('workplace');
    expect(handover).not.toHaveProperty('workplaceState');
    expect(closure.fieldReview).toEqual({ fieldId: 'PM', topicIds: PM_IDS, blockIds: [closure.blocks[3].id], interviewIds: [closure.interview[2].id], questionIds: closure.exam.questionIds });
    expect(europe.fieldReview).toEqual({ fieldId: 'WISO', topicIds: WISO_IDS, blockIds: [europe.blocks[3].id], interviewIds: [europe.interview[2].id], questionIds: europe.exam.questionIds });
    expect(allTopics.filter((topic) => ['WISO', 'PM'].includes(topic.fieldId)).every((topic) => topic.interview.every((item) => !Object.hasOwn(item, 'practice')))).toBe(true);
    expect(presentation.nextTopic.id).toBe(WISO_IDS[0]);
    expect(presentation.fieldReview).toEqual({ fieldId: 'LF1', topicIds: TOPIC_IDS, blockIds: [presentation.blocks[3].id], interviewIds: [presentation.interview[2].id], questionIds: presentation.exam.questionIds });
    expect(presentation.interview[1].practice).toEqual({ task: expect.any(String), checklist: expect.any(Array), confirmation: expect.any(String) });
    expect(presentation.interview.filter((item) => item.practice)).toHaveLength(1);
    for (const [fieldId, topicIds] of Object.entries(FULL_FIELDS)) {
      const final = allTopics.find((item) => item.id === topicIds.at(-1));
      expect(final.fieldReview).toEqual({ fieldId, topicIds, blockIds: [final.blocks[3].id], interviewIds: [final.interview[2].id], questionIds: final.exam.questionIds });
      expect(final.interview[1].practice).toEqual({ task: expect.any(String), checklist: expect.any(Array), confirmation: expect.any(String) });
      expect(final.interview.filter((item) => item.practice)).toHaveLength(1);
      for (const current of allTopics.filter((item) => topicIds.slice(0, -1).includes(item.id))) {
        expect(current).not.toHaveProperty('fieldReview');
        expect(current.interview.every((item) => !Object.hasOwn(item, 'practice'))).toBe(true);
      }
    }
  });

  it.each([[FILES[1], TOPIC], [FILES[3], GOALS], ['topics/common-pm-costs.v1.json', `${BASE}/topics/common-pm-costs`], ['topics/common-lf2-handover.v1.json', `${BASE}/topics/common-lf2-handover`], ['topics/common-lf3-diagnosis.v1.json', `${BASE}/topics/common-lf3-diagnosis`]])('verwendet öffentliche Allowlists auch für verschachtelte Objekte: %s', async (file, endpoint) => {
    const root = fixture();
    changeJson(root, file, (topic) => {
      topic.internal = 'PRIVATE-MARKER';
      topic.network = { index: 0, cases: ['PRIVATE-NETWORK-MARKER'] };
      topic.networkState = { linked: true, label: 'PRIVATE-NETWORK-MARKER' };
      for (const item of [topic.caseStudy, topic.blocks[0], topic.blocks[0].example, topic.blocks[0].misconception, topic.cards[0], topic.interview[0], topic.sources[0], topic.questionLinks[0], topic.quiz, topic.exam]) item.internal = 'PRIVATE-MARKER';
    });
    const response = await request(appFor(root)).get(endpoint);
    expect(response.status).toBe(200);
    expect(JSON.stringify(response.body)).not.toContain('PRIVATE-MARKER');
    expect(response.body).not.toHaveProperty('network');
    expect(response.body).not.toHaveProperty('networkState');
  });

  it('bindet den konfigurierten öffentlichen Inhaltsordner in createApp ein', async () => {
    config.contentDir = fixture();
    const store = { get: () => ({ geladenAm: 'test', gesamtFragen: 0, warnungen: [], modulesById: new Map(), fachrichtungenByCode: new Map() }) };
    const app = createApp(store);
    expect((await request(app).get(TOPIC)).status).toBe(200);
    config.contentDir = path.join(config.contentDir, 'missing');
    const unavailableApp = createApp(store);
    expect((await request(unavailableApp).get(TOPIC)).status).toBe(503);
    expect((await request(unavailableApp).get('/api/status')).body).toEqual({ syncAktiviert: false, pushAktiviert: false });
    expect((await request(unavailableApp).get('/api/health')).status).toBe(200);
  });

  it.each(['fiae-lf10a-unbekannt', 'unbekannt', '..%2F..%2Fprivate'])('liefert für unverfügbare Themen 404: %s', async (id) => {
    const response = await request(publicApp).get(`${BASE}/topics/${id}`);
    expect(response.status).toBe(404);
    expect(response.headers['cache-control']).toBe('no-store');
  });
});

describe('Quiz-Rückmeldung', () => {
  const input = { version: VERSION, questionId: 'LJ-LF1-ROLE-Q01', answer: 'c' };
  it('bewertet Originalbuchstaben und liefert passende Rücksprünge', async () => {
    const response = await request(appFor()).post(`${TOPIC}/check`).send(input);
    expect(response.status).toBe(200);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.body).toEqual({
      questionId: input.questionId, answer: 'c', expected: 'c', correct: true,
      explanation: QUESTION_DATA.records[0].erklaerung,
      blockIds: ['common-lf1-role-services'], objectiveIds: ['common-lf1-role-value'],
    });
    const wrong = await request(appFor()).post(`${TOPIC}/check`).send({ ...input, answer: 'b' });
    expect(wrong.body).toMatchObject({ answer: 'b', expected: 'c', correct: false });
  });

  it.each([
    ['Prüfungspool', { ...input, questionId: 'LJ-LF1-ROLE-E01' }, 400],
    ['fremde Frage', { ...input, questionId: 'WISO-001' }, 400],
    ['alte Version', { ...input, version: '0.9.0' }, 409],
    ['fehlende Version', { questionId: input.questionId, answer: 'c' }, 400],
    ['zusätzliches Feld', { ...input, correct: true }, 400],
    ...['C', ' c', 'c ', 'c,d', ['c'], 3, null, ''].map((answer) => [`Antwort ${JSON.stringify(answer)}`, { ...input, answer }, 400]),
  ])('lehnt %s ab', async (_name, body, status) => {
    const response = await request(appFor()).post(`${TOPIC}/check`).send(body);
    expect(response.status).toBe(status);
    expect(Object.keys(response.body)).toEqual(['error']);
  });

  it('wertet das zweite Thema aus und weist Fragen des jeweils anderen Themas ohne Lösungen zurück', async () => {
    const app = appFor();
    const second = GOALS_QUESTION_DATA.records.find((item) => item.id.endsWith('-Q01'));
    const input = { version: VERSION, questionId: second.id, answer: second.antwort };
    const response = await request(app).post(`${GOALS}/check`).send(input);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ correct: true, expected: second.antwort, explanation: second.erklaerung });
    expect(response.body.objectiveIds.every((id) => id.startsWith(`${GOALS_ID}-`))).toBe(true);
    for (const [endpoint, questionId] of [[TOPIC, second.id], [GOALS, 'LJ-LF1-ROLE-Q01'], [GOALS, 'LJ-LF1-GOALS-E01']]) {
      const rejected = await request(app).post(`${endpoint}/check`).send({ ...input, questionId });
      expect(rejected.status).toBe(400);
      expect(Object.keys(rejected.body)).toEqual(['error']);
    }
  });
});

describe('Vollständige deterministische Mini-Test-Auswertung', () => {
  it.each(RELEASED_IDS.slice(2))('bindet Quiz, Test und Inhaltsversion an %s', async (topicId) => {
    const root = fixture(NEW_IDS.includes(topicId));
    const data = parseCsv(fs.readFileSync(path.join(root, 'learning-journey', `questions/${topicId}.v1.csv`), 'utf8'));
    const endpoint = `${BASE}/topics/${topicId}`;
    const app = appFor(root);
    const quizQuestion = data.records.find((question) => question.id.endsWith('-Q01'));
    const answer = { version: VERSION, questionId: quizQuestion.id, answer: quizQuestion.antwort };
    const checked = await request(app).post(`${endpoint}/check`).send(answer);
    expect(checked.status).toBe(200);
    expect(checked.body).toMatchObject({ correct: true, explanation: quizQuestion.erklaerung });
    for (const correct of [6, 7, 8]) {
      const input = examInput(correct, data);
      const evaluated = await request(app).post(`${endpoint}/evaluate`).send(input);
      expect(evaluated.status).toBe(200);
      expect(evaluated.body).toMatchObject({ correct, total: 8, percent: correct / 8 * 100, passed: correct >= 7 });
      expect(evaluated.body.results.every((result) => result.objectiveIds.every((id) => id.startsWith(`${topicId}-`)))).toBe(true);
      expect(evaluated.body.objectives.every((objective) => objective.total > 0 && Number.isFinite(objective.percent))).toBe(true);
    }
    for (const foreignId of (NEW_IDS.includes(topicId) ? RELEASED_IDS : ALL_TOPIC_IDS).filter((id) => id !== topicId)) {
      const rejectedQuiz = await request(app).post(`${BASE}/topics/${foreignId}/check`).send(answer);
      const rejectedExam = await request(app).post(`${BASE}/topics/${foreignId}/evaluate`).send(examInput(8, data));
      for (const rejected of [rejectedQuiz, rejectedExam]) {
        expect(rejected.status).toBe(400);
        expect(Object.keys(rejected.body)).toEqual(['error']);
      }
    }
    changeJson(root, `topics/${topicId}.v1.json`, (topic) => { topic.version = '1.1.0'; });
    const updated = appFor(root);
    expect((await request(updated).post(`${endpoint}/check`).send(answer)).status).toBe(409);
    expect((await request(updated).post(`${endpoint}/check`).send({ ...answer, version: '1.1.0' })).status).toBe(200);
    expect((await request(updated).post(`${endpoint}/evaluate`).send(examInput(8, data))).status).toBe(409);
    expect((await request(updated).post(`${endpoint}/evaluate`).send({ ...examInput(8, data), version: '1.1.0' })).status).toBe(200);
    expect((await request(updated).post(`${TOPIC}/evaluate`).send(examInput())).status).toBe(200);
  });

  it.each([[6, 75, false], [7, 87.5, true], [8, 100, true]])('%i von acht sind %s Prozent, bestanden=%s', async (correct, percent, passed) => {
    const input = examInput(correct);
    const response = await request(appFor()).post(`${TOPIC}/evaluate`).send(input);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ attemptId: input.attemptId, version: VERSION, total: 8, correct, percent, passed });
    expect(response.body.results).toHaveLength(8);
  });

  it('berechnet jedes Lernziel und sortiert unabhängig von der Einsendereihenfolge', async () => {
    const input = examInput(6);
    input.answers.reverse();
    const response = await request(appFor()).post(`${TOPIC}/evaluate`).send(input);
    expect(response.body.results.map((item) => item.questionId)).toEqual(examInput().answers.map((item) => item.questionId));
    expect(response.body.objectives).toEqual([
      { id: 'common-lf1-role-value', total: 3, correct: 2, percent: 2 / 3 * 100 },
      { id: 'common-lf1-role-team', total: 2, correct: 2, percent: 100 },
      { id: 'common-lf1-role-responsibility', total: 3, correct: 2, percent: 2 / 3 * 100 },
    ]);
  });

  it('liefert bei derselben Versuch-ID reproduzierbare Ergebnisse ohne Speicherung', async () => {
    const app = appFor();
    const input = examInput(7);
    const first = await request(app).post(`${TOPIC}/evaluate`).send(input);
    const second = await request(app).post(`${TOPIC}/evaluate`).send(input);
    expect(second.body).toEqual(first.body);
    expect(second.headers['cache-control']).toBe('no-store');
  });

  it.each([
    ['fehlende Frage', (input) => input.answers.pop()],
    ['zusätzliche Frage', (input) => input.answers.push(input.answers[0])],
    ['doppelte Frage', (input) => { input.answers[1] = input.answers[0]; }],
    ['Quizfrage', (input) => { input.answers[0].questionId = 'LJ-LF1-ROLE-Q01'; }],
    ['fremde Frage', (input) => { input.answers[0].questionId = 'WISO-001'; }],
    ['fehlende Antwort', (input) => { delete input.answers[0].answer; }],
    ['zusätzliches Antwortfeld', (input) => { input.answers[0].correct = true; }],
    ['zusätzliches Versuchsfeld', (input) => { input.passed = true; }],
    ['ungültige Versuch-ID', (input) => { input.attemptId = 'versuch-1'; }],
    ['keine UUIDv4', (input) => { input.attemptId = '00000000-0000-1000-8000-000000000000'; }],
    ['fehlende Versuch-ID', (input) => { delete input.attemptId; }],
    ['Objekt statt Antworten', (input) => { input.answers = {}; }],
    ...['A', ' a', 'a,b', ['a'], null, '', 0].map((answer) => [`Antwort ${JSON.stringify(answer)}`, (input) => { input.answers[0].answer = answer; }]),
  ])('lehnt %s ohne Teilwertung ab', async (_name, mutate) => {
    const input = examInput();
    mutate(input);
    const response = await request(appFor()).post(`${TOPIC}/evaluate`).send(input);
    expect(response.status).toBe(400);
    expect(Object.keys(response.body)).toEqual(['error']);
  });

  it('weist falsche Versionen mit 409 und fremde Themen mit 404 zurück', async () => {
    const response = await request(appFor()).post(`${TOPIC}/evaluate`).send({ ...examInput(), version: '2.0.0' });
    expect(response.status).toBe(409);
    expect(Object.keys(response.body)).toEqual(['error']);
    expect((await request(appFor()).post(`${BASE}/topics/fremd/evaluate`).send(examInput())).status).toBe(404);
  });

  it.each([[6, 75, false], [7, 87.5, true], [8, 100, true]])('wertet im zweiten Thema %i von acht mit %s Prozent, bestanden=%s', async (correct, percent, passed) => {
    const input = examInput(correct, GOALS_QUESTION_DATA);
    const response = await request(appFor()).post(`${GOALS}/evaluate`).send(input);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ attemptId: input.attemptId, version: VERSION, total: 8, correct, percent, passed });
    expect(response.body.objectives.map((item) => item.id)).toEqual(['common-lf1-goals-classify', 'common-lf1-goals-balance']);
    expect(response.body.objectives.every((item) => item.total > 0 && Number.isFinite(item.percent))).toBe(true);
    expect(response.body.results.map((item) => item.questionId)).toEqual(input.answers.map((item) => item.questionId));
    expect(response.body.results.every((item) => item.objectiveIds.every((id) => id.startsWith(`${GOALS_ID}-`)))).toBe(true);
  });

  it.each([[TOPIC, 'LJ-LF1-GOALS-E01'], [GOALS, 'LJ-LF1-ROLE-E01'], [GOALS, 'LJ-LF1-GOALS-Q01']])('weist fremde Testpools ohne Teilwertung zurück: %s / %s', async (endpoint, questionId) => {
    const input = examInput(8, endpoint === TOPIC ? QUESTION_DATA : GOALS_QUESTION_DATA);
    input.answers[0].questionId = questionId;
    const response = await request(appFor()).post(`${endpoint}/evaluate`).send(input);
    expect(response.status).toBe(400);
    expect(Object.keys(response.body)).toEqual(['error']);
  });

  it('prüft die Inhaltsversion jeweils am gewählten Thema', async () => {
    const root = fixture();
    changeJson(root, FILES[3], (topic) => { topic.version = '1.1.0'; });
    const app = appFor(root);
    expect((await request(app).post(`${TOPIC}/evaluate`).send(examInput())).status).toBe(200);
    const oldVersion = await request(app).post(`${GOALS}/evaluate`).send(examInput(8, GOALS_QUESTION_DATA));
    expect(oldVersion.status).toBe(409);
    expect(Object.keys(oldVersion.body)).toEqual(['error']);
    expect((await request(app).post(`${GOALS}/evaluate`).send({ ...examInput(8, GOALS_QUESTION_DATA), version: '1.1.0' })).status).toBe(200);
    const question = GOALS_QUESTION_DATA.records.find((item) => item.id.endsWith('-Q01'));
    for (const [version, status] of [[VERSION, 409], ['1.1.0', 200]]) {
      expect((await request(app).post(`${GOALS}/check`).send({ version, questionId: question.id, answer: question.antwort })).status).toBe(status);
    }
  });
});

describe('Begrenzter öffentlicher Inhaltsloader', () => {
  it.each([
    ['fehlender Rückblick', (topic) => { delete topic.fieldReview; }],
    ['unbekanntes Rückblickfeld', (topic) => { topic.fieldReview.internal = 'PRIVATE-MARKER'; }],
    ['fremdes Lernfeld', (topic) => { topic.fieldReview.fieldId = 'LF2'; }],
    ['fehlendes Rückblickthema', (topic) => { topic.fieldReview.topicIds.pop(); }],
    ['vertauschte Rückblickthemen', (topic) => { topic.fieldReview.topicIds.reverse(); }],
    ['fremdes Rückblickthema', (topic) => { topic.fieldReview.topicIds[0] = 'common-lf2-hardware'; }],
    ['falscher Rückblickblock', (topic) => { topic.fieldReview.blockIds = [topic.blocks[0].id]; }],
    ['falsche Rückblickreflexion', (topic) => { topic.fieldReview.interviewIds = [topic.interview[1].id]; }],
    ['fehlende Rückblicktestfrage', (topic) => { topic.fieldReview.questionIds.pop(); }],
    ['Quizfrage im Rückblick', (topic) => { topic.fieldReview.questionIds[0] = topic.quiz.questionIds[0]; }],
    ['fremde Testfrage im Rückblick', (topic) => { topic.fieldReview.questionIds[0] = 'LJ-LF1-ROLE-E01'; }],
    ['fehlender Reflexionsrücksprung', (topic) => { topic.interview[2].blockIds = [topic.blocks[0].id]; }],
    ['fehlender Testrücksprung', (topic) => { topic.questionLinks.find((link) => link.phase === 'exam').blockIds = [topic.blocks[0].id]; }],
    ['fehlende Praxisaufgabe', (topic) => { delete topic.interview[1].practice; }],
    ['Praxisaufgabe an falscher Reflexion', (topic) => { topic.interview[0].practice = topic.interview[1].practice; delete topic.interview[1].practice; }],
    ['leere Praxisaufgabe', (topic) => { topic.interview[1].practice.task = ' '; }],
    ['leere Selbstprüfung', (topic) => { topic.interview[1].practice.checklist = []; }],
    ['ungültige Selbstprüfung', (topic) => { topic.interview[1].practice.checklist = ['Prüfung', null]; }],
    ['doppelte Selbstprüfung', (topic) => { topic.interview[1].practice.checklist = ['Prüfung', 'Prüfung']; }],
    ['fehlender Bestätigungstext', (topic) => { delete topic.interview[1].practice.confirmation; }],
    ['unerlaubte Praxisbewertung', (topic) => { topic.interview[1].practice.passed = true; }],
  ])('weist ungültige Abschlussinhalte geschlossen zurück: %s', async (_label, mutate) => {
    const root = fixture();
    changeJson(root, PRESENTATION_FILE, mutate);
    const response = await request(appFor(root)).get(`${BASE}/topics/${PRESENTATION_ID}`);
    expect(response.status).toBe(503);
    expect(response.body).toEqual({ error: 'Die Lernreise-Inhalte sind gerade nicht verfügbar.' });
  });

  it.each(['fieldReview', 'practice'])('weist Abschlussmetadaten außerhalb des Präsentationsthemas zurück: %s', (key) => {
    const root = fixture();
    const presentation = JSON.parse(fs.readFileSync(path.join(root, 'learning-journey', PRESENTATION_FILE), 'utf8'));
    changeJson(root, FILES[1], (topic) => {
      if (key === 'fieldReview') topic.fieldReview = presentation.fieldReview;
      else topic.interview[1].practice = presentation.interview[1].practice;
    });
    expect(() => loadJourney(root)).toThrow('Die Lernreise-Inhalte sind gerade nicht verfügbar.');
  });

  it.each([
    ['fremder Themenpfad', FILES[0], (plan) => { plan.topics[0].contentFile = '../../private.json'; }],
    ['absoluter Themenpfad', FILES[0], (plan) => { plan.topics[0].contentFile = 'C:\\private.json'; }],
    ['fremder Fragenpfad', FILES[1], (topic) => { topic.questionFile = '../private.csv'; }],
    ['fehlender Theorieblock', FILES[1], (topic) => { topic.blocks.pop(); }],
    ['falsche Version', FILES[1], (topic) => { topic.version = 'unversioniert'; }],
    ['ungeprüfter Inhalt', FILES[1], (topic) => { topic.review.status = 'pending'; }],
    ['Poolüberschneidung', FILES[1], (topic) => { topic.exam.questionIds[0] = topic.quiz.questionIds[0]; }],
    ['falsche Bestehensgrenze', FILES[1], (topic) => { topic.exam.passPercent = 50; }],
    ['falsche Lernzielreferenz', FILES[1], (topic) => { topic.questionLinks[0].objectiveIds = ['fremd']; }],
    ['falscher Theorie-Rücksprung', FILES[1], (topic) => { topic.questionLinks[0].blockIds = [topic.blocks[3].id]; }],
    ['unvollständige Zuordnung', FILES[1], (topic) => { topic.questionLinks.pop(); }],
    ['nicht abgedecktes Lernziel', FILES[1], (topic) => { topic.cards[4].objectiveIds = topic.cards[0].objectiveIds; topic.cards[4].blockIds = topic.cards[0].blockIds; topic.cards[5].objectiveIds = topic.cards[0].objectiveIds; topic.cards[5].blockIds = topic.cards[0].blockIds; }],
    ['gefährliches Quellenprotokoll', FILES[1], (topic) => { topic.sources[0].url = 'javascript:alert(1)'; }],
    ['fremder zweiter Themenpfad', FILES[0], (plan) => { plan.topics[1].contentFile = 'topics/common-lf1-role.v1.json'; }],
    ['ungeordnete Freigabe', FILES[0], (plan) => { [plan.sequence[0], plan.sequence[1]] = [plan.sequence[1], plan.sequence[0]]; }],
    ['ungeprüfte zusätzliche Freigabe', FILES[0], (plan) => { plan.topics[2].status = 'content-ready'; plan.topics[2].contentFile = '../../private.json'; }],
    ['fremde Manifestvoraussetzung', FILES[0], (plan) => { plan.topics[1].prerequisites = ['common-lf1-market']; }],
    ['fremder zweiter Fragenpfad', FILES[3], (topic) => { topic.questionFile = 'questions/common-lf1-role.v1.csv'; }],
    ['falsche zweite Themenkennung', FILES[3], (topic) => { topic.id = TOPIC_ID; }],
    ['fehlende Voraussetzung', FILES[3], (topic) => { topic.prerequisites = []; }],
    ['falsche zweite Version', FILES[3], (topic) => { topic.version = 1; }],
    ['zweiter Inhalt ungeprüft', FILES[3], (topic) => { topic.review.status = 'pending'; }],
    ['fremdes zweites Lernziel', FILES[3], (topic) => { topic.objectives[0].id = 'common-lf1-role-value'; }],
    ['fremder zweiter Quizpool', FILES[3], (topic) => { topic.quiz.questionIds[0] = 'LJ-LF1-ROLE-Q01'; }],
    ['fremder zweiter Testpool', FILES[3], (topic) => { topic.exam.questionIds[0] = 'LJ-LF1-ROLE-E01'; }],
    ['fremdes zweites Kartenziel', FILES[3], (topic) => { topic.cards[0].objectiveIds = ['common-lf1-role-value']; }],
    ['fremder zweiter Theoriebezug', FILES[3], (topic) => { topic.interview[0].blockIds = ['common-lf1-role-services']; }],
  ])('grenzt %s auf einen neutralen Journey-Fehler ein', async (_name, file, mutate) => {
    const root = fixture();
    changeJson(root, file, mutate);
    expect(() => loadJourney(root)).toThrow('Die Lernreise-Inhalte sind gerade nicht verfügbar.');
    const app = appFor(root);
    const response = await request(app).get(TOPIC);
    expect(response.status).toBe(503);
    expect(response.body).toEqual({ error: 'Die Lernreise-Inhalte sind gerade nicht verfügbar.' });
    expect(response.headers['cache-control']).toBe('no-store');
    expect((await request(app).get('/api/health')).status).toBe(200);
  });

  it('weist eine fehlerhafte Fragen-CSV und unbekannte Fragetypen zurück', () => {
    const root = fixture();
    const filename = path.join(root, 'learning-journey', FILES[2]);
    const data = globalThis.structuredClone(QUESTION_DATA);
    data.records[0].typ = 'MC';
    fs.writeFileSync(filename, writeCsv(data.header, data.records));
    expect(() => loadJourney(root)).toThrow();
    fs.writeFileSync(filename, 'id;antwort\nfrage;a\n');
    expect(() => loadJourney(root)).toThrow();
  });

  it.each(['id', 'thema', 'modul_id'])('weist fremde CSV-Zuordnungen im zweiten Thema zurück: %s', (key) => {
    const root = fixture();
    const data = globalThis.structuredClone(GOALS_QUESTION_DATA);
    data.records[0][key] = QUESTION_DATA.records[0][key] === data.records[0][key] ? 'FREMD' : QUESTION_DATA.records[0][key];
    fs.writeFileSync(path.join(root, 'learning-journey', FILES[4]), writeCsv(data.header, data.records));
    expect(() => loadJourney(root)).toThrow('Die Lernreise-Inhalte sind gerade nicht verfügbar.');
  });

  it('folgt keinen Ordnerverknüpfungen zu anderen Inhalten', () => {
    const root = fixture();
    const outside = fixture();
    const topics = path.join(root, 'learning-journey', 'topics');
    for (const id of ALL_TOPIC_IDS) fs.unlinkSync(path.join(topics, `${id}.v1.json`));
    fs.rmdirSync(topics);
    fs.symlinkSync(path.join(outside, 'learning-journey', 'topics'), topics, process.platform === 'win32' ? 'junction' : 'dir');
    expect(() => loadJourney(root)).toThrow('Die Lernreise-Inhalte sind gerade nicht verfügbar.');
  });

  it.each([FILES[1], FILES[3], FILES[4]])('hält die übrige App bei fehlenden freigegebenen Dateien erreichbar: %s', async (file) => {
    const root = fixture();
    fs.unlinkSync(path.join(root, 'learning-journey', file));
    const app = appFor(root);
    expect((await request(app).get(BASE)).status).toBe(503);
    expect((await request(app).get('/api/health')).status).toBe(200);
  });

  it('liest den alten Manifeststand ohne zweites Inhaltspaket weiterhin unverändert', async () => {
    const root = fixture();
    changeJson(root, FILES[0], (plan) => {
      legacyPlan(plan);
      for (const topic of plan.topics.filter((item) => ALL_TOPIC_IDS.slice(1).includes(item.id))) {
        topic.status = 'planned'; topic.contentFile = null;
      }
    });
    for (const file of FILES.slice(3)) fs.unlinkSync(path.join(root, 'learning-journey', file));
    const app = appFor(root);
    const summary = (await request(app).get(BASE)).body;
    expect(summary.version).toBe(VERSION);
    expect(summary.readyTopics.map((item) => item.id)).toEqual([TOPIC_ID]);
    expect(summary.fields.find((field) => field.id === 'LF1').reviewTopicId).toBeNull();
    expect((await request(app).get(TOPIC)).body.nextTopic).toBeNull();
    expect((await request(app).get(GOALS)).status).toBe(404);
    expect((await request(app).post(`${TOPIC}/evaluate`).send(examInput())).status).toBe(200);
  });

  it('liest den bisherigen Zwei-Themen-Stand ohne neue Dateien und ohne Rückblickfreigabe', async () => {
    const root = fixture();
    changeJson(root, FILES[0], (plan) => {
      legacyPlan(plan);
      for (const topic of plan.topics.filter((item) => ALL_TOPIC_IDS.slice(2).includes(item.id))) {
        topic.status = 'planned'; topic.contentFile = null;
      }
    });
    for (const file of FILES.slice(5)) fs.unlinkSync(path.join(root, 'learning-journey', file));
    const journey = loadJourney(root);
    expect(journey.getSummary().readyTopics.map((topic) => topic.id)).toEqual(TOPIC_IDS.slice(0, 2));
    expect(journey.getTopic(GOALS_ID).nextTopic).toBeNull();
    expect(journey.getTopic(GOALS_ID).field.reviewTopicId).toBeNull();
    expect(journey.evaluate(GOALS_ID, examInput(8, GOALS_QUESTION_DATA)).passed).toBe(true);
  });
  it('liest den alten Sechs-Themen-Stand ohne Etappenmetadaten und ohne WISO-Dateien', () => {
    const root = fixture();
    changeJson(root, FILES[0], (plan) => {
      legacyPlan(plan);
      for (const entry of plan.topics.filter((item) => WISO_IDS.includes(item.id))) { entry.status = 'planned'; entry.contentFile = null; }
    });
    for (const id of [...WISO_IDS, ...PM_IDS]) for (const file of [`topics/${id}.v1.json`, `questions/${id}.v1.csv`]) fs.unlinkSync(path.join(root, 'learning-journey', file));
    const journey = loadJourney(root);
    expect(journey.getSummary().readyTopics.map((topic) => topic.id)).toEqual(TOPIC_IDS);
    expect(journey.getSummary().stages.map((stage) => stage.id)).toEqual(STAGE_IDS);
    expect(journey.getTopic(PRESENTATION_ID).nextTopic).toBeNull();
    expect(journey.getTopic(PRESENTATION_ID).field.reviewTopicId).toBe(PRESENTATION_ID);
    expect(journey.getSummary().fields.find((field) => field.id === 'WISO').reviewTopicId).toBeNull();
  });

  it.each([false, true])('liest alte 84/13-Pläne mit 16 Themen ohne PM-Dateien (Etappenmetadaten: %s)', (withStages) => {
    const root = fixture();
    changeJson(root, FILES[0], (plan) => {
      legacyPlan(plan);
      if (withStages) {
        plan.stageOrder = [...STAGE_IDS];
        plan.plannedStages = [{ id: 'PM', title: 'Projektmanagement', status: 'planned' }];
      }
    });
    for (const id of PM_IDS) for (const file of [`topics/${id}.v1.json`, `questions/${id}.v1.csv`]) fs.unlinkSync(path.join(root, 'learning-journey', file));
    const journey = loadJourney(root);
    expect(journey.getSummary()).toMatchObject({ version: VERSION, totalTopics: 84 });
    expect(journey.getSummary().fields).toHaveLength(13);
    expect(journey.getSummary().readyTopics.map((topic) => topic.id)).toEqual(PRE_PM_IDS);
    expect(journey.getSummary().stages.find((stage) => stage.id === 'PM')).toEqual({ id: 'PM', title: 'Projektmanagement', status: 'planned', topicIds: [], reviewTopicId: null, total: 0, available: 0 });
    expect(journey.getTopic(EUROPE_ID).nextTopic).toBeNull();
    expect(() => journey.getTopic(PM_IDS[0])).toThrow('Dieser Lernabschnitt ist nicht verfügbar.');
  });

  for (const [stageId, reviewId] of [['WISO', EUROPE_ID], ['PM', CLOSURE_ID]]) {
    it.each([
      ['fehlender Rückblick', (topic) => { delete topic.fieldReview; }],
      ['falsches Feld', (topic) => { topic.fieldReview.fieldId = 'LF1'; }],
      ['fehlendes Thema', (topic) => { topic.fieldReview.topicIds.pop(); }],
      ['ungeordnete Themen', (topic) => { topic.fieldReview.topicIds.reverse(); }],
      ['fremdes Thema', (topic) => { topic.fieldReview.topicIds[0] = TOPIC_ID; }],
      ['falscher Block', (topic) => { topic.fieldReview.blockIds = [topic.blocks[0].id]; }],
      ['falsche Reflexion', (topic) => { topic.fieldReview.interviewIds = [topic.interview[1].id]; }],
      ['fehlende Testfrage', (topic) => { topic.fieldReview.questionIds.pop(); }],
      ['Quizfrage', (topic) => { topic.fieldReview.questionIds[0] = topic.quiz.questionIds[0]; }],
      ['fremde Testfrage', (topic) => { topic.fieldReview.questionIds[0] = 'LJ-WISO-TRAINING-E01'; }],
      ['fehlender Reflexionsbezug', (topic) => { topic.interview[2].blockIds = [topic.blocks[0].id]; }],
      ['fehlender Testbezug', (topic) => { topic.questionLinks.find((link) => link.phase === 'exam').blockIds = [topic.blocks[0].id]; }],
      ['unerlaubte Zusatzdaten', (topic) => { topic.fieldReview.completed = true; }],
      ['falsche Praxispflicht', (topic) => { topic.interview[1].practice = { task: 'Vortragen', checklist: ['Prüfen'], confirmation: 'Bestätigen' }; }],
    ])(`weist ${stageId}-Rückblickfehler geschlossen zurück: %s`, (_label, mutate) => {
      const root = fixture();
      changeJson(root, `topics/${reviewId}.v1.json`, mutate);
      expect(() => loadJourney(root)).toThrow('Die Lernreise-Inhalte sind gerade nicht verfügbar.');
    });
  }

  it.each([...WISO_IDS, ...PM_IDS, ...LF2_IDS, ...LF3_IDS])('schützt Thema, Quelle, Lernziel, Ablage und Pools für %s', (id) => {
    const topicFile = `topics/${id}.v1.json`;
    for (const mutate of [
      (topic) => { topic.questionFile = 'questions/common-lf1-role.v1.csv'; },
      (topic) => { topic.review.status = 'pending'; },
      (topic) => { topic.review.checkedAt = '2026-02-30'; },
      (topic) => { topic.fieldId = 'LF1'; },
      (topic) => { topic.prerequisites = []; },
      (topic) => { topic.objectives[0].id = 'common-lf1-role-value'; },
      (topic) => { topic.questionLinks[0].blockIds = ['common-lf1-role-services']; },
      (topic) => { topic.quiz.questionIds[0] = 'LJ-LF1-ROLE-Q01'; },
      (topic) => { topic.exam.questionIds[0] = topic.quiz.questionIds[0]; },
      (topic) => { topic.sources[0].url = 'https://example.org/unregistered'; },
      (topic) => { topic.sources[0].id = 'unknown-source'; },
    ]) {
      const root = fixture(); changeJson(root, topicFile, mutate);
      expect(() => loadJourney(root)).toThrow('Die Lernreise-Inhalte sind gerade nicht verfügbar.');
    }
    const root = fixture();
    const file = path.join(root, 'learning-journey', `questions/${id}.v1.csv`);
    const csv = parseCsv(fs.readFileSync(file, 'utf8'));
    csv.records[0].lernfeld = 'WISO';
    fs.writeFileSync(file, writeCsv(csv.header, csv.records));
    expect(() => loadJourney(root)).toThrow('Die Lernreise-Inhalte sind gerade nicht verfügbar.');
    if (PM_IDS.includes(id) || LF2_IDS.includes(id) || LF3_IDS.includes(id)) {
      const moduleRoot = fixture();
      const moduleFile = path.join(moduleRoot, 'learning-journey', `questions/${id}.v1.csv`);
      const moduleCsv = parseCsv(fs.readFileSync(moduleFile, 'utf8'));
      moduleCsv.records[0].modul_id = 'WISO';
      fs.writeFileSync(moduleFile, writeCsv(moduleCsv.header, moduleCsv.records));
      expect(() => loadJourney(moduleRoot)).toThrow('Die Lernreise-Inhalte sind gerade nicht verfügbar.');
    }
  });

  it.each([
    (plan) => { plan.stageOrder = [...STAGE_IDS].reverse(); },
    (plan) => { plan.stageOrder = STAGE_IDS.filter((id) => id !== 'PM'); },
    (plan) => { plan.plannedStages = [{ id: 'PM', title: 'Projektmanagement', status: 'content-ready' }]; },
    (plan) => { plan.plannedStages = [{ id: 'PM', title: 'Projektmanagement', status: 'planned', contentFile: '../../private.json' }]; },
    (plan) => { plan.plannedStages = [{ id: 'PM', title: 'Projektmanagement', status: 'planned' }]; },
    (plan) => { plan.fields.find((field) => field.id === 'PM').topicIds.reverse(); },
    (plan) => { [plan.sequence[16], plan.sequence[17]] = [plan.sequence[17], plan.sequence[16]]; },
    (plan) => { plan.topics.find((topic) => topic.id === EUROPE_ID).status = 'planned'; plan.topics.find((topic) => topic.id === EUROPE_ID).contentFile = null; },
    (plan) => { plan.topics.find((topic) => topic.id === PRESENTATION_ID).status = 'planned'; plan.topics.find((topic) => topic.id === PRESENTATION_ID).contentFile = null; },
  ])('weist falsche Etappenmetadaten und WISO ohne vollständige LF1-Freigabe zurück', (mutate) => {
    const root = fixture(); changeJson(root, FILES[0], mutate);
    expect(() => loadJourney(root)).toThrow('Die Lernreise-Inhalte sind gerade nicht verfügbar.');
  });

  it.each(PRE_PM_IDS)('verlangt für PM auch die alte Freigabe %s', (id) => {
    const root = fixture();
    changeJson(root, FILES[0], (plan) => {
      const entry = plan.topics.find((topic) => topic.id === id);
      entry.status = 'planned'; entry.contentFile = null;
    });
    expect(() => loadJourney(root)).toThrow('Die Lernreise-Inhalte sind gerade nicht verfügbar.');
  });

  it.each([false, true])('liest den alten 94/14-Stand mit 26 Themen ohne LF2-Dateien (Etappenmetadaten: %s)', (withStages) => {
    const root = fixture();
    changeJson(root, FILES[0], (plan) => {
      for (const entry of plan.topics.filter((item) => [...LF2_IDS, ...LF3_IDS].includes(item.id))) { entry.status = 'planned'; entry.contentFile = null; }
      if (!withStages) { delete plan.stageOrder; delete plan.plannedStages; }
    });
    for (const id of LF2_IDS) for (const file of [`topics/${id}.v1.json`, `questions/${id}.v1.csv`]) fs.unlinkSync(path.join(root, 'learning-journey', file));
    const journey = loadJourney(root);
    expect(journey.getSummary()).toMatchObject({ version: VERSION, totalTopics: 94 });
    expect(journey.getSummary().fields).toHaveLength(14);
    expect(journey.getSummary().readyTopics.map((item) => item.id)).toEqual(PRE_LF2_IDS);
    expect(journey.getTopic(CLOSURE_ID).nextTopic).toBeNull();
    expect(() => journey.getTopic(HANDOVER_ID)).toThrow('Dieser Lernabschnitt ist nicht verfügbar.');
  });

  it('bindet alle sieben synthetischen LF2-Freigaben an eigene Pools und den festen DTO-Vertrag', () => {
    const root = fixture();
    const journey = loadJourney(root);
    expect(journey.getSummary().readyTopics.map((item) => item.id)).toEqual(ALL_TOPIC_IDS);
    for (const [index, id] of LF2_IDS.entries()) {
      const current = journey.getTopic(id);
      expect(current.navigationPrerequisites).toEqual([...new Set([...PRE_LF2_IDS, ...current.prerequisites, ...(index ? [LF2_IDS[index - 1]] : [])])]);
      expect(current.nextTopic?.id ?? null).toBe(LF2_IDS[index + 1] ?? LF3_IDS[0]);
      expect(current).not.toHaveProperty('workplace');
      expect(current).not.toHaveProperty('workplaceState');
      const csv = parseCsv(fs.readFileSync(path.join(root, 'learning-journey', `questions/${id}.v1.csv`), 'utf8'));
      expect(journey.evaluate(id, examInput(8, csv))).toMatchObject({ passed: true, correct: 8 });
      expect(journey.check(id, { version: VERSION, questionId: current.quiz.questionIds[0], answer: 'a' })).toMatchObject({ correct: true });
      expect(() => journey.check(id, { version: VERSION, questionId: current.exam.questionIds[0], answer: 'a' })).toThrow();
      for (const otherId of LF2_IDS.filter((item) => item !== id)) {
        expect(() => journey.evaluate(id, examInput(8, parseCsv(fs.readFileSync(path.join(root, 'learning-journey', `questions/${otherId}.v1.csv`), 'utf8'))))).toThrow();
      }
    }
    const handover = journey.getTopic(HANDOVER_ID);
    expect(Object.keys(handover.interview[1].practice).sort()).toEqual(['checklist', 'confirmation', 'task']);
    expect(handover.fieldReview.topicIds).toEqual(LF2_IDS);
    expect(journey.getTopic(CLOSURE_ID).nextTopic.id).toBe(LF2_IDS[0]);
  });

  it.each(PRE_LF2_IDS)('verlangt für LF2 die bisherige Freigabe %s', (id) => {
    const root = fixture();
    changeJson(root, FILES[0], (plan) => { const entry = plan.topics.find((item) => item.id === id); entry.status = 'planned'; entry.contentFile = null; });
    expect(() => loadJourney(root)).toThrow('Die Lernreise-Inhalte sind gerade nicht verfügbar.');
  });

  it.each([
    ['fehlender Rückblick', (doc) => { delete doc.fieldReview; }],
    ['falsche Etappe', (doc) => { doc.fieldReview.fieldId = 'PM'; }],
    ['unvollständige Themen', (doc) => { doc.fieldReview.topicIds.pop(); }],
    ['fremdes Thema', (doc) => { doc.fieldReview.topicIds[0] = CLOSURE_ID; }],
    ['ungeordnete Themen', (doc) => { doc.fieldReview.topicIds.reverse(); }],
    ['falscher Block', (doc) => { doc.fieldReview.blockIds = [doc.blocks[0].id]; }],
    ['falsche Reflexion', (doc) => { doc.fieldReview.interviewIds = [doc.interview[1].id]; }],
    ['fremde Frage', (doc) => { doc.fieldReview.questionIds[0] = 'LJ-LF2-REQUIREMENTS-E01'; }],
    ['fehlende Testfrage', (doc) => { doc.fieldReview.questionIds.pop(); }],
    ['Quizfrage im Rückblick', (doc) => { doc.fieldReview.questionIds[0] = doc.quiz.questionIds[0]; }],
    ['fehlender Theoriebezug in Reflexion', (doc) => { doc.interview[2].blockIds.pop(); }],
    ['fehlender Theoriebezug im Test', (doc) => { doc.questionLinks.find((item) => item.phase === 'exam').blockIds.pop(); }],
    ['zusätzlicher Zustand', (doc) => { doc.fieldReview.completed = true; }],
    ['fehlende Praxis', (doc) => { delete doc.interview[1].practice; }],
    ['falsche Praxisposition', (doc) => { doc.interview[0].practice = doc.interview[1].practice; delete doc.interview[1].practice; }],
    ['erfundenes Praxisresultat', (doc) => { doc.interview[1].practice.passed = true; }],
    ['leere Praxis', (doc) => { doc.interview[1].practice.task = ' '; }],
    ['fehlende Prüfliste', (doc) => { doc.interview[1].practice.checklist = []; }],
    ['doppelte Prüfliste', (doc) => { doc.interview[1].practice.checklist = ['Prüfen', 'Prüfen']; }],
    ['fehlende Bestätigung', (doc) => { delete doc.interview[1].practice.confirmation; }],
  ])('weist synthetische LF2-Abschlussfehler zurück: %s', (_label, mutate) => {
    const root = fixture(); changeJson(root, `topics/${HANDOVER_ID}.v1.json`, mutate);
    expect(() => loadJourney(root)).toThrow('Die Lernreise-Inhalte sind gerade nicht verfügbar.');
  });

  it.each(LF2_IDS.slice(0, -1))('erlaubt keine Praxis oder Rückblickmetadaten im LF2-Thema %s', (id) => {
    for (const key of ['practice', 'fieldReview']) {
      const root = fixture();
      const handover = JSON.parse(fs.readFileSync(path.join(root, 'learning-journey', `topics/${HANDOVER_ID}.v1.json`), 'utf8'));
      changeJson(root, `topics/${id}.v1.json`, (doc) => { if (key === 'practice') doc.interview[1].practice = handover.interview[1].practice; else doc.fieldReview = handover.fieldReview; });
      expect(() => loadJourney(root)).toThrow('Die Lernreise-Inhalte sind gerade nicht verfügbar.');
    }
  });

  it.each([false, true])('liest alte 94/14-Pläne mit 33 Freigaben ohne LF3-Dateien (Etappenmetadaten: %s)', (withStages) => {
    const root = fixture();
    changeJson(root, FILES[0], (plan) => {
      for (const entry of plan.topics.filter((item) => LF3_IDS.includes(item.id))) { entry.status = 'planned'; entry.contentFile = null; }
      if (!withStages) { delete plan.stageOrder; delete plan.plannedStages; }
    });
    for (const id of LF3_IDS) for (const file of [`topics/${id}.v1.json`, `questions/${id}.v1.csv`]) fs.unlinkSync(path.join(root, 'learning-journey', file));
    const journey = loadJourney(root);
    expect(journey.getSummary()).toMatchObject({ version: VERSION, totalTopics: 94 });
    expect(journey.getSummary().fields).toHaveLength(14);
    expect(journey.getSummary().readyTopics.map((item) => item.id)).toEqual(PRE_LF3_IDS);
    expect(journey.getTopic(HANDOVER_ID).nextTopic).toBeNull();
    expect(() => journey.getTopic(DIAGNOSIS_ID)).toThrow('Dieser Lernabschnitt ist nicht verfügbar.');
  });

  it('bindet alle sechs synthetischen LF3-Freigaben an eigene Pools und den festen DTO-Vertrag', () => {
    const root = fixture();
    const journey = loadJourney(root);
    expect(journey.getSummary().readyTopics.map((item) => item.id)).toEqual(ALL_TOPIC_IDS);
    for (const [index, id] of LF3_IDS.entries()) {
      const current = journey.getTopic(id);
      expect(current.navigationPrerequisites).toEqual([...new Set([...PRE_LF3_IDS, ...current.prerequisites, ...(index ? [LF3_IDS[index - 1]] : [])])]);
      expect(current.nextTopic?.id ?? null).toBe(LF3_IDS[index + 1] ?? null);
      expect(current).not.toHaveProperty('network');
      expect(current).not.toHaveProperty('networkState');
      const csv = parseCsv(fs.readFileSync(path.join(root, 'learning-journey', `questions/${id}.v1.csv`), 'utf8'));
      expect(journey.evaluate(id, examInput(8, csv))).toMatchObject({ passed: true, correct: 8 });
      expect(journey.check(id, { version: VERSION, questionId: current.quiz.questionIds[0], answer: 'a' })).toMatchObject({ correct: true });
      expect(() => journey.check(id, { version: VERSION, questionId: current.exam.questionIds[0], answer: 'a' })).toThrow();
      for (const otherId of LF3_IDS.filter((item) => item !== id)) {
        expect(() => journey.evaluate(id, examInput(8, parseCsv(fs.readFileSync(path.join(root, 'learning-journey', `questions/${otherId}.v1.csv`), 'utf8'))))).toThrow();
      }
    }
    const handover = journey.getTopic(DIAGNOSIS_ID);
    expect(Object.keys(handover.interview[1].practice).sort()).toEqual(['checklist', 'confirmation', 'task']);
    expect(handover.fieldReview.topicIds).toEqual(LF3_IDS);
    expect(journey.getTopic(HANDOVER_ID).nextTopic.id).toBe(LF3_IDS[0]);
  });

  it.each(PRE_LF3_IDS)('verlangt für LF3 die bisherige Freigabe %s', (id) => {
    const root = fixture();
    changeJson(root, FILES[0], (plan) => { const entry = plan.topics.find((item) => item.id === id); entry.status = 'planned'; entry.contentFile = null; });
    expect(() => loadJourney(root)).toThrow('Die Lernreise-Inhalte sind gerade nicht verfügbar.');
  });

  it.each([
    ['fehlender Rückblick', (doc) => { delete doc.fieldReview; }],
    ['falsche Etappe', (doc) => { doc.fieldReview.fieldId = 'PM'; }],
    ['unvollständige Themen', (doc) => { doc.fieldReview.topicIds.pop(); }],
    ['fremdes Thema', (doc) => { doc.fieldReview.topicIds[0] = HANDOVER_ID; }],
    ['ungeordnete Themen', (doc) => { doc.fieldReview.topicIds.reverse(); }],
    ['falscher Block', (doc) => { doc.fieldReview.blockIds = [doc.blocks[0].id]; }],
    ['falsche Reflexion', (doc) => { doc.fieldReview.interviewIds = [doc.interview[1].id]; }],
    ['fremde Frage', (doc) => { doc.fieldReview.questionIds[0] = 'LJ-LF3-PHYSICAL-E01'; }],
    ['fehlende Testfrage', (doc) => { doc.fieldReview.questionIds.pop(); }],
    ['Quizfrage im Rückblick', (doc) => { doc.fieldReview.questionIds[0] = doc.quiz.questionIds[0]; }],
    ['fehlender Theoriebezug in Reflexion', (doc) => { doc.interview[2].blockIds.pop(); }],
    ['fehlender Theoriebezug im Test', (doc) => { doc.questionLinks.find((item) => item.phase === 'exam').blockIds.pop(); }],
    ['zusätzlicher Zustand', (doc) => { doc.fieldReview.completed = true; }],
    ['fehlende Praxis', (doc) => { delete doc.interview[1].practice; }],
    ['falsche Praxisposition', (doc) => { doc.interview[0].practice = doc.interview[1].practice; delete doc.interview[1].practice; }],
    ['erfundenes Praxisresultat', (doc) => { doc.interview[1].practice.passed = true; }],
    ['leere Praxis', (doc) => { doc.interview[1].practice.task = ' '; }],
    ['fehlende Prüfliste', (doc) => { doc.interview[1].practice.checklist = []; }],
    ['doppelte Prüfliste', (doc) => { doc.interview[1].practice.checklist = ['Prüfen', 'Prüfen']; }],
    ['fehlende Bestätigung', (doc) => { delete doc.interview[1].practice.confirmation; }],
  ])('weist synthetische LF3-Abschlussfehler zurück: %s', (_label, mutate) => {
    const root = fixture(); changeJson(root, `topics/${DIAGNOSIS_ID}.v1.json`, mutate);
    expect(() => loadJourney(root)).toThrow('Die Lernreise-Inhalte sind gerade nicht verfügbar.');
  });

  it.each(LF3_IDS.slice(0, -1))('erlaubt keine Praxis oder Rückblickmetadaten im LF3-Thema %s', (id) => {
    for (const key of ['practice', 'fieldReview']) {
      const root = fixture();
      const handover = JSON.parse(fs.readFileSync(path.join(root, 'learning-journey', `topics/${DIAGNOSIS_ID}.v1.json`), 'utf8'));
      changeJson(root, `topics/${id}.v1.json`, (doc) => { if (key === 'practice') doc.interview[1].practice = handover.interview[1].practice; else doc.fieldReview = handover.fieldReview; });
      expect(() => loadJourney(root)).toThrow('Die Lernreise-Inhalte sind gerade nicht verfügbar.');
    }
  });

});


describe('LF4 bis LF9 mit unabhängigen synthetischen Inhalten', () => {
  it.each([false, true])('liest den alten 94/14-Stand mit 39 Freigaben ohne LF4–LF6-Dateien (Etappenmetadaten: %s)', (withStages) => {
    const root = fixture();
    if (!withStages) changeJson(root, FILES[0], (plan) => { delete plan.stageOrder; delete plan.plannedStages; });
    const service = loadJourney(root);
    expect(service.getSummary().readyTopics.map((item) => item.id)).toEqual(ALL_TOPIC_IDS);
    expect(service.getTopic(DIAGNOSIS_ID).nextTopic).toBeNull();
    for (const id of NEW_IDS) {
      expect(fs.existsSync(path.join(root, 'learning-journey', `topics/${id}.v1.json`))).toBe(false);
      expect(fs.existsSync(path.join(root, 'learning-journey', `questions/${id}.v1.csv`))).toBe(false);
      expect(() => service.getTopic(id)).toThrow('Dieser Lernabschnitt ist nicht verfügbar.');
    }
  });
  it('bindet 35 neue Themen an Reihenfolge, Datenverträge und sechs Praxisabschlüsse', () => {
    const root = fixture(true); const service = loadJourney(root);
    expect(service.getSummary().readyTopics.map(t => t.id)).toEqual(RELEASED_IDS);
    for (const [id, fieldId, objectiveIds, prerequisites] of NEW_CONTRACTS) {
      const topic = service.getTopic(id);
      expect(topic.objectives.map(o => o.id)).toEqual(objectiveIds);
      expect(topic.prerequisites).toEqual(prerequisites);
      const prior = RELEASED_IDS.slice(0, RELEASED_IDS.indexOf(NEW_FIELDS[fieldId][0]));
      const previous = RELEASED_IDS[RELEASED_IDS.indexOf(id) - 1];
      expect(topic.navigationPrerequisites).toEqual([...new Set([...prior, ...prerequisites, previous])]);
      expect(topic.nextTopic?.id ?? null).toBe(RELEASED_IDS[RELEASED_IDS.indexOf(id) + 1] ?? null);
      const final = NEW_FIELDS[fieldId].at(-1) === id;
      expect(Boolean(topic.fieldReview)).toBe(final);
      expect(Boolean(topic.interview[1].practice)).toBe(final);
      expect(topic).not.toHaveProperty('practice');
      for (const row of [...topic.quiz.questions, ...topic.exam.questions]) expect(row).not.toHaveProperty('antwort');
    }
  });
  it.each(NEW_IDS)('wehrt manipulierte Inhalte und Quellen in %s ab', id => {
    const root = fixture(true);
    for (const mutate of [doc => { doc.review.status = 'pending'; }, doc => { doc.prerequisites = []; }, doc => { doc.questionFile = '../private.pdf'; }, doc => { doc.objectives[0].id += '-falsch'; }, doc => { doc.blocks.pop(); }, doc => { doc.exam.questionIds[0] = doc.quiz.questionIds[0]; }]) {
      const file = 'topics/' + id + '.v1.json'; const original = fs.readFileSync(path.join(root, 'learning-journey', file), 'utf8');
      changeJson(root, file, mutate); expect(() => loadJourney(root)).toThrow(); fs.writeFileSync(path.join(root, 'learning-journey', file), original);
    }
  });
  it.each(['LF4', 'LF5', 'LF6', 'LF7', 'LF8', 'LF9'])('verlangt frühere Etappen und vollständigen Abschluss für %s', field => {
    const root = fixture(true); const last = NEW_FIELDS[field].at(-1);
    changeJson(root, 'topics/' + last + '.v1.json', doc => { doc.fieldReview.topicIds.pop(); }); expect(() => loadJourney(root)).toThrow();
    const second = fixture(true); changeJson(second, 'fiae.v1.json', plan => { const earlier = plan.topics.find(t => t.id === 'common-lf3-physical'); earlier.status = 'planned'; earlier.contentFile = null; }); expect(() => loadJourney(second)).toThrow();
  });
  it.each(['LF4', 'LF5', 'LF6', 'LF7', 'LF8', 'LF9'])('schützt Praxis und Rückblick in %s vor unvollständigen oder vorgezogenen Freigaben', (fieldId) => {
    const root = fixture(true);
    const file = `topics/${NEW_FIELDS[fieldId].at(-1)}.v1.json`;
    const filename = path.join(root, 'learning-journey', file);
    const original = fs.readFileSync(filename, 'utf8');
    for (const mutate of [
      (doc) => { delete doc.fieldReview; }, (doc) => { doc.fieldReview.fieldId = 'LF3'; },
      (doc) => { doc.fieldReview.topicIds.reverse(); }, (doc) => { doc.fieldReview.blockIds = [doc.blocks[0].id]; },
      (doc) => { doc.fieldReview.interviewIds = [doc.interview[1].id]; },
      (doc) => { doc.fieldReview.questionIds[0] = doc.quiz.questionIds[0]; },
      (doc) => { doc.questionLinks.find(link => link.phase === 'exam').blockIds = [doc.blocks[0].id]; },
      (doc) => { delete doc.interview[1].practice; },
      (doc) => { doc.interview[0].practice = doc.interview[1].practice; delete doc.interview[1].practice; },
      (doc) => { doc.interview[1].practice.checklist = []; },
      (doc) => { doc.interview[1].practice.passed = true; },
    ]) {
      changeJson(root, file, mutate);
      expect(() => loadJourney(root)).toThrow();
      fs.writeFileSync(filename, original);
    }
    for (const id of NEW_FIELDS[fieldId].slice(0, -1)) {
      const otherFile = `topics/${id}.v1.json`;
      const otherFilename = path.join(root, 'learning-journey', otherFile);
      const otherOriginal = fs.readFileSync(otherFilename, 'utf8');
      for (const key of ['practice', 'fieldReview']) {
        changeJson(root, otherFile, (doc) => {
          const final = JSON.parse(original);
          if (key === 'practice') doc.interview[1].practice = final.interview[1].practice;
          else doc.fieldReview = final.fieldReview;
        });
        expect(() => loadJourney(root)).toThrow();
        fs.writeFileSync(otherFilename, otherOriginal);
      }
    }
  });
  it.each(NEW_IDS)('veröffentlicht für %s keine lokalen Modellstände oder Lösungen', async (id) => {
    const root = fixture(true);
    changeJson(root, `topics/${id}.v1.json`, (doc) => {
      doc.practice = { code: 'PRIVATE_MODEL_SENTINEL', answers: ['PRIVATE_MODEL_SENTINEL'], checked: true, done: true };
      doc.practiceState = { rows: ['PRIVATE_MODEL_SENTINEL'], protocol: ['PRIVATE_MODEL_SENTINEL'] };
      doc.blocks[0].modelState = { code: 'PRIVATE_MODEL_SENTINEL' };
      doc.interview[0].modelState = { answers: ['PRIVATE_MODEL_SENTINEL'] };
    });
    const response = await request(appFor(root)).get(`${BASE}/topics/${id}`);
    expect(response.status).toBe(200);
    expect(JSON.stringify(response.body)).not.toContain('PRIVATE_MODEL_SENTINEL');
    expect(response.body).not.toHaveProperty('practice');
    expect(response.body).not.toHaveProperty('practiceState');
  });
});

it('liest den bisherigen 57-Themen-Stand unverändert ohne LF7–LF9-Dateien', () => { const root = fixture('lf456'); const service = loadJourney(root); expect(service.getSummary().readyTopics.map(t => t.id)).toEqual(RELEASED_IDS.filter(id => !/^common-lf[789]-/.test(id))); expect(service.getTopic('common-lf6-closure').nextTopic).toBeNull(); });

it('öffnet frühere Stände mit 74 Themen auch ohne die Spezialisierungsdateien', () => {
  const service = loadJourney(fixture(true));
  expect(service.getProgressCatalog().readyTopics.map(topic => topic.id)).toEqual(RELEASED_IDS);
  expect(service.getTopic('common-lf9-handover').nextTopic).toBeNull();
  expect(() => service.getTopic(SPECIAL_IDS[0])).toThrow();
});
