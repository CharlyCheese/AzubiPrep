# Brief OPS-034: ChatGPT-Modellkatalog separat begrenzen

Status: done
Bereich: OPS
Angelegt: 2026-10-31

## Auftrag

Praxistest meldet „Die Cloudantwort überschreitet die erlaubte Größe“ bereits
bei „Verbindung prüfen“. Der bisher gemeinsame512000-Byte-Grenzwert gilt auch
für den kontogebundenen Modellkatalog und verhindert dessen Abruf.

## Betroffene Dateien

- backend/src/chatgpt.js, backend/test/chatgpt.test.js
- docs/26-KI-Anbieter.md
- docs/agent-briefs/OPS-034-chatgpt-modellkatalog-groesse.md
- docs/agent-briefs/STATUS.md, docs/agent-briefs/DONE.md

## Festlegungen

Nur GET https://api.openai.com/v1/models ohne Query erhält eine eigene
begrenzte Größenquote (8MiB). Inferenz/SSE und Auth-Metadaten bleiben auf
512000Bytes, Lernantworten auf18000Zeichen begrenzt. Keine freigebbaren
Transportlimits oder Lockerung von HTTPS/Host/Redirect/Token-/Quellengrenzen.
UI erhält weiterhin höchstens30 freigegebene Modellnamen/-anzeigenamen,
keine sonstigen Katalogmetadaten. Ungültige Einträge auslassen.

Primärquelle zur kontogebundenen Katalogform geprüft31.10.2026:
https://developers.openai.com/siwc/token-sharing-open-source/models-and-inference
Die8MiB-Grenze ist eine Anwendungsentscheidung, keine dokumentierte OpenAI-Quote.

Tests/Review nur synthetische Kataloge. Reale Gegenprobe ausschließlich über
den vorhandenen lokalen Statusendpunkt, nur neutrale Ergebnisflags ausgeben;
keine Tokens/Accountdaten lesen oder ausgeben und keine echten Modellanfragen
ausführen. Private Materialien unberührt, keine neuen Abhängigkeiten/Installer.

## Abnahme

- [x] Synthetischer Katalog oberhalb512000Bytes abrufbar, oberhalb8MiB
  weiterhin gesperrt; Ausgabe auf benötigte Felder/30Modelle begrenzt.
- [x] Inferenz/SSE und Auth-Metadaten behalten ursprüngliche Grenzen;
  Endpunkt-/Methoden-/Queryausnahmen und ungültige Einträge getestet.
- [x] Relevante Tests/Lint, frischer unabhängiger Review, Doku/Archivcheck grün.
- [x] Reale lokale Katalog-Gegenprobe neutral dokumentiert, soweit verfügbar.

## Ergebnis

Für den präzisen Katalog-Endpunkt feste8MiB-Transportquote ergänzt, alle anderen
Abrufe behalten512000Bytes. Leer-Query-Suffix, echte Queryparameter, andere
Pfade, Body/POST und Streaming aktivieren die Ausnahme nicht. Modelllisten
werden auf30gültige sichtbare Kennungen/Anzeigenamen reduziert; sonstige
Metadaten verlassen die interne Verarbeitung nicht. Ungültige Einträge,
fehlende Slugs, unpassende Labels und top-level null sicher behandelt.

Synthetische Regressionen für800kB-Katalog und8MiB-Überschreitung, alte
Inferenz-/Auth-Grenzen sowie Ausgabe-/Endpunktbegrenzung grün.
Reale Gegenprobe über den lokalen Statusendpunkt nach Serverneustart:
HTTP200/state=ready/acht Modelle. Keine Modellgenerierung ausgeführt und
keine Tokens/Accountinformationen ausgegeben oder direkt gelesen. Bestehende
Anmeldung konnte weiterverwendet werden. Private Unterlagen unverändert.

Unabhängiger Review fand zwei Randfälle (leeres Query-Suffix und null-Katalog);
beide korrigiert und regressionsgeprüft.191Backendtests und Lint grün.
Frischer unabhängiger Code-/Dokunachreview ohne offene Findings:18gezielte
Tests plus12eigene synthetische Grenzfallprüfungen grün. Finalen Serverstand
erneut gestartet, reale Statusgegenprobe nochmals HTTP200/ready/achtModelle.
Erste reale Modellantwort bleibt Nutzerabnahme. Archivcheck290erledigt/10offen grün.
