// Vom Repository-Stamm: node scripts/build-netlify.mjs (frontend-Abhängigkeiten installiert).
import { execFileSync } from 'node:child_process';
import { copyFile, lstat, mkdir, readFile, readdir, realpath, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readCsvFile } from '../backend/src/csv.js';

const root = await realpath(fileURLToPath(new URL('../', import.meta.url)));
const output = path.join(root, 'netlify-build');
const site = path.join(output, 'site');
const data = path.join(output, 'data');
const publicDir = path.join(output, 'public');
const frontend = path.join(root, 'frontend');
const content = path.join(root, 'content');

// Jeder Quelldateiname ergibt sich aus einem öffentlichen Katalog oder einer
// festen Liste. Auch Verzeichnislinks dürfen nicht in private Ablagen führen.
async function copyPublicFile(source, destination) {
  if (await realpath(source) !== source || !(await lstat(source)).isFile()) {
    throw new Error('Ungültige Quelle für den öffentlichen Build: ' + path.basename(source));
  }
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(source, destination);
}

async function copyContent(relative) {
  await copyPublicFile(path.join(content, relative), path.join(data, 'content', relative));
}

// Nur die festen Ausgabeverzeichnisse eines früheren Builds erneuern.
await mkdir(output, { recursive: true });
if (await realpath(output) !== output) throw new Error('Der Ausgabeordner darf kein Verweis sein.');
for (const dir of [site, data, publicDir]) {
  const existing = await lstat(dir).catch(error => {
    if (error.code !== 'ENOENT') throw error;
  });
  if (existing) {
    if (!existing.isDirectory() || await realpath(dir) !== dir) throw new Error('Unerwartetes Ausgabeziel.');
    await rm(dir, { recursive: true });
  }
  await mkdir(dir);
}

for (const filename of ['manifest.webmanifest', 'theme-init.js', 'sw.js', 'icon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable.svg', 'quickjs-LICENSE.txt']) {
  await copyPublicFile(path.join(frontend, 'public', filename), path.join(publicDir, filename));
}
for (const filename of ['fachrichtungen.csv', 'modules.csv', 'learning-journey/fiae.v1.json']) {
  await copyContent(filename);
}
for (const { modul_id: id } of readCsvFile(path.join(data, 'content/modules.csv')).records) {
  if (!/^[A-Z0-9-]+$/.test(id)) throw new Error('Ungültige Modulkennung im öffentlichen Katalog.');
  await copyContent('questions/' + id + '.csv');
  const reading = 'theorie/' + id + '.md';
  try {
    await copyContent(reading);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error; // Ein Modul kann ohne eigenen Theorietext vorliegen.
  }
}
const plan = JSON.parse(await readFile(path.join(data, 'content/learning-journey/fiae.v1.json'), 'utf8'));
for (const topic of plan.topics.filter(topic => topic.status === 'content-ready')) {
  if (!/^[a-z0-9-]+$/.test(topic.id)) throw new Error('Ungültige Themenkennung im öffentlichen Lernplan.');
  await copyContent('learning-journey/topics/' + topic.id + '.v1.json');
  await copyContent('learning-journey/questions/' + topic.id + '.v1.csv');
}

execFileSync(process.execPath, [
  path.join(frontend, 'node_modules/vite/bin/vite.js'), 'build', '--mode', 'portfolio', '--outDir', site,
], { cwd: frontend, stdio: 'inherit' });
for (const filename of ['workshop-search.json', 'journey-practice-search.json']) {
  await copyPublicFile(path.join(site, filename), path.join(data, filename));
}

// Nur die App-Seiten erhalten den SPA-Fallback. Fehlende Assets und API-
// Anfragen müssen ihren eigenen Status und Inhaltstyp behalten.
const routes = [
  '/willkommen', '/dashboard', '/lernen', '/lernen/:modulId', '/quiz/:modulId',
  '/theorie', '/suche', '/lernreise', '/lernreise/fiae/:topicId', '/frontendkurs',
  '/frontendkurs/debugger', '/karteikarten', '/pruefung', '/pruefung/lauf',
  '/pruefung/ergebnis', '/pruefung/verlauf', '/statistik', '/kalender',
  '/notizen', '/einstellungen', '/profil',
];
await writeFile(path.join(site, '_redirects'), routes.map(route => route + ' /index.html 200\n').join(''));

const pagePolicy = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; worker-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'";
const workerPolicy = "default-src 'none'; script-src 'self' 'wasm-unsafe-eval'; connect-src 'none'; worker-src 'none'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'";
const headers = ['/*', '  X-Content-Type-Options: nosniff', '  X-Frame-Options: DENY', '  Referrer-Policy: no-referrer'];
for (const route of ['/', '/index.html', ...routes]) {
  headers.push(route, '  Content-Security-Policy: ' + pagePolicy);
}
for (const filename of await readdir(path.join(site, 'assets'))) {
  if (!filename.endsWith('.js')) continue;
  const isGuestWorker = /^(js-runner|advanced|debugger)\.worker-[\w-]+\.js$/.test(filename);
  headers.push('/assets/' + filename, '  Content-Security-Policy: ' + (isGuestWorker ? workerPolicy : pagePolicy));
}
headers.push('/sw.js', '  Cache-Control: no-cache', '  Content-Security-Policy: ' + pagePolicy);
await writeFile(path.join(site, '_headers'), headers.join('\n') + '\n');
console.log('Portfolio-PWA und öffentliche Lerninhalte für Netlify erstellt.');
