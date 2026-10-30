# Brief CONTENT-044: FISI-PROJ – Migrationsplanung, Wiederherstellungsziele und Projektabnahme

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

FISI-PROJ von 55 auf 79 Fragen erweitern. 24 eigene SC-
Anwendungsaufgaben ergänzen die Definitionen durch konkrete Entscheidungen.
Bestehende Modul-/Lernfeldzuordnung erhalten.

## Betroffene Dateien

- `content/questions/FISI-PROJ.csv`
- `docs/agent-briefs/CONTENT-044-fisi-proj-migrationsfaelle.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Primärquellen

AGENTS.md, ORCHESTRATOR.md; Recherche am 2026-10-29, eigene Lernaufgaben,
keine kopierten Prüfungsfragen. Konkrete ID-Zuordnung im Ergebnis ergänzen.

- [NIST SP800-34](https://csrc.nist.gov/pubs/sp/800/34/r1/upd1/final)
- [Microsoft Migrationsplanung](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/plan/)
- [AWS Disaster Recovery](https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/recovery-options-in-the-cloud.html)

## Umsetzung und Abnahme

- [x] 24 neue SC-Fragen FISI-PROJ-056 bis -079, 14 Spalten.
- [x] Alle alten 55 Zeilen unverändert, eindeutige IDs/Texte und vier verschiedene Optionen.
- [x] Rechen-/Ergebnisbeispiele prüfen, Systemannahmen ausdrücklich nennen.
- [x] Fachlich richtig und eindeutig, zusätzliche Anwendung statt Definitionsduplikat.
- [x] Plausible nahe Distraktoren, kein systematischer Längen-/Schablonen-Tell.
- [x] Vollständiger unabhängiger Fachreview mit Primärquellen bestanden, Findings nachgeprüft.
- [x] Content-Validierung, Diff-Prüfung und Archivierungscheck erfolgreich.

## Ergebnis

24 neue SC-Fragen, FISI-PROJ jetzt79. Vollständiger unabhängiger Review
am2026-10-29: alle96Optionen/Schlüssel/Erklärungen/Schwierigkeiten geprüft,
**BESTANDEN** nach Nachprüfung058. Keine offenenFindings.

058 hatte zunächst dreiJa-Distraktoren gegenüber einerNein-Lösung. Jetzt
vier parallele Etwa-Daueroptionen, zweimal Fenster reicht und zweimal
Fenster reicht nicht. Fachrechnung bleibt 5,56 h. Kein systematischer Längen-
oder verbleibender Schablonen-Tell. Alte 55 Zeilen unverändert, 14 Spalten,
keine IDs/Textduplikate und echte zusätzliche Anwendung.

Rechnungen unabhängig und ergänzend mit Python: 056: 20 min, 057: 75 min,
058: 20.000 s = 5,56 h, 063: 128 GiB nach Ausfall, 064: 43,2 min, 066: 7600/7800 Euro,
067: 5 Tage, 068: 9 Tage, 069: 2 Tage, 078: 150.000 Euro, 079: CPI 0,8. Annahmen zu
dezimalen Einheiten, Overcommit, Ressourcenengpässen und Kosten explizit.
073 behauptet keine allgemeine Rechtsfolge, sondern vereinbarte Mängelbehandlung.

Tatsächlich recherchierte Primärquellen und ID-Zuordnung:
- 056–057/062/070/072/074–075: [NIST800-34 Volltext](https://nvlpubs.nist.gov/nistpubs/legacy/sp/nistspecialpublication800-34r1.pdf), insbesondere 3.2.1/3.5, Recovery Testing/Procedures/Roles.
- 059–061/065/071: [MicrosoftMigration](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/migrate/plan-migration) und [Pilotplanung](https://learn.microsoft.com/en-us/windows/deployment/update/create-deployment-plan).
- 064/076: [GoogleVerfügbarkeit](https://sre.google/sre-book/availability-table/) und [Monitoring](https://sre.google/sre-book/monitoring-distributed-systems/).
- 068–069: [PMINetzplan](https://www.pmi.org/learning/library/critical-path-method-calculations-scheduling-8040).
- 078–079: [PMIEarnedValue](https://www.pmi.org/learning/library/make-earned-value-work-project-6001).
- 058/063/066/067: eigene Rechenaufgaben, 067 Formel im Fragestamm.

Gesamt nach Batch: 2577. Content-Validator, Diff und Archivierungscheck grün.
Keine System-/Datenbankänderungen, kein Build/Commit/Push, persönliche Freigabe
nicht vorweggenommen.
