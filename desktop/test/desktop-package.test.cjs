const { test } = require('node:test');
const assert = require('node:assert/strict');
const pkg = require('../package.json');
const lock = require('../package-lock.json');
const { assertDistribution, PRIVATE_FILTERS, safeBuildArguments } = require('../scripts/check-distribution.cjs');

test('Desktopdistribution schließt .env-Dateien in allen Ressourcen aus', () => {
  for (const resource of pkg.build.extraResources) {
    assert.ok(resource.filter.includes('!**/.env*'), resource.to);
  }
  const backend = pkg.build.extraResources.find((resource) => resource.to === 'backend');
  assert.ok(backend.filter.includes('src/**/*'));
  assert.ok(!backend.filter.includes('**/*'));
  // Builder 26 überspringt node_modules unterhalb einer Ressourcenwurzel.
  // Deshalb muss der Bibliotheksordner eine eigene Kopierwurzel haben.
  const libraries = pkg.build.extraResources.find((resource) => resource.to === 'backend/node_modules');
  assert.equal(libraries.from, '../backend/node_modules');
  assert.ok(libraries.filter.includes('**/*'));
});

test('Desktopversion und Lockmetadaten passen zusammen und behalten Desktop-Einstieg', () => {
  assert.equal(pkg.version, '0.1.4');
  assert.equal(lock.version, pkg.version);
  assert.equal(lock.packages[''].version, pkg.version);
  assert.equal(pkg.main, 'main.js');
  assert.deepEqual(pkg.build.files, ['main.js', 'preload.cjs', 'pilot-runtime.cjs', 'pilot-inspector.cjs', 'js-pilot.cjs', 'js-pilot-fixtures.cjs', 'package.json']);
  assert.equal(pkg.devDependencies.electron, '45.2.0');
  assert.equal(pkg.scripts.dist, 'node scripts/build-desktop.cjs');
});

test('Beide Paketvarianten schließen Konten/Unterlagen aus und verweigern breite Kopierregeln', () => {
  for (const config of [pkg.build, require('../web-builder.json')]) {
    assert.doesNotThrow(() => assertDistribution(config));
    for (const root of ['..', '../local-ai', '../local-rag']) { const bad = structuredClone(config); bad.extraResources[0].from = root; assert.throws(() => assertDistribution(bad)); }
    for (const filter of PRIVATE_FILTERS) { const bad = structuredClone(config); bad.extraResources[0].filter = bad.extraResources[0].filter.filter(value => value !== filter); assert.throws(() => assertDistribution(bad)); }
    const broad = structuredClone(config); broad.files.push('**/*'); assert.throws(() => assertDistribution(broad));
    const extra = structuredClone(config); extra.extraFiles = ['../local-ai']; assert.throws(() => assertDistribution(extra));
    const reinclude = structuredClone(config); reinclude.extraResources[1].filter.push('**/accounts.json'); assert.throws(() => assertDistribution(reinclude));
    const reordered = structuredClone(config); reordered.extraResources[1].filter.push('**/*'); assert.throws(() => assertDistribution(reordered));
    const inherit = structuredClone(config); inherit.extends = './unverified.json'; assert.throws(() => assertDistribution(inherit));
  }
});
test('Buildargumente können die geprüften Ressourcen nicht überschreiben', () => {
  assert.deepEqual(safeBuildArguments(['--dir', '--publish', 'never']), ['--dir', '--publish', 'never']);
  assert.deepEqual(safeBuildArguments(['--publish=never']), ['--publish=never']);
  for (const args of [['--config', 'other.json'], ['-c.extraResources=../local-ai'], ['--config.files=**/*'], ['--publish', 'always']]) assert.throws(() => safeBuildArguments(args));
  assert.equal(require('../scripts/desktop-build-config.cjs').extends, null);
});
