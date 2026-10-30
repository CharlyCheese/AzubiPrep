# Brief CONTENT-164: DPA-PROJ – Reproduzierbare Notebook-Läufe

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen DPA-PROJ-184 bis -207 ergänzen, Modul 183 → 207.
Jupyter-Notebook-Format, kontrollierte Ausführung und Parametrisierung.

## Betroffene Dateien

- `content/questions/DPA-PROJ.csv`
- `docs/agent-briefs/CONTENT-164-dpa-proj-notebook-ausfuehrung.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

183 Altstämme gelesen; global alle 26 CSV auf semantische Nachbarn prüfen.
Eigene frische Primärrecherche in nbformat, nbclient, nbconvert und Papermill.
Nur statische Wissensfragen, keine Installation oder Notebook-Ausführung,
keine DB/.env, privaten Daten, Builds, Commits oder Pushes.
Altpräfix 122072 Byte SHA256:
e98ab5f9f5a442dd18e86f15b2912a222ceba8af81c820420086b9fa87f11a0e.

## Abnahmekriterien

- [x] 24 SC-Fragen, globale IDs eindeutig, Altbytes erhalten.
- [x] Aktuelle Primärbelege und eindeutige fachnahe Optionen.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Batch-Endstand 5409. Frischer Reviewer content164_review
prüfte alle Fragen, 96 Optionen, Erklärungen, 183 Altstämme und globale
Nachbarn. Ein Verbtemplate-Tell in 204 korrigiert: Die richtige Antwort
verwendet nun ebenfalls Passiv. Gespeicherte Endfassung vollständig erneut
geprüft und bestätigt; keine offenen Findings oder Lernzielduplikate.
Autor und Reviewer recherchierten unabhängig die offiziellen Dokumente
von nbformat, nbclient, Papermill und nbconvert; Quellen je Frage in der CSV.
Keine Notebook-Ausführung oder Installation. Altpräfix, App-Parser,
Content-Validator, Diffcheck und Archivcheck bestanden.
