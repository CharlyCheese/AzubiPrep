# Brief CONTENT-116: DPA-DB – PostgreSQL-Zeitfunktionen

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 eigenständige SC-Fragen DPA-DB-167 bis -190 ergänzen, Modul 166 → 190.
Zeitrechnung, Zeitquellen, Formatierung und Zeitzonen in PostgreSQL 18.

## Betroffene Dateien

- `content/questions/DPA-DB.csv`
- `docs/agent-briefs/CONTENT-116-dpa-db-zeitfunktionen.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

AGENTS.md und ORCHESTRATOR.md. 166 Altstämme gelesen; globale Suche
über 26 CSV nach Zeitfunktionen ohne entsprechende Treffer.
093 CURRENT_TIMESTAMP-Grundbedeutung, 161 Reihenwerte, 162 Zeitzonenausgabe,
163 Monatsanfang, 164 ISO-Wochentag und 165 Berichtsintervall nicht wiederholen.
Primärquellen PostgreSQL 18: functions-datetime.html, datatype-datetime.html,
functions-formatting.html und functions-srf.html. Keine echte Datenbank ändern.
Alter Byte-Präfix 56988 Byte, SHA256:
2736977c84c15f363937ebf21b38fc884ed6d7fef398246f70d04d98f9706d5a.

## Abnahmekriterien

- [x] Genau 24 SC-Fragen, eindeutige globale IDs, 14 Felder, Altbytes erhalten.
- [x] Version, Typen, Prämissen und Lösungen primärquellenbelegt.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Modul 190, Katalog 4257 zum Batchabschluss.
App-Parser bestätigt 190 Records, 14 Felder und globale eindeutige IDs.
56988 Altbytes mit obigem SHA256 unverändert. Validator und Diff grün.

Frischer Reviewer content116_review: alle 24 gespeicherten Vollfragen,
166 Altstämme und globale Lernzielsuche über 26 CSV. Eigene aktuelle
PostgreSQL-18-Primärrecherche zu Zeitfunktionen, Formatierung, Zeittypen
und generate_series. Ein struktureller Tell in188 (alle falschen Optionen
mit Es liefert) durch unterschiedliche Formulierungen beseitigt.
Alle 24 Endfassungen erneut gelesen, keine offenen fachlichen,
Duplikat-, Längen-/Detail- oder Sprach-Tell-Findings. Dokumentarische
Verifikation; keine Datenbankabfrage, Installation oder Builds.
