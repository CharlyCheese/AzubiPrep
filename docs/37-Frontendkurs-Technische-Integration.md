# Frontendkurs: technische Einbindung bis Kapitel 31

Stand: 01.11.2026, Entwicklungsstand. Die normale Lektionsauswahl enthält
**167 Lektionen in Kapitel 1–31**: bestehende 90 plus 77 neu eingebundene.
Die zusätzliche Lesefassung ist ein Nachschlageweg, keine zweite Benotung.
Alte IDs, Lektionsversionen, Entwürfe und Prüfberichte bleiben erhalten.
Der vorhandene Desktopinstaller 0.1.4 enthält weiterhin den älteren Stand
82 Übungen/85 Inhaltslektionen. Kein neuer Installer wurde gebaut.

## Lernfolge und Projektdateien

19 verarbeitet Daten ohne DOM. 20–23 ergänzen DOM, Ereignisse, Zustand und
Lernplanprojekt. 24–25 behandeln kontrollierte asynchrone Daten und Katalog.
26–28 verbinden Module, externe Werkzeuge, eigene Tests und Reparaturprojekt.
29 ergänzt TypeScript; 30 React in zwölf Stufen; 31 das eigene Abschlussportal.
Die ursprünglichen Lerntexte, Hilfen und Referenzen werden wiederverwendet,
Laufzeithinweise und notwendige vollständige Datei-Zusammenhänge angepasst.

React-Ergänzungslektionen beginnen mit dem vorherigen Teilstand. Aufgabe 28.3
liefert defekte Module zum Reparieren statt leerer Dateien. Planung, Transfer,
Dokumentation und Werkzeugbedienung erfordern eigene Dateien beziehungsweise
ein ausgefülltes `pruefprotokoll.md`. Es enthält Vorhersagen, tatsächliche
Soll-/Istwerte, Nachweise, eigene Erklärung und verbleibende Grenzen.

## Bewusste Ausführung und technische Grenzen

„Vorschau“ enthält die **interaktive Übungsansicht**. Erst „Projekt ausführen“
übersetzt und startet Code. Öffnen, Import und Wiederherstellung führen nichts
aus. Stop, Datei-/Lektionswechsel und Verlassen der Ansicht beenden den Worker;
alte Ergebnisse dürfen nicht in einen neuen Stand gelangen.

TypeScript verarbeitet Quelltexte in einem eigenen Worker, ohne sie auszuführen.
Für TS/TSX werden `createProgram` und semantische Diagnosen mit `strict` und
`noEmit` verwendet. Syntaxübersetzung allein reicht nicht. Feste lokale
Standard-/DOM-/React-Typen sind vom virtuellen Projektverzeichnis getrennt.
Der Compiler besitzt eine externe Zeitgrenze von 15 Sekunden; die nachfolgende
Interpreter-Heapgrenze begrenzt nicht den nativen Compiler-Worker.

Lerncode, lokale Module, DOM, Ereignis-Handler, Fehleraufbereitung und echte
React-Bibliotheken laufen ausschließlich in QuickJS im weiteren Worker.
Grenzen: 3 Sekunden je Start/Aktion, 96 MiB Interpreter-Heap, 256 KiB Stack,
1.000 Promise-Jobs, höchstens 30 Timer-Runden und 100 gleichzeitig vorgemerkte
Timer; 80 Konsolenzeilen und 32.000 Konsolenzeichen. Der übergeordnete Controller
beendet unresponsive Worker zusätzlich von außen. DOM-Ausgabe ist auf 3.000
Knoten, Tiefe 32, 64.000 Textzeichen und 1 MiB übertragenes JSON begrenzt.

LinkeDOM modelliert einen DOM innerhalb der VM. Die App erhält ausschließlich
begrenzte primitive Texte beziehungsweise JSON. Ein unabhängiges Hostschema
prüft Knoten, Attribute, Fokus und Übungsspeicher. Erst danach erzeugt die App
freigegebene sichtbare Elemente. Gast-Skripte, Styles, Frames, Medien-URLs,
HTML-Strings und native Ereignisattribute werden nicht in den App-DOM übernommen.
IDs werden mit einem eigenen Präfix dargestellt. Nachrichtenarten werden vom
Worker festgesetzt, nicht aus Gastdaten übernommen. Textfelder werden nach
VM-Ereignissen synchronisiert; Textarea-Inhalt bleibt eine Wert-Eigenschaft.

Die Ansicht ist **kein vollständiger Browser**: eigenes CSS, Layout, native
Formularvalidierung, Zurück/Vor, Direktaufrufe und vollständige Zugänglichkeit
zusätzlich mit dem exportierten Projekt im echten Browser prüfen. Die bisherige
HTML-/CSS-Vorschau samt Inspektor bleibt skriptfrei. Der freie Quellcodedebugger
bleibt offen; Kapitel 18 bietet weiterhin seine ausdrücklich feste Modellspur.
Sein weiterer Ausbau ist in der [Debugger-Planung](38-Quellcode-Debugger-Planung.md)
mit technischem Entscheidungstor und eigener Pilotabnahme beschrieben.

## Lokale Dienste des Übungsmodells

- `fetch`/`request` akzeptieren nur das feste Ziel `./topics.json`; sie greifen
  niemals auf Netz, App-API oder mitgebrachte Dienste zu. Erfolg, leer, HTTP 503,
  Anfragefehler, ungültiges JSON und Schemafehler sind auswählbare feste Fälle.
- Timer sind kontrollierte Jobs ohne reale Wartezeit. Ein modelliertes
  AbortSignal kann eine noch ausstehende feste Anfrage ablehnen. Race-Prüfungen
  verwenden zusätzlich unabhängig auflösbare Promises.
- `localStorage` ist ein vom App-/Browser-/Kontospeicher getrennter VM-Speicher.
  Er erlaubt höchstens 20 Einträge und 64 KiB pro Wert; Schreibausfall ist ein
  eigener Übungsfall. Ein kaputter Altstand darf nicht automatisch ersetzt werden.
- „Übungsspeicher übernehmen“ schreibt ausdrücklich `uebungsspeicher.json` ins
  Lernprojekt. Erst damit wird der Laufzustand mit Projektdateien gesichert und
  beim nächsten Start wiederhergestellt. Gast-Schreibvorgänge allein sichern
  nichts auf dem Rechner. Browserprofil-/Desktop-Speicherfehler bleiben sichtbar.
- Übungskennungen verwenden einen zufälligen Sitzungspräfix und lokalen Zähler,
  damit ein neuer Lauf keine bestehenden IDs aus der letzten Sicherung wiederholt.
- Lokale Modulauflösung bleibt im gewählten Projekt. Dynamische Importe,
  beliebige Pakete, Node-/Shellzugriff sowie echte Datei-/Netz-/Appbrücken fehlen.
  `node:test` und die verwendeten Assertions sind kleine VM-Kompatibilitätsmodule,
  keine Node-Laufzeit. Echte Node-Tests laufen zusätzlich extern.

## Externe Werkzeugvorlage

Ab Kapitel 26 bietet „Projekt sichern und einlesen“ eine ZIP-Kopie mit eigenen
Projektdateien und festen Werkzeugdateien. Sie enthält Paketbeschreibung,
passendes Lock, TS-Konfiguration, `.gitignore`, Einstieg, Beispieltests und
`VORLAGE.md`. Die App startet keine Installation, npm-Skripte, Shell oder Git.
Die Werkzeugkonfiguration der **Kopie** wird durch die bekannte Vorlage ersetzt;
das Original im Editor bleibt erhalten. Für Testlektionen 27.1/2 landet der
eigene Node-Test unter `tests/lernaufgabe.test.js` mit passenden relativen Importen,
nicht im Browser-Einstieg. `npm test` führt diese Tests tatsächlich aus.

Geprüfte Vorlage: Node ab 22.12, React/ReactDOM 18.3.1, TypeScript 5.9.3,
Vite 8.3.5 und React Router 7.18.5; feste React-Typdefinitionen und transitive
Versionen im Lock. Die VM verwendet den vorhandenen Router 6.30.6 mit denselben
hier benutzten deklarativen Komponenten; sie erhält keine Browser-/Netzrechte.
Die neue externe Vorlage hatte bei der Paketprüfung keine gemeldeten Probleme.
Das ist keine Zusage über künftige Paketmeldungen oder alle externen Projekte.

`npm ci`, `npm run typecheck`, `npm test`, `npm run build` und lokale Vorschau
werden im **eigenen Übungsordner** erklärt. Internet ist gegebenenfalls für das
erste Beziehen von Paketen nötig. Reale Bedien-/Git-/Veröffentlichungsnachweise
werden vom Lernenden dokumentiert; Veröffentlichung bleibt optional.

Import/Export akzeptieren zusätzlich TS, TSX, JSX, JSON, Markdown und `.gitignore`
als Text innerhalb der bestehenden 50-Dateien-/10-MiB-Projektgrenzen.
`.env*`, `.git`, `node_modules`, `local-rag` und `local-ai` bleiben ausgeschlossen;
PDFs sind kein Projektformat. ZIP-Import und automatisches Ausführen mitgebrachter
Paketskripte werden nicht eingeführt.

## Prüfung und Lernbegleitung

Technische Teilprüfungen kontrollieren unter anderem neue Daten, leere Listen,
inklusive Grenzen, unveränderte Eingaben, sichere Texte, Ereignisse, Validierung,
Speichersnapshot, Race-Fälle, Modulauflösung, semantische Typen und spezifische
React-Aktionen/Fokus/Routing. Hilfen und Lösungsansicht werden weiterhin erfasst.
Planungs-/Dokumentetappen erhalten keine vorgetäuschte automatische Inhaltsnote.

Für ausdrücklich manuelle Kriterien reicht ein grüner Programmfall nicht:
Prüfprotokoll bearbeiten und tatsächliche Durchführung bestätigen. Die App
kennzeichnet dies als **Selbstauskunft**, nicht als unabhängige Prüfung der Belege.
Technik, verwendete Methode, Verständnis, tatsächliche externe Tests und
selbstständiger Transfer sind unterschiedliche Nachweise. Das gilt auch für ein
aus der Referenz kopiertes Projekt. Praktische Nutzerabnahme bleibt ausstehend.

Die optionale Lernbegleitung kennt die neue Themenfolge. Nur freiwillig gewählte
Quellausschnitte (höchstens drei, mit bisherigen Textgrenzen) kommen hinzu.
Markdown-Protokolle, JSON-Übungsspeicher, restliche Projektdateien sowie private
PDFs und abgeleitete Daten werden dadurch nicht an Cloudmodelle freigegeben.
Die bestehende serverseitige Sperre privater RAG-Quellen bleibt unverändert.

## Nachweise und Review

Alle 77 Referenzlösungen wurden einzeln im echten Kursablauf geprüft; offene
Starter bleiben offen. Ergänzende Tests prüfen reale Eingabe/Reset/Fokus,
Kontrollfälle und Erholung, beschädigte Sicherung, Schreibausfall, Abbruch,
Hostgrenzen, Endlosschleifen, manipulierte Snapshots, Mobilbedienung und
Electron-Neustart. Aus der App heruntergeladene Werkzeugvorlagen für eigene
Node-Tests, Dokumentetappen und Abschlussportal durchlaufen echte Typprüfung,
Tests und Build. Die Gesamtsuite und abschließenden Reviews werden im
[Arbeitsbrief FE-038](agent-briefs/FE-038-restliche-kapitel-technisch.md) vermerkt.

Primärquellen: [LinkeDOM](https://github.com/WebReflection/linkedom),
[TypeScript Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API),
[React](https://react.dev/learn), [React Router](https://reactrouter.com/home),
[Node Test Runner](https://nodejs.org/api/test.html), [Vite](https://vite.dev/guide/).
Die Domänengrenzen dieser Übungsumgebung sind keine Behauptung vollständiger
Browserkonformität von LinkeDOM oder einer vollständigen Barrierefreiheitsprüfung.
