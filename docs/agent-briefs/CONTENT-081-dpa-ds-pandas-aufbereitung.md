# Brief CONTENT-081: DPA-DS – pandas-Datenaufbereitung

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

24 SC-Fragen DPA-DS-100 bis -123 ergänzen, Modul 99 → 123.
Konkrete pandas-Fälle der Datenaufbereitung: Labelausrichtung,
Indexauswahl, Nullwerte, Verknüpfungen und Transformationen.
Explizite pandas-2.3-Semantik, keine Installation/Projektabhängigkeit.

## Betroffene Dateien

- `content/questions/DPA-DS.csv`
- `docs/agent-briefs/CONTENT-081-dpa-ds-pandas-aufbereitung.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

AGENTS.md, ORCHESTRATOR.md, offizielle pandas-2.3-Dokumentation.
Alle99Bestandsfragen gelesen. DPA-DS-008 nennt pandas nur als Bibliothek,
die neuen Fälle prüfen konkrete Verarbeitung. Globale Lernzielprüfung
beachtet auch SQL- und NumPy-Fälle und vermeidet bloße Syntaxvarianten.
Alter Byte-Präfix SHA256:
45f2c620b3cc1ec87b3c04ae491808b6ea8ab90a0287c09ad313b1ad3dd811ff.

## Abnahmekriterien

- [x] Genau24 SC-Fragen, altes Schema/alte Bytes erhalten, IDs eindeutig.
- [x] Jede API-/Null-/Indexsemantik eindeutig und primärquellenbelegt.
- [x] Keine globalen Lernzielduplikate oder systematischen Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

DPA-DS 99 → 123, Gesamtstand 3417 Fragen. 24 konkrete Aufbereitungsfälle
zu Series-Labels, CSV-Typen, Auswahl, Merge, Gruppierung, Concat,
nullable Typen, Lückenbehandlung und verschachtelten Daten.

Frischer unabhängiger Vollreview content081_review: BESTANDEN ohne
Findings. Alle 24 tatsächlichen Endzeilen mit eigener Primärquellen-
recherche einzeln geprüft. Keine pandas-Installation oder -Ausführung;
die Prüfung stützt sich auf dokumentierte API-Semantik und unabhängige
Berechnungen. Keine Projektabhängigkeit hinzugefügt.

Primärquellen: offizielle pandas-2.3-Dokumentation; direkte API-/Guide-URL
in jeder CSV-Zeile. Zusätzlich unabhängig geprüft: user_guide/merging.html,
user_guide/integer_na.html und SeriesGroupBy.sum/min_count. Einstieg:
https://pandas.pydata.org/pandas-docs/version/2.3/user_guide/dsintro.html
https://pandas.pydata.org/pandas-docs/version/2.3/user_guide/indexing.html
https://pandas.pydata.org/pandas-docs/version/2.3/reference/api/pandas.merge.html

Globaler Lernzielabgleich über alle 26 CSV: keine neuen Duplikate.
Abgrenzung insbesondere NumPy-Position/Form versus pandas-Labelausrichtung,
CSV-Stringtyp versus JSON-Textentnahme, konkrete validate-API versus
allgemeine Join-Kardinalität, inklusiver loc-Slice versus Python-Slicing.
Keine systematischen Längen-/Detail- oder sprachlichen Antwort-Tells.

App-Parser: 26 Dateien, 3417 eindeutige IDs, DPA-DS 123 Datensätze,
14 Felder. Alter Byte-Präfix exakt nach vorherigem SHA256 erhalten.
Content-Validator, Diff- und Archivierungscheck erfolgreich.
Keine Datenbankimporte, Builds, Commits oder Pushes.
