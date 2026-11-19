# FE-060 – Native Promises im Debugger

Status: done
Bereich: FE
Angelegt: 2026-11-09

## Auftrag und Reihenfolge

Freigegeben ist der schrittweise Restaufbau des geplanten Debuggers:
Promises → async/await → kontrollierte Daten → Abbruch/veraltete Antworten →
JavaScript-Projektabnahme → TypeScript → React → Abschlussprüfung/Web-/Desktoppakete.
Jede Stufe erhält eigenen Brief, technische Prüfung und frischen Review.
Der kurze praktische Nutzertest erfolgt gebündelt am Ende. Keine Veröffentlichung,
keine privaten Unterlagen und keine neue Bibliothek dadurch freigegeben.

Diese Stufe ergänzt native Promise.resolve/reject, new Promise und
then/catch/finally im HTML-/Ereignismodus. Callbacks halten in derselben VM;
Microtasks laufen nach dem synchronen Aufruf und vor dem nächsten Timer/Ereignis.
Eigene Thenables, Promise-Unterklassen und Kombinatoren bleiben zunächst gesperrt.

## Allowlist

- neue frontend/src/pilot/debugger-promises.js, debugger-jobs.js
- frontend/src/pilot/debugger-core.js, debugger-compiler.js, debugger.worker.js
- frontend/src/components/JsDebuggerPilot.jsx, frontend/public/sw.js
- neue e2e/tests/debugger-promises.spec.js
- e2e/tests/debugger-timers.spec.js (veraltetes Promise-Verbot ersetzen)
- docs/38-Quellcode-Debugger-Planung.md, neue docs/53-Debugger-Promises.md
- dieser Brief, docs/agent-briefs/STATUS.md, docs/agent-briefs/DONE.md
- ignorierte synthetische Artefakte unter e2e/test-results/

## Architektur und Abnahme

1. Native QuickJS-Promises; keine simulierten Ergebniswerte, kein Replay.
   Native Jobausführung muss wirklich auf Asyncify warten. Der synchrone
   executePendingJobs-Pfad und dessen nur scheinbar asynchrone FFI-Abkürzung
   sind gesperrt; expliziter async-cwrap-Adapter mit gepinnter 0.32.0 und
   eigenem Pointer-/Ownership-Nachweis. Kein VM-Zugriff während einer Pause.
2. Quelle/Position, Callbackparameter, Fehlerweitergabe, Kettenrückgaben,
   finally und wiederholtes Auflösen nativ vergleichen; Fehler dürfen durch
   catch behandelt werden. Unbehandelte Ablehnungen nach leerer Microtaskqueue
   beenden verständlich. Alle freigegebenen Promises werden passiv über begrenzte eigene Handles im
   Worker beobachtet; Zustandsprüfung nur nach vollständig beendetem Drain,
   keine zusätzlichen Beobachterreaktionen oder Renderer-Handles.
3. Private Promise-Marke; nur registrierte eigene Callbackfunktionen und
   primitive/private Auflösefunktionen. Kein Getter-/Thenable-/Prototypaufruf,
   kein Host-Promise oder VM-Handle im Renderer. Quelle bleibt Originalquelle.
4. Höchstens 128 Lern-Promises, 512 Promiseoperationen und 512 native Jobs pro
   Sitzung (einschließlich nativer Auflösejobs). Bestehende Zeit-/Heap-/Stack-/
   Ausgabe-/Nachrichtengrenzen unverändert. Unter/auf/über Grenzen und endgültige
   Abbrüche trotz Catch/Finally prüfen. Jobs dürfen andere Jobs erzeugen, aber
   nicht außerhalb der kumulativen Grenzen.
5. Kein Modelljob/Timer/Klick während Pause, kein Host-Wiedereintritt. Timer-
   Verschachtelung endet vor Microtasks. Stop/Quellwechsel/Navigation/Fehler
   beendet physisch; Wiederherstellung startet keine Aufgaben.
6. Neues kleines Erfolgs-/Fehlerbeispiel mit then/catch/finally, verständlichem
   Haltgrund und Hinweisen. Browser/Windows-Electron, mobile/Tastaturprobe,
   geeignete Regression, frischer unabhängiger Review und Archivcheck.

## Ergebnis

Native Promise-Integration implementiert. 29 gezielte Browser-/Windows-Electron-
Fälle (Promises, Timer, synchrone Fehler) ohne Wiederholung grün; danach eigener
Jobgrenzenfall 1/1 grün: 512 echte Jobs erfolgreich, vor Job 513 endgültiger
Abbruch. Zusammen acht neue Promise-Fälle; native Vergleichsreihenfolge,
Executor, Handler, Werte/Identität, Fehler/Adoption/finally, importierte Position,
Jobpause, Stop, neue Quelle, mobile Tastatur und Electron-Neustart enthalten.

Erste Runde 19/20 grün. Unabhängiger Review fand falsch als unbehandelt gewertete
übernommene Ablehnungen und vorzeitig von Promise in Ablehnung umgewandelte
Interpreter-Speicherfehler. Beides korrigiert und durch echte Gegenproben belegt:
übernommene registrierte Promises werden als behandelt markiert (Selbstauflösung
ausgenommen); Executor/Handler klassifizieren Ressourcenfehler vor Weiterwurf.
Finale Regression und unabhängige erneute Reproduktion bestätigen die Korrektur.

Unabhängige Adapterprobe hält zweimal in einem echten nativen Job, führt während
der Pause keine weitere Arbeit aus und wächst WASM von 16.777.216 auf 20.185.088
Bytes. Frischer Kontextzeiger, Rückgaben 1/0 und Freigaben von Ausgabe-/Wertzeigern
bestätigt. Artefakte: e2e/test-results/fe060-review/, fe060-final/,
fe060-job-boundary/. Machbarkeitsproben unter e2e/test-results/async-design/.
Keine neue Bibliothek. Gesamtabnahme wird nach den weiteren freigegebenen Stufen
gebündelt; persönliche Nutzerabnahme weiterhin am Ende.

Frischer Abschlussreview von Code, finalen Tests und Dokumentation ohne offene
Befunde. Archivierung in STATUS/DONE und check-agent-briefs erforderlich.
