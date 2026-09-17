# Brief BE-007: Passwort-Reset-Flow (admin-gestützt)

Status: done
Bereich: BE
Angelegt: 2026-09-17
Abgeschlossen: 2026-09-17

## Ziel (1–3 Sätze)

Wer sein Passwort vergisst, kam bisher dauerhaft nicht mehr an sein Konto
(kein Login, kein Reset-Weg) – Fund beim Brief-Audit, war seit `DB-001`/
`FE-001` als bekannte Lücke dokumentiert, aber nie im Backlog erfasst. Da im
Projekt kein E-Mail-Versand existiert, läuft der Reset admin-gestützt: ein
Admin erzeugt einen Einmal-Link und schickt ihn außerhalb der App an die
betroffene Person.

## Betroffene Dateien (exakte Pfade)

- `backend/db/schema.sql` – Tabelle `passwort_reset_tokens`
- `backend/src/auth.js` – `adminPflicht`-Middleware, Token-Erzeugung/-Hashing
- `backend/src/routes/auth.routes.js` – `POST /auth/passwort-reset` (öffentlich),
  `POST /auth/passwort-reset-anfordern` (öffentlich, Ergänzung 2026-09-17)
- `backend/src/routes/nutzer-admin.routes.js` (neu) – `GET /admin/users`,
  `POST /admin/users/:id/passwort-reset` (beide admin-only)
- `backend/src/app.js` – neue Route eingehängt
- `frontend/src/pages/PasswortZuruecksetzen.jsx` (neu) – öffentliche Seite,
  liest `?token=` aus der URL; ohne Token: Formular, das
  `/auth/passwort-reset-anfordern` auslöst (Ergänzung 2026-09-17)
- `frontend/src/pages/Nutzerverwaltung.jsx` (neu) – admin-only, Nutzerliste
  + Reset-Link-Erzeugung
- `frontend/src/components/Layout.jsx` – neuer Nav-Punkt (nur `rolle ===
  'admin'`)
- `frontend/src/components/KontoFormular.jsx` – "Passwort vergessen?"-Link
- `frontend/src/App.jsx` – neue Routen `/passwort-zuruecksetzen`,
  `/nutzerverwaltung`

## Kontext (nur Verweise, keine Dokumentkopien)

- `docs/19-Datenbank-Login.md`: Abschnitt "Offene Punkte", nennt den
  Passwort-Reset seit `DB-001` als bekannte Lücke
- `docs/agent-briefs/STATUS.md` [BE-007]: Backlog-Eintrag, jetzt erledigt

## Entscheidung (im Chat geklärt, 2026-09-17)

- **Admin-gestützt statt E-Mail-Versand**: Im Projekt existiert keinerlei
  SMTP-/Mail-Provider-Infrastruktur; ein echter Self-Service-Flow per Mail
  wäre ein deutlich größerer Zusatzaufwand (Provider einrichten, Zugangsdaten,
  Testing) gewesen. Für den aktuellen, kleinen/selbstbetriebenen Nutzerkreis
  reicht ein Admin, der einen Einmal-Link erzeugt und ihn manuell zustellt.
- **Vormerkung (Sven, 2026-09-17):** Sobald ein echter Online-Server-Host
  ansteht, eröffnet das ohnehin neue Optionen (u. a. E-Mail-Versand) – dann
  lohnt sich ein "richtiger" Self-Service-Reset per Mail. Als eigener
  Backlog-Punkt `BE-008` in `STATUS.md` vorgemerkt, damit es nicht wieder
  verloren geht. Die jetzige Token-Mechanik (Tabelle, Hashing, Ablauf,
  Einmal-Nutzung) ist so gebaut, dass ein künftiger Mail-Versand nur den
  Zustellweg ersetzen müsste, nicht die Grundlage.

## Ergänzung (Sven, 2026-09-17): Benachrichtigungen

Nachfrage nach der ersten Auslieferung: "bekommt der admin auch eine
Benachrichtigung bevor ich teste?" – bis dahin gab es keine. Sven wollte
beides: die betroffene Person informieren, sobald ihr Passwort geändert
wurde, UND alle Admins informieren, sobald jemand einen Reset anfordert.
Da ein gesperrter Nutzer (kein Login mehr möglich) bis dahin keinen Weg
hatte, einen Reset überhaupt anzustoßen, kam eine neue öffentliche Route
dazu:

- **`POST /auth/passwort-reset-anfordern`** (öffentlich, eigenes
  Rate-Limit über `auth:`-Prefix wie alle Auth-Routen): nimmt eine E-Mail
  entgegen, antwortet immer generisch `{ ok: true }` (kein
  Enumeration-Leck). Existiert die E-Mail, werden alle Nutzer mit
  `rolle = 'admin'` per `benachrichtigeNutzer()` benachrichtigt (Titel
  "Passwort-Reset angefragt", Link auf `/nutzerverwaltung`). Existiert sie
  nicht, passiert nichts – von außen nicht unterscheidbar.
- **`POST /auth/passwort-reset`** benachrichtigt nach erfolgreichem Reset
  zusätzlich die betroffene Person selbst (Titel "Passwort geändert",
  Sicherheitshinweis, Link auf `/profil`) – best-effort, nach der
  eigentlichen Antwort, darf den Reset nie zum Scheitern bringen (siehe
  `.catch()` im Code).
- Frontend: `PasswortZuruecksetzen.jsx` zeigt ohne `?token=` in der URL
  jetzt ein E-Mail-Formular statt nur eines Hinweistexts; nach dem
  Absenden eine Bestätigung ("Admin wurde benachrichtigt").
- Keine Schema-Änderung nötig – nutzt nur die bereits vorhandene
  `benachrichtigungen`-Tabelle (`BE-005`) und die bestehende
  `passwort_reset_tokens`-Tabelle.

## Umsetzungsschritte (Checkliste)

- [x] `passwort_reset_tokens`-Tabelle: `user_id`, `token_hash` (SHA-256,
      kein Klartext in der DB), `erstellt_von` (Admin), `laeuft_ab_am`
      (24h), `eingeloest_am`
- [x] `adminPflicht`-Middleware (strenger als `autorPflicht`: nur `admin`,
      nicht `autor`)
- [x] `POST /admin/users/:id/passwort-reset`: erzeugt Token, gibt Klartext
      NUR in dieser einen Antwort zurück
- [x] `GET /admin/users`: Liste für die Admin-UI (ohne sensible Felder)
- [x] `POST /auth/passwort-reset`: prüft Token (nicht eingelöst, nicht
      abgelaufen), setzt neues Passwort (gleiche Komplexitätsregel wie
      Registrierung), verbraucht den Token, entwertet zusätzlich alle
      anderen offenen Tokens desselben Nutzers
- [x] Bewusst generische Fehlermeldung bei ungültigem/abgelaufenem/fremdem
      Token (kein Enumeration-Leck)
- [x] Frontend: `/passwort-zuruecksetzen` (öffentlich, Token aus URL),
      `/nutzerverwaltung` (admin-only, Nav-Punkt nur für `rolle === 'admin'`),
      "Passwort vergessen?"-Link im Login-Formular
- [x] `node scripts/check-agent-briefs.mjs` bleibt grün

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [x] Admin kann für einen Nutzer einen Reset-Link erzeugen, Klartext-Token
      ist nur in der einen API-Antwort sichtbar (steht danach nur noch als
      Hash in der DB)
- [x] Gültiger, nicht eingelöster, nicht abgelaufener Token setzt das
      Passwort erfolgreich
- [x] Derselbe Token kann kein zweites Mal verwendet werden
- [x] Ein abgelaufener Token wird abgelehnt
- [x] Nicht-Admin-Konten (`autor`, `lernende`) bekommen 403 auf
      `/admin/users*`
- [x] (Ergänzung 2026-09-17) Anfrage über `/auth/passwort-reset-anfordern`
      mit bekannter E-Mail benachrichtigt alle Admin-Konten, mit
      unbekannter E-Mail keinen
- [x] (Ergänzung 2026-09-17) Erfolgreicher Reset benachrichtigt die
      betroffene Person selbst

## Ergebnis (wird beim Abschluss ausgefüllt)

Umgesetzt wie geplant. In der Sandbox getestet (lokaler PostgreSQL-16-
Cluster, danach wieder entfernt, Rolle `azubiprep_app` simuliert die
Produktions-Rechte): `schema.sql` läuft sauber durch (neue Tabelle
`passwort_reset_tokens`), die komplette Token-Sequenz wurde per SQL
nachgestellt – Admin- und Nutzer-Konto anlegen → Token für den Nutzer
erzeugen → gültiger Token setzt das Passwort → derselbe Token wird beim
zweiten Versuch korrekt abgelehnt (0 Treffer) → ein separat angelegter,
bereits abgelaufener Token wird ebenfalls abgelehnt. Zusätzlich die
Token-Erzeugung/-Hashing-Logik isoliert in Node getestet (64-stelliger
Hex-Token, zwei Aufrufe erzeugen unterschiedliche Tokens, Hash ist
deterministisch, Ablaufzeitpunkt korrekt ~24h). `node
scripts/check-agent-briefs.mjs` läuft grün. Frontend-Seiten nicht in der
Sandbox lauffähig testbar (npm-Registry gesperrt), Klammer-/
Strukturprüfung aller geänderten/neuen Dateien lief sauber durch. Sven
bestätigt nach Dateiübernahme live auf seiner Maschine.

**Ergänzung 2026-09-17 (Benachrichtigungen):** erneut per SQL in derselben
Sandbox-Methodik nachgestellt (danach wieder entfernt): zwei Admin-Konten
+ ein normales Nutzerkonto angelegt, Anfrage für die bekannte E-Mail
simuliert → beide Admin-Konten bekommen je eine Benachrichtigung "Passwort-
Reset angefragt" (2 Zeilen in `benachrichtigungen`); Anfrage für eine
unbekannte E-Mail simuliert → Zeilenanzahl unverändert (0 neue). Danach
Reset-Ablauf simuliert → betroffener Nutzer bekommt eine Benachrichtigung
"Passwort geändert" (1 neue Zeile). Keine Schema-Änderung in dieser
Ergänzung, `benachrichtigungen` (`BE-005`) und `passwort_reset_tokens`
(oben) bestanden bereits. `node --check` auf `auth.routes.js` und eine
Klammer-/Strukturprüfung auf `PasswortZuruecksetzen.jsx` liefen sauber
durch. `node scripts/check-agent-briefs.mjs` läuft weiterhin grün.
