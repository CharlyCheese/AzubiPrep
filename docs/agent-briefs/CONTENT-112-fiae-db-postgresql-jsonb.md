# Brief CONTENT-112: FIAE-DB – PostgreSQL-jsonb

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen FIAE-DB-167 bis -190 ergänzen, Modul 166 → 190.
Strukturierte JSON-Daten in PostgreSQL 18 auswählen, ändern und auswerten.

## Betroffene Dateien

- `content/questions/FIAE-DB.csv`
- `docs/agent-briefs/CONTENT-112-fiae-db-postgresql-jsonb.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

AGENTS.md, ORCHESTRATOR.md. Alle 166 Modulaltstämme gelesen,
globale semantische Suche über 26 CSV. DPA-DB-158 bis -160 prüfen
bereits ->>-Text, ?-Schlüssel mit JSON-null und jsonb_array_elements.
Diese Lernziele nicht wiederholen. Keine echten Datenbankzugriffe.
Primärquellen vor Erstellung lesen:
https://www.postgresql.org/docs/18/functions-json.html,
https://www.postgresql.org/docs/18/datatype-json.html.
Keine zusätzliche Installation oder Datenbankausführung behaupten.
Alter Byte-Präfix 63893 Byte, SHA256:
9053d4c1f3d376aaa591cd2b1d613b2c98e6b966a8926565c3ecbc784172cf4e.

## Abnahmekriterien

- [x] Genau 24 SC-Fragen, eindeutige IDs, 14 Felder und Altbytes erhalten.
- [x] PostgreSQL-18-Prämissen und Musterlösungen primärquellenbelegt.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Modul 190, Katalog 4161 zum Batchabschluss.
App-Parser: 190 Records mit 14 Feldern, IDs 167–190 genau 24 neue SC,
keine falschen Feldbreiten, leeren Felder oder identischen Optionen.
63893 Altbytes mit obigem SHA256 unverändert. Validator und Diff grün.

Frischer Reviewer `content112_review`: alle 24 tatsächlichen Vollfragen,
166 Altstämme und globale semantische Suche über 26 CSV durchgeführt.
Eigene Webprüfung beider PostgreSQL-18-Primärquellen: Extraktion,
Enthaltenheit, Schlüsselquantoren, Verkettung, Löschen, Setzen/Einfügen,
strip_nulls samt zweitem Parameter, Objektentfaltung, Typbestimmung,
Konstruktion/Konvertierung und JSONPath. 181/186 vorab durch eigenständige
Lernziele jsonb_pretty-Texttyp und mehrdimensionale SQL-Arrays ersetzt.
Freigabe ohne Findings: eindeutige Musterlösungen, keine Lernzielduplikate
zu DPA-DB158–160 oder anderen Fragen, keine Längen-/Füllwort-/Strukturtells.
Keine Datenbankausführung behauptet, keine Builds oder Installationen.
