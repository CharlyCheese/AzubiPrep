import { chapter, refs } from './shared.js';
import { catalogueSolution, topicsFixture } from './ch25.js';
import { validateTopicsCode } from './ch24.js';

export const modularCatalogue = `// model.js
export function selectTopics(items, query, category) {
  const normalized = query.trim().toLowerCase();
  return items.filter(item => item.title.toLowerCase().includes(normalized)
    && (category === "all" || item.category === category));
}

// data.js
${validateTopicsCode}
export async function loadTopics(request) {
  const response = await request("./topics.json");
  if (!response.ok) throw new Error("HTTP " + response.status);
  const items = await response.json();
  if (!validTopics(items)) throw new Error("Ungültige Katalogdaten");
  return items;
}

// view.js
import { selectTopics } from "./model.js";
const list = document.querySelector("#results");
const message = document.querySelector("#message");
const reload = document.querySelector("#reload");
export function render(state, query, category) {
  list.replaceChildren(); reload.disabled = state.status === "loading";
  if (state.status === "loading") { message.textContent = "Katalog wird geladen"; return; }
  if (state.status === "error") { message.textContent = state.error; return; }
  if (state.status === "idle") { message.textContent = "Bitte Katalog laden"; return; }
  const visible = selectTopics(state.items, query, category);
  message.textContent = state.items.length === 0 ? "Katalog ist leer" : visible.length === 0 ? "Keine passenden Treffer" : visible.length + " Treffer";
  for (const item of visible) {
    const li = document.createElement("li"); li.textContent = item.title + " · " + item.category; list.append(li);
  }
}

// request.js: öffentliche feste Übungsdaten, kein Netz
const items = ${topicsFixture};
export async function request(url) {
  if (url !== "./topics.json") throw new Error("Unbekanntes Übungsziel");
  return { ok: true, status: 200, json: async () => items.map(item => ({ ...item })) };
}

// app.js
import { loadTopics } from "./data.js";
import { render } from "./view.js";
import { request } from "./request.js";
const search = document.querySelector("#search");
const category = document.querySelector("#category");
const reload = document.querySelector("#reload");
let state = { status: "idle", items: [], error: "" };
let generation = 0;
function draw() { render(state, search.value, category.value); }
async function refresh() {
  const current = ++generation;
  state = { status: "loading", items: [], error: "" }; draw();
  try {
    const items = await loadTopics(request);
    if (current !== generation) return;
    state = { status: "ready", items, error: "" };
  } catch {
    if (current !== generation) return;
    state = { status: "error", items: [], error: "Laden fehlgeschlagen. Erneut versuchen." };
  }
  draw();
}
search.addEventListener("input", draw); category.addEventListener("change", draw);
reload.addEventListener("click", refresh); draw();
// index.html aus Projekt 5; Skripteinbindung zu type="module" ändern:
// <script type="module" src="app.js"></script>
// Je Abschnitt eine eigene Datei. Für Fehlertests request.js durch die festen Testadapter ersetzen.
`;

export const brokenCatalogue = `const list = document.querySelector("#results");
const message = document.querySelector("#message");
const search = document.querySelector("#search");
const category = document.querySelector("#category");
const reload = document.querySelector("#reload");
let items = [];
function selectTopics(items, query, category) {
  return items.filter(item => item.title.includes(query) || item.category === category);
}
function render() {
  const visible = selectTopics(items, search.value, category.value);
  for (const item of visible) {
    const li = document.createElement("li"); li.innerHTML = item.title; list.append(li);
  }
  message.textContent = "Fertig";
}
async function refresh(request) {
  try { const response = await request("./topics.json"); items = await response.json(); }
  catch { items = []; }
  render();
}
search.addEventListener("input", render);
category.addEventListener("change", render);
// Testadapter später bereitstellen: reload.addEventListener("click", () => refresh(request));`;

export default chapter(28, 'Projekt 6: Qualitätsauftrag für eine fremde Anwendung', 'Kapitel 27: Tests, Bedienung, Sicherheit und Messung.', 'Fehlerhafte Referenz nur lesen, nicht ungeprüft ausführen; isolierter Browser folgt.', refs.tests, [
  {
    title: 'Fremden Code zunächst untersuchen', goal: 'Befunde von Vermutungen unterscheiden.',
    explain: ['Du erhältst einen fehlerhaften Lernkatalog. Verwende HTML und Fixture aus Projekt 5. Lies zuerst die Anforderung: Suche UND Kategorie, keine Duplikate, sichere Titel, richtige Daten-/Fehlerzustände und zuletzt gestartete Anfrage maßgeblich.', 'Führe absichtlich unsicheren Code nicht ungeprüft aus. Beginne mit statischem Review und reinen Auswahltests. Ein Befund nennt Fundstelle, reproduzierbaren Fall und Wirkung. Ein Stilwunsch ist kein Funktionsfehler.'],
    example: brokenCatalogue,
    task: 'Lege eine Befundliste mit mindestens sechs konkreten Problemen an. Ordne Sicherheits-, Funktions-, Bedien- und Diagnoseprobleme nach Wirkung. Die Beispieldaten bleiben: ' + topicsFixture,
    hints: ['Prüfe Filteroperator, Normalisierung, Listenleeren und Ausgabeweg.', 'Suche außerdem fehlende HTTP-/Schema-Prüfung, verschluckte Fehler und veraltete Antworten.'],
    solution: 'Befunde:\n1. OR statt AND mischt unpassende Kategorien ein.\n2. Keine trim/Lowercase-Normalisierung.\n3. Liste wird nie geleert: wiederholtes Rendern dupliziert.\n4. innerHTML interpretiert Titel als Markup.\n5. HTTP-Status und Schema ungeprüft.\n6. catch macht jeden Fehler zur scheinbar leeren Erfolgsliste.\n7. Keine Lade-/Leer-/Fehlermeldung.\n8. Späte alte Antwort kann neue Daten überschreiben.\nPriorität zuerst sichere Ausgabe und korrekte Daten, dann Zustands-/Bedienfehler.',
    criteria: ['Mindestens sechs überprüfbare Befunde mit Beispielen.', 'Keine privaten Daten und keine bloße Umformatierung als Fehlerbehebung.'],
  },
  {
    title: 'Fehler zuerst durch Nachweise sichtbar machen', goal: 'Eine Reparatur gegen Rückfälle absichern.',
    explain: ['Schreibe für jeden ausgewählten Befund den kleinsten Nachweis. Der OR-Fehler braucht einen passenden Suchtext in einer unpassenden Kategorie. Duplikate brauchen zwei Renderaufrufe. Der Ausgabeweg braucht einen HTML-artigen Titel und eine DOM-Prüfung.', 'Trenne Modelltest und spätere Browserabnahme. Ein reiner Filtertest beweist keine sichere DOM-Ausgabe. Ein Screenshot beweist wiederum nicht, dass ein alter HTTP-Fehler korrekt behandelt wird.'],
    example: 'items: [{ id:"x", title:"CSS", category:"Web" }]\nquery: "CSS", category: "Netzwerk"\nErwartet: []; der fehlerhafte OR-Filter liefert trotzdem den Eintrag.',
    task: 'Erstelle eine Matrix aus Befund, Eingabe/Ablauf und Erwartung. Implementiere mindestens drei reine Daten-/Fehlertests. Beschreibe DOM-, Tastatur- und A/B-Anfragefälle für die spätere isolierte Abnahme.',
    hints: ['Der Test soll vor der Reparatur tatsächlich einen falschen Wert entdecken.', 'Für den HTTP-Test darf response.json noch nicht benutzt werden, wenn ok false ist.'],
    solution: 'Matrix:\nFilter -> CSS/Netzwerk -> []\nNormalisierung -> " CSS "/all -> CSS\nRender zweimal -> gleiche Anzahl statt Verdopplung\nTitel <img...> -> nur Text, kein img\nHTTP 503 -> Fehler, kein Erfolg\nJSON null -> Schemafehler\nA langsam/B schnell -> B bleibt\nKorrektur nach Fehler -> erneutes Laden möglich\nReine Tests nach Muster Kapitel 27; UI-Fälle bis zur Integration ausdrücklich offen.',
    criteria: ['Mindestens drei Tests mit belastbarer Soll-Erwartung.', 'Für nicht ausführbare Browserfälle kein erfundener grüner Nachweis.'],
  },
  {
    title: 'In kleinen Schritten reparieren', goal: 'Fachliche Wirkung erhalten und Verantwortlichkeiten trennen.',
    explain: ['Repariere zuerst sichere Ausgabe und Auswahl, dann Zustände und Datenprüfung, anschließend die Generationsprüfung. Halte die vorhandene HTML-Schnittstelle stabil. Die Referenz aus Projekt 5 dient erst nach einem eigenen Versuch als Vergleich.', 'Nach jeder Änderung wiederhole den zugehörigen Nachweis und die bereits bestandenen Fälle. Eine vollständige Neufassung ohne Vergleich kann funktionierende Teile verlieren und macht Ursachen schwerer nachvollziehbar.'],
    example: 'Reihenfolge: Ausgabe/Filter -> Renderwiederholung -> Laden/Schema -> Meldungen -> veraltete Antworten.',
    task: 'Repariere den Katalog. Teile anschließend Modell, Datenprüfung und Darstellung wie Kapitel 26 auf. Behalte ursprüngliche Befunde und ergänze je eine kurze Ursachen-/Änderungsnotiz.',
    hints: ['Beginne mit textContent und list.replaceChildren.', 'Nutze die bekannte validTopics-Prüfung und eine Generation vor jeder asynchronen Übernahme.'],
    solution: 'Monolithischer Vergleichsstand vor der Aufteilung:\n' + catalogueSolution + '\n\nAufteilung, jeder Dateiname beginnt einen eigenen Abschnitt:\n' + modularCatalogue,
    criteria: ['Alle ausgewählten Befunde behoben; bestehende Filter-/Statusfälle erhalten.', 'Reparaturen nachvollziehbar, kein stillschweigender Zugriff auf echte APIs.'],
  },
  {
    title: 'Review und Übergabe begründen', goal: 'Eine fremde Reparatur verständlich bewertbar machen.',
    explain: ['Ein Reviewer braucht Problem, Trigger, Wirkung und Nachweis. Vermeide unprüfbare Sätze wie „sicher und schnell“. Benenne stattdessen den konkreten Ausgabeweg und die gemessene oder getestete Eigenschaft.', 'Übertrage einen Befund auf eine andere App: etwa eine Einkaufsliste, die nach jedem Rendern doppelte Einträge zeigt. Erkläre das zugrunde liegende Muster, ohne nur den Katalognamen zu ersetzen.'],
    example: 'Vorher: Zwei Renderaufrufe hängten dieselben Treffer erneut an.\nNachher: Der Container wird vor dem Neuaufbau geleert.\nNachweis: zwei identische Aufrufe, weiterhin genau drei li.',
    task: 'Gib reparierte Dateien, Tests, Befund-/Nachweismatrix und eine kurze Reviewbeschreibung ab. Nenne mindestens eine verbleibende Grenze und einen selbstständig erklärten Transferfall.',
    hints: ['Verknüpfe jeden wichtigen Satz mit einer beobachtbaren Änderung.', 'Noch offene Browser-/Werkzeugabnahmen bleiben sichtbar offen.'],
    solution: 'Reviewbeispiel:\nDer Katalog verband Suche und Kategorie mit OR und zeigte dadurch fachlich unpassende Treffer. Der reine Auswahlbaustein kombiniert beide Bedingungen jetzt mit AND und normalisiert den Text. Ein Gegenfall mit CSS/Netzwerk deckt den ursprünglichen Fehler ab.\nTitel werden als Text gesetzt, Listen vor Neuaufbau geleert und Ladefehler ausdrücklich angezeigt.\nGrenze: vollständige Browser-/Screenreader-Abnahme erst mit der isolierten Laufzeit.\nTransfer: Jede vollständig neu gerenderte Einkaufsliste braucht denselben kontrollierten Ersatz statt blindem Anhängen.',
    criteria: ['Alle Befunde mit repariert/offen und Nachweisstatus versehen.', 'Eigenes Verständnis und verbleibende Grenzen ehrlich beschrieben.'],
  },
]);
