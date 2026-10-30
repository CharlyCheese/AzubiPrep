# Brief CONTENT-108: DVK-IOT – CoAP und Blocktransfer

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen DVK-IOT-136 bis -159 ergänzen, Modul135 → 159.
CoAP-Basisformat, Optionen, Observe-Details und Block-Wise Transfer nach
RFC7252/7641/7959. Keine realen Geräte-/Netzwerkzugriffe.

## Betroffene Dateien

- `content/questions/DVK-IOT.csv`
- `docs/agent-briefs/CONTENT-108-dvk-iot-coap-blocktransfer.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

AGENTS.md, ORCHESTRATOR.md;135 Modulaltfragen berücksichtigt.
Globale Lernzielsuche über26 CSV: bereits vorhandene CoAP-Fälle
DVK-NET088–090/118–123 (leeres ACK, Duplikate, Observe-Grundidee,
Antworttoken, NON, Ping, Max-Age-Default, Uri-Path, Content-Code)
werden nicht wiederholt. Basisformat ausdrücklich ohne spätere
Tokenlängenerweiterungen behandeln.
Vor Erstellung gelesene Primärquellen:
https://www.rfc-editor.org/rfc/rfc7252.html
https://www.rfc-editor.org/rfc/rfc7641.html
https://www.rfc-editor.org/rfc/rfc7959.html
Alter Byte-Präfix SHA256:
c5b11f3476a52cc3b00f1af4dae5be1d5f196ce0060d9da0957b69d2698a43d4.

## Abnahmekriterien

- [x] Genau24 SC-Fragen, eindeutige IDs,14 Felder und Altbytes erhalten.
- [x] Protokollprämissen, Zahlenwerte und Lösungen eindeutig primärquellenbelegt.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Modul 159, Katalog 4065 zum Batchabschluss.
App-Parser: 159 Records/eindeutige IDs, 14 Felder, genau 24 neue SC-Fragen.
85933 Altbytes unverändert mit dem oben dokumentierten SHA256.
Content-Validator, Diff- und Archivierungscheck grün.

Frischer Reviewer `content108_review`: alle 24 gespeicherten Neufragen und
135 Altstämme gelesen, globale semantische Lernzielsuche über 26 CSV.
Eigene Webprüfung: RFC7252 §§3,4.2,5.4.1,5.8.2,5.9.1.3,5.9.2.5–6,
5.10.3–4,5.10.7,6.2,9.1; RFC7641 §§2,3.1,3.4,3.6,4.1,4.5;
RFC7959 §§2.1,2.2,2.5,4; RFC6690 §4.
Kein Finding: eindeutige Lösungen und plausible Optionen, keine
Lernzielduplikate oder bindenden Längen-/Füllwort-/Strukturtells.
DVK-NET037/088–090/118–123 und HTTP-Nachbarfragen ausdrücklich verglichen.
Rechnungen 1+4=5, 2^(6+4)=1024 und 3×64=192 unabhängig bestätigt.
Keine Gerätezugriffe, Builds, Installationen oder Datenbankimporte.
