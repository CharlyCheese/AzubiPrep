# Brief CONTENT-079: DVK-NET – Modbus- und CoAP-Protokollfälle

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

24 eigenständige SC-Fragen DVK-NET-100 bis -123 ergänzen, Modul99 →123.
Konkrete Modbus-Funktions-/Framing- und CoAP-Nachrichtenfälle, jeweils
mit eindeutig vorgegebenem Transport und Format. Danach den regulären
15-Batch-Übergabestand CONTENT-065 bis -079 dokumentieren.

## Betroffene Dateien

- `content/questions/DVK-NET.csv`
- `docs/agent-briefs/CONTENT-079-dvk-net-protokollfelder.md`
- `docs/agent-briefs/CONTENT-CHECKPOINT.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

AGENTS.md und ORCHESTRATOR.md. Modbus Organization Application Protocol
V1.1b3, Serial Line Guide V1.02, TCP/IP Implementation Guide und IETF
RFC7252. Vorhandene99Modulfragen gelesen; globale Lernzielprüfung erfolgt
zusätzlich für jeden neuen Fall. Alter Byte-Präfix SHA256:
0a85b93ce251292c2f374e2b1ae6f6059be23bb6371015b819bec23380a8b903.

## Abnahmekriterien

- [x] Genau24 neue SC-Zeilen, Schema/alte Bytes erhalten, eindeutige IDs.
- [x] Alle Antworten/Annahmen anhand Primärquellen und Rechnungen geprüft.
- [x] Keine globalen Lernzielduplikate oder systematischen sprachlichen Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff-Prüfung und Archivierungscheck grün.
- [x] Checkpoint enthält richtige Summen und Fortsetzung ab CONTENT-080.

## Ergebnis

DVK-NET 99 → 123. Gesamtstand 3369 Fragen. Neuer 15-Batch-Checkpoint
CONTENT-065 bis -079: zwölf Batches mit24 und drei mit12, zusammen +324.
Nächster Batch CONTENT-080, nächster regulärer Checkpoint nach094.

Frischer unabhängiger Vollreview content079_review mit eigener Recherche
aller24Fragen: BESTANDEN nach Korrektur zweier sprachlicher Tells.
118: drei Distraktoren begannen mit „Die“,119 mit „Ein“, jeweils anders
als die Lösung. Jeweils erster Distraktor umformuliert und tatsächlicher
gespeicherter Endstand erneut geprüft. Keine offenen Findings, global
keine Lernzielduplikate und keine systematische Längen-/Detaildominanz.

Primärquellen, vom Autor und unabhängig vom Reviewer gelesen:
https://www.modbus.org/file/secure/modbusprotocolspecification.pdf
Abschnitte4.2–4.4,6.1,6.3,6.5–6.6,6.8,6.12,6.16–6.17,6.21,7.
https://www.modbus.org/file/secure/modbusoverserial.pdf
Abschnitte2.1–2.2,2.5.1.1, insbesondere explizite Baudratenannahme in111.
https://www.modbus.org/file/secure/messagingimplementationguide.pdf
Abschnitte3.1.2–3.1.3, MBAP-Transaktion/Gateway/ADU.
https://www.rfc-editor.org/rfc/rfc7252.html
Abschnitte4.2–4.3,5.3,5.9.1.5,5.10.1,5.10.5.

Rechnungen unabhängig bestätigt:3Register=6Datenbytes, Exception0x83,
Register0x1234, Coilfolge1,0,1,1,0, Mask Write0x00F5, Read/Write liest9.
101 betrifft logische Standarddatenbereiche, kein zugesichertes physisches
Speichermapping. Alte88–94 behandeln andere Protokollaspekte.

App-Parser:26Dateien/3369eindeutige IDs und korrekte Feldzahlen.
Alter DVK-NET-Byte-Präfix exakt erhalten. Alle26CSV-Präfixe des Git-HEAD
unverändert, HEAD2433+936=3369. Content-Validator, Diff-Prüfung und
Archivierungscheck erfolgreich. Kein Import, Build, Commit oder Push.
