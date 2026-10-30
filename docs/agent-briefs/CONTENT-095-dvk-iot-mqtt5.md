# Brief CONTENT-095: DVK-IOT – MQTT-5-Betriebsfälle

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

24 SC-Fragen DVK-IOT-112 bis -135 ergänzen, Modul111 → 135.
Konkrete MQTT-5-Optionen und Betriebsfälle anhand des OASIS-Standards.
Keine Wiederholung von DVK-NET076–087 (allgemeine Topicfilter, Retain,
QoS0/1, Last Will, CleanSession, Client-ID und TLS).

## Betroffene Dateien

- `content/questions/DVK-IOT.csv`
- `docs/agent-briefs/CONTENT-095-dvk-iot-mqtt5.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

AGENTS.md, ORCHESTRATOR.md;111 Bestandsfragen gelesen, globaler
MQTT-Lernzielvergleich begonnen. OASIS MQTT Version5.0, Standard2019:
https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html
Alter Byte-Präfix SHA256:
34bf80d9f79c37b03eda5c9753eb481c2dc59cd3fb9b5c78746b8aa8eed40ab6.
Nur theoretische Protokollfälle, keine Brokerverbindung herstellen.

## Abnahmekriterien

- [x] Genau24 SC-Fragen, alte Bytes/Schema erhalten, IDs eindeutig.
- [x] MQTT-5-Semantik, Voraussetzungen und Lösungen primärquellenbelegt.
- [x] Keine globalen Lernzielduplikate oder systematischen Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 SC-Fragen DVK-IOT-112–135 ergänzt: Topic-Großschreibung und Dollarregel,
No Local, Retain Handling/As Published, Shared Subscriptions,
Message Expiry, Will Delay, Topic Aliases und deren Verbindungslaufzeit,
Receive Maximum, Paketgesamtgröße, Request/Response, Correlation Data,
Subscription Identifier, Content Type/UTF-8, User Properties,
negative PUBACK-Antwort, Pings, Keep Alive und String-Längengrenze.

Frischer Reviewer content095_review prüfte alle24 tatsächlichen Fragen mit
eigener Recherche im OASIS-MQTT-5-Standard. Abschnittsabgleich:112/113/135
§4.7/1.5.4,114–116 §3.8.3.1/3.3.1,117/118 §4.8.2/3.2.2.3.13,
119 §3.3.2.3.3,120 §3.1.3.2.2,121/122 §3.3.2.3.4,123/124
§3.1.2.11.3–4,125–130 §3.3.2.3/4.10,131 §3.4.2.1,132 §3.12–13,
133 §3.1.2.10,134 §3.2.2.3.14. Globaler semantischer Vergleich aller26CSV,
111 Modulbestandsfragen und DVK-NET076–087: keine neuen Lernzielduplikate.

Review-Findings korrigiert: Artikel-Tells123/127/131 angeglichen;
entbehrliche Füllwörter zwingend/verpflichtend in120/127/128/129 entfernt.
Redaktionelle Leerzeichen120/124/133 ergänzt. Reviewer las die gespeicherte
Endfassung einschließlich letzter redaktioneller Nachprüfung erneut:
bestanden, keine offenen Befunde. Keine exklusiven falschen Phrasen über
3+Fragen, kein systematisches Längen-/Detailsignal.

App-Parser135 Datensätze/14 Felder,24 neue SC. Alter Byte-Präfix unverändert
(SHA256 oben). Content-Validator nach Folgeentwurf096:3777Fragen/26Dateien
grün. Globale IDs eindeutig; Diff- und Archivierungscheck erfolgreich.
Keine Brokerverbindung und keine Konfigurationsänderungen durchgeführt.
