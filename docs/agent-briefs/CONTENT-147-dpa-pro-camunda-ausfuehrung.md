# Brief CONTENT-147: DPA-PRO – Camunda-Ausführungsdetails

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen DPA-PRO-172 bis -195 ergänzen, Modul171 →195.
Camunda8.10: Multi-Instance-Daten, Nachrichtenlebenszyklus,
Variablengeltung und konkrete Prozessausführungssemantik.

## Betroffene Dateien

- `content/questions/DPA-PRO.csv`
- `docs/agent-briefs/CONTENT-147-dpa-pro-camunda-ausfuehrung.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle171 Altstämme gelesen. Globale26CSV Lernziele abgleichen. Bereits
vorhandene BPMN-Gateway-, Boundary-/Terminate-, Aufgaben- und
Korrelationsschlüsselfragen052–086 sowie DMN/FEEL100–147 nicht wiederholen.
Die erste mögliche PM/BPMN-Idee wurde nach globaler Bestandsprüfung nicht
verfolgt; dieser Batch gehört zum Modul für Prozessautomatisierung.
Eigene aktuelle Primärrecherche offizielle Camunda8.10-Dokumentation.
Nur Lehrfragen und gedachte Fälle, keine Engine, Installation, Prozess-
Deployment, HTTP-Aufrufe an Dienste oder Änderung echter Workflows.
Kein DB-Zugriff, .env, Server, Build, Commit oder Push.
Altpräfix89541 Byte SHA256:
e25cf31f7d50f47aafcd0dfa604cfa541f33b5b7c724f551369ef5bec738862f.

## Abnahmekriterien

- [x] 24 SC-Fragen/14 Felder, globale IDs eindeutig, Altbytes erhalten.
- [x] Versions-/Werkzeugsemantik samt Musterlösungen frisch belegt.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 SC-Fragen gespeichert, DPA-PRO171 →195, global5001 eindeutige Fragen.
App-Parser und Validator bestanden, Diff ohne Whitespacefehler; Altpräfix
unverändert. Reviewer content147_review las alle24 Enddatensätze und171
Altstämme, verglich globale26 CSV und recherchierte die sechs offiziellen
Camunda8.10-Quellen selbst. Ein P2-Lernzielduplikat in193 (allgemeine
Idempotenz) wurde vollständig durch konkrete Job-Lease-Token-Semantik
ersetzt. Erneuter gespeicherter Endfassungsreview bestanden, keine offenen
Findings; keine Antwortlängen-/Schablonen-Tells festgestellt.

Primärquellen:
- https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/
- https://docs.camunda.io/docs/components/concepts/messages/
- https://docs.camunda.io/docs/components/concepts/variables/
- https://docs.camunda.io/docs/components/modeler/bpmn/event-subprocesses/
- https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/
- https://docs.camunda.io/docs/components/concepts/job-workers/
