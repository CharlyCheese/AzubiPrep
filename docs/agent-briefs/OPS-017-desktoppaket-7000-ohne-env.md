# Brief OPS-017: Desktoppaket mit 7000 Fragen ohne Entwicklerkonfiguration

Status: done
Bereich: OPS
Angelegt: 2026-10-30

## Ziel

Electron-Desktopinstaller mit aktuellem Frontend, Backend und 7000 Fragen
neu bauen. Entwickler-.env-Dateien aus der Distribution ausschließen.

## Betroffene Dateien

- `desktop/package.json`
- `desktop/package-lock.json`
- `desktop/scripts/build-desktop.cjs`
- `desktop/test/desktop-package.test.cjs`
- `README.md`
- `docs/agent-briefs/OPS-017-desktoppaket-7000-ohne-env.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Umsetzung und Grenzen

Vorhandene Electron-/Builder-Versionen verwenden. Neue Patchversion 0.1.1
kennzeichnet den aktualisierten Installer; alten Installer nicht löschen.
Frontend vor dem Paketbuild mit /api als gleicher Origin bauen. Backend
auf src, node_modules und Paketmetadaten beschränken, .env-Dateien und Logs
ausschließen. Auch Content-/Frontend-Ressourcen gegen .env-Mitnahme filtern.
Webpaket und Desktop-Laufzeitverhalten unverändert; keine DB-/CSV-Änderung,
kein Commit oder Push, keine Veröffentlichung.

## Abnahmekriterien

- [x] Neuer Desktopinstaller enthält exakt 7000 Fragen und 26 Module.
- [x] Enthaltene CSV und Backend-/Frontenddateien entsprechen aktuellem Stand.
- [x] Keine .env-Dateien im neuen Ressourcenpaket oder app.asar.
- [x] Eigener Desktop-Einstieg main.js und mitgelieferte Laufzeit bestätigt.
- [x] Tatsächlicher Start ohne externes Node und Entwickler-DB erfolgreich.
- [x] Gezielte Tests und unabhängiger Review bestanden.
- [x] Buildgrenzen, Artefakt und sachlicher Prüfstatus dokumentiert.
- [x] Diff- und Archivcheck grün.

## Ergebnis

Neuer Installer erfolgreich gebaut: Installer/AzubiPrep Setup 0.1.1.exe,
95920619 Byte, SHA256
59df14ffc85a5c03b46f30dd971c6effcba394723b768afad6b28441908f8cfc.
Alter Installer 0.1.0 bleibt erhalten und ist nicht zur Weitergabe vorgesehen.

Frischer ops017_review bestätigte ohne Findings: 26 CSV mit 7000 Fragen;
vollständiger Content (46 Dateien), Backendquellen (20) und Frontend (10)
bytegleich zur Quelle. Paketmetadaten korrekt 0.1.1, main.js unverändert,
app.asar enthält ausschließlich main.js und package.json. Keine .env-Dateien
im Ressourcenpaket oder app.asar; keine neuen Abhängigkeiten.
Zwei Desktoptests unabhängig grün, zusätzlich drei Webtests grün.

Tatsächliche gebündelte Desktop-EXE mit isoliertem Benutzerprofil, PATH ohne
externes Node und leerer DATABASE_URL gestartet: 7000 Fragen, 26 Module,
keine Warnungen, mitgelieferter CSV-Katalog, Kontosync deaktiviert.
HTML und referenzierte JavaScriptdatei HTTP 200. Eigene Testprozesse beendet.
Frontend wurde vor dem Paketbau mit /api als gleichem Ursprung neu gebaut.
Vorhandene Electron-32.3.3-/Builder-25.1.8-Laufzeiten verwendet.

Setup nicht auf einem frischen Windows-Testsystem installiert; geprüft sind
Paketinhalt und tatsächliche gebündelte Anwendung. Installer weiterhin
unsigniert. Keine Nutzer-/Lernstand-, DB- oder CSV-Änderungen, keine
Veröffentlichung, kein Commit oder Push. Diff-/Archivcheck nach Eintragung.
