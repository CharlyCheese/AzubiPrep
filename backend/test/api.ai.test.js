import { describe, expect, it, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import { aiAccess, buildAiRoutes } from '../src/routes/ai.routes.js';

const headers = { Host: '127.0.0.1:3001', 'X-AzubiPrep-AI': '1' };
function fixture() {
  const service = { status: vi.fn(async () => ({ state: 'ready', models: [], localOnly: true })), help: vi.fn(async body => ({ text: 'Ein Hinweis', stand: body.context.stand })) };
  const app = express(); app.use(express.json()); app.use('/api/ai', buildAiRoutes({}, service)); return { app, service };
}
describe('Lokale KI-API', () => {
  it('erlaubt lokale same-origin Anfragen und verhindert Zwischenspeicherung', async () => {
    const { app } = fixture();
    const status = await request(app).get('/api/ai/status').set(headers).set('Origin', 'http://127.0.0.1:3001');
    expect(status.status).toBe(200); expect(status.headers['cache-control']).toBe('no-store'); expect(status.headers['access-control-allow-origin']).toBeUndefined();
    const result = await request(app).post('/api/ai/help').set(headers).send({ context: { stand: 's1' } });
    expect(result.body.stand).toBe('s1');
  });
  it('weist Fremdherkunft, Rebinding-Hosts, cross-site und unmarkierte Anfragen vor Modellzugriff zurück', async () => {
    const { app, service } = fixture();
    for (const extra of [{ Origin: 'https://example.invalid' }, { Origin: 'null' }, { Host: 'evil.invalid' }, { 'Sec-Fetch-Site': 'cross-site' }, { 'X-AzubiPrep-AI': '' }]) {
      const result = await request(app).post('/api/ai/help').set({ ...headers, ...extra }).send({});
      expect(result.status).toBe(403);
    }
    expect(service.help).not.toHaveBeenCalled();
  });
  it('vertraut keinem übermittelten Client-IP-Header', () => {
    const next = vi.fn(); const res = { set: vi.fn(), status: vi.fn().mockReturnThis(), json: vi.fn() };
    aiAccess({ socket: { remoteAddress: '192.168.1.50' }, get: name => ({ host: '127.0.0.1:3001', 'x-azubiprep-ai': '1', 'x-forwarded-for': '127.0.0.1' })[name] }, res, next);
    expect(next).not.toHaveBeenCalled(); expect(res.status).toHaveBeenCalledWith(403);
  });
  it('begrenzt Anfragen und gibt interne Fehler ohne Details aus', async () => {
    const { app, service } = fixture(); service.help.mockRejectedValue(new Error('PRIVATE_SENTINEL'));
    const failure = await request(app).post('/api/ai/help').set(headers).send({}); expect(failure.status).toBe(503); expect(JSON.stringify(failure.body)).not.toContain('PRIVATE_SENTINEL');
    for (let n = 0; n < 19; n++) await request(app).get('/api/ai/status').set(headers);
    const limited = await request(app).get('/api/ai/status').set(headers); expect(limited.status).toBe(429);
  });
});
