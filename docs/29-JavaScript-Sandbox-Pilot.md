# JavaScript-Sandbox: erster technischer Pilot

Stand: 31.10.2026, OPS-036. Die 43 HTML-/CSS-Lektionen bleiben unverändert.
„JavaScript-Technikpilot öffnen“ in der Werkstatt erprobt echte Browserausführung
in Electron mit sieben fest hinterlegten Programmen. Eigener Code, HTML-/JS-Import
und allgemeine Ausführung sind noch nicht freigegeben. Die Webversion erklärt
den Stand und aktiviert in dieser Testfläche keine Skripte. Kein neuer Installer.

Ergänzung OPS-037: Eigene reine Konsolenprogramme sind separat in Web und
Electron freigegeben; siehe [Grundlagenlaufzeit](30-JavaScript-Grundlagenlaufzeit.md).
Die hier beschriebenen Browser-DOM-Gates bleiben davon unabhängig.

## Bedienung und Umfang

Im Electron-Entwicklungsstand die Frontend-Werkstatt und den Technikpilot öffnen.
Ein Testprogramm auswählen und „Test starten / zurücksetzen“ betätigen. Es öffnet
sich eine getrennte Übungsfläche. Stoppen, Zuklappen oder Verlassen der Werkstatt
beendet den Lauf. Ein Neustart erhält einen frischen Dokument-/Sitzungszustand.
Quelltext ist lesbar, aber nicht editierbar ausführbar; Ausgaben sind begrenzt.
Die Programme sind keine benoteten Kurslektionen.

| Programm | Nachweisziel |
|---|---|
| Button verändert Text | Echter DOM, addEventListener und Textänderung |
| Endlosschleife abbrechen | Abbruch von außen trotz blockiertem Übungsrenderer |
| Zu viel Konsolenausgabe | Ausgabegrenze beendet den Übungsprozess |
| Speicherzuwachs beobachten | Schrittweise begrenzte Belegung wird erkannt |
| App-Zugriff und frische Sitzung | Keine App-Brücke/Node-Globals, kein Öffner, neuer eigener Speicher |
| Netzwerk und Navigation sperren | Geprüfte fetch-/Bild-/Popup-/Navigationsversuche scheitern |
| Programmfehler anzeigen | Fehlerausgabe und anschließender sauberer Neustart |

## Aufbau und Vertrauensgrenzen

Pro Lauf: nicht persistente Session, eigene Protokollherkunft und BrowserWindow
ohne Preload. Node-Integration für Fenster, Subframes und Worker ist ausgeschaltet;
Sandbox, Context Isolation und Web Security sind aktiv. Webviews/DevTools/Popups
sind nicht freigegeben. Berechtigungs-, Geräte- und Bildschirmfreigabehandler
verweigern Anfragen. Die Übung hat keine Datei-/RAG-/Konto-/IPC-Brücke.

Vor Ausführung wird eine von der App verschiedene Renderer-PID nachgewiesen.
Nur der bereits identifizierte, weiterhin getrennte Prozess darf erzwungen
beendet werden. Die Host-Timer für Abbruch und Speicherbeobachtung laufen
außerhalb des Testprogramms. Die Protokolle für F12 und JS-Pilot werden zentral
einmal vor Electron-Ready registriert.

Die Protokollantwort enthält ein konstantes Übungsdokument, keine Rechnerdateien.
CSP sperrt Skriptressourcen, Verbindungen, Frames, Objekte und Formabgaben.
Der Hauptprozess führt das ausgewählte feste Programm gezielt im Übungsrenderer
aus. Strings aus Editor, Import oder IPC werden niemals als Programm übernommen;
die bekannte Programmkennung ist die einzige Auswahlmöglichkeit.

Die Session-Requestsperre erlaubt nur das eigene Hauptdokument. Navigation,
Weiterleitung, Popups und Downloads werden zusätzlich blockiert. Beim Schließen
werden Protokollhandler, Speicher und Cache aufgeräumt; die Requestsperre bleibt
geschlossen. Alle IPC-Einstiege verlangen Hauptfenster, Hauptframe und App-Herkunft.
Laufkennungen/Generationen verhindern, dass alte Meldungen oder Startantworten
einen neuen Lauf überschreiben. Beenden der App räumt zuerst die Übung auf.

Private Unterlagen, RAG-Daten und Anmeldedaten werden nicht an die Übung übergeben.
Die KI-Anbindung wird für diesen Versuch nicht verwendet. Keine neue Bibliothek
und keine Ausführung fremder Paket-/Installationsskripte.

## Grenzen des Nachweises

| Grenze | Mechanismus | Aussagegrenze |
|---|---|---|
| Start | 10s Host-Frist | Ohne Prozesstrennung/Speichermessung keine Ausführung |
| Laufzeit | Je Programm 2, 4 oder 60s Host-Timer | Kein Echtzeitversprechen bei beliebiger Systemlast |
| Ausgabe | 80 Nachrichten, 2000 Zeichen je Nachricht, 32000 insgesamt | Begrenzte Testkonsole, nicht sämtliche Browserressourcen |
| Speicher | Messung alle 100ms, Abbruch über 16MiB Working-Set-Zuwachs | Beobachtung mit Überschwingen, keine harte Heap-/Prozess-/Systemgrenze |
| Netzwerk | CSP, Requestsperre und Navigationsregeln | Geprüfte Wege, kein Beweis für alle Browsertransporte |

Der Speichertest selbst ist auf 24 Blöcke zu je 4MiB begrenzt. Ressourcenprobleme
beenden die Übung. Daraus folgt keine Freigabe beliebiger Programme oder Garantie
gegen Browserlücken. Insbesondere eine eigene Browser-Sandbox ersetzt keine
harte Speicherbegrenzung.

## Restgates vor eigenen Skripten

1. Gesamtspeicher einschließlich schneller Belegung, externer Belegung und
   weiterer Browserressourcen zuverlässig begrenzen. Periodische Messung reicht
   nicht. QuickJS/WASM bleibt eine Alternative für Sprachgrundlagen und ist
   in OPS-037 nach ausdrücklicher Freigabe für Konsolenprogramme umgesetzt.
   Diese Freigabe umfasst keine beliebigen nativen Browser-DOM-Programme.
2. Browser-API-/Netzwerkumfang mit beliebigen Programmen untersuchen: unter
   anderem WebRTC/TURN, native Dateidialoge, Dateisystem und Zwischenablage.
   disable_non_proxied_udp ist gesetzt, beweist aber keine vollständige
   WebRTC-Sperre. Solche unkontrollierten Transporte erzeugen die festen Tests nicht.
3. Webversion separat absichern: Herkunftstrennung, sichere Nachrichten,
   unabhängiger Abbruch und Ressourcenbegrenzung. Die reine Grundlagenkonsole
   ist separat in [OPS-037](30-JavaScript-Grundlagenlaufzeit.md) umgesetzt.
   Kein einfaches Zuschalten
   von allow-scripts an der bisherigen HTML-/CSS-Vorschau.
4. Eigene Projekte planen: .js-Auswahl, Mehrdateien, Sicherung, feste Prüfungen
   außerhalb des Lerncodes, Fehlermapping und spätere Debugger-/DOM-/Speicher-/
   Trainings-API-Freigaben.

Der Pilot bestätigt einen echten DOM und Abbruch in einer getrennten Desktop-
Testfläche. Die Entscheidung zwischen begrenzter Grundlagenlaufzeit und umfassender
abgesicherter Browserausführung ist damit noch nicht vollständig gefallen.

## Automatisierte Nachweise

Acht Pilotfälle: Web-Sperre, verspätete Startantworten, DOM/Prozess/Rechte,
automatischer Loop-Abbruch, Ausgabe/Speichermessung, frische Sitzung/App-Daten/
Netzwerkprobe, Kennungsfilter/manueller Abbruch/Wiederöffnen und Fehler/App-Ende.

Die Netzwerkprobe erreicht den instrumentierten lokalen Health-Endpunkt nicht;
Popup/Navigation bleiben blockiert. Kein Mitschnitt sämtlichen Netzwerkverkehrs.
Ein synthetischer App-Speicherwert bleibt erhalten, neue Übungssitzungen finden
keinen vorherigen Wert. Keine realen Konten oder Materialien für die Gegenproben.

Gesamtumfang: 73 Browser-/Electronfälle, davon 65 bestehende Werkstatt-/CSS-/
Formular-/Desktopfälle und acht Pilotfälle. Im ersten Gesamtlauf wurde ein zu
früher Testassert auf den asynchronen Panel-Cleanup korrigiert. Die 15 betroffenen
Pilot-/Desktopfälle sind anschließend einschließlich F12 grün; die übrigen 58
waren im Gesamtlauf bereits grün. Zusätzlich 15 Runtime-/Distributionstests und
Frontendbuild erfolgreich. Backend unverändert; kein neuer Backendtestlauf.

Matrix: Windows/Chromium/Electron 45.2.0 im Entwicklungsstand, künstliche Profile.
Keine neue Installation und kein Plattformnachweis außerhalb dieser Matrix.
Der bisherige Build-Größenhinweis bleibt bestehen. Unabhängiger Review und
Archivabschluss sind im zugehörigen Brief dokumentiert.

## Primärquellen

Am 31.10.2026 geprüft:

- [Electron Prozesssandbox](https://www.electronjs.org/docs/latest/tutorial/sandbox)
- [WebContents: PID und Renderer-Abbruch](https://www.electronjs.org/docs/latest/api/web-contents)
- [App-Prozessmessung](https://www.electronjs.org/docs/latest/api/app#appgetappmetrics),
  [ProcessMetric](https://www.electronjs.org/docs/latest/api/structures/process-metric)
- [Session](https://www.electronjs.org/docs/latest/api/session),
  [WebRequest](https://www.electronjs.org/docs/latest/api/web-request),
  [Protokollregistrierung](https://www.electronjs.org/docs/latest/api/protocol)
- [MDN iframe-Sandbox](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe#sandbox)
- [QuickJS/WASM als offener Kandidat](https://github.com/justjake/quickjs-emscripten)
