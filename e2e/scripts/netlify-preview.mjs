// Lokaler HTTP-Prüfstand für die in diesem Projekt verwendeten Netlify-Regeln.
// Liefert nur Dateien aus dem Veröffentlichungsordner und die echte Function aus.
import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const types = {
  '.css': 'text/css', '.html': 'text/html; charset=utf-8', '.js': 'text/javascript',
  '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json', '.txt': 'text/plain',
};

export async function listFiles(root) {
  const entries = await readdir(root, { recursive: true, withFileTypes: true });
  return entries.filter(entry => {
    assert(!entry.isSymbolicLink(), 'Verknüpfung in der Ausgabe');
    return entry.isFile();
  }).map(entry => path.relative(root, path.join(entry.parentPath, entry.name)).split(path.sep).join('/'));
}

function matches(pattern, pathname) {
  const parts = pattern.split('/').map(part => {
    if (part === '*') return '.*';
    if (part.startsWith(':')) return '[^/]+';
    return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  });
  return new RegExp('^' + parts.join('/') + '$').test(pathname);
}

function parseHeaders(text) {
  const rules = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    if (line.startsWith('/')) {
      rules.push({ path: line.trim(), headers: {} });
    } else {
      const header = line.trim().match(/^([^:]+):\s*(.+)$/);
      assert(header && rules.length, 'Ungültige Zeile in _headers');
      rules.at(-1).headers[header[1].toLowerCase()] = header[2];
    }
  }
  return rules;
}

export async function startPreview(site, files, handler) {
  const headers = parseHeaders(await readFile(path.join(site, '_headers'), 'utf8'));
  const rewrites = (await readFile(path.join(site, '_redirects'), 'utf8')).split(/\r?\n/)
    .map(line => line.trim()).filter(line => line && !line.startsWith('#')).map(line => line.split(/\s+/));
  const paths = new Set(files.filter(file => !file.startsWith('_')).map(file => '/' + file));
  let offline = false;
  const server = createServer(async (req, res) => {
    if (offline) { req.socket.destroy(); return; }
    try {
      const url = new URL(req.url, 'http://localhost');
      if (url.pathname.startsWith('/api/')) {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const request = new Request(url, { method: req.method, headers: req.headers, body: chunks.length ? Buffer.concat(chunks) : undefined });
        const response = await handler(request);
        res.writeHead(response.status, Object.fromEntries(response.headers));
        res.end(Buffer.from(await response.arrayBuffer()));
        return;
      }
      const requested = url.pathname === '/' ? '/index.html' : url.pathname;
      const rewrite = rewrites.find(([from, , status]) => status === '200' && matches(from, requested));
      const file = paths.has(requested) ? requested : rewrite?.[1];
      if (!paths.has(file)) { res.writeHead(404); res.end(); return; }
      const responseHeaders = { 'content-type': types[path.extname(file)] || 'application/octet-stream' };
      for (const rule of headers.filter(rule => matches(rule.path, url.pathname))) {
        for (const [name, value] of Object.entries(rule.headers)) {
          assert(!Object.hasOwn(responseHeaders, name), `Mehrdeutiger Header ${name} für ${url.pathname}`);
          responseHeaders[name] = value;
        }
      }
      const content = await readFile(path.join(site, file));
      res.writeHead(200, responseHeaders); res.end(content);
    } catch (error) {
      console.error(error); res.writeHead(500); res.end();
    }
  });
  await new Promise((resolve, reject) => server.once('error', reject).listen(0, '127.0.0.1', resolve));
  return {
    origin: `http://127.0.0.1:${server.address().port}`,
    goOffline: () => { offline = true; },
    close: () => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }),
  };
}
