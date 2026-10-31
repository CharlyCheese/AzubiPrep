import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import net from 'node:net';
import { RagError, RAG_LIMITS } from './rag-index.js';

const inside = (root, value) => { const relative = path.relative(root, value); return !relative || (!path.isAbsolute(relative) && relative !== '..' && !relative.startsWith('..' + path.sep)); };
export function createRagStorage(settings) {
  let root = path.resolve(settings.ragDir); const project = path.resolve(settings.projectRoot);
  function permitted(value, projectPath, publicPaths) {
    if (path.dirname(value) === value || inside(value, projectPath) || (inside(projectPath, value) && !inside(path.join(projectPath, 'local-rag'), value)) || publicPaths.some(publicPath => inside(publicPath, value) || inside(value, publicPath))) throw new RagError('location', 'Der private Materialordner darf nicht in einem öffentlichen Projektbereich liegen.', 503);
  }
  const publicPaths = [settings.frontendDist, settings.contentDir].filter(Boolean).map(value => path.resolve(value));
  permitted(root, project, publicPaths);
  async function canonical(value) {
    try { return await fs.realpath(value); }
    catch (error) { if (error.code !== 'ENOENT') throw error; const parent = path.dirname(value); if (parent === value) throw error; return path.join(await canonical(parent), path.basename(value)); }
  }
  async function noLinks(value) {
    for (let current = value; ; current = path.dirname(current)) {
      try { if ((await fs.lstat(current)).isSymbolicLink()) throw new RagError('link', 'Verknüpfungen sind in der privaten Materialablage nicht erlaubt.'); }
      catch (error) { if (error.code !== 'ENOENT') throw error; }
      if (path.dirname(current) === current) break;
    }
  }
  async function ensure() {
    await noLinks(root); await fs.mkdir(root, { recursive: true, mode: 0o700 });
    const real = await fs.realpath(root);
    permitted(real, await canonical(project), await Promise.all(publicPaths.map(canonical)));
    root = real; // Auch echte Windows-8.3-Namen auf dieselbe Wurzel abbilden.
    for (const name of ['material', 'index', 'staging']) {
      const directory = path.join(root, name); await noLinks(directory); await fs.mkdir(directory, { recursive: true, mode: 0o700 });
      if (!(await fs.lstat(directory)).isDirectory() || !inside(root, await fs.realpath(directory))) throw new RagError('link', 'Ungültige private Materialablage.');
    }
  }
  function location(area, name) {
    if (!['material', 'index', 'staging', ''].includes(area) || !name || path.basename(name) !== name || name === '.' || name === '..' || name.includes('\0')) throw new RagError('path', 'Ungültige interne Materialkennung.');
    return path.join(root, area, name);
  }
  async function regular(area, name, max = RAG_LIMITS.pdfBytes) {
    await ensure(); const target = location(area, name); const stat = await fs.lstat(target);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > max || !inside(path.join(root, area), await fs.realpath(target))) throw new RagError('file', 'Die lokale Datei ist nicht freigegeben oder zu groß.');
    return { target, stat };
  }
  async function json(area, name, max = RAG_LIMITS.indexBytes) {
    const { target, stat } = await regular(area, name, max); const handle = await fs.open(target, 'r');
    try {
      const current = await handle.stat();
      if (current.ino !== stat.ino || current.dev !== stat.dev) throw new RagError('changed', 'Der lokale Materialstand hat sich verändert.', 409);
      const bytes = Buffer.alloc(stat.size + 1); let offset = 0;
      while (offset < bytes.length) { const read = await handle.read(bytes, offset, bytes.length - offset, null); if (!read.bytesRead) break; offset += read.bytesRead; }
      if (offset > max || offset !== stat.size) throw new RagError('changed', 'Der lokale Materialstand hat sich verändert.', 409);
      return JSON.parse(bytes.subarray(0, offset).toString('utf8'));
    } finally { await handle.close(); }
  }
  async function writeJson(area, name, value) {
    await ensure(); const text = JSON.stringify(value);
    if (Buffer.byteLength(text) > RAG_LIMITS.indexBytes) throw new RagError('index_limit', 'Der lokale Suchindex ist zu groß.');
    const temporary = location(area, `${name}.${randomUUID()}.tmp`);
    try {
      await fs.writeFile(temporary, text, { flag: 'wx', mode: 0o600 });
      // Windows kann ein gleichzeitig gelesenes Ziel kurz gegen Umbenennen
      // sperren. Atomaren Austausch begrenzt wiederholen, nie das Ziel löschen.
      for (let attempt = 0; ; attempt++) {
        try { await fs.rename(temporary, location(area, name)); break; }
        catch (error) {
          if (attempt >= 7 || !['EPERM', 'EBUSY', 'EACCES'].includes(error.code)) throw error;
          await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 20));
        }
      }
    }
    finally { await fs.unlink(temporary).catch(error => { if (error.code !== 'ENOENT') throw error; }); }
  }
  async function catalog() {
    try {
      let value;
      for (let attempt = 0; ; attempt++) {
        try { value = await json('', 'catalog.json', 128 * 1024); break; }
        catch (error) {
          // Ein paralleler atomarer Commit kann zwischen stat und open liegen.
          if (attempt >= 3 || !['changed', 'EPERM', 'EBUSY', 'EACCES'].includes(error.code)) throw error;
          await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 10));
        }
      }
      if (value.schema !== 1 || !Array.isArray(value.documents) || value.documents.length > RAG_LIMITS.documents || !Array.isArray(value.ignored) || value.ignored.length > 1000 || typeof value.revision !== 'string') throw new Error();
      for (const document of value.documents) if (!/^[a-f0-9-]{36}$/.test(document.id) || typeof document.source !== 'string' || path.basename(document.source) !== document.source || typeof document.owned !== 'boolean' || !/^Unterlage \d+$/.test(document.label)) throw new Error();
      return value;
    } catch (error) { if (error.code === 'ENOENT') return { schema: 1, revision: 'empty', nextLabel: 1, documents: [], ignored: [] }; throw new RagError('catalog', 'Die private Materialverwaltung ist nicht lesbar. Vorhandene Daten bleiben erhalten.', 409); }
  }
  async function saveCatalog(value) { const next = { ...value, revision: randomUUID() }; await writeJson('', 'catalog.json', next); return next; }
  async function unlink(area, name) {
    try { await regular(area, name, Math.max(RAG_LIMITS.pdfBytes, RAG_LIMITS.indexBytes)); await fs.unlink(location(area, name)); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  async function fingerprint(name, destination, signal) {
    const { target, stat } = await regular('material', name); const handle = await fs.open(target, 'r'); let output;
    try {
      const current = await handle.stat(); if (current.ino !== stat.ino || current.dev !== stat.dev) throw new RagError('changed', 'Das Material hat sich verändert.', 409);
      if (destination) output = await fs.open(location('staging', destination), 'wx', 0o600);
      const hash = createHash('sha256'); const buffer = Buffer.alloc(65536); let total = 0;
      for (;;) {
        if (signal?.aborted) throw new RagError('aborted', 'Aufbereitung abgebrochen.', 409);
        const { bytesRead } = await handle.read(buffer, 0, buffer.length, null); if (!bytesRead) break;
        if (total === 0 && buffer.subarray(0, 5).toString('ascii') !== '%PDF-') throw new RagError('pdf', 'Die Datei enthält keine unterstützte PDF-Signatur.');
        total += bytesRead; if (total > RAG_LIMITS.pdfBytes) throw new RagError('file_limit', 'Eine PDF darf höchstens 128 MiB groß sein.');
        const chunk = buffer.subarray(0, bytesRead); hash.update(chunk); if (output) await output.writeFile(chunk);
      }
      const final = await fs.lstat(target);
      if (final.isSymbolicLink() || final.ino !== stat.ino || final.size !== stat.size || final.mtimeMs !== stat.mtimeMs || total !== stat.size || !total) throw new RagError('changed', 'Das Material wurde während des Lesens verändert.', 409);
      return { hash: hash.digest('hex'), size: total, mtimeMs: stat.mtimeMs };
    } finally { await handle.close(); if (output) await output.close(); }
  }
  async function lock() {
    await ensure();
    // Betriebssystem vergibt den Loopback-Port exklusiv und gibt ihn auch
    // nach Prozessabbruch frei. Keine unsichere verwaiste Dateisperre löschen.
    // Dieser reine Mutex empfängt/überträgt keine Materialdaten.
    const key = process.platform === 'win32' ? root.toLowerCase() : root;
    const port = settings.ragLockPort || 20000 + parseInt(createHash('sha256').update(key).digest('hex').slice(0, 8), 16) % 40000;
    const server = net.createServer(socket => socket.destroy()); server.maxConnections = 1;
    await new Promise((resolve, reject) => {
      server.once('error', () => reject(new RagError('busy', 'Eine andere lokale Materialverarbeitung läuft bereits oder ihre lokale Sperradresse ist belegt.', 409)));
      server.listen({ port, host: '127.0.0.1', exclusive: true }, resolve);
    });
    server.unref();
    return () => new Promise(resolve => server.close(resolve));
  }
  return { root, ensure, location, directory: area => path.dirname(location(area, '.keep')), regular, json, writeJson, catalog, saveCatalog, unlink, fingerprint, lock,
    async sources() { await ensure(); return (await fs.readdir(path.join(root, 'material'), { withFileTypes: true })).filter(item => item.isFile() && !item.isSymbolicLink() && /\.pdf$/i.test(item.name)).map(item => item.name); },
  };
}
