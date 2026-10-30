# Brief OPS-016: Webversion ohne separate Einrichtung

Status: done
Bereich: OPS
Angelegt: 2026-10-30

## Ziel

Windows-Webpaket mit vorhandener Electron-Laufzeit bauen: keine separate
Node-/npm-/PostgreSQL-Installation und keine Terminalbefehle auf dem Ziel-PC.
Browser als Lernoberfläche, lokaler Server im Hintergrund mit Tray-Menü.
Setup und portable EXE bereitstellen.

## Betroffene Dateien

- `desktop/web-main.cjs`
- `desktop/web-runtime.cjs`
- `desktop/web-builder.json`
- `desktop/scripts/build-web.cjs`
- `desktop/test/web-runtime.test.cjs`
- `desktop/package.json`
- `.gitignore`
- `README.md`
- `docs/agent-briefs/OPS-016-webpaket-ohne-einrichtung.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Umsetzung und Grenzen

Vorhandene Electron-/electron-builder-Abhängigkeiten verwenden, keine neuen
Libraries. Desktopmodus unverändert. Separater Web-Einstieg startet denselben
Backend-/Frontendcode ausschließlich auf Loopback mit stabilem Port aus
Konfiguration. Ein Nutzerprozess, erneuter Start öffnet den Browser erneut.
Tray-Menü zum Öffnen und Beenden; kein Windows-Autostart.
Distribution enthält CSV mit 7000 geprüften Fragen. Persönlicher Lernstand
bleibt im Browser. Ohne separat eingerichteten Kontoserver kein Kontosync;
keine lokale PostgreSQL-Installation nötig. Keine Entwickler-.env/Secrets
oder Nutzerdaten einpacken. API-Buildziel explizit gleiche Origin.
Lokaler Build und Paketprüfung, keine Veröffentlichung, kein Commit/Push.

## Abnahmekriterien

- [x] Paket enthält Laufzeit, Backend, Frontend und 7000 Fragen.
- [x] Start erfordert weder externes node/npm noch weitere Paketdownloads.
- [x] Browser erst bei Bereitschaft; stabiler Ursprung erhält Browserlernstand.
- [x] Mehrfachstart, Portkonflikt und Beenden kontrolliert behandelt.
- [x] Keine Entwicklerkonfiguration/Secrets im Paket; Loopbackbindung.
- [x] Setup und portable EXE erstellt und Inhalt/Laufzeit geprüft.
- [x] Gezielte Tests und unabhängiger Review bestanden.
- [x] Sachliche Doku, Diff- und Archivcheck grün.

## Ergebnis

Setup und portable EXE mit vorhandener Electron-32.3.3-Laufzeit und
electron-builder 25.1.8 erfolgreich gebaut; Frontend-API-Ziel /api.
Artefakte unter Installer-Web:
- AzubiPrep-Web-0.1.0-portabel.exe, 95697441 Byte, SHA256
  f5fe23bd235a3b79b1820fa313e88679de07ceb6089e58e98398f51b0f61b3a8.
- AzubiPrep-Web-Setup-0.1.0.exe, 95797029 Byte, SHA256
  0e2c839a834092aa4dae56b365238a3c93e79afd9a2f370fc4ba2f94ae80a780.

Portable EXE tatsächlich mit PATH ohne externes node/npm und ungültiger
geerbter Entwickler-DATABASE_URL gestartet: 7000 Fragen, 26 Module, keine
Warnungen, HTML verfügbar, Kontosync deaktiviert. Mitgelieferter CSV-Katalog.
Mehrfachstart der direkten gebündelten Anwendung: zweite Instanz Exit 0,
erste weiterhin erreichbar. Der erste portable Mehrfachstarttest wartete
nur zehn Sekunden auf den zweiten Entpackvorgang; die Mehrfachstartlogik
wurde danach mit der gebündelten EXE erfolgreich geprüft. Testprozesse
beendet. Tray-/Port-/Beendigungslogik unabhängig statisch geprüft.

Frischer ops016_review bestätigte ohne Findings: drei Node-Tests grün;
26 Fragen-CSV mit exakt 7000 Fragen und alle zehn Frontenddateien bytegleich,
keine .env-Dateien im Paket, sieben Backendabhängigkeiten intern auflösbar.
app.asar enthält nur Metadaten und beide Web-Startdateien, Einstieg web-main.cjs.
Setup benutzerbezogen ohne angeforderte Elevation, kein Windows-Autostart.

Eine Installation auf einem frischen Windows-PC wurde mangels Testsystem
nicht durchgeführt. Artefakte unsigniert; mögliche Windows-Rückfrage bleibt.
Bestehender Desktopmodus unverändert. Keine DB-/CSV-/Lernstandänderung,
keine Veröffentlichung, kein Commit/Push. Diff-/Archivcheck nach Eintragung.
