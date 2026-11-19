# FE-073 – Lernreise: WISO vollständig und gewünschte Etappenfolge

Status: done
Bereich: CONTENT / FE / BE
Angelegt: 2026-11-11

## Auftrag und Umfang

Auf ausdrücklichen Auftrag: LF1 → Sonstige Prüfungsbereiche (Wirtschafts- und
Sozialkunde) → Projektmanagement → LF2 → LF3 → weitere Lernfelder.
WISO jetzt vollständig ausarbeiten; Projektmanagement danach als eigene nächste
Etappe einordnen, inhaltlich noch nicht ausarbeiten. Die Reihenfolge gilt auch
für die bisherige freie Modulübersicht auf der Lernreiseseite.

## Allowlist

- README.md (Lernreiseumfang)
- content/learning-journey/fiae.v1.json
- content/learning-journey/README.md
- content/learning-journey/topics/common-wiso-training.v1.json (neu)
- content/learning-journey/topics/common-wiso-employment.v1.json (neu)
- content/learning-journey/topics/common-wiso-representation.v1.json (neu)
- content/learning-journey/topics/common-wiso-social-security.v1.json (neu)
- content/learning-journey/topics/common-wiso-pay.v1.json (neu)
- content/learning-journey/topics/common-wiso-consumer.v1.json (neu)
- content/learning-journey/topics/common-wiso-economy.v1.json (neu)
- content/learning-journey/topics/common-wiso-change.v1.json (neu)
- content/learning-journey/topics/common-wiso-career.v1.json (neu)
- content/learning-journey/topics/common-wiso-europe.v1.json (neu)
- content/learning-journey/questions/common-wiso-training.v1.csv (neu)
- content/learning-journey/questions/common-wiso-employment.v1.csv (neu)
- content/learning-journey/questions/common-wiso-representation.v1.csv (neu)
- content/learning-journey/questions/common-wiso-social-security.v1.csv (neu)
- content/learning-journey/questions/common-wiso-pay.v1.csv (neu)
- content/learning-journey/questions/common-wiso-consumer.v1.csv (neu)
- content/learning-journey/questions/common-wiso-economy.v1.csv (neu)
- content/learning-journey/questions/common-wiso-change.v1.csv (neu)
- content/learning-journey/questions/common-wiso-career.v1.csv (neu)
- content/learning-journey/questions/common-wiso-europe.v1.csv (neu)
- backend/src/journey.js
- backend/src/journey-ai.js (nur allgemeine Themenbezeichnung)
- backend/test/journey.test.js
- backend/test/journey-ai.test.js
- scripts/validate-learning-journey.mjs
- scripts/test/learning-journey-content.test.mjs
- scripts/test/journey-state.test.mjs
- scripts/test/journey-order.test.mjs (neu)
- frontend/src/store/journeyStore.js
- frontend/src/components/JourneyEntry.jsx
- frontend/src/pages/LernreiseAbschnitt.jsx
- frontend/src/utils/lernreise.js
- frontend/src/styles/journey.css
- frontend/public/sw.js
- desktop/journey-storage.cjs
- desktop/main.js (nur konkrete geprüfte Quellenhosts)
- desktop/test/journey-storage.test.cjs
- e2e/tests/journey.spec.js
- e2e/tests/journey-next.spec.js
- e2e/tests/journey-lf1.spec.js
- e2e/tests/journey-wiso.spec.js (neu)
- e2e/tests/lernreise.spec.js (falls vorhandene Reihenfolgeerwartungen)
- docs/61-Lernreise-FIAE-Planung.md
- docs/67-Lernreise-WISO.md (neu)
- dieser Brief, docs/agent-briefs/STATUS.md, docs/agent-briefs/DONE.md

## Vertrag und Grenzen

- Zehn bestehende WISO-Themen, 29 bestehende Lernziele/Voraussetzungen unverändert.
  Je vier Theorieblöcke, sechs Quizfragen, acht getrennte Testfragen,
  drei Reflexionen und sechs Karten. SC/ALLE/WISO, CSV lernfeld=KEIN_LF;
  JSON fieldId=WISO (kein erfundenes offizielles Lernfeld).
  Präfix LJ-WISO- plus großer Themensuffix (z.B. SOCIAL-SECURITY).
- Eigenständige öffentliche Inhalte; aktuelle Primärquellen bei rechtlichen,
  wirtschaftlichen und sozialen Aussagen prüfen. Jurisdiktion/Anwendungsbereich
  deutlich, keine pauschalen Rechts-/Leistungs-/Haftungsgarantien. Zahlenmodelle
  von realen gesetzlichen Sätzen unterscheiden, keine Steuer-/Beitragsfiktionen
  als aktuelle Werte ausgeben. Theorie vor Aufgaben; positionsneutrale Erklärungen.
- Letztes Thema europe enthält veröffentlichten WISO-Rückblick: vierter Block
  und dritte Reflexion wiederholen alle zehn Themen an überprüfbaren Aufgaben.
  fieldReview gleicher Vertrag wie LF1: fieldId WISO, topicIds alle zehn in
  Planreihenfolge, Block4, Reflexion3, acht finalen Testfragen. Diese referenzieren
  Block4, kombinierte Fälle dürfen mehrere Grundlagen anwenden; nötige Inhalte
  werden explizit wiederholt. Keine zusätzliche practice-Pflicht in WISO.
- Manifestversion/alte Themen unverändert. Neue optionale Metadaten:
  stageOrder = LF1,WISO,PM,LF2…LF9,LF10a,LF11a,LF12a;
  plannedStages = [{id:'PM',title:'Projektmanagement',status:'planned'}].
  PM ist zunächst Etappe ohne ausformulierte Themen; die 84 Themen/218 Ziele
  beziehen sich weiterhin auf den bestehenden ausgearbeiteten Themenplan.
- Summary ergänzt stages in dieser Reihenfolge, mit Feldern wie fields und
  PM-Platzhalter ohne Fragen/Fortschritt. Bereits unterstützte alte Manifeste
  ohne stageOrder/plannedStages bleiben gültig mit derselben Defaultreihenfolge.
  Alle sechs LF1-Themen sind Navigationsvoraussetzung für WISO; innerhalb WISO
  fachliche Voraussetzungen plus vorheriges verfügbares Thema. nextTopic führt
  vom LF1-Ende zu WISO. WISO-Ende verweist ehrlich auf geplantes PM.
- Bestehende Webschlüssel und Desktopdateien erhalten, zehn neue feste Ablagen.
  Keine freie Pfadauswahl, destruktive Migration oder Kontosync. KI-Kontext
  themengenau; Privates bleibt wie bisher lokal und außerhalb veröffentlichter
  Lehrtexte, Sicherungen und Cloudanfragen.
- Keine privaten PDFs/.env/Kontoablagen lesen; keine echten Cloudmodelltests.
  Keine neue Bibliothek, Bestandsfragen-/DB-Änderung, Installer, Commit oder Push.

## Abnahme

1. Alle zehn WISO-Themen in festem Aufbau fachlich korrekt und aus vorheriger
   Theorie lösbar. Sämtliche 140 neuen Fragen einzeln frisch unabhängig prüfen;
   Quellen, Distraktoren, Theoriebezüge, Karten/Reflexionen und Zahlen abgleichen.
2. Veröffentlichter Rückblick umfasst zehn Themen; WISO-Abschluss nur bei zehn
   gültigen bestandenen Ständen und Rückblick. Kein falscher FIAE-/PM-Abschluss.
3. Reihenfolge LF1→WISO→PM→LF2… in geführter Übersicht und freier Modulreise.
   Aufklappbare Etappen halten die größere Übersicht auch mobil bedienbar;
   Beginnen/Fortsetzen führt verlässlich zum nächsten zugänglichen Thema.
4. Bestehende sechs LF1-Stände unverändert nutzbar; 16 isolierte Ablagen,
   Sicherungen/CAS/Quota-/Fehlerverhalten geschützt. LF1-Abschluss bleibt bestehen,
   ohne einen Abschluss der neuen WISO-Themen zu erfinden.
5. Strikte Themen-/Pool-/Versions-/Rückblickprüfung, passender KI-Kontext aller
   neuen Blöcke/Reflexionen ohne Prüfungslösungen und ohne private Cloudinhalte.
6. Inhalts-, Backend-, Speicher-, Desktop- und Browserprüfungen grün: komplette
   zehn Abläufe, Etappenwechsel, Fortsetzung, Rückblick, Abschlussgrenzen,
   Sicherung, Desktopneustart, Mobil/Tastatur. Build und Archivcheck grün.
7. Frische unabhängige Fach-/Technikreviews, sachliche Dokumentation, klare
   Grenzen: WISO vollständig; Projektmanagement als nächster Auftrag offen.

## Ergebnis und Abnahme

WISO vollständig in Web und Electron eingebunden: zehn Themen mit 29 Lernzielen,
40 Blöcken, 140 eigenen Fragen, 30 Reflexionen und 60 Karten. Mit LF1 sind
16 von 84 Themen verfügbar (44 Lernziele, 224 Fragen); 68 bleiben offen.
Projektmanagement steht als nächste geplante Etappe vor LF2. Seine spätere
Detailplanung ist noch nicht Teil der bestehenden 84 Themen.

Aufklappbare Etappen, Beginn/Fortsetzen, Auswertungen und WISO-Rückblick
integriert. WISO-Abschluss setzt zehn gültige bestandene Themenstände voraus.
Offizielle Modulzuordnungen bleiben unverändert; auch die freie Modulreise
ordnet WISO und PM vor LF2 ein. Alle sechs LF1-Ablagen und Versionen bleiben
kompatibel; zehn feste lokale Ablagen ergänzt. SW-Fassung v62.

### Unabhängige Reviews

- Frischer Fachreview A: alle 70 Fragen der Themen training, employment,
  representation, social-security, pay einzeln; außerdem 20 Blöcke, 15
  Reflexionen, 30 Karten und sämtliche Quellen. REPRESENTATION-Q06 erhielt
  den fehlenden Theoriebezug zur Einigungsstelle. Korrektur nachgeprüft;
  keine offenen Befunde. Beide Entgeltrechnungen unabhängig nachgerechnet.
- Frischer Fachreview B: alle 70 Fragen der Themen consumer, economy, change,
  career, europe einzeln und sämtliche zugehörigen Inhalte/Quellen. Zusätzlich
  Rückblick gegen die fünf vorherigen WISO-Theorien abgeglichen. Herkunft der
  Mittel bei §110 BGB in Theorie/Karte präzisiert; sprachliche Lösungssignale
  in ECONOMY-E06 und CHANGE-Q01/Q04/Q06 entfernt. Nachprüfung ohne offene Befunde.
- Frischer Technikreview samt Nachprüfung: Bestwert außerhalb des noch
  vollständigen Verlaufs wird abgewiesen; nach mehr als zehn Versuchen
  ausgelagerte Bestwerte bleiben erhalten. CSV-Thementitel im Validator wie
  im Backend gebunden. Strikte Pools, Versionen, Rückblick, alte Manifeststände,
  Navigation, Speicher, Quellenhosts und private Isolation geprüft. Keine
  offenen Befunde. Letzte Testhelferkorrektur ebenfalls unabhängig bestätigt.

### Prüfmatrix

| Prüfung | Ergebnis |
|---|---|
| Inhaltsvalidator | 84 Themen, 16 freigegeben, 224 Fragen; gültig |
| Inhaltstests | 154 bestanden |
| Zustand/Sicherung/Reihenfolge | 24 bestanden (21 Zustand, 3 Reihenfolge) |
| Backend | 443 geprüft: 268 übrige Tests grün; 175 Tests der betroffenen Journey-Datei nach Testhelferkorrektur vollständig grün |
| Desktop | 42 bestanden, einschließlich Paket-/Privatausschlüssen, 16 Dateien und allen veröffentlichten Quellenlinks |
| Browser/Electron | 56 bestanden, keine Retries oder Skips; fünf echte isolierte Electron-Szenarien |
| Frontendbuild | erfolgreich; bekannte Bundlegrößenwarnung |
| Darstellung | mobile Abschlussübersicht visuell geprüft; Breite, Tastatur, Zoom und Aufklappen automatisiert geprüft |

Die erste Backend-Gesamtprüfung fand einen Fehler im Testhelfer: die unscharfe
Auswahl von IDs mit „-E“ erfasste bei EMPLOYMENT/ECONOMY/EUROPE auch Quizfragen.
Der Helfer bindet jetzt den Suffix -E plus zweistellige Nummer. Die App-Auswertung
war unverändert korrekt; alle 175 Tests dieser Datei anschließend grün.

Alle zehn neuen Themen im Browser vollständig durch Theorie, Quiz, Reflexion,
Karten und Test bis 8/8 durchlaufen; Neuladen und unveränderte vorherige Stände
geprüft. Zusätzlich Abschlussgrenzen, Sicherungsimport/-export, Fremdimporte,
Entfernung/Schaden in Nachbartabs, WISO-Voraussetzungen und PM-Platzhalter geprüft.
Electron erhält alle 16 Themenstände nach vollständigem Neustart. Alle 70 neuen
KI-Ziele mit Modellnachbildung auf passenden Kontext und private Trennung geprüft.

Tests verwenden öffentliche oder synthetische Inhalte und eigene Profile. Keine
privaten Unterlagen, Suchdaten oder Kontoablagen gelesen; keine echten Cloudtests.
Die normalen 7.000 Fragen und ihre Datenbank blieben unverändert. Die lokale
Webversion wurde neu gestartet und öffentlich geprüft: 16 verfügbare Themen,
richtige Etappenfolge, zehn Rückblickthemen, PM noch geplant. Dokumentation
aktualisiert; neue Weitergabepakete, Commit und Push sind nicht Teil dieses Auftrags.
