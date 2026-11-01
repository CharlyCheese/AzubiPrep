# FE-052 – D4: DOM- und Klickereignispilot

Status: done
Bereich: FE
Angelegt: 2026-11-01

## Ziel und Umfang

Erste interaktive Debuggerstufe: gespeicherte HTML-Quelle neben dem Modulprojekt,
begrenztes lokales DOM-Modell innerhalb derselben QuickJS-VM, sichere Vorschau.
querySelector/querySelectorAll (#id/.klasse/Tag), getElementById, body,
textContent/id/className/tagName, button.disabled, classList add/remove/toggle/
contains; add/removeEventListener für click. Ereignis type/target/currentTarget/
bubbles/defaultPrevented sowie preventDefault/stopPropagation/stopImmediatePropagation.
Keine DOM-Reflexion, innerHTML, allgemeinen Methodenaliasse, Browser-/Hostrechte.

Nur sichere strukturelle HTML-/Text-/Button-Tags und Attribute. Keine eigenen
Styles, Ressourcen, Links, Formulare/Eingabefelder, Skripte oder Navigation in
dieser ersten Stufe. HTML wird mit bereits freigegebenem lokalem Linkedom im
Vorbereitungsworker interpretiert, kein Browser-DOMParser/Netzzugriff. Vorschau
rendert nur validierte Daten mit React, keine Roh-HTML-/Klassen-/ID-Injektion.

Sourcehandler laufen nach Initialisierung in derselben lebenden VM, je Ereignis
genau eine sequentielle evalCodeAsync-Auswertung; kein Replay/keine Reentrancy.
Erster Handlerhalt, Einzelschritt/Über/Aus/BP, echte Closures/Module. Synthetischer
Ereigniscaller explizit gekennzeichnet, keine erfundenen Nutzerpositionen.

DOM-Grenzen: HTML16KiB,128 Modellknoten, Tiefe16, Snapshot32KiB/gesamt16KiBText,
2048Zeichen je Text/Attributfeld,128Listener,64Klickaktionen,2048DOM-Schreiboperationen.
Keine Ereigniswarteschlange; bei Pause/laufendem Handler keine neuen Aktionen.
Vorhandene Quell-/AST-/Heap-/Stack-/WASM-/Zeit-/Protokollcaps bleiben gemeinsam
und kumulativ. Fünf Minuten Idle wie Pause, externes Ende. Live-DOM/Listener/
Events/Variablen nicht speichern/exportieren/an KI senden; nur Originalquellen.

## Allowlist

- neue `frontend/src/pilot/debugger-dom.js`, `debugger-dom-parse.js`
- `frontend/src/pilot/debugger-{compiler,core,project}.js`,
  `debugger-compiler.worker.js`, `debugger.worker.js`, `debugger.js`
- `frontend/src/components/JsDebuggerPilot.jsx`, neue `DebugDOMPreview.jsx`,
  `frontend/src/styles/pilot.css`, `frontend/public/sw.js`
- neue `e2e/tests/debugger-dom.spec.js`; bestehende Debuggertests nur notwendige
  DOM-/Protokoll-Erweiterungen, keine Abschwächung alter Sicherheitsnegative
- neue `docs/46-Debugger-DOM-Klicks.md`, Dokumente38/39/45
- dieser Brief, `docs/agent-briefs/STATUS.md`, `docs/agent-briefs/DONE.md`
- synthetische temporäre Prüfartefakte unter ignoriertem `e2e/test-results/`

## Abnahme

1. Konkrete HTML-/Textänderungen vor/nach echter VM-Pause sichtbar; Klickhandler
   mit echten Parametern/Closures/Dateipositionen und aktuellem Aufrufstack.
   Source wird nie im App-/Preview-Browser ausgeführt.
2. Listeneridentität/Entfernung/Bubbling/Stop/preventDefault im zugesagten Umfang
   nachvollziehbar geprüft; keine doppelten Klicks/Handler oder Jobs während Pause.
   Synthetischer Caller klar getrennt; keine Reentrancy derselben VM.
3. Host kennt nur begrenzte validierte Baumdaten/ID-Klicknachrichten. Kein direkter
   DOM-/Datei-/Netz-/Appzugriff, Getter-/Prototyp-/Helfer-/Konstruktorweg oder
   Inlinehandler/CSS/URL/Roh-HTML/DOM-Clobbering. Alle Gates endgültig.
4. Gesamtbudgets einschließlich Ereignissen kumulativ, Idle/Stop/Quellwechsel/
   Neustart beendet Listener/VM zuverlässig; frischer Lauf startet sauber.
5. HTML/JS-Sicherung und Electron-Neustart erhalten Originale, keine Laufwerte.
   Alte Einzel-/Modulstände bleiben nutzbar, kein automatisches Ausführen.
6. Gezielte Funktions-/Semantik-/Negativ-/Ressourcen-/Browser-/Electronfälle und
   passende Gesamtregression grün, Bedienprobe agentseitig; frischer Review und
   Archivcheck. Keine neue Bibliothek/privaten Ablagen/Installer/Commit/Push.
   Weitere DOM-/Formular-/CSS-/Asyncunterstützung separat.

## Ergebnis

Erster D4-Pilot umgesetzt: gesonderte HTML-Quelle, bestehendes Modulprojekt,
DOM-Beispiel nach bewusster Bestätigung, React-Datenvorschau, passive Elementdaten.
Linkedom arbeitet ausschließlich im Vorbereitungsworker; QuickJS-Modellhandles
führen nur durch gebrandete private ref/bound-Gates. Kein echtes Browser-DOM,
keine Ressourcen, Roh-HTML-/ID-/Klasseninjektion oder erweiterten Hostrechte.

Initialisierung endet einmal am bisherigen final-Punkt; dieselbe VM wartet
anschließend auf Klicks. Parent und Worker sperren vor jeder Dispatchauswertung
synchron, jeweils ein evalCodeAsync, keine Queue/Reentrancy während Pause.
Handler mit echten Sourceframes/Closures, synthetischer Caller ausdrücklich
Vorschauklick, keine erfundene Sourcezeile. Stop/Änderung/Schließen/Idle beendet
Worker. Original-HTML/JS gespeichert/exportiert, keine Livezustände/Listener.
Alle Quell-/VM-/Zeit-/Ausgabe-/Nachrichtengrenzen bleiben kumulativ; zusätzliche
DOM-/Text-/Knoten-/Listener-/Klick-/Schreibgrenzen ergänzt.

Unabhängiger Reviewer fe052_dom_review fand drei P2-Semantikfälle: Nullargument-
Klassenänderung ohne Publish/Budget, getElementById bei leerer ID, DOMString-
Konvertierung versus nullable textContent. Behoben und gegen echten Chromium-DOM
nachgeprüft; finale Modellprüfung zählt jede tatsächlich ausgeführte Mutation.
Native Vergleichsprobe fand zusätzlich Linkedoms vorzeitige Normalisierung
initialer Klassen. Öffentlichen Setter nur synchron im isolierten Parserworker
um private Originalaufzeichnung ergänzt, in finally exakt restauriert. Reviewer
bestätigt Descriptoridentität auch nach Fehlern und Originalwerte einschließlich
Zeichenreferenzen/Duplikaten. Keine offenen Implementierungsfindings.

12/12 neue gezielte Fälle ohne Wiederholung grün: wirkliche VM-Pausen vor/nach
Mutation, Closures, native Listener-/Tokenreferenz, Module, Stop/Neustart,
Schutznegative, Modell-/Worker-/Controllercaps, Idle, malformed Protokollbäume,
Original-JSON, Mobilansicht und Windows-Electron-Neustart. Bestehende Schutzfälle
nicht abgeschwächt. DOM-Grenzfehler werden privat gemeldet und sticky abgebrochen;
einige bestehende Core-Schutzabbrüche bleiben absichtlich allgemeine Laufzeitfehler.

Sieben agentseitige Bedienkontrollen gegen den lokalen Stand3002 in eigenem
Chromiumprofil bestanden: bewusster Beispielstart, Initpause, Tastaturklick,
Handlerhaltepunkt, Mutation erst nach Schritt, Zustand/Ausgaben1→2, unveränderte
JSON-/Reloadquellen und390px-Klick/Halt/Stop ohne Überbreite. Hell-/Dunkel-/Mobilbilder
zusätzlich visuell geprüft; Skript/Ergebnis/Bilder unter ignoriertem
e2e/test-results/fe052-bedienung. Keine Nutzerentwürfe oder privaten Quellen
verändert. Persönliche Rückmeldung bleibt freiwillig.

Dokumente38/39/45/46 und Service Worker v41 aktualisiert. Keine neue Bibliothek,
keine privaten Ablagen, Installer, Commits oder Veröffentlichung. Vollständige Regression421/421 Browser-/Windows-Electronfälle ohne Retries grün
(Chromium153.0.8010.12,6,5 Minuten), einschließlich107 Debuggerfällen. Build grün,
bestehender Bundlegrößenhinweis. Frischer Abschlussreview bestätigt finale
Implementierung, Semantikreferenzen, Doku und stabile Hell-/Dunkel-/Mobilbilder
ohne offene Findings. Archiv-/Diffprüfung grün:324 erledigte Tasks archiviert,10 offen.
