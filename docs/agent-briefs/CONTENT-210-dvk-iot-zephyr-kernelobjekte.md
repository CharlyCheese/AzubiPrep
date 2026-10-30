# Brief CONTENT-210: DVK-IOT – Zephyr-Kernelobjekte

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen DVK-IOT-232 bis -255 ergänzen, Modul 231 → 255.
Konkrete Zephyr-Verträge zu Workqueues, Timern und Kernelobjekten anwenden.

## Betroffene Dateien

- `content/questions/DVK-IOT.csv`
- `docs/agent-briefs/CONTENT-210-dvk-iot-zephyr-kernelobjekte.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle 231 Altstämme gelesen, Ausgabeabschnitt 129–159 separat vervollständigt.
Globale gezielte Suchen nach Kernel-APIs ohne vorhandene Zephyr-Kernelfragen.
FreeRTOS-Queue-Kopie/Peek, Prioritätsvererbung und Java-ReentrantLock-Zähler
nicht als neue Lernziele wiederholen. Acht frisch gelesene Zephyr-Herausgeberseiten:
Workqueues, Timers, Message Queues, Memory Slabs, FIFOs, Events, Polling, Mutexes.
14 Felder. Altpräfix 140157 Byte SHA256:
2cd2ea689683023477089121fc0ccab3addcec3d407c46d73d5a2a908c2ae179.
Keine Kernel-/Geräteausführung, Installationen, Builds, DB/.env, Commits oder Pushes.

## Abnahmekriterien

- [x] 24 eindeutige neue SC-Zeilen, Altbytes erhalten.
- [x] Präzise API-Verträge, eindeutige Lösungen und plausible Distraktoren.
- [x] Keine globalen Lernzielduplikate oder Antwort-Tells.
- [x] Unabhängiger Vollreview mit eigener frischer Quellenrecherche bestanden.
- [x] App-Parser, Validator, Diff- und Archivcheck grün.

## Ergebnis

DVK-IOT 231 → 255, global nach diesem Batch 6513 Fragen. Reviewer
content210_review hat alle 24 Stämme, 96 Optionen, 24 Erklärungen und 231 Altstämme
sowie gezielte globale Nachbarn geprüft und alle acht Herausgeberquellen frisch
recherchiert. Freigabe ohne Findings. Die verwandten Handler-Fragen 233/111
wurden ausdrücklich abgeglichen: unterschiedliche Kernel-Ausführungskontexte
Workqueue und FreeRTOS-Timerdienst, kein identischer API-Vertrag.
App-Parser: 255 DVK-IOT-Fragen mit 14 Feldern, Altpräfix unverändert;
globale IDs eindeutig. Content-Validator, Diff- und Archivcheck grün.
Keine Kernel- oder Geräteausführung.
