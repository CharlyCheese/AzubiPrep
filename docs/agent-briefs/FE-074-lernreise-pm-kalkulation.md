# FE-074 – Projektmanagement mit praktischer Kalkulation

Status: done
Bereich: CONTENT / FE / BE
Angelegt: 2026-11-11

## Auftrag

Projektmanagement nach WISO ausarbeiten; Kosten-/Gewinnkalkulation mit passender
Theorie und einer effektiven eingebauten Tabelle/Rechenhilfe. Eine Lösung genügt;
kein Excel-Zwang, kein zusätzlicher Dateiimport und keine zusätzliche Bibliothek.

## Allowlist

- README.md
- content/learning-journey/fiae.v1.json
- content/learning-journey/README.md
- content/learning-journey/topics/common-pm-project.v1.json
- content/learning-journey/questions/common-pm-project.v1.csv
- content/learning-journey/topics/common-pm-stakeholders.v1.json
- content/learning-journey/questions/common-pm-stakeholders.v1.csv
- content/learning-journey/topics/common-pm-methods.v1.json
- content/learning-journey/questions/common-pm-methods.v1.csv
- content/learning-journey/topics/common-pm-planning.v1.json
- content/learning-journey/questions/common-pm-planning.v1.csv
- content/learning-journey/topics/common-pm-schedule.v1.json
- content/learning-journey/questions/common-pm-schedule.v1.csv
- content/learning-journey/topics/common-pm-costs.v1.json
- content/learning-journey/questions/common-pm-costs.v1.csv
- content/learning-journey/topics/common-pm-pricing.v1.json
- content/learning-journey/questions/common-pm-pricing.v1.csv
- content/learning-journey/topics/common-pm-feasibility.v1.json
- content/learning-journey/questions/common-pm-feasibility.v1.csv
- content/learning-journey/topics/common-pm-control.v1.json
- content/learning-journey/questions/common-pm-control.v1.csv
- content/learning-journey/topics/common-pm-closure.v1.json
- content/learning-journey/questions/common-pm-closure.v1.csv
- backend/src/journey.js
- backend/test/journey.test.js
- backend/test/journey-ai.test.js
- scripts/validate-learning-journey.mjs
- scripts/test/learning-journey-content.test.mjs
- scripts/test/journey-state.test.mjs
- scripts/test/journey-calculation.test.mjs
- frontend/src/utils/journeyCalculation.js
- frontend/src/components/JourneyCalculation.jsx
- frontend/src/components/JourneyEntry.jsx
- frontend/src/pages/LernreiseAbschnitt.jsx
- frontend/src/store/journeyStore.js
- frontend/src/styles/journey.css
- frontend/public/sw.js
- desktop/journey-storage.cjs
- desktop/main.js
- desktop/test/journey-storage.test.cjs
- e2e/tests/journey-next.spec.js
- e2e/tests/journey-lf1.spec.js
- e2e/tests/journey-wiso.spec.js
- e2e/tests/journey-pm.spec.js
- docs/61-Lernreise-FIAE-Planung.md
- docs/68-Lernreise-Projektmanagement-Kalkulation.md
- docs/agent-briefs/FE-074-lernreise-pm-kalkulation.md
- docs/agent-briefs/STATUS.md
- docs/agent-briefs/DONE.md

## Themenvertrag

Zehn allgemeine PM-Themen hinter den 16 bestehenden Freigaben und vor LF2.
Je vier Blöcke, sechs Quizfragen, acht getrennte Testfragen, drei Reflexionen,
sechs Karten, drei Lernziele. CSV SC/ALLE/PM/KEIN_LF; JSON fieldId PM und scope common.
PM ist eine zusätzliche Etappe, kein offizielles Lernfeld. Keine privaten Quellen.
IDs LJ-PM-<GROSSER-SUFFIX>-Q01…Q06/E01…E08. Quellen öffentlich, aktuell geprüft,
review pending/null bis zum unabhängigen vollständigen Fachreview aller 140 Fragen.

### common-pm-project – Projektauftrag und klare Ziele
Voraussetzungen: common-wiso-europe
- common-pm-project-purpose: Projekte von laufenden Aufgaben unterscheiden und einen begrenzten Auftrag beschreiben.
- common-pm-project-goals: Prüfbare Projektziele einschließlich Erfolgskriterien formulieren.
- common-pm-project-scope: Leistungsumfang, Zeit, Kosten und Qualität an einem Fall aufeinander abstimmen.

### common-pm-stakeholders – Anforderungen und Zusammenarbeit
Voraussetzungen: common-pm-project
- common-pm-stakeholders-needs: Anforderungen und Abnahmekriterien mit Beteiligten klären und priorisieren.
- common-pm-stakeholders-roles: Auftraggeber, Projektleitung und Team nach ihren Aufgaben unterscheiden.
- common-pm-stakeholders-communication: Einen passenden Kommunikationsweg und dokumentierte Entscheidungen planen.

### common-pm-methods – Klassisch, agil und passend kombiniert
Voraussetzungen: common-pm-stakeholders
- common-pm-methods-compare: Planorientiertes und iteratives Vorgehen nach Rückmeldung und Planbarkeit vergleichen.
- common-pm-methods-scrum: Scrum-Verantwortlichkeiten, Ereignisse und Artefakte in einem einfachen Fall einordnen.
- common-pm-methods-choose: Für einen Auftrag ein begründetes Vorgehen wählen, ohne Agilität mit Planungslosigkeit zu verwechseln.

### common-pm-planning – Arbeitspakete und Aufwand schätzen
Voraussetzungen: common-pm-methods
- common-pm-planning-structure: Einen Auftrag in prüfbare Arbeitspakete mit Ergebnissen zerlegen.
- common-pm-planning-estimate: Aufwand mit begründeten Annahmen schätzen und von Dauer unterscheiden.
- common-pm-planning-uncertainty: Unsicherheiten und Reserven transparent dokumentieren.

### common-pm-schedule – Termine, Abhängigkeiten und Kapazität
Voraussetzungen: common-pm-planning
- common-pm-schedule-dependencies: Abhängigkeiten und einen einfachen zeitlichen Ablauf bestimmen.
- common-pm-schedule-capacity: Mit vorgegebener Kapazität eine realistische Dauer berechnen.
- common-pm-schedule-milestones: Meilensteine und mögliche Terminengpässe erkennen.

### common-pm-costs – Projektkosten nachvollziehbar kalkulieren
Voraussetzungen: common-pm-schedule
- common-pm-costs-cost-types: Direkte Kosten, Gemeinkosten und angebotene Preise im Projekt unterscheiden.
- common-pm-costs-calculate: Personalkosten, Gemeinkostenzuschlag und Gesamtkosten in einer Tabelle berechnen.
- common-pm-costs-assumptions: Einheiten, Bezugsgrößen und Annahmen einer Kostenkalkulation prüfen.

### common-pm-pricing – Verkaufspreis, Gewinn und Marge
Voraussetzungen: common-pm-costs
- common-pm-pricing-markup: Aus Selbstkosten und Gewinnaufschlag einen Nettoverkaufspreis berechnen.
- common-pm-pricing-margin: Gewinnaufschlag und Gewinnmarge anhand ihrer Bezugsgrößen unterscheiden.
- common-pm-pricing-price: Umsatzsteuer, Nachlässe und Verkaufspreis in einem vorgegebenen Modell sauber trennen.

### common-pm-feasibility – Wirtschaftlichkeit und Gewinnschwelle
Voraussetzungen: common-pm-pricing
- common-pm-feasibility-contribution: Deckungsbeitrag von Gewinn unterscheiden und ein vereinfachtes Ergebnis berechnen.
- common-pm-feasibility-break-even: Eine Gewinnschwelle aus Fixkosten, Preis und variablen Stückkosten bestimmen.
- common-pm-feasibility-payback: Eine einfache Amortisationszeit berechnen und die Grenzen des Modells erklären.

### common-pm-control – Risiken, Änderungen und Projektsteuerung
Voraussetzungen: common-pm-feasibility
- common-pm-control-risks: Projektrisiken nach Eintrittswahrscheinlichkeit und Auswirkung beurteilen und Maßnahmen planen.
- common-pm-control-variance: Soll- und Istwerte vergleichen und Abweichungen begründet untersuchen.
- common-pm-control-change: Änderungswünsche auf Umfang, Kosten und Termine prüfen und Entscheidungen festhalten.

### common-pm-closure – Abnahme, Übergabe und Projektrückblick
Voraussetzungen: common-pm-control
- common-pm-closure-acceptance: Ergebnisse anhand vereinbarter Abnahmekriterien prüfen und offene Punkte dokumentieren.
- common-pm-closure-handover: Eine nachvollziehbare Übergabe mit Zuständigkeit und nötiger Dokumentation vorbereiten.
- common-pm-closure-learning: Projektverlauf und Kalkulation auswerten und konkrete Verbesserungen ableiten.

## Gemeinsame Architektur

- Bestehende 84 Themen und 218 Ziele behalten IDs und Fassungen. Zehn PM-Themen
  mit 30 Zielen ergänzen den Plan auf 94 Themen und 248 Ziele. Manifestversion
  1.0.0 bleibt kompatibel. fields enthält PM als zusätzliche logische Etappe
  (14 Einträge), plannedStages ist dann leer. Alte Manifeste mit 84 Themen,
  13 Feldern und geplantem PM bleiben unterstützt. Die Etappenfolge lautet
  unverändert LF1 → WISO → PM → LF2…LF12a. Bereit: 26 von 94; Rest: 68.
- Alle 16 LF1-/WISO-Themen sind PM-Navigationsvoraussetzung, danach gelten
  fachliche Voraussetzungen und vorherige verfügbare Themen. Das WISO-Ende
  führt zu PM; das PM-Ende nennt LF2 als geplant.
- Abschluss nur mit allen zehn gültigen PM-Themen und fieldReview im
  Abschluss-Thema: Block 4, Reflexion 3 und acht Testfragen. Der Rückblick
  nennt alle zehn PM-Themen in Planreihenfolge und wiederholt deren Grundlagen.
  Die Abschlussfragen sind daraus lösbar. Keine zusätzliche Präsentationspflicht.
- Zehn neue feste Speicherkennungen und Desktopdateien; bisherige 16 Ablagen
  unverändert. Bestehende Backups bleiben lesbar. Optionaler Tabellenstand
  ausschließlich in costs, pricing und feasibility; keine automatische
  KI-/Cloudübertragung. Auch falsche Entwürfe dürfen gespeichert werden.
  Tabellenprüfungen vergeben keine XP oder automatische Note. Der reguläre
  Mini-Test bestimmt weiterhin den Themenabschluss.

## Kalkulationsvertrag

Eingebaute beschriftete Tabellen mit festen Zeilen für Vorgaben und Ergebnisse.
Vorgaben frei anpassbar; Ergebnisse als Zahl oder begrenzte lokale Formel.
Grundrechenarten, Klammern, Zellbezüge B1…B12, SUMME/SUM mit Bereichen/Argumenten
sowie RUNDEN/ROUND auf 0 bis 6 Stellen; kein eval/Function/JavaScript, keine
externen Bezüge. Rechenhilfe für freie einfache Ausdrücke. Klare Hinweise zu
Dezimalzeichen, fehlenden Werten, Formelfehlern, Division durch null und Kreisbezügen.
Die Tabelle erscheint erstmals im vierten Theorieblock und bleibt später aufklappbar.
Berechnete Geldpositionen auf Cent runden; Verhältnisse intern ungerundet lassen.
Begrenzte exakte rationale Zwischenwerte verhindern binäre Halbcentfehler.

- Kosten: 80 h, direkter Personalkostensatz 35 €/h, 400 € Fremdkosten und
  20 % Gemeinkostenzuschlag auf Personalkosten ergeben 2.800 € Personalkosten,
  560 € Gemeinkosten und 3.760 € Selbstkosten. Keine doppelte Gemeinkostenrechnung
  bei bereits enthaltenen Vollkosten; Kosten und Preis unterscheiden.
- Preis: 3.760 € Selbstkosten, 25 % Gewinnaufschlag und vorgegebene 19 % USt
  ergeben 940 € Gewinn, 4.700 € netto, 20 % Marge, 893 € USt und 5.593 € brutto.
  Aufschlag bezieht sich auf Kosten, Marge auf Nettoerlös. Umsatzsteuer ist im
  Modell kein Gewinn. Rabatt und Skonto werden an eigenen vorgegebenen
  Beispielen mit klaren Bezugsgrößen erklärt.
- Wirtschaftlichkeit: 12.000 € Fixkosten, 150 € Stückpreis, 90 € variable
  Stückkosten, 250 Stück, 6.000 € Investition und gleichmäßiger jährlicher
  Netto-Rückfluss von 3.000 €. Ergebnisse: 60 € Stückdeckungsbeitrag,
  Gewinnschwelle 200 Stück, 3.000 € Periodenergebnis, zwei Jahre einfache
  Amortisation. Gebrochene Gewinnschwellen für ganze Stück aufrunden;
  die Tabelle zeigt die rechnerische Schwelle. Keine endliche Gewinnschwelle
  bei Deckungsbeitrag ≤ 0. Keine Amortisationsgarantie; keine Zinsen im Modell.

Keine breite Tabellenkalkulation, XLSX-Bibliothek oder Uploadfunktion nötig.
Keine echten Finanzdaten oder privaten Buchdaten. Kein Commit, Push oder
Installerbau; abschließend den normalen Webserver aktualisieren.

## Abnahme

1. Theorie und Aufgaben abgleichen, alle 140 neuen Fragen unabhängig einzeln
   sowie aktuelle Primärquellen prüfen. Alle zehn PM-Themen im Rückblick.
2. Tabelle löst Fälle mit eigenen Formeln oder Zahlen, versteht Zellbezüge und
   Summen, berechnet Abhängigkeiten neu und erklärt Eingabe-/Rechenfehler.
3. Formeln erlauben keinen Code-, Netzwerk- oder Dateizugriff; Größe und Tiefe begrenzt.
4. 26 Ablagen getrennt; bisherige 16 Stände und Backups erhalten. Tabelle nach
   Neuladen, Sicherungsimport und Desktopneustart wiederhergestellt.
   Speicherfehler, Quota und konkurrierende Änderungen bleiben abgesichert.
5. Alte und neue Manifestverträge, passende KI-Kontexte ohne Prüfungslösungen
   oder Privates, Navigation WISO → PM → geplantes LF2 und Abschlussgrenzen geprüft.
6. Inhalt, Rechenparser, Zustand, Backend, Desktop, Browser, Mobil/Tastatur
   und Build grün. Frische unabhängige Fach- und Technikreviews; sachliche
   Dokumentation und grüner Archivcheck.

## Ergebnis und Prüfung

Zehn PM-Themen mit 30 Lernzielen, 40 Theorieblöcken, 140 eigenen Fragen,
30 Reflexionen und 60 Karten ergänzt. Drei lokale Rechentabellen unterstützen
eigene Zahlen, Formeln, Rechenhilfe, Rückmeldung und gespeicherte Entwürfe.
Die Lernreise umfasst jetzt 94 geplante und 26 freigegebene Themen mit insgesamt
364 eigenen Fragen. Die 7.000 bisherigen Modulfragen bleiben unverändert.

Unabhängige Reviews mit frischem Kontext:

- Grundlagenreview: alle 70 Fragen, 20 Blöcke, 15 Reflexionen, 30 Karten und
  15 Ziele der ersten fünf Themen einzeln geprüft, einschließlich 13 aktueller
  öffentlicher Primärquellen. Positionsbezug, Distraktorschemen und Tagesraster
  korrigiert und nachgeprüft. Keine offenen Befunde.
- Wirtschaftsreview: alle 70 Fragen, 20 Blöcke, 15 Reflexionen, 30 Karten und
  15 Ziele der letzten fünf Themen einzeln geprüft, einschließlich öffentlicher
  IHK-, EU-, Scrum- und bayerischer Fachquellen. Rundungstexte, Theoriebezüge,
  Antwortlängen und Gewinnschwellenanzeige korrigiert und nachgeprüft.
  Vollständiger Rückblick aller zehn Themen; keine offenen Befunde.
- Technikreview: Parser, Tabellen, 26 getrennte Speicherablagen, Sicherungen,
  alte/neue Manifestverträge, DTO-/KI-Grenzen, Reihenfolge, Abschlussgrenzen und
  öffentliche Quellenhosts geprüft. Zusätzlich 5.712 Rundungsfälle und zwölfzellige
  Kreis-/Kleinstwertketten ausgeführt. Keine offenen Befunde.

Ein früher Rundungsbefund wurde durch exakte rationale Zwischenwerte behoben:
1,5 × 99,99 ergibt kaufmännisch 149,99; 0,15 × 25,50 ergibt 3,83. Musterprüfung
und Nutzerrechnung verwenden die begrenzte Grammatik, aber getrennte Ergebniszellen.
Bei 12.000,01 / 60 kennzeichnet die Anzeige die Näherung; die exakt berechnete
kleinste ganze Menge ohne Verlust lautet 201 Stück.

Technische Prüfung abgeschlossen:

- Inhaltsvalidator gültig: 94 Themen, 248 Lernziele, 26 freigegebene Abschnitte,
  364 getrennte Lernreisefragen.
- 247 Inhalts-/Zustands-/Reihenfolge-/Rechenfälle, 530 Backendfälle und
  43 Desktopfälle grün; Backendtests ohne Datenbank, private Konfiguration
  oder echte KI-Anfragen. Gezielte Backend-Codeprüfung ohne Befund.
- Browsermatrix: 68 Fälle im Gesamtlauf grün, drei neue Tabellenfälle zunächst
  wegen mehrdeutiger Status-Auswahl im Test gestoppt. Prüfmeldung eindeutig
  zugänglich benannt, Tests gezielt angepasst und alle drei Fälle erfolgreich
  wiederholt; enge Änderung unabhängig nachgeprüft. Damit 71 Fälle abgedeckt,
  einschließlich aller zehn vollständigen PM-Abläufe und sechs echten
  Electron-Szenarien. Keine Produktfehler hinter dem Status-Auswahlbefund.
- Tabellen: eigene Formeln, Kreisbezüge, lokale Speicherung, Sicherungsimport,
  Nachbarstände und exakte ganze Gewinnschwelle geprüft. Mobile Ansicht bei
  390 px ohne Seitenüberlauf, Eingabe/Tastatur/seitliche Tabellenansicht und
  Aktionen geprüft; Screenshot visuell angesehen.
- Frontendbuild erfolgreich; bekannte Warnung zu großen bestehenden Bündeln.
  Service Worker v63. Laufende Web-App auf Port 3002 kontrolliert aktualisiert:
  7.000 Modulfragen aus bestehender Datenbank, Login/Sync aktiv; öffentliche
  Lernreise-API bestätigt 26/94 und WISO → PM → geplantes LF2.
- README, Inhaltsdokumentation, Plan und offene Folgearbeit aktualisiert.
  Keine neuen Installationspakete, kein Commit oder Push. Abschließender
  Archivcheck und Diff-Whitespace-Prüfung erfolgreich.
