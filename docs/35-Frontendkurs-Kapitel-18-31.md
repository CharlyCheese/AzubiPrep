# Kapitel 18–31: Inhaltsfassung und anschließende Integration

Die vereinbarte Inhaltsphase umfasst 85 zusätzliche Lektionen. In der
Frontend-Werkstatt öffnet **„Kapitel 18–31 lesen“** die Kapitel-/Lektionsauswahl.
Die bisherigen 82 praktisch eingebundenen Übungen 1–17 bleiben getrennt erhalten.
Die Inhalte werden erst beim Öffnen nachgeladen, nicht in jeden App-Start gepackt.

Jede neue Lektion enthält Voraussetzungen, Lernziel, eigene Erklärung, Beispiel,
Aufgabe, zwei gestufte Hinweise, bewusst abrufbare Referenzlösung, Fachquelle
und konkrete Abnahmekriterien. Lösungen bleiben zunächst eingeklappt. Ein
Textdownload enthält ausschließlich die gewählte öffentliche Lektion samt
Lösung, keine Nutzerdateien oder privaten Unterlagen. Auswahl, Hinweise und
Lesefortschritt dieser Inhaltsfassung werden noch nicht dauerhaft gespeichert.

## Umfang

| Kapitel | Lektionen | Aufbau und Anwendung |
|---:|---:|---|
| 18 | 8 | Callbacks, filter/map, Pfeilfunktionen, find/some/every, reduce/Sortierkopie, Fehler, Breakpoint-Spur |
| 19 | 4 | Projekt 3: Auftrag/Beispieldaten, reiner Bericht, Grenz-/Mutationstests, Lagerbericht als Transfer |
| 20 | 6 | DOM/Quelltext, Auswahl/null, Textausgabe, Klassen/Eigenschaften, Knoten, dynamische Übersicht |
| 21 | 6 | Klick, submit, Feldwerte/Umwandlung, eigene Validierung, Ereignisziele, lokales Formularprojekt |
| 22 | 5 | Zustand/IDs, Darstellung/Fokus, JSON, vollständiges Schema, ehrliche lokale Sicherung |
| 23 | 4 | Projekt 4: Planung, Aktionskern, Persistenz/Ausfälle, vollständiger Lernplan und Abnahme |
| 24 | 7 | Promise-Reihenfolge, Ketten/Fehler, async/await, HTTP/JSON, Schema, Zustände, veraltete Antworten/Abbruch |
| 25 | 4 | Projekt 5: Katalogplanung, reine Suche/Kategorie, kontrolliertes Laden, Fehler-/Transfermatrix |
| 26 | 7 | Verantwortlichkeiten, Module, Terminalgrundlagen, Pakete/Lock, Git-Commits, Konflikte, Build/Übergabe |
| 27 | 6 | Modelltests, async-Tests, Zugänglichkeit, sichere Ausgabe, Messung, begrenzter Qualitätsauftrag |
| 28 | 4 | Projekt 6: fremde Fehlerfassung, Gegenbeweise, Reparatur mit vollständiger Modulaufteilung, Review |
| 29 | 7 | Typprüfung/Laufzeit, Inference/Signaturen, Objekte/Arrays, Union/Narrowing, unknown, DOM, TS-Lernplan |
| 30 | 12 | JSX, Props, Listen, State, Formulare, gemeinsamer Zustand, Ableitungen, Refs, Speicher-/Ladeeffekte, Routing, React-Projekt |
| 31 | 5 | Eigener Auftrag, Architektur/Etappen, Umsetzung mit Portalreferenz, neue Daten/Abnahme, Dokumentation/optionale Veröffentlichung |

Projekte werden absichtlich in überprüfbare Etappen zerlegt. Wiederkehrende
Lernplan-/Katalogdaten reduzieren fachliche Ablenkung; neue Lager-/Werkzeugdaten
und eigene Abschlussdaten prüfen zusätzlich Transfer. Hilfen und Lösungsansicht
gelten nicht als Nachweis selbstständiger Kompetenz.

## Sichtbare technische Grenze

Alle neuen Lektionen sind **„Inhaltlich vorbereitet · technische/praktische
Abnahme offen“**. Die Lesefassung führt weder JS noch Terminalbefehle aus, ruft
keine KI auf und vergibt keine bestandenen Prüfungen. Die bisherigen QuickJS-
Grenzen und die skriptfreie HTML-Vorschau bleiben erhalten. Die Referenzen sind
öffentlicher Kurstext, keine Freigabe beliebigen Lerncodes für den App-Prozess.

Noch nicht integriert: DOM-/Ereignis-/Speicheradapter für beliebigen Lerncode,
Debugger, kontrollierte asynchrone API-Simulation, Module/TS/React-Werkzeugvorlage,
passende Validatoren, projektbezogene KI-Themenfolge und Fortschritt für 18–31.
Der bisherige Projektimport wird nicht stillschweigend um TS/TSX/Pakete erweitert.
Die neue Textmitnahme ist kein Mehrdateiprojektimport oder ausführbares Paket.

Werkzeuge werden vor ihrer Verwendung erklärt. Es werden keine Bibliotheken
installiert und keine ungeprüften versionslosen Installationsrezepte verlangt.
Die React-Beispiele verwenden bewusst React 18 und Router 6 wie den vorhandenen
Projektstand; die spätere externe Vorlage benötigt eigene feste Versionen und
ein passendes Lock. Echte Veröffentlichung bleibt eine ausdrückliche Entscheidung.

## Nachweise dieser Inhaltsphase

Die Referenzen werden mit erfundenen Daten geprüft. Modellfälle behandeln leere
Listen, inklusive Grenzen, Mutation, doppelte IDs, String-/Zahltypen, Schemata,
HTTP-/JSON-/Anfragefehler und kombinierte Filter. TS/TSX-Syntaxübersetzung ist
keine vollständige strict-Typprüfung.

Separate frische Browserseiten prüfen die festen redaktionellen Lernplan-/React-/
Portalreferenzen. Diese Tests belegen Referenzverhalten und ersetzen ausdrücklich
keine sichere Werkstattausführung frei bearbeiteter Programme. Die neue
Lesefläche wird auf vollständige Navigation, mobile Breite, Tastatur, gestufte
Hilfen, geschlossene Lösungen, Textdownload und Erhalt vorhandener Entwürfe geprüft.

Prüfergebnisse und unabhängige Reviews stehen im
[Arbeitsbrief](agent-briefs/FE-036-restliche-kursinhalte.md).

## Nächste gemeinsame Abnahmephase

1. DOM-/Browser-/Debugger-Architektur mit begrenzten Zugriffsrechten festlegen.
2. Kapitelweise Ausführung/Validatoren anschließen, zuerst reine Kapitel 18/19,
   dann DOM/Formulare/Zustand; jeweils vorhandene Grenzen und Abbruch prüfen.
3. Kontrollierte Datenadapter/async-Fälle und Werkzeugvorlagen ergänzen.
4. Typecheck, Tests, Build, KI-Themenfolge, Fortschritt und Bedienmatrix verbinden.
5. Erst nach tatsächlichen Nachweisen die betreffenden Kapitel praktisch abnehmen;
   neue Desktop-/Web-Installationspakete bei eigenem Buildauftrag erstellen.

Öffentliche Fachreferenzen sind pro Lektion verlinkt: MDN/Chrome DevTools,
Git/npm/Node/Vite, W3C WAI, TypeScript sowie React/React Router. Keine privaten
Unterlagen oder daraus abgeleiteten Inhalte wurden verwendet.
