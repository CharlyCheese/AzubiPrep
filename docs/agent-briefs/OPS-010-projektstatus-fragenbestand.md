# Brief OPS-010: Projektstatus auf aktuellen Fragenbestand bringen

Status: done
Bereich: OPS
Angelegt: 2026-09-18

## Ziel (1–3 Sätze)

Die zentrale Statusübersicht soll den aktuell validierten Content-Bestand statt
veralteter MVP-Kennzahlen ausweisen. Historische Sprint-Einträge bleiben als
solche erhalten.

## Betroffene Dateien (exakte Pfade)

- `docs/PROJEKTSTATUS.md`
- `docs/agent-briefs/OPS-010-projektstatus-fragenbestand.md`
- `docs/agent-briefs/DONE.md`

## Kontext (nur Verweise, keine Dokumentkopien)

- `backend/scripts/content-statistik.mjs`
- `backend/scripts/validate-content.mjs`

## Umsetzungsschritte (Checkliste)

- [x] Aktuelle Kennzahlen mit Statistik- und Validierungsskript ermitteln.
- [x] Statusübersicht und Inhaltsdetail auf den validierten Bestand aktualisieren.
- [x] Ergebnis archivieren und Brief-Check ausführen.

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [ ] Die aktuelle Kennzahl nennt 1.627 Fragen und 19 Module.
- [ ] Die Detailtabelle und Verteilungen stimmen mit dem Statistikskript überein.
- [ ] `npm run validate` und `node scripts/check-agent-briefs.mjs` laufen fehlerfrei.

## Ergebnis (wird beim Abschluss ausgefüllt)

`docs/PROJEKTSTATUS.md` weist jetzt den am 2026-09-18 mit
`npm run statistik` und `npm run validate` verifizierten Bestand aus: 1.627
Fragen in 19 Modulen. Die aktuelle Modul-, Fachrichtungs- und
Schwierigkeitsverteilung wurde ebenfalls ersetzt; historische Sprint- und
Backlog-Einträge mit früheren Zwischenständen blieben unverändert.

Tests: `npm run statistik` (1.627 Fragen, 19 Module), `npm run validate`
(grün) und `node scripts/check-agent-briefs.mjs` (grün).
