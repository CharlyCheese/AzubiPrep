import { build } from 'esbuild';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
let vendor;
export function advancedVendor() {
  return {
    name: 'local-course-libraries',
    resolveId(id) { if (['virtual:course-vendor', 'virtual:course-types'].includes(id)) return '\0' + id; },
    async load(id) {
      if (id === '\0virtual:course-vendor') {
        vendor ||= Promise.all(['import * as DOM from "linkedom/worker"; globalThis.__DOM=DOM;', 'import * as React from "react"; import * as Client from "react-dom/client"; import {flushSync} from "react-dom"; import * as Router from "react-router-dom"; globalThis.__libraries={React,ReactDOM:{...Client,flushSync},Router};'].map(contents => build({ stdin: { contents, resolveDir: root }, bundle: true, write: false, format: 'iife', platform: 'browser', minify: true, define: { 'process.env.NODE_ENV': '"production"' } })));
        const bundles = await vendor;
        return 'export default ' + JSON.stringify({ dom: bundles[0].outputFiles[0].text, react: bundles[1].outputFiles[0].text });
      }
      if (id === '\0virtual:course-types') {
        const files = {};
        const add = (directory, prefix, predicate) => { for (const name of readdirSync(resolve(root, directory))) if (predicate(name)) files[prefix + name] = readFileSync(resolve(root, directory, name), 'utf8'); };
        add('node_modules/typescript/lib', '/lib/', name => /^lib\..*\.d\.ts$/.test(name));
        add('node_modules/@types/react', '/node_modules/@types/react/', name => /\.d\.ts$/.test(name));
        add('node_modules/@types/react-dom', '/node_modules/@types/react-dom/', name => /\.d\.ts$/.test(name));
        add('node_modules/@types/prop-types', '/node_modules/@types/prop-types/', name => /\.d\.ts$/.test(name));
        add('node_modules/csstype', '/node_modules/csstype/', name => /\.d\.ts$/.test(name));
        for (const path of ['react-router-dom/dist/index.d.ts', 'react-router/dist/index.d.ts', '@remix-run/router/dist/index.d.ts', '@remix-run/router/dist/history.d.ts', '@remix-run/router/dist/router.d.ts', '@remix-run/router/dist/utils.d.ts']) files['/node_modules/' + path] = readFileSync(resolve(root, 'node_modules', path), 'utf8');
        for (const name of ['react-router-dom','react-router','@remix-run/router']) files['/node_modules/'+name+'/package.json'] = JSON.stringify({types:'dist/index.d.ts'});
        return 'export default ' + JSON.stringify(files);
      }
    },
  };
}
