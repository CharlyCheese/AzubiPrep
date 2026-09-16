// BE-003: In-App-Feedback-Kanal ("Frage melden"). Nur aktiv, wenn eine
// Datenbank konfiguriert ist (gleiche Bedingung wie auth.routes.js/
// sync.routes.js/content-admin.routes.js) – ohne DB gibt es kein
// review_status-Feld, das gesetzt werden könnte.
import { Router } from 'express';
import { query } from '../db.js';
import { authPflicht } from '../auth.js';
import { rateLimiter } from '../sicherheit.js';

const GRUND_MAX_LAENGE = 1000;

export function buildMeldenRoutes() {
  const router = Router();
  router.use(authPflicht);
  // Eigenes, strengeres Limit – Melden ist ein seltener Vorgang, nicht
  // Teil des normalen Quiz-Durchlaufs (gleiches Muster wie bei
  // auth.routes.js für sicherheitsrelevante/missbrauchsanfällige Routen).
  router.use(rateLimiter({ maxProMinute: 20, keyPrefix: 'melden:' }));

  router.post('/fragen/:id/melden', async (req, res, next) => {
    try {
      const { rows } = await query('SELECT id FROM questions WHERE id = $1', [req.params.id]);
      if (!rows[0]) {
        res.status(404).json({ error: 'Frage nicht gefunden' });
        return;
      }

      const grundRoh = typeof req.body?.grund === 'string' ? req.body.grund.trim() : '';
      const grund = grundRoh.slice(0, GRUND_MAX_LAENGE);

      await query(
        'INSERT INTO fragen_meldungen (frage_id, grund, gemeldet_von) VALUES ($1, $2, $3)',
        [req.params.id, grund, String(req.userId)],
      );
      await query(
        "UPDATE questions SET review_status = 'gemeldet', aktualisiert_am = now() WHERE id = $1",
        [req.params.id],
      );

      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
