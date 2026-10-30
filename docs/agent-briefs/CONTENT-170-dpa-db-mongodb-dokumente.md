# Brief CONTENT-170: DPA-DB – Dokumentabfragen mit MongoDB

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen DPA-DB-215 bis -238 ergänzen, Modul 214 → 238.
MongoDB-Dokumentabfragen und konkrete Aggregations-/Update-Semantik.

## Betroffene Dateien

- `content/questions/DPA-DB.csv`
- `docs/agent-briefs/CONTENT-170-dpa-db-mongodb-dokumente.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

214 Altstämme gelesen, globale 26 CSV semantisch abgleichen. Bisherige
NoSQL-Grundbegriffe und allgemeine SQL-Lernziele nicht bloß umformulieren.
Eigene aktuelle Primärrecherche https://www.mongodb.com/docs/manual/.
Statische Datenbeispiele, keine Installation oder Datenbankverbindung,
keine DB/.env, privaten Daten, Builds, Commits oder Pushes.
Altpräfix 78954 Byte SHA256:
0da317e3734f3a446d4fdd2400e5100fa0db1d9bbc4d95b1e4b75f7def2742d6.

## Abnahmekriterien

- [x] 24 SC-Fragen, globale IDs eindeutig, Altbytes erhalten.
- [x] Aktuelle Primärbelege und eindeutige fachnahe Optionen.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Batch-Endstand 5553. Frischer Reviewer content170_review
prüfte alle 24 Fragen, 96 Optionen, Erklärungen, 214 Altstämme und globale
Nachbarn anhand eigener offizieller MongoDB-Recherche. Drei semantische
Überschneidungen durch Aggregationsausdruck für missing (215), Namensgrenze
bei includeArrayIndex (224) und Verbot partieller _id-Indizes (238) ersetzt.
234 fachnahen Struktur-Distraktor eingesetzt, 235 Optionen mit Inhalt und
Oplog parallelisiert, 236 starre Distraktorenphrase aufgelöst. Gespeicherte
Endfassung vollständig bestätigt, keine offenen Findings oder Duplikate.
Altpräfix, App-Parser, Validator, Diffcheck und Archivcheck grün.
Autor und Reviewer recherchierten unabhängig aktuelle offizielle Manual-
Quellen, je Frage verlinkt. Für Arraybeispiele zusätzlich die vollständig
lesbare offizielle 8.0-Tutorialfassung. Keine Datenbank ausgeführt.
