// CONTENT-001: geschützte Endpunkte für die Autoren-Weboberfläche.
// Nur Bearbeiten bestehender Fragen (Liste/Filter + Update), bewusst KEIN
// Anlegen (POST) und KEIN Hard-Delete – siehe
// docs/agent-briefs/CONTENT-001-autoren-weboberflaeche.md, Abschnitt
// "Entscheidungen". Nur aktiv, wenn eine Datenbank konfiguriert ist
// (gleiche Bedingung wie auth.routes.js/sync.routes.js).
import { Router } from 'express';
import { query } from '../db.js';
import { authPflicht, autorPflicht } from '../auth.js';

// Nur diese Felder dürfen über die UI geändert werden (Entscheidung
// "Editierbare Felder"). id/modul_id/typ/fachrichtung bleiben gesperrt.
const EDITIERBARE_FELDER = [
  'frage', 'option_a', 'option_b', 'option_c', 'option_d',
  'antwort', 'erklaerung', 'thema', 'schwierigkeit', 'quelle',
];
const GUELTIGE_SCHWIERIGKEIT = new Set(['leicht', 'mittel', 'schwer']);

function darfBearbeiten(req, frageRow) {
  if (req.userRolle === 'admin') return true;
  return frageRow.fachrichtung === req.userFachrichtung || frageRow.fachrichtung === 'ALLE';
}

export function buildContentAdminRoutes() {
  const router = Router();
  router.use(authPflicht, autorPflicht);

  // Liste/Filter – 'autor' sieht nur die eigene Fachrichtung (+ ALLE),
  // 'admin' sieht alles. Für die Filter-Dropdowns (Modul, Status) reichen
  // die bestehenden /api/module bzw. die vier festen review_status-Werte.
  router.get('/admin/questions', async (req, res, next) => {
    try {
      const { modul_id: modulId, review_status: reviewStatus } = req.query;
      const bedingungen = [];
      const werte = [];

      if (req.userRolle !== 'admin') {
        werte.push(req.userFachrichtung);
        bedingungen.push(`fachrichtung IN ($${werte.length}, 'ALLE')`);
      }
      if (modulId) {
        werte.push(String(modulId));
        bedingungen.push(`modul_id = $${werte.length}`);
      }
      if (reviewStatus) {
        werte.push(String(reviewStatus));
        bedingungen.push(`review_status = $${werte.length}`);
      }

      const where = bedingungen.length ? `WHERE ${bedingungen.join(' AND ')}` : '';
      const { rows } = await query(
        `SELECT id, fachrichtung, modul_id, thema, typ, frage,
                option_a, option_b, option_c, option_d,
                antwort, erklaerung, schwierigkeit, quelle,
                review_status, geprueft_am, geprueft_von, aktualisiert_am
         FROM questions
         ${where}
         ORDER BY modul_id, id`,
        werte,
      );
      res.json(rows);
    } catch (err) {
      next(err);
    }
  });

  // Bearbeiten: Inhaltsfelder und/oder Deaktivieren/Reaktivieren.
  // - Jede Änderung sichert zuerst die bisherige Zeile in
  //   questions_verlauf (Fallback/Historie, siehe Brief).
  // - Ändert sich ein Inhaltsfeld, springt review_status zwingend auf
  //   'ungeprueft' zurück (nie automatisch auf 'geprueft' – das setzt nur
  //   der echte Review, siehe ORCHESTRATOR.md Abschnitt 1).
  // - `deaktiviert: true/false` im Body steuert Deaktivieren/Reaktivieren
  //   (Ersatz für DELETE); Reaktivieren setzt ebenfalls auf 'ungeprueft'
  //   zurück, damit eine reaktivierte Frage erneut geprüft wird.
  router.put('/admin/questions/:id', async (req, res, next) => {
    try {
      const { rows: bestehend } = await query('SELECT * FROM questions WHERE id = $1', [req.params.id]);
      const aktuell = bestehend[0];
      if (!aktuell) {
        res.status(404).json({ error: 'Frage nicht gefunden' });
        return;
      }
      if (!darfBearbeiten(req, aktuell)) {
        res.status(403).json({ error: 'Keine Berechtigung für diese Fachrichtung' });
        return;
      }

      const body = req.body || {};
      if (body.schwierigkeit !== undefined && !GUELTIGE_SCHWIERIGKEIT.has(body.schwierigkeit)) {
        res.status(400).json({ error: 'Ungültige Schwierigkeit' });
        return;
      }

      const neu = { ...aktuell };
      let inhaltGeaendert = false;
      for (const feld of EDITIERBARE_FELDER) {
        if (body[feld] !== undefined && String(body[feld]) !== String(aktuell[feld])) {
          neu[feld] = String(body[feld]);
          inhaltGeaendert = true;
        }
      }

      let neuerStatus = aktuell.review_status;
      if (body.deaktiviert === true) {
        neuerStatus = 'deaktiviert';
      } else if (body.deaktiviert === false || inhaltGeaendert) {
        neuerStatus = 'ungeprueft';
      }

      const geaendertVon = req.userId != null ? String(req.userId) : 'unbekannt';

      // Vor jedem Update: bisherige Zeile sichern (Fallback/Historie).
      await query(
        `INSERT INTO questions_verlauf (
           frage_id, fachrichtung, modul_id, thema, typ, frage,
           option_a, option_b, option_c, option_d,
           antwort, erklaerung, schwierigkeit, quelle, review_status,
           geaendert_von
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
        [
          aktuell.id, aktuell.fachrichtung, aktuell.modul_id, aktuell.thema, aktuell.typ, aktuell.frage,
          aktuell.option_a, aktuell.option_b, aktuell.option_c, aktuell.option_d,
          aktuell.antwort, aktuell.erklaerung, aktuell.schwierigkeit, aktuell.quelle, aktuell.review_status,
          geaendertVon,
        ],
      );

      const { rows: aktualisiert } = await query(
        `UPDATE questions SET
           frage = $1, option_a = $2, option_b = $3, option_c = $4, option_d = $5,
           antwort = $6, erklaerung = $7, thema = $8, schwierigkeit = $9, quelle = $10,
           review_status = $11, aktualisiert_am = now()
         WHERE id = $12
         RETURNING id, fachrichtung, modul_id, thema, typ, frage,
                   option_a, option_b, option_c, option_d,
                   antwort, erklaerung, schwierigkeit, quelle,
                   review_status, geprueft_am, geprueft_von, aktualisiert_am`,
        [
          neu.frage, neu.option_a, neu.option_b, neu.option_c, neu.option_d,
          neu.antwort, neu.erklaerung, neu.thema, neu.schwierigkeit, neu.quelle,
          neuerStatus, aktuell.id,
        ],
      );

      res.json(aktualisiert[0]);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
