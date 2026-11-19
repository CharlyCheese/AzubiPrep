# FE-065 – TypeScript im Quellcode-Debugger

Status: done
Bereich: FE
Angelegt: 2026-11-09

## Ziel

Sechster freigegebener Restschritt. Vorbereitende reine Typprüfung/Erasure kann
parallel entstehen; Einbindung und Abnahme folgen der JavaScript-Gesamtabnahme.
Echte lokale TypeScript-Prüfung; Haltepositionen behalten Originalzeilen/spalten.
Keine neuen Bibliotheken und keine vergrößerten Lerncode-Rechte.

## Allowlist

- frontend/src/pilot/debugger-typescript.js (neu)
- frontend/src/pilot/debugger-project.js, debugger-core.js, debugger-compiler.js
- frontend/src/pilot/debugger-compiler.worker.js
- frontend/src/components/JsDebuggerPilot.jsx, frontend/public/sw.js
- e2e/tests/debugger-typescript.spec.js (neu)
- docs/58-Debugger-TypeScript.md (neu), docs/38-Quellcode-Debugger-Planung.md
- dieser Brief, docs/agent-briefs/STATUS.md, docs/agent-briefs/DONE.md
- ignorierte synthetische Artefakte unter e2e/test-results/

## Abnahme

1. Lokal strict semantisch prüfen; Bibliotheken ausschließlich aus vorhandenem
   virtual:course-types. Nur Projektdateien auflösen, kein I/O/Netzwerk.
2. Type-only Syntax positionsgleich entfernen (UTF-16/Zeilenumbrüche erhalten):
   Anmerkungen, Aliase/Interfaces, Generics, Assertionen, type-only Imports/Exports.
   Echte Laufzeittransformationen wie enums, namespaces, decorators und Klassen
   ausdrücklich abweisen, keine falschen Haltepunkte. Unbenutzte Wertimports
   nicht heimlich entfernen; eindeutige type-only Kennzeichnung verlangen.
3. .ts-Dateien kontrolliert im Mehrdateiprojekt einlesen/exportieren; bestehende
   Pfad-/Metadaten-/Quellgrenzen gelten. Laufzeit bleibt der bekannte JS-Umfang.
4. Beispiel mit geprüftem Datentyp; Typfehler vor Ausführung, Originalpositionen,
   Imports, Kommentare/Unicode/Mehrzeiler, Browser und Electron prüfen.
5. Frischer unabhängiger Review, Archivcheck; keine Behauptung vollständiger
   TypeScript-/Browser-API-Unterstützung.

## Ergebnis

Abgeschlossen. Lokale strenge Prüfung aller TS-Dateien, rein virtuelle Bibliotheken,
positionsgleiche Erasure und Originalquellen in Anzeige/Sicherung. Ungetypte JS-Dateien
liefern importierte Typinformationen, werden selbst nicht streng geprüft.

26/26 gezielte Browser-/Windows-Electronfälle ohne Wiederholung bestanden.
Isolierte Vorprüfung:34 Gruppen/140 native Vergleiche. Frischer unabhängiger
Review /root/fe065_final_review:elf zusätzliche Gruppen und27 VFS-Fälle,
keine I/O-Aufrufe und keine offenen Codebefunde. Präzisierung zu checkJs:false
in Dokument58 übernommen. Beispiel liegt getrennt vom schweren TS-Compiler,
damit dessen Import nicht in die normale Bedienoberfläche gelangt.

Keine neuen Bibliotheken, privaten Dateien, Commits oder Veröffentlichungen.
React folgt in FE-066, gesamte Paketabnahme danach.
