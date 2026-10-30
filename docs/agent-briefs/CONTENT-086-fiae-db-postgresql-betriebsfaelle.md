# Brief CONTENT-086: FIAE-DB – PostgreSQL-Indizes, Schema und Sperren

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

24 SC-Fragen FIAE-DB-143 bis -166 ergänzen, Modul 142 → 166.
Konkrete PostgreSQL-18-Fälle zu Indizes, Constraints, Identitäten,
Transaktionen und Zugriffskontrolle. Keine Datenbankbefehle ausführen.

## Betroffene Dateien

- `content/questions/FIAE-DB.csv`
- `docs/agent-briefs/CONTENT-086-fiae-db-postgresql-betriebsfaelle.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

AGENTS.md, ORCHESTRATOR.md, offizielle PostgreSQL-18-Dokumentation.
Alle142Bestandsfragen gelesen. Globale Vorprüfung beachtet insbesondere
FIAE-DB-133 CHECK/NULL,138 Read Committed,139 Serialisierungsretry und141
Indexspaltenreihenfolge; diese Lernziele werden nicht erneut gestellt.
Alter Byte-Präfix SHA256:
68007a6b1a188966aa8d7e8f52465702dc6a75101e0e2ec128f0a5483eeb2579.

## Abnahmekriterien

- [x] Genau24 SC-Fragen, alte Bytes/Schema erhalten, IDs eindeutig.
- [x] PostgreSQL-18-Semantik und Voraussetzungen primärquellenbelegt.
- [x] Keine globalen Lernzielduplikate oder systematischen Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, FIAE-DB 142 → 166. Gesamtkatalog nach diesem Batch3537.
Der frische Readonly-Reviewer content086_review prüfte alle24 Fragen mit
eigener Recherche auf17 offiziellen PostgreSQL-18-Quellseiten und globaler
semantischer Suche über alle26 CSV. Endfassung vollständig erneut gelesen:
BESTANDEN, keine offenen Findings. Exklusive Füllwortsignale automatisch,
nur und grundsätzlich entfernt;149d/150c durch plausible Fehlannahmen ersetzt.
158d gekürzt und146a fachlich plausibler formuliert. Keine Lernzielduplikate.

Echter App-Parser:166 Records,14 Felder je Zeile,24 neue SC; alter Byte-Präfix
unverändert. Content-Validator aktuell3561 Fragen einschließlich des noch
offenen Nachfolgebatches087. Diff- und Archivierungscheck bestanden.
Keine Datenbankbefehle ausgeführt.

Primärquellen pro Frage sind in der CSV hinterlegt: PostgreSQL18,
Ausdrucks-/Partial-/Index-Only-Indizes, Indextypen, CREATE INDEX,
Routine Vacuuming, Constraints, Range Types, CREATE TABLE, Generated und
Identity Columns, Sequence Functions, ROLLBACK/ROLLBACK TO, Explicit Locking,
SELECT, Row Security sowie Schemas (https://www.postgresql.org/docs/18/).
