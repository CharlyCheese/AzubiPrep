# Brief CONTENT-053: DVK-NET – MQTT-, CoAP-, Modbus- und OPC-UA-Anwendungen

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

DVK-NET von 75 auf 99 Fragen erweitern. 24 neue eigene
SC-Anwendungsfragen DVK-NET-076 bis -099 ergänzen.
Bisherige Datensätze, IDs und Modulzuordnung unverändert erhalten.

## Betroffene Dateien

- `content/questions/DVK-NET.csv`
- `docs/agent-briefs/CONTENT-053-dvk-net-protokollfaelle.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Primärquellen

AGENTS.md und ORCHESTRATOR.md. Eigene Aufgaben, keine kopierten IHK-Fragen.
Nur Lernfälle und ausdrücklich begrenzte Modelle; keine realen Anlagen
oder Schutzfunktionen ändern. Primärquellen recherchieren und zuordnen.

- https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html
- https://www.rfc-editor.org/rfc/rfc7252
- https://www.modbus.org/docs/Modbus_Application_Protocol_V1_1b3.pdf

## Abnahmekriterien

- [x] Genau 24 neue SC-Fragen, CSV-Schema und alter Bestand unverändert.
- [x] Eindeutige Lösungen und Erklärungen, klare Annahmen und geprüfte Rechnungen.
- [x] Keine Inhaltsduplikate; plausible, fachnahe Distraktoren.
- [x] Keine systematischen Längen-, Detailgrad- oder Schablonen-Tells.
- [x] Unabhängiger Vollreview mit tatsächlich recherchierten Primärquellen bestanden.
- [x] Content-Validierung, Diff-Prüfung und Archivierungscheck erfolgreich.

## Ergebnis

24 SC-Fragen DVK-NET-076 bis -099 ergänzt, Modul jetzt 99 Fragen.
Unabhängiger Vollreview und Nachprüfung bestanden. 096 präzisiert auf eine
fehlerhafte OPC-UA-Serverantwort mit Bad: Zahlenwert zwingend ignorieren.
099 mit parallelen PoE-Rechenoptionen formuliert. Alte 75 Zeilen unverändert.
Keine Inhaltsduplikate oder verbleibenden Antwortmuster gefunden.

Primärquellen, tatsächlich recherchiert am 2026-10-29:
- 076–087: [OASIS MQTT 3.1.1](https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html), Topicfilter, Retain, QoS, Will, Sitzung, Client-ID und Broker-Vertrauensgrenze.
- 088/089: [RFC 7252](https://www.rfc-editor.org/rfc/rfc7252), Separate Response und Duplikaterkennung.
- 090: [RFC 7641](https://www.rfc-editor.org/rfc/rfc7641), Observe.
- 091–093: [Modbus V1.1b3](https://www.modbus.org/file/secure/modbusprotocolspecification.pdf), Register und Adressierung. Alter Modbus-Link im Quellenstartpunkt war nicht mehr erreichbar.
- 094: eigene Zweierkomplement-Rechnung −1.
- 095–097: OPC UA Part 3 NodeId/Namespace und Part 4 DataValue/MessageSecurityMode.
- 098/099: eigene Rechnungen, 4 ms und 88 W Bedarf bei 80 W Budget, Fehlbetrag 8 W.

Content-Validierung, Diff-Prüfung und Archivierungscheck erfolgreich.
Keine Geräte-/Netzänderungen, Datenbankimporte, Builds, Commits oder Pushes.
