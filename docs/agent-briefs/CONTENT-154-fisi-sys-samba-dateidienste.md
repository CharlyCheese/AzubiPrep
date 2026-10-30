# Brief CONTENT-154: FISI-SYS – Samba-Dateidienste

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen FISI-SYS-197 bis -220 ergänzen, Modul 196 → 220.
Samba-Freigaben, Konten, Prüfwerkzeuge, SMB-Client und VFS-Module.

## Betroffene Dateien

- `content/questions/FISI-SYS.csv`
- `docs/agent-briefs/CONTENT-154-fisi-sys-samba-dateidienste.md`
- `docs/agent-briefs/CONTENT-CHECKPOINT.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle 196 Altstämme lesen, globale 26 CSV semantisch abgleichen. Eigene
aktuelle Primärrecherche unter https://www.samba.org/samba/docs/current/man-html/.
Keine echten Freigaben, Konten, Netzwerkzugriffe, Installationen, DB/.env,
Builds, Commits oder Pushes. Altpräfix 124897 Byte SHA256:
244445fa2d5a988d784e0287c44445d13a0cdf00c5569be3697d9d179d6e6e70.

## Abnahmekriterien

- [x] 24 SC-Fragen, 14 Felder, globale IDs eindeutig, Altbytes erhalten.
- [x] Fakten frisch belegt, fachnahe Distraktoren und eindeutige Lösungen.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.
- [x] Zwischenstand CONTENT-140 bis -154 dokumentiert und geprüft.

## Ergebnis

24 Fragen ergänzt, insgesamt 5169. Frischer Reviewer content154_review hat
sämtliche Fragen, Optionen, Erklärungen, 196 Altstämme und globale Nachbarn
geprüft: keine Findings. Autor und Reviewer haben unabhängig aktuelle offizielle
Manpages zu smb.conf, smbclient, testparm, smbpasswd, pdbedit, wbinfo, net,
vfs_acl_xattr und vfs_recycle je Lernziel abgeglichen. Keine Samba-Befehle
gegen echte Konten oder Freigaben ausgeführt. Präfixhash erhalten, App-Parser,
Content-Validator und Diffcheck bestanden.

Zusätzlicher unabhängiger Checkpoint-Review: 15 Batches mit 360 neuen Fragen,
26 Modulzahlen, globale IDs und sämtliche 26 normalisierten HEAD-Präfixe
bestätigt. Die sechs bekannten Zeilenendenabweichungen bleiben dokumentiert.
