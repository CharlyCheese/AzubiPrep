# Brief CONTENT-204: HARDWARE – NVMe-Wartungsverträge

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen ALLE-HARDWARE-268 bis -291 ergänzen, Modul 267 → 291.
nvme-cli 2.11: Inventur, Features, Protokolle, Firmware und Selbsttests.

## Betroffene Dateien

- `content/questions/HARDWARE.csv`
- `docs/agent-briefs/CONTENT-204-hardware-nvme-wartungsvertraege.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle 267 Altstämme gelesen; globale NVMe-/Firmware-/Selbsttest-Suche.
Vorhandene Hardwarediagnose 244–267, insbesondere Identify/SMART/Error-Log
260–263 und ATA-smartctl 258–259, vollständig von neuen Verträgen abgrenzen.
Frische offizielle Primärrecherche im Tag v2.11 von linux-nvme/nvme-cli:
Documentation/nvme-{get-feature,list,list-ns,fw-download,fw-commit,
device-self-test,self-test-log,get-log,fw-log}.txt.
14 Felder. Altpräfix 84939 Byte SHA256:
c0f625afd05b0520b1a84cf8b753252f38569045225dd498aec1c0d6b1dad903.
Ausschließlich hypothetische Aufgaben; keine Gerätezugriffe, Firmwaretransfers,
Resets, Selbsttests oder NVMe-Aufrufe. Keine Installationen, Builds, DB/.env,
Commits oder Pushes.

## Abnahmekriterien

- [x] 24 SC-Fragen, globale IDs eindeutig, Altbytes erhalten.
- [x] Eindeutige Lösungen, fachnahe Distraktoren und Primärbelege.
- [x] Keine globalen Lernzielduplikate oder Antwort-Tells.
- [x] Unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivcheck grün.

## Ergebnis

291 Modulfragen, global 6369. Frischer Reviewer `content204_review` prüfte
alle 24 Fragen, 96 Optionen und Erklärungen, 267 Altstämme, Nachbarn 244–267
vollständig sowie globale semantische Nachbarn. Neun offizielle v2.11-Seiten
frisch unabhängig recherchiert. Das Listen-Schablonen-Tell in 272 ist korrigiert;
vollständiger tatsächlicher Endread ohne offene Findings bestanden.
App-Parser, 14 Felder, eindeutige IDs und unverändertes Altpräfix bestätigt.
Content-Validator, Diff- und Archivcheck erfolgreich. Keine Geräteoperationen.

Primärquellen: https://github.com/linux-nvme/nvme-cli/tree/v2.11/Documentation
mit nvme-get-feature.txt, nvme-list.txt, nvme-list-ns.txt, nvme-fw-download.txt,
nvme-fw-commit.txt, nvme-device-self-test.txt, nvme-self-test-log.txt,
nvme-get-log.txt und nvme-fw-log.txt (auch einzeln in CSV belegt).
