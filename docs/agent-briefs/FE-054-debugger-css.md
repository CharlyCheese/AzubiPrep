# FE-054 – CSS in der DOM-Debugvorschau

Status: done
Bereich: FE
Angelegt: 2026-11-01

## Ziel und Architektur

Optionale eigene CSS-Quelle (styles.css) im bestehenden Modul-/HTML-Projekt,
Editor, bewusster lokaler CSS-Dateiimport/-export, JSON/Persistenz. Klassen-
und ID-Änderungen aus derselben QuickJS-VM verändern sichtbare Browsergestaltung
exakt nach der ausgeführten Anweisung. Zusätzlich bewusst ladbares CSS-Beispiel.

CSS-Vorschau in eigenem iframe ohne Skripterlaubnis, sandbox allow-same-origin
nur für den geprüften React-Datenrenderer/Eltern-Klicklistener. Statisches
vertrauenswürdiges srcDoc mit CSP default-src none, script-src none,
style-src unsafe-inline, Ressourcen/Netz/Formulare/Frames/Worker gesperrt.
Kein HTML-/JS-Quelltext in srcDoc, nur validierte DOM-Baumdaten per Reactportal.
Echte Quell-IDs/Klassen ausschließlich im Frame, kein Zugriff auf Appgestaltung.
Vorhandenen cleanCSS-Filter der Werkstatt unverändert wiederverwenden.
CSS max16KiB UTF-8, vorhandene Grenzen300Regeln/Tiefe4/Wert250Zeichen,
Property-/Selektor-Allowlist und Meldungen für entfernte Regeln. Keine neuen
Bibliotheken. Kein style-/getComputedStyle-Zugriff für Lern-JS, keine Erweiterung
von VM/Worker/Compilerrechten. Klassen-/ID-/Textmodell bleibt maßgeblich.
Ohne CSS bleibt vorhandene strukturelle Vorschau kompatibel.

## Allowlist

- neue frontend/src/pilot/debugger-css.js
- frontend/src/pilot/debugger-project.js (optionales CSS-Feld)
- frontend/src/components/DebugDOMPreview.jsx, JsDebuggerPilot.jsx
- frontend/src/styles/pilot.css, frontend/public/sw.js
- neue e2e/tests/debugger-css.spec.js; bestehende debugger-dom.spec.js nur nötige
  Anpassungen ohne Abschwächung alter Schutz-/Semantikassertionen
- docs/38-Quellcode-Debugger-Planung.md,39-Debugger-Technikpilot.md,
  46-Debugger-DOM-Klicks.md; neue docs/47-Debugger-CSS.md
- dieser Brief, docs/agent-briefs/STATUS.md,DONE.md
- ignorierte synthetische Artefakte unter e2e/test-results/

## Abnahme

1. Native CSS-Farben/Typografie/Layout, #id/.klasse/Tag, Kaskade/Vererbung und
   begrenzte Medienregeln; Zustand vor/nach echtem Haltepunkt stimmt.
2. CSS betrifft nur Frame; auch fixed/z-index/IDs/Klassen können App/Stop nicht
   überdecken. Keine Ressourcen/Imports/Fonts/URL-/Skript-/HTML-Ausführung;
   CSP und Filter unabhängig prüfen, eigene Styles überschreiben keine Sperren.
3. Eventbrücke erhält echte Modell-ID/Target/Bubbling, während Pause/Lauf gesperrt,
   genau ein Dispatch, kein Replay. Frame darf nicht durch Source navigiert
   werden. Keine neue VM-Auswertung durch Beobachtung/CSS.
4. CSS-Änderung beendet Sitzung; neue Sitzung beginnt aus Originalen. CSS inklusive
   JSON/Reload/Windows-Electron-Neustart, alte Stände ohne CSS unverändert.
   Dateiimport prüft Name/Metadaten/Größe vor text(), keine privaten Pfade lesen.
5. Browser-/Electron-/Mobil-/Sicherheits-/Semantik-/Persistenzprüfungen und
   betroffene Regression/Build grün; agentseitige Bedien-/Bildprobe und frischer
   unabhängiger Review. Keine privaten Ablagen, Installer/Commit/Push.
6. Archivierung und check-agent-briefs grün vor Fertigmeldung. Weitere CSS-APIs,
   mehrere Stylesheets/HTML-Linkimport, Formulare und neue DOM-APIs separat.

## Ergebnis

Optionale CSS-Quelle im vorhandenen Modulprojekt ergänzt, unveränderte alte
Sicherungen weiterhin gültig. CSS-Editor im aufklappbaren Bereich, Einzeldaten-
import/-export mit Metadatenprüfung vor text()/bewusster Bestätigung und
Generations-/Projektprüfung nach asynchronem Lesen. Neues bewusstes CSS-Beispiel.
CSS-Änderung invalidiert dieselbe Quellrevision und beendet Worker/Frame.

Mit CSS eigener skriptloser Frame, konstantes srcDoc mit CSP; Reactportale nur
für gefilterten Style-Text und validierte Baumdaten. Quell-IDs/Klassen nur im
Frame. Echte Bodyattribute, native Kaskade/Layout/Medienregeln, alter struktureller
Renderer ohne CSS erhalten. Parent-Klicklistener mit direkten Referenzen,
aktueller Document-/ID-/Idleprüfung und synchroner Einzelsperre. Neuer Idle-Zyklus
setzt die lokale Sperre auch nach handlerlosen Klicks zurück. Keine VM-/Compiler-
oder Workerrechte geändert, keine neue Bibliothek, cleanCSS unverändert genutzt.

Zehn neue Fälle: sichtbare reale VM-Pause vor/nach Klassenmutation, native Farben/
Kaskade/Vererbung/Grid/Media, Body-ID/-Klasse, nested Target/Bubbling, Doppelklick,
64 handlerlose Aktionen plus kumulative Grenze, Frame-/App-Isolation, CSS-Filter,
CSP-Ressourcen, Metadaten/Bytes/Regelcaps, cancel/stale Import, Originalexport,
Reload und Windows-Electron-Neustart. Bestehende 12 DOMfälle unverändert bestanden;
zuletzt 10/10 neue Fälle ohne Wiederholung grün.

CSP-Testaufbau präzisiert: Beobachter im Parent-Realm, da der skriptlose Frame
keine eigenen JS-Beobachter ausführen soll. Filter verhindert zunächst jeden
Ressourcenversuch. Absichtlich am Filter vorbei injizierte synthetische Import-/
Font-/Hintergrund-/Bildknoten erzeugen vier als csp klassifizierte fehlgeschlagene
Versuche und null tatsächlich geroutete Netzaufrufe. Keine Klassifikationsannahme
ERR_BLOCKED_BY_CSP. Script-/Formproben prüfen kombinierte Sandbox-/CSP-Sperren;
Parent- und Frame-URL bleiben unverändert. Keine Produktänderung für diese
Testinstrumentierung und keine Abschwächung der Filter-/Netzsperren.

Sieben agentseitige Bediengruppen gegen tatsächlichen lokalen Stand 3002 in
eigenem Chromiumprofil bestanden: bewusstes Beispiel, Initpause, echter Haltepunkt
main.js 4:3 mit Blau vor/Grün nach Schritt, zweite Aktion/Ausgaben, Original-CSS und
JSON, Worker 0/Frameentfernung nach CSS-Edit, passiver Reload und 390 px-Dunkelansicht/
Tastatur/Stop. Skript/Ergebnis/Bilder unter ignoriertem
e2e/test-results/fe054-bedienung. Keine Nutzerentwürfe oder privaten Quellen.

Frischer unabhängiger Reviewer fe054_css_review prüfte Code, neue Tests,
CSP-Nachweise, Doku und drei Bilder ohne Sicherheits-/Semantikfindings. Die
Bildsicht identifizierte unnötige Browser-Reset-Hinweise bei border-Kurzform im
Beispiel; Beispieldaten auf border-width/style/color umgestellt, ohne Filter- oder
Laufzeitänderung. Zusätzliche Assertion verlangt null CSS-Hinweise für das
mitgelieferte Beispiel. Alle drei neuen Bilder ohne Warnungen, mobile Karte
vollständig sichtbar, vom unabhängigen Reviewer abschließend freigegeben.

Vollständige Regression 440/440 Browser-/Windows-Electronfälle ohne Wiederholung
grün (Chromium 153.0.8010.12, 6,5 Minuten), einschließlich 126 Debuggerfällen.
Nach ausschließlicher Beispieldatenbereinigung und Cacheversion zusätzlich alle
10 CSS-Fälle ohne Wiederholung grün, Produktionsbuild erneut bestanden.
Aktualisierte siebenstufige Bedien-/Bildprobe grün; keine offenen Reviewfindings.
Dokumente 38/39/46/47 und finaler SW v44 aktualisiert. Keine neuen Bibliotheken,
privaten Ablagen, Installationspakete, Commits oder Veröffentlichungen.


Archiv-/Diffprüfung grün: 326 erledigte Tasks archiviert, 10 offen.
