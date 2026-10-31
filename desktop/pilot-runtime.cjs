const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

const MAX_STORE = 32 * 1024 * 1024;
const LIMITS = Object.freeze({ files: 50, entries: 5000, file: 2 * 1024 * 1024, text: 128 * 1024, total: 10 * 1024 * 1024, depth: 8 });
const PRIVATE = /^(?:\.git|\.env.*|node_modules|local-rag|local-ai)$/i;
const isPrivate = (value) => value.split(/[\\/]/).some((part) => PRIVATE.test(part));
const supported = (name) => /\.(?:html|css|js|png|jpe?g|webp)$/i.test(name);
const isText = (name) => /\.(?:html|css|js)$/i.test(name);

function relativeName(root, target) {
  const name = path.relative(root, target).split(path.sep).join('/');
  if (!name || path.isAbsolute(name) || name.length > 220 || /[\\\x00-\x1f:#?%]/.test(name) || name.split('/').some((part) => !part || part === '..' || part === '.' || part.trim() !== part) || name.split('/').length > LIMITS.depth + 1) throw Error('Dateipfad außerhalb der Freigabe oder zu tief.');
  return name;
}
function inside(root, target) {
  const relative = path.relative(root, target);
  return relative === '' || (!path.isAbsolute(relative) && relative !== '..' && !relative.startsWith('..' + path.sep));
}
async function safeStat(root, target) {
  const stat = await fs.lstat(target);
  if (stat.isSymbolicLink()) throw Error('Datei- und Ordnerverknüpfungen werden nicht übernommen.');
  const real = await fs.realpath(target);
  if (!inside(root, real)) throw Error('Verknüpfung verlässt den freigegebenen Ordner.');
  return stat;
}
async function denyLinkedAncestors(target) {
  for (let current = target; ; current = path.dirname(current)) {
    if ((await fs.lstat(current)).isSymbolicLink()) throw Error('Die Auswahl enthält eine Datei- oder Ordnerverknüpfung. Bitte den echten Projektordner auswählen.');
    if (path.dirname(current) === current) return;
  }
}

async function readProject(selection, mode) {
  if (!['folder', 'files'].includes(mode) || !Array.isArray(selection) || !selection.length) throw Error('Ungültige Dateiauswahl.');
  if (selection.length > LIMITS.entries) throw Error('Zu viele ausgewählte Einträge.');
  // Auswahl wird ausschließlich aus dem nativen Dialog übernommen, nie aus Renderer-Pfaden.
  const selected = selection.map((name) => path.resolve(name));
  for (const name of selected) if (isPrivate(name)) throw Error('Private Projekt- und RAG-Ordner sind ausgeschlossen.');
  for (const name of selected) await denyLinkedAncestors(name);
  let root = mode === 'folder' ? selected[0] : path.dirname(selected[0]);
  if (mode === 'folder' && selected.length !== 1) throw Error('Bitte genau einen Projektordner auswählen.');
  if (mode === 'files') for (const file of selected) while (!inside(root, file)) {
    const parent = path.dirname(root); if (parent === root) throw Error('Dateien liegen auf unterschiedlichen Laufwerken.'); root = parent;
  }
  const rootStat = await fs.lstat(root);
  if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) throw Error('Der Projektordner muss ein echter Ordner ohne Verknüpfung sein.');
  const realRoot = await fs.realpath(root);
  const files = {}; let entries = 0; let total = 0; let skipped = 0;
  async function visit(target, depth) {
    if (++entries > LIMITS.entries) throw Error('Dieser Ordner enthält mehr als 5000 Einträge.');
    const name = relativeName(root, target);
    if (isPrivate(target)) { skipped++; return; }
    const stat = await safeStat(realRoot, target);
    if (stat.isDirectory()) {
      if (depth > LIMITS.depth) throw Error('Ordnerstruktur tiefer als acht Ebenen.');
      for (const child of (await fs.readdir(target)).sort()) await visit(path.join(target, child), depth + 1);
      return;
    }
    if (!stat.isFile()) throw Error('Nur normale Dateien werden unterstützt.');
    if (!supported(name)) { skipped++; return; }
    if (Object.keys(files).length >= LIMITS.files) throw Error('Bitte höchstens 50 unterstützte Projektdateien auswählen.');
    if (Object.hasOwn(files, name)) throw Error('Doppelter Projektpfad.');
    if (/\.js$/i.test(name) && !/^[a-zA-Z0-9_-][a-zA-Z0-9_.-]{0,59}\.js$/.test(path.basename(name))) throw Error('JS-Dateien benötigen einen einfachen Dateinamen.');
    const limit = /\.js$/i.test(name) ? 64 * 1024 : isText(name) ? LIMITS.text : LIMITS.file;
    if (stat.size > limit) throw Error(`Datei zu groß: ${name}`);
    const handle = await fs.open(target, 'r');
    let data;
    try {
      const opened = await handle.stat();
      if (!opened.isFile() || opened.ino !== stat.ino || opened.dev !== stat.dev || !inside(realRoot, await fs.realpath(target))) throw Error('Datei wurde während der Auswahl verändert.');
      const buffer = Buffer.alloc(limit + 1); let offset = 0;
      while (offset < buffer.length) { const read = await handle.read(buffer, offset, buffer.length - offset, null); if (!read.bytesRead) break; offset += read.bytesRead; }
      if (offset > limit) throw Error(`Datei zu groß: ${name}`);
      data = buffer.subarray(0, offset);
    } finally { await handle.close(); }
    total += data.length;
    if (total > LIMITS.total) throw Error('Projekt größer als 10 MiB.');
    const mime = /\.png$/i.test(name) ? 'image/png' : /\.webp$/i.test(name) ? 'image/webp' : 'image/jpeg';
    files[name] = isText(name) ? { kind: 'text', content: data.toString('utf8') } : { kind: 'image', content: `data:${mime};base64,${data.toString('base64')}` };
  }
  if (mode === 'folder') for (const name of (await fs.readdir(root)).sort()) await visit(path.join(root, name), 1);
  else for (const name of selected) await visit(name, 1);
  if (!Object.keys(files).length) throw Error('Keine unterstützten Projektdateien gefunden.');
  return { files, skipped };
}

function createStore(profile, folder = 'frontendpilot-v1') {
  const root = path.join(profile, folder); let queue = Promise.resolve();
  async function ensureRoot() {
    await fs.mkdir(root, { recursive: true });
    if ((await fs.lstat(root)).isSymbolicLink() || !inside(await fs.realpath(profile), await fs.realpath(root))) throw Error('Der Projektspeicher darf keine Verknüpfung sein.');
  }
  async function read(name) {
    const target = path.join(root, name); const stat = await fs.lstat(target);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > MAX_STORE) throw Error('Ungültiger Projektspeicher.');
    return JSON.parse(await fs.readFile(target, 'utf8'));
  }
  async function head() {
    let value;
    try { value = await read('head.json'); } catch (e) { if (e.code === 'ENOENT') return null; throw e; }
    if (value.schema !== 1 || !/^[ab]$/.test(value.slot)) throw Error('Unbekannte Speicherversion bleibt erhalten.');
    return value;
  }
  async function write(name, text) {
    const tmp = path.join(root, `${name}.${randomUUID()}.tmp`);
    try { await fs.writeFile(tmp, text, { flag: 'wx', encoding: 'utf8' }); await fs.rename(tmp, path.join(root, name)); }
    finally { await fs.unlink(tmp).catch((e) => { if (e.code !== 'ENOENT') throw e; }); }
  }
  return {
    async load() {
      await ensureRoot(); const h = await head(); if (!h) return null;
      const value = await read(`${h.slot}.json`);
      if (value.schema !== 1 || !value.projects || typeof value.projects !== 'object') throw Error('Unbekannter Kursstand bleibt erhalten.');
      return value;
    },
    save(value) {
      const task = queue.catch(() => {}).then(async () => {
        if (!value || value.schema !== 1 || !value.projects || typeof value.projects !== 'object' || Array.isArray(value.projects)) throw Error('Ungültiger Kursstand.');
        const text = JSON.stringify(value);
        if (Buffer.byteLength(text) > MAX_STORE) throw Error('Entwürfe größer als 32 MiB. Bitte Projekte exportieren.');
        await ensureRoot(); const h = await head(); const slot = h?.slot === 'a' ? 'b' : 'a';
        await write(`${slot}.json`, text); await write('head.json', JSON.stringify({ schema: 1, slot }));
      }); queue = task; return task;
    },
  };
}
function createAiPreferences(profile) {
  const store = createStore(profile, 'ai-settings-v1');
  function validate(value) {
    if (value?.version === 2 && ['none', 'qwen', 'chatgpt'].includes(value.provider) && typeof value.qwenModel === 'string' && /^qwen[a-z0-9._-]*:[a-z0-9._-]{1,48}$/i.test(value.qwenModel) && !/cloud/i.test(value.qwenModel) && typeof value.chatgptModel === 'string' && /^(?:[a-zA-Z0-9._:-]{1,80})?$/.test(value.chatgptModel)) return { version: 2, provider: value.provider, qwenModel: value.qwenModel, chatgptModel: value.chatgptModel };
    if (!value || value.version !== 1 || typeof value.enabled !== 'boolean' || typeof value.model !== 'string' || !/^qwen[a-z0-9._-]*:[a-z0-9._-]{1,48}$/i.test(value.model) || /cloud/i.test(value.model)) throw Error('Ungültige lokale KI-Einstellungen.');
    return { version: 1, enabled: value.enabled, model: value.model };
  }
  return {
    async load() { const saved = await store.load(); return saved ? validate(saved.projects.preferences) : null; },
    save(value) { return store.save({ schema: 1, projects: { preferences: validate(value) } }); },
  };
}
function validSender(event, window, origin) {
  try { return Boolean(window && !window.isDestroyed() && event.sender === window.webContents && event.senderFrame === window.webContents.mainFrame && new URL(event.senderFrame.url).origin === origin); }
  catch { return false; }
}
module.exports = { readProject, createStore, createAiPreferences, validSender, LIMITS, MAX_STORE };
