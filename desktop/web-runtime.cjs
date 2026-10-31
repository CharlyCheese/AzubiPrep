const path = require('node:path');
const os = require('node:os');

function configureWebEnvironment(root, env = process.env) {
  // Portable/Setup-Paket arbeitet eigenständig, ohne geerbte Entwicklerdienste.
  env.HOST = '127.0.0.1';
  env.PORT = env.AZUBIPREP_WEB_PORT || '';
  env.CONTENT_DIR = path.join(root, 'content');
  env.FRONTEND_DIST = path.join(root, 'frontend', 'dist');
  env.AZUBIPREP_RAG_DIR ||= path.join(env.LOCALAPPDATA || os.homedir(), 'AzubiPrep Web', 'local-rag');
  env.AZUBIPREP_AI_DIR ||= path.join(env.LOCALAPPDATA || os.homedir(), 'AzubiPrep Web', 'local-ai');
  for (const key of ['DATABASE_URL', 'JWT_SECRET', 'ADMIN_TOKEN',
    'VAPID_PUBLIC_KEY', 'VAPID_PRIVATE_KEY', 'VAPID_SUBJECT']) env[key] = '';
}

async function startWebBackend(root, importModule) {
  configureWebEnvironment(root);
  const { pathToFileURL } = require('node:url');
  const load = importModule || ((url) => import(url));
  const { config } = await load(pathToFileURL(path.join(root, 'backend/src/config.js')).href);
  const backend = await load(pathToFileURL(path.join(root, 'backend/src/server.js')).href);
  // startForElectron ist auch ohne Electron-Fenster nutzbar und bindet Loopback.
  return backend.startForElectron({ port: config.port });
}

module.exports = { configureWebEnvironment, startWebBackend };
