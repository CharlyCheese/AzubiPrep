# Quellcode-Debugger: Technikpilot und Funktions-/Schleifenausbau

Stand: 2026-11-01. Implementiert sind der D0/D1-Pilot und ein begrenzter
Funktions-/Schleifen-/Datenteil von D2 aus [der Planung](38-Quellcode-Debugger-Planung.md).
D2-Abnahme für den dokumentierten Sprach-/Plattformumfang bestanden, siehe
[Dokument 40](40-Debugger-Grundlagen-Abnahme.md); D3–D6 bleiben separat. Die feste Modellspur aus Kapitel 18
und die normale Kursausführung bleiben eigenständige Angebote.

## Bedienung und Sprachumfang

Der Einstieg „Debugger öffnen“ in der Frontend-Werkstatt führt auf die eigene
Seite `/frontendkurs/debugger`. Dort ist der Arbeitsbereich bereits geöffnet;
„Zurück zur Werkstatt“ führt zu derselben Lektion und Editoransicht zurück.
Einzelentwurf, Module und HTML verwenden weiterhin denselben lokalen Speicher.
Der gemeinsame Elternbereich bleibt beim internen Wechsel bestehen, sodass auch
laufende Autosaves erhalten bleiben. Verlassen beendet den Debuglauf physisch;
Rückkehr oder Reload startet keinen Code automatisch. Direkter Aufruf in Web
und Electron ist möglich. Die eigene Seite wird im selben Fenster geöffnet.
Der Editor verwendet denselben eigenen JavaScript-Entwurf wie der freie
JavaScript-Bereich. Erst „Debuggen starten“ erzeugt eine Sitzung. Vor der ersten
Anweisung hält das Programm an. „Einzelner Schritt“, „Weiter / bis zum nächsten Haltepunkt“,
Haltepunkte an ausführbaren Originalpositionen und „Debuggen stoppen“ bedienen diese Ausführung.
Ein kurzer Hinweis direkt bei den Knöpfen erklärt den automatischen ersten Halt:
Ohne eigene Haltepunkte führt Weiter bis zum Programmende.
Variablen zeigen den Zustand **vor** dem nächsten Schritt; nach Ende/Stop
kennzeichnet die Ansicht den zuletzt erfassten Zustand.

Unterstützt sind primitive Werte, `const`/`let`, lexikalische Variablen,
arithmetische/vergleichende/logische Ausdrücke, Zuweisungen, `if`/`else`,
Blöcke und direktes `console.log`. FE-041 ergänzt `for`, `for...of`, `while`,
`do...while`, unbeschriftetes `break`/`continue`, Arrayliterale sowie benannte
synchrone Funktionsdeklarationen auf Programmebene mit einfachen Parametern,
`return`, frühen Rückgaben und Rekursion. Arrays und Funktionen erscheinen
in Variablenansicht/Konsole ausschließlich als nicht inspizierte Platzhalter.
FE-043 ergänzt gewöhnliche Objektliterale mit Datenfeldern, auch Kurzschreibweise,
sowie eigene Datenzugriffe wie `zahlen[i]`, `zahlen.length`, `person.alter` und
verschachtelte Daten. Eigene Felder können zugewiesen und mit den unterstützten
Zuweisungs-/Inkrementoperatoren geändert werden. Strings erlauben Lesezugriffe
auf eigene Zeichenpositionen und ihre Länge. Schreibschutz/Arraylänge folgen
der nativen Semantik; primitive Schreibversuche beachten den Strict-Modus.
Arrayliterale können mit `for...of` oder über Länge/Index durchlaufen werden.
FE-044 ergänzt die direkten Array-Methoden `push`, `pop`, `shift`, `unshift`,
`slice`, `includes`, `indexOf` und `join`. Mutation und Rückgabewerte verwenden
die native QuickJS-Implementierung. `slice` liefert eine flache Kopie; `join`
erzeugt Text. Diese nativen Methoden setzen echte Arrays voraus. FE-046 ergänzt als ersten begrenzten D3-Teil synchrone
Array-Callbacks für `map`, `filter`, `forEach`, `some`, `every`, `find` und `reduce`:
direkt benannte Programmfunktionsdeklarationen sowie inline Pfeile oder anonyme
Function-Expressions mit einfachen Parametern und synchronen lexikalischen
Captures. Genaue Freigabe: [Dokument 41](41-Debugger-Callbacks.md).
FE-047 erlaubt zusätzlich gespeicherte Pfeile/anonyme Function-Expressions,
Aliasse eigener Funktionen, eigene Callbackparameter und zurückgegebene synchrone
Closures. Eigene Datenfelder dürfen solche Funktionen enthalten; direkte
Punktaufrufe eigener Felder funktionieren auch bei Namen wie `map` oder `push`.
Äußere Bindungen sind gekennzeichnet; beendete Erzeuger bleiben kein aktiver
Aufruf. Genaue Freigabe: [Dokument 42](42-Debugger-Funktionswerte-Closures.md).
FE-048 ergänzt synchrone Fehlerbehandlung (`throw`, `try`/`catch`/`finally`),
lexikalische Catchbindungen, eigene Catch-/Finallyeintrittspunkte und sieben
Standardfehler per engem `new`-Pfad. Echte Fehler bleiben opaque; nur `name` und
`message` sind ausdrücklich lesbar. Native Programmausnahmen sind fangbar,
private Sprach-/Ressourcenabbrüche bleiben endgültig, auch über Finally-return.
Details: [Dokument 43](43-Debugger-Fehlerbehandlung.md).
FE-050 ergänzt ein getrenntes Mehrdateiprojekt mit echten nativen ES-Modulen,
benannten/default Imports/Exports und dateigenauen Haltepunkten/Frames. Nur
flache relative Projektimporte und azyklische Graphen; 16 Dateien innerhalb
gemeinsamer Quell-/AST-/Code-/Ausführungsbudgets. Vorprüfung aller Dateien in
getrennten Prüfkontexten ohne Debug-/Ausgabefunktionen, danach einmalige tatsächliche Ausführung.
Details und QuickJS-Besonderheit: [Dokument 44](44-Debugger-Module.md).
FE-051 ergänzt Projektunterordner und relative Elternpfade innerhalb der
Projektwurzel, native Sammelimports und Weiterexporte. Private/ausbrechende
Pfade bleiben gesperrt; Ordnerimport filtert vor Inhaltslesen. Originalpositionen,
Bindingidentität und Anforderungsreihenfolge bleiben erhalten. Grenzen und
Kompatibilitätsnachweise: [Dokument 45](45-Debugger-Modulausbau.md).
Andere nicht freigegebene Methoden, beliebige geerbte Eigenschaften,
Funktionsreflexion/-konvertierung, benannte Function-Expressions,
verschachtelte Funktionsdeklarationen, Default-/Restparameter, allgemeine Konstruktoren, DOM, weitere Modulsyntax und
asynchroner Lerncode bleiben ausgeschlossen.
Statisch erkennbare nicht unterstützte Syntax wird vor der Ausführung als
„noch nicht unterstützt“ erklärt. Erst dynamisch erkennbare unerlaubte
Datenzugriffe oder Aufrufe beenden den Lauf an diesem Zugriff/Aufruf; vorherige
Anweisungen können bereits gelaufen sein. Syntaxfehler werden davon unterschieden.

Quelländerung, Schließen des Bereichs, Verlassen der Seite und Stop beenden
die bisherige Sitzung. Haltepunkte gehören zur aktuellen Quellrevision und
werden nach einer Änderung neu gesetzt. „Einzelner Schritt“ betritt aufgerufene
Funktionen. „Funktion überspringen“ hält am nächsten Punkt gleicher/geringerer
Aufruftiefe, „Funktion verlassen“ bei geringerer Tiefe oder am Ende. Explizite
Haltepunkte gewinnen auch innerhalb eines übersprungenen/verlassenen Aufrufs.
Die aufklappbare Aufrufkette erlaubt die passive Auswahl eines Caller-Frames;
Schritte steuern weiterhin den tatsächlich laufenden obersten Aufruf. Es gibt
keine Watches oder freie Auswertung in der Pause.

## Laufzeit und Semantik

Die TypeScript-5.9.3-Parserprüfung läuft in einem separaten, beendbaren Worker.
Sie führt den eingelesenen Quelltext nicht aus. Eine geschlossene AST- und
Bindungsprüfung verwirft unter anderem `eval`, freie globale
Namen, direkte `constructor`-/Prototypzugriffe, optionale Aufrufe sowie
Zugriffe auf interne Helfernamen. Aufrufe sind direktes `console.log`, eigene
instrumentierte Funktionen mit privater WeakSet-Provenienz oder die 15 explizit
freigegebenen nativen Arraymethoden. Variable/Parameter/Alias/Rückgabe dürfen eine
registrierte Funktion enthalten. Root-Funktionsdeklarationsbindings bleiben
nicht überschreibbar; eigene `let`-Funktionsvariablen können geändert werden.
Originalidentität, `typeof` und Truthiness bleiben erhalten. Ein privat gebundener
`Symbol.toPrimitive`-Guard verwirft Funktionskonvertierung zu Text/Zahl auch nach
Übergabe und in nativen Konvertierungen; generierter Quelltext wird nicht freigegeben.
Aktive Getter, Proxies und selbst definierte Serialisierer bleiben ausgeschlossen.

Explizite Datenzugriffe des Lernprogramms werden auf private VM-Referenzen
abgebildet. Basis und Schlüssel werden genau einmal ausgewertet; die VM selbst
führt Get/Put, RHS-Auswertung und Prefix-/Postfixoperatoren aus. Dadurch bleiben
auch eine pausierte RHS-Funktion und ein zwischenzeitlich neu zugewiesener
Basisname korrekt. Die private Referenz hält das tatsächlich ausgewertete Objekt.
Sie ist ausschließlich erzeugtem Code zugänglich.

Nur eigene Datendeskriptoren sind zugelassen. Fehlende Eigenschaften ergeben
`undefined`, geerbte Eigenschaften/Funktionen und Accessoren werden abgewiesen.
Ausnahme für echte Fehlerobjekte seit FE-048: ausschließlich `name`/`message`
werden per Datendeskriptor gelesen; Stack/andere Felder und Schreibzugriffe bleiben gesperrt.
Objekt-/Funktions-/Symbolwerte als berechnete Schlüssel bleiben ausgeschlossen;
primitive Schlüssel sind möglich. Gefährliche Prototyp-, Serializer- und interne
Hilfsschlüssel sind statisch und zusätzlich zur Laufzeit gesperrt, auch nach
Stringzusammensetzung. Methoden-/Getter-/Setter-/Spread- und berechnete
Objektliteraldefinitionen werden schon vor der Ausführung abgewiesen.
Eine erst zur Laufzeit erkennbare nicht unterstützte Datenreferenz beendet den
Lauf; sie ist keine Freigabe für allgemeine JavaScript-Propertyzugriffe.

Die Methodenpositivliste ist vom normalen Datenfeldlesen getrennt. Der private
Methodenhelfer prüft den Arrayempfänger und wählt die zuvor gebundene native
Methode **vor** der Argumentauswertung. Er hält diesen konkreten Empfänger fest,
auch wenn eine Argumentfunktion den ursprünglichen Variablennamen neu zuweist.
Argumente laufen links nach rechts genau einmal; eigene Funktionen darin bleiben
normal pausierbar. Es gibt keinen neuen logischen Nutzerframe für Bibliothekscode.
Berechnete Aufrufe, Auslesen/Aliasbildung nativer Methoden und Überschreiben einer
geerbten nativen Arraymethode bleiben ausgeschlossen. Registrierte eigene
Funktionsdatenfelder können gelesen/aliasiert und per Punktaufruf verwendet
werden. Der Helper wählt für echte Arrays ohne gleichnamiges eigenes Feld die
native Positivliste, sonst ein geprüftes eigenes Datenfeld. Callable-Prüfung
erfolgt nach Argumenten, Feldlesen vorher; null/undefined werfen vor Argumenten.
Es gibt weiterhin keine Source-Getter oder Prototyp-/Serializer-Hooks.

Benötigte Intrinsics einschließlich Fehlerklassen werden vor dem Lerncode privat
gebunden. Eigene Variablen/Funktionen namens `Object`, `String`, `Reflect`,
`Error` oder `TypeError` ersetzen diese Hilfsfunktionen nicht. Die automatische
Variablenansicht inspiziert weiterhin keine Objektfelder und ruft keine Hooks auf.
Auch `Array.isArray`, die freigegebenen Methoden und `Reflect.apply` sind privat
gebunden. Für native Methoden gelten dieselben Heap-/Zeit-/Ausgabegrenzen;
der externe Controller kann den gesamten Worker auch während eines langen
nativen Aufrufs beenden. Es werden dafür keine größeren Budgets eingeräumt.

Kontrollpunkte werden vor Anweisungen und am Ende eingefügt. Ihre Positionen
verweisen auf Originaldatei, Zeile und UTF-16-Spalte. LF, CRLF, CR sowie die
JavaScript-Zeilentrenner U+2028/U+2029 bleiben erhalten. Originaldirektiven und
Ausdrücke werden nicht durch selbst interpretierte JavaScript-Semantik ersetzt.
Die eingefügten Kontrollpunkte sind Variablendeklarationen mit leerer Completion;
dadurch bleibt auch der ursprüngliche Script-Ergebniswert erhalten.

Funktionsrahmen werden beim Eintritt angelegt und in einem internen `finally`
auch bei früher Rückgabe oder Laufzeitfehler entfernt. Rückgabeausdrücke werden
einmal ausgewertet. Reine Callsite-Metadaten aktualisieren den Caller nach
Argumentauswertung unmittelbar vor dem tatsächlichen Aufruf. Frische lexikalische
Lese-Closures erfassen dabei auch `for`-Headerbindungen in Bedingungen/Inkrementen;
verlassene Rumpfscopes erscheinen dadurch nicht als aktive Caller-Scopes.
Diese Metadatenpositionen erzeugen weder zusätzliche Pausen noch auswählbare
Haltepunkte. Verschachtelte Argumentaufrufe behalten ihre Auswertungsreihenfolge.

Schleifen halten vor dem Start, am Rumpfbeginn jeder tatsächlichen Iteration und
vor dessen Anweisungen. Bedingungen/Inkremente sind keine eigenen Haltepositionen.
Leere Arrays führen zu keinem Rumpfhalt; auch ein leerer Endlosschleifenrumpf
enthält einen begrenzten Kontrollpunkt. Die ursprüngliche Schleifenform samt
Iterationseinbindungen, `break` und `continue` bleibt bestehen.

Jede Sitzung bekommt eine frische Asyncify-QuickJS-Instanz in einem eigenen
Ausführungsworker. Ein `evalCodeAsync` wird tatsächlich im nativen Pauseaufruf
ausgesetzt und anschließend fortgesetzt. Es gibt weder Replay noch eine zweite
Evaluation während der Pause. Eine Lesepause verbraucht kein aktives Zeitbudget.
Parameterlose Lese-Closures innerhalb der VM erfassen primitive Bindungen,
Blockscope, Shadowing und den noch nicht initialisierten Zustand. Die Ansicht
liest ausschließlich eine begrenzte, bereits kopierte JSON-Nachricht. Borrowed
QuickJS-Handles werden nicht über das `await` der Pause gehalten.

## Bibliothek und Speicherbesonderheit

Zusätzlich freigegeben und ohne Installationsskripte installiert:
`@jitl/quickjs-singlefile-browser-release-asyncify@0.32.0`, MIT,
6.094.825 Bytes entpackt. Die vorhandene synchrone Kurslaufzeit bleibt bestehen.
Integrität laut Lockdatei:

```
sha512-DYMvxJv2hKYBgYsZV18QptZ32GHjhsowcUsvAtrGWtHfHGBPn/cG75WocLSaevGcUGiVsZvSRkgynvba8z26yA==
```

Das Paket nennt QuickJS `2025-09-13+f1139494`. Die tatsächliche WASM-Memory
wird explizit injiziert: 256 Seiten beim Start, höchstens 512 Seiten, jeweils
65.536 Bytes. Ein echter Lauf meldet 16.777.216 Bytes initial; Wachstum über
33.554.432 Bytes ist durch `WebAssembly.Memory.maximum` ausgeschlossen.
Das ist keine harte Grenze für den gesamten Browser-/Electron-Prozess oder
den V8-Speicher des TypeScript-Compilers.

`setMaxStackSize(65536)` setzt bei dieser konkreten Asyncify-Variante auch deren
globalen Stackwert. Eine gesonderte lokale Importmessung beobachtete den
Setter mit 65.536 und dem Fallback 81.920; die Paketimplementierung wählt den
gesetzten Wert. Dies ist ein variantspezifischer Nachweis, keine allgemeine
Garantie für andere QuickJS-Versionen.

Bei 0.32.0 wurde nach erfolgreichem Pause/Fortsetzen ein Fehler beim Freigeben
asynchroner Hostreferenzen durch `context.dispose()`/`runtime.dispose()`
reproduziert. Der Pilot verwendet deshalb **keine wiederverwendete VM** und
ruft diese beiden Freigaben nicht auf. Jede Instanz gehört vollständig einem
Worker. Der Controller beendet diesen bei Erfolg, Fehler, Stop und Wechsel
physisch mit `terminate()`; der Worker schließt sich am regulären Ende ebenfalls.
Dies umgeht den konkreten Freigabepfad, repariert aber nicht die Bibliothek.
Ein späteres Runtime-Upgrade braucht erneut einen Lebenszyklusnachweis.

## Verbindliche Budgets

Die Produktion verwendet `DEBUG_LIMITS` in `debugger-core.js`. Testaufrufe dürfen
bekannte ganzzahlige Grenzen nur verkleinern. Beide Seiten prüfen das Protokoll.

| Bereich | Grenze und Durchsetzung |
|---|---|
| Originalquelle | 65.536 UTF-8-Bytes, 512 Zeilen; vor AST-Verarbeitung |
| AST | 8.192 Knoten, Tiefe 64; iterative Vorprüfung |
| Instrumentierte Quelle | 262.144 UTF-8-Bytes |
| Positionen | 1.024 Positionen einschließlich Ende und reiner Callsite-Metadaten |
| Bezeichner | höchstens 128 UTF-16-Codeeinheiten je Name |
| Aufrufkette | höchstens 32 aktive Frames einschließlich Programm; Aufrufkennung höchstens 10.000 |
| Zustandsansicht | höchstens 32 Scopes je Frame, insgesamt 64 Bindungen über alle Frames; aktive/innere Scopes bevorzugt |
| Kontrollpunktbesuche | kumulativ 10.000 pro Sitzung |
| Tatsächliche Pausen | kumulativ 2.000 pro Sitzung |
| Nachrichten | kumulativ 4.096, beide Richtungen einschließlich Bestätigungen |
| Protokollmenge | kumulativ 2.097.152 UTF-8-Bytes, beide Richtungen; ohne initiales Startartefakt |
| Einzelzustand | 32.768 UTF-8-Bytes und konservativ 8.192 JSON-Codeeinheiten |
| Einzelwert | 80 Zeichen plus Kürzungskennzeichnung; keine tiefe Objektansicht |
| Konsole | 80 Zeilen, zusammen 32.000 Zeichen, 1.000 Zeichen je Zeile; höchstens 20 Argumente je Aufruf |
| Befehlswarteschlange | ein bestätigungspflichtiger laufender Befehl und ein zusammengefasster ausstehender Bedienwunsch |
| Vorbereitung | extern 15.000 ms bis zum beendeten Compilerworker |
| Runtime-Start | extern 10.000 ms |
| Aktive Gesamtausführung | kumulativ 1.000 ms; VM-Interrupt und externe Überwachung |
| Externe Überwachung | verbleibende aktive Zeit plus 500 ms Zustellspielraum; bei Fortsetzen ebenfalls begrenzt |
| Unbediente Pause | extern 300.000 ms, danach vollständiges Beenden |
| QuickJS-Heap | 16.777.216 Bytes durch Runtime-Limit |
| Interpreter-/Asyncify-Stack | gesetzte 65.536 Bytes, variantspezifisch wie oben geprüft |
| WASM-Memory | initial 16 MiB, hart höchstens 32 MiB |

Speichergrenzen der VM umfassen nicht alle JS-Hostdaten. Compiler und Runtime
sind zusätzlich von außen beendbar. Eine große Quelle wird schon vor dem
Compiler begrenzt. Zustände werden gekürzt oder der Lauf wird mit verständlichem
Fehler beendet; Grenzen sind keine Zusage, beliebig große Programme zu tragen.

Sitzung und Quellrevision besitzen eigene zufällige Kennungen. Ausgehende
Ereignisse und eingehende Befehle haben getrennte streng fortlaufende Nummern.
Fortsetzen bindet sich zusätzlich an die konkrete Pausenkennung. Veraltete,
fremde und doppelte Befehle setzen keine zweite Pause fort. Schnelle Änderungen
von Haltepunkten ersetzen den ausstehenden Wunsch; erst eine Bestätigung
erlaubt den nächsten Befehl. Es entsteht keine unbegrenzte Browsernachrichtenqueue.

## Daten und Rechte

Variablenwerte, Pausen, Laufzeitinstanz und Debugausgaben bleiben flüchtig und
lokal. Sie werden weder in Kursbackup/ZIP noch in KI-Kontext oder Telemetrie
aufgenommen. Der eigene Quelltext bleibt wie bisher im vorhandenen
JavaScript-Entwurf gespeichert. Beim Schließen werden auch die sichtbaren
Zustände gelöscht. Es entstehen keine neuen Zugriffe auf Netzwerk, Hostdateien,
Konten, App-Funktionen oder private Unterlagen. Private Quellen werden für diese
Arbeit weder gelesen noch verarbeitet.

Die Ausführung läuft innerhalb QuickJS, nicht über Host-`eval`/`Function` oder
ein privilegiertes Dokument. Die bestehende Worker-CSP erlaubt WASM nur für
den konkreten Ausführungsworker; der Compiler erhält diese Ausnahme nicht.

## Nachweise und verbleibende Abnahme

`e2e/tests/debugger.spec.js` prüft echte Pause/Fortsetzung mit eigenen Werten,
ausbleibende Ausgaben während Pause, genau einmalige Ausgabe danach,
Haltepunkte/Spalten, TDZ/Shadowing, primitive Sonderwerte, sichere Textdarstellung,
Sprach-/Umgehungsfälle, alte Befehle, Ressourcenabbrüche, externe Watchdogs,
Worker-Lebenszyklus, fehlende Speicherung von Debugzuständen und echte
Windows-Electron-Neustarts. Differentialfälle vergleichen Original und
instrumentierten Code einschließlich Script-Completion, Direktiven und ASI.
Grenzfälle prüfen unter/auf/über ausgewählten Compilerbudgets; reduzierte
Runtimebudgets erzwingen kontrollierte Abbrüche und einen frischen Folgelauf.
FE-045 ergänzt die DB23-Budget-/Grenzmatrix für den aktuellen Grundlagenumfang.
Spätere Sprach-/Runtime-Erweiterungen benötigen eigene zusätzliche Grenzfälle.

`e2e/tests/debugger-functions.spec.js` ergänzt echte Hinein-/Über-/Aus-Schritte,
Haltepunktvorrang auch in Rückgabeaufrufen, Frameauswahl/Parameter/TDZ,
Rekursion, wiederholte Iterationshalte, leere Arrays und aktuelle Caller-Scopes
bei Schleifenbedingungen/-inkrementen. Weitere Fälle prüfen vorzeitige Rückgabe,
Hoisting, ASI, Script-Completion, `break`/`continue`, verschachtelte Aufrufe,
negative Alias-/Introspektionswege, Aufruf-/Zeitgrenzen, Runtimefehler und
Windows-Electron-Neustart. Keine neue Bibliothek für FE-041.

`e2e/tests/debugger-data.spec.js` ergänzt echte Datenzugriffe und -änderungen,
Indexschleifen, Objektparameter, Pause/Fortsetzung innerhalb einer Feldzuweisung,
negative berechnete Schlüssel und einen Windows-Electron-Neustart. Differential-
fälle vergleichen Basis-/Key-/RHS-Reihenfolge, Referenzidentität bei Basisaustausch,
Short-Circuit, Prefix/Postfix, String-/Arraylänge und Fehlerklassen unter sloppy/
strict-Ausführung. Shadowing der internen Standardfunktionen ist separat geprüft.
FE-043 ergänzt auch Umbruch langer Aufrufnamen und eindeutiges Warten auf den
tatsächlichen Funktionshalt in der bestehenden Mobilprüfung.

`e2e/tests/debugger-arraymethods.spec.js` prüft die acht Methoden, ihre nativen
Rückgaben/Mutationen, Argumentfunktionen mit Pause/Fortsetzen und Namenswechsel,
shallow-copy-Identität, NaN-/Sparse-Array-Vergleiche, Konvertierungen, Zyklen,
Intrinsic-Shadowing und allgemeine Ressourcenbegrenzung mit frischem Folgelauf.
Der Überlasttest unterscheidet nicht zwischen Heap-/Stack- und Zeitabbruch und
ist deshalb kein separater Nachweis des externen Watchdogpfads. Statische und
dynamische Angriffs-/Abweisungsfälle sowie ein echter Windows-Electronfall ergänzen
die Differentialproben. Keine neuen Bibliotheken oder erweiterten Hostrechte.

Mobile Tastaturbedienung und Breite werden bei 390 Pixeln geprüft. FE-045 ergänzt
echten Browserzoom 200 %, vollständige Tastaturpfade und praktische Rückmeldung
zu Bedienung/Sichtbarkeit. Weitere Plattformen bleiben offen. Ausführliche Testergebnisse und der unabhängige Review
stehen in den Arbeitsbriefen [FE-040](agent-briefs/FE-040-debugger-technikpilot.md)
und [FE-041](agent-briefs/FE-041-debugger-funktionen-schleifen.md), die Bedienkorrektur
[FE-042](agent-briefs/FE-042-debugger-bedienhinweis.md) und der Datenausbau
[FE-043](agent-briefs/FE-043-debugger-datenstrukturen.md) sowie die Array-Methoden
[FE-044](agent-briefs/FE-044-debugger-arraymethoden.md).

Es wurde kein Installer gebaut, kein Commit/Push ausgeführt und nichts
veröffentlicht. Weitere Sprachmerkmale benötigen jeweils eigene Stufen mit
Semantik-, Sicherheits- und Lebenszyklusprüfung.

## Technische Referenzen

- [QuickJS-Emscripten](https://github.com/justjake/quickjs-emscripten)
- [Asyncify-Paket 0.32.0](https://www.npmjs.com/package/@jitl/quickjs-singlefile-browser-release-asyncify/v/0.32.0)
- [Emscripten Asyncify](https://emscripten.org/docs/porting/asyncify.html)

Versions- und Laufzeitangaben wurden zusätzlich an den lokal installierten
öffentlichen Paketdateien und synthetischen Tests geprüft.

FE-052 ergänzt den ersten D4-Pilot für begrenztes HTML und synchrone Klickhandler
mit echten Halten in derselben lebenden VM. Eigene Styles, Formulare, weitere
DOM-/Ereignis-APIs, Speicher und Async bleiben eigene Stufen.
→ [Umfang, Bedienung, Lebenszyklus und Grenzen](46-Debugger-DOM-Klicks.md).

FE-053 verlegt die Oberfläche auf eine eigene Seite. Ausführungslogik, Schutzgrenzen
und Datenformat bleiben erhalten. Nachweise im
[Arbeitsbrief](agent-briefs/FE-053-debugger-eigene-seite.md).

Die eigene Seite ist mit Navigations-, Speicher-, Worker-Ende-, Tastatur-/Mobil-
und Windows-Electron-Neustartproben abgenommen. Sechs agentseitige Bediengruppen
einschließlich laufendem angehaltenem Speichercommit und drei visuell geprüfte
Ansichten ergänzt; unabhängiger Review ohne offene Findings. SW v42. Die genauen
Gesamt-/Nachlaufergebnisse einschließlich korrigiertem Testaufbau stehen im FE-053-Brief.

FE-054 ergänzt eine optionale eigene CSS-Quelle mit begrenzter nativer Vorschau,
Import/Export und sichtbaren Klassen-/ID-Änderungen.
→ [CSS-Umfang und Abschirmung](47-Debugger-CSS.md).
