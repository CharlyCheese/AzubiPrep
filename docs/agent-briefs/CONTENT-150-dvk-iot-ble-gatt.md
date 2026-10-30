# Brief CONTENT-150: DVK-IOT – BLE-Attribute und GATT

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen DVK-IOT-184 bis -207 ergänzen, Modul183 →207.
Bluetooth Low Energy: ATT/GATT-Objektmodell, Nachrichten, Zugriffsrechte
und konkrete Implementierungssemantik. Vorhandene generische Funk-,
MQTT-, CoAP- und LoRaWAN-Lernziele nicht wiederholen.

## Betroffene Dateien

- `content/questions/DVK-IOT.csv`
- `docs/agent-briefs/CONTENT-150-dvk-iot-ble-gatt.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle183 Altstämme gelesen; globale26CSV semantisch abgleichen. Eigene
aktuelle Primärrecherche Bluetooth SIG und gegebenenfalls Zephyr Project.
GATT-/ATT-/GAP-Rollen, unenhanced ATT, MTU und Bestätigungsgrenzen präzise
unterscheiden. Werkzeugdetails ausdrücklich als solche kennzeichnen.
Keine Geräte, Funkverbindungen, Installationen, Builds, Captures, DB/.env,
Server, Commit oder Push. Nur CSV-Lehrfragen und gedachte Fälle.
Altpräfix113602 Byte SHA256:
636a5c10d1141d3c5d51ac80e8186f54fc7a57019662da330a92ccb5d9448a40.

## Abnahmekriterien

- [x] 24 SC-Fragen/14 Felder, globale IDs eindeutig, Altbytes erhalten.
- [x] Protokoll-/Werkzeugsemantik und Lösungen frisch primär belegt.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 SC-Fragen gespeichert, DVK-IOT183 →207, global5073 eindeutige Fragen.
Content-Validator und Diffcheck bestanden. Reviewer content150_review las
alle24 Endfragen samt96 Optionen/Erklärungen und183 Altstämme, verglich
globale26 CSV und belegte alle Lernziele durch eigene frische Primärsuche
in den tatsächlichen Bluetooth-Core6.2-Dokumentkörpern und Zephyr-APIs.
Freigabe ohne Findings; keine Lernzielduplikate, Längen-/Eröffnungs- oder
Füllwort-Tells. Wortgleiche Zwei- bis Fünfwortphrasen zusätzlich geprüft.
App-Parser:207 Modulfragen,24 neueSC/14Felder,5073 eindeutige globale IDs,
Altpräfixhash unverändert. Keine Kompilierung oder Geräteaktion ausgeführt.

Primärquellen:
- https://www.bluetooth.com/bluetooth-le-primer/
- https://www.bluetooth.com/wp-content/uploads/Files/Specification/HTML/Core-62/out/en/host/attribute-protocol--att-.html
- https://www.bluetooth.com/wp-content/uploads/Files/Specification/HTML/Core-62/out/en/host/generic-attribute-profile--gatt-.html
- https://docs.zephyrproject.org/latest/doxygen/html/group__bt__gatt.html
- https://docs.zephyrproject.org/latest/doxygen/html/group__bt__gatt__server.html
- https://docs.zephyrproject.org/latest/doxygen/html/group__bt__gatt__client.html
