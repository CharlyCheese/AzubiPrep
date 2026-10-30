# Brief CONTENT-157: FISI-SEC – Linux-Zugriffsschutz und Prozessrechte

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen FISI-SEC-353 bis -376 ergänzen, Modul 176 → 200.
SELinux-Werkzeuge, AppArmor-Profile, Linux-Capabilities und Seccomp.

## Betroffene Dateien

- `content/questions/FISI-SEC.csv`
- `docs/agent-briefs/CONTENT-157-fisi-sec-linux-zugriffsschutz.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

176 Altstämme gelesen, alle 26 CSV semantisch vergleichen. Eigene frische
Primärrecherche in Upstream-Handbüchern SELinuxProject, AppArmor und Linux
man-pages. Globale bisherige FISI-SEC-Höchst-ID 352; 15-Feld-Schema mit LF11b.
Nur statische Wissensfragen, keine Schutzmaßnahmen auf dem Host ändern,
keine Installation/DB/.env/Builds/Commits/Pushes.
Altpräfix 94493 Byte SHA256:
739930bd89d15e73e0cbf7b32863a944e803a1fa75155b7dfac484baa42bf037.

## Abnahmekriterien

- [x] 24 SC-Fragen/15 Felder, globale IDs eindeutig, Altbytes erhalten.
- [x] Aktuelle Primärbelege, eindeutige fachnahe Antwortoptionen.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Batch-Endstand 5241 Fragen. Frischer Reviewer
content157_review hat alle Fragen, Optionen, Erklärungen, 176 Altstämme
und globale Nachbarn geprüft: keine Findings. Eigene unabhängige aktuelle
Primärrecherche von Autor und Reviewer in SELinuxProject-, AppArmor-,
Linux-man-pages- und libcap-Handbüchern; Quellen je Frage verlinkt.
Complain/deny-Ausnahme, gespeicherte versus geladene Profile, ix,
audit-Flag, Capability-Abgrenzungen und Seccomp-Semantik gesondert bestätigt.
Kein Hostschutz verändert oder zugehöriger Verwaltungsbefehl ausgeführt.
Altpräfix erhalten, App-Parser, Content-Validator und Diffcheck bestanden.
