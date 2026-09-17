// Electron-Hülle für AzubiPrep: startet das bestehende Node/Express-Backend
// unverändert im Hintergrund (per dynamic import, da backend/ ES-Module
// nutzt) und öffnet ein Fenster auf die zurückgegebene lokale URL.
//
// Es wird absichtlich NICHTS am bestehenden backend/ oder frontend/ Code
// geändert – diese Datei bindet beides nur ein. Die Pfadauflösung in
// backend/src/config.js (contentDir/frontendDist = zwei Ordner über
// backend/src/) funktioniert automatisch korrekt, sofern backend/, content/
// und frontend/dist/ als Geschwisterordner vorliegen – das gilt sowohl im
// Entwicklungsmodus (AzubiPrep/backend, AzubiPrep/content, AzubiPrep/frontend)
// als auch in der gepackten App (siehe "extraResources" in package.json,
// die genau diese Struktur unter resources/ nachbildet).

const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { app, BrowserWindow, dialog, session } = require('electron');

let hauptfenster = null;
let backendServer = null;

function projektwurzel() {
  // Gepackt: resources/backend, resources/content, resources/frontend/dist
  // Dev:     ../backend, ../content, ../frontend/dist (relativ zu desktop/)
  return app.isPackaged ? process.resourcesPath : path.join(__dirname, '..');
}

function backendEinstiegUrl() {
  return pathToFileURL(path.join(projektwurzel(), 'backend', 'src', 'server.js')).href;
}

async function backendStarten() {
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
      },
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
    callback(permission === 'notifications');
  });
  // Windows zeigt Toast-Benachrichtigungen nur mit sauberem App-Namen an,
  // wenn eine AppUserModelId gesetzt ist (sonst z. B. "Electron" als Absender).
  if (process.platform === 'win32') {
    app.setAppUserModelId('de.azubiprep.desktop');
  }
}

app.whenReady().then(() => {
  berechtigungenEinrichten();
  return fensterErstellen();
});

app.on('window-all-closed', () => {
  if (backendServer) backendServer.close();
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) fensterErstellen();
});
