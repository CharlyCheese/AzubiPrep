import { test, expect, _electron } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { unterdrueckeOnboardingPopups, openDebugger } from './helpers.js';

// Nur nach Paketbau und Inhaltsprüfung ausdrücklich starten. Die Webprobe
// prüft Paketlaufzeit + Browser; sie installiert nichts und öffnet keinen Tray.
test.describe.configure({ mode: 'serial', timeout: 120_000 });
test.skip(process.platform !== 'win32' || process.env.DEBUGGER_RELEASE_TESTS !== '1', 'Lokale Windows-Paketabnahme ausdrücklich aktivieren.');
test.use({ serviceWorkers: 'block' });

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const resultRoot = path.join(repo, 'e2e/test-results');
const region = page => page.getByRole('region', { name: 'Debugger-Technikpilot', exact: true });
const status = page => region(page).getByLabel('Debugstatus', { exact: true });
const output = page => region(page).getByLabel('Debugkonsole', { exact: true });
const button = (page, name) => region(page).getByRole('button', { name, exact: true });

function testProfile(info) {
  const profile = path.resolve(info.outputPath('synthetisches-profil'));
  expect(profile.startsWith(resultRoot + path.sep)).toBe(true);
  for (let current = profile; current !== repo; current = path.dirname(current)) {
    if (fs.existsSync(current)) expect(fs.lstatSync(current).isSymbolicLink(), 'Testprofil darf keine Verknüpfungen verwenden.').toBe(false);
  }
  const paths = Object.fromEntries(['cwd', 'appdata', 'localappdata', 'temp', 'local-ai', 'local-rag'].map(name => [name, path.join(profile, name)]));
  for (const directory of Object.values(paths)) fs.mkdirSync(directory, { recursive: true });
  const env = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (/^(SystemRoot|WINDIR|PATH|PATHEXT|COMSPEC|SYSTEMDRIVE|NUMBER_OF_PROCESSORS|PROCESSOR_ARCHITECTURE)$/i.test(key)) env[key] = value;
  }
  Object.assign(env, {
    USERPROFILE: profile, APPDATA: paths.appdata, LOCALAPPDATA: paths.localappdata,
    TEMP: paths.temp, TMP: paths.temp, DATABASE_URL: '', JWT_SECRET: '', ADMIN_TOKEN: '',
    VAPID_PUBLIC_KEY: '', VAPID_PRIVATE_KEY: '', VAPID_SUBJECT: '', AI_ENABLED: 'false',
    AZUBIPREP_KI_ENABLED: 'false', AZUBIPREP_CHATGPT_ENABLED: 'false',
    AZUBIPREP_AI_DIR: paths['local-ai'], AZUBIPREP_RAG_DIR: paths['local-rag'],
  });
  return { profile, cwd: paths.cwd, env };
}

function packageFiles(kind) {
  const web = kind === 'web';
  const root = path.join(repo, web ? 'Installer-Web' : 'Installer', 'win-unpacked');
  const resources = path.join(root, 'resources');
  const executablePath = path.join(root, web ? 'AzubiPrep Web.exe' : 'AzubiPrep.exe');
  expect(fs.existsSync(executablePath), 'Das aktuelle Windows-Paket muss vorher gebaut werden.').toBe(true);
  for (const directory of [path.dirname(root), root, resources]) expect(fs.lstatSync(directory).isSymbolicLink()).toBe(false);
  const requireDesktop = createRequire(path.join(repo, 'desktop/package.json'));
  const asar = requireDesktop('@electron/asar');
  const archive = path.join(resources, 'app.asar');
  for (const file of [executablePath, archive]) expect(fs.lstatSync(file).isSymbolicLink()).toBe(false);
  const packaged = JSON.parse(asar.extractFile(archive, 'package.json').toString('utf8'));
  expect(packaged.version).toBe(requireDesktop('./package.json').version);
  expect(packaged.main).toBe(web ? 'web-main.cjs' : 'main.js');
  return { resources, executablePath, archive, asar };
}

async function checkHealth(page, origin) {
  const response = await page.request.get(`${origin}/api/health`);
  expect(response.ok()).toBe(true);
  const health = await response.json();
  expect(health.status).toBe('ok');
  expect(health.fragenAnzahl).toBeGreaterThanOrEqual(7000);
}

async function resume(page) {
  const pause = await status(page).getAttribute('data-pause-id');
  await button(page, 'Weiter / bis zum nächsten Haltepunkt').click();
  await expect.poll(async () => await status(page).getAttribute('data-phase') !== 'paused' || await status(page).getAttribute('data-pause-id') !== pause).toBe(true);
}

async function drain(page, target) {
  for (let step = 0; step < 45; step++) {
    await expect.poll(async () => ['paused', target, 'error', 'stopped'].includes(await status(page).getAttribute('data-phase'))).toBe(true);
    const phase = await status(page).getAttribute('data-phase');
    if (phase === target) return;
    if (phase !== 'paused') {
      const errors = await region(page).getByLabel('Debugfehler', { exact: true }).allTextContents();
      throw Error(errors.join('\n') || 'Debuglauf abgebrochen.');
    }
    await resume(page);
  }
  throw Error('Paket-Debugger erreicht den erwarteten Abschluss nicht.');
}

async function checkExamples(page, origin) {
  await checkHealth(page, origin);
  await unterdrueckeOnboardingPopups(page);
  await page.goto(`${origin}/frontendkurs/debugger`);
  await openDebugger(page);
  const accept = dialog => dialog.accept();
  page.on('dialog', accept);
  try {
    await button(page, 'React-Beispiel laden').click();
    await expect(region(page).getByLabel('Debugmodus', { exact: true })).toHaveValue('react');
    await button(page, 'Debuggen starten').click();
    await drain(page, 'idle');
    const preview = region(page).locator('.debug-dom-preview');
    await expect(preview.getByRole('heading', { name: 'Mein React-Zähler', exact: true })).toBeVisible();
    await expect(output(page)).toHaveText('Effekt für Stand 0');
    await preview.getByRole('button', { name: 'Eins dazu', exact: true }).click();
    await drain(page, 'idle');
    await expect(preview.locator('p')).toHaveText('Hallo ! Stand: 1');
    await expect(output(page)).toHaveText('Effekt für Stand 0\nAufräumen für Stand 0\nEffekt für Stand 1');
    await button(page, 'Debuggen stoppen').click();
    await expect.poll(() => page.workers().length).toBe(0);

    await button(page, 'TypeScript-Beispiel laden').click();
    await expect(region(page).getByLabel('Modulstartdatei', { exact: true })).toHaveValue('main.ts');
    await button(page, 'Debuggen starten').click();
    await expect(status(page)).toHaveAttribute('data-phase', 'paused');
    await expect(status(page)).toContainText('main.ts:4:');
    await drain(page, 'done');
    await expect(output(page)).toHaveText('Tastatur 29.75');
    await expect.poll(() => page.workers().length).toBe(0);
  } finally { page.off('dialog', accept); }
}

async function freeLoopbackPort() {
  const probe = net.createServer();
  return new Promise((resolve, reject) => {
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const port = probe.address().port;
      probe.close(error => error ? reject(error) : resolve(port));
    });
  });
}

function launchWebRuntime(files, profile, port) {
  const runtime = files.asar.extractFile(files.archive, 'web-runtime.cjs');
  expect(runtime.equals(fs.readFileSync(path.join(repo, 'desktop/web-runtime.cjs'))), 'Paketlaufzeit muss dem freigegebenen Quellstand entsprechen.').toBe(true);
  const fallback = path.join(profile.cwd, 'verified-web-runtime.cjs');
  fs.writeFileSync(fallback, runtime);
  expect(fs.readFileSync(fallback).equals(runtime)).toBe(true);
  // Electron im Node-Modus unterstützt je nach Laufzeit keine ASAR-Auflösung.
  // Dann wird ausschließlich die bytegleiche geprüfte Paketdatei verwendet;
  // Backend, Bibliotheken, Inhalt und Oberfläche kommen weiterhin aus resources.
  const bootstrap = `
    const path = require('node:path');
    const root = process.env.AZUBIPREP_RELEASE_RESOURCES;
    let runtime; let mode = 'asar';
    try { runtime = require(path.join(root, 'app.asar', 'web-runtime.cjs')); }
    catch (error) {
      if (!['MODULE_NOT_FOUND', 'ENOENT', 'ENOTDIR'].includes(error.code)) throw error;
      runtime = require(process.env.AZUBIPREP_RELEASE_RUNTIME_COPY); mode = 'verified-copy';
    }
    runtime.startWebBackend(root).then(({ url, server }) => {
      const stop = () => { server.close(() => process.exit(0)); server.closeAllConnections(); };
      process.stdin.setEncoding('utf8'); process.stdin.on('data', stop); process.stdin.on('end', stop); process.stdin.resume();
      console.log('RELEASE_RUNTIME=' + mode); console.log('RELEASE_URL=' + url);
    }).catch(error => { console.error(error.stack); process.exit(1); });
  `;
  const child = spawn(files.executablePath, ['-e', bootstrap], {
    cwd: profile.cwd, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...profile.env, ELECTRON_RUN_AS_NODE: '1', AZUBIPREP_WEB_PORT: String(port),
      AZUBIPREP_RELEASE_RESOURCES: files.resources, AZUBIPREP_RELEASE_RUNTIME_COPY: fallback },
  });
  child.stdin.on('error', () => {});
  let log = '';
  const ready = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(Error(`Webpaket wurde nicht bereit.\n${log}`)), 30_000);
    const fail = error => { clearTimeout(timer); reject(error); };
    child.once('error', fail);
    child.once('exit', (code, signal) => fail(Error(`Webpaket endete vor Bereitschaft (${code ?? signal}).\n${log}`)));
    child.stdout.on('data', data => {
      log = (log + data.toString()).slice(-32_768);
      const match = log.match(/^RELEASE_URL=(http:\/\/127\.0\.0\.1:\d+)\r?$/m);
      if (match) { clearTimeout(timer); resolve(match[1]); }
    });
    child.stderr.on('data', data => { log = (log + data.toString()).slice(-32_768); });
  });
  return { child, ready, log: () => log };
}

async function stopChild(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null || !child.pid) return;
  const stopped = new Promise(resolve => child.once('exit', resolve));
  if (!child.stdin.destroyed) child.stdin.end('release-stop\n');
  let timer;
  try {
    await Promise.race([stopped, new Promise(resolve => { timer = setTimeout(resolve, 5000); })]);
    if (child.exitCode === null && child.signalCode === null) {
      child.kill();
      clearTimeout(timer);
      await Promise.race([stopped, new Promise((resolve, reject) => {
        timer = setTimeout(() => reject(Error('Web-Paketprozess konnte nicht beendet werden.')), 5000);
      })]);
    }
  } finally { clearTimeout(timer); }
}

test('Release: Desktop-Paket startet React und TypeScript @desktop', async ({}, info) => {
  const files = packageFiles('desktop');
  const profile = testProfile(info);
  let app, child;
  try {
    app = await _electron.launch({ executablePath: files.executablePath,
      args: [`--user-data-dir=${profile.profile}`], cwd: profile.cwd, env: profile.env });
    child = app.process();
    const page = await app.firstWindow();
    await page.waitForURL(/^http:\/\/127\.0\.0\.1:/);
    await checkExamples(page, new URL(page.url()).origin);
  } finally {
    if (app) {
      try { await app.close(); }
      finally { if (child?.exitCode === null && child?.signalCode === null) child.kill(); }
    }
  }
});

test('Release: Web-Paketlaufzeit und frischer Browser führen React und TypeScript aus', async ({ browser }, info) => {
  const files = packageFiles('web');
  const profile = testProfile(info);
  const runtime = launchWebRuntime(files, profile, await freeLoopbackPort());
  let context;
  try {
    const origin = await runtime.ready;
    context = await browser.newContext({ serviceWorkers: 'block' });
    const page = await context.newPage();
    await checkExamples(page, origin);
  } finally {
    try { await context?.close(); }
    finally {
      await stopChild(runtime.child);
      await info.attach('web-paketlaufzeit', { body: runtime.log(), contentType: 'text/plain' });
    }
  }
});
