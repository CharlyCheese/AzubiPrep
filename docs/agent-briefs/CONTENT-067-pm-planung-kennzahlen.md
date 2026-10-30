# Brief CONTENT-067: PM – Planungsfälle, Projektkennzahlen und Arbeitsfluss

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

PM von 33 auf 57 Fragen erweitern: ALLE-PM-034 bis -057.
24 eigene Anwendungsfälle mit expliziten Rechenannahmen, keine Wiederholung
vorhandener Definitionen. Globale Nähe zu Fachrichtungs-Projektmodulen prüfen.

## Betroffene Dateien

- `content/questions/PM.csv`
- `docs/agent-briefs/CONTENT-067-pm-planung-kennzahlen.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

AGENTS.md und ORCHESTRATOR.md. Scrum Guide 2020, Kanban Guide Mai 2025,
OpenStax Principles of Finance, DOE Earned Value Management und
autoritative Netzplan-/Schätzquellen. Eigene vollständig definierte Zahlenfälle.

## Abnahmekriterien

- [x] 24 neue SC-Fragen im bisherigen 14-Feld-Schema, bestehende Zeilen erhalten.
- [x] Lösungen, Rechnungen und Modellannahmen eindeutig und unabhängig geprüft.
- [x] Keine Lernzielduplikate, plausible Distraktoren ohne Sprachmuster-Tells.
- [x] Frischer unabhängiger Vollreview mit recherchierten Primärquellen bestanden.
- [x] Content-Validator, Diff-Prüfung und Archivierungscheck erfolgreich.

## Ergebnis

24 Fragen ALLE-PM-034 bis -057 angehängt, Modul 33 → 57.
Unabhängiger Vollreview und vollständige erneute Endfassungsprüfung durch
content067_review BESTANDEN. Alle Rechnungen unabhängig bestätigt.

Behobene Befunde: 038 um Pufferannahme für alle anderen Pfade ergänzt,
damit ein nahezu kritischer Pfad die geplante Verkürzung nicht begrenzt.
040 wegen Nähe zu DVK-PROJ-081 komplett durch Kommunikationswege ersetzt
(5 × 4 / 2 = 10). 046 durch konkreten Konflikt externer Aufgabenzuweisung
ersetzt. Antwortlängen und zusätzliche Einschränkungen in 044/047/048/049/053
angeglichen, Artikel-Asymmetrie in 048 beseitigt. Keine Restbefunde.

Quellenzuordnung: 034/057 PMI Project Estimating (Standardabweichung,
Gewichtungen), 035–038 PMI Practice Standard for Scheduling, 039 OpenStax
Relevant Information/Sunk Costs, 040 eigene Kombinatorik, 041 explizite
ROI-Rechnung, 042 OpenStax NPV, 043 OpenStax Break-even, 044/045/055 NSF
EVM Gold Card (045 zusätzlich PMI TCPI), 046–050 Scrum Guide 2020,
051–054 Kanban Guide Mai 2025, 056 eigene vollständig definierte
Erwartungskostenrechnung. Direkte Quellen in den CSV-Zeilen.
Zusätzliche Reviewbelege:
https://www.pmi.org/learning/library/to-complete-performance-index-tcpi-6009
https://openstax.org/books/principles-managerial-accounting/pages/3-2-calculate-a-break-even-point-in-units-and-dollars
NSF-Formeln via offiziellem Index recherchiert; PDF-Direktabruf danach 403.

Tatsächlicher App-Parser bestätigt 14 Felder je Zeile. Alte Zeilen 001–033
unverändert gegenüber HEAD. Globale Lernzielsuche ohne weitere Duplikate.
Content-Validator, git diff --check und Archivierungscheck erfolgreich.
Keine Datenbankimporte, Builds, Commits oder Pushes.
