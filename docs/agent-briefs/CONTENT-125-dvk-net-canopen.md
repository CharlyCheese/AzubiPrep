# Brief CONTENT-125: DVK-NET – CANopen-CC-Protokollfälle

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen DVK-NET-148 bis -171 ergänzen, Modul147 →171.
CANopen CC: NMT, Fehlerkontrolle, SDO/PDO und Object Dictionary.

## Betroffene Dateien

- `content/questions/DVK-NET.csv`
- `docs/agent-briefs/CONTENT-125-dvk-net-canopen.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

AGENTS.md/ORCHESTRATOR.md. Alle147 Altstämme gelesen; globale Suche
über26CSV nach CAN/CANopen/NMT/PDO/SDO/COB-ID ohne bestehende Lernziele.
Vorhandene EtherCAT-Grundlagen DVK-NET-071 und DVK-AUT-028 sind kein
Bestandteil dieses Batches. CANopen CC ausdrücklich von CANopen FD trennen.
Primärquellen CAN in Automation: CANopen-Poster2024 und Knowledge-Seiten
zu Network Management, SDO/PDO und Object Dictionary. Bei Detailbedarf
offizielle Geräteherstellerdokumentation zusätzlich lesen.
Keine Verbindung zu einem Feldbus oder realen Geräten aufbauen.
Alter Byte-Präfix85727 Byte, SHA256:
4bd9085c71330dda4bdff7610d598e42473d70df544d71558d76e0239f8a7d44.

## Abnahmekriterien

- [x] Genau24 SC-Fragen, global eindeutige IDs,14 Felder, Altbytes erhalten.
- [x] CC-Version/Default-COB-IDs/Bytefolge und Protokollprämissen eindeutig.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener aktueller Primärrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

DVK-NET147 →171, Katalog4473 zum Batchabschluss. Alle24 Endfassungen
von content125_review vollständig unabhängig geprüft,147 Altstämme gelesen,
globale semantische Suche über26CSV. Keine offenen Findings; keine
Lernzielduplikate oder bindenden sprachlichen Tells. Vier von24 korrekten
Antworten allein am längsten. Reviewer hat CiA-NMT/OD/SDO/PDO und
Fehlerkontrolle selbst frisch gelesen, CC-Posterbereich und Applied-Motion-
Manual S.90–92 gegengeprüft sowie Beckhoff-EMCY-Struktur geprüft.

Primärquellen:
- https://www.can-cia.org/can-knowledge/canopen-internal-device-architecture
- https://www.can-cia.org/can-knowledge/network-management/
- https://www.can-cia.org/can-knowledge/error-control-protocols
- https://www.can-cia.org/can-knowledge/sdo-protocol
- https://www.can-cia.org/can-knowledge/pdo-protocol
- https://member.can-cia.org/files/canopen_poster_2024.pdf (CC-Bereich)
- https://applied-motion.s3.amazonaws.com/documents/Manuals/CANopen_Manual_920-0025L.pdf
- https://infosys.beckhoff.com/content/1033/bk51x0/3130085131.html (Reviewer)

App-Parser171 Fragen/14 Felder; global4473 eindeutige IDs. Altbytehash
unverändert, Content-Validator und Diff-Check grün. Default-SDO-Paar
0x612/0x592 und Heartbeat0x72A unabhängig nachgerechnet. Keine echte
Geräte- oder Busverbindung. Brief/DONE/STATUS archiviert und geprüft.
