// Einstiegspunkt: Content-Store aufbauen und Server starten.
// Erkennt zuverlässig, ob die Datei direkt ausgeführt wird (kein
// versehentlicher Serverstart bei Import durch Tests/Scripts).
import { pathToFileURL } from 'node:url';
import { config } from './config.js';
import { loadContent } from './content.js';
import { createApp } from './app.js';

export function createStore(contentDir) {
  let content = loadContent(contentDir);
  return {
    get: () => content,
    set: (neu) => { content = neu; },
  };
}

export function startServer() {
  const store = createStore(config.contentDir);
  if (store.get().warnungen.length > 0) {
    console.warn(`[Content] ${store.get().warnungen.length} Warnung(en) beim Laden:`);
    for (const w of store.get().warnungen) console.warn('  -', w);
  }
  const app = createApp(store);
  const server = app.listen(config.port, config.host, () => {
    console.log(`AzubiPrep-Backend läuft auf http://${config.host}:${config.port}`);
    console.log(`Inhalte: ${store.get().gesamtFragen} Fragen, ${store.get().modulesById.size} Module`);
  });
  return { app, server, store };
}

const istDirektausfuehrung = import.meta.url === pathToFileURL(process.argv[1] ?? '').href;
if (istDirektausfuehrung) {
  startServer();
}
