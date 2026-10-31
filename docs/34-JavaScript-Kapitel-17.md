# JavaScript: Kapitel 17 – Arrays, Schleifen und Objekte

Stand: 31.10.2026, FE-034. Elf neue Lektionen, insgesamt 82. Web-/Electron-
Entwicklungsstand; keine neuen Installationspakete.

## Aufbau

| Schritt | Neues Lernziel | Übung |
|---|---|---|
| 1 | Arrayliteral, Index ab 0, length, letzter Eintrag/undefined | Lernziele einzeln ausgeben |
| 2 | Einträge ändern, push/pop, const und Mutation | Eigene Themenliste ändern |
| 3 | for mit Index, Bedingung und Fortschritt | Zahlen addieren |
| 4 | for...of über Werte | Treffer ab einer Grenze zählen |
| 5 | while mit eigenem Fortschritt | Schritte bis zu einem Ziel zählen |
| 6 | break und continue | Stopwert und übersprungene Werte |
| 7 | Neue Ergebnisliste aufbauen und zurückgeben | Positive Zahlen auswählen |
| 8 | Objektliteral, Eigenschaften, Punkt-/Klammerzugriff | Produktdaten lesen |
| 9 | Referenz gegenüber flacher Kopie, Spread | Bestand ohne Originaländerung erhöhen |
| 10 | Array von Objekten verarbeiten | Produkt-Lagerwert in ganzen Cent berechnen |
| 11 | Transfer: Array, Objekt, Funktion und Schleife | Offene Aufgaben auswerten |

Jede Lektion hat Voraussetzungen, eigene Erklärung/Beispiel, Aufgabe, zwei Hilfen,
offenen Starter und mögliche Lösung. Das Zahlenprojekt liegt vor dem nächsten
Themenwechsel; die Produktliste bereitet den abschließenden Transfer vor.
Vorhandene Funktionen/Rückgaben aus Kapitel 16 werden angewendet. Fortgeschrittene
Arraymethoden wie map/filter/reduce, Callbacks oder Pfeilfunktionen sind keine
Voraussetzungen; die Lernbegleitung führt diese erst später ein.

## Fachliche Grenzen

- length ist die Länge eines Arrays; bei unseren lückenlosen Listen entspricht
  sie der Eintragszahl. Es wird nicht behauptet, dass bei dünn besetzten Arrays
  sämtliche Positionen tatsächlich einen Wert hätten.
- Der letzte Index ist length - 1; leere Listen haben keinen letzten Eintrag.
- const verhindert die Neuzuweisung des Namens, nicht die Änderung des Inhalts.
  push liefert die neue Länge, pop den entfernten Wert bzw. undefined zurück.
- Index-for verwendet < length. for...of liefert Werte, for...in wäre eine andere
  Operation über Eigenschaftsnamen. while braucht selbst erklärbaren Fortschritt.
- break beendet die Schleife, continue nur den Durchlauf; bei while kann falsch
  platzierter Fortschritt deshalb eine Endlosschleife verursachen.
- Arrays und Objekte werden als Referenzen weitergegeben. Spread-Kopien sind
  flach; verschachtelte Werte werden dadurch nicht tief kopiert. Die Kopierübung
  nutzt ausdrücklich flache primitive Felder.
- Ganze Centwerte vermeiden neue Rundungsthemen. Die Listenverarbeitung erwartet
  gültige, kleine, nicht negative Ganzzahlen und echte Booleans. Eine zusätzliche
  umfassende Validierung beliebiger Fremddaten ist hier kein verstecktes Lernziel.

## Abschlussprojekt

Die synthetischen Aufgaben besitzen `titel`, `minuten` und `erledigt`.
`werteAufgabenAus(liste)` liefert ein neues Objekt mit `offen` (Anzahl),
`restMinuten` (Summe) und `titel` (neues Array der offenen Titel in Reihenfolge).
Erledigte Einträge werden ignoriert. Eine leere oder ganz erledigte Liste
liefert 0, 0 und ein leeres Titelarray; offene Aufgaben mit 0 Minuten werden
trotzdem gezählt. Die Eingabe und ihre Objekte bleiben unverändert.

Der äußere Aufruf speichert das Ergebnis in `auswertung`. Ausgegeben werden
zuerst die beiden Zahlen, danach alle offenen Titel einzeln. Erklärung und
Vorhersage für gemischte/leere/erledigte Listen gehören zur Selbstprüfung.
Projekt wie bisher als JSON/ZIP sichern und zum Weiterarbeiten wieder einlesen.
Die öffentlichen Testkonstanten werden pro Lauf bereitgestellt und weiterhin
nicht automatisch in exportierte Programmdateien geschrieben.

## Strukturierte Prüfung ohne neue Rechte

Die normale Eingabe wird aus den festen öffentlichen Kurstabellen als Literal
im QuickJS-Interpreter angelegt. Die Probe erhält zusätzlich eine unabhängige
Kopie derselben ursprünglichen Daten über einen VM-Handle. Diese Kopie wird
erst innerhalb des Interpreters aufgebaut und bleibt dort. Eine Änderung der
studentischen Eingabe kann so nicht zugleich die erwarteten Daten verändern.
Das gilt auch für verschachtelte Aufgaben-/Produktfelder der festen Daten.

Studentische Funktionen und zurückgegebene Arrays/Objekte werden ausschließlich
in QuickJS untersucht. Vergleiche/Serialisierung für die Ergebnisprüfung laufen
im Gast, unter Zeit-/Heap-/Stackgrenzen. Hostcode dump/serialisiert keine
studentischen Objektstrukturen; zur App gelangen weiterhin nur begrenzte
primitive Konsolentexte, Diagnose und Prüfergebnis. Gesamte Arrays/Objekte
erscheinen deshalb weiterhin als [Array]/[Objekt] in der Kurskonsole. Der Kurs
erklärt den Unterschied zur inspizierbaren normalen Browserkonsole.

Direkte Zusatzaufrufe prüfen auch leere/einzelne Listen und andere Argumente.
Kopieridentität, Reihenfolge und unveränderte Eingabewerte werden mitgeprüft.
Die Prüferdaten sind unabhängig, die Prüfung ist aber kein manipulationssicheres
Zertifikat und beweist nicht jede verwendete Schreibweise oder alle denkbaren
Nebenwirkungen. Eigene gültige Alternativen sind erlaubt; Erklären des Codes
und der verwendeten Schleifen bleibt nötig. Interne Prüfprogramme können Methoden
verwenden, die noch nicht gelehrt wurden; diese sind keine studentische Voraussetzung.

Prüfaufrufe bleiben synchron. Nachlaufende VM-Jobs werden wie in Kapitel 16
abgewiesen. Getter/Proxys oder übergroße Rückgaben erhalten keine Hostrechte;
bei Überlast wird der Lauf beendet. HTML-Vorschau bleibt skriptfrei, optionale
Textspiegelung und standardmäßig geschlossene Zusatzwerkzeuge bleiben erhalten.
Keine neue Datei-/Browser-/Netzwerk-/RAG-/Kontoschnittstelle oder Bibliothek.

## Nachweise und Ausbau

Echte Browser-/Electron-Prüfungen: elf Starter/Lösungen/Alternativen, Indexfehler,
fehlende Grenzen, falsche Zähler/Stopwerte, verkehrte Eigenschaftszugriffe,
Aliaskopie und Mutation von Array-/Objekteingaben, kontrollierter Getter-Abbruch,
Korrektur, ältere Ergebnisse, JSON/Reload, optionale Vorschau und vollständiger
Desktop-Neustart. Ergebnisse/Review im
[Brief](agent-briefs/FE-034-javascript-kapitel-17.md).

Ergebnis im Entwicklungsstand: 165 Fälle im vollständigen Werkstatt-/KI-/Kontext-
Lauf grün, einschließlich 16 neuer Kapitel17-Fälle. 207 Backendtests/22 Suiten,
Lint und Build grün; bisheriger Größenhinweis bleibt. Frischer unabhängiger
Review ohne Findings bestätigt alle 33 Lösungs-/Datenkombinationen, 33 offene
Starterfälle sowie Mutations-/Alias-/Reihenfolgegegenproben direkt mit QuickJS.
Praktische Rückmeldung zum neuen Abschnitt bleibt separat.

Nächster Schritt ist Kapitel 18 mit Arraymethoden/Callbacks und Debugging.
Native Browser-Breakpoints und reale DOM-Ausführung behalten ihre eigenen
Architektur-/Abnahmegates; keine verdeckte Browserfreigabe in diesem Kapitel.
Private Unterlagen oder echte Konten sind keine Test-/Fachquellen. Nachweise
betreffen die dokumentierte Windows-/Chromium-/Electron-Matrix.

Öffentliche Primärreferenzen für die eigenen Kurstexte:

- [MDN: Arrays](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Arrays)
- [MDN: Indizierte Sammlungen](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Indexed_collections)
- [MDN: Schleifen](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Loops)
- [MDN: Objekte](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects)
- [MDN: Flache Kopien](https://developer.mozilla.org/en-US/docs/Glossary/Shallow_copy)
