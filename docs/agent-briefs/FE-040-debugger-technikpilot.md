# FE-040 – D0/D1: echter Debugger-Machbarkeitspilot

Status: done
Bereich: FE
Angelegt: 2026-11-01

## Ziel und Umfang

D0-Kandidat QuickJS Singlefile Browser Release Asyncify 0.32.0 (MIT) mit
numerischen Budgets festlegen und D1 vertikal umsetzen: eigenen einfachen Code
in frischer VM vor Anweisungen anhalten, primitive Variablen passiv anzeigen,
dieselbe Ausführung fortsetzen und extern stoppen. Kein Replay. Normale
Kursausführung, feste Modellspur und vorhandene Prüfungen bleiben getrennt.

Erster D1-Sprachumfang: primitive const/let-Bindungen, Ausdrücke/Zuweisungen,
if/else und Blöcke, console.log. Geschlossene AST-Positivliste mit vollständiger
Bindungsauflösung. Funktionen/Schleifen und übrige D2–D6-Ziele bleiben offen.
Die zusätzliche konkrete Asyncify-Bibliothek wurde ausdrücklich freigegeben;
Installation ausschließlich ohne Installationsskripte.

## Allowlist

- `frontend/package.json`, `frontend/package-lock.json`
- neue `frontend/src/pilot/debugger-core.js`, `debugger-compiler.js`,
  `debugger-compiler.worker.js`, `debugger.worker.js`, `debugger.js`
- neue `frontend/src/components/JsDebuggerPilot.jsx`
- `frontend/src/pages/FrontendKurs.jsx`, `frontend/src/styles/pilot.css`, `frontend/public/sw.js`
- `backend/src/sicherheit.js`, `backend/test/js-worker-headers.test.js`
- neue `e2e/tests/debugger.spec.js`
- neue `docs/39-Debugger-Technikpilot.md`, `docs/38-Quellcode-Debugger-Planung.md`
- dieser Brief, `docs/agent-briefs/STATUS.md`, `docs/agent-briefs/DONE.md`

## Abnahme

1. Konkrete Variante/Lizenz/Integrität und vollständige numerische Budgettabelle
   inklusive Vorbereitung, Start, aktive/pausierte Zeit, AST/Output, Nachrichten,
   Queue sowie Interpreter-/Asyncify-/WASM-Bedarf dokumentiert. Keine behauptete
   harte Gesamtprozessgrenze ohne entsprechenden Plattformnachweis.
2. Selbst editierter D1-Code läuft nur in QuickJS. Tatsächlicher Halt und Fortsetzen
   desselben evalCodeAsync; nachgelagerte Ausgaben fehlen während Pause und
   erscheinen danach genau einmal. UI/Tastatur/Stop bleiben bedienbar.
3. AST-Syntax-/Bindungsprüfung vor Ausführung: dynamische Alias-/constructor-/
   Property-Wege und interne Helfer nicht zugänglich. Gültiges nicht unterstütztes
   JS verständlich kennzeichnen; keine Ausführung bei negativem Vorcheck.
4. Anweisungspunkte, Quellrevision, Blockscope/Shadowing/TDZ und primitive Werte
   korrekt. Keine aktiven Getter/Serializer/Proxy-/Objektinspektion, keine Watches,
   VM-Evaluation oder Borrowed-Handle-Nutzung während ausgesetzter VM.
5. Sitzungs-/Pause-/Nachrichtenfolge, Hostschema und Grenzen unabhängig vom Gast;
   alte/doppelte Kommandos wirkungslos. Stop/Wechsel/Quelländerung beendet Worker.
   Aktive Gesamtzeit nicht pro Schritt erneuern, Lesepause getrennt begrenzen.
6. Keine neuen Host-/Datei-/Netz-/App-/Kontorechte, keine KI- oder Privatquellen-
   Anbindung. Variablen/Frames flüchtig, nicht in Kurssicherung oder Export.
7. Positive, Negativ-/Umgehungs-, Differential-, Grenzen-/Abbruch-, mobile/Tastatur-
   und echte Windows-Electronfälle sowie bestehende betroffene Prüfungen grün.
   Fehler- und begrenzter Pilotumfang klar sichtbar; D2 nicht als erledigt ausgeben.
8. Frischer unabhängiger Fach-/Sicherheitsreview, sachliche Nachweise und grüner
   Archivcheck vor Abschluss. Keine neuen Installer, Commit/Push oder Publikation.

## Ergebnis

Implementiert: separater, unten aufklappbarer Debugger für den vorhandenen
eigenen JavaScript-Entwurf. Echte Asyncify-Pause/Fortsetzung derselben VM,
Anweisungshaltepunkte mit Originalposition, primitive Scope-/TDZ-/Shadowing-
Ansicht und externes vollständiges Beenden. Geschlossene AST-/Bindungsprüfung;
keine zusätzlichen Hostrechte oder Übertragung von Debugzuständen.

Die ausdrücklich freigegebene Bibliothek wurde exakt auf 0.32.0 und ohne
Installationsskripte eingebunden. Vollständige Zahlen, Integrität, tatsächlicher
WASM-/Stacknachweis sowie die versionsbedingte Umgehung des fehlerhaften
Async-HostRef-Disposepfads durch vollständige Worker-Beendigung stehen in
[Dokument 39](../39-Debugger-Technikpilot.md).

Unabhängiger frischer Review `fe040_debug_review`: erste Runde fand fehlende
CR-/Unicode-Zeilentrenner, eine unbegrenzte Befehlsqueue und Workerstart trotz
Dispose im prepared-Callback. Alle drei behoben und mit Gegenproben ergänzt.
Abschlussreview: Freigabe für begrenzten D0/D1-Piloten ohne offene blockierende
Fach-/Sicherheits-/Lebenszyklusfindings. Reviewer prüfte unabhängig alle
JavaScript-Zeilentrenner, Dispose in prepared sowie 10.000 zusammengefasste
Haltepunktänderungen mit ACK und einmaligem Resume. Keine privaten Quellen gelesen.

Prüfstatus: Backend 211/211 und Lint grün; 18 Desktop- und 3 Webpakettests grün.
Der erste Backendlauf im eingeschränkten Prozess hatte drei Windows-DPAPI-
Fehler; Wiederholung mit erlaubtem Windows-Zugangsschutz und ausschließlich
synthetischen Testkonten vollständig grün. Vollständige Browser-/Electron-
Regression 329/329 ohne Wiederholungen grün (Chromium 153.0.8010.12,
Windows, Electron 45.2.0; 5,3 Minuten), davon 16 neue Debuggerfälle. Build und
Diff-Whitespaceprüfung grün. Lokaler Entwicklungsserver auf 127.0.0.1:3002
mit neuem Build gestartet; Werkstatt und WASM-Worker-CSP über HTTP geprüft.
Mobile Aufnahme bei 390 Pixeln visuell geprüft:
lesbare Texte, umbrechende Bedienelemente und erkennbare Quell-/Variablenansicht.

D2–D6, vollständige DB23-Grenzfallmatrix und praktische Verständlichkeits-/
Zoomabnahme bleiben offen. Kein Installer, Commit/Push oder Veröffentlichung.
