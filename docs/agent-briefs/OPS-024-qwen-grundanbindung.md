# Brief OPS-024: Lokale Qwen-Grundanbindung

Status: done
Bereich: OPS
Angelegt: 2026-10-31

## Ziel und Umfang

Nächster Schritt nach dem abgenommenen HTML-/CSS-Piloten gemäß docs/20:
optionale gemeinsame lokale Lernbegleitung in Einstellungen, Kurs und Quiz.
Zunächst Hinweise/Erklärungen, keine KI-Benotung oder automatische Handlungen.
Private Unterlagen bleiben unangetastet und ausschließlich lokal. Keine
PDF-Extraktion, RAG, Indizes, Uploads, Buchangaben oder privaten Dateilisten
in diesem Schritt. Kein automatischer Download/Bündeln eines Modells.

## Betroffene Dateien

- `backend/src/config.js`, `backend/src/app.js`
- `backend/src/ai.js`, `backend/src/routes/ai.routes.js`
- `backend/test/ai.test.js`, `backend/test/api.ai.test.js`
- `frontend/src/api/ai.js`, `frontend/src/store/aiStore.js`
- `frontend/src/components/KiEinstellungen.jsx`, `frontend/src/components/KiHilfe.jsx`
- `frontend/src/pages/Einstellungen.jsx`, `frontend/src/pages/FrontendKurs.jsx`
- `frontend/src/pages/Quiz.jsx`, `frontend/src/components/PilotPreview.jsx`
- `frontend/src/styles/ki.css`, `frontend/public/sw.js`
- `e2e/tests/ki.spec.js`
- `desktop/main.js`, `desktop/preload.cjs`, `desktop/pilot-runtime.cjs`
- `desktop/test/pilot-runtime.test.cjs`
- `README.md`, `docs/20-Frontendkurs-Qwen-Planung.md`
- `docs/23-Qwen-Grundanbindung.md`
- `docs/agent-briefs/OPS-024-qwen-grundanbindung.md`
- `docs/agent-briefs/STATUS.md`, `docs/agent-briefs/DONE.md`

## Festlegungen vor Umsetzung

Nur bereits installierte lokale Qwen-Modelle über Ollama. Dienstadresse aus
Umgebungsvariable mit Loopback-Default; Remote-URLs, Redirects, Cloudmodelle,
Tools/Websuche/Dateizugriff und sonstige Proxy-Funktionen abweisen. KI-Endpunkte
nur für lokale direkte Zugriffe, mit geprüften Host-/Origin-/Fetch-Metadata-
Headern und eigener Anforderungskennung gegen Fremdseiten; keine CORS-Freigabe.
Keine Prompts/Antworten protokollieren oder dauerhaft speichern. KI-GETs nicht
im Service Worker zwischenspeichern. Ein aktiver Generierungsauftrag, begrenzte
Eingabe/Ausgabe, Timeout, Abbruch und verständliche Fehler.

Frontend standardmäßig ohne aktivierte Lernbegleitung. Modellwahl und Zustimmung
lokal speichern; Kontext nur bei ausdrücklicher Anfrage senden, Umfang anzeigen.
Desktoppräferenzen über zwei eng begrenzte, abgesicherte IPC-Methoden im
App-Profil persistieren; bestehende native Snapshot-Technik wiederverwenden.
Quiz lädt Frage/Erklärung aus dem bestehenden Content-Store serverseitig und
berücksichtigt Originalantworten, nicht gemischte Anzeigebuchstaben. Kurs sendet
begrenzten aktuellen Aufgaben-/Code-/Prüfkontext ohne Bilder. KI erhält eine feste
Lernniveaugrenze; Hinweise vor Lösungen. Antworten als Text, nicht ausführbares
HTML. Keine Änderung von Fortschritt/Validatorergebnis/Projektdateien.
Veraltete Antworten/Anfragen bei Kontextwechsel abbrechen oder klar zuordnen.

## Abnahme

- [x] Lokalen Dienst/Modellstatus und Modellwahl nutzerverständlich anzeigen.
- [x] Lokale Verbindung, keine Remote-/Cloud-/Redirect-Ziele; fremde Webherkünfte
  und Renderer-Vorschau erhalten keinen Zugriff auf KI-Endpunkte.
- [x] Hinweise im Kurs, Erklärung der aktuellen Prüfergebnisse und optional
  untersuchter Elemente; Quiz-Erklärung nach bestehender Antwortprüfung.
- [x] Keine Ausführung/HTML-Injektion/Benotung; privater Bestand unberührt.
- [x] Ausfall, fehlendes Modell, Timeout, Abbruch, Ressourcenlimits und
  Kontextwechsel geprüft; Kernfunktionen ohne KI weiterhin nutzbar.
- [x] Deterministische API-/UI-Prüfungen sowie lokale Modell-Stichprobe gegen
  öffentlichen synthetischen Aufgabenbestand (keine privaten Dokumente).
- [x] Latenz/Antwortqualität ehrlich dokumentiert; kein allgemeines Gütesiegel,
  keine Freigabe für fortschrittsrelevante KI-Bewertung.
- [x] Frischer unabhängiger Review und Archivcheck bestanden.

## Ergebnis

Implementiert: gemeinsame Loopback-Ollama-Schicht mit installierter lokaler
Qwen-Modellwahl; freiwillige Einstellungen und Hinweise im Kurs/Quiz,
Erklärung aktueller Prüfermeldungen und freigegebener Inspektor-Ausschnitte.
Plain-Text-Ausgabe, festes JSON-Format, keine Tools/Downloads/Cloud/RAG/PDF.
Profilbasierte Desktoppräferenzen mit begrenztem IPC und Snapshots.

Nachweise: 88 Backendtests (17 neue KI-Fälle) und Lint, 9 Desktop-/Pakettests,
8 neue KI-Browser-/Electronfälle und 25 bestehende Kurs-/Quiz-/Desktopfälle
bestanden. Echte lokale Modell-/Browserproben mit synthetischen öffentlichen
Lernfällen durchgeführt; einzelne Qualitätsmängel führten zu stärkeren
Kontextgrenzen, Lektionstext-Grundlage und Platzhalterabweisung. Kleine
Stichprobe, keine allgemeine fachliche/didaktische KI-Freigabe. Prüfstand,
Latenz-/Ressourcenbeobachtungen und offene Schritte in docs/23.

Unabhängiger Reviewer ops024_review: erste Schutz-/Funktionsprüfung grün;
Nachreview fand drei Randfälle (Begriffsfragen, normale Quellenangaben,
Hilfenzählung bei fehlendem Kontext). Alle korrigiert und als Regressionen
aufgenommen; abschließender Code-/Doku-Nachreview ohne blockierende Findings
freigegeben. Buildreferenz und offene KI-Ausbaustufen nachgezogen. Private
Unterlagen unangetastet; neutraler Git-Ausschluss erneut geprüft, keine privaten
Materialien versioniert. Archivierung über DONE-Eintrag und Skriptprüfung.
Bestehende Installer bleiben unverändert; kein neuer Releaseauftrag.
