const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { readProject, createStore, createAiPreferences, validSender, MAX_STORE } = require('../pilot-runtime.cjs');

async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'azubiprep-desktop-test-'));
  t.after(async () => {
    const resolved = path.resolve(root);
    assert.equal(path.dirname(resolved), path.resolve(os.tmpdir()));
    assert.ok(path.basename(resolved).startsWith('azubiprep-desktop-test-'));
    await fs.rm(resolved, { recursive: true, force: true });
  });
  return root;
}
test('Native Auswahl liest nur freigegebene unterstützte Dateien und erhält relative Pfade', async (t) => {
  const root = await fixture(t); const project = path.join(root, 'projekt');
  await fs.mkdir(path.join(project, 'seiten'), { recursive: true }); await fs.mkdir(path.join(project, 'css'));
  await fs.mkdir(path.join(project, '.git')); await fs.writeFile(path.join(project, '.git', 'privat.html'), 'nicht übernehmen');
  await fs.writeFile(path.join(project, 'index.html'), '<h1>Start</h1>');
  await fs.writeFile(path.join(project, 'seiten', 'zweite seite.html'), '<h1>Zweite</h1>');
  await fs.writeFile(path.join(project, 'css', 'style.css'), 'h1{color:navy}');
  await fs.writeFile(path.join(project, '.env'), 'privat'); await fs.writeFile(path.join(project, 'start.js'), 'keine Ausführung');
  const result = await readProject([project], 'folder');
  assert.deepEqual(Object.keys(result.files).sort(), ['css/style.css', 'index.html', 'seiten/zweite seite.html']);
  assert.equal(result.skipped, 3);
  const partial = await readProject([path.join(project, 'css', 'style.css')], 'files');
  assert.equal(partial.files['style.css'].content, 'h1{color:navy}');
  assert.equal(await fs.readFile(path.join(project, '.env'), 'utf8'), 'privat');
});
test('Windows-Junctions und ihre Unterordner sind keine Importfreigabe', async (t) => {
  const root = await fixture(t); const project = path.join(root, 'projekt'); const outside = path.join(root, 'ausserhalb');
  await fs.mkdir(project); await fs.mkdir(path.join(outside, 'unterordner'), { recursive: true });
  await fs.writeFile(path.join(outside, 'unterordner', 'privat.html'), 'UNVERÄNDERTER PRIVATER INHALT');
  const link = path.join(project, 'verknuepfung'); await fs.symlink(outside, link, 'junction');
  await assert.rejects(readProject([project], 'folder'), /verknüpfung|Verknüpfung/);
  await assert.rejects(readProject([link], 'folder'), /verknüpfung/i);
  await assert.rejects(readProject([path.join(link, 'unterordner')], 'folder'), /verknüpfung/i);
  assert.equal(await fs.readFile(path.join(outside, 'unterordner', 'privat.html'), 'utf8'), 'UNVERÄNDERTER PRIVATER INHALT');
});
test('Dateisymlinks werden vor dem Lesen abgewiesen', async (t) => {
  const root = await fixture(t); const project = path.join(root, 'projekt'); await fs.mkdir(project);
  const target = path.join(root, 'privat.html'); await fs.writeFile(target, 'NICHT IMPORTIEREN');
  const link = path.join(project, 'alias.html');
  const original = fs.lstat;
  try {
    try { await fs.symlink(target, link, 'file'); }
    catch (error) {
      if (error.code !== 'EPERM') throw error;
      t.diagnostic('Windows erlaubt diesem Konto keine Dateisymlink-Erstellung; Dateilink-Erkennung mit lstat-Mock, Junctions separat real geprüft.');
      await fs.writeFile(link, 'Dateilink-Testobjekt');
      fs.lstat = async (name, ...args) => path.resolve(name) === link ? { isSymbolicLink: () => true } : original(name, ...args);
    }
    await assert.rejects(readProject([project], 'folder'), /verknüpfung/i);
    await assert.rejects(readProject([link], 'files'), /verknüpfung/i);
    assert.equal(await fs.readFile(target, 'utf8'), 'NICHT IMPORTIEREN');
  } finally { fs.lstat = original; }
});
test('Private Wurzeln, ungültige Namen und Größenbegrenzungen werden durchgesetzt', async (t) => {
  const root = await fixture(t); const project = path.join(root, 'projekt'); await fs.mkdir(project);
  const privateRoot = path.join(root, 'local-rag'); await fs.mkdir(privateRoot); await fs.writeFile(path.join(privateRoot, 'index.html'), 'privat');
  await assert.rejects(readProject([privateRoot], 'folder'), /Private/);
  await fs.writeFile(path.join(project, '%2e%2e.html'), 'nicht lesen');
  await assert.rejects(readProject([project], 'folder'), /Dateipfad/);
  await fs.unlink(path.join(project, '%2e%2e.html'));
  await fs.writeFile(path.join(project, 'index.html'), 'x'.repeat(128 * 1024));
  assert.equal((await readProject([project], 'folder')).files['index.html'].content.length, 128 * 1024);
  await fs.appendFile(path.join(project, 'index.html'), 'x');
  await assert.rejects(readProject([project], 'folder'), /zu groß/);
});
test('Desktop-Projektspeicher überlebt neue Instanz und erhält den letzten bestätigten Stand', async (t) => {
  const root = await fixture(t); const first = createStore(root);
  assert.equal(await first.load(), null);
  const value = { schema: 1, projects: { beispiel: { files: { 'index.html': { kind: 'text', content: '<h1>Gesichert</h1>' } } } } };
  await first.save(value); assert.deepEqual(await createStore(root).load(), value);
  await assert.rejects(first.save({ schema: 1, projects: {}, large: 'x'.repeat(MAX_STORE) }), /32 MiB/);
  assert.deepEqual(await first.load(), value);
  const rename = fs.rename;
  try {
    fs.rename = async (from, to) => {
      if (path.basename(to) === 'head.json') throw Object.assign(new Error('HEAD-Schreibfehler'), { code: 'EACCES' });
      return rename(from, to);
    };
    await assert.rejects(first.save({ schema: 1, projects: { anderer: {} } }), /HEAD-Schreibfehler/);
    assert.deepEqual(await createStore(root).load(), value);
  } finally { fs.rename = rename; }
  assert.equal((await fs.readdir(path.join(root, 'frontendpilot-v1'))).some(name => name.endsWith('.tmp')), false);
  const head = path.join(root, 'frontendpilot-v1', 'head.json'); await fs.writeFile(head, JSON.stringify({ schema: 99, slot: 'a' }));
  await assert.rejects(first.save(value), /Speicherversion/);
  assert.equal(JSON.parse(await fs.readFile(head, 'utf8')).schema, 99);
});
test('IPC erlaubt ausschließlich das Hauptfenster, dessen Hauptframe und aktuelle Herkunft', () => {
  const frame = { url: 'http://127.0.0.1:12345/frontendkurs' }; const contents = { mainFrame: frame }; const window = { webContents: contents, isDestroyed: () => false };
  assert.equal(validSender({ sender: contents, senderFrame: frame }, window, 'http://127.0.0.1:12345'), true);
  assert.equal(validSender({ sender: contents, senderFrame: { ...frame } }, window, 'http://127.0.0.1:12345'), false);
  assert.equal(validSender({ sender: {}, senderFrame: frame }, window, 'http://127.0.0.1:12345'), false);
  assert.equal(validSender({ sender: contents, senderFrame: frame }, window, 'http://127.0.0.1:9999'), false);
  assert.equal(validSender({}, window, 'http://127.0.0.1:12345'), false);
});

test('KI-Präferenzen bleiben im eigenen Profilstand und akzeptieren keine fremden Pfade oder Cloudmodelle', async (t) => {
  const root = await fixture(t); const preferences = createAiPreferences(root);
  assert.equal(await preferences.load(), null);
  const value = { version: 1, enabled: true, model: 'qwen3:4b' };
  await preferences.save(value);
  assert.deepEqual(await createAiPreferences(root).load(), value);
  assert.throws(() => preferences.save({ ...value, model: 'qwen3:cloud' }), /Ungültige/);
  assert.throws(() => preferences.save({ ...value, model: '../../local-rag/material/x.pdf' }), /Ungültige/);
  assert.equal(await createStore(root).load(), null);
});
