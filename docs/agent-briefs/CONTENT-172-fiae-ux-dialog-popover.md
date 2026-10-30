# Brief CONTENT-172: FIAE-UX – Native Dialoge und Popover

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen FIAE-UX-221 bis -244 ergänzen, Modul 220 → 244.
Konkrete native Browser-APIs für Dialoge, Popover und Zustandsereignisse.

## Betroffene Dateien

- `content/questions/FIAE-UX.csv`
- `docs/agent-briefs/CONTENT-172-fiae-ux-dialog-popover.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle 220 Altstämme gelesen. Global 26 CSV semantisch auf Lernzielduplikate
prüfen. Vorhandene allgemeine Fokus-/ARIA-/DOM-Ereignisregeln nicht umbenennen.
Eigene aktuelle Primärrecherche in MDN und gegebenenfalls WHATWG-Standard.
Statische API-Szenarien, kein Browser-/Produktumbau, keine Installation,
Builds, DB/.env, privaten Daten, Commits oder Pushes.
Altpräfix 133713 Byte SHA256:
81271549571e8c2fe72ed2200e096724609ac7905ed51978af9cc7df72d22fe5.

## Abnahmekriterien

- [x] 24 SC-Fragen, globale IDs eindeutig, Altbytes erhalten.
- [x] Aktuelle Primärbelege und eindeutige fachnahe Optionen.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Batch-Endstand 5601. Frischer Reviewer content172_review
prüfte alle 24 Fragen, 96 Optionen und Erklärungen, 220 Altstämme sowie
globale semantische Nachbarn. Sprachliche Verbform-Schablone in 244 durch
nominale Mengenangaben ersetzt, danach alle gespeicherten Endfassungen
erneut vollständig bestätigt. Keine offenen Findings oder Duplikate.
Autor und Reviewer recherchierten unabhängig alle Lernziele in 14 frisch
gelesenen MDN-Primärseiten, Quellen je Frage in der CSV. 240 grenzt die
aktuelle boolesche Rückgabe ausdrücklich von älteren Implementierungen ab.
Altpräfix, App-Parser, Content-Validator, Diffcheck und Archivcheck grün.
Statische Wissensfragen; keine Browser-Laufzeitprüfung oder Produktänderung.
