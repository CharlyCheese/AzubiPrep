// Lokale Content-API mit geschütztem Neuladen des Katalogs.
import { Router } from 'express';
import { loadContent } from '../content.js';
import { adminSchutz, rateLimiter } from '../sicherheit.js';
import { config } from '../config.js';
import { publicContentOperations } from '../public-learning.js';
import { loadJourneyPracticeSearchMetadata, loadWorkshopSearchMetadata } from '../workshop-search-metadata.js';
import { mountLearningOperations } from './learning-operations.js';

export function buildContentRoutes(store, journey = null) {
  const router = Router();
  const loadCatalogs = () => Promise.all([
    loadWorkshopSearchMetadata(config.frontendDist), loadJourneyPracticeSearchMetadata(config.frontendDist),
  ]);
  mountLearningOperations(router, publicContentOperations(store, journey, loadCatalogs));

  // Fehlerbehandlung bewusst wie in exam.routes.js: try/catch + next(err),
  // zentraler fehlerHandler loggt und antwortet einheitlich (OPS-005).
  router.post('/admin/reload', adminSchutz, rateLimiter({ maxProMinute: config.rateLimitAdminMax, keyPrefix: 'admin:' }), async (req, res, next) => {
    try {
      const neuerInhalt = await loadContent(config.contentDir);
      store.set(neuerInhalt);
      res.json({
        status: 'ok',
        geladenAm: neuerInhalt.geladenAm,
        quelle: neuerInhalt.quelle,
        fragenAnzahl: neuerInhalt.gesamtFragen,
        warnungen: neuerInhalt.warnungen,
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
