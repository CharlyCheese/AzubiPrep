import fs from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { config } from './config.js';
import { createRagStorage } from './rag-storage.js';
import { extractPdf } from './rag-extract.js';
import { buildIndex, searchIndex, RAG_LIMITS, RagError } from './rag-index.js';

const idValid = id => typeof id === 'string' && /^[a-f0-9-]{36}$/.test(id);
const publicError = error => error instanceof RagError ? error.message : 'Die lokale Materialverarbeitung ist fehlgeschlagen. Vorhandene bestätigte Daten bleiben geschützt.';
export function createRagService(settings = config, extractor = extractPdf) {
  let storage; let job = null;
  const disk = () => (storage ||= createRagStorage(settings));
  async function current(document) {
    try { const { stat } = await disk().regular('material', document.source); return document.fingerprint && stat.size === document.fingerprint.size && stat.mtimeMs === document.fingerprint.mtimeMs; }
    catch { return false; }
  }
  async function cleanup(id, areas = ['index', 'staging'], keep = null) {
    for (const area of areas) {
      for (const name of await fs.readdir(disk().directory(area))) if (name.startsWith(`${id}.`) && name !== keep) await disk().unlink(area, name);
    }
  }
  async function status() {
    try {
      const catalog = await disk().catalog(); const sources = await disk().sources();
      const known = new Set([...catalog.documents.map(document => document.source), ...catalog.ignored]);
      const documents = [];
      for (const document of catalog.documents) {
        const state = document.status === 'ready' && !(await current(document)) ? 'stale' : document.status;
        documents.push({ id: document.id, label: document.label, state, pages: document.pages || 0, emptyPages: document.emptyPages || 0, failedPages: document.failedPages || 0, error: document.error || '' });
      }
      const pending = sources.filter(source => !known.has(source)).length;
      return { state: job ? 'processing' : documents.some(document => document.state === 'ready') ? 'ready' : documents.some(document => document.state === 'stale') ? 'stale' : documents.some(document => document.state === 'error') ? 'error' : documents.length || pending ? 'unprepared' : 'empty', documents, pending, revision: catalog.revision, location: disk().directory('material'), progress: job ? { page: job.page, total: job.total, label: job.label } : null, localOnly: true, method: 'bm25-1' };
    } catch (error) { return { state: 'error', documents: [], pending: 0, revision: 'error', error: publicError(error), localOnly: true }; }
  }
  async function importPdf(stream) {
    const release = await disk().lock(); const id = randomUUID(); const name = `${id}.pdf`; let output;
    try {
      const catalog = await disk().catalog(); if (catalog.documents.length >= RAG_LIMITS.documents) throw new RagError('documents', 'Bitte höchstens acht lokale Unterlagen verwenden.');
      let existing = 0; for (const source of await disk().sources()) existing += (await disk().regular('material', source)).stat.size;
      output = await fs.open(disk().location('material', name), 'wx', 0o600);
      let size = 0; let signature = Buffer.alloc(0);
      for await (const bytes of stream) {
        size += bytes.length;
        if (size > RAG_LIMITS.pdfBytes || existing + size > RAG_LIMITS.totalPdfBytes) throw new RagError('file_limit', 'Die PDF oder der gesamte lokale Materialbestand ist zu groß.', 413);
        if (signature.length < 5) signature = Buffer.concat([signature, bytes.subarray(0, 5 - signature.length)]);
        await output.writeFile(bytes);
      }
      await output.close(); output = null;
      if (signature.toString('ascii') !== '%PDF-') throw new RagError('pdf', 'Bitte eine tatsächliche PDF-Datei auswählen.');
      const document = { id, source: name, owned: true, label: `Unterlage ${catalog.nextLabel || 1}`, status: 'unprepared' };
      await disk().saveCatalog({ ...catalog, nextLabel: (catalog.nextLabel || 1) + 1, documents: [...catalog.documents, document] });
      return { id, label: document.label };
    } catch (error) { if (output) await output.close(); await disk().unlink('material', name); throw error; }
    finally { await release(); }
  }
  async function prepare() {
    if (job) throw new RagError('busy', 'Eine Aufbereitung läuft bereits.', 409);
    const release = await disk().lock(); let catalog;
    try {
      catalog = await disk().catalog(); const known = new Set([...catalog.documents.map(document => document.source), ...catalog.ignored]);
      const discovered = (await disk().sources()).filter(source => !known.has(source));
      if (discovered.length + catalog.documents.length > RAG_LIMITS.documents) throw new RagError('documents', 'Bitte höchstens acht PDFs im lokalen Materialordner ablegen.');
      for (const source of discovered) catalog.documents.push({ id: randomUUID(), source, owned: false, label: `Unterlage ${catalog.nextLabel || 1}`, status: 'unprepared' }), catalog.nextLabel = (catalog.nextLabel || 1) + 1;
      if (!catalog.documents.length) throw new RagError('empty', 'Bitte zuerst eigene lokale PDF-Unterlagen hinzufügen.');
      let size = 0; for (const document of catalog.documents) size += (await disk().regular('material', document.source)).stat.size;
      if (size > RAG_LIMITS.totalPdfBytes) throw new RagError('file_limit', 'Der lokale PDF-Bestand überschreitet 512 MiB.');
      catalog = await disk().saveCatalog(catalog);
    } catch (error) { await release(); throw error; }
    const controller = new globalThis.AbortController();
    const running = { controller, page: 0, total: 0, label: '', done: null }; job = running;
    running.done = (async () => {
      try {
        for (const document of catalog.documents) {
          if (controller.signal.aborted) break;
          running.label = document.label; running.page = 0; running.total = 0;
          const input = `${document.id}.pdf`; const output = `${document.id}.pages.json`; let nextIndex = null; let committed = null;
          try {
            await cleanup(document.id, ['staging']);
            const fingerprint = await disk().fingerprint(document.source, input, controller.signal);
            await extractor(disk().location('staging', input), disk().location('staging', output), { signal: controller.signal, timeoutMs: settings.ragTimeoutMs, onProgress: (page, total) => { running.page = page; running.total = total; } });
            const extracted = await disk().json('staging', output);
            if (extracted.schema !== 1 || !Array.isArray(extracted.pages)) throw new RagError('extractor', 'Der lokale PDF-Seitentext ist nicht lesbar.');
            const index = buildIndex(extracted.pages);
            const after = await disk().fingerprint(document.source, null, controller.signal);
            if (after.hash !== fingerprint.hash || after.mtimeMs !== fingerprint.mtimeMs) throw new RagError('changed', 'Die PDF wurde während der Aufbereitung verändert. Bitte neu einlesen.', 409);
            if (controller.signal.aborted) throw new RagError('aborted', 'Aufbereitung abgebrochen.', 409);
            nextIndex = `${document.id}.${randomUUID()}.json`;
            await disk().writeJson('index', nextIndex, { ...index, fingerprint: fingerprint.hash });
            const replacement = { ...document, fingerprint, index: nextIndex, status: 'ready', pages: index.pages, emptyPages: index.emptyPages, failedPages: extracted.failedPages || 0, error: '' };
            catalog = await disk().saveCatalog({ ...catalog, documents: catalog.documents.map(item => item.id === document.id ? replacement : item) });
            committed = replacement;
            nextIndex = null;
            await cleanup(document.id, ['index'], replacement.index);
          } catch (error) {
            if (nextIndex) await disk().unlink('index', nextIndex);
            const previousStillValid = committed || (document.index && await current(document));
            const replacement = { ...(committed || document), status: previousStillValid ? 'ready' : 'error', error: publicError(error) };
            catalog = await disk().saveCatalog({ ...catalog, documents: catalog.documents.map(item => item.id === document.id ? replacement : item) });
          } finally { await disk().unlink('staging', input); await disk().unlink('staging', output); }
        }
      } finally { await release(); if (job === running) job = null; }
    })().catch(() => { /* Keine privaten Parser-/Pfaddetails loggen. */ });
    return { accepted: true };
  }
  async function cancel() { if (job) { job.controller.abort(); await job.done; } return { canceled: true }; }
  async function remove(id) {
    if (!idValid(id)) throw new RagError('id', 'Ungültige Materialkennung.');
    if (job) throw new RagError('busy', 'Bitte zuerst die laufende Aufbereitung abbrechen.', 409);
    const release = await disk().lock();
    try {
      let catalog = await disk().catalog(); const document = catalog.documents.find(item => item.id === id);
      if (!document) throw new RagError('missing', 'Diese lokale Unterlage ist nicht mehr vorhanden.', 404);
      catalog = await disk().saveCatalog({ ...catalog, documents: catalog.documents.map(item => item.id === id ? { ...item, status: 'removing' } : item) });
      await cleanup(id);
      if (document.owned) await disk().unlink('material', document.source);
      await disk().saveCatalog({ ...catalog, documents: catalog.documents.filter(item => item.id !== id), ignored: document.owned ? catalog.ignored : [...new Set([...catalog.ignored, document.source])] });
      return { removed: true, originalKept: !document.owned };
    } finally { await release(); }
  }
  async function retrieve(query) {
    if (job) throw new RagError('processing', 'Die Unterlagen werden gerade aufbereitet. Bitte danach erneut anfragen.', 409);
    const catalog = await disk().catalog(); const ready = catalog.documents.filter(document => document.status === 'ready');
    if (!ready.length) return { revision: catalog.revision, sources: [], state: 'unprepared' };
    const matches = []; const used = [];
    for (const document of ready) {
      const fingerprint = await disk().fingerprint(document.source);
      if (fingerprint.hash !== document.fingerprint?.hash || fingerprint.mtimeMs !== document.fingerprint?.mtimeMs) throw new RagError('stale', 'Eine Unterlage hat sich verändert. Bitte das Material neu einlesen.', 409);
      if (!document.index || !document.index.startsWith(document.id + '.') || !/^[a-f0-9.-]+\.json$/.test(document.index)) throw new RagError('index', 'Ungültiger privater Index. Bitte neu aufbereiten.', 409);
      const index = await disk().json('index', document.index);
      if (index.fingerprint !== fingerprint.hash) throw new RagError('stale', 'Index und Unterlage passen nicht zusammen. Bitte neu aufbereiten.', 409);
      for (const chunk of searchIndex(index, query)) matches.push({ ...chunk, document });
    }
    const sources = [];
    for (const match of matches.sort((a, b) => b.score - a.score)) {
      if (sources.some(source => source.documentId === match.document.id && source.page === match.page && Math.max(0, Math.min(source.end, match.end) - Math.max(source.start, match.start)) > RAG_LIMITS.overlap)) continue;
      sources.push({ id: `S${sources.length + 1}`, documentId: match.document.id, label: match.document.label, page: match.page, start: match.start, end: match.end, text: match.text });
      used.push({ id: match.document.id, fingerprint: match.document.fingerprint.hash });
      if (sources.length === RAG_LIMITS.sources) break;
    }
    return { revision: catalog.revision, sources, used, state: sources.length ? 'ready' : 'no_match' };
  }
  async function assertCurrent(token) {
    const catalog = await disk().catalog(); if (job || catalog.revision !== token.revision) throw new RagError('changed', 'Der Materialstand hat sich während der Antwort geändert. Bitte neu anfragen.', 409);
    for (const used of token.used || []) {
      const document = catalog.documents.find(item => item.id === used.id && item.status === 'ready');
      if (!document || (await disk().fingerprint(document.source)).hash !== used.fingerprint) throw new RagError('changed', 'Eine verwendete Unterlage ist nicht mehr aktuell. Bitte neu anfragen.', 409);
    }
  }
  return { status, importPdf, prepare, cancel, remove, retrieve, assertCurrent };
}
