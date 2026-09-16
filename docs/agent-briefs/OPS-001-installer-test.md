# Brief OPS-001: Installierten Windows-Installer real durchtesten

Status: done
Bereich: OPS
Angelegt: 2026-09-16
Abgeschlossen: 2026-09-16

## Ziel (1–3 Sätze)

Den gebauten Windows-Installer (electron-builder/NSIS) real auf Svens PC
installieren und die App starten, um sicherzustellen, dass die
Desktop-Variante (Electron-Hülle um Frontend + Backend) tatsächlich
funktioniert und nicht nur der Dev-Modus.

## Betroffene Dateien (exakte Pfade)

- `desktop/package.json` (Build-Output-Pfad auf `Installer/` umgestellt,
  siehe auch Chat-Verlauf)
- `.gitignore` (Build-Ausgabe-Pfad angepasst)

## Kontext (nur Verweise, keine Dokumentkopien)

- Ursprünglicher Installer lag unter `desktop/dist/`, auf Svens Wunsch für
  bessere Sichtbarkeit nach `Installer/` (Projekt-Root) verschoben
- Im gleichen Zug wurde ein Rebuild gemacht, um FE-002/FE-011/CONTENT-002
  (UI-Redesign, Ziffern-Umstellung, neue Fragen) im Installer zu haben,
  siehe `CONTENT-002-fragenkatalog-import.md`

## Umsetzungsschritte (Checkliste)

- [x] Installer-Ausgabeordner sichtbarer platziert (`Installer/` statt
      `desktop/dist/`)
- [x] Rebuild mit aktuellem Stand (`npm run build` im Frontend, `npm run
      dist` im Desktop-Ordner) – lief ohne Fehler durch
- [x] Installation auf Svens PC durchgeführt
- [x] App-Start geprüft

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [x] Installer lässt sich installieren
- [x] App startet und läuft
- [x] Aktueller Stand (UI-Redesign + neue Fragen) ist im installierten
      Build sichtbar

## Ergebnis (wird beim Abschluss ausgefüllt)

Sven hat den frisch gebauten Installer installiert und getestet: "Desktop
version läuft einwandfrei". Der SmartScreen-Warnhinweis beim Start bleibt
bestehen (App ist unsigniert, siehe OPS-004) – kein neuer Fehler, sondern
erwartetes Verhalten ohne Code-Signatur.

Kein tiefgehender Klicktest aller Einzelfunktionen dokumentiert, aber
Grundfunktion (Installation + Start) bestätigt. Falls Sven später noch
spezifische Bugs nur in der Desktop-Variante findet, wird das als eigener
Punkt nachgetragen.
