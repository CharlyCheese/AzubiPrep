# FE-038 – Kapitel 19–31 technisch integrieren

Status: done
Bereich: FE
Angelegt: 2026-10-31

## Ziel und Reihenfolge

Alle verbliebenen 77 Inhaltslektionen schrittweise in den normalen Kursablauf
übernehmen: Datenprojekt 19, DOM/Ereignisse/Zustand 20–23, kontrollierte
Asynchronität 24–25, Module/Werkzeuge/Qualität 26–28, TypeScript 29, React 30,
Abschlussprojekt 31. Keine bloße Umbenennung vorbereiteter Inhalte in bestandene
Übungen. Praktische Nutzerabnahme und automatisierte Teilnachweise trennen.

Lokale zusätzliche Bibliotheken TypeScript und eine DOM-Implementierung wurden
ausdrücklich freigegeben. Reale Terminal-/Git-/Veröffentlichungsaktionen des
Lernenden erfolgen im eigenen externen Projekt; die App führt keine Shell aus.

## Allowlist

- `frontend/package.json`, `frontend/package-lock.json`, `frontend/vite.config.js`
- `.gitignore` für erzeugte Buildausgaben der öffentlichen Vorlage
- `.github/workflows/ci.yml` für die reproduzierbare Vorlage-Installation vor Browserprüfungen
- neue `frontend/advanced-vendor.mjs` (feste lokale Bibliotheksbündel und Typdefinitionen)
- neue `frontend/course-template/package.json`, `package-lock.json`, `tsconfig.json`,
  `README.md`, `tests/model.test.js`, `model.js`, `index.html`, `App.tsx`, `main.tsx`
  sowie `frontend/src/pilot/advanced-template.js` für die öffentliche externe Vorlage
- neue Dateien `frontend/src/pilot/advanced-course.js`, `advanced-exercises.js`,
  `advanced-runtime.js`, `advanced.worker.js`, `advanced-dom.js`, `advanced-compiler.worker.js`
- neue `frontend/src/components/AdvancedWorkshop.jsx`
- `frontend/src/pilot/course.js`, `validator.js`, `project.js`, `preview.js`,
  `storage.js`, `import.js`, `export.js`, `prepared/catalog.js`
- `frontend/src/pages/FrontendKurs.jsx`, `frontend/src/styles/pilot.css`, `frontend/public/sw.js`
- bestehende Inhaltsdateien `frontend/src/pilot/prepared/ch19.js` bis `ch31.js`
  und `shared.js` nur zur Anpassung veralteter Laufzeithinweise/Referenzfehler
- `backend/src/ai.js`, `backend/test/ai.test.js`
- `backend/src/sicherheit.js`, `backend/test/js-worker-headers.test.js`
- `frontend/src/api/ai.js`, `desktop/main.js`, `desktop/pilot-runtime.cjs`
- `frontend/src/components/KiHilfe.jsx` für den Hinweis auf freiwillige Codeausschnitte
- neue `e2e/tests/advanced-course.spec.js`, `e2e/tests/advanced-runtime.spec.js`
- bestehende `e2e/tests/frontendpilot.spec.js`, `css-course.spec.js`, `forms.spec.js`,
  `prepared-course.spec.js`, `desktoppilot.spec.js`, `js-course.spec.js`,
  `js-playground.spec.js`, `js-sandbox.spec.js`, `js15-course.spec.js`,
  `js16-course.spec.js`, `js17-course.spec.js`, `js18-course.spec.js` für Kurszählungen
  und bestehende isolierte statische Loader
- `README.md`, `docs/20-Frontendkurs-Qwen-Planung.md`,
  `docs/35-Frontendkurs-Kapitel-18-31.md`, neue `docs/37-Frontendkurs-Technische-Integration.md`
- dieser Brief, `docs/agent-briefs/STATUS.md`, `docs/agent-briefs/DONE.md`

## Abnahme

1. Alle 77 Lektionen in aufbauender Folge mit erklärten Voraussetzungen,
   offenen Startern, Hilfe/Lösung, passenden Projektdateien und nachvollziehbaren
   Kriterien. Vorhandene 90 IDs/Versionen/Entwürfe erhalten; neue getrennte Stände.
2. Lerncode einschließlich DOM-Handlern, Modulen und React ausschließlich in
   QuickJS/Worker; begrenzte Zeit, Speicher, Ausgabe, Jobs, Importgraph und DOM.
   Stop und Wechsel beenden alte Arbeit. Kein nativer Gastcode im App-Prozess,
   keine Shell, kein Host-Dateisystem, keine echten Netzwerk-/App-/Kontorechte.
3. Sichtbare DOM-Ausgabe durch feste Struktur-/Attributgrenzen; keine aktiven
   HTML-Strings, fremden CSS-/URL-/Event-Handler im App-DOM. Ereignisse nur als
   begrenzte Daten zurück in die VM. Fokus-/Layoutgrenzen ehrlich kennzeichnen.
4. Async mit festen lokalen Fixtures und kontrollierten Fehler-/Racefällen;
   lokaler Übungsspeicher von realen Appdaten getrennt, neu startbar/exportierbar.
5. TypeScript mit wirklicher semantischer strict-Prüfung, nicht nur Entfernen
   von Typen. JSX/React mit vorhandener echter React-Version. Keine Installation
   von Lernprojektpaketen oder Ausführung mitgebrachter npm-Skripte.
6. Funktionale Prüfungen mit neuen Daten/Negativfällen; Dokumentation/Planung,
   Git und Veröffentlichung als klar getrennte manuelle Kriterien, keine
   automatische Kompetenzbehauptung nach statischen Stichworttreffern.
7. Neue Importformate eng begrenzen, private Ausschlüsse erhalten. Keine privaten
   Unterlagen/Zugangsdaten lesen, versenden, bundeln oder in Screenshots zeigen.
8. Backend-KI-Themenfolge, mobile/Tastaturbedienung, Sicherung/Neustart,
   Web/Windows-Electron, Produktionsbuild/CSP und alte Tests prüfen.
9. Frische unabhängige Fach-/Sicherheitsreviews und Archivcheck erfolgreich;
   Grenzen und noch fehlende menschliche Abnahme dokumentieren. Kein Installer,
   Commit, Push oder reale Veröffentlichung ohne separaten Auftrag.

## Ergebnis

Abgeschlossen im Entwicklungsstand am 01.11.2026: 77 neue Lektionen, insgesamt
167 in Kapitel 1–31. Darunter 17 Dokument-/Planungsetappen; 36 Lektionen besitzen
zusätzlich verpflichtende, ausdrücklich als Selbstauskunft gekennzeichnete
manuelle Kriterien. Vorhandene 90 IDs, Versionen und gespeicherte Stände bleiben.

Lokale Module und die neue DOM-/React-Ansicht laufen ausschließlich innerhalb
QuickJS mit unabhängigen Hostgrenzen, Stop/Wechsel, festen Datenadaptern und
getrenntem Übungsspeicher. TypeScript wird vor Ausführung semantisch mit strict
geprüft. Die normale HTML-/CSS-Vorschau bleibt skriptfrei. Allgemeiner Debugger,
vollständige Browserkonformität und praktische Nutzerabnahme bleiben offen.

Externe Vorlage mit festen Versionen/Lock, echten Node-Tests, Typprüfung und Build
ergänzt. Eigene Testdateien werden korrekt mitgenommen; Export, Ordner-Rückimport
und normaler React-Bootstrap sind geprüft. CI installiert die öffentliche Vorlage
für ihre Buildtests. Keine App-Ausführung von Shell/Git/npm-Skripten.

Nachweise: 313/313 Browser-/Electronfälle in der Gesamtsuite grün (Windows/
Chromium, darunter alle 77 Referenzlektionen), anschließend acht gezielte Fälle
nach kleinen Beispiel-/Mobile-Ergänzungen grün. 210 Backendtests und Lint,
18 Desktop-Paket-/Laufzeitfälle, drei Webpaketfälle sowie Produktionsbuild grün.
Externe Vorlage selbst mit strict-Typprüfung, vier Modelltests und Build geprüft;
zusätzliche heruntergeladene Varianten für Node-Tests, Dokumentetappe und Portal
durchliefen echte Typprüfung/Tests/Build. Negative Fälle behandeln Endlosschleifen,
Host-/Netzrechte, fremde Module, Schema-Manipulation, Syntax/Typen, Speicherquote,
kaputten Altstand, Schreibausfall, Abbruch und Sitzungstrennung. Mobile Darstellung
visuell geprüft; Limits aufklappbar, Tastatur und Fokus nach Aktionen nachgewiesen.

Frischer unabhängiger Fach-/Integrationsreview und Sicherheitsreview freigegeben,
einschließlich Nachreviews der korrigierten Findings. Prüfnachweise und Grenzen
in docs/37, README und Planung aktualisiert. Git-Prüfung: keine privaten Pfade
versioniert; feste Vorlagenexporte enthalten keine PDFs, Zugangsdaten oder privaten
Ablagen. Private Unterlagen wurden nicht gelesen oder als Quellen verwendet.

Lokaler Appserver mit aktueller KI-Themenfolge wieder gestartet. Keine neuen
Installer, kein Commit/Push und keine Veröffentlichung. Desktoppaket 0.1.4 bleibt
beim älteren 82/85-Stand. Entfernter GitHub-CI-Lauf erst nach eigenem Push.
