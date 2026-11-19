// Begrenzte Lernmodelle: keine Dateien, Dienste, Shell oder echten Datenbanken.
export const PRACTICE_TOPICS = ['common-lf4-measures', 'common-lf5-testing', 'common-lf6-closure'];
export const CODE_START = 'function available(quantity, requested) {\n  // Ungültige Eingaben: null. Sonst: requested <= quantity.\n  return false;\n}\n';
const choice = (key, label, options, expected, explanation) => ({ key, label, options, expected, explanation });
export const SECURITY_STEPS = [
  { title: '1. Arbeitsbereich und Abhängigkeiten', text: 'Radblick bearbeitet Serviceanfragen mit Namen, Geschäftskontakt, Gerät und Fehlerbeschreibung im Ticketsystem. Erfasst wird dieser Arbeitsvorgang, nicht der ganze Betrieb.', fields: [
    choice('asset', 'Schutzobjekt', [['tickets', 'Ticketdaten und Ticketanwendung'], ['screen', 'Nur die Bildschirmhelligkeit'], ['logo', 'Das öffentliche Firmenlogo']], 'tickets', 'Serviceanfragen hängen von Daten und Anwendung ab.'),
    choice('dependency', 'Abhängigkeit', [['chain', 'Service → Ticketanwendung → Server, Netz, Client und Strom'], ['reverse', 'Strom → Firmenlogo → Bürofarbe'], ['none', 'Die Anwendung benötigt keine Infrastruktur']], 'chain', 'Ausfälle der Infrastruktur können auf den Arbeitsablauf wirken.'),
  ] },
  { title: '2. Schäden und Schutzbedarf', text: 'Vorgegebene Kriterien: normal = begrenzter, behebbarer Schaden; hoch = erheblicher Kunden- oder Betriebsschaden; sehr hoch = Existenz- oder Lebensgefahr. Offenlegung von Kundenstörungen verursacht hier erheblichen Vertrags-/Vertrauensschaden. Manipulierte Freigaben führen zu falschen Arbeiten und erheblicher Nacharbeit. Bei zwei Stunden Ausfall deckt ein dokumentierter Papierersatz vier Stunden ab: begrenzte Verzögerung. Existenz-/Lebensgefahr ist im Fall nicht gegeben.', fields: [
    choice('confidentiality', 'Vertraulichkeit', [['normal', 'Normal'], ['high', 'Hoch'], ['very-high', 'Sehr hoch']], 'high', 'Erheblicher Schaden durch Offenlegung begründet hier hohen Schutzbedarf.'),
    choice('confidentialityReason', 'Begründung der Vertraulichkeit', [['harm', 'Offengelegte Kundenstörungen verursachen erheblichen Vertrags- und Vertrauensschaden'], ['delay', 'Zwei Stunden Verzögerung werden durch Papierersatz überbrückt'], ['price', 'Der Bildschirm hat einen hohen Kaufpreis']], 'harm', 'Die Begründung muss den Schaden durch unbefugte Offenlegung beschreiben.'),
    choice('integrity', 'Integrität', [['normal', 'Normal'], ['high', 'Hoch'], ['very-high', 'Sehr hoch']], 'high', 'Falsche Freigaben verursachen im Fall erheblichen Schaden.'),
    choice('integrityReason', 'Begründung der Integrität', [['rework', 'Manipulierte Freigaben führen zu falschen Arbeiten und erheblicher Nacharbeit'], ['public', 'Das öffentliche Firmenlogo ist leicht auffindbar'], ['chance', 'Die Wahrscheinlichkeit eines Angriffs wird als niedrig vermutet']], 'rework', 'Integrität betrifft hier die Folgen unzulässig veränderter Freigaben.'),
    choice('availability', 'Verfügbarkeit', [['normal', 'Normal'], ['high', 'Hoch'], ['very-high', 'Sehr hoch']], 'normal', 'Der angenommene zweistündige Ausfall ist mit dem vierstündigen Ersatzablauf beherrschbar. Die Annahme gehört in die Dokumentation.'),
    choice('availabilityReason', 'Begründung der Verfügbarkeit', [['fallback', 'Der dokumentierte Ersatzablauf deckt den angenommenen Ausfall ab; es bleibt begrenzte Verzögerung'], ['secret', 'Die Ticketdaten enthalten vertrauliche Kundenstörungen'], ['free', 'Die Anwendung besitzt keine kostenpflichtige Lizenz']], 'fallback', 'Der konkrete Ersatzablauf begrenzt den Schaden der angenommenen Nichtverfügbarkeit.'),
    choice('basis', 'Grundlage der Einstufung', [['damage', 'Mögliche Schäden je Schutzziel; Annahmen dokumentieren'], ['chance', 'Nur die vermutete Angriffswahrscheinlichkeit'], ['cost', 'Nur der Kaufpreis des Rechners']], 'damage', 'Schutzbedarf richtet sich nach Schäden. Wahrscheinlichkeit wird bei der Risikobetrachtung gesondert behandelt.'),
  ] },
  { title: '3. Maßnahmen und Wirkung', text: 'Wähle ein Maßnahmenpaket für die festgestellten Schutzziele und eine Prüfung, die die beabsichtigte Wirkung tatsächlich beobachtet.', fields: [
    choice('measure', 'Maßnahmenpaket', [['roles', 'Rollenrechte, protokollierte Änderungen, getestete Wiederherstellung und Papierersatz'], ['shared', 'Gemeinsames Servicekonto, Änderungsnotizen und tägliche Sicherung ohne Wiederherstellungsprobe'], ['display', 'Rollenrechte, zusätzlicher Serviceclient und Sicherungskopien ohne geregelten Ersatzablauf']], 'roles', 'Zugriff, nachvollziehbare Änderungen und Wiederherstellung adressieren unterschiedliche Schutzziele.'),
    choice('test', 'Wirksamkeitsprüfung', [['evidence', 'Erlaubte/verweigerte Testzugriffe, synthetische Änderung, Rücksicherung und Ersatzablauf prüfen'], ['purchase', 'Rollenliste, Sicherungsprotokoll und Versionsstände mit den freigegebenen Einstellungen vergleichen'], ['icon', 'Mit dem Administratorkonto lesen und ändern; danach den erfolgreichen Sicherungsbericht kontrollieren']], 'evidence', 'Der Test braucht beobachtbare erlaubte und verweigerte Aktionen sowie eine geprüfte Wiederherstellung.'),
  ] },
  { title: '4. Verantwortung und Dokumentation', text: 'Die Azubi-Rolle dokumentiert den Befund und schlägt Maßnahmen vor. Änderungen brauchen die zuständigen betrieblichen Freigaben; offene Datenschutzfragen werden fachlich geklärt.', fields: [
    choice('owner', 'Freigabe und Umsetzung', [['approved', 'Serviceverantwortliche genehmigen den Bedarf; zuständige IT setzt freigegebene Maßnahmen um'], ['self', 'Azubi ändert sofort alle Rechte ohne Freigabe'], ['customer', 'Kunden erhalten Administrationsrechte zur Selbsthilfe']], 'approved', 'Bedarfsentscheidung, Freigabe und technische Umsetzung sind getrennte Zuständigkeiten.'),
    choice('record', 'Dokumentation', [['trace', 'Objekte, Abhängigkeiten, Schäden, Papierersatz-Annahme, Einstufungen, Verantwortliche und Prüfergebnisse'], ['rating', 'Nur die drei ausgewählten Schutzbedarfsstufen'], ['secret', 'Passwörter aller Testkonten im Protokoll']], 'trace', 'Die Begründung und ihre Annahmen müssen für eine spätere Überprüfung nachvollziehbar sein.'),
  ] },
];
export const SERVICE_STEPS = [
  { title: '1. Anfrage aufnehmen', text: '09:10: Eda meldet, dass sie und drei Kollegen seit 09:05 keine Versandaufträge absenden können. Lesen im Portal funktioniert. Abholung ist um 10:00, ein freigegebener Ersatzweg fehlt. Keine Zugangsdaten ins Ticket aufnehmen.', fields: [
    choice('intake', 'Ticketaufnahme', [['facts', 'Vier Betroffene, Beginn 09:05, Senden gestört, Lesen möglich, Abholung 10:00, kein Ersatzweg'], ['guess', 'Server defekt; Ursache schon als gesichert eintragen'], ['password', 'Passwörter sammeln und ins Ticket kopieren']], 'facts', 'Beobachtete Symptome, Zeitpunkt, Auswirkung und bisherige Möglichkeiten erfassen; Ursache noch offen.'),
  ] },
  { title: '2. Priorität und Vereinbarung', text: 'Erfundene Übungsregeln: hohe Auswirkung ab drei blockierten Personen; hohe Dringlichkeit bei Frist innerhalb 60 Minuten ohne Ersatzweg. Beides hoch → P1, ein Wert hoch → P2, sonst P3. SLA Montag bis Freitag 08–17 Uhr: Portal/Client enthalten, erste qualifizierte Reaktion P1 binnen 15, P2 binnen 60, P3 binnen 240 Serviceminuten. Heute ist ein gewöhnlicher Montag.', fields: [
    choice('priority', 'Priorität', [['p1', 'P1'], ['p2', 'P2'], ['p3', 'P3']], 'p1', 'Vier blockierte Personen und weniger als eine Stunde bis zur Abholung ergeben nach dieser Matrix P1.'),
    choice('response', 'Zugesagter nächster Zeitpunkt', [['0925', 'Erste qualifizierte Reaktion bis 09:25'], ['1000', 'Problem garantiert bis 10:00 behoben'], ['1310', 'Erste Reaktion bis 13:10']], '0925', '15 Serviceminuten nach Aufnahme um 09:10 sind 09:25. Eine Lösungsfrist ist hier nicht zugesagt.'),
  ] },
  { title: '3. Vermutung prüfen', text: 'Freigegebene Konfiguration 7 nutzt /orders/v2. Betroffene Clients mit Version 6 rufen /orders/v1 auf und erhalten HTTP 404. Ein Kontrollclient mit Version 7 sendet erfolgreich. Die Versionsabweichung ist ein konkreter Prüfhinweis.', fields: [
    choice('diagnosis', 'Nächster begründeter Schritt', [['compare', 'Konfiguration und Zielpfad vergleichen; veralteten Endpunkt als Hypothese kontrolliert testen'], ['network', 'Ohne weiteren Test alle Netzwerkkabel tauschen'], ['proof', 'Aus HTTP 404 einen Stromausfall als bewiesen eintragen']], 'compare', 'Ein Vergleich trennt die beobachteten Antworten von der noch zu bestätigenden Ursache.'),
    choice('level', 'Zuständigkeit', [['l2', 'An Sam im zuständigen Level 2 mit Befunden eskalieren'], ['user', 'Betroffenen uneingeschränkte Adminrechte geben'], ['close', 'Ticket ohne weiteren Nachweis schließen']], 'l2', 'Sam darf die freigegebene Konfiguration ändern; die Azubi-Rolle liefert die nachvollziehbaren Befunde.'),
  ] },
  { title: '4. Lösung abstimmen', text: 'Sam hat die Freigabe für Konfiguration 7. Version 6 wird vor der Änderung als Rückfallstand gesichert. Die Rückkehr zu Version 6 wäre kein Nachweis der Fehlerbehebung, sondern begrenzt neue Nebenwirkungen und verlangt erneute Eskalation.', fields: [
    choice('change', 'Abgestimmtes Vorgehen', [['controlled', 'Änderung erklären, Freigabe prüfen, Version 6 sichern und Version 7 kontrolliert anwenden'], ['all', 'Alle Systeme ohne Sicherung gleichzeitig neu installieren'], ['hide', 'Ohne Rückmeldung Konten löschen']], 'controlled', 'Freigabe, begrenzter Eingriff und Rückfallmöglichkeit gehören zusammen.'),
    choice('english', 'Kurze englische Rückmeldung', [['update', 'We found a configuration mismatch. We will apply the approved update and test sending with you.'], ['closed', 'The issue is closed. No test is needed.'], ['password', 'Please send all passwords in this ticket.']], 'update', 'Die Nachricht erklärt Befund, freigegebenes Vorgehen und gemeinsame Kontrolle ohne voreiligen Abschluss.'),
  ] },
  { title: '5. Wirkung prüfen', text: 'Nach dem Update sendet Eda im Modell einen synthetischen Auftrag. Der Empfänger bestätigt den Eingang; Lesen funktioniert weiterhin. Es werden keine echten Aufträge versendet.', fields: [
    choice('verify', 'Abnahme', [['joint', 'Ursprüngliche Sendefunktion mit Eda prüfen, Empfängereingang und Lesen kontrollieren'], ['version', 'Nur die neue Versionsnummer ablesen'], ['silence', 'Fehlende neue Beschwerden als erfolgreiche Prüfung werten']], 'joint', 'Ein Update allein belegt noch keine funktionierende Arbeit. Die ursprüngliche Aufgabe muss wieder gelingen.'),
  ] },
  { title: '6. Abschluss und Verbesserung', text: 'Die kontrollierte Änderung und Funktionsprobe bestätigen im Modell den veralteten Endpunkt als Ursache. Die Prüfung weiterer Clients wird als Folgeaufgabe mit Zuständigkeit geführt.', fields: [
    choice('closure', 'Abschlussprotokoll', [['record', 'Ursache, Version 6→7, Freigabe, erfolgreiche Sendung/Bestätigung und zuständige Person für weitere Clients dokumentieren'], ['done', 'Nur „erledigt“ eintragen'], ['blame', 'Schuldzuweisung statt Befunde protokollieren']], 'record', 'Der nächste Bearbeitende benötigt Ursache, Änderung, Ergebnis und offene Punkte.'),
    choice('improve', 'Konkrete Verbesserung', [['rollout', 'Konfigurationsstand beim Rollout prüfen und Sendetest in die Abnahme aufnehmen'], ['reboot', 'Künftig jede Anfrage zuerst durch Neustart abschließen'], ['less', 'Fehlermeldungen nicht mehr dokumentieren']], 'rollout', 'Die Verbesserung setzt an der belegten Versionsabweichung und dem fehlenden Funktionsnachweis an.'),
  ] },
];

const SQL_OPERATION = [['select', 'SELECT – lesen'], ['insert', 'INSERT – hinzufügen'], ['update', 'UPDATE – ändern'], ['delete', 'DELETE – entfernen']];
const SQL_TARGET = [['low', 'quantity < 3'], ['id2', 'id = 2'], ['id3', 'id = 3'], ['all', 'Alle Datensätze']];
export const DATA_STEPS = [
  { title: '1. Bestand lesen', text: 'Lies alle Artikel mit quantity < 3, nach name aufsteigend sortiert. Die Tabelle stocks enthält id (Primärschlüssel), name und quantity. Dieser geführte Baukasten führt genau die dargestellten vier Übungsoperationen aus; er ist kein allgemeiner SQL-Editor.', fields: [
    choice('operation', 'SQL-Operation', SQL_OPERATION, 'select', 'Eine Abfrage liest Daten, ohne den Bestand zu ändern.'),
    choice('target', 'Auswahlbedingung', SQL_TARGET, 'low', 'Gesucht sind die Artikel mit weniger als drei Stück.'),
    choice('sort', 'Sortierung', [['name', 'name aufsteigend'], ['id', 'id aufsteigend']], 'name', 'ORDER BY name ordnet die Ergebnismenge nach dem Artikelnamen.'),
  ] },
  { title: '2. Datensatz einfügen', text: 'Füge id 4, name Tastatur, quantity 5 hinzu. Die neue id darf noch nicht belegt sein. Vor jeder Änderung zeigt „Auswahl ansehen“ die betroffenen Daten.', fields: [
    choice('operation', 'SQL-Operation', SQL_OPERATION, 'insert', 'INSERT legt einen neuen Datensatz an.'),
    choice('id', 'Neue ID', [['4', '4'], ['2', '2']], '4', 'ID 2 ist schon belegt; ein Primärschlüssel muss eindeutig sein.'),
    choice('quantity', 'Neue Stückzahl', [['5', '5'], ['0', '0'], ['6', '6']], '5', 'Der Auftrag verlangt fünf Tastaturen. Der Name ist hier fest vorgegeben.'),
  ] },
  { title: '3. Gezielt ändern', text: 'Erhöhe den Bestand der Maus (id = 2) auf quantity = 6. Prüfe vor der Ausführung, welche Zeile ausgewählt wird.', fields: [
    choice('operation', 'SQL-Operation', SQL_OPERATION, 'update', 'UPDATE ändert die Werte vorhandener Datensätze.'),
    choice('target', 'Auswahlbedingung', SQL_TARGET, 'id2', 'Nur die Maus mit ID 2 gehört zum Auftrag.'),
    choice('quantity', 'Neue Stückzahl', [['6', '6'], ['5', '5'], ['0', '0']], '6', 'Der neue absolute Wert lautet sechs, nicht plus sechs.'),
  ] },
  { title: '4. Gezielt entfernen', text: 'Entferne den ausgelisteten Adapter (id = 3). Die ursprünglichen Zeilen und die bisherigen Änderungen bleiben unten nachvollziehbar.', fields: [
    choice('operation', 'SQL-Operation', SQL_OPERATION, 'delete', 'DELETE entfernt ausgewählte Datensätze.'),
    choice('target', 'Auswahlbedingung', SQL_TARGET, 'id3', 'Die Bedingung id = 3 begrenzt die Löschung auf den Adapter.'),
  ] },
  { title: '5. Bestandsfunktion ändern und testen', text: 'Implementiere available(quantity, requested). Sind beide Werte ganze Zahlen von 0 bis 1000, gib requested <= quantity zurück (boolean). Sonst gib null zurück. Null bedeutet ungültige Eingabe; false bedeutet gültige Anfrage, aber zu wenig Bestand. Auch eine Anfrage von null Stück ist gültig. Die Ausführung erfolgt nur in der begrenzten Kurslaufzeit.', fields: [] },
];
export function practiceSteps(topicId) { return topicId === PRACTICE_TOPICS[0] ? SECURITY_STEPS : topicId === PRACTICE_TOPICS[1] ? DATA_STEPS : topicId === PRACTICE_TOPICS[2] ? SERVICE_STEPS : null; }
export function createPractice(topicId) {
  const steps = practiceSteps(topicId);
  if (!steps) return null;
  return { step: 0, answers: steps.map(s => Object.fromEntries(s.fields.map(f => [f.key, '']))), checked: false, done: false,
    ...(topicId === PRACTICE_TOPICS[1] ? { previewed: false, code: CODE_START, codePassed: false, testedCode: null } : {}) };
}
const isObject = v => v && typeof v === 'object' && !Array.isArray(v) && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const exact = (v, keys) => isObject(v) && Object.keys(v).length === keys.length && Object.keys(v).every(k => keys.includes(k));
const matches = (step, answers) => step.fields.every(f => answers[f.key] === f.expected);
export function validPractice(topicId, value) {
  const initial = createPractice(topicId); const steps = practiceSteps(topicId);
  if (!initial || !exact(value, Object.keys(initial)) || !Number.isInteger(value.step) || value.step < 0 || value.step >= steps.length
    || typeof value.checked !== 'boolean' || typeof value.done !== 'boolean' || !Array.isArray(value.answers) || value.answers.length !== steps.length) return false;
  if (!value.answers.every((a, i) => exact(a, steps[i].fields.map(f => f.key))
    && steps[i].fields.every(f => typeof a[f.key] === 'string' && (a[f.key] === '' || f.options.some(([v]) => v === a[f.key])))
    && (i >= value.step || matches(steps[i], a)) && (i <= value.step || steps[i].fields.every(f => a[f.key] === '')))) return false;
  const data = topicId === PRACTICE_TOPICS[1];
  if (data && (typeof value.previewed !== 'boolean' || typeof value.codePassed !== 'boolean' || typeof value.code !== 'string' || value.code.length > 4096
    || (value.step < 4 && (value.code !== CODE_START || value.codePassed)) || (value.step === 4 && value.previewed)
    || (value.step < 4 && value.testedCode !== null) || (value.step === 4 && (value.checked ? value.testedCode !== value.code : value.testedCode !== null))
    || (value.codePassed && !value.checked) || (value.step < 4 && value.checked && !value.previewed))) return false;
  return !value.done || (value.step === steps.length - 1 && value.checked && (data ? value.codePassed : matches(steps[value.step], value.answers[value.step])));
}
export function practicePassed(topicId, value) { return validPractice(topicId, value) && value.done; }
export function practiceStarted(topicId, value) {
  return validPractice(topicId, value) && (value.step > 0 || value.checked || value.done || value.answers.some(answer => Object.values(answer).some(text => text !== '')) || value.previewed === true || (topicId === PRACTICE_TOPICS[1] && value.code !== CODE_START));
}
export function practiceFeedback(topicId, value) {
  const steps = practiceSteps(topicId); const step = steps[value.step];
  return step.fields.map(f => ({ label: f.label, passed: value.answers[value.step][f.key] === f.expected, text: f.explanation }));
}
export function updatePractice(topicId, value, action) {
  const fail = () => { throw new Error('Dieser Schritt passt nicht zur praktischen Übung.'); };
  if (!validPractice(topicId, value) || value.done || !action || typeof action !== 'object') fail();
  const next = structuredClone(value); const step = practiceSteps(topicId)[value.step]; const data = topicId === PRACTICE_TOPICS[1];
  if (action.type === 'answer') {
    const field = step.fields.find(f => f.key === action.field);
    if (!field || !['', ...field.options.map(([v]) => v)].includes(action.value)) fail();
    next.answers[value.step][action.field] = action.value; next.checked = false;
    if (data) next.previewed = false;
  } else if (action.type === 'preview' && data && value.step < 4) next.previewed = true;
  else if (action.type === 'check' && !(data && value.step === 4)) {
    if (data && !value.previewed) fail();
    next.checked = true;
  } else if (action.type === 'code' && data && value.step === 4 && typeof action.value === 'string' && action.value.length <= 4096) {
    next.code = action.value; next.checked = false; next.codePassed = false; next.testedCode = null;
  } else if (action.type === 'code-result' && data && value.step === 4 && action.source === value.code && typeof action.passed === 'boolean') {
    next.checked = true; next.codePassed = action.passed; next.testedCode = action.source;
  } else if (action.type === 'next' && value.checked && (data && value.step === 4 ? value.codePassed : matches(step, value.answers[value.step]))) {
    if (value.step === practiceSteps(topicId).length - 1) next.done = true;
    else { next.step++; next.checked = false; if (data) next.previewed = false; }
  } else fail();
  if (!validPractice(topicId, next)) fail();
  return next;
}

export const initialStock = () => [{ id: 1, name: 'Kabel', quantity: 8 }, { id: 2, name: 'Maus', quantity: 2 }, { id: 3, name: 'Adapter', quantity: 0 }];
const targets = { low: row => row.quantity < 3, id2: row => row.id === 2, id3: row => row.id === 3, all: () => true };
const conditions = { low: 'quantity < 3', id2: 'id = 2', id3: 'id = 3', all: '1 = 1' };
export function dataCommand(step, answer) {
  // All fragments come from fixed enums; never parse or execute arbitrary SQL.
  if (!DATA_STEPS[step] || step > 3 || DATA_STEPS[step].fields.some(f => !f.options.some(([v]) => v === answer[f.key]))) return null;
  const condition = conditions[answer.target] || '1 = 1';
  if (answer.operation === 'select') return `SELECT id, name, quantity FROM stocks WHERE ${condition} ORDER BY ${answer.sort || 'id'};`;
  if (answer.operation === 'insert') return `INSERT INTO stocks (id, name, quantity) VALUES (${answer.id || 4}, 'Tastatur', ${answer.quantity || 5});`;
  if (answer.operation === 'update') return `UPDATE stocks SET quantity = ${answer.quantity || 6} WHERE ${condition};`;
  return `DELETE FROM stocks WHERE ${condition};`;
}
export function applyDataCommand(rows, step, answer) {
  if (!dataCommand(step, answer)) return { error: 'Wähle zuerst alle Felder.', rows, affected: [] };
  const affected = rows.filter(targets[answer.target] || (() => true)).map(row => ({ ...row }));
  if (answer.operation === 'select') return { rows, affected: affected.sort((a, b) => answer.sort === 'name' ? a.name.localeCompare(b.name, 'de') : a.id - b.id) };
  if (answer.operation === 'insert') {
    const added = { id: Number(answer.id || 4), name: 'Tastatur', quantity: Number(answer.quantity || 5) };
    if (rows.some(row => row.id === added.id)) return { rows, affected: [], error: 'Primärschlüssel bereits belegt; keine Zeile eingefügt.' };
    return { rows: [...rows.map(row => ({ ...row })), added], affected: [added] };
  }
  const ids = new Set(affected.map(row => row.id));
  if (answer.operation === 'update') return { rows: rows.map(row => ids.has(row.id) ? { ...row, quantity: Number(answer.quantity || 6) } : { ...row }), affected };
  return { rows: rows.filter(row => !ids.has(row.id)).map(row => ({ ...row })), affected };
}
export function stockBefore(value) {
  let rows = initialStock();
  for (let i = 0; i < Math.min(value.step, 4); i++) rows = applyDataCommand(rows, i, value.answers[i]).rows;
  return rows;
}
