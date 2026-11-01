# FE-037 – Kapitel 18 praktisch einbinden

Status: done
Bereich: FE
Angelegt: 2026-10-31

## Ziel

Acht vorbereitete Lektionen zu Callbacks, Arraymethoden und Fehlersuche in den
normalen Übungsablauf übernehmen. Eigenen Code weiterhin ausschließlich in
QuickJS prüfen/ausführen. Debuggereinstieg als ausdrücklich geführte Spur des
festen Kursbeispiels mit Haltepunkt/Schritten/Scope, kein allgemeiner nativer
Quellcodedebugger. Eigenständige Funktionskorrektur separat prüfen. Vollständige
freie Debuggerintegration bleibt offen und wird nicht als implementiert bezeichnet.

## Allowlist

- `frontend/src/pilot/js18-course.js`, `frontend/src/pilot/js18-exercises.js`
- `frontend/src/pilot/js18-trace.js`, `frontend/src/components/JsGuidedTrace.jsx`
- `frontend/src/pilot/course.js`, `frontend/src/pilot/js-exercises.js`
- `frontend/src/pilot/js-checks.js`, `frontend/src/components/JsCourseConsole.jsx`
- `frontend/src/pilot/js-runner.worker.js`
- `frontend/src/pages/FrontendKurs.jsx`, `frontend/src/components/PreparedCourse.jsx`
- `frontend/src/pilot/prepared/catalog.js`, `frontend/src/styles/pilot.css`, `frontend/public/sw.js`
- `backend/src/ai.js`, `backend/test/ai.test.js`
- `e2e/tests/js18-course.spec.js`, `e2e/tests/prepared-course.spec.js`
- `e2e/tests/frontendpilot.spec.js`, `e2e/tests/css-course.spec.js`, `e2e/tests/forms.spec.js`
- `e2e/tests/js-course.spec.js`, `e2e/tests/js15-course.spec.js`, `e2e/tests/js16-course.spec.js`
- `e2e/tests/js17-course.spec.js`, `e2e/tests/js-playground.spec.js`, `e2e/tests/js-sandbox.spec.js`, `e2e/tests/desktoppilot.spec.js`
- `README.md`, `docs/36-JavaScript-Kapitel-18.md`, `docs/20-Frontendkurs-Qwen-Planung.md`, `docs/35-Frontendkurs-Kapitel-18-31.md`
- dieser Brief, `docs/agent-briefs/STATUS.md`, `docs/agent-briefs/DONE.md`

## Abnahme

1. Acht gestufte Lektionen mit offenem Starter/Reparaturdatei, Lerntext, Beispiel,
   Aufgabe, zwei Hilfen, Lösung und festen Daten-/Funktionsprüfungen. Lösungen
   und gleichwertige Varianten bestehen; typische falsche Rückgaben, Grenzfälle,
   fehlende Fehler, Mutation und Sortierfehler bleiben offen.
2. Alle Gastaufrufe einschließlich Callbacks/Getter/Fehleraufbereitung bleiben
   in QuickJS und seinen bisherigen Zeit-/Speicher-/Jobgrenzen. Keine beliebigen
   Gastobjekte im Host auswerten. Keine neue Bibliothek, DOM-/Netzwerkrechte oder
   automatische Codeausführung beim Öffnen/Import/Wiederherstellen.
3. Geführte Spur klar als festes Beispiel erkennbar, kein Ausführen des Editorcodes
   im App-Kontext. Haltepunkt vor Anweisung, lokaler Scope und Schleifengrenze
   korrekt; Beginn/Schritt/Weiter/Ende/Reset und leere Liste nachvollziehbar.
   Gezeigte Korrektur als Hilfe zählen; Funktionsprüfung ist kein Verständnisnachweis.
4. 90 praktische Lektionen 1–18; verbleibende Inhaltsfassung 19–31 mit 77 Lektionen.
   Alte 82 Stände/Versionen/Ergebnisse und Exporte erhalten. Inhalte 18 aus dem
   vorbereiteten Quelltext wiederverwenden, keine abweichende doppelte Redaktion.
5. KI-Themenfolge schrittweise erweitern, frühe Lektionen behalten ihre Grenzen.
   Neue Codeoptins/Privatdatenregeln nicht verändern; Debuggerumfang ehrlich erklären.
6. Browser und Windows-Electron, Produktions-CSP, Abbruch/Hostgrenzen, alte
   Sicherung/Neustart, mobile Tastatur, neue Spur und neue Fehlersuche prüfen.
   Backendtests/Lint, Build, unabhängiger Review und Archivcheck erfolgreich.

## Ergebnis

Acht Lektionen technisch eingebunden; insgesamt 90 praktische Lektionen bis
Kapitel 18 und 77 vorbereitete Lektionen für Kapitel 19–31. Die neuen Übungen
verwenden 30 Datenfälle sowie direkte Funktions-/Callbackprüfungen innerhalb
QuickJS. Fehlertypen werden ohne Getterzugriff innerhalb des Interpreters
aufbereitet. Alte Lernstände und Ausführungsgrenzen bleiben erhalten.

Die letzte Lektion bietet eine ausdrücklich geführte Spur eines festen Beispiels
mit Haltepunkt, Einzelschritten, lokalem Scope und leerer Liste. Die Korrektur
zählt als angesehene Lösung. Ein allgemeiner Debugger für eigenen Quellcode
bleibt offen; die eigenständige Reparatur wird separat geprüft.

Nachweise: 47 gezielte Browser-/Electronfälle, anschließend 212 Fälle der
Gesamtsuite erfolgreich; 208 Backendtests, Lint und Produktionsbuild grün.
Geprüft wurden unter anderem alternative Lösungen, fehlerhafte Programme,
Mutation, Zeitgrenzen, mobile Tastaturbedienung, Produktions-CSP und die
Übernahme eines alten 82-Lektionen-Stands über einen Electron-Neustart.
Frische unabhängige Fach- und Sicherheits-/Integrationsreviews freigegeben.
Praktische Nutzerabnahme des neuen Kapitels steht noch aus.

README und Planung aktualisiert. Keine privaten Unterlagen gelesen, keine
neuen Abhängigkeiten, kein neuer Installer und kein Commit/Push. Das bestehende
Desktoppaket 0.1.4 enthält weiterhin den vorherigen Stand mit 82/85 Lektionen.
