import { describe, expect, it, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
vi.mock('../src/config.js', () => ({ config: { aiDevOrigin: 'http://localhost:5173' } }));
import { buildAiRoutes } from '../src/routes/ai.routes.js';

const headers = { Host: '127.0.0.1:3001', 'X-AzubiPrep-AI': '1' };
function fixture() {
  const journey = { start: vi.fn(async body => ({ sessionId: 'synthetic', privacy: 'public', opening: body.targetId })), turn: vi.fn(async body => ({ sessionId: body.sessionId, text: 'Hinweis' })), end: vi.fn(async () => ({ ended: true })) };
  const service = { journey, chatgpt: { select: vi.fn(async () => ({})), signout: vi.fn(async () => ({})) }, cancel: vi.fn() };
  const app = express(); app.use(express.json()); app.use('/api/ai', buildAiRoutes({}, service, {}));
  return { app, service, journey };
}
describe('Lokale Lernreise-KI-Endpunkte', () => {
  it('schützt alle Sitzungsaktionen vor fremder Herkunft und unmarkierten Aufrufen', async () => {
    const { app, journey } = fixture();
    for (const endpoint of ['start', 'turn', 'end']) {
      for (const extra of [{ Origin: 'https://example.invalid' }, { Host: 'evil.invalid' }, { 'X-AzubiPrep-AI': '' }, { 'Sec-Fetch-Site': 'cross-site' }]) {
        expect((await request(app).post(`/api/ai/journey/${endpoint}`).set({ ...headers, ...extra }).send({})).status).toBe(403);
      }
      expect(journey[endpoint]).not.toHaveBeenCalled();
    }
  });
  it('liefert no-store und übergibt ein Abbruchsignal an Turns', async () => {
    const { app, journey } = fixture();
    for (const endpoint of ['start', 'turn', 'end']) {
      const response = await request(app).post(`/api/ai/journey/${endpoint}`).set(headers).send({ sessionId: 'synthetic', targetId: 'question-1' });
      expect(response.status).toBe(200); expect(response.headers['cache-control']).toBe('no-store');
    }
    expect(journey.turn.mock.calls[0][1]).toBeInstanceOf(AbortSignal);
  });
  it('zeigt keine internen privaten Fehler und beendet Sitzungen bei Kontoaktionen', async () => {
    const { app, service, journey } = fixture(); journey.turn.mockRejectedValue(new Error('PRIVATE_TITLE_SENTINEL'));
    const response = await request(app).post('/api/ai/journey/turn').set(headers).send({});
    expect(response.status).toBe(503); expect(JSON.stringify(response.body)).not.toContain('PRIVATE_TITLE_SENTINEL');
    await request(app).post('/api/ai/chatgpt/select').set(headers).send({ accountId: 'synthetic' });
    await request(app).post('/api/ai/chatgpt/signout').set(headers).send({});
    expect(service.cancel).toHaveBeenCalledTimes(2);
  });
  it('begrenzt Sitzungsaktionen mit dem bestehenden KI-Anfragelimit', async () => {
    const { app } = fixture();
    for (let count = 0; count < 20; count++) expect((await request(app).post('/api/ai/journey/start').set(headers).send({})).status).toBe(200);
    expect((await request(app).post('/api/ai/journey/start').set(headers).send({})).status).toBe(429);
  });
});
