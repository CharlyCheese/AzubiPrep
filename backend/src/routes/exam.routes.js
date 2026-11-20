// Prüfungs-Routen – siehe docs/09-API-Referenz.md.
import { Router } from 'express';
import { generierePruefung, auswertePruefung } from '../exam.js';
import { config } from '../config.js';
import { publicExamOperations } from '../public-learning.js';
import { mountLearningOperations } from './learning-operations.js';

export function buildExamRoutes(store) {
  const router = Router();
  mountLearningOperations(router, publicExamOperations(store));

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
