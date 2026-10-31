# FE-028 – JavaScript-Kapitel 14

Status: done
Bereich: FE
Angelegt: 2026-10-31

## Ziel

Acht aufeinander aufbauende Lektionen: externe JS-Datei/Konsole, Werte,
const, let/Zuweisung, Datentypen/typeof, Rechenoperatoren, Klammern und
Transferprojekt. Im vorhandenen Lektionsablauf, mit externem Dateimodus,
festen Prüfungen und gestuften Hinweisen. Keine Bedingungen vor Kapitel 15.

## Allowlist

- `frontend/src/pilot/js-course.js`, `frontend/src/pilot/js-exercises.js`, `frontend/src/pilot/js-checks.js`
- `frontend/src/components/JsCourseConsole.jsx`
- `frontend/src/components/JsPlayground.jsx`
- `frontend/src/pilot/course.js`, `frontend/src/pilot/validator.js`, `frontend/src/pilot/project.js`
- `frontend/src/pilot/js-runner.js`, `frontend/src/pilot/js-runner.worker.js`
- `frontend/src/pages/FrontendKurs.jsx`, `frontend/src/api/ai.js`, `frontend/public/sw.js`
- `desktop/main.js`, `desktop/pilot-runtime.cjs`, `desktop/test/pilot-runtime.test.cjs`
- `backend/src/ai.js`, `backend/test/ai.test.js`
- `e2e/tests/js-course.spec.js`, `e2e/tests/frontendpilot.spec.js`, `e2e/tests/css-course.spec.js`, `e2e/tests/forms.spec.js`, `e2e/tests/desktoppilot.spec.js`, `e2e/tests/js-playground.spec.js`, `e2e/tests/js-sandbox.spec.js`
- `docs/31-JavaScript-Kapitel-14.md`, `docs/20-Frontendkurs-Qwen-Planung.md`, `docs/30-JavaScript-Grundlagenlaufzeit.md`
- dieser Brief, `docs/agent-briefs/STATUS.md`, `docs/agent-briefs/DONE.md`

## Abnahme

1. Acht eigenständige verständliche Lektionen mit Voraussetzungen, Beispielen,
   Aufgaben, offenen Startern, Lösungen, Hilfen und öffentlichen Primärreferenzen.
   Keine vorausgesetzten Schleifen/Funktionen/if/DOM/Frameworks; Transferprojekt.
2. Gemeinsame Auswahl und unveränderte alte Lernstände, zusätzlich acht Projekte;
   JS-Dateien im Editor, in JSON/ZIP und explizitem Web-/Desktop-Import unterstützt.
3. Externes script mit relativem Pfad und defer wird geprüft. HTML-Vorschau bleibt
   skriptfrei; JS startet ausschließlich bewusst im begrenzten QuickJS-Worker.
4. Ergebnis- und Typprüfung im Interpreter, ausgewählte Bindungen und veränderte
   Projektdaten prüfen; keine Host-eval-Ausführung und keine KI-Benotung.
   Kein beliebiger Prüfcode über Nachrichten; nur feste Aufgabenkennung/Testfall.
5. Zeit/Heap/Stack/Ausgabe/Jobs und Privatsphäregrenzen aus OPS-037 erhalten.
   Abbruch/Änderung/Wechsel dürfen keine alten Prüfergebnisse übernehmen.
6. KI-Themenfolge pro Lektion begrenzen, Code nur nach bestehender Freigabe;
   keine privaten Ablagen oder realen Kontodaten für Tests verwenden.
7. Lösungen/Alternativen bestehen, Starter/typische Fehler scheitern; echte Web-
   und Electron-Übungen, Speicher-/Export-/Abbruch-/Schutzregressionen, Backend-
   Tests/Lint, Build und frischer unabhängiger Fach-/Sicherheitsreview grün.

## Ergebnis

Acht Lektionen in die gemeinsame Auswahl integriert, insgesamt 51: externe
JS-Datei/Konsole, Werte, const, let/Zuweisung, typeof, Rechnen, Klammern und
Materialbudget-Transfer. Jeweils Voraussetzung, Erklärung, anderes Beispiel,
Aufgabe, zwei Hilfen, offener Starter und mögliche Lösung. Fachabgleich mit
SELFHTML/MDN; keine Bedingungen/Funktionen/Schleifen/DOM vorausgesetzt.

HTML-/JS-Projekte im gemeinsamen Kursspeicher und JSON/ZIP, Import/Editor in
Web und nativer Desktopauswahl ergänzt. Frühere 43 Projekte/Prüfstände und
freier JS-Entwurf bleiben erhalten. JS maximal 64KiB, einfacher Dateiname;
Größen/Namen vor Dateilesen geprüft, privater local-ai-Ordner zusätzlich zu
den vorhandenen Ausschlüssen gesperrt.

Kurskonsole führt nur die verknüpfte JS-Datei bewusst im QuickJS-Worker aus.
HTML-Vorschau bleibt skriptfrei; script/src/defer und relative Dateien werden
geprüft. VM-interne primitive Konsolenmomentaufnahmen und statische Probes
prüfen Typen/ausgewählte Bindungen; zwei bzw. drei Datensätze für Klammeraufgabe
und Projekt. Keine frei übergebenen Prüfprogramme/Daten, keine KI-Benotung oder
neue Hostfähigkeit. Bestehende Ressourcen-/Privatsphäregrenzen bleiben erhalten.
Abbruch, Änderung, direkter Lektionswechsel und Unmount räumen Prüfworker auf;
Stand-/Lektionsguard verhindert alte Ergebnisse. Geführte KI-Themenfolge pro
Lektion und JS-Codefreigabe erst ab Kapitel14, alte Grenzen unverändert.

Nachweise: Gesamtdurchlauf 95 Browser-/Electronfälle grün; nach Ergänzung der
Kennungs-/Abbruchtests alle 15 neuen Kapitel-14-Fälle grün, insgesamt 97
unterschiedliche Fälle. Nativer Dialogfilter/Import von JS, verschachtelte
Pfade, JSON/ZIP, frische Ausgabe, Reload, voller Desktop-Neustart, typische
Fehler und gültige andere Formeln geprüft. 204 Backendtests/22 Suiten, Lint,
16 Runtime-/Distributionstests und Frontendbuild grün. Bestehender Build-
Größenhinweis bleibt. Budgetlektion zusätzlich einzeln mit UI-Screenshot geprüft.
Lokaler Entwicklungsserver mit neuem Lernbegleitungsstand gestartet.

Frischer unabhängiger Review `fe028_review`: keine fachlichen oder Sicherheits-
Findings; alle elf festen Lösungs-/Datenkombinationen zusätzlich unabhängig mit
tatsächlichem QuickJS/Bootstrap/Probes grün. Fachabgleich mit aktuellen MDN-
und SELFHTML-Primärquellen bestätigt. Die angemerkt fehlende direkte Abbruch-
Gegenprobe für Codeänderung/Lektionswechsel wurde ergänzt und grün ausgeführt.
Abschließender Nachreview bestätigt diese Nachweise, Kennungs-/Fallfilter,
native Auswahl und konsistente Dokumentation ohne neue Findings. Archivprüfung
auch vom Reviewer erneut grün: 297 erledigte Tasks, 10 offen.

Grenzen in Dokument31: feste Ausgaben/Bindungen beweisen keine vollständige
Technik-/Verständnisprüfung; Selbstprüfung erforderlich. Testkonstanten der
letzten beiden Aufgaben werden pro Lauf bereitgestellt und nicht automatisch
mit exportiert. Für externes Bearbeiten/Einlesen funktioniert der Projektmodus;
keine Empfehlung, die Ausführungsgrenzen zu umgehen. DOM-/Async-Gates bleiben
offen, praktische Rückmeldung zu Kapitel14 separat. Keine neue Bibliothek,
keine privaten Ablagen/Konten gelesen, kein Installer/Push/Commit.
