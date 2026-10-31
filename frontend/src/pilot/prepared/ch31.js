import { chapter, refs } from './shared.js';
import { reactPlanner } from './ch30.js';
import { topicsFixture } from './ch25.js';

export const portalExtra = `type Topic = { id: string; title: string; category: string };
const TOPICS: Topic[] = ${topicsFixture};
type CatalogState = { status: "loading" } | { status: "ready"; items: Topic[] } | { status: "error"; error: string };
async function requestTopics(fail: boolean): Promise<Topic[]> {
  // Kontrollierter lokaler Adapter; eine echte Datenquelle später separat prüfen.
  if (fail) throw new Error("Vorbereiteter Übungsfehler");
  return TOPICS.map(topic => ({ ...topic }));
}
function Catalog() {
  const [state, setState] = useState<CatalogState>({ status: "loading" });
  const [query, setQuery] = useState(""); const [category, setCategory] = useState("all");
  const [attempt, setAttempt] = useState(0); const [fail, setFail] = useState(false);
  useEffect(() => {
    let active = true; setState({ status: "loading" });
    async function run() {
      try { const items = await requestTopics(fail); if (active) setState({ status: "ready", items }); }
      catch { if (active) setState({ status: "error", error: "Katalog nicht verfügbar. Erneut versuchen." }); }
    }
    void run(); return () => { active = false; };
  }, [attempt, fail]);
  const visible = state.status === "ready" ? state.items.filter(item => item.title.toLowerCase().includes(query.trim().toLowerCase())
    && (category === "all" || item.category === category)) : [];
  return <><RouteHeading title="Lernkatalog" />
    <label htmlFor="catalog-search">Titel suchen</label><input id="catalog-search" value={query} onChange={event => setQuery(event.target.value)} />
    <label htmlFor="category">Kategorie</label><select id="category" value={category} onChange={event => setCategory(event.target.value)}><option value="all">Alle</option><option>Web</option><option>Netzwerk</option></select>
    <label><input type="checkbox" checked={fail} onChange={event => setFail(event.target.checked)} />Vorbereiteten Ladefehler testen</label>
    <button type="button" onClick={() => setAttempt(previous => previous + 1)}>Erneut laden</button>
    <p role="status">{state.status === "loading" ? "Katalog wird geladen" : state.status === "error" ? state.error : visible.length + " Treffer"}</p>
    {state.status === "ready" && visible.length === 0 ? <p>Keine passenden Themen</p> : null}
    <ul>{visible.map(item => <li key={item.id}>{item.title} · {item.category}</li>)}</ul>
  </>;
}`;

export const portalSolution = reactPlanner
  .replace('function Planner() {', `${portalExtra}\nfunction Planner() {`)
  .replace('<nav><Link to="/">Lernplan</Link></nav>', '<nav><Link to="/">Lernplan</Link> <Link to="/catalog">Lernkatalog</Link></nav>')
  .replace('<Route path="/tasks/:id"', '<Route path="/catalog" element={<Catalog />} />\n      <Route path="/tasks/:id"');

export default chapter(31, 'Abschlussprojekt: ein eigenständiges Lernportal', 'Kapitel 30 sowie sämtliche Projekt-/Qualitätskompetenzen.', 'Eigenes Projekt mit geprüfter Werkzeugvorlage; Veröffentlichung nur bewusst nach der Abnahme.', refs.react, [
  {
    title: 'Auftrag und eigenen Umfang festlegen', goal: 'Eine umsetzbare Produktanforderung formulieren.',
    explain: ['Entwickle ein Lernportal mit zwei Bereichen: persönlicher Lernplan und durchsuchbarer Themenkatalog. Der Plan braucht Anlegen, Erledigen, Entfernen, offene Minuten, Sicherung und Detailroute. Der Katalog braucht lokale asynchrone Daten, Suche/Kategorie sowie Lade-, Leer- und Fehlerzustände.', 'Wähle eigene erfundene Inhalte und Gestaltung. Kein Login, keine privaten Unterrichtsunterlagen und kein echter Cloudservice sind nötig. Schreibe Mussziele und freiwillige Erweiterungen getrennt auf; ein kleines sauber erklärtes Projekt ist eine belastbare Abschlussleistung.'],
    example: 'Nutzerziel: Ich plane Lernziele und finde passende öffentliche Beispielthemen.\nMuss: Datenaktionen, Sicherung, Filter, Detailroute, Fehlerwege, responsive Tastaturbedienung.\nOptional: eigene Tags oder zusätzliche Sortierung.',
    task: 'Erstelle eine eigene Auftragsseite mit Nutzerziel, Datenmodellen, mindestens zehn Abnahmekriterien und bewusstem Nichtumfang. Schätze die Etappen ohne feste Zeitvorgabe. Noch keinen Referenzcode ansehen.',
    hints: ['Jedes Mussziel braucht einen konkreten beobachtbaren Prüffall.', 'Formuliere etwa: "Nach Reload bleibt die erledigte Aufgabe erhalten" statt "Speicherung funktioniert".'],
    solution: 'Musterauftrag:\nTask: id/title/minutes/done, höchstens 200; Topic: id/title/category.\n1. Gültige Aufgabe anlegen. 2. Ungültige Eingabe korrigierbar. 3. Gleiche Titel getrennt.\n4. Erledigen aktualisiert Minuten. 5. Löschen erhält Fokus. 6. Reload erhält Daten.\n7. Kaputter Altstand unangetastet. 8. Katalogfilter kombinierbar.\n9. Lade-/Leer-/Fehlerzustände plus Erholung. 10. Unbekannte Route/ID verständlich.\n11. Tastatur/Zoom/mobile Breite. 12. Keine aktiven HTML-Titel oder privaten Daten.\nNichtumfang: Anmeldung, Cloudsync, echte Fremddienste und PDF-Verteilung.',
    criteria: ['Eigene konkrete Spezifikation mit mindestens zehn prüfbaren Kriterien.', 'Freiwillige Erweiterungen verdrängen keine Kernanforderung.'],
  },
  {
    title: 'Datenfluss, Komponenten und Meilensteine planen', goal: 'Den Auftrag in kleine lieferbare Schritte zerlegen.',
    explain: ['Zeichne Zustand und Komponenten: gemeinsame Plan-Daten im Elternteil, Formulareingaben lokal im Formular, Katalog-Ladezustand in der Katalogseite. Modellfunktionen bleiben unabhängig von React und Browser.', 'Plane vertikale Etappen mit jeweils sichtbarem Ergebnis: statische Ansicht, Datenaktionen, Sicherung, Katalog, Routing, Qualitätsrunde. Testfälle und kleine Commits begleiten jede Etappe. Verschiebe keine unerklärten Werkzeuge in die Mitte der Umsetzung.'],
    example: 'src/model.ts, validation.ts, storage.ts, App.tsx\nsrc/components/TaskForm.tsx, TaskList.tsx\nsrc/pages/Plan.tsx, Detail.tsx, Catalog.tsx\nmodel.test.mjs bzw. TS-Testweg der geprüften Vorlage',
    task: 'Erstelle Komponenten-/Abhängigkeitsplan und mindestens sechs Meilensteine mit jeweils Fertigkriterium. Bestimme den Ort des Zustands und die Fehlergrenze für Laden/Speichern.',
    hints: ['Suche und offene Minuten sind abgeleitete Werte, keine zusätzliche synchronisierte Datenbank.', 'Ein Meilenstein endet mit einem überprüfbaren Ablauf, nicht mit "weiter programmieren".'],
    solution: '1. Responsive semantische Ansichten ohne Logik.\n2. Reines Modell plus Grenztests.\n3. Formular/Aktionen mit Fokus.\n4. Validierte Sicherung und Fehlerfälle.\n5. Katalog mit kontrolliertem asynchronem Adapter und Filtern.\n6. Routing inklusive unbekannter Ziele, Titel/Fokus.\n7. Typprüfung/Tests/Build und manuelle Qualitätsrunde.\n8. README, Artefaktprüfung und bewusste Veröffentlichung oder lokale Übergabe.',
    criteria: ['Zuständigkeiten und Fehlerwege eindeutig.', 'Jeder Schritt mit eigenem Nachweis und ohne neue unangekündigte Pflichttechnik.'],
  },
  {
    title: 'Selbstständig implementieren und Entscheidungen erklären', goal: 'Bekannte Kompetenzen ohne exakte Schrittvorlage verbinden.',
    explain: ['Arbeite nach deinem eigenen Plan. Nutze die bisherigen Lektionen gezielt als Nachschlagehilfe, statt das Abschlussprojekt als eine große Kopieraufgabe zu behandeln. Halte fest, bei welchen Problemen du Hilfe benötigt hast und was du daraus verstanden hast.', 'Die optionale Referenz erweitert den React-Lernplan um einen lokalen asynchronen Katalog. Sie nutzt bewusst erfundene feste Daten; der sichtbare Fehler-Schalter erlaubt einen wiederholbaren Fehlerfall ohne Netz. Eine echte Datenquelle würde weiterhin HTTP-/Schema-Prüfung benötigen.'],
    example: 'Entscheidungsnotiz: "Der Katalog hält seinen Ladezustand selbst. Die Plan-Daten bleiben beim Routenwechsel im Elternteil erhalten."',
    task: 'Setze die Mussziele um. Notiere mindestens drei eigene Entscheidungen und einen selbst gelösten Fehler mit Auslöser, Hypothese und Nachweis. Öffne die Referenz erst nach einem eigenen funktionsfähigen Teilstand.',
    hints: ['Bei einem Fehler zurück zum kleinsten reproduzierbaren Fall.', 'Nutze die Projekt-4-/5-Funktionen und React-Bausteine; du brauchst kein zusätzliches Framework.'],
    solution: '// App.tsx; validation.ts exportiert isTask aus Kapitel 29. Einstieg/CSS wie Kapitel 30.\n' + portalSolution,
    criteria: ['Alle Mussziele umgesetzt oder ausdrücklich als offen markiert.', 'Mindestens drei nachvollziehbare eigene Entscheidungen und ein Fehlerprotokoll; Referenzkopie allein kein Kompetenznachweis.'],
  },
  {
    title: 'Abnahme mit neuen Daten und fremdem Blick', goal: 'Transfer statt nur bekannter Beispieldaten nachweisen.',
    explain: ['Verwende neue Aufgaben und Kategorien, die nicht aus der Referenz stammen. Prüfe Grenzen und Folgeaktionen: gleicher Titel, letzter Eintrag, Reload nach Änderung, kaputter Stand, Katalogfehler und erneuter Erfolg. Ein neues Datum oder ein anderer Titel darf keine fest verdrahtete Sonderregel benötigen.', 'Lass eine andere Person einen kurzen Ablauf ohne mündliche Anleitung durchführen, wenn das möglich ist. Halte Verständlichkeitsprobleme sachlich fest. Die automatische Werkstattprüfung wird erst nach ihrer technischen Integration als Nachweis verfügbar; bis dahin zählen nur tatsächlich ausgeführte externe Prüfungen.'],
    example: 'Neu: "Netzwerkplan lesen" 1 Minute, "Netzwerkplan lesen" 240 Minuten.\nErst eine erledigen, andere löschen, neu laden, Detail-URL der entfernten Aufgabe öffnen.',
    task: 'Fülle deine Abnahmematrix mit Soll/Ist und Status. Ergänze Typprüfung, Modelltests, Build und dokumentierte Browserabläufe. Behebe mindestens einen gefundenen Mangel und wiederhole dessen Fall.',
    hints: ['Grüne Tests ersetzen weder Fokusprüfung noch sichere Datenausgabe.', 'Ein offener Punkt bleibt offen; die Abgabe darf ihn transparent benennen.'],
    solution: 'Musterprotokoll:\nDatenaktionen/Grenzen -> Modell- und Browserfälle.\nPersistenz/kaputte Daten -> separater Test mit synthetischem Speicher.\nKatalog -> Erfolg/leer/Fehler/Erholung/veraltet.\nNavigation -> bekannte/fehlende ID, unbekannte Route, Zurück/Vor, Direktaufruf.\nBedienung -> Tab/Enter, Fokus nach Löschen/Navigation, 200% Zoom, schmale Breite.\nSicherheit -> HTML-artige Titel bleiben Text; Paket ohne private Dateien.\nZu jedem Fall tatsächlichen Nachweis und verbleibende Grenze notieren.',
    criteria: ['Neue Daten ohne Sonderbehandlung korrekt.', 'Ein Mangel mit Vorher-/Nachherbeleg; technische/praktische Grenzen nicht verschleiert.'],
  },
  {
    title: 'Dokumentieren und Veröffentlichung bewusst vorbereiten', goal: 'Ein Projekt nachvollziehbar und ohne private Daten übergeben.', reference: refs.publish,
    explain: ['Die README erklärt Ziel, Voraussetzungen, Einrichtung, Start, Tests, Build, Datenspeicherung und Grenzen. Screenshots verwenden ausschließlich erfundene Inhalte. Vor einer Veröffentlichung prüfst du Quellen, Buildausgaben und Git-Inhalt; .gitignore macht bereits versionierte Dateien nicht nachträglich privat.', 'Eine statische React-App braucht passende Pfade und bei BrowserRouter eine Rückfallroute für direkte URLs. Frontend-Konfiguration und gebaute Dateien sind öffentlich lesbar. Die Entscheidung zum Hosting oder Push triffst du ausdrücklich; eine lokale Abgabe ist ebenfalls ein vollständiger Kursnachweis.'],
    example: 'Übergabe: README, Quellen, Lockdatei, Tests, Abnahmematrix, neutrale Screenshots.\nNicht enthalten: .env, Kontotokens, private PDFs, Suchindizes, persönliche Sicherungen.',
    task: 'Erstelle die Übergabe und prüfe das gebaute Projekt mit direkter Detail-URL. Schreibe eine kurze Abschlussreflexion: Was kannst du selbst, wo brauchst du Dokumentation und welche Anforderungen sind noch offen? Veröffentliche nur bei eigener bewusster Entscheidung.',
    hints: ['Versionierte Dateien und tatsächliches Paket prüfen, nicht nur die Ignoredatei.', 'Für Direktlinks die Hosting-Fallbackregel dokumentieren und später testen.'],
    solution: 'README-Gerüst:\nZweck/Nutzerziel und Screenshot mit Testdaten.\nDokumentierte Werkzeugversionen; Einrichtung im Projektordner, Start/Stop.\nSkripte für Typprüfung, Tests, Build und lokale Build-Vorschau.\nLokale Daten: Speicherort im Browserprofil, Export-/Löschgrenzen und Fehlerverhalten.\nAbnahmematrix mit echten Nachweisen, offene Punkte.\nHosting nur optional; Router-Fallback und Basis-Pfad erklären.\nReflexion: eigene Entscheidungen, gelöster Fehler, nächster Lernschritt.\nKeine privaten Dateien oder Geheimnisse im Quell-/Buildpaket.',
    criteria: ['Reproduzierbare lokale Übergabe ohne persönliche Daten.', 'Kompetenzen und Grenzen ehrlich reflektiert; keine automatische Veröffentlichung.'],
  },
]);
