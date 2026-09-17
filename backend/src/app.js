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
import { buildContentAdminRoutes } from './routes/content-admin.routes.js';
import { buildMeldenRoutes } from './routes/melden.routes.js';
import { buildPushRoutes } from './routes/push.routes.js';
import { buildBenachrichtigungenRoutes } from './routes/benachrichtigungen.routes.js';
import { buildNutzerAdminRoutes } from './routes/nutzer-admin.routes.js';
import { isDbAktiviert } from './db.js';
import { isPushAktiviert } from './push.js';

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
    res.json({ syncAktiviert: isDbAktiviert(), pushAktiviert: isDbAktiviert() && isPushAktiviert() });
  });

  app.use('/api', buildContentRoutes(store));
  app.use('/api', buildExamRoutes(store));

  // Login/Sync nur aktiv, wenn DATABASE_URL gesetzt ist – ohne DB bleibt die
  // App im bisherigen reinen Offline-/localStorage-Modus.
  if (isDbAktiviert()) {
    app.use('/api', buildAuthRoutes());
    app.use('/api', buildSyncRoutes());
    // CONTENT-001: Autoren-Endpunkte greifen direkt auf die questions-
    // Tabelle zu, brauchen also zwingend eine DB (macht ohne DB ohnehin
    // keinen Sinn, da dann per Definition der CSV-Fallback aktiv ist).
    app.use('/api', buildContentAdminRoutes());
    // BE-003: Feedback-Kanal ("Frage melden") – ebenfalls DB-gebunden,
    // da review_status nur in der Content-DB existiert.
    app.use('/api', buildMeldenRoutes());
    // BE-001: Push-Benachrichtigungen – zusätzlich zur DB auch an
    // gesetzte VAPID-Schlüssel gekoppelt (siehe push.js), die Route baut
    // sich aber unabhängig davon auf (GET /push/public-key liefert dann
    // einfach einen leeren Key, das Frontend blendet den Button aus).
    app.use('/api', buildPushRoutes());
    // BE-005: Benachrichtigungs-Historie – unabhängig von Push, nur DB
    // vorausgesetzt (die Liste soll auch ohne aktivierten Push nutzbar
    // sein, siehe push.js#benachrichtigeNutzer).
    app.use('/api', buildBenachrichtigungenRoutes());
    // BE-007: admin-gestützter Passwort-Reset (kein E-Mail-Versand im
    // Projekt vorhanden, siehe Brief) – ebenfalls DB-gebunden.
    app.use('/api', buildNutzerAdminRoutes());
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
