# Brief CONTENT-121: DVK-CLD – Kubernetes-Detailfälle

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen DVK-CLD-148 bis -171 ergänzen, Modul147 →171.
Deployment-Steuerung, Probes, Ressourcenangaben, Init-Container und Konfiguration.

## Betroffene Dateien

- `content/questions/DVK-CLD.csv`
- `docs/agent-briefs/CONTENT-121-dvk-cld-kubernetes-detailfaelle.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

AGENTS.md/ORCHESTRATOR.md. Alle147 Modulaltstämme gelesen; globale
Kubernetes-Lernzielsuche über26CSV und sämtliche relevanten Stämme gelesen.
Besonders FISI-SYS-088–091,101–123 enthalten bereits Grundlagen zu
Readiness/Startup/CPU-Requests/-Limits, Controllern, Netzwerk, RBAC,
Scheduling und Volumes. DVK-CLD-091–093 ebenfalls nicht wiederholen.
Primärquellen aktuelle offizielle Kubernetes-Dokumentation: Deployments,
Pod Probes, Resource Management, Init Containers, ConfigMaps, Downward API
und Services. Keine kubectl-, Cluster-, Netzwerk- oder Datenbankaktionen.
Alter Byte-Präfix86805 Byte, SHA256:
11f0cad68f11c81d42012768dd8c2c7fcab19d7c3a7eafc997455b92a2cf22f6.

## Abnahmekriterien

- [x] Genau24 SC-Fragen, global eindeutige IDs,14 Felder, Altbytes erhalten.
- [x] Betriebsprämissen und Lösungen mit selbst gelesenen Primärquellen belegt.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Modul171, Katalog4377 nach Ergänzung dieses Batches.
App-Parser bestätigt171 Records mit14 Feldern und global eindeutigen IDs.
86805 Altbytes mit obigem SHA256 unverändert. Validator und Diff nach
allen Korrekturen grün (Gesamtkatalog inzwischen4401 mit CONTENT-122).

Frischer Reviewer content121_review las alle24 Vollfragen,147 Altstämme
und globale Kubernetes-Lernzielkandidaten über26CSV. Eigene aktuelle
Primärlektüre zu Deployments, Probes/gRPC, Ressourcen, Init-Containern,
ConfigMaps, Downward API, Services/VirtualIPs und Pod-Lifecycle.
154 proaktiv dreifachen Sie-Anfang diversifiziert;166 Er-wird-Tell beseitigt.
156 fachnahe Readiness-/Pod-Ersatz-/Begleitcontainer-Verwechslungen eingesetzt.
163 vorweggenommene Beendigung aus Stamm entfernt und Distraktoren erneuert.
167 vorhandenen geänderten Schlüssel und plausible Aktualisierungsalternativen
präzisiert. Gespeicherte Endfassungen unabhängig nachgelesen und freigegeben.
Keine offenen Fach-, Duplikat- oder Antwort-Tell-Findings.
Keine kubectl-, Cluster-, Netzwerk- oder Datenbankaktionen.
