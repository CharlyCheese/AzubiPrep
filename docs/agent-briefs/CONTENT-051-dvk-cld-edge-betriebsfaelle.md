# Brief CONTENT-051: DVK-CLD – Edge-Pufferung, Cloud-Kosten und verteilte Verarbeitung

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

DVK-CLD von 75 auf 99 Fragen erweitern. 24 neue SC-Anwendungsfragen
DVK-CLD-076 bis -099 ergänzen bestehende Grundlagen. Alle bisherigen
Datensätze und ihre IDs unverändert erhalten.

## Betroffene Dateien

- `content/questions/DVK-CLD.csv`
- `docs/agent-briefs/CONTENT-051-dvk-cld-edge-betriebsfaelle.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Primärquellen

AGENTS.md und ORCHESTRATOR.md. Eigene Lernaufgaben, keine übernommenen
IHK-Fragen. Technische Annahmen ausdrücklich angeben; keine Anleitungen
zur Veränderung realer Maschinen oder Schutzfunktionen.
Primärquellen tatsächlich recherchieren und im Ergebnis zuordnen.

- https://docs.aws.amazon.com/greengrass/v2/developerguide/stream-manager.html
- https://kubernetes.io/docs/concepts/workloads/controllers/deployment/

## Abnahmekriterien

- [x] Genau 24 neue SC-Fragen, CSV-Schema und alte 75 Datensätze unverändert.
- [x] Eindeutige Lösungen und Erklärungen, Rechnungen unabhängig bestätigt.
- [x] Keine Inhaltsduplikate, plausible nahe Distraktoren und klare Annahmen.
- [x] Keine systematischen Längen-, Detailgrad- oder Schablonen-Tells.
- [x] Unabhängiger Vollreview aller neuen Fragen mit Primärquellen bestanden.
- [x] Content-Validierung, Diff-Prüfung und Archivierungscheck erfolgreich.

## Ergebnis

24 SC-Anwendungsfragen DVK-CLD-076 bis -099 ergänzt, Modul jetzt 99 Fragen.
Unabhängiger Vollreview und Nachprüfung bestanden. HPA-Distraktor unter
Berücksichtigung des CPU-Request-Defaultings ersetzt, nahe Latenzoptionen
und einheitliche Antwortformen in 095/098 ergänzt. Alte 75 Zeilen unverändert.

Primärquellen, tatsächlich recherchiert am 2026-10-29:
- 076/079: [AWS Greengrass Streams](https://docs.aws.amazon.com/greengrass/v2/developerguide/work-with-streams.html).
- 077/084/085: AWS Well-Architected, Fail fast and limit queues. Eigene Rechnungen 180 MB, 600 Sekunden und 7 Worker bestätigt.
- 078: Google SRE Monitoring Distributed Systems, Aggregation und Spitzen.
- 080–083: AWS SQS Visibility Timeout, Dead-letter queues und MessageGroupId.
- 086: eigener fiktiver Tarif, 40,40 Euro unabhängig bestätigt.
- 087–090: AWS EC2 Spot Best Practices, Service Quotas, Lambda Execution Environment und NIST SP 500-325 Fog Computing.
- 091–093: [Kubernetes Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/), Service, HPA und CPU-Ressourcen. Surge-Ergebnis 8 nicht terminierende Pods bestätigt.
- 094/095: [HashiCorp Resource Drift](https://developer.hashicorp.com/terraform/tutorials/state/resource-drift) und Terraform Plan.
- 096/097: [AWS S3 Presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html).
- 098: [FinOps Allocation](https://www.finops.org/framework/capabilities/allocation/).
- 099: [S3 Incomplete Upload Lifecycle](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpu-abort-incomplete-mpu-lifecycle-config.html).

Content-Validierung, Diff-Prüfung und Archivierungscheck erfolgreich.
Keine Cloud-Operationen, Datenbankimporte, Builds, Commits oder Pushes.
