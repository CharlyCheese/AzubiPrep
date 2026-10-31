const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { assertDistribution, safeBuildArguments } = require('./check-distribution.cjs');
assertDistribution(require('../web-builder.json'));
const buildArguments = safeBuildArguments(process.argv.slice(2));

const desktop = path.resolve(__dirname, '..');
const frontend = path.resolve(desktop, '../frontend');

function run(file, args, cwd, env = process.env) {
  const result = spawnSync(process.execPath, [file, ...args], {
    cwd, env, stdio: 'inherit', windowsHide: true,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}

// Ziel-PC nutzt denselben Ursprung für Oberfläche und API, keine Entwickler-URL.
run(path.join(frontend, 'node_modules/vite/bin/vite.js'), ['build'], frontend, {
  ...process.env, VITE_API_BASE_URL: '/api',
});
run(path.join(desktop, 'node_modules/electron-builder/cli.js'), [
  '--config', path.join(desktop, 'web-builder.json'), '--win', '--x64', ...buildArguments,
], desktop);
