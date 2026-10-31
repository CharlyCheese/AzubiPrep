import { describe, expect, it } from 'vitest';
import express from 'express';
import request from 'supertest';
import { buildAiRoutes } from '../src/routes/ai.routes.js';
describe('KI-Anbieter API-Zugriff', () => {
  it('schützt auch Anmeldung und Kontostatus vor fremden Origins und fehlendem Marker', async () => {
    const called = []; const service = { chatgpt: { status: async () => { called.push('status'); return { connected: false }; }, start: async () => { called.push('signin'); return { authorizeUrl: 'synthetic' }; } }, cancel() {} };
    const app = express(); app.use(express.json()); app.use('/api/ai', buildAiRoutes({}, service, {}));
    expect((await request(app).get('/api/ai/chatgpt/status').set('Host', '127.0.0.1')).status).toBe(403);
    expect((await request(app).post('/api/ai/chatgpt/signin').set('Host', '127.0.0.1').set('X-AzubiPrep-AI', '1').set('Origin', 'https://evil.example').send({})).status).toBe(403);
    expect(called).toEqual([]);
    const response = await request(app).get('/api/ai/chatgpt/status').set('Host', '127.0.0.1').set('X-AzubiPrep-AI', '1'); expect(response.status).toBe(200); expect(response.headers['cache-control']).toBe('no-store'); expect(called).toEqual(['status']);
  });
});
