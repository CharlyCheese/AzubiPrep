# Brief CONTENT-048: DPA-PROJ – Datenprodukt-Anforderungen, fachliche Abnahme und Betriebsübergabe

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

DPA-PROJ von 51 auf 75 Fragen erweitern. 24 eigene SC-
Anwendungsaufgaben ergänzen vorhandene Definitionen. Bestehende IDs und
Lernfeld-/Modulzuordnung erhalten. Neue IDs beginnen bei 52, nicht
notwendigerweise bei der bisherigen Datensatzanzahl plus eins.

## Betroffene Dateien

- `content/questions/DPA-PROJ.csv`
- `docs/agent-briefs/CONTENT-048-dpa-proj-datenprodukt-abnahme.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Primärquellen

AGENTS.md, ORCHESTRATOR.md. Eigene Lernaufgaben, keine kopierten IHK-Fragen.
Recherche am 2026-10-29, konkrete ID-/Quellenzuordnung im Ergebnis ergänzen.

- [KMK Rahmenlehrplan LF12c](https://www.kmk.org/fileadmin/Dateien/pdf/Bildung/BeruflicheBildung/rlp/Fachinformatiker_19-12-13_EL.pdf)
- [dbt Tests](https://docs.getdbt.com/docs/build/data-tests)
- [Google SRE Monitoring](https://sre.google/sre-book/monitoring-distributed-systems/)

## Umsetzung und Abnahme

- [x] Genau 24 neue SC-Fragen DPA-PROJ-052 bis -075, bestehendes CSV-Schema erhalten.
- [x] Alte 51 Datensätze unverändert, IDs/Texte eindeutig, vier unterschiedliche Optionen.
- [x] Rechnungen und Fallannahmen prüfen, Systeme/Sonderfälle klar eingrenzen.
- [x] Eindeutig richtige Lösung/Erklärung, echte Anwendung statt Definitionsduplikat.
- [x] Plausible nahe Distraktoren, kein systematischer Längen-/Schablonen-Tell.
- [x] Vollständiger unabhängiger Fachreview mit Primärquellen, Findings nachgeprüft.
- [x] Content-Validierung, Diff-Prüfung und Archivierungscheck erfolgreich.

## Ergebnis

24 Fragen DPA-PROJ-052 bis -075 ergänzt, Modul jetzt 75 Fragen.
Unabhängiger Vollreview und Nachprüfungen bestanden. 053/067/075 durch
neue Themen Barwert, Funktionsfreigaben und CSV-Übergabe ersetzt.
Fachnahe Distraktoren, aktuelle Erklärungen und klare Stämme 065/073
nachgeprüft. Alte 51 Datensätze unverändert. Kein verbleibender
Längen- oder Schablonen-Tell und keine Inhaltsduplikate gefunden.

Primärquellen, recherchiert am 2026-10-29:
- 052/054/055/061/071: KMK LF12c und Microsoft Well-Architected Testing.
- 053: [Microsoft BW](https://support.microsoft.com/de-de/excel/functions/pv-function), Rechnung 1.000/1,1 = 909,09 Euro.
- 056: scikit-learn accuracy_score; 072: Google ML Generalization.
- 057/059/061: Microsoft Purview, Master Data Management und Lineage.
- 058: [JSON Schema](https://json-schema.org/understanding-json-schema/reference/object#additionalproperties).
- 060/069: eigene Mengenbilanz 9.850+150=10.000 und Quote 988/1000=98,8 %.
- 062/063: AWS DynamoDB Error Handling und SDK Retry Behavior.
- 064: AWS Builders Library, Making retries safe with idempotent APIs.
- 065–067: [Google SRE Canarying](https://sre.google/workbook/canarying-releases/), Schattenlauf, Vergleich und Feature Flags.
- 068: AWS Builders Library, Ensuring rollback safety during deployments.
- 070: Google SRE Monitoring Distributed Systems.
- 073: Microsoft Power BI Row-level Security.
- 074: [OWASP Data Protection](https://owasp.github.io/DevSecOpsGuideline/3-Governance/3-2-Data-protection/).
- 075: [Microsoft führende Nullen](https://support.microsoft.com/en-us/excel/keeping-leading-zeros-and-large-numbers) und Power BI CSV-Unicode-Import.

Content-Validierung, Diff-Prüfung und Archivierungscheck erfolgreich.
Keine Datenbankimporte, Builds, Commits oder Pushes.
