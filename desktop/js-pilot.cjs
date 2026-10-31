const { app, BrowserWindow, session } = require('electron');
const { randomUUID } = require('node:crypto');
const { fixture, catalog } = require('./js-pilot-fixtures.cjs');

const LIMITS = Object.freeze({ lines: 80, chars: 2000, totalChars: 32000, memoryGrowthKiB: 16 * 1024, sampleMs: 100, startupMs: 10000 });
const CSP = "default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; worker-src 'none'";
const HTML = `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>JS-Technikpilot</title><style>body{font:18px/1.6 sans-serif;max-width:40rem;margin:2rem auto;padding:1rem;color:#17324d;background:#f5f7fa}button{font:inherit;padding:.5rem 1rem}button:focus-visible{outline:3px solid navy;outline-offset:3px}</style></head><body><h1>Abgetrennte JavaScript-Übung</h1><p>Dieses Fenster führt nur das ausgewählte Testprogramm aus.</p><button id="demo-button" type="button">Text ändern</button><p id="demo-output">Der Ausgangstext bleibt bis zum Klick erhalten.</p></body></html>`;

function createJsPilot(parent, appOrigin, notify) {
  let current = null; let disposed = false;
  const emit = (run, type, data = {}) => {
    if (!parent.isDestroyed() && !parent.webContents.isDestroyed()) notify({ runId: run.id, type, ...data });
  };
  const memory = pid => {
    const metric = app.getAppMetrics().find(item => item.pid === pid);
    const value = metric?.memory?.workingSetSize;
    return Number.isFinite(value) && value > 0 ? value : null;
  };
  function stop(reason = 'manual', id = current?.id) {
    const run = current;
    if (!run || run.id !== id || run.closed) return false;
    run.closed = true; current = null;
    clearTimeout(run.startup); clearTimeout(run.deadline); clearInterval(run.monitor);
    if (!run.window.isDestroyed()) {
      const contents = run.window.webContents;
      // Ein Kill darf niemals einen von der App mitbenutzten Renderer treffen.
      const pid = contents.isDestroyed() ? 0 : contents.getOSProcessId();
      const parentPid = parent.isDestroyed() ? 0 : parent.webContents.getOSProcessId();
      if (pid && run.pid === pid && pid !== parentPid) contents.forcefullyCrashRenderer();
      run.window.destroy();
    }
    run.session.protocol.unhandle('azubi-js-pilot');
    run.session.clearStorageData().catch(() => {});
    run.session.clearCache().catch(() => {});
    emit(run, 'stopped', { reason });
    return true;
  }
  async function launch(run) {
    try {
      await run.window.loadURL(run.url);
      if (run.closed) return;
      const contents = run.window.webContents;
      const pid = contents.getOSProcessId();
      if (!pid || pid === parent.webContents.getOSProcessId()) throw Error('Kein eigener Übungsprozess nachgewiesen.');
      run.pid = pid;
      const baseline = memory(pid);
      if (baseline === null) throw Error('Speicherbeobachtung ist hier nicht verfügbar.');
      clearTimeout(run.startup);
      run.deadline = setTimeout(() => stop('time', run.id), run.program.duration);
      run.monitor = setInterval(() => {
        if (run.closed) return;
        if (parent.isDestroyed() || contents.isDestroyed() || contents.getOSProcessId() !== run.pid || contents.getOSProcessId() === parent.webContents.getOSProcessId()) { stop('isolation', run.id); return; }
        const used = memory(run.pid);
        if (used === null) { stop('monitor', run.id); return; }
        if (used - baseline > LIMITS.memoryGrowthKiB) stop('memory', run.id);
      }, LIMITS.sampleMs);
      run.window.show();
      emit(run, 'ready', { separateProcess: true });
      // Nur fest hinterlegter Code, nie ein String aus IPC/Editor/Import.
      await contents.executeJavaScript(`${run.program.code}\n//# sourceURL=pilot.js`);
    } catch (error) {
      if (run.closed) return;
      emit(run, 'error', { message: String(error.message || 'Testprogramm fehlgeschlagen.').slice(0, LIMITS.chars) });
      stop('error', run.id);
    }
  }
  function start(id) {
    if (disposed || parent.isDestroyed()) throw Error('Der Technikpilot ist nicht mehr verfügbar.');
    const program = fixture(id, appOrigin); // erst prüfen, dann vorhandenen Lauf ersetzen
    stop('restart');
    const isolated = session.fromPartition(`js-pilot-${randomUUID()}`);
    isolated.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
    isolated.setPermissionCheckHandler(() => false);
    isolated.setDevicePermissionHandler(() => false);
    isolated.setDisplayMediaRequestHandler((_request, callback) => callback({}));
    const run = { id: randomUUID(), program, session: isolated, closed: false, pid: 0, count: 0, chars: 0 };
    run.url = `azubi-js-pilot://${run.id}/`;
    isolated.protocol.handle('azubi-js-pilot', request => new Response(!run.closed && request.url === run.url ? HTML : '', {
      status: !run.closed && request.url === run.url ? 200 : 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Content-Security-Policy': CSP, 'Referrer-Policy': 'no-referrer', 'Cache-Control': 'no-store', 'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), usb=(), serial=(), hid=(), display-capture=()' },
    }));
    isolated.webRequest.onBeforeRequest((details, callback) => callback({ cancel: run.closed || details.url !== run.url || details.resourceType !== 'mainFrame' }));
    isolated.on('will-download', event => { event.preventDefault(); emit(run, 'blocked', { kind: 'download' }); });
    run.window = new BrowserWindow({ parent, show: false, width: 900, height: 650, title: 'AzubiPrep – JS-Technikpilot', autoHideMenuBar: true,
      webPreferences: { session: isolated, sandbox: true, contextIsolation: true, nodeIntegration: false, nodeIntegrationInWorker: false, nodeIntegrationInSubFrames: false, webSecurity: true, webviewTag: false, devTools: false, backgroundThrottling: false, spellcheck: false, navigateOnDragDrop: false },
    });
    run.window.setMenu(null);
    const contents = run.window.webContents;
    contents.setAudioMuted(true);
    contents.setWebRTCIPHandlingPolicy('disable_non_proxied_udp');
    contents.setWindowOpenHandler(() => { emit(run, 'blocked', { kind: 'popup' }); return { action: 'deny' }; });
    for (const eventName of ['will-navigate', 'will-frame-navigate', 'will-redirect', 'will-attach-webview']) contents.on(eventName, event => { event.preventDefault(); emit(run, 'blocked', { kind: 'navigation' }); });
    contents.on('console-message', details => {
      if (run.closed) return;
      const message = String(details.message || ''); run.count++; run.chars += message.length;
      if (run.count > LIMITS.lines || message.length > LIMITS.chars || run.chars > LIMITS.totalChars) { stop('output', run.id); return; }
      emit(run, 'console', { message, level: ['info', 'warning', 'error', 'debug'].includes(details.level) ? details.level : 'info', line: Number.isInteger(details.lineNumber) ? Math.max(0, details.lineNumber) : 0, file: 'pilot.js' });
    });
    contents.on('render-process-gone', () => { if (!run.closed) stop('crashed', run.id); });
    run.window.on('closed', () => { if (!run.closed) stop('closed', run.id); });
    current = run;
    run.startup = setTimeout(() => stop('startup', run.id), LIMITS.startupMs);
    launch(run);
    return { runId: run.id, id: program.id, source: program.code };
  }
  parent.once('closed', () => { disposed = true; stop('parent'); });
  return { start, stop: id => stop('manual', id), catalog: () => catalog(appOrigin), dispose: () => { disposed = true; stop('parent'); } };
}
module.exports = { createJsPilot, LIMITS };
