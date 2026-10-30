# Brief CONTENT-161: HARDWARE – Hardwareinventur unter Linux

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen ALLE-HARDWARE-244 bis -267 ergänzen, Modul 243 → 267.
CPU-/Bus-/SMBIOS-Inventur, Blockgeräte, Laufwerksdiagnose und Geräteereignisse.

## Betroffene Dateien

- `content/questions/HARDWARE.csv`
- `docs/agent-briefs/CONTENT-161-hardware-linux-inventur.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

243 Altstämme gelesen, alle 26 CSV semantisch abgleichen. Eigene frische
Primärrecherche in den Upstream-Handbüchern util-linux, pciutils, usbutils,
dmidecode, smartmontools, nvme-cli und systemd. Vorhandene lsblk-Spalten-
und allgemeine Diagnosegarantie-Fragen nicht wiederholen. Keine tatsächlichen
Hardwarezugriffe, Selbsttests, Geräteänderungen, Installationen, DB/.env,
Builds, Commits oder Pushes. Statische Wissensprüfung.
Altpräfix 72482 Byte SHA256:
4d42da75543a2d33686fe7cb54fd242b9bd41bb33486ef0bc9d414ab475dde57.

## Abnahmekriterien

- [x] 24 SC-Fragen/14 Felder, globale IDs eindeutig, Altbytes erhalten.
- [x] Aktuelle Primärbelege und eindeutige fachnahe Optionen.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Batch-Endstand 5337. Frischer Reviewer content161_review
hat alle 24 Fragen, 96 Optionen, Erklärungen, 243 Altstämme und globale
Nachbarn geprüft: keine Findings. Autor und Reviewer recherchierten unabhängig
die aktuellen Primärhandbücher; nvme-cli ausdrücklich Version 2.11.
Quellen je Frage in der CSV. Bestehende lsblk-Spalten- und Diagnosegrenzen-
Lernziele abgegrenzt. Altpräfix unverändert, App-Parser, Content-Validator,
Diffcheck und Archivierungscheck grün. Keine Hardwarezugriffe ausgeführt.
