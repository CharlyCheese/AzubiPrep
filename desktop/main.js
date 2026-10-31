// Electron-Hülle für AzubiPrep: startet das bestehende Node/Express-Backend
// unverändert im Hintergrund (per dynamic import, da backend/ ES-Module
// nutzt) und öffnet ein Fenster auf die zurückgegebene lokale URL.
//
// Die Kurswerkstatt erhält eine begrenzte native Speicher-/Auswahlbrücke.
// Die Pfadauflösung in
// backend/src/config.js (contentDir/frontendDist = zwei Ordner über
// backend/src/) funktioniert automatisch korrekt, sofern backend/, content/
// und frontend/dist/ als Geschwisterordner vorliegen – das gilt sowohl im
// Entwicklungsmodus (AzubiPrep/backend, AzubiPrep/content, AzubiPrep/frontend)
// als auch in der gepackten App (siehe "extraResources" in package.json,
// die genau diese Struktur unter resources/ nachbildet).

const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { app, BrowserWindow, dialog, session, ipcMain, Menu, shell } = require('electron');
const { createStore, createAiPreferences, readProject, validSender } = require('./pilot-runtime.cjs');
const { createInspector } = require('./pilot-inspector.cjs');
const profileOverride = app.commandLine.getSwitchValue('user-data-dir');
if (profileOverride) app.setPath('userData', path.resolve(profileOverride));

let hauptfenster = null;
let backendServer = null;
let appOrigin = null;
let inspectorWindow = null;

function registerPilot() {
  const store = createStore(app.getPath('userData'));
  const aiPreferences = createAiPreferences(app.getPath('userData'));
  const guard = (event) => { if (!validSender(event, hauptfenster, appOrigin)) throw Error('Nicht freigegebener Anwendungsaufruf.'); };
  ipcMain.handle('pilot:load', (event) => { guard(event); return store.load(); });
  ipcMain.handle('pilot:save', (event, value) => { guard(event); return store.save(value); });
  ipcMain.handle('ai:preferences-load', (event) => { guard(event); return aiPreferences.load(); });
  ipcMain.handle('ai:preferences-save', (event, value) => { guard(event); return aiPreferences.save(value); });
  ipcMain.handle('rag:open-folder', async (event) => {
    guard(event);
    const { createRagService } = await import(pathToFileURL(path.join(projektwurzel(), 'backend/src/rag.js')).href);
    const { config } = await import(pathToFileURL(path.join(projektwurzel(), 'backend/src/config.js')).href);
    const status = await createRagService(config).status();
    if (!status.location || status.state === 'error') throw Error('Der private Materialordner ist nicht verfügbar.');
    guard(event); const error = await shell.openPath(status.location);
    if (error) throw Error('Der private Materialordner konnte nicht geöffnet werden.');
    return true;
  });
  ipcMain.handle('pilot:choose', async (event, mode) => {
    guard(event);
    if (!['folder', 'files'].includes(mode)) throw Error('Ungültige Auswahl.');
    const result = await dialog.showOpenDialog(hauptfenster, {
      title: mode === 'folder' ? 'Projektordner auswählen' : 'Projektdateien auswählen',
      properties: mode === 'folder' ? ['openDirectory', 'dontAddToRecent'] : ['openFile', 'multiSelections', 'dontAddToRecent'],
      ...(mode === 'files' ? { filters: [{ name: 'HTML, CSS und Rasterbilder', extensions: ['html', 'css', 'png', 'jpg', 'jpeg', 'webp'] }] } : {}),
    });
    if (result.canceled) return null;
    guard(event);
    return readProject(result.filePaths, mode);
  });
  ipcMain.handle('pilot:inspect', (event, html) => {
    guard(event);
    if (inspectorWindow && !inspectorWindow.isDestroyed()) inspectorWindow.close();
    const window = createInspector(hauptfenster, html); inspectorWindow = window;
    window.on('closed', () => { if (inspectorWindow === window) inspectorWindow = null; });
    return true;
  });
}

function projektwurzel() {
  // Gepackt: resources/backend, resources/content, resources/frontend/dist
  // Dev:     ../backend, ../content, ../frontend/dist (relativ zu desktop/)
  return app.isPackaged ? process.resourcesPath : path.join(__dirname, '..');
}

function backendEinstiegUrl() {
  return pathToFileURL(path.join(projektwurzel(), 'backend', 'src', 'server.js')).href;
}

async function backendStarten() {
  if ((app.isPackaged || profileOverride) && !process.env.AZUBIPREP_RAG_DIR) process.env.AZUBIPREP_RAG_DIR = path.join(app.getPath('userData'), 'local-rag');
  const backend = await import(backendEinstiegUrl());
  const { url, server, store } = await backend.startForElectron();

  const warnungen = store.get().warnungen;
  if (warnungen.length > 0) {
    console.warn(`[Content] ${warnungen.length} Warnung(en) beim Laden:`);
    for (const w of warnungen) console.warn('  -', w);
  }
  console.log(`AzubiPrep-Backend (Electron) läuft auf ${url}`);
  console.log(`Inhalte: ${store.get().gesamtFragen} Fragen, ${store.get().modulesById.size} Module`);

  return { url, server };
}

async function fensterErstellen() {
  try {
    const { url, server } = await backendStarten();
    backendServer = server;
    appOrigin = new URL(url).origin;

    hauptfenster = new BrowserWindow({
      width: 1280,
      height: 860,
      minWidth: 960,
      minHeight: 640,
      autoHideMenuBar: true,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        webSecurity: true,
        devTools: false,
        preload: path.join(__dirname, 'preload.cjs'),
      },
    });

    hauptfenster.webContents.setWindowOpenHandler(({ url: target }) => {
      try {
        const parsed = new URL(target);
        if (parsed.protocol === 'https:' && ['developer.mozilla.org', 'wiki.selfhtml.org', 'www.w3schools.com'].includes(parsed.hostname)) shell.openExternal(parsed.href).catch(() => {});
      } catch { /* Alle anderen Fenster bleiben gesperrt. */ }
      return { action: 'deny' };
    });
    const stopForeign = (event, target = event.url) => { try { if (new URL(target).origin !== appOrigin) event.preventDefault(); } catch { event.preventDefault(); } };
    hauptfenster.webContents.on('will-navigate', stopForeign);
    hauptfenster.webContents.on('will-redirect', stopForeign);
    hauptfenster.webContents.on('will-frame-navigate', (event) => {
      if (!['about:blank', 'about:srcdoc'].includes(event.url)) stopForeign(event, event.url);
    });
    hauptfenster.webContents.on('before-input-event', (event, input) => {
      if (input.type === 'keyDown' && (input.key === 'F12' || (input.control && input.shift && input.key.toLowerCase() === 'i'))) {
        event.preventDefault(); hauptfenster.webContents.send('pilot:inspect-request');
      }
    });
    hauptfenster.loadURL(url);
    hauptfenster.on('closed', () => { hauptfenster = null; });
  } catch (err) {
    console.error('[Electron] Backend-Start fehlgeschlagen:', err);
    await dialog.showMessageBox({
      type: 'error',
      title: 'AzubiPrep konnte nicht gestartet werden',
      message: 'Das interne Backend konnte nicht gestartet werden.',
      detail: String(err?.stack || err),
    });
    app.quit();
  }
}

// BE-001: Electron zeigt in eigenen Fenstern standardmäßig keinen
// Berechtigungs-Dialog wie ein normaler Browser-Tab an – ohne diesen
// Handler würde die Push-Berechtigungsanfrage aus der App (navigator
// .permissions/pushManager.subscribe) stillschweigend hängen bleiben oder
// abgelehnt werden. Da wir nur unser eigenes, lokal gestartetes Backend
// laden (keine Fremdinhalte), wird 'notifications' pauschal erlaubt, alles
// andere sicherheitshalber abgelehnt.
function berechtigungenEinrichten() {
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    callback(Boolean(hauptfenster && webContents === hauptfenster.webContents && permission === 'notifications'));
  });
  session.defaultSession.setPermissionCheckHandler((webContents, permission, origin) => Boolean(hauptfenster && webContents === hauptfenster.webContents && origin === appOrigin && permission === 'notifications'));
  // Windows zeigt Toast-Benachrichtigungen nur mit sauberem App-Namen an,
  // wenn eine AppUserModelId gesetzt ist (sonst z. B. "Electron" als Absender).
  if (process.platform === 'win32') {
    app.setAppUserModelId('de.azubiprep.desktop');
  }
}

app.whenReady().then(() => {
  registerPilot();
  berechtigungenEinrichten();
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: 'Datei', submenu: [{ role: 'quit', label: 'Beenden' }] },
    { label: 'Bearbeiten', submenu: [{ role: 'undo', label: 'Rückgängig' }, { role: 'redo', label: 'Wiederholen' }, { type: 'separator' }, { role: 'cut', label: 'Ausschneiden' }, { role: 'copy', label: 'Kopieren' }, { role: 'paste', label: 'Einfügen' }, { role: 'selectAll', label: 'Alles auswählen' }] },
    { label: 'Ansicht', submenu: [{ role: 'reload', label: 'Neu laden' }, { role: 'resetZoom', label: 'Originalgröße' }, { role: 'zoomIn', label: 'Vergrößern' }, { role: 'zoomOut', label: 'Verkleinern' }, { role: 'togglefullscreen', label: 'Vollbild' }] },
  ]));
  return fensterErstellen();
});

app.on('window-all-closed', () => {
  if (backendServer) backendServer.close();
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) fensterErstellen();
});
