# Brief CONTENT-123: FISI-BET – PowerShell-Betriebsfälle

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen FISI-BET-158 bis -181 ergänzen, Modul157 →181.
PowerShell7.5: Pfad- und Dateibehandlung, Ausgabeströme, Skriptaufruf und Jobs.

## Betroffene Dateien

- `content/questions/FISI-BET.csv`
- `docs/agent-briefs/CONTENT-123-fisi-bet-powershell-betrieb.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

AGENTS.md/ORCHESTRATOR.md. Alle157 Altstämme gelesen,134–157 behandeln
bereits Pipelineauswertung, Vergleiche, Regex, JSON/CSV-Konvertierung,
Get-Content Raw, Fehlerbehandlung und Sammlungen. Nicht wiederholen.
Globale Suche nach neuen Cmdlets und Sprachmerkmalen vor dem Schreiben.
Primärquellen Microsoft Learn PowerShell7.5: Cmdlet-Referenzen und
about_Redirection, about_Operators, about_Scopes, about_Functions_Advanced
sowie ShouldProcess-Leitfaden. Keine Dateibefehle, Jobs oder Dienste ausführen.
Alter Byte-Präfix87872 Byte, SHA256:
339efb0644d312d9907c6afcaeec885afdb9822f10a4d11467604e4509d36ee1.

## Abnahmekriterien

- [x] Genau24 SC-Fragen, global eindeutige IDs,14 Felder, Altbytes erhalten.
- [x] Version, Plattformprämissen und Lösungen primärquellenbelegt.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Modul181, Katalog4425 nach Ergänzung dieses Batches.
App-Parser:181 Records,14 Felder, globale IDs eindeutig.
87872 Altbytes mit obigem SHA256 unverändert. Validator und Diff nach
allen Korrekturen grün (Gesamtkatalog inzwischen4449 mit CONTENT-124).

Frischer Reviewer content123_review las alle24 Vollfragen und157 Altstämme,
suchte globale Lernzielduplikate über26CSV und las aktuelle Microsoft-
Learn-Primärtexte mit view=powershell-7.5 zu sämtlichen Cmdlets/Sprachmerkmalen.
163/167 dreifache falsche Die-Anfänge variiert;161/168 fachferne Füller
durch plausible Pfad-/Ausgabe-Verwechslungen ersetzt.160 vorhandenes
Laufwerk C: vorausgesetzt;169 ausführbaren Import-Csv-Aufruf samt Datei ergänzt.
Gespeicherte Endfassungen vollständig nachgelesen und freigegeben.
Keine offenen Fach-, Duplikat- oder Antwort-Tell-Findings.
Keine Fragebefehle, Jobs oder Dienste ausgeführt, keine Datenbankänderung.
