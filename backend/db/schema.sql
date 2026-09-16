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

-- Content (Fragen/Module/Fachrichtungen), optional (siehe DB-002).
--
-- Ist DATABASE_URL gesetzt UND diese Tabellen sind befüllt, lädt
-- backend/src/content.js die Inhalte von hier statt aus den CSV-Dateien
-- unter content/. Ohne DATABASE_URL oder mit leeren Tabellen bleibt der
-- bisherige CSV-Ladepfad exakt wie zuvor aktiv (Fallback-Garantie, siehe
-- docs/10-Architektur.md). Die CSV-Dateien werden dadurch nicht überflüssig:
-- backend/scripts/export-content-to-csv.mjs schreibt den DB-Stand
-- regelmäßig zurück nach content/*.csv – das ist gleichzeitig der
-- Offline-Fallback-Snapshot und die git-versionierte, diff-bare Grundlage
-- für den verpflichtenden CONTENT-Review (ORCHESTRATOR.md Abschnitt 1).
CREATE TABLE IF NOT EXISTS fachrichtungen (
  code          TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  beschreibung  TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS modules (
  modul_id      TEXT PRIMARY KEY,
  fachrichtung  TEXT NOT NULL,
  code          TEXT NOT NULL,
  titel         TEXT NOT NULL,
  beschreibung  TEXT NOT NULL DEFAULT ''
);

-- review_status begleitet OPS-002: jede Frage trägt fest, ob sie den
-- verpflichtenden unabhängigen Fachreview bereits durchlaufen hat.
-- 'gemeldet' ist für BE-003 (In-App-Feedback "Frage melden") vorgesehen.
CREATE TABLE IF NOT EXISTS questions (
  id            TEXT PRIMARY KEY,
  fachrichtung  TEXT NOT NULL,
  modul_id      TEXT NOT NULL REFERENCES modules (modul_id),
  thema         TEXT NOT NULL DEFAULT '',
  typ           TEXT NOT NULL CHECK (typ IN ('SC', 'MC', 'FT')),
  frage         TEXT NOT NULL,
  option_a      TEXT NOT NULL DEFAULT '',
  option_b      TEXT NOT NULL DEFAULT '',
  option_c      TEXT NOT NULL DEFAULT '',
  option_d      TEXT NOT NULL DEFAULT '',
  antwort       TEXT NOT NULL,
  erklaerung    TEXT NOT NULL DEFAULT '',
  schwierigkeit TEXT NOT NULL CHECK (schwierigkeit IN ('leicht', 'mittel', 'schwer')),
  quelle        TEXT NOT NULL DEFAULT '',
  quelldatei    TEXT NOT NULL DEFAULT '',
  -- ASCII-Werte bewusst (statt 'ungeprüft'/'geprüft'): ein Umlaut in einer
  -- CHECK-Constraint ist über verschiedene Editoren/Kodierungen hinweg
  -- fragil (zwei Unicode-Darstellungen für "ü" sehen identisch aus, sind
  -- aber unterschiedliche Bytes) und hat beim ersten Praxistest genau
  -- deshalb einen Constraint-Verstoß ausgelöst.
  review_status TEXT NOT NULL DEFAULT 'ungeprueft'
                CHECK (review_status IN ('ungeprueft', 'geprueft', 'gemeldet', 'korrigiert')),
  geprueft_am   TIMESTAMPTZ,
  geprueft_von  TEXT,
  aktualisiert_am TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_questions_modul ON questions (modul_id);
CREATE INDEX IF NOT EXISTS idx_questions_review_status ON questions (review_status);
