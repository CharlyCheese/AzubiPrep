import { fork } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RagError } from './rag-index.js';

const moduleRoot = path.dirname(fileURLToPath(import.meta.url));
export function extractPdf(input, output, { signal, onProgress = () => {}, timeoutMs = 120000 } = {}) {
  if (signal?.aborted) return Promise.reject(new RagError('aborted', 'Aufbereitung abgebrochen.', 409));
  return new Promise((resolve, reject) => {
    const env = {};
    for (const key of ['SystemRoot', 'WINDIR', 'TEMP', 'TMP', 'PATH', 'HOME', 'USERPROFILE']) if (process.env[key]) env[key] = process.env[key];
    env.ELECTRON_RUN_AS_NODE = '1'; env.OLLAMA_NO_CLOUD = '1';
    const child = fork(path.join(moduleRoot, 'rag-pdf-worker.js'), [input, output], { env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe', 'ipc'], execArgv: ['--max-old-space-size=512', '--permission', '--allow-addons', `--allow-fs-read=${moduleRoot}`, `--allow-fs-read=${path.join(moduleRoot, '../package.json')}`, `--allow-fs-read=${path.join(moduleRoot, '../node_modules')}`, `--allow-fs-read=${input}`, `--allow-fs-write=${output}`] });
    // Parserdetails könnten private Texte, Dateinamen oder Metadaten enthalten.
    child.stdout.resume(); child.stderr.resume();
    let reason = null; let timer;
    const abort = () => { reason = new RagError('aborted', 'Aufbereitung abgebrochen.', 409); child.kill(); };
    timer = setTimeout(() => { reason = new RagError('timeout', 'Die lokale PDF-Aufbereitung hat zu lange gebraucht. Der vorige Stand bleibt erhalten.', 408); child.kill(); }, timeoutMs);
    signal?.addEventListener('abort', abort, { once: true });
    child.on('message', message => {
      if (message?.type === 'progress' && Number.isInteger(message.page) && Number.isInteger(message.total)) onProgress(message.page, message.total);
      if (message?.type === 'error') reason = new RagError(message.code, message.code === 'password' ? 'Die PDF benötigt ein Passwort. Passwortgeschützte Unterlagen werden noch nicht unterstützt.' : message.code === 'no_text' ? 'Kein ausreichender lesbarer PDF-Text gefunden; OCR ist noch nicht verfügbar.' : 'Die PDF konnte innerhalb der lokalen Verarbeitungsgrenzen nicht aufbereitet werden.');
    });
    child.on('error', () => { reason = new RagError('extractor', 'Die lokale PDF-Texterkennung konnte nicht gestartet werden.', 503); });
    child.on('close', code => { clearTimeout(timer); signal?.removeEventListener('abort', abort); if (reason || code !== 0) reject(reason || new RagError('extractor', 'Die lokale PDF-Texterkennung wurde unterbrochen.', 503)); else resolve(); });
  });
}
