# Brief CONTENT-046: FISI-SYS – Speicherplanung, Virtualisierung und Containerbetrieb

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

FISI-SYS von 76 auf 100 Fragen erweitern. 24 eigene SC-
Anwendungsaufgaben ergänzen vorhandene Definitionen. Bestehende IDs und
Lernfeld-/Modulzuordnung erhalten. Neue IDs beginnen bei 77, nicht
notwendigerweise bei der bisherigen Datensatzanzahl plus eins.

## Betroffene Dateien

- `content/questions/FISI-SYS.csv`
- `docs/agent-briefs/CONTENT-046-fisi-sys-infrastrukturfaelle.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Primärquellen

AGENTS.md, ORCHESTRATOR.md. Eigene Lernaufgaben, keine kopierten IHK-Fragen.
Recherche am 2026-10-29, konkrete ID-/Quellenzuordnung im Ergebnis ergänzen.

- [Red Hat Storage](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/managing_storage_devices/)
- [Docker Storage](https://docs.docker.com/engine/storage/)
- [Kubernetes Workloads](https://kubernetes.io/docs/concepts/workloads/)

## Umsetzung und Abnahme

- [x] Genau 24 neue SC-Fragen FISI-SYS-077 bis -100, bestehendes CSV-Schema erhalten.
- [x] Alte 76 Datensätze unverändert, IDs/Texte eindeutig, vier unterschiedliche Optionen.
- [x] Rechnungen und Fallannahmen prüfen, Systeme/Sonderfälle klar eingrenzen.
- [x] Eindeutig richtige Lösung/Erklärung, echte Anwendung statt Definitionsduplikat.
- [x] Plausible nahe Distraktoren, kein systematischer Längen-/Schablonen-Tell.
- [x] Vollständiger unabhängiger Fachreview mit Primärquellen, Findings nachgeprüft.
- [x] Content-Validierung, Diff-Prüfung und Archivierungscheck erfolgreich.

## Ergebnis

24 neue Fragen FISI-SYS-077 bis -100, Modul jetzt 100 Fragen.
Unabhängiger Vollreview und Nachprüfung bestanden. Fachferne Distraktoren
in 080/081/084–094/096/099 ersetzt, Stämme 086/087/094 präzisiert.
Alte 76 Datensätze unverändert. Rechnungen unabhängig bestätigt:
12/16/8 TB, 2 CPU Rest, 3 Stunden, 360 kWh und 12 vCPU-Stunden.

Primärquellen (Recherche am 2026-10-29):
- 077–081: Red Hat RAID-Level, Spiegelung und Speicherverwaltung.
- 082: Red Hat Thin-Pool-Verwaltung.
- 083: [Broadcom Snapshot-Best-Practices](https://knowledge.broadcom.com/external/article/318825/best-practices-for-using-vmware-snapshots.html).
- 084: [Microsoft Speicherleistung](https://learn.microsoft.com/en-us/azure/virtual-machines/premium-storage-performance).
- 085/099: [AWS Instance Store](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-store-lifetime.html) und [Shared Responsibility](https://aws.amazon.com/compliance/shared-responsibility-model/).
- 086/087: Docker Laufzeitkonfiguration und [Volumes](https://docs.docker.com/engine/storage/volumes/).
- 088–093: Kubernetes Probes, Ressourcenverwaltung und Topology Spread Constraints.
- 094: [Microsoft Skalierung](https://learn.microsoft.com/en-us/azure/well-architected/scalability/design-scale).
- 095/096: Microsoft Cluster Quorum und Red Hat Fencing.
- 097/098/100: eigene ausdrücklich eingegrenzte Rechenaufgaben.

Content-Validierung, Diff-Prüfung und Archivierungscheck erfolgreich.
Keine Builds, Datenbankimporte, Commits oder Pushes.
