# Brief CONTENT-207: FIAE-DB – MySQL/InnoDB-Verträge

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen FIAE-DB-239 bis -262 ergänzen, Modul 238 → 262.
MySQL 8.4/InnoDB: DDL, Savepoints, Sperren, Indizes, SQL-Modi und Lesesichten.

## Betroffene Dateien

- `content/questions/FIAE-DB.csv`
- `docs/agent-briefs/CONTENT-207-fiae-db-mysql-innodb-vertraege.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle 238 Altstämme gelesen; globale MySQL-/MariaDB-Suche zeigt bisher
NoSQL-Distraktoren und generische GROUP_CONCAT-Definitionen, keine InnoDB-Fragen.
PostgreSQL-Transaktionsfragen 135–166 vollständig gegenprüfen; neue Fragen
verlangen konkrete MySQL-Verträge, insbesondere abweichendes DDL-/Sperrverhalten.
Frische offizielle MySQL-8.4-Recherche: implicit-commit, savepoint,
innodb-locking, innodb-locking-reads, innodb-index-types, sql-mode,
innodb-error-handling und innodb-consistent-read.
14 Felder. Altpräfix 92805 Byte SHA256:
9a9eff29819dc424b19a7cc4ead06968d1a9b655c66393598cc79b41d39b8788.
Keine Datenbankverbindung oder SQL-Ausführung am Projekt; keine Installation,
Builds, DB/.env, Commits oder Pushes. Statische Vertrags-/CSV-Prüfung.

## Abnahmekriterien

- [x] 24 SC-Fragen, globale IDs eindeutig, Altbytes erhalten.
- [x] Eindeutige Lösungen, fachnahe Distraktoren und Primärbelege.
- [x] Keine globalen Lernzielduplikate oder Antwort-Tells.
- [x] Unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivcheck grün.

## Ergebnis

262 Modulfragen, global 6441. Frischer Reviewer `content207_review` prüfte
alle 24 Stämme, 96 Optionen und Erklärungen, 238 Altstämme, PostgreSQL 135–166
und globale semantische Nachbarn. Alle acht offiziellen MySQL-8.4-Quellen
frisch unabhängig recherchiert. Distraktoren in 251 und 253 durch fachnahe
Index-Speicherungsalternativen ersetzt; vollständiger gespeicherter Endread
ohne offene Findings bestanden. Keine bloßen Datenbanknamensvarianten von
Altlernzielen. App-Parser, 14 Felder, eindeutige IDs und Altpräfix-SHA bestätigt.
Content-Validator, Diff- und Archivcheck erfolgreich. Keine SQL-Ausführung.

Primärquellen: https://dev.mysql.com/doc/refman/8.4/en/ mit implicit-commit.html,
savepoint.html, innodb-locking.html, innodb-locking-reads.html,
innodb-index-types.html, sql-mode.html, innodb-error-handling.html
und innodb-consistent-read.html (auch einzeln in CSV belegt).
