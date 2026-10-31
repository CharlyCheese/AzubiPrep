# FE-031 – JavaScript-Kapitel 16

Status: done
Bereich: FE
Angelegt: 2026-10-31

## Ziel

Zehn aufeinander aufbauende Lektionen gemäß Planung: Deklaration/Aufruf,
Parameter, mehrere Argumente, return, Rückgabewege, Standardparameter,
Funktions-/Blockbereiche, reine Berechnungen und Zerlegung des Tarifrechners.
Keine Arrays/Schleifen/DOM oder Pfeilfunktionen voraussetzen.

## Allowlist

- `frontend/src/pilot/js16-course.js`, `frontend/src/pilot/js16-exercises.js`
- `frontend/src/pilot/course.js`, `frontend/src/pilot/js-exercises.js`
- `frontend/src/pilot/js-runner.worker.js`, `frontend/src/pilot/js-checks.js`
- `frontend/src/pages/FrontendKurs.jsx`, `frontend/public/sw.js`
- `backend/src/ai.js`, `backend/test/ai.test.js`
- `e2e/tests/js16-course.spec.js`, `e2e/tests/js15-course.spec.js`, `e2e/tests/js-course.spec.js`, `e2e/tests/frontendpilot.spec.js`, `e2e/tests/css-course.spec.js`, `e2e/tests/forms.spec.js`, `e2e/tests/js-playground.spec.js`, `e2e/tests/js-sandbox.spec.js`
- `docs/33-JavaScript-Kapitel-16.md`, `docs/20-Frontendkurs-Qwen-Planung.md`, `docs/32-JavaScript-Kapitel-15.md`
- dieser Brief, `docs/agent-briefs/STATUS.md`, `docs/agent-briefs/DONE.md`

## Abnahme

1. Zehn Lektionen mit Voraussetzungen, eigener Erklärung/Beispiel, Aufgaben,
   gestuften Hilfen, offenen Startern/Lösungen und Zwischen-/Abschlussprojekten.
   Deklaration/Aufruf, Parameter/Argumente, return gegenüber console.log,
   frühe Rückgaben, undefined/default, lokale/blockweise Bindungen vermitteln.
2. Tarifrechner aus Kapitel15 in einzeln aufrufbare Funktionen zerlegen.
   Funktionen unter mehreren direkten Argumentkombinationen und wiederholten
   Aufrufen im Interpreter prüfen, nicht nur die oberste Ausgabe vergleichen.
3. Reine Berechnung gegenüber Ausgabe unterscheiden; Prüfhelper darf die Anzahl
   primitiver VM-Konsolenaufzeichnungen auswerten, keine neuen Hostfähigkeiten.
   Prüfaufrufe behalten Zeit-/Stack-/Heap-/Ausgabe-/Jobgrenzen und Abbruch.
4. Insgesamt 71 Lektionen; bestehende 61 Stände/Ergebnisse/Exportformate und
   optionale Vorschauanzeige erhalten. Keine automatische Ausführung.
5. KI-Themenfolge pro Lektion, return/Parameter/Scope nicht vorwegnehmen;
   Arrays/Schleifen/DOM/Callbacks und Pfeilfunktionen bleiben spätere Themen.
6. Lösungen und Alternativen bestehen, Starter/typische Fehler scheitern.
   Grenz-/Ungültigkeitsfälle aus Tarifprojekt inklusive negativem Alter erhalten.
   Browser/Electron, alte Stände, Sicherheits-/Abbruchregressionen prüfen.
7. Öffentliche Primärquellen, keine privaten Unterlagen/Konten; Backendtests/Lint,
   Build, frischer Fach-/Sicherheitsreview und Archivprüfung grün vor Abschluss.

## Ergebnis

Zehn gestufte Lektionen integriert, insgesamt 71: Deklaration/Aufruf, einzelne
und mehrere Parameter, return, Rückgabewege, Standardparameter, lokale/blockweise
Bindungen, Berechnungsbausteine und Zerlegung des bekannten Tarifrechners.
Mit Voraussetzungen, eigenen Erklärungen/Beispielen, Aufgaben, je zwei Hilfen,
offenen Startern und Lösungen; Bereichsreparatur als Zwischenprojekt.

47 oberste Datenfälle plus direkte Funktionsaufrufe mit anderen Argumenten und
wiederholten Rückgaben. Vorhandene VM-Prüfclosure um begrenzte Aufzeichnungszahl
ergänzt; reine Funktionen dürfen keine Zusatzmeldungen erzeugen. Fehler erst
im Probeaufruf bekommen begrenzte Diagnose statt still falscher Rückgabe.
Alle Gastfunktionen laufen weiterhin nur in QuickJS unter denselben Grenzen.
Kein Host-/DOM-/Datei-/Netzwerk-/RAG-/Kontozugriff und keine neue Bibliothek.

Alte 61 Projekte/Versionen/Ergebnisse erhalten. Dynamische Anzahlgrenze erlaubt
71 ohne Schemawechsel, 32MiB Gesamtgrenze unverändert. Dateiimport, JSON/ZIP,
freie Konsole, optionale Textspiegelung und bestehende Freigaben erhalten.
KI-Themenfolge ab eigener Deklaration gestuft, keine Parameter/return/Scope-
Vorwegnahme; Arrays/Schleifen/Callbacks/Pfeilfunktionen bleiben späteren Themen.

Nachweise: 137 Browser-/Electron-/Kontext-/KI-Fälle im vollständigen Lauf grün.
Nach Reviewkorrektur 23 betroffene JS16-/freie-Konsole-Fälle grün (14 neue
Kapitel16-Fälle und neun bestehende freie-Konsole-Fälle). Starter offen,
Lösungen/Alternativen bestanden, typische falsche Aufrufe/Argumente/Rückgaben/
Bereiche/Standard-0/globale Abhängigkeiten/Zusatzmeldungen erkannt. Funktions-
Timeout und Fehlermeldung erst im Prüfer, Korrektur, alte Prüfung, JSON/Reload,
Vorschau und vollständiger Desktop-Neustart geprüft. 206 Backendtests/22 Suiten,
Lint und Produktionsbuild grün; bestehender Build-Größenhinweis. Projektscreenshot
visuell geprüft. Lokaler Server mit neuer Lernbegleitung gestartet; kein Installer.

Frischer unabhängiger Review `fe031_review`: ein P2 zur nach der Probe nicht
berücksichtigten VM-Jobqueue gefunden. Behoben durch klare synchrone Probe-
Regel: neue pending Jobs nach Probe führen zu checked=false; eigener check-jobs-
Grund nur ohne bestehenden Zeit-/Ausgabe-/Fehlergrund. Arbeit wird nicht mehr
still verworfen oder nachträglich ausgeführt. Repros für verzögerte Endlosschleife
und zusätzliche Ausgabe abgesichert. Normaler Programm-Joblauf bleibt unverändert.

Nachreview ohne offene Findings: 47 Lösungen und 47 Alternativdatenfälle sowie
zehn Starter unabhängig geprüft; Fehlerrepros scheitern, Gründe behalten Vorrang.
Direkte Prüfaufrufe unabhängig gegen Speicher/Stack/Zeit/Ausgabe geprüft.
Fachabgleich gegen öffentliche MDN-Primärquellen, keine privaten Ablagen oder
realen Konten gelesen. Doku/Plan/STATUS ergänzt; Kapitel17 ist nächster Schritt.
