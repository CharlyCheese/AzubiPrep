import { Router } from 'express';
import { RagError, RAG_LIMITS } from '../rag-index.js';
import { rateLimiter } from '../sicherheit.js';

// Wird ausschließlich hinter aiAccess eingebunden. Keine PDF-/Index-Auslieferung.
export function buildRagRoutes(rag, ai) {
  const router = Router(); router.use(rateLimiter({ maxProMinute: 90, keyPrefix: 'rag:' }));
  const handle = run => async (req, res) => {
    try { const value = await run(req); if (!res.destroyed) res.json(value); }
    catch (error) { if (!res.destroyed) res.status(error instanceof RagError ? error.status : 503).json({ code: error instanceof RagError ? error.code : 'material', error: error instanceof RagError ? error.message : 'Die lokale Materialverwaltung ist vorübergehend nicht verfügbar.' }); }
  };
  router.get('/status', handle(() => rag.status()));
  router.post('/documents', handle(async req => {
    if (!req.is('application/pdf')) throw new RagError('type', 'Bitte eine PDF-Datei auswählen.', 415);
    const size = Number(req.get('content-length'));
    if (Number.isFinite(size) && size > RAG_LIMITS.pdfBytes) throw new RagError('file_limit', 'Eine PDF darf höchstens 128 MiB groß sein.', 413);
    return rag.importPdf(req);
  }));
  router.post('/prepare', handle(() => rag.prepare()));
  router.post('/cancel', handle(() => rag.cancel()));
  router.delete('/documents/:id', handle(async req => {
    const result = await rag.remove(req.params.id);
    const cache = await ai.forgetMaterial(req.body?.model);
    return { ...result, modelContextCleared: cache.cleared };
  }));
  return router;
}
