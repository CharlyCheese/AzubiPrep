# Brief CONTENT-041: DPA-PRO – Prozesskennzahlen, BPMN-Abläufe und Verbesserungsentscheidungen

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

DPA-PRO von 51 auf 75 Fragen erweitern. 24 neue, selbst
formulierte SC-Aufgaben mit konkreten Anwendungsfällen statt bloßer
Definitionswiederholung. Bestehende Modul-/Lernfeldzuordnung erhalten.
Ausgangsbestand dieser Arbeitsrunde: 2433 Fragen.

## Betroffene Dateien

- `content/questions/DPA-PRO.csv`
- `docs/agent-briefs/CONTENT-041-dpa-pro-prozessfaelle.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Primärquellen

AGENTS.md, ORCHESTRATOR.md und abgeschlossene CONTENT-038-Runde.
Recherche am 2026-10-29. Eigene Lernaufgaben, keine kopierten Prüfungsfragen.

- [OMG BPMN 2.0.2](https://www.omg.org/spec/BPMN/2.0.2/)
- [Camunda BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)
- [Lean Enterprise Institute](https://www.lean.org/lexicon-terms/)

Konkrete ID-Quellenzuordnung und Reviewbefunde werden im Ergebnis ergänzt.

## Umsetzung und Abnahme

- [x] 24 neue SC-Fragen DPA-PRO-052 bis -075 mit 14 Spalten.
- [x] Bisherige 51 Zeilen unverändert, eindeutige IDs/Texte und vier verschiedene Optionen.
- [x] Rechenfälle selbst gegenprüfen, Annahmen und Fragestämme eindeutig.
- [x] Keine bloßen Definitionsduplikate, plausible fachnahe Distraktoren.
- [x] Kein systematischer Längen-/Detailgrad-Bias oder exklusives Distraktormuster.
- [x] Vollständiger unabhängiger Fachreview mit Primärquellen, Findings behoben und nachgeprüft.
- [x] Content-Validierung, Diff-Prüfung und Archivierungscheck erfolgreich.

## Ergebnis

24 neue SC-Fragen, DPA-PRO jetzt 75. Vollständiger unabhängiger Fachreview
am 2026-10-29 einschließlich aller 96 Optionen: **BESTANDEN** nach
Nachprüfung der aktuellen 062/067/074/075, keine offenen Findings.

Korrigiert: WIP-Fehlannahmen statt Farb-/Anzeige-Tricks, XOR-Merge-Optionen
sprachlich parallel, fachnahe Ausnahmebehandlungs- und Zielkonfliktalternativen.
062-Erklärung auf Teamlimit einschließlich blockierter Arbeit abgestimmt.
Alle Musterlösungen fachlich richtig, keine Definitionsduplikate, kein
systematischer Längen-/Detailgrad- oder Meta-Tell. Alte 51 Zeilen unverändert.

Rechnungen durch Python und unabhängig im Review bestätigt: 052: 15 min,
053: 10 min, 054: 20 %, 055: 40/h, 056: weiter 40/h, 057: 80 %, 058: 4 h, 059: 2 min/Stück,
060: 90 %, 061: 100 min, 064: 20 min. Little-Annahmen und Systemgrenze ausdrücklich.
BPMN-Tokenregeln gegen Norm und Engine-Doku getrennt geprüft.

ID-Quellen: 052–061 MIT/Lean/ASQ bzw eigene Zahlenaufgaben; 062 Kanban;
063 IEEE; 064 eigene Zeitdifferenz; 065–073 OMG/Camunda; 074–075 KMK
LF11c und eigene Prozessfälle. Zusätzliche tatsächlich gelesene Quellen:
- [MIT Kapazität/Little](https://www.ocw.mit.edu/courses/15-760b-introduction-to-operations-management-spring-2004/16dde953a29f89a4d2018361900ce886_lec3_capacity.pdf)
- [Kanban Guide](https://kanbanguides.org/the-kanban-guide/2025.5/)
- [IEEE Process Mining](https://www.tf-pm.org/upload/1580737614108.pdf)
- [ASQ FPY](https://asq.org/quality-resources/quality-glossary)
- [Camunda Timer](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)
- [Camunda Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

Gesamt nach CONTENT-041: 2505 Fragen. Content-Validator ohne Fehler,
Archivierung und check-agent-briefs erfolgreich. Kein DB-Import, Build,
Commit oder Push; persönliche Freigabe nicht vorweggenommen.
