# Brief FE-023: Dateiübernahme und Einführung des Piloten korrigieren

Status: done
Bereich: FE
Angelegt: 2026-10-30

## Ziel

Nutzerrückmeldung aus dem praktischen Webpilottest bearbeiten: Ordnerdialog
verständlich erklären, schrittweise Dateiauswahl ohne Verlust anderer Dateien,
gut sichtbare Auswahlknöpfe und Frontend-Werkstatt in der Einführungstour.

## Betroffene Dateien

- `frontend/src/pages/FrontendKurs.jsx`
- `frontend/src/pilot/project.js`
- `frontend/src/styles/pilot.css`
- `frontend/src/components/AppTour.jsx`
- `frontend/src/pages/Einstellungen.jsx`
- `frontend/public/sw.js`
- `frontend/test/pilot-project.test.js`
- `e2e/tests/frontendpilot.spec.js`
- `docs/22-Frontendpilot-Technik.md`
- `docs/21-Frontendpilot-Abnahme.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`
- `docs/agent-briefs/FE-023-pilot-import-tour.md`

## Abnahme

- [x] Ordnerauswahl erklärt: Dialog zeigt Ordner; Inhalte werden nach Bestätigung eingelesen und im Dateibaum angezeigt.
- [x] Einzelne Dateien ergänzen/aktualisieren den Entwurf, einschließlich CSS/Bildern ohne eigene HTML-Datei; bestehende andere Dateien bleiben erhalten.
- [x] Gleichnamige Pfade nur nach Bestätigung aktualisieren; zusammengeführtes Projekt vollständig validiert, Fehler/Abbruch verändern nichts.
- [x] Ordner-/JSON-Übernahme als ausdrücklicher vollständiger Ersatz gekennzeichnet; Auswahlknöpfe sichtbar und tastaturbedienbar im App-Design.
- [x] Einführung enthält Werkstatt mit passender Route; vorhandene Tourpräferenzen nicht zurückgesetzt.
- [x] Gezielte Node-/Browserprüfungen, visueller und frischer unabhängiger Review sowie Archivcheck bestanden.

## Ergebnis

Einzeldateien werden nach Pfadzuordnung mit dem letzten Entwurf zusammengeführt;
Konflikte fragen nach, andere Dateien bleiben erhalten. Vor Änderung vollständige
Validierung des zusammengeführten Projekts. Teilimporte von CSS/Bildern erlaubt;
Ordner-/JSON-Ersatz ausdrücklich erklärt und bestätigt. Sichtbare Auswahlknöpfe
mit Tastaturfokus, Hilfetext zum nativen Ordnerdialog und Dateizähler ergänzt.
Nicht unterstützte/private Dateien vor Lesen gefiltert. Privatwurzeln werden
auch bei direkter Auswahl ausgeschlossen; 5000 rohe/50 unterstützte Dateien.

Tour um Werkstatt ergänzt, Hilfe in Einstellungen angepasst. Ihr Dashboard-
Schritt kennzeichnet einen Direkteinstieg als bereits in der App angekommen,
damit kein Wechsel zur Landing-Route die Tour abbricht. Tourpräferenz erhalten.
Service-Worker-App-Shell v5, gebauter Webstand index-Bzhwj9i2.js; kein Installerbau.

Nachweise: sieben Node-Projekttests und 17 Playwright-Pilotfälle bestanden,
einschließlich sequenzieller HTML/CSS-Übernahme, bestätigtem/abgebrochenem
Aktualisieren, Erhalt nach Neustart, Projektgrenzen, fünf Tourschritten und
unveränderten privaten Daten. Neue Auswahlknöpfe visuell geprüft.
Frischer Review durch fe023_review: Privatwurzelfall gefunden, korrigiert und
im Nachreview freigegeben. Keine offenen Findings im Änderungsumfang.
Gesamte Pilot-/Desktopabnahme bleibt offen; praktische Rückmeldung noch nicht
als vollständige Abnahme gewertet. Archiviert; Diff-/Archivcheck bestanden.
