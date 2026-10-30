# Brief CONTENT-089: FIAE-SWE – GitHub-Actions-Abläufe

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

24 SC-Fragen FIAE-SWE-122 bis -145 ergänzen, Modul121 → 145.
Konkrete CI-Abläufe mit GitHub Actions: Abhängigkeiten, Werteübergabe,
Matrix, Cache, wiederverwendbare Workflows und Berechtigungen.
Keine Workflows starten oder Repositoryeinstellungen ändern.

## Betroffene Dateien

- `content/questions/FIAE-SWE.csv`
- `docs/agent-briefs/CONTENT-089-fiae-swe-github-actions.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

AGENTS.md, ORCHESTRATOR.md; offizielle GitHub-Actions-Dokumentation.
121 Bestandsfragen gelesen, globale Vorprüfung auf spezifische Actions-
Syntax und Workflowfunktionen ohne entsprechende Bestandslernziele.
Die vorhandenen allgemeinen CI-Definitionen werden nicht erneut abgefragt.
Alter Byte-Präfix SHA256:
90d2a26b60049351e1f113647e214fa3db4421d2769d63cfa7690788d8dd8b59.
15-Feld-Schema einschließlich LF11a erhalten.

## Abnahmekriterien

- [x] Genau24 SC-Fragen, alte Bytes/Schema erhalten, IDs eindeutig.
- [x] Actions-Semantik und Voraussetzungen primärquellenbelegt.
- [x] Keine globalen Lernzielduplikate oder systematischen Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, FIAE-SWE121 → 145. Gesamtkatalog nach diesem Batch3609.
Frischer Readonly-Reviewer content089_review prüfte alle24 gespeicherten
Fragen mit eigener offizieller GitHub-Primärquellenrecherche sowie globaler
semantischer Suche über26CSV. BESTANDEN ohne Findings. Eigene Vorprüfung
hatte125/137 sprachlich entkoppelt. Keine systematischen Tells oder Duplikate.

Autorenseitig echter App-Parser:145 Records,15 Felder einschließlich LF11a,
24 neue SC; alter Byte-Präfix unverändert. Content-Validator, Diff- und
Archivierungscheck bestanden. Keine Workflows gestartet oder Einstellungen
verändert.

Primärquellen pro Frage in CSV: GitHub-Dokumentation zu Workflow Commands,
Job Outputs, Hosted Runners, Workflow Syntax/Expressions, Matrix/Concurrency,
Reusable Workflows, OIDC, Dependency Caching und Workflow Artifacts
(https://docs.github.com/en/actions/).
