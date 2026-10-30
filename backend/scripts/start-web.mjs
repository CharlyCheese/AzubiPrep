import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createInterface } from 'node:readline';
import { fileURLToPath, pathToFileURL } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export function browserUrl(host, port) {
  const localHost = ['0.0.0.0', '::'].includes(host) ? '127.0.0.1' : host;
  return `http://${localHost.includes(':') ? `[${localHost}]` : localHost}:${port}`;
}

function newestFile(target) {
  if (!fs.existsSync(target)) return 0;
  const info = fs.statSync(target);
  if (!info.isDirectory()) return info.mtimeMs;
  return Math.max(info.mtimeMs, ...fs.readdirSync(target).map((name) => newestFile(path.join(target, name))));
}

export function needsBuild(frontend, output) {
  const index = path.join(output, 'index.html');
  if (!fs.existsSync(index)) return true;
  const inputTime = Math.max(fs.statSync(frontend).mtimeMs, ...[
    'src', 'public', 'index.html', 'vite.config.js', 'package.json', 'package-lock.json',
    '.env', '.env.local', '.env.production', '.env.production.local',
  ].map((name) => newestFile(path.join(frontend, name))));
  return inputTime > fs.statSync(index).mtimeMs;
}

async function run(command, args, options = {}) {
  const child = spawn(command, args, { windowsHide: true, ...options });
  const [code] = await once(child, 'exit');
  if (code !== 0) throw new Error('Der Vorbereitungsschritt konnte nicht abgeschlossen werden.');
}

export async function isWebRunning(url) {
  try {
    const response = await fetch(`${url}/api/health`, { signal: globalThis.AbortSignal.timeout(2000) });
    if (!response.ok) return false;
    const health = await response.json();
    if (health.status !== 'ok' || !Number.isInteger(health.fragenAnzahl)
      || !Number.isInteger(health.modulAnzahl) || !Number.isInteger(health.fachrichtungAnzahl)) return false;
    const page = await fetch(url, { signal: globalThis.AbortSignal.timeout(2000) });
    return page.ok && (page.headers.get('content-type') || '').includes('text/html');
  } catch {
    return false;
  }
}

async function openBrowser(url) {
  if (process.argv.includes('--no-browser')) return;
  try {
    await run('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command',
      'Start-Process -FilePath $env:AZUBIPREP_BROWSER_URL'], {
      env: { ...process.env, AZUBIPREP_BROWSER_URL: url }, stdio: 'ignore',
    });
  } catch {
    console.log(`Der Browser konnte nicht geöffnet werden. Öffne diese Adresse: ${url}`);
  }
}

async function main() {
  console.log('AzubiPrep wird vorbereitet …');
  if (Number(process.versions.node.split('.')[0]) < 20) {
    throw new Error('Bitte Node.js ab Version 20 installieren und erneut starten.');
  }
  if (!fs.existsSync(path.join(projectRoot, 'backend/node_modules/express/package.json'))) {
    throw new Error('Die einmalige Einrichtung fehlt: Im Ordner backend muss npm ci ausgeführt werden.');
  }
  const { config } = await import('../src/config.js');
  const url = browserUrl(config.host, config.port);
  if (await isWebRunning(url)) {
    console.log(`AzubiPrep läuft bereits: ${url}`);
    await openBrowser(url);
    return;
  }
  const frontend = path.join(projectRoot, 'frontend');
  if (needsBuild(frontend, config.frontendDist)) {
    const vite = path.join(frontend, 'node_modules/vite/bin/vite.js');
    if (!fs.existsSync(vite)) {
      throw new Error('Die Vorbereitung der Weboberfläche fehlt: Im Ordner frontend muss npm ci ausgeführt werden.');
    }
    console.log('Die Weboberfläche wird vorbereitet. Das kann einen Moment dauern …');
    await run(process.execPath, [vite, 'build', '--outDir', config.frontendDist], {
      cwd: frontend, stdio: 'inherit',
    });
  }
  const { startServer } = await import('../src/server.js');
  const { schliessen } = await import('../src/db.js');
  let server;
  try {
    ({ server } = await startServer());
    if (!server.listening) await once(server, 'listening');
  } catch (err) {
    await schliessen();
    if (err.code === 'EADDRINUSE') {
      if (await isWebRunning(url)) {
        await openBrowser(url);
        return;
      }
      throw new Error('Die benötigte Adresse ist bereits belegt. Bitte die andere Anwendung schließen und erneut starten.');
    }
    throw err;
  }
  let input;
  let stopping = false;
  const stop = async () => {
    if (stopping) return;
    stopping = true;
    input?.close();
    await new Promise((resolve) => {
      server.close(resolve);
      server.closeAllConnections();
    });
    await schliessen();
    console.log('AzubiPrep wurde beendet.');
  };
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
  console.log(`AzubiPrep ist bereit: ${url}`);
  console.log('Dieses Startfenster offen lassen. Zum Beenden hier Enter drücken.');
  input = createInterface({ input: process.stdin, output: process.stdout });
  input.once('line', stop);
  await openBrowser(url);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  main().catch((err) => {
    console.error(`AzubiPrep konnte nicht gestartet werden: ${err.message}`);
    process.exitCode = 1;
  });
}
