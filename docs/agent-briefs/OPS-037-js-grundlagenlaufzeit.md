# OPS-037 – Eigene JavaScript-Programme in begrenzter Grundlagenlaufzeit

Status: done

## Auftrag

QuickJS/WASM ist ausdrücklich als neue lokale Bibliothek genehmigt. Eigene
JavaScript-Programme in Web und Electron ausführen, zunächst Konsole ohne DOM.
Keine privaten Unterlagen oder Anmeldedaten lesen, übertragen oder verpacken.

## Erlaubte Dateien

- `frontend/package.json`, `frontend/package-lock.json`
- `frontend/vite.config.js`
- `frontend/public/quickjs-LICENSE.txt`
- `frontend/src/pilot/js-runner.worker.js`, `frontend/src/pilot/js-runner.js`
- `frontend/src/pilot/js-draft.js`, `frontend/src/components/JsPlayground.jsx`
- `frontend/src/components/JsSandboxPilot.jsx`, `e2e/tests/js-sandbox.spec.js`
- `frontend/src/pages/FrontendKurs.jsx`, `frontend/public/sw.js`
- `backend/src/sicherheit.js`, `backend/src/app.js`, `backend/test/js-worker-headers.test.js`
- `e2e/tests/js-playground.spec.js`
- `docs/30-JavaScript-Grundlagenlaufzeit.md`
- `docs/29-JavaScript-Sandbox-Pilot.md`, `docs/20-Frontendkurs-Qwen-Planung.md`
- dieser Brief, `docs/agent-briefs/STATUS.md`, `docs/agent-briefs/DONE.md`

## Abnahme

1. Lokale, exakt gebundene QuickJS-Version; kein CDN, kein Nachladen von Modellen.
2. Lerncode nur im Interpreter eines separaten Workers. Keine Host-eval-
   Ausführung, kein Browser-/Node-/Netzwerk-/Datei-/RAG-/Konto-/DOM-Zugriff.
3. Interpreter-Heap und Stack begrenzt; Interruptfrist plus äußerer Abbruch.
   Ausgabe/Quelltext/Jobs begrenzt; kein unbeschränktes Host-dump von Objekten.
4. Eigene `.js` bearbeiten, explizit ausführen, abbrechen, lokal speichern,
   importieren/exportieren; niemals automatisches Ausführen bei Import/Neustart.
   Bestehende 43 Lektionen/Sicherungen und deren Vorschau bleiben erhalten.
5. Produktions-CSP erlaubt WASM nur auf dem Worker, sperrt dort Verbindungen;
   Hauptdokument bekommt keine allgemeine eval-Freigabe.
6. Reale Web-/Electron-Tests: Rechnen, Fehler, Schleife, Speicher, Ausgabe,
   Hostzugriffe, Jobs, Abbruch/Neustart, Sicherung. Grenzen sachlich dokumentieren.
7. Frischer unabhängiger Review, Build und Archivprüfung vor Abschluss.

## Ergebnis

Eigene einzelne `.js`-Programme in Web/Electron umgesetzt. QuickJS-Core und
Singlefile-Browser-WASM exakt 0.32.0, ohne Installationsskripte installiert;
WASM und Variantenimporte in einem lokalen Worker-Asset gebündelt. Öffentliche
MIT-Hinweise werden mit dem Frontend ausgeliefert. Kein CDN/Runtime-Download.

Pro Lauf neuer Interpreter/Worker, 16MiB Heap/64KiB Stack, 1s Interruptfrist,
äußerer Start-/Laufwächter, manueller Abbruch und Generationenprüfung.
Ausgabe 80 Zeilen/1000 Zeichen/32000 insgesamt, 1000 Promise-Jobs; Gastobjekte
werden nicht im Host serialisiert. DOM/Browser-/Node-/Netzwerk-/Datei-/App-/RAG-
und Modellzugänge fehlen. Keine privaten Ablagen oder Kontodaten gelesen.

Lokale Kurssicherung um kompatiblen top-level `jsDraft` ergänzt; alle 43 alten
Projekte bleiben erhalten. Expliziter `.js`-Import/-Export, keine automatische
Ausführung; ungültige Namen werden bereits vor dem Lesen abgewiesen. HTML-/CSS-
Vorschau und native feste DOM-Tests behalten ihre bisherigen Beschränkungen.

Nachweise: Gesamtdurchlauf 81 Browser-/Electronfälle grün (73 bisherige + 8 neue),
nach Reviewkorrekturen alle neun erweiterten neuen Fälle grün, insgesamt 82
unterschiedliche Fälle. Enthält Offline-Workerstart aus vorbereitetem SW-Cache,
echte Speicher-/Stack-/Zeit-/Ausgabe-/Jobgrenzen, feindliche Objekte, aktive
Routenwechsel und portunabhängigen Desktop-Neustart mit künstlichem Profil.
203 Backendtests/22 Suiten, Lint und 15 Runtime-/Distributionstests grün;
Frontendbuild erfolgreich (bestehender Größenhinweis), UI-Screenshot geprüft.
Lokaler laufender Server auf neue Header umgestellt und echter Worker/fehlendes
Asset geprüft. Git-Ignore mit ausschließlich synthetischen Privatpfaden geprüft.

Frischer unabhängiger Review `ops037_review`: zwei Befunde korrigiert und
nachgeprüft – WASM-CSP nur in `express.static.setHeaders` für tatsächlich
ausgelieferte Workerdatei, strenge CSP beim HTML-Fallback; Import-Namensfilter
vor `file.text()`, mit instrumentiertem Lesetest. Anschließend ausdrückliche
Freigabe ohne offene Findings. Abschließender Nachreview bestätigt außerdem
bytegleiche öffentliche Lizenz-/Buildkopie, Offline-Test und konsistente
Dokumentation/Testzählung. Archivcheck: 296 erledigte Tasks, 10 offen, konsistent.

Grenzen in Dokument30: Interpreter-Heap ist keine App-/Systemspeichergrenze,
keine absolute Ausbruchsgarantie, keine eigene Anzeige unbehandelter Promise-
Ablehnungen; synchroner Grundlagenbereich ohne DOM/Timer/Browser-Debugger.
Kapitel14 folgt inhaltlich, spätere DOM-/Async-Gates bleiben offen. Kein neuer
Installer und kein Push/Commit.
