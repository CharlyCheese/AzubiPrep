# Brief OPS-023: Desktoppilot und restliche Abnahme

Status: done
Bereich: OPS
Angelegt: 2026-10-30

## Ziel

P2.4, P4.3 und P4.6 für eine ausdrücklich dokumentierte Windows-/Browsermatrix
abschließen: native Auswahl, Windows-Pfad-/Verknüpfungsschutz, aktuelle sichere
Electron-Hülle, isoliertes Inspect und dauerhaftes Projektspeichern. Desktop
mit 7000 Fragen und Pilot neu bauen; private Daten/.env weiter ausschließen.

## Betroffene Dateien

- `desktop/main.js`
- `desktop/preload.cjs`
- `desktop/pilot-runtime.cjs`
- `desktop/pilot-inspector.cjs`
- `desktop/package.json`
- `desktop/package-lock.json`
- `desktop/test/desktop-package.test.cjs`
- `desktop/test/pilot-runtime.test.cjs`
- `frontend/src/pilot/storage.js`
- `frontend/src/pilot/preview.js`
- `frontend/src/pages/FrontendKurs.jsx`
- `frontend/src/components/PilotPreview.jsx`
- `frontend/public/sw.js`
- `e2e/tests/desktoppilot.spec.js`
- `e2e/tests/frontendpilot.spec.js`
- `README.md`
- `docs/20-Frontendkurs-Qwen-Planung.md`
- `docs/21-Frontendpilot-Abnahme.md`
- `docs/22-Frontendpilot-Technik.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`
- `docs/agent-briefs/OPS-023-desktoppilot-abnahme.md`

## Festlegung vor Implementierung

Bestehende zufällige Backendherkunft und Quizspeicher nicht migrieren. Nur
Desktop-Kursprojekte über eng begrenzte Preload-/IPC-Methoden im App-Profil
speichern (a/b-Snapshots, atomarer HEAD, 32 MiB), damit wechselnde Ports keine
Entwürfe verlieren. Web bleibt OPFS. IPC nur Hauptfenster/Hauptframe/aktuelle
App-Herkunft; keine frei wählbaren Speicher-/Lesepfade vom Renderer.

Native Auswahl öffnet einen Betriebssystemdialog und übernimmt erst dessen
Freigabe. Dateisystemimport prüft ursprüngliche/private Pfade, lstat/realpath,
symbolische Links/Junctions, Dateitypen, Größen, Tiefe und Anzahl. Keine fremden
Skripte, keine Dateischreibzugriffe auf ausgewählte Projekte.

F12/Inspect öffnet eine eigene eingeschränkte Vorschau ohne Preload/Node,
mit eigener flüchtiger Session und blockiertem Netzwerk. Hauptfenster bekommt
keine allgemeine DevTools-Schaltfläche. Vorhandenen eingebauten Inspektor erhalten.
Native Laufzeit auf offiziell aktuelle stabile Electron 45.2.0 aktualisieren;
Desktopversion 0.1.3. Vorhandene Webpakete 0.1.2 bleiben unverändert.
Bestehenden Paketbauer wegen gemeldeter Schwachstellen auf 26.18.0 aktualisieren;
Backendbibliotheken als separate .env-gefilterte Ressourcenwurzel kopieren.

## Abnahme

- [x] Native Auswahl/Abbruch, Mehrdateien, Ergänzen/Konflikte und Grenzen nachgewiesen.
- [x] Windows-Junction-/Symlink-/Traversalversuche weisen Ausbruch ohne Lesen/Schreiben zurück; Browserfall separat geprüft (Nachweisgrenzen unten).
- [x] Desktopprojekte nach vollständigem Neustart mit anderer Backendadresse wiederhergestellt; Fehler/Versionen erhalten vorigen Stand.
- [x] IPC-Absender und BrowserWindow-/Session-Sicherheit, F12 isoliert, Navigation/Popups/Netzwerk/Node-Zugriff geprüft.
- [x] Aktuelle Electron-Version, neuer Desktopbuild 0.1.3, 7000 Fragen, keine privaten RAG-/env-Daten im Paket.
- [x] Gezielte native/browser-/Electronprüfungen und frischer unabhängiger Review bestanden.
- [x] Nur tatsächlich belegte Matrix freigegeben, Dokumentation und Archivcheck konsistent.

## Ergebnis

Implementiert: eng begrenzte native Auswahl-/Speicherbrücke, portunabhängiger
32-MiB-Kursspeicher mit a/b-Snapshots, Windows-Pfad-/Verknüpfungsschutz,
isolierte F12-Vorschau mit Protokollfreigabe beim Schließen, Electron 45.2.0
und Builder 26.18.0, Desktop 0.1.3 mit 7000 Fragen gebaut.

Nachweise: 8 native/Paket-, 3 Webpaket-, 7 gemeinsame Projektmodultests;
19 Webregressionen + Bildbudgettest; 4 Electron-/Junctionfälle am endgültigen
Paket bestanden. Entwicklungsversion ebenfalls geprüft. Aktuelles HTML/CSS,
dreimaliges Inspect und geänderter dritter Entwurf, Neustart mit anderer Herkunft,
HEAD-Renamefehler, reale Junctions und unveränderte Originale nachgewiesen.
Paketinhalt mit nativen Quellen verglichen, keine env-/privaten RAG-Dateien.
Desktop-npm-audit: 0 bekannte Schwachstellen.

Matrix: Windows 10.0.19045 x64, Chromium 153.0.8010.12 Web und
Electron 45.2.0 / Chromium 156.0.8078.49 / Node 24.22.1 Desktop.
OS-Dialogantworten in E2E ersetzt; keine manuelle Dialogprüfung behauptet.
Computer Use scheitert am technischen Startfehler os error 3. Dateisymlinks
nicht physisch erzeugbar (EPERM), Erkennung gemockt; NTFS-Junctions real geprüft.
Keine Abnahme anderer Browser/Windowsversionen oder frischer Windowsinstallation.
Details, Artefakthash und Einschränkungen in docs/21 und docs/22.

Unabhängiger frischer Reviewer ops023_review: Implementierung, Speicherfehler,
Paketkopierkorrektur, F12-Lebenszyklus und Abschlussdokumentation freigegeben,
keine blockierenden Findings. Installergröße und Hash unabhängig bestätigt.
P2.4, P4.3 und P4.6 abgeschlossen; Pilotabnahme 30/30 innerhalb der
dokumentierten Matrix. Archivierung mit DONE-Eintrag und Skriptprüfung.
