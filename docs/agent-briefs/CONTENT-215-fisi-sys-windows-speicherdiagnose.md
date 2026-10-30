# Brief CONTENT-215: FISI-SYS – Windows-Speicherdiagnose

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen FISI-SYS-245 bis -268 ergänzen; Modul 244 → 268.
Windows-Storage-Objekte gezielt abfragen und dokumentierte Diagnosewerte einordnen.

## Betroffene Dateien

- `content/questions/FISI-SYS.csv`
- `docs/agent-briefs/CONTENT-215-fisi-sys-windows-speicherdiagnose.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle 244 Altstämme gelesen; globale Suche ohne die neuen Storage-Cmdlet-Verträge.
Neun frisch recherchierte Microsoft-Primärseiten: Get-Disk, Get-Partition,
Get-Volume, Get-PhysicalDisk, Get-StoragePool, Get-VirtualDisk,
Get-StorageReliabilityCounter, Optimize-Volume (Windows Server 2025 PowerShell)
und MSFT_StorageReliabilityCounter (Eigenschaftsdefinitionen).
Bei allgemeinen Beschreibungsfehlern in Cmdlet-Seiten auf Syntax,
Parameterbeschreibung und zugehörige eindeutige Beispiele abstellen.
14 Felder. Altpräfix 150410 Byte SHA256:
db46c81582c292a8875d99629487c3f5442d5525859e67d3cbea5c857c5d83fb.
Keine Speicherabfragen oder Optimierungen am Gerät ausführen; keine
Installationen, Builds, DB/.env, Commits oder Pushes.

## Abnahmekriterien

- [x] 24 neue SC-Fragen, globale IDs eindeutig, Altbytes erhalten.
- [x] Präzise Objekt-/Parameterverträge und eindeutige Lösungen mit Primärbelegen.
- [x] Plausible Distraktoren, keine Lernzielduplikate oder Antwort-Tells.
- [x] Unabhängiger vollständiger Review mit eigener aktueller Primärrecherche.
- [x] App-Parser, Validator, Diff- und Archivcheck grün.

## Ergebnis

FISI-SYS 244 → 268; global 6633 Fragen. Reviewer content215_review hat
alle 24 Stämme, 96 Optionen und 24 Erklärungen, 244 Altstämme und globale
Nachbarn geprüft sowie neun Microsoft-Primärseiten frisch recherchiert.
Dreier-Distraktorschablonen in 262 und 264 aufgelöst; 255 mit dem expliziten
Boolean-Parameterwert präzisiert. Vollständiger Endread nach allen Änderungen:
Freigabe ohne offene Findings. TemperatureMax ist als Betriebsgrenze und
NoRedundancy im PhysicalDisk-Objektbezug bestätigt. ReTrim von allgemeinen
Hardware-TRIM-Fragen abgegrenzt. App-Parser: 268 Modulfragen, 14 Felder,
6633 eindeutige globale IDs, Altpräfix unverändert.
Content-Validator, Diff- und Archivcheck grün. Keine Gerätebefehle ausgeführt.
