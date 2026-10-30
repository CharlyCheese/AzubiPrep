# Brief CONTENT-093: FISI-SYS – Linux-Speicherverwaltung

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

24 SC-Fragen FISI-SYS-125 bis -148 ergänzen, Modul124 → 148.
Konkrete LVM-, Dateisystem- und Mount-Fälle anhand offizieller Manpages.
Nur hypothetische Fälle, keine Speicherbefehle ausführen.

## Betroffene Dateien

- `content/questions/FISI-SYS.csv`
- `docs/agent-briefs/CONTENT-093-fisi-sys-linux-speicher.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

AGENTS.md, ORCHESTRATOR.md; Originalmanpages von LVM2, util-linux,
e2fsprogs und Linux.124 Modulfragen gelesen. Globale Vorprüfung grenzt
FISI-BET066–070 (du/Inodes/offene Löschdatei/Links) ausdrücklich aus.
Keine Wiederholung der allgemeinen Thin-Provisioning-/Snapshot-Grundlagen.
Alter Byte-Präfix SHA256:
c99a13adecb282b381119278dc01af9ca0fad67a64910878387e1c8dc8c47997.

## Abnahmekriterien

- [x] Genau24 SC-Fragen, alte Bytes/Schema erhalten, IDs eindeutig.
- [x] Speichersemantik, Voraussetzungen und Lösungen primärquellenbelegt.
- [x] Keine globalen Lernzielduplikate oder systematischen Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 SC-Fragen FISI-SYS-125–148 ergänzt: PV/VG/LV, relative Größen,
Dateisystemerweiterung und sichere Größenreihenfolge, pvmove, UUID/fstab,
findmnt/lsblk, Bind-/Recursive-Bind-Mount, noexec, busy/Lazy Unmount,
tmpfs/Swap, Metadatensicherung und Extents.

Unabhängiger frischer Reviewer content093_review prüfte alle24 tatsächlichen
Zeilen mit eigener Webrecherche und globalem Lernzielvergleich über26 CSV.
Zwei Findings korrigiert:130 falsches Alias-Paar zu -n/--nofsck berichtigt;
138 richtige Antwort an die Begründungsschablone der übrigen Optionen
angeglichen. Gespeicherte Endfassung erneut vollständig gelesen: bestanden,
keine offenen Findings. Kein systematisches Längen-/Füllwort-/Phrasensignal.

Primärbelege: Originalmanpages lvm, resize2fs, pvmove, fstab, findmnt,
lsblk, mount, umount, tmpfs, pvs, vgcfgbackup auf man7.org sowie
lvextend/lvcreate (LVM2) und mkswap (util-linux) auf
https://manpages.debian.org/trixie/ . Die genaue Quelle steht je Frage.

App-Parser:148 Datensätze,14 Felder,24 neue SC-Fragen. Alter Byte-Präfix
unverändert (oben genannter SHA256), einschließlich wörtlichem \\040 in147.
Content-Validator:3705 Fragen in26 Dateien grün. Diff-Check grün.
Keine Speicherbefehle ausgeführt und keine Systemkonfiguration verändert.
