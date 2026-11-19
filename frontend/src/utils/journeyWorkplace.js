// Feste Lernmodelle, ohne Betriebssystem-, Datei- oder Netzwerkzugriff.
export const WORKPLACE_TOPIC = 'common-lf2-handover';
export const DEVICES = Object.freeze([
  Object.freeze({ id: 'compact', title: 'Kompakt', ram: 8, storage: 256, outputs: 1 }),
  Object.freeze({ id: 'office', title: 'Büro', ram: 16, storage: 512, outputs: 2 }),
  Object.freeze({ id: 'power', title: 'Leistung', ram: 32, storage: 1024, outputs: 2 }),
]);
export const TEST_DOCUMENT = 'Test des Büroarbeitsplatzes: Ticketportal und Wissenssuche. Umlaute: ä ö ü ß.';
const CHOICES = Object.freeze({ device: ['', 'compact', 'office', 'power'], software: ['', 'approved', 'preview'], account: ['', 'standard', 'admin'], displays: ['', '1', '2'] });
const FLAGS = ['updated', 'folder', 'file', 'opened', 'checked'];
const KEYS = [...Object.keys(CHOICES), ...FLAGS];
export const createWorkplace = () => ({ device: '', software: '', account: '', displays: '', updated: false, folder: false, file: false, opened: false, checked: false });

export function validWorkplace(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value)
    && [Object.prototype, null].includes(Object.getPrototypeOf(value))
    && Object.keys(value).length === KEYS.length && Object.keys(value).every(key => KEYS.includes(key))
    && Object.entries(CHOICES).every(([key, choices]) => choices.includes(value[key]))
    && FLAGS.every(key => typeof value[key] === 'boolean')
    && (!value.file || value.folder) && (!value.opened || value.file));
}

export function checkWorkplace(value) {
  if (!validWorkplace(value)) return { passed: false, checks: [] };
  const device = DEVICES.find(item => item.id === value.device);
  const checks = [
    { label: 'Hardwarebedarf', passed: Boolean(device && device.ram >= 16 && device.storage >= 512 && device.outputs >= 2), explanation: 'Mindestens 16 GB RAM, 512 GB SSD und zwei digitale Bildschirmausgänge müssen vorhanden sein.' },
    { label: 'Anwendung', passed: value.software === 'approved', explanation: 'Für den Auftrag ist der freigegebene Browser vorgesehen. Die ungeprüfte Testversion ist nicht freigegeben.' },
    { label: 'Benutzerrechte', passed: value.account === 'standard', explanation: 'Die tägliche Ticketarbeit erfolgt im Standardkonto; Administrationsrechte sind dafür nicht erforderlich.' },
    { label: 'Aktualisierung', passed: value.updated, explanation: 'Die für den Übungsauftrag freigegebenen Systemupdates müssen angewendet sein.' },
    { label: 'Bildschirme', passed: value.displays === '2' && Boolean(device && device.outputs >= 2), explanation: 'Zwei Bildschirme müssen im Modell eingerichtet und vom Gerät unterstützt werden.' },
    { label: 'Dateiablage', passed: value.folder && value.file && value.opened, explanation: 'Arbeitsordner erstellen, Testdatei anlegen und zum Kontrollieren wieder öffnen.' },
  ];
  return { passed: checks.every(item => item.passed), checks };
}

export function updateWorkplace(value, action) {
  const invalid = () => { throw new Error('Dieser Schritt passt nicht zur Einrichtungsübung.'); };
  if (!validWorkplace(value) || !action || typeof action !== 'object') invalid();
  const next = { ...value, checked: false };
  if (action.type === 'configure') {
    if (action.field === 'updated' && typeof action.value === 'boolean') next.updated = action.value;
    else if (Object.hasOwn(CHOICES, action.field) && CHOICES[action.field].includes(action.value)) next[action.field] = action.value;
    else invalid();
  } else if (action.type === 'create-folder') next.folder = true;
  else if (action.type === 'create-file' && value.folder) next.file = true;
  else if (action.type === 'open-file' && value.file) next.opened = true;
  else if (action.type === 'check') next.checked = true;
  else invalid();
  return next;
}
