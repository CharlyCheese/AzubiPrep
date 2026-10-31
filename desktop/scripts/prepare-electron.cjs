const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

function prepareElectron({ root = path.dirname(require.resolve('electron/package.json')), run = spawnSync, log = console.log } = {}) {
  const expected = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;
  // Electron 45 lädt beim npm-ci noch keine Laufzeit. Das offizielle Skript
  // verwendet die festgelegte Paketversion, Prüfsummen und seinen Downloadcache.
  const result = run(process.execPath, [path.join(root, 'install.js')], { stdio: 'inherit', windowsHide: true });
  if (result.error || result.status !== 0) throw new Error('Die Electron-Laufzeit konnte nicht vorbereitet werden.');
  const pathFile = path.join(root, 'path.txt');
  if (!fs.existsSync(pathFile)) throw new Error('Der Electron-Laufzeitpfad fehlt nach der Vorbereitung.');
  const relative = fs.readFileSync(pathFile, 'utf8').trim();
  const dist = path.resolve(root, 'dist');
  const executable = path.resolve(dist, relative);
  if (!relative || !executable.startsWith(dist + path.sep)) throw new Error('Der Electron-Laufzeitpfad liegt außerhalb der Paketablage.');
  if (!fs.existsSync(executable) || !fs.statSync(executable).isFile()) throw new Error('Die Electron-Laufzeitdatei fehlt nach der Vorbereitung.');
  const versionFile = path.join(dist, 'version');
  if (!fs.existsSync(versionFile)) throw new Error('Die Electron-Versionsdatei fehlt nach der Vorbereitung.');
  const actual = fs.readFileSync(versionFile, 'utf8').trim().replace(/^v/, '');
  if (actual !== expected) throw new Error('Die vorbereitete Electron-Version passt nicht zum installierten npm-Paket.');
  log(`Electron ${actual} vorbereitet (${process.platform}/${process.arch}); Laufzeitdatei vorhanden.`);
  return { version: actual, executable };
}

if (require.main === module) {
  try { prepareElectron(); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { prepareElectron };
