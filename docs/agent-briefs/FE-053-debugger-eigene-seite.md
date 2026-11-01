# FE-053 – Eigene Debuggerseite

Status: done
Bereich: FE
Angelegt: 2026-11-01

## Ziel

Debugger aus der langen Werkstattseite auf eigene Route
/frontendkurs/debugger auslagern. Kompakter Einstieg und klarer Rückweg,
kein separates natives Fenster/zweiter schreibender Browserkontext.
Bestehende Einzel-/Modul-/HTML-Entwürfe verwenden denselben lokalen Speicher.
Gemeinsamer Werkstatt-Elternbereich bleibt bei internem Wechsel montiert,
damit aktuelle Lektion, Editorzustand und laufende Autosaves erhalten bleiben.
Debugger wird beim Verlassen demontiert und beendet seine Worker. Kursausführung
beim Eintritt abbrechen; keine gleichzeitige unsichtbare Übungsausführung.

## Allowlist

- frontend/src/App.jsx, frontend/src/pages/FrontendKurs.jsx
- neue frontend/src/pages/Debugger.jsx
- frontend/src/components/JsDebuggerPilot.jsx, frontend/src/styles/pilot.css
- frontend/public/sw.js
- e2e/tests/helpers.js, debugger*.spec.js, workshop-save-status.spec.js
  (Zugriff auf neuen Ort; bestehende Semantik-/Schutzassertionen erhalten)
- neue e2e/tests/debugger-page.spec.js
- docs/39-Debugger-Technikpilot.md, docs/46-Debugger-DOM-Klicks.md
- dieser Brief, docs/agent-briefs/STATUS.md, DONE.md
- ignorierte synthetische Artefakte e2e/test-results/

## Abnahme

1. Werkstatt enthält nur kompakten Einstieg; eigene Seite zeigt kompletten,
   sofort offenen Debugger mit Rücklink, Speicherstatus und verständlichem Titel.
   Direkte URL und Reload in Web/Windows-Electron funktionieren.
2. Sofortiger interner Wechsel nach Bearbeitung verliert keine Quellen/Autosaves;
   Einzelentwurf bleibt mit JavaScript-Konsole geteilt, Module/HTML unverändert.
   Lektion und Kurseditor bei Rückkehr erhalten; kein automatischer Code-Start.
3. Verlassen beendet vorbereitete/laufende/pausierte oder auf Klick wartende VM
   physisch; neue Seite zeigt keine alten Werte. Eintritt beendet Kursausführung.
   Keine Änderung an VM-/Compiler-/DOM-Rechten oder KI-/Privatdatenverarbeitung.
4. Tastatur, Mobilbreite und stabile Hell-/Dunkelansicht sinnvoll; keine neue
   Bibliothek, Installer, privaten Ablagen oder Veröffentlichung.
5. Passende neue Navigations-/Persistenz-/Lebenszyklusfälle plus gesamte betroffene
   Regression/Build grün; agentseitige Bedienprobe, frischer unabhängiger Review,
   sachgerechte Archivierung und grüner check-agent-briefs vor Fertigmeldung.

## Ergebnis

Eigene Route /frontendkurs/debugger als Kind der bestehenden Werkstattseite
implementiert. Werkstatt zeigt kompakten Einstieg; eigene Seite zeigt Titel,
Rücklink, Speicherstatus und sofort offenen Arbeitsbereich. Keine neue
Browser-/Fensterinstanz. Nach Eintritt Fokus/Scroll auf Seitenkopf, bei Rückkehr
Fokus auf Einstiegslink. Elternroute bleibt montiert und hält Lektion,
Editoransicht, Daten und laufende Speicherbestätigungen. Vorhandene Speicher-
und Formatprüfung unverändert. Kein neuer Speicher oder Datenimport erforderlich.

Debugger wird beim Verlassen demontiert; bestehendes cancel/dispose beendet
Compiler und VM physisch. Eintritt demontiert unsichtbar werdende Kurswerkzeuge
und bricht laufende Prüfungen ab. VM-/Compiler-/DOM-/KI-Code unverändert.

Bisherige Debugger-Tests verwenden über gemeinsamen Helfer den tatsächlichen
Einstiegslink. Bestehende Schutz-/Semantikassertionen erhalten; explizite
Schließen-/Öffnen-Probe unverändert. Der geteilte Konsolen-Export/Import-Test
wechselt bewusst zwischen Werkstatt und Debugger. Neun neue Navigationsfälle
prüfen Quellen/Lektion, vier Workerphasen, Module/HTML, Mobil/Tastatur,
Electron-Direktaufruf/Neustart und Abbruch eines laufenden Kursprogramms.
Erster gezielter Lauf 38/38 ohne Wiederholung grün.

Agentseitige Bedienprobe im tatsächlichen lokalen Stand 3002 in eigenem
Chromiumprofil: sechs Kontrollgruppen grün. Kompakteinstieg, Tastatur/Fokus,
Lektion/Editor/Quelle, passive Browserhistorie und Reload, physischer VM-Abbruch
und 390 px-Rückweg. Zusätzlich deterministisch einen bereits laufenden OPFS-
head.json.close-Commit angehalten, Ankunft abgewartet, hin/zurück navigiert:
Quelle 2 erhalten, keine vorzeitige Gespeichert-Meldung, nach Freigabe gespeichert;
Reload bestätigt Quelle 2. Skript/Ergebnis und Hell-/Dunkel-/Mobilbilder unter
ignoriertem e2e/test-results/fe053-bedienung, visuell geprüft. Keine Nutzerentwürfe
oder privaten Ablagen verändert.

Frischer unabhängiger Reviewer fe053_debugger_page_review bestätigt Routing,
Hooks, gemeinsames Speichern, physisches Ende, Kursabbruch, Dokumentation und
alle drei Bilder ohne offene Findings. Hinweis zum Rückfokus umgesetzt;
Nachweislücke für laufenden Commit durch obige explizite Probe geschlossen.
Dokumente 39/46 und SW v42 aktualisiert. Gesamtlauf: 430 Fälle:429 bestanden, ein ausschließlich im Testaufbau
unvollständiger Kursstarter wurde korrekt vor Workerstart abgewiesen. Die erste
JS-Lektion hat absichtlich noch keinen script-Verweis; der zusätzliche
Abbruchtest ergänzte ihn zunächst nicht. Fixture korrigiert: im echten Editor
index.html durch die zugehörige Muster-HTML mit externem defer-Skriptverweis
ersetzen. Keine Produktcodeänderung und keine Abschwächung der Abbruchassertion.
Reviewer bestätigt den Fix. Gezielter Nachlauf dieses Falls 1/1 ohne Wiederholung
grün, einschließlich tatsächlich gestarteter und physisch beendeter Kurs-VM.
Damit alle 430 Fälle im finalen Produktstand abgedeckt, davon 116 Debuggerfälle;
der ursprüngliche Gesamtlauf war429/430, kein als grün umdeklarierter Fullrun.
Chromium153.0.8010.12/Windows-Electron, Gesamtlauf6,5 Minuten. Produktionsbuild
auch im gezielten Nachlauf grün; bekannter Bundlegrößenhinweis. Abschlussreview
und formaler Archivcheck abschließend dokumentiert. Keine neue Bibliothek, Installer,
Commits/Push oder Veröffentlichung.

Archiv-/Diffprüfung grün: 325 erledigte Tasks archiviert, 10 offen.
