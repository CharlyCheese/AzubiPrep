import { chapter, refs } from './shared.js';
import { validateTopicsCode } from './ch24.js';

export const topicsFixture = '[{"id":"html","title":"HTML-Grundlagen","category":"Web"},{"id":"css","title":"CSS-Layout","category":"Web"},{"id":"dns","title":"DNS verstehen","category":"Netzwerk"}]';
export const catalogueSolution = `${validateTopicsCode}
const search = document.querySelector("#search");
const category = document.querySelector("#category");
const reload = document.querySelector("#reload");
const list = document.querySelector("#results");
const message = document.querySelector("#message");
let state = { status: "idle", items: [], error: "" };
let generation = 0;
function selectTopics(items, query, category) {
  const normalized = query.trim().toLowerCase();
  return items.filter(item => item.title.toLowerCase().includes(normalized)
    && (category === "all" || item.category === category));
}
function render() {
  list.replaceChildren();
  reload.disabled = state.status === "loading";
  if (state.status === "loading") { message.textContent = "Katalog wird geladen"; return; }
  if (state.status === "error") { message.textContent = state.error; return; }
  if (state.status === "idle") { message.textContent = "Bitte Katalog laden"; return; }
  const visible = selectTopics(state.items, search.value, category.value);
  message.textContent = state.items.length === 0 ? "Katalog ist leer" : visible.length === 0 ? "Keine passenden Treffer" : visible.length + " Treffer";
  for (const item of visible) {
    const li = document.createElement("li"); li.textContent = item.title + " · " + item.category; list.append(li);
  }
}
async function refresh(request) {
  const current = ++generation;
  state = { status: "loading", items: [], error: "" }; render();
  try {
    const response = await request("./topics.json");
    if (!response.ok) throw new Error("HTTP " + response.status);
    const items = await response.json();
    if (!validTopics(items)) throw new Error("Ungültiger Katalog");
    if (current !== generation) return;
    state = { status: "ready", items, error: "" };
  } catch {
    if (current !== generation) return;
    state = { status: "error", items: [], error: "Laden fehlgeschlagen. Bitte erneut laden." };
  }
  render();
}
search.addEventListener("input", render);
category.addEventListener("change", render);
// Der spätere kontrollierte Adapter liefert request; kein freies Netz hier freischalten.
// reload.addEventListener("click", () => refresh(request));
render();`;

export default chapter(25, 'Projekt 5: Lernkatalog mit Suche und Datenzuständen', 'Kapitel 24: kontrollierte Anfragen, Datenprüfung und Zustände.', 'Später: feste lokale API-Simulation mit gezielt steuerbaren Antworten.', refs.fetch, [
  {
    title: 'Katalog und Zustandsmatrix planen', goal: 'Datenquelle und Oberfläche unabhängig beschreiben.',
    explain: ['Baue einen Katalog aus title und category. Die Daten kommen ausschließlich aus der vorbereiteten lokalen Datei topics.json oder einem kontrollierten Testadapter. Das Projekt verlangt keinen öffentlichen Dienst und keine Zugangsdaten.', 'Die Suche arbeitet auf bereits geladenen Einträgen. Ein Katalog ohne Daten unterscheidet sich von einem Katalog, bei dem nur der Filter nichts findet. Beide sind erfolgreiche Zustände. Zeichne außerdem idle, loading und error.'],
    example: topicsFixture,
    task: 'Lege eine Seite mit beschriftetem Suchfeld #search, select#category (all, Web, Netzwerk), button#reload, ul#results und p#message role="status" an. Zeichne die fünf Zustände und schreibe die erwarteten Meldungen auf.',
    hints: ['Suche und Kategorie werden gemeinsam angewendet.', 'Leerquelle: "Katalog ist leer"; Filter ohne Treffer: "Keine passenden Treffer".'],
    solution: '<!doctype html>\n<html lang="de"><head><meta charset="utf-8"><title>Lernkatalog</title>\n<script src="app.js" defer></script></head><body><main><h1>Lernkatalog</h1>\n<label for="search">Titel suchen</label><input id="search" type="search">\n<label for="category">Kategorie</label><select id="category"><option value="all">Alle</option><option>Web</option><option>Netzwerk</option></select>\n<button id="reload" type="button">Katalog laden</button>\n<p id="message" role="status"></p><ul id="results"></ul>\n</main></body></html>',
    criteria: ['Alle Zustände mit Meldung und erlaubten Aktionen geplant.', 'JSON-Fixture öffentlich/erfunden; keine private Quelle benötigt.'],
  },
  {
    title: 'Suche und Kategorie als reine Auswahl', goal: 'Benutzereingaben normalisieren und Filter kombinieren.',
    explain: ['trim entfernt Rand-Leerraum; toLowerCase macht unseren einfachen Vergleich unabhängig von Groß-/Kleinschreibung. String.includes prüft eine enthaltene Zeichenfolge, keine Bedeutung und keine Volltextrelevanz. Das ist für den kleinen Lernkatalog bewusst ausreichend.', 'Ein leerer Suchtext passt auf jeden Titel. Kategorie all deaktiviert die Kategorieeinschränkung. Die Auswahlfunktion verändert weder Daten noch Felder; dadurch kannst du sie vor der DOM-Verknüpfung testen.'],
    example: '"CSS-Layout".toLowerCase().includes("css"); // true\n"HTML".includes(""); // true',
    task: 'Schreibe selectTopics(items, query, category). Prüfe " css "/all, ""/Web, "DNS"/Netzwerk und "css"/Netzwerk mit der Fixture. Gib keine Ergebnisse wegen eines falschen OR zwischen Suche und Kategorie frei.',
    hints: ['Beide Bedingungen müssen zutreffen.', 'category === "all" || item.category === category ist nur der zweite Teil des gesamten &&.'],
    solution: 'function selectTopics(items, query, category) {\n  const normalized = query.trim().toLowerCase();\n  return items.filter(item => item.title.toLowerCase().includes(normalized)\n    && (category === "all" || item.category === category));\n}',
    criteria: ['Erwartete IDs: css; html/css; dns; keine.', 'Originaldaten unverändert; Suche beschreibt Teilstringvergleich, keine KI-Suche.'],
  },
  {
    title: 'Laden und Darstellung verbinden', goal: 'Geprüfte Daten mit vorhandenen Filtern anzeigen.',
    explain: ['refresh lädt und prüft die komplette Quelle, render leitet mit den aktuellen Feldwerten die sichtbare Liste ab. Ändert sich ein Filter während des Ladens, benutzt die spätere Darstellung den dann aktuellen Filterwert.', 'Bei einem Fehler bleibt der erneute Ladeversuch bedienbar. HTML-artige Titel landen über textContent im li. Veraltete Antworten dürfen weder Ergebnisse noch Fehlermeldungen der aktuellen Anfrage überschreiben.'],
    example: 'search.addEventListener("input", render);\ncategory.addEventListener("change", render);\n// Laden über den festen Testadapter aus Kapitel 24.',
    task: 'Verbinde HTML, Fixture und Auswertung. Implementiere refresh(request) mit Generation, HTTP-/JSON-/Schema-Prüfung und sicheren Listeneinträgen. Leite keinen Erfolg aus dem bloßen Ende eines Promise ab.',
    hints: ['Ladezustand vor await, Ergebnisübernahme nach Generationsprüfung.', 'render leitet Treffer aus state.items, search.value und category.value ab.'],
    solution: catalogueSolution,
    criteria: ['Lade-, Treffer-, Leer- und Fehlerzustände korrekt dargestellt.', 'Filter während Laden und veraltete Antwort beeinflussen den neuesten Zustand nicht falsch.'],
  },
  {
    title: 'Abnahme mit kontrollierten Antworten', goal: 'Fehlerfälle ohne echten externen Dienst nachweisen.',
    explain: ['Eine Testfunktion kann wie die relevante Seite einer Response aussehen: ok, status und eine async-json-Methode. Sie erlaubt verlässlich HTTP-Fehler, kaputtes JSON und falsche Strukturen. Bei einem absichtlich geworfenen Fehler muss die Oberfläche noch bedienbar sein.', 'Übertrage die Auswahl danach auf einen Werkzeugkatalog. Behalte die Datenfelder bei und ändere nur Inhalte und Kategorien. Erkläre, welche Teile fachliche Auswahl und welche technische Darstellung sind.'],
    example: 'const ok = async () => ({ ok: true, status: 200, json: async () => [] });\nconst fail = async () => ({ ok: false, status: 503, json: async () => [] });\nconst broken = async () => ({ ok: true, status: 200, json: async () => { throw new Error("JSON"); } });',
    task: 'Teste Erfolg, [], 503, Anfrage-Ablehnung, kaputtes JSON, falsches Schema und A-langsam/B-schnell. Dokumentiere eine vollständige Tastaturbedienung und den Werkzeugkatalog als Transfer. Keine echten fremden Endpunkte erforderlich.',
    hints: ['Wiederhole nach jedem Fehler einmal erfolgreich.', 'Die Testantwort mit [] muss zum Leertext führen, nicht zum Fehlertext.'],
    solution: '// Prüferwartungen:\n// ok([]) -> ready, "Katalog ist leer"\n// ok(Fixture), Filter css/Web -> nur CSS-Layout\n// HTTP 503 / Ablehnung / JSON-Fehler / Schemafehler -> error, erneutes Laden möglich\n// A zuletzt fertig, aber zuerst gestartet -> B bleibt maßgeblich\n// HTML-artiger Titel -> Text, kein neues aktives Element\n// Referenzfunktionen und Oberfläche: vorherige Etappe.',
    criteria: ['Sieben Fehler-/Erfolgsfälle mit Soll/Ist und erfolgreicher Erholung.', 'Transfer ohne Hilfen erläutert; Browser-/Adapterabnahme weiterhin offen.'],
  },
]);
