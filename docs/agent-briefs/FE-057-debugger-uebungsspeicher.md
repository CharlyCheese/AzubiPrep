# FE-057 – Abgeschirmter Übungsspeicher im Debugger

Status: done
Bereich: FE
Angelegt: 2026-11-02

## Ziel

D4 nach FE-056: Storage-Methoden mit primitiven Strings in derselben DOM-Debug-VM
ausführen und Zustandsänderungen vor/nach einer Anweisung sichtbar machen.
Erste Stufe ausschließlich sitzungsgebunden; keine echte Browserpersistenz,
App-/OPFS-/Konten-/Unterlagenanbindung. JSON/strukturierte Speicherung separat.
Aufgabenliste speichert Titel pro Schlüssel, zeigt Leeren der Ansicht und
Wiederladen aus derselben Sitzung. Alte FE-055/056-Änderungen bewahren.

## Allowlist

- neue frontend/src/pilot/debugger-storage.js
- neue frontend/src/components/DebugStoragePreview.jsx
- frontend/src/pilot/debugger-core.js,debugger-compiler.js,debugger.worker.js,
  debugger.js
- frontend/src/components/JsDebuggerPilot.jsx
- frontend/src/styles/pilot.css,frontend/public/sw.js
- neue e2e/tests/debugger-storage.spec.js
- docs/38-Quellcode-Debugger-Planung.md,49-Debugger-Elemente.md;
  neue docs/50-Debugger-Uebungsspeicher.md
- dieser Brief,docs/agent-briefs/STATUS.md,DONE.md
- ignorierte synthetische Artefakte unter e2e/test-results/

## Abnahme

1. localStorage nur im HTML-/Ereignismodus als privater VM-Handle, kein echter
   Browser-Storage. getItem/setItem/removeItem/clear/key und readonly length.
   Primitive DOMString-Konvertierung, fehlende Schlüssel null, Setzen/Löschen
   undefined, Überschreiben und Methodenreihenfolge nativ vergleichbar.
   Keine benannten Properties, freien Methodenaliase, Objektkoerzierung,
   sessionStorage, JSON oder Erweiterung allgemeiner App-/Hostrechte.
2. Explizite Pilotbudgets: maximal16 Einträge,128 UTF-16-Einheiten je Schlüssel,
   2048 je Wert,16KiB UTF-8 aus Schlüsseln+Werten,256 Speicheroperationen pro
   Sitzung. Zeichen-/Eintrags-/Bytequota wirft fangbaren QuotaExceededError
   ohne Zustandsänderung. Operations-/Protokoll-/Zeit-/Heapgrenzen bleiben
   endgültig; fehlerhafte Zugriffswege ebenfalls. Missing-argument TypeError
   fangbar, keine Benutzerhooks. key nutzt begrenzte primitive unsigned-long-
   Konvertierung, auf Schlüsselreihenfolge soll Lerncode nicht vertrauen.
3. Mutationssnapshots im VM-/Worker-/Controllerpfad begrenzt/validiert, Schlüssel
   eindeutig und Bytezahl unabhängig nachgerechnet. Änderungen exakt nach
   ausgeführter Anweisung, keine erneute VM-Auswertung durch Anzeigen/Öffnen.
   Nur Datenstrings, keine Gastobjekte/Handles/Source im Renderer.
4. Aufklappbare Speicheransicht macht Grenzen und sitzungsgebundene Abweichung
   von Browser-localStorage sichtbar. Text/HTML-artige Werte inert. Stop,
   Quellwechsel, Navigation, Neustart entfernen den Übungsspeicher; keine Werte
   in Originalexport, OPFS, KI oder Browserprofil. Echtes App-localStorage
   einschließlich synthetischer gleichnamiger Schlüssel unverändert.
5. Bewusstes Speicherbeispiel: speichern, Ansicht leeren, aus gleichem Speicher
   laden, einzelnen gespeicherten Eintrag entfernen, gesamten Speicher löschen.
   Catchbarer Quota-Fehler erklärt; normaler Kurs und alte Projekte unverändert.
6. Unter/auf/über Grenzen, Native-Referenz, Compiler-/VM-/Protokoll-/Abbruch-
   Negative, Browser-/Electron-Neustart, eigene Tastatur/Mobil-/Bildprobe,
   Gesamtregression/Build und frischer unabhängiger Review. Dokumentation und
   Archivcheck grün. Keine neuen Libraries/PDFs/Installer/Commits/Pushes.

## Ergebnis

Sitzungsgebundene private Storage-Map in QuickJS ergänzt, nur im HTML-/Ereignis-
modus freigegeben. getItem/setItem/removeItem/clear/key/readonly length,
primitive Stringkonvertierung und begrenzte unsigned-long-Indexkonvertierung.
Eigene Modulbindungen dürfen localStorage weiterhin überschatten. Keine echte
Browserpersistenz, benannten Properties, Methodenaliase, JSON oder Hostrechte.

Numerische Pilotlimits16 Einträge/128 Schlüsselzeichen/2048 Wertzeichen,
16KiB UTF-8 aus separat gezählten Schlüsseln/Werten,32KiB serialisierte Ansicht
und256 Operationen. Fangbare QuotaExceededError-Modellfehler vor jeder Mutation;
alter Zustand bleibt atomar erhalten. Missing-argument TypeError fangbar,
Objekt-/Funktionskoerzierung und Operations-/Sicherheitsgrenzen endgültig.
Grenzmeldung über enges privates Fehlersignal zum Worker; keine falsche
Erfolgsmeldung nach Abbruch. Andere Debuggerlimits unverändert.

Worker und Controller validieren Snapshots unabhängig (eigene genaue Felder,
Strings, eindeutige Schlüssel, UTF-8-/Darstellungsgrenzen und Zustandsphase).
Nur der Worker verarbeitet ein zusätzliches begrenztes privates Fehlersignal;
der Renderer sieht ausschließlich geprüfte Speicherdaten oder reguläre Fehler.
Aufklappbare Tabelle rendert Text passiv und erklärt flüchtige Lebensdauer.
Stop/Quellwechsel/Seitenwechsel/Reload/Neustart entfernen Speicherzustand;
Originalexport/OPFS erhalten nur Quellen. App-localStorage wird nie angebunden.

Bewusstes Speicherbeispiel verbindet Titelstrings pro Schlüssel, Laden,
Ansichtleeren, Einzelentfernen und clear. Halteposition31:5 vor setItem sowie15:5
vor removeItem; Speicher-/DOM-Änderung getrennt beobachtbar. JSON und dauerhafte
Übungssicherung ausdrücklich als eigene Stufen dokumentiert. SWv48.

Zehn neue Speicherfälle einschließlich tatsächlichem Browser-/Electron-Neustart,
nativer Storage-Referenz, atomarem Quota-Catch, exakten Zeichen-/UTF-8-/Snapshot-/
Operationsgrenzen, Unicode-Surrogaten, Compiler-/Worker-Negativen, unabhängigem
Hostschema/Revision/Pause-Gate, echtem App-Storage-Marker, inertem HTML-Text,
Originalexport und Mobil/Tastatur. Erster53er-Ziellauf52 grün, ein Fall meldete
Operationsabbruch nur allgemein; private Ursachenübertragung präzisiert. Danach
alle10 Speicherfälle ohne Wiederholung grün. Anschließend vollständige Regression
474/474 Browser-/Windows-Electronfälle ohne Wiederholung bestanden (7,0Minuten,
Chromium153.0.8010.12). Produktionsbuild grün, übliche Größenwarnung unverändert.

Frischer unabhängiger Reviewer fe057_storage_review ohne Codefindings. Zusätzlich
10.000 synthetische Unicode-/UTF-8-Proben einschließlich Surrogaten gegen
Buffer.byteLength, primitive Indexkonvertierungen, atomare Quota und endgültige
Hook-Abweisung bestätigt. Testtitel zur Snapshotvalidierung präzisiert: konkrete
Nachrichten-/Protokollbudgets werden durch bestehende allgemeine Abnahme geprüft,
nicht durch diesen einzelnen Fake-Controllerfall behauptet.

Sieben eigene Bediengruppen am laufenden Webstand in isoliertem Chromiumprofil
bestanden: Initialpause/leerer Hinweis; setItem-Zustand exakt nach Schritt,
spätere DOM-Zeile; Ansichtleeren/Laden und passives Tabellenöffnen; removeItem
vor DOM-Entfernen; clear ohne Änderung eines gleichnamigen echten App-Markers;
Originalexport/Workerende/passive Rückkehr/leere neue Sitzung;390px-Dunkelansicht,
Enter und Tastatur-Stop mit Workerzahl0/entfernter Speicheransicht. Skript und
Ergebnis sowie vor-speichern.png,nach-speichern.png,mobil.png unter ignoriertem
e2e/test-results/fe057-bedienung, selbst visuell geprüft. Keine Nutzerprofile
oder privaten Unterlagen verwendet. Reviewer prüfte die drei Bilder, Skript und
Ergebnis unabhängig und gab Dokumentation/Bilder ohne Findings frei. Kein
offener Code-/Dokument-/Bildbefund. Keine neuen Bibliotheken, privaten Ablagen,
Installer, Commits oder Pushes. STATUS/DONE aktualisiert. Archivcheck grün:
331 erledigte Tasks,10 offen; git diff --check ohne Fehler.
