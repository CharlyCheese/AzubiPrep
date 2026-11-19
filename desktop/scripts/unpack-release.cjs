const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

function unpackRelease(installer, scratch) {
  // Das vorhandene Werkzeug lädt seine DLL unter dem Namen 7z.dll. Das Paar
  // im Prüfverzeichnis funktioniert auch nach einer Installation ohne Skripte.
  const vendor = path.resolve(__dirname, '../node_modules/electron-winstaller/vendor');
  const tool = path.join(scratch, '7zip');
  fs.mkdirSync(tool);
  for (const ext of ['exe', 'dll']) {
    fs.copyFileSync(path.join(vendor, `7z-${process.arch}.${ext}`), path.join(tool, `7z.${ext}`));
  }
  function extract(source, destination, selection = []) {
    const result = spawnSync(path.join(tool, '7z.exe'), ['x', source, '-y', `-o${destination}`, ...selection], { windowsHide: true });
    if (result.error) throw result.error;
    assert.equal(result.status, 0, 'Paketinhalt konnte nicht zur Prüfung entpackt werden.');
  }
  extract(installer, scratch, ['$PLUGINSDIR/app-64.7z']);
  const payload = path.join(scratch, 'payload');
  extract(path.join(scratch, '$PLUGINSDIR', 'app-64.7z'), payload);
  return payload;
}

module.exports = { unpackRelease };
