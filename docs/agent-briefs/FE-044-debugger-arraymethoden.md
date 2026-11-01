# FE-044 – Debugger: grundlegende Array-Methoden

Status: done
Bereich: FE
Angelegt: 2026-11-01

## Ziel und Umfang

Begrenzter D2-Ausbau um direkte Array-Methodenaufrufe: push, pop, shift,
unshift, slice, includes, indexOf und join. Native QuickJS-Implementierungen,
keine Callbacks, keine generischen Objektmethoden oder freien Funktionswerte.
Die bestehenden Pausen/Schritte/Scopes und Ressourcen-/Privatgrenzen erhalten.
Die vollständige D2-Abnahme vor D3 bleibt ein eigener offener Punkt.

## Allowlist

- `frontend/src/pilot/debugger-compiler.js`, `debugger-core.js`
- `frontend/src/components/JsDebuggerPilot.jsx`, `frontend/public/sw.js`
- neue `e2e/tests/debugger-arraymethods.spec.js`
- `e2e/tests/debugger-data.spec.js` (bestehenden nicht unterstützten Methodenfall auf map umstellen)
- `docs/39-Debugger-Technikpilot.md`, `docs/38-Quellcode-Debugger-Planung.md`
- dieser Brief, `docs/agent-briefs/STATUS.md`, `docs/agent-briefs/DONE.md`

## Abnahme

1. Nur statische direkte Methoden dieser Positivliste auf echten Arrays.
   Keine berechneten Calls, Methodenauslese-/Alias-/constructor-/Prototypewege.
   Eigene Objektmethoden und Callbackmethoden bleiben vorab ausgeschlossen oder
   bei erst dynamisch erkennbarem Empfänger kontrolliert abgewiesen.
2. Empfänger/Methodenauswahl vor Argumenten, Argumente links nach rechts einmal;
   derselbe Empfänger bei späterem Namenswechsel. Native Rückgaben/Mutation,
   slice-Kopie, includes/indexOf-Vergleich und join-Konvertierung erhalten.
3. Eigene Funktionen in Argumenten pausierbar; Über/Aus/Breakpoints derselben
   Ausführung erhalten. Kein Modelljob/Host-/Netzrecht oder Snapshot-Objektbaum.
4. Intrinsics privat vorab gebunden, Shadowing ohne Wirkung auf Hilfsfunktionen.
   Aktive Zeit/Heap/Output und externer Stop begrenzen auch native Methoden.
5. Positive Browser-/Windows-Electron-, Differential-/Angriffs-/Abbruchfälle und
   betroffene alte Debuggerprüfungen grün; unabhängiger frischer Review, sachliche
   Dokumentation und Archivcheck. Keine Bibliothek/Installer/Commit/Push.

## Ergebnis

Die acht direkten nativen Methoden implementiert. Compiler und VM prüfen
Methodenpositivliste unabhängig; echte Arrays, keine eigenen Methodenfelder.
Methodenauswahl/Empfänger vor Argumenten festgehalten, native Reflect.apply-
Ausführung mit den zuvor gebundenen Intrinsics. Keine Änderung der Snapshot-
Inspektion oder Hostrechte; vorhandene Budgets und externer Workerabbruch gelten.

41/41 betroffene Browser-/Daten-/Debugger-/Windows-Electronfälle ohne Wiederholung
grün, davon sieben neue Methodenfälle; Frontendbuild und Diffprüfung grün.
Differentialquellen prüfen native Rückgaben, Mutation/Kopie, Vergleich von NaN/
Sparse-Arrays, Konvertierung, Zyklen, Reihenfolge und Intrinsic-Shadowing.
Überlastfall beendet innerhalb der Testfrist und frischer Folgelauf erfolgreich.
Keine Aussage über eine neu ausgeführte Gesamtsuite.

Frischer unabhängiger Review `fe044_methods_review`: vorläufige Codefreigabe
ohne Findings. Eigene QuickJS-Proben zu Mutation, Rückgaben, Basis/Argumenten,
Receiverwechsel, Konvertierungen, sparse Arrays und Shadowing nativegleich.
Abschließender Review ohne Runtimefindings; Nachweisformulierung präzisiert:
Der Überlasttest erwartet allgemeinen Ressourcenabbruch, unterscheidet Heap/
Stack/Zeit nicht und belegt daher nicht separat den externen Watchdogpfad.
Testtitel und Doku entsprechend eingeschränkt, keine Änderung an Testassertionen.
Gegenreview bestätigt aufgelöste Nachweislücke; Abschlussfreigabe für FE-044 ohne
offene Findings. Vollständige D2-Abnahme und D3 bleiben separat.

UI/Doku aktualisiert, Service Worker v33. Keine Bibliothek/Installer/Commit/Push
und keine privaten Dateien gelesen. Vollständige D2-/DB01–DB23-/Nutzerabnahme
und anschließend D3 bleiben offen.
