import { test, expect, _electron } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileDebugger } from '../../frontend/src/pilot/debugger-compiler.js';
import { DEBUG_LIMITS, installDebugger, validateDebugArtifact, validateDebugSnapshot } from '../../frontend/src/pilot/debugger-core.js';
import variant from '../../frontend/node_modules/@jitl/quickjs-singlefile-browser-release-sync/dist/index.mjs';
import { newQuickJSWASMModuleFromVariant } from '../../frontend/node_modules/quickjs-emscripten-core/dist/index.mjs';
import { unterdrueckeOnboardingPopups, openDebugger } from './helpers.js';

test.use({ serviceWorkers: 'block' });
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const draft = source => ({ schema: 1, name: 'eigen.js', source });
const region = page => page.getByRole('region', { name: 'Debugger-Technikpilot', exact: true });
const status = page => region(page).getByLabel('Debugstatus', { exact: true });
const values = page => region(page).getByRole('region', { name: 'Debugvariablen', exact: true });
const click = (page, name) => region(page).getByRole('button', { name, exact: true }).click();
async function open(page, source, url = '/frontendkurs') {
  await unterdrueckeOnboardingPopups(page); await page.goto(url); await openDebugger(page);
  await region(page).getByRole('textbox', { name: 'Eigener Debugcode', exact: true }).fill(source);
}
async function start(page) { await click(page, 'Debuggen starten'); await expect(status(page)).toContainText('Angehalten'); }
async function at(page, line) { await expect(status(page)).toContainText('uebung.js:' + line + ':'); }
async function breakpoint(page, source, line, kind = 'statement') {
  const point = compileDebugger(draft(source)).points.find(p => p.line === line && p.kind === kind);
  expect(point).toBeTruthy(); await click(page, `Debug-Haltepunkt Zeile ${point.line} Spalte ${point.column}`);
}
const simple = 'function plus(n) {\n let lokal = n + 1;\n console.log("innen", lokal);\n return lokal;\n}\nlet antwort = plus(6);\nconsole.log("außen", antwort);';

test('Eigene Funktion: Hinein, Parameter/TDZ, Frameauswahl und Verlassen ohne Replay', async ({ page }) => {
  await open(page, simple); await start(page); await at(page, 6);
  await expect(region(page).getByRole('button', { name: 'Funktion verlassen', exact: true })).toBeDisabled();
  await click(page, 'Einzelner Schritt'); await at(page, 1);
  await expect(values(page).locator('tbody tr').filter({ hasText: /^nnumber6$/ })).toHaveCount(1);
  await expect(values(page)).toContainText('noch nicht initialisiert');
  const chain = region(page).getByRole('group', { name: 'Debug-Aufrufkette' }); await expect(chain.getByRole('button')).toHaveCount(2);
  await chain.getByRole('button', { name: /^Programm/ }).click(); await expect(values(page)).toContainText('Ausgewählter Aufruf: Programm'); await expect(values(page)).not.toContainText('Funktion plus');
  await chain.getByRole('button', { name: /^plus/ }).click();
  await click(page, 'Funktion verlassen'); await at(page, 7); await expect(values(page)).toContainText('7');
  await expect(region(page).getByLabel('Debugkonsole')).toHaveText('innen 7');
  await click(page, 'Weiter / bis zum nächsten Haltepunkt'); await expect(status(page)).toContainText('Programm ist beendet');
  await expect(region(page).getByLabel('Debugkonsole')).toHaveText('innen 7\naußen 7'); await expect(chain.getByRole('button')).toHaveCount(1);
});

test('Überspringen bleibt im Aufrufer; expliziter Haltepunkt im Aufruf gewinnt', async ({ page }) => {
  await open(page, simple); await start(page); await click(page, 'Funktion überspringen'); await at(page, 7);
  await expect(region(page).getByLabel('Debugkonsole')).toHaveText('innen 7');
  await start(page); await breakpoint(page, simple, 3); await click(page, 'Funktion überspringen'); await at(page, 3);
  await expect(status(page)).toContainText('Haltepunkt'); await expect(values(page)).toContainText('Funktion plus');
  await click(page, 'Funktion verlassen'); await at(page, 7);
});

test('Rekursion zeigt getrennte Parameter und lässt genau eine Ebene verlassen', async ({ page }) => {
  const source = 'function sum(n) {\n if(n === 0) {\n  return 0;\n }\n let vorher = sum(n - 1);\n return n + vorher;\n}\nlet summe = sum(3);\nconsole.log(summe);';
  await open(page, source); await start(page); await breakpoint(page, source, 3, 'return'); await click(page, 'Weiter / bis zum nächsten Haltepunkt'); await at(page, 3);
  const chain = region(page).getByRole('group', { name: 'Debug-Aufrufkette' }); await expect(chain.getByRole('button')).toHaveCount(5);
  await expect(values(page).locator('tbody tr').filter({ hasText: /^nnumber0$/ })).toHaveCount(1);
  await chain.getByRole('button', { name: /sum · Aufruf 1 ·/ }).click(); await expect(values(page).locator('tbody tr').filter({ hasText: /^nnumber3$/ })).toHaveCount(1);
  await click(page, 'Funktion verlassen'); await at(page, 6); await expect(chain.getByRole('button')).toHaveCount(4);
  await expect(values(page).locator('tbody tr').filter({ hasText: /^nnumber1$/ })).toHaveCount(1);
  await click(page, 'Weiter / bis zum nächsten Haltepunkt'); await expect(status(page)).toContainText('Programm ist beendet'); await expect(region(page).getByLabel('Debugkonsole')).toHaveText('6');
});

test('for…of: leerer Rumpf wird nicht getroffen, Iterationswerte mit gleicher Halteposition', async ({ page }) => {
  const source = 'let summe = 0;\nfor(const wert of []) {\n console.log("NICHT");\n}\nfor(const wert of [2,3,4]) {\n summe += wert;\n}\nconsole.log(summe);';
  await open(page, source); await start(page); await breakpoint(page, source, 3); await breakpoint(page, source, 6);
  for (const value of [2, 3, 4]) { await click(page, 'Weiter / bis zum nächsten Haltepunkt'); await at(page, 6); await expect(values(page).locator('tbody tr').filter({ hasText: new RegExp('^wertnumber' + value + '$') })).toHaveCount(1); }
  await click(page, 'Weiter / bis zum nächsten Haltepunkt'); await expect(status(page)).toContainText('Programm ist beendet'); await expect(region(page).getByLabel('Debugkonsole')).toHaveText('9');
});

async function runWorker(page, source, limits = {}, mode = 'continue') {
  const artifact = compileDebugger(draft(source)); const asset = fs.readdirSync(path.join(repo, 'frontend/dist/assets')).find(name => /^debugger\.worker-.*\.js$/.test(name));
  return page.evaluate(({ artifact, asset, limits, mode }) => new Promise(resolve => {
    const worker = new Worker('/assets/' + asset, { type: 'module' }); const events = []; let commandId = 0;
    const timer = setTimeout(() => { worker.terminate(); resolve([{ type: 'timeout' }]); }, 14000);
    worker.onmessage = ({ data }) => {
      events.push(data);
      if (data.type === 'paused') worker.postMessage({ type: 'control', session: 'test', revision: 'rev', commandId: ++commandId, pauseId: data.pauseId, mode });
      if (data.type === 'done' || data.type === 'error') { clearTimeout(timer); worker.terminate(); resolve(events); }
    };
    worker.postMessage({ type: 'start', session: 'test', revision: 'rev', artifact, limits });
  }), { artifact, asset, limits, mode });
}

test('Caller-Scopes in Schleifenbedingungen/-inkrementen sind frisch und zeigen keine verlassenen Blöcke', async ({ page }) => {
  await open(page, 'let x=1;');
  for (const source of [
    'function check(i){return i<2;}for(let i=0;check(i);i++){let x=i;}',
    'let i=0;function check(){return i++<2;}while(check()){let x=i;}',
    'function inc(i){return i+1;}for(let i=0;i<2;i=inc(i)){let x=i;}',
  ]) {
    const artifact = compileDebugger(draft(source)); const events = await runWorker(page, source, {}, 'step'); expect(events.at(-1).type).toBe('done');
    const entries = events.filter(event => event.type === 'paused' && artifact.points[event.point].kind === 'entry'); expect(entries.length).toBeGreaterThanOrEqual(2);
    for (const [index, event] of entries.entries()) {
      const caller = event.snapshot.frames[0], meta = artifact.points[caller.point]; expect(meta.kind).toBe('context');
      const bindings = caller.scopes.flatMap(scope => scope.values); expect(bindings.some(value => value.name === 'x')).toBe(false);
      expect(bindings.find(value => value.name === 'i')?.display).toBe(String(index));
    }
  }
});

test('Verlassen hält an explizitem Haltepunkt in Rückgabeaufruf; Laufzeitfehler entfernt aktive Frames', async ({ page }) => {
  const source = 'function innen(n){\n console.log("einmal");\n return n+1;\n}\nfunction außen(){\n return innen(4);\n}\nlet x=außen();\nconsole.log(x);';
  await open(page, source); await start(page); await breakpoint(page, source, 6, 'return'); await click(page, 'Weiter / bis zum nächsten Haltepunkt'); await at(page, 6);
  await breakpoint(page, source, 2); await click(page, 'Funktion verlassen'); await at(page, 2); await expect(status(page)).toContainText('Haltepunkt');
  await click(page, 'Weiter / bis zum nächsten Haltepunkt'); await expect(status(page)).toContainText('Programm ist beendet'); await expect(region(page).getByLabel('Debugkonsole')).toHaveText('einmal\n5');
  await region(page).getByRole('textbox', { name: 'Eigener Debugcode', exact: true }).fill('function f(){const x=1;x++;} f();'); await start(page); await click(page, 'Einzelner Schritt'); await expect(values(page)).toContainText('Funktion f'); await click(page, 'Weiter / bis zum nächsten Haltepunkt'); await expect(region(page).getByLabel('Debugfehler')).toContainText('Laufzeitfehler'); await expect(values(page)).toContainText('Noch kein Halt'); await expect(region(page).getByRole('group', { name: 'Debug-Aufrufkette' })).toHaveCount(0);
});

test('Echte VM: leere Endlosschleife, kumulative Kontrollpunkte, Rekursionsgrenze und frischer Folgelauf', async ({ page }) => {
  await open(page, 'let x=1;');
  for (const [source, limits] of [['while(true) {}', { activeMs: 20 }], ['for(let i=0;i<10;i++){}', { checkpointHits: 4 }], ['function f(n){return f(n+1);} f(0);', { frames: 4 }]]) {
    const events = await runWorker(page, source, limits); expect(events.at(-1).type).toBe('error');
  }
  const events = await runWorker(page, 'function f(x){return x+1;} console.log(f(2));'); expect(events.at(-1).type).toBe('done'); expect(events.filter(e => e.type === 'log').map(e => e.text)).toEqual(['3']);
  const chain = 'function a(){return b();}function b(){return 1;}console.log(a());';
  for (const [frames, expected] of [[2, 'error'], [3, 'done'], [4, 'done']]) expect((await runWorker(page, chain, { frames })).at(-1).type).toBe(expected);
});

test('Funktionen öffnen keine Property-/Helferwege; Funktionsshadowing wird aufgelöst', async () => {
  for (const source of ['function f(a,a){return a;}', 'function f(){return 1;}function f(){return 2;}']) expect(() => compileDebugger(draft(source))).toThrow('noch nicht unterstützt');
  for (const source of ['function f(){return 1;} f=1;', 'function f(){function g(){return 1;}return g();}', 'function f(a=1){return a;}', 'function f(...a){return 1;}', 'function f(){return arguments;}', 'let a=[1];a["constructor"]("return 1")();', 'function f(){return __azubi_dbg_checkpoint.enter(1);}', 'function f(){return eval("1");}', 'for(const x of [1]){console["log"](x);}', 'for(let x of [1]){x.constructor();}', 'const a=[...[]];']) expect(() => compileDebugger(draft(source))).toThrow('noch nicht unterstützt');
  expect(() => compileDebugger(draft('function f(){return 1;} {let f=2;f();}'))).not.toThrow();
});

test('Differential: Funktionen/return, Hoisting, Rekursion, Schleifen, ASI, break/continue und Completion', async () => {
  const quick = await newQuickJSWASMModuleFromVariant(variant);
  const sources = [
    'function f(n){let x=n+1;return x;}console.log(f(2));',
    'let hits=0;function f(){return ++hits;}function g(){return f();}console.log(g(),hits);',
    'console.log(f(3));function f(x){return x*2;}',
    'function f(n){if(n===0)return 0;let p=f(n-1);return p+n;}console.log(f(4));',
    'function f(n){if(n<0)return;return n;}console.log(f(-1),f(2));',
    'function f(){"use strict";return\n15;}console.log(f());',
    'function f(){let x=1;}console.log(f());',
    'let x=1;function f(x){{let x=3;console.log(x);}return x;}console.log(f(2),x);',
    'let s=0;for(let i=0;i<5;i++){if(i===1)continue;if(i===4)break;s+=i;}console.log(s);',
    'let n=0;while(++n<3){console.log(n);}console.log(n);',
    'let n=0;do{n++;if(n===2)continue;console.log(n);}while(n<3);',
    'let n=0;for(;n<3;n++)console.log(n);',
    'let s=0;for(const x of [])s+=x;for(const x of [2,3,4])s+=x;console.log(s);',
    'let x=0;for(x of [2,3]){console.log(x);}console.log(x);',
    'let n=0;for(let i=0;i<3;i++){for(let j=0;j<3;j++){if(j===1)break;n++;}}console.log(n);',
    'function yes(n){return n<2;}let n=0;while(yes(n)){n++;}console.log(n);',
    '3;for(let i=0;i<2;i++){i+5;}', '3;while(false){}', 'for(const x of [1,2]){x;break;}',
    'function f(){return 7;} f();', 'do {3;} while(false);', 'let n=0;for(;;){if(++n===2)break;}n;',
    'function f(x){return x+1;}function g(x){return x*2;}console.log(f(g(2)),g(f(3)),typeof f);',
    'function check(i){return i<2;}for(let i=0;check(i);i++){let x=i;}',
  ];
  for (const source of sources) {
    const compiled = compileDebugger(draft(source)); validateDebugArtifact(compiled, DEBUG_LIMITS); const results = [];
    for (const instrumented of [false, true]) {
      const runtime = quick.newRuntime(); runtime.setMemoryLimit(DEBUG_LIMITS.heapBytes); runtime.setMaxStackSize(DEBUG_LIMITS.stackBytes); const vm = runtime.newContext();
      let boot = vm.evalCode('var __logs=[];var __snapshots=[];globalThis.console={log:(...args)=>{__logs.push(args.map(x=>String(x)).join(" "));}};'); boot.value.dispose();
      if (instrumented) { boot = vm.evalCode('(' + installDebugger.toString() + ')((text)=>{__snapshots.push(text);},(text)=>{__logs.push(text);},' + JSON.stringify(DEBUG_LIMITS) + ')'); vm.setProp(vm.global, compiled.helper, boot.value); boot.value.dispose(); }
      const result = vm.evalCode(instrumented ? compiled.code : source, 'probe.js');
      expect(result.error, source).toBeUndefined(); const value = vm.dump(result.value); result.value.dispose();
      const log = vm.evalCode('JSON.stringify(__logs)'); const logs = vm.getString(log.value); log.value.dispose();
      if (instrumented) {
        const data = vm.evalCode('JSON.stringify(__snapshots)'); const snapshots = JSON.parse(vm.getString(data.value)).map(JSON.parse); data.value.dispose();
        for (const snapshot of snapshots) expect(validateDebugSnapshot(snapshot, compiled.points[snapshot.point], DEBUG_LIMITS, compiled), source).toBe(true);
        const nested = snapshots.find(snapshot => snapshot.frames.length > 1);
        if (nested) for (const mutate of [s => { s.frames[1].id = 0; }, s => { s.frames[1].functionId = 0; }, s => { s.frames[0].point = s.point; }, s => { s.frames[1].scopes = []; }]) {
          const bad = structuredClone(nested); mutate(bad); expect(validateDebugSnapshot(bad, compiled.points[bad.point], DEBUG_LIMITS, compiled)).toBe(false);
        }
      }
      results.push({ value, logs }); vm.dispose(); runtime.dispose();
    }
    expect(results[1], source).toEqual(results[0]);
  }
});

test('Mobil: Aufrufauswahl und Verlassen per Tastatur ohne Überbreite', async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 }); await open(page, simple); await start(page); await click(page, 'Einzelner Schritt'); await at(page, 1);
  const out = region(page).getByRole('button', { name: 'Funktion verlassen', exact: true }); await out.focus(); await page.keyboard.press('Enter'); await at(page, 7); await expect(out).toBeDisabled();
  const name = 'f'.repeat(128); await region(page).getByRole('textbox', { name: 'Eigener Debugcode', exact: true }).fill('function ' + name + '(n){return n;} let x=' + name + '(1);'); await start(page); await click(page, 'Einzelner Schritt');
  await expect(values(page)).toContainText('Funktion ' + name);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); await region(page).screenshot({ path: info.outputPath('debugger-funktionen-mobil.png') });
});

test('Electron: eigene Funktion und Schleife mit Aufrufschritten, anschließend Neustart @desktop', async ({}, info) => {
  test.skip(process.platform !== 'win32', 'Windows-Electron'); test.setTimeout(90000);
  const source = 'function sum(n){\n let s=0;\n for(let i=0;i<n;i++){s+=i;}\n return s;\n}\nlet ergebnis=sum(4);\nconsole.log(ergebnis);';
  const profile = info.outputPath('profil'), env = { ...process.env, DATABASE_URL: '', AZUBIPREP_AI_DIR: path.join(profile, 'ki'), AZUBIPREP_RAG_DIR: path.join(profile, 'rag') }; delete env.ELECTRON_RUN_AS_NODE;
  const options = { executablePath: path.join(repo, 'desktop/node_modules/electron/dist/electron.exe'), args: [path.join(repo, 'desktop'), `--user-data-dir=${profile}`], env }; let app;
  try {
    app = await _electron.launch(options); let page = await app.firstWindow(); await page.waitForURL(/^http:/); await open(page, source, new URL(page.url()).origin + '/frontendkurs'); await start(page); await click(page, 'Einzelner Schritt'); await expect(values(page)).toContainText('Funktion sum'); await click(page, 'Funktion verlassen'); await at(page, 7); await click(page, 'Weiter / bis zum nächsten Haltepunkt'); await expect(region(page).getByLabel('Debugkonsole')).toHaveText('6');
    await expect(page.locator('.pilot-status')).toHaveText('Gespeichert'); await app.close(); app = null;
    app = await _electron.launch(options); page = await app.firstWindow(); await page.waitForURL(/^http:/); await unterdrueckeOnboardingPopups(page); await page.goto(new URL(page.url()).origin + '/frontendkurs'); await openDebugger(page); await expect(values(page)).toContainText('Noch kein Halt'); await expect(region(page).getByRole('textbox', { name: 'Eigener Debugcode', exact: true })).toHaveValue(source);
  } finally { if (app) await app.close(); }
});
