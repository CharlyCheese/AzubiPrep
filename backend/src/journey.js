// Öffentliche, zustandslose Lernabschnitte. Keine App-Konfiguration, DB oder KI.
import { specializationTopics, specializationStages } from './journey-specialization.js';
import fs from 'node:fs';
import path from 'node:path';
import { parseCsv, parseRowsRaw } from './csv.js';

// Neue Freigaben erfordern eine bewusste Erweiterung dieser festen Allowlist.
// Weder Manifest noch Anfragen dürfen zusätzliche Dateipfade bestimmen.
const TOPICS = [
  {
    id: 'common-lf1-role', topicFile: 'topics/common-lf1-role.v1.json', questionFile: 'questions/common-lf1-role.v1.csv',
    prerequisites: [], objectiveIds: ['common-lf1-role-value', 'common-lf1-role-team', 'common-lf1-role-responsibility'], questionPrefix: 'LJ-LF1-ROLE',
  },
  {
    id: 'common-lf1-goals', topicFile: 'topics/common-lf1-goals.v1.json', questionFile: 'questions/common-lf1-goals.v1.csv',
    prerequisites: ['common-lf1-role'], objectiveIds: ['common-lf1-goals-classify', 'common-lf1-goals-balance'], questionPrefix: 'LJ-LF1-GOALS',
  },
  {
    id: 'common-lf1-market', topicFile: 'topics/common-lf1-market.v1.json', questionFile: 'questions/common-lf1-market.v1.csv',
    prerequisites: ['common-lf1-role'], objectiveIds: ['common-lf1-market-relations', 'common-lf1-market-offer'], questionPrefix: 'LJ-LF1-MARKET',
  },
  {
    id: 'common-lf1-value-chain', topicFile: 'topics/common-lf1-value-chain.v1.json', questionFile: 'questions/common-lf1-value-chain.v1.csv',
    prerequisites: ['common-lf1-market'], objectiveIds: ['common-lf1-value-chain-steps', 'common-lf1-value-chain-contribution'], questionPrefix: 'LJ-LF1-VALUE-CHAIN',
  },
  {
    id: 'common-lf1-organization', topicFile: 'topics/common-lf1-organization.v1.json', questionFile: 'questions/common-lf1-organization.v1.csv',
    prerequisites: ['common-lf1-value-chain'], objectiveIds: ['common-lf1-organization-structure', 'common-lf1-organization-legalform', 'common-lf1-organization-authority'], questionPrefix: 'LJ-LF1-ORGANIZATION',
  },
  {
    id: 'common-lf1-presentation', topicFile: 'topics/common-lf1-presentation.v1.json', questionFile: 'questions/common-lf1-presentation.v1.csv',
    prerequisites: ['common-lf1-goals', 'common-lf1-organization'], objectiveIds: ['common-lf1-presentation-prepare', 'common-lf1-presentation-present', 'common-lf1-presentation-improve'], questionPrefix: 'LJ-LF1-PRESENTATION',
  },
];
const LF1_TOPIC_IDS = TOPICS.map((topic) => topic.id);
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
for (const [suffix, objectives, prerequisites] of WISO_CONTRACTS) {
  const id = `common-wiso-${suffix}`;
  TOPICS.push({ id, topicFile: `topics/${id}.v1.json`, questionFile: `questions/${id}.v1.csv`, prerequisites, objectiveIds: objectives.map((objective) => `${id}-${objective}`), questionPrefix: `LJ-WISO-${suffix.toUpperCase()}` });
}
const WISO_TOPIC_IDS = TOPICS.filter((topic) => topic.id.startsWith('common-wiso-')).map((topic) => topic.id);
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
for (const [suffix, objectives, prerequisite] of PM_CONTRACTS) {
  const id = `common-pm-${suffix}`;
  TOPICS.push({ id, topicFile: `topics/${id}.v1.json`, questionFile: `questions/${id}.v1.csv`, prerequisites: [prerequisite], objectiveIds: objectives.map((objective) => `${id}-${objective}`), questionPrefix: `LJ-PM-${suffix.toUpperCase()}` });
}
const PM_TOPIC_IDS = PM_CONTRACTS.map(([suffix]) => `common-pm-${suffix}`);
const PRE_PM_TOPIC_IDS = [...LF1_TOPIC_IDS, ...WISO_TOPIC_IDS];
const PRE_LF2_TOPIC_IDS = [...PRE_PM_TOPIC_IDS, ...PM_TOPIC_IDS];
const LF2_CONTRACTS = [
  ['requirements', ['clarify', 'plan'], ['common-lf1-role']],
  ['hardware', ['parts', 'fit'], ['common-lf2-requirements']],
  ['software', ['fit', 'license'], ['common-lf2-hardware']],
  ['workplace', ['risk', 'energy', 'lifecycle'], ['common-lf2-hardware']],
  ['comparison', ['criteria', 'cost'], ['common-lf2-software', 'common-lf2-workplace']],
  ['procurement', ['offer', 'order', 'deviation'], ['common-lf2-comparison', 'common-wiso-consumer']],
  ['handover', ['setup', 'handover', 'review'], ['common-lf2-procurement']],
];
for (const [suffix, objectives, prerequisites] of LF2_CONTRACTS) {
  const id = `common-lf2-${suffix}`;
  TOPICS.push({ id, topicFile: `topics/${id}.v1.json`, questionFile: `questions/${id}.v1.csv`, prerequisites, objectiveIds: objectives.map((objective) => `${id}-${objective}`), questionPrefix: `LJ-LF2-${suffix.toUpperCase()}` });
}
const LF2_TOPIC_IDS = LF2_CONTRACTS.map(([suffix]) => `common-lf2-${suffix}`);
const PRE_LF3_TOPIC_IDS = [...PRE_LF2_TOPIC_IDS, ...LF2_TOPIC_IDS];
const LF3_CONTRACTS = [
  ['physical', ['path', 'medium'], ['common-lf2-hardware']],
  ['protocols', ['layers', 'units'], ['common-lf3-physical']],
  ['addressing', ['ipv4', 'ipv6'], ['common-lf3-protocols']],
  ['services', ['configure', 'explain'], ['common-lf3-addressing']],
  ['access', ['identity', 'connection'], ['common-lf3-services']],
  ['diagnosis', ['isolate', 'record'], ['common-lf3-access']],
];
for (const [suffix, objectives, prerequisites] of LF3_CONTRACTS) {
  const id = `common-lf3-${suffix}`;
  TOPICS.push({ id, topicFile: `topics/${id}.v1.json`, questionFile: `questions/${id}.v1.csv`, prerequisites, objectiveIds: objectives.map((objective) => `${id}-${objective}`), questionPrefix: `LJ-LF3-${suffix.toUpperCase()}` });
}
const LF3_TOPIC_IDS = LF3_CONTRACTS.map(([suffix]) => `common-lf3-${suffix}`);
const LF4_CONTRACTS = [
  ["goals", ["distinguish","guideline"], ["common-lf1-value-chain"]],
  ["assets", ["inventory","scenario","dependence"], ["common-lf4-goals"]],
  ["privacy", ["identify","principles","clarify"], ["common-lf4-assets"]],
  ["assessment", ["classify","separate","document"], ["common-lf4-privacy"]],
  ["measures", ["select","check","responsibility"], ["common-lf4-assessment","common-lf3-access"]],
];
for (const [suffix, objectives, prerequisites] of LF4_CONTRACTS) {
  const id = `common-lf4-${suffix}`;
  TOPICS.push({ id, topicFile: `topics/${id}.v1.json`, questionFile: `questions/${id}.v1.csv`, prerequisites, objectiveIds: objectives.map((objective) => `${id}-${objective}`), questionPrefix: `LJ-LF4-${suffix.toUpperCase()}` });
}
const LF4_TOPIC_IDS = LF4_CONTRACTS.map(([suffix]) => `common-lf4-${suffix}`);
const LF5_CONTRACTS = [
  ["requirements", ["data","scope","tests"], ["common-lf2-requirements","common-lf4-privacy"]],
  ["types", ["choose","trace"], ["common-lf5-requirements"]],
  ["control", ["branch","loop"], ["common-lf5-types"]],
  ["functions", ["model","function"], ["common-lf5-control"]],
  ["objects", ["model","instances"], ["common-lf5-functions"]],
  ["storage", ["compare","keys"], ["common-lf5-objects"]],
  ["sql", ["read","change","protect"], ["common-lf5-storage"]],
  ["testing", ["cases","repair","document"], ["common-lf5-sql"]],
];
for (const [suffix, objectives, prerequisites] of LF5_CONTRACTS) {
  const id = `common-lf5-${suffix}`;
  TOPICS.push({ id, topicFile: `topics/${id}.v1.json`, questionFile: `questions/${id}.v1.csv`, prerequisites, objectiveIds: objectives.map((objective) => `${id}-${objective}`), questionPrefix: `LJ-LF5-${suffix.toUpperCase()}` });
}
const LF5_TOPIC_IDS = LF5_CONTRACTS.map(([suffix]) => `common-lf5-${suffix}`);
const LF6_CONTRACTS = [
  ["intake", ["questions","ticket"], ["common-lf1-role","common-lf3-diagnosis"]],
  ["priority", ["agreement","priority","level"], ["common-lf6-intake"]],
  ["diagnosis", ["hypothesis","evidence"], ["common-lf6-priority","common-lf5-testing"]],
  ["solution", ["select","explain","english"], ["common-lf6-diagnosis","common-lf4-measures"]],
  ["closure", ["verify","record","improve"], ["common-lf6-solution"]],
];
for (const [suffix, objectives, prerequisites] of LF6_CONTRACTS) {
  const id = `common-lf6-${suffix}`;
  TOPICS.push({ id, topicFile: `topics/${id}.v1.json`, questionFile: `questions/${id}.v1.csv`, prerequisites, objectiveIds: objectives.map((objective) => `${id}-${objective}`), questionPrefix: `LJ-LF6-${suffix.toUpperCase()}` });
}
const LF6_TOPIC_IDS = LF6_CONTRACTS.map(([suffix]) => `common-lf6-${suffix}`);
const LF7_CONTRACTS = [
  ["components", ["roles","flow"], ["common-lf3-physical","common-lf5-control"]],
  ["signals", ["signal","flows","communication"], ["common-lf7-components","common-lf3-protocols"]],
  ["extension", ["requirements","selection","plan"], ["common-lf7-signals","common-lf2-workplace"]],
  ["logic", ["implement","failure"], ["common-lf7-extension","common-lf5-functions"]],
  ["verification", ["test","energy","record"], ["common-lf7-logic","common-lf4-measures"]],
];
for (const [suffix, objectives, prerequisites] of LF7_CONTRACTS) {
  const id = `common-lf7-${suffix}`;
  TOPICS.push({ id, topicFile: `topics/${id}.v1.json`, questionFile: `questions/${id}.v1.csv`, prerequisites, objectiveIds: objectives.map(objective => `${id}-${objective}`), questionPrefix: `LJ-LF7-${suffix.toUpperCase()}` });
}
const LF7_TOPIC_IDS = LF7_CONTRACTS.map(([suffix]) => `common-lf7-${suffix}`);
const LF8_CONTRACTS = [
  ["sources", ["inspect","quality"], ["common-lf5-storage","common-lf4-privacy"]],
  ["formats", ["read","mapping"], ["common-lf8-sources","common-lf5-types"]],
  ["queries", ["join","aggregate","check"], ["common-lf8-formats","common-lf5-sql"]],
  ["interfaces", ["contract","transfer","team"], ["common-lf8-queries","common-lf3-services","common-lf5-functions"]],
  ["integrity", ["validate","transaction","rights"], ["common-lf8-interfaces","common-lf4-measures"]],
  ["delivery", ["test","guide","reflect"], ["common-lf8-integrity"]],
];
for (const [suffix, objectives, prerequisites] of LF8_CONTRACTS) {
  const id = `common-lf8-${suffix}`;
  TOPICS.push({ id, topicFile: `topics/${id}.v1.json`, questionFile: `questions/${id}.v1.csv`, prerequisites, objectiveIds: objectives.map(objective => `${id}-${objective}`), questionPrefix: `LJ-LF8-${suffix.toUpperCase()}` });
}
const LF8_TOPIC_IDS = LF8_CONTRACTS.map(([suffix]) => `common-lf8-${suffix}`);
const LF9_CONTRACTS = [
  ["requirements", ["collect","criteria"], ["common-lf3-diagnosis","common-lf2-requirements"]],
  ["design", ["structure","compare"], ["common-lf9-requirements","common-lf3-addressing"]],
  ["services", ["configure","dependencies"], ["common-lf9-design","common-lf3-services"]],
  ["security", ["access","continuity","updates"], ["common-lf9-services","common-lf4-measures"]],
  ["monitoring", ["observe","isolate","privacy"], ["common-lf9-security","common-lf6-diagnosis"]],
  ["handover", ["evidence","handover","improve"], ["common-lf9-monitoring","common-lf6-closure"]],
];
for (const [suffix, objectives, prerequisites] of LF9_CONTRACTS) {
  const id = `common-lf9-${suffix}`;
  TOPICS.push({ id, topicFile: `topics/${id}.v1.json`, questionFile: `questions/${id}.v1.csv`, prerequisites, objectiveIds: objectives.map(objective => `${id}-${objective}`), questionPrefix: `LJ-LF9-${suffix.toUpperCase()}` });
}
const LF9_TOPIC_IDS = LF9_CONTRACTS.map(([suffix]) => `common-lf9-${suffix}`);
const PRE_LF4_TOPIC_IDS = [...PRE_LF3_TOPIC_IDS, ...LF3_TOPIC_IDS];
const PRE_LF5_TOPIC_IDS = [...PRE_LF4_TOPIC_IDS, ...LF4_TOPIC_IDS];
const PRE_LF6_TOPIC_IDS = [...PRE_LF5_TOPIC_IDS, ...LF5_TOPIC_IDS];
const PRE_LF7_TOPIC_IDS = [...PRE_LF6_TOPIC_IDS, ...LF6_TOPIC_IDS];
const PRE_LF8_TOPIC_IDS = [...PRE_LF7_TOPIC_IDS, ...LF7_TOPIC_IDS];
const PRE_LF9_TOPIC_IDS = [...PRE_LF8_TOPIC_IDS, ...LF8_TOPIC_IDS];
const NEW_STAGE_PREREQUISITES = { LF4: PRE_LF4_TOPIC_IDS, LF5: PRE_LF5_TOPIC_IDS, LF6: PRE_LF6_TOPIC_IDS, LF7: PRE_LF7_TOPIC_IDS, LF8: PRE_LF8_TOPIC_IDS, LF9: PRE_LF9_TOPIC_IDS };
for (const topic of TOPICS) {
  topic.fieldId = LF1_TOPIC_IDS.includes(topic.id) ? 'LF1' : WISO_TOPIC_IDS.includes(topic.id) ? 'WISO' : PM_TOPIC_IDS.includes(topic.id) ? 'PM' : LF2_TOPIC_IDS.includes(topic.id) ? 'LF2' : LF3_TOPIC_IDS.includes(topic.id) ? 'LF3' : LF4_TOPIC_IDS.includes(topic.id) ? 'LF4' : LF5_TOPIC_IDS.includes(topic.id) ? 'LF5' : LF6_TOPIC_IDS.includes(topic.id) ? 'LF6' : LF7_TOPIC_IDS.includes(topic.id) ? 'LF7' : LF8_TOPIC_IDS.includes(topic.id) ? 'LF8' : 'LF9';
  topic.csvFieldId = ['LF1', 'LF2', 'LF3', 'LF4', 'LF5', 'LF6', 'LF7', 'LF8', 'LF9'].includes(topic.fieldId) ? topic.fieldId : 'KEIN_LF';
  topic.csvModuleId = topic.fieldId === 'LF7' ? 'CPS-GRUND' : topic.fieldId === 'LF8' ? 'DATEN-GRUND' : topic.fieldId === 'LF9' ? 'NETZ-GRUND' : topic.fieldId === 'LF4' ? 'IT-SEC-GRUND' : topic.fieldId === 'LF5' ? 'LF5-GRUND' : topic.fieldId === 'LF6' ? 'SERVICE-GRUND' : topic.fieldId === 'LF3' ? 'NETZ-GRUND' : topic.fieldId === 'LF2' ? 'HARDWARE' : topic.fieldId === 'PM' ? 'PM' : 'WISO';
}
const REVIEW_TOPIC_ID = 'common-lf1-presentation';
const PRACTICE_TOPIC_IDS = [REVIEW_TOPIC_ID, 'common-lf2-handover', 'common-lf3-diagnosis', 'common-lf4-measures', 'common-lf5-testing', 'common-lf6-closure', 'common-lf7-verification', 'common-lf8-delivery', 'common-lf9-handover'];
const FIELD_REVIEWS = new Map([[REVIEW_TOPIC_ID, { fieldId: 'LF1', topicIds: LF1_TOPIC_IDS }], ['common-wiso-europe', { fieldId: 'WISO', topicIds: WISO_TOPIC_IDS }], ['common-pm-closure', { fieldId: 'PM', topicIds: PM_TOPIC_IDS }], ['common-lf2-handover', { fieldId: 'LF2', topicIds: LF2_TOPIC_IDS }], ['common-lf3-diagnosis', { fieldId: 'LF3', topicIds: LF3_TOPIC_IDS }], ['common-lf4-measures', { fieldId: 'LF4', topicIds: LF4_TOPIC_IDS }], ['common-lf5-testing', { fieldId: 'LF5', topicIds: LF5_TOPIC_IDS }], ['common-lf6-closure', { fieldId: 'LF6', topicIds: LF6_TOPIC_IDS }], ['common-lf7-verification', { fieldId: 'LF7', topicIds: LF7_TOPIC_IDS }], ['common-lf8-delivery', { fieldId: 'LF8', topicIds: LF8_TOPIC_IDS }], ['common-lf9-handover', { fieldId: 'LF9', topicIds: LF9_TOPIC_IDS }]]);
let precedingTopics = [...PRE_LF9_TOPIC_IDS, ...LF9_TOPIC_IDS];
for (const [fieldId, topicIds] of specializationStages) {
  NEW_STAGE_PREREQUISITES[fieldId] = precedingTopics;
  precedingTopics = [...precedingTopics, ...topicIds];
  const finalTopicId = topicIds.at(-1);
  PRACTICE_TOPIC_IDS.push(finalTopicId);
  FIELD_REVIEWS.set(finalTopicId, { fieldId, topicIds });
}
TOPICS.push(...specializationTopics);
const STAGE_ORDER = ['LF1', 'WISO', 'PM', ...Array.from({ length: 8 }, (_, index) => `LF${index + 2}`), 'LF10a', 'LF11a', 'LF12a'];
const PLANNED_STAGES = [{ id: 'PM', title: 'Projektmanagement', status: 'planned' }];
const CSV_COLUMNS = 'id;fachrichtung;modul_id;thema;typ;frage;option_a;option_b;option_c;option_d;antwort;erklaerung;schwierigkeit;quelle;lernfeld'.split(';');
const VERSION = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const isText = (value) => typeof value === 'string' && value.trim().length > 0;
const isAnswer = (value) => typeof value === 'string' && /^[a-d]$/.test(value);
const pick = (value, keys) => Object.fromEntries(keys.map((key) => [key, value[key]]));

function fail(status, message) {
  const error = new Error(message);
  error.status = status;
  throw error;
}

function ensure(condition) {
  if (!condition) fail(503, 'Die Lernreise-Inhalte sind gerade nicht verfügbar.');
}

function list(value, count) {
  ensure(Array.isArray(value) && (count === undefined ? value.length > 0 : value.length === count));
  return value;
}

function strings(value, count) {
  list(value, count);
  ensure(value.every(isText) && new Set(value).size === value.length);
  return value;
}

function records(value, count) {
  list(value, count);
  ensure(value.every((item) => isRecord(item) && isText(item.id)));
  ensure(new Set(value.map((item) => item.id)).size === value.length);
  return value;
}

function texts(value, keys) {
  ensure(isRecord(value) && keys.every((key) => isText(value[key])));
}

function isDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const timestamp = Date.parse(`${value}T00:00:00.000Z`);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value;
}

function sameIds(left, right) {
  return left.length === right.length && left.every((id) => right.includes(id));
}

function refs(value, allowed, count) {
  strings(value, count);
  ensure(value.every((id) => allowed.includes(id)));
}

// Inhaltsreferenzen werden nie als freie Dateipfade verwendet. Auch Verknüpfungen
// unter dem konfigurierten öffentlichen Inhaltsordner werden nicht verfolgt.
function readPublicFile(contentRoot, relativeFile) {
  let current = contentRoot;
  for (const part of ['learning-journey', ...relativeFile.split('/')]) {
    current = path.join(current, part);
    ensure(!fs.lstatSync(current).isSymbolicLink());
  }
  const resolved = fs.realpathSync(current);
  const relative = path.relative(contentRoot, resolved);
  ensure(relative !== '' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative) && fs.statSync(resolved).isFile());
  return fs.readFileSync(resolved, 'utf8').replace(/^\uFEFF/, '');
}

function validatePlan(plan) {
  ensure(isRecord(plan) && plan.schemaVersion === 1 && plan.id === 'fiae-journey' && plan.track === 'FIAE' && typeof plan.version === 'string' && VERSION.test(plan.version));
  const hasPm = Array.isArray(plan.fields) && plan.fields.some((field) => field?.id === 'PM');
  const expectedTopics = hasPm ? TOPICS : TOPICS.filter((topic) => topic.fieldId !== 'PM');
  if (Object.hasOwn(plan, 'stageOrder')) ensure(JSON.stringify(plan.stageOrder) === JSON.stringify(STAGE_ORDER));
  if (Object.hasOwn(plan, 'plannedStages')) {
    records(plan.plannedStages, hasPm ? 0 : 1);
    ensure(plan.plannedStages.every((stage, index) => exactKeys(stage, ['id', 'title', 'status']) && Object.entries(PLANNED_STAGES[index]).every(([key, value]) => stage[key] === value)));
  }
  records(plan.sources).forEach((source) => {
    texts(source, ['title', 'url']);
    ensure(isDate(source.checkedAt));
    const url = new URL(source.url);
    ensure(url.protocol === 'https:' && Boolean(url.hostname) && !url.username && !url.password);
  });
  refs(plan.sourceIds, plan.sources.map((source) => source.id), plan.sources.length);
  records(plan.topics, hasPm ? 94 : 84);
  records(plan.fields, hasPm ? 14 : 13);
  ensure(sameIds(plan.fields.map((field) => field.id), hasPm ? STAGE_ORDER : STAGE_ORDER.filter((id) => id !== 'PM')));
  strings(plan.sequence, hasPm ? 94 : 84);
  const topicIds = plan.topics.map((item) => item.id);
  ensure(sameIds(plan.sequence, topicIds) && expectedTopics.every((item, index) => plan.sequence[index] === item.id));
  ensure(!hasPm ? !plan.topics.some((topic) => topic.fieldId === 'PM' || PM_TOPIC_IDS.includes(topic.id)) : true);
  const fieldTopics = [];
  for (const field of plan.fields) {
    texts(field, ['title']);
    ensure(field.scope === (specializationStages.some(([id]) => id === field.id) ? 'specialization' : 'common'));
    refs(field.topicIds, topicIds);
    ensure(field.topicIds.every((id) => plan.topics.find((item) => item.id === id).fieldId === field.id));
    fieldTopics.push(...field.topicIds);
  }
  ensure(new Set(fieldTopics).size === fieldTopics.length && sameIds(fieldTopics, topicIds));
  for (const [fieldId, ids] of [['LF1', LF1_TOPIC_IDS], ['WISO', WISO_TOPIC_IDS], ['LF2', LF2_TOPIC_IDS], ['LF3', LF3_TOPIC_IDS], ...(hasPm ? [['PM', PM_TOPIC_IDS]] : []), ...specializationStages]) {
    ensure(JSON.stringify(plan.fields.find((field) => field.id === fieldId)?.topicIds) === JSON.stringify(ids));
  }
  ensure(plan.topics.filter((item) => item.status === 'content-ready').every((item) => TOPICS.some((allowed) => allowed.id === item.id)));
  for (const [index, allowed] of expectedTopics.entries()) {
    const entry = plan.topics.find((item) => item.id === allowed.id);
    texts(entry, ['title']);
    strings(entry.prerequisites, allowed.prerequisites.length);
    ensure(sameIds(entry.prerequisites, allowed.prerequisites));
    records(entry.objectives, allowed.objectiveIds.length).forEach((item) => texts(item, ['text']));
    ensure(sameIds(entry.objectives.map((item) => item.id), allowed.objectiveIds));
    ensure(entry.fieldId === allowed.fieldId && entry.scope === (allowed.scope ?? 'common'));
    if (entry.status === 'content-ready') ensure(entry.contentFile === allowed.topicFile);
    else ensure(index > 0 && entry.status === 'planned' && entry.contentFile === null);
  }
}

function validateContent(plan, allowed, topic, questions) {
  const entry = plan.topics.find((item) => item.id === allowed.id);
  ensure(entry.status === 'content-ready');
  ensure(isRecord(topic) && topic.schemaVersion === 1 && topic.id === allowed.id && typeof topic.version === 'string' && VERSION.test(topic.version));
  texts(topic, ['title']);
  ensure(topic.title === entry.title && topic.fieldId === allowed.fieldId && topic.fieldId === entry.fieldId && topic.scope === entry.scope);
  ensure(topic.questionFile === allowed.questionFile && topic.review?.status === 'reviewed' && isDate(topic.review.checkedAt));
  strings(topic.prerequisites, allowed.prerequisites.length);
  ensure(sameIds(topic.prerequisites, allowed.prerequisites));
  records(topic.objectives, allowed.objectiveIds.length).forEach((item) => texts(item, ['text']));
  const objectiveIds = topic.objectives.map((item) => item.id);
  ensure(topic.objectives.every((objective, index) => objective.id === entry.objectives[index].id && objective.text === entry.objectives[index].text));
  texts(topic.caseStudy, ['title', 'text']);
  records(topic.sources).forEach((item) => {
    texts(item, ['title', 'url', 'checkedAt', 'note']);
    ensure(isDate(item.checkedAt));
    const source = plan.sources.find((candidate) => candidate.id === item.id);
    ensure(source && source.title === item.title && source.url === item.url);
    const url = new URL(item.url);
    ensure(url.protocol === 'https:' && Boolean(url.hostname) && !url.username && !url.password);
  });
  const sourceIds = topic.sources.map((item) => item.id);
  refs(topic.sourceIds, sourceIds);
  ensure(sameIds(topic.sourceIds, sourceIds));
  records(topic.blocks, 4).forEach((block) => {
    texts(block, ['title', 'takeaway']);
    strings(block.paragraphs);
    refs(block.objectiveIds, objectiveIds);
    refs(block.sourceIds, sourceIds);
    texts(block.example, ['title', 'text']);
    texts(block.misconception, ['claim', 'correction']);
  });
  const blockIds = topic.blocks.map((item) => item.id);
  const validateMapping = (item) => {
    refs(item.objectiveIds, objectiveIds);
    refs(item.blockIds, blockIds);
    ensure(item.objectiveIds.every((id) => item.blockIds.some((blockId) => topic.blocks.find((block) => block.id === blockId).objectiveIds.includes(id))));
  };
  const coversObjectives = (items) => ensure(objectiveIds.every((id) => items.some((item) => item.objectiveIds.includes(id))));
  records(topic.interview, 3).forEach((item, index) => {
    texts(item, ['prompt', 'sampleAnswer', 'followUp']);
    for (const key of ['keyPoints', 'acceptableAlternatives', 'misconceptions']) strings(item[key]);
    validateMapping(item);
    if (PRACTICE_TOPIC_IDS.includes(topic.id) && index === 1) {
      ensure(exactKeys(item.practice, ['task', 'checklist', 'confirmation']));
      texts(item.practice, ['task', 'confirmation']);
      strings(item.practice.checklist);
    } else ensure(!Object.hasOwn(item, 'practice'));
  });
  records(topic.cards, 6).forEach((item) => {
    texts(item, ['front', 'back']);
    validateMapping(item);
  });
  coversObjectives(topic.interview);
  coversObjectives(topic.cards);
  ensure(isRecord(topic.quiz) && isRecord(topic.exam));
  strings(topic.quiz.questionIds, 6);
  strings(topic.exam.questionIds, 8);
  for (const [phase, code, count] of [['quiz', 'Q', 6], ['exam', 'E', 8]]) {
    const expectedIds = Array.from({ length: count }, (_, index) => `${allowed.questionPrefix}-${code}${String(index + 1).padStart(2, '0')}`);
    ensure(sameIds(topic[phase].questionIds, expectedIds));
  }
  ensure(topic.exam.passPercent === 80 && topic.exam.timed === false && topic.exam.scoring === 'all-or-nothing-per-question');
  const poolIds = [...topic.quiz.questionIds, ...topic.exam.questionIds];
  ensure(new Set(poolIds).size === 14);
  records(questions, 14).forEach((question) => {
    texts(question, ['frage', 'option_a', 'option_b', 'option_c', 'option_d', 'erklaerung']);
    ensure(question.typ === 'SC' && question.fachrichtung === (allowed.scope === 'specialization' ? 'FIAE' : 'ALLE') && question.modul_id === allowed.csvModuleId && question.thema === topic.title && question.lernfeld === allowed.csvFieldId && isAnswer(question.antwort));
  });
  ensure(sameIds(poolIds, questions.map((item) => item.id)));
  list(topic.questionLinks, 14);
  ensure(topic.questionLinks.every(isRecord));
  const linkedIds = topic.questionLinks.map((item) => item.questionId);
  ensure(new Set(linkedIds).size === 14 && sameIds(linkedIds, poolIds));
  topic.questionLinks.forEach((link) => {
    ensure(['quiz', 'exam'].includes(link.phase) && topic[link.phase].questionIds.includes(link.questionId));
    validateMapping(link);
  });
  for (const phase of ['quiz', 'exam']) coversObjectives(topic.questionLinks.filter((item) => item.phase === phase));
  if (FIELD_REVIEWS.has(topic.id)) {
    const expected = FIELD_REVIEWS.get(topic.id);
    const review = topic.fieldReview;
    ensure(exactKeys(review, ['fieldId', 'topicIds', 'blockIds', 'interviewIds', 'questionIds']));
    ensure(review.fieldId === expected.fieldId);
    strings(review.topicIds, expected.topicIds.length);
    ensure(review.topicIds.every((id, index) => id === expected.topicIds[index] && plan.topics.find((item) => item.id === id)?.status === 'content-ready'));
    refs(review.blockIds, [topic.blocks[3].id], 1);
    refs(review.interviewIds, [topic.interview[2].id], 1);
    refs(review.questionIds, topic.exam.questionIds, 8);
    ensure(topic.interview[2].blockIds.includes(topic.blocks[3].id));
    ensure(topic.questionLinks.filter((link) => link.phase === 'exam').every((link) => link.blockIds.includes(topic.blocks[3].id)));
  } else ensure(!Object.hasOwn(topic, 'fieldReview'));
}

function questionDto(question) {
  return pick(question, ['id', 'typ', 'frage', 'option_a', 'option_b', 'option_c', 'option_d']);
}

function fieldDto(field, readyTopics) {
  return {
    ...pick(field, ['id', 'title', 'topicIds']),
    reviewTopicId: readyTopics.find((topic) => FIELD_REVIEWS.has(topic.id) && topic.fieldReview?.fieldId === field.id)?.id ?? null,
  };
}

function navigationPrerequisites(topic, readyTopics) {
  const previous = readyTopics[readyTopics.findIndex((item) => item.id === topic.id) - 1];
  const stagePrerequisites = NEW_STAGE_PREREQUISITES[topic.fieldId] || (topic.fieldId === 'LF3' ? PRE_LF3_TOPIC_IDS : topic.fieldId === 'LF2' ? PRE_LF2_TOPIC_IDS : topic.fieldId === 'PM' ? PRE_PM_TOPIC_IDS : topic.fieldId === 'WISO' ? LF1_TOPIC_IDS : []);
  return [...new Set([...stagePrerequisites, ...topic.prerequisites, ...(previous ? [previous.id] : [])])];
}

function topicDto(plan, topic, questionsById, readyTopics) {
  const mapping = (item) => pick(item, ['objectiveIds', 'blockIds']);
  const nextTopic = readyTopics[readyTopics.findIndex((item) => item.id === topic.id) + 1];
  return {
    ...pick(topic, ['id', 'version', 'title', 'fieldId', 'prerequisites']),
    planVersion: plan.version,
    track: 'FIAE',
    navigationPrerequisites: navigationPrerequisites(topic, readyTopics),
    prerequisiteTopics: navigationPrerequisites(topic, readyTopics).map((id) => pick(readyTopics.find((item) => item.id === id), ['id', 'title'])),
    field: fieldDto(plan.fields.find((field) => field.id === topic.fieldId), readyTopics),
    nextTopic: nextTopic ? pick(nextTopic, ['id', 'title']) : null,
    objectives: topic.objectives.map((item) => pick(item, ['id', 'text'])),
    caseStudy: pick(topic.caseStudy, ['title', 'text']),
    blocks: topic.blocks.map((item) => ({
      ...pick(item, ['id', 'title', 'objectiveIds', 'sourceIds', 'paragraphs', 'takeaway']),
      example: pick(item.example, ['title', 'text']),
      misconception: pick(item.misconception, ['claim', 'correction']),
    })),
    interview: topic.interview.map((item) => ({
      ...pick(item, ['id', 'prompt', 'keyPoints', 'acceptableAlternatives', 'misconceptions', 'sampleAnswer', 'followUp']), ...mapping(item),
      ...(item.practice ? { practice: pick(item.practice, ['task', 'checklist', 'confirmation']) } : {}),
    })),
    ...(topic.fieldReview ? { fieldReview: pick(topic.fieldReview, ['fieldId', 'topicIds', 'blockIds', 'interviewIds', 'questionIds']) } : {}),
    cards: topic.cards.map((item) => ({ ...pick(item, ['id', 'front', 'back']), ...mapping(item) })),
    sources: topic.sources.map((item) => pick(item, ['id', 'title', 'url', 'checkedAt', 'note'])),
    questionLinks: topic.questionLinks.map((item) => ({ ...pick(item, ['questionId', 'phase']), ...mapping(item) })),
    quiz: { questionIds: topic.quiz.questionIds, questions: topic.quiz.questionIds.map((id) => questionDto(questionsById.get(id))) },
    exam: { questionIds: topic.exam.questionIds, questions: topic.exam.questionIds.map((id) => questionDto(questionsById.get(id))), passPercent: 80, timed: false },
  };
}

function exactKeys(value, keys) {
  return isRecord(value) && Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));
}

/** Loads only explicitly released, reviewed topics. A failed load is isolated to journey routes. */
export function loadJourney(contentDir) {
  try {
    const root = fs.realpathSync(contentDir);
    const plan = JSON.parse(readPublicFile(root, 'fiae.v1.json'));
    validatePlan(plan);
    const contexts = new Map();
    for (const id of plan.sequence) {
      if (plan.topics.find((item) => item.id === id).status !== 'content-ready') continue;
      const allowed = TOPICS.find((item) => item.id === id);
      const topic = JSON.parse(readPublicFile(root, allowed.topicFile));
      ensure(topic?.questionFile === allowed.questionFile);
      const csv = readPublicFile(root, allowed.questionFile);
      const { header, records: questions } = parseCsv(csv);
      ensure(JSON.stringify(header) === JSON.stringify(CSV_COLUMNS));
      ensure(parseRowsRaw(csv).filter((row) => !row[0].trim().startsWith('#')).every((row) => row.length === CSV_COLUMNS.length));
      validateContent(plan, allowed, topic, questions);
      contexts.set(id, {
        topic,
        questionsById: new Map(questions.map((question) => [question.id, question])),
        linksById: new Map(topic.questionLinks.map((link) => [link.questionId, link])),
      });
    }
    const readyTopics = [...contexts.values()].map(({ topic }) => topic);
    for (const context of contexts.values()) {
      ensure(navigationPrerequisites(context.topic, readyTopics).every((id) => contexts.has(id)));
      context.dto = topicDto(plan, context.topic, context.questionsById, readyTopics);
    }
    const fields = plan.fields.map((field) => ({ ...fieldDto(field, readyTopics), total: field.topicIds.length, available: field.topicIds.filter((id) => contexts.has(id)).length }));
    const stages = (plan.stageOrder ?? STAGE_ORDER).map((id) => {
      const field = fields.find((item) => item.id === id);
      return field ? { ...field, status: field.available ? 'content-ready' : 'planned' }
        : { ...(plan.plannedStages ?? PLANNED_STAGES).find((stage) => stage.id === id), topicIds: [], reviewTopicId: null, total: 0, available: 0 };
    });
    const summary = {
      id: plan.id,
      version: plan.version,
      totalTopics: plan.topics.length,
      readyTopics: readyTopics.map((topic) => ({ ...pick(topic, ['id', 'title', 'fieldId', 'version', 'prerequisites']), navigationPrerequisites: navigationPrerequisites(topic, readyTopics) })),
      fields,
      stages,
    };
    // Der Fortschrittsabgleich braucht nur Struktur und Lernziele aller freigegebenen Themen.
    const progressCatalog = {
      ...summary,
      readyTopics: summary.readyTopics.map(entry => {
        const { dto } = contexts.get(entry.id);
        return {
          ...entry, track: dto.track, planVersion: dto.planVersion, objectives: dto.objectives,
          blocks: dto.blocks.map(({ id }) => ({ id })), cards: dto.cards.map(({ id }) => ({ id })),
          interview: dto.interview.map(({ id }) => ({ id })), questionLinks: dto.questionLinks,
          quiz: { questionIds: dto.quiz.questionIds },
          exam: { questionIds: dto.exam.questionIds, passPercent: dto.exam.passPercent },
        };
      }),
    };
    const getContext = (topicId) => {
      if (!contexts.has(topicId)) fail(404, 'Dieser Lernabschnitt ist nicht verfügbar.');
      return contexts.get(topicId);
    };
    const checkVersion = (topic, version) => {
      if (!isText(version)) fail(400, 'Bitte übermittle eine gültige Inhaltsversion.');
      if (version !== topic.version) fail(409, 'Die Inhaltsversion hat sich geändert. Bitte lade den Lernabschnitt neu.');
    };
    const score = ({ questionsById, linksById }, questionId, answer) => {
      const question = questionsById.get(questionId);
      return { questionId, answer, correct: answer === question.antwort, expected: question.antwort, explanation: question.erklaerung, ...pick(linksById.get(questionId), ['blockIds', 'objectiveIds']) };
    };
    return {
      getSummary: () => summary,
      getProgressCatalog: () => progressCatalog,
      getTopic: (topicId) => getContext(topicId).dto,
      check(topicId, input) {
        const context = getContext(topicId);
        const { topic } = context;
        if (!exactKeys(input, ['version', 'questionId', 'answer'])) fail(400, 'Bitte übermittle eine vollständige Quizantwort.');
        checkVersion(topic, input.version);
        if (!topic.quiz.questionIds.includes(input.questionId) || !isAnswer(input.answer)) fail(400, 'Die Quizantwort ist ungültig.');
        return score(context, input.questionId, input.answer);
      },
      evaluate(topicId, input) {
        const context = getContext(topicId);
        const { topic } = context;
        if (!exactKeys(input, ['version', 'attemptId', 'answers'])) fail(400, 'Bitte übermittle einen vollständigen Testversuch.');
        checkVersion(topic, input.version);
        if (typeof input.attemptId !== 'string' || !UUID.test(input.attemptId) || !Array.isArray(input.answers) || input.answers.length !== 8) fail(400, 'Der Testversuch ist ungültig oder unvollständig.');
        const answers = new Map();
        for (const item of input.answers) {
          if (!exactKeys(item, ['questionId', 'answer']) || !topic.exam.questionIds.includes(item.questionId) || !isAnswer(item.answer) || answers.has(item.questionId)) fail(400, 'Der Testversuch enthält ungültige, fehlende oder doppelte Antworten.');
          answers.set(item.questionId, item.answer);
        }
        // Erst nach vollständiger Validierung werten: keine Teilergebnisse.
        const results = topic.exam.questionIds.map((id) => score(context, id, answers.get(id)));
        const correct = results.filter((item) => item.correct).length;
        return {
          attemptId: input.attemptId, version: topic.version, total: 8, correct,
          percent: correct / 8 * 100, passed: correct >= Math.ceil(8 * topic.exam.passPercent / 100), results,
          objectives: topic.objectives.map(({ id }) => {
            const matching = results.filter((item) => item.objectiveIds.includes(id));
            const objectiveCorrect = matching.filter((item) => item.correct).length;
            return { id, total: matching.length, correct: objectiveCorrect, percent: objectiveCorrect / matching.length * 100 };
          }),
        };
      },
    };
  } catch {
    // Keine Dateipfade, Konfiguration oder interne Parserdetails nach außen.
    fail(503, 'Die Lernreise-Inhalte sind gerade nicht verfügbar.');
  }
}
