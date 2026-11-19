// Reines Lernmodell: keine Sockets, Betriebssystembefehle oder externen Anfragen.
export const NETWORK_TOPIC = 'common-lf3-diagnosis';
export const NETWORK_CASES = Object.freeze([
  Object.freeze({ id: 'link', title: 'Fall 1: Das Portal ist nicht erreichbar' }),
  Object.freeze({ id: 'address', title: 'Fall 2: Ein neu eingerichteter Client' }),
  Object.freeze({ id: 'dns', title: 'Fall 3: Die IP-Probe gelingt, der Name nicht' }),
]);
export const DIAGNOSES = Object.freeze({ link: 'Physische Verbindung', address: 'IP-Konfiguration', gateway: 'Standardgateway', dns: 'Namensauflösung' });
const KEYS = ['linked', 'ip', 'prefix', 'gateway', 'dns', 'diagnosis', 'observed', 'checked', 'done'];
const isObject = v => v && typeof v === 'object' && !Array.isArray(v) && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const exact = (v, keys) => isObject(v) && Object.keys(v).length === keys.length && Object.keys(v).every(key => keys.includes(key));
const addressText = v => typeof v === 'string' && v.length <= 15 && /^[0-9.]*$/.test(v);
const initialCase = i => ({ linked: i !== 0, ip: i === 1 ? '198.51.100.25' : '192.0.2.20', prefix: '24', gateway: '192.0.2.1', dns: i === 2 ? '192.0.2.99' : '192.0.2.53', diagnosis: '', observed: false, checked: false, done: false });
export const createNetwork = () => ({ index: 0, cases: NETWORK_CASES.map((_, i) => initialCase(i)) });

function clientFits(ip, prefix) {
  if (!/^192\.0\.2\.(?:[1-9]\d{0,2})$/.test(ip) || prefix !== '24') return false;
  const host = Number(ip.split('.')[3]);
  return host >= 2 && host <= 254 && ![10, 53].includes(host);
}

export function probeNetwork(c) {
  const checks = [
    { id: 'link', label: 'Verbindung', passed: c.linked === true, text: c.linked ? 'Ethernet-Verbindung zum vorgesehenen Switch vorhanden.' : 'Kein Verbindungssignal am Client. Anschluss und Kabelweg zuerst prüfen.' },
    { id: 'address', label: 'IP-Konfiguration', passed: clientFits(c.ip, c.prefix), text: clientFits(c.ip, c.prefix) ? 'Freie Hostadresse im vorgesehenen Netz 192.0.2.0/24.' : 'Benötigt wird eine freie Hostadresse in 192.0.2.0/24; .1, .10 und .53 sind belegt, .0 und .255 keine Hostadressen.' },
    { id: 'gateway', label: 'Standardgateway', passed: c.gateway === '192.0.2.1', text: c.gateway === '192.0.2.1' ? 'Vorgegebene Routeradresse eingetragen.' : 'Der Netzplan gibt 192.0.2.1 als Router für andere Netze vor.' },
    { id: 'dns', label: 'Namensauflösung', passed: c.dns === '192.0.2.53', text: c.dns === '192.0.2.53' ? 'portal.example.test wird im Modell zu 198.51.100.20 aufgelöst.' : 'Der eingetragene Dienst liefert im Modell keine Antwort. Der vorgesehene DNS-Dienst ist 192.0.2.53.' },
  ];
  const first = checks.findIndex(item => !item.passed);
  return {
    passed: first < 0,
    failure: first < 0 ? null : checks[first].id,
    checks: checks.map((item, i) => ({ ...item, skipped: first >= 0 && i > first })),
    ipReachable: checks.slice(0, 3).every(item => item.passed),
    application: first < 0 ? 'Modellportal über den Namen erreichbar; synthetische Anwendungsantwort: Auftrag geöffnet.' : 'Anwendungsprobe über den Namen noch nicht erfolgreich.',
  };
}

export function validNetwork(value) {
  if (!exact(value, ['index', 'cases']) || !Number.isInteger(value.index) || value.index < 0 || value.index > 2 || !Array.isArray(value.cases) || value.cases.length !== 3) return false;
  if (!value.cases.every((c, i) => {
    if (!exact(c, KEYS) || !['linked', 'observed', 'checked', 'done'].every(key => typeof c[key] === 'boolean')
      || !['ip', 'gateway', 'dns'].every(key => addressText(c[key])) || !['24', '25', '26'].includes(c.prefix)
      || !['', ...Object.keys(DIAGNOSES)].includes(c.diagnosis)) return false;
    if (!c.observed && KEYS.some(key => c[key] !== initialCase(i)[key])) return false;
    if (i > value.index && KEYS.some(key => c[key] !== initialCase(i)[key])) return false;
    if (i < value.index && !c.done) return false;
    return !c.done || (c.observed && c.checked && c.diagnosis === NETWORK_CASES[i].id && probeNetwork(c).passed);
  })) return false;
  return value.index === Math.min(value.cases.findIndex(c => !c.done) < 0 ? 3 : value.cases.findIndex(c => !c.done), 2);
}

export const networkPassed = value => validNetwork(value) && value.cases.every(c => c.done);
export const initialProbe = index => probeNetwork(initialCase(index));

export function updateNetwork(value, action) {
  const invalid = () => { throw new Error('Dieser Schritt passt nicht zum Netzwerklabor.'); };
  if (!validNetwork(value) || !action || typeof action !== 'object' || networkPassed(value)) invalid();
  const next = { index: value.index, cases: value.cases.map(c => ({ ...c })) };
  const c = next.cases[next.index];
  if (c.done) invalid();
  if (action.type === 'test') { c.observed = true; c.checked = true; }
  else if (action.type === 'configure' && c.observed) {
    if (action.field === 'linked' && typeof action.value === 'boolean') c.linked = action.value;
    else if (['ip', 'gateway', 'dns'].includes(action.field) && addressText(action.value)) c[action.field] = action.value;
    else if (action.field === 'prefix' && ['24', '25', '26'].includes(action.value)) c.prefix = action.value;
    else if (action.field === 'diagnosis' && ['', ...Object.keys(DIAGNOSES)].includes(action.value)) c.diagnosis = action.value;
    else invalid();
    c.checked = false;
  } else if (action.type === 'finish' && c.observed && c.checked && c.diagnosis === NETWORK_CASES[next.index].id && probeNetwork(c).passed) {
    c.done = true; next.index = Math.min(next.index + 1, 2);
  } else invalid();
  return next;
}
