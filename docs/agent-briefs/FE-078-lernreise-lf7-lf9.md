# FE-078 – Lernreise LF7, LF8 und LF9

Status: done
Bereich: CONTENT / FE / BE
Angelegt: 2026-11-16

## Auftrag

Die nächsten drei Lernfelder vollständig nach dem bestehenden Plan ergänzen:
LF7 cyber-physische Systeme, LF8 Datenbereitstellung, LF9 Netzwerke und Dienste.
Eigene öffentliche Lehrinhalte aus aktuell geprüften öffentlichen Primärquellen.
Private Unterlagen, Suchdaten und Zugangsdaten nicht lesen oder verwenden.
Keine neuen Bibliotheken, kein Commit/Push/Installer. Vorhandene Änderungen,
Inhalte und Lernstände erhalten. Normale Web-App nach Abnahme aktualisieren.

## Allowlist

- docs/agent-briefs/FE-078-lernreise-lf7-lf9.md
- docs/agent-briefs/STATUS.md
- docs/agent-briefs/DONE.md
- docs/61-Lernreise-FIAE-Planung.md
- docs/72-Lernreise-LF7-LF9.md
- README.md
- content/learning-journey/README.md
- content/learning-journey/fiae.v1.json
- content/learning-journey/topics/common-lf7-*.v1.json
- content/learning-journey/topics/common-lf8-*.v1.json
- content/learning-journey/topics/common-lf9-*.v1.json
- content/learning-journey/questions/common-lf7-*.v1.csv
- content/learning-journey/questions/common-lf8-*.v1.csv
- content/learning-journey/questions/common-lf9-*.v1.csv
- backend/src/journey.js
- backend/test/journey.test.js
- backend/test/journey-ai.test.js
- scripts/validate-learning-journey.mjs
- scripts/test/learning-journey-content.test.mjs
- scripts/test/journey-practices.test.mjs
- scripts/test/journey-labs.test.mjs
- frontend/src/utils/journeyLabs.js
- frontend/src/components/JourneyLab.jsx
- frontend/src/pilot/journey-exercise.js
- frontend/src/components/JourneyEntry.jsx
- frontend/src/pages/LernreiseAbschnitt.jsx
- frontend/src/store/journeyStore.js
- frontend/src/styles/journey.css
- frontend/public/sw.js
- desktop/journey-storage.cjs
- desktop/main.js
- desktop/test/journey-storage.test.cjs
- e2e/tests/journey-next.spec.js
- e2e/tests/journey-lf456.spec.js
- e2e/tests/journey-lf789.spec.js

## Inhaltsvertrag

94 Themen / 248 Planziele, IDs, Titel, Ziele, Voraussetzungen und Version 1.0.0
unverändert. LF7 fünf, LF8 sechs, LF9 sechs Themen: 17 Freigaben mit 44 Zielen,
68 Blöcken, 238 Fragen, 51 Reflexionen, 102 Karten. Gesamt 74 verfügbar,
20 geplant, 193 Ziele, 296 Blöcke, 1036 Fragen, 222 Reflexionen, 444 Karten.
Je Thema vier Blöcke, sechs Quiz- und acht getrennte Testfragen, drei Reflexionen,
sechs Karten. SC/ALLE, lernfeld LF7/LF8/LF9; modul_id CPS-GRUND/DATEN-GRUND/
NETZ-GRUND. Neue Kategorien ausschließlich im Lernreisebestand; 7.000 reguläre
Modulfragen und Datenbank unverändert. IDs LJ-LF7/8/9-<SUFFIX>-Q01…Q06/E01…E08.
Alle Ziele in Theorie, beiden Fragephasen, Reflexionen und Karten. Fragen nur
auf vorher erklärte Inhalte beziehen. Syntax, Einheiten und Fallannahmen prüfen.
Letztes Thema je Feld: fieldReview aller Themen in Reihenfolge, Block 4,
Reflexion 3 und alle acht Testfragen; Reflexion 2 enthält Praxisvertrag.
LF9-Abschluss erklärt zusätzlich den Übergang von allgemeinen Grundlagen zur
FIAE-Spezialisierung; kein Ausbildungs- oder Kompetenzzertifikat behaupten.

## Praktische Abschlüsse

LF7: lokale Sensor-/Aktor-Simulation mit eigener kleiner Steuerfunktion in der
vorhandenen QuickJS-Laufzeit. Normal-/Grenz-/Fehlerfälle, Verbindungsausfall,
vorgegebene sichere Modellreaktion und nachvollziehbare Energieprüfung.
Keine echten Geräte, elektrischen Arbeiten oder Netzwerkschnittstellen.

LF8: durchgängiger synthetischer Datenbestand mit Duplikaten/Fehlern, Feldzuordnung,
Verknüpfung und Aggregation. Begrenzter lokaler Schnittstellensimulator zeigt
Anfrage, Antwort und Empfängerbestand. Erfolgreiche, fehlerhafte und wiederholte
Übertragung samt Validierung und atomarer Übernahme tatsächlich im Modell prüfen.
Keine echten Tokens, Quellenimporte oder externen Anfragen. Vertrag klar sichtbar.

LF9: begrenztes Netz-/Dienstmodell mit Konfiguration, DNS-/Portabhängigkeiten,
Segmentierung und positiven sowie negativen Zugriffsproben. Dienstfehler erkennen,
beheben und protokollieren; Sicherung/Wiederherstellung/Redundanz unterscheiden.
Dokumentationsnetze, keine echte Netzwerkkonfiguration, Shell oder Scans.

Neue lab-Zustände nur in den drei Abschlussthemen. Praxis erst in Reflexion 2
nach erster Reflexion; strikte Felder/Größen/Schrittfolgen, Änderungen verwerfen
Prüfstatus, Codeprüfung an geprüften Quelltext binden, abgeschlossene Schritte
readonly. Erfolgreiche Praxis plus bewusste Bestätigung vor dem Fortschritt.
Sicherungen, Wiederaufnahme und echter Desktop-Neustart erhalten Zustände.
Alte 57 Ablagen und Manifestfassungen bleiben kompatibel. Modellstände und Code
werden nicht in KI-Kontexte aufgenommen; KI ist optional, private Ergänzung lokal.

## Abnahme

Frischer unabhängiger Vollreview aller 238 Fragen und zugehörigen Inhalte mit
aktuellen öffentlichen Primärquellen. Optionen werden Fisher-Yates gemischt:
Rohbuchstabenverteilung kein Finding. Richtige Antworten durchgehend länger/
detailreicher, exklusiv falsche wiederkehrende Phrasen über 3+ Fragen oder drei
gleiche Distraktoreinstiege bei abweichender richtiger Antwort sind Findings.
Generische Fachwörter wie Kosten/Client allein sind keine Findings.
Frischer Technikreview, Korrekturen nachprüfen. Alle 17 Abläufe, Praxisfehler,
Codegrenzen, Import/Export, Sperren, alte Zustände, Mobil/Tastatur und echter
Electron-Neustart prüfen. Inhalts-/Zustands-/Backend-/Desktop-/Browsermatrix,
Build und öffentliche normale App-API grün. Isolierte synthetische Testdaten,
keine echten DB-/KI-Anfragen. Sachliche Dokumentation und Archivregister;
check-agent-briefs.mjs zwingend grün vor Fertigmeldung.

## Ergebnis

- 17 Themen mit 44 Zielen, 68 Blöcken, 238 Fragen, 51 Reflexionen und 102
  Karten ergänzt. Manifestversion/94 Themen/248 Planziele unverändert;
  74 Themen freigegeben. 35 neue Quellen-IDs, insgesamt 196.
- Drei frische unabhängige Fachreviews haben alle 238 Fragen samt 952 Optionen
  und sämtliche Begleitmaterialien geprüft. LF7: Reihenfolge der Energieprüfung
  und Abschlussformulierung präzisiert. LF8: SUM-Begriff, Regionsfrage, eine
  Distraktorschablone, Feldnamen/Mapping und Ein-Lieferungs-Grenze korrigiert.
  LF9: 17 Frageformulierungen ausgeglichen, Praxisablauf und Dokumentationsnetze
  präzisiert, Pseudonymisierung und Quellenverweise ergänzt. Alle Nachreviews
  ohne offene Inhaltsbefunde; Reviewed-Datum 2026-11-16.
- Sensorsteuerung führt eigenen Code mit Normal-/Grenz-/Fehlerproben und
  Wiederanlauf nach ungültigem Wert aus. Datenlabor bildet Feldzuordnung,
  Bereinigung, Join, Gruppierung und atomaren Empfängerbestand tatsächlich ab.
  Netzwerkmodell verlangt erfolgreiche Mitarbeiter- und gesperrte Gastprobe.
  Drei themengebundene Laborzustände ergänzen die bisherigen Speicherverträge.
- Frischer Technikreview: LF8-Konflikt musste in der verlangten Reihenfolge
  denselben Schlüssel betreffen; korrigiert und mit Gegenfolge getestet.
  Asynchrones LF7-Prüfergebnis wartet nun gleichzeitig geschriebene Notizen ab,
  prüft danach Lernphase und Quelle erneut. Unabhängiger Nachreview ohne offene
  Codebefunde. Ausführlicher Browser-Regressionsfall ergänzt.
- 537 Inhalts-/Zustands-/Modelltests, 987 Backendtests in 25 Dateien und 47
  native Desktopfälle grün. Backend-/Browserprozesse verwenden abgefangene
  private .env-Lesezugriffe und isolierte synthetische Testprofile; keine echten
  Datenbank- oder Modellanfragen innerhalb der Prüfungen.
- Browser-/Electronmatrix: 147 Fälle, davon 146 im Gesamtlauf grün (8,3 Minuten).
  Ein LF9-Testselektor traf aktuellen Befund und verborgenes Protokoll zugleich;
  auf aktuelle Statusmeldung eingegrenzt und gezielt grün nachgeprüft. Danach
  alle drei erweiterten Mobilproben grün (17,2 Sekunden). Keine Produktänderung
  nach dem Gesamtlauf; alle 147 Fälle damit erfolgreich abgedeckt.
- Alle 17 neuen vollständigen Lernabläufe, falsche Steuerfunktion, gelatchter
  Fehlerzustand, Zeitgrenze, Empfängerbestand, Netzwerk-Gegenproben, Sicherung,
  Reflexions-Speicherrennen und echter Electron-Neustart mit 74 Themenständen
  geprüft. Gemeinsame QuickJS-Host-/Zeit-/Stack-/Heap-/Ausgabe-/Jobgrenzen bleiben
  grün. Bestehende Abschnitte und optionale Anbietergrenzen ebenfalls grün.
- Drei mobile Viewport- und Elementaufnahmen bei 390 px unabhängig geprüft.
  Keine Seitenüberbreite, Weiter-Schaltflächen nicht überdeckt, Fokus und Enter
  übernehmen den nächsten Schritt. Keine offenen Technik-/Layoutbefunde.
- Frontendbuild erfolgreich, bekannte Größenwarnung bestehender Bündel.
  Normale Web-App auf bisherigem lokalen Port neu gestartet und öffentlich
  geprüft: 74 Themen, LF7 5/5, LF8 6/6, LF9 6/6, LF10a in Vorbereitung, SW v67.
  Vorhandene Datenbank liefert weiterhin 7.000 Fragen/26 Module, Login/Sync aktiv.
- README, Inhaltsübersicht, Gesamtplan, LF7–LF9-Dokumentation und Folgeschritt
  aktualisiert. Nächste Etappe LF10a; neue Weitergabepakete bleiben offen.
  Kein Commit/Push. Archivregister und abschließende Diffprüfung aktualisiert.
