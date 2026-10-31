# Brief OPS-026: Ausschließlich lokale PDF-RAG-Anbindung

Status: done
Bereich: OPS
Angelegt: 2026-10-31

## Ziel und Autorisierung

Lokale Unterlagen für die optionale Qwen-Lernbegleitung nutzbar machen gemäß
docs/20 und docs/23. PDF.js als zusätzliche lokale Bibliothek wurde vom
Anwender ausdrücklich genehmigt. Keine Cloud-/Embedding-Modelldownloads.
Erste Retrievalstufe: lokaler lexikalischer BM25-Index statt zusätzlichem
Embeddingmodell. Keine Benotung, keine Erweiterung der Lerncode-Ausführung.

## Betroffene Dateien

- `backend/package.json`, `backend/package-lock.json`, `.github/workflows/ci.yml`
- `backend/src/config.js`, `backend/src/app.js`, `backend/src/ai.js`
- `backend/src/rag.js`, `backend/src/rag-storage.js`, `backend/src/rag-index.js`
- `backend/src/rag-pdf-worker.js`, `backend/src/rag-extract.js`
- `backend/src/routes/ai.routes.js`, `backend/src/routes/rag.routes.js`
- `backend/test/rag.test.js`, `backend/test/rag-index.test.js`
- `backend/test/rag-extract.test.js`, `backend/test/api.rag.test.js`
- `backend/test/ai.test.js`, `backend/test/fixtures/synthetic-pdf.js`
- `desktop/main.js`, `desktop/preload.cjs`, `desktop/web-main.cjs`
- `desktop/web-runtime.cjs`, `desktop/test/web-runtime.test.cjs`
- `frontend/src/api/ai.js`, `frontend/src/components/KiEinstellungen.jsx`
- `frontend/src/components/KiHilfe.jsx`, `frontend/src/components/RagEinstellungen.jsx`
- `frontend/src/styles/ki.css`, `frontend/public/sw.js`
- `e2e/tests/rag.spec.js`, `e2e/tests/ki.spec.js`
- `README.md`, `local-rag/README.md`, `docs/20-Frontendkurs-Qwen-Planung.md`
- `docs/24-Lokales-RAG.md`, `docs/23-Qwen-Grundanbindung.md`
- `docs/agent-briefs/OPS-026-lokales-rag.md`, `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Verbindliche Datenschutzgrenze

Private PDF und sämtliche Ableitungen bleiben ausschließlich im privaten
RAG-Verzeichnis. Keine privaten Titel, Dateinamen, Auszüge, Seitenbilder,
Fingerprints oder personenbezogenen Metadaten in Toolausgaben/Chat, Doku,
Git, öffentlichen Testfixtures oder Paketen. Die private PDF wird nur durch
lokale Prozesse gelesen. Prüfer/Agenten erhalten nur synthetische Fixtures
und generische Erfolgs-/Fehlerkennzeichen. Reale Inhalte/Antworten nicht in
den Agentkontext ausgeben oder als Screenshots erfassen.

## Festlegung vor Umsetzung

Projektdefault `local-rag/`, installierte Pakete mit beschreibbarem App-Profil
außerhalb der Ressourcen. Vertrauenswürdige Konfiguration über Umgebungsvariable;
öffentliche/gefährliche Wurzeln und Symlinks/Junctions abweisen. Browser bekommt
keine freien Dateilesepfade, sondern nur opaque IDs und neutrale Quellenlabels.
Vorhandenes Material im privaten material-Ordner kontrolliert aufbereiten;
lokaler Dateiimport für weitere PDFs. Originale außerhalb der privaten Ablage
nicht löschen. Materialordner über eng begrenztes Desktop-IPC öffnen.

PDF.js in begrenztem separatem Nodeprozess, nur Byte-Eingabe und lokale Assets,
keine PDF-Aktionen/Links/Skripte, kein Abruf externer Ressourcen. stdout/stderr
mit privaten Parserdetails nicht weiterreichen; Fehlercodes statt Inhalte.
Timeout/Abbruch, Datei-/Seiten-/Text-/Indexquoten. Keine OCR-Zusage; fehlende oder
mangelhafte Textausbeute erkennbar. Jobstatus unabhängig vom Modellstatus.

Materialverwaltung unter bereits abgesicherter Loopback-/Origin-/Marker-KI-API.
Kein CORS, kein Cache, kein PDF-Download-/öffentlicher Suchendpunkt. Explizite
RAG-Zustimmung pro Lernanfrage, wenige begrenzte Fundstellen mit neutralem
Dokumentlabel und tatsächlicher PDF-Seitennummer. Feste Codehinweise/Validatoren
gehen vor. Quellen sind unvertrauenswürdige Daten, keine Anweisungen/Tools.
Modellzitate nur aus freigegebenen Treffer-IDs übernehmen; keine Treffer oder
unbelegbare Antworten klar kennzeichnen. Antwort nicht dauerhaft speichern.

Indexversion/Fingerprints, atomare Übernahme, Fehler erhalten bestätigten Stand.
Veränderte/entfernte Materialien nicht als aktuell verwenden. Entfernen löscht
zugehörige Index-/Stagingdaten und Anwendungscaches, invalidiert laufende
Retrievalanfragen und versucht lokalen Modellkontext zu entladen; Ausfall dabei
sichtbar melden. Kein Eingriff in fremde Quelldateien oder globale Logs/Backups.

## Abnahme

- [x] Lokales Importieren/Aufbereiten/Neu-Einlesen/Abbrechen/Entfernen und
  nachvollziehbare Statuswerte ohne Terminaleingabe.
- [x] PDF-Seitenbezug, Textqualität und begrenzte lexikalische Suche geprüft;
  nur tatsächlich ausgewählte Fundstellen an lokales Qwen.
- [x] Quellbelege validiert, fehlende Treffer und unbelegte Antworten klar,
  keine Fortschritts-/Datei-/Werkzeugrechte für PDF-Inhalte oder Modell.
- [x] Pfad-/Verknüpfungs-/Quoten-/Abbruch-/Versions-/Löschtests bestanden.
- [x] Nach Neustart korrekt, keine veralteten/gelöschten Fundstellen verwendbar.
- [x] Private Unterlagen und Ableitungen von Git/Paketen/öffentlicher Auslieferung
  und Toolausgaben ausgeschlossen; reale Verarbeitung nur neutral nachgewiesen.
- [x] Synthetische Parser-/Retrieval-/API-/Browser-/Qwenprüfungen und frischer
  unabhängiger Review bestanden, Restgrenzen dokumentiert.
- [x] Doku/Archivcheck konsistent. Kein neuer Installer ohne eigenen Releaseauftrag.

## Ergebnis

Lokale PDF-Verarbeitung mit genehmigtem PDF.js 6.4.299, begrenztem separatem
Nodeprozess und BM25-Seitenindex implementiert. Materialverwaltung im UI,
private App-Profilablage installierter Varianten, argumentlose bewachte
Electron-Ordneraktion, explizite Verwendung pro Lernanfrage, neutrale Quellen
und kontrolliertes Entfernen ergänzt. Originale/Ableitungen bleiben privat.
Keine Modellinstallation, OCR, Embeddings, KI-Benotung oder neuen Installer.

Windows 10 x64, Chromium 153, Electron 45.2.0:

- 115 Backendtests und Backendlint grün; neuer Frontendbuild erfolgreich
  (`index-Bc-fXstg.js`, Service Worker v9).
- 9 Desktop-/Pakettests, 3 Webruntime-Tests, 9 KI- und 3 RAG-Browser-/Electron-
  Fälle sowie 25 bestehende Kurs-/Quiz-/Desktopregressionen bestanden.
- Echte PDF.js-Extraktion in Node/Electron, echter Parser-Timeout, Abbruch,
  atomarer Austausch, temporäre/dauerhafte Dateisperren und paralleler
  Katalogwechsel geprüft. Dateigrößenquoten mit synthetischen Metadaten;
  Dokumentzahl mit neun kleinen selbst erstellten PDFs nachgewiesen.
- Vollständiger synthetischer PDF→Suche→echtes lokales Qwen→Quellen-Lauf grün.
  Reale Verarbeitung ausschließlich im lokalen Prozess: Originalerhalt,
  Retrieval, Seitenbezug, gültige Modellquellen und Entladen des Modellkontexts
  durch neutrale Prüfflags bestätigt. Keine echten Dateinamen, Dokumenttitel,
  Auszüge, Fingerprints oder Antworten in Chat/Doku/Testartefakten.
- Git-Ausschluss für Material und Ableitungen sowie keine privaten versionierten
  Dateien bestätigt. Paketressourcen bleiben außerhalb der privaten Ablage.
  Produktionsabhängigkeiten laut `npm audit --omit=dev` ohne bekannte Befunde;
  dies ist keine Aussage über unveränderte Entwicklungsabhängigkeiten.

Frischer unabhängiger Reviewer `ops026_review`, ausschließlich Code/Docs und
synthetische Fixtures, ohne Zugriff auf reale Unterlagen: zuerst zwei Findings
(verwaiste Dateisperre konnte konkurrierende Besitzer zulassen; Quellenliste
ohne sichtbare Zuordnung). Behoben durch OS-exklusiven Loopback-Portmutex und
geprüfte strukturierte Quellenliste mit deterministischer Markeranzeige.
Bewusster Vertrag: fehlen nur Inlinekennungen, ergänzt der Server sie aus
validierten IDs; widersprüchliche/unbekannte IDs und Duplikate bleiben Fehler.
Das belegt Quellzuordnung, keine semantische Wahrheit der Modellantwort.

Im Nachreview sporadische Windows-EPERM beim Katalogaustausch sowie stat/open-
Wechsel gefunden und durch begrenzte atomare Schreib-/Lesewiederholung behoben.
Bestätigter Zielstand wird nie vorher gelöscht. Worker-IPC explizit geschlossen,
Altindexbereinigung erst nach Commit, bestätigter neuer Index auch bei
Bereinigungsfehler erhalten. Finaler Reviewer-Nachlauf: 33/33 KI/RAG-Tests und
60 vollständige synthetische Lebenszyklen mit 120 Aufbereitungen ohne Statusfehler;
Neustart, Retrieval, Invalidierung und vollständige Fixturelöschung bestanden.
Keine offenen Code-/Sicherheitsfindings; Electron-spezifische Ordneraktion in
der Doku präzisiert. Grenzen und Einrichtung siehe docs/24-Lokales-RAG.md.
