# Brief OPS-021: Ergänzungen und Abnahme des Frontendpiloten planen

Status: done
Bereich: OPS
Angelegt: 2026-10-30

## Ziel

Die zehn ergänzend besprochenen Planungspunkte sichern und konkrete,
prüfbare Abnahmekriterien für den ersten Pilotabschnitt ableiten.
Nur Dokumentation; keine Implementierung oder Pilotfreigabe.

## Betroffene Dateien

- `docs/20-Frontendkurs-Qwen-Planung.md`
- `docs/21-Frontendpilot-Abnahme.md`
- `docs/00-Start.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`
- `docs/agent-briefs/OPS-021-pilot-abnahmekriterien.md`

## Abnahme

- [x] Alle zehn Punkte nachvollziehbar erfasst, bestehende Entscheidungen erhalten.
- [x] Pilot mit zwei HTML-Seiten, externer CSS und Bild, intern und extern; Wechsel ab erster zweiter Datei.
- [x] Lernziele, Voraussetzungen und faire Bewertung konkret prüfbar beschrieben.
- [x] Vorschau, Speicherung/Wiederherstellung, Versionierung, Sicherheit und Bedienbarkeit mit Nachweisen abgedeckt.
- [x] Pilot ohne KI/aktives Lern-JavaScript; spätere Gates für JS/API/Build/Qwen separat.
- [x] Abnahmeliste offen, keine bestandenen Implementierungstests behauptet.
- [x] Links, Kapitelkonsistenz, frischer unabhängiger Review und Archivcheck bestanden.

## Ergebnis

Zehn ergänzende Anforderungen im Hauptplan erfasst und eigenes Pilotdokument
mit 30 eindeutig bezeichneten offenen Pflichtkriterien in fünf Prüfbereichen
erstellt: Lernstrecke/Bewertung, Mehrdateien/externer Modus, Speicherung/Versionen,
Import/Sicherheit sowie Bedienbarkeit/Durchlauf. Pilot umfasst Kapitel 1–6
bis Projekt Informationswebsite; aktives Lern-JavaScript, Qwen und spätere
Frameworks bleiben eigenständige Gates. Einstieg und STATUS verlinken die
Abnahmeliste. Alle Implementierungsabnahmen bleiben offen.

Mechanisch geprüft: 31 Kurskapitel unverändert, zehn Ergänzungspunkte,
30 eindeutige Pilotkriterien ohne gesetzte Checkboxen, lokale Links erreichbar;
`git diff --check` bestanden. Keine Programm-, Datenbank-, Paket- oder
Modelländerungen. Frischer unabhängiger Read-only-Review durch `ops021_review`:
inhaltliche Freigabe ohne Findings. Dokumentationsaufgabe archiviert; die
Pilotimplementierung bleibt offen. Abschließende Dokumentationschecks:
`node scripts/check-agent-briefs.mjs` und `git diff --check` bestanden.
