# Brief CONTENT-127: DPA-PROJ – dbt-Historisierung und Überwachung

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen DPA-PROJ-136 bis -159 ergänzen, Modul135 →159.
dbt: Snapshot-Strategien, Metadaten, Freshness und dokumentierte Exposures.

## Betroffene Dateien

- `content/questions/DPA-PROJ.csv`
- `docs/agent-briefs/CONTENT-127-dpa-proj-dbt-historie.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle135 Altstämme gelesen, globale Suche über26CSV nach Snapshot/dbt,
Freshness, Strategien und Exposures. Vorhandene dbt-Grundlagen112–135,
allgemeine Aktualitätsüberwachung049 und SCD2-DPA-DB-121 nicht wiederholen.
Konkrete dbt-Konfigurations-/Auswertungsfälle, keine allgemeine SCD2-Frage.
Primärquellen aktuelle offizielle dbt-Dokumentation, snapshots und einzelne
resource-configs/strategy,check_cols,updated_at,hard-deletes,
dbt_valid_to_current sowie freshness, sources-json und exposures.
Versionsprämissen wo nötig dbt1.10 oder>=1.9 und unterstützter Adapter.
Keine Datenbankverbindung, kein dbt-Lauf oder Installation.
Altpräfix96325 Byte SHA256:
288a42a022f9a6d107cd088d604b668a641524c6b34703f85bfbb051b1af8a72.

## Abnahmekriterien

- [x] 24 SC-Fragen/14 Felder, global eindeutige IDs, Altbytes erhalten.
- [x] Eindeutige primärquellenbelegte Semantik mit Versions-/Adapterprämissen.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

DPA-PROJ135 →159, Katalog4521. content127_review hat alle24 gespeicherten
Fragen und135 Altstämme vollständig unabhängig gelesen, globale
Lernzielüberschneidungen in26CSV geprüft und eigene frische offizielle
dbt-Recherche durchgeführt. Ohne Findings freigegeben. Fachnahe
Distraktoren und keine bindenden Antwort-Tells; SCD2-DPA-DB-121,
allgemeine Aktualitätsüberwachung049 und112–135 andere Lernziele.

Bestätigt: Snapshot-Strategien und konkrete Konfigurationswirkungen,
hard_deletes mit Versions-/Adapterprämissen, vorhandene NULL-Endwerte
nicht rückwirkend geändert, statische SQL-Endwerte, verlorene Zwischenstände,
Freshness-Status/Vererbung/Filter/alternative Ladezeitermittlung, Exposures.
Aktuelle v2-Doku bestätigt weiterhin unterstütztes dbt source freshness
als Legacy-Befehl samt sources.json; kein Versionsfehler daraus.

Primärquellen selbst und vom Reviewer frisch gelesen:
- https://docs.getdbt.com/docs/build/snapshots
- https://docs.getdbt.com/reference/resource-configs/check_cols
- https://docs.getdbt.com/reference/resource-configs/updated_at
- https://docs.getdbt.com/reference/resource-configs/hard-deletes
- https://docs.getdbt.com/reference/resource-configs/dbt_valid_to_current
- https://docs.getdbt.com/reference/resource-configs/freshness
- https://docs.getdbt.com/reference/commands/source
- https://docs.getdbt.com/reference/artifacts/sources-json
- https://docs.getdbt.com/docs/build/exposures
- https://docs.getdbt.com/best-practices/how-we-handle-cdc/2-choosing-incremental-or-snapshots (Reviewer)

App-Parser159/14, global eindeutige IDs. Altbytehash unverändert.
Content-Validator4521/26 Module und Diff-Check erfolgreich. Brief/DONE/
STATUS archiviert und geprüft. Keine Datenbank- oder dbt-Ausführung.
