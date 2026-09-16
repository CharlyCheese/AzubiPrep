// Registrierung & Login. Nur aktiv, wenn eine Datenbank konfiguriert ist
// (siehe db.js / config.js) – sonst bleibt die App im reinen Offline-Modus.
import { Router } from 'express';
import { query } from '../db.js';
import {
  passwortHashen,
  passwortPruefen,
  tokenErstellen,
  emailGueltig,
  passwortGueltig,
  authPflicht,
} from '../auth.js';
import { rateLimiter } from '../sicherheit.js';

export function buildAuthRoutes() {
  const router = Router();

  // Eigenes, strengeres Limit gegen Brute-Force/Enumeration auf Auth-Routen.
  router.use(rateLimiter({ maxProMinute: 20, keyPrefix: 'auth:' }));

  router.post('/auth/register', async (req, res, next) => {
    try {
      const { email, passwort, fachrichtung } = req.body || {};
      if (!emailGueltig(email)) {
        res.status(400).json({ error: 'Ungültige E-Mail-Adresse' });
        return;
      }
      if (!passwortGueltig(passwort)) {
        res.status(400).json({
          error: 'Passwort muss mind. 8 Zeichen haben, mit Groß- und Kleinbuchstaben, einer Zahl und einem Sonderzeichen',
        });
        return;
      }

      const emailNormalisiert = email.trim().toLowerCase();
      const bestehend = await query('SELECT id FROM users WHERE email = $1', [emailNormalisiert]);
      if (bestehend.rows.length > 0) {
        // Bewusst gleiche Fehlermeldung wie bei ungültigen Daten – kein
        // Enumeration-Leck, welche E-Mails schon registriert sind.
        res.status(400).json({ error: 'Registrierung nicht möglich' });
        return;
      }

      const hash = await passwortHashen(passwort);
      const ergebnis = await query(
        `INSERT INTO users (email, password_hash, fachrichtung)
         VALUES ($1, $2, $3)
         RETURNING id, email, fachrichtung, rolle`,
        [emailNormalisiert, hash, fachrichtung || null],
      );
      const user = ergebnis.rows[0];
      const token = tokenErstellen(user);
      res.status(201).json({ token, user: { id: user.id, email: user.email, fachrichtung: user.fachrichtung, rolle: user.rolle } });
    } catch (err) {
      next(err);
    }
  });

  router.post('/auth/login', async (req, res, next) => {
    try {
      const { email, passwort } = req.body || {};
      if (!emailGueltig(email) || typeof passwort !== 'string') {
        res.status(400).json({ error: 'E-Mail oder Passwort falsch' });
        return;
      }

      const emailNormalisiert = email.trim().toLowerCase();
      const ergebnis = await query(
        'SELECT id, email, password_hash, fachrichtung, rolle FROM users WHERE email = $1',
        [emailNormalisiert],
      );
      const user = ergebnis.rows[0];
      // Bewusst generische Fehlermeldung + gleicher Ablauf bei "kein User"
      // wie bei "falsches Passwort", um kein Enumeration-Leck zu erzeugen.
      if (!user) {
        res.status(401).json({ error: 'E-Mail oder Passwort falsch' });
        return;
      }
      const passwortOk = await passwortPruefen(passwort, user.password_hash);
      if (!passwortOk) {
        res.status(401).json({ error: 'E-Mail oder Passwort falsch' });
        return;
      }

      const token = tokenErstellen(user);
      res.json({ token, user: { id: user.id, email: user.email, fachrichtung: user.fachrichtung, rolle: user.rolle } });
    } catch (err) {
      next(err);
    }
  });

  router.get('/auth/me', authPflicht, async (req, res, next) => {
    try {
      const ergebnis = await query('SELECT id, email, fachrichtung, rolle FROM users WHERE id = $1', [req.userId]);
      const user = ergebnis.rows[0];
      if (!user) {
        res.status(404).json({ error: 'Nutzer nicht gefunden' });
        return;
      }
      res.json({ user });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
