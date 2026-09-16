-- AzubiPrep – Datenbankschema (PostgreSQL)
--
-- Einmalig ausführen, nachdem die Datenbank "azubiprep" und der Benutzer
-- "azubiprep_app" angelegt wurden (siehe docs/19-Datenbank-Login.md).
--
--   psql "postgresql://azubiprep_app:PASSWORT@localhost:5432/azubiprep" -f backend/db/schema.sql

-- Benutzerkonten. Passwörter werden ausschließlich gehasht gespeichert
-- (bcrypt), niemals im Klartext.
-- rolle (CONTENT-001): steuert den Zugriff auf die Autoren-Weboberfläche.
-- 'lernende' (Default) = kein Content-Zugriff, 'autor' = darf Fragen der
-- eigenen fachrichtung (+ 'ALLE') bearbeiten, 'admin' = uneingeschränkt.
-- Vergabe bewusst manuell (SQL/pgAdmin), kein Self-Service-Upgrade.
-- ASCII-Werte aus demselben Grund wie bei review_status (siehe unten).
CREATE TABLE IF NOT EXISTS users (
  id            BIGSERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  fachrichtung  TEXT,
  rolle         TEXT NOT NULL DEFAULT 'lernende'
                CHECK (rolle IN ('lernende', 'autor', 'admin')),
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
  -- 'deaktiviert' (CONTENT-001): Ersatz für ein hartes DELETE über die
  -- Autoren-UI – blendet die Frage aus dem aktiven Lernbestand aus,
  -- jederzeit reaktivierbar (Zeile inkl. Historie bleibt erhalten).
  review_status TEXT NOT NULL DEFAULT 'ungeprueft'
                CHECK (review_status IN ('ungeprueft', 'geprueft', 'gemeldet', 'korrigiert', 'deaktiviert')),
  geprueft_am   TIMESTAMPTZ,
  geprueft_von  TEXT,
  aktualisiert_am TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_questions_modul ON questions (modul_id);
CREATE INDEX IF NOT EXISTS idx_questions_review_status ON questions (review_status);

-- Änderungshistorie (CONTENT-001): vor jedem UPDATE über die Autoren-UI
-- wird die bisherige Zeile hier gesichert – Fallback, falls eine Änderung
-- eine vorher richtige Antwort versehentlich falsch macht. Append-only,
-- kein Fremdschlüssel mit ON DELETE CASCADE auf questions.id, damit ein
-- Historieneintrag auch dann erhalten bleibt, falls eine Frage jemals
-- doch gelöscht würde.
CREATE TABLE IF NOT EXISTS questions_verlauf (
  id              BIGSERIAL PRIMARY KEY,
  frage_id        TEXT NOT NULL,
  fachrichtung    TEXT NOT NULL,
  modul_id        TEXT NOT NULL,
  thema           TEXT NOT NULL DEFAULT '',
  typ             TEXT NOT NULL,
  frage           TEXT NOT NULL,
  option_a        TEXT NOT NULL DEFAULT '',
  option_b        TEXT NOT NULL DEFAULT '',
  option_c        TEXT NOT NULL DEFAULT '',
  option_d        TEXT NOT NULL DEFAULT '',
  antwort         TEXT NOT NULL,
  erklaerung      TEXT NOT NULL DEFAULT '',
  schwierigkeit   TEXT NOT NULL,
  quelle          TEXT NOT NULL DEFAULT '',
  review_status   TEXT NOT NULL,
  geaendert_am    TIMESTAMPTZ NOT NULL DEFAULT now(),
  geaendert_von   TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_questions_verlauf_frage ON questions_verlauf (frage_id);

-- Upgrade-Pfad für bereits bestehende Installationen (users/questions aus
-- DB-001/DB-002, vor CONTENT-001 angelegt): "CREATE TABLE IF NOT EXISTS"
-- oben tut bei einer schon vorhandenen Tabelle NICHTS – die neue
-- rolle-Spalte und das erweiterte review_status-CHECK kämen sonst nie an.
-- Die folgenden Anweisungen sind deshalb eigenständig idempotent (per
-- IF NOT EXISTS bzw. DROP CONSTRAINT IF EXISTS + neu anlegen) und laufen
-- bei jedem schema.sql-Lauf gefahrlos mit – egal ob die Tabelle gerade
-- neu anglegt wurde (dann ohnehin schon im Zielzustand) oder schon vorher
-- existierte.
ALTER TABLE users ADD COLUMN IF NOT EXISTS rolle TEXT NOT NULL DEFAULT 'lernende';
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_rolle_check;
ALTER TABLE users ADD CONSTRAINT users_rolle_check CHECK (rolle IN ('lernende', 'autor', 'admin'));

ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_review_status_check;
ALTER TABLE questions ADD CONSTRAINT questions_review_status_check
  CHECK (review_status IN ('ungeprueft', 'geprueft', 'gemeldet', 'korrigiert', 'deaktiviert'));
