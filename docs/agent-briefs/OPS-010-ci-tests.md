# Brief OPS-010: CI-Pipeline + automatisierte Tests einführen

Status: offen
Bereich: OPS
Angelegt: 2026-09-18

## Ziel (1–3 Sätze)

Bisher laufen alle Qualitätschecks (Lint, Content-Validierung,
Sicherheitscheck) nur manuell auf Svens Rechner. Ziel: die bestehenden
Checks bei jedem Push/PR automatisch über GitHub Actions laufen lassen,
danach gezielt Tests für die kritischste Backend-Logik ergänzen (dafür
muss zuerst ein Test-Runner eingeführt werden, aktuell ist keiner
installiert), zuletzt optional wenige Browser-Tests für die Kernwege.
Bewusst in Stufen, damit jede Stufe für sich nutzbar ist und nicht auf
die nächste warten muss.

## Kontext (nur Verweise, keine Dokumentkopien)

- Auslöser: Sven hat das Projekt von ChatGPT bewerten lassen (2026-09-18,
  außerhalb des Repos), Hauptkritikpunkt "fehlende automatisierte Tests/CI"
  wurde gegengeprüft und bestätigt (kein `.github/workflows/`, keine
  Test-Dateien, kein Test-Runner in `backend/package.json` oder
  `frontend/package.json`).
- Bestehende, bereits funktionierende Skripte, die Stufe 1 nur bündelt:
  `backend/scripts/validate-content.mjs`, `backend/scripts/sicherheits-check.mjs`,
  `npm run lint` (Backend, ESLint).

## Umsetzungsschritte (Checkliste)

### Stufe 1: CI für bestehende Checks (dieser Durchlauf)
- [ ] `.github/workflows/ci.yml`: bei Push und Pull Request auf jeden Branch
      – Node 20 aufsetzen, `backend/` und `frontend/` Dependencies installieren,
      Backend-Lint, `validate-content.mjs`, `sicherheits-check.mjs` und
      `frontend` Produktions-Build (`npm run build`) ausführen.
- [ ] Kein `DATABASE_URL` in CI gesetzt – Checks müssen im CSV-/Ohne-DB-Modus
      laufen (deckt sich mit der MVP-Architekturentscheidung, siehe
      `docs/PROJEKTSTATUS.md` Abschnitt 8).
- [ ] Kurzer Hinweis in README (Abschnitt Tech-Stack oder eigener CI-Badge),
      dass CI aktiv ist.

### Stufe 2: Test-Runner + Backend-Logiktests (separater Task/Brief)
- [ ] Test-Runner einführen (Vorschlag: Vitest, passt zu Vite/ESM, für
      Backend und Frontend gemeinsam nutzbar).
- [ ] Tests für: Antwortauswertung SC/MC/FT (`backend/src/answer.js`),
      Prüfungsgenerierung/-auswertung (`backend/src/exam.js`),
      Autor/Admin-Rechteprüfung (Content-Admin-Routen), Passwort-Reset-
      Token-Mechanik (`auth.routes.js`).
- [ ] CI-Workflow um `npm test` (Backend + Frontend) erweitern.

### Stufe 3: API-Integrationstests (Teil von Stufe 2 oder eigener Task)
- [ ] Kleiner Satz HTTP-Tests gegen die echte Express-App (z. B. mit
      `supertest`): Content laden, Prüfung erzeugen/auswerten,
      unautorisierte Admin-Aktion wird abgelehnt.

### Stufe 4: Browser-Tests (separater Task, erst nach Stufe 2+3)
- [ ] Playwright für 3–5 Kernwege: Quiz abschließen, Prüfung starten,
      Login/Sync (nur falls Test-DB verfügbar), Autorenrechte.

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [ ] Stufe 1: `.github/workflows/ci.yml` existiert, Syntax valide (YAML),
      referenziert nur tatsächlich vorhandene npm-Skripte.
- [ ] Stufe 1: Workflow setzt kein `DATABASE_URL`, läuft also im
      Fallback-Modus (entspricht dem MVP-Betrieb ohne DB).
- [ ] Stufe 1: Nach Push sichtbar grün auf GitHub (von Sven bestätigt,
      da diese Sitzung nicht direkt auf GitHub pushen kann).
- [ ] Stufen 2–4 bleiben "offen" in diesem Brief bzw. wandern in eigene
      Folge-Briefs, sobald sie angegangen werden.

## Ergebnis (wird beim Abschluss ausgefüllt)

<wird nach Stufe 1 ergänzt>
