# Brief CONTENT-163: NETZ-GRUND – curl für Netzwerkdiagnose

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen ALLE-NETZ-GRUND-025 bis -048 ergänzen, Modul 210 → 234.
Konkrete curl-Optionen für kontrollierte HTTP-Tests und Dateitransfers.

## Betroffene Dateien

- `content/questions/NETZ-GRUND.csv`
- `docs/agent-briefs/CONTENT-163-netz-grund-curl-diagnose.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

210 alte Modulstämme gelesen; globale Lernzielsuche in allen 26 CSV.
Eigene aktuelle Primärrecherche im offiziellen curl-Optionshandbuch,
einzelne Originaldokumente docs/cmdline-opts im curl-Repository.
Keine tatsächlichen Netzwerktransfers, Zugangsdaten, privaten Dateien,
Installationen, DB/.env, Builds, Commits oder Pushes. Statische Szenarien.
Altpräfix 66697 Byte SHA256:
82f957c3d653f531d389c9a5801333ca6c7753985939aa640dbe6c5c9b4e48be.

## Abnahmekriterien

- [x] 24 SC-Fragen, passende LF9-Felder, globale IDs eindeutig, Altbytes erhalten.
- [x] Aktuelle Primärbelege und eindeutige fachnahe Optionen.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Batch-Endstand 5385. Frischer Reviewer content163_review
hat alle Fragen, 96 Optionen, Erklärungen, 210 Altstämme und globale Nachbarn
vollständig geprüft: keine Findings. Autor und Reviewer recherchierten alle
24 offiziellen curl-Optionsdokumente unabhängig, Quellen je Frage in der CSV.
HTTP-Grundlagen von konkreter Werkzeugsemantik abgegrenzt. Keine bindenden
Antwort-Tells. Altpräfix, App-Parser, Content-Validator, Diffcheck und
Archivcheck bestanden. Keine echten Transfers oder Dateizugriffe durch curl.
