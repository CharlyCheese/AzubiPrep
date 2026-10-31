import { afterEach, describe, expect, it } from 'vitest';
import express from 'express';
import request from 'supertest';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createRagService } from '../src/rag.js';
import { buildAiRoutes } from '../src/routes/ai.routes.js';
import { syntheticPdf } from './fixtures/synthetic-pdf.js';

const roots = [];
afterEach(async () => { for (const root of roots.splice(0)) { expect(path.dirname(await fs.realpath(root))).toBe(await fs.realpath(os.tmpdir())); expect(path.basename(root)).toMatch(/^azubiprep-rag-api-/); await fs.rm(root, { recursive: true, force: true }); } });
async function fixture() {
  const root = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'azubiprep-rag-api-'))); roots.push(root);
  const rag = createRagService({ ragDir: path.join(root, 'private'), projectRoot: path.join(root, 'app'), ragTimeoutMs: 10000 });
  const app = express(); app.use(express.json()); app.use('/api/ai', buildAiRoutes({}, { forgetMaterial: async () => ({ cleared: true }) }, rag)); app.use((_req, res) => res.status(404).json({ error: 'Nicht gefunden' }));
  return { app, rag };
}
const headers = { Host: '127.0.0.1:3001', 'X-AzubiPrep-AI': '1' };
describe('Abgeschirmte lokale Material-API', () => {
  it('importiert, verarbeitet und entfernt ein synthetisches PDF ohne Dateinamen-/Inhaltsauslieferung', async () => {
    const { app, rag } = await fixture();
    const imported = await request(app).post('/api/ai/material/documents').set(headers).set('Content-Type', 'application/pdf').send(syntheticPdf()); expect(imported.status).toBe(200); expect(imported.body.label).toBe('Unterlage 1');
    expect((await request(app).post('/api/ai/material/prepare').set(headers).send({})).status).toBe(200);
    let status;
    for (let n = 0; n < 200; n++) { status = await rag.status(); if (status.state !== 'processing') break; await new Promise(resolve => setTimeout(resolve, 10)); }
    expect(status.state).toBe('ready');
    const response = await request(app).get('/api/ai/material/status').set(headers);
    expect(response.headers['cache-control']).toBe('no-store'); expect(response.body.documents[0]).not.toHaveProperty('source'); expect(JSON.stringify(response.body)).not.toContain('HTML beschreibt');
    expect((await request(app).get(`/api/ai/material/documents/${imported.body.id}`).set(headers)).status).toBe(404);
    const removed = await request(app).delete(`/api/ai/material/documents/${imported.body.id}`).set(headers).send({ model: 'qwen3:4b' }); expect(removed.body).toMatchObject({ removed: true, modelContextCleared: true });
    expect((await rag.status()).documents).toEqual([]);
  });
  it('verweigert fremde Herkünfte und unmarkierte Uploads, bevor private Daten verarbeitet werden', async () => {
    const { app, rag } = await fixture();
    const foreign = await request(app).post('/api/ai/material/documents').set({ ...headers, Origin: 'https://example.invalid' }).set('Content-Type', 'application/pdf').send(syntheticPdf()); expect(foreign.status).toBe(403);
    const missing = await request(app).get('/api/ai/material/status'); expect(missing.status).toBe(403);
    expect((await rag.status()).documents).toHaveLength(0);
  });
  it('weist falsche Dateitypen, PDF-Signaturen und Pfadargumente zurück', async () => {
    const { app } = await fixture();
    expect((await request(app).post('/api/ai/material/documents').set(headers).send({ path: '../secret.pdf' })).status).toBe(415);
    expect((await request(app).post('/api/ai/material/documents').set(headers).set('Content-Type', 'application/pdf').send(Buffer.from('NOT A PDF'))).status).toBe(400);
    expect((await request(app).delete('/api/ai/material/documents/invalid').set(headers).send({})).status).toBe(400);
  });
});
