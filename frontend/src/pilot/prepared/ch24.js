import { chapter, refs } from './shared.js';

export const validateTopicsCode = `function validTopics(value) {
  if (!Array.isArray(value) || value.length > 200) return false;
  const ids = [];
  return value.every(item => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return false;
    if (typeof item.id !== "string" || !item.id || ids.includes(item.id)) return false;
    if (typeof item.title !== "string" || !item.title.trim() || item.title.length > 80) return false;
    if (typeof item.category !== "string" || !item.category.trim() || item.category.length > 40) return false;
    ids.push(item.id); return true;
  });
}`;

export default chapter(24, 'Asynchrones JavaScript und kontrollierte Datenanfragen', 'Projekt 4 und Fehlerbehandlung.', 'Später: kontrollierte lokale Übungsdaten; kein freier Netz-/App-Zugriff aus Lerncode.', refs.async, [
  {
    title: 'Sofortige und spätere Ergebnisse', goal: 'Reihenfolge ohne blockierendes Warten vorhersagen.',
    explain: ['Manche Ergebnisse stehen erst später bereit. Ein Promise beschreibt einen laufenden Vorgang, der erfüllt oder abgelehnt werden kann. then registriert eine Reaktion; diese läuft auch bei einem schon erfüllten Promise erst nach dem aktuellen synchronen Code.', 'Asynchron bedeutet nicht automatisch parallele CPU-Ausführung. Eine lange synchrone Schleife blockiert trotzdem die Oberfläche. Unsere bisherigen direkten Funktionsprüfungen sind synchron; Promise-Aufgaben benötigen später ihre eigene geprüfte Laufzeit.'],
    example: 'console.log("A");\nPromise.resolve(4).then(value => console.log(value));\nconsole.log("B");\n// A, B, 4',
    task: 'Sage die Ausgabe von A/Promise/B schriftlich voraus. Schreibe danach eine Reaktion, die den erfüllten Wert 4 verdoppelt und 8 ausgibt. Ändere keinen globalen Ergebniswert, den du direkt danach synchron ausliest.',
    hints: ['Die spätere Reaktion steht in then.', 'Promise.resolve(4).then(value => console.log(value * 2));'],
    solution: 'console.log("A");\nPromise.resolve(4).then(value => console.log(value * 2));\nconsole.log("B");\n// Erwartet A, B, 8.',
    criteria: ['Reihenfolge richtig erklärt.', 'Ergebnis innerhalb der Reaktion verarbeitet; kein synchroner Scheinwert.'],
  },
  {
    title: 'Promise-Ketten und abgelehnte Vorgänge', goal: 'Ergebnisse und Fehler weiterreichen.',
    explain: ['then gibt ein neues Promise zurück. Der Rückgabewert des Handlers wird zum nächsten Ergebnis; ein geworfener Fehler oder ein zurückgegebenes abgelehntes Promise führt zum Fehlerweg. catch behandelt die Ablehnung.', 'Vergessenes return kann die Kette unbeabsichtigt mit undefined fortsetzen. Ein catch ohne erneuten Fehler oder bewussten Ersatzwert macht die Kette wieder erfüllt. Entscheide daher ausdrücklich, ob du einen Fehler anzeigen, weiterwerfen oder sinnvoll ersetzen willst.'],
    example: 'Promise.resolve(3)\n  .then(n => n * 2)\n  .then(n => console.log(n))\n  .catch(error => console.log(error.message));',
    task: 'Schreibe verdoppelnSpaeter(n), die ein Promise liefert. Für negative n soll sie mit Error("Negativer Wert") ablehnen, sonst mit n * 2 erfüllen. Teste 3 und -1 über then/catch.',
    hints: ['Für diese Übung sind Promise.resolve und Promise.reject ausreichend.', 'return n < 0 ? Promise.reject(new Error(...)) : Promise.resolve(n * 2);'],
    solution: 'function verdoppelnSpaeter(n) {\n  if (n < 0) return Promise.reject(new Error("Negativer Wert"));\n  return Promise.resolve(n * 2);\n}\nverdoppelnSpaeter(3).then(console.log).catch(error => console.log(error.message));\nverdoppelnSpaeter(-1).then(console.log).catch(error => console.log(error.message));',
    criteria: ['3 erfüllt mit 6; -1 abgelehnt mit erklärbarem Fehler.', 'Fehler wird behandelt, nicht stillschweigend zum scheinbaren Erfolg.'],
  },
  {
    title: 'async und await lesen', goal: 'Dieselben Abläufe mit klarer Fehlergrenze schreiben.',
    explain: ['Eine async-Funktion liefert immer ein Promise. await wartet innerhalb dieser Funktion auf dessen Ergebnis und gibt die Ausführung zwischendurch frei; es blockiert nicht den gesamten Browser. Eine Ablehnung verhält sich am await wie ein geworfener Fehler.', 'try/catch kann diesen Fehler behandeln. finally läuft beim Verlassen des try/catch, etwa zum Zurücksetzen eines Ladezustands. Ein return im finally würde frühere Ergebnisse oder Fehler überschreiben; verwende ihn hier nicht.'],
    example: 'async function zeige() {\n  try { const value = await Promise.resolve(6); console.log(value); }\n  catch (error) { console.log(error.message); }\n  finally { console.log("Fertig"); }\n}',
    task: 'Schreibe zeigeErgebnis(n) um verdoppelnSpaeter. Gib "Lädt", dann Ergebnis oder Fehlermeldung und abschließend "Fertig" aus. Rufe für einen Test immer nur eine Variante auf, damit Ausgaben zuordenbar sind.',
    hints: ['try enthält den await-Aufruf; catch den Fehlertext.', 'finally enthält nur die Abschlussmeldung.'],
    solution: 'async function zeigeErgebnis(n) {\n  console.log("Lädt");\n  try { console.log(await verdoppelnSpaeter(n)); }\n  catch (error) { console.log(error.message); }\n  finally { console.log("Fertig"); }\n}\nzeigeErgebnis(3);',
    criteria: ['Erfolgs- und Fehlerreihenfolge inklusive Abschluss stimmen.', 'Warum der Aufrufer ein Promise erhält erklären.'],
  },
  {
    title: 'HTTP-Antwort und Anwendungsdaten unterscheiden', goal: 'Status und JSON nicht miteinander verwechseln.', reference: refs.fetch,
    explain: ['HTTP besteht hier aus Anfrage und Antwort: Eine GET-Anfrage liest eine Ressource. Die Antwort enthält einen Status wie 200 oder 404, Header und einen Body. fetch erfüllt sein Promise auch bei HTTP-Fehlerstatus wie 404; response.ok prüft den Bereich 200–299.', 'await response.json() liest und parst den Body und kann selbst scheitern. Auch gültiges JSON kann fachlich falsch sein. Netzwerkfehler, HTTP-Fehler, JSON-Syntaxfehler und Schemaverstoß brauchen deshalb getrennte nachvollziehbare Prüfstellen.'],
    example: 'const response = await fetch("./topics.json");\nif (!response.ok) throw new Error("HTTP " + response.status);\nconst data = await response.json();\n// Danach Schema prüfen.',
    task: 'Schreibe async loadTopics(request), die request("./topics.json") aufruft, ok prüft und JSON zurückgibt. request ist eine übergebene Testfunktion; erst die spätere kontrollierte Browserintegration verwendet dort fetch.',
    hints: ['Die übergebene Funktion ermöglicht Tests ohne echtes Netz.', 'const response = await request(...); erst danach response.json().'],
    solution: 'async function loadTopics(request) {\n  const response = await request("./topics.json");\n  if (!response.ok) throw new Error("HTTP " + response.status);\n  return await response.json();\n}',
    criteria: ['ok:false wird vor JSON als Fehler behandelt.', 'Abgelehnte Anfrage und kaputtes JSON werden nicht als leere Erfolgsliste ausgegeben.'],
  },
  {
    title: 'Geladene Inhalte prüfen und sicher anzeigen', goal: 'Fremddaten vor der Darstellung begrenzen.', reference: refs.fetch,
    explain: ['Unser Katalog erwartet höchstens 200 Einträge mit eindeutiger nichtleerer String-ID. title ist ein String mit höchstens 80 Zeichen, category ein String mit höchstens 40 Zeichen; beide müssen nach trim mindestens ein Zeichen enthalten. Ein HTTP-200 und JSON.parse reichen nicht als Vertrauensnachweis. Die Anwendung darf unbekannte Daten erst nach der Schema-Prüfung als Katalog übernehmen.', 'Ein Titel ist weiterhin fremder Text, selbst wenn sein Typ string stimmt. Verwende textContent. Für dieses Übungsformat laden wir keine vom Datensatz bestimmten URLs, Bilder oder Skripte; damit bleibt die Datenfläche bewusst klein.'],
    example: '[{"id":"html","title":"HTML-Grundlagen","category":"Web"}]',
    task: 'Implementiere validTopics nach dem beschriebenen Schema. Erweitere loadTopics mit der Prüfung. Teste gültig, null, String statt Liste, doppelte IDs, leere Titel und 201 Einträge.',
    hints: ['Array.isArray zuerst; Feldtypen vor trim prüfen.', 'Nach dem JSON-Lesen: if (!validTopics(data)) throw new Error("Ungültige Katalogdaten");'],
    solution: validateTopicsCode + '\nasync function loadTopics(request) {\n  const response = await request("./topics.json");\n  if (!response.ok) throw new Error("HTTP " + response.status);\n  const data = await response.json();\n  if (!validTopics(data)) throw new Error("Ungültige Katalogdaten");\n  return data;\n}',
    criteria: ['Grenzen 80/81 Titelzeichen und 40/41 Kategoriezeichen sowie doppelte IDs geprüft; [] gültig.', 'HTML-artiger gültiger Titel wird später als Text dargestellt.'],
  },
  {
    title: 'Lade-, Leer- und Fehlerzustände darstellen', goal: 'Asynchrone Oberfläche ausdrücklich modellieren.',
    explain: ['Die Ansicht kennt mindestens idle, loading, ready und error. Eine erfolgreiche leere Liste ist ready mit null Treffern, kein Netzwerkfehler. Beim Laden darf der Auslöser deaktiviert werden; im Fehlerfall muss ein erneuter Versuch möglich bleiben.', 'finally eignet sich zum Wiederaktivieren einer Schaltfläche. Ersetze einen echten Fehler nicht durch []: Sonst kann die Oberfläche den Unterschied zwischen „keine Daten“ und „Laden gescheitert“ nicht erklären.'],
    example: 'let state = { status: "idle", items: [], error: "" };\nstate = { status: "loading", items: [], error: "" };\nrender(state);',
    task: 'Schreibe refresh(request), die loading setzt, loadTopics aufruft und bei Erfolg ready beziehungsweise bei Fehler error setzt. Die render-Funktion bleibt ein übergebener oder vorbereiteter Darstellungsbaustein.',
    hints: ['Daten und Fehlermeldung in jedem Zustandswechsel bewusst setzen.', 'try: ready; catch: error; finally: button.disabled = false.'],
    solution: 'async function refresh(request) {\n  button.disabled = true;\n  state = { status: "loading", items: [], error: "" }; render(state);\n  try { state = { status: "ready", items: await loadTopics(request), error: "" }; }\n  catch { state = { status: "error", items: [], error: "Katalog konnte nicht geladen werden. Bitte erneut versuchen." }; }\n  finally { button.disabled = false; render(state); }\n}',
    criteria: ['Laden sichtbar; [] erhält Leertext; Fehler erhält Wiederholungsmöglichkeit.', 'Button nach Erfolg und Fehler wieder bedienbar.'],
  },
  {
    title: 'Veraltete Antworten und Abbruch', goal: 'Die zuletzt gestartete Anfrage maßgeblich halten.', reference: refs.fetch,
    explain: ['Zwei Anfragen können in umgekehrter Reihenfolge fertig werden. Eine laufende Nummer kennzeichnet die aktuell gültige Anfrage. Vor jeder Zustandsübernahme prüfst du, ob die Nummer noch aktuell ist; das gilt auch im catch und finally.', 'AbortController liefert ein signal zum Abbrechen einer fetch-Anfrage. Abbruch spart Arbeit, die Versionsprüfung verhindert zusätzlich veraltete Übernahmen. Ein AbortError ist bei bewusstem Ersetzen keine Meldung „Server kaputt“. Ein Signal ist keine Berechtigung für zusätzliche Netzwerkziele.'],
    example: 'let generation = 0;\n// Pro Start: const current = ++generation;\n// Vor Übernahme: if (current !== generation) return;',
    task: 'Plane zwei Testanfragen A langsam und B schnell. Baue einen Zähler in refresh ein, sodass nur B übernommen wird. Ergänze beim späteren Browseranschluss einen Controller für das feste lokale Übungsziel.',
    hints: ['Die Prüfung muss nach await und auch im Fehlerweg stehen.', 'Nur die aktuelle Anfrage darf Ladeanzeige und Buttonzustand zurücksetzen.'],
    solution: 'let generation = 0;\nasync function refresh(request) {\n  const current = ++generation;\n  state = { status: "loading", items: [], error: "" }; render(state);\n  try {\n    const items = await loadTopics(request);\n    if (current !== generation) return;\n    state = { status: "ready", items, error: "" };\n  } catch {\n    if (current !== generation) return;\n    state = { status: "error", items: [], error: "Laden fehlgeschlagen" };\n  }\n  if (current === generation) render(state);\n}\n// Browseradapter später: controller.abort(); neuer AbortController();\n// request = url => fetch(url, { signal: controller.signal });',
    criteria: ['B bleibt sichtbar, wenn A später erfolgreich ist oder fehlschlägt.', 'Bewusster Abbruch und Fehler unterscheidbar; keine freie Netzwerkfreigabe.'],
  },
]);
