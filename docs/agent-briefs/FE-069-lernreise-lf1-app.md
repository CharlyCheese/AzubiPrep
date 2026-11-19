# FE-069 – Geführten LF1-Pilot in die App einbinden

Status: done
Bereich: FE
Angelegt: 2026-11-10

## Ziel

R2: Den geprüften ersten Abschnitt aus CONTENT-233 mit Beginnen/Fortsetzen,
Theorie, Themenquiz, fester Selbstreflexion, Kartenrunde, Mini-Test, Auswertung,
Wiederholung und dauerhaftem lokalem Fortschritt in Web und Electron einbinden.
Die KI-Gesprächserweiterung bleibt R3. Kein neuer öffentlicher Inhaltsbestand.

## Allowlist

- backend/src/journey.js (neu)
- backend/src/routes/journey.routes.js (neu)
- backend/src/app.js
- backend/test/journey.test.js (neu)
- frontend/src/api/journey.js (neu)
- frontend/src/store/journeyStore.js (neu)
- frontend/src/pages/LernreiseAbschnitt.jsx (neu)
- frontend/src/components/JourneyEntry.jsx (neu)
- frontend/src/pages/Lernreise.jsx
- frontend/src/App.jsx
- frontend/src/styles/journey.css (neu)
- frontend/public/sw.js (Versionswechsel und Journey-API vom Cache ausnehmen)
- scripts/test/journey-state.test.mjs (neu)
- e2e/tests/journey.spec.js (neu)
- desktop/main.js
- desktop/preload.cjs
- desktop/journey-storage.cjs (neu)
- desktop/test/journey-storage.test.cjs (neu)
- desktop/package.json (Dateiliste und Tests für neuen Speicheradapter)
- desktop/test/desktop-package.test.cjs (zugehörige Dateilistenprüfung)
- desktop/scripts/check-distribution.cjs (zugehörige Dateiliste)
- docs/63-Lernreise-LF1-App.md (neu)
- docs/61-Lernreise-FIAE-Planung.md (Fortschrittsverweis)
- docs/62-Lernreise-LF1-Inhaltsgrundlage.md (Integrationsverweis)
- dieser Brief, docs/agent-briefs/STATUS.md, docs/agent-briefs/DONE.md

## Grenzen

Keine Abhängigkeiten, privaten Unterlagen/.env/Kontodaten lesen, kein KI-Aufruf,
keine Datenbankmigration, kein Kontosync der Reise, keine globalen Quiz-/XP-
Änderungen. Geräte-/Browserprofilbezogener Fortschritt, eigene lokale Sicherung.
Bestehende uncommittete Debuggeränderungen erhalten. Keine Installer, kein Push.

## Abnahme

1. FIAE-Einstieg mit Beginnen/Fortsetzen, andere Fachrichtungen und bisheriges
   freies Modullernen bleiben erreichbar. Nur erster Themenabschnitt verfügbar;
   kein falscher Abschluss von LF1 oder ganz FIAE.
2. Vier Theorieblöcke → sechs Quizfragen → drei feste Selbstreflexionen → sechs
   Karten → acht Testfragen → Lernziel-Auswertung. Theorie-Rücksprung erhält
   Versuch; passende Quellen/Musterlösungen werden verständlich angezeigt.
3. API liefert begrenzte Themenpools, keine Lösungen im anfänglichen Fragen-DTO.
   Deterministische Auswertung lehnt fremde/doppelte/fehlende IDs, ungültige
   Antworten oder Inhaltsversionen ab; 6/8 nicht bestanden, 7/8 bestanden.
4. Speicherung vor Fortschrittsmeldung, gleicher Versuch nach Reload/Neustart,
   Doppelklick/verspätete Antwort/mehrere Tabs ohne doppelte Abschlüsse. Aktuelle
   Eingaben bei Speicher-/Verbindungsfehlern erhalten, sichtbare Fehlermeldung.
5. Versionierter begrenzter Reisestand, geprüftes Backup/Import mit Vorschau,
   Erhalt ungültiger/neuerer Altstände, bestätigter Ersatz statt stillem Verlust.
   Keine Vermischung mit privaten RAG-Daten oder bestehenden Lernstores.
6. Wiederholen gezielt zu Theorie/Lernzielen; Kartenfälligkeit blockiert nicht.
   Bestandene Versuche bleiben historisch erkennbar; kein KI-Erfolgsurteil.
7. Aussagekräftige Backend-/Speicher-/Browserprüfungen, mobile/Tastatur-/Zoom-
   Bedienprobe und Electron-Fortsetzung. Build und relevante Regressionen grün.
8. Frischer unabhängiger Review, Dokumentation mit Grenzen/Nachweisen und
   abschließender Archivcheck grün.

## Ergebnis

Abgeschlossen am 2026-11-10. FIAE-Einstieg und eigene Abschnittsseite verbinden
die vorhandenen öffentlichen Inhalte mit Beginnen/Fortsetzen, passender Theorie,
Quiz, fester Selbstreflexion, Karten, Mini-Test und Lernziel-Auswertung. Nur das
erste Thema wird freigegeben. Alte Module und globale Lernstores bleiben getrennt.

Begrenzte Journey-API mit strikten Pool-/Versionsprüfungen; keine Lösungen in
initialen Fragen-DTOs, keine serverseitigen Fortschrittswrites und kein KI-Aufruf.
Versionierter Browserstand mit Schreibsperre/Revisionsprüfung, native atomare
Profilablage mit geschützter IPC-Brücke und portunabhängiger Wiederaufnahme.
Lokale JSON-Sicherung mit geprüfter Vorschau und bestätigtem Ersatz; defekte,
leere oder neuere Originalstände bleiben erhalten. Fortschrittswechsel werden
erst nach erfolgreicher Speicherung angezeigt; ungespeicherte Entwürfe bleiben
exportierbar. Historische Bestleistung und wiederholte Tests sind getrennt.

Zwei frische unabhängige Reviews ohne Gesprächsverlauf: Frontend/Zustand und
Backend/Desktop. Vier wesentliche Randfälle behoben und nachgeprüft: vorzeitige
Fortschrittsmeldung, Eingabekonkurrenz bei Sicherungsübernahme, gesperrte
Desktop-Quellenlinks und konkurrierende App-Prozesse desselben Profils. Zusätzlich
leerer defekter Altstand wiederherstellbar. Beide Nachreviews freigegeben.

Nachweise:
- Backend: 273/273 Tests, darunter 62 Journey-Fälle; gezieltes ESLint grün.
- Zustands-/Speichervertrag: 14/14; bestehender Inhaltsvertrag: 72/72.
- Desktop: 33/33, einschließlich echter Mehrprozessprobe mit Testprofilen.
- Browser: finale 10/10 Journey-Fälle ohne Retry; fünf Modulfortschritts-
  Regressionen zusätzlich grün. Testwartebedingung nach API-Anfrage auf echte
  Speicherrevision umgestellt, damit alter gespeicherter Stand nicht als neue
  Bestätigung zählt.
- Frontend-Build, Diffprüfung und visuelle schmale/200%-Darstellungsansichten grün.
- Echter vollständiger Electron-Neustart mit gleichem Profil erhält Lernschritt.

Umfang, Bedienung und Grenzen: [LF1-App-Pilot](../63-Lernreise-LF1-App.md).
Keine neuen Abhängigkeiten, Inhalte aus privaten Unterlagen, Installer oder
Commits. R3 (optionale KI-Lernbegleitung) und weitere Themen bleiben offen.
