// Einstiegspunkt: Content-Store aufbauen und Server starten.
// Erkennt zuverlässig, ob die Datei direkt ausgeführt wird (kein
// versehentlicher Serverstart bei Import durch Tests/Scripts).
import { pathToFileURL } from 'node:url';
import { config } from './config.js';
import { loadContent } from './content.js';
import { createApp } from './app.js';
import { isDbAktiviert, dbErreichbar } from './db.js';

export async function createStore(contentDir) {
  let content = await loadContent(contentDir);
  return {
    get: () => content,
    set: (neu) => { content = neu; },
  };
}

export async function startServer() {
  const store = await createStore(config.contentDir);
  if (store.get().warnungen.length > 0) {
    console.warn(`[Content] ${store.get().warnungen.length} Warnung(en) beim Laden:`);
    for (const w of store.get().warnungen) console.warn('  -', w);
  }
  const app = createApp(store);
  const server = app.listen(config.port, config.host, () => {
    console.log(`AzubiPrep-Backend läuft auf http://${config.host}:${config.port}`);
    console.log(`Inhalte: ${store.get().gesamtFragen} Fragen, ${store.get().modulesById.size} Module (Quelle: ${store.get().quelle})`);
    if (isDbAktiviert()) {
      dbErreichbar().then((ok) => {
        console.log(ok ? '[db] Verbindung zu PostgreSQL erfolgreich – Login/Sync aktiv.' : '[db] DATABASE_URL gesetzt, aber Verbindung fehlgeschlagen! Login/Sync werden Fehler werfen.');
      });
    } else {
      console.log('[db] Keine DATABASE_URL gesetzt – reiner Offline-Modus (kein Login/Sync).');
    }
  });
  return { app, server, store };
}

/**
 * Startvariante für die Electron-Desktop-App (siehe desktop/main.js):
 * lauscht auf einem freien Port (0 = vom OS vergeben) statt auf dem festen
 * Standardport, damit die Desktop-App nie mit einem lokal laufenden
 * "npm start"-Backend kollidiert. Gibt die fertige URL zurück, statt sie
 * nur zu loggen. Ändert nichts am bestehenden CLI-Verhalten (startServer/
 * istDirektausfuehrung bleiben unverändert).
 */
export async function startForElectron({ port = 0 } = {}) {
  const store = await createStore(config.contentDir);
  const app = createApp(store);
  return new Promise((resolve, reject) => {
    const server = app.listen(port, '127.0.0.1');
    server.once('listening', () => {
      const adresse = server.address();
      resolve({ url: `http://127.0.0.1:${adresse.port}`, server, store });
    });
    server.once('error', reject);
  });
}

const istDirektausfuehrung = import.meta.url === pathToFileURL(process.argv[1] ?? '').href;
if (istDirektausfuehrung) {
  startServer();
}
