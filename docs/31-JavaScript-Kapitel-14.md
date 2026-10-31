# JavaScript: Kapitel 14 – Werte und erste Berechnungen

Stand: 31.10.2026, FE-028. Acht zusätzliche Lektionen im Entwicklungsstand,
insgesamt 51 Lektionen. Web und Electron, noch keine neuen Installationspakete.

## Lernfolge

| Lektion | Neues Lernziel | Aufgabe |
|---|---|---|
| Eine JavaScript-Datei und deine erste Ausgabe | Externe `.js`, script/src/defer, console.log, Kommentare, bewusster Start | HTML und JS verknüpfen, eigenen Text ausgeben |
| Werte | Zahl, String, Boolean und Groß-/Kleinschreibung | Drei Werte mit unterschiedlichen Typen ausgeben |
| const | Deklaration, Bezeichner, Anfangswert, erneute Zuweisung gesperrt | Kursname und Jahr benennen und ausgeben |
| let | Veränderbare Bindung, Zuweisung und Ablaufreihenfolge | Alten und neuen Punktestand protokollieren |
| typeof | number/string/boolean/undefined/null | Werte und Typausgaben unterscheiden |
| Rechnen | + - * / %, Textaddition und Rundungsgrenzen | Fünf Zahlenrechnungen vorhersagen und ausgeben |
| Klammern | Vorrang, Gruppierung, bereitgestellte Konstanten | Stückpreis plus Zuschlag für mehrere Stücke |
| Materialbudget | Transfer mit Zwischenergebnissen und veränderten Daten | Material-, Gesamt- und Restbetrag berechnen |

Jede Lektion enthält Voraussetzungen, eigene Erklärungen, ein anderes Beispiel,
eine konkrete Aufgabe, zwei Hilfen, offenen Starter und mögliche Musterlösung.
Die meisten neuen JS-Dateien beginnen nur mit einem Aufgabenkommentar, damit
keine schon ausgefüllte Übung als Lernarbeit erscheint. Eigene Texte und
gleichwertige Formeln sind möglich. Manche Variablennamen und die Reihenfolge
einzelner Ausgaben sind für die feste Prüfung ausdrücklich vorgegeben.

`if`, Vergleiche, ausführliche Textarbeit und Umwandlung folgen in Kapitel 15.
Eigene Funktionen, Schleifen, Arrays/Objekte und DOM sind keine Voraussetzungen.
Der negative Rest im Projekt wird zunächst als Zahl ausgegeben; die Entscheidung
„Budget reicht“ folgt später. Keine Framework-/Werkzeuginstallation erforderlich.

## Arbeiten und Ausführen

Kapitel 14 über die gemeinsame Lektionsauswahl öffnen. Im Dateibaum HTML oder
`js/uebung.js` bearbeiten. Unter „Vorschau / Konsole“ startet „Kursprogramm
ausführen“ ausschließlich die verknüpfte JS-Datei im begrenzten Interpreter.
Die normale HTML-Vorschau bleibt ohne aktive Skripte, auch wenn HTML ein script
enthält. Sie zeigt weiterhin den eingegebenen HTML-/CSS-Inhalt. Konsolenwerte
erscheinen nicht automatisch im HTML. Der Browsermechanismus von script/defer
wird erklärt und seine Dateiverknüpfung geprüft, aber nicht als uneingeschränkte
Browserausführung in der App freigegeben.

FE-029 ergänzt eine standardmäßig ausgeschaltete Lernhilfe: „Konsolenausgabe
als Lernhilfe in der Vorschau anzeigen“. Nach dem bewussten Kursstart spiegelt
die App dieselben Ausgaben in einen gekennzeichneten Textbereich der HTML-
Vorschau. console.log selbst schreibt weiterhin nur in die Konsole. Es werden
keine HTML-Elemente durch Lerncode verändert und keine neuen DOM-/Browserrechte
freigegeben. HTML-artige Ausgaben erscheinen als Text, nicht als Markup.
Neustart, Entwurfs-/Lektionswechsel oder Schließen der Kursansicht verwerfen die
Laufanzeige. Sie gehört nicht zu Originaldateien, Kurssicherung, JSON/ZIP,
Bewertung oder automatisch freigegebenem KI-Kontext. Die Vorschau kann dadurch
neu aufgebaut werden; interaktive Vorschauwerte bleiben wie bisher flüchtig.

Die letzten beiden Aufgaben stellen ihre Eingabekonstanten sichtbar in der
Kurskonsole bereit. Der Worker legt diese vor dem Lerncode an; nicht erneut
deklarieren. Die exportierte JS-Datei enthält den eigenen Code, keine automatisch
eingefügten Testdaten. Sie lässt sich extern bearbeiten und wieder einlesen;
für eine unabhängige Ausführung außerhalb der Lernumgebung müssten die im Kurs
angezeigten Eingabekonstanten selbst ergänzt werden. Der Kurs verlangt diesen
Wechsel nicht und empfiehlt ihn nicht als Umgehung seiner Ausführungsgrenzen.

JS-Dateien können in Web und Desktop explizit mit dem Projekt importiert werden.
Relative Pfade bleiben erhalten. Ein einfacher JS-Dateiname und maximal 64 KiB
UTF-8 gelten zusätzlich zu den vorhandenen Projektgrenzen. JSON und ZIP erhalten
HTML/JS gemeinsam; der bestehende freie JavaScript-Entwurf bleibt getrennt.
Importieren, Öffnen und Wiederherstellen starten kein Programm. Für lokale
Bearbeitung kann der bisherige Editor frei gewählt werden. `.env*`, `.git`,
node_modules, local-rag und local-ai sind vom Projektimport ausgeschlossen.

## Feste Prüfung und ihre Grenzen

Die App prüft zunächst eine einzelne externe klassische script-Verknüpfung mit
relativem, vorhandenem JS-Ziel und defer, ohne Inline-Code/async/Modulmodus. Für
die Aufgaben wird ein script im head erwartet. Die Prüfung ist kein vollständiger
HTML-Parser-/Konformitätsnachweis; sie benutzt eine inerte Fragmentansicht plus
begrenzten Head-Abgleich. Dabei werden keine Ressourcen aus dem HTML geladen.

Ausgabetypen und ausgewählte benannte Werte werden im QuickJS-Interpreter
verglichen. Dazu hält dessen Konsole begrenzte primitive Momentaufnahmen;
Hostcode serialisiert keine Gastobjekte. Feste, verpackte Aufgabenkennungen und
Testfallnummern wählen Prüfungen aus; beliebiger Prüfcode oder frei definierte
Testdaten werden nicht über Nachrichten angenommen. Prüfcode läuft ebenfalls
im begrenzten Interpreter, ohne neue Hostfähigkeiten. Globale Änderungen des
Gastprogramms sind keine Änderungen an der App.

Klammeraufgabe: zwei Datenfälle. Budgetprojekt: drei, darunter negativer Rest.
Ausführungsfehler, falsche Typen/Reihenfolge, unerwartete Bindungen und passende
hartcodierte Ergebnisse nur des ersten Projektfalls bleiben offen. Gültige andere
Formeln werden akzeptiert. Ein Ergebnisvergleich beweist nicht jede Schreibweise
oder Technik: insbesondere die einfache Operatorübung kann auch mit hingeschriebenen
Ergebnissen erfüllt werden. Die sichtbare Selbstprüfung verlangt deshalb Erklärung
und Kontrolle der Rechenausdrücke/const/let. Lokale Ergebnisse sind kein
manipulationssicheres Zertifikat und keine KI-Benotung.

Prüfung abbrechen, Änderung des Entwurfs, Lektionswechsel und Verlassen der Seite
beenden aktive JS-Prüfworker. Laufgeneration und Dateistand verhindern das Übernehmen
alter Rückmeldungen. Konsole, Prüfung und freie JS-Fläche verwenden frische Läufe;
Ausgaben werden nicht gespeichert oder automatisch an KI gesendet. Die bestehenden
Zeit-/Heap-/Stack-/Ausgabe-/Jobgrenzen und ihre Aussagegrenzen bleiben erhalten.
Siehe [Grundlagenlaufzeit](30-JavaScript-Grundlagenlaufzeit.md).

Die vorhandene freiwillige Lernbegleitung akzeptiert JS-Ausschnitte erst in den
neuen Lektionen und weiterhin nur nach der bestehenden Codefreigabe. Themen
werden pro Lektion erweitert; spätere JS-Techniken bleiben ausgeschlossen.
Private Unterlagen und reale Konten werden für diese Kapiteltests nicht verwendet.

## Nachweise

Browser-/Electron-Nachweise: alle acht Starter/Lösungen/Alternativen, falsche
Typen/Bindungen/Pfade/Formeln und hartcodierte Projektwerte, bewusster Start,
Fehlerkorrektur, manueller Abbruch und automatisches Ende bei Änderung/direktem
Lektionswechsel, feste Prüfkennungen/Fallnummern, verschachtelte Dateipfade,
JSON/ZIP, Reload, native JS-Dateiauswahl mit überprüftem Dialogfilter,
privater Pfadfilter und vollständiger Desktop-Neustart. Bestehende Kapitel und
Ausführungsgrenzen werden separat auf Regressionen geprüft. Status und endgültige
Testzahlen im [Brief](agent-briefs/FE-028-javascript-kapitel-14.md).

Nachweise im Entwicklungsstand: Gesamtlauf 95 Fälle grün; danach 15 erweiterte
Kapitel-14-Fälle grün, insgesamt 97 unterschiedliche Browser-/Electronfälle.
204 Backendtests/22 Suiten, Lint und 16 Runtime-/Distributionstests grün;
Frontendbuild erfolgreich mit bestehendem Größenhinweis. Frischer Review
bestätigt den Fachabgleich und prüft alle elf Lösungs-/Testdatenkombinationen
zusätzlich unabhängig mit dem tatsächlichen Interpreter/Bootstrap.

Fachabgleich mit öffentlichen Primärquellen; eigene Kurstexte:

- [SELFHTML: Externe Skripte](https://wiki.selfhtml.org/wiki/JavaScript_in_HTML_einbinden/Externe_Scripte)
- [MDN: Grammatik und Typen](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types)
- [MDN: Variablen](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Variables)
- [MDN: Ausdrücke und Operatoren](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_operators)

FE-030 ergänzt inzwischen [Kapitel 15](32-JavaScript-Kapitel-15.md) mit Texten,
Entscheidungen und Tarifrechner. Noch offen: praktische Rückmeldung zum neuen
Kapitel sowie die späteren DOM-/Async-/Browser-Debugger-Gates. Keine pauschale Plattformfreigabe
außerhalb der geprüften Windows-/Chromium-/Electron-Matrix.
