# Brief CONTENT-141: DPA-DB – SQLite-Detailfälle

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen DPA-DB-191 bis -214 ergänzen, Modul190 →214.
SQLite-spezifische Typisierung, Tabellenformen, Fremdschlüsselprüfung,
Konfliktverhalten und Ausdrucks-/Rückgabesemantik.

## Betroffene Dateien

- `content/questions/DPA-DB.csv`
- `docs/agent-briefs/CONTENT-141-dpa-db-sqlite-detailfaelle.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle190 Altstämme gelesen. Globale SQLite-Suche über26CSV ohne einschlägige
Altfragen. Generische SQL-Lernziele und PostgreSQL-Fragen nicht wiederholen.
Eigene aktuelle Primärrecherche ausschließlich offizielle SQLite-Dokumentation.
Keine Projekt-Datenbank, .env, Server, Build, Installation oder externe
Verbindung. Statische Lehrbeispiele gegebenenfalls mit Python-stdlib sqlite3
in flüchtigem :memory: prüfen; nie eine Datenbankdatei öffnen oder anlegen.
Altpräfix67802 Byte SHA256:
d2f5c71df29cf5ecfac64340734cb7397138f9b598f3874363cc7fde3860d481.

## Abnahmekriterien

- [x] 24 SC-Fragen/14 Felder, globale IDs eindeutig, Altbytes erhalten.
- [x] SQLite-spezifische Lösungen mit nötigen Prämissen eindeutig belegt.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Modul214, Gesamt4857 bei Ergänzung. App-Parser214/14,
globaleIDs eindeutig und Altpräfix-SHA256 exakt bestätigt. Content-Validator
und git diff --check grün. Autor und frischer Reviewer content141_review
prüften alle24 Fälle unabhängig mit Python-stdlib sqlite3 3.45.3,
ausschließlich flüchtige :memory:-Datenbanken ohne Datei-/ProjektDB-Zugriff.
Alle Lösungen entsprechen offizieller SQLite-Dokumentation. Reviewer las
alle190Altstämme und globale semantische Kandidaten aus26CSV.
Artikel-Tell in191 und Erst-Schablone in203 behoben; alle24 tatsächlichen
gespeicherten Endzeilen danach nochmals vollständig freigegeben.
Keine offenen Findings zu Fachlichkeit, Duplikaten oder Antwort-Tells.

Primärquellen unter https://sqlite.org/:
stricttables.html, withoutrowid.html, foreignkeys.html, pragma.html,
lang_conflict.html, lang_returning.html, gencol.html, lang_aggfunc.html,
lang_vacuum.html. Keine Installation, Build, Commit oder Push.
