// Ausschließlich synthetische Lernmodelle; keine Geräte, Netzanfragen oder Dateien.
export const LAB_TOPICS = ['common-lf7-verification', 'common-lf8-delivery', 'common-lf9-handover'];
export const CONTROL_START = 'function control(temperature, connected) {\n  // Erst ungültige Werte/Verbindung prüfen, dann die Schwelle 30 °C.\n  return "off";\n}\n';
export const REPORT_START = '{\n  "batchId": "demo-01",\n  "rows": [{"region":"Nord","total":"30"},{"region":"Süd","total":5}]\n}';
const field = (key, label, options, expected, text) => ({ key, label, options, expected, text });
const number = (key, label, expected, text) => ({ key, label, expected, text, kind: 'number' });
export const LAB_STEPS = {
  [LAB_TOPICS[0]]: [
    { title: 'Erweiterung und Versorgung planen', text: 'Ungefährliches Tischmodell: Sensor → Steuerung → Modelllüfter. Fiktive Unterlagen: Sensor liefert temperaturabhängige UART-Daten mit 3,3-V-Signalpegel, Decoder erwartet „temp=28.0 degC“ mit Zeilenende LF (9600 Baud, 8N1). Versorgung der Modellmodule jeweils 5 V: Sensor 0,1 A, Steuerung 0,2 A, Lüfter 0,4 A. Netzteil 5 V / 1 A. Annahme: konstante Volllast für acht Stunden, ohne zusätzliche Verluste.', fields: [
      field('interface', 'Passende Schnittstelle und Bibliothek', [['uart', 'UART mit 3,3-V-Pegel und Decoder für temp=Zahl degC mit LF'], ['i2c', 'I²C-Bibliothek für einen binären Sensorwert'], ['level', 'UART mit 5-V-Signalpegel und Decoder für temp=Zahl degC mit LF']], 'uart', 'Signalpegel, Protokoll und Datenformat müssen gemeinsam passen. Versorgungsspannung und Signalpegel sind verschiedene Angaben.'),
      number('power', 'Gesamtleistung in W', 3.5, '0,1 + 0,2 + 0,4 = 0,7 A; 5 V × 0,7 A = 3,5 W.'),
      number('energy', 'Energie in acht Stunden in Wh', 28, '3,5 W × 8 h = 28 Wh; W ist Leistung, Wh Energie.'),
      field('supply', 'Bewertung der Versorgung', [['fits', '0,7 A Bedarf liegen unter 1 A; 0,3 A Reserve im idealisierten Modell'], ['over', '0,7 A Bedarf überschreiten 1 A; stärkere Versorgung erforderlich'], ['equal', 'Signalpegel 3,3 V und Versorgung 5 V sind identische Angaben']], 'fits', 'Die Summe liegt unter der vorgegebenen Versorgung. Reale Anlaufströme und Verluste sind hier nicht modelliert.'),
    ] },
    { title: 'Steuerfunktion ausführen', text: 'Schreibe control(temperature, connected). Nur connected === true und ein endlicher Zahlenwert zwischen −20 und 80 °C sind gültig. Sonst Rückgabe "fault". Ab 30 °C einschließlich: "on", darunter: "off". "fault" bedeutet in diesem ungefährlichen Tischmodell Lüfter aus und Alarm an. Dies ist keine allgemeine Sicherheitsregel für echte Lüfter oder Anlagen.', fields: [] },
    { title: 'Prüfung und Übergabe festhalten', text: 'Die aufgezeichneten Modellproben umfassen Normalwerte, Schwellen, unzulässige Werte und einen Verbindungsabbruch. Einbau und elektrische Arbeiten erfolgen nicht in dieser App.', fields: [
      field('record', 'Systemdokumentation', [['complete', 'Schnittstelle, Bibliotheksformat, Versorgung, Steuerstand, Fehlerreaktion und Testergebnisse'], ['code', 'Quelltext und Bildschirmfoto ohne Versorgungsannahmen'], ['normal', 'Nur die erfolgreiche Probe bei 35 °C und der Gerätename']], 'complete', 'Dokumentiere Annahmen, Änderungen und Normal-/Fehlerfälle, damit die Erweiterung nachvollziehbar bleibt.'),
      field('safety', 'Betriebs- und Datensicherheit', [['bounded', 'Freigegebene Zuständigkeit, geschützte Konfiguration und kontrollierte Tests mit Rückfallstand'], ['shared', 'Gemeinsamer Schreibzugriff auf die Steuerung und Test nur im Normalbetrieb'], ['silent', 'Fehlerwerte als gültige Messungen speichern und Alarmmeldung ausblenden']], 'bounded', 'Modellbefunde ersetzen keine Freigabe oder Sicherheitsbewertung echter Hardware.'),
    ] },
  ],
  [LAB_TOPICS[1]]: [
    { title: 'Daten prüfen und Bericht erzeugen', text: 'Fiktive freigegebene Quellen: Kunden 1/Nord und 2/Süd. Aufträge 101/1/10 €, 102/1/20 €, 103/2/5 €, nochmals derselbe 102/1/20 €, sowie 104/fehlende Kunden-ID/7 €. Beträge sind in diesem Beispiel ganze Euro. Wähle Regeln; die Anwendung führt Bereinigung, Verknüpfung und Gruppierung lokal aus.', fields: [
      field('mapping', 'Felder zuordnen', [['fields', 'Auftrag → orderId, Kunde → customerId, Betrag → amount (ganze EUR)'], ['swapped', 'Auftrag → orderId, Kunde → amount, Betrag → customerId']], 'fields', 'Die Feldbedeutung bleibt beim Formatwechsel erhalten; Kundenschlüssel und Geldbetrag dürfen nicht vertauscht werden.'),
      field('duplicates', 'Exakt doppelte Aufträge', [['once', 'Identischen Auftrag mit gleicher ID einmal übernehmen'], ['twice', 'Beide Vorkommen als getrennte Umsätze addieren']], 'once', 'Die identische Wiederholung von Auftrag 102 erzeugt keinen neuen Umsatz.'),
      field('missing', 'Fehlende Kunden-ID', [['quarantine', 'Auftrag 104 mit Grund zurückstellen und Klärung anfordern'], ['guess', 'Auftrag 104 ohne Beleg dem Norden zuordnen']], 'quarantine', 'Fehlende Zuordnungen dürfen nicht durch erfundene Kundendaten ersetzt werden.'),
      field('join', 'Verknüpfung', [['id', 'orders.customerId = customers.customerId'], ['amount', 'orders.amount = customers.customerId']], 'id', 'Der Fremdschlüssel verbindet einen Auftrag mit seinem Kunden; Beträge sind keine Kundenschlüssel.'),
      field('group', 'Gruppierung', [['region', 'Nach Region mit SUM(amount)'], ['order', 'Nach Auftrags-ID mit COUNT(*)']], 'region', 'Der Auftrag verlangt den Umsatz je Region, nicht die Anzahl je Auftrag.'),
    ] },
    { title: 'Übertragung am lokalen Empfänger testen', text: 'Vertrag: POST /reports mit application/json. batchId: 1–40 Zeichen (Buchstaben, Ziffern, _ oder -); rows enthält Nord und Süd genau einmal, total ist eine ganze Zahl von 0 bis 1000000. Keine weiteren Felder. Das Modell speichert eine Lieferung; bei belegtem Empfänger wird auch eine andere batchId mit 409 abgewiesen. Zielbericht: Nord 30, Süd 5. Teste nacheinander einen Typfehler (422), die korrigierte Übertragung (201), dieselbe Übertragung erneut (200) und denselben batchId mit verändertem Betrag (409). Der Empfänger übernimmt atomar. Gleiche Inhalte in anderer Reihenfolge bleiben gleich. Das Wiederholungsverhalten ist Teil dieses Vertrags, keine allgemeine Eigenschaft von POST.', fields: [] },
    { title: 'Nutzung und Zusammenarbeit übergeben', text: 'Der Empfang muss zum bereinigten Ausgangsbestand passen. Eine erfolgreiche Transportantwort allein erklärt noch nicht die fachliche Richtigkeit des Berichts.', fields: [
      field('guide', 'Nutzungsanleitung und englische Angabe', [['contract', 'Methode, Pfad, Schema, Rechte, Statusfälle und „same batch, same content“ als gleiche Lieferung dokumentieren'], ['retry', 'Jeden Wiederholungsversuch mit neuem batchId als neue Lieferung kennzeichnen'], ['status', 'Nur Status 201 nennen und Fehlerantworten als erfolgreiche Übernahme behandeln']], 'contract', 'Der Empfänger erkennt Wiederholungen anhand des vereinbarten Schlüssels und gleichen Inhalts.'),
      field('team', 'Änderungen und Protokollierung', [['agree', 'Schemaänderungen mit Sender/Empfänger abstimmen; IDs, Status und Fehlergrund ohne Zugangsdaten protokollieren'], ['silent', 'Feldnamen am Sender ändern und die bisherige Empfangsprüfung auslassen'], ['raw', 'Alle Quellinhalte und Zugangsdaten zur Fehleranalyse im Protokoll sammeln']], 'agree', 'Verantwortliche, Version und Fehlerrückmeldung müssen abgestimmt werden; unnötige personenbezogene Daten und Geheimnisse gehören nicht ins Protokoll.'),
    ] },
  ],
  [LAB_TOPICS[2]]: [
    { title: 'Netz und Anforderungen abgleichen', text: 'Vorgegebener Plan: Mitarbeitende 192.0.2.0/26 (Client .10, Gateway .1), Gäste 192.0.2.64/26 (Client .70, Gateway .65), Dienste 198.51.100.0/27 (Server .10, Gateway .1). DNS 203.0.113.53 gehört zur vorgegebenen funktionierenden Infrastruktur. portal.example.test soll per HTTPS/TCP 443 nur für Mitarbeitende erreichbar sein. Routing, DNS-Transport, Rückverkehr und TLS-Identität sind im Modell funktionsfähig.', fields: [
      field('segment', 'Segmentierung', [['separate', 'Mitarbeitende, Gäste und Dienste in den vorgegebenen getrennten Teilnetzen'], ['shared', 'Gäste und Mitarbeitende im selben Teilnetz mit gleichen Rechten']], 'separate', 'Segmente ordnen Geräte und Sicherheitsregeln; die Freigaben müssen zusätzlich passen.'),
      field('evidence', 'Prüfbare Anforderung', [['both', 'Mitarbeiterzugriff über Namen erfolgreich, Gastzugriff auf das Portal abgewiesen'], ['ping', 'Eine erfolgreiche ICMP-Probe genügt als HTTPS-Nachweis'], ['port', 'Eine offene Portnummer ersetzt die Anwendungsantwort']], 'both', 'Positive und negative Anwendungsproben prüfen Erreichbarkeit und die geforderte Trennung.'),
    ] },
    { title: 'Drei Dienststörungen untersuchen', text: 'Rufe zuerst den Befund ab. Ordne den Ausgangsfehler zu, korrigiere die vorgegebenen Dienstwerte und prüfe erneut. Fehler 1: falscher DNS-Eintrag; Fehler 2: Dienst gestoppt; Fehler 3: Gastzugriff versehentlich erlaubt. Die Ausgaben sind reine Modellergebnisse, keine Scans.', fields: [] },
    { title: 'Betrieb und allgemeine Grundlagen abschließen', text: 'Die drei Fälle sind geprüft. Halte die freigegebene Konfiguration und Betriebsregeln fest. Danach folgt in der Lernreise die FIAE-Spezialisierung mit LF10a; ein Ausbildungsabschluss wird hier nicht bescheinigt.', fields: [
      field('continuity', 'Sicherung und Verfügbarkeit', [['distinct', 'Sicherung bewahrt Datenstände, Wiederherstellung wird getestet, Redundanz überbrückt bestimmte Ausfälle'], ['same', 'Eine zweite laufende Instanz ersetzt jede Sicherung älterer Datenstände'], ['file', 'Eine vorhandene Sicherungsdatei beweist die erfolgreiche Wiederherstellung']], 'distinct', 'Sicherung, getestete Wiederherstellung und Redundanz erfüllen unterschiedliche Zwecke.'),
      field('handover', 'Betriebsübergabe', [['evidence', 'Netzplan, DNS/Port/Regeln, positive und negative Proben, Zuständigkeit, Rückfall und offene Grenzen'], ['success', 'Nur die letzte erfolgreiche Mitarbeiterprobe und die Serveradresse'], ['personal', 'Vollständige persönliche Nutzungsverläufe statt benötigter technischer Messwerte']], 'evidence', 'Übergabe verbindet Anforderungen und Nachweise; Monitoring erfasst benötigte Dienstinformationen statt unnötiger persönlicher Daten.'),
    ] },
  ],
};
const initialCase = i => ({ address: '198.51.100.10', prefix: '27', gateway: '198.51.100.1', dns: i === 0 ? '198.51.100.11' : '198.51.100.10', port: '443', running: i !== 1, policy: i === 2 ? 'all' : 'staff', diagnosis: '', observed: false, checked: false, done: false });
export const SERVICE_FIELDS = { address: ['198.51.100.10', '198.51.100.40'], prefix: ['27', '26'], gateway: ['198.51.100.1', '192.0.2.1'], dns: ['198.51.100.10', '198.51.100.11'], port: ['443', '80'], policy: ['staff', 'all', 'none'], diagnosis: ['', 'dns', 'service', 'policy'] };
export function probeService(c) {
  const configuration = c.address === '198.51.100.10' && c.prefix === '27' && c.gateway === '198.51.100.1';
  const dns = c.dns === c.address;
  const service = c.running && c.port === '443';
  const staff = configuration && dns && service && c.policy !== 'none';
  const guest = configuration && dns && service && c.policy === 'all';
  return { configuration, dns, service, staff, guest, passed: staff && !guest,
    messages: [configuration ? 'Serveradresse, Präfix und Gateway passen zum Plan.' : 'Serverkonfiguration weicht vom Plan ab.', dns ? 'Name zeigt auf die Serveradresse.' : 'Name zeigt auf einen anderen Zielhost.', service ? 'HTTPS-Dienst läuft auf TCP 443.' : 'HTTPS auf TCP 443 ist nicht verfügbar.', staff ? 'Mitarbeiterprobe: Portalantwort erfolgreich.' : 'Mitarbeiterprobe: Portal nicht erreichbar.', guest ? 'Gastprobe: Portal unerwartet erreichbar.' : 'Gastprobe: kein Portalzugriff. Nur zusammen mit erfolgreicher Mitarbeiterprobe ist die geforderte Trennung nachgewiesen.'] };
}
export function prepareReport(a) {
  const source = [{ Auftrag: 101, Kunde: 1, Betrag: 10 }, { Auftrag: 102, Kunde: 1, Betrag: 20 }, { Auftrag: 103, Kunde: 2, Betrag: 5 }, { Auftrag: 102, Kunde: 1, Betrag: 20 }, { Auftrag: 104, Kunde: null, Betrag: 7 }];
  const raw = source.map(row => ({ orderId: row.Auftrag, customerId: a.mapping === 'fields' ? row.Kunde : row.Betrag, amount: a.mapping === 'fields' ? row.Betrag : row.Kunde }));
  let duplicates = 0; let quarantined = 0; const seen = new Set(); const accepted = [];
  for (const original of raw) {
    const row = { ...original };
    if (seen.has(row.orderId) && a.duplicates === 'once') { duplicates++; continue; } seen.add(row.orderId);
    if (row.customerId === null) { if (a.missing === 'quarantine') { quarantined++; continue; } row.customerId = 1; }
    accepted.push(row);
  }
  const joined = accepted.map(row => ({ ...row, region: ({ 1: 'Nord', 2: 'Süd' })[a.join === 'id' ? row.customerId : row.amount] ?? null }));
  const totals = new Map();
  for (const row of joined.filter(r => r.region !== null)) { const key = a.group === 'region' ? row.region : String(row.orderId); totals.set(key, (totals.get(key) || 0) + (a.group === 'region' ? row.amount : 1)); }
  return { input: 5, duplicates, quarantined, accepted, joined, rows: [...totals].map(([region, total]) => ({ region, total })) };
}
const object = v => v !== null && typeof v === 'object' && !Array.isArray(v) && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const exact = (v, keys) => object(v) && Object.keys(v).length === keys.length && Object.keys(v).every(k => keys.includes(k));
const numeric = s => typeof s === 'string' && s.length <= 12 && /^[0-9., -]*$/.test(s);
const equalField = (f, value) => f.kind === 'number' ? value.trim() !== '' && Number(value.trim().replace(',', '.')) === f.expected : value === f.expected;
export const labFieldPassed = equalField;
const answered = (step, a) => step.fields.every(f => equalField(f, a[f.key]));
export function receiveReport(receiver, request) {
  if (request.transport !== 'https') return { status: 426, receiver, message: 'Der Modellvertrag verlangt geschützten Transport.' };
  if (request.auth !== 'allowed') return { status: 401, receiver, message: 'Die synthetische Senderrolle ist nicht berechtigt.' };
  let data; try { data = JSON.parse(request.payload); } catch { return { status: 400, receiver, message: 'Ungültige JSON-Syntax; keine Übernahme.' }; }
  if (!exact(data, ['batchId', 'rows']) || typeof data.batchId !== 'string' || !/^[a-zA-Z0-9_-]{1,40}$/.test(data.batchId) || !Array.isArray(data.rows) || data.rows.length !== 2
    || !data.rows.every(r => exact(r, ['region', 'total']) && ['Nord', 'Süd'].includes(r.region) && Number.isInteger(r.total) && r.total >= 0 && r.total <= 1000000) || new Set(data.rows.map(r => r.region)).size !== 2) return { status: 422, receiver, message: 'Felder, Typen oder Werte passen nicht; die gesamte Lieferung bleibt unübernommen.' };
  const rows = [...data.rows].sort((a, b) => a.region.localeCompare(b.region, 'de')).map(r => ({ region: r.region, total: r.total }));
  const next = { batchId: data.batchId, rows };
  if (receiver) {
    if (receiver.batchId === data.batchId && JSON.stringify(receiver.rows) === JSON.stringify(rows)) return { status: 200, receiver, message: 'Identische Lieferung erkannt; kein zweiter Datensatz.' };
    return { status: 409, receiver, message: 'Konflikt: Dieser begrenzte Empfänger hat bereits eine Lieferung. Inhalt und Schlüssel bleiben unverändert.' };
  }
  return { status: 201, receiver: next, message: 'Beide Zeilen atomar übernommen.' };
}
export function replayReports(requests) {
  let receiver = null; const results = [];
  for (const request of requests) { const result = receiveReport(receiver, request); receiver = result.receiver; results.push(result); }
  return { receiver, results };
}
export function reportTestsPassed(requests) {
  const { receiver, results } = replayReports(requests);
  // Vier geforderte Fälle in dieser Reihenfolge, weitere Fehlproben dazwischen erlaubt.
  let found = 0;
  for (const [i, result] of results.entries()) {
    if (result.status !== [422, 201, 200, 409][found]) continue;
    // Der vierte Pflichtfall muss dieselbe Lieferung mit verändertem Inhalt sein.
    if (found === 3 && JSON.parse(requests[i].payload).batchId !== receiver?.batchId) continue;
    found++;
  }
  return found === 4 && receiver?.rows[0].region === 'Nord' && receiver.rows[0].total === 30 && receiver.rows[1].region === 'Süd' && receiver.rows[1].total === 5;
}
export function createLab(id) {
  if (!LAB_TOPICS.includes(id)) return null;
  return { stage: 0, answers: LAB_STEPS[id].map(step => Object.fromEntries(step.fields.map(f => [f.key, '']))), checked: false, done: false,
    ...(id === LAB_TOPICS[0] ? { source: CONTROL_START, testedSource: null, codePassed: false } : id === LAB_TOPICS[1] ? { payload: REPORT_START, auth: 'allowed', transport: 'https', requests: [] } : { index: 0, cases: [0, 1, 2].map(initialCase) }) };
}
function validCases(value) {
  if (!Number.isInteger(value.index) || value.index < 0 || value.index > 2 || !Array.isArray(value.cases) || value.cases.length !== 3) return false;
  if (!value.cases.every((c, i) => exact(c, Object.keys(initialCase(i))) && ['running', 'observed', 'checked', 'done'].every(k => typeof c[k] === 'boolean') && Object.entries(SERVICE_FIELDS).every(([k, values]) => values.includes(c[k]))
    && (c.observed && i <= value.index || Object.keys(c).every(k => c[k] === initialCase(i)[k])) && (i >= value.index || c.done)
    && (!c.done || c.observed && c.checked && c.diagnosis === ['dns', 'service', 'policy'][i] && probeService(c).passed))) return false;
  const first = value.cases.findIndex(c => !c.done);
  return value.index === (first < 0 ? 2 : first);
}
export function labStagePassed(id, v) { return v.stage !== 1 ? answered(LAB_STEPS[id][v.stage], v.answers[v.stage]) : id === LAB_TOPICS[0] ? v.codePassed : id === LAB_TOPICS[1] ? reportTestsPassed(v.requests) : v.cases.every(c => c.done); }
export function validLab(id, v) {
  const initial = createLab(id); if (!initial || !exact(v, Object.keys(initial)) || !Number.isInteger(v.stage) || v.stage < 0 || v.stage > 2 || typeof v.checked !== 'boolean' || typeof v.done !== 'boolean' || !Array.isArray(v.answers) || v.answers.length !== 3) return false;
  if (!v.answers.every((a, i) => exact(a, LAB_STEPS[id][i].fields.map(f => f.key)) && LAB_STEPS[id][i].fields.every(f => f.kind === 'number' ? numeric(a[f.key]) : typeof a[f.key] === 'string' && ['', ...f.options.map(([key]) => key)].includes(a[f.key])) && (i >= v.stage || answered(LAB_STEPS[id][i], a)) && (i <= v.stage || Object.values(a).every(value => value === '')))) return false;
  if (id === LAB_TOPICS[0] && (typeof v.source !== 'string' || v.source.length > 4096 || typeof v.codePassed !== 'boolean' || !(v.testedSource === null || typeof v.testedSource === 'string' && v.testedSource === v.source) || v.codePassed && v.testedSource !== v.source || v.stage === 0 && (v.source !== CONTROL_START || v.testedSource !== null || v.codePassed) || v.stage === 2 && !v.codePassed)) return false;
  if (id === LAB_TOPICS[1] && (typeof v.payload !== 'string' || v.payload.length > 4096 || !['allowed', 'denied'].includes(v.auth) || !['https', 'http'].includes(v.transport) || !Array.isArray(v.requests) || v.requests.length > 16
    || !v.requests.every(r => exact(r, ['payload', 'auth', 'transport']) && typeof r.payload === 'string' && r.payload.length <= 4096 && ['allowed', 'denied'].includes(r.auth) && ['https', 'http'].includes(r.transport))
    || v.stage === 0 && (v.payload !== REPORT_START || v.auth !== 'allowed' || v.transport !== 'https' || v.requests.length) || v.stage === 2 && !reportTestsPassed(v.requests))) return false;
  if (id === LAB_TOPICS[2] && (!validCases(v) || v.stage === 0 && v.cases.some(c => c.observed) || v.stage === 2 && !v.cases.every(c => c.done))) return false;
  return !v.done || v.stage === 2 && v.checked && labStagePassed(id, v);
}
export const labPassed = (id, v) => validLab(id, v) && v.done;
export const labStarted = (id, v) => validLab(id, v) && (v.stage > 0 || v.checked || v.done || v.answers.some(a => Object.values(a).some(s => s !== '')));
export function updateLab(id, value, action) {
  const fail = () => { throw new Error('Dieser Schritt passt nicht zum Lernlabor.'); };
  if (!validLab(id, value) || value.done || !object(action)) fail();
  const v = structuredClone(value); const step = LAB_STEPS[id][v.stage];
  if (action.type === 'answer') { const f = step.fields.find(f => f.key === action.field); if (!f || !(f.kind === 'number' ? numeric(action.value) : ['', ...f.options.map(([key]) => key)].includes(action.value))) fail(); v.answers[v.stage][f.key] = action.value; v.checked = false; }
  else if (action.type === 'check' && v.stage !== 1) v.checked = true;
  else if (action.type === 'code' && id === LAB_TOPICS[0] && v.stage === 1 && typeof action.value === 'string' && action.value.length <= 4096) { v.source = action.value; v.testedSource = null; v.codePassed = false; v.checked = false; }
  else if (action.type === 'code-result' && id === LAB_TOPICS[0] && v.stage === 1 && action.source === v.source && typeof action.passed === 'boolean') { v.testedSource = action.source; v.codePassed = action.passed; v.checked = true; }
  else if (action.type === 'request-edit' && id === LAB_TOPICS[1] && v.stage === 1) {
    if (action.field === 'payload' && typeof action.value === 'string' && action.value.length <= 4096 || action.field === 'auth' && ['allowed', 'denied'].includes(action.value) || action.field === 'transport' && ['https', 'http'].includes(action.value)) v[action.field] = action.value; else fail(); v.checked = false;
  } else if (action.type === 'send' && id === LAB_TOPICS[1] && v.stage === 1 && v.requests.length < 16) { v.requests.push({ payload: v.payload, auth: v.auth, transport: v.transport }); v.checked = reportTestsPassed(v.requests); }
  else if (action.type === 'reset-requests' && id === LAB_TOPICS[1] && v.stage === 1) { v.requests = []; v.checked = false; }
  else if (id === LAB_TOPICS[2] && v.stage === 1 && ['probe', 'configure', 'finish-case'].includes(action.type)) {
    const c = v.cases[v.index]; if (c.done) fail();
    if (action.type === 'probe') { c.observed = true; c.checked = true; }
    else if (action.type === 'configure' && c.observed) { if (action.field === 'running' && typeof action.value === 'boolean' || SERVICE_FIELDS[action.field]?.includes(action.value)) c[action.field] = action.value; else fail(); c.checked = false; }
    else if (action.type === 'finish-case' && c.checked && c.diagnosis === ['dns', 'service', 'policy'][v.index] && probeService(c).passed) { c.done = true; v.index = Math.min(2, v.index + 1); } else fail();
    v.checked = v.cases.every(c => c.done);
  } else if (action.type === 'next' && v.checked && labStagePassed(id, v)) { if (v.stage === 2) v.done = true; else { v.stage++; v.checked = false; } }
  else fail();
  if (!validLab(id, v)) fail(); return v;
}
