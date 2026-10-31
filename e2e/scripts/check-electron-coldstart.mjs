import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { _electron } from '@playwright/test';

const require = createRequire(import.meta.url);
const { prepareElectron } = require('../../desktop/scripts/prepare-electron.cjs');
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const desktop = path.join(repo, 'desktop');
const vendor = path.join(desktop, 'node_modules/electron');
const outputs = path.join(repo, 'e2e/test-results');
await fs.mkdir(outputs, { recursive: true });
const root = await fs.mkdtemp(path.join(outputs, 'electron-coldstart-'));
const temporary = await fs.realpath(os.tmpdir());
const profile = await fs.mkdtemp(path.join(temporary, 'azubiprep-coldstart-'));
let app;
try {
  // Nur veröffentlichte npm-Paketdateien kopieren: weder vorhandenes dist noch
  // path.txt übernehmen. Gemeinsame Bibliotheken bleiben in ihrem Paketordner.
  for (const entry of await fs.readdir(vendor, { withFileTypes: true })) {
    if (entry.isFile() && entry.name !== 'path.txt') await fs.copyFile(path.join(vendor, entry.name), path.join(root, entry.name));
  }
  await assert.rejects(fs.access(path.join(root, 'dist')));
  await assert.rejects(fs.access(path.join(root, 'path.txt')));
  console.log('Kalttest: echte Electron-npm-Dateien vorhanden, Laufzeit und Pfadmetadaten fehlen.');
  const prepared = prepareElectron({ root, run(command, args, options) {
    return spawnSync(command, args, { ...options, env: { ...process.env, NODE_PATH: path.join(desktop, 'node_modules') } });
  } });
  const env = { ...process.env, DATABASE_URL: '', AI_ENABLED: 'false', AZUBIPREP_AI_DIR: path.join(profile, 'local-ai'), AZUBIPREP_RAG_DIR: path.join(profile, 'local-rag') };
  delete env.ELECTRON_RUN_AS_NODE;
  app = await _electron.launch({ executablePath: prepared.executable, args: [desktop, `--user-data-dir=${profile}`], env, timeout: 30000 });
  const page = await app.firstWindow();
  await page.waitForURL(/^http:\/\/127\.0\.0\.1:/);
  const health = await (await page.request.get(new URL('/api/health', page.url()).href)).json();
  assert.equal(health.fragenAnzahl, 7000);
  console.log(`Kalttest bestanden: neu vorbereitete Electron-${prepared.version}-Laufzeit startet die App mit 7000 Fragen.`);
} finally {
  if (app) await app.close();
  for (const [target, parent, prefix] of [[root, outputs, 'electron-coldstart-'], [profile, temporary, 'azubiprep-coldstart-']]) {
    assert.equal(path.dirname(path.resolve(target)), parent);
    assert.ok(path.basename(target).startsWith(prefix));
    assert.ok(!(await fs.lstat(target)).isSymbolicLink());
    await fs.rm(target, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
  }
}
