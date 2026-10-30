# Brief CONTENT-068: DPA-DB – präzise PostgreSQL-Auswertungen

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

24 SC-Fragen DPA-DB-143 bis -166 anhängen, Modul 142 → 166.
Neue konkrete Auswertungsfälle zu Fenstern, Gruppierung, Datumswerten,
JSON und NULL-Semantik, ohne Wiederholungen aus FIAE-DB/DPA-DB.

## Betroffene Dateien

- `content/questions/DPA-DB.csv`
- `docs/agent-briefs/CONTENT-068-dpa-db-sql-auswertungen.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

AGENTS.md und ORCHESTRATOR.md. Offizielle PostgreSQL-18-Dokumentation,
konkrete Seiten direkt bei den Fragen. Eigene kleine vollständig definierte
Tabellenfälle. Alter Byte-Präfix vor Änderung: SHA256
1c78e1a4bcbc703594105461be63778d39cecca1b3cf90d565f14ee69887235d.

## Abnahmekriterien

- [x] Genau 24 neue SC-Fragen, Schema und alter Byte-Präfix erhalten.
- [x] PostgreSQL-Lösungen, Datentypen und NULL-/Reihenfolgeannahmen eindeutig.
- [x] Keine globalen Inhaltsduplikate und keine systematischen Antwort-Tells.
- [x] Unabhängiger Vollreview mit tatsächlicher Primärquellenrecherche bestanden.
- [x] Content-Validator, Diff-Prüfung und Archivierungscheck erfolgreich.

## Ergebnis

24 Fragen DPA-DB-143 bis -166 angehängt, Modul 142 → 166.
Unabhängiger vollständiger Review durch content068_review einschließlich
tatsächlicher Recherche offizieller PostgreSQL-18-Quellen BESTANDEN.
158: Artikel-Schablone der korrekten Antwort an alle Optionen angeglichen,
Endfassung erneut mit App-Parser eingelesen und nachgeprüft.

Quellenzuordnung (alle direkt in den CSV-Zeilen):
143 Aggregate Expressions/FILTER, 144–148 Aggregate Functions,
149/150 Grouping Sets, 151 Window Functions/Standardrahmen,
152/153 Window Function Calls/ROWS und RANGE, 154/155 Window Functions,
156 Comparison Functions, 157 Conditional Expressions/NULLIF,
158–160 JSON Functions, 161 Set Returning Functions,
162 Date/Time Types/timestamptz, 163/164 Date/Time Functions,
165 Comparison Operators, 166 Recursive Queries.

Alle 24 Musterlösungen eindeutig, keine globalen Lernzielduplikate.
Tatsächlicher App-Parser readCsvFile/parseRowsRaw bestätigt je 14 Felder
und erhaltene JSON-Anführungszeichen. Alter Byte-Präfix unabhängig und
durch den Autor identisch gehasht: oben dokumentierter SHA256 unverändert.
Content-Validator, git diff --check und Archivierungscheck erfolgreich.
Keine Datenbankimporte, Builds, Commits oder Pushes.
