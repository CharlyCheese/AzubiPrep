# FE-058 – Begrenztes JSON und strukturierte Speicherprüfung

Status: done
Bereich: FE
Angelegt: 2026-11-02

## Ziel und Umfang

Nach FE-057 strukturierten Zustand in derselben flüchtigen DOM-Debug-Sitzung
serialisieren/einlesen und vor Übernahme fachlich validieren. Native JSON-Semantik
im freigegebenen Datenteil, ohne Getter/toJSON/Reviver/Replacer/Objektkoerzierung.
Nur JSON.parse/stringify, Array.isArray und Number.isInteger als private Fassaden,
über Compiler-Builtinauflösung; echte VM-Standardglobals nicht ersetzen.
Keine neue Bibliothek, keine dauerhafte Sicherung/Datei-/Netz-/KI-/Apprechte.

## Allowlist

- neue frontend/src/pilot/debugger-json.js
- frontend/src/pilot/debugger-core.js,debugger-compiler.js,debugger.worker.js
- frontend/src/components/JsDebuggerPilot.jsx,frontend/public/sw.js
- frontend/src/styles/pilot.css (lesbare Schlüsselspalte bei langen JSON-Werten)
- neue e2e/tests/debugger-json.spec.js
- e2e/tests/debugger-storage.spec.js (veraltetes JSON-Verbot durch weiter
  verbotene Callbackoption ersetzen, keine Storage-Gates abschwächen)
- docs/38-Quellcode-Debugger-Planung.md,50-Debugger-Uebungsspeicher.md;
  neue docs/51-Debugger-JSON.md
- dieser Brief,docs/agent-briefs/STATUS.md,DONE.md
- ignorierte synthetische Artefakte unter e2e/test-results/

## Abnahme

1. JSON-Fassaden nur DOM-Modus, lokale Überschattung erhalten. Native parse-
   SyntaxError und stringify-Zyklus-TypeError fangbar, Datenprüfung danach
   eigenständiger Lerncode. Arrays/Objekte/primitive JSON-Daten inkl. undefined-
   Auslassung, Arraylöcher, nichtendliche Zahlen, Unicode und mehrfacher
   Referenzen nativ vergleichen. Kein eval/Function/Hostcode, keine Constructor-
   oder Prototyp-/Methodenaliaswege. Array/Number nur genannte Prüfmethoden.
2. Stringify prüft eigene Daten-Deskriptoren und arbeitet mit kopierten Daten
   ohne Prototyp; keine Getter/toJSON/Funktionen/DOM-/Storage-/Fassadenhandles.
   Source-Getter/Proxy-Konstruktion bleibt compilerseitig gesperrt. Kein
   allgemeiner Proxy-Inspektionsanspruch. Reviver/Replacer/space gesperrt.
3. Pilotgrenzen16KiB UTF-8 Eingabe/Ausgabe,16 Container-Ebenen,512 besuchte
   Datenwerte,2048 UTF-16-Einheiten je Schlüssel/Stringfeld,256 Datenoperationen.
   Verschachtelung vor parse lexikalisch begrenzen, Graph vor stringify begrenzt
   prüfen. Unter/auf/über Grenzen, aktive Zeit/Heap/Protokoll weiterhin unverändert.
   Ressourcen-/Abschirmungsabbrüche endgültig, mit konkreter Meldung.
4. Neues bewusstes JSON-Beispiel: version:1 und maximal6 Aufgaben mit eindeutiger
   id, Titel1–80, ganzzahligen Minuten1–240, booleschem done. Speichern, Ansicht
   leeren, Laden; Testtext bewusst in Übungsspeicher ablegen. Bei Syntax-/Schema-
   fehlern weder laufenden Zustand/Ansicht noch gespeicherten Text überschreiben.
   Vor/nach parse und Übernahme schrittweise verfolgen. Zusätzliche sichere
   Datenfelder dürfen bestehen; keine Behauptung vollständiger Kapitel22/23-
   oder JSON-Unterstützung über diesen Umfang hinaus.
5. HTML-artige Strings inert, echter App-Speicher unverändert. Daten/Handles
   bleiben VM-lokal; keine Livezustände/JSON-Texte in Originalexport oder OPFS.
   Reset bei Stop/Quell-/Seitenwechsel/Reload/Electron-Neustart wie FE-057.
6. Native Vergleichs-/Grenz-/Compiler-/VM-/Lebenszyklusprüfungen, Browser/Electron,
   eigene Mobil-/Tastatur-/Bildprobe, Gesamtregression/Build und frischer Review.
   Doku/Archiv grün vor Fertigmeldung. Keine privaten Ablagen/PDFs, Installer,
   Commits oder Pushes; bestehende uncommittete FE055–057-Arbeit bewahren.

## Ergebnis

Begrenzte JSON-/Prüf-Fassaden im DOM-Modus über Compiler-Builtinauflösung
angebunden. Echte VM-Globals unverändert; lokale Namen/Parameter, Objektkeys
und Shorthand separat berücksichtigt. Private Handles erhalten ausschließlich
parse/stringify/isArray/isInteger, keine Methodenaliase/Constructor-/Prototypwege.
Eigene Daten werden durch begrenzte Descriptorprüfung kopiert; neue Kopien
ohne Prototyp verhindern Hookausführung. Arrays behalten native JSON-Ausgabe
für Löcher/undefined, Zahlen/Sonderwerte und geteilte Referenzen. parse liefert
native Werte zurück, nach vorheriger Eingabetiefen- und nachfolgender Datenprüfung.

Budgets16KiB UTF-8 Eingabe/Ausgabe/besuchter Schlüssel-/Stringtext,16 Container,
512 besuchte Werte,2048 UTF-16-Feldeinheiten und256 JSON-/Prüfoperationen.
SyntaxError und Zyklus-TypeError fangbar. Nicht unterstützte Funktionen/Getter/
Modellhandles/Optionen oder Budgetüberschreitungen endgültig mit konkretem
privatem Fehlergrund. Source-Proxy-/Getter-Konstruktion bleibt gesperrt; kein
allgemeiner Proxy-Inspektionsanspruch. Keine passiven Objektwatches ergänzt.

JSON-Beispiel mit Version1, höchstens6 Aufgaben und ausgeschriebener ID-/Titel-/
Minuten-/Boolean-Prüfung. Laufender Zustand/Ansicht/Speichertext getrennt; keine
automatische Speicherung nach Hinzufügen. Laden liest/parst/prüft vor Übernahme,
fehlerhafte Daten verändern weder aktuellen Zustand/Ansicht noch Speichertext.
Bewusstes Testtextfeld unterstützt Syntax- und Schemaproben. DOM-/Storage- und
andere Ressourcenbudgets unverändert; weiterhin keinerlei dauerhafte Persistenz.

Zehn neue JSON-Fälle: echte UI-Halte vor parse und Zustandsübernahme, neun
fehlerhafte Syntax-/Schemafälle plus gültige leere Liste, native Daten-/Fehler-
Referenz, Namens-/Key-/Shorthandfälle, genaue Modellgrenzen, Getter-/Hook-
Gegenproben, Compiler-/Worker-Gates, Originalexport/Reload/Appmarker, Mobil/
Tastatur und vollständiger Windows-Electron-Neustart. Erster Ziellauf63/63
JSON-/Speicher-/Element-/Form-/DOM-/CSS-Fälle ohne Wiederholung grün. Weitere
reale Workerfälle für16 Ebenen,16KiB,512 besuchte Werte und256 Operationen
ergänzt und abschließend bestanden. Vollständige
Regression484/484 Browser-/Windows-Electronfälle ohne Wiederholung bestanden
(Chromium153.0.8010.12,6,8Minuten). Nach Ergänzung des Worker-Grenzaufbaus und
reiner Darstellungsnacharbeit Produktionsbuild sowie alle10 JSON-Fälle erneut
ohne Wiederholung grün, einschließlich Windows-Electron-Neustart.

Frischer unabhängiger Reviewer fe058_json_review prüfte Code, Tests und Doku51
ohne Findings. Zusätzlich27 native/Compiler-Einzelproben und1000 deterministische
Roundtrips mit Unicode/Surrogaten, Löchern, undefined, Sonderzahlen und Datenkeys
gegen native Verarbeitung verglichen; keine Abweichungen im unterstützten
Umfang. Halte47/48/60/62:5 gegen Compilerpunkte bestätigt. Diese synthetischen
Reviewer-Proben wurden direkt ausgeführt, ohne gespeicherte Datei-Artefakte.

Sieben eigene Bediengruppen im isolierten Chromiumprofil am tatsächlichen
lokalen Webstand bestanden: bewusstes Beispiel/Initialpause/JSON-Stand;
Ansichtleeren und geprüftes Laden; echte parse-/Übernahmehalte mit unverändertem
DOM bis render; Syntax-/Schemafehler erhalten Aufgaben und gespeicherten Text;
Appmarker/Originalexport getrennt plus Workerende/passive Rückkehr;390px-Dunkel-
ansicht und Tastatur-Sichern; Tastatur-Stop verwirft Sitzung/Worker. Bilder unter
ignoriertem e2e/test-results/fe058-bedienung selbst geprüft. Kleine Bildnacharbeit:
Testfeld mit Label/blockiger Anordnung und Buttonabständen in Beispieldaten,
Schlüsselspalte erhält bei langen JSON-Werten6rem Mindestbreite. Keine
Ausführungs-/Filteränderung. Finale sieben Bediengruppen erneut bestanden,
drei aktualisierte Bilder selbst und unabhängig vom Reviewer geprüft. Reviewer
bestätigt auch ergänzte echte Worker-Grenzassertionen; keine offenen Code-/
Dokument-/Bildfindings. Dokuverweis auf nicht gespeicherte Review-Artefakte
sachlich berichtigt. SWv49. Keine Bibliotheken, privaten Ablagen/PDFs, Installer,
Commits oder Pushes. STATUS/DONE aktualisiert. Archivcheck grün:332 erledigte
Tasks,10 offen; git diff --check ohne Fehler.
