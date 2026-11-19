# FE-062 – Kontrolliertes Datenladen im Debugger

Status: done
Bereich: FE
Angelegt: 2026-11-09

## Ziel

Dritter freigegebener Restschritt nach FE-061: fetch für ausschließlich im
Projekt definierte synthetische Übungsantworten, ohne reale Netz-/Dateirechte.
HTTP-Status, Transportfehler, bodyUsed und asynchrone text/json-Verarbeitung
werden nachvollziehbar mit echten Promise-/await-Halten verbunden.

## Allowlist

- frontend/src/pilot/debugger-fetch.js (neu), debugger-project.js
- frontend/src/pilot/debugger-core.js, debugger-compiler.js, debugger-compiler.worker.js
- frontend/src/pilot/debugger-promises.js, debugger-timers.js, debugger.worker.js, debugger.js
- frontend/src/components/JsDebuggerPilot.jsx, DebugFetchFixtures.jsx (neu)
- frontend/public/sw.js
- e2e/tests/debugger-fetch.spec.js (neu), debugger-timers.spec.js
- docs/55-Debugger-Datenladen.md (neu), docs/38-Quellcode-Debugger-Planung.md
- dieser Brief, docs/agent-briefs/STATUS.md, docs/agent-briefs/DONE.md
- ignorierte synthetische Artefakte unter e2e/test-results/

## Abnahme

1. Maximal acht eigene, exakt gematchte /uebung/-Pfade: Status 200–299/400–599,
   0–30000 ms Verzögerung, HTTP-Text oder simulierter Transportfehler.
   Keine URL-Auflösung, Netzrechte, Dateizugriffe, Zugangsdaten oder Fallbacks.
2. fetch(path) liefert native begrenzte Promise; Response zeigt status/ok/bodyUsed.
   text/json liefern native Promises; HTTP-Fehler erfüllen fetch, Transportfehler
   lehnen mit TypeError ab, ungültiges JSON mit SyntaxError. 204/205 Nullbody.
   Methodenaliase/Schreibzugriffe und beliebige Thenables bleiben gesperrt.
3. Gemeinsame pausebewusste Zeit und FIFO bei gleicher Fälligkeit mit Timern;
   getrennte Budgets (16 Timer/8 Anfragen, 64 Anfragen pro Sitzung). Vor jedem
   nächsten Task komplette native Jobleerung, kein Wiedereintritt bei Halt.
4. Editor mit expliziter Übernahme; Definitionen in Projektsicherungen,
   keine Laufzeitzustände. 16 KiB pro Body, 64 KiB gesamte Definitionen,
   256 KiB insgesamt ausgelieferte Bodies, 256 Operationen. JSON-Grenzen gelten.
5. Beispiele Erfolg/HTTP-Fehler/Transportfehler/ungültiges JSON; gezielte Browser-
   und Electron-Prüfungen einschließlich Stopp/Neustart, Import/Export,
   Grenzen und Pauseverhalten. Frischer unabhängiger Review, Archivcheck.

## Ergebnis

Lokale fixturebasierte fetch-/Response-Teilmenge mit nativen Promises, gemeinsamer
pausebewusster Uhr und getrennten Timer-/Anfragebudgets umgesetzt. Definitionen
explizit bearbeitbar und Teil der Projektsicherung, keinerlei reale Netzrechte.

27/27 gezielte Tests (Fetch/Timer/Async) grün. Frischer unabhängiger Review
fe062_fetch_review fand einen UI-Resetfehler beim unveränderten Übernehmen;
behoben, eigener Regressionstest und unabhängige Wiederholung grün. Abschließend
7/7 Fetch-Tests einschließlich Desktopneustart ohne Wiederholung bestanden.
Zusätzlich 83 isolierte Modellchecks, echte QuickJS-Probe und sieben unabhängige
Gegenproben (u.a.16 Timer+8 Anfragen, gemeinsame Uhr, paralleles Lesen,205).
Unabhängig Stop während offener Anfrage und sauberer Neustart bestätigt.
Keine offenen Findings. Dokumentation: ../55-Debugger-Datenladen.md.
