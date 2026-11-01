# FE-046 – D3: synchrone Array-Callbacks

Status: done
Bereich: FE
Angelegt: 2026-11-01

## Ziel und Umfang

Erster eigener D3-Teil nach begrenzter D2-Freigabe: map, filter, forEach,
some, every, find und reduce mit direkt übergebener instrumentierter
Root-Funktionsdeklaration, inline Pfeilfunktion oder anonymer function-Expression.
Einfache Parameter, Block-/Ausdrucksrumpf und synchrone lexikalische Captures.
Native Methodensemantik, echte Pause/Fortsetzung im Callback und eigene Frames.

Keine frei gespeicherten/weitergereichten Funktionswerte, eigenen höheren
Funktionen mit Callbackparametern, benannten Funktionsausdrücke, verschachtelten
Deklarationen, this/arguments, Async, Fehlerbehandlung oder weiteren Module/DOM-
Sprachmerkmalen. Diese benötigen jeweils weitere D3+-Abnahmen.

## Allowlist

- `frontend/src/pilot/debugger-compiler.js`, `debugger-core.js`
- `frontend/src/components/JsDebuggerPilot.jsx`, `frontend/public/sw.js`
- neue `e2e/tests/debugger-callbacks.spec.js`
- bestehende `e2e/tests/debugger*.spec.js` nur bei durch neue Freigaben überholten Negativfällen
- `frontend/src/pages/FrontendKurs.jsx`, `e2e/tests/advanced-runtime.spec.js`,
  neue `e2e/tests/workshop-save-status.spec.js` (im Gesamtlauf aufgedeckter alter
  Speicherstatus konnte vor dem Commit eines neuen Stands noch Erfolg zeigen)
- neue `docs/41-Debugger-Callbacks.md`, `docs/39-Debugger-Technikpilot.md`,
  `docs/38-Quellcode-Debugger-Planung.md`
- dieser Brief, `docs/agent-briefs/STATUS.md`, `docs/agent-briefs/DONE.md`

## Abnahme

1. Geschlossene AST-/Bindungsprüfung bleibt erhalten. Funktionswerte nur im
   expliziten Callbackslot; kein Alias-/constructor-/Helfer-/Introspektionsweg.
   Runtime akzeptiert dort nur registrierte instrumentierte Funktionen.
2. Ausdrucks-/Blockpfeile und anonyme Function-Expressions erhalten Rückgaben,
   Short-Circuit, Reihenfolge und Captures/Shadowing/TDZ. Native sparse-Array-,
   Methoden-/Reduce-Semantik und Mutationen mit Original-QuickJS vergleichen.
3. Callbackframe, eigene Parameter, korrekte Callerposition und lebende äußere
   Bindungen auch in Schleifenheadern/verschachtelten Callbacks. Hinein/Über/Aus,
   explizite Haltepunkte und genau einmalige Ausgaben derselben Ausführung.
4. Genau eine aktive Asyncify-Aussetzung. Keine Callbackjobs während Pause,
   zusätzliche Hostrechte oder Debugwerte in Sicherung/KI. Alte Budgets gelten;
   Stop/Änderung/Fehler/Neustart beenden die ganze Sitzung.
5. Positive/negative/Differential-/Ressourcen-/Browser-/Windows-Electronfälle
   und betroffene Regression grün; unabhängiger frischer Review und Archivcheck.
   Praktische Callback-Nutzerabnahme separat; keine Bibliothek/Installer/Push.

## Ergebnis

Sieben synchrone native Array-Callbackmethoden implementiert. Inline Pfeile
(Ausdruck/Block), anonyme Function-Expressions und direkt benannte Rootfunktionen
instrumentiert, Callbackslot per AST-/Bindungsprüfung geschlossen. Private
WeakSet-Registrierung lässt nur instrumentierte Funktionen zu. Leserfabrik
erhält lebende Captures auch in for-Headern und verschachtelten Callbacks;
Callermetadaten werden nach Argumentauswertung vor dem nativen Aufruf aktualisiert.
Eigene Frames, Parameter/TDZ, Hinein/Über/Aus und explizite Haltepunkte erhalten.

61/61 betroffene neue/alte Debuggerfälle ohne Wiederholung grün, davon sieben
Callbackfälle mit echter nativer Pause im Browser und Windows-Electron.
Neuer Differentialkorpus deckt alle sieben Methoden und drei Callbackformen ab.
Unabhängiger frischer Reviewer `fe046_callbacks_review`: 23 eigene QuickJS-
Differentialproben und 25 negative Wege sowie Header-Callerwerte/Snapshots grün;
keine technischen Findings. Dokumentation38/39 um neuen Umfang ergänzt,
Nachweisformulierung41 auf tatsächliche Einzelhalte in map und anschließenden
filter-Lauf präzisiert. Konkrete Callback-Bedienrunde durch Nutzer bestätigt.

Erster Gesamtlauf: 373/374 grün. Vorhandene React-Übungsspeicherprobe scheiterte
nach schnellem Neuladen. Trace: alte „Gespeichert“-Anzeige erfüllte Prüfung schon
vor dem neuen 500-ms-Autosave. Isolierte Probe bestätigte sofortigen alten Status,
nach 900 ms korrekt persistierten Stand. Renderer invalidiert alte Bestätigungen
und markiert dirty jetzt synchron bei jedem Kurs-/JS-Edit. Ladepfad unverändert,
Warnungen bei nicht beschreibbarem Speicher bleiben erhalten.

Originaler Wiederherstellungsfall mit tatsächlicher Inhaltsprüfung und neuer
Test mit zwei absichtlich gehaltenen head.json-Commits 2/2 grün. Zusätzlicher
unabhängiger Code-/Testreview des Speicherfixes ohne Findings, technische
Freigabe vorbehaltlich neuer Gesamtregression und Archivcheck.

Vollständige Regression nach Speicherfix: 375/375 ohne Wiederholung grün
(Chromium 153.0.8010.12/Windows/Electron 45.2.0, 5,8 Minuten), einschließlich
aller 13 D2-Abnahmefälle und neuem Commit-Test. Build und Diffprüfung grün;
lokaler Entwicklungsstand liefert Service Worker v36. Unabhängiger Abschlussreview
freigegeben, konkrete map-Bedienrunde durch Nutzer bestätigt. Erwartete Ausgaben
und alle sieben Methoden sind zusätzlich automatisch geprüft.
Keine neuen Bibliotheken,
Installer/Commit/Push oder privaten Dateien; kein freier Fnwert-/HOF-/Asyncumfang.
