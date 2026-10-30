# Brief CONTENT-124: FIAE-TST – Hypothesis-Strategien und Steuerung

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen FIAE-TST-149 bis -172 ergänzen, Modul148 →172.
Hypothesis6: konkrete Strategien, Teststeuerung und reproduzierbare Befunde.
Nach Abschluss Sammelcheckpoint für CONTENT-110 bis -124 aktualisieren.

## Betroffene Dateien

- `content/questions/FIAE-TST.csv`
- `docs/agent-briefs/CONTENT-124-fiae-tst-hypothesis-strategien.md`
- `docs/agent-briefs/CONTENT-CHECKPOINT.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

AGENTS.md/ORCHESTRATOR.md. Alle148 Altstämme gelesen, globale Suche
über26CSV nach Hypothesis-API/Strategien/Settings durchgeführt.
061 Sortiereigenschaft,073 Roundtrip,093 Shrinking-Ziel,094 Generierung
statt massiver assume-Verwerfung und095 endliche Floats nicht wiederholen.
Primärquellen offizielle Hypothesis6-Dokumentation: reference/strategies.html,
reference/api.html einschließlich dessen Settings-Abschnitt. Keine Installation oder Tests
gegen Projektcode. Reine Dokumentations-/In-Memory-Rechenprüfung.
Alter Byte-Präfix82230 Byte, SHA256:
c7b9dc9ebd2f7796260b8726727f3c16d058734403220d43bf38fd5bcca59ef4.

## Abnahmekriterien

- [x] Genau24 SC-Fragen, global eindeutige IDs,14 Felder, Altbytes erhalten.
- [x] Konkrete Parameter und Semantik eindeutig primärquellenbelegt.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.
- [x] Checkpoint110–124 mit Bestandszahlen und Präfixbeleg aktualisiert.

## Ergebnis

24 Fragen ergänzt, FIAE-TST148 →172; Katalog4449. Reviewer
content124_review hat alle24 Endfassungen,148 Altstämme und globale
Lernzielüberschneidungen unabhängig geprüft und die offiziellen aktuellen
Hypothesis-API-/Strategienreferenzen selbst gelesen. Gesamtfreigabe erteilt.
Distraktoren fachnäher formuliert; wiederholte Falsch-Phrasen einschließlich
„unabhängig von/vom“ und Füllwörter entfernt. 158 unterscheidet Codepoints,
wahrgenommene Schriftzeichen und UTF-16-Codeunits eindeutig. Keine offenen
Findings. Strategienparameter und Settings dokumentationsgestützt geprüft,
ohne Hypothesis zu installieren oder Projektcode auszuführen.

App-Parser:172 Fragen/14 Felder; Altpräfixhash unverändert. Content-Validator:
4449/26 Module, global eindeutige IDs; Diff-Check erfolgreich.
Reviewer hat den Checkpoint zusätzlich unabhängig nachgezählt:15×24,+1404
seit3045,+2016 gegenüber HEAD2433, Rest2551. Alle26 normalisierten
HEAD-Präfixe erhalten; sechs EOL-Abweichungen und Beleggrenzen dokumentiert.

Primärquellen: https://hypothesis.readthedocs.io/en/latest/reference/api.html
und https://hypothesis.readthedocs.io/en/latest/reference/strategies.html.
