// Geräte-übergreifender Sync des Lernstands (profileStore, progressStore,
// flashcardStore, examStore, activityStore, gamificationStore …).
//
// Ein Datensatz pro Nutzer + Store-Name (siehe db/schema.sql). Das Frontend
// schickt/holt jeweils den kompletten JSON-Inhalt eines Stores – gleiches
// Format wie schon heute in localStorage.
import { Router } from 'express';
import { query } from '../db.js';
import { authPflicht } from '../auth.js';

// Whitelist erlaubter Store-Namen, damit kein beliebiger Tabellen-/Datenmüll
// unter user_state landet.
const ERLAUBTE_STORES = new Set([
  'profil',
  'fortschritt',
  'karteikarten',
  'pruefungen',
  'aktivitaet',
  'gamification',
]);

function storeGueltig(name) {
  return typeof name === 'string' && ERLAUBTE_STORES.has(name);
}

export function buildSyncRoutes() {
  const router = Router();
  router.use(authPflicht);

  // Kompletten Lernstand (alle Stores) des eingeloggten Nutzers abrufen.
  router.get('/sync', async (req, res, next) => {
    try {
      const ergebnis = await query(
        'SELECT store_name, daten, aktualisiert_am FROM user_state WHERE user_id = $1',
        [req.userId],
      );
      const stores = {};
      for (const row of ergebnis.rows) {
        stores[row.store_name] = { daten: row.daten, aktualisiertAm: row.aktualisiert_am };
      }
      res.json({ stores });
    } catch (err) {
      next(err);
    }
  });

  // Einen einzelnen Store überschreiben (Client gilt als "source of truth"
  // für diesen Aufruf – einfache Last-Write-Wins-Strategie zum Start).
  router.put('/sync/:storeName', async (req, res, next) => {
    try {
      const { storeName } = req.params;
      if (!storeGueltig(storeName)) {
        res.status(400).json({ error: 'Unbekannter Store' });
        return;
      }
      const daten = req.body?.daten;
      if (daten === undefined || typeof daten !== 'object' || daten === null) {
        res.status(400).json({ error: 'Feld "daten" (Objekt) erforderlich' });
        return;
      }

      const ergebnis = await query(
        `INSERT INTO user_state (user_id, store_name, daten, aktualisiert_am)
         VALUES ($1, $2, $3, now())
         ON CONFLICT (user_id, store_name)
         DO UPDATE SET daten = EXCLUDED.daten, aktualisiert_am = now()
         RETURNING aktualisiert_am`,
        [req.userId, storeName, JSON.stringify(daten)],
      );
      res.json({ ok: true, aktualisiertAm: ergebnis.rows[0].aktualisiert_am });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
