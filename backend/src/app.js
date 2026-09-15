// Express-App, Routen, statische Auslieferung des Frontend-Builds.
import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { config } from './config.js';
import { securityHeaders, rateLimiter, fehlerHandler } from './sicherheit.js';
import { buildContentRoutes } from './routes/content.routes.js';
import { buildExamRoutes } from './routes/exam.routes.js';
import { buildAuthRoutes } from './routes/auth.routes.js';
import { buildSyncRoutes } from './routes/sync.routes.js';
import { isDbAktiviert } from './db.js';

export function createApp(store) {
  const app = express();

  app.disable('x-powered-by'); // zusätzlich zu helmet (F12)
  app.set('trust proxy', false);

  app.use(securityHeaders());
  app.use(express.json({ limit: '256kb' }));

  app.use('/api', rateLimiter({ maxProMinute: config.rateLimitMax }));

  // Immer verfügbar (auch ohne DB): sagt dem Frontend, ob Login/Sync
  // überhaupt angeboten werden soll, damit die Konto-Sektion im Offline-
  // Modus gar nicht erst angezeigt wird.
  app.get('/api/status', (req, res) => {
    res.json({ syncAktiviert: isDbAktiviert() });
  });

  app.use('/api', buildContentRoutes(store));
  app.use('/api', buildExamRoutes(store));

  // Login/Sync nur aktiv, wenn DATABASE_URL gesetzt ist – ohne DB bleibt die
  // App im bisherigen reinen Offline-/localStorage-Modus.
  if (isDbAktiviert()) {
    app.use('/api', buildAuthRoutes());
    app.use('/api', buildSyncRoutes());
  }

  app.use('/api', (req, res) => {
    res.status(404).json({ error: 'Ressource nicht gefunden' });
  });

  // Statische Auslieferung des Produktions-Builds (gleiche Origin, kein CORS nötig).
  if (fs.existsSync(config.frontendDist)) {
    app.use(express.static(config.frontendDist));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) { next(); return; }
      res.sendFile(path.join(config.frontendDist, 'index.html'));
    });
  }

  app.use(fehlerHandler);

  return app;
}
