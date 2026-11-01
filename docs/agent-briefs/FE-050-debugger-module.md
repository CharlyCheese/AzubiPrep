# FE-050 – D3: begrenzter Mehrdatei-/Moduldebugger

Status: done
Bereich: FE
Angelegt: 2026-11-01

## Ziel und Umfang

Erste Modulstufe: echte native synchrone ES-Module in derselben Asyncify-VM,
statische benannte/default Imports und Exports, relative flache JS-Dateien im
eigenen Modulprojekt. Gemeinsame Punkte-/Funktions-/Scopekennungen und originale
Datei/Zeile/Spalte; ein globales Ressourcenbudget und echter Pause-/Resume-Lauf.
Keine textuelle Importersetzung oder Kopie lebender Importbindings.

Zunächst azyklische Graphen, höchstens16 Dateien und insgesamt64KiB Quellen.
Statische Graphprüfung vor Ausführung; fehlende Dateien/Exporte und Zyklen
verständlich abweisen. Kein Namespaceimport, export-star/Reexport, dynamisches
import/import.meta, Top-Level-await, Paket-/URL-/Ordner-/Hostimport. Bestehender
Einzeldateientwurf bleibt erhalten. Neues getrenntes optionales Modulprojekt im
lokalen Kursstand mit Dateien/Entry, bewusster Import/Export; keine Debugwerte.

## Allowlist

- `frontend/src/pilot/debugger-{compiler,core}.js`, `debugger-compiler.worker.js`,
  `debugger.worker.js`, `debugger.js`; neue `debugger-project.js`
- `frontend/src/components/JsDebuggerPilot.jsx`, `frontend/src/pages/FrontendKurs.jsx`,
  `frontend/public/sw.js`; `frontend/src/styles/pilot.css` nur bei nötiger Mobilkorrektur
- neue `e2e/tests/debugger-modules.spec.js`; bestehende Debuggertests nur für
  zu präzisierende Modul-/Dateizuordnungen, keine Abschwächung bestehender Gates
- neue `docs/44-Debugger-Module.md`; Dokumente38/39/43 und dieser Brief,
  `docs/agent-briefs/STATUS.md`, `docs/agent-briefs/DONE.md`
- synthetische temporäre Nachweise unter ignoriertem `e2e/test-results/`

## Abnahme

1. Native Asyncify-Modulauswertung tatsächlich pausiert/fortgesetzt; Import-
   Auswertungsreihenfolge/Einmaligkeit, Strict Mode, lebende Bindungen,
   Rückgaben/Closures/Fehlerbehandlung gegen originale QuickJS-Module geprüft.
2. Datei/Zeile/Spalte/Frame stimmen bei modulübergreifendem Hinein/Über/Aus,
   Haltepunkten und Fehlern. Dateiwechsel zur Ansicht beendet keine Pause;
   Änderungen beliebiger Projektdatei/Entry oder Moduswechsel beenden alte VM.
3. Geschlossener loader ausschließlich aus vorab geprüfter Projektmap; keine
   Netz-/Host-/Dateirechte. Alle Quellen vor Ausführung geprüft; fehlende
   Module/Exporte, Zyklen und nicht freigegebene Importsyntax vorab abgewiesen.
4. Quell-/AST-/Punkte-/generierte Bytecaps projektweit, aktive Zeit/Heap/Stack/
   Protokoll/Frames/Snapshots/Ausgaben gemeinsam. Keine neue KI-/Debugdatenpersistenz.
   Fehler-/Fatalgrenzen aus FE-048 bleiben erhalten; gültige Originalpositionen.
5. Einzeldateientwurf und alte Kursstände unverändert nutzbar; Moduldateien/
   Entry lokal über Reload/Electron-Neustart erhalten. Import/Export roundtrip
   ohne automatische Ausführung, sensible Namen/Pfade vor Lesen abgewiesen.
6. Gezielte Semantik-/Negativ-/Ressourcen-/Browser-/Windows-Electronfälle und
   angemessene Gesamtregression grün; tatsächliche Bedienprobe agentseitig,
   frischer unabhängiger Review und Archivcheck. Keine neue Bibliothek,
   privaten Ablagen, Installer/Commit/Push; weitere Modulsyntax separat.

## Ergebnis

Native ES-Module mit statischen named/default Imports/Exports, Sideeffectimports
und lokalen Exportlisten implementiert. DAG/Dateien/Exportbeziehungen sowie alle
Quellen vor Ausführung geprüft, Strictness/Importreadonly und reservierte Namen
einschließlich normalisierter Escapes erhalten. Private Exportlisten dürfen keine
generierten Leser/Helfer freigeben. Native Reihenfolge/Einmaligkeit/Livebindings
werden durch echte VM-Module getragen; keine textuelle Importersetzung.

Globale Punkte-/Funktions-/Scopekennungen mit Originaldatei, gemeinsamer Projekt-
Endpunkt nur im Entry. Aufrufauswahl/Dateiansicht und Dateiwechsel während Pause
funktionieren; Projektänderung/Entry/Modus beendet Sitzung. Optionales getrenntes
debugProject im bestehenden Kursspeicher validiert; Einzelentwurf bleibt erhalten.
JS-Mehrfachimport ergänzt, JSON ersetzt bewusst nach Bestätigung. Namen/Pfade
für beide Importarten vor text() geprüft; keine Laufwerte/Breakpoints im Export.

Frischer Reviewer fe050_modules_review fand P2 bei strict-reserved Bezeichnern
in unbenutzten Quellen sowie bei privaten JSON-Namen/Pfaden vor Lesen. Beide
behoben und nachgeprüft; native Syntax-/Linkerprüfung zusätzlich abgesichert.
Unabhängige Asyncify-Differentialproben: Diamond/Einmaligkeit, live Alias,
Default-Snapshot gegenüber Liveexport, Closuremutation, importierter Throw,
Strictness/Hoisting, insgesamt54 gültige echte Asyncify-Snapshots ohne Abweichung.

Der erste ausführbare 9er-Lauf war7/9: ein synthetisches input.files-Override
musste vor anschließendem nativem Dateidialogtest entfernt werden; native
Differentialprobe stürzte im compileOnly-Modulpfad ab. 86er-Zwischenlauf85/86:
Kontexttrennung beseitigte den Crash, doch originale gültige Default-/Closure-
Module lieferten scheinbare Syntaxfehler. Unabhängige Gegenproben bestätigten
dies auch in frischen Instanzen, Sync und Asyncify. Rootursache im offiziellen
v0.32.0-C-Wrapper: nicht initialisierter Modulzeiger im compileOnly-Zweig.
Kein Upgrade/Librarypatch und keine Änderung privater Ablagen vorgenommen.

Endgültige Vorprüfung nutzt diesen API-Pfad nicht: normale Modulauswertung
einer vollständig mit privatem Throwpräfix geschützten Prüfmap, einschließlich
aller Abhängigkeiten, je Root im eigenen sequentiellen limitierten Runtime.
Nur der erwartete primitive Token ist Erfolg; keine Lernanweisung/Debugfunktion
läuft im Prüfkontext. Danach erst reale Ausführungsruntime mit unveränderten
instrumentierten Quellen. Gleiche Heap-/Stackcaps, gemeinsame WASM-Grenze und
externe Startfrist. Ausführungsruntime wie zuvor physisch per Worker beendet.
Offizielle versionierte Primärquelle und Nachweisdetails in Dokument44.

Neun neue Modul-/Browser-/Windows-Electronfälle nach diesem Fix9/9 ohne
Wiederholung grün. Der Differentialkorpus prüft13 Originalprojekte und validiert
jeden Snapshot; alle gültigen Originalprojekte müssen ausdrücklich ohne Fehler
und ohne ausstehende Jobs enden. Alter86er-Zwischenlauf hatte alle77 bisherigen
Debuggerfälle grün. Vollständige400er Browser-/Electronregression läuft.
Dokumente38/39/43/44 aktualisiert. Anschließender unabhängiger Abschlussreview
des Sentinelstands ohne offene Findings, alle13 Original-/Instrumentiertpaare
erneut bestätigt (Originale error=null/jobs=false, jeder Snapshot gültig).

Agentseitige Bedienprobe im tatsächlichen lokalen Stand3002, getrenntes
Chromiumprofil: acht Kontrollpunkte bestanden. Hinein und automatische Datei,
Ansichtswechsel ohne Fortschritt, Parameter/Caller/Callee und dateigenauer
Haltepunkt, Verlassen/Ausgabe6; Änderung zweiter Datei→9, bestätigte Speicherung,
Reload ohne alteVM mit erhaltenen Modulquellen und unabhängigem Einzelentwurf;
JSON-Roundtrip ohne automatische Ausführung und Debugwerte; mobile Ansicht
390×844 mit lesbaren Frames/Variablen und erreichbarem Stop ohne Überbreite.
Desktop-/Mobilansicht zusätzlich per Screenshot visuell geprüft. Skript,
Ergebnis-JSON und Bilder nur unter ignoriertem e2e/test-results/fe050-bedienprobe.
Keine Nutzerentwürfe geändert und keine weitere persönliche Testaufgabe offen.
Abschließende Gesamtregression400/400 Browser-/Windows-Electronfälle ohne
Wiederholung grün (Chromium153.0.8010.12,5,8Minuten), einschließlich aller86
Debuggerfälle und des verstärkten Originaloracles. Produktionsbuild grün,
bestehender Bundlegrößenhinweis unverändert. Unabhängiger Abschlussreview
einschließlich Ergebnis-JSON/Skript und beider Bedienbilder ohne offene Befunde.
Archiv-/Diffprüfung grün; lokale Werkstatt liefert SWv39. Persönliche Rückmeldung
freiwillig. Keine Bibliothek, privaten Dateien, Installer/Commit/Push.
