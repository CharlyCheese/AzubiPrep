# FE-036 – Kapitel 18–31 als vollständige Inhaltsfassung

Status: done
Bereich: FE
Angelegt: 2026-10-31

## Ziel

Die vereinbarte Inhaltsphase FE-035 abschließen: sämtliche restlichen Kapitel
schrittweise ausarbeiten und in der Werkstatt lesbar machen. DOM-/Browser-/
Debugger-/Werkzeugintegration und praktische Abnahme bleiben eine eigene Phase.
Bestehende 82 Übungen und ihre Stände unverändert erhalten.

## Allowlist

- `frontend/src/pilot/prepared/catalog.js`, `frontend/src/pilot/prepared/shared.js`
- `frontend/src/pilot/prepared/ch18.js` bis `frontend/src/pilot/prepared/ch31.js`
- `frontend/src/components/PreparedCourse.jsx`
- `frontend/src/pages/FrontendKurs.jsx`, `frontend/src/styles/pilot.css`, `frontend/public/sw.js`
- `e2e/tests/prepared-course.spec.js`, `e2e/tests/prepared-content.test.js`
- `docs/35-Frontendkurs-Kapitel-18-31.md`, `docs/20-Frontendkurs-Qwen-Planung.md`
- dieser Brief, `docs/agent-briefs/STATUS.md`, `docs/agent-briefs/DONE.md`

## Abnahme

1. Alle Kapitel 18–31 mit mehreren aufeinander aufbauenden Lektionen; jede mit
   Voraussetzungen, Ziel, Erklärung, Beispiel, konkreter Aufgabe, zwei gestuften
   Hilfen, bewusst zugänglicher Lösung, überprüfbaren Kriterien und Fachquelle.
2. Projekte 3–6 und Abschlussprojekt in Etappen mit Beispieldaten, Randfällen,
   eigener Planung, Referenzumsetzung und Transfer; keine bloße Themenübersicht.
   Werkzeuge und Syntax werden vor ihrem ersten eigenständigen Einsatz erklärt.
3. Sichtbare Inhaltsfassung, keine unverdienten Prüf-/Kompetenznachweise. Noch
   keine Ausführung neuer Inhalte, kein DOM-/Netzwerk-/Dateizugriff aus Lerncode.
   Bestehende Übungen, Speicherung und KI bleiben funktional getrennt.
4. Mobile/tastaturbedienbare Kapitel-/Lektionsauswahl, aufklappbare Hilfen und
   Lösungen, verständlicher Rückweg. Keine privaten Daten oder neuen Bibliotheken.
5. Öffentliche Primärquellen, strukturelle Inhaltsprüfung, ausführbare reine
   Referenzfunktionen mit Randfällen, Browser-Regression/Build, unabhängiger
   frischer Fach-/Integrationsreview und grüner Archivcheck.

## Ergebnis

Alle 14 Kapitel in 85 Lektionen als eigene Inhaltsfassung integriert. Jede mit
Voraussetzung, Lernziel, Erklärung, Beispiel, Aufgabe, zwei gestuften Hilfen,
bewusst abrufbarer Lösung, Fachquelle und konkreten Kriterien. Projekte 3–6
und Abschlussportal in Etappen; vollständige JS-/modulare-/TS-/React-Referenzen.
Die 82 bisherigen Übungen, Entwürfe und Ausführungsgrenzen bleiben erhalten.

Lesefläche lädt separat, mobile Kapitel-/Lektionsauswahl und eingeklappte Werkzeuge,
Textdownload ausschließlich öffentlicher Lektion, keine KI-/Datei-/Netzwerkaktion
aus Lerncode. Fehlergrenze und unabhängiger Rückweg fangen Chunkfehler ab.
Beim Wechsel werden alte Prüfcontroller invalidiert; verspätete Ergebnisse
abgebrochener Prüfungen werden verworfen. CSS-/Formprüfer können intern noch bis
zum begrenzten Ende weiterarbeiten; keine weitergehende Abbruchgarantie hinzugefügt.

Nachweise: 59 Fälle in prepared-content, prepared-course, werkstatt-tools,
js17-course und frontendpilot bestanden (40,5 s), einschließlich Build.
Vollständige Lesbarkeit aller 85 Einheiten, mobile Tastatur-/Download-/Rückwegfälle,
alte Entwürfe, Chunkfehler/Prüfabbruch und feste Referenzprogramme auf frischen
synthetischen Browserseiten. Reine Grenz-/Mutations-/Schema-/HTTP-/JSON-Fälle,
TS/TSX-Syntaxübersetzung und vollständiger Modulimportgraph grün. Mobile Ansicht
zusätzlich visuell geprüft. Bekannte Chunkgrößenwarnung des bestehenden Builds.

Vier unabhängige frische Reviews (fe036_early_review, fe036_middle_review,
fe036_late_review, fe036_ui_review) nach Korrekturen ohne offene Findings:
Schema-Vertrag vervollständigt, commit-Etappen vereinheitlicht, Syntaxfolge erklärt,
OR-Gegenprobe repariert, modulare/TS-Referenzen vervollständigt, Bedienaufträge
differenziert, Lazy-Ladefehler und verspätete Prüfergebnisse abgesichert.
Öffentliche Primärquellen abgeglichen; keine privaten Ablagen gelesen.

Bewusst offen: sichere Ausführung frei bearbeiteter neuer Programme, DOM/Debugger/
async-Adapter, Werkzeugvorlagen, vollständige strict-Typprüfung, neue Validatoren,
Fortschritt/KI-Themenfolge und praktische Werkstattabnahme 18–31. Referenztests
sind kein Nachweis einer bereits integrierten Lerncode-Laufzeit. Keine neuen
Bibliotheken, privaten Materialien, Installationspakete, Commits oder Veröffentlichungen.
