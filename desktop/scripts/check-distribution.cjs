const assert = require('node:assert/strict');

const PRIVATE_FILTERS = Object.freeze([
  '!**/.env*', '!**/local-ai/**', '!**/local-rag/**',
  '!**/accounts.json', '!**/chatgpt-auth.json', '!**/chatgpt-host.json',
]);
const ROOTS = new Map([
  ['../backend', 'backend'], ['../backend/node_modules', 'backend/node_modules'],
  ['../content', 'content'], ['../frontend/dist', 'frontend/dist'],
]);
const FILES = new Set(['main.js', 'preload.cjs', 'pilot-runtime.cjs', 'pilot-inspector.cjs', 'js-pilot.cjs', 'js-pilot-fixtures.cjs', 'package.json', 'web-main.cjs', 'web-runtime.cjs']);
const NEGATIVE_FILTERS = new Set([...PRIVATE_FILTERS, '!**/*.log', '!**/.cache/**/*', '!**/.vite/**/*', '!**/.vite-temp/**/*']);
function assertDistribution(config) {
  assert.ok(Array.isArray(config.files) && config.files.length && config.files.every(file => FILES.has(file)), 'Paketdateien müssen ausdrücklich freigegeben sein.');
  assert.ok(config.extraFiles === undefined || (Array.isArray(config.extraFiles) && !config.extraFiles.length), 'Zusätzliche ungeprüfte Paketdateien sind nicht freigegeben.');
  assert.ok(config.extends === undefined || config.extends === null, 'Externe Paketkonfigurationen sind nicht freigegeben.');
  assert.ok(Array.isArray(config.extraResources) && config.extraResources.length, 'Paketressourcen fehlen.');
  for (const resource of config.extraResources) {
    assert.equal(ROOTS.get(resource.from), resource.to, 'Nicht freigegebene Ressourcenwurzel: private Profile dürfen nicht paketiert werden.');
    assert.ok(ROOTS.has(resource.from), 'Unbekannte Ressourcenwurzel.');
    assert.ok(Array.isArray(resource.filter) && resource.filter.length, 'Explizite Ressourcenfilter sind erforderlich.');
    for (const filter of PRIVATE_FILTERS) assert.ok(resource.filter.includes(filter), 'Paketfilter gegen private Daten fehlt.');
    const positive = new Set(resource.from === '../backend' ? ['src/**/*', 'node_modules/**/*', 'package.json'] : ['**/*']);
    let exclusionsStarted = false;
    for (const filter of resource.filter) {
      assert.equal(typeof filter, 'string', 'Ungültiger Paketfilter.');
      if (filter.startsWith('!')) { assert.ok(NEGATIVE_FILTERS.has(filter), 'Nicht freigegebener Ausschlussfilter.'); exclusionsStarted = true; }
      else assert.ok(!exclusionsStarted && positive.has(filter), 'Spätere oder nicht freigegebene Einschlussfilter könnten private Ausschlüsse aufheben.');
    }
  }
}
function safeBuildArguments(args) {
  const safe = [];
  for (let index = 0; index < args.length; index++) {
    const value = args[index];
    if (value === '--dir' || value === '--publish=never') safe.push(value);
    else if (value === '--publish' && args[index + 1] === 'never') { safe.push(value, 'never'); index++; }
    else throw Error('Dieses Buildargument ist nicht freigegeben. Konfiguration und Kopierregeln dürfen nicht überschrieben werden.');
  }
  return safe;
}
module.exports = { PRIVATE_FILTERS, assertDistribution, safeBuildArguments };
