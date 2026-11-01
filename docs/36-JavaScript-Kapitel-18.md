# Kapitel 18: Arraymethoden und geführte Fehlersuche

FE-037 bindet die acht vorbereiteten Lektionen in den normalen Übungsablauf ein.
Der Quellstand umfasst damit 90 Lektionen in Kapitel 1–18. Die verbliebene
Inhaltsfassung 19–31 enthält 77 Lektionen. Inhalte von Kapitel 18 werden aus der
bereits geprüften Redaktion übernommen; Aufgaben ergänzen eindeutige Ausgaben
für die begrenzte Kurskonsole. Ältere IDs, Versionen und Stände 1–17 bleiben erhalten.

## Reihenfolge und Prüfvertrag

| ID | Schritt | Wesentliche Fälle |
|---|---|---|
| js18-callback | Funktionen als Werte weitergeben | andere Callbackfunktion, Aufruf statt Wert, Rückgaben |
| js18-filter | passende Einträge behalten | neue Liste, leer/alle erledigt, Reihenfolge, keine Mutation |
| js18-map | jeden Eintrag umformen | alle Titel einschließlich erledigter Aufgaben, leere Liste |
| js18-pfeile | kurze Callbackausdrücke | 0 ausgeschlossen, negative Werte, Duplikate, return im Block |
| js18-suchen | find/some/every unterscheiden | undefined, leere Liste, nichtleere vollständig erledigte Liste |
| js18-reduce-sort | reduzieren und Kopien sortieren | Startwert 0, numerische Ordnung 2/10, stabile Gleichstände |
| js18-fehler | Fehler lesen und werfen | ganze positive Zahlen, NaN/Zahlstrings/0, Error mit Meldung |
| js18-debugspur | Schleifengrenze erklären/reparieren | leere Liste, Summen, unveränderte Eingabe, Scope vor Addition |

30 feste oberste Datenfälle und zusätzliche direkte Funktionsaufrufe laufen in
QuickJS. Ausgaben werden einzeln nach Typ/Wert geprüft; Ergebnismengen, Reihenfolge
und unveränderte Eingaben gegen eine separate VM-Kopie verglichen. Ein korrekter
Funktionsvertrag zählt, nicht die Schreibweise eines vorgegebenen Lösungstexts.
Die Prüfung beweist weder alle denkbaren Fälle noch die tatsächliche Nutzung
einer bestimmten Arraymethode oder selbstständiges Verständnis. Diese Grenze
steht im Lerntext; Methodenwahl und Erklärfähigkeit bleiben Teil der Selbstprüfung.

## Geführter Debuggereinstieg

Die letzte Lektion enthält eine **Modellspur des festen Summenbeispiels**.
Haltepunkte auf ausführbaren Zeilen, Einzelschritt, Weiterlaufen, Reset, Scope
und Aufrufkette veranschaulichen den Ablauf. Die bekannten Daten sind [2,3], []
und [0]; fehlerhafte <=- und korrigierte <-Variante sind begrenzt vorgegeben.
Anhalten erfolgt vor dem jeweiligen Modellschritt. Nach dem Verlassen der
Schleife ist deren let i nicht mehr im lokalen Scope. Bei der fehlerhaften
Grenze zeigt die zusätzliche Addition undefined und danach NaN.

Die Spur interpretiert **keinen Editorcode** und ist kein allgemeiner nativer
JavaScript-Debugger. Sie enthält ausschließlich feste App-Logik und öffentliche
Beispieldaten, keine Auswertungs-/Datei-/Netzwerkbrücke. Das Ansehen ihrer
korrigierten Variante markiert die Musterlösung als angesehen. Spurpositionen
werden weder gespeichert, exportiert noch an KI übertragen. Die eigene
Funktionskorrektur wird unabhängig davon in QuickJS geprüft.

Ein freier Quellcode-Debugger und die spätere DOM-/Browserintegration bleiben
offen. Die geführte Spur ist kein Nachweis dieser noch fehlenden Fähigkeiten.

## Sicherheit und KI

Die Ausführungsgrenzen bleiben: 1 Sekunde VM-Zeit, 16 MiB Interpreter-Heap,
64 KiB Stack, begrenzte Ausgaben/Jobs und äußerer Workerabbruch. Callbacks,
Sortiervergleiche, Getter und Proxy-Metatraps bleiben vollständig in QuickJS.
Fehlerarten werden anhand beim Bootstrap erfasster nativer Prototypen als
begrenzter Text bezeichnet; name-/message-/stack-Getter werden nicht ausgeführt.
Proxy-Metatraps unterliegen derselben Frist. Keine beliebigen Gastobjekte werden
im Host ausgewertet. Die HTML-Vorschau bleibt skriptfrei.

Die KI-Themenfolge lässt Callbacks, filter, map, Pfeilfunktionen, Suchmethoden,
reduce/sort und eigene Fehlerbehandlung erst ab ihrer jeweiligen Lektion zu.
Frühere Lektionen behalten ihre Beschränkungen. Kein DOM, Netzwerk, Timer oder
Framework; private Unterlagen und bisherige Codefreigaben bleiben unverändert.
Die Lernbegleitung erklärt den begrenzten Umfang der geführten Spur ausdrücklich.

## Testumfang und Auslieferung

Neue Tests prüfen Starter, Lösungen, Alternativen, 13 typische fachliche Fehler,
Mutation, Fehlernamen/Datei, bösartige Metatraps und anschließenden Neustart.
Mobile Tastaturbedienung, Haltepunkte/Scope/Reset und Hilfemarkierung werden
in der echten Oberfläche geprüft. Ein Windows-Electronfall lädt einen künstlich
auf 82 Projekte reduzierten alten Kursstand, erhält die alte Prüfung und ergänzt
die neuen acht Entwürfe. Ausführung von Kapitel 18 danach ebenfalls geprüft.

Ergebnisse/Review: [FE-037](agent-briefs/FE-037-javascript-kapitel-18.md).
Dieser Schritt verändert den Web-/Desktop-Quellstand und den lokalen Frontendbuild.
Der zuvor gebaute Installer 0.1.4 bleibt bei 82 Übungen/85 Inhaltslektionen;
ein aktualisierter Installer ist ein separater Buildauftrag.

Öffentliche Fachreferenzen stehen je Lektion. Abgeglichen sind insbesondere
[MDN zu every](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every),
[sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
und [Fehlersuche](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Debugging_JavaScript).
