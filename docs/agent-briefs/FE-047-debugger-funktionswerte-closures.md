# FE-047 – D3: gespeicherte Funktionen, eigene Callbacks und Closures

Status: done
Bereich: FE
Angelegt: 2026-11-01

## Ziel und Umfang

Gespeicherte Pfeile/anonyme Function-Expressions, Aliase registrierter Funktionen,
eigene Funktionen mit Callbackparametern und zurückgegebene synchrone Closures.
Instrumentierte Funktionen dürfen als Werte übergeben/gespeichert/zurückgegeben
und ausschließlich nach privater Runtime-Provenienzprüfung aufgerufen werden.
Eigene Datenfelder können registrierte Funktionen enthalten; generische eigene
Methoden erhalten ihren Empfänger. Computed-Calls bleiben vorab ausgeschlossen.

Funktionsidentität/typeof/Truthiness bleiben erhalten. Explizite/implizite
Funktions-Quelltext-/Zahlenkonvertierung bleibt nicht freigegeben: ein privat
gebundener Symbol.toPrimitive-Guard auf registrierten Funktionen verhindert
Quelltextfreigabe auch nach Aliasbildung/Übergabe. Keine Funktionsreflexion,
this/arguments, benannten Function-Expressions, verschachtelten Deklarationen,
Defaults/Rest/Destrukturierung, Async oder Fehlerbehandlung in diesem Teil.

## Allowlist

- `frontend/src/pilot/debugger-compiler.js`, `debugger-core.js`
- `frontend/src/components/JsDebuggerPilot.jsx`, `frontend/public/sw.js`
- neue `e2e/tests/debugger-closures.spec.js`, bestehende `debugger*.spec.js`
  nur für jetzt freigegebene frühere Negativfälle
- neue `docs/42-Debugger-Funktionswerte-Closures.md`, `docs/41-Debugger-Callbacks.md`,
  `docs/39-Debugger-Technikpilot.md`, `docs/38-Quellcode-Debugger-Planung.md`
- dieser Brief, `docs/agent-briefs/STATUS.md`, `docs/agent-briefs/DONE.md`

## Abnahme

1. Nur instrumentierte registrierte Funktionen ausführbar; keine Alias-/Builtin-/
   constructor-/Prototype-/Helferwege oder implizite Source-Introspektion.
2. Originalidentität, Reihenfolge/Completion, HOF-Argumente und Rückgaben erhalten.
   Native TypeError-Reihenfolge für nicht callable Werte; Direct-/Datenmethoden
   und Call-Ergebnisse korrekt gebunden, keine doppelte Argumentauswertung.
3. Lebende eingefangene Bindungen nach beendetem Erzeuger, unabhängige und geteilte
   Closurezustände, Shadowing/TDZ und Schleifenbindungen in originaler Umgebung.
   Äußere Bindungen erkennbar; beendeter Erzeuger kein aktiver Stackframe.
4. Pause/Fortsetzung und Hinein/Über/Aus/Breakpoints in eigenen Callbackketten
   derselben Ausführung; Stop/Quellwechsel/Neustart beendet gesamte VM.
5. Keine aktive Inspektion, zusätzliche Hostrechte oder Debugwerte in Speicherung/
   KI. Budgets unverändert; Registry und Konvertierungs-Guard privat gebunden.
6. Differential-/Angriffs-/Ressourcen-/Browser-/Windows-Electronfälle sowie
   passende Regression grün; frischer unabhängiger Review und Archivcheck.
   Keine Bibliothek/Installer/Commit/Push; spätere Sprache separat.

## Ergebnis

Gespeicherte Pfeile/anonyme Function-Expressions, eigene Funktionsaliasse,
Callbackparameter und zurückgegebene synchrone Closures implementiert. Private
WeakSet-Provenienz prüft eigene Aufrufe ohne Identitätswrapper; der privat
gebundene Symbol.toPrimitive-Guard verhindert Funktionsquelltextkonvertierung
auch über Übergaben/native Methoden. Eigene Datenfelder dürfen registrierte
Funktionen enthalten. Einheitliches Punktaufrufgate unterscheidet native
Arraypositivliste und eigene Felder anhand des tatsächlichen Empfängers.

Lebende Leser erhalten echte äußere Bindungen nach Erzeugerrückkehr und
Schleifen-Iterationsumgebungen. Metadaten/UI kennzeichnen äußere Bindungen;
beendete Erzeuger erscheinen nicht als aktive Frames. Lookup/Argumente werden
einmal in nativer Reihenfolge ausgewertet; Callable-Gate nach Argumenten,
null/undefined-Feldzugriff davor. Scope-/Callable-Grenzen und Budgets erhalten.

Erster gezielter Lauf 66/68 grün. Zwei Testannahmen korrigiert: drei weiterhin
gesperrte native Methodenwege sind nach generischer Aufruffreigabe Runtime-
statt Preflightnegative; neuer HOF-Test muss lexikalische Topframewerte und
dynamischen Caller getrennt prüfen, Aus nach direktem return hält im Programm.
Keine Schutzprobe entfernt. Zweiter Lauf 68/68 Debugger-/Browser-/Windows-
Electronfälle ohne Wiederholung bestanden, einschließlich sieben neuer
Closurefälle. Differentialkorpus gegen Original-QuickJS prüft Identität,
Completion, TDZ, Aliasse, Closurezustände und Aufruf-/Argumentreihenfolge.

Frischer Reviewer `fe047_closures_review`: 22 unabhängige QuickJS-Proben und
zusätzliche null/undefined-/noncallable-Reihenfolgefälle/Snapshotvalidierung.
Gefundenen P2 bei eigenen Methoden namens map/push per einheitlichem bound-Gate
behoben, alle 15 nativen Namen auch als eigene Nullargumentmethoden nachgeprüft.
Injizierter Accessor im readonly Testharness bleibt bei Pausen/opaque Ausgabe
unberührt. Neue Tests/UI/Doku38/39/41/42 abschließend ohne offene Findings;
Freigabe vorbehaltlich grüner Gesamtregression und Archivcheck.

Vollständige Regression: 382/382 Browser-/Windows-Electronfälle ohne Wiederholung
grün (Chromium 153.0.8010.12, sieben Minuten), einschließlich der verschärften
Konvertierungs-/Reflexionsfälle, alten DB01–DB23-Nachweise und Speicherprüfungen.
Produktionsbuild grün; bestehender Größenhinweis für große Bundles unverändert.
Service Worker v37 wird unter der lokalen Entwicklungsadresse ausgeliefert.
Unabhängige Reviewvorbehalte zu Tests damit erfüllt; Archiv-/Diffprüfung grün.
Praktische Nutzerabnahme dieses neuen Umfangs separat; frühere Callbackrückmeldung
nicht als Closureabnahme übernommen. Keine neuen Bibliotheken, Installer/Commit/
Push oder privaten Dateien. Fehlerbehandlung/Module/DOM/Async/TS/React-Debugging
separat.
