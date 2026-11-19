import { build } from 'esbuild';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));

// Diese beiden Konvertierungen werden mit dem jeweiligen Bibliotheksbundle in
// QuickJS ausgewertet. Sie arbeiten ausschließlich auf Zeichen und Bytes im Gast.
function decodeBase64(input) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const value = String(input).replace(/[\t\n\f\r ]/g, '');
  const digits = value.length % 4 === 0 ? value.replace(/={1,2}$/, '') : value;
  if (digits.length % 4 === 1 || /[^A-Za-z0-9+/]/.test(digits)) throw new TypeError('Ungültige Base64-Daten.');
  let buffer = 0;
  let bits = 0;
  let result = '';
  for (const digit of digits) {
    buffer = (buffer << 6) | alphabet.indexOf(digit);
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      result += String.fromCharCode((buffer >> bits) & 255);
    }
  }
  return result;
}

class GuestTextEncoder {
  encode(value = '') {
    const encoded = encodeURIComponent(String(value).toWellFormed());
    const bytes = [];
    for (let index = 0; index < encoded.length; index++) {
      if (encoded[index] === '%') {
        bytes.push(parseInt(encoded.slice(index + 1, index + 3), 16));
        index += 2;
      } else {
        bytes.push(encoded.charCodeAt(index));
      }
    }
    return Uint8Array.from(bytes);
  }
}

const bundles = new Map();
function bundleLibrary(contents) {
  if (!bundles.has(contents)) {
    bundles.set(contents, build({
      stdin: { contents, resolveDir: root }, bundle: true, write: false, format: 'iife',
      platform: 'browser', minify: true, define: { 'process.env.NODE_ENV': '"production"' },
    }).then(result => result.outputFiles[0].text));
  }
  return bundles.get(contents);
}

export function advancedVendor() {
  return {
    name: 'local-course-libraries',
    resolveId(id) { if (['virtual:course-vendor', 'virtual:debugger-vendor', 'virtual:course-types'].includes(id)) return '\0' + id; },
    async load(id) {
      if (id === '\0virtual:course-vendor' || id === '\0virtual:debugger-vendor') {
        const withRouter = id === '\0virtual:course-vendor';
        const [domSource, reactSource] = await Promise.all([
          bundleLibrary('import * as DOM from "linkedom/worker"; globalThis.__DOM=DOM;'),
          bundleLibrary('import * as React from "react"; import * as Client from "react-dom/client"; import {flushSync} from "react-dom";'
            + (withRouter ? 'import * as Router from "react-router-dom";' : '')
            + `globalThis.__libraries={React,ReactDOM:{...Client,flushSync}${withRouter ? ',Router' : ''}};`),
        ]);
        const dom = `((atob) => {${domSource}})(${decodeBase64.toString()});`;
        // Nur die Werkstatt erlaubt Router-Importe und modelliert Browsernavigation.
        const react = withRouter ? `((TextEncoder) => {${reactSource}})(${GuestTextEncoder.toString()});` : reactSource;
        return 'export default ' + JSON.stringify({ dom, react });
      }
      if (id === '\0virtual:course-types') {
        const files = {};
        const add = (directory, prefix, predicate) => { for (const name of readdirSync(resolve(root, directory))) if (predicate(name)) files[prefix + name] = readFileSync(resolve(root, directory, name), 'utf8'); };
        add('node_modules/typescript/lib', '/lib/', name => /^lib\..*\.d\.ts$/.test(name));
        add('node_modules/@types/react', '/node_modules/@types/react/', name => /\.d\.ts$/.test(name));
        add('node_modules/@types/react-dom', '/node_modules/@types/react-dom/', name => /\.d\.ts$/.test(name));
        add('node_modules/@types/prop-types', '/node_modules/@types/prop-types/', name => /\.d\.ts$/.test(name));
        add('node_modules/csstype', '/node_modules/csstype/', name => /\.d\.ts$/.test(name));
        // Router 7 verteilt seine Typen auf mehrere Dateien mit Build-Hash und
        // exportiert react-router/dom separat. Im Kurs liegen nur die Deklarationen.
        for (const name of ['react-router', 'react-router-dom', 'cookie']) {
          const directory = 'node_modules/' + name;
          const manifest = JSON.parse(readFileSync(resolve(root, directory, 'package.json'), 'utf8'));
          const typesDirectory = directory + '/' + dirname(manifest.types).replace(/^\.\//, '');
          add(typesDirectory, '/' + typesDirectory + '/', file => file.endsWith('.d.ts'));
          const typeExports = {};
          for (const subpath of ['.', './dom', './internal/react-server-client']) {
            const entry = manifest.exports?.[subpath]?.default?.types;
            if (entry) typeExports[subpath] = entry;
          }
          files['/' + directory + '/package.json'] = JSON.stringify({
            types: manifest.types, exports: Object.keys(typeExports).length ? typeExports : undefined,
          });
        }
        return 'export default ' + JSON.stringify(files);
      }
    },
  };
}
