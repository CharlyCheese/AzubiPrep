# Brief CONTENT-139: DVK-AUT – Motion-Control-Funktionsbausteine

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen DVK-AUT-160 bis -183 ergänzen, Modul159 →183.
TwinCAT3/Tc2_MC2: Auftragszustände, Achsreferenzen, Positionierung,
Pufferung, Stoppen und konkrete Software-Bausteinsemantik.

## Betroffene Dateien

- `content/questions/DVK-AUT.csv`
- `docs/agent-briefs/CONTENT-139-dvk-aut-motion-control.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`
- `docs/agent-briefs/CONTENT-CHECKPOINT.md`

## Kontext und Quellen

Alle159 Altstämme gelesen. Globale Suche nach PLCopen/MC-Bausteinen ohne
Altbestand. Grundlegende Flankenerkennung078, Zustandsinstanzen093 und
CODESYS-Standardbausteine nicht wiederholen.
Primärquellen offizielle Beckhoff-TwinCAT3-Dokumentation zur Tc2_MC2.
Keine echte Achse, SPS-Verbindung, Simulation mit Gerätetreibern oder
Maschinenparametrierung. Ausschließlich Lehrfragen und gedachte Fälle.
Keine Installation, DB-/Server-/Buildaktion.
Altpräfix90077 Byte SHA256:
28ea29956366612abff06a2eb7bf1ff364622180988a11bc2c5788dcb42c6428.
Nach Abnahme Checkpoint125–139 mit15 Batches aktualisieren.

## Abnahmekriterien

- [x] 24 SC-Fragen/14 Felder, globale IDs eindeutig, Altbytes erhalten.
- [x] Vendor-/Bibliothekssemantik mit nötigen Prämissen eindeutig belegt.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff-, Checkpoint- und Archivcheck grün.

## Ergebnis

24 Fragen ergänzt, Modul183, Gesamtkatalog4809. App-Parser bestätigt
14 Felder und eindeutige IDs. Altpräfix-SHA256 exakt erhalten.
Frischer Reviewer content139_review las alle24 Endzeilen, alle159
Altstämme und prüfte globale semantische Kandidaten über26CSV.
Eigene aktuelle Beckhoff-Recherche bestätigt alle Lösungen; keine
Lernzielduplikate oder systematischen Längen-/Schablonen-Tells.
Vier false-only Füllwörter in160b/163b/175b/179c sowie Leerzeichen in
170/179/181 korrigiert; tatsächliche gespeicherte Endfassung freigegeben.
Checker: Content-Validator4809, App-Parser, git diff --check erfolgreich.
Checkpoint125–139 unabhängig nachgezählt:15×24=360, alle26Modulzahlen,
4809 Gesamt,2191 Rest und alle26 normalisierten HEAD-Präfixe bestätigt.
Kein DB-Zugriff, Build, Commit oder Push.

Primärquellen, jeweils unter
https://infosys.beckhoff.com/content/1033/tcplclib_tc2_mc2/:
70043531.html (allgemeine Regeln), 70094731.html (MoveAbsolute),
70096267.html (MoveRelative), 70102411.html (MoveVelocity),
70108555.html (Stop), 70107019.html (Halt), 70050955.html (Reset),
70049419.html (Power), 70052491.html (SetPosition),
7637793931.html (ST_MoveOptions).
