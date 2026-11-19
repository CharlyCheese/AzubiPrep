const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { unpackRelease } = require('./unpack-release.cjs');
const asar = require('@electron/asar');
const pkg = require('../package.json');

// Nur den eigenen erzeugten Build prüfen; niemals private Originalablagen lesen.
const repo = path.resolve(__dirname, '../..');
const release = path.join(repo, 'Installer', 'win-unpacked');
const resources = path.join(release, 'resources');
assert.equal(process.argv.length, 2, 'Die Prüfung akzeptiert keine fremden Zielpfade.');
assert.ok(release.startsWith(path.join(repo, 'Installer') + path.sep));
const forbidden = /(?:^|\/)(?:\.env[^/]*|local-ai|local-rag|accounts\.json|chatgpt-auth\.json|chatgpt-host\.json)(?:\/|$)|\.pdf$/i;
const normal = name => name.replaceAll('\\', '/').replace(/^\/+/, '');
function files(root) {
  assert.ok(!fs.lstatSync(root).isSymbolicLink(), 'Prüfwurzel darf keine Verknüpfung sein.');
  const result = [];
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      assert.ok(!entry.isSymbolicLink(), 'Paket enthält eine nicht freigegebene Verknüpfung.');
      const absolute = path.join(directory, entry.name);
      const relative = normal(path.relative(root, absolute));
      assert.ok(!forbidden.test(relative), 'Paket enthält eine ausgeschlossene private Dateiklasse.');
      if (entry.isDirectory()) walk(absolute);
      else result.push(relative);
    }
  }
  walk(root); return result;
}
const resourceFiles = files(release);
const archive = path.join(resources, 'app.asar');
const archiveFiles = asar.listPackage(archive).map(normal).sort();
assert.ok(archiveFiles.every(name => !forbidden.test(name)), 'ASAR enthält eine ausgeschlossene private Dateiklasse.');
assert.deepEqual(archiveFiles, [...pkg.build.files].sort(), 'Desktoparchiv weicht von der freigegebenen Dateiliste ab.');
const archivedPackage = JSON.parse(asar.extractFile(archive, 'package.json').toString('utf8'));
assert.equal(archivedPackage.version, pkg.version, 'Gebaute Version weicht vom Quellstand ab.');
assert.equal(archivedPackage.main, 'main.js');
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
let compared = 0;
for (const name of archiveFiles.filter(file => file !== 'package.json')) {
  const content = asar.extractFile(archive, name);
  assert.ok(content.equals(fs.readFileSync(path.join(repo, 'desktop', name))), 'Archivierter App-Code weicht ab.'); compared++;
}
for (const relativeRoot of ['content', 'frontend/dist', 'backend/src']) {
  const source = path.join(repo, relativeRoot);
  const sourceFiles = files(source).sort();
  assert.deepEqual(files(path.join(resources, relativeRoot)).sort(), sourceFiles, 'Öffentliche Paketdateien weichen vom Quellstand ab.');
  for (const file of sourceFiles) {
    assert.equal(hash(path.join(resources, relativeRoot, file)), hash(path.join(source, file)), 'Öffentlicher Paketinhalt weicht vom Quellstand ab.'); compared++;
  }
}
assert.equal(hash(path.join(resources, 'backend/package.json')), hash(path.join(repo, 'backend/package.json')), 'Backendmetadaten weichen vom Quellstand ab.');
compared++;
assert.ok(fs.existsSync(path.join(release, 'AzubiPrep.exe')), 'Gebaute Anwendung fehlt.');
const installerRoot = path.join(repo, 'Installer');
assert.ok(!fs.lstatSync(installerRoot).isSymbolicLink(), 'Installerordner darf keine Verknüpfung sein.');
const installer = path.join(installerRoot, `AzubiPrep Setup ${pkg.version}.exe`);
assert.ok(fs.existsSync(installer), 'Installer fehlt.');
const scratch = fs.mkdtempSync(path.join(installerRoot, 'verify-'));
try {
  const payloadRoot = unpackRelease(installer, scratch);
  const payloadFiles = files(payloadRoot);
  assert.deepEqual(payloadFiles.sort(), [...resourceFiles].sort(), 'Installer enthält andere Anwendungsdateien.');
  for (const file of resourceFiles) assert.equal(hash(path.join(payloadRoot, file)), hash(path.join(release, file)), 'Installerinhalt weicht vom geprüften Anwendungsstand ab.');
} finally {
  const resolved = path.resolve(scratch);
  assert.equal(path.dirname(resolved), installerRoot, 'Aufräumpfad liegt außerhalb des Installerordners.');
  assert.ok(path.basename(resolved).startsWith('verify-') && !fs.lstatSync(resolved).isSymbolicLink(), 'Aufräumpfad ist kein eigener temporärer Prüfbestand.');
  fs.rmSync(resolved, { recursive: true, force: true });
}
console.log(`Desktop ${pkg.version}: ${resourceFiles.length} Paketdateien und ${archiveFiles.length} Archiveinträge geprüft; ${compared} öffentliche Dateien identisch. NSIS-Inhalt identisch zum geprüften Build. Keine ausgeschlossenen Dateiklassen gefunden.`);
