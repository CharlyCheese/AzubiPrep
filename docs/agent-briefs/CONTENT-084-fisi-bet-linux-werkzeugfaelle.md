# Brief CONTENT-084: FISI-BET – Linux-Werkzeugfälle

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

24 neue SC-Fragen FISI-BET-110 bis -133, Modul 109 → 133.
Konkrete Linux-/GNU-Werkzeugfälle zu Dateinamen, Text-/Logverarbeitung,
Archivierung und Datentransfer; keine echten Dateioperationen ausführen.

## Betroffene Dateien

- `content/questions/FISI-BET.csv`
- `docs/agent-briefs/CONTENT-084-fisi-bet-linux-werkzeugfaelle.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

AGENTS.md, ORCHESTRATOR.md. Alle109Bestandsfragen gelesen.
Offizielle GNU-Handbücher, rsync- und systemd-Dokumentation.
GNU-spezifische Optionen und Annahmen ausdrücklich nennen.
Alter Byte-Präfix vor Änderungen SHA256:
c5613bc34fc5960f0db6b7e2f9fb73bf79b22001d912996e077a7a42a53d5a5b.

## Abnahmekriterien

- [x] Genau24 SC-Fragen, alte Bytes/Schema erhalten, IDs eindeutig.
- [x] Optionen/Datengrenzen/Exitstatus eindeutig und primärquellenbelegt.
- [x] Keine globalen Lernzielduplikate oder systematischen Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

FISI-BET 109 → 133, Gesamtstand nach diesem Batch 3489 Fragen.
24 konkrete Fälle zu NUL-Trennung, find, grep, Textverarbeitung,
Logrotation, Archiven, rsync und Dateisystemmesswerten.

Frischer unabhängiger Vollreview content084_review: BESTANDEN ohne
Findings. Alle 24 tatsächlichen Endzeilen anhand selbst abgerufener
Primärhandbücher geprüft. Keine beschriebenen Linux-Werkzeuge ausgeführt.
Globale Lernzielprüfung über 26 CSV: keine neuen Duplikate. Insbesondere
grep-F versus pandas-regex=False, rsync- versus Git-Probelauf, Boot-Offset
versus Unit-/Zeitfilter sowie Sparse-Blockbelegung versus Verzeichnis-
verbrauch sind verschiedene konkrete Werkzeuglernziele.

Quellen: Original-GNU-Manpages, bei man7.org veröffentlicht, direkte Links
je Zeile. Zusätzlich offizielle Coreutils-Handbuchquelle:
https://raw.githubusercontent.com/coreutils/coreutils/v9.8/doc/coreutils.texi
https://download.samba.org/pub/rsync/rsync.1
https://www.freedesktop.org/software/systemd/man/latest/journalctl.html
Direkte GNU-HTML-Abrufe beim Autor teils Timeout. Reviewer konnte
zusätzlich GNU-gawk- und GNU-sed-Handbücher abrufen. Gzip-Handbuch direkt
bei beiden Timeout; jeweils eigene GNU-Suchtreffer enthielten die
vollständige passende Beschreibung von -k/--keep. Nicht als vollständig
gelesenes Handbuch ausgegeben; man7-gzip404 nicht als Beleg verwendet.

Eigene Vorprüfung beseitigte Dreier-Artikelmuster in131/132 vor Review;
im Endstand kein systematisches Längen-/Detail- oder Phrasen-Tell.
App-Parser:133 Datensätze,14 Felder; globale IDs eindeutig. CSV-Zitat in
120 exakt erhalten: Eingabe enthält geschütztes A;B, richtige Option B
mit abschließendem doppeltem Anführungszeichen. Alter Byte-Präfix aus110
physischen Zeilen exakt gemäß vorherigem SHA256 erhalten.
Content-Validator, Diff- und Archivierungscheck erfolgreich.
Keine Imports, Builds, Installationen, Commits oder Pushes.
