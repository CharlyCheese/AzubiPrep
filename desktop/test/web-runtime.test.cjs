const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { configureWebEnvironment, startWebBackend } = require('../web-runtime.cjs');

test('Webpaket übernimmt keine Entwicklerdatenbank oder öffentliche Bindung', () => {
  const env = { HOST: '0.0.0.0', DATABASE_URL: 'private', JWT_SECRET: 'private',
    PORT: '9999', AZUBIPREP_WEB_PORT: '4567', VAPID_PRIVATE_KEY: 'private' };
  configureWebEnvironment(path.resolve('paket'), env);
  assert.equal(env.HOST, '127.0.0.1');
  assert.equal(env.PORT, '4567');
  assert.equal(env.DATABASE_URL, '');
  assert.equal(env.JWT_SECRET, '');
  assert.equal(env.VAPID_PRIVATE_KEY, '');
  assert.equal(env.CONTENT_DIR, path.resolve('paket/content'));
  assert.ok(!env.AZUBIPREP_RAG_DIR.startsWith(path.resolve('paket') + path.sep));
  assert.equal(path.basename(env.AZUBIPREP_RAG_DIR), 'local-rag');
  assert.ok(!env.AZUBIPREP_AI_DIR.startsWith(path.resolve('paket') + path.sep));
  assert.equal(path.basename(env.AZUBIPREP_AI_DIR), 'local-ai');
});

test('Server wird mit stabilem konfiguriertem Port statt Zufallsport gestartet', async () => {
  const saved = { ...process.env };
  try {
    const received = [];
    const result = await startWebBackend(path.resolve('paket'), async (url) => {
      if (url.endsWith('/config.js')) return { config: { port: 4567 } };
      return { startForElectron: async (options) => { received.push(options); return { url: 'http://127.0.0.1:4567' }; } };
    });
    assert.deepEqual(received, [{ port: 4567 }]);
    assert.equal(result.url, 'http://127.0.0.1:4567');
  } finally {
    for (const key of Object.keys(process.env)) if (!(key in saved)) delete process.env[key];
    Object.assign(process.env, saved);
  }
});

test('Buildkonfiguration schließt Entwickler-env aus und liefert Runtime-Startdateien', () => {
  const config = require('../web-builder.json');
  assert.equal(config.extends, null);
  assert.equal(config.extraMetadata.main, 'web-main.cjs');
  assert.ok(config.extraResources[0].filter.includes('!**/.env*'));
  assert.deepEqual(config.win.target, ['nsis', 'portable']);
  assert.equal(config.nsis.perMachine, false);
  assert.equal(config.nsis.allowElevation, false);
});
