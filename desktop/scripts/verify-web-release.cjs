const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { unpackRelease } = require('./unpack-release.cjs');
const asar = require('@electron/asar');
const pkg = require('../package.json');
const config = require('../web-builder.json');
const { assertDistribution } = require('./check-distribution.cjs');

// Nur eigene erzeugte Pakete prüfen; private Originalablagen bleiben unberührt.
assert.equal(process.argv.length, 2, 'Die Prüfung akzeptiert keine fremden Zielpfade.');
assertDistribution(config);
const repo = path.resolve(__dirname, '../..');
const installerRoot = path.join(repo, 'Installer-Web');
assert.equal(path.resolve(__dirname, '..', config.directories.output), installerRoot, 'Webausgabe liegt nicht im freigegebenen Buildordner.');
assert.ok(!fs.lstatSync(installerRoot).isSymbolicLink(), 'Installerordner darf keine Verknüpfung sein.');
const release = path.join(installerRoot, 'win-unpacked');
const resources = path.join(release, 'resources');
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
  walk(root);
  return result.sort();
}
const releaseFiles = files(release);
const archive = path.join(resources, 'app.asar');
const archiveFiles = asar.listPackage(archive).map(normal).sort();
assert.ok(archiveFiles.every(name => !forbidden.test(name)), 'ASAR enthält eine ausgeschlossene private Dateiklasse.');
assert.deepEqual(archiveFiles, ['package.json', 'web-main.cjs', 'web-runtime.cjs'], 'Webarchiv enthält andere App-Dateien.');
const archivedPackage = JSON.parse(asar.extractFile(archive, 'package.json').toString('utf8'));
assert.equal(archivedPackage.version, pkg.version, 'Gebaute Version weicht vom Quellstand ab.');
assert.equal(archivedPackage.main, 'web-main.cjs');
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
let compared = 0;
for (const name of ['web-main.cjs', 'web-runtime.cjs']) {
  assert.ok(asar.extractFile(archive, name).equals(fs.readFileSync(path.join(repo, 'desktop', name))), 'Archivierter App-Code weicht ab.');
  compared++;
}
for (const relativeRoot of ['content', 'frontend/dist', 'backend/src']) {
  const source = path.join(repo, relativeRoot);
  const packaged = path.join(resources, relativeRoot);
  const sourceFiles = files(source);
  assert.deepEqual(files(packaged), sourceFiles, 'Öffentliche Paketdateien weichen vom Quellstand ab.');
  for (const file of sourceFiles) {
    assert.equal(hash(path.join(packaged, file)), hash(path.join(source, file)), 'Öffentlicher Paketinhalt weicht vom Quellstand ab.');
    compared++;
  }
}
assert.equal(hash(path.join(resources, 'backend/package.json')), hash(path.join(repo, 'backend/package.json')), 'Backendmetadaten weichen vom Quellstand ab.');
compared++;
const backendPackage = JSON.parse(fs.readFileSync(path.join(resources, 'backend/package.json'), 'utf8'));
for (const dependency of Object.keys(backendPackage.dependencies || {})) {
  assert.ok(fs.existsSync(path.join(resources, 'backend/node_modules', dependency, 'package.json')), 'Eine benötigte Backendbibliothek fehlt im Webpaket.');
}
assert.ok(fs.existsSync(path.join(release, 'AzubiPrep Web.exe')), 'Gebaute Webanwendung fehlt.');
const releaseHashes = new Map(releaseFiles.map(file => [file, hash(path.join(release, file))]));
for (const name of [`AzubiPrep-Web-Setup-${pkg.version}.exe`, `AzubiPrep-Web-${pkg.version}-portabel.exe`]) {
  const installer = path.join(installerRoot, name);
  assert.ok(fs.existsSync(installer), 'Web-Setup oder Portable fehlt.');
  assert.ok(!fs.lstatSync(installer).isSymbolicLink(), 'Paket darf keine Verknüpfung sein.');
  const scratch = fs.mkdtempSync(path.join(installerRoot, 'verify-'));
  try {
    const payloadRoot = unpackRelease(installer, scratch);
    assert.deepEqual(files(payloadRoot), releaseFiles, 'Webpaket enthält andere Anwendungsdateien.');
    for (const file of releaseFiles) {
      assert.equal(hash(path.join(payloadRoot, file)), releaseHashes.get(file), 'Webpaketinhalt weicht vom geprüften Anwendungsstand ab.');
    }
  } finally {
    const resolved = path.resolve(scratch);
    assert.equal(path.dirname(resolved), installerRoot, 'Aufräumpfad liegt außerhalb des Installerordners.');
    assert.ok(path.basename(resolved).startsWith('verify-') && !fs.lstatSync(resolved).isSymbolicLink(), 'Aufräumpfad ist kein eigener temporärer Prüfbestand.');
    fs.rmSync(resolved, { recursive: true, force: true });
  }
}
console.log(`Web ${pkg.version}: ${releaseFiles.length} Paketdateien und ${archiveFiles.length} Archiveinträge geprüft; ${compared} öffentliche Dateien identisch. Setup und Portable enthalten denselben geprüften Build. Keine ausgeschlossenen Dateiklassen gefunden.`);
