import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LIMITS, checkPath, resolvePath, checkFiles, importFiles, projectZip, imagePixels } from '../src/pilot/project.js';
const html = { kind: 'text', content: '<h1>Hallo</h1>' };

test('Projektpfade bleiben relativ und erlauben verschachtelte Namen mit Leerzeichen', () => {
  assert.equal(checkPath('seiten/über uns.html'), 'seiten/über uns.html');
  for (const name of ['/tmp/a.html', '../a.html', 'a/../b.html', 'C:/a.html', 'a\\b.html', 'a//b.html', 'a/%2e.html']) assert.throws(() => checkPath(name));
  assert.equal(resolvePath('seiten/info.html', '../css/style.css'), 'css/style.css');
  assert.equal(resolvePath('index.html', '../../private.html'), null);
  assert.equal(resolvePath('index.html', 'http://localhost:11434/'), null);
  assert.equal(resolvePath('index.html', 'seiten/zweite%20seite.html'), 'seiten/zweite seite.html');
  assert.equal(resolvePath('index.html', '%2e%2e/private.html'), null);
  assert.equal(resolvePath('index.html', 'javascript%3aalert(1)'), null);
});
test('Importgrenzen sind einschließlich des Grenzwerts wirksam', () => {
  const files = { 'index.html': { kind: 'text', content: 'a'.repeat(LIMITS.text) } };
  assert.equal(checkFiles(files), files);
  assert.throws(() => checkFiles({ 'index.html': { kind: 'text', content: 'a'.repeat(LIMITS.text + 1) } }));
  const fifty = Object.fromEntries(Array.from({ length: 50 }, (_, i) => [`${i}.html`, html]));
  assert.doesNotThrow(() => checkFiles(fifty));
  assert.throws(() => checkFiles({ ...fifty, '51.html': html }));
  assert.doesNotThrow(() => checkPath('a/'.repeat(8) + 'x.html'));
  assert.throws(() => checkPath('a/'.repeat(9) + 'x.html'));
});
test('Private Daten und aktive Bildformate sind keine Projektressourcen', () => {
  for (const name of ['local-rag/buch.html', 'node_modules/a.html', '.git/a.html', 'x/.env.local/a.html', 'bild.svg', 'code.js']) assert.throws(() => checkFiles({ 'index.html': html, [name]: html }));
  assert.throws(() => checkFiles({ 'index.html': html, 'bild.png': { kind: 'image', content: 'data:image/png;base64,PHNjcmlwdD4=' } }));
});
test('Ordnerimport entfernt nur die gemeinsame Auswahlwurzel und überschreibt keine Duplikate', async () => {
  const file = (name, content = '<h1>Text</h1>') => ({ name: name.split('/').pop(), webkitRelativePath: name, size: content.length, text: async () => content });
  const imported = await importFiles([file('projekt/index.html'), file('projekt/css/style.css', 'h1{color:red}'), file('projekt/.env', 'secret')]);
  assert.deepEqual(Object.keys(imported), ['index.html', 'css/style.css']);
  const names = await importFiles([file('projekt/index.html'), file('projekt/a/style.css', 'h1{color:red}'), file('projekt/b/style.css', 'p{color:navy}')]);
  assert.equal(names['a/style.css'].content, 'h1{color:red}');
  assert.equal(names['b/style.css'].content, 'p{color:navy}');
  await assert.rejects(() => importFiles([file('projekt/index.html'), file('projekt/index.html')]), /Doppelter Pfad/);
});
test('ZIP-Export enthält lokale Pfade und UTF-8 Namen ohne Projektmetadaten', async () => {
  const zip = new Uint8Array(await projectZip({ 'index.html': html, 'seiten/über uns.html': html }).arrayBuffer());
  assert.equal(new DataView(zip.buffer).getUint32(0, true), 0x04034b50);
  const text = new TextDecoder().decode(zip);
  assert.ok(text.includes('seiten/über uns.html'));
  assert.ok(!text.includes('validatorVersion'));
});
test('Einzeldatei-Import erlaubt Ergänzungen ohne HTML; ausgeschlossene Dateien werden nicht gelesen', async () => {
  const css = { name: 'style.css', size: 13, text: async () => 'h1{color:red}' };
  const partial = await importFiles([css], { partial: true });
  assert.deepEqual(Object.keys(partial), ['style.css']);
  assert.doesNotThrow(() => checkFiles({ 'index.html': html, ...partial }));
  await assert.rejects(() => importFiles([css]), /HTML-Seite/);
  let skipped = 0;
  const forbidden = Array.from({ length: 55 }, (_, i) => ({ name: `${i}.js`, webkitRelativePath: `projekt/node_modules/${i}.js`, size: 500, text: () => { throw Error('Darf nicht gelesen werden'); }, arrayBuffer: () => { throw Error('Darf nicht gelesen werden'); } }));
  const files = await importFiles([{ name: 'index.html', webkitRelativePath: 'projekt/index.html', size: 12, text: async () => '<h1>Ja</h1>' }, ...forbidden], { onSkip: () => skipped++ });
  assert.deepEqual(Object.keys(files), ['index.html']); assert.equal(skipped, 55);
  const many = Array.from({ length: 4999 }, (_, i) => ({ name: `${i}.js`, webkitRelativePath: `projekt/node_modules/${i}.js`, size: 0 }));
  assert.deepEqual(Object.keys(await importFiles([{ name: 'index.html', webkitRelativePath: 'projekt/index.html', size: 1, text: async () => 'x' }, ...many])), ['index.html']);
  await assert.rejects(() => importFiles([...many, many[0], many[1]]), /zu viele Einträge/);
  for (const root of ['local-rag', '.git', 'node_modules']) {
    await assert.rejects(() => importFiles([{ name: 'index.html', webkitRelativePath: `${root}/index.html`, size: 10, text: () => { throw Error('Private Wurzel darf nicht gelesen werden'); } }]), /Keine unterstützten Projektdateien/);
  }
});
test('Bildabmessungen und Einzel-/Gesamtgröße sind begrenzt, bevor die Vorschau Bilder lädt', () => {
  const png = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAKklEQVR4nGPQyNtCU8QwasGoBaMWjFowasGoBaMWjFowasGoBaMWDBULADD+KEyfbA9oAAAAAElFTkSuQmCC'), (c) => c.charCodeAt(0));
  const padded = (size, wide = false) => {
    const bytes = new Uint8Array(size); bytes.set(png);
    if (wide) new DataView(bytes.buffer).setUint32(16, 50000);
    return { kind: 'image', content: 'data:image/png;base64,' + Buffer.from(bytes).toString('base64') };
  };
  assert.throws(() => checkFiles({ 'index.html': html, 'x.png': padded(png.length, true) }), /Bildabmessungen/);
  const dimensions = (width, height) => { const bytes = png.slice(); const view = new DataView(bytes.buffer); view.setUint32(16, width); view.setUint32(20, height); return bytes; };
  assert.equal(imagePixels(dimensions(4096, 1), 'image/png'), 4096);
  assert.throws(() => imagePixels(dimensions(4097, 1), 'image/png'));
  assert.equal(imagePixels(dimensions(4000, 4000), 'image/png'), 16000000);
  assert.throws(() => imagePixels(dimensions(4001, 4000), 'image/png'));
  const big = { kind: 'image', content: 'data:image/png;base64,' + Buffer.from(dimensions(4000, 4000)).toString('base64') };
  assert.doesNotThrow(() => checkFiles({ 'index.html': html, 'big.png': big }));
  assert.throws(() => checkFiles({ 'index.html': html, 'big.png': big, 'small.png': padded(png.length) }), /zusammen 16 Millionen/);
  assert.doesNotThrow(() => checkFiles({ 'index.html': html, 'x.png': padded(LIMITS.file) }));
  assert.throws(() => checkFiles({ 'index.html': html, 'x.png': padded(LIMITS.file + 1) }), /groß|Bild/);
  const full = { 'index.html': html, '0.png': padded(LIMITS.file - html.content.length) };
  for (let i = 1; i < 5; i++) full[`${i}.png`] = padded(LIMITS.file);
  assert.doesNotThrow(() => checkFiles(full));
  assert.throws(() => checkFiles({ ...full, 'more.html': html }), /10 MiB/);
});
