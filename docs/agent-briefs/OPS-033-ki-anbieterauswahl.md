# Brief OPS-033: Ohne KI, lokales Qwen oder eigenes ChatGPT-Abo

Status: done
Bereich: OPS
Angelegt: 2026-10-31

## Auftrag

Drei auswählbare Anbieter in der lokal betriebenen Web-/Electron-App:
ohne KI, lokales Qwen, eigenes ChatGPT-Abo über den offiziellen OAuth-Weg.
Privates Material und sämtliche Ableitungen ausschließlich lokal halten.
Retrieval und Modelltransport getrennt; Quellen-/Anbieterwechsel invalidieren
Antworten und laufende Anfragen. Keine stillen Anbieterwechsel.

## Betroffene Dateien

- backend/src/ai.js, backend/src/config.js, backend/src/routes/ai.routes.js
- backend/src/chatgpt.js, backend/src/chatgpt-auth.js, backend/src/ai-vault.js, backend/src/ai-error.js
- backend/test/ai.test.js, backend/test/chatgpt.test.js, backend/test/chatgpt-auth.test.js
- backend/test/ai-vault.test.js, backend/test/ai-routes.test.js
- frontend/src/store/aiStore.js, frontend/src/api/ai.js
- frontend/src/components/KiEinstellungen.jsx, frontend/src/components/KiHilfe.jsx
- frontend/src/components/TheorieLektion.jsx, frontend/src/components/RagEinstellungen.jsx
- frontend/src/styles/ki.css, frontend/public/sw.js
- desktop/main.js, desktop/pilot-runtime.cjs, desktop/web-main.cjs, desktop/web-runtime.cjs
- desktop/test/pilot-runtime.test.cjs, desktop/test/web-runtime.test.cjs
- e2e/tests/ki.spec.js, e2e/tests/rag.spec.js, e2e/tests/theorie.spec.js
- e2e/tests/ki-anbieter.spec.js
- .gitignore, .env.example, backend/.env.example
- README.md, docs/23-Qwen-Grundanbindung.md, docs/24-Lokales-RAG.md
- docs/25-Theorie-Glossar.md, docs/26-KI-Anbieter.md
- docs/agent-briefs/OPS-033-ki-anbieterauswahl.md
- docs/agent-briefs/STATUS.md, docs/agent-briefs/DONE.md

## Festlegungen

Offizielle Primärquellen geprüft31.10.2026:
https://developers.openai.com/siwc/token-sharing-open-source/sign-in
https://developers.openai.com/siwc/token-sharing-open-source/models-and-inference
https://developers.openai.com/siwc/token-sharing-open-source/profiles-and-sessions
https://developers.openai.com/siwc/token-sharing-open-source/preview-limitations

OAuth: Systembrowser, frische State/Nonce/PKCE, kurzlebiger127.0.0.1-Callback,
ausgegebene Client-ID statt dynamic_agent_client beim Tokenaustausch,
JWKS-Signatur/Issuer/Audience/Ablauf/Nonce/Identität/Scopes prüfen. Geschützte
lokale Zugangsdatenablage außerhalb von Git/Paketen/öffentlichen Bereichen,
keine Tokens im Browser/Logs/Antworten. Anmeldung explizit, Abmeldung/Erneuerung
und Kontowechsel nachvollziehbar. Keine API-Schlüssel oder neue Bibliotheken.

Cloudtransport nur feste offizielle HTTPS-Endpunkte, keine Weiterleitungen,
keine Tools/Datei-Uploads/Cloudsuche. Responses mit store=false/stream=true,
accountgebundene Modellliste und terminalem response.completed; begrenzte
Antwortgröße/Timeout/Abbruch. Lokaler Mock prüft Endpunkt/Body/Fehlerwege.

Privatmodus auf dem Server VOR jedem Cloudzugriff abweisen, keine RAG-Abfrage
oder Übertragung von Auszügen/Aliasdaten/Pfaden/Metadaten. Cloud nur öffentliche
Appkontexte und ausdrücklich ausgewählte Nutzerfrage/Codeausschnitte. Keine
Übernahme alter privater Antworten in neue Prompts oder Cloudzustimmung.
Materialverwaltung und modellfreies Lesen bleiben lokal und ohne KI nutzbar.
Ollama-Schicht bleibt Loopback-only; keine Lockerung bestehender URLsperren.

Bestehende Qwen-Präferenzen migrieren ohne Cloudzustimmung zu erteilen.
Pro Anbieter Modellauswahl; keine KI ist Standard. Anfragen enthalten Anbieter,
Cloudhinweis vor Nutzung, Quellenwahl für Cloud gesperrt. Keine Benotung durch
KI. Ablauf-/Kontingent-/Dienstausfälle blockieren die Lernfunktionen nicht.

Keine privaten Daten/realen OAuth-URLs/Tokens/Accountinfos in Toolausgaben,
Screenshots oder Doku. Tests/Review nur synthetische Inhalte. Anmeldung durch
Nutzer erst nach konkreter prüfbarer Implementierung; keine eigenständige
Accountautorisierung. Bestehende Installer nicht automatisch neu bauen.

## Abnahme

- [x] Drei Optionen und pro Anbieter Modellauswahl, sichere Migration in Web/
  Desktop, Anbieter-/Kontowechsel verwerfen laufende/alte Antworten.
- [x] Echter OAuth-Anmeldeweg implementiert; State/PKCE/JWT/Scopes, Rotation,
  Abmeldung und geschützte Ablage mit Fehlerfällen synthetisch geprüft.
- [x] Cloudtransport und strukturierte Quellenprüfung, Kontingent/Offline/
  Abbruch geprüft; kein Ollama für ChatGPT erforderlich.
- [x] Private Anfragen erreichen weder Auth/Cloud noch Retrieval; gezielte
  Negativtests, keine privaten Daten in Git/Paketen/Cache/Tokenablage.
- [x] Relevante Backend-/Browser-/Desktopprüfungen, frischer unabhängiger
  Review und Archivcheck grün. Grenzen der realen Nutzerabnahme dokumentiert.

## Ergebnis

Implementiert: explizite Anbieterwahl none/qwen/chatgpt und getrennte
Modellpräferenzen. Neue PräferenzenVersion2, bestehende Qwen-Zustimmung
unverändert lokal migriert. Keine automatische Cloudzustimmung oder
Anbieterersetzung. Neue UI sendet provider ausdrücklich. Zur Kompatibilität
mit bestehenden lokalen Clients bleibt bei fehlendem provider ausschließlich
Qwen als Altverhalten; daraus entsteht niemals Cloudzugriff. Quellenlesen
verwendet provider=none und funktioniert ohne Modelldienst.

Eigener ChatGPT-Abo-Zugang mit dynamischer öffentlicher Clientregistrierung,
Systembrowser, State/Nonce/PKCE, geprüftem temporärem Loopbackcallback,
ausgegebener Client-ID und JWT/JWKS-/Scopeprüfung. Geschützte atomare
Tokenablage, Windows-DPAPI im normalen Benutzerkontext mit synthetischen Daten
real bestätigt; andere Systeme nur Owner-Dateirechte, nicht praktisch
abgenommen. Zugangsdaten in getrenntem App-Profil bzw. ignoriertem local-ai/,
keine Browser-Tokens. Innerhalb des Projekts nur local-ai als Ablage erlaubt.
Bei erneuter Anmeldung bewusst keine IDtoken-Hints in Browser-URLs.

Refresh prozessübergreifend gesperrt, Konto-/Sitzungsepochen persistent geprüft.
Modellliste und Inferenz teilen denselben Token-/Kontoschnappschuss. Abbruch
verhindert veraltete Anmeldestarts; Kontowechsel/Abmeldung invalidieren laufende
Anfragen, auch über getrennte Instanzen. Widerruf mit begrenztem Wiederholen/
Backoff; bei Fehler ausdrücklich nur lokale Abmeldung bestätigt. Kontoregister
bleibt für Wiederanmeldung, gleiche E-Mails unterscheidbar beschriftet.

Separater Cloudtransport: offizielle HTTPS-Hosts ohne Redirect/Proxy,
kontogebundene Modelle, Responses store=false/stream=true, keine Tools/Uploads/
Cloudsuche/Chatverläufe. Abschluss nur bei gültigem response.completed;
Typ-/Byte-/Zeichen-/Zeitgrenzen, Abbruch, Fehler und Kontingentgrenzen geprüft.
Strukturierte Lernantwort/Quellenprüfung bleiben für beide Anbieter maßgeblich.
Keine serverseitige max_output_tokens-Garantie über den Abo-Previewweg;
Wortvorgaben und lokale Größen-/Zeitgrenzen dokumentiert.

Private Materialien/Ableitungen/Metadaten gelangen nicht in den Cloudpfad:
serverseitige Sperre vor Auth/Status/Retrieval/Transport, durch Spy-Negativtests
belegt. Private Fundstellen unter ChatGPT bleiben ausschließlich modellfrei
lokal lesbar. Wechsel privat→öffentlich löscht auch die Frage, damit keine
private Suchableitung übernommen wird. Anbieter-/Kontowechsel verwirft
Antworten, laufende Anfragen, Frage und Codefreigabe. Absichtlich in Freitext
kopierte private Inhalte sind nicht zuverlässig erkennbar; deutlicher Hinweis
und keine automatische Übernahme. Kein privater Verlauf als Folgeprompt.

184Backendtests und Lint grün, Frontendbuild grün.24unterschiedliche
KI-/RAG-/Theorie-/Anbieter-Browser-/Electronfälle grün (20bestehende plus4neue),
13Desktop-/Webruntimeprüfungen grün. Erweiterter echter Electronlauf bestätigt
Qwen→ChatGPT-Auswahl und erneuten Start über wechselnde Ports ohne Ollama-
Voraussetzung. Isoliertes Testprofil außerhalb des Projekts; innerhalb des
Git-Projekts greift der neue Ablageschutz.390px-Prüfung deckte überbreiten
Dateiauswahlknopf auf, mobil begrenzt und Nachlauf grün. Keine echten Konten
oder privaten Unterlagen für Testartefakte verwendet.

Frischer unabhängiger Code-/Sicherheits-/Dokunachreview ohne offene konkrete
Findings. Repros für veralteten OAuth-Start, prozessübergreifenden Kontowechsel,
ungefangene fehlerhafte SSE-Ereignisse und Übernahme privater Suchfragen
behoben und gezielt abgesichert. Weitere Negativfälle zu Signatur/Schlüssel/
Identitätswechsel, Größenlimit, Streamabbruch, Timeout und unvollständigen
Antworten grün. Prüfer nur mit öffentlichen Dateien/synthetischen Daten.

Echte Anmeldung mit berechtigtem ChatGPT-Abo und erste reale Antwort bleiben
offene praktische Nutzerabnahme; nach Fertigstellung zur Prüfung aufgefordert.
Keine fremde Kontofreigabe selbst durchgeführt und keine echten Tokens gelesen.
Keine privaten Daten in Git; neue Zugangsdatenablage ebenfalls ausgeschlossen.
Lokalen Server auf Port3002 neu gestartet und Gesundheit geprüft. Bestehende
Installer unverändert. Archivcheck289erledigt/10offen grün.
