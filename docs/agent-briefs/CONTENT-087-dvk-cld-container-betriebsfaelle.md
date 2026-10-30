# Brief CONTENT-087: DVK-CLD – Container bauen und betreiben

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

24 SC-Fragen DVK-CLD-100 bis -123 ergänzen, Modul 99 → 123.
Konkrete Docker-/Compose-Fälle statt bereits vorhandener Containergrundlagen.
Keine Container, Builds oder Infrastrukturmaßnahmen ausführen.

## Betroffene Dateien

- `content/questions/DVK-CLD.csv`
- `docs/agent-briefs/CONTENT-087-dvk-cld-container-betriebsfaelle.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

AGENTS.md, ORCHESTRATOR.md; offizielle Docker-Dokumentation.
99 Bestandsfragen gelesen; globale Vorprüfung berücksichtigt insbesondere
FISI-SYS-086/087 (Konfiguration/Persistenz), FIAE-SWE-096 (Digest) und
FISI-BET-050/051 (Image/Container und Volumezweck).
Alter Byte-Präfix SHA256:
7d5636737ae7e9fc40e096d2add47d25487de26dc483eb6c8d2c94a001f32cca.

## Abnahmekriterien

- [x] Genau 24 SC-Fragen, alte Bytes/Schema erhalten, IDs eindeutig.
- [x] Docker-Semantik und Voraussetzungen primärquellenbelegt.
- [x] Keine globalen Lernzielduplikate oder systematischen Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, DVK-CLD99 → 123. Gesamtkatalog nach diesem Batch3561.
Frischer Readonly-Reviewer content087_review: alle24 Fragen mit eigener
offizieller Docker-Primärquellenrecherche geprüft, globale semantische Suche
über26CSV, Endfassung nach Grammatikberichtigung107 erneut gelesen:
BESTANDEN, keine offenen Findings. Keine systematischen Tells oder Duplikate.

Echter App-Parser:123 Records,14 Felder je Zeile,24 neue SC; alter Byte-Präfix
unverändert. Content-Validator, Diff- und Archivierungscheck bestanden.
Keine Dockerbefehle, Builds oder Infrastrukturmaßnahmen ausgeführt.

Primärquellen pro Frage in der CSV: offizielle Docker-Dokumentation zu
Dockerfile, Port Publishing, Compose Networking, Bind Mounts, Volumes,
Build Context, Multi-Stage Builds, Cache Invalidation, Build Secrets,
Running Containers, Compose Startup Order/Down, Logging, Restart Policies
und Buildx-Buildoptionen (https://docs.docker.com/).
