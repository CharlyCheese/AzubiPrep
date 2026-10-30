# Brief CONTENT-101: FIAE-PRG – Python-Standardbibliothek

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen FIAE-PRG-171 bis -194 ergänzen, Modul170 → 194.
Konkrete Semantik der Python-3.13-Standardbibliothek anhand offizieller
Dokumentation und sicherer speicherinterner Beispiele unter Python3.13.1.

## Betroffene Dateien

- `content/questions/FIAE-PRG.csv`
- `docs/agent-briefs/CONTENT-101-fiae-prg-python-standardbibliothek.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

AGENTS.md, ORCHESTRATOR.md;170 bestehende Modulfragen gelesen.
Globale Lernzielsuche über alle26 Fragen-CSV; keine Wiederholung der
allgemeinen dict.get-, Queue-, Generator- oder Sortierfragen.
https://docs.python.org/3.13/library/ : collections, itertools, functools,
dataclasses, pathlib, os.path, csv, json und operator. Dokumentation wurde
vor dem Schreiben gelesen; keine neuen Abhängigkeiten oder Dateioperationen.
Alter Byte-Präfix SHA256:
a71276ca38ae3c49e6d99165b9f0f84dfd36b2a18d3d733ecb523cb1a896cc13.

## Abnahmekriterien

- [x] Genau24 neue SC-Fragen, eindeutige IDs, alte Bytes und14-Feld-Schema erhalten.
- [x] Fachlich eindeutige Python-3.13-Fälle, ausführbare Beispiele nachgeprüft.
- [x] Globale Lernzielduplikate, plausible Distraktoren und Antwort-Tells geprüft.
- [x] Frischer unabhängiger Vollreview mit eigener Primärquellenrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt; Modul194, Katalog3897. Alte70214 Bytes unverändert,
SHA256 siehe oben. App-Parser194 Datensätze mit14 Feldern, Content-Validator
grün. Ausführbare Beispiele unter lokalem Python3.13.1 speicherintern
bestätigt; Speicherhinweis182 dokumentarisch geprüft, kein Lasttest.

Frischer Reviewer `content101_review`: alle24 tatsächlich gespeicherten
Zeilen,170 Altfragen und globale Suche über26 CSV geprüft. Eigene Recherche
gegen alle neun oben verlinkten offiziellen Python-Dokumentationsmodule.
Vollreview ohne Findings, einschließlich fachnaher Distraktoren und aller
bindenden Längen-, Füllwort- und strukturellen Tell-Prüfungen.

191 wurde vor Abschluss vorsorglich vom zitierten CSV-Trennzeichen auf
DictReader/restval umgestellt, um Nähe zu FISI-BET120 zu vermeiden.
Reviewer bestätigte die gespeicherte Endfassung und die Eigenständigkeit
von173 gegenüber172 sowie174 gegenüber080/108. Gesamter CSV-SHA256 zum Review:
b3a13a6f70c40b8d194d46b2ae4f1147d4b35bca5f41aa5177433b5907df597f.
