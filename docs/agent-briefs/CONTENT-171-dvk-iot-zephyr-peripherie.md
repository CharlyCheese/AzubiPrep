# Brief CONTENT-171: DVK-IOT – Peripheriezugriff mit Zephyr

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen DVK-IOT-208 bis -231 ergänzen, Modul 207 → 231.
Konkrete Zephyr-APIs für Geräte und eingebettete Peripherie.

## Betroffene Dateien

- `content/questions/DVK-IOT.csv`
- `docs/agent-briefs/CONTENT-171-dvk-iot-zephyr-peripherie.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle 207 Altstämme gelesen, globale 26 CSV semantisch abgleichen.
Vorhandene GATT-, FreeRTOS- und allgemeine Busgrundlagen nicht umbenennen.
Eigene aktuelle Primärrecherche https://docs.zephyrproject.org/latest/.
Statische API-Szenarien, keine Installation, Builds, Hardwarezugriffe,
DB/.env, privaten Daten, Commits oder Pushes.
Altpräfix 127211 Byte SHA256:
219261ae3b564326d4b0018af08984b3c69d39c4b9290315404e74737fc2a9c3.

## Abnahmekriterien

- [x] 24 SC-Fragen, globale IDs eindeutig, Altbytes erhalten.
- [x] Aktuelle Primärbelege und eindeutige fachnahe Optionen.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Batch-Endstand 5577. Frischer Reviewer content171_review
prüfte alle 24 Fragen, 96 Optionen, Erklärungen, 207 Altstämme und globale
Nachbarn anhand eigener offizieller Zephyr-Primärrecherche. Sprachliche
Schablonen in 216/217/227 angeglichen und in 217 einen fachfernen Distraktor
durch die plausible Verwechslung von Puffer- und Transaktionsgrenzen ersetzt.
Alle 24 gespeicherten Endfassungen erneut vollständig bestätigt, keine
offenen Findings oder Duplikate. ADC-Maske 0x12 und Puffergröße 16 Byte von
Autor und Reviewer unabhängig gerechnet. Altpräfix, App-Parser, Validator,
Diffcheck und Archivcheck grün. Quellen je Frage in der CSV; Reviewer
bestätigte abweichend gecachte Doxygen-Structseiten zusätzlich gegen die
aktuellen offiziellen main-Header. Keine Zephyr-Installation, Builds oder
Hardwarezugriffe durchgeführt.
