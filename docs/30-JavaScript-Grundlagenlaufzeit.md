# JavaScript-Grundlagenlaufzeit

Stand: 31.10.2026, OPS-037. Entwicklungsstand für Web und Electron;
Installationspakete wurden noch nicht neu gebaut. FE-028 ergänzt inzwischen
[Kapitel 14](31-JavaScript-Kapitel-14.md) im gemeinsamen Lektionsablauf.

## Benutzen

In der Frontend-Werkstatt „JavaScript-Bereich öffnen“. Eine einzelne `.js`-Datei
bearbeiten oder ausdrücklich einlesen und mit „JavaScript ausführen“ starten.
Konsole und Fehlerdetails erscheinen darunter. Stoppen, neuer Start, Änderungen,
Schließen und Verlassen der Werkstatt beenden den bisherigen Lauf.

Jeder Start hat frische Variablen. Der Entwurf wird gemeinsam mit dem lokalen
Kursstand gesichert: im Web über den vorhandenen OPFS-Kursspeicher, im Desktop
über den portunabhängigen nativen Kursspeicher. Alte Stände ohne `jsDraft`
bekommen das Beispiel; die bestehenden 43 Aufgabenprojekte bleiben erhalten.
Bei nicht lesbarem Speicher wird kein vorhandener Stand überschrieben; eigene
Dateien können weiterhin exportiert werden. Regelmäßig `.js` exportieren.
Einlesen, Öffnen und Wiederherstellen führen niemals automatisch Code aus.
Das JSON-/ZIP-Exportieren einer HTML-/CSS-Aufgabe enthält den separaten JS-Entwurf
nicht; hierfür den eigenen `.js`-Export verwenden.

Erste Versuche: Werte, Variablen, Operatoren, Bedingungen, Funktionen, Schleifen
und Datenstrukturen mit `console.log`. Arrays/Objekte erscheinen als Platzhalter,
damit Getter, Proxys und sehr große Strukturen nicht im Host ausgewertet werden.
Einzelne Eigenschaften/Einträge ausdrücklich protokollieren. Die Datei hat einen
einfachen Namen ohne Pfade und höchstens 64 KiB UTF-8-Quelltext.

## Technische Trennung

QuickJS/WASM wird nach ausdrücklicher Bibliotheksfreigabe verwendet:
`quickjs-emscripten-core` und `@jitl/quickjs-singlefile-browser-release-sync`,
beide exakt Version 0.32.0. MIT-Lizenzhinweise für QuickJS und die Bindings
werden als `quickjs-LICENSE.txt` mit dem Frontend-Build ausgeliefert. Die Singlefile-
Variante enthält WASM; Vite bündelt auch ihre internen dynamischen Importe in
ein eigenes lokales Worker-Asset. Kein CDN und kein externer Runtime-Download.
Ein Worker wird erst beim expliziten Start angelegt und danach verworfen.

Lerncode läuft ausschließlich als Quelltext in QuickJS. Auch `Function` und
`eval` des Gasts beziehen sich auf den Interpreter, nicht auf den Worker-Host.
Keine Ausführung des Lerncodes durch Browser-eval oder Electron-IPC.
Keine Module von Dateien oder Netzwerk laden; kein Modullader installiert.
Die einzige Hostfunktion nimmt begrenzte primitive Konsolenstrings an. Sie wird
im Bootstrap in einer Closure verborgen; `__emit` wird aus dem Gastglobal gelöscht.
Formatierung/Fehleraufbereitung erfolgt im begrenzten Interpreter, nicht durch
Host-dump/JSON.stringify beliebiger Gastobjekte. Getter für Fehlerfelder werden
nicht aufgerufen; Proxy-Traps bei Deskriptorabfragen unterliegen dem Zeitlimit.

Der Gast hat keine Browser-/Node-/Electron-Funktionen: insbesondere kein DOM,
Netzwerk, Worker, Timer, Host-Dateisystem, App-Speicher, RAG oder Modellzugang.
Keine privaten Unterlagen oder Kontodaten werden ihm übergeben. Ausgaben werden
als React-Text angezeigt, nicht als HTML, und nicht gesichert oder an KI gesendet.
Die bisherige HTML-/CSS-Vorschau bleibt ohne Skripte. Native Browser-DOM-Tests
aus OPS-036 bleiben ausschließlich feste, verpackte Programme.

Produktions-CSP erlaubt `'wasm-unsafe-eval'` nur für den benannten Worker-Assetpfad.
Dessen `connect-src` und `worker-src` sind `'none'`. Das Hauptdokument behält
`script-src 'self'` ohne allgemeines eval oder WASM-Freigabe. Der Vite-Entwicklungs-
server setzt diese Backend-Header nicht; geprüft wird der Produktionsbuild.

## Grenzen

| Bereich | Begrenzung |
|---|---|
| Quelle | 64 KiB UTF-8, einzelne `.js`, einfacher Dateiname |
| Initialisierung | Äußerer Worker-Wächter 10 Sekunden |
| Programmlauf | 1 Sekunde verstrichene Zeit über Interpreter-Interrupt; äußerer Abbruch nach 1,5 Sekunden ab Laufmeldung |
| Speicher | 16 MiB QuickJS-Heap und 64 KiB Interpreter-Stack |
| Ausgabe | 80 Zeilen, 1000 Zeichen je Zeile, 32000 insgesamt; höchstens 20 Argumente je Konsolenaufruf |
| Promise-Folgeaufgaben | Höchstens 1000 Jobs unter derselben Laufzeitfrist |
| Ende | Worker.terminate bei Abschluss/Fehler/Stop, neue Laufgeneration beim Neustart |

Der Heap-Grenzwert ist keine Obergrenze für App, Browserprozess oder gesamten
Rechner: WASM-Modul, Worker, Quelltext und Host benötigen zusätzlichen Speicher.
Bei Interpreter-/WASM-Fehlern endet der Lauf gegebenenfalls mit einer allgemeinen
Fehlermeldung. Unter großer Systemlast sind Fristen kein Echtzeitversprechen.
An Browser-/Interpreter-Sicherheitslücken bestehen die üblichen Softwaregrenzen;
eine absolute Ausbruchsgarantie wird nicht behauptet.

Asynchrone Browser-APIs fehlen. Promise-Jobs werden begrenzt abgearbeitet;
unbehandelte Promise-Ablehnungen haben noch keine eigene Fehleranzeige. Dieser
Bereich dient synchronen Sprachgrundlagen, nicht dem späteren Async-/DOM-Kurs.
Für DOM, Ereignisse, Browser-Debugger, fetch und Dateiprojekte mit `<script>`
sind weitere Architektur-/Abnahmegates nötig. Kapitel 14 nutzt diese Laufzeit
inzwischen für die ersten acht geführten Lektionen. Deren zusätzliche
Ergebnisprüfung bleibt ebenfalls innerhalb des Interpreters.

## Prüfung

Echte Browser-/Electron-Prüfungen mit künstlichen Profilen: eigene Berechnung,
fehlende Host-APIs inklusive Konstruktorwegen, Syntaxfehler mit Dateiname,
HTML als Text, frische Variablen, Schleife/Rekursion/TypedArray-Speicher,
Konsolenflut, Promise-Jobkette, feindliche Objekt-/Fehler-Getter/Proxys,
Stop/Neustart/Schließen/Routenwechsel, Import/Export, Größen-/Dateifilter,
Sicherung/Reload und Desktop-Neustart. CSP des echten Worker-Assets und
unveränderte Hauptdokument-CSP auch beim fehlenden Asset geprüft. Ungültige
Importnamen werden nachweislich vor dem Lesen abgewiesen. Neuer Worker startet
ohne Verbindung aus dem zuvor vorbereiteten Service-Worker-Cache. Keine neue externe Runtime-Anfrage.
Bestehende Schriftressourcen der App sind davon unabhängig.

82 unterschiedliche Browser-/Electronfälle grün (Gesamtlauf 81, danach neun
erweiterte neue Fälle einschließlich Offline-Nachweis), 203 Backendtests/22
Suiten, Lint, 15 Runtime-/Distributionstests und Frontendbuild erfolgreich.
Der bestehende Build-Größenhinweis bleibt erhalten. Unabhängiger Nachreview
ohne offene Findings; künstliche Testprofile, Windows/Chromium/Electron 45.2.0.

Ergebnis und unabhängiger Review stehen im
[Brief](agent-briefs/OPS-037-js-grundlagenlaufzeit.md).

## Primärquellen

- [QuickJS Emscripten: Ressourcenbegrenzung und Host-APIs](https://github.com/justjake/quickjs-emscripten)
- [Singlefile-Browser-Variante](https://github.com/justjake/quickjs-emscripten/blob/main/doc/%40jitl/quickjs-singlefile-browser-release-sync/README.md)
- [Worker.terminate](https://developer.mozilla.org/en-US/docs/Web/API/Worker/terminate)
