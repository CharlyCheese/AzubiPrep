# FE-072 – Lernreise: restliche LF1-Themen und Lernfeldabschluss

Status: done
Bereich: CONTENT / FE / BE
Angelegt: 2026-11-11

## Ziel

LF1 im veröffentlichten Lernreiseplan vollständig ausarbeiten und einbinden:
Kunden/Lieferanten/Wettbewerb, Wertschöpfung, Organisation/Entscheidungsspielräume
und Unternehmensvorstellung. Ein veröffentlichter Rückblick, eine tatsächliche
Präsentationsaufgabe mit bewusst bestätigter Selbstprüfung und die sechs
bestandenen Themenchecks ermöglichen den LF1-Abschluss innerhalb der App.

## Allowlist

- README.md (nur Lernreise-Funktionsumfang)
- content/learning-journey/fiae.v1.json
- content/learning-journey/README.md
- content/learning-journey/topics/common-lf1-market.v1.json (neu)
- content/learning-journey/topics/common-lf1-value-chain.v1.json (neu)
- content/learning-journey/topics/common-lf1-organization.v1.json (neu)
- content/learning-journey/topics/common-lf1-presentation.v1.json (neu)
- content/learning-journey/questions/common-lf1-market.v1.csv (neu)
- content/learning-journey/questions/common-lf1-value-chain.v1.csv (neu)
- content/learning-journey/questions/common-lf1-organization.v1.csv (neu)
- content/learning-journey/questions/common-lf1-presentation.v1.csv (neu)
- scripts/validate-learning-journey.mjs
- scripts/test/learning-journey-content.test.mjs
- scripts/test/journey-state.test.mjs
- backend/src/journey.js
- backend/test/journey.test.js
- backend/test/journey-ai.test.js
- frontend/src/store/journeyStore.js
- frontend/src/components/JourneyEntry.jsx
- frontend/src/pages/LernreiseAbschnitt.jsx
- frontend/src/styles/journey.css
- frontend/public/sw.js
- desktop/journey-storage.cjs
- desktop/main.js (nur zusätzliche ausdrücklich geprüfte Quellenhosts)
- desktop/test/journey-storage.test.cjs
- e2e/tests/journey-next.spec.js
- e2e/tests/journey-lf1.spec.js (neu)
- docs/66-Lernreise-LF1-Abschluss.md (neu)
- docs/61-Lernreise-FIAE-Planung.md (Fortschritt)
- docs/63-Lernreise-LF1-App.md (Fortschritt)
- dieser Brief, docs/agent-briefs/STATUS.md, docs/agent-briefs/DONE.md

## Inhalts- und Integrationsvertrag

- Bestehende Themen/Ziele/Voraussetzungen unverändert; Planversion 1.0.0.
  Vier neue Themen mit jeweils vier Theorieblöcken, sechs Quizfragen,
  acht separaten Testfragen, drei Reflexionen und sechs Karten. Fragepräfixe
  LJ-LF1-MARKET, LJ-LF1-VALUE-CHAIN, LJ-LF1-ORGANIZATION, LJ-LF1-PRESENTATION.
  CSV: SC, ALLE, WISO, LF1. Eigene Formulierungen und öffentliche Primärquellen.
- Keine privaten PDFs, RAG-/KI-Kontoablagen oder .env manuell lesen. Keine
  daraus abgeleiteten öffentlichen Texte; keine echten Cloudaufrufe für Tests.
- Aktuelle öffentliche Rechtsgrundlagen bei Organisation/Haftung/Befugnis
  prüfen. Begrenzte Grundlagen erklären, keine pauschalen Haftungsgarantien.
- Veröffentlichter LF1-Rückblick im letzten Präsentationsthema: vierter Block
  wiederholt die sechs Themen an einem gemeinsamen Fall, dritte Reflexion
  enthält konkrete Rückblickaufgaben samt Kernpunkten. Im Thema Metadaten
  `fieldReview: { fieldId: 'LF1', topicIds: [alle sechs in Reihenfolge],
  blockIds: [Rückblickblock], interviewIds: [Rückblickimpuls],
  questionIds: [alle acht finalen Testfragen] }`.
  Der letzte Test beurteilt die fachlich passende Unternehmensdarstellung
  anhand aller sechs wiederholten Bereiche, ohne neue Voraussetzung.
- Zweite Reflexion im Präsentationsthema enthält zusätzlich
  `practice: { task: Text, checklist: [Texte], confirmation: Text }`.
  Aufgabe: eine eigene kurze Darstellung mit Text/Skizze bzw. Folien erstellen,
  tatsächlich vortragen (auch allein), anhand Kriterien prüfen/verbessern.
  Keine Dateiübertragung nötig. Vor Abschluss dieses Reflexionsschritts muss
  die eigene Durchführung bewusst bestätigt werden. Der gespeicherte Schritt
  belegt Selbstbestätigung, keine automatische Qualitätsbewertung.
- Backend liefert practice/fieldReview ausschließlich aus geprüften Inhalten.
  DTO additionally `navigationPrerequisites` als fachliche Voraussetzungen plus
  vorheriges verfügbares Thema für geführte Reihenfolge; `prerequisiteTopics`
  entspricht dieser Vereinigungsmenge. Fachliche Voraussetzungen selbst bleiben
  unverändert. `field` im DTO: {id,title,topicIds,reviewTopicId}; Zusammenfassung
  `fields` ebenso ergänzen. Abschluss nur wenn alle sechs gültigen Themenstände
  bestanden sind und veröffentlichter Rückblick vorhanden ist.
- Alle bestehenden Webschlüssel/Desktopdateien behalten ihre Namen. Neue Themen
  eigene feste Dateien/Schlüssel, keine Migration/Altdatenüberschreibung.
  Keine DB-/7000-Bestandsfragenänderung, Bibliothek, Installer, Commit oder Push.

## Abnahme

1. Alle sechs LF1-Themen verfügbar, vier neue fachlich/didaktisch vollständig.
   Alle 56 neuen Fragen einzeln frisch gegen öffentliche Quellen, Theorie und
   Distraktorqualität geprüft. Karten/Reflexionen decken sämtliche Ziele ab.
2. LF1-Rückblick deckt alle sechs Themen nachvollziehbar ab. Praktisches
   Präsentieren wird tatsächlich angeleitet und bewusst selbst bestätigt,
   nicht als durch Multiple Choice oder KI objektiv bewiesen dargestellt.
3. Geführte Reihenfolge, Themenwechsel, Fortsetzung, Nachlesen und Wiederholung
   funktionieren. LF1-Abschluss erscheint erst nach allen sechs bestandenen
   Themen; FIAE/WISO/weitere Lernfelder bleiben ausdrücklich offen.
4. Alte zwei Lernstände unverändert verwendbar; sechs isolierte Ablagen und
   Sicherungen, Quoten/Fehler/CAS erhalten den letzten bestätigten Stand.
   Falsches Thema/Version/Dateipfad/Fragenpool wird abgewiesen.
5. Theoriehilfe/KI-Gespräch bindet ausschließlich den jeweiligen geprüften
   Themenkontext; private Kontexte bleiben wie bisher lokal. Ohne KI nutzbar.
6. Inhalts-, Backend-, Speicher-, Desktop- und Browserprüfungen samt vollständigen
   vier neuen Abläufen, Präsentationsbestätigung, Abschlussgrenzen, Reload,
   Sicherung und Desktopneustart grün. Mobile/Keyboard geprüft, Build grün.
7. Frische unabhängige Inhalts- und Technikreviews, sachliche Doku, Archivcheck
   grün. Ergebnis nennt Umfang und Grenzen ehrlich.

## Ergebnis und unabhängige Reviews

- Vier neue Themen eingebunden; LF1 umfasst jetzt alle sechs geplanten Themen
  und 15 Lernziele, 24 Theorieblöcke, 84 separate Lernreise-Fragen, 18 Reflexionen
  und 36 Karten. Weitere 78 Themen einschließlich WISO bleiben offen.
- Zwei frische unabhängige Fachreviews prüften sämtliche 56 neuen Fragen,
  Lösungen/Erklärungen, Theoriebezüge, 16 Blöcke, 12 Reflexionen und 24 Karten.
  Aktuelle KMK-/FIAusbV-Quellen, GmbHG/BGB und Bundeswirtschaftsministerium
  geprüft; globale Abdeckung aller 15 geplanten LF1-Ziele ebenfalls bestätigt.
- Korrigiert: sprachliche Distraktorschablonen MARKET-E02, VALUE-CHAIN-E02/E03;
  positionsabhängige Erklärungen VALUE-CHAIN-E03 und ORGANIZATION-E08 neutralisiert.
  Korrekturen nachgelesen; beide Fachreviews anschließend ohne offene Findings.
- Letztes Thema enthält veröffentlichten Rückblick über sechs Themen sowie
  tatsächliche Präsentationsaufgabe mit Kriterien, Verbesserung und bewusster
  Selbstbestätigung. Ohne Bestätigung kann dieser Reflexionsschritt nicht
  abgeschlossen werden. Keine automatische Bewertung realer Vortragsqualität.
- Navigation führt in Reihenfolge durch alle sechs Themen. Abschlussanzeige
  verlangt sämtliche gültigen bestandenen Themenstände plus veröffentlichten
  Rückblick. Unvollständige/ungültige Stände zeigen keinen falschen Abschluss;
  aktualisierte andere Tabs werden berücksichtigt. FIAE-Abschluss bleibt offen.
- Vier neue feste Web-/Desktopablagen; bestehende zwei Themen und Versionen
  unverändert. Kein Ersatz vorhandener Stände, kein DB-/Bestandsfragenimport.
  Schutz von Themenpools, Sicherungen, CAS und privaten KI-Kontexten beibehalten.
  Neuer amtlicher Quellenhost ausschließlich konkret freigegeben.
- Automatisch geprüft: Validator grün mit sechs Themen/84 Fragen; 121 Inhalts-
  und 19 Zustandstests, 373 Backendtests, 40 Desktoptests sowie 41 E2E-Tests
  bestanden. Vier neue Themen jeweils vollständig bis 8/8 Auswertung durchlaufen;
  Praxisbestätigung, Reload, sechs getrennte Stände und LF1-Abschluss geprüft.
  E2E ohne Retries/Skips, einschließlich vier echten isolierten Electron-Läufen.
  Mobile Abschlussübersicht visuell geprüft; Tastatur/Zoom ebenfalls abgedeckt.
- Zwischenfehler korrigiert: Desktop-Hosttest erwartete nach Erweiterung noch
  zwei statt drei zugelassene Test-URLs; neuer KI-Test verlangte gleiche
  Zielreihenfolge statt gleiche Zielmenge. Jeweils Testannahme angepasst und
  finale Gesamtsuiten grün. Produktverträge wurden nicht zur Testanpassung gelockert.
- Frischer technischer Review mit eigener synthetischer Sechthemenprüfung,
  echten DTO-/Metadatenprüfungen und gezielten Backend-/Speichertests freigegeben.
  Frontendbuild erfolgreich; bestehende Warnung großer Bundles bleibt bestehen.
- README/Plan/Inhaltsdoku/Status aktualisiert. Keine privaten Unterlagen oder
  Konten gelesen, keine echten Cloudanfragen; Tests mit öffentlichen/synthetischen
  Daten. Keine neue Bibliothek, Installer, Veröffentlichung oder Commit/Push.
  Nächster geplanter Inhalt: WISO – Ausbildung im dualen System.
