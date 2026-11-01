# Kapitel 18–31: Inhaltsfassung und anschließende Integration

Die vereinbarte Inhaltsphase umfasste 85 zusätzliche Lektionen. Kapitel 18 wurde
in FE-037 eingebunden; FE-038 ergänzt sämtliche 77 Lektionen 19–31 in der normalen
Lektionsauswahl. Insgesamt stehen 167 Lektionen 1–31 im Entwicklungsstand bereit.
„Kapitel 19–31 lesen“ bleibt eine separate Referenzansicht ohne eigene Benotung.
[Technische Umsetzung, Prüfdeckung und Grenzen](37-Frontendkurs-Technische-Integration.md).

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

Die technischen Übungen 19–31 laufen mit lokalem DOM-Modell, kontrollierten
Daten-/Speicheradaptern, Modulauflösung, semantischer TypeScript-Prüfung und
React ausschließlich in QuickJS. Die vorhandene HTML-/CSS-Vorschau bleibt
skriptfrei. Externe Werkzeugvorlagen ergänzen reale Node-Tests, Typecheck und
Build; die App führt keine Shell-/Git-/Installationsbefehle aus.

Die interaktive Ansicht modelliert freigegebene Elemente und Ereignisse, keinen
vollständigen Browser. Eigenes CSS, native Formulare, Browsernavigation,
Zugänglichkeit und echte Werkzeugabläufe zusätzlich extern prüfen. Manuelle
Kriterien werden mit eigenem Prüfprotokoll ausdrücklich als Selbstauskunft
bestätigt. Praktische Nutzerabnahme und freier Quellcodedebugger bleiben offen.

Die historische Quellenfassung und ihre 85 Referenzen bleiben erhalten. Aktive
Lektionen und Lesefläche zeigen aktualisierte Laufzeithinweise. Die externe
Vorlage verwendet feste aktuelle Werkzeuge; React 18 bleibt gleich, die VM
verwendet den vorhandenen Router 6, die externe Vorlage Router 7 mit den hier
verwendeten deklarativen APIs. Kein neues Desktop-/Webpaket wurde gebaut.

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

## Weitere Abnahme

Die Kapitel sind technisch eingebunden. Noch ausstehend sind die praktische
Nutzerabnahme der neuen Abschnitte, vollständige externe Bedien-/Werkzeugnachweise
und weitere Zielgeräte. Feste Teilprüfungen, selbst bestätigte Kriterien und
unabhängige Kompetenznachweise bleiben getrennt. Ein allgemeiner Debugger für
eigenen Quellcode folgt gesondert; Kapitel 18 besitzt seine feste geführte Spur.
Neue Installationspakete werden bei eigenem Buildauftrag erstellt.

Öffentliche Fachreferenzen sind pro Lektion verlinkt: MDN/Chrome DevTools,
Git/npm/Node/Vite, W3C WAI, TypeScript sowie React/React Router. Keine privaten
Unterlagen oder daraus abgeleiteten Inhalte wurden verwendet.
