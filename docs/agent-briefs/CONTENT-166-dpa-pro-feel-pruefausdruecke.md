# Brief CONTENT-166: DPA-PRO – FEEL-Prüfausdrücke für Geschäftsregeln

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen DPA-PRO-196 bis -219 ergänzen, Modul 195 → 219.
Konkrete FEEL-Ausdrücke für Zahlen, Zeitregeln, Intervalle und Nullbehandlung.

## Betroffene Dateien

- `content/questions/DPA-PRO.csv`
- `docs/agent-briefs/CONTENT-166-dpa-pro-feel-pruefausdruecke.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

195 Altstämme gelesen; vorhandene FEEL-Strings, Listen, Kontexte und
Minuten-Komponenten nicht wiederholen. Globale 26 CSV semantisch abgleichen.
Eigene frische Primärrecherche im offiziellen Camunda-8.10-FEEL-Handbuch
(unversionierte aktuelle Seiten, Versionskennung geprüft). Eigene Beispiele
und separate rechnerische Plausibilisierung, kein vorgetäuschter FEEL-Lauf.
Keine Installation, DB/.env, privaten Daten, Builds, Commits oder Pushes.
Altpräfix 103712 Byte SHA256:
82886df4e20c7ee0149e5bc9f4a122fbff8dc4462a3b356c39f45ac190ed0552.

## Abnahmekriterien

- [x] 24 SC-Fragen, globale IDs eindeutig, Altbytes erhalten.
- [x] Aktuelle Primärbelege und eindeutige fachnahe Optionen.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Batch-Endstand 5457. Frischer Reviewer content166_review
prüfte alle Fragen, 96 Optionen, Erklärungen, 195 Altstämme und globale
Nachbarn. Positiver ganzzahliger Divisionsrest in 198 war global bereits
vorhanden; ersetzt durch FEEL-number-Operanden mit gebrochenem Dividenden.
Gespeicherte Endfassung aller 24 Fragen erneut gelesen und bestätigt.
Keine offenen Findings, weiteren Lernzielduplikate oder bindenden Tells.
Autor und Reviewer recherchierten unabhängig acht offizielle Camunda-Seiten,
jeweils Version 8.10 bestätigt. Quellen je Frage in der CSV. Separate
Rechen-, Kalender- und Textchecks erfolgreich (Autor 10 plus Divisionsrest,
Reviewer 12 plus Divisionsrest); kein FEEL-Lauf behauptet. Altpräfix,
App-Parser, Validator, Diffcheck und Archivcheck grün.
