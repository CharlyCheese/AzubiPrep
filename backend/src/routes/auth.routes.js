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
  resetTokenHashen,
} from '../auth.js';
import { rateLimiter } from '../sicherheit.js';
import { benachrichtigeNutzer } from '../push.js';

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

  // BE-007-Ergänzung: Wer sein Passwort vergessen hat, kann sich nicht mehr
  // einloggen und käme sonst nicht an eine Admin-Person heran, ohne die App
  // zu verlassen. Diese Route schließt die Lücke: benachrichtigt alle
  // Admin-Konten, dass für die angegebene E-Mail ein Reset gewünscht ist –
  // der Admin erzeugt den eigentlichen Link dann weiterhin manuell über
  // /nutzerverwaltung. Bewusst IMMER dieselbe generische Antwort, unabhängig
  // davon, ob die E-Mail existiert (kein Enumeration-Leck über die Antwort).
  router.post('/auth/passwort-reset-anfordern', async (req, res, next) => {
    try {
      const { email } = req.body || {};
      if (emailGueltig(email)) {
        const emailNormalisiert = email.trim().toLowerCase();
        const { rows } = await query('SELECT id FROM users WHERE email = $1', [emailNormalisiert]);
        if (rows[0]) {
          const { rows: admins } = await query("SELECT id FROM users WHERE rolle = 'admin'");
          await Promise.all(admins.map((a) => benachrichtigeNutzer(a.id, {
            titel: 'Passwort-Reset angefragt',
            text: `${emailNormalisiert} möchte ihr/sein Passwort zurücksetzen lassen.`,
            url: '/nutzerverwaltung',
          })));
        }
      }
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  // BE-007: öffentliche Gegenstelle zu POST /admin/users/:id/passwort-reset
  // (nutzer-admin.routes.js) – setzt mit einem gültigen, admin-erzeugten
  // Token ein neues Passwort. Bewusst kein "Ist der Token gültig?"-GET vorher
  // (würde nur unnötig Enumeration/Timing-Angriffsfläche schaffen); das
  // Frontend zeigt das Formular unabhängig davon und meldet einen ungültigen/
  // abgelaufenen Token erst beim Absenden.
  router.post('/auth/passwort-reset', async (req, res, next) => {
    try {
      const { token, neuesPasswort } = req.body || {};
      if (typeof token !== 'string' || !token) {
        res.status(400).json({ error: 'Ungültiger oder abgelaufener Link' });
        return;
      }
      if (!passwortGueltig(neuesPasswort)) {
        res.status(400).json({
          error: 'Passwort muss mind. 8 Zeichen haben, mit Groß- und Kleinbuchstaben, einer Zahl und einem Sonderzeichen',
        });
        return;
      }

      const tokenHash = resetTokenHashen(token);
      const { rows } = await query(
        `SELECT id, user_id FROM passwort_reset_tokens
         WHERE token_hash = $1 AND eingeloest_am IS NULL AND laeuft_ab_am > now()`,
        [tokenHash],
      );
      const eintrag = rows[0];
      if (!eintrag) {
        // Bewusst generisch (kein Unterschied "abgelaufen" vs. "nie
        // existiert") – kein Enumeration-Leck.
        res.status(400).json({ error: 'Ungültiger oder abgelaufener Link' });
        return;
      }

      const hash = await passwortHashen(neuesPasswort);
      await query('UPDATE users SET password_hash = $1, aktualisiert_am = now() WHERE id = $2', [hash, eintrag.user_id]);
      // Einmal-Token verbrauchen; zusätzlich alle anderen offenen Tokens
      // desselben Nutzers entwerten (z. B. wenn ein Admin aus Versehen
      // mehrfach einen Link erzeugt hatte).
      await query('UPDATE passwort_reset_tokens SET eingeloest_am = now() WHERE user_id = $1 AND eingeloest_am IS NULL', [eintrag.user_id]);

      res.json({ ok: true });

      // Sicherheitshinweis für die betroffene Person, best-effort nach der
      // Antwort (darf den eigentlichen Reset nie zum Scheitern bringen) –
      // wichtig, falls sie z. B. auf einem anderen Gerät noch eingeloggt ist
      // und die Änderung gar nicht selbst veranlasst hat.
      benachrichtigeNutzer(eintrag.user_id, {
        titel: 'Passwort geändert',
        text: 'Dein Passwort wurde soeben über einen Admin-Reset-Link geändert. Warst du das nicht, wende dich bitte umgehend an eine Admin-Person.',
        url: '/profil',
      }).catch((err) => {
        console.warn(`[Push] Passwort-geändert-Benachrichtigung für Nutzer ${eintrag.user_id} fehlgeschlagen:`, err?.message || err);
      });
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
