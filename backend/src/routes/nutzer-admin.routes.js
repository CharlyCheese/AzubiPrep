// BE-007: admin-gestützter Passwort-Reset. Kein E-Mail-Versand im Projekt
// vorhanden (bewusste Entscheidung, siehe Brief) – ein Admin erzeugt hier
// einen Einmal-Link und teilt ihn außerhalb der App (Chat, persönlich) mit
// der betroffenen Person. Bewusst eigene Datei statt Erweiterung von
// content-admin.routes.js: andere Zuständigkeit (Nutzerverwaltung statt
// Fragenpflege), eigener adminPflicht-Schutz (strenger als autorPflicht).
import { Router } from 'express';
import { query } from '../db.js';
import { authPflicht, adminPflicht, resetTokenErzeugen } from '../auth.js';

export function buildNutzerAdminRoutes() {
  const router = Router();
  router.use(authPflicht, adminPflicht);

  // Liste aller Konten – nur zur Auswahl, wem ein Reset-Link erzeugt werden
  // soll. Bewusst ohne Passwort-Hash oder sonstige sensible Felder.
  router.get('/admin/users', async (req, res, next) => {
    try {
      const { rows } = await query(
        'SELECT id, email, fachrichtung, rolle, erstellt_am FROM users ORDER BY email',
      );
      res.json(rows);
    } catch (err) {
      next(err);
    }
  });

  // Erzeugt einen neuen Einmal-Reset-Token für den angegebenen Nutzer und
  // gibt ihn im Klartext EINMALIG zurück (danach nur noch als Hash in der
  // DB) – der Admin kopiert Link/Token direkt aus der Antwort und schickt
  // ihn der Person außerhalb der App.
  router.post('/admin/users/:id/passwort-reset', async (req, res, next) => {
    try {
      const { rows } = await query('SELECT id, email FROM users WHERE id = $1', [req.params.id]);
      const nutzer = rows[0];
      if (!nutzer) {
        res.status(404).json({ error: 'Nutzer nicht gefunden' });
        return;
      }

      const { klartext, hash, laeuftAbAm } = resetTokenErzeugen();
      await query(
        `INSERT INTO passwort_reset_tokens (user_id, token_hash, erstellt_von, laeuft_ab_am)
         VALUES ($1, $2, $3, $4)`,
        [nutzer.id, hash, req.userId, laeuftAbAm],
      );

      res.json({ token: klartext, email: nutzer.email, laeuftAbAm });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
