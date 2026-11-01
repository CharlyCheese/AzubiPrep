# FE-048 – D3: synchrone Fehlerbehandlung im Debugger

Status: done
Bereich: FE
Angelegt: 2026-11-01

## Ziel und Umfang

`throw`, `try`/`catch`/`finally`, optionales Catchbinding und einfache benannte
Catchvariable. Native Completion-/Unwinding-Reihenfolge bei return, throw,
break/continue einschließlich übersteuerndem finally erhalten. Catch-/Finally-
Eintritt auch bei leeren Blöcken sichtbar; Catchbindung lexikalisch und in
zurückgegebenen Closures erhalten. Sieben Standardfehler per `new Error(...)`
usw. mit höchstens einem Argument, ohne freie Konstruktor-/Prototypfreigabe.
Native Fehler bleiben opaque; explizit nur sichere name/message-Felder lesbar.
Keine Stack-/Quelltext-/Funktionsreflexion oder aktive Fehlerinspektion.

Ressourcen- und Sprachgrenzen dürfen durch Catch/Finally nicht übergangen
werden. Private Abbruchzustände vor Catch-/Finally-Lerncode erneut prüfen;
Hostfehler sticky und endgültig, auch bei sonst erfolgreicher VM-Completion.
Native Programmausnahmen (z.B. TypeError/TDZ) bleiben dagegen fangbar.

## Allowlist

- `frontend/src/pilot/debugger-compiler.js`, `debugger-core.js`, `debugger.worker.js`
- `frontend/src/components/JsDebuggerPilot.jsx`, `frontend/public/sw.js`
- neue `e2e/tests/debugger-errors.spec.js`; bestehende `debugger*.spec.js` nur
  für nun freigegebene bisherige Negativfälle oder erweiterte Fehlernachweise
- neue `docs/43-Debugger-Fehlerbehandlung.md`; Dokumente 38/39/42
- dieser Brief, `docs/agent-briefs/STATUS.md`, `docs/agent-briefs/DONE.md`

## Abnahme

1. Tatsächliche native synchrone Fehlerbehandlung, kein Replay; Reihenfolge,
   Identität, Script-Completion, Rückgaben/Überschreibungen und Schleifensteuerung
   gegen Original-QuickJS geprüft, auch verschachtelt und über eigene Callbacks.
2. Catchparameter/TDZ/Shadowing/Closures und aktuelle Callerwerte korrekt;
   abgewickelte Frames verschwinden, Finally bleibt im laufenden Frame.
   Catch-/Finallyeintritt, Einzelschritte/Über/Aus und Haltepunkte erreichbar.
3. Standardfehlerkonstruktion eng freigegeben; nur name/message explizit lesbar.
   Keine stack-/constructor-/cause-/Prototype-/Helfer-/Hostwege, keine aktive
   Konvertierung/Inspektion der geworfenen Werte oder Fehler im Host.
4. Catch/Finally unterlaufen keine Kontrollpunkt-/Frame-/Pause-/Nachrichten-/
   Ausgabe-/Zeitgrenzen oder Sprachgates, auch mit return im finally. Stop,
   Quellwechsel und frischer Folgelauf beenden alte VM/Captures vollständig.
5. Gezielte Differential-/Negativ-/Ressourcen-/Browser-/Windows-Electronfälle,
   passende Gesamtregression, frischer unabhängiger Review und Archivcheck grün.
   Keine Bibliothek, privaten Dateien, Installer/Commit/Push; spätere Stufen separat.

## Ergebnis

try/catch/finally/throw und sieben eng gebundene Standardfehlerkonstruktoren
implementiert. Catchparameter und Catchblock behalten getrennte lexikalische
Umgebungen; echte Catch-/Finallyeintrittspunkte, passive Catchvariablen und
Closurecapturing ergänzt. Native Fehler werden nur bei explizitem name/message-
Lesen per Datendeskriptor gelesen, übrige Felder/Schreiben bleiben gesperrt.
Native Programm-TypeErrors/TDZ bleiben fangbar, Funktions-/Datenidentität,
Completion und Finally-Übersteuerung bleiben erhalten.

Private Sprach-/Kontrollpunkt-/Frame-/Snapshotgates setzen bleibenden Fatalzustand;
Catch/Finally beginnen vor Lerncode/Readers mit Guard. Interner Catch/Re-Throw um
jeden Quell-Try-/Catch-/Finallyblock klassifiziert native QuickJS-InternalErrors
anhand des vorab gebundenen direkten Prototyps, ohne Errorfeld-/Getterzugriff.
So können Heap-/Stackfehler auch nicht durch Source-Finally-return verdeckt werden.
Hostpause setzt bei jedem Fehler einen bleibenden reason; Worker prüft diesen
auch nach erfolgreicher VM-Completion. Bestehende Caps und Worker-Ende unverändert.

Erster gezielter Lauf 75/77 grün. Zwei Heap-Nachweise hatten sparse Array-slice
als Allokationsprobe verwendet; QuickJS kopiert reine Lücken platzsparend, daher
war kein Grenzübertritt garantiert. Probe auf join mit tatsächlich großem
Stringergebnis umgestellt und native Kontrollprobe mit reduziertem Heap ergänzt:
Original-QuickJS meldet nachweislich InternalError/out of memory und lässt
danach Finally-return456 zu; instrumentiert endet Try-/Catch-/Finally-OOM jeweils
ohne weitere Lerncodeausgabe. Neun neue Fehlerfälle danach 9/9 ohne Retries grün,
einschließlich Browser-/Windows-Electron und 600000-Byte-Heapquota.

Frischer Reviewer fe048_errors_review: native Completion-/Catchshadowing-/
Closure-/Unwinding-/Caller-/Snapshotproben ohne Findings. Vier eigene echte
Heapquotenproben sowie drei aktuelle join-OOM-Szenarien unabhängig bestätigt;
Sprachgate-Abbruch über verschachtelte Catch-/Finally-return-Hüllen endgültig.
Core/Compiler/Worker und Tests/UI/Doku geprüft; gefundenen historischen
Doku42-Widerspruch zur nun ergänzten Fehlerbehandlung korrigiert.

Zusätzliche Zeitgrenzen-Gegenprobe im fangbaren Try samt Finally-return ergänzt:
begin-Log belegt den Eintritt in Try, danach aktive 50-ms-Grenze ohne Ausgabe
aus Catch/Finally und ohne erfolgreiches done. Vollständige Regression
391/391 Browser-/Windows-Electronfälle ohne Retries grün (Chromium153.0.8010.12,
6,2 Minuten), einschließlich aller 77 Debuggerfälle, alter DB01–DB23-Nachweise
und Speicher-/Kurs-/KI-Proben. Produktionsbuild grün, vorhandener Größenhinweis
für große Bundles unverändert. Unabhängiger Abschlussreview ohne offene Befunde;
Archiv-/Diffprüfung grün. Service Worker v38 wird lokal ausgeliefert.
Keine Bibliothek, privaten Dateien, Installer/Commit/Push. Praktische Nutzerabnahme
separat; Ausnahme-Stoppauswahl/Module/DOM/Async/TS/React folgen separat.
