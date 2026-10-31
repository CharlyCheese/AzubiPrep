# Brief OPS-036: Browser-JavaScript-Sandbox technisch erproben

Status: done
Bereich: OPS
Angelegt: 2026-10-31

## Ziel

Erster technischer Nachweis für echtes Browser-DOM in einem getrennten
Electron-Übungsprozess: DOM-Ereignis, Abbruch, neue Sitzung, Ressourcenbeobachtung
und Zugriffs-/Netzwerkversuche. Vor einer Freigabe beliebiger Lernprogramme
die Unterschiede zu Web und die offenen Sicherheitsgates konkret dokumentieren.
Der Pilot führt ausschließlich fest im Paket hinterlegte Testprogramme aus;
keine Texteingabe oder importierte Datei wird als Programm akzeptiert.

## Betroffene Dateien (Allowlist)

- `desktop/js-pilot.cjs`
- `desktop/js-pilot-fixtures.cjs`
- `desktop/main.js`
- `desktop/pilot-inspector.cjs`
- `desktop/preload.cjs`
- `desktop/package.json`
- `desktop/scripts/check-distribution.cjs`
- `desktop/test/desktop-package.test.cjs`
- `frontend/src/components/JsSandboxPilot.jsx`
- `frontend/src/pages/FrontendKurs.jsx`
- `frontend/public/sw.js`
- `e2e/tests/js-sandbox.spec.js`
- `docs/20-Frontendkurs-Qwen-Planung.md`
- `docs/29-JavaScript-Sandbox-Pilot.md`
- `docs/agent-briefs/OPS-036-js-sandbox-pilot.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Abnahme

- [x] Separate Desktop-Testfläche mit echter DOM-Änderung, sichtbaren Meldungen,
  Start/Stop/Neustart. Quelltext der Testprogramme lesbar; keine freie Ausführung.
- [x] Vor Ausführung getrennte Renderer-PIDs nachweisen; kein Preload/Node/IPC
  im Übungsfenster, getrennte flüchtige Sitzung/Herkunft, alle Rechte verweigert.
- [x] Endlosschleife von außen beenden und Hauptfenster weiterhin bedienbar;
  Laufzeit-/Ausgabelimits außerhalb des Übungsprozesses. Speicherbeobachtung
  transparent von einer noch fehlenden harten Speicherobergrenze unterscheiden.
- [x] CSP, Request-/Navigations-/Popup-/Download-Sperren und feste Protokoll-
  Ressourcen; keine App-/Datei-/RAG-/Kontodaten an die Übung übergeben.
- [x] Guard für alle IPC-Einstiege, nur bekannte Programmkennungen, ungültige
  Nutzlasten und Aufrufe aus Übung/Fremdframes abweisen. Späte Ereignisse alter
  Läufe und Schließen dürfen keine neue Sitzung beeinflussen.
- [x] Webversion schaltet keine Skriptvorschau frei, zeigt den tatsächlichen
  Status. Bestehende 43 Lektionen unverändert. Keine neue Bibliothek.
- [x] Echte Electron-Gegenproben mit künstlichen Profilen, Web-Regression,
  Paket-Whitelist-/Runtimechecks, Build und frischer unabhängiger Review grün.
- [x] Architekturentscheidung/Restgates samt Nachweisgrenzen dokumentiert,
  Archivcheck konsistent; keine allgemeine Sandbox-/JS-Kursfreigabe behaupten.

## Ergebnis

Sieben feste Programme in separater Desktop-Testfläche umgesetzt; keine freie
Code-/Importannahme. Echte DOM-Änderung, neuer Renderer/Sitzung, externer
automatischer/manueller Abbruch, begrenzte Konsole und Speicherbeobachtung
nachgewiesen. UI zeigt Quelltext/Status, Stop/Neustart und Web-Sperre.

Feste Herkunft/Session/Protokollantwort ohne Dateilesen, keine Node-/Preload-
oder App-Brücke im Testfenster. IPC-Einstiege geschützt, alte Laufereignisse
und verspätete Antworten generationgebunden. Protokolle zentral einmal vor
Ready registriert; App-Ende räumt vor Quit auf. Paket-Whitelist um ausschließlich
zwei öffentliche Runtime-Dateien erweitert; private Ausschlüsse unverändert.

Nachweise: Frontendbuild, 15 Runtime-/Distributionstests sowie Gesamtumfang
73 Browser-/Electronfälle grün. Ein zu früh geprüfter asynchroner UI-Testassert
im ersten Gesamtlauf korrigiert, danach alle 15 betroffenen Pilot-/Desktopfälle
einschließlich F12 grün; die übrigen 58 bereits im Gesamtlauf grün.
Node-Rechte/Brücke fehlen, PID ist verschieden, App bleibt beim Loop bedienbar;
getrennte Sitzungen, synthetischer App-Speicherwert, instrumentierter Health-
Endpunkt, Kennungsfilter, Ressourcenreaktionen und App-Ende geprüft.
Kein neuer Backendtestlauf, da Backend unverändert.

Frischer unabhängiger Review ops036_review: Status beim Wiederöffnen korrigiert,
Start-/Ende-Races und zentrale Registrierung nachgeprüft; Code und Doku29/20/
STATUS ohne offene Findings freigegeben. Der zunächst vermutete busy-Hänger
wurde vom Reviewer widerlegt und ist kein offener Befund.

Grenzen ausdrücklich erhalten: Working-Set-Wächter ist keine harte Speicher-
grenze; vollständige Browser-/WebRTC-/Dateidialogwege sowie Web-Ausführung
bleiben eigene Restgates. Dokument29 enthält Architekturstand und Matrix.
Keine privaten Ablagen gelesen, kein Installerbau, keine neue Bibliothek.
Beliebige Web-/Desktop-Lernskripte und Kapitel14 bleiben gesperrt.
