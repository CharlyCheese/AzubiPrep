# Freier Quellcode-Debugger: Planung und Abnahme

Stand: 01.11.2026. **Gesamtplanung mit begrenztem Grundlagen-Debugger.** Auftrag ist ein
Debugger für eigenen Übungscode: Haltepunkte setzen, die laufende Ausführung
anhalten, schrittweise fortsetzen und den aktuellen Zustand verstehen.
Die normale Kursausführung und die feste Modellspur bleiben verfügbar.

FE-040 ergänzt einen ersten echten Pause-/Fortsetzen-Piloten für primitive
Variablen, Ausdrücke, Bedingungen und Blöcke. FE-041 erweitert einen Teil von D2
um benannte Funktionen, Aufrufschritte und Schleifen. FE-043 ergänzt einfache
Arrays/Objektliterale und eigene Datenfeld-/Indexzugriffe. FE-044 ergänzt acht
direkte native Array-Methoden ohne Callbacks. FE-045 führt die DB01–DB23-Abnahme
für diesen begrenzten D2-Sprachumfang in Windows/Chromium/Electron erfolgreich zusammen;
Nachweise und Freigabestatus stehen in [Dokument 40](40-Debugger-Grundlagen-Abnahme.md).
FE-046 ergänzt den ersten begrenzten D3-Teil für synchrone Array-Callbacks,
inline Pfeile und anonyme Function-Expressions mit lexikalischen Captures.
→ [Umfang und Callback-Abnahme](41-Debugger-Callbacks.md)
FE-047 erweitert diesen Teil um gespeicherte Pfeile/anonyme Function-Expressions,
eigene Callbackparameter und zurückgegebene synchrone Closures mit lebenden
äußeren Bindungen. Funktionsreflexion und Konvertierung zu Text/Zahl bleiben
ausgeschlossen. → [Funktionswerte und Closures](42-Debugger-Funktionswerte-Closures.md)
FE-048 ergänzt synchrone Fehlerbehandlung mit throw/try/catch/finally,
Catchbindungen und eng freigegebenen Standardfehlern. Schutz-/Ressourcenabbrüche
bleiben endgültig. → [Fehlerbehandlung](43-Debugger-Fehlerbehandlung.md)
FE-050 ergänzt eine erste native Modulstufe mit flachen relativen Imports,
getrenntem Modulprojekt und originaler Datei-/Zeilen-/Spaltenzuordnung.
Zunächst azyklische Graphen, benannte/default Imports/Exports und gemeinsame
Budgets; weitere Modulsyntax separat. → [Module](44-Debugger-Module.md)
FE-051 erweitert die Modulstufe um wurzelgebundene Unterordner, Namespaceimports
und benannte/Star-/Namespaceweiterexporte mit korrekter Bindingherkunft und
ursprünglicher Auswertungsreihenfolge. → [Modulausbau](45-Debugger-Modulausbau.md)
Weitere D3–D6-Ziele und Plattformen benötigen eigene Abnahmen. Konkrete Grenzen, Bibliotheksbesonderheiten und
Nachweise: [Technikpilot](39-Debugger-Technikpilot.md).

## 1. Ausgangspunkt und Ziel

Kapitel 18 besitzt eine fest eingebaute Summenspur; sie führt keinen Editorcode
aus. Eigener Code läuft im Grundlagen-Worker oder in der erweiterten QuickJS-
Übungsansicht. Diese verwenden den installierten Sync-Build 0.32.0. Dessen
Interrupt-Handler dient dem Abbruch, nicht einem vorhandenen Quellcode-Debugger.
In der geprüften öffentlichen API ist kein fertiger Breakpoint-/Scope-Adapter
für diesen Aufbau vorhanden. Das ist keine Aussage, dass jede QuickJS-Variante
oder jeder mögliche eigene Engine-Build grundsätzlich ungeeignet wäre.

Ein echter Halt muss **dieselbe Ausführung** fortsetzen. Bereits ausgeführte
Anweisungen, Konsolenausgaben und Seiteneffekte dürfen dabei nicht erneut laufen.
Eine vollständig vorausberechnete Spur oder wiederholtes Starten bis zur nächsten
Zeile erfüllen dieses Ziel nicht und werden nicht als fertiger Debugger bezeichnet.

Ziel ist zunächst ein **Anweisungs-Debugger für unterstützte JS-Grundlagen**,
kein sofort vollständiger Ersatz für Browser-DevTools. „Frei“ bedeutet eigenen
Code statt eines fest vorgegebenen Beispiels; der freigegebene Sprachumfang
wird sichtbar ausgewiesen.

## 2. Bevorzugte Erprobung und Entscheidungstor

Bevorzugter Kandidat ist ein **eigener Debug-Worker mit QuickJS-Asyncify und
AST-basierten Kontrollpunkten**. Die vorhandene TypeScript-Parserbibliothek kann
für Analyse/Transformation erprobt werden. Lerncode bleibt innerhalb QuickJS;
Transformation findet ohne Ausführung des Lerncodes in einem Compiler-Worker
statt. Der Originaltext wird nicht verändert oder durch instrumentierte Dateien
in Sicherungen, Exporten, KI-Kontext oder normalen Prüfungen ersetzt.

Technischer Hintergrund: QuickJS-Emscripten beschreibt Asyncify-Aufrufe, die eine
VM-Auswertung während eines asynchronen Hostaufrufs aussetzen und anschließend
fortführen. Pro WASM-Modul ist nur ein solcher Vorgang gleichzeitig zulässig.
Das liefert noch keine Breakpoints, Quellpositionen oder Variablenansicht.
[Upstream-Dokumentation](https://github.com/justjake/quickjs-emscripten#asyncify).
[Emscripten-Grundlage und Reentrancy-Grenzen](https://emscripten.org/docs/porting/asyncify.html).

**Noch zu beweisender Architekturvorschlag:** Eingefügte Kontrollpunkte erfassen
begrenzte, passive Zustandsdaten innerhalb der VM. Eine eng begrenzte Brücke
meldet diese und wartet auf den passenden Fortsetzen-Befehl. Asyncify soll dabei
den tatsächlichen Ausführungszustand erhalten. Lexikalische Scope-/Frame-Erfassung
und semantisch korrekte AST-Transformation sind eigenständige Entwicklungsaufgaben,
keine bereits vorhandenen Engine-Funktionen.

Entscheidung vor einer produktiven Integration:

| Kandidat | Bewertung für die Planung |
|---|---|
| Bisherigen Sync-Abbruchhandler als Pause verwenden | Keine nachgewiesene Fortsetzung; dafür nicht einplanen. |
| Asyncify + Kontrollpunkte | Bevorzugter Machbarkeitspilot; tatsächliches Fortsetzen, Semantik und Grenzen zuerst beweisen. |
| Engine-Erweiterung mit echten Debug-Hooks | Gesonderte Alternative bei negativem Pilotbefund; eigene Prüfung von Pflege, Build, Lizenz und Sicherheit erforderlich. |
| Replay/Neustart oder feste Modellspur | Lernhilfe möglich, erfüllt die Debugger-Abnahme nicht. |
| Lerncode in App-Renderer/Node-vm ausführen oder Haupt-App-DevTools öffnen | Kein Ersatz für die notwendige Isolierung; nicht Bestandteil dieses Plans. |

Der installierte Sync-Build wird dafür nicht ersetzt. Eine zusätzliche konkrete
Asyncify-Variante samt Version, Paketgröße, WASM-/Stackbedarf und Lizenz muss
erst ausgewählt und geprüft werden. **Vor einer zusätzlichen Bibliothek ist die
Rücksprache aus AGENTS.md erforderlich.** Die bisherige Freigabe für TypeScript
und DOM-Bibliothek ist keine pauschale Freigabe weiterer Debuggerpakete. Dieser
Plan installiert nichts und erfordert dafür jetzt keine Bestätigung.

Scheitert der Machbarkeitsnachweis, wird der Befund dokumentiert und die
Architektur neu entschieden. Es erfolgt kein stiller Wechsel zu einer weniger
abgeschirmten Ausführung oder zu einer als Debugger bezeichneten Nachspielspur.

## 3. Erster praktischer Umfang

Nach erfolgreichem Technikpilot beginnt die Integration mit **einer selbst
bearbeiteten klassischen .js-Datei** in den Grundlagen aus Kapitel 14–17:

- `const`/`let`, primitive Werte, Rechenausdrücke, Zuweisungen und Konsolenausgabe;
- Bedingungen und Blöcke;
- `for`, `for...of`, `while`, `break` und `continue` im nachgewiesenen Umfang;
- benannte synchrone Funktionen mit einfachen Parametern und `return`;
- einfache Arrays/Objekte im Programm, zunächst ohne Aufklappen ihrer Inhalte
  im Variablenfenster.

Dieses Ziel ist erst freigegeben, wenn **jede** dieser Konstruktionen die
Semantiktests besteht; nicht bewiesene Teile werden nicht einfach mitbeworben.
Parser/Transformationsprüfung zeigt vor dem Start verständlich an, wenn ein
Programm außerhalb des freigegebenen Umfangs liegt. Ein gültiges, im Debugmodus
noch nicht unterstütztes Programm wird nicht als JavaScript-Syntaxfehler bezeichnet.
Die bisherige normale Ausführung kann weiterhin verwendet werden.

Spätere Stufen folgen separat: Callbacks/Pfeilfunktionen/Closures und strukturierte
Fehlerbehandlung; Mehrdateimodule; DOM-/Ereignisse und Übungsspeicher; Promise-/
Timer-/Abbruchabläufe; TypeScript und zuletzt React/JSX. Ein beliebiges Programm
aus allen 167 Lektionen im ersten Debuggerpilot ist keine Zusage.

Erste Version ohne freie Ausdrucksauswertung, Watches, Variablenänderung,
bedingte Haltepunkte, rückwärts laufenden Debugger oder automatische KI-Anfragen.
Dynamischer Code, `with`, Quellcode-Introspektion und noch nicht bewiesene
Sprachmerkmale gehören nicht zum zugesagten Pilotumfang. Eine reine Prüfung
offensichtlicher Syntaxformen ist dabei noch kein Beweis, dass jede indirekte
dynamische Nutzung erkannt oder korrekt instrumentiert wird; das ist Teil des
Machbarkeits- und Sicherheitsentscheids.

**Verbindliches Freigabetor:** Ein eigener Angriffskorpus deckt direkte und
indirekte `eval`-/Function-Wege, Aliasbildung, `constructor`-Ketten, berechnete
Eigenschaftsnamen sowie Aufruf/Manipulation der internen Kontrollpunkthelfer ab.
Diese Wege müssen entweder vor Ausführung verständlich abgewiesen oder
nachweislich korrekt instrumentiert und ausschließlich passiv beobachtet werden.
Kann ein Weg uninstrumentierten Code, gefälschte Halte-/Frameereignisse oder aktive
Inspektion einschleusen, ist der betroffene Umfang nicht freigegeben. Ein zufälliger
Helfername, nicht aufzählbare Eigenschaften oder eine syntaktische Sperrliste
allein gelten nicht als Nachweis. Bei nicht zuverlässig abgrenzbarem Umfang
scheitert die Architekturfreigabe, nicht nur der einzelne Test.

## 4. Zustände und Bedienung

Getrennte Zustände: **bereit → wird vorbereitet → läuft → pausiert → läuft**;
zusätzlich **beendet**, **gestoppt**, **Fehler/Grenze erreicht**. Pro Projektansicht
ist höchstens eine Debugsitzung aktiv. Kein automatischer Start beim Öffnen,
Import, Wiederherstellen, Setzen eines Haltepunkts oder Auswählen einer Variablen.

| Bedienung | Festgelegtes Verhalten |
|---|---|
| Debuggen starten | Aktuellen eigenen Quellstand kopieren, prüfen, frische VM starten. Optional erster Halt vor der ersten ausführbaren Anweisung. |
| Haltepunkt | Vor einer unterstützten Anweisung; gültige Position mit Datei, Zeile und Spalte. Leere/Kommentarzeilen erhalten keinen scheinbar wirksamen Halt. |
| Einzelner Schritt | Zur nächsten unterstützten Anweisungsposition; eigene aufgerufene Funktion kann betreten werden. |
| Funktion überspringen | Nächster Kontrollpunkt gleicher/geringerer Aufruftiefe; keine erneute Ausführung bereits erledigter Anweisungen. |
| Funktion verlassen | Nächster Kontrollpunkt einer geringeren Aufruftiefe oder Programmende. |
| Weiter | Bis zum nächsten tatsächlich getroffenen Haltepunkt, Fehler, Ende oder Ressourcengrenze. |
| Stop | Laufenden oder pausierten Worker extern beenden und Sitzungsressourcen verwerfen. |
| Neu starten | Frische Ausführung von vorn, ausdrücklich als Neustart bezeichnet. |

Explizite Haltepunkte haben Vorrang vor Überspringen/Verlassen; der Haltgrund wird
angezeigt. „Weiter“ darf denselben gerade verlassenen Kontrollpunkt nicht ohne
neue Ausführung sofort wieder treffen. Erreicht die Schleife dieselbe Position
in der nächsten Iteration, wird dagegen erneut angehalten.

Erster Pilot arbeitet auf **Anweisungsebene**, nicht jeder Teilauswertung eines
Ausdrucks. Ein Kontrollpunkt vor `for (...)` ist vor dem Schleifenstart;
weitere Kontrollpunkte im Rumpf zeigen die jeweiligen Iterationen. Daraus wird
kein nicht implementierter Halt vor jeder Bedingungs-/Inkrementauswertung
behauptet. Mehrere Anweisungen einer Zeile bleiben über Spalten unterscheidbar.
Unauflösbare Quellpositionen werden angezeigt statt still auf andere Stellen
verschoben. Ein `return`-Halt liegt vor der Auswertung seines Ausdrucks.

## 5. Zustand, Variablen und Quelltreue

Die pausierte Zeile und die sichtbaren Werte gehören zum Zeitpunkt **vor** der
nächsten markierten Anweisung. Aufrufkette und ausgewählter Scope werden getrennt
angezeigt. Berücksichtigt werden Sichtbarkeit, Parameter, Shadowing, Blockende,
`let`-Bindung pro Schleifeniteration und noch nicht initialisierte Bindungen.
Letztere müssen von einem tatsächlich vorhandenen Wert `undefined` unterscheidbar
sein. Funktionsausnahmen dürfen keine erfundenen weiter aktiven Frames hinterlassen.

Im ersten Pilot erscheinen primitive Werte, mit eindeutiger Darstellung von
`null`, `undefined`, `NaN`, `Infinity` und `-0`. Strings werden gekürzt und als
Text dargestellt. Funktionen und Objekte bleiben opaque Platzhalter; es werden
keine Eigenschaften automatisch durchlaufen. Kein Aufruf von Getter, `toJSON`,
`toString`, Proxy-Traps oder Benutzerfunktionen zur Verschönerung der Anzeige.
Auch Deskriptor-Abfragen können bei Proxys Code auslösen und sind deshalb keine
pauschal sichere Erweiterung. Sichere Objektinspektion benötigt eine eigene Stufe.
Das gilt ebenfalls für vom Lernprogramm veränderte Prototypen und Serializer:
Die Anzeige darf darüber keinen Nutzer-`toJSON`-Hook oder ersetzte Formatiermethode
auslösen. Im ersten Pilot werden nur nachgewiesene lexikalische Bindungen
erfasst, keine erratenen Eigenschaften des globalen Objekts.

Capture-Funktionen für lexikalische Bindungen und Frame-/Scope-Lebensdauer müssen
im Pilot nachgewiesen werden. Elternframes dürfen nicht als „aktuell“ bezeichnet
werden, wenn nur ein veralteter Zustand vorliegt. Während einer ausgesetzten
VM wird nicht zur Inspektion erneut in sie hineinausgewertet: Daten sind vor
dem Aussetzen zu erfassen oder klar als nicht verfügbar zu markieren.

Originaltext/Dateiname/Quellrevision werden von generierten Kontrollpunkten und
internen Helfern getrennt. Umbenennungen, Umformatierung oder Änderung während
einer Sitzung beenden deren Gültigkeit; ein neuer Start verwendet den neuen Stand.
Alte Haltepunkte werden ungültig markiert, nicht still auf andere Anweisungen
gelegt. Sichtbarer Code, Fehlerort und Haltepunkt müssen zur gleichen Revision
gehören. Normales Exportieren liefert weiter die Originaldateien.

## 6. Abschirmung und Ressourcen

Lerncode einschließlich Capture und Formatierung bleibt in QuickJS. Zwischen
Debug-Worker und Oberfläche werden ausschließlich eng begrenzte primitive
Nachrichten beziehungsweise streng geprüfte Zustandsdaten übertragen. Keine
Gastobjekte, Funktionen oder VM-Handles an den App-Renderer weiterreichen.
Die Brücke eröffnet nur Debug-Bedienung; sie erhält keine Datei-, Netzwerk-,
Konten-, RAG-, KI-, Shell-, Electron- oder allgemeinen App-Funktionen.

Worker-Protokoll mit Sitzungs-ID, Quellrevision und monotoner Nachrichtenfolge;
Befehle nur für den passenden Zustand und die aktuelle Pause. Doppelte, alte,
fremde oder ungeordnete Fortsetzen-Befehle dürfen keine zweite Ausführung starten.
Gastdaten dürfen Nachrichtentyp und Sitzung nicht ersetzen. Hostschema und
Größengrenzen bleiben unabhängig von veränderbaren Gast-Prototypen.

Genau eine aktive Asyncify-Aussetzung pro eigenem WASM-Modul. Keine VM-Evaluation,
weiteren VM-Jobs, Modellereignisse oder zweite Aussetzung während einer Pause.
Borrowed Handles dürfen nicht unkontrolliert über `await` leben. Lokale Kopie
begrenzter Strings vor dem Warten, eindeutig geregeltes Ownership und Aufräumen
beim Fortsetzen/Abbruch sind Nachweispflichten des Technikpiloten.

Vorgeschlagene Pilotbudgets, vor Freigabe zu messen:

- vorhandene 64-KiB-Grenze der ausgewählten JS-Datei; begrenzte AST-/Ausgabegröße;
- unveränderte 16-MiB-JS-Heap-/64-KiB-Stackgrenze der Grundlagen als Ausgangspunkt;
  zusätzlicher WASM-/Asyncify-Stackbedarf wird separat gemessen und begrenzt;
- kumulativ höchstens eine Sekunde aktive Ausführungszeit; Erfassung und Debug-
  Verwaltungsarbeit zählen dazu. Benutzerlesezeit in Pause zählt nicht dazu;
- kein Zurücksetzen des aktiven Budgets bei jedem Schritt. Externer Watchdog
  bleibt für Start und laufende Abschnitte aktiv; Stop bleibt immer erreichbar;
- maximal fünf Minuten unbediente Pause, danach Sitzungsende mit Erklärung;
- höchstens 32 sichtbare Frames, 64 Bindungen je gewähltem Scope, 32 KiB pro
  Zustandsnachricht und begrenzte Schritt-/Nachrichtenanzahl. Kürzungen sichtbar;
- höchstens eine VM-Sitzung; beendete/gestoppte Worker nicht zur Fortsetzung
  wiederverwenden. Keine unbeschränkte Sammlung historischer Snapshots.

D0 muss vor D1 eine versionierte **Budgettabelle mit konkreten Zahlen** für
alle Grenzen festschreiben: Quellbytes, AST-Knoten/-Tiefe, generierte Bytes,
Kontrollpunkttreffer, Pausenereignisse, Protokollnachrichten/-Gesamtbytes,
Warteschlangentiefe, Vorbereitung/VM-Start in Millisekunden, aktive Laufzeit,
Pause-Idlezeit, JS-/Asyncify-Stack und gemessener zusätzlicher WASM-Bedarf.
Für Vorbereitung/Start sind externe Worker-Fristen erforderlich; ein interner
QuickJS-Interrupt allein genügt dort nicht. Die noch variantenabhängigen Zahlen
werden anhand des D0-Kandidaten gewählt, nicht als bereits getestete Werte erfunden.
Für den Compiler-Worker kann ohne entsprechenden Plattformnachweis keine harte
prozessweite Speichergrenze behauptet werden; Eingabe-/AST-Caps und externer
Abbruch werden davon getrennt dokumentiert.

Ohne vollständige numerische Tabelle keine D1-/D2-Freigabe. Jeder anwendbare Cap
wird mit unterhalb/auf/oberhalb der Grenze liegenden Fällen geprüft; für Fristen
mit Toleranz und extern gemessener Reaktionszeit. Überschreitung muss verständlich
beenden, Speicher freigeben und einen frischen Lauf ermöglichen. Das schließt
Compiler-/Vorbereitungsüberlastung ein, bevor Lerncode überhaupt ausgeführt wird.

Unterstützt ein Kandidat diese Grenzen nicht, sind Messung und neue Entscheidung
nötig; die Limits werden nicht still erhöht. Größere DOM-/React-Budgets bleiben
bis zu ihrer eigenen Debuggerabnahme getrennt. WASM-CSP-Ausnahmen nur für den
tatsächlich ausgelieferten Debug-Worker; keine globale `unsafe-eval`-Freigabe,
kein offener Debug-Port und kein SharedArrayBuffer-/Headerumbau ohne eigenen Bedarf.

## 7. Semantik als eigene Freigabe

AST-Kontrollpunkte sind **kein bloßes Einfügen von Textzeilen**. Vor Freigabe wird
Originalcode mit Debugfassung in frischen VMs verglichen, jeweils ohne Beobachten
und mit Halten/Schritten: gleiche Rückgaben, Ausgabetypen, Ausgabenreihenfolge,
Fehler und nachgewiesene Datenänderungen. Ein Ausdruck mit Seiteneffekt darf
genau einmal wirken. Hilfsnamen, Scope-Veränderungen oder umgebaute Returns dürfen
das Programm nicht unbemerkt ändern.

Pflichtfälle: ASI/Mehrzeilenanweisungen, Kommentare/Strings mit Codezeichen,
Shadowing und TDZ, Schleifengrenzen/leere Schleifen, `break`/`continue`, frühe
Rückgabe, verschachtelte Aufrufe/Rekursion und ein Seiteneffekt in einer Bedingung.
Direktiven wie `"use strict"` und relevante Sprachsemantik müssen erhalten bleiben.
Für Erweiterungen kommen unter anderem Closures/Callback-Rückgaben, Kurzschluss,
Destrukturierung, `this`/`arguments`, Labels und `try/finally` hinzu. Bis zum
Nachweis dieser Konstruktionen dürfen sie nicht zum zugesagten Debugumfang zählen.

Falls die Instrumentierung diese Bedingungen nicht verlässlich erfüllt, wird
sie nicht als allgemeiner Debugger ausgeliefert. Ein Engine-Hook-Ansatz wird dann
gesondert untersucht; UI-Komfort hat keinen Vorrang vor Quelltreue und Abschirmung.

## 8. Umsetzungsstufen

| Stufe | Liefergegenstand | Freigabe zum nächsten Schritt |
|---|---|---|
| D0 – Technikentscheid | Varianten-/API-/Lizenz-/Größenvergleich, konkrete Paketentscheidung, eigener Implementierungsbrief und vollständige numerische Budgettabelle | Abhängigkeit bei Bedarf besprochen; Pilotarchitektur und externe Vorbereitungs-/Startfristen verbindlich festgelegt. |
| D1 – Vertikaler Machbarkeitspilot | Ein eigenes kurzes Programm in eigener VM tatsächlich anhalten, später fortsetzen, Stop und passive Werte zeigen | Gleiche Ausführung ohne Replay; UI bleibt bedienbar; kein Reentrancy-/Handle-/Budgetfehler; unabhängiger Review. |
| D2 – Grundlagenpilot | Freigegebener Teil von Kapitel 14–17, Haltepunkte, Schritt hinein/über/aus, Scopes und eigene Aufrufe | Vollständige untenstehende Pilotmatrix und Semantikvergleiche; Web und Windows-Electron; praktische Abnahme. |
| D3 – Sprache und Mehrdateien | Callbacks/Closures/Fehler, dann Module und stabile Originalpositionen | Eigene Erweiterungsmatrix je Gruppe; keine stillen Scope-/Quelltextänderungen. |
| D4 – Interaktive Projekte | DOM-/Ereignis-/Speicheradapter, danach kontrolliertes Async mit Pause-/Warteschlangenregel | Keine Modelljobs während Pause; keine doppelten Events/Schreibvorgänge, gültiger Abbruch und veraltete Antworten. |
| D5 – TypeScript/React | Verkettete Quellzuordnung bis zur Original-TS-/TSX-Datei, Nutzerframes getrennt von Bibliotheken | Richtige Datei/Zeile/Spalte/Revision, Effekte/Handler/Neurendern nachgewiesen. |
| D6 – Lernhilfe/Verteilung | Optionaler KI-Kontext und neue Installationspakete als eigene Aufgaben | Datenschutz und tatsächlicher Paketstand separat geprüft; keine automatische Freigabe durch diesen Plan. |

Die offenen praktischen Kurstests aus FE-038 werden durch diese Planung nicht
als erledigt markiert. Sie können vor der produktiven Debuggerintegration separat
abgeschlossen werden. Reine Technikpiloten ersetzen keine Nutzerabnahme.

## 9. Verbindliche Pilot-Abnahmematrix

| ID | Prüfung | Erwartung/Nachweis |
|---|---|---|
| DB01 | Eigenen Code ändern und debuggen | Neue Berechnung/Zahlen/Texte ändern den beobachteten Zustand; kein festes Beispiel und keine alte Spur. |
| DB02 | Halt vor `let alter = 15` | `alter` in dieser aktiven Lexikalumgebung als noch nicht initialisiert; nach Schritt 15. Ein späteres `let leer;` ergibt danach echtes undefined. |
| DB03 | Ausgabe nach Haltepunkt | Vor dem Fortsetzen fehlt die spätere Ausgabe; Lesen/Warten erzeugt keine neue Ausgabe. Fortsetzen erzeugt sie genau einmal. |
| DB04 | Schleife mit leerer und dreielementiger Liste | Halt im Rumpf erfolgt null beziehungsweise dreimal; richtige Iterationswerte. Schleifenzeile und Körperpositionen wie in Abschnitt 4 erklärt. |
| DB05 | Eigene Funktion mit return | Hinein zeigt Parameter/inneren Zustand; Überspringen/Verlassen erreicht richtigen Aufrufer. return-Ausdruck wird nicht doppelt ausgewertet. |
| DB06 | Äußeres/inneres gleichnamiges let | Richtiger ausgewählter Scope, nach Blockende kein innerer Wert als äußeren anzeigen. |
| DB07 | Haltepunkt im übersprungenen Aufruf | Expliziter Halt gewinnt; Stopgrund und Aufrufkette stimmen. Weiter darf nicht ohne Fortschritt am selben Ereignis hängen bleiben. |
| DB08 | Syntaxfehler und gültiges, nicht unterstütztes JS | Unterschiedliche verständliche Rückmeldungen vor Ausführung; Originaldatei bleibt unverändert. |
| DB09 | Endlosschleife/Endlosrekursion und Pause | Externer Stop bleibt wirksam; aktives Budget stoppt ungebremste Ausführung. Lesepause läuft nicht nach einer Sekunde ab; Idlegrenze greift. |
| DB10 | Viele kleine Schritte | Kumulatives Zeit-/Nachrichten-/Schrittbudget wird nicht jeweils erneuert; kein dauerhaftes Anwachsen alter Snapshots/Worker. |
| DB11 | Getter/Proxy/toJSON/toString/HTML-artiger Wert | Variablenansicht führt keinen Beobachtungscode aus und erzeugt keine aktiven App-Elemente. Anzeigezugriff zählt nicht als Programmaktion. |
| DB12 | Fremder/veralteter/doppelter Resume | Wird ignoriert/abgewiesen, nicht erneut ausgeführt. Nach Stop/Projekt-/Quellwechsel bleibt alte Sitzung tot. |
| DB13 | Original gegen Debugfassung | Differentialfälle aus Abschnitt 7 stimmen; AST erzeugt keine zusätzlichen fachlichen Ausgaben/Seiteneffekte. |
| DB14 | Export und erneutes Öffnen | Originaldateien unverändert, kein automatischer Debugstart; keine Variablen-/Stackdaten im Kursbackup. |
| DB15 | Host-/Netz-/App-/Dateizugriff | Abgewiesen wie in bisherigen Laufzeiten; keine lokalen Dienste, Konten, privaten Unterlagen oder neuen Fenster durch Debugbrücke. |
| DB16 | Beobachten während VM-Pause | Keine zweite VM-Evaluation oder Asyncify-Aussetzung; keine Borrowed-Handle-Nutzung nach ihrem zulässigen Lebenszyklus. |
| DB17 | Änderung/Umformatierung/Dateiwechsel | Quellrevision und Haltepunkte werden ungültig/neu gesetzt; kein Halt auf einer scheinbar passenden fremden Zeile. |
| DB18 | Tastatur, Mobilbreite, 200 % Zoom | Haltepunkte und alle Aktionen ohne Maus; Fokus sichtbar; Scope/Stack aufklappbar, kein verdeckter Stop; Status zusätzlich zu Farbe. |
| DB19 | Windows-Electron nach vollständigem Neustart | Ausgewählter eigener Code korrekt; kein Weiterleben alter VM, kein Port-/Profil-/Rechteleck. |
| DB20 | KI/Diagnose/Privatdaten | Debuggen sendet keine Quell-/Wert-/Stackdaten an KI oder Telemetrie. Keine privaten PDFs/Indizes/Kontodaten im Paket oder Protokoll. |
| DB21 | Bestehender Kurs | Bisherige Prüfungen, Exporte, 167 Entwürfe und normale Ausführung unverändert; Debuggen vergibt keinen Quiz-/Kursprüferfolg. |
| DB22 | Indirekte dynamische Ausführung/interne Helfer | Alias-/constructor-/berechnete Property-Wege und Helfermanipulation sind vor Ausführung abgewiesen oder nachweislich korrekt behandelt. Kein uninstrumentierter Lauf, gefälschter Halt/Frame oder aktiver Beobachtungscode; andernfalls keine Architekturfreigabe. |
| DB23 | Vollständige D0-Budgettabelle | Für jede Grenze konkrete Zahl, Messverfahren und Grenzfalltest vorhanden; Compiler-/VM-Start auch von außen abbrechbar. Unter-/Grenz-/Überlastfälle und frischer Lauf danach bestehen. |

Testprogramme enthalten ausschließlich synthetische öffentliche Daten. Zu jedem
Kriterium werden tatsächlicher Test, Plattform, Ergebnis und Grenze festgehalten;
„geplant“ ist kein bestandener Test. Differential-/Sicherheitsfälle und bestehende
betroffene Regressionen werden automatisiert, Verständlichkeit zusätzlich durch
eine kurze praktische Runde abgenommen.

## 10. Erstes praktisches Abnahmeszenario

Ein eigenes Programm mit `let alter = 15`, einem `if` und einer Ausgabe anlegen.
Haltepunkt vor der Entscheidung setzen, Werte vorhersagen, anhalten und einen
Schritt weitergehen. Anschließend die Zahl ändern und erneut debuggen. Eine
kleine Summenfunktion ergänzt Hinein/Überspringen/Verlassen. Eine falsche
Schleifengrenze wird mit [] und [2,3] selbst gefunden, korrigiert und normal geprüft.
Zuletzt pausiert stoppen, Projekt wechseln und bestätigen, dass nichts weiterläuft.
Die Aufgabe verwendet eigenen Editorcode, nicht die vorhandene feste Modellspur.

## 11. Datenhaltung und optionale KI

Variablenwerte, Aufrufketten und Pausenzustände bleiben im ersten Pilot flüchtig
und lokal. Kein Mitspeichern in JSON-/ZIP-Exporten, Prüfberichten, Browserlogs,
Crashuploads oder KI-Kontext. Falls Haltepunkte später gespeichert werden,
höchstens Projektdatei, Quellrevision und Position; keine Werte oder Handles.

Eine spätere Aktion „Diesen Halt erklären“ benötigt einen separaten Plan für
Vorschau, bewusste Auswahl und Anbieter-/Privatquellenregeln. Dieser Auftrag
erweitert die vorhandenen freiwilligen Codeausschnitte nicht um Debugzustände.
Private Materialien und abgeleitete Daten bleiben ausschließlich lokal; der
Debugger erhält keinen Zugriff auf ihre Ablage.

## Quellen und Einordnung

- Lokal geprüft: Frontendpaket und öffentliche Typen von `quickjs-emscripten-core`
  0.32.0, aktuelle Worker/Controller, Kapitel-18-Spur und FE-038.
- [QuickJS-Emscripten](https://github.com/justjake/quickjs-emscripten): Asyncify-Konzept
  und Einschränkung gleichzeitig ausgesetzter Aufrufe; nicht als fertige Debug-API gelesen.
- [Emscripten Asyncify](https://emscripten.org/docs/porting/asyncify.html): technische
  Grundlage und Reentrancy-Risiko, keine Freigabe des vorgeschlagenen Adapters.
- [TypeScript Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API):
  AST-Grundlage; das Projekt verwendet 5.9.3. Die Quelle unterscheidet inzwischen
  die spätere neue Compiler-API, deshalb keine ungeprüfte Versionsmigration.

Umsetzung erfolgt in eigenen Implementierungsbriefs. Die bisherigen
313 Browser-/Electron- und 210 Backendtests sind Nachweise des bisherigen Kurses,
keine bereits durchgeführten Debuggertests.

FE-052 ergänzt den ersten D4-Pilot für begrenztes HTML und synchrone Klickhandler
mit echten Halten in derselben lebenden VM. Eigene Styles, Formulare, weitere
DOM-/Ereignis-APIs, Speicher und Async bleiben eigene Stufen.
→ [Umfang, Bedienung, Lebenszyklus und Grenzen](46-Debugger-DOM-Klicks.md).

FE-054 ergänzt in D4 die erste eigene CSS-Gestaltung im skriptlosen Vorschaurahmen.
VM-/Lerncode-/Klickrechte bleiben unverändert; weitere Stylesheets, Formulare und
zusätzliche DOM-/CSS-APIs benötigen eigene Stufen.
→ [CSS-Pilot](47-Debugger-CSS.md).
