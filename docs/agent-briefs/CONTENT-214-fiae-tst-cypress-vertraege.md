# Brief CONTENT-214: FIAE-TST – Cypress-Verträge

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen FIAE-TST-245 bis -268 ergänzen; Modul 244 → 268.
Konkrete Cypress-Kommandosemantik, Testdaten und Sitzungsverwaltung anwenden.

## Betroffene Dateien

- `content/questions/FIAE-TST.csv`
- `docs/agent-briefs/CONTENT-214-fiae-tst-cypress-vertraege.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`
- `docs/agent-briefs/CONTENT-CHECKPOINT.md`

## Kontext und Quellen

Alle 244 Altstämme gelesen, globale Cypress-Suche ohne vorhandene Treffer.
k6 als Alternative nach Abgleich mit 173–196 verworfen, keine k6-Fragen ergänzt.
Acht frisch gelesene Cypress-Herausgeberseiten: should, then, intercept,
session, clock, each, fixture und as. Retry-Leitfaden ergänzend gelesen.
Neue API-Verträge von vorhandenen allgemeinen Warte-/Mock-/Timerfragen abgrenzen.
14 Felder. Altpräfix 136528 Byte SHA256:
ce2f1e3cc905e9cc4403f7bad318f214f1a29916a5f661408fe7a1e7660ac57a.
Keine Browser-/Testlaufzeit, Installationen, Builds, DB/.env, Commits oder Pushes.

## Abnahmekriterien

- [x] 24 neue SC-Fragen, eindeutige globale IDs und Altbytes erhalten.
- [x] Präzise API-Verträge, eindeutige Lösungen und plausible Distraktoren.
- [x] Keine Lernzielduplikate oder Antwort-Tells.
- [x] Unabhängiger vollständiger Review mit eigener aktueller Primärrecherche.
- [x] App-Parser, Validator, Diff- und Archivcheck grün.

## Ergebnis

FIAE-TST 244 → 268; global 6609 Fragen. Reviewer content214_review hat alle
24 Stämme, 96 Optionen und 24 Erklärungen, 244 Altstämme und globale Nachbarn
geprüft und alle acht Primärseiten frisch recherchiert. Aktuelle Fixture-Kopien
und das Verwerfen von Fake-Timern bei Restore ausdrücklich bestätigt.
Die falschexklusiven Marker „ausschließlich“ und „sofort“ reduziert und
Dreieröffner in 246 und 255 aufgelöst. Vollständiger Endread der tatsächlichen
Endfassung: Freigabe ohne offene Findings. App-Parser: 268 Modulfragen,
14 Felder, 6609 global eindeutige IDs; Altpräfix unverändert.
Content-Validator, Diff- und Archivcheck grün. Keine Browser-/Testläufe.
Checkpoint für CONTENT-200 bis -214 mit +360 Fragen auf 6609 aktualisiert;
15 Batch-Altpräfixe per SHA256 und alle 26 normalisierten HEAD-Präfixe bestätigt.
Zusätzlicher unabhängiger Checkpoint-Abgleich durch checkpoint214_review
bestanden: Zählungen, Tabellen, Schema, IDs, alle Präfixe, Archivierung und
sachliche Dokumentation ohne Findings bestätigt.
