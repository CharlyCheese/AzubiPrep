# OPS-046 – Öffentliche PWA für den späteren Netlify-Import

Status: done
Bereich: OPS
Angelegt: 2026-11-20

## Auftrag

AzubiPrep aus einem GitHub-Checkout als öffentliche PWA auf Netlify bereitstellen können. Eine Gastversion zeigt Lerninhalte, FIAE-Lernreise, Suche, Karten, Prüfungen und Werkstatt. Der Auftrag umfasst die Vorbereitung im Repository und lokale Prüfungen. Die Veröffentlichung erfolgt später.

## Betroffene Dateien

- `netlify.toml`, `netlify/functions/learning.mjs`, `scripts/build-netlify.mjs`, `.gitignore`, `.github/workflows/ci.yml`, `README.md`
- `backend/src/{content,public-content,public-learning,exam,config}.js`, öffentliche Content-/Prüfungsrouten und gegebenenfalls eigene gemeinsame Routendefinitionen
- `frontend/vite.config.js`, `frontend/src/api/{ai,client}.js`, Profileinstellungen, Gastzugang, Theorie, Suche und KI-Komponenten unter `frontend/src/{components,pages,store,utils}`
- `e2e/scripts/check-netlify.mjs`, isolierter Prüfhelfer, `e2e/tests/account-navigation.spec.js` (Übergang zum lokalen Passwortformular), dieser Brief und `docs/agent-briefs/DONE.md`

## Abnahme

- GitHub-Import vom Repository-Stamm. Ein festgelegter Build erzeugt Browserdateien, die PWA, Sicherheitsheader und eine native Netlify Function für öffentliche Lernoperationen. Direkte Seitenaufrufe und echte Worker-Assets funktionieren.
- Inhalt und Prüfergebnisse aus den öffentlichen Projektquellen. Öffentliche API bietet weder Konten, private Unterlagen, Modellverbindungen noch Verwaltungsoperationen. Persönliche Verzeichnisse, Indizes, Zugangsdaten und lokale Konfiguration liegen außerhalb der Auslieferung.
- Einstieg, Quiz, Suche, Lernreise, Prüfung, modellfreies Lesen, Gastfortschritt und mobile/desktopgeeignete Werkstatt bleiben nutzbar. Lokale Web-/Desktopversion behält ihre bisherigen Funktionen.
- Produktionserzeugnisse und API-Grenzen lokal prüfen, GitHub-Anleitung ergänzen, unabhängiges Review und Archivierung abschließen.

## Ergebnis und Prüfung

Der Repository-Stamm konfiguriert den Vite-Build im Modus `portfolio` und eine native Netlify Function mit den öffentlichen Lernoperationen der lokalen App. Für das Lernangebot werden die Module und freigegebenen Themen aus den Projektkatalogen übernommen. Der Host benötigt weder Datenbank noch KI-Zugang. In der README stehen die Schritte für den GitHub-Import.

- Netlify CLI 27.20.1 hat den Produktionsbuild und die Paketierung im Offline-Modus aus einer isolierten Projektkopie abgeschlossen. Die Netlify-Parser akzeptierten 21 Seitenregeln und 36 Headerregeln. Im entpackten Funktionspaket wurden 237 öffentliche Datendateien mit der Build-Ausgabe abgeglichen. Die eigenständige Funktion lieferte 7.000 Fragen, die Suche und 94 Themen und wertete eine Prüfung aus.
- Synthetische Testdateien in Materialablage, Kontenablage, Konfiguration, Frontend- und Contentordnern blieben außerhalb des öffentlichen Website- und Funktionspakets. Das Gastprofil greift auch bei vorhandenen Testwerten weder auf Kontozugänge noch auf KI-Präferenzen zu.
- Chromium prüfte die öffentliche Lernreise einschließlich Fortsetzen, Theorie, Karteikarten, Prüfungsabgabe, Suche, mobile Debugger-Ausführung und Offline-Aufruf. 613 betroffene Backendtests und 43 Browserfälle für den regulären lokalen Modus bestanden. Ein bestehender Browsertest wartet beim Seitenwechsel nun ausdrücklich auf das Passwortformular, bevor er dessen E-Mail-Feld ausfüllt.
- Der unabhängige Review bestätigte nach Korrektur die Trennung der KI-Präferenzen, den Offline-Aufruf einer Theorieübersicht mit leerer Suche und die direkten Seitenpfade. Er prüfte außerdem ein Gastquiz und eine HTML-Vorschau im Browser. Eine öffentliche Bereitstellung ist für später vorgesehen.
