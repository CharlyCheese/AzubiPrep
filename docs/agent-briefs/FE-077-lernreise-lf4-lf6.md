# FE-077 – Lernreise LF4, LF5 und LF6

Status: done
Bereich: CONTENT / FE / BE
Angelegt: 2026-11-16

## Auftrag

Die nächsten drei Lernfelder vollständig nach dem bestehenden Plan ergänzen:
LF4 Schutzbedarfsanalyse, LF5 Datenanwendungen und LF6 Serviceanfragen.
Öffentliche eigene Inhalte auf Grundlage geprüfter öffentlicher Primärquellen.
Private Unterlagen, Suchdaten, Zugangsdaten und Konfiguration nicht lesen oder
verwenden. Keine neuen Pakete, kein Commit/Push/Installer. Bestehende Änderungen
und Lernstände erhalten; normale Web-App nach erfolgreicher Abnahme aktualisieren.

## Allowlist

- docs/agent-briefs/FE-077-lernreise-lf4-lf6.md
- docs/agent-briefs/STATUS.md
- docs/agent-briefs/DONE.md
- docs/61-Lernreise-FIAE-Planung.md
- docs/71-Lernreise-LF4-LF6.md
- README.md
- content/learning-journey/README.md
- content/learning-journey/fiae.v1.json
- content/learning-journey/topics/common-lf4-*.v1.json
- content/learning-journey/topics/common-lf5-*.v1.json
- content/learning-journey/topics/common-lf6-*.v1.json
- content/learning-journey/questions/common-lf4-*.v1.csv
- content/learning-journey/questions/common-lf5-*.v1.csv
- content/learning-journey/questions/common-lf6-*.v1.csv
- backend/src/journey.js
- backend/test/journey.test.js
- backend/test/journey-ai.test.js
- scripts/validate-learning-journey.mjs
- scripts/test/learning-journey-content.test.mjs
- scripts/test/journey-state.test.mjs
- scripts/test/journey-practices.test.mjs
- frontend/src/utils/journeyPractices.js
- frontend/src/pilot/journey-exercise.js
- frontend/src/pilot/js-exercises.js
- frontend/src/components/JourneyPractice.jsx
- frontend/src/components/JourneyEntry.jsx
- frontend/src/pages/LernreiseAbschnitt.jsx
- frontend/src/store/journeyStore.js
- frontend/src/styles/journey.css
- frontend/public/sw.js
- desktop/journey-storage.cjs
- desktop/main.js
- desktop/test/journey-storage.test.cjs
- e2e/tests/journey-next.spec.js
- e2e/tests/journey-lf3.spec.js
- e2e/tests/journey-lf456.spec.js
- e2e/playwright.config.js

## Inhalt und Navigation

94 Themen / 248 Planziele, IDs, Titel, Voraussetzungen und Version 1.0.0
unverändert. LF4 fünf, LF5 acht, LF6 fünf Themen: 18 Freigaben zusätzlich zu
39 bestehenden. Je vier Blöcke, sechs Quizfragen, acht getrennte Testfragen,
drei Reflexionen, sechs Karten; 252 neue Fragen. 57 verfügbar, 37 geplant.
SC/ALLE; lernfeld LF4/LF5/LF6; modul_id IT-SEC-GRUND/LF5-GRUND/SERVICE-GRUND
(die letzten beiden sind ausschließlich lokale Lernreise-Kategorien, keine
Änderung des 7.000-Fragenkatalogs). IDs LJ-LF4/5/6-<SUFFIX>-Q01…Q06/E01…E08.
Alle Ziele in Theorie und beiden Fragephasen, Reflexionen und Karten abdecken.
Genau die Ziele des Manifests übernehmen, keine vorgezogenen Fachthemen.
Abschlussthema je Feld: fieldReview mit allen Themen, Block 4, Reflexion 3,
allen acht Testfragen; Reflexion 2 mit praxisbezogenem task/checklist/confirmation.
LF3 führt zu LF4, LF4 zu LF5, LF5 zu LF6, danach LF7 geplant. Vorherige Etappen
und fachliche Voraussetzungen müssen abgeschlossen sein. Alte Manifestfassungen
mit 1/2/6/16/26/33/39 Freigaben und sämtliche alten Lernstände bleiben lesbar.

## Praktische Abschlüsse

LF4: Geführte Schutzbedarfsanalyse eines fiktiven Servicearbeitsplatzes.
Schutzobjekt/Abhängigkeit, vorgegebene Schadenskriterien für Vertraulichkeit,
Integrität und Verfügbarkeit, begründete Einstufung getrennt von Wahrscheinlichkeit,
Maßnahme, Wirksamkeitsprüfung und Zuständigkeit. Auswahl und Auswertung lokal;
keine tatsächliche Sicherheitskonfiguration. Konkrete Modellvorgaben sichtbar.

LF5: Kleine ausführbare Datenverwaltung mit lokalem synthetischem Bestand.
Geführte Auswahl und Änderung von Datensätzen, sichtbare SQL-Darstellung für
SELECT/WHERE/ORDER BY/INSERT/UPDATE/DELETE im klar begrenzten Übungsmodell.
Eigene kleine JavaScript-Funktion in vorhandener begrenzter QuickJS-Laufzeit
ausführen und mit Normal-, Grenz- und Fehlerfällen prüfen. Keine Host-Ausführung,
kein eval, kein Zugriff auf echte Datenbanken/Dateien/Netzwerk. Theorie erklärt
verwendete Sprachmittel und erwartete Resultate vor der Praxis. Prüfung bezieht
sich auf Ergebnisse und Verträge, nicht auf identischen Lösungstext.

LF6: Durchgängiger fiktiver Servicefall mit Aufnahme, Auswirkung/Dringlichkeit,
vorgegebener SLA, Diagnosebeleg, Freigabe/Rückfall, Lösungskontrolle und Abschluss.
Schrittweise Bearbeitung mit konkreter Rückmeldung, keine echten Tickets oder
Nachrichten. Protokoll bleibt nach Abschluss sichtbar.

Modellstände strikt begrenzt und nur im jeweiligen Abschlussthema erlaubt.
Ausführung erst in Reflexion 2 nach erster abgeschlossener Reflexion; erst
erfolgreiche Prüfung plus bewusste Bestätigung erlaubt Fortschritt. Änderungen
verwerfen Prüfergebnis, abgeschlossene Praxis readonly. Web/Desktopexport,
Import, Neuladen und echter Desktop-Neustart erhalten gültige Zustände.
Keine Modellstände oder Lösungen in KI-Kontexten; KI bleibt optional.

## Abnahme

Vollständiger frischer Inhaltsreview aller 252 Fragen und Begleitmaterialien;
Fachquellen aktuell online prüfen. Optionen werden pro Anzeige Fisher-Yates
gemischt: Rohpositionen kein Finding. Längen-/Detailbias ist ein Finding,
ebenso exklusiv falsche wiederkehrende Phrasen über 3+ Fragen und drei gleiche
Distraktoreinstiege gegenüber abweichender richtiger Option. Generische
Sachwörter (z. B. Kosten, Client) allein sind keine Findings.
Frischer Technikreview unabhängig von Umsetzung; Korrekturen nachprüfen.
18 vollständige Abläufe, drei Praxisabschlüsse mit Fehl-/Grenzfällen, Gates,
alte Lernstände, Export/Import, Desktop-Neustart, mobile Tastaturbedienung prüfen.
Inhalts-, Zustands-, Backend-, Desktop-, Browsermatrix und Frontendbuild grün.
Keine echten privaten Daten oder Cloudanfragen für Tests. Dokumentation und
Archivregister aktualisieren; check-agent-briefs.mjs zwingend grün.

## Ergebnis

- 18 neue Themen mit 46 Zielen, 72 Blöcken, 252 Fragen, 54 Reflexionen und
  108 Karten ergänzt. Gesamt: 57/94 Themen, 149 Ziele, 228 Blöcke, 798 Fragen,
  171 Reflexionen, 342 Karten; 37 geplant. 34 neue Quellen, insgesamt 161 IDs.
- Drei frische Inhaltsreviews prüften vollständig alle 252 Fragen/1008 Optionen
  und Begleitmaterialien. LF4: Schablone und zwei Fachbegriffe korrigiert. LF5:
  positionsabhängige Erklärung, fehlende Variableninitialisierung, SQL-Syntax,
  zwei Antwortschablonen und 0/null-Unterscheidung korrigiert. LF6: zwei
  Theorieverknüpfungen, vollständige Befundlage, Signalwörter und Leerzeichen
  korrigiert. Korrekturen unabhängig nachgeprüft; keine offenen Fachbefunde.
- Schutzbedarfsanalyse mit gesonderten CIA-Begründungen, ausführbare lokale
  Bestandsverwaltung mit SQL-Baukasten und 18 QuickJS-Funktionsfällen sowie
  sechsschrittiger Servicefall integriert. Keine zusätzlichen Pakete.
- Frischer Technikreview: falsche Folgehinweise und Präsentationsanweisung
  korrigiert; SELECT-Ergebnis von unverändertem Bestand getrennt; gespeicherte
  Codeprüfung an testedCode gebunden. Codeänderung und verspätete Ergebnisse
  verwerfen beziehungsweise verhindern eine unpassende Freigabe. Nachreview
  einschließlich Tests/Dokumentation ohne offene P1/P2.
- 473 Inhalts-/Zustands-/Modelltests, darunter 414 Inhaltsverträge, grün.
  Vollständiges Backend: 861 Tests in 25 Dateien grün. Native Desktopmatrix:
  46 Fälle grün. Testkonfiguration ohne echte Datenbank/KI; private .env-Lese-
  zugriffe für Backend-/Browserprozesse abgefangen, isolierte Profile verwendet.
- Frontendbuild erfolgreich, bekannte Größenwarnung bestehender Bündel.
  Die Browsermatrix verwendet für ihren eigenen gestarteten Server explizit
  20.000 Anfragen/Minute; das Betriebslimit bleibt unverändert. Ein zunächst
  unter dem Betriebslimit gestarteter Testlauf wurde nach 429-Befund beendet
  und mit der vorgesehenen Testkonfiguration vollständig neu gestartet.
- Mobile Ansicht bei 390 px: Tabelle, Editor und Schaltflächen ohne Seiten-
  überbreite; echter Tab-/Enter-Ablauf, Funktionstests und Sicherungsimport
  erfolgreich. Screenshot unabhängig visuell geprüft, keine offenen Befunde.
- Normale Web-App auf dem bisherigen lokalen Port gestartet und öffentliche
  API geprüft: LF4 5/5, LF5 8/8, LF6 5/5 verfügbar, LF7 geplant; Service Worker
  v66. Vorhandene Datenbank mit 7.000 Fragen/26 Modulen und Login/Sync unverändert.
- Vollständige Browser-/Electron-Gesamtmatrix: 113/113 grün (5,9 Minuten),
  darunter alle 18 neuen Lernabläufe, praktische Korrekturen, echte QuickJS-
  Zeitgrenze, Sicherung, mobile Tastaturbedienung und vollständiger Electron-
  Neustart mit 57 Themen samt drei neuen Praxisprotokollen. Bestehende Abschnitte
  einschließlich PM-Tabellen, LF2-/LF3-Modelle und Anbietergrenzen bleiben grün.
- README, Inhaltsübersicht, Gesamtplan, LF4–LF6-Dokumentation und Folgearbeit
  aktualisiert. Nächster Inhalt LF7; neue Weitergabepakete bleiben offen.
  Kein Commit/Push. Abschließende Archiv- und Diffprüfung durchgeführt.
