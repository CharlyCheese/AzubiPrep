# Brief CONTENT-122: DPA-DS – pandas-Auswertungsfälle

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen DPA-DS-148 bis -171 ergänzen, Modul147 →171.
pandas2.3: Umformen, Fenster, Zeitreihen und weitere explizite Auswertungsregeln.

## Betroffene Dateien

- `content/questions/DPA-DS.csv`
- `docs/agent-briefs/CONTENT-122-dpa-ds-pandas-auswertungen.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

AGENTS.md/ORCHESTRATOR.md. Alle147 Modulaltstämme gelesen,100–123
behandeln schon pandas-Indexierung/Merge/Groupby/Concat/fehlende Werte/
Stringverarbeitung/Explode/Normalisierung/merge_asof. Diese nicht wiederholen.
Globale Suche nach neuen Methodennamen vor dem Schreiben.
Primärquellen offizielle pandas2.3-API unter
https://pandas.pydata.org/pandas-docs/version/2.3/reference/ .
Keine Installation, fremde Datensätze oder Datenbankzugriffe.
Alter Byte-Präfix83830 Byte, SHA256:
b790c088df5218c31958f1a09b5dbe1525704adfbc96dcb663842f25db016ecd.

## Abnahmekriterien

- [x] Genau24 SC-Fragen, global eindeutige IDs,14 Felder, Altbytes erhalten.
- [x] Version, Parameter, Typen und Resultate eindeutig primärquellenbelegt.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Modul171, Katalog4401 zum Batchabschluss.
App-Parser bestätigt171 Records,14 Felder und globale eindeutige IDs.
83830 Altbytes mit obigem SHA256 unverändert. Validator und Diff nach
allen Korrekturen grün. pandas lokal nicht verfügbar; keine Installation.

Frischer Reviewer content122_review las alle24 Vollfragen und147 Altstämme,
suchte über26CSV globale Lernzielduplikate inklusive SQL/NumPy und las
sämtliche verwendeten offiziellen pandas2.3-API-Textstellen selbst.
165 proaktiv von dichter Rangfolge (Duplikat DPA-DB-125) auf NaN-Rangregel
umgestellt.163 prüft erhaltene Indexlänge/führendesNaN statt NumPy-Differenz.
148/155 gemeinsame Distraktoranfänge variiert,160/162 ausdrücklich
DatetimeIndex als Voraussetzung ergänzt.165 Rangzahlen typografisch getrennt.
Gespeicherte Endfassungen nachgelesen und ohne offene Fach-, Duplikat-
oder Antwort-Tell-Findings freigegeben. Keine Laufzeitprüfung behauptet.
