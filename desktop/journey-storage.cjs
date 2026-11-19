const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

const MAX_JOURNEY_BYTES = 128 * 1024;
const JOURNEY_FOLDER = 'lernreise-v1';
const DEFAULT_TOPIC_ID = 'common-lf1-role';
const JOURNEY_FILES = Object.freeze({
  'common-lf1-role': 'journey.json',
  'common-lf1-goals': 'common-lf1-goals.json',
  'common-lf1-market': 'common-lf1-market.json',
  'common-lf1-value-chain': 'common-lf1-value-chain.json',
  'common-lf1-organization': 'common-lf1-organization.json',
  'common-lf1-presentation': 'common-lf1-presentation.json',
  'common-wiso-training': 'common-wiso-training.json',
  'common-wiso-employment': 'common-wiso-employment.json',
  'common-wiso-representation': 'common-wiso-representation.json',
  'common-wiso-social-security': 'common-wiso-social-security.json',
  'common-wiso-pay': 'common-wiso-pay.json',
  'common-wiso-consumer': 'common-wiso-consumer.json',
  'common-wiso-economy': 'common-wiso-economy.json',
  'common-wiso-change': 'common-wiso-change.json',
  'common-wiso-career': 'common-wiso-career.json',
  'common-wiso-europe': 'common-wiso-europe.json',
  'common-pm-project': 'common-pm-project.json',
  'common-pm-stakeholders': 'common-pm-stakeholders.json',
  'common-pm-methods': 'common-pm-methods.json',
  'common-pm-planning': 'common-pm-planning.json',
  'common-pm-schedule': 'common-pm-schedule.json',
  'common-pm-costs': 'common-pm-costs.json',
  'common-pm-pricing': 'common-pm-pricing.json',
  'common-pm-feasibility': 'common-pm-feasibility.json',
  'common-pm-control': 'common-pm-control.json',
  'common-pm-closure': 'common-pm-closure.json',
  'common-lf2-requirements': 'common-lf2-requirements.json',
  'common-lf2-hardware': 'common-lf2-hardware.json',
  'common-lf2-software': 'common-lf2-software.json',
  'common-lf2-workplace': 'common-lf2-workplace.json',
  'common-lf2-comparison': 'common-lf2-comparison.json',
  'common-lf2-procurement': 'common-lf2-procurement.json',
  'common-lf2-handover': 'common-lf2-handover.json',
  'common-lf3-physical': 'common-lf3-physical.json',
  'common-lf3-protocols': 'common-lf3-protocols.json',
  'common-lf3-addressing': 'common-lf3-addressing.json',
  'common-lf3-services': 'common-lf3-services.json',
  'common-lf3-access': 'common-lf3-access.json',
  'common-lf3-diagnosis': 'common-lf3-diagnosis.json',
  'common-lf4-goals': 'common-lf4-goals.json',
  'common-lf4-assets': 'common-lf4-assets.json',
  'common-lf4-privacy': 'common-lf4-privacy.json',
  'common-lf4-assessment': 'common-lf4-assessment.json',
  'common-lf4-measures': 'common-lf4-measures.json',
  'common-lf5-requirements': 'common-lf5-requirements.json',
  'common-lf5-types': 'common-lf5-types.json',
  'common-lf5-control': 'common-lf5-control.json',
  'common-lf5-functions': 'common-lf5-functions.json',
  'common-lf5-objects': 'common-lf5-objects.json',
  'common-lf5-storage': 'common-lf5-storage.json',
  'common-lf5-sql': 'common-lf5-sql.json',
  'common-lf5-testing': 'common-lf5-testing.json',
  'common-lf6-intake': 'common-lf6-intake.json',
  'common-lf6-priority': 'common-lf6-priority.json',
  'common-lf6-diagnosis': 'common-lf6-diagnosis.json',
  'common-lf6-solution': 'common-lf6-solution.json',
  'common-lf6-closure': 'common-lf6-closure.json',
  'common-lf7-components': 'common-lf7-components.json',
  'common-lf7-signals': 'common-lf7-signals.json',
  'common-lf7-extension': 'common-lf7-extension.json',
  'common-lf7-logic': 'common-lf7-logic.json',
  'common-lf7-verification': 'common-lf7-verification.json',
  'common-lf8-sources': 'common-lf8-sources.json',
  'common-lf8-formats': 'common-lf8-formats.json',
  'common-lf8-queries': 'common-lf8-queries.json',
  'common-lf8-interfaces': 'common-lf8-interfaces.json',
  'common-lf8-integrity': 'common-lf8-integrity.json',
  'common-lf8-delivery': 'common-lf8-delivery.json',
  'common-lf9-requirements': 'common-lf9-requirements.json',
  'common-lf9-design': 'common-lf9-design.json',
  'common-lf9-services': 'common-lf9-services.json',
  'common-lf9-security': 'common-lf9-security.json',
  'common-lf9-monitoring': 'common-lf9-monitoring.json',
  'common-lf9-handover': 'common-lf9-handover.json',
  'fiae-lf10a-process': 'fiae-lf10a-process.json',
  'fiae-lf10a-prototype': 'fiae-lf10a-prototype.json',
  'fiae-lf10a-layout': 'fiae-lf10a-layout.json',
  'fiae-lf10a-forms': 'fiae-lf10a-forms.json',
  'fiae-lf10a-usability': 'fiae-lf10a-usability.json',
  'fiae-lf10a-value': 'fiae-lf10a-value.json',
  'fiae-lf11a-model': 'fiae-lf11a-model.json',
  'fiae-lf11a-architecture': 'fiae-lf11a-architecture.json',
  'fiae-lf11a-algorithms': 'fiae-lf11a-algorithms.json',
  'fiae-lf11a-data-access': 'fiae-lf11a-data-access.json',
  'fiae-lf11a-security': 'fiae-lf11a-security.json',
  'fiae-lf11a-testing': 'fiae-lf11a-testing.json',
  'fiae-lf11a-versions': 'fiae-lf11a-versions.json',
  'fiae-lf12a-scope': 'fiae-lf12a-scope.json',
  'fiae-lf12a-alternatives': 'fiae-lf12a-alternatives.json',
  'fiae-lf12a-planning': 'fiae-lf12a-planning.json',
  'fiae-lf12a-implementation': 'fiae-lf12a-implementation.json',
  'fiae-lf12a-acceptance': 'fiae-lf12a-acceptance.json',
  'fiae-lf12a-training': 'fiae-lf12a-training.json',
  'fiae-lf12a-review': 'fiae-lf12a-review.json',
});
// Ein App-Profil hat genau einen Electron-Hauptprozess (main.js). Auch mehrere
// Store-Objekte teilen dieselbe Warteschlange je echter Datei und Thema.
const profileQueues = new Map();
const PRACTICE_SHAPES = {
  "common-lf4-measures": [
    {
      "asset": [
        "",
        "tickets",
        "screen",
        "logo"
      ],
      "dependency": [
        "",
        "chain",
        "reverse",
        "none"
      ]
    },
    {
      "confidentiality": [
        "",
        "normal",
        "high",
        "very-high"
      ],
      "confidentialityReason": [
        "",
        "harm",
        "delay",
        "price"
      ],
      "integrity": [
        "",
        "normal",
        "high",
        "very-high"
      ],
      "integrityReason": [
        "",
        "rework",
        "public",
        "chance"
      ],
      "availability": [
        "",
        "normal",
        "high",
        "very-high"
      ],
      "availabilityReason": [
        "",
        "fallback",
        "secret",
        "free"
      ],
      "basis": [
        "",
        "damage",
        "chance",
        "cost"
      ]
    },
    {
      "measure": [
        "",
        "roles",
        "shared",
        "display"
      ],
      "test": [
        "",
        "evidence",
        "purchase",
        "icon"
      ]
    },
    {
      "owner": [
        "",
        "approved",
        "self",
        "customer"
      ],
      "record": [
        "",
        "trace",
        "rating",
        "secret"
      ]
    }
  ],
  "common-lf5-testing": [
    {
      "operation": [
        "",
        "select",
        "insert",
        "update",
        "delete"
      ],
      "target": [
        "",
        "low",
        "id2",
        "id3",
        "all"
      ],
      "sort": [
        "",
        "name",
        "id"
      ]
    },
    {
      "operation": [
        "",
        "select",
        "insert",
        "update",
        "delete"
      ],
      "id": [
        "",
        "4",
        "2"
      ],
      "quantity": [
        "",
        "5",
        "0",
        "6"
      ]
    },
    {
      "operation": [
        "",
        "select",
        "insert",
        "update",
        "delete"
      ],
      "target": [
        "",
        "low",
        "id2",
        "id3",
        "all"
      ],
      "quantity": [
        "",
        "6",
        "5",
        "0"
      ]
    },
    {
      "operation": [
        "",
        "select",
        "insert",
        "update",
        "delete"
      ],
      "target": [
        "",
        "low",
        "id2",
        "id3",
        "all"
      ]
    },
    {}
  ],
  "common-lf6-closure": [
    {
      "intake": [
        "",
        "facts",
        "guess",
        "password"
      ]
    },
    {
      "priority": [
        "",
        "p1",
        "p2",
        "p3"
      ],
      "response": [
        "",
        "0925",
        "1000",
        "1310"
      ]
    },
    {
      "diagnosis": [
        "",
        "compare",
        "network",
        "proof"
      ],
      "level": [
        "",
        "l2",
        "user",
        "close"
      ]
    },
    {
      "change": [
        "",
        "controlled",
        "all",
        "hide"
      ],
      "english": [
        "",
        "update",
        "closed",
        "password"
      ]
    },
    {
      "verify": [
        "",
        "joint",
        "version",
        "silence"
      ]
    },
    {
      "closure": [
        "",
        "record",
        "done",
        "blame"
      ],
      "improve": [
        "",
        "rollout",
        "reboot",
        "less"
      ]
    }
  ]
};
const LAB_SHAPES = {"common-lf7-verification":[{"interface":["","uart","i2c","level"],"power":"number","energy":"number","supply":["","fits","over","equal"]},{},{"record":["","complete","code","normal"],"safety":["","bounded","shared","silent"]}],"common-lf8-delivery":[{"mapping":["","fields","swapped"],"duplicates":["","once","twice"],"missing":["","quarantine","guess"],"join":["","id","amount"],"group":["","region","order"]},{},{"guide":["","contract","retry","status"],"team":["","agree","silent","raw"]}],"common-lf9-handover":[{"segment":["","separate","shared"],"evidence":["","both","ping","port"]},{},{"continuity":["","distinct","same","file"],"handover":["","evidence","success","personal"]}]};
const LAB_SERVICE_FIELDS = {"address":["198.51.100.10","198.51.100.40"],"prefix":["27","26"],"gateway":["198.51.100.1","192.0.2.1"],"dns":["198.51.100.10","198.51.100.11"],"port":["443","80"],"policy":["staff","all","none"],"diagnosis":["","dns","service","policy"]};
const KEYS = new Set([
  'schemaVersion', 'revision', 'track', 'topicId', 'topicVersion', 'planVersion',
  'phase', 'index', 'completedBlocks', 'quiz', 'reflection', 'cards', 'exam',
  'history', 'bestResult', 'optionOrder', 'createdAt', 'updatedAt',
]);
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const inside = (root, target) => {
  const relative = path.relative(root, target);
  return relative === '' || (!path.isAbsolute(relative) && relative !== '..' && !relative.startsWith('..' + path.sep));
};
class JourneyError extends Error {}

function topicFile(topicId) {
  if (typeof topicId !== 'string' || !Object.hasOwn(JOURNEY_FILES, topicId)) {
    throw new JourneyError('Dieser Lernreise-Abschnitt wird nicht unterstützt.');
  }
  return JOURNEY_FILES[topicId];
}

function parseCandidate(raw, topicId) {
  if (typeof raw !== 'string' || Buffer.byteLength(raw, 'utf8') > MAX_JOURNEY_BYTES) {
    throw new JourneyError('Der Reisestand ist ungültig oder größer als 128 KiB.');
  }
  let state;
  try { state = JSON.parse(raw); } catch { throw new JourneyError('Der Reisestand enthält kein gültiges JSON.'); }
  const hasCalculation = isObject(state) && Object.hasOwn(state, 'calculation');
  const hasWorkplace = isObject(state) && Object.hasOwn(state, 'workplace');
  const hasNetwork = isObject(state) && Object.hasOwn(state, 'network');
  const hasPractice = isObject(state) && Object.hasOwn(state, 'practice');
  const hasLab = isObject(state) && Object.hasOwn(state, 'lab');
  const hasLastMarks = isObject(state) && Object.hasOwn(state, 'lastExamMarks');
  const allowedKeys = new Set([...KEYS, ...(hasLastMarks ? ['lastExamMarks'] : []), ...(hasCalculation ? ['calculation'] : []), ...(hasWorkplace ? ['workplace'] : []), ...(hasNetwork ? ['network'] : []), ...(hasPractice ? ['practice'] : []), ...(hasLab ? ['lab'] : [])]);
  if (!isObject(state) || Object.keys(state).length !== allowedKeys.size || Object.keys(state).some(key => !allowedKeys.has(key)) ||
    state.schemaVersion !== 1 || state.track !== 'FIAE' || state.topicId !== topicId ||
    !Number.isSafeInteger(state.revision) || state.revision < 1) {
    throw new JourneyError('Der Reisestand hat ein unbekanntes oder ungültiges Format.');
  }
  if (hasLastMarks && (!['exam-intro', 'exam'].includes(state.phase) || !Array.isArray(state.lastExamMarks)
    || state.lastExamMarks.length !== 8 || !state.lastExamMarks.every(mark => typeof mark === 'boolean')
    || !Array.isArray(state.history) || state.lastExamMarks.filter(Boolean).length !== state.history.at(-1)?.correct)) {
    throw new JourneyError('Die Lernzielübersicht der letzten Abgabe ist ungültig.');
  }
  if (hasCalculation) {
    const rows = { 'common-pm-costs': 7, 'common-pm-pricing': 8, 'common-pm-feasibility': 10 };
    const count = rows[topicId];
    const value = state.calculation;
    if (!count || !isObject(value) || Object.keys(value).length !== 1 || !isObject(value.cells)
      || Object.keys(value.cells).length !== count || Object.entries(value.cells).some(([id, text]) => !Array.from({ length: count }, (_, index) => `B${index + 1}`).includes(id) || typeof text !== 'string' || text.length > 160)) {
      throw new JourneyError('Die Kalkulation gehört nicht zu diesem Abschnitt oder ist ungültig.');
    }
  }
  if (hasWorkplace) {
    const choices = { device: ['', 'compact', 'office', 'power'], software: ['', 'approved', 'preview'], account: ['', 'standard', 'admin'], displays: ['', '1', '2'] };
    const flags = ['updated', 'folder', 'file', 'opened', 'checked'];
    const keys = [...Object.keys(choices), ...flags];
    const value = state.workplace;
    if (topicId !== 'common-lf2-handover' || !isObject(value) || Object.keys(value).length !== keys.length
      || Object.keys(value).some(key => !keys.includes(key)) || Object.entries(choices).some(([key, values]) => !values.includes(value[key]))
      || flags.some(key => typeof value[key] !== 'boolean') || (value.file && !value.folder) || (value.opened && !value.file)) {
      throw new JourneyError('Die Einrichtungsübung gehört nicht zu diesem Abschnitt oder ist ungültig.');
    }
  }
  if (hasNetwork) {
    const value = state.network;
    const keys = ['linked', 'ip', 'prefix', 'gateway', 'dns', 'diagnosis', 'observed', 'checked', 'done'];
    if (topicId !== 'common-lf3-diagnosis' || !isObject(value) || Object.keys(value).length !== 2 || !Object.hasOwn(value, 'index') || !Object.hasOwn(value, 'cases')
      || !Number.isInteger(value.index) || value.index < 0 || value.index > 2 || !Array.isArray(value.cases) || value.cases.length !== 3
      || value.cases.some(c => !isObject(c) || Object.keys(c).length !== keys.length || Object.keys(c).some(key => !keys.includes(key))
        || ['linked', 'observed', 'checked', 'done'].some(key => typeof c[key] !== 'boolean')
        || ['ip', 'gateway', 'dns'].some(key => typeof c[key] !== 'string' || c[key].length > 15 || !/^[0-9.]*$/.test(c[key]))
        || !['24', '25', '26'].includes(c.prefix) || !['', 'link', 'address', 'gateway', 'dns'].includes(c.diagnosis))) {
      throw new JourneyError('Das Netzwerklabor gehört nicht zu diesem Abschnitt oder ist ungültig.');
    }
  }
  if (hasPractice) {
    const value = state.practice; const shape = PRACTICE_SHAPES[topicId]; const data = topicId === 'common-lf5-testing';
    const keys = ['step', 'answers', 'checked', 'done', ...(data ? ['previewed', 'code', 'codePassed', 'testedCode'] : [])];
    if (!shape || !isObject(value) || Object.keys(value).length !== keys.length || Object.keys(value).some(key => !keys.includes(key))
      || !Number.isInteger(value.step) || value.step < 0 || value.step >= shape.length
      || typeof value.checked !== 'boolean' || typeof value.done !== 'boolean'
      || !Array.isArray(value.answers) || value.answers.length !== shape.length
      || value.answers.some((answer, i) => !isObject(answer) || Object.keys(answer).length !== Object.keys(shape[i]).length
        || Object.keys(answer).some(key => !Object.hasOwn(shape[i], key) || !shape[i][key].includes(answer[key])))
      || (data && (typeof value.previewed !== 'boolean' || typeof value.codePassed !== 'boolean' || typeof value.code !== 'string' || value.code.length > 4096 || !(value.testedCode === null || typeof value.testedCode === 'string' && value.testedCode.length <= 4096) || (value.codePassed && value.testedCode !== value.code)))) {
      throw new JourneyError('Die praktische Übung gehört nicht zu diesem Abschnitt oder ist ungültig.');
    }
  }
  if (hasLab) {
    const v = state.lab; const shape = LAB_SHAPES[topicId];
    const kind = ['common-lf7-verification', 'common-lf8-delivery', 'common-lf9-handover'].indexOf(topicId);
    const keys = ['stage', 'answers', 'checked', 'done', ...(kind === 0 ? ['source', 'testedSource', 'codePassed'] : kind === 1 ? ['payload', 'auth', 'transport', 'requests'] : ['index', 'cases'])];
    const exact = (x, list) => isObject(x) && Object.keys(x).length === list.length && Object.keys(x).every(k => list.includes(k));
    const text = x => typeof x === 'string' && x.length <= 4096;
    const request = x => exact(x, ['payload', 'auth', 'transport']) && text(x.payload) && ['allowed', 'denied'].includes(x.auth) && ['https', 'http'].includes(x.transport);
    if (!shape || !exact(v, keys) || !Number.isInteger(v.stage) || v.stage < 0 || v.stage > 2 || typeof v.checked !== 'boolean' || typeof v.done !== 'boolean'
      || !Array.isArray(v.answers) || v.answers.length !== 3 || v.answers.some((a, i) => !exact(a, Object.keys(shape[i])) || Object.entries(shape[i]).some(([k, values]) => values === 'number' ? typeof a[k] !== 'string' || a[k].length > 12 || !/^[0-9., -]*$/.test(a[k]) : !values.includes(a[k])))
      || kind === 0 && (!text(v.source) || !(v.testedSource === null || text(v.testedSource) && v.testedSource === v.source) || typeof v.codePassed !== 'boolean' || v.codePassed && v.testedSource !== v.source)
      || kind === 1 && (!request({ payload: v.payload, auth: v.auth, transport: v.transport }) || !Array.isArray(v.requests) || v.requests.length > 16 || !v.requests.every(request))
      || kind === 2 && (!Number.isInteger(v.index) || v.index < 0 || v.index > 2 || !Array.isArray(v.cases) || v.cases.length !== 3 || v.cases.some(c => !exact(c, [...Object.keys(LAB_SERVICE_FIELDS), 'running', 'observed', 'checked', 'done']) || Object.entries(LAB_SERVICE_FIELDS).some(([k, values]) => !values.includes(c[k])) || ['running', 'observed', 'checked', 'done'].some(k => typeof c[k] !== 'boolean')))) {
      throw new JourneyError('Das Lernlabor gehört nicht zu diesem Abschnitt oder ist ungültig.');
    }
  }
  // Fachliche Vollständigkeit und Ergebnisauswertung bleiben beim Renderer/API.
  return state;
}

function nextRevision(raw) {
  try {
    const state = JSON.parse(raw);
    if (isObject(state) && Number.isSafeInteger(state.revision) && state.revision >= 0) return state.revision + 1;
  } catch {}
  return 1;
}

function createJourneyStore(profile) {
  const root = path.join(profile, JOURNEY_FOLDER);
  const localQueues = new Map();

  function serial(topicId, action, message) {
    let filename;
    try { filename = topicFile(topicId); } catch (error) { return Promise.reject(error); }
    const target = path.join(root, filename);
    const result = (localQueues.get(topicId) || Promise.resolve()).catch(() => {}).then(async () => {
      try {
        await ensureRoot();
        const key = path.join(await fs.realpath(root), filename);
        const task = (profileQueues.get(key) || Promise.resolve()).catch(() => {}).then(() => action(target));
        profileQueues.set(key, task);
        try { return await task; }
        finally { if (profileQueues.get(key) === task) profileQueues.delete(key); }
      } catch (error) {
        if (error instanceof JourneyError) throw error;
        // Betriebssystemfehler können Pfade enthalten; keine Inhalte/Pfade an die UI geben.
        throw new JourneyError(message);
      }
    });
    localQueues.set(topicId, result);
    return result;
  }

  async function ensureRoot() {
    await fs.mkdir(root, { recursive: true });
    const stat = await fs.lstat(root);
    if (!stat.isDirectory() || stat.isSymbolicLink() || !inside(await fs.realpath(profile), await fs.realpath(root))) {
      throw new JourneyError('Der lokale Reisestand-Speicher ist nicht verfügbar.');
    }
  }

  async function readRaw(target) {
    let stat;
    try { stat = await fs.lstat(target); } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > MAX_JOURNEY_BYTES) {
      throw new JourneyError('Der gespeicherte Reisestand kann nicht gelesen werden. Die Datei bleibt erhalten.');
    }
    const handle = await fs.open(target, 'r');
    try {
      const opened = await handle.stat();
      if (!opened.isFile() || opened.ino !== stat.ino || opened.dev !== stat.dev || !inside(await fs.realpath(root), await fs.realpath(target))) {
        throw new JourneyError('Der gespeicherte Reisestand wurde während des Lesens verändert.');
      }
      const buffer = Buffer.alloc(MAX_JOURNEY_BYTES + 1);
      let offset = 0;
      while (offset < buffer.length) {
        const { bytesRead } = await handle.read(buffer, offset, buffer.length - offset, null);
        if (!bytesRead) break;
        offset += bytesRead;
      }
      if (offset > MAX_JOURNEY_BYTES) throw new JourneyError('Der gespeicherte Reisestand ist zu groß. Die Datei bleibt erhalten.');
      // Auch unbekannte Versionen/defektes JSON unverändert für Sicherung und Ersatz liefern.
      return buffer.subarray(0, offset).toString('utf8');
    } finally { await handle.close(); }
  }

  async function writeAtomic(target, raw) {
    const temporary = path.join(root, `${path.basename(target, '.json')}.${randomUUID()}.tmp`);
    try {
      const handle = await fs.open(temporary, 'wx', 0o600);
      try { await handle.writeFile(raw, 'utf8'); await handle.sync(); }
      finally { await handle.close(); }
      await fs.rename(temporary, target);
    } finally {
      // Nach erfolgreichem rename darf ein Aufräumfehler keinen falschen Misserfolg melden.
      await fs.unlink(temporary).catch(() => {});
    }
  }

  return Object.freeze({
    load: (topicId = DEFAULT_TOPIC_ID) => serial(topicId, readRaw, 'Der lokale Reisestand konnte nicht gelesen werden. Er bleibt erhalten.'),
    save(value) {
      const requestValid = isObject(value) && Object.hasOwn(value, 'raw') && Object.hasOwn(value, 'expectedRaw')
        && Reflect.ownKeys(value).every(key => ['raw', 'expectedRaw', 'topicId'].includes(key))
        && (!('topicId' in value) || Object.hasOwn(value, 'topicId'));
      if (!requestValid) return Promise.reject(new JourneyError('Ungültiger Speicherauftrag für die Lernreise.'));
      const topicId = Object.hasOwn(value, 'topicId') ? value.topicId : DEFAULT_TOPIC_ID;
      const raw = value?.raw;
      const expectedRaw = value?.expectedRaw;
      return serial(topicId, async target => {
        if (expectedRaw !== null && typeof expectedRaw !== 'string') throw new JourneyError('Ungültiger Speicherauftrag für die Lernreise.');
        const candidate = parseCandidate(raw, topicId);
        const current = await readRaw(target);
        if (current !== expectedRaw) throw new JourneyError('CONFLICT: Der Reisestand wurde inzwischen verändert. Bitte den aktuellen Stand laden.');
        if (candidate.revision !== nextRevision(current)) throw new JourneyError('CONFLICT: Die Revision des Reisestands ist nicht mehr aktuell. Bitte erneut laden.');
        await writeAtomic(target, raw);
        return raw;
      }, 'Der Reisestand konnte nicht gespeichert werden. Der bisherige Stand bleibt erhalten.');
    },
  });
}

module.exports = { createJourneyStore, MAX_JOURNEY_BYTES, JOURNEY_FOLDER };
