// Ausschließlich lokale Byte-PDF -> Seitentext. Nie Inhalte/Metadaten loggen.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RAG_LIMITS } from './rag-index.js';

for (const method of ['log', 'warn', 'error', 'info', 'debug']) console[method] = () => {};
const [input, output] = process.argv.slice(2);
process.once('disconnect', () => process.exit(1));
try {
  // Keine fetch-basierten CMaps/Schriften oder sonstige Netzwerkressourcen.
  globalThis.fetch = async () => { throw new Error('network_disabled'); };
  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const assets = path.dirname(fileURLToPath(import.meta.resolve('pdfjs-dist/package.json')));
  const data = new Uint8Array(await fs.readFile(input));
  if (data.length > RAG_LIMITS.pdfBytes) throw new Error('file_limit');
  const task = getDocument({ data, verbosity: 0, isEvalSupported: false, disableFontFace: true, useSystemFonts: false, useWasm: false, isOffscreenCanvasSupported: false, isImageDecoderSupported: false, maxImageSize: 1, disableAutoFetch: true, disableStream: true, disableRange: true, useWorkerFetch: false, cMapUrl: path.join(assets, 'cmaps') + '/', cMapPacked: true, standardFontDataUrl: path.join(assets, 'standard_fonts') + '/' });
  const document = await task.promise;
  if (!document.numPages || document.numPages > RAG_LIMITS.pages) throw new Error('pages');
  const pages = []; let total = 0; let failedPages = 0;
  try {
    for (let number = 1; number <= document.numPages; number++) {
      let page; let text = '';
      try {
        page = await document.getPage(number); const content = await page.getTextContent();
        for (const item of content.items) if (typeof item.str === 'string') text += item.str + (item.hasEOL ? '\n' : ' ');
      } catch { failedPages++; }
      finally { page?.cleanup(); }
      total += text.length;
      if (text.length > RAG_LIMITS.pageChars || total > RAG_LIMITS.textChars) throw new Error('text_limit');
      pages.push(text);
      if (number % 10 === 0 || number === document.numPages) process.send?.({ type: 'progress', page: number, total: document.numPages });
    }
    if (failedPages > Math.max(1, document.numPages * 0.1)) throw new Error('no_text');
    await fs.writeFile(output, JSON.stringify({ schema: 1, pages, failedPages }), { flag: 'wx', mode: 0o600 });
  } finally { await task.destroy(); }
  process.send?.({ type: 'done' });
} catch (error) {
  const allowed = ['file_limit', 'pages', 'text_limit', 'no_text'];
  process.send?.({ type: 'error', code: error.name === 'PasswordException' ? 'password' : allowed.includes(error.message) ? error.message : 'pdf' });
  process.exitCode = 1;
} finally {
  // Der Disconnect-Listener hält insbesondere unter Electron den IPC-Kanal offen.
  // Erst nach abgeschlossener Ausgabe und Parserbereinigung freigeben.
  process.removeAllListeners('disconnect');
  if (process.connected) process.disconnect();
}
