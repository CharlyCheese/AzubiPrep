# FE-066 – React und JSX im Quellcode-Debugger

Status: done
Bereich: FE
Angelegt: 2026-11-09

## Ziel

Siebter freigegebener Restschritt. Separater kontrollierter React-Modus mit
Originalpositionen für JSX/TSX und echten Komponenten-/Handler-/Effekthalten.
Vorbereitung isoliert parallel; Integration nach FE-065. Echte installierte
React-/ReactDOM-/Linkedom-Bibliotheken, keine neue Abhängigkeit.

## Allowlist

- frontend/src/pilot/debugger-react.js (neu), debugger-typescript.js
- frontend/src/pilot/debugger-core.js, debugger-compiler.js, debugger-project.js
- frontend/src/pilot/debugger-compiler.worker.js, debugger.worker.js, debugger.js
- frontend/src/components/JsDebuggerPilot.jsx, frontend/public/sw.js
- e2e/tests/debugger-react.spec.js (neu)
- docs/59-Debugger-React.md (neu), docs/38-Quellcode-Debugger-Planung.md
- dieser Brief, docs/agent-briefs/STATUS.md, docs/agent-briefs/DONE.md
- ignorierte synthetische Artefakte unter e2e/test-results/

## Abnahme

1. Echter ReactDOM-Renderer innerhalb QuickJS/Asyncify. Benutzerkomponenten,
   Props, useState/Updater, useEffect/Cleanup, JSX, Klick und kontrollierte
   Texteingabe. Kein Zugriff auf Roh-DOM, Browserglobals oder native APIs.
2. Original-JSX/TSX-Knoten direkt instrumentieren, keine ungenaue Zuordnung
   transpilierten Codes. Bibliotheksframes privat, Nutzerframes/Parameter sichtbar.
3. Opaque Elementtokens, registrierte Callback-/Hookfassaden, bereinigte Ereignisse
   und strikt validierte Vorschau mit bisherigen Tags/Attributen. Keine Ports,
   Router, refs, unsanitisiertes HTML/Styles, dynamische Imports oder Netzrechte.
4. Bibliotheksarbeit und Anwendungsschritte begrenzt; bestehende VM-/Zeit-/Quell-
   /Protokollgrenzen unverändert. Vorprobe belegt16MiB Heap/64KiB Stack ausreichend;
   kein stilles Erhöhen. Zustand/Props begrenzt prüfen ohne Identität zu ändern.
5. Vorschauereignisse, Rendern, Effekte und Cleanup pausieren in derselben VM;
   kein Wiedereintritt. Stop vernichtet VM statt Lern-Cleanup unkontrolliert
   auszuführen. Bewusste Unmountaktion darf Cleanup schrittweise zeigen.
6. Native Vergleichsproben, echte Halte-/Schritt-/Neurender-/Cleanup-Tests,
   schmale Ansicht und Windows-Electron-Neustart. Frischer Review, Archivcheck.

## Ergebnis

Abgeschlossen. Original-JSX/TSX und einfache useState-Paare instrumentiert;
echte React-/ReactDOM-/Linkedom-Ausführung in unveränderter QuickJS-VM.
Private Fassaden, opaque Elemente, registrierte synchrone Komponenten/Handler,
Props/State-Identität, Effekte/Cleanup, native Jobfolge und validierte Vorschau.

Acht erste Produktfälle bestanden. Gesamtlauf543/545 fand die verlorene Sicherung
des erstmals ausgewählten Standard-Modulprojekts und eine veraltete erwartete
Paketversion. Speichervorgang wiederhergestellt, Versionstest in FE-067 angepasst.
Anschließend final neu gebaut:42/42 React-/TypeScript-/Modul-/Desktopfälle ohne
Wiederholung grün. Compiler-Catch-Kollision und JSX-Pragmagrenzen enthalten.
Gesamte abschließende Suite und Pakete folgen in FE-067.

Frischer unabhängiger Review /root/fe066_final_review:acht zusätzliche
Produkt-/Grenzproben inklusive nativem Chromium-React-Reihenfolgevergleich,
Fehler/Cleanup/Endlosschleife und finalen Compiler-/UTF16-Gegenproben bestanden.
Auch die letzte Modus-Speicherkorrektur separat unabhängig geprüft.
Vorproben:60 validierte VM-Pausen,7 Vorschauen,23 Ablehnungen,15 JSX-Vergleiche;
19 TSX-Gruppen und unverändert34 TS-Gruppen/140 native Vergleiche.

Keine neuen Bibliotheken, keine privaten Quellen gelesen/übertragen,
kein Commit/Push. Bedienung und Grenzen in Dokument59.
