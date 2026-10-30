# Brief CONTENT-126: DVK-IOT – LoRaWAN-Betriebsfälle

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen DVK-IOT-160 bis -183 ergänzen, Modul159 →183.
LoRaWAN: Klassen, Aktivierung, Architektur, Datenrahmen und Funkparameter.

## Betroffene Dateien

- `content/questions/DVK-IOT.csv`
- `docs/agent-briefs/CONTENT-126-dvk-iot-lorawan.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle159 Modulstämme gelesen. Globale Suche in26CSV nach LoRa/LoRaWAN,
OTAA/ABP/DevNonce/ADR/Klassen durchgeführt: bestehende LPWAN-Grundlagen
und CSS-Reichweite nicht wiederholen. ADR im SWE-Modul ist ein
Architecture Decision Record, anderes Lernziel.
Primärquellen: LoRa Alliance TS001-1.0.4, The Things Network/Industries
als Entwickler des LoRaWAN-Netzwerkstacks. Versionsabhängige Details
ausdrücklich auf LoRaWAN1.0.4 begrenzen. Keine echten Funkgeräte,
Gateways oder Cloud-Konten verwenden.
Altpräfix99295 Byte SHA256:
4fa54e18f447af30973ebb1bf141394333242cb78411923d098cf60d6ede806d.

## Abnahmekriterien

- [x] 24 SC-Fragen,14 Felder, global eindeutige IDs, Altbytes erhalten.
- [x] Primärquellenbelegte eindeutige Semantik und Versionsprämissen.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

DVK-IOT159 →183, Katalog4497. content126_review hat alle24 gespeicherten
Endfassungen,159 Altstämme und globale semantische Überschneidungen
unabhängig geprüft. Gesamtfreigabe ohne offene Findings. Artikel-Schablonen
162/163 angeglichen, falsch-only jeder/jedes/aller-Füllwörter reduziert,
163c gegen eigenständige OTAA-Fehlvorstellung ersetzt; Typografie korrigiert.
161b normativ präzisiert: nach gültigem RX1 wird RX2 nicht geöffnet.

Normative TS001-1.0.4-Passagen selbst und vom Reviewer frisch gelesen:
§3.3.1,§4.3.1.5–4.4,§6.1–6.2.5. DevNonce in1.0.4 persistent und
inkrementierend, ABP-Counter über Stromausfälle erhalten. Ältere
vereinfachte TTN-Passagen nicht übernommen. Keine globale Lernduplikation
oder systematische Längen-/Detaildominanz. Rechnung1% von3600=36s geprüft;
keine pauschale Aussage über geltende regionale Frequenzregeln.

Primärquellen:
- https://lora-alliance.org/wp-content/uploads/2021/11/LoRaWAN-Link-Layer-Specification-v1.0.4.pdf
- https://www.thethingsnetwork.org/docs/lorawan/classes/
- https://www.thethingsnetwork.org/docs/lorawan/architecture/
- https://www.thethingsnetwork.org/docs/lorawan/end-device-activation/
- https://www.thethingsnetwork.org/docs/lorawan/security/
- https://www.thethingsnetwork.org/docs/lorawan/message-types/
- https://www.thethingsnetwork.org/docs/lorawan/adaptive-data-rate/
- https://www.thethingsnetwork.org/docs/lorawan/spreading-factors/
- https://www.thethingsnetwork.org/docs/lorawan/duty-cycle/

App-Parser183/14, globale IDs eindeutig. Altpräfixhash unverändert.
Content-Validator4497/26 Module, Diff-Check grün; Brief/DONE/STATUS
archiviert und mechanisch geprüft. Keine Geräte-/Gateway- oder DB-Aktionen.
