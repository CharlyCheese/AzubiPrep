import { afterEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { Readable } from 'node:stream';
import { createRagService } from '../src/rag.js';
import { createRagStorage } from '../src/rag-storage.js';
import { RagError, RAG_LIMITS } from '../src/rag-index.js';
import { syntheticPdf } from './fixtures/synthetic-pdf.js';

const roots = [];
afterEach(async () => { for (const root of roots.splice(0)) { expect(path.dirname(await fs.realpath(root))).toBe(await fs.realpath(os.tmpdir())); expect(path.basename(root)).toMatch(/^azubiprep-rag-test-/); await fs.rm(root, { recursive: true, force: true }); } });
async function fixture(extractor) {
  const root = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'azubiprep-rag-test-'))); roots.push(root);
  const settings = { ragDir: path.join(root, 'private'), projectRoot: path.join(root, 'app'), contentDir: path.join(root, 'app/content'), frontendDist: path.join(root, 'app/frontend'), ragTimeoutMs: 10000 };
  const storage = createRagStorage(settings); await storage.ensure(); return { root, settings, storage, rag: createRagService(settings, extractor) };
}
async function wait(rag) { for (let n = 0; n < 300; n++) { const status = await rag.status(); if (status.state !== 'processing' && (status.state === 'ready' || status.state === 'error' || status.documents.some(item => item.state === 'error'))) return status; await new Promise(resolve => setTimeout(resolve, 10)); } throw Error('Synthetischer Auftrag hat nicht beendet.'); }
const text = 'HTML beschreibt die Struktur einer Webseite. Eine Hauptueberschrift benennt das zentrale Thema. Absaetze enthalten eigenen Text und Links verbinden verschiedene Seiten.';

describe('Private lokale RAG-Verwaltung', () => {
  it('weist zu viele PDFs und übergroße Einzel-/Gesamtbestände vor dem Parserstart zurück', async () => {
    const extractor = vi.fn(); const { rag, storage } = await fixture(extractor);
    for (let n = 0; n < 9; n++) await fs.writeFile(storage.location('material', `synthetic-${n}.pdf`), syntheticPdf([text]));
    await expect(rag.prepare()).rejects.toMatchObject({ code: 'documents' });
    for (let n = 5; n < 9; n++) await storage.unlink('material', `synthetic-${n}.pdf`);
    // Metadaten großer Dateien simulieren, ohne hunderte MiB Testdaten anzulegen.
    const lstat = fs.lstat.bind(fs); let single = true;
    const spy = vi.spyOn(fs, 'lstat').mockImplementation(async (target, ...args) => {
      const stat = await lstat(target, ...args);
      if (path.dirname(target) === storage.directory('material') && target.endsWith('.pdf')) stat.size = RAG_LIMITS.pdfBytes + (single ? 1 : 0);
      return stat;
    });
    try {
      await expect(rag.prepare()).rejects.toMatchObject({ code: 'file' });
      single = false; await expect(rag.prepare()).rejects.toMatchObject({ code: 'file_limit' });
      expect(extractor).not.toHaveBeenCalled();
    } finally { spy.mockRestore(); }
  });
  it('liest den bestätigten Katalog nach einem parallelen atomaren Dateiaustausch erneut', async () => {
    const { storage } = await fixture(); const saved = await storage.saveCatalog(await storage.catalog());
    const open = fs.open.bind(fs); let replaced = false;
    const spy = vi.spyOn(fs, 'open').mockImplementation(async (target, ...args) => {
      const handle = await open(target, ...args);
      if (!replaced && target === storage.location('', 'catalog.json')) {
        replaced = true; const stat = await handle.stat();
        // Windows-Datei-IDs können oberhalb der sicheren Integergrenze liegen;
        // +1 würde dann unter Umständen dieselbe Number ergeben.
        return { stat: async () => ({ ...stat, ino: stat.ino === 0 ? 1 : 0 }), close: () => handle.close() };
      }
      return handle;
    });
    try { expect((await storage.catalog()).revision).toBe(saved.revision); expect(replaced).toBe(true); }
    finally { spy.mockRestore(); }
  });
  it('übernimmt einen Stand auch nach kurzzeitiger Dateisperre und erhält bei dauerhaftem Fehler die alte Datei', async () => {
    const { storage } = await fixture(); await storage.writeJson('', 'retry.json', { version: 1 });
    const rename = fs.rename.bind(fs); let attempts = 0; let permanent = false;
    const spy = vi.spyOn(fs, 'rename').mockImplementation((from, to) => {
      if (to === storage.location('', 'retry.json') && (permanent || attempts++ < 2)) return Promise.reject(Object.assign(new Error('Synthetische Dateisperre'), { code: 'EPERM' }));
      return rename(from, to);
    });
    try {
      await storage.writeJson('', 'retry.json', { version: 2 }); expect((await storage.json('', 'retry.json')).version).toBe(2);
      permanent = true; await expect(storage.writeJson('', 'retry.json', { version: 3 })).rejects.toMatchObject({ code: 'EPERM' });
      expect((await storage.json('', 'retry.json')).version).toBe(2);
      expect((await fs.readdir(storage.root)).filter(name => name.endsWith('.tmp'))).toEqual([]);
    } finally { spy.mockRestore(); }
  });
  it('liest eine synthetische PDF, findet Seiten und bleibt nach Neustart nutzbar', async () => {
    const { rag, storage, settings } = await fixture(); const original = syntheticPdf([text, 'Subnetting verwendet eine Netzmaske fuer IPv4 Netzwerkadressen. Diese Adresse und die Netzmaske erlauben die Zerlegung eines Netzwerks in kleinere Teilnetze.']);
    await fs.writeFile(storage.location('material', 'private-fixture.pdf'), original);
    expect((await rag.status()).pending).toBe(1); await rag.prepare(); const status = await wait(rag);
    expect(status.state, JSON.stringify(status.documents.map(item => ({ state: item.state, error: item.error })))).toBe('ready'); expect(status.documents[0].pages).toBe(2); expect(JSON.stringify(status)).not.toContain('private-fixture.pdf');
    const token = await rag.retrieve('Subnetting IPv4 Netzmaske'); expect(token.sources[0].page).toBe(2); await rag.assertCurrent(token);
    const restarted = createRagService(settings); expect((await restarted.retrieve('Subnetting Netzmaske')).sources[0].page).toBe(2);
    expect(await fs.readFile(storage.location('material', 'private-fixture.pdf'))).toEqual(original);
  });
  it('erkennt veränderte Quellen und invalidiert laufende Antworten nach Entfernen', async () => {
    const { rag, storage } = await fixture(); await fs.writeFile(storage.location('material', 'original.pdf'), syntheticPdf([text])); await rag.prepare(); const status = await wait(rag); expect(status.state).toBe('ready');
    const token = await rag.retrieve('HTML Hauptueberschrift');
    await fs.appendFile(storage.location('material', 'original.pdf'), '\n% changed');
    await expect(rag.retrieve('HTML Struktur')).rejects.toMatchObject({ code: 'stale' });
    await rag.remove(status.documents[0].id); await expect(rag.assertCurrent(token)).rejects.toMatchObject({ code: 'changed' });
    expect(await fs.readdir(storage.directory('index'))).toEqual([]); expect(await fs.readdir(storage.directory('staging'))).toEqual([]);
    expect(await fs.readFile(storage.location('material', 'original.pdf'))).toBeTruthy();
    expect((await rag.status()).pending).toBe(0); expect((await rag.retrieve('HTML')).sources).toEqual([]);
  });
  it('importiert eine Arbeitskopie und löscht sie samt Index, ohne eine externe Quelle anzufassen', async () => {
    const { rag, storage } = await fixture(); const bytes = syntheticPdf([text]); const imported = await rag.importPdf(Readable.from([bytes])); await rag.prepare(); expect((await wait(rag)).state).toBe('ready');
    expect((await rag.remove(imported.id)).originalKept).toBe(false);
    expect(await fs.readdir(storage.directory('material'))).toEqual([]); expect(await fs.readdir(storage.directory('index'))).toEqual([]);
    await expect(rag.importPdf(Readable.from([Buffer.from('NOT A PDF')]))).rejects.toMatchObject({ code: 'pdf' }); expect(await fs.readdir(storage.directory('material'))).toEqual([]);
  });
  it('erhält bestätigte Daten bei Parserfehler und bereinigt temporäre Daten nach Abbruch', async () => {
    let mode = 'ok'; let entered; const started = new Promise(resolve => { entered = resolve; });
    const extractor = async (_input, output, { signal }) => {
      if (mode === 'fail') throw new RagError('pdf', 'Synthetischer Parserfehler.');
      if (mode === 'wait') { entered(); await new Promise((resolve, reject) => { if (signal.aborted) reject(new RagError('aborted', 'Abgebrochen.')); else signal.addEventListener('abort', () => reject(new RagError('aborted', 'Abgebrochen.')), { once: true }); }); }
      await fs.writeFile(output, JSON.stringify({ schema: 1, pages: [text], failedPages: 0 }));
    };
    const { rag, storage } = await fixture(extractor); await fs.writeFile(storage.location('material', 'original.pdf'), syntheticPdf([text]));
    await rag.prepare(); expect((await wait(rag)).state).toBe('ready'); const before = await rag.retrieve('HTML Struktur');
    await fs.writeFile(storage.location('index', `${(await rag.status()).documents[0].id}.orphan.json`), '{}');
    await rag.prepare(); expect((await wait(rag)).state).toBe('ready'); expect(await fs.readdir(storage.directory('index'))).toHaveLength(1);
    mode = 'fail'; await rag.prepare(); expect((await wait(rag)).state).toBe('ready'); expect((await rag.retrieve('HTML Struktur')).sources[0].text).toBe(before.sources[0].text);
    mode = 'wait'; await rag.prepare(); await started; await rag.cancel(); expect((await rag.status()).state).toBe('ready'); expect(await fs.readdir(storage.directory('staging'))).toEqual([]);
  });
  it('verweigert öffentliche Wurzeln, Symlink-/Junction-Ausbrüche und unbekannte IDs', async () => {
    const { settings, storage, rag, root } = await fixture();
    expect(() => createRagStorage({ ...settings, ragDir: settings.frontendDist })).toThrow(/öffentlichen/);
    await fs.mkdir(path.join(root, 'outside')); await fs.symlink(path.join(root, 'outside'), storage.location('material', 'link'), process.platform === 'win32' ? 'junction' : 'dir');
    await expect(storage.regular('material', 'link')).rejects.toMatchObject({ code: 'file' });
    await expect(rag.remove('../../outside')).rejects.toMatchObject({ code: 'id' });
    await expect(storage.json('index', '../outside')).rejects.toMatchObject({ code: 'path' });
  });
  it('vergibt den gleichen privaten Mutex nur einmal und gibt ihn nach Prozessabbruch frei', async () => {
    const { storage, settings } = await fixture(); const second = createRagStorage(settings); const release = await storage.lock();
    await expect(second.lock()).rejects.toMatchObject({ code: 'busy' }); await release(); const again = await second.lock(); await again();
    const url = new URL('../src/rag-storage.js', import.meta.url).href;
    const code = `import{createRagStorage}from ${JSON.stringify(url)};await createRagStorage(${JSON.stringify(settings)}).lock();console.log('READY');setInterval(()=>{},1000);`;
    const child = spawn(process.execPath, ['--input-type=module', '-e', code], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true }); child.stderr.resume();
    try { await once(child.stdout, 'data'); await expect(storage.lock()).rejects.toMatchObject({ code: 'busy' }); const close = once(child, 'close'); child.kill(); await close; const freed = await storage.lock(); await freed(); }
    finally { if (child.exitCode === null && child.signalCode === null) child.kill(); }
  });
});
