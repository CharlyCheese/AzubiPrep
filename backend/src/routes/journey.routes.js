import { Router } from 'express';
import { loadJourney } from '../journey.js';
import { publicJourneyOperations } from '../public-learning.js';
import { mountLearningOperations } from './learning-operations.js';

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
  mountLearningOperations(router, publicJourneyOperations(journey), 'Die Lernreise konnte nicht geladen werden.');
  return router;
}
