# Datenbank & Login (PostgreSQL)

Status: **in Arbeit** – Backend-Grundlage steht, Frontend-Integration folgt.

## Architekturentscheidung

Die App funktioniert weiterhin **komplett ohne Datenbank** (reiner
Offline-/`localStorage`-Modus, wie bisher). Ist die Umgebungsvariable
`DATABASE_URL` nicht gesetzt, bleiben `/api/auth/*` und `/api/sync/*`
deaktiviert und der Server verhält sich exakt wie vorher.

Erst wenn eine PostgreSQL-Datenbank konfiguriert ist, werden Registrierung,
Login und geräteübergreifender Sync aktiv. Das erlaubt einen schrittweisen
Umbau, ohne den funktionierenden Offline-Modus zu gefährden, und eine
spätere Migration von lokalem PostgreSQL zu echtem Hosting ist eine reine
Konfigurationsänderung (nur `DATABASE_URL` ändert sich), kein Code-Umbau.

## 1. Lokale Datenbank einrichten (einmalig)

Voraussetzung: PostgreSQL ist installiert (siehe Chat-Anleitung), eine
Datenbank `azubiprep` und ein eigener Benutzer `azubiprep_app` (nicht der
Superuser `postgres`) wurden in pgAdmin angelegt.

Schema anlegen (Tabellen `users`, `user_state`):

```
psql "postgresql://azubiprep_app:DEIN_PASSWORT@localhost:5432/azubiprep" -f backend/db/schema.sql
```

Falls `psql` nicht im PATH ist: In pgAdmin auf die Datenbank `azubiprep`
rechtsklicken → **Query Tool** → Inhalt von `backend/db/schema.sql`
einfügen → ausführen (F5).

> **Falle, die uns bei `DB-002` und `CONTENT-001` je einmal begegnet ist:**
> Wird `schema.sql` über pgAdmin ausgeführt, läuft das unter der
> pgAdmin-Verbindung (meist der Superuser `postgres`), nicht unter
> `azubiprep_app`. Neue Tabellen gehören dann diesem Superuser – die App
> (die mit `azubiprep_app` verbindet) bekommt beim Schreiben
> `FEHLER: keine Berechtigung für Tabelle <name>`, obwohl das Schema
> korrekt angelegt wurde. Fix: nach jedem Anlegen neuer Tabellen über
> pgAdmin einmal explizit Rechte vergeben (Tabellenname anpassen; bei
> Tabellen mit `BIGSERIAL`-Spalte, z. B. `questions_verlauf`, zusätzlich
> die Sequenz freigeben, sonst schlägt `INSERT` trotz Tabellenrechten
> weiterhin fehl):
> ```sql
> GRANT ALL PRIVILEGES ON TABLE <neue_tabelle> TO azubiprep_app;
> GRANT USAGE, SELECT ON SEQUENCE <neue_tabelle>_id_seq TO azubiprep_app;
> ```
> Wird `schema.sql` stattdessen per `psql` direkt als `azubiprep_app`
> ausgeführt (wie im Befehl oben), tritt das Problem nicht auf – der
> Nutzer besitzt seine eigenen Tabellen dann von Anfang an.

## 2. Backend konfigurieren

1. `\.env.example` (Projektwurzel) nach `backend/.env` kopieren.
2. `DATABASE_URL` eintragen: `postgresql://azubiprep_app:DEIN_PASSWORT@localhost:5432/azubiprep`
3. `JWT_SECRET` erzeugen und eintragen:
   ```
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```
4. Abhängigkeiten installieren:
   ```
   cd backend
   npm install
   ```
5. Backend starten (`npm run dev`) – in der Konsole sollte keine
   Fehlermeldung zur Datenbank erscheinen.

## 3. Testen

Registrierung:

```
curl -X POST http://127.0.0.1:3001/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"passwort\":\"einPasswort123\"}"
```

Antwort enthält `token` und `user`. Login entsprechend über
`/api/auth/login`. Mit dem Token lässt sich `/api/auth/me` und
`/api/sync` abfragen (Header `Authorization: Bearer <token>`).

## Datenmodell

- `users`: E-Mail (eindeutig), gehashtes Passwort (bcrypt), Fachrichtung.
  Bei der **Registrierung** gilt eine Passwort-Mindestanforderung: mind. 8
  Zeichen, mit Groß- und Kleinbuchstaben, einer Zahl und einem Sonderzeichen
  (siehe `backend/src/auth.js`, `passwortGueltig`). Der **Login** prüft diese
  Komplexität bewusst nicht erneut, damit ein vor dieser Regel angelegtes,
  einfacheres Bestandspasswort weiter funktioniert.
- `user_state`: ein Datensatz je Nutzer + Store-Name (`profil`,
  `fortschritt`, `karteikarten`, `pruefungen`, `aktivitaet`,
  `gamification`), Inhalt als JSON – spiegelt die bestehenden
  `frontend/src/store/*.js`-Stores 1:1. Sync-Strategie aktuell:
  Last-Write-Wins (der Client, der zuletzt speichert, gewinnt) – für den
  Start bewusst einfach gehalten, echte Konfliktauflösung ist ein späterer
  Ausbauschritt.

## Offene Punkte (Backlog)

- Frontend: Login-/Registrierungs-UI, Repository-Schicht in
  `frontend/src/api`, die je nach Login-Status zwischen `localStorage` und
  Backend-Sync umschaltet.
- Passwort-Reset-Flow.
- Sync-Konflikte bei mehreren gleichzeitig aktiven Geräten (aktuell
  Last-Write-Wins).
- Migration auf echtes Hosting (verwaltete Postgres-Instanz), sobald der
  Rest steht – nur `DATABASE_URL` in der Produktionsumgebung ändert sich.
