# OPS-040 – Electron-Laufzeit vor frischen Desktoptests vorbereiten

Status: done
Bereich: OPS
Angelegt: 2026-10-31

## Befund und Ziel

CI 41245549381 scheitert auf Windows beim Start der direkt adressierten EXE:
"The system cannot find the path specified". Electron 45.2.0 besitzt keinen
postinstall-Hook mehr; sein npm-Paket lädt die Laufzeit beim regulären Aufruf
oder über install-electron. Unsere direkten Playwright-EXE-Pfade umgehen das.
Lokale Tests hatten bereits eine Laufzeit. Frische Installation ausdrücklich
vorbereiten und prüfen; vorhandene Tests und Isolationsrechte beibehalten.

## Allowlist

- `.github/workflows/ci.yml`
- `desktop/package.json`
- `desktop/scripts/prepare-electron.cjs`
- `desktop/test/electron-setup.test.cjs`, `desktop/test/desktop-package.test.cjs`
- `README.md`
- `e2e/scripts/check-electron-coldstart.mjs`
- temporäre synthetische Prüfbestände in `e2e/test-results/` (Git-ignoriert)
- dieser Brief, `docs/agent-briefs/DONE.md`

## Abnahme

1. Offizielles Installationsskript der bereits festgelegten Electronversion
   vor CI-Tests und npm-Installerbuild aufrufen; keine neue Abhängigkeit oder
   Versionsänderung, keine abgeschwächten Sandbox-/Testrechte.
2. Fehlende EXE, fehlerhafter Download und falsche Version werden vor den
   Fachtests klar erkannt. Leere Ausgangslage mit kontrollierten Daten prüfen.
3. Tatsächliche frische Electron-Paketkopie ohne dist/path.txt vorbereiten,
   offiziellen Installer benutzen und echte Desktopmatrix erneut ausführen.
   Keine private Originalablage, keine Logins oder Installer-Veröffentlichung.
4. Unabhängiger frischer Review und Archivcheck grün. Neuer GitHub-Erfolg bleibt
   bis zum erneuten Push/Lauf unbestätigt; keinen entfernten Erfolg vorwegnehmen.

## Ergebnis

Ursache anhand des bereitgestellten Startlogs, des installierten Electron-45.2.0-
npm-Pakets (kein postinstall, Lazy-Download in index.js) und der offiziellen
Installationsdokumentation bestätigt. Die direkten Playwright-EXE-Pfade lösen
keinen regulären Erststart aus; daher fehlte auf dem frischen CI-Rechner die
Laufzeitdatei. Lokale vorherige Tests hatten eine bereits vorhandene Laufzeit.

prepare:electron ruft jetzt das offizielle install.js der festgelegten Version
auf und prüft Pfad, Datei und Versionsmetadaten. Download-/Datei-/Versionsfehler
beenden die Vorbereitung eindeutig. CI führt dies vor den Desktoptests aus;
beide npm-Installerbuilds erhalten denselben Vorbereitungsschritt als Prehook.
README erklärt das Installationsverhalten. Keine neuen Pakete, Versionen,
Lerncode-Rechte oder Abschwächungen vorhandener Tests/Sicherheitsgrenzen.

Nachweise: 18/18 Paket-/Runtime-/Vorbereitungsfälle grün, darunter fünf neue
Fälle für leeren Zustand und fehlerhafte Vorbereitung. Echter Kalttest mit
kopierten npm-Paketdateien ohne dist/path.txt erfolgreich: offizieller Installer
bereitet diese getrennte Kopie vor, genau ihre EXE startet die App mit 7.000
Fragen. Synthetisches isoliertes Profil/Materialverzeichnisse, sichere Bereinigung.
Anschließend 23/23 Desktopfälle mit genau dem CI-Befehl und CI=1 bestanden
(1,0 min); Frontend-Build und HTML-Bericht eingeschlossen. Workflow-YAML geprüft.
Bekannte bereits bestehende Chunkgrößenwarnung unverändert.

Frischer unabhängiger Review ops040_review einschließlich Kalttest-Skript
freigegeben, keine offenen Findings. Offizielle Referenz:
https://github.com/electron/electron/blob/main/docs/tutorial/installation.md
Keine privaten Originalunterlagen/Konten gelesen, kein Commit/Push. Der neue
GitHub-Erfolg bleibt bis zum nächsten Push und Actions-Lauf unbestätigt.
