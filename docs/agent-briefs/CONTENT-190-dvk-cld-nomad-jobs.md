# Brief CONTENT-190: DVK-CLD – Nomad-Jobs

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen DVK-CLD-220 bis -243 ergänzen, Modul 219 → 243.
Jobs, Platzierung, Task-Lebenszyklus und Fehlerstrategien mit Nomad.

## Betroffene Dateien

- `content/questions/DVK-CLD.csv`
- `docs/agent-briefs/CONTENT-190-dvk-cld-nomad-jobs.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle 219 Altstämme gelesen, globale Nomad-Suche ohne Treffer.
Vorhandene Docker-/Kubernetes-/Terraform-/Helm-Fragen nicht als allgemeine
Orchestrierungsdefinitionen wiederholen. Konkrete Nomad-Jobverträge prüfen.
Frische Primärrecherche in HashiCorp-Nomad-Dokumentation.
Keine Installation, Builds, Dienste, DB/.env, Commits oder Pushes.
Altpräfix 125388 Byte SHA256:
3c1f17e037e0fad4984b5c3087ad3cbb2e35d5cfbb2c81e9229000e34080b871.

## Abnahmekriterien

- [x] 24 SC-Fragen, globale IDs eindeutig, Altbytes erhalten.
- [x] Frische Primärbelege, eindeutige Lösungen, fachnahe Distraktoren.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Modul 219 → 243, Gesamtkatalog 6009 → 6033.
Frischer unabhängiger content190_review prüfte sämtliche 24 gespeicherten
Fragen, 96 Optionen und Erklärungen, 219 Altstämme sowie globale 26 CSV.
Eigene frische Primärrecherche auf acht offiziellen Nomad-v2.1-Seiten,
einschließlich der eigentlichen Parametertexte. Ohne Findings bestanden;
tatsächliche Endfassung vollständig geprüft, keine Korrekturen erforderlich.
Keine Lernzielduplikate zu K8s-/Compose-/Terraform-/Helm-Verträgen oder
allgemeinem Backoff PROJ063. Nomad-Jitter mit konkreter 25-%-Grenze und
gedeckelte Reschedule-Verzögerung sind eigenständige Lernziele.
Altpräfix unverändert, globale IDs eindeutig, 243 Modulrecords/24 neue SC,
14 Felder. Statisch unabhängig bestätigt: 3×2=6 Taskinstanzen,
min(60,30)=30 Sekunden, Backoff 30/60/100/100 und Mengenvergleich.
App-Parser, Content-Validator (6033 Fragen/26 CSV), Diff- und Archivcheck grün.
Kein Nomad-Cluster oder Dienst gestartet.

Primärquellen unter https://developer.hashicorp.com/nomad/docs/job-specification/:
- job
- group
- task
- update
- restart
- reschedule
- lifecycle
- constraint
