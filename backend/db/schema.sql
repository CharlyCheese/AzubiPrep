-- AzubiPrep – Datenbankschema (PostgreSQL)
--
-- Einmalig ausführen, nachdem die Datenbank "azubiprep" und der Benutzer
-- "azubiprep_app" angelegt wurden (siehe docs/19-Datenbank-Login.md).
--
--   psql "postgresql://azubiprep_app:PASSWORT@localhost:5432/azubiprep" -f backend/db/schema.sql

-- Benutzerkonten. Passwörter werden ausschließlich gehasht gespeichert
-- (bcrypt), niemals im Klartext.
CREATE TABLE IF NOT EXISTS users (
  id            BIGSERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  fachrichtung  TEXT,
  erstellt_am   TIMESTAMPTZ NOT NULL DEFAULT now(),
  aktualisiert_am TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Geräte-übergreifender Lernstand.
--
-- Statt jeden Frontend-Store (profileStore, progressStore, flashcardStore,
-- examStore, activityStore, gamificationStore …) einzeln relational
-- abzubilden, wird je Nutzer und Store-Name ein JSONB-Dokument gespeichert.
-- Das spiegelt die bestehende localStorage-Struktur 1:1 und lässt sich pro
-- Store unabhängig synchronisieren/überschreiben, ohne bei jeder neuen
-- Frontend-Funktion eine Migration zu brauchen.
CREATE TABLE IF NOT EXISTS user_state (
  user_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_name    TEXT NOT NULL,
  daten         JSONB NOT NULL DEFAULT '{}'::jsonb,
  aktualisiert_am TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, store_name)
);

CREATE INDEX IF NOT EXISTS idx_user_state_user ON user_state (user_id);
