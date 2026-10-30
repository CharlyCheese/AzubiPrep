# Brief CONTENT-078: DVK-IOT – FreeRTOS-Datenübergabe und Zeitverhalten

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

12 SC-Fragen DVK-IOT-100 bis -111 anhängen, Modul 99 → 111.
Konkrete FreeRTOS-Queue-/Synchronisations-/Zeitfälle, abgegrenzt von den
vorhandenen ISR-, Queuevoll- und Prioritätsvererbungsfragen.

## Betroffene Dateien

- `content/questions/DVK-IOT.csv`
- `docs/agent-briefs/CONTENT-078-dvk-iot-rtos-ablauf.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Primärquellen

AGENTS.md, ORCHESTRATOR.md. Offizielle FreeRTOS-Kernel-Header/Quellen
und API-Dokumentation. Vanille-FreeRTOS-Einkernannahmen, wo relevant,
ausdrücklich nennen und keine ESP-IDF-SMP-Sonderfälle unterschlagen.
Alter Byte-Präfix vor Änderung: SHA256
478d33bc379dfb61c8c07b336b6224a03b67ff96a3065583d8d2f52b69ad009d.

## Abnahmekriterien

- [x] Genau12 SC-Fragen, altes Schema/alte Bytes erhalten, IDs global eindeutig.
- [x] Eindeutige belegte API-/Speicher-/Zeitsemantik und Modellannahmen.
- [x] Keine globalen Inhaltsduplikate oder systematischen Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit Primärquellenrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff-Prüfung und Archivierungscheck erfolgreich.

## Ergebnis

DVK-IOT99 →111, insgesamt3345Fragen nach diesem Batch. Zwölf konkrete
Fälle zu Wert-/Zeigerqueues, Peek, Einplatz-Overwrite, binären/zählenden
Semaphoren, ISR-API, Priorität, periodischen Terminen, Tickrundung,
Ereignisbits und Softwaretimer-Kontext.

Eigene Vorprüfung präzisierte104: beide Gives erfolgen vor beiden Takes.
Frischer unabhängiger Vollreview content078_review: BESTANDEN ohne Findings.
Alle zwölf tatsächlichen Endzeilen einzeln geprüft, einschließlich globaler
Lernzielsuche über26CSV und sämtlicher sprachlicher Tell-Regeln.
106 ist von082 ISR-Arbeitsverlagerung,083 Queueüberlauf und084
Prioritätsvererbung durch die konkrete zulässige Semaphor-API abgegrenzt.

Primärquellen: FreeRTOS-KernelV11.2.0, zugehörige Header je CSV-Zeile:
https://raw.githubusercontent.com/FreeRTOS/FreeRTOS-Kernel/V11.2.0/include/queue.h
https://raw.githubusercontent.com/FreeRTOS/FreeRTOS-Kernel/V11.2.0/include/semphr.h
https://raw.githubusercontent.com/FreeRTOS/FreeRTOS-Kernel/V11.2.0/include/task.h
https://raw.githubusercontent.com/FreeRTOS/FreeRTOS-Kernel/V11.2.0/include/projdefs.h
https://raw.githubusercontent.com/FreeRTOS/FreeRTOS-Kernel/V11.2.0/include/event_groups.h
https://raw.githubusercontent.com/FreeRTOS/FreeRTOS-Kernel/V11.2.0/include/timers.h
Zusätzlich unabhängige Recherche in tasks.c und timers.c derselben Version.

App-Parser bestätigt111Datensätze mit14Feldern. Alter Byte-Präfix stimmt
mit dem vorher gesicherten SHA256 exakt überein. Content-Validator,
git diff --check und Archivierungscheck erfolgreich. Keine Imports,
Builds, Commits, Pushes oder realen Geräteänderungen.
