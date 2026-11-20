import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { loadContentFromCsv } from '../../backend/src/public-content.js';
import { loadJourney } from '../../backend/src/journey.js';
import { publicContentOperations, publicExamOperations, publicJourneyOperations, readPublicSources } from '../../backend/src/public-learning.js';

export const config = { path: '/api/*' };

const dataDir = path.resolve('netlify-build/data');
const maxBodyBytes = 256 * 1024;
// Dieselben öffentlichen Kataloge wie der Service Worker. Suchtexte und
// Ergebnisse persönlicher Eingaben bleiben sowohl im Browser als auch beim CDN flüchtig.
const cacheableCatalogs = new Set(['/fachrichtungen', '/konstanten', '/module', '/module/:modulId', '/fragen', '/fragen/:id', '/theorie', '/theorie/themen/:id']);
let routes;

function loadRoutes() {
  const contentDir = path.join(dataDir, 'content');
  const content = loadContentFromCsv(contentDir);
  const store = { get: () => content };
  const journey = loadJourney(contentDir);
  const readCatalog = async filename => JSON.parse(await readFile(path.join(dataDir, filename), 'utf8'));
  const loadSearchCatalogs = () => Promise.all([readCatalog('workshop-search.json'), readCatalog('journey-practice-search.json')]);
  const operations = [
    { method: 'GET', path: '/status', run: () => ({ syncAktiviert: false, pushAktiviert: false }) },
    { method: 'GET', path: '/theorie/fundstellen', run: ({ query }) => readPublicSources(content, query) },
    ...publicContentOperations(store, journey, loadSearchCatalogs),
    ...publicExamOperations(store),
    ...publicJourneyOperations(journey).map(op => ({ ...op, path: '/journey' + op.path })),
  ];
  return operations.map(op => {
    const names = [];
    const pattern = op.path.replace(/:(\w+)/g, (_, name) => {
      names.push(name);
      return '([^/]+)';
    });
    return { ...op, names, pattern: new RegExp('^/api' + pattern + '/?$') };
  });
}

function reject(status, message) {
  throw Object.assign(new Error(message), { status });
}

async function readBody(request) {
  if (Number(request.headers.get('content-length')) > maxBodyBytes) reject(413, 'Die Anfrage ist zu groß.');
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') || '')) reject(415, 'JSON erwartet.');
  if (!request.body) reject(400, 'JSON-Inhalt fehlt.');
  const reader = request.body.getReader();
  const chunks = [];
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBodyBytes) {
        await reader.cancel();
        reject(413, 'Die Anfrage ist zu groß.');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  try {
    return JSON.parse(Buffer.concat(chunks, bytes).toString('utf8'));
  } catch {
    reject(400, 'Ungültiger JSON-Inhalt.');
  }
}

function decodeParam(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    reject(400, 'Ungültige Adresse.');
  }
}

export default async function learning(request) {
  const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
  try {
    const url = new URL(request.url);
    routes ||= loadRoutes();
    const route = routes.find(op => op.pattern.test(url.pathname));
    if (!route) reject(404, 'Ressource nicht gefunden');
    const head = request.method === 'HEAD' && route.method === 'GET';
    if (!head && request.method !== route.method) {
      headers.Allow = route.method === 'GET' ? 'GET, HEAD' : route.method;
      reject(405, 'Methode nicht erlaubt.');
    }
    const matches = route.pattern.exec(url.pathname);
    const params = Object.fromEntries(route.names.map((name, index) => [name, decodeParam(matches[index + 1])]));
    const body = route.method === 'POST' ? await readBody(request) : undefined;
    const result = await route.run({ params, query: Object.fromEntries(url.searchParams), body });
    if (route.method === 'GET' && cacheableCatalogs.has(route.path) && !url.searchParams.getAll('q').some(Boolean) && !request.headers.has('Authorization')) {
      headers['Cache-Control'] = 'no-cache';
    }
    if (head) return new Response(null, { headers: { ...headers, 'Content-Type': 'application/json' } });
    return Response.json(result, { headers });
  } catch (error) {
    const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 500 ? error.status : 500;
    return Response.json({ error: status === 500 ? 'Interner Fehler' : error.message }, { status, headers });
  }
}
