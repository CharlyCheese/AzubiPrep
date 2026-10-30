const { BrowserWindow, session, protocol } = require('electron');
const { randomUUID } = require('node:crypto');
protocol.registerSchemesAsPrivileged([{ scheme: 'azubi-preview', privileges: { standard: true, secure: true, corsEnabled: true } }]);

function createInspector(parent, html) {
  if (typeof html !== 'string' || Buffer.byteLength(html) > 20 * 1024 * 1024) throw Error('Vorschau ist zu groß.');
  const isolated = session.fromPartition(`pilot-inspect-${randomUUID()}`);
  isolated.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
  isolated.setPermissionCheckHandler(() => false);
  const previewUrl = 'azubi-preview://project/';
  isolated.webRequest.onBeforeRequest((details, callback) => callback({ cancel: details.url !== previewUrl && !details.url.startsWith('data:') && !details.url.startsWith('devtools:') && details.url !== 'about:blank' }));
  const window = new BrowserWindow({
    parent, width: 1100, height: 800, title: 'AzubiPrep – isolierte Projektprüfung', autoHideMenuBar: true,
    webPreferences: { session: isolated, contextIsolation: true, nodeIntegration: false, sandbox: true, webSecurity: true, devTools: true },
  });
  window.setMenu(null);
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', (event) => event.preventDefault());
  window.webContents.on('will-frame-navigate', (event) => event.preventDefault());
  isolated.on('will-download', (event) => event.preventDefault());
  const csp = "default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";
  const document = `<!doctype html><meta http-equiv="Content-Security-Policy" content="${csp}"><meta name="referrer" content="no-referrer">${html}`;
  isolated.protocol.handle('azubi-preview', (request) => request.url === previewUrl ? new Response(document, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Content-Security-Policy': csp, 'Referrer-Policy': 'no-referrer' } }) : new Response('', { status: 404 }));
  // Der Protokollhandler bindet den HTML-Stand; nach Schließen freigeben.
  // Die Netzwerksperre bleibt auch in der unbenutzten Session bestehen.
  window.once('closed', () => isolated.protocol.unhandle('azubi-preview'));
  window.webContents.once('did-finish-load', () => { if (!window.isDestroyed()) window.webContents.openDevTools({ mode: 'detach' }); });
  window.loadURL(previewUrl).catch(() => { if (!window.isDestroyed()) window.close(); });
  return window;
}
module.exports = { createInspector };
