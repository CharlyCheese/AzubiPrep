# Brief CONTENT-059: HARDWARE – Hardwareauslegung, Schnittstellen und Diagnose

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

HARDWARE von 219 auf 243 Fragen erweitern.
24 neue SC-Anwendungsfragen ALLE-HARDWARE-220 bis
ALLE-HARDWARE-243 anfügen. Fachrichtung ALLE.
Bisherige Datensätze und IDs unverändert erhalten.


## Betroffene Dateien

- `content/questions/HARDWARE.csv`
- `docs/agent-briefs/CONTENT-059-hardware-auslegung-diagnose.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Primärquellen

AGENTS.md und ORCHESTRATOR.md. Eigene Aufgaben, keine IHK-Kopien.
Technische Versionen/Annahmen klar nennen, nur Lernmodelle behandeln.
Keine Geräteänderungen oder Netzwerkbefehle der Aufgaben ausführen.
Primärquellen tatsächlich recherchieren und zuordnen.

- https://www.intel.com/content/www/us/en/support.html
- https://www.corsair.com/us/en/s/psu-cable-compatibility
- https://www.usb.org/

## Abnahmekriterien

- [x] Genau 24 neue SC-Fragen, Schema und alter Bestand unverändert.
- [x] Global eindeutige IDs, Modul-/Fachrichtungs-/Lernfeldzuordnung passend.
- [x] Lösungen und Erklärungen eindeutig, Rechnungen unabhängig bestätigt.
- [x] Keine Inhaltsduplikate; plausible nahe Distraktoren ohne systematische Tells.
- [x] Unabhängiger Vollreview mit tatsächlich recherchierten Primärquellen bestanden.
- [x] Content-Validierung, Diff-Prüfung und Archivierungscheck erfolgreich.

## Ergebnis

24 Fragen ALLE-HARDWARE-220 bis -243 angehängt, Modul 219 → 243.
Unabhängiger Vollreview durch content059_review mit Webrecherche und Nachprüfungen BESTANDEN. ECC-Distraktoren fachlich angenähert, TRIM-Definition durch einen Lösch-Nachweisfall ersetzt, sprachliche Muster in 226/234/236 behoben. Alle Rechenaufgaben unabhängig bestätigt.
Quellenzuordnung: 220/221/224/225/230–232/238–240/242/243 eigene Zahlenrechnungen; 221 Dell PSU-Redundanz; 222 Corsair/ASUS Kabelkompatibilität; 223–226 Kingston DDR5/CL16 und Intel ECC; 227 Dell iDRAC; 228 Kingston SSD-FAQ; 229 Intel Board-Datenblatt; 233 Microsoft Storage Guide und Linux Writeback; 234 Microsoft TRIM/NVMe Deallocation; 235/236 Intel Thermal; 237 Seagate SMART; 241 VESA DisplayPort-FAQ.
Beleglinks: https://www.dell.com/en-us/infohub/articles/full-redundancy-vs-fault-tolerant-redundancy-for-poweredge-server-psus ; https://www.kingston.com/dataSheets/KF432C16RB1_16.pdf ; https://www.intel.com/content/www/us/en/support/articles/000096922/processors.html ; https://www.kernel.org/doc/html/v6.6/block/writeback_cache_control.html ; https://www.displayport.org/faq/
Altbestand/IDs erhalten. Keine Datenbankimporte, Builds, Commits oder Pushes. Content-Validierung, git diff --check und Archivierungscheck erfolgreich.
