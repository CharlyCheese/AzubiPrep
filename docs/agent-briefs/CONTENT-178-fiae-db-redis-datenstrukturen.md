# Brief CONTENT-178: FIAE-DB – Redis-Datenstrukturen

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen FIAE-DB-215 bis -238 ergänzen, Modul 214 → 238.
Konkrete Redis-Befehlsszenarien zu Datentypen, Ablauf und Transaktionen.

## Betroffene Dateien

- `content/questions/FIAE-DB.csv`
- `docs/agent-briefs/CONTENT-178-fiae-db-redis-datenstrukturen.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle 214 Altstämme gelesen, globale 26 CSV semantisch abgleichen.
Vorhandene NoSQL-Definitionen nicht wiederholen. Eigene frische offizielle
Primärrecherche https://redis.io/docs/latest/commands/.
Statische Befehlsszenarien, keine Installation oder Verbindung zu Redis,
keine Dienste, Builds, DB/.env, Commits oder Pushes.
Altpräfix 82941 Byte SHA256:
3b2bfe68fb17f107e2233dcc64cfaa0b72ec80f5934beeda61cf35345badfa1b.

## Abnahmekriterien

- [x] 24 SC-Fragen, globale IDs eindeutig, Altbytes erhalten.
- [x] Aktuelle Primärbelege und eindeutige fachnahe Optionen.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Batch-Endstand 5745. Frischer Reviewer content178_review
prüfte alle 24 Fragen, 96 Optionen und Erklärungen, 214 Altstämme und
globale semantische Nachbarn mit eigener aktueller offizieller Redis-
Primärrecherche. Keine Findings oder neuen Lernzielduplikate.
Listen-, Set-, Sorted-Set- und Stringergebnisse unabhängig nachgerechnet.
Gespeicherte Endfassung erneut vollständig gelesen und freigegeben.
Quellen je Frage in der CSV. Altpräfix, App-Parser, Content-Validator,
Diffcheck und Archivcheck grün. Keine Redis-Verbindung oder Installation.
