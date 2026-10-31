import { expect, it } from 'vitest';
import express from 'express';
import request from 'supertest';
import { buildContentRoutes } from '../src/routes/content.routes.js';

it('liefert einen begrenzten öffentlichen Theoriekatalog ohne private Wissensablage', async () => {
  const content = { modulesById: new Map([['TEST', { modul_id: 'TEST', fachrichtung: 'ALLE', lernfeld: 'LF2', titel: 'Synthetischer Lernbereich' }]]), questionsById: new Map(), theorieByModul: new Map() };
  const app = express(); app.use('/api', buildContentRoutes({ get: () => content }));
  const response = await request(app).get('/api/theorie?module=TEST');
  expect(response.status).toBe(200); expect(response.body.topics).toHaveLength(1); expect(response.body.topics[0].id).toBe('module:TEST'); expect(response.body.pageSize).toBe(24); expect(response.body).not.toHaveProperty('location');
  expect((await request(app).get('/api/theorie?module=MISSING')).body.total).toBe(0);
});
