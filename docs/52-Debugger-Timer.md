# Timer im Debugger

## Schrittweise ausprobieren

Debugger → „HTML und Ereignisse“ → „Timerbeispiel laden“. Der bestätigte Wechsel
ersetzt die bisherigen HTML-/CSS-/Modulquellen. „Debuggen starten“ hält vor der
ersten Anweisung; „Weiter“ richtet die beiden Klickhandler ein.

1. In der Vorschau „Meldung planen“ wählen. Der Klickhandler hält zunächst an.
   Mit „Weiter“ wird eine Meldung für frühestens drei Sekunden später geplant.
2. Der Status „Geplante Timer“ zeigt die Anzahl wartender Aufrufe. Zum Abbrechen
   vor der Fälligkeit „Meldung abbrechen“ klicken und den Handler mit „Weiter“
   ausführen. Die Meldung erscheint anschließend nicht.
3. Erneut planen und warten: Der Debugger hält am „Timerstart“, **bevor** die
   Funktion ihre erste Anweisung ausführt. Der Parameter `text` enthält bereits
   die übergebene Meldung. „Weiter“ führt den Callback aus.
4. Für eine feinere Betrachtung den Haltepunkt `main.js:8:3` setzen. Er liegt
   vor `meldung.textContent = text`. Ein Einzelschritt verändert die Vorschau;
   danach gibt `console.log` dieselbe Meldung aus. „Funktion verlassen“ beendet
   den Callback und kehrt zum Warten auf weitere Ereignisse zurück.

Das Beispiel bricht beim erneuten Planen zunächst den vorherigen Timer ab.
Nach dem Start eines Callbacks ist dieser bereits aus der Warteliste entfernt;
`clearTimeout` kann ihn dann nicht rückwirkend beenden. „Debuggen stoppen“ beendet
hingegen die gesamte Sitzung, auch während eines Callback-Halts.

## Was hier vermittelt wird

`setTimeout(funktion, 3000)` registriert einen späteren Funktionsaufruf und liefert
eine numerische ID zurück. Die Funktion wird als Wert übergeben, ohne sie an
dieser Stelle mit `()` aufzurufen. 3000 Millisekunden entsprechen drei Sekunden.
Weitere Argumente hinter der Wartezeit kommen beim späteren Callback an.
`clearTimeout(id)` entfernt einen noch nicht gestarteten Aufruf.

Die Dauer ist ein **frühester Zeitpunkt**, keine garantierte exakte Uhrzeit.
Erst muss der aktuelle Aufruf beendet sein. Daher läuft auch ein Timer mit
Wartezeit 0 nach dem synchronen Code. Gleich fällige Timer werden in ihrer
Registrierungsreihenfolge gestartet. Closures lesen ihre weiterhin lebenden
Bindungen; Zusatzargumente behalten ihre ursprünglichen Werte beziehungsweise
Objektreferenzen. Das Verhalten orientiert sich am
[HTML-Timerstandard](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#timers).

**Besonderheit dieser Lernumgebung:** Während eines Debugger-Halts friert auch
die Timerzeit ein. Sie läuft zwischen den Halten und beim Warten auf Ereignisse
weiter. Ein später registrierter Timer wird nicht durch eine lange Lesepause
vorzeitig fällig. In dieser Phase werden auch keine anderen Timer oder
Vorschauereignisse ausgeführt. Der Timerstart hält wie ein Klickhandler zunächst
an; das ist eine Debuggerbedienung, keine zusätzliche Anweisung im Quelltext.

## Freigegebener Umfang

Direkte `setTimeout`- und `clearTimeout`-Aufrufe sind im Modus „HTML und Ereignisse“
verfügbar, auch in importierten Modulen. Lokale Variablen, Parameter und Imports
mit denselben Namen behalten ihre Bedeutung einschließlich zeitlicher
Initialisierungsregeln. Aliase der eingebauten Timerfunktionen, Methodenwege
über `window` sowie `setInterval`, Promises und `async`/`await` sind noch nicht
freigegeben. Ein eigener Funktionswert als Callback kann dagegen über Variablen,
Parameter und bestehende sichere Datenstrukturen übergeben werden.

Die fehlende Wartezeit oder `undefined` bedeutet 0. Sonst wird eine endliche Zahl
bis 30000 erwartet; negative Zahlen werden 0 und Bruchteile abgeschnitten.
Strings, Objekte, `NaN` und Unendlich werden zurückgewiesen, ohne eigenen
Konvertierungscode aufzurufen. `clearTimeout` nimmt eine ganzzahlige numerische
ID im sicheren Zahlenbereich oder `undefined` entgegen; eine fehlende, unbekannte, bereits abgebrochene
oder schon ausgeführte ID bewirkt nichts. Zusätzliche clearTimeout-Argumente
sind in diesem begrenzten Umfang nicht vorgesehen.

Textprogramme als Timer-Callback sind ausgeschlossen. Bei mehr als fünf
verschachtelten Timeraufgaben gilt eine Mindestwartezeit von 4 ms; gewöhnliche
Klickhandler beginnen eine neue Verschachtelungskette.

## Grenzen und Lebenszyklus

| Grenze pro Sitzung | Wert |
|---|---|
| Gleichzeitig wartende Timer | 16 |
| Registrierungen, einschließlich später abgebrochener Timer | 128 |
| Ausgeführte Timer | 64 |
| setTimeout-/clearTimeout-Aufrufe, einschließlich wirkungslosem Abbrechen | 256 |
| Wartewert pro Timer | höchstens 30000 ms |
| Zusatzargumente pro Timer | 8 |

IDs werden innerhalb einer Sitzung nicht wiederverwendet. Timerbudgets werden
beim Abbrechen, Leeren der Warteliste oder bei rekursiver Planung nicht
zurückgesetzt. Ressourcen- und Abschirmungsfehler beenden endgültig, auch über
`catch` oder `finally`. Bestehende aktive Zeit-, Speicher-, Stack-, Ausgabe-,
DOM- und Protokollgrenzen bleiben unverändert. Die Wartezeit und Debuggerpausen
verbrauchen nicht das Budget der kumulativen aktiven Programmlaufzeit.

Stop, Laufzeitfehler, neue Quellen, Seitenwechsel, Reload und Desktop-Neustart
verwerfen alle Timer. Gesichert/exportiert werden ausschließlich die
Originalquellen; laufende Callbacks, Argumente, IDs und Wartezeiten werden nicht
gespeichert oder an KI weitergegeben. Appdaten, Dateien, Netzwerk und private
Unterlagen sind weiterhin nicht zugänglich.

## Technische Ausführungsregel

Callbacks und Argumente bleiben in der QuickJS-VM. Im Worker liegen nur
numerische Metadaten für IDs, Fälligkeit und Verschachtelung. Die private Brücke
prüft ihre kleinen Nachrichten und wird vor Lerncodeausführung aus den Globals
entfernt. Sie veröffentlicht keine Hostfunktion und keine VM-Handles.

Nur der Controller plant im Ereigniswartepunkt eine Weckung. Sie läuft über
denselben bestätigten Befehlskanal wie Vorschauereignisse und beansprucht den
Ausführungszustand vor dem Senden. Der Worker prüft Fälligkeit und Zustand erneut.
Eine zu frühe Weckung liefert lediglich einen neuen Wartepunkt und betritt die
VM nicht. IDs werden vor dem Callback aus beiden Wartelisten entfernt. Während
laufender Auswertung oder echter Asyncify-Pause erfolgt kein zweiter VM-Eintritt.

## Prüfstatus

Automatisierte Fälle stehen in `e2e/tests/debugger-timers.spec.js`; bestehende
DOM-/Formular-/Speicher-/JSON-Prüfungen bleiben erhalten. Aktuelle Gesamtergebnisse,
Bedienprobe und unabhängiger Review werden im
[FE-059-Brief](agent-briefs/FE-059-debugger-timer.md) dokumentiert.

Abgeschlossen: 497 gesamte Browser-/Windows-Electronfälle ohne Wiederholung,
darunter 13 neue Timerfälle, sowie sieben eigene Bediengruppen. Der unabhängige
Code-/Dokument-/Bildreview bestätigt die Umsetzung. Zusätzliche eigenständige
Controller- und Workerproben prüfen verzögerte Bestätigungen, frühe/veraltete
Weckungen, importierte Callbackpositionen und ausgeschlossene Pausenzeit.
