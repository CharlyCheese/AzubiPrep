# FE-059 – Kontrollierte setTimeout-/clearTimeout-Abläufe

Status: done
Bereich: FE
Angelegt: 2026-11-09

## Ziel und Umfang

Nächster D4-Schritt nach FE-058: einmalige Timer im HTML-/Ereignismodus,
mit derselben lebenden VM, echten Callback-Halten und Abbrechen. Zunächst
direkte setTimeout-/clearTimeout-Aufrufe; eigene gleichnamige Bindungen bleiben
erhalten. Keine Intervalle, Promises, async/await, Netzrechte oder Persistenz.
Keine neue Bibliothek. Wartedauer ist eine Mindestdauer; Debuggerpausen frieren
die Übungszeit ein, laufende Anweisungen werden niemals unterbrochen.

## Allowlist

- neue frontend/src/pilot/debugger-timers.js
- frontend/src/pilot/debugger-core.js
- frontend/src/pilot/debugger-compiler.js
- frontend/src/pilot/debugger.worker.js
- frontend/src/pilot/debugger.js
- frontend/src/components/JsDebuggerPilot.jsx
- frontend/public/sw.js
- neue e2e/tests/debugger-timers.spec.js
- e2e/tests/debugger-dom.spec.js, e2e/tests/debugger-forms.spec.js
  (bestehende Controller-Doubles um den nun verpflichtenden leeren Timerstand
  ergänzen; Gates und Prüfanforderungen unverändert)
- docs/38-Quellcode-Debugger-Planung.md
- neue docs/52-Debugger-Timer.md
- dieser Brief, docs/agent-briefs/STATUS.md, docs/agent-briefs/DONE.md
- ignorierte synthetische Prüfartefakte unter e2e/test-results/

## Umsetzung und numerische Grenzen

VM hält ausschließlich eigene registrierte Callbacks und Argumente. Der Worker
hält nur Timer-ID, Fälligkeit und Verschachtelung; private Brücke nimmt geprüfte
primitive Daten an. Ein monotoner Zeitgeber zählt laufende und ereignisfreie
Zeit, schließt Debuggerpausen aus. Der Controller plant nur im Zustand idle
eine Weckung und übermittelt sie über den bestehenden bestätigten Befehlskanal.
Der Worker prüft Zustand/Fälligkeit erneut. Keine parallele VM-Auswertung,
keine Ereigniswarteschlange während Pause, keine auszuführenden Quellen im Host.

Grenzen pro Sitzung: 16 gleichzeitig offene Timer, 128 Registrierungen,
64 ausgeführte Timer und 256 Timer-API-Aufrufe. Höchstens 8 Zusatzargumente.
Wartewert: fehlend/undefined entspricht 0; sonst endliche Zahl bis 30.000 ms,
negative Zahlen werden 0, Bruchteile abgeschnitten. Bei mehr als fünf
Verschachtelungen mindestens 4 ms. Andere Konvertierungen/Stringprogramme
werden verständlich zurückgewiesen. IDs sind positive Zahlen, werden während
der Sitzung nicht wiederverwendet; unbekannte/abgebrochene IDs bewirken nichts.
Bestehende aktive Zeit-/Heap-/Stack-/Nachrichten-/DOM-Grenzen unverändert.

## Abnahme

1. 0-ms-Timer läuft nach synchronem Code, jeder Timer höchstens einmal;
   Reihenfolge nach Fälligkeit, bei Gleichstand nach Registrierung. Verschachtelte
   Timer, Zusatzargumente und Closures behalten Identität und aktuelle Werte.
2. clearTimeout verhindert noch nicht gestartete Callbacks, auch aus anderen
   Callbacks. Eigenes Abbrechen im laufenden Callback ist wirkungslos. Keine
   wiederverwendeten IDs. Unbekannte ID ist harmlos; fehlende/undefined ID ebenso.
3. Pause vor erstem Callback-Schritt sowie Haltepunkte, Einzel/Über/Aus und
   Originaldatei/-position funktionieren. Kein anderer Timer/DOM-Handler läuft
   während Pause; Wartezeit friert ein. Stop, Fehler, Quellwechsel, Navigation,
   Reload und Desktop-Neustart verwerfen alle ausstehenden Timer.
4. Controller serialisiert Klick-/Weck-/Breakpoint-/Fortsetzenbefehle ohne
   verlorene Bestätigung; frühe/stale Weckung führt nicht zu fremder Ausführung.
   Kein VM-Neueintritt während laufender Auswertung oder echter Asyncify-Pause.
5. Unter/auf/über Grenzen prüfen, einschließlich rekursiver Timer und endgültiger
   Schutzabbrüche trotz catch/finally. Keine Function/eval-/Stringcallback-/Host-
   oder privaten Helferwege; keine App-/Datei-/Netz-/KI-/Unterlagenzugriffe.
6. Lernbeispiel und knappe Erklärung zu Millisekunden, Mindestdauer, Registrierung
   ohne sofortigen Aufruf und clearTimeout. Status zeigt offene Timer; erreichbar
   per Tastatur und schmaler Ansicht. Originalexport enthält nur Quellen.
7. Reale Browser-/Windows-Electronläufe, geeignete Regression und agentseitige
   Bedienprüfung. Frischer unabhängiger Review, sachliche Dokumentation und
   Archivcheck vor Abschluss. Private Unterlagen werden nicht gelesen.

## Ergebnis

Umsetzung, technische Abnahme, Bedienprobe und unabhängiger Review abgeschlossen.

- Neue private Timerverwaltung mit ausschließlich numerischen Worker-Metadaten.
  Der Controller übernimmt die Weckung über seinen bestätigten Befehlskanal;
  frühe Weckungen betreten die VM nicht. Der Callback startet mit eigenem
  Haltegrund und bleibt in derselben Ausführung. Compiler hält eingebaute Timer
  auf direkte Aufrufe begrenzt und wahrt eigene Namen/Imports.
- Beispiel mit drei Sekunden Wartezeit, bewusster Registrierung/Abbruch,
  Callbackparameter, Vorschau und Konsole. Passive Anzahl offener Timer,
  Erklärung zum ersten Halt und eingefrorener Timerzeit. SW v50.
- 13 neue automatisierte Fälle: native Reihenfolge/Closures/Argumentidentität,
  exakte Uhr-/Nesting-/Budgetgrenzen, echter Worker mit fatalen Gegenproben,
  Compiler/Imports, Pausen, deterministische Befehlsinterleavings, Fehler,
  Quellen-/Seitenwechsel, Export, Mobil/Tastatur und vollständiger Electron-Neustart.
- Erste Runde 10/12 bestanden; CSS-Kurzschreibweise im Beispiel erzeugte
  unerwünschte border-image-Hinweise, ein Testprojekt ohne CSS erzeugte keine
  gestaltete Vorschau. Beispiel nutzt nun explizite Randwerte, Testprojekt CSS.
  Anschließend 44/45 gezielte Fälle grün, einschließlich aller 13 Timerfälle.
  Ein bestehendes Controller-Double benötigte den neuen verpflichtenden leeren
  Timerstand. DOM-/Formulardoubles entsprechend ergänzt, Prüfungen unverändert.
  Der UI-Test für Klick-/Haltepunktbefehle verwendet eine lange Frist; genaue
  Rennen sind deterministisch geprüft, die Abbruchwirkung nach Fristablauf
  ist separat real geprüft.
- Sieben finale eigene Bediengruppen bei 1280 und 390 px, einschließlich
  Timerstart/Parameter, Anweisungs-Halt, sichtbarer Änderung, Export/Appmarker,
  Stop im Callback und Navigation. Screenshots vor/nach Änderung, mobile
  Steuerung und sichtbare Meldung visuell geprüft. Nur synthetische Daten.
  Artefakte: e2e/test-results/fe059-bedienung/.
- Frischer unabhängiger Reviewer ohne Gesprächskontext: Code, Grenzen,
  Dokumentation und finale Bedienbilder ohne umsetzungsbedürftige Findings.
  Eigene deterministische Controllerprobe deckt verzögerte Acks, zusammengeführte
  Befehle, frühe/veraltete Weckungen und Disposal ab. Echte Workerprobe mit
  importiertem Callback hält in callback.js mit zwei Frames; zweimal 1100 ms
  Pause bleiben aus der Timerzeit ausgeschlossen (602,6 beziehungsweise
  301,6 ms Restwartezeit), keine Ereignisse während Callbackpause.
  Belege: e2e/test-results/fe059-review/.

- Vollständige Regression: **497/497 Browser-/Windows-Electronfälle** ohne
  Wiederholung bestanden, 7,3 Minuten. Enthält die korrigierten bestehenden
  DOM-/Formulardoubles sowie alle 13 neuen Timerfälle.
  Artefakte: e2e/test-results/fe059-regression/.
- Frischer Abschlussreview bestätigt finale Dokumentation und alle vier Bilder;
  keine offenen Produktbefunde. Präzisierung zur nach Fristablauf weiterhin
  wirksamen vorherigen Stornierung übernommen.
- git diff --check und node scripts/check-agent-briefs.mjs bilden den
  abschließenden Archivnachweis. Keine Bibliotheken, Pakete oder privaten
  Unterlagen geändert; kein Commit oder Push ausgeführt.
