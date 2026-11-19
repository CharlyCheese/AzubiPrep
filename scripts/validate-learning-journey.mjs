import { specializationTopics, specializationStages } from '../backend/src/journey-specialization.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv, parseRowsRaw } from '../backend/src/csv.js';

const DEFAULT_ROOT = fileURLToPath(new URL('../content/learning-journey/', import.meta.url));
const PILOT_ID = 'common-lf1-role';
const PILOT_OBJECTIVES = ['value', 'team', 'responsibility'].map((id) => `${PILOT_ID}-${id}`);
const TOPIC_CONTRACTS = new Map([
  [PILOT_ID, { objectives: PILOT_OBJECTIVES, prerequisites: [], questionPrefix: 'LJ-LF1-ROLE' }],
  ['common-lf1-goals', { objectives: ['classify', 'balance'].map((id) => `common-lf1-goals-${id}`), prerequisites: [PILOT_ID], questionPrefix: 'LJ-LF1-GOALS' }],
  ['common-lf1-market', { objectives: ['relations', 'offer'].map((id) => `common-lf1-market-${id}`), prerequisites: [PILOT_ID], questionPrefix: 'LJ-LF1-MARKET' }],
  ['common-lf1-value-chain', { objectives: ['steps', 'contribution'].map((id) => `common-lf1-value-chain-${id}`), prerequisites: ['common-lf1-market'], questionPrefix: 'LJ-LF1-VALUE-CHAIN' }],
  ['common-lf1-organization', { objectives: ['structure', 'legalform', 'authority'].map((id) => `common-lf1-organization-${id}`), prerequisites: ['common-lf1-value-chain'], questionPrefix: 'LJ-LF1-ORGANIZATION' }],
  ['common-lf1-presentation', { objectives: ['prepare', 'present', 'improve'].map((id) => `common-lf1-presentation-${id}`), prerequisites: ['common-lf1-goals', 'common-lf1-organization'], questionPrefix: 'LJ-LF1-PRESENTATION' }],
]);
const LF1_TOPIC_IDS = [...TOPIC_CONTRACTS.keys()];
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
  TOPIC_CONTRACTS.set(id, { objectives: objectives.map((objective) => `${id}-${objective}`), prerequisites, questionPrefix: `LJ-WISO-${suffix.toUpperCase()}` });
}
const WISO_TOPIC_IDS = [...TOPIC_CONTRACTS.keys()].filter((id) => id.startsWith('common-wiso-'));
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
  TOPIC_CONTRACTS.set(id, { objectives: objectives.map((objective) => `${id}-${objective}`), prerequisites: [prerequisite], questionPrefix: `LJ-PM-${suffix.toUpperCase()}` });
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
  TOPIC_CONTRACTS.set(id, { objectives: objectives.map((objective) => `${id}-${objective}`), prerequisites, questionPrefix: `LJ-LF2-${suffix.toUpperCase()}` });
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
  TOPIC_CONTRACTS.set(id, { objectives: objectives.map((objective) => `${id}-${objective}`), prerequisites, questionPrefix: `LJ-LF3-${suffix.toUpperCase()}` });
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
  TOPIC_CONTRACTS.set(id, { objectives: objectives.map((objective) => `${id}-${objective}`), prerequisites, questionPrefix: `LJ-LF4-${suffix.toUpperCase()}` });
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
  TOPIC_CONTRACTS.set(id, { objectives: objectives.map((objective) => `${id}-${objective}`), prerequisites, questionPrefix: `LJ-LF5-${suffix.toUpperCase()}` });
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
  TOPIC_CONTRACTS.set(id, { objectives: objectives.map((objective) => `${id}-${objective}`), prerequisites, questionPrefix: `LJ-LF6-${suffix.toUpperCase()}` });
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
  TOPIC_CONTRACTS.set(id, { objectives: objectives.map(objective => `${id}-${objective}`), prerequisites, questionPrefix: `LJ-LF7-${suffix.toUpperCase()}` });
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
  TOPIC_CONTRACTS.set(id, { objectives: objectives.map(objective => `${id}-${objective}`), prerequisites, questionPrefix: `LJ-LF8-${suffix.toUpperCase()}` });
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
  TOPIC_CONTRACTS.set(id, { objectives: objectives.map(objective => `${id}-${objective}`), prerequisites, questionPrefix: `LJ-LF9-${suffix.toUpperCase()}` });
}
const LF9_TOPIC_IDS = LF9_CONTRACTS.map(([suffix]) => `common-lf9-${suffix}`);
const PRE_LF4_TOPIC_IDS = [...PRE_LF3_TOPIC_IDS, ...LF3_TOPIC_IDS];
const PRE_LF5_TOPIC_IDS = [...PRE_LF4_TOPIC_IDS, ...LF4_TOPIC_IDS];
const PRE_LF6_TOPIC_IDS = [...PRE_LF5_TOPIC_IDS, ...LF5_TOPIC_IDS];
const PRE_LF7_TOPIC_IDS = [...PRE_LF6_TOPIC_IDS, ...LF6_TOPIC_IDS];
const PRE_LF8_TOPIC_IDS = [...PRE_LF7_TOPIC_IDS, ...LF7_TOPIC_IDS];
const PRE_LF9_TOPIC_IDS = [...PRE_LF8_TOPIC_IDS, ...LF8_TOPIC_IDS];
const NEW_STAGE_PREREQUISITES = { LF4: PRE_LF4_TOPIC_IDS, LF5: PRE_LF5_TOPIC_IDS, LF6: PRE_LF6_TOPIC_IDS, LF7: PRE_LF7_TOPIC_IDS, LF8: PRE_LF8_TOPIC_IDS, LF9: PRE_LF9_TOPIC_IDS };
const FIELD_REVIEWS = new Map([['common-lf1-presentation', { fieldId: 'LF1', topicIds: LF1_TOPIC_IDS }], ['common-wiso-europe', { fieldId: 'WISO', topicIds: WISO_TOPIC_IDS }], ['common-pm-closure', { fieldId: 'PM', topicIds: PM_TOPIC_IDS }], ['common-lf2-handover', { fieldId: 'LF2', topicIds: LF2_TOPIC_IDS }], ['common-lf3-diagnosis', { fieldId: 'LF3', topicIds: LF3_TOPIC_IDS }], ['common-lf4-measures', { fieldId: 'LF4', topicIds: LF4_TOPIC_IDS }], ['common-lf5-testing', { fieldId: 'LF5', topicIds: LF5_TOPIC_IDS }], ['common-lf6-closure', { fieldId: 'LF6', topicIds: LF6_TOPIC_IDS }], ['common-lf7-verification', { fieldId: 'LF7', topicIds: LF7_TOPIC_IDS }], ['common-lf8-delivery', { fieldId: 'LF8', topicIds: LF8_TOPIC_IDS }], ['common-lf9-handover', { fieldId: 'LF9', topicIds: LF9_TOPIC_IDS }]]);
const STAGE_ORDER = ['LF1', 'WISO', 'PM', ...Array.from({ length: 8 }, (_, index) => `LF${index + 2}`), 'LF10a', 'LF11a', 'LF12a'];
const PRACTICE_TOPIC_IDS = ['common-lf1-presentation', 'common-lf2-handover', 'common-lf3-diagnosis', 'common-lf4-measures', 'common-lf5-testing', 'common-lf6-closure', 'common-lf7-verification', 'common-lf8-delivery', 'common-lf9-handover'];
for (const [id, contract] of TOPIC_CONTRACTS) {
  contract.fieldId = LF1_TOPIC_IDS.includes(id) ? 'LF1' : WISO_TOPIC_IDS.includes(id) ? 'WISO' : PM_TOPIC_IDS.includes(id) ? 'PM' : LF2_TOPIC_IDS.includes(id) ? 'LF2' : LF3_TOPIC_IDS.includes(id) ? 'LF3' : LF4_TOPIC_IDS.includes(id) ? 'LF4' : LF5_TOPIC_IDS.includes(id) ? 'LF5' : LF6_TOPIC_IDS.includes(id) ? 'LF6' : LF7_TOPIC_IDS.includes(id) ? 'LF7' : LF8_TOPIC_IDS.includes(id) ? 'LF8' : 'LF9';
  contract.csvFieldId = ['LF1', 'LF2', 'LF3', 'LF4', 'LF5', 'LF6', 'LF7', 'LF8', 'LF9'].includes(contract.fieldId) ? contract.fieldId : 'KEIN_LF';
  contract.csvModuleId = contract.fieldId === 'LF7' ? 'CPS-GRUND' : contract.fieldId === 'LF8' ? 'DATEN-GRUND' : contract.fieldId === 'LF9' ? 'NETZ-GRUND' : contract.fieldId === 'LF4' ? 'IT-SEC-GRUND' : contract.fieldId === 'LF5' ? 'LF5-GRUND' : contract.fieldId === 'LF6' ? 'SERVICE-GRUND' : contract.fieldId === 'LF3' ? 'NETZ-GRUND' : contract.fieldId === 'LF2' ? 'HARDWARE' : contract.fieldId === 'PM' ? 'PM' : 'WISO';
  contract.topicFile = `topics/${id}.v1.json`;
  contract.questionFile = `questions/${id}.v1.csv`;
}
let precedingTopics = [...PRE_LF9_TOPIC_IDS, ...LF9_TOPIC_IDS];
for (const [fieldId, topicIds] of specializationStages) {
  NEW_STAGE_PREREQUISITES[fieldId] = precedingTopics;
  precedingTopics = [...precedingTopics, ...topicIds];
  const finalTopicId = topicIds.at(-1);
  PRACTICE_TOPIC_IDS.push(finalTopicId);
  FIELD_REVIEWS.set(finalTopicId, { fieldId, topicIds });
}
for (const topic of specializationTopics) {
  TOPIC_CONTRACTS.set(topic.id, { ...topic, objectives: topic.objectiveIds });
}
const FIELD_SCOPES = new Map([
  ...Array.from({ length: 9 }, (_, i) => [`LF${i + 1}`, 'common']),
  ...['LF10a', 'LF11a', 'LF12a'].map((id) => [id, 'specialization']),
  ['WISO', 'common'],
]);
const CSV_COLUMNS = 'id;fachrichtung;modul_id;thema;typ;frage;option_a;option_b;option_c;option_d;antwort;erklaerung;schwierigkeit;quelle;lernfeld'.split(';');
const STABLE_ID = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const QUESTION_ID = /^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/;
const VERSION = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const isText = (value) => typeof value === 'string' && value.trim().length > 0;
const sameList = (left, right) => left.length === right.length && left.every((id, i) => id === right[i]);

function isDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const time = Date.parse(`${value}T00:00:00.000Z`);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value;
}

function isHttps(value) {
  if (!isText(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
}

// The same lexical contract is used before any read and by the pure validator.
function isContentPath(value, folder, extension) {
  return typeof value === 'string'
    && !/[\\:\x00-\x1f\x7f?#%]/.test(value)
    && !path.posix.isAbsolute(value)
    && value.split('/').every((part) => part !== '' && !part.endsWith('.') && part.trim() === part)
    && value.startsWith(`${folder}/`)
    && value.endsWith(extension);
}

function readInside(root, relativeFile) {
  const absoluteFile = path.resolve(root, relativeFile);
  const relative = path.relative(root, absoluteFile);
  if (!relative || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error('Inhaltsdatei liegt außerhalb des Lernreiseordners.');
  }
  let current = root;
  for (const part of relative.split(path.sep)) {
    current = path.join(current, part);
    if (fs.lstatSync(current).isSymbolicLink()) {
      throw new Error('Symbolische Verknüpfungen sind für Lernreiseinhalte nicht zulässig.');
    }
  }
  const resolved = fs.realpathSync(absoluteFile);
  const resolvedRelative = path.relative(root, resolved);
  if (resolvedRelative.startsWith(`..${path.sep}`) || path.isAbsolute(resolvedRelative) || !fs.statSync(resolved).isFile()) {
    throw new Error('Inhaltsdatei liegt außerhalb des Lernreiseordners oder ist keine Datei.');
  }
  return resolved;
}

/** Reads only files referenced below rootDir; it never loads app configuration. */
export function loadJourney(rootDir = DEFAULT_ROOT) {
  if (fs.lstatSync(rootDir).isSymbolicLink()) throw new Error('Der Lernreiseordner darf keine symbolische Verknüpfung sein.');
  const root = fs.realpathSync(rootDir);
  if (rootDir === DEFAULT_ROOT) {
    const repository = fs.realpathSync(fileURLToPath(new URL('../', import.meta.url)));
    if (path.relative(path.join(repository, 'content', 'learning-journey'), root) !== '') {
      throw new Error('Der Standard-Inhaltsordner darf nicht über eine Verknüpfung aus dem Repository herausführen.');
    }
  }
  const readJson = (relativeFile) => {
    const file = readInside(root, relativeFile);
    try {
      return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
    } catch {
      throw new Error(`Ungültiges JSON in Lernreise-Inhaltsdatei ${relativeFile}.`);
    }
  };
  const manifest = readJson('fiae.v1.json');
  const topicDocs = Object.create(null);
  const questionsByFile = Object.create(null);
  for (const topic of Array.isArray(manifest?.topics) ? manifest.topics : []) {
    if (!isRecord(topic) || topic.contentFile === null || topic.contentFile === undefined) continue;
    if (!isContentPath(topic.contentFile, 'topics', '.json')) throw new Error('Ungültiger contentFile-Pfad; nur relative topics/*.json sind erlaubt.');
    const contract = TOPIC_CONTRACTS.get(topic.id);
    if (!contract || topic.contentFile !== contract.topicFile) throw new Error('Nicht freigegebener contentFile-Pfad.');
    const doc = readJson(topic.contentFile);
    topicDocs[topic.contentFile] = doc;
    if (!isRecord(doc) || doc.questionFile === undefined) continue;
    if (!isContentPath(doc.questionFile, 'questions', '.csv')) throw new Error('Ungültiger questionFile-Pfad; nur relative questions/*.csv sind erlaubt.');
    if (doc.questionFile !== contract.questionFile) throw new Error('Nicht freigegebener questionFile-Pfad.');
    const file = readInside(root, doc.questionFile);
    const csv = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
    const { header, records } = parseCsv(csv);
    if (!sameList(header, CSV_COLUMNS)) throw new Error('Die Lernreise-Fragen-CSV besitzt nicht die vereinbarten 15 Spalten in der richtigen Reihenfolge.');
    const rows = parseRowsRaw(csv).filter((row) => !(row.length === 1 && row[0].trim() === '') && !row[0].trim().startsWith('#'));
    if (rows.some((row) => row.length !== CSV_COLUMNS.length)) throw new Error('Jede Lernreise-Fragen-CSV-Zeile muss genau 15 Spalten haben.');
    questionsByFile[doc.questionFile] = records;
  }
  return { manifest, topicDocs, questionsByFile };
}

/** Validates the isolated content contract and returns diagnostics without throwing. */
export function validateJourney(manifest, topicDocs, questionsByFile) {
  const errors = [];
  const fail = (at, message) => errors.push(`${at}: ${message}`);
  const object = (value, at) => {
    if (!isRecord(value)) { fail(at, 'Objekt erwartet.'); return {}; }
    return value;
  };
  const list = (value, at, minimum = 0) => {
    if (!Array.isArray(value)) { fail(at, 'Array erwartet.'); return []; }
    if (value.length < minimum) fail(at, `Mindestens ${minimum} Einträge erwartet.`);
    return value;
  };
  const text = (value, at) => {
    if (!isText(value)) fail(at, 'Nichtleerer Text erwartet.');
  };
  const strings = (value, at, minimum = 0) => {
    const result = list(value, at, minimum);
    result.forEach((item, i) => text(item, `${at}[${i}]`));
    return result.filter(isText);
  };
  const ids = (value, at, minimum = 0, pattern = STABLE_ID) => {
    const result = strings(value, at, minimum);
    for (const id of result) if (!pattern.test(id)) fail(at, `Ungültige stabile ID: ${id}.`);
    if (new Set(result).size !== result.length) fail(at, 'Doppelte IDs.');
    return result;
  };
  const choice = (value, allowed, at) => {
    if (!allowed.includes(value)) fail(at, `Erlaubt: ${allowed.join(', ')}.`);
  };
  const fixed = (value, expected, at) => {
    if (value !== expected) fail(at, `Erwartet: ${typeof expected === 'string' ? expected : JSON.stringify(expected)}.`);
  };
  const exactKeys = (value, keys, at) => {
    const item = object(value, at);
    if (Object.keys(item).length !== keys.length || keys.some((key) => !Object.hasOwn(item, key))) fail(at, `Genau diese Felder erwartet: ${keys.join(', ')}.`);
    return item;
  };
  const version = (value, at) => {
    if (typeof value !== 'string' || !VERSION.test(value)) fail(at, 'Version im Format MAJOR.MINOR.PATCH erwartet.');
  };
  const indexed = (values, at, pattern = STABLE_ID) => {
    const result = new Map();
    for (const [i, raw] of values.entries()) {
      const item = object(raw, `${at}[${i}]`);
      if (typeof item.id !== 'string' || !pattern.test(item.id)) {
        fail(`${at}[${i}].id`, 'Gültige stabile ID erwartet.');
        continue;
      }
      if (result.has(item.id)) fail(at, `Doppelte ID: ${String(item.id)}.`);
      result.set(item.id, item);
    }
    return result;
  };
  const refs = (values, known, at) => {
    for (const id of values) if (!known.has(id)) fail(at, `Unbekannte Referenz: ${id}.`);
  };
  const equalIds = (left, right, at) => {
    if (left.length !== right.length || left.some((id) => !right.includes(id))) fail(at, 'IDs stimmen nicht mit der zugehörigen Definition überein.');
  };
  const sources = (value, sourceIds, at, requireNote = false) => {
    const result = indexed(list(value, at, 1), at);
    for (const [id, source] of result) {
      text(source.title, `${at}.${id}.title`);
      if (!isHttps(source.url)) fail(`${at}.${id}.url`, 'Öffentliche HTTPS-Quellen-URL ohne Zugangsdaten erwartet.');
      if (!isDate(source.checkedAt)) fail(`${at}.${id}.checkedAt`, 'Gültiges Datum YYYY-MM-DD erwartet.');
      if (requireNote) text(source.note, `${at}.${id}.note`);
    }
    refs(sourceIds, result, at);
    equalIds(sourceIds, [...result.keys()], at);
    return result;
  };
  const objectives = (value, at, topicId) => {
    const result = indexed(list(value, at, 1), at);
    for (const [id, objective] of result) {
      text(objective.text, `${at}.${id}.text`);
      if (typeof topicId !== 'string' || !id.startsWith(`${topicId}-`)) fail(at, 'Lernziel-ID muss mit der Themen-ID beginnen.');
    }
    return result;
  };

  const plan = object(manifest, 'manifest');
  const docs = object(topicDocs, 'topicDocs');
  const questionFiles = object(questionsByFile, 'questionsByFile');
  fixed(plan.schemaVersion, 1, 'manifest.schemaVersion');
  fixed(plan.id, 'fiae-journey', 'manifest.id');
  fixed(plan.track, 'FIAE', 'manifest.track');
  fixed(plan.publicationStatus, 'content-only', 'manifest.publicationStatus');
  version(plan.version, 'manifest.version');
  text(plan.title, 'manifest.title');
  const hasPm = Array.isArray(plan.fields) && plan.fields.some((field) => field?.id === 'PM');
  if (Object.hasOwn(plan, 'stageOrder')) {
    const stageOrder = strings(plan.stageOrder, 'manifest.stageOrder');
    if (!sameList(stageOrder, STAGE_ORDER)) fail('manifest.stageOrder', 'Vereinbarte Etappenfolge LF1, WISO, PM, LF2 bis LF12a erwartet.');
  }
  if (Object.hasOwn(plan, 'plannedStages')) {
    const plannedStages = list(plan.plannedStages, 'manifest.plannedStages');
    fixed(plannedStages.length, hasPm ? 0 : 1, 'manifest.plannedStages.length');
    for (const [index, value] of plannedStages.entries()) {
      const stage = exactKeys(value, ['id', 'title', 'status'], `manifest.plannedStages[${index}]`);
      for (const [key, expected] of Object.entries({ id: 'PM', title: 'Projektmanagement', status: 'planned' })) fixed(stage[key], expected, `manifest.plannedStages[${index}].${key}`);
    }
  }
  const planSources = sources(plan.sources, ids(plan.sourceIds, 'manifest.sourceIds', 1), 'manifest.sources');
  const fields = indexed(list(plan.fields, 'manifest.fields', 13), 'manifest.fields', /^(?:LF[1-9]|LF1[012]a|WISO|PM)$/);
  fixed(fields.size, hasPm ? 14 : 13, 'manifest.fields.length');
  const topics = indexed(list(plan.topics, 'manifest.topics', 13), 'manifest.topics');
  const sequence = ids(plan.sequence, 'manifest.sequence', 13);
  refs(sequence, topics, 'manifest.sequence');
  equalIds(sequence, [...topics.keys()], 'manifest.sequence');
  fixed(sequence[0], PILOT_ID, 'manifest.sequence[0]');
  const releasedOrder = sequence.filter((id) => TOPIC_CONTRACTS.has(id));
  if (!sameList(releasedOrder, [...TOPIC_CONTRACTS.keys()].filter((id) => topics.has(id)))) fail('manifest.sequence', 'Die Themen der Lernreise müssen in der vereinbarten Reihenfolge stehen.');
  if (hasPm) {
    fixed(fields.get('PM')?.scope, 'common', 'fields.PM.scope');
    const pmTopicIds = fields.get('PM')?.topicIds;
    if (!Array.isArray(pmTopicIds) || !sameList(pmTopicIds, PM_TOPIC_IDS)) fail('fields.PM.topicIds', 'Alle zehn PM-Themen in der vereinbarten Reihenfolge erwartet.');
    if (!sameList(sequence.slice(0, 26), [...PRE_PM_TOPIC_IDS, ...PM_TOPIC_IDS])) fail('manifest.sequence', 'PM muss vollständig nach LF1/WISO und vor LF2 stehen.');
  } else if (PM_TOPIC_IDS.some((id) => topics.has(id))) fail('manifest.fields', 'PM-Themen benötigen die zusätzliche Etappe PM.');
  if (LF2_TOPIC_IDS.some((id) => topics.has(id))) {
    const lf2TopicIds = fields.get('LF2')?.topicIds;
    if (!Array.isArray(lf2TopicIds) || !sameList(lf2TopicIds, LF2_TOPIC_IDS)) fail('fields.LF2.topicIds', 'Alle sieben LF2-Themen in der vereinbarten Reihenfolge erwartet.');
    const precedingIds = hasPm ? PRE_LF2_TOPIC_IDS : PRE_PM_TOPIC_IDS;
    if (!sameList(sequence.slice(0, precedingIds.length + LF2_TOPIC_IDS.length), [...precedingIds, ...LF2_TOPIC_IDS])) fail('manifest.sequence', 'LF2 muss vollständig nach den vorherigen Etappen und vor LF3 stehen.');
  }
  if (LF3_TOPIC_IDS.some((id) => topics.has(id))) {
    const lf3TopicIds = fields.get('LF3')?.topicIds;
    if (!Array.isArray(lf3TopicIds) || !sameList(lf3TopicIds, LF3_TOPIC_IDS)) fail('fields.LF3.topicIds', 'Alle sechs LF3-Themen in der vereinbarten Reihenfolge erwartet.');
    const precedingIds = hasPm ? PRE_LF3_TOPIC_IDS : [...PRE_PM_TOPIC_IDS, ...LF2_TOPIC_IDS];
    if (!sameList(sequence.slice(0, precedingIds.length + LF3_TOPIC_IDS.length), [...precedingIds, ...LF3_TOPIC_IDS])) fail('manifest.sequence', 'LF3 muss vollständig nach den vorherigen Etappen und vor LF4 stehen.');
  }
  for (const [fieldId, topicIds] of [['LF4', LF4_TOPIC_IDS], ['LF5', LF5_TOPIC_IDS], ['LF6', LF6_TOPIC_IDS], ['LF7', LF7_TOPIC_IDS], ['LF8', LF8_TOPIC_IDS], ['LF9', LF9_TOPIC_IDS], ...specializationStages]) {
    if (!topicIds.some(id => topics.has(id))) continue;
    if (!sameList(fields.get(fieldId)?.topicIds || [], topicIds)) fail(`fields.${fieldId}.topicIds`, 'Die vereinbarte Themenreihenfolge fehlt.');
    const preceding = NEW_STAGE_PREREQUISITES[fieldId].filter(id => hasPm || !PM_TOPIC_IDS.includes(id));
    if (!sameList(sequence.slice(0, preceding.length + topicIds.length), [...preceding, ...topicIds])) fail('manifest.sequence', `${fieldId} muss nach den vorherigen Etappen stehen.`);
  }
  for (const [id, scope] of FIELD_SCOPES) {
    if (!fields.has(id)) fail('manifest.fields', `Pflicht-Lernfeld fehlt: ${id}.`);
    else fixed(fields.get(id).scope, scope, `fields.${id}.scope`);
  }
  const fieldMemberships = new Map();
  for (const [id, field] of fields) {
    text(field.title, `fields.${id}.title`);
    choice(field.scope, ['common', 'specialization'], `fields.${id}.scope`);
    const members = ids(field.topicIds, `fields.${id}.topicIds`, 1);
    refs(members, topics, `fields.${id}.topicIds`);
    for (const member of members) {
      if (fieldMemberships.has(member)) fail(`fields.${id}`, `Thema ${member} ist mehreren Lernfeldern zugeordnet.`);
      fieldMemberships.set(member, id);
    }
  }
  let specializationSeen = false;
  for (const id of sequence) {
    if (topics.get(id)?.scope === 'specialization') specializationSeen = true;
    else if (topics.get(id)?.scope === 'common' && specializationSeen) fail('manifest.sequence', 'Alle gemeinsamen Themen müssen vor der Spezialisierung stehen.');
  }
  const prerequisites = new Map();
  const topicObjectives = new Map();
  const usedContentFiles = new Set();
  const usedQuestionFiles = new Set();
  const globalQuestionIds = new Set();
  const globalItemIds = new Set();
  const uniqueItems = (items, at) => {
    for (const id of items.keys()) {
      if (globalItemIds.has(id)) fail(at, `Doppelte Inhalts-ID über mehrere Sammlungen: ${id}.`);
      globalItemIds.add(id);
    }
  };
  for (const [id, topic] of topics) {
    const at = `topics.${id}`;
    text(topic.title, `${at}.title`);
    choice(topic.scope, ['common', 'specialization'], `${at}.scope`);
    choice(topic.status, ['planned', 'content-ready'], `${at}.status`);
    if (!fields.has(topic.fieldId)) fail(`${at}.fieldId`, 'Unbekanntes Lernfeld.');
    else fixed(topic.scope, fields.get(topic.fieldId).scope, `${at}.scope`);
    fixed(fieldMemberships.get(id), topic.fieldId, `${at}.fieldId/field.topicIds`);
    const required = ids(topic.prerequisites, `${at}.prerequisites`);
    prerequisites.set(id, required);
    refs(required, topics, `${at}.prerequisites`);
    for (const requirement of required) {
      if (sequence.indexOf(requirement) >= sequence.indexOf(id)) fail(`${at}.prerequisites`, `Voraussetzung ${requirement} muss früher in der Reihenfolge stehen.`);
    }
    const goals = objectives(topic.objectives, `${at}.objectives`, id);
    topicObjectives.set(id, goals);
    const contract = TOPIC_CONTRACTS.get(id);
    if (contract) {
      equalIds(required, contract.prerequisites, `${at}.prerequisites`);
      equalIds([...goals.keys()], contract.objectives, `${at}.objectives`);
      fixed(topic.fieldId, contract.fieldId, `${at}.fieldId`);
    }
    const gaps = strings(topic.gaps, `${at}.gaps`);
    if (topic.status === 'planned') {
      fixed(topic.contentFile, null, `${at}.contentFile`);
      if (!gaps.length) fail(`${at}.gaps`, 'Geplante Themen müssen offene Inhaltslücken nennen.');
    }
    if (topic.status === 'content-ready') {
      if (contract?.fieldId === 'WISO') for (const id of LF1_TOPIC_IDS) fixed(topics.get(id)?.status, 'content-ready', `${at}.navigationPrerequisites.${id}`);
      if (contract?.fieldId === 'PM') for (const id of [...PRE_PM_TOPIC_IDS, ...required]) fixed(topics.get(id)?.status, 'content-ready', `${at}.navigationPrerequisites.${id}`);
      if (contract?.fieldId === 'LF2') for (const id of [...new Set([...PRE_LF2_TOPIC_IDS, ...required, sequence[sequence.indexOf(topic.id) - 1]])]) fixed(topics.get(id)?.status, 'content-ready', `${at}.navigationPrerequisites.${id}`);
      if (contract?.fieldId === 'LF3') for (const id of [...new Set([...PRE_LF3_TOPIC_IDS, ...required, sequence[sequence.indexOf(topic.id) - 1]])]) fixed(topics.get(id)?.status, 'content-ready', `${at}.navigationPrerequisites.${id}`);
      if (NEW_STAGE_PREREQUISITES[contract?.fieldId]) for (const id of [...new Set([...NEW_STAGE_PREREQUISITES[contract.fieldId], ...required, sequence[sequence.indexOf(topic.id) - 1]])]) fixed(topics.get(id)?.status, 'content-ready', `${at}.navigationPrerequisites.${id}`);
      if (!contract) fail(at, 'Thema ist nicht für die Veröffentlichung freigegeben.');
      else fixed(topic.contentFile, contract.topicFile, `${at}.contentFile`);
      if (gaps.length) fail(`${at}.gaps`, 'Fertige Inhalte dürfen keine offenen Inhaltslücken enthalten.');
      if (!isContentPath(topic.contentFile, 'topics', '.json')) fail(`${at}.contentFile`, 'Sicherer relativer topics/*.json-Pfad erwartet.');
      else {
        if (usedContentFiles.has(topic.contentFile)) fail(`${at}.contentFile`, 'Inhaltsdatei ist mehreren Themen zugeordnet.');
        usedContentFiles.add(topic.contentFile);
        if (!Object.hasOwn(docs, topic.contentFile)) fail(`${at}.contentFile`, 'Referenziertes Themendokument fehlt.');
      }
    }
  }
  // Iterative traversal also reports cycles without risking recursion overflow.
  const unresolved = new Set(topics.keys());
  let progress = true;
  while (progress && unresolved.size) {
    progress = false;
    for (const id of unresolved) {
      if ((prerequisites.get(id) ?? []).every((required) => !unresolved.has(required))) {
        unresolved.delete(id);
        progress = true;
      }
    }
  }
  if (unresolved.size) fail('manifest.prerequisites', 'Zyklus in den Themenvoraussetzungen.');
  if (topics.has(PILOT_ID)) {
    fixed(topics.get(PILOT_ID).status, 'content-ready', `topics.${PILOT_ID}.status`);
    fixed(topics.get(PILOT_ID).fieldId, 'LF1', `topics.${PILOT_ID}.fieldId`);
    equalIds([...topicObjectives.get(PILOT_ID).keys()], PILOT_OBJECTIVES, `topics.${PILOT_ID}.objectives`);
  }

  for (const [file, rawDoc] of Object.entries(docs)) {
    const at = `topicDocs.${file}`;
    if (!isContentPath(file, 'topics', '.json')) fail(at, 'Unsicherer Dokumentpfad.');
    if (!usedContentFiles.has(file)) fail(at, 'Dokument ist keinem fertigen Thema zugeordnet.');
    const doc = object(rawDoc, at);
    const topic = topics.get(doc.id);
    if (!topic) fail(`${at}.id`, 'Unbekannte Themen-ID.');
    else {
      fixed(topic.contentFile, file, `${at}.contentFile`);
      for (const key of ['title', 'fieldId', 'scope']) fixed(doc[key], topic[key], `${at}.${key}`);
    }
    fixed(doc.schemaVersion, 1, `${at}.schemaVersion`);
    version(doc.version, `${at}.version`);
    text(doc.title, `${at}.title`);
    choice(doc.scope, ['common', 'specialization'], `${at}.scope`);
    const required = ids(doc.prerequisites, `${at}.prerequisites`);
    equalIds(required, prerequisites.get(doc.id) ?? [], `${at}.prerequisites`);
    const sourceIds = ids(doc.sourceIds, `${at}.sourceIds`, 1);
    const docSources = sources(doc.sources, sourceIds, `${at}.sources`, true);
    refs(sourceIds, planSources, `${at}.sourceIds`);
    for (const [id, source] of docSources) {
      const original = planSources.get(id);
      // Each topic records its own verification date; an additive topic may
      // recheck a shared source without rewriting already reviewed content.
      if (original) for (const key of ['title', 'url']) fixed(source[key], original[key], `${at}.sources.${id}.${key}`);
    }
    const goals = objectives(doc.objectives, `${at}.objectives`, doc.id);
    const planGoals = topicObjectives.get(doc.id) ?? new Map();
    equalIds([...goals.keys()], [...planGoals.keys()], `${at}.objectives`);
    for (const [id, goal] of goals) if (planGoals.has(id)) fixed(goal.text, planGoals.get(id).text, `${at}.objectives.${id}.text`);
    const contract = TOPIC_CONTRACTS.get(doc.id);
    if (contract) {
      equalIds([...goals.keys()], contract.objectives, `${at}.objectives`);
      fixed(file, contract.topicFile, `${at}.contentFile`);
      fixed(doc.questionFile, contract.questionFile, `${at}.questionFile`);
    } else fail(at, 'Thema ist nicht für die Veröffentlichung freigegeben.');
    const study = object(doc.caseStudy, `${at}.caseStudy`);
    text(study.title, `${at}.caseStudy.title`);
    text(study.text, `${at}.caseStudy.text`);
    const blocks = indexed(list(doc.blocks, `${at}.blocks`, contract ? 4 : 1), `${at}.blocks`);
    if (contract) fixed(blocks.size, 4, `${at}.blocks.length`);
    uniqueItems(blocks, `${at}.blocks`);
    const blockGoals = new Map();
    for (const [id, block] of blocks) {
      const blockAt = `${at}.blocks.${id}`;
      text(block.title, `${blockAt}.title`);
      const covered = ids(block.objectiveIds, `${blockAt}.objectiveIds`, 1);
      refs(covered, goals, `${blockAt}.objectiveIds`);
      blockGoals.set(id, covered);
      refs(ids(block.sourceIds, `${blockAt}.sourceIds`, 1), docSources, `${blockAt}.sourceIds`);
      strings(block.paragraphs, `${blockAt}.paragraphs`, 1);
      const example = object(block.example, `${blockAt}.example`);
      text(example.title, `${blockAt}.example.title`);
      text(example.text, `${blockAt}.example.text`);
      const misconception = object(block.misconception, `${blockAt}.misconception`);
      text(misconception.claim, `${blockAt}.misconception.claim`);
      text(misconception.correction, `${blockAt}.misconception.correction`);
      text(block.takeaway, `${blockAt}.takeaway`);
    }
    const cover = (covered, poolAt) => {
      for (const id of goals.keys()) if (!covered.has(id)) fail(poolAt, `Lernziel nicht abgedeckt: ${id}.`);
    };
    cover(new Set([...blockGoals.values()].flat()), `${at}.blocks`);
    const mappedItem = (item, itemAt) => {
      const linkedGoals = ids(item.objectiveIds, `${itemAt}.objectiveIds`, 1);
      const linkedBlocks = ids(item.blockIds, `${itemAt}.blockIds`, 1);
      refs(linkedGoals, goals, `${itemAt}.objectiveIds`);
      refs(linkedBlocks, blocks, `${itemAt}.blockIds`);
      const explained = new Set(linkedBlocks.flatMap((id) => blockGoals.get(id) ?? []));
      for (const id of linkedGoals) if (!explained.has(id)) fail(itemAt, `Referenzierte Theorie erklärt Lernziel ${id} nicht.`);
      return linkedGoals;
    };
    const quiz = object(doc.quiz, `${at}.quiz`);
    const exam = object(doc.exam, `${at}.exam`);
    const pools = new Map([
      ['quiz', ids(quiz.questionIds, `${at}.quiz.questionIds`, 1, QUESTION_ID)],
      ['exam', ids(exam.questionIds, `${at}.exam.questionIds`, 1, QUESTION_ID)],
    ]);
    fixed(exam.passPercent, 80, `${at}.exam.passPercent`);
    fixed(exam.scoring, 'all-or-nothing-per-question', `${at}.exam.scoring`);
    fixed(exam.timed, false, `${at}.exam.timed`);
    const quizIds = pools.get('quiz');
    const examIds = pools.get('exam');
    for (const id of quizIds) if (examIds.includes(id)) fail(`${at}.pools`, `Poolüberschneidung: ${id}.`);
    if (contract) {
      for (const [phase, prefix, count] of [['quiz', 'Q', 6], ['exam', 'E', 8]]) {
        const expected = Array.from({ length: count }, (_, i) => `${contract.questionPrefix}-${prefix}${String(i + 1).padStart(2, '0')}`);
        equalIds(pools.get(phase), expected, `${at}.${phase}.questionIds`);
      }
    }
    if (!isContentPath(doc.questionFile, 'questions', '.csv')) fail(`${at}.questionFile`, 'Sicherer relativer questions/*.csv-Pfad erwartet.');
    if (usedQuestionFiles.has(doc.questionFile)) fail(`${at}.questionFile`, 'Fragen-Datei ist mehreren Dokumenten zugeordnet.');
    usedQuestionFiles.add(doc.questionFile);
    const questionFile = typeof doc.questionFile === 'string' ? doc.questionFile : '';
    const records = list(Object.hasOwn(questionFiles, questionFile) ? questionFiles[questionFile] : undefined, `${at}.questions`, 1);
    const questions = indexed(records, `${at}.questions`, QUESTION_ID);
    const allPoolIds = [...quizIds, ...examIds];
    refs(allPoolIds, questions, `${at}.pools`);
    equalIds([...questions.keys()], allPoolIds, `${at}.questions/pools`);
    for (const [id, question] of questions) {
      const questionAt = `${at}.questions.${id}`;
      if (globalQuestionIds.has(id)) fail(questionAt, 'Fragen-ID wird in mehreren Dateien verwendet.');
      globalQuestionIds.add(id);
      for (const key of CSV_COLUMNS) text(question[key], `${questionAt}.${key}`);
      choice(question.typ, ['SC', 'MC'], `${questionAt}.typ`);
      choice(question.schwierigkeit, ['leicht', 'mittel', 'schwer'], `${questionAt}.schwierigkeit`);
      const options = ['a', 'b', 'c', 'd'].map((letter) => question[`option_${letter}`]);
      const normalized = options.filter(isText).map((option) => option.trim().replace(/\s+/g, ' ').toLocaleLowerCase('de'));
      if (new Set(normalized).size !== normalized.length) fail(questionAt, 'Doppelte Antwortoptionen.');
      if (question.typ === 'SC' && (typeof question.antwort !== 'string' || !/^[a-d]$/.test(question.antwort))) fail(`${questionAt}.antwort`, 'SC verlangt genau einen Buchstaben a–d.');
      if (question.typ === 'MC') {
        const answer = typeof question.antwort === 'string' ? question.antwort : '';
        if (!/^[a-d](?:,[a-d]){1,3}$/.test(answer) || new Set(answer.split(',')).size !== answer.split(',').length) fail(`${questionAt}.antwort`, 'MC verlangt zwei bis vier unterschiedliche Buchstaben a–d, kommasepariert.');
      }
      if (contract) {
        for (const [key, expected] of Object.entries({ typ: 'SC', fachrichtung: contract.scope === 'specialization' ? 'FIAE' : 'ALLE', modul_id: contract.csvModuleId, lernfeld: contract.csvFieldId, thema: doc.title })) fixed(question[key], expected, `${questionAt}.${key}`);
      }
    }
    const links = list(doc.questionLinks, `${at}.questionLinks`, 1);
    const linkedQuestions = new Set();
    const poolCoverage = new Map([['quiz', new Set()], ['exam', new Set()]]);
    for (const [i, rawLink] of links.entries()) {
      const linkAt = `${at}.questionLinks[${i}]`;
      const link = object(rawLink, linkAt);
      if (linkedQuestions.has(link.questionId)) fail(linkAt, 'Frage mehrfach zugeordnet.');
      linkedQuestions.add(link.questionId);
      if (!questions.has(link.questionId)) fail(linkAt, 'Unbekannte Fragen-ID.');
      choice(link.phase, ['quiz', 'exam'], `${linkAt}.phase`);
      if (!(pools.get(link.phase) ?? []).includes(link.questionId)) fail(linkAt, 'Frage gehört nicht zum angegebenen Pool.');
      for (const id of mappedItem(link, linkAt)) poolCoverage.get(link.phase)?.add(id);
    }
    equalIds([...linkedQuestions], allPoolIds, `${at}.questionLinks`);
    for (const [phase, covered] of poolCoverage) cover(covered, `${at}.${phase}`);
    const interviews = indexed(list(doc.interview, `${at}.interview`, contract ? 3 : 1), `${at}.interview`);
    if (contract) fixed(interviews.size, 3, `${at}.interview.length`);
    uniqueItems(interviews, `${at}.interview`);
    const interviewCoverage = new Set();
    for (const [id, item] of interviews) {
      const itemAt = `${at}.interview.${id}`;
      for (const key of ['prompt', 'sampleAnswer', 'followUp']) text(item[key], `${itemAt}.${key}`);
      for (const key of ['keyPoints', 'acceptableAlternatives', 'misconceptions']) strings(item[key], `${itemAt}.${key}`, 1);
      for (const goal of mappedItem(item, itemAt)) interviewCoverage.add(goal);
      if (PRACTICE_TOPIC_IDS.includes(doc.id) && id === [...interviews.keys()][1]) {
        const practice = exactKeys(item.practice, ['task', 'checklist', 'confirmation'], `${itemAt}.practice`);
        text(practice.task, `${itemAt}.practice.task`);
        text(practice.confirmation, `${itemAt}.practice.confirmation`);
        const checklist = strings(practice.checklist, `${itemAt}.practice.checklist`, 1);
        if (new Set(checklist).size !== checklist.length) fail(`${itemAt}.practice.checklist`, 'Doppelte Prüfkriterien.');
      } else if (Object.hasOwn(item, 'practice')) fail(`${itemAt}.practice`, 'Praxisaufgabe ist nur in der zweiten Präsentations-, Übergabe- oder Diagnosereflexion erlaubt.');
    }
    cover(interviewCoverage, `${at}.interview`);
    if (FIELD_REVIEWS.has(doc.id)) {
      const expected = FIELD_REVIEWS.get(doc.id);
      const review = exactKeys(doc.fieldReview, ['fieldId', 'topicIds', 'blockIds', 'interviewIds', 'questionIds'], `${at}.fieldReview`);
      fixed(review.fieldId, expected.fieldId, `${at}.fieldReview.fieldId`);
      const reviewedTopics = ids(review.topicIds, `${at}.fieldReview.topicIds`, expected.topicIds.length);
      if (!sameList(reviewedTopics, expected.topicIds)) fail(`${at}.fieldReview.topicIds`, 'Alle Themen der Etappe in der vereinbarten Reihenfolge erwartet.');
      for (const id of expected.topicIds) fixed(topics.get(id)?.status, 'content-ready', `${at}.fieldReview.topics.${id}.status`);
      const fieldTopicIds = fields.get(expected.fieldId)?.topicIds;
      if (!Array.isArray(fieldTopicIds) || !sameList(fieldTopicIds, expected.topicIds)) fail(`${at}.fieldReview.topicIds`, 'Rückblick muss genau die Themen der Etappe enthalten.');
      const reviewBlockId = [...blocks.keys()][3];
      const reviewInterviewId = [...interviews.keys()][2];
      equalIds(ids(review.blockIds, `${at}.fieldReview.blockIds`, 1), [reviewBlockId], `${at}.fieldReview.blockIds`);
      equalIds(ids(review.interviewIds, `${at}.fieldReview.interviewIds`, 1), [reviewInterviewId], `${at}.fieldReview.interviewIds`);
      equalIds(ids(review.questionIds, `${at}.fieldReview.questionIds`, 8, QUESTION_ID), examIds, `${at}.fieldReview.questionIds`);
      const reviewInterviewBlocks = interviews.get(reviewInterviewId)?.blockIds;
      if (!Array.isArray(reviewInterviewBlocks) || !reviewInterviewBlocks.includes(reviewBlockId)) fail(`${at}.fieldReview.interviewIds`, 'Rückblickreflexion muss den vierten Theorieblock referenzieren.');
      if (links.some((link) => isRecord(link) && link.phase === 'exam' && (!Array.isArray(link.blockIds) || !link.blockIds.includes(reviewBlockId)))) fail(`${at}.fieldReview.questionIds`, 'Alle Testfragen müssen den Rückblickblock referenzieren.');
    } else if (Object.hasOwn(doc, 'fieldReview')) fail(`${at}.fieldReview`, 'Etappenrückblick ist nur im Präsentations-, Europa-, PM-Abschluss-, LF2-Übergabe- oder LF3-Diagnosethema erlaubt.');
    const cards = indexed(list(doc.cards, `${at}.cards`, contract ? 6 : 1), `${at}.cards`);
    if (contract) fixed(cards.size, 6, `${at}.cards.length`);
    uniqueItems(cards, `${at}.cards`);
    const cardCoverage = new Set();
    for (const [id, item] of cards) {
      const itemAt = `${at}.cards.${id}`;
      text(item.front, `${itemAt}.front`);
      text(item.back, `${itemAt}.back`);
      for (const goal of mappedItem(item, itemAt)) cardCoverage.add(goal);
    }
    cover(cardCoverage, `${at}.cards`);
    const review = object(doc.review, `${at}.review`);
    choice(review.status, ['pending', 'reviewed'], `${at}.review.status`);
    if (review.status === 'reviewed' && !isDate(review.checkedAt)) fail(`${at}.review.checkedAt`, 'Gültiges Reviewdatum erwartet.');
    if (review.status === 'pending' && review.checkedAt !== null) fail(`${at}.review.checkedAt`, 'Ausstehender Review muss checkedAt null haben.');
    if (topic?.status === 'content-ready') fixed(review.status, 'reviewed', `${at}.review.status`);
  }
  for (const file of Object.keys(questionFiles)) {
    if (!isContentPath(file, 'questions', '.csv')) fail(`questionsByFile.${file}`, 'Unsicherer Fragenpfad.');
    if (!usedQuestionFiles.has(file)) fail(`questionsByFile.${file}`, 'Fragen-Datei ist keinem Themendokument zugeordnet.');
  }
  return errors;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length > 2) throw new Error('Dieser Validator akzeptiert keine Pfadargumente und liest nur content/learning-journey.');
    const { manifest, topicDocs, questionsByFile } = loadJourney();
    const errors = validateJourney(manifest, topicDocs, questionsByFile);
    if (errors.length) {
      console.error(`Lernreise: ${errors.length} Validierungsfehler.\n${errors.map((error) => `- ${error}`).join('\n')}`);
      process.exitCode = 1;
    } else {
      const readyCount = Object.keys(topicDocs).length;
      console.log(`Lernreise gültig: ${manifest.topics.length} Themen, ${readyCount} ${readyCount === 1 ? 'freigegebener Abschnitt' : 'freigegebene Abschnitte'}, ${Object.values(questionsByFile).flat().length} Fragen. Öffentlicher Inhaltsbestand geprüft.`);
    }
  } catch (error) {
    console.error(`Lernreise konnte nicht geprüft werden: ${error.message}`);
    process.exitCode = 1;
  }
}
