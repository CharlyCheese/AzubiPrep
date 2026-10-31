const path = require('node:path');
const fs = require('node:fs');
const { app, Tray, Menu, nativeImage, shell, dialog } = require('electron');
const { startWebBackend } = require('./web-runtime.cjs');

let tray = null;
let backendServer = null;
let readyUrl = null;
let quitting = false;

function rootPath() {
  return app.isPackaged ? process.resourcesPath : path.resolve(__dirname, '..');
}

async function openBrowser() {
  if (!readyUrl) return;
  try {
    await shell.openExternal(readyUrl);
  } catch {
    await dialog.showMessageBox({
      type: 'info', title: 'AzubiPrep Web',
      message: 'Der Browser konnte nicht automatisch geöffnet werden.',
      detail: `Öffne diese Adresse in deinem Browser: ${readyUrl}`,
    });
  }
}

// Eigener Profil-/Lockbereich, unabhängig von der Desktop-App und von Electron-Dev.
app.setPath('userData', path.join(app.getPath('appData'), 'AzubiPrep Web'));
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', openBrowser);
  app.on('window-all-closed', () => {});
  app.on('before-quit', (event) => {
    if (!backendServer || quitting) return;
    event.preventDefault();
    quitting = true;
    backendServer.close(() => app.quit());
    backendServer.closeAllConnections();
  });
  app.whenReady().then(async () => {
    try {
      const root = rootPath();
      if (!process.env.AZUBIPREP_RAG_DIR) process.env.AZUBIPREP_RAG_DIR = path.join(app.getPath('userData'), 'local-rag');
      if (!process.env.AZUBIPREP_AI_DIR) process.env.AZUBIPREP_AI_DIR = path.join(app.getPath('userData'), 'local-ai');
      if (!fs.existsSync(path.join(root, 'frontend/dist/index.html'))) {
        throw new Error('Die Weboberfläche fehlt. Bitte AzubiPrep Web erneut aus dem vollständigen Paket starten.');
      }
      const { url, server } = await startWebBackend(root);
      backendServer = server;
      readyUrl = url;
      const icon = nativeImage.createFromPath(path.join(root, 'frontend/dist/icon-192.png')).resize({ width: 24, height: 24 });
      tray = new Tray(icon);
      tray.setToolTip('AzubiPrep Web – bereit');
      tray.setContextMenu(Menu.buildFromTemplate([
        { label: 'Im Browser öffnen', click: openBrowser },
        { type: 'separator' },
        { label: 'AzubiPrep beenden', click: () => app.quit() },
      ]));
      tray.on('double-click', openBrowser);
      await openBrowser();
    } catch (err) {
      await dialog.showMessageBox({
        type: 'error', title: 'AzubiPrep Web konnte nicht starten',
        message: err.code === 'EADDRINUSE'
          ? 'Die lokale Adresse ist bereits belegt. Beende die andere laufende Webversion und starte AzubiPrep Web erneut.'
          : 'AzubiPrep Web konnte nicht vorbereitet werden.',
        detail: err.code === 'EADDRINUSE' ? '' : String(err.message),
      });
      app.quit();
    }
  });
}
