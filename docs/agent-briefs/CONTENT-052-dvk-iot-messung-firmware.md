# Brief CONTENT-052: DVK-IOT – Messwerterfassung, Energieplanung und Firmwarebetrieb

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

DVK-IOT von 75 auf 99 Fragen erweitern. 24 neue SC-Anwendungsfragen
DVK-IOT-076 bis -099 ergänzen bestehende Grundlagen. Alle bisherigen
Datensätze und ihre IDs unverändert erhalten.

## Betroffene Dateien

- `content/questions/DVK-IOT.csv`
- `docs/agent-briefs/CONTENT-052-dvk-iot-messung-firmware.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Primärquellen

AGENTS.md und ORCHESTRATOR.md. Eigene Lernaufgaben, keine übernommenen
IHK-Fragen. Technische Annahmen ausdrücklich angeben; keine Anleitungen
zur Veränderung realer Maschinen oder Schutzfunktionen.
Primärquellen tatsächlich recherchieren und im Ergebnis zuordnen.

- https://docs.freertos.org/
- https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/system/sleep_modes.html

## Abnahmekriterien

- [x] Genau 24 neue SC-Fragen, CSV-Schema und alte 75 Datensätze unverändert.
- [x] Eindeutige Lösungen und Erklärungen, Rechnungen unabhängig bestätigt.
- [x] Keine Inhaltsduplikate, plausible nahe Distraktoren und klare Annahmen.
- [x] Keine systematischen Längen-, Detailgrad- oder Schablonen-Tells.
- [x] Unabhängiger Vollreview aller neuen Fragen mit Primärquellen bestanden.
- [x] Content-Validierung, Diff-Prüfung und Archivierungscheck erfolgreich.

## Ergebnis

24 SC-Anwendungsfragen DVK-IOT-076 bis -099 ergänzt, Modul jetzt 99 Fragen.
Unabhängiger Vollreview und Nachprüfung bestanden. SPI- und Redundanz-
Distraktoren in 081/094 ersetzt. Alte 75 Zeilen unverändert; keine neuen
Inhaltsduplikate oder belastbaren Antwortmuster gefunden.

Primärquellen, tatsächlich recherchiert am 2026-10-29:
- 076/077/093: Analog Devices ADC Errors, eigene Skalierungs-/Offsetrechnungen.
- 078/081: Microchip TB3216 USART und SPI Mode Overview.
- 079/080: [NXP AN262](https://www.nxp.com/docs/en/application-note/AN262.pdf) und [UM10204](https://www.nxp.com/docs/en/user-guide/UM10204.pdf).
- 082–084: FreeRTOS Deferred Interrupt Processing, Kernel Book Kapitel 7 und Mutexes.
- 085–088: Microchip Mehrbytezugriffe, WG14 N1570, Linux Circular Buffers und Microchip Watchdog.
- 089–091: eigene PWM-, Batterie- und Duty-Cycle-Rechnungen.
- 092: Espressif Schematic Checklist.
- 094: [NASA Common Cause Failures](https://ntrs.nasa.gov/citations/20240013667).
- 095–097: [Espressif OTA](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/system/ota.html).
- 098: Espressif ESP Timer; 099: AWS IoT Security Best Practices.

Unabhängig bestätigt: 3,22265625 mV, 960 Byte/s, 0x01FF, 10 Schritte,
3 freie Plätze, 250 µs, 1.200 Stunden, 0,343166… mA und Offset −2 °C.
Content-Validierung, Diff-Prüfung und Archivierungscheck erfolgreich.
Keine Geräteänderungen, Datenbankimporte, Builds, Commits oder Pushes.
