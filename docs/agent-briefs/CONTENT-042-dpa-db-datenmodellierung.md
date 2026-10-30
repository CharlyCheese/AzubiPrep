# Brief CONTENT-042: DPA-DB – Analytische Datenmodelle, Datenintegration und SQL-Auswertungen

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

DPA-DB von 118 auf 142 Fragen erweitern. 24 eigene SC-
Anwendungsaufgaben ergänzen die Definitionen durch konkrete Entscheidungen.
Bestehende Modul-/Lernfeldzuordnung erhalten.

## Betroffene Dateien

- `content/questions/DPA-DB.csv`
- `docs/agent-briefs/CONTENT-042-dpa-db-datenmodellierung.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Primärquellen

AGENTS.md, ORCHESTRATOR.md; Recherche am 2026-10-29, eigene Lernaufgaben,
keine kopierten Prüfungsfragen. Konkrete ID-Zuordnung im Ergebnis ergänzen.

- [PostgreSQL Window Functions](https://www.postgresql.org/docs/current/tutorial-window.html)
- [PostgreSQL Datenintegrität](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [Kimball Group: Grain](https://www.kimballgroup.com/2003/03/declaring-the-grain/)

## Umsetzung und Abnahme

- [x] 24 neue SC-Fragen DPA-DB-119 bis -142, 14 Spalten.
- [x] Alle alten 118 Zeilen unverändert, eindeutige IDs/Texte und vier verschiedene Optionen.
- [x] Rechen-/Ergebnisbeispiele prüfen, Systemannahmen ausdrücklich nennen.
- [x] Fachlich richtig und eindeutig, zusätzliche Anwendung statt Definitionsduplikat.
- [x] Plausible nahe Distraktoren, kein systematischer Längen-/Schablonen-Tell.
- [x] Vollständiger unabhängiger Fachreview mit Primärquellen bestanden, Findings nachgeprüft.
- [x] Content-Validierung, Diff-Prüfung und Archivierungscheck erfolgreich.

## Ergebnis

24 neue SC-Fragen, DPA-DB jetzt 142. Vollständiger unabhängiger Fachreview
am 2026-10-29: alle 96 Optionen/Schlüssel/Erklärungen/Schwierigkeiten geprüft.
Keine falsche Musterlösung, zusätzliche Anwendung statt Definitionsduplikat.
Alte 118 Zeilen unverändert, 14 Spalten, vier unterschiedliche Optionen.
Kein systematischer Längenbias oder exklusives Distraktormuster.

134/136 hatten fernliegende Falschaussagen; ersetzt durch typische
Fehlannahmen zu Zeitmarkern/Änderungsbatch versus Vollbestand und zur
Soft-Delete-Übernahme versus aktiver Berichtssicht. Aktuelle Zeilen erneut
vom Reviewer gelesen: **BESTANDEN**, keine offenen Findings.

SQL125/127/128 mit SQLite ausschließlich im Arbeitsspeicher gegengeprüft:
DENSE_RANK 1/1/2, laufende Summe 10/30/60, letzte LAG-Differenz −3. Rechnungen
123 = 19, 139 = 2. Februar 01:30 bei festem UTC+2, 142 = 950 unabhängig bestätigt.
Kein PostgreSQL-Livetest, keine Projekt-DB verwendet.

Quellenzuordnung: 119 Kimball Grain; 120–121 SCD2; 122–123 Semi/Non-Additive;
124/131 PostgreSQL Aggregates; 125–130 Window Functions; 132 Late Dimensions;
133 Bridging/Allocation; 134 Debezium Deletes; 135 eigener Watermark-Fall;
136 Soft-Delete-Fall; 137 dbt Contracts als Beleg für Schema-/Namensprüfung,
keine automatische dbt-Eingangsprüfung behauptet;138 Source Keys;
139 Date/Time; 140 Numeric; 141 Multiple Currencies; 142 eigene Ladebilanz.
Weitere tatsächlich recherchierte Quellen:
- [Kimball Type2](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/type-2/)
- [Kimball Bridge](https://www.kimballgroup.com/2014/05/design-tip-166-potential-bridge-table-detours/)
- [Kimball SourceKeys](https://www.kimballgroup.com/2012/07/design-tip-147-durable-super-natural-keys/)
- [Kimball Währungen](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/multiple-currencies/)
- [PostgreSQL Window](https://www.postgresql.org/docs/current/functions-window.html)
- [Debezium](https://debezium.io/documentation/reference/stable/connectors/postgresql.html#postgresql-delete-events)
- [dbt Contracts](https://docs.getdbt.com/docs/mesh/govern/model-contracts)

Gesamt nach diesem Batch: 2529. Validator ohne Fehler, Archivierung und
check-agent-briefs grün. Kein DB-Import, Build, Commit oder Push und keine
persönliche Freigabe vorweggenommen.
