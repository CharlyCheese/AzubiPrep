// Datenbank-Verbindung (PostgreSQL, optional).
//
// Die App funktioniert weiterhin komplett ohne Datenbank (reiner
// Offline-/localStorage-Modus im Frontend). Ist DATABASE_URL gesetzt, wird
// hier ein Connection-Pool aufgebaut und für Login/Sync genutzt.
//
// Konfiguration ausschließlich über Umgebungsvariablen, keine hart
// kodierten Zugangsdaten (gleiches Prinzip wie config.js).
import pg from 'pg';
import { config } from './config.js';

const { Pool } = pg;

let pool = null;

export function isDbAktiviert() {
  return Boolean(config.databaseUrl);
}

export function getPool() {
  if (!isDbAktiviert()) {
    throw new Error('Keine Datenbank konfiguriert (DATABASE_URL fehlt)');
  }
  if (!pool) {
    pool = new Pool({ connectionString: config.databaseUrl });
    pool.on('error', (err) => {
      // Fehler auf ungenutzten, im Pool gehaltenen Clients (z.B. Verbindungsabbruch)
      // dürfen den Prozess nicht abschießen.
      console.error('[db] Unerwarteter Pool-Fehler:', err.message);
    });
  }
  return pool;
}

// Einfacher Verbindungstest, z. B. für einen Health-Check-Endpunkt.
export async function dbErreichbar() {
  if (!isDbAktiviert()) return false;
  try {
    await getPool().query('SELECT 1');
    return true;
  } catch (err) {
    console.error('[db] Verbindungstest fehlgeschlagen:', err.message);
    return false;
  }
}

export async function query(text, params) {
  return getPool().query(text, params);
}

export async function schliessen() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
