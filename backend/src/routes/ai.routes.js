import { Router } from 'express';
import { config } from '../config.js';
import { rateLimiter } from '../sicherheit.js';
import { AiError, createAiService } from '../ai.js';
import { createRagService } from '../rag.js';
import { buildRagRoutes } from './rag.routes.js';

const localHosts = ['127.0.0.1', 'localhost', '[::1]'];
export function aiAccess(req, res, next) {
  res.set('Cache-Control', 'no-store');
  let allowed = false;
  try {
    const host = new URL(`http://${req.get('host')}`);
    const local = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress);
    const origin = req.get('origin');
    const dev = new URL(config.aiDevOrigin);
    const devAllowed = dev.protocol === 'http:' && localHosts.includes(dev.hostname) && origin === dev.origin;
    const sameOrigin = !origin || origin === host.origin;
    allowed = local && localHosts.includes(host.hostname) && !host.username && !host.password && host.pathname === '/' && !host.search && !host.hash && req.get('x-azubiprep-ai') === '1' && req.get('sec-fetch-site') !== 'cross-site' && (sameOrigin || devAllowed);
  } catch { /* Ungültige Host-/Originangaben bleiben gesperrt. */ }
  if (!allowed) { res.status(403).json({ error: 'Die Lernbegleitung ist ausschließlich für die lokale Anwendung verfügbar.', code: 'local_only' }); return; }
  next();
}
export function buildAiRoutes(store, service, rag = createRagService()) {
  service ||= createAiService(config, rag);
  const router = Router();
  router.use(aiAccess);
  router.use('/material', buildRagRoutes(rag, service));
  router.use('/chatgpt', rateLimiter({ maxProMinute: 90, keyPrefix: 'chatgpt:' }));
  const handle = (run) => async (req, res) => {
    const controller = new globalThis.AbortController();
    const abort = () => { if (!res.writableEnded) controller.abort(); };
    req.once('aborted', abort); res.once('close', abort);
    try { const value = await run(req, controller.signal); if (!res.destroyed) res.json(value); }
    catch (error) {
      if (!res.destroyed) res.status(error instanceof AiError ? error.status : 503).json({ error: error instanceof AiError ? error.message : 'Die lokale Lernbegleitung ist vorübergehend nicht verfügbar.', code: error instanceof AiError ? error.code : 'unavailable' });
    } finally { req.off('aborted', abort); res.off('close', abort); }
  };
  router.get('/chatgpt/status', handle(() => service.chatgpt.status()));
  router.post('/chatgpt/signin', handle(req => { service.cancel(); return service.chatgpt.start(req.body?.accountId); }));
  router.post('/chatgpt/cancel', handle(() => { service.cancel(); return service.chatgpt.cancel(); }));
  router.post('/chatgpt/select', handle(req => { service.cancel(); return service.chatgpt.select(req.body?.accountId); }));
  router.post('/chatgpt/signout', handle(() => { service.cancel(); return service.chatgpt.signout(); }));
  router.use(rateLimiter({ maxProMinute: 20, keyPrefix: 'ai:' }));
  router.get('/status', handle((req, signal) => service.status(signal, req.query.provider || 'qwen')));
  router.post('/help', handle((req, signal) => service.help(req.body, store, signal)));
  return router;
}
