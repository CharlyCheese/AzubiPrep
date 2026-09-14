// Prüfungs-Routen – siehe docs/09-API-Referenz.md.
import { Router } from 'express';
import { generierePruefung, auswertePruefung } from '../exam.js';
import { config } from '../config.js';

export function buildExamRoutes(store) {
  const router = Router();

  router.post('/pruefung/generieren', (req, res, next) => {
    try {
      const { fachrichtung, anzahl, gewichtung, schwierigkeit } = req.body || {};
      const ergebnis = generierePruefung(store.get(), {
        fachrichtung,
        anzahl: Number(anzahl),
        gewichtung: gewichtung && typeof gewichtung === 'object' ? gewichtung : {},
        schwierigkeit,
      });
      res.json(ergebnis);
    } catch (err) {
      next(err);
    }
  });

  router.post('/pruefung/auswerten', (req, res, next) => {
    try {
      const { fragen } = req.body || {};
      const ergebnis = auswertePruefung(store.get(), { fragen });
      res.json(ergebnis);
    } catch (err) {
      next(err);
    }
  });

  if (config.demoEndpoints) {
    router.get('/pruefung/ergebnisbeispiel', (req, res) => {
      const c = store.get();
      const demo = generierePruefung(c, { fachrichtung: [...c.fachrichtungenByCode.keys()][0], anzahl: 10 });
      const auswertung = auswertePruefung(c, {
        fragen: demo.fragen.map((f) => ({ id: f.id, antwort: c.questionsById.get(f.id).antwort })),
      });
      res.json(auswertung);
    });
  }

  return router;
}
