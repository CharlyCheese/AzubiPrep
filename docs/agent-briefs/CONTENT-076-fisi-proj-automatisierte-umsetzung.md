# Brief CONTENT-076: FISI-PROJ – automatisierte Infrastrukturumsetzung

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

24 SC-Fragen FISI-PROJ-080 bis -103 anhängen, Modul 79 → 103.
Konkrete Umsetzungs-/Prüffälle zu Ansible und Terraform im Infrastrukturprojekt.
Keine Programme installieren und keine realen Infrastrukturänderungen ausführen.

## Betroffene Dateien

- `content/questions/FISI-PROJ.csv`
- `docs/agent-briefs/CONTENT-076-fisi-proj-automatisierte-umsetzung.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Primärquellen

AGENTS.md, ORCHESTRATOR.md. Offizielle Ansible-/HashiCorp-Dokumentation.
Eigene Fälle mit expliziten Strategie-, Modul- und Zustandsannahmen.
Alter Byte-Präfix vor Änderung: SHA256
6925eab0250adf5c543ccdc72e0443b9f87ef3d58cb33042bc239286ff70b9c1.

## Abnahmekriterien

- [x] 24 SC-Fragen, altes Schema/alte Bytes erhalten, IDs global eindeutig.
- [x] Eindeutige belegte Werkzeugsemantik und explizite relevante Voraussetzungen.
- [x] Keine globalen Inhaltsduplikate oder systematischen Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit Primärquellenrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff-Prüfung und Archivierungscheck erfolgreich.

## Ergebnis

24 Fragen FISI-PROJ-080 bis -103 angehängt, Modul 79 → 103.
Unabhängiger vollständiger Review durch content076_review mit tatsächlich
recherchierten Ansible-/HashiCorp-Primärquellen und Endfassungsnachprüfung
BESTANDEN. Reine Distraktorphrase unabhängig von/vom in vier Fragen
082/090/097/100 jeweils anders formuliert, erneute Phrasenprüfung grün.
Keine fachlichen oder globalen Duplikatbefunde.

Quellenzuordnung: 080 Ansible package, 081 Handlers, 082/083 Error Handling,
084 Check Mode, 085 Logging/no_log, 086 Inventory Patterns,
087–089 Strategies/serial/forks/run_once je Batch, 090 Privilege Escalation,
091/092 Loops/results/when, 093 template und Templating auf Control Node,
094/097 Terraform plan/Refresh-only, 095 Sensitive Data ohne Ephemeral,
096 State Locking, 098 References, 099 for_each, 100 destroy,
101/102 lifecycle, 103 klassischer CLI import. Direkte Quellen in den Zeilen.
Zusatzbeleg für 093:
https://docs.ansible.com/projects/ansible/latest/playbook_guide/playbooks_templating.html

Abgegrenzte Lernziele: 097 konkrete State-only-Aktualisierung statt allgemeiner
Driftentscheidung aus DVK-CLD-094, 101/102 Lifecycle-Schalter statt allgemeiner
Datenerhaltsfrage beim Ersatz aus DVK-CLD-095.
App-Parser: 103 Datensätze mit je14 Feldern, neue IDs global eindeutig,
alter dokumentierter Byte-Präfix unverändert.
Content-Validator, git diff --check und Archivierungscheck erfolgreich.
Keine Datenbankimporte, Builds, Commits, Pushes, Installationen oder IaC-Läufe.
