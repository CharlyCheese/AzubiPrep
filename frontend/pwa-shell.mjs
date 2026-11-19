import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const publicDir = new URL('./public/', import.meta.url);
const publicShell = ['manifest.webmanifest', 'theme-init.js', 'icon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable.svg'];

export function pwaShell() {
  return {
    name: 'azubiprep-pwa-shell',
    apply: 'build',
    enforce: 'post',
    writeBundle({ dir }) {
      // Vite ersetzt seine Preload-Platzhalter spät im Build. Die Integrität
      // bezieht sich auf die tatsächlich ausgelieferten Bytes jeder Datei.
      const html = readFileSync(join(dir, 'index.html'), 'utf8');
      const files = new Set(['index.html']);
      // Vites fertiges HTML enthält Einstieg, Styles und eventuelle Module-Preloads.
      for (const [, file] of html.matchAll(/(?:src|href)="\/(assets\/[^"]+\.(?:js|css))"/g)) {
        files.add(file);
      }
      if (files.size === 1) this.error('Kein gebündelter PWA-Einstieg in index.html gefunden.');
      for (const file of publicShell) files.add(file);

      const entries = Object.fromEntries([...files].map((file) => [
        '/' + file, 'sha256-' + createHash('sha256').update(readFileSync(join(dir, file))).digest('base64'),
      ]));
      const manifest = JSON.stringify(entries);
      const revision = createHash('sha256').update(manifest).digest('hex').slice(0, 16);
      const worker = readFileSync(new URL('sw.js', publicDir), 'utf8');
      writeFileSync(join(dir, 'sw.js'), `const BUILD_REVISION = ${JSON.stringify(revision)};\nconst SHELL_INTEGRITY = ${manifest};\n${worker}`);
    },
  };
}
