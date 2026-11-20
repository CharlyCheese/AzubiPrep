# OPS-044 – Debugger-Gesamtprojekt unter CI-Last

Status: done

Der Linux-Browserjob meldete im Gesamtprojekt beim Laden der Beispieldaten eine erschöpfte aktive Laufzeit. Beim zweiten Versuch meldete der Debugger eine Promise-Beobachtung außerhalb der Ausführung. Die Abnahme soll die Ursachen im normalen Bedienweg nachvollziehen, passende Korrekturen und wiederholbare Regressionstests enthalten.

Umfang sind die betroffenen Debugger-Komponenten und ihre bestehenden Prüfungen sowie bei nachgewiesenem Bedarf die CI-Konfiguration. Schutzgrenzen für eigenen Code, Abbruch, Schrittbetrieb und die inhaltlichen Prüfungen bleiben verbindlich. Keine zusätzlichen Bibliotheken und keine privaten Daten verwenden. Änderungen an der Laufzeit unter Last und an den angrenzenden Debuggerfällen prüfen. Unabhängigen Review und Prüfgrenzen festhalten.

## Ursache und Korrektur

- Der Linux-Lauf für `27d2a6e` meldete 675 bestandene Browserfälle und einen Fehler im Abschlussprojekt. Bei „Weiter“ las der Debugger an jedem Kontrollpunkt alle Variablen aus, serialisierte die Aufrufkette und wechselte für die Übergabe des Abbilds asynchron aus der VM. Das geschah auch an Anweisungen, an denen die Ausführung sofort weiterlief.
- Jetzt entscheidet der Worker anhand der Anweisungsnummer, der aktuellen Aufruftiefe, des Schrittmodus und der Haltepunkte, ob ein Abbild benötigt wird. Alle Anweisungen aktualisieren weiterhin die Aufrufkette und zählen zum Zeit- und Kontrollpunktbudget. Am tatsächlichen Halt oder Programmende werden die Variablen aus ihrem dann aktuellen Gültigkeitsbereich gelesen.
- Der modellierte Dokumentbaum prüft bei jeder Änderung auch abgetrennte Elemente und zählt die Schreibvorgänge. Der Aufbau eines abgetrennten Teilbaums erzeugt erst eine Vorschauübertragung, wenn er das sichtbare Dokument verändert. Das Verschieben eines sichtbaren Knotens in einen abgetrennten Teilbaum aktualisiert die Vorschau sofort. Die Byteanzahl eines unveränderlichen Textblatts wird einmal beim Erzeugen berechnet.
- Im zweiten Versuch konnte der Promise-Beobachter den bereits gesetzten Abbruchgrund überschreiben. Das ließ sich auch ohne Last reproduzieren, indem eine feste Ausgabegrenze innerhalb eines Promise-Aufrufs erreicht wurde. Der erste Fehlergrund bleibt jetzt erhalten.

## Dauerhafte Regressionstests

Die Tests prüfen das Überspringen ohne Auslesen und Serialisieren, den später sichtbaren Aufruferzustand sowie Halte- und Kontrollpunktgrenzen. Im echten Worker wird eine temporär große Variablenansicht beim Weiterlaufen übersprungen und bei einem tatsächlichen Einzelhalt dem Größenlimit unterworfen. Weitere Fälle prüfen das Verschieben von Elementen, die UTF-8-Gesamtgrenze im sichtbaren und abgetrennten Baum sowie die ursprüngliche Fehlermeldung bei einem Promise-Aufruf. Das Abschlussprojekt läuft weiterhin mit dem regulären kumulativen Zeitbudget von 1.000 ms.

## Vergleich mit 0.1.7

Im gleichen Chromium-Aufbau umfasste der Vergleich 13 Aktionen einschließlich Korrektheitsprüfung der Datenantworten, Abbruch, Haltepunkt in `data.js` und Rückkehr nach `main.js`. Unter normaler Worker-Uhr verbrauchte der betroffene Stand 445–458 ms seines aktiven Zeitbudgets. Mit der Korrektur waren es in der Gegenprobe 110 ms. Beim Start erzeugt der Debugger fünf Vorschauübertragungen für die fünf gezeigten Zustände. Vorher waren es 48 Übertragungen.

Mit vierfach beschleunigter Messung der aktiven Worker-Zeit brach der frühere Stand ab. Der korrigierte Build schloss den Ablauf viermal ab und behielt jeweils mindestens 565 ms der angezeigten Restzeit. Die Lastsimulation wurde lokal durchgeführt. Ein erneuter Lauf auf dem GitHub-Linux-Runner ist erst nach der Übertragung des Fixes möglich.

Der unabhängige Review wiederholte den gesamten Browserablauf je dreimal mit dreifacher und vierfacher Zeitmessung. Zwei weitere Läufe erfolgten mit unveränderter Uhr unter einer Windows-CPU-Quote für den Testprozessbaum. Alle acht Läufe bestanden. Bei 18 verglichenen DOM-Zwischenständen waren die dargestellten Bäume identisch. Auch die Fehlergründe bei den Grenzen für Schreibzahl, Knoten, Tiefe und UTF-8-Text stimmten überein.

Am abschließenden Produktionsbuild bestanden lokal alle 196 ausgeführten Debugger-Browserfälle und 23 Electron-Fälle ohne Wiederholung. Je ein gesonderter Freigabetest für neu gebaute Windows-Pakete war wie vorgesehen ausgenommen. Die Prüfung verwendete eine öffentliche Projektkopie mit synthetischen Profilen.
