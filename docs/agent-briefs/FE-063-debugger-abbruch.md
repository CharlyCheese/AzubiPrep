# FE-063 – Abbruch und veraltete Antworten

Status: done
Bereich: FE
Angelegt: 2026-11-09

## Ziel

Vierter freigegebener Restschritt: lokale Übungsanfragen abbrechen und alte
Antworten zuverlässig von aktuellen Oberflächenzuständen unterscheiden.

## Allowlist

- frontend/src/pilot/debugger-fetch.js, debugger-core.js, debugger-compiler.js
- frontend/src/components/JsDebuggerPilot.jsx, frontend/public/sw.js
- e2e/tests/debugger-abort.spec.js (neu)
- docs/56-Debugger-Abbruch.md (neu), docs/38-Quellcode-Debugger-Planung.md
- dieser Brief, docs/agent-briefs/STATUS.md, docs/agent-briefs/DONE.md
- ignorierte synthetische Artefakte unter e2e/test-results/

## Abnahme

1. new AbortController(), stabile signal-Eigenschaft, abort() ohne Parameter,
   signal.aborted und signal.reason (standardmäßig AbortError). Native Promises
   bleiben privat, keine echten Browser-Abbruch-/Netzobjekte. Maximal64 Controller.
2. fetch(path,{signal}) nur mit eigenem Signal und genau erlaubten Datenfeldern.
   Bereits abgebrochenes Signal lehnt ohne Einplanung ab. Ein Signal kann mehrere
   Anfragen abbrechen. Abbrechen ist idempotent und entfernt jeden geplanten Task.
3. Abbruch nach Antwortzustellung verhindert Lesen eines noch ungelesenen
   Nicht-Nullbodys, macht abgeschlossene Lese-Promises nicht rückgängig.
   Kein Abbruchereignis/Customreason/Timeoutsignal/Stream in dieser Stufe.
4. Beispiel mit langsam/schnell/abbrechen. Anfragenummer vor Ersetzen erhöhen;
   Erfolg, catch und finally prüfen Aktualität. Alte Ergebnisse dürfen neue
   Daten, Meldungen oder Ladezustände nicht überschreiben.
5. Native Vergleichsproben, gemeinsam genutzte Signale, Abbruchzeitpunkte,
   Wiederholung/Budgets, echte Halte-/Stopp-/Neustarttests Browser/Electron;
   unabhängiger Review, Archivcheck. Daten und alle Zustände bleiben lokal.

## Ergebnis

Abgeschirmte Controller/Signale, idempotenter Abbruch und generationgesichertes
Langsam-/Schnell-Beispiel umgesetzt. Keine Hostsignale oder Netzwerkrechte.
Nicht-Nullbody nach Abbruch folgt explizit Chromium; Nullbody204/205 folgt
WHATWG. Abgeschlossene gepufferte Lese-Promises bleiben abgeschlossen.

13/13 gezielte Browser-/Windows-Electron-Prüfungen ohne Wiederholung grün.
Frischer Review fe063_abort_review: 14 unabhängige Grenz-/Semantik-/Rechteproben,
zusätzlich Chromium/Node und echte lokale HTTP-Antworten verglichen. Die im
nativen Vergleich gefundene Body-Prüfreihenfolge korrigiert und unabhängig
nachgeprüft. Dokumentation geprüft; keine offenen Findings.
→ ../56-Debugger-Abbruch.md.
