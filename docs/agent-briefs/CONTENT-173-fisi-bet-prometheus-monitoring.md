# Brief CONTENT-173: FISI-BET – Monitoring mit Prometheus

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen FISI-BET-206 bis -229 ergänzen, Modul 205 → 229.
Konkrete Prometheus-Abfragen, Erfassungs- und Alarmregeln.

## Betroffene Dateien

- `content/questions/FISI-BET.csv`
- `docs/agent-briefs/CONTENT-173-fisi-bet-prometheus-monitoring.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle 205 Altstämme gelesen. Globale 26 CSV semantisch auf Lernzielduplikate
prüfen. Allgemeine Monitoring-/Zeitreihen-/Countergrundlagen nicht umbenennen.
Eigene aktuelle Primärrecherche https://prometheus.io/docs/.
Statische Szenarien, keine Installation, Monitoringzugriffe, Builds,
DB/.env, privaten Daten, Commits oder Pushes.
Altpräfix 115306 Byte SHA256:
f58dca13ae03b621d0ec6f9714bf3c33ec08741c3a1c29c901c431e5bf575df4.

## Abnahmekriterien

- [x] 24 SC-Fragen, globale IDs eindeutig, Altbytes erhalten.
- [x] Aktuelle Primärbelege und eindeutige fachnahe Optionen.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Batch-Endstand 5625. Frischer Reviewer content173_review
prüfte alle 24 Fragen, 96 Optionen und Erklärungen, 205 Altstämme und
globale semantische Nachbarn. Überschneidung in 218 mit Materialized Views
durch konkrete record-Metriknamenssemantik ersetzt. Distraktoren in 214,
217, 220 und 224–227 fachlich angenähert; alle gespeicherten Endfassungen
erneut vollständig bestätigt. Keine offenen Findings oder Duplikate.
Autor und Reviewer recherchierten unabhängig acht aktuelle offizielle
Prometheus-Quellseiten, je Frage in der CSV verlinkt. Altpräfix, App-Parser,
Content-Validator, Diffcheck und Archivcheck grün. Kein Prometheus-Lauf,
keine Installation oder Monitoringverbindung durchgeführt.
