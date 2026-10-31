const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { prepareElectron } = require('../scripts/prepare-electron.cjs');

function fixture(install, check) {
  const temporary = fs.realpathSync(os.tmpdir());
  const root = fs.mkdtempSync(path.join(temporary, 'azubiprep-electron-setup-'));
  try {
    fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ version: '1.2.3' }));
    fs.writeFileSync(path.join(root, 'install.js'), `const fs = require('node:fs'); const path = require('node:path');\n${install}`);
    check(root);
  } finally {
    assert.equal(path.dirname(path.resolve(root)), temporary);
    assert.ok(path.basename(root).startsWith('azubiprep-electron-setup-'));
    assert.ok(!fs.lstatSync(root).isSymbolicLink());
    fs.rmSync(root, { recursive: true, force: true });
  }
}
const metadata = `fs.mkdirSync(path.join(__dirname, 'dist'));
fs.writeFileSync(path.join(__dirname, 'path.txt'), 'electron.exe');
fs.writeFileSync(path.join(__dirname, 'dist/version'), '1.2.3');`;

test('Frischer npm-Paketstand ohne dist wird vor direktem EXE-Start vorbereitet', () => {
  fixture(metadata + "\nfs.writeFileSync(path.join(__dirname, 'dist/electron.exe'), 'SYNTHETISCHE PRUEFDATEI');", root => {
    assert.ok(!fs.existsSync(path.join(root, 'dist')));
    const result = prepareElectron({ root, log() {} });
    assert.equal(result.version, '1.2.3');
    assert.equal(fs.readFileSync(result.executable, 'utf8'), 'SYNTHETISCHE PRUEFDATEI');
  });
});

test('Fehlgeschlagene Laufzeitvorbereitung wird nicht als Erfolg ausgegeben', () => {
  fixture('', root => assert.throws(() => prepareElectron({ root, run: () => ({ status: 7 }), log() {} }), /konnte nicht vorbereitet/));
});

test('Erfolgreicher Installerprozess ohne EXE reicht nicht aus', () => {
  fixture(metadata, root => assert.throws(() => prepareElectron({ root, log() {} }), /Laufzeitdatei fehlt/));
});

test('Abweichende Laufzeitversion wird vor Fachtests zurückgewiesen', () => {
  fixture(metadata + "\nfs.writeFileSync(path.join(__dirname, 'dist/electron.exe'), 'TEST'); fs.writeFileSync(path.join(__dirname, 'dist/version'), '9.9.9');", root => {
    assert.throws(() => prepareElectron({ root, log() {} }), /Version passt nicht/);
  });
});

test('Pfadmetadaten dürfen keine fremde Datei zur angeblichen Laufzeit machen', () => {
  fixture("fs.writeFileSync(path.join(__dirname, 'path.txt'), '../fremde-datei.exe');", root => {
    assert.throws(() => prepareElectron({ root, log() {} }), /außerhalb der Paketablage/);
  });
});
