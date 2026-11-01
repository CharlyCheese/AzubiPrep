# FE-042 – Debugger: Weiter-Beschriftung und erster Halt

Status: done
Bereich: FE
Angelegt: 2026-11-01

## Ziel

Den Fortsetzen-Knopf verständlicher beschriften und unmittelbar an der Bedienung
erklären, dass Start zunächst vor der ersten ausführbaren Anweisung anhält.
Ohne gesetzte Haltepunkte führt Weiter bis zum Ende. Nutzer bestätigt die
Funktion mit gesetztem Haltepunkt; keine Änderung an Ausführungslogik.

## Allowlist

- `frontend/src/components/JsDebuggerPilot.jsx`, `frontend/public/sw.js`
- `e2e/tests/debugger.spec.js`, `e2e/tests/debugger-functions.spec.js` (bestehende Knopflocators)
- `docs/39-Debugger-Technikpilot.md`
- dieser Brief, `docs/agent-briefs/DONE.md`

## Abnahme

1. Knopf heißt „Weiter / bis zum nächsten Haltepunkt“.
2. Kurzer sichtbarer Hinweis erklärt ersten Halt und Weiter ohne Haltepunkte.
3. Bestehende Funktionsprüfung mit/ohne Haltepunkt sowie Mobilbedienung grün,
   Frontend gebaut. Keine Änderung an Interpreter, Rechten oder Datenhaltung.
4. Frischer unabhängiger Review und grüner Archivcheck vor Abschluss.

## Ergebnis

Knopf in „Weiter / bis zum nächsten Haltepunkt“ umbenannt. Kurzer Hinweis direkt
über der Bedienleiste erklärt den automatischen ersten Halt, Einzelschritt und
Weiter ohne Haltepunkte bis zum Ende. Doku und bestehende Testlocators angepasst,
Service Worker v31; Ausführungslogik unverändert.

Vier bestehende Browser-/Mobil-/Tastaturprüfungen mit und ohne Haltepunkte sowie
Frontendbuild grün. Diff-Whitespaceprüfung grün; lokaler Server liefert v31.
Frischer unabhängiger Review `fe042_text_review`: keine Findings, freigegeben.
Keine privaten Dateien gelesen, keine Bibliotheken oder Installer ergänzt.
