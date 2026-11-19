# FE-075 – LF2: Arbeitsplätze nach Kundenwunsch ausstatten

Status: done
Bereich: CONTENT / FE / BE
Angelegt: 2026-11-11

## Auftrag

Alle sieben geplanten LF2-Themen nach Projektmanagement ausarbeiten und in den
bestehenden Lernablauf mit getrenntem Fortschritt, Sicherung und Auswertung
einbinden. Öffentliche eigene Inhalte, keine privaten Dokumente oder Zugangsdaten.
Keine neuen Bibliotheken, kein Commit/Push/Installer. Normalen Webserver zuletzt
aktualisieren. Bestehende fremde Arbeitsänderungen bleiben erhalten.

## Allowlist

- README.md
- content/learning-journey/fiae.v1.json
- content/learning-journey/README.md
- content/learning-journey/topics/common-lf2-requirements.v1.json
- content/learning-journey/questions/common-lf2-requirements.v1.csv
- content/learning-journey/topics/common-lf2-hardware.v1.json
- content/learning-journey/questions/common-lf2-hardware.v1.csv
- content/learning-journey/topics/common-lf2-software.v1.json
- content/learning-journey/questions/common-lf2-software.v1.csv
- content/learning-journey/topics/common-lf2-workplace.v1.json
- content/learning-journey/questions/common-lf2-workplace.v1.csv
- content/learning-journey/topics/common-lf2-comparison.v1.json
- content/learning-journey/questions/common-lf2-comparison.v1.csv
- content/learning-journey/topics/common-lf2-procurement.v1.json
- content/learning-journey/questions/common-lf2-procurement.v1.csv
- content/learning-journey/topics/common-lf2-handover.v1.json
- content/learning-journey/questions/common-lf2-handover.v1.csv
- backend/src/journey.js
- backend/test/journey.test.js
- backend/test/journey-ai.test.js
- scripts/validate-learning-journey.mjs
- scripts/test/learning-journey-content.test.mjs
- scripts/test/journey-state.test.mjs
- scripts/test/journey-workplace.test.mjs
- frontend/src/utils/journeyWorkplace.js
- frontend/src/components/JourneyWorkplace.jsx
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
- e2e/tests/journey-lf2.spec.js
- docs/61-Lernreise-FIAE-Planung.md
- docs/69-Lernreise-LF2.md
- docs/agent-briefs/FE-075-lernreise-lf2.md
- docs/agent-briefs/STATUS.md
- docs/agent-briefs/DONE.md

## Inhaltsvertrag

Bestehende IDs, Titel, Ziele, Voraussetzungen, Fassungen und Planversion 1.0.0
beibehalten. Plan bleibt 94 Themen / 248 Ziele; sieben LF2-Themen mit 17 Zielen
ergänzen 26 auf 33 Freigaben (61 geplant). Eigene CSVs SC/ALLE/HARDWARE/LF2,
Präfix LJ-LF2-<GROSSER-SUFFIX>-Q01…Q06 und E01…E08. Je vier Theorieblöcke,
sechs Quizfragen, acht getrennte Testfragen, drei Reflexionen, sechs Karten.
Jede geprüfte Kenntnis zuvor erklären; alle Ziele in beiden Fragenphasen,
Karten und Reflexionen abdecken. Erst vollständige unabhängige Fachreviews
aller 98 neuen Fragen erlauben reviewed/checkedAt und content-ready.
Öffentliche Primärquellen aktuell browsen; eigene fiktive, klar vorgegebene
Geräte-/Preis-/Lizenzangaben statt unsicherer Marktbehauptungen. Keine langen
Quellenkopien oder privaten Buchtexte. Antwortoptionen werden gemischt:
Positionen sind kein Fehler; Längenbias, exklusive wiederkehrende falsche
Phrasen und dreifach gleiche Distraktoreinstiege dagegen prüfen (AGENTS.md).

### common-lf2-requirements – Kundenwünsche als prüfbare Anforderungen
Voraussetzungen: common-lf1-role
- common-lf2-requirements-clarify: Aus einem Gespräch offene Fragen und messbare Anforderungen an einen Arbeitsplatz ableiten.
- common-lf2-requirements-plan: Für einen kleinen Ausstattungsauftrag Arbeitsschritte, Zuständigkeiten und Termine abstimmen.

### common-lf2-hardware – Hardware nach Einsatzzweck auswählen
Voraussetzungen: common-lf2-requirements
- common-lf2-hardware-parts: Die Aufgaben von Prozessor, Arbeitsspeicher, Massenspeicher und Peripherie im Arbeitsplatz erklären.
- common-lf2-hardware-fit: Anhand vorgegebener Datenblätter die Leistung und Kompatibilität zweier Ausstattungen beurteilen.

### common-lf2-software – Betriebssysteme, Anwendungen und Nutzungsrechte
Voraussetzungen: common-lf2-hardware
- common-lf2-software-fit: Betriebssystem und Anwendungssoftware anhand von Aufgaben und Systemvoraussetzungen auswählen.
- common-lf2-software-license: Aus vorgegebenen Lizenzbedingungen erlaubte Nutzung, Anzahl der Installationen und laufende Kosten ableiten.

### common-lf2-workplace – Ergonomie, Sicherheit und Energiebedarf
Voraussetzungen: common-lf2-hardware
- common-lf2-workplace-risk: An einem Arbeitsplatz ergonomische und elektrische Gefährdungen erkennen und geeignete organisatorische Maßnahmen benennen.
- common-lf2-workplace-energy: Mit vorgegebener Leistung und Nutzungsdauer den Energiebedarf zweier Arbeitsplatzvarianten vergleichen.
- common-lf2-workplace-lifecycle: Reparatur, Weiternutzung und fachgerechte Entsorgung bei einer Beschaffungsentscheidung berücksichtigen.

### common-lf2-comparison – Produkte und Lieferangebote vergleichen
Voraussetzungen: common-lf2-software, common-lf2-workplace
- common-lf2-comparison-criteria: Technische Angaben auch aus einem kurzen englischen Datenblatt in eine gewichtete Vergleichsmatrix übertragen.
- common-lf2-comparison-cost: Zwei Lieferangebote mit vorgegebenen Rabatten, Bezugskosten und Lieferbedingungen vergleichen.

### common-lf2-procurement – Angebot erstellen und Beschaffung verfolgen
Voraussetzungen: common-lf2-comparison, common-wiso-consumer
- common-lf2-procurement-offer: Aus Einkaufskosten und vorgegebenen Zuschlägen ein nachvollziehbares Kundenangebot berechnen.
- common-lf2-procurement-order: Bestellung, Wareneingang und Rechnung einem Beschaffungsablauf zuordnen.
- common-lf2-procurement-deviation: Bei einer mangelhaften oder verspäteten Lieferung den Sachverhalt dokumentieren und die zuständige Stelle einbeziehen.

### common-lf2-handover – Arbeitsplatz einrichten und übergeben
Voraussetzungen: common-lf2-procurement
- common-lf2-handover-setup: Eine vorgegebene Einrichtung in nachvollziehbaren Schritten durchführen und die geforderten Funktionen prüfen.
- common-lf2-handover-handover: Ergebnisse, Einweisung und offene Punkte in einem Übergabeprotokoll festhalten.
- common-lf2-handover-review: Aufwand und Kundenergebnis mit dem Auftrag vergleichen und eine Verbesserung für den nächsten Auftrag ableiten.

## Integration

Alle 26 LF1-/WISO-/PM-Themen als Zugangsvoraussetzungen für LF2, danach
fachliche Voraussetzungen plus vorheriges verfügbares Thema. PM-Ende führt
zu LF2, LF2-Ende zu geplantem LF3. Alte 84/13- und 94/14-Manifeste mit
1/2/6/16/26 Freigaben bleiben lesbar; Erweiterung auf 33 feste Themenverträge.
Sieben neue feste Web-/Desktopablagen; alte 26 Lernstände, Backups und drei
PM-Tabellen unverändert. Keine Kontosynchronisation neuer Zustände.

Handover enthält fieldReview für alle sieben LF2-Themen: Block 4, Reflexion 3
und alle acht Testfragen. Block 4 wiederholt konkrete Kenntnisse aller sieben
Themen; Abschlussfragen daraus lösbar. In Reflexion 2 steht practice im
bestehenden Format task/checklist/confirmation, zusätzlich zur LF1-Präsentation.
Neue UI unterscheidet die beiden Praxisarten. Kein manipulationssicheres
Zertifikat oder Nachweis echter Hardwarekonfiguration wird behauptet.

## Begrenzte Einrichtungsübung

Nur beim Thema handover: eigene lokale Modellübung, keine echten Systemrechte,
Installationen, Dateien, Konten oder Netzwerkverbindungen. Auftrag für fiktiven
Büroplatz: mindestens 16 GB RAM, 512 GB SSD, zwei digitale Bildschirmausgänge,
freigegebener Browser, Standardkonto, Updates und zwei eingerichtete Bildschirme.
Drei vorgegebene Gerätemodelle, klar beschriebene Daten; zwei erfüllen den Bedarf.
Fiktive Softwarewahl (freigegebener Browser oder ungeprüfte Testversion),
Kontotyp (Standard/Administrator), Updates und Bildschirmzahl. In der Übung
einen Arbeitsordner erstellen, feste synthetische Testdatei anlegen und wieder
öffnen. Danach Funktionen prüfen und automatisch erzeugtes Übergabeprotokoll
lesen. Fehler dürfen korrigiert werden; Änderungen verwerfen den vorherigen
Prüfstatus. Keine freie Codeausführung oder Prüfung nach Schlagwörtern.

Strikter, begrenzter optionaler workplace-Zustand nur für handover: feste
Auswahlwerte, Booleans für Arbeitsschritte und Prüfstatus; im jeweiligen
Reisestand/Backup erhalten. Reflexion 2 kann erst nach erfolgreicher Modellprobe
und bewusster Selbstbestätigung weitergehen. Nach Abschluss dieser Reflexion
bleibt die Probe lesbar, ihre Eingaben gesperrt; keine nachträgliche Verfälschung
des gespeicherten Abschlusses. Alte andere Themen benötigen keine Probe.
Erweiterte Zustandsprüfung verhindert erfundene fertige Schritte mit fehlender
Probe. App erklärt ausdrücklich Modellübung und Grenze zur Einrichtung echter
Hardware; zusätzliche Praxis nur an freigegebenen Übungsgeräten unter Anleitung.

## Abnahme

1. Alle 98 Fragen, 28 Blöcke, 21 Reflexionen und 42 Karten fachlich unabhängig
   vollständig geprüft, Quellen aktuell. Gerätekompatibilität, Lizenzannahmen,
   ergonomische/elektrische Sicherheit, W→kWh-Rechnung, Nutzwert/Preisvergleich,
   Einkauf/Angebot/Nachlässe und Übergabe sauber abgegrenzt.
2. Alle sieben Lernabläufe bis zur Auswertung, gespeicherte Fortsetzung,
   fehlende Voraussetzungen und LF2-Abschlussgrenzen geprüft.
3. Modellübung: falsche und mehrere passende Konfigurationen, Reihenfolge,
   Testdatei, Korrektur, Prüfstatus, Selbstbestätigung, Neuladen und Sicherung.
   Ein echter Electron-Neustart erhält alle 33 getrennten Themenstände.
4. Alte Inhalte/Backups und PM-Tabellen unverändert; KI bleibt optional und
   blockbezogen, keine Lösungen oder privaten Daten im Cloudkontext.
5. Inhalts-/Zustands-/Backend-/Desktop-/Browsertests, Mobil/Tastatur und Build
   erfolgreich; frischer technischer Review, sachliche Dokumentation und
   Archivcheck grün. Keine Nutzung echter privater Dateien in Tests.

## Review und Umsetzung

Die sieben Inhalte sind nach zwei frischen vollständigen Fachreviews freigegeben:

- Grundlagenreview: alle 56 Fragen, 16 Blöcke, zwölf Reflexionen, 24 Karten und
  neun Ziele der ersten vier Themen, einschließlich 15 öffentlicher Primärquellen.
  Antwortschablonen korrigiert und nachgeprüft; Bildschirmkompatibilität um
  Auflösung und Bildrate präzisiert. Keine offenen Befunde.
- Angebots-/Übergabereview: alle 42 Fragen, zwölf Blöcke, neun Reflexionen,
  18 Karten und acht Ziele der letzten drei Themen. Sämtliche Rechenwege,
  sieben Themen im Abschlussrückblick und die Modellpraxis geprüft. Gerätenamen,
  eine RAM-/Speicheroption und der Soll-/Ist-Stundenvergleich korrigiert und
  nachgeprüft. 15 verwendete öffentliche Primärquellen aktuell abgeglichen.
  Keine offenen Befunde; 99 eindeutige Quellen im Gesamtmanifest konfliktfrei.
- Technikreview: Modell, Reducer, 33 Ablagen, Sicherungen, Abschlussgrenzen,
  Navigation, Backend-/Validator-Verträge und KI-Kontextgrenzen unabhängig
  geprüft. Beide passenden Geräte, Korrektur mit erneutem Prüfen, bewusste
  Bestätigung und nachfolgende Eingabesperre auch separat ausgeführt.
  Keine offenen Befunde.

Die Modellübung führt keine Betriebssystemaktionen aus. Alle Konfigurationswerte
und Schritte sind fest begrenzt; ihre Daten werden ausschließlich im lokalen
Übergabestand gespeichert. Die vorherigen 26 Ablagen und PM-Tabellen bleiben
erhalten. Der Quellenöffner enthält nur konkret benötigte öffentliche HTTPS-Hosts.

Technische Abschlussprüfung: Inhaltsvalidator mit 94 Themen,
248 Planzielen, 33 freigegebenen Abschnitten und 462 Fragen, 318 Inhalts-/Zustands-/
Rechen-/Modellfälle sowie 44 Desktopfälle grün. Backend-Code und geänderte Tests
wurden unter Berücksichtigung der verwendeten Node-Globals geprüft.

- Backendmatrix: 627 von 628 Fällen im Gesamtlauf grün. Ein bisheriger
  Negativtest erwartete für das jetzt verfügbare LF2 weiter 404. Auf geplantes
  `common-lf3-physical` umgestellt; alle drei betroffenen Negativfälle gezielt
  grün und die enge Änderung unabhängig freigegeben. Keine Produktänderung.
- Browsermatrix: 78 von 81 Fällen im Hauptlauf grün. Drei neue LF2-Fälle
  fanden verschachtelte Selectlabels mit `getByLabel(..., exact: true)` nicht;
  zugängliche Comboboxnamen werden nun direkt genutzt. Die Checkboxprobe wartet
  nach dem Klick auf bestätigte Speicherung und prüft zusätzlich den sichtbaren
  Endzustand, statt den Zwischenzustand vor dem asynchronen Schreiben zu bewerten.
  Alle drei Fälle gezielt grün; Testkorrekturen unabhängig nachgeprüft.
- Alle sieben vollständigen LF2-Themen, beide geeigneten Modelle, Fehlerfälle,
  Sicherung/Neuladen, Nachbarstände, readonly nach Durchführung und sieben echte
  Electron-Szenarien einschließlich 33-Stände-Neustart abgedeckt. Alte Etappen
  und PM-Tabellen bleiben grün. Tests ohne private Konfiguration, Datenbank oder
  echte KI-Anfragen.
- Mobilbild bei 390 px unabhängig angesehen: keine Seitenüberbreite; vollständige
  Gerätedaten zusätzlich unter der Auswahl mit zugänglicher Beschreibung ergänzt.
  Abschließender Build und drei enge Browser-/Electronproben grün; neues
  Mobilbild visuell angesehen, vollständige zugängliche Gerätebeschreibung
  zusätzlich automatisch geprüft. Bekannte Buildwarnung zu großen bestehenden
  Bündeln unverändert.
- Laufende normale Web-App kontrolliert aktualisiert: öffentliche API bestätigt
  33/94, PM → LF2 und sieben Themen im LF2-Rückblick; nächste Etappe LF3 geplant.
  Bestehende Datenbank weiter mit 7.000 Fragen/26 Modulen und aktivem Login/Sync.
  Service Worker v64; neue Pakete, Commit und Push nicht Teil dieses Auftrags.
- README, Inhaltsübersicht, Gesamtplan und Folgearbeit aktualisiert.
  Finale Gerätebeschreibung und Mobilbild unabhängig freigegeben; keine offenen
  technischen oder visuellen Befunde. Archiv- und Diffprüfung abgeschlossen.
