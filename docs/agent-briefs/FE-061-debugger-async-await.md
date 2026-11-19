# FE-061 – Native async/await-Fortsetzungen

Status: done
Bereich: FE
Angelegt: 2026-11-09

## Ziel

Zweiter freigegebener Restschritt: native async-Funktionen und await im
HTML-/Ereignismodus, ohne Generator-/Replay-Umschreibung. Ausgesetzte Aufrufe
werden aus dem aktiven Stack entfernt und bei Erfolg/Ablehnung reaktiviert.
Quelle, Scope und native Microtaskreihenfolge bleiben erhalten.

## Allowlist

- frontend/src/pilot/debugger-core.js, debugger-compiler.js, debugger-promises.js
- frontend/src/components/JsDebuggerPilot.jsx, frontend/public/sw.js
- neue e2e/tests/debugger-async.spec.js
- docs/38-Quellcode-Debugger-Planung.md, neue docs/54-Debugger-Async-Await.md
- dieser Brief, docs/agent-briefs/STATUS.md, docs/agent-briefs/DONE.md
- ignorierte synthetische Artefakte unter e2e/test-results/

## Abnahme und Grenzen

1. Native async-Deklarationen, gespeicherte Pfeil-/Funktionsausdrücke und await
   in eigenen async-Funktionen; keine Top-Level-Await-/Generatorfreigabe.
   Normale Callback-/Aufrufpositionen unverändert, Originaldateien bleiben erhalten.
2. await-Ausdruck exakt einmal auswerten. Native Promiseidentität/-Assimilation,
   Auflösungsreihenfolge, erfüllte/abgelehnte Awaits, synchroner Funktionsanfang,
   mehrere wartende Funktionen und Fehler in catch/finally nativ vergleichen.
3. Vor Suspend den aktiven Frame aushängen, unmittelbar nach Erfolg aktivieren;
   alle Catch-/Finally-Einstiege einschließlich äußerem Compiler-Finally müssen
   bei Ablehnung idempotent aktivieren. Kein aktiver veralteter Caller.
4. Aktive plus ausgesetzte Frames zusammen höchstens 32 einschließlich Root;
   übrige FE-060-/Debuggerbudgets unverändert. Wartende native async-Promises
   erfassen, Await-Adoption als behandelt werten, Ressourcenfehler endgültig.
   Kein zweiter VM-Eintritt während echter Debuggerpause.
5. Beispiel mit async/await, try/catch/finally und Erfolg/Fehler. Haltepunkte vor/
   nach await, Parameter/Captures, Über/Aus, Stop/Wechsel, mobile Tastatur und
   Windows-Electron prüfen. Frischer unabhängiger Review und Archivcheck.

## Ergebnis

Native async/await mit getrennten wartenden Frames umgesetzt. Rückgabeübernahme
verfolgt die Tiefe von finally-Abschlüssen: verworfene Rückgaben markieren keine
Ablehnungen versehentlich als behandelt. Aktive und wartende Frames teilen
weiterhin die Grenze 32. Originalpositionen und native Microtaskfolge erhalten.

24/24 gezielte Async-/Promise-/Fehlerprüfungen grün; ergänzender UI-Modus-/
Projektwechsel 1/1 grün, jeweils ohne Wiederholung. Enthalten sind echte
Windows-Electron-Neustarts und schmale Tastaturbedienung. Frischer unabhängiger
Review fe061_async_review: gefundenen finally-Abbruch korrigiert und nachgeprüft;
13 native Vergleichsprogramme, elf reale Pausen mit abgewiesenem Fremdbefehl,
Über/Aus sowie echte UI-Haltepunkte vor/nach await und Parameter/Captures grün.
Keine offenen Findings. Dokumentation: ../54-Debugger-Async-Await.md.
