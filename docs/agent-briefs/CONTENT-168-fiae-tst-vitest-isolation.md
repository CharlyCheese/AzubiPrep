# Brief CONTENT-168: FIAE-TST – Testisolation mit Vitest

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen FIAE-TST-197 bis -220 ergänzen, Modul 196 → 220.
Vitest-Mocks, Modulgrenzen, kontrollierte Zeit und konfigurierbare Testumgebung.

## Betroffene Dateien

- `content/questions/FIAE-TST.csv`
- `docs/agent-briefs/CONTENT-168-fiae-tst-vitest-isolation.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle 196 Altstämme gelesen. Globale 26 CSV semantisch auf Lernzielduplikate
prüfen, insbesondere bereits vorhandene Python-Mocks und Browserkontexte.
Eigene frische Primärrecherche https://vitest.dev/, konkrete Werkzeugsemantik
anstelle umbenannter Testgrundlagen. Statische Szenarien, keine Installation,
Projektkonfigurationsänderung, DB/.env, privaten Daten, Builds, Commits oder Pushes.
Altpräfix 109573 Byte SHA256:
a91561085661febfc7a23c57e380602448ceb2c3dbc84f2f850c92012237c99b.

## Abnahmekriterien

- [x] 24 SC-Fragen, globale IDs eindeutig, Altbytes erhalten.
- [x] Aktuelle Primärbelege und eindeutige fachnahe Optionen.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Batch-Endstand 5505. Frischer Reviewer content168_review
prüfte alle Fragen, 96 Optionen, Erklärungen, 196 Altstämme und globale
Nachbarn. Eröffnungs-Tell in 205 korrigiert, nun alle Optionen mit identischer
Passivstruktur. Gespeicherte Endfassung aller 24 Fragen vollständig erneut
bestätigt. Keine offenen Findings, Duplikate oder bindenden Antwort-Tells.
Autor und Reviewer recherchierten unabhängig aktuelle offizielle Vitest-
Dokumentation mit neuer API-Semantik; Quellen je Frage in der CSV.
Altpräfix, App-Parser, Content-Validator, Diffcheck und Archivcheck grün.
Keine Installation, kein Vitest-Lauf und keine Projektkonfiguration verändert.
