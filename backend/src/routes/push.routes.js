// BE-001: Endpunkte zum Registrieren/Abmelden von Push-Subscriptions sowie
// zum Ausliefern des öffentlichen VAPID-Schlüssels (den braucht der
// Browser für pushManager.subscribe(), er ist unbedenklich öffentlich).
// Wie auth.routes.js/content-admin.routes.js nur aktiv, wenn eine DB
// konfiguriert ist – zusätzlich hier: nur, wenn auch VAPID-Schlüssel
// gesetzt sind (siehe isPushAktiviert in push.js).
import { Router } from 'express';
import { query } from '../db.js';
import { authPflicht } from '../auth.js';
import { config } from '../config.js';

export function buildPushRoutes() {
  const router = Router();

  router.get('/push/public-key', (req, res) => {
    res.json({ publicKey: config.vapidPublicKey });
  });

  router.use(authPflicht);

  router.post('/push/subscribe', async (req, res, next) => {
    try {
      const { endpoint, keys } = req.body || {};
      if (!endpoint || !keys?.p256dh || !keys?.auth) {
        res.status(400).json({ error: 'Ungültige Subscription' });
        return;
      }
      // ON CONFLICT: dasselbe Gerät kann sich mehrfach registrieren (z. B.
      // nach Browser-Neuinstallation mit gleichem Endpoint) – dann wird nur
      // der Nutzer/die Schlüssel aktualisiert statt ein Duplikat anzulegen.
      await query(
        `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (endpoint) DO UPDATE SET user_id = $1, p256dh = $3, auth = $4`,
        [req.userId, endpoint, keys.p256dh, keys.auth],
      );
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  router.post('/push/unsubscribe', async (req, res, next) => {
    try {
      const { endpoint } = req.body || {};
      if (!endpoint) {
        res.status(400).json({ error: 'endpoint fehlt' });
        return;
      }
      await query('DELETE FROM push_subscriptions WHERE endpoint = $1 AND user_id = $2', [endpoint, req.userId]);
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
