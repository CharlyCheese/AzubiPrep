# FE-071 – Lernreise: zweites LF1-Thema und Fortsetzung

Status: done
Bereich: FE / BE / CONTENT
Angelegt: 2026-11-11

## Ziel

R4 schrittweise beginnen: „Unternehmensziele und Zielkonflikte“ nach dem
ersten LF1-Thema vollständig nutzbar machen. Theorie, Quiz, Reflexion,
Karten und Mini-Test stimmen überein; bestehender Lernstand bleibt erhalten.

## Allowlist

- content/learning-journey/fiae.v1.json
- content/learning-journey/README.md
- content/learning-journey/topics/common-lf1-goals.v1.json (neu)
- content/learning-journey/questions/common-lf1-goals.v1.csv (neu)
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
- desktop/main.js (nur Lernreise-IPC)
- desktop/preload.cjs (nur Lernreise-IPC)
- desktop/test/journey-storage.test.cjs
- e2e/tests/journey.spec.js
- e2e/tests/journey-next.spec.js (neu)
- docs/65-Lernreise-LF1-Ziele.md (neu)
- docs/61-Lernreise-FIAE-Planung.md (Fortschrittsverweis)
- docs/63-Lernreise-LF1-App.md (Fortschreibung Speicher/Umfang)
- dieser Brief, docs/agent-briefs/STATUS.md, docs/agent-briefs/DONE.md

## Entscheidungen und Grenzen

- Zweites Thema: bestehende zwei Lernziele, vier Theorieblöcke, sechs Quiz-
  und acht getrennte Testfragen, drei Gesprächsimpulse, sechs Karten.
- Eigene fiktive Beispiele und unabhängige öffentliche Primärquellen.
  Keine privaten PDFs, RAG-, KI-Kontoablagen oder .env lesen/verarbeiten.
- Manifestversion bleibt 1.0.0: additive Freigabe eines bereits geplanten
  Themas; bestehende Themenversion und Lernziele ändern sich nicht.
- Speicher pro Thema: erster Webschlüssel und erste Desktopdatei bleiben
  exakt erhalten; zweiter Abschnitt bekommt eigene feste Ablage. Kein
  automatischer Ersatz oder destruktive Migration. Sicherungen pro Abschnitt.
- Geführte Reihenfolge: nächstes Thema nach bestandenem Vorgängerthema;
  vorherige Themen wiederholbar. Lokale Fortschrittsführung, kein
  manipulationssicherer Leistungsnachweis. Direkte URL berücksichtigt Voraussetzung.
- Backend liest nur fest freigegebene öffentliche Pfade, keine frei vom
  Client angegebenen Dateipfade. Harte Themenpools und neutrale Fehler bleiben.
- Optionale KI übernimmt geprüften Kontext des gewählten Themas unverändert
  über bestehende R3-Anbindung; keine neue Cloud-/Privatdatenübertragung.
- Keine neuen Abhängigkeiten, DB-/7000-Fragen-Änderung, Paketerstellung,
  Veröffentlichung oder Commit/Push.

## Abnahme

1. Zweites Thema fachlich korrekt, schrittweise verständlich und anhand der
   vorangehenden Theorie lösbar. Beide Lernziele in allen Aufgabenformen
   abgedeckt; eindeutige Lösungen und plausible vergleichbare Distraktoren.
2. Aktuelle öffentliche Primärquellen geprüft; frischer unabhängiger
   Inhaltsreview aller 14 Fragen samt Theorie-/Karten-/Gesprächsabgleich.
3. Übersicht zeigt zwei verfügbare Themen von 84, klare Voraussetzung,
   Beginnen/Fortsetzen/Wiederholen und Übergang nach bestandenem ersten Thema.
   Kein falscher LF1- oder FIAE-Abschluss. Der zweite Abschnitt durchläuft
   alle Phasen und kann nach Neuladen fortgesetzt werden.
4. Bestehender erster Lernstand funktioniert unverändert. Speicherung,
   Konflikte und Sicherungsimport betreffen genau ein Thema; falsche oder
   unbekannte Themen und fehlerhafte Stände bleiben geschützt. Desktop hat
   getrennte feste Dateien, sichere Pfadgrenzen und atomare Schreibvorgänge.
5. Backend prüft Themenzuordnung, Version und Pool strikt; keine fremden
   Fragen/Antworten, kein Lösungsvorgriff. KI-Kontext passend zum zweiten
   Thema; private Daten bleiben lokal, KI zählt keinen Fortschritt.
6. Aussagekräftige Inhalts-, Backend-, Speicher- und Browserprüfungen:
   kompletter zweiter Ablauf, alter Stand, Themenwechsel, Reload, Sperre,
   Sicherungen, Desktopneustart. Frontendbuild und Archivcheck grün.
7. Frischer unabhängiger technischer Review; Ergebnisse und verbleibender
   Umfang dokumentiert, erst danach abgeschlossen.

## Ergebnis

- Zweites LF1-Thema vollständig eingebunden: zwei Lernziele, vier Theorieblöcke,
  sechs Übungsfragen, acht getrennte Testfragen, drei Gesprächsimpulse und sechs
  Karten. Insgesamt zwei freigegebene von 84 geplanten Themen, 28 eigene Fragen.
- Neue Inhalte aus heute geprüften öffentlichen KMK-/FIAusbV-Grundlagen selbst
  formuliert; frischer Inhaltsreview aller 14 Fragen, Theorie, Karten und Gespräche
  zusätzlich gegen öffentliches ISB-, Bundesnetzagentur- und LfU-Material.
  Ein Finding: drei gleichförmige Distraktoren bei Q03. Formulierungen angepasst,
  anschließend unabhängige Freigabe ohne offene Findings.
- Backend mit fester Zweithemen-Allowlist, getrennten harten Pools, passenden
  Voraussetzungen und Folgeabschnitt. Alter Manifeststand mit erstem Thema
  allein bleibt gültig. KI-Kontexte aller sieben Theorie-/Gesprächsziele des
  zweiten Themas mit injiziertem Modell geprüft, ohne echte Cloudanfragen.
- Übersicht, Weiterleitung nach bestandenem Mini-Test, Wiederholung und
  direkte URL berücksichtigen die Voraussetzung. Entfernung einer Voraussetzung
  sperrt den Folgeabschnitt, erhält aber dessen vorhandenen Stand.
- Pro Thema eigene Webablage und feste atomare Desktopdatei. Bestehende Ablage
  unverändert, keine Migration; falsche Sicherung wird abgewiesen. Änderungen,
  Konfliktschutz und bestätigter Ersatz bleiben auf ein Thema beschränkt.
- Prüfung: Validator grün; 92 Inhalts- und 17 Zustandstests bestanden;
  gesamte Backend-Suite 333/333; Desktop-Suite 39/39. E2E 34/34 ohne Retries
  oder Skips, darunter kompletter zweiter Ablauf mit 8/8 Auswertung,
  Altstand/Fortsetzung, Importe, Voraussetzung und drei echte Electron-Läufe.
  Mobile Ansicht anhand Screenshot geprüft; bestehende Tastatur-/Zoomprüfungen
  ebenfalls grün. Frontendbuild grün, bekannte Größenwarnung der großen Bundles.
- Separater frischer technischer Review mit eigenen Speicher-/Desktopprüfungen
  abgeschlossen; finale Freigabe ohne offene Findings. Private Unterlagen und
  Konten nicht eingesehen, sämtliche Modell-/RAG-Prüfkontexte synthetisch oder
  öffentlich. Backend-Tests zusätzlich ohne Laden der realen .env.
- Plan, Inhalts-README und App-Dokumentation fortgeschrieben. Keine DB- oder
  Bestandsfragenänderung, keine neue Bibliothek oder Verteilungspakete,
  kein Commit/Push. Nächster Inhalt: Kunden, Lieferanten und Wettbewerb.
