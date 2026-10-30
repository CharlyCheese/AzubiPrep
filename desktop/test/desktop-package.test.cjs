const { test } = require('node:test');
const assert = require('node:assert/strict');
const pkg = require('../package.json');
const lock = require('../package-lock.json');

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
  assert.equal(pkg.version, '0.1.3');
  assert.equal(lock.version, pkg.version);
  assert.equal(lock.packages[''].version, pkg.version);
  assert.equal(pkg.main, 'main.js');
  assert.deepEqual(pkg.build.files, ['main.js', 'preload.cjs', 'pilot-runtime.cjs', 'pilot-inspector.cjs', 'package.json']);
  assert.equal(pkg.devDependencies.electron, '45.2.0');
  assert.equal(pkg.scripts.dist, 'node scripts/build-desktop.cjs');
});
