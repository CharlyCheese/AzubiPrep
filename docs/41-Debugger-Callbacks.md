# Debugger: synchrone Array-Callbacks (FE-046)

Stand: 2026-11-01. Erster begrenzter D3-Teil nach der
[Grundlagen-Abnahme](40-Debugger-Grundlagen-Abnahme.md). Ziel sind echte
Haltepunkte und Funktionsschritte innerhalb synchroner Array-Rückrufe.
Dies ist keine Freigabe sämtlicher Funktionen/Closures oder späterer D3–D6-Ziele.

**Nachfolgender Stand:** FE-047 erweitert die unten dokumentierte ursprüngliche
FE-046-Abnahme um gespeicherte Funktionen, eigene Callbackparameter und
zurückgegebene synchrone Closures. Die damaligen Ausschlüsse freier Funktionswerte
und eigener HOFs gelten damit nicht mehr; siehe
[aktuellen Umfang](42-Debugger-Funktionswerte-Closures.md). Die technischen
Angaben zu Callbackslot und Aliasabwehr unten beschreiben den historischen
FE-046-Stand, nicht das heutige Provenienz-/Konvertierungsgate.

## Unterstützter Umfang

Direkte Aufrufe auf echten Arrays: `map`, `filter`, `forEach`, `some`, `every`,
`find` und `reduce`. Als erstes Argument sind erlaubt:

- ein direkt benannter, auf Programmebene deklarierter Funktionsname;
- eine inline Pfeilfunktion mit einfachem Ausdruck oder Block und `return`;
- ein inline anonymer synchroner `function`-Ausdruck.

Parameter sind einfache Namen, ohne Destrukturierung, Default- oder Restwerte.
Synchrone Rückrufe dürfen die schon freigegebenen Ausdrücke/Anweisungen nutzen
und auf lebende äußere lexikalische Bindungen zugreifen. Auch verschachtelte
Array-Callbacks und Aufrufe anderer benannter Programmfunktionen sind möglich.
Die bisherigen acht Methoden ohne Callback und Datenzugriffe bleiben erhalten.

```js
const zahlen = [1, 2, 3];
let faktor = 2;
const doppelt = zahlen.map((zahl, index) => {
  const wert = zahl * faktor;
  console.log(index, wert);
  return wert;
});
const auswahl = doppelt.filter(wert => wert >= 4);
console.log(auswahl.join(","));
```

Erwartete Ausgabe: `0 2`, `1 4`, `2 6` und `4,6`, jeweils eine Zeile.
Ein Haltepunkt bei `const wert` trifft drei unterschiedliche Aufrufe mit `zahl`
1/2/3 und `index` 0/1/2. Vor dieser Anweisung ist `wert` noch nicht initialisiert.

Es bleiben insbesondere ausgeschlossen: `const fn = n => n * 2`, frei gespeicherte
oder weitergereichte Funktionswerte, Methodenaliase, eigene höherwertige
Funktionen mit Callbackparametern, benannte Function-Expressions, verschachtelte
Funktionsdeklarationen, `this`, `arguments`, async/await und freie Fehlerbehandlung.
Diese Formen sind gültiges JavaScript, werden aber im aktuellen Debugger vor
der Ausführung als noch nicht unterstützt erklärt. Der normale freie
JavaScript-Bereich ist ein gesonderter Ausführungsweg.

## Ausführung und Anzeige

Jeder Callback erhält einen eigenen logischen Aufruf mit eigener Kennung,
Parametern und Quellposition. Inline-Rückrufe heißen in der Ansicht beispielsweise
„Callback 3:27“. Wiederholte Elementaufrufe haben dieselbe Definition/Position,
aber unterschiedliche Aufrufkennungen und echte aktuelle Parameter.

Hineinschritt betritt den Rückruf. Überspringen überspringt dessen tiefere Punkte.
Verlassen hält am nächsten Punkt geringerer Aufruftiefe oder am Ende; mehrere
nachfolgende Geschwistercallbacks können deshalb ohne neuen Halt durchlaufen.
Explizite Haltepunkte gewinnen weiterhin, auch im nächsten Elementcallback.
Native Bibliotheksschritte werden nicht als erfundene Nutzerframes angezeigt.

Pausieren setzt dieselbe `evalCodeAsync`-Ausführung einschließlich des nativen
Arraymethodenaufrufs aus. Erst Fortsetzen führt den Callback und die nächste
Iteration weiter. Keine vorausberechnete Spur, kein Replay und keine zweite
gleichzeitige Auswertung oder Modelljobs während Pause. Arrays/Objekte bleiben
in der Variablenansicht opaque; es gibt weiterhin keine Watches oder aktive
Objektinspektion.

## Instrumentierung und geschlossene Funktionswege

Die AST-Prüfung erlaubt Funktionswerte ausschließlich im expliziten ersten
Callbackargument. Anderenorts bleiben sie gesperrt, damit weder Aliasaufrufe
noch implizite Stringkonvertierung instrumentierten Funktionsquelltext freigeben.
Ein gleichnamiger Parameter/Variablenwert ist kein direkt erlaubter Callbackname.
Callbackrümpfe werden vollständig geprüft, bevor ein Worker Lerncode ausführt.

Programmfunktionsdeklarationen werden vorab im privaten VM-WeakSet registriert.
Die Registrierung verwendet Variablendeklarationen mit leerer Script-Completion;
Direktiven und der ursprüngliche Script-Ergebniswert bleiben erhalten.
Inline-Rückrufe werden beim Erzeugen registriert. Der private Methodenhelfer
akzeptiert nur diese instrumentierten Funktionen; unbekannte Funktionen werden
vor der nativen Invocation verworfen. Sourcecode kann weder Registrierung noch
interne Helfer direkt ansprechen.

Methodenauswahl und konkreter Arrayempfänger werden vor den Argumenten festgelegt.
Nach Argumentauswertung aktualisiert der Helper die Callerposition und aktuellen
Scopes unmittelbar vor `Reflect.apply` der privat gebundenen nativen Methode.
Damit stimmen insbesondere Callbackaufrufe in wiederholten Schleifenbedingungen
oder -inkrementen; alte Rumpfvariablen werden nicht als noch aktive Caller-Scopes
ausgegeben.

Eine private lexikalische Leserfabrik bindet die äußeren Lese-Closures am
Erzeugungsort des Inline-Callbacks. Das umfasst `for`-Headerbindungen, deren
sonstiger Debug-Leser erst im Rumpf angelegt wird. Die Originalvariablen behalten
ihre JavaScript-Bindungen und ihre TDZ; die Anzeige liest keine Ersatzwerte.
Das unterstützt synchrone Captures, gibt aber noch keine gespeicherten,
nach Rückkehr des Erzeugers frei aufrufbaren Closures frei.

Parameter-/Blockscopes, Rückgaben, `try/finally` für interne Frame-Lebensdauer
und kompakte Pfeilrückgaben folgen dem schon geprüften Funktionspfad.
Die zusätzliche Leserfabrik trägt nur interne Namen, die im Lerncode gesperrt
sind. `this`/`arguments`/Funktionsintrospektion sind deshalb nicht stillschweigend
als durch diese Transformation freigegebene Sprache anzusehen.

## Grenzen und Datenhaltung

Die Grenzen aus [Dokument 39](39-Debugger-Technikpilot.md) gelten unverändert:
unter anderem 32 aktive Frames einschließlich Programm, 64 angezeigte Bindungen
insgesamt, 10.000 Kontrollpunkte, 2.000 Pausen, 4.096 Protokollnachrichten,
1 s kumulative aktive Zeit und fünf Minuten unbediente Pause. Die tatsächlich
früher bindende Grenze entscheidet. Methoden mit vielen Elementen oder sehr
tief verschachtelten Rückrufen müssen nicht bis zum letzten Element durchlaufen.

`WeakSet`, Methoden und Hilfsfunktionen werden vor dem Lerncode gebunden;
Shadowing von `Array`, `WeakSet`, `Object`, `Reflect` oder Fehlerklassen ersetzt
diese Captures nicht. Native Sparse-Array-, Short-Circuit- und Reduce-Regeln
kommen aus QuickJS. Sourcegetter, Funktionswerte in Daten und Prototype-/
Serializeränderungen sind weiterhin gesperrt; dadurch entstehen auch über
native Methoden keine uninstrumentierten Source-Hooks.

Keine zusätzlichen Bibliotheken, Host-/Datei-/Netzrechte, KI-Anfragen oder
dauerhaften Debugwerte. Stop, Quellwechsel, Schließen, Fehler und Ende beenden
den ganzen Worker. Die bekannte Asyncify-Dispose-Besonderheit und physische
Worker-Terminierung aus FE-040 bleiben unverändert.

Die Gesamtregression deckte außerdem eine bereits bestehende ungenaue
Speicherbestätigung der Werkstatt auf. Der Kursstand wird beim Bearbeiten jetzt
sofort als ungesichert markiert, alte Schreibbestätigungen werden ungültig.
„Gespeichert“ wird erst nach bestätigtem Commit des aktuellen Stands angezeigt.
Ein Test hält zwei echte OPFS-Commits an und prüft den gespeicherten Inhalt;
die alte Wiederherstellungsprobe prüft zusätzlich die tatsächlich geschriebenen
Bytes. Speicherformat, Debounce und Rechte bleiben erhalten.

## Abnahmematrix

Neue Fälle stehen in `e2e/tests/debugger-callbacks.spec.js`.
375/375 Browser-/Electron-Gesamtfälle ohne Wiederholung bestanden, einschließlich
aller bisherigen D2-Nachweise; Build und unabhängiger Abschlussreview grün.

| Bereich | Nachweis |
|---|---|
| Echte native Callbackpause | map-Elemente einzeln mit Parametern/TDZ; spätere Logs fehlen während Halt und erscheinen danach einmal; anschließender filter-Lauf ergibt die richtige Auswahl |
| Eigene benannte Funktion | Über/Aus, expliziter Halt und unveränderte Ausgabe im selben nativen map-Lauf |
| Captures/Caller | echte Snapshots im for-Header und verschachtelten map-Aufrufen mit drei aktiven Frames |
| Semantik | Original-QuickJS gegen Instrumentierung: alle sieben Methoden, alle drei Callbackformen, Sparse/Reduce/Short-Circuit, Mutation, Scopeshadowing, ASI/TDZ, Fehlerklassen, Completion |
| Negative Wege | Alias/constructor/Helfer, this/arguments/Async, benannte Ausdrücke, Default/Rest/Destrukturierung, eigene Callbackparameter und frei erzeugte Funktionen vorab abgewiesen |
| Runtime-Gate | synthetisch unregistrierte Callbackfunktion in internem Testartefakt verworfen, nicht als Produktfunktion erreichbar |
| Ressourcen/Lebenszyklus | reduzierte Pausengrenze, Stop im Callback, Quellwechsel und frischer Folgelauf |
| Windows-Electron | realen Callback anhalten, fortsetzen und nach vollständigem Neustart ohne alte VM/Frames öffnen |

Prüfstatus und unabhängiger Review stehen im
[Arbeitsbrief](agent-briefs/FE-046-debugger-callbacks.md). Der konkrete Callback-
Bedienablauf mit `map`, Haltepunkt und Parametern 1/2/3 wurde separat durch
Rückmeldung bestätigt. Die erwartete Ausgabe `2-4-6` und alle sieben Methoden
sind automatisch geprüft; eine persönliche Einzelabnahme aller Methoden wird
nicht behauptet. Die frühere D2-Rückmeldung wird dafür nicht wiederverwendet.
Keine neuen Installer und keine automatische Freigabe weiterer D3–D6-Stufen.
