# Brief CONTENT-072: FISI-SYS – Kubernetes-Betriebsfälle

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

24 SC-Fragen FISI-SYS-101 bis -124 anhängen, Modul 100 → 124.
Neue konkrete Fälle zur Server-/Containerorchestrierung ohne Wiederholung
der vorhandenen Probe-, Ressourcen- und Replikatfragen.

## Betroffene Dateien

- `content/questions/FISI-SYS.csv`
- `docs/agent-briefs/CONTENT-072-fisi-sys-container-betrieb.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Primärquellen

AGENTS.md, ORCHESTRATOR.md. Offizielle kubernetes.io-Dokumentation,
konkrete Quellenzuordnung in den Fragen. Ausdrückliche Clusterannahmen,
keine produktspezifischen Garantien hinzuerfinden.
Alter Byte-Präfix vor Änderung: SHA256
68d379bc65297d9c1e4c76bc3b8859c03481743684937b2b861ca057dfbc077f.

## Abnahmekriterien

- [x] 24 SC-Fragen, altes Schema und alte Bytes erhalten, IDs global eindeutig.
- [x] Eindeutige Lösungen/Erklärungen mit belegten Annahmen.
- [x] Keine globalen Inhaltsduplikate oder systematischen Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit Primärquellenrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff-Prüfung und Archivierungscheck erfolgreich.

## Ergebnis

24 Fragen FISI-SYS-101 bis -124 angehängt, Modul 100 → 124.
Unabhängiger vollständiger Review durch content072_review mit tatsächlich
recherchierten offiziellen Kubernetes-Quellen und Endfassungsnachprüfung
BESTANDEN. Sprachschablonen in 110/115/121/123 korrigiert,
101 vorsorglich parallel formuliert. Keine offenen Fach-/Duplikatbefunde.

Quellenzuordnung, direkte URLs in den CSV-Zeilen:
101 Pods, 102 StatefulSets, 103 DaemonSet, 104 Jobs, 105 CronJob,
106/107/109 Service, 108 Ingress, 110 ConfigMaps, 111 Secrets,
112 Service Accounts, 113 RBAC, 114/115 Network Policies,
116 Taints and Tolerations, 117 Assigning Pods to Nodes,
118 Disruptions, 119 Deployments, 120–122 Persistent Volumes,
123 Volumes/emptyDir, 124 Horizontal Pod Autoscaling.
Requestbezogene CPU-Utilization unabhängig als 200/500 = 40 % bestätigt.
119 bewusst anderes Lernziel als vorhandene Surge-Rechnung:
Fortschrittsfrist meldet Fehler, veranlasst aber keinen automatischen Rollback.

App-Parser: 124 Datensätze, sämtliche Zeilen 14 Felder, IDs global eindeutig.
Alter Präfix mit 62647 Bytes und oben dokumentiertem SHA256 unverändert.
Content-Validator, git diff --check und Archivierungscheck erfolgreich.
Keine Datenbankimporte, Builds, Commits, Pushes oder Clusteraktionen.
