# Brief CONTENT-106: FISI-BET – PowerShell-Datenpipeline

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen FISI-BET-134 bis -157 ergänzen, Modul133 → 157.
Objektpipeline, Operatoren und Datenkonvertierung nach PowerShell7.5-
Dokumentation; sichere speicherinterne Beispiele im vorhandenen PowerShell7.6.5
zusätzlich ausführen. Keine produktiven Datei-/Dienst-/Registryänderungen.

## Betroffene Dateien

- `content/questions/FISI-BET.csv`
- `docs/agent-briefs/CONTENT-106-fisi-bet-powershell-datenpipeline.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

AGENTS.md, ORCHESTRATOR.md;133 Bestandsfragen gelesen; globale Lernzielsuche
über26 CSV. Bestehende Windows-Dienst-/GPO-Fälle bleiben unberührt.
Microsoft-Learn-Primärquellen vor Erstellung gelesen, view=powershell-7.5:
about_Pipelines, about_Operators, about_Comparison_Operators,
about_Try_Catch_Finally, about_CommonParameters, about_Splatting, about_Join,
about_Hash_Tables;
ForEach-Object, Where-Object, Select-Object, Group-Object, Measure-Object,
ConvertTo-Json, ConvertFrom-Json, Get-Content, ConvertFrom-Csv,
Write-Output und Export-Csv unter https://learn.microsoft.com/en-us/powershell/module/ .
Alter Byte-Präfix SHA256:
7f2f10c3d696ac992ac7c5a6dc0842b874c0ff08269ae068a3877686736014a2.

## Abnahmekriterien

- [x] Genau24 SC-Fragen, eindeutige IDs,14 Felder und Altbytes erhalten.
- [x] Präzise PowerShell-Semantik, sichere Beispiele geprüft, Versionsgrenze dokumentiert.
- [x] Globale Lernzielduplikate und bindende Antwort-Tells ausgeschlossen.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Modul157, Katalog4017 zum Batchabschluss.
App-Parser157 Records mit14 Feldern; Altbytepräfix-SHA256 unverändert.
23 sichere Fälle speicherintern unter PowerShell7.6.5 ausgeführt,
153 ausschließlich dokumentarisch. Das ist kein Lauf unter7.5;
Versionsgrundlage bleibt die offizielle7.5-Dokumentation.

Frischer Reviewer `content106_review` prüfte alle24 gespeicherten Fragen,
133 Altfragen und globale semantische Kandidaten über26 CSV. Eigene
Microsoft-Learn-Recherche zu sämtlichen verwendeten Cmdlets und Operatoren,
alle23 sicheren Beispiele unabhängig unter PowerShell7.6.5 bestätigt.
Finding: Wortabstände140/141/143/144/151 korrigiert und gespeicherte
Endfassung erneut gelesen. Keine offenen fachlichen oder Tell-Findings,
keine neuen Lernzielduplikate; beide Strukturtells ausdrücklich geprüft.
Endfassungs-SHA256:
339efb0644d312d9907c6afcaeec885afdb9822f10a4d11467604e4509d36ee1.
