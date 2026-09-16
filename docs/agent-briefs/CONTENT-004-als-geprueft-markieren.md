# Brief CONTENT-004: „Als geprüft markieren" (nur Admin)

Status: done
Bereich: CONTENT
Angelegt: 2026-09-16
Abgeschlossen: 2026-09-16

## Ziel (1–3 Sätze)

In der Fragenpflege (`/autoren`) gab es bisher keine Möglichkeit, eine
Frage manuell auf `review_status = 'geprueft'` zu setzen (z. B. nach
einer gemeldeten Frage, die sich als unbegründet/Test herausstellt) –
das ging bisher nur per Hand-SQL. Jetzt gibt es dafür einen Button, aber
bewusst nur für die Rolle `admin`, nicht für `autor`.

## Betroffene Dateien (exakte Pfade)

- `backend/src/routes/content-admin.routes.js`
- `frontend/src/pages/Autoren.jsx`

## Kontext (nur Verweise, keine Dokumentkopien)

- `docs/agent-briefs/CONTENT-001-autoren-weboberflaeche.md`: definiert
  `review_status`-Werte und die bisherige Regel „nie automatisch auf
  'geprueft'"
- `docs/agent-briefs/BE-003-frage-melden.md`: Auslöser dieses Briefs –
  Sven musste eine Testmeldung manuell per SQL zurücksetzen

## Entscheidung (im Chat geklärt, 2026-09-16)

- Nur `admin` darf eine Frage manuell als geprüft markieren, nicht
  `autor` – ein:e Autor:in soll nicht die eigene Änderung selbst
  freigeben können. Backend erzwingt das (403 bei `autor`), Frontend
  blendet den Button für `autor` gar nicht erst ein.
- Der Button erscheint nur, wenn die Frage noch nicht `geprueft` und
  nicht `deaktiviert` ist (bei `deaktiviert` zuerst reaktivieren).
- Gleichzeitige Inhaltsänderung hat Vorrang: wird im selben Request auch
  ein Inhaltsfeld geändert oder (de-)aktiviert, bleibt es bei der
  bestehenden Regel (Status springt auf `ungeprueft`/`deaktiviert`) –
  `geprueft: true` wird dann ignoriert. Das passt zur UI, da der Button
  eine eigene, isolierte Aktion ist (kein gleichzeitiges Speichern von
  Formularänderungen).

## Umsetzungsschritte (Checkliste)

- [x] Backend: `PUT /admin/questions/:id` akzeptiert `geprueft: true`,
      setzt `review_status = 'geprueft'`, `geprueft_am = now()`,
      `geprueft_von = <userId>` – 403, falls `req.userRolle !== 'admin'`
- [x] Frontend: neuer Button „Als geprüft markieren" im Bearbeiten-
      Formular, nur sichtbar für `rolle === 'admin'` und passendem Status
- [x] `node scripts/check-agent-briefs.mjs` bleibt grün

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [x] Als `autor` eingeloggt: Button ist nicht sichtbar; direkter
      API-Call mit `geprueft: true` liefert 403
- [x] Als `admin` eingeloggt: Button setzt Status auf `geprueft`,
      `geprueft_am`/`geprueft_von` werden gesetzt
- [x] Bestehendes Verhalten (Inhalt ändern → `ungeprueft`,
      (De-)Aktivieren) bleibt unverändert

## Ergebnis (wird beim Abschluss ausgefüllt)

Umgesetzt wie geplant. In der Sandbox gegen einen lokalen PostgreSQL-16-
Cluster getestet (danach wieder entfernt): Frage mit `admin`-Rolle über
`geprueft: true` aktualisiert → `review_status` wechselt zu `geprueft`,
`geprueft_am`/`geprueft_von` werden korrekt gesetzt; derselbe Request mit
`autor`-Rolle liefert 403 wie erwartet. `node
scripts/check-agent-briefs.mjs` läuft grün. Frontend-Button nicht in der
Sandbox testbar (gleiche npm-Registry-Einschränkung wie immer), folgt
aber demselben Muster wie „Deaktivieren/Reaktivieren" – Sven bestätigt
nach Dateiübernahme live auf seiner Maschine.
