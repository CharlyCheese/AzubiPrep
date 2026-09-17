// BE-005/BE-006: Benachrichtigungs-Historie ("Mailbox"). Unabhängig von
// Push (funktioniert auch ohne VAPID-Konfiguration, nur DB vorausgesetzt) –
// die Liste zeigt alle Benachrichtigungen, die benachrichtigeNutzer()
// (push.js) für diesen Nutzer erzeugt hat. Bewusst generisch gehalten
// (kein fester "Typ"), damit sich später private Nachrichten zwischen
// Nutzern ergänzen lassen, ohne die Tabelle/Route umzubauen.
//
// BE-006: Archivieren (reversibel, bleibt gespeichert, nur aus der
// normalen Liste ausgeblendet) und endgültiges Löschen. `GET
// /benachrichtigungen` zeigt standardmäßig nur nicht-archivierte
// Einträge; `?ansicht=archiv` zeigt die archivierten.
import { Router } from 'express';
import { query } from '../db.js';
import { authPflicht } from '../auth.js';

const LISTEN_LIMIT = 100;

export function buildBenachrichtigungenRoutes() {
  const router = Router();
  router.use(authPflicht);

  router.get('/benachrichtigungen', async (req, res, next) => {
    try {
      const archivAnsicht = req.query?.ansicht === 'archiv';
      const { rows: eintraege } = await query(
        `SELECT id, titel, text, url, gelesen_am, erstellt_am, archiviert_am
         FROM benachrichtigungen
         WHERE user_id = $1 AND archiviert_am IS ${archivAnsicht ? 'NOT NULL' : 'NULL'}
         ORDER BY erstellt_am DESC
         LIMIT $2`,
        [req.userId, LISTEN_LIMIT],
      );
      // Ungelesen-Zähler bezieht sich immer auf die aktive (nicht
      // archivierte) Liste, unabhängig von der gerade angezeigten Ansicht –
      // das ist auch, was das Nav-Badge in Layout.jsx anzeigt.
      const { rows: zaehler } = await query(
        'SELECT COUNT(*)::int AS ungelesen FROM benachrichtigungen WHERE user_id = $1 AND gelesen_am IS NULL AND archiviert_am IS NULL',
        [req.userId],
      );
      res.json({ eintraege, ungelesen: zaehler[0].ungelesen });
    } catch (err) {
      next(err);
    }
  });

  router.post('/benachrichtigungen/:id/gelesen', async (req, res, next) => {
    try {
      await query(
        'UPDATE benachrichtigungen SET gelesen_am = now() WHERE id = $1 AND user_id = $2 AND gelesen_am IS NULL',
        [req.params.id, req.userId],
      );
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  router.post('/benachrichtigungen/alle-gelesen', async (req, res, next) => {
    try {
      await query(
        'UPDATE benachrichtigungen SET gelesen_am = now() WHERE user_id = $1 AND gelesen_am IS NULL',
        [req.userId],
      );
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  // BE-006: Archivieren – reversibel, Eintrag bleibt in der DB, verschwindet
  // nur aus der Standard-Ansicht.
  router.post('/benachrichtigungen/:id/archivieren', async (req, res, next) => {
    try {
      await query(
        'UPDATE benachrichtigungen SET archiviert_am = now() WHERE id = $1 AND user_id = $2 AND archiviert_am IS NULL',
        [req.params.id, req.userId],
      );
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  // BE-006: Wiederherstellen aus dem Archiv.
  router.post('/benachrichtigungen/:id/wiederherstellen', async (req, res, next) => {
    try {
      await query(
        'UPDATE benachrichtigungen SET archiviert_am = NULL WHERE id = $1 AND user_id = $2',
        [req.params.id, req.userId],
      );
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  // BE-006: Endgültiges Löschen – bewusst nur der eigene Eintrag (user_id
  // im WHERE), sonst 404 statt eines Löschens fremder Benachrichtigungen.
  router.delete('/benachrichtigungen/:id', async (req, res, next) => {
    try {
      const { rowCount } = await query(
        'DELETE FROM benachrichtigungen WHERE id = $1 AND user_id = $2',
        [req.params.id, req.userId],
      );
      if (rowCount === 0) {
        res.status(404).json({ error: 'Benachrichtigung nicht gefunden' });
        return;
      }
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
