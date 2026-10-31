# Brief OPS-027: Theorie, Glossar und lokale Wissenssuche

Status: done
Bereich: OPS
Angelegt: 2026-10-31

## Auftrag

Die bisherigen kurzen Theorieblöcke in Modulansichten durch einen eigenen
Theoriezugang ersetzen. Lernfelder/Themen auswählen, verständlich mit Qwen
lernen und anschließend passende Fragen üben. Glossar und natürliche
Wissenssuche ergänzen; Rückfragen ohne dauerhaftes Chatprotokoll ermöglichen.
Keine Zusage einer bereits didaktisch vollständig geprüften Theorieabdeckung.

## Betroffene Dateien

- backend/src/theory.js, backend/src/ai.js, backend/src/routes/content.routes.js
- backend/test/theory.test.js, backend/test/ai.test.js, backend/test/api.test.js
- backend/test/rag.test.js (portable synthetische Inodewechsel-Fixture)
- frontend/src/App.jsx, frontend/src/components/Layout.jsx
- frontend/src/pages/Lernen.jsx, frontend/src/pages/Modul.jsx, frontend/src/pages/Suche.jsx
- frontend/src/pages/Theorie.jsx, frontend/src/components/TheorieLektion.jsx
- frontend/src/components/KiHilfe.jsx
- frontend/src/api/ai.js, frontend/src/styles/theorie.css, frontend/public/sw.js
- e2e/tests/theorie.spec.js
- README.md, docs/25-Theorie-Glossar.md, docs/24-Lokales-RAG.md
- docs/agent-briefs/OPS-027-theorie-glossar-qwen.md
- docs/agent-briefs/STATUS.md, docs/agent-briefs/DONE.md

## Festlegungen

Öffentlicher, stabiler Katalog aus vorhandenen Modulen/Fragenthemen und
Lernfeld-Einstiegen LF1–9; keine privaten PDF-Titel/Dateilisten/Gliederungen
als öffentliche Kursinhalte übernehmen. Offizielle Zuordnung: LF1 Unternehmen
und eigene Rolle, LF2 Arbeitsplätze nach Kundenwunsch (KMK,13.12.2019).
Fachrichtung/Lernfeld/Modul und Begriffe filterbar, große Listen begrenzen.
Themen aus Quizmetadaten sind ein Themenverzeichnis, kein geprüfter Lehrgang.

Theorieanfrage erhält eigenen servervalidierten Kontext aus einer Katalog-ID
oder begrenzter freier Ausbildungsfrage. Themenfremde Modellrechte bleiben
ausgeschlossen. Erklärung mit Definition, nachvollziehbarem Beispiel und
Zusammenfassung; ergänzende Rückfrage zum selben Thema ohne gespeicherten
Verlauf. Ausgabelänge für Theorie gezielt erweitern, Kurs-/Quizhilfe unverändert.

Quellenwahl sichtbar: öffentliche App-Lerninhalte oder ausdrücklich gewählte
eigene lokale Unterlagen. Private Quelle hat keinen stillen öffentlichen oder
allgemeinen Modellfallback. Keine passenden Quellen: klare Rückmeldung.
Validierte Kennungen, bei privaten Quellen physische PDF-Seiten, kurze exakte
vom Server ausgewählte Fundstellenausschnitte getrennt von der KI-Erklärung.
Keine kapitelweisen Buchkopien, keine neuen Exporte/Synchronisation/Persistenz.
Öffentliche App-Texte sind vorhandene Lerninhalte, keine neue Fach-/Rechtsprüfung.

Weiterhin nur Loopback-/Origin-/Marker-KI-API, kein Cloudfallback, kein Tool-
oder Dateizugriff des Modells. Private Anfragen ausschließlich lokal; keinerlei
reale Inhalte/Dateinamen/Antworten in Tools, Doku, Git oder Screenshots.
Tests/Review ausschließlich synthetisch; reale Prüfung nur neutrale Flags.
Keine neuen Abhängigkeiten oder Installer. Bestehende Validatoren, Quiz und
Lernstand weder durch Erklärung noch Verständnisfrage verändern.

## Abnahme

- [x] Alter Modul-Theorieblock durch sichtbaren Zugang zum neuen Bereich ersetzt.
- [x] Lernfeld-/Modulzugang, Glossar und Wissenssuche mit stabilen Themen-IDs,
  Filtern, begrenzter Anzeige und passender Übungsfrage funktionieren.
- [x] Erklärung ohne vorheriges Quiz, Beispiel/Merksatz und Rückfragen möglich;
  öffentliche und private Quellen sichtbar getrennt, keine falsche Vollständigkeit.
- [x] Explizite Quellenwahl, gültige Belege, exakte begrenzte Fundstellen,
  fehlende Treffer und verändertes/entferntes Material korrekt behandelt.
- [x] Kontextwechsel, Abbruch, deaktivierte KI und Dienstfehler sicher;
  keine HTML-Ausführung, privaten Antwortspeicher, Fortschrittsänderungen.
- [x] Backend-/Browser-/Desktopregressionen und lokale synthetische Modellprobe grün.
- [x] Frischer unabhängiger Review, neutrale Doku und Archivcheck grün.

## Ergebnis

Eigenen Bereich `/theorie`, Navigation, Lernfeld-/Fachrichtungs-/Modulfilter,
paginierte Glossarthemen und passende Übungsfragen ergänzt. Öffentlicher Katalog
stammt ausschließlich aus vorhandenen App-Inhalten und neutralen gemeinsamen
Lernfeldeinstiegen; keine privaten Gliederungen/Metadaten übernommen.
Alte aufgeklappte Modul-Kurztexte durch Theoriezugang ersetzt; öffentliche
Kurztexte bleiben ergänzende Quellen. Suche um natürliche Wissensfrage erweitert.

Eigener servervalidierter Theoriekontext mit Erklärung, Praxisbeispiel und
Merksatz; begrenzte Rückfragen ohne gespeicherten Chatverlauf. Quellenwahl
App-Lerninhalte oder ausdrücklich eigene lokale Unterlagen, kein stiller
Fallback. Modellfreies Lesen liefert bis drei Originalauszüge je 800 Zeichen,
Erklärungen zeigen bis 220 Zeichen je verwendeter Quelle. Private Belege
nennen neutrale Kennung und physische PDF-Seite; keine vollständige PDF-
Seitenansicht oder neue Downloadfunktion. Keine Benotung/Lernstandsänderung,
keine neuen Abhängigkeiten oder Installer.

Prüfstand Windows 10 x64, Chromium 153, Electron 45.2.0:

- 123 Backendtests einschließlich acht neuer Theorie-/API-/Quellenfälle und
  Backendlint grün; neun Desktop-/Paket- und drei Webruntimeprüfungen grün.
- Fünf neue Theorie-Browser-/Electronfälle, zwölf bestehende KI/RAG-Fälle und
  25 Kurs-/Quiz-/Desktopregressionen bestanden (42 unterschiedliche Fälle).
  Echte native Fundstellenabfrage bei `AI_ENABLED=false` ohne Modelldienst.
- Synthetische Darstellungsprüfung bei Desktop- und 390-Pixel-Breite ohne
  horizontalen Überlauf; Modelltext bleibt inert, Quellen unverändert.
  Mobile Navigation behält die bisherigen fünf Zugänge; Theorie zusätzlich
  über Lernbereich und Modulzugänge erreichbar.
- Echter lokaler Qwen-Test mit selbst geschriebenem RAM/SSD-Quelltext lieferte
  Erklärung, Beispiel, Merksatz und gültige begrenzte Quellen. Reale lokale
  Quellenleseprobe ausschließlich durch neutrale Flags bestätigt: Seitenbezug,
  begrenzte Auszüge, kein Modellaufruf. Keine echten Inhalte/Namen/Antworten
  in Chat, Doku, Git oder Testartefakte ausgegeben.
- Frontendbuild `index-BWx4PNO5.js`, Service Worker v10; laufende lokale
  Webversion aktualisiert. Vorhandene Installer bleiben unverändert.

Frischer unabhängiger Reviewer `ops027_review`, nur öffentliche Repo-Inhalte
und synthetische Daten. Bestätigte Findings behoben: freie Suche berücksichtigt
auch öffentliche Kurztexte; einzelne veränderte Unterlagen invalidieren die
Antwort trotz weiterhin bereitem Gesamtstatus (ebenfalls in vorhandener
Kurs-/Quizhilfe korrigiert); Fachrichtungsfilter ergänzt; modellfreies Lesen
funktioniert bei serverseitig deaktivierter KI. Nachreview-Finding zu ungefilterter
Übungsfrage/Fragenzahl gemergter Begriffe behoben und mit zwei Fachrichtungen
sowie Modulfilter getestet. Abschließender eigener Prüferlauf 40/40 in sechs
Dateien grün, keine offenen bestätigten Findings; Doku geprüft.

Ein sporadischer älterer synthetischer Inodewechseltest war durch gerundete
Windows-Datei-IDs oberhalb der sicheren Number-Integergrenze bedingt. Die
Fixture verwendet jetzt garantiert unterschiedliche Werte statt `ino+1`;
Produktions-RAG unverändert. Grenzen der Theorieabdeckung und Interpretation
sowie Bedienung in docs/25-Theorie-Glossar.md dokumentiert.
