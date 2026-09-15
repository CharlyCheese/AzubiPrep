# Brief DB-001: PostgreSQL-Login & Geräte-Sync (Grundlage)

Status: done
Bereich: DB
Angelegt: 2026-09-14
Abgeschlossen: 2026-09-14

## Ziel (1–3 Sätze)

Optionale Datenbank-Anbindung schaffen, damit Nutzer sich registrieren,
einloggen und ihren Lernstand geräteübergreifend synchronisieren können –
ohne den bestehenden reinen Offline-/`localStorage`-Modus zu verändern oder
zu gefährden. Lokal zuerst (PostgreSQL auf dem eigenen PC), spätere
Migration auf echtes Hosting soll ein reiner Konfigurationswechsel sein.

## Betroffene Dateien (exakte Pfade)

- `backend/src/config.js` (dotenv-Ladevorgang, DB/JWT-Konfiguration)
- `backend/src/db.js` (neu – Connection-Pool, Health-Check)
- `backend/src/auth.js` (neu – bcrypt-Hashing, JWT, Auth-Middleware)
- `backend/src/routes/auth.routes.js` (neu – Register/Login/Me)
- `backend/src/routes/sync.routes.js` (neu – Lernstand-Sync je Store)
- `backend/src/app.js` (Routen nur einhängen, wenn DB aktiv)
- `backend/src/server.js` (Start-Log zeigt DB-Status)
- `backend/db/schema.sql` (neu – Tabellen `users`, `user_state`)
- `backend/package.json` (Abhängigkeiten: pg, bcryptjs, jsonwebtoken, dotenv)
- `.env.example` (neu)
- `docs/19-Datenbank-Login.md` (neu – Setup-Anleitung)

## Kontext (nur Verweise, keine Dokumentkopien)

- `docs/PROJEKTSTATUS.md` Abschnitt 8 (Architektur-Entscheidungen,
  Repository-Seam-Prinzip)
- `docs/10-Architektur.md`

## Umsetzungsschritte (Checkliste)

- [x] PostgreSQL lokal installiert (Sven, EDB-Installer für Windows)
- [x] Eigene Datenbank `azubiprep` + eigener Benutzer `azubiprep_app`
      angelegt (nicht der Superuser `postgres`)
- [x] Schema geladen (`users`, `user_state`), Tabellen-Owner auf
      `azubiprep_app` korrigiert (Berechtigungsfehler behoben)
- [x] Backend-Module implementiert (db.js, auth.js, Routen)
- [x] `dotenv` ergänzt, `.env`-Laden nachgerüstet (fehlte anfangs komplett)
- [x] Registrierung, Login, `/auth/me` gegen echte DB getestet (curl)

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [x] Ohne `DATABASE_URL` startet der Server unverändert im Offline-Modus
      (keine neuen Routen aktiv, keine Fehler)
- [x] Mit `DATABASE_URL` meldet der Server beim Start eindeutig, ob die
      DB-Verbindung steht
- [x] `POST /api/auth/register` liefert Token + User bei gültigen Daten
- [x] `POST /api/auth/login` liefert Token + User bei korrekten
      Zugangsdaten, generische Fehlermeldung bei falschen (kein
      Enumeration-Leck)
- [x] `GET /api/auth/me` liefert die eigenen Nutzerdaten nur mit gültigem
      Bearer-Token
- [x] Passwörter werden ausschließlich gehasht gespeichert (bcrypt)
- [x] Keine hart kodierten Zugangsdaten im Code

## Ergebnis (wird beim Abschluss ausgefüllt)

Vollständig umgesetzt und gegen die echte lokale Datenbank getestet
(Registrierung, Login, `/auth/me` – alle drei mit `curl` verifiziert).

Aufgetretene Probleme während der Umsetzung (zur Erinnerung für ähnliche
Fälle):

1. `dotenv` fehlte in `package.json` bzw. kam beim Nutzer zwischenzeitlich
   nicht an (Dateiübertragung auf den lokalen PC schlug mehrfach fehl,
   Ursache nicht abschließend geklärt – Force-Übertragung hat geholfen).
2. Nutzer trug sein echtes Passwort versehentlich in eine Kommentarzeile
   der `.env` ein statt in die aktive `DATABASE_URL`-Zeile.
3. Tabellen wurden zunächst mit dem PostgreSQL-Superuser (`postgres`) statt
   mit `azubiprep_app` angelegt → "keine Berechtigung für Tabelle users".
   Behoben mit `ALTER TABLE ... OWNER TO azubiprep_app`.

**Offen / nicht Teil dieses Briefs** (siehe `docs/agent-briefs/STATUS.md`):
Frontend-Integration (Login-/Registrierungs-UI, Umschaltung
lokal/synchronisiert) ist ein eigener, noch offener Task, siehe `FE-001` in
`STATUS.md`.
