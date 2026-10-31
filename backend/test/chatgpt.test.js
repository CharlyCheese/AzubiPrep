import { afterEach, describe, expect, it, vi } from 'vitest';
import https from 'node:https';
import { EventEmitter } from 'node:events';
import { CLOUD_LIMITS, createChatgptService, openaiRequest } from '../src/chatgpt.js';
afterEach(() => vi.restoreAllMocks());
function transport(events, status = 200) {
  const seen = [];
  vi.spyOn(https, 'request').mockImplementation((url, options, callback) => {
    const req = new EventEmitter(); req.destroy = vi.fn(); req.end = body => { seen.push({ url: String(url), options, body }); queueMicrotask(() => { const res = new EventEmitter(); res.statusCode = status; res.setEncoding = () => {}; res.resume = () => {}; callback(res); queueMicrotask(() => { for (const event of events) res.emit('data', event); res.emit('end'); }); }); }; return req;
  }); return seen;
}
const delta = text => `data: ${JSON.stringify({ type: 'response.output_text.delta', delta: text })}\n\n`;
const terminal = `data: ${JSON.stringify({ type: 'response.completed', response: { status: 'completed', output: [{ type: 'message' }] } })}\n\n`;
describe('ChatGPT-Abo Modelltransport mit synthetischen Antworten', () => {
  it('akzeptiert ausschließlich freigegebene HTTPS-Hosts und folgt keinen Weiterleitungen', async () => {
    for (const url of ['http://api.openai.com/v1/responses', 'https://evil.example/v1', 'https://api.openai.com:444/v1', 'https://u:p@api.openai.com/v1']) expect(() => openaiRequest(url)).toThrow();
    transport([], 302); await expect(openaiRequest('https://api.openai.com/v1/models')).rejects.toMatchObject({ code: 'service' });
  });
  it('sammelt Text bis zum vollständigen Terminalereignis und bleibt begrenzt', async () => {
    transport([delta('{"answer":'), delta('"Hallo"}'), terminal]);
    expect(await openaiRequest('https://api.openai.com/v1/responses', { stream: true })).toBe('{"answer":"Hallo"}');
  });
  it.each(['null', '{"type":"response.completed","response":{"status":"completed","output":{}}}', '{"type":"response.output_text.delta","delta":{}}', '{"type":"response.failed","response":{"error":{"code":{"toString":1,"valueOf":1}}}}'])('weist ungültiges SSE ohne ungefangenen Fehler ab: %s', async data => {
    transport([`data: ${data}\n\n`]); await expect(openaiRequest('https://api.openai.com/v1/responses', { stream: true })).rejects.toMatchObject({ code: 'response' });
  });
  it('begrenzt Text und Gesamtantwort sowie unvollständige Ereignisse', async () => {
    transport([delta('x'.repeat(18001))]); await expect(openaiRequest('https://api.openai.com/v1/responses', { stream: true })).rejects.toMatchObject({ code: 'response_limit' });
    vi.restoreAllMocks(); transport(['x'.repeat(512001)]); await expect(openaiRequest('https://auth.openai.com/.well-known/openid-configuration')).rejects.toMatchObject({ code: 'response_limit' });
    vi.restoreAllMocks(); transport(['data: {"type":"response.incomplete"}\n\n']); await expect(openaiRequest('https://api.openai.com/v1/responses', { stream: true })).rejects.toMatchObject({ code: 'response' });
    vi.restoreAllMocks(); transport([delta('x'), terminal, delta('y')]); await expect(openaiRequest('https://api.openai.com/v1/responses', { stream: true })).rejects.toMatchObject({ code: 'response' });
  });
  it('erlaubt große Modellkataloge, behält jedoch eine eigene feste Grenze', async () => {
    const catalog = { models: [{ slug: 'synthetic-model', display_name: 'Synthetic', visibility: 'list', unusedMetadata: 'x'.repeat(800000) }] };
    transport([JSON.stringify(catalog)]);
    const result = await openaiRequest('https://api.openai.com/v1/models'); expect(result.models[0].slug).toBe('synthetic-model');
    vi.restoreAllMocks(); transport(['x'.repeat(CLOUD_LIMITS.catalogBytes + 1)]);
    await expect(openaiRequest('https://api.openai.com/v1/models')).rejects.toMatchObject({ code: 'response_limit' });
  });
  it.each([
    ['https://api.openai.com/v1/responses', { stream: true }],
    ['https://api.openai.com/v1/models?extra=1', {}],
    ['https://api.openai.com/v1/models?', {}],
    ['https://api.openai.com/v1/models', { body: { synthetic: true } }],
    ['https://api.openai.com/v1/models/other', {}],
  ])('weitet die Transportgrenze nicht auf %s aus', async (url, options) => {
    transport(['x'.repeat(CLOUD_LIMITS.responseBytes + 1)]); await expect(openaiRequest(url, options)).rejects.toMatchObject({ code: 'response_limit' });
  });
  it('gibt nur gültige sichtbare Namen weiter, keine großen Katalogmetadaten', async () => {
    const auth = { session: async () => ({ token: 'synthetic' }), assertSession: async () => {} };
    const models = [null, {}, { visibility: 'list' }, { visibility: 'hidden', slug: 'hidden' }, ...Array.from({ length: 40 }, (_, n) => ({ visibility: 'list', slug: `synthetic-${n}`, display_name: n ? 'x'.repeat(200) : { toString: 1 }, unusedMetadata: 'large synthetic metadata' }))];
    const service = createChatgptService({}, { auth, request: async () => ({ models }) }); const list = await service.models();
    expect(list).toHaveLength(30); expect(list[0]).toEqual({ name: 'synthetic-0', label: 'synthetic-0' }); expect(Object.keys(list[1]).sort()).toEqual(['label', 'name']); expect(list[1].label).toHaveLength(100);
    await expect(createChatgptService({}, { auth, request: async () => null }).models()).rejects.toMatchObject({ code: 'response' });
  });
  it('beendet bereits abgebrochene, laufend abgebrochene und zu langsame Verbindungen', async () => {
    const controller = new AbortController(); controller.abort(); transport([]);
    await expect(openaiRequest('https://api.openai.com/v1/responses', { stream: true, signal: controller.signal })).rejects.toMatchObject({ code: 'aborted' });
    vi.restoreAllMocks(); let emit;
    vi.spyOn(https, 'request').mockImplementation((_url, _options, callback) => { const req = new EventEmitter(); req.destroy = vi.fn(); req.end = () => { const res = new EventEmitter(); res.statusCode = 200; res.setEncoding = () => {}; emit = () => res.emit('data', delta('x')); callback(res); }; return req; });
    const active = new AbortController(); const pending = openaiRequest('https://api.openai.com/v1/responses', { stream: true, signal: active.signal }); emit(); active.abort(); await expect(pending).rejects.toMatchObject({ code: 'aborted' });
    await expect(openaiRequest('https://api.openai.com/v1/responses', { stream: true, timeoutMs: 5 })).rejects.toMatchObject({ code: 'timeout' });
  });
  it('weist Unterbrechung, Toolantwort und Kontingentfehler zurück', async () => {
    transport([delta('x')]); await expect(openaiRequest('https://api.openai.com/v1/responses', { stream: true })).rejects.toMatchObject({ code: 'response' });
    vi.restoreAllMocks(); transport([delta('x'), `data: {"type":"response.completed","response":{"status":"completed","output":[{"type":"function_call"}]}}\n\n`]); await expect(openaiRequest('https://api.openai.com/v1/responses', { stream: true })).rejects.toMatchObject({ code: 'response' });
    vi.restoreAllMocks(); transport([`data: {"type":"response.failed","response":{"error":{"code":"subscription_sharing_usage_limit_exceeded"}}}\n\n`]); await expect(openaiRequest('https://api.openai.com/v1/responses', { stream: true })).rejects.toMatchObject({ code: 'usage_limit' });
  });
  it('verwendet dasselbe Konto/Token für Modellliste und Responses, ohne unzulässige Parameter', async () => {
    const session = { token: 'synthetic-a', accountId: 'a', epoch: 'epoch' }; const calls = [];
    const auth = { session: vi.fn(async () => session), assertSession: vi.fn(async () => {}), revision: () => 1 };
    const request = async (url, options) => { calls.push({ url, ...options }); return url.endsWith('/models') ? { models: [{ visibility: 'list', slug: 'synthetic-model', display_name: 'Synthetic' }] } : '{"answer":"Test"}'; };
    const service = createChatgptService({ aiTimeoutMs: 1000 }, { auth, request });
    await service.generate({ model: 'synthetic-model', messages: [{ content: 'Lernregeln' }, { content: '{"question":"Test"}' }], schema: { type: 'object' } });
    expect(auth.session).toHaveBeenCalledTimes(1); expect(calls.map(c => c.token)).toEqual(['synthetic-a', 'synthetic-a']);
    expect(calls[1].body.store).toBe(false); expect(calls[1].body.stream).toBe(true); expect(calls[1].body.tools).toBeUndefined(); expect(calls[1].body.max_output_tokens).toBeUndefined(); expect(calls[1].body.temperature).toBeUndefined();
  });
  it('sendet nach Kontowechsel keine Responses-Anfrage', async () => {
    let revision = 1; const calls = [];
    const auth = { session: async () => ({ token: 'synthetic-a' }), assertSession: async () => {}, revision: () => revision };
    const request = async url => { calls.push(url); revision++; return { models: [{ visibility: 'list', slug: 'synthetic-model' }] }; };
    await expect(createChatgptService({}, { auth, request }).generate({ model: 'synthetic-model', messages: [] })).rejects.toMatchObject({ code: 'changed' }); expect(calls).toHaveLength(1);
  });
});
