import { Router } from 'express';
import { loadJourney } from '../journey.js';

export function loadAvailableJourney(contentDir) {
  try {
    return loadJourney(contentDir);
  } catch {
    // Ein fehlender Pilot darf das bisherige Modullernen nicht verhindern.
    return null;
  }
}

export function buildJourneyRoutes(contentDir, journey = loadAvailableJourney(contentDir)) {
  const router = Router();
  router.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    if (!journey) {
      res.status(503).json({ error: 'Die Lernreise-Inhalte sind gerade nicht verfügbar.' });
      return;
    }
    next();
  });
  const respond = (operation) => (req, res) => {
    try {
      res.json(operation(req));
    } catch (error) {
      res.status(error.status || 500).json({ error: error.status ? error.message : 'Die Lernreise konnte nicht geladen werden.' });
    }
  };
  router.get('/fiae', respond(() => journey.getSummary()));
  router.get('/fiae/progress-catalog', respond(() => journey.getProgressCatalog()));
  router.get('/fiae/topics/:topicId', respond((req) => journey.getTopic(req.params.topicId)));
  router.post('/fiae/topics/:topicId/check', respond((req) => journey.check(req.params.topicId, req.body)));
  router.post('/fiae/topics/:topicId/evaluate', respond((req) => journey.evaluate(req.params.topicId, req.body)));
  return router;
}
