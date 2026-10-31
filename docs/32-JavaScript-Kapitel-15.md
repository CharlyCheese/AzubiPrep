# JavaScript: Kapitel 15 – Texte und Entscheidungen

Stand: 31.10.2026, FE-030. Zehn zusätzliche Lektionen, insgesamt 61.
Web-/Electron-Entwicklungsstand; keine neuen Installationspakete.

## Lernfolge und Aufgaben

| Schritt | Neues Thema | Anwendung |
|---|---|---|
| 1 | Strings mit + verbinden, Leerraum, length und Zeilenumbrüche | Begrüßung und Kurslänge |
| 2 | Vorlagen mit Backticks und ${...} | Beschrifteter Lernzeitplan |
| 3 | trim, toLowerCase, includes, Methoden und neue Rückgabewerte | Thementext aufbereiten und durchsuchen |
| 4 | >, >=, <, <=, === und !== | Zahlen/Text und Altersgrenzen vergleichen |
| 5 | if/else, Blöcke und äußere Ergebnisvariable | Minderjährig/volljährig unterscheiden |
| 6 | else if und Reihenfolge | Drei Alters-Tarifstufen |
| 7 | &&, ||, !, Gruppierung/Kurzschluss und verschachtelte if-Blöcke | Teilnahme- und Rabattregeln |
| 8 | Number, String, Boolean | Umwandlung ausdrücklich durchführen |
| 9 | Nicht leer, endlich, ganzzahlig und im Wertebereich | Alterstext prüfen |
| 10 | Transfer aller bisherigen Schritte | Tarifrechner mit Eingabeprüfung |

Jede Lektion besitzt Voraussetzungen, eigene Erklärungen, ein anderes Beispiel,
konkrete Aufgabe, zwei Hinweise, offenen JS-Starter und mögliche Musterlösung.
Teilaufgaben nach fünf/sechs Schritten bereiten den größeren Transfer vor.
Eigene Funktionen/Parameter/return und eine vertiefte Erklärung der Gültigkeits-
bereiche folgen in Kapitel 16. Schleifen, Arrays/Objekte, DOM und Formularevents
sind keine Voraussetzungen. Vorhandene Methoden/Funktionen dürfen wie erklärt
aufgerufen werden; deren Implementierung wird nicht vorausgesetzt.

## Tarifprojekt

Synthetische Kursregeln, keine realen Preise: Unter 12 Jahren 4 Euro, 12–17 Jahre
6 Euro, ab 18 Jahren 10 Euro je Ticket. Nur im Erwachsenentarif senkt ein bereits
als Boolean gegebenes `azubi = true` den Einzelpreis um 2 Euro. Die Anzahl
multipliziert den Einzelpreis. Es werden ganze Eurobeträge verwendet, damit
Geldrundung/Formatierung keine unerklärte Voraussetzung wird.

`alterText` und `anzahlText` sind Strings. Nach trim müssen sie nicht leer sein;
die umgewandelten Werte müssen endlich und ganzzahlig sein. Altersbereich:
0 bis 120; Anzahl: 1 bis 10, jeweils einschließlich. Das sind ausdrücklich
vereinbarte Kursgrenzen. Ungültige Daten geben „Bitte Eingaben prüfen.“ aus;
`preisProTicket` und `gesamtPreis` bleiben null. Gültige Daten erzeugen den Text
„Gesamt: X Euro“. Der Ergebnistext steht in `ausgabe`.

Vor dem Code die drei Teile erklären: Eingabeprüfung, Tarifentscheidung und
Gesamtrechnung. Unter anderem 11/12 und 17/18, Rabatt ja/nein, Höchstanzahl,
leerer Text, NaN-Fälle, Bruchwerte und unzulässige Bereiche werden getestet.
JSON/ZIP sichern die eigenen HTML-/JS-Dateien; erneutes Einlesen ist Teil der
empfohlenen Selbstprüfung. Die bereitgestellten Testdaten werden wie in Kapitel
14 nicht automatisch in exportierte Programmdateien aufgenommen.

## Fachliche Abgrenzungen

- length zählt UTF-16-Codeeinheiten, nicht allgemein sichtbare Zeichen.
- trim ändert den ursprünglichen String nicht; includes sucht einen Teiltext.
- Strikte Vergleiche wandeln Typen nicht automatisch um. = bleibt Zuweisung.
- && und || sind hier mit Boolean-Ausdrücken erklärt; allgemein können sie
  einen Operanden zurückgeben. Die Kurzschlussauswertung wird erläutert.
- Boolean("false") und Boolean("0") sind true; dies ist kein Lesen textueller
  Wahrheitswerte. Die Zeichenkette "false" ist nicht der Boolean false.
- Number von leerem/Whitespace-Text ergibt 0. Deshalb Text und Zahl prüfen.
- NaN hat typeof "number" und ist nicht endlich. Number.isFinite wandelt
  einen String nicht selbst um; vorher Number verwenden.
- Number.isInteger prüft den dargestellten Zahlenwert. Kleine Kursbereiche
  vermeiden die Grenzen sehr großer Zahlen.
- Number kann weitere Schreibweisen wie "0x10" akzeptieren. Die Aufgabe prüft
  den umgewandelten Wert, kein streng begrenztes Dezimaltextformat.

## Ausführung, Speicherung und Lernbegleitung

Die vorhandene begrenzte Kurskonsole bleibt erhalten. Text-/Boolean-Testkonstanten
werden nun mit JSON.stringify als korrekte Quelltextliterale erzeugt und ebenso
angezeigt. Daten und Prüfprogramme stammen ausschließlich aus den verpackten
Aufgabentabellen. Kein Laden beliebiger Hostfunktionen, keine Browser-/Node-/
Datei-/Netzwerkzugriffe. Alle Ausführungs-/Speicher-/Ausgabegrenzen gelten weiter.

HTML-Vorschau bleibt skriptfrei; die optionale Textspiegelung ist standardmäßig
aus und als App-Lernhilfe gekennzeichnet. Keine automatische Ausführung beim
Import, Wiederherstellen oder Übungswechsel. Die bisherige lokale Kurssicherung,
freien JS-Entwürfe, Dateinamen, externen Editoren und Exportformate bleiben gleich.
Alte 51 Lektionen werden ergänzt, ihre Versionen/Prüfstände nicht geändert.

Die feste Prüfung vergleicht geforderte Ausgaben/Typen und ausgewählte Bindungen
unter mehreren Datensätzen. Sie prüft Verhalten, nicht lückenlos die Syntaxwahl:
gleichwertige Formeln/Verkettungen sind möglich. Ein Ergebnis kann etwa auch mit
einer späteren Technik erreicht werden; das ist kein Nachweis, dass eine geplante
Schreibweise selbst beherrscht wird. Selbstprüfung und Erklären des Codes bleiben
nötig. Die Hilfen und freiwillige KI bleiben dagegen auf eingeführte Techniken
begrenzt; keine KI-Benotung. Eigene Namen sind dort frei, wo die Aufgabe keine
Namen ausdrücklich für die feste Rückmeldung vorgibt.

KI-Themen wachsen pro Lektion. Fehlerhafte Prüfkriterien bekommen im begrenzten
Kontext Vorrang, damit auch Fehler in späten Datenfällen erklärt werden können.
Die vollständige Prüfanzeige und Reihenfolge der gespeicherten Ergebnisse bleibt
erhalten; veraltete Prüfabgaben werden weiterhin nicht als aktueller Kontext genutzt.
if wird erst ab der Entscheidungslektion angeboten;
eigene Funktionen/Schleifen/DOM/Netzwerk bleiben gesperrt. Private Unterlagen oder
reale Konten werden für diesen Fachabgleich und die Tests nicht verwendet.

## Nachweise und nächster Schritt

Tests mit echten Browser-/Electron-Workern: zehn Starter/Lösungen/Alternativen,
58 feste Lösungs-/Datensatzkombinationen, gezielte falsche Typen/Vergleiche/
Grenzen/Rabatte, leere und ungültige Eingaben, Text-/Boolean-Literale, kontrollierte
Ausführung, optionale Vorschau, Erhalt älterer Ergebnisse, JSON/Reload und voller
Desktop-Neustart. Weitere Werkstatt-/Sicherheitsregressionen separat.
Endgültige Testzahlen und unabhängiger Review stehen im
[Brief](agent-briefs/FE-030-javascript-kapitel-15.md).

Ergebnis: vollständiger Werkstattlauf mit 113 Fällen grün; nach Ergänzung eines
negativen Altersfalls und der Kontextprüfung 24 Kapitel-/KI-Fälle grün, darunter
15 Kapitel15-/Kontextfälle und neun bestehende KI-Fälle. 205 Backendtests/22
Suiten, Lint und Build grün; bestehender Build-Größenhinweis. Ein im frischen
Review gefundener fehlender Datenfall für negatives Alter wurde ergänzt und
mit gezielten Fehlermutationen abgesichert. Abschließender Fach-/Sicherheits-
Nachreview ohne offene Findings, alle 58 Lösungs-/Datenkombinationen unabhängig
bestätigt. Windows/Chromium/Electron mit künstlichen Profilen; weitere Plattformen
und praktische Rückmeldung zum Kapitel bleiben separat.

FE-031 ergänzt inzwischen [Kapitel 16](33-JavaScript-Kapitel-16.md): Funktionen,
Parameter, Rückgabewerte und Gültigkeitsbereiche; der Rechner wird in
verständliche Bausteine zerlegt. Eine reale DOM-
Formularoberfläche kommt nach den dafür vorgesehenen Architektur-/Abnahmegates.

Öffentliche Primärreferenzen für die eigenen Kurstexte:

- [MDN: Strings](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Strings)
- [MDN: Stringmethoden](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Useful_string_methods)
- [MDN: Bedingungen](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Conditionals)
- [MDN: Ausdrücke und Operatoren](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_operators)
- [MDN: Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
- [MDN: Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
- [MDN: Number.isFinite](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isFinite)
- [MDN: Number.isInteger](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger)
