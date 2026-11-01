# Grundlagen-Debugger: D2-Abnahme

Stand: 2026-11-01, FE-045. Prüfgegenstand ist der lokale Entwicklungsstand,
eine klassische selbst bearbeitete `.js`-Datei mit dem in
[Dokument 39](39-Debugger-Technikpilot.md) ausdrücklich freigegebenen Umfang.
Dies ist keine Abnahme beliebigen JavaScripts, aller späteren Sprachmerkmale
oder eines neu gebauten Installers. D3 beginnt erst nach Abschluss dieses Gates.

## Prüfstand und praktische Rückmeldung

Automatische Matrix: Windows, Chromium 153.0.8010.12, Electron 45.2.0,
lokaler Testserver, synthetische Dateien und getrennte Testprofile.
Webprüfungen verwenden frische Profile; Electronfälle starten reale Prozesse
und testen auch vollständigen Neustart. Andere Betriebssysteme und Browser
sind nicht durch diese Abnahme freigegeben.

Die praktische Rückmeldung bestätigt Einzelschritte, Funktion verlassen,
Haltepunkte/Iteration und gute Sichtbarkeit auch in kleiner Ansicht. Der Code
lief durch; die konkrete Ausgabe wurde ausdrücklich nicht kontrolliert. Dies
wird nicht als persönliche Bestätigung des Zahlenwerts ausgegeben.
Der automatische Fall „praktische Summenvorlage“ prüft separat exakt `5` für
`[2,3]` und `0` für `[]`. Die Verständlichkeit der Bedienkorrektur aus FE-042
wurde zuvor ebenfalls praktisch bestätigt.

Technische Einzelabnahme: 13 neue Fälle grün. Backend 211/211 und Lint,
18 Desktop-/Paket- und drei Webruntimefälle grün. Gesamtregression 365/365 ohne
Wiederholung grün; danach zwei zusätzliche Argument-/Fristfälle und ergänzte
Produktions-Framegrenzen in der 13er-Abnahmesuite geprüft. Letzter unabhängiger
Abnahmereview `fe045_acceptance_review`: bestanden, keine blockierenden Befunde.

## Zuordnung DB01–DB23

Abkürzungen beziehen sich auf Testdateien in `e2e/tests/`:
`debugger` = `debugger.spec.js`, `functions` = `debugger-functions.spec.js`,
`data` = `debugger-data.spec.js`, `methods` = `debugger-arraymethods.spec.js`,
`acceptance` = `debugger-acceptance.spec.js`.

| ID | Konkreter Nachweis | Reichweite / Status |
|---|---|---|
| DB01 | debugger: eigener Code mit 15/22; acceptance: Summenvorlage 5/0 | Web, selbst geänderter Code, keine feste Modellspur; grün |
| DB02 | debugger: TDZ vor Deklaration, danach Zahlenwert; primitive Sonderwerte mit echtem undefined | Web; zusätzlicher valueChars=1-Fall in acceptance; grün |
| DB03 | debugger: Lesepause 1,3 s, Ausgabe vorher fehlend, danach genau einmal | Web, Lesen verbraucht keine aktive Sekunde; grün |
| DB04 | functions: leere Liste ohne Rumpfhalt, drei Werte an gleicher Halteposition; acceptance: []0 | Web; keine behaupteten Halte vor jeder Headerauswertung; grün |
| DB05 | functions: Parameter/TDZ/Frames, Hinein/Über/Aus, Rekursion; data/methods: RHS-Funktion einmal | Web und echte Electronfälle; Rückgabeausdruck nicht wiederholt; grün |
| DB06 | debugger: äußeres/inneres x und Blockende; functions: aktuelle Caller-Scopes in Headern | Web; Parameter- und Frameauswahl getrennt; grün |
| DB07 | functions: expliziter Halt gewinnt bei Über und Aus/Rückgabeaufruf | Web; Haltegrund und tatsächliche Tiefe geprüft; grün |
| DB08 | debugger: Syntaxfehler getrennt von gültiger ununterstützter Sprache; functions/data: weitere Abweisungen | Web plus Compilerproben; dynamisch erkennbare ungültige Datenempfänger enden kontrolliert; grün |
| DB09 | debugger: VM-Endlosschleife; functions: Rekursion; acceptance: echter hängender Ersatzworker und manueller Stop | VM-Interrupt, externer Controller und Lesepause getrennt geprüft; grün |
| DB10 | acceptance: Nachrichten/Bytes exakt, monotone Restzeit; echte Pausen verbrauchen kumulatives Budget; debugger: Workeranzahl/Lebensende | Keine Snapshot-Historie oder Wiederverwendung; grün |
| DB11 | debugger: Getter/Proxy/Serializer/Helfer vorab abgewiesen und HTML-String als Text; data: opaque Datenwerte | Keine automatische Objektinspektion. Nicht unterstützte Hook-Sprache wird nicht ausgeführt; grün |
| DB12 | debugger: fremde/alte/doppelte Commands; Controllerqueue und Dispose in prepared | Web und Protokollproben; keine zweite Fortsetzung; grün |
| DB13 | alle vier Funktions-/Daten-/Methoden-/Grundlagensuites: Original gegen instrumentierten Code | Completion, ASI, Shadowing, Schleifen, Returns, Seiteneffekte, Fehlerklassen; grün |
| DB14 | acceptance: tatsächlicher .js-Download exakt Original, erneutes Einlesen ohne Autostart | OPFS enthält Quelltext, keine neuen Debug-/Frame-/Snapshotfelder; grün |
| DB15 | debugger: echte VM ohne process/fetch/window/require/self; Compilerangriffe und bestehende CSP-Tests | Keine neuen Hostrechte; Quellpfadprüfung ergänzt dynamische Proben; grün |
| DB16 | bestehender Runtime-/Handle-Review plus echte langen Pausen, Frameauswahl und Fortsetzung | Genau eine gleichzeitig laufende evalCodeAsync-Auswertung, während Pause keine zweite; copied string vor await, keine VM-Evaluation durch Ansicht; grün |
| DB17 | debugger: Quelländerung stoppt; acceptance: gleicher Text unter anders.js stoppt und verwirft Zustand | Haltepunkte an neuer Revision neu gesetzt; grün |
| DB18 | debugger/functions: 390px/Maus/Tastatur; acceptance: echter Tab-Zoom 2,0 mit vollständigem Bedienpfad | Fokusrahmen, Haltepunkt, Weiter, Hinein/Über/Aus, Frameauswahl, aufklappbare Scopes/Stack, Stop-Hitprüfung; grün |
| DB19 | debugger/functions/data: echte Windows-Electron-Neustarts | Quellstand bleibt, VM/Zustand nicht. Kein Nachweis für alte verteilte Installer; grün |
| DB20 | acceptance: Netzaufzeichnung vor Laden/Start, Auswertung ab abgeschlossenem Laden; Quellpfad-/Paketregeln geprüft | Keine Debug-KI-/POST-/externen Requests im beobachteten frischen Profil. Keine realen privaten Unterlagen gelesen; Paketklassenprüfung ist kein neuer Installerbuild; grün |
| DB21 | gesamte Browser-/Electronregression, bestehende 167-ID-/Entwurfs-/Prüf-/Exportszenarien | 365 Fälle plus abschließende 13er-Suite grün; kein Debuggen als Kursprüferfolg |
| DB22 | debugger/functions/data/methods: Alias/constructor/berechnete Schlüssel/Helfer/Methodenauslese | Geschlossene Callee-/Bindungsprüfung plus VM-Datenreferenzen; grün |
| DB23 | folgende Budgetmatrix, echte Produktions-Compilergrenzen, reduzierte isolierte Runtimegrenzen, physische Engine/WASM-Proben | Grenzen/Überlagerungen einzeln dokumentiert, unabhängiger Abschlussreview bestanden; grün |

## Budget-Grenzmatrix

Parameterprüfungen umfassen **jede** Konfiguration aus `DEBUG_LIMITS`: erlaubter
Maximalwert, kleinerer Wert sofern möglich, 0/negative/nichtganzzahlige/NaN/
unendliche und erhöhte Werte. Diese Parameterprüfung allein ersetzt keine
Belastungsprobe. Für zeit- und nachrichtenabhängige Mechanismen werden außerdem
kleinere erlaubte Caps verwendet, um genau einen Mechanismus isoliert zu prüfen.
Die Produktionswerte werden dabei nicht erhöht.

| Budget | Nachweis unter / an / über der Grenze |
|---|---|
| Quelle 65.536 UTF-8-Bytes | acceptance: tatsächliche 65.535 / 65.536 / 65.537 Bytes, zusätzlich Mehrbytezeichen bei kleinerer UTF-16-Länge |
| 512 Zeilen | acceptance: 511 / 512 / 513; debugger ergänzt LF/CRLF/CR/U+2028/U+2029 |
| AST 8.192 Knoten | acceptance: tatsächliche 8.191 / 8.192 / 8.193, flaches Literal ohne vorzeitig bindenden Pointcap |
| AST-Tiefe 64 | acceptance: tatsächliche 63 / 64 / 65 |
| Generiert 262.144 Bytes | acceptance: frische Caller-Captures erzeugen große Ausgabe, auf 262.143 / 262.144 / 262.145 Bytes ergänzt; Original bleibt unter 64 KiB |
| 1.024 Positionen | acceptance: 1.023 / 1.024 / 1.025 inklusive Ende |
| Name 128 Einheiten | acceptance: 127 / 128 / 129 |
| 32 Scopes je Frame | acceptance: tatsächliche 31 / 32 / 33 mit Blocknesting |
| 32 aktive Frames | functions: isolierte Framecap-Proben; acceptance: tatsächliche 31 / 32 / 33, 33 abgewiesen |
| 64 Bindungen insgesamt | acceptance: 63 / 64 / 65; 65 wird sichtbar gekürzt, nicht als vollständiger Zustand ausgegeben |
| Einzelwert 80 Einheiten | acceptance: 79 / 80 / 81; Kürzung bei 81. valueChars=1 einschließlich TDZ geprüft. Feste Marker/numerische Anzeigen sind separat auf 32 begrenzt |
| 10.000 Kontrollpunkte | acceptance: isolierte Grenze 10 gegen 9/10/11, echte VM; aktives Zeitbudget kann bei großen Programmen früher greifen |
| 2.000 Pausen | acceptance: isolierte Grenze 3 gegen 2/3/4, echte Pausen. Produktions-Nachrichtengrenze kann vor 2.000 Pausen greifen |
| 4.096 Nachrichten | acceptance: exakter Hosttranskript-Bedarf ±1 in beiden Richtungen; debugger: echte reduzierte VM-Grenze; Erhöhungen abgewiesen |
| 2.097.152 Protokollbytes | acceptance: tatsächliche UTF-8-Transkriptgröße ±1; echte VM-Abweisung bei reduziertem Cap. Startartefakt ist separat source/generated-begrenzt |
| 32.768 Snapshotbytes | acceptance: tatsächlich serialisierter echter Zustand ±1. Produktions-Bytecap ist zusätzlicher Schutz hinter dem früheren Units-Cap |
| 8.192 Snapshotunits | acceptance: echter Zustand mit Sicherheitsreserve ±1; knapper Zustand gekürzt. Kein künstlicher erreichbarer 32-KiB-Maximalzustand behauptet |
| 80 Logzeilen | acceptance: 79 / 80 / 81, echter Worker |
| 32.000 Logzeichen | acceptance: 31 / 32 / 33 Zeilen zu je 1.000 Zeichen |
| 1.000 Zeichen je Logzeile | acceptance: 999 / 1.000 / 1.001; 1.001 auf 1.000 gekürzt |
| 20 Argumente | Compilerpositivliste plus native Methoden-/Consolefälle; 21 wird vorab abgewiesen |
| Queue 1 | debugger: viele Änderungen bei unbestätigtem Befehl; nur ein Inflight und ein zusammengefasster Pending-Wunsch. Leere Queue und ACK-Freigabe geprüft; kein erlaubter kleinerer positiver Cap |
| Vorbereitung 15.000 ms | Controllerphase separat mit zulässiger verkürzter Frist geprüft; kein alleiniger VM-Interrupt |
| VM-Start 10.000 ms | eigener externer Controllerpfad, reduzierte Frist und Worker-Ende |
| Aktive Zeit 1.000 ms | debugger: echter Interrupt; acceptance: echte mehrfache Pausen mit reduziertem Gesamtbudget plus unabhängig hängender Worker im tatsächlichen Browsercontroller |
| 500 ms Zustellspielraum | hängender Worker benutzt aktives Restbudget plus konfigurierten Spielraum; kein eigener zusätzlicher CPU-Freibetrag |
| Pause idle 300.000 ms | eigener Controllerpfad mit zulässiger reduzierter Frist; unbediente Sitzung beendet |
| Heapquote 16.777.216 Bytes | echte Asyncify-Runtime meldet malloc_limit; kleine Rechnung gelingt, gezielte Objektallokation endet in out of memory, frische Runtime gelingt |
| Interpreter-/Asyncify-Stack 65.536 Bytes | gesetzter variantspezifischer Importwert aus FE-040; echte Asyncify-Runtime: flache Rekursion gelingt, tiefe endet in stack overflow, frischer Lauf gelingt |
| WASM initial 256 / maximal 512 Seiten | instanziiertes Asyncify-Modul mit injizierter Memory: initial 16 MiB; Wachstum auf 511 und 512 Seiten, darüber RangeError |

Snapshotunits dominieren den Bytecap: JSON mit höchstens 8.192 UTF-16-Einheiten
erreicht regulär keine 32.768 UTF-8-Bytes (höchstens drei UTF-8-Bytes je
JSON-Codeeinheit, zusätzlich Reserve). Ebenso begrenzen Nachrichten und aktive
Zeit manche Programme früher als Pausen-/Kontrollpunktcaps. Diese Caps sind
Obergrenzen, keine Zusage, dass alle Maxima gleichzeitig ausnutzbar sind.

Heapquote und Stackwert sind Engine-Konfigurationen **einschließlich Verwaltung**,
keine erlaubte Nutzdatenmenge oder zugesicherte Anzahl Rekursionen. Die
Memory-Statistik ist eine Engine-Schätzung, keine harte Browserprozessmessung.
Physische WASM-Memory wird separat durch ihr Maximum begrenzt. Für TypeScript-
Compiler/V8-Prozess gibt es keinen hier behaupteten harten Gesamtspeicherdeckel;
Quelle/AST/Output und externe Fristen begrenzen dessen Aufgabe.

## Externer Abbruch und echter Zoom

Für den Watchdogtest wird ausschließlich im isolierten Testprofil die Antwort
für den Ausführungsworker ersetzt. Dieser **echte Hintergrundworker** meldet
`running` und läuft danach endlos, ohne QuickJS, Heapfehler oder eigene
Zeitprüfung. Der unveränderte Controller muss „Aktive Zeitgrenze erreicht.“
melden und physisch `terminate()` ausführen. Ein zweiter Lauf prüft manuellen
Stop; danach wird die Route entfernt und eine echte QuickJS-Sitzung erfolgreich
gestartet. Das ist ein gezielter Controllernachweis, kein modifizierter Appbuild.

Der Zoomtest startet Chromium mit einer temporären ausschließlich lokalen
Test-Erweiterung und setzt über `chrome.tabs.setZoom` den Faktor 2. Der Test
prüft den gemeldeten echten Zoomfaktor und die halbierte CSS-Viewportbreite.
Dies ist weder CSS-transform noch eine bloße höhere Pixeldichte. Die Erweiterung
hat keinen Bestandteil in App, Git-Quellbestand oder Installer; sie wird nur als
ignoriertes Testartefakt in einem eigenen Browserprofil erzeugt.

## Daten- und Verteilungsgrenzen

Quellpfade des Debuggers importieren keine KI-/RAG-/Kontozugänge. Die tatsächliche
Netzbeobachtung erfasst den Debugstart nach abgeschlossenem initialem App-Laden,
Dateiexport/-import und Folgeausführung. Sie beansprucht keine Aussage über
sämtlichen sonstigen Appverkehr oder andere Kontokonfigurationen.

Paketregeltests schließen private Dateiklassen und Entwicklerkonfiguration aus.
Zusätzlich geprüfter Git-Dateibestand: keine privaten PDFs, lokalen Zugangsdaten
oder `.env` versioniert; in `local-rag/` nur die neutrale öffentliche README.
Keine privaten Materialien, Inhalte oder Ableitungen für diese Abnahme gelesen.
Alte Installer behalten ihren dokumentierten älteren Stand; es wurde kein Paket
gebaut, veröffentlicht oder hochgeladen.

## Befund und Freigabe

Ein Grenzfehler wurde korrigiert: sehr kleine `valueChars` konnten den festen
TDZ-Text verwerfen. Der Validator begrenzt Stringwerte jetzt passend zur
Stringkürzung und feste Status-/Zahltexte separat. Neue Gegenprobe bei
valueChars=1 hält korrekt vor der Initialisierung und kürzt danach auf `a…`.

Regression, technische Nachprüfungen und unabhängiger Abschlussreview sind grün.
D2 ist für den ausdrücklich beschriebenen Sprachumfang und die lokale Windows-/
Chromium-/Electron-Matrix freigegeben; der Arbeitsbrief wird erst nach grünem
Archivcheck abgeschlossen. Praktische Sichtbarkeit/Bedienung ist bestätigt;
konkrete Ergebnisse sind getrennt automatisch geprüft. Callbacks, Closures,
Fehlerbehandlung, Module, DOM, Async und TypeScript/React bleiben eigene D3–D5-
Aufgaben mit neuen Abnahmefällen. Die älteren offenen FE-038-Praxistests werden
dadurch nicht nachträglich als erledigt erklärt.
