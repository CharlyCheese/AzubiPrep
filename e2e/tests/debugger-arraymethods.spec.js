import { test, expect, _electron } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileDebugger } from '../../frontend/src/pilot/debugger-compiler.js';
import { DEBUG_LIMITS, installDebugger, validateDebugSnapshot } from '../../frontend/src/pilot/debugger-core.js';
import variant from '../../frontend/node_modules/@jitl/quickjs-singlefile-browser-release-sync/dist/index.mjs';
import { newQuickJSWASMModuleFromVariant } from '../../frontend/node_modules/quickjs-emscripten-core/dist/index.mjs';
import { unterdrueckeOnboardingPopups, openDebugger } from './helpers.js';

test.use({ serviceWorkers: 'block' });
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const draft = source => ({ schema: 1, name: 'listen.js', source });
const region = page => page.getByRole('region', { name: 'Debugger-Technikpilot', exact: true });
const status = page => region(page).getByLabel('Debugstatus', { exact: true });
const values = page => region(page).getByRole('region', { name: 'Debugvariablen', exact: true });
const click = (page, name) => region(page).getByRole('button', { name, exact: true }).click();
const go = page => click(page, 'Weiter / bis zum nächsten Haltepunkt');
async function open(page, source, url = '/frontendkurs') {
  await unterdrueckeOnboardingPopups(page); await page.goto(url); await openDebugger(page); await region(page).getByLabel('Eigener Debugcode', { exact: true }).fill(source);
}
async function start(page) { await click(page, 'Debuggen starten'); await expect(status(page)).toContainText('Angehalten'); }
const example = 'const liste=[2,3];\nlet laenge=liste.push(4);\nliste.unshift(1);\nlet erster=liste.shift();\nlet letzter=liste.pop();\nlet kopie=liste.slice(0,1);\nlet enthalten=liste.includes(3);\nlet position=liste.indexOf(3);\nconsole.log(laenge,erster,letzter,kopie.join("-"),enthalten,position,liste.join("-"));';

test('Browser: Listen ergänzen/entfernen, Kopie, Suche und Text mit allen acht Methoden', async ({ page }) => {
  await open(page, example); await start(page); await go(page); await expect(status(page)).toContainText('Programm ist beendet');
  await expect(region(page).getByLabel('Debugkonsole')).toHaveText('3 1 4 2 true 1 2-3'); await expect(values(page).locator('tbody tr').filter({ hasText: /^listeopaque/ })).toContainText('[Nicht inspiziert]');
});

test('Argumentfunktion pausiert; Methodenauswahl und ursprünglicher Empfänger bleiben bei Namenswechsel erhalten', async ({ page }) => {
  const source = 'let a=[1];\nconst alt=a;\nlet aufrufe=0;\nfunction wert(){aufrufe++;a=[9];return 2;}\nlet laenge=a.push(wert());\nlet text=alt.join("-");\nconsole.log(laenge,text,a.join("-"),aufrufe);';
  await open(page, source); await start(page); const point = compileDebugger(draft(source)).points.find(item => item.line === 5 && item.kind === 'statement');
  await click(page, `Debug-Haltepunkt Zeile ${point.line} Spalte ${point.column}`); await go(page); await expect(status(page)).toContainText(':5:'); await click(page, 'Einzelner Schritt'); await expect(values(page)).toContainText('Funktion wert');
  await click(page, 'Funktion verlassen'); await expect(status(page)).toContainText(':6:'); await expect(region(page).getByLabel('Debugkonsole')).toHaveText('Noch keine Ausgabe.'); await go(page); await expect(region(page).getByLabel('Debugkonsole')).toHaveText('2 1-2 9 1');
});

test('Positivliste verhindert spätere Callbacksyntax, berechnete und interne Methodenaufrufe', async () => {
  for (const source of [
    'let a=[];a["push"](1);', 'let a=[];a["p"+"ush"](1);',
    'let a=[];a.push.constructor("return 1")();',
    'let a=[];a.map(async n=>n);', 'let a=[];a.filter(async n=>n);', 'let a=[];a.reduce((...n)=>n);',
    'let a=[];a.__azubi_dbg_checkpoint();', 'let a=[];a.push(...[1]);',
  ]) expect(() => compileDebugger(draft(source)), source).toThrow('noch nicht unterstützt');
});

async function raw(page, source) {
  const artifact = compileDebugger(draft(source)), asset = fs.readdirSync(path.join(repo, 'frontend/dist/assets')).find(name => /^debugger\.worker-.*\.js$/.test(name));
  return page.evaluate(({ artifact, asset }) => new Promise(resolve => {
    const worker = new Worker('/assets/' + asset, { type: 'module' }), events = []; let commandId = 0;
    const timer = setTimeout(() => { worker.terminate(); resolve([{ type: 'timeout' }]); }, 14000);
    worker.onmessage = ({ data }) => { events.push(data); if (data.type === 'paused') worker.postMessage({ type: 'control', session: 'test', revision: 'rev', commandId: ++commandId, pauseId: data.pauseId, mode: 'continue' }); if (data.type === 'done' || data.type === 'error') { clearTimeout(timer); worker.terminate(); resolve(events); } };
    worker.postMessage({ type: 'start', session: 'test', revision: 'rev', artifact });
  }), { artifact, asset });
}

test('Nur echte native Arrays; Objekt-/Stringempfänger, Methodenfelder und Auslese sind kein Umweg', async ({ page }) => {
  await open(page, 'let x=1;');
  for (const source of [
    'let a={push:1};a.push(2);console.log("NICHT");',
    'let a="abc";a.slice(1);console.log("NICHT");',
    'let a=[];let k="push";let f=a[k];console.log("NICHT");',
    'let a=[];a.push=1;console.log("NICHT");',
    'let a=[];let f=a.push;f(1);console.log("NICHT");',
    'let a=[];a.push.call(a,1);console.log("NICHT");',
    'let a=[];a.sort();console.log("NICHT");',
  ]) { const events = await raw(page, source); expect(events.at(-1).type, source).toBe('error'); expect(events.some(event => event.type === 'log')).toBe(false); }
  const events = await raw(page, 'let a=[];a.push(1);console.log(a.join("-"));'); expect(events.at(-1).type).toBe('done'); expect(events.filter(event => event.type === 'log').map(event => event.text)).toEqual(['1']);
});

async function evaluate(quick, source, compiled = null) {
  const runtime = quick.newRuntime(); runtime.setMemoryLimit(DEBUG_LIMITS.heapBytes); runtime.setMaxStackSize(DEBUG_LIMITS.stackBytes); const vm = runtime.newContext();
  let boot = vm.evalCode('var __logs=[],__snapshots=[];var __testString=String,__testStringify=JSON.stringify;globalThis.console={log:(...args)=>{__logs.push(args.map(x=>x===null?"null":["number","string","boolean","undefined"].includes(typeof x)?__testString(x):"[Nicht inspiziert]").join(" "));}};'); boot.value.dispose();
  if (compiled) { boot = vm.evalCode('(' + installDebugger.toString() + ')((text)=>__snapshots.push(text),(text)=>{__logs.push(text);},' + JSON.stringify(DEBUG_LIMITS) + ')'); vm.setProp(vm.global, compiled.helper, boot.value); boot.value.dispose(); }
  const result = vm.evalCode(compiled ? compiled.code : source, 'listen.js'); let error = null, value;
  if (result.error) { const name = vm.getProp(result.error, 'name'); error = vm.getString(name); name.dispose(); result.error.dispose(); }
  else { value = vm.dump(result.value); result.value.dispose(); }
  const data = vm.evalCode('__testStringify({logs:__logs,snapshots:__snapshots})'); const parsed = JSON.parse(vm.getString(data.value)); data.value.dispose();
  if (compiled) for (const text of parsed.snapshots) { const snapshot = JSON.parse(text); expect(validateDebugSnapshot(snapshot, compiled.points[snapshot.point], DEBUG_LIMITS, compiled)).toBe(true); }
  vm.dispose(); runtime.dispose(); return { error, value, logs: parsed.logs };
}

test('Differential: native Rückgaben, Mutation/Kopie, Vergleich, Koerzierung, Auswertungsreihenfolge und Shadowing', async () => {
  const quick = await newQuickJSWASMModuleFromVariant(variant);
  for (const source of [
    example,
    'let a=[];console.log(a.pop(),a.shift(),a.push(),a.unshift(),a.length,a.join());',
    'let a=[1];console.log(a.push(2,3),a.unshift(-1,0),a.join("|"),a.pop(),a.shift(),a.join());',
    'let a=[1,2,3];let b=a.slice(-2);b[0]=8;console.log(a.join(),b.join(),a.slice(9).length);',
    'let p={x:1};let a=[p];let b=a.slice();b[0].x++;console.log(a[0]===b[0],p.x);',
    'let a=[NaN,-0,undefined];console.log(a.includes(NaN),a.indexOf(NaN),a.includes(0),a.indexOf(0));',
    'let a=[1,2,1];console.log(a.includes(1,1),a.indexOf(1,1),a.includes(1,-1),a.indexOf(2,-2));',
    'let a=[];a.length=3;console.log(a.includes(undefined),a.indexOf(undefined),a.join("-"));',
    'let a=[null,undefined,3];console.log(a.join(),a.join(null),a.join({x:1}));',
    'let a=[[1,2],[3]];console.log(a.join(";"));',
    'let a=[];a[0]=a;console.log(a.join());',
    'let a=[1];let alt=a;function f(){a=[9];return 2;}console.log(a.push(f()),alt.join(),a.join());',
    'let a=[];function base(){console.log("base");return a;}function x(n){console.log(n);return n;}console.log(base().push(x(1),x(2)),a.join());',
    'let a=[1,2];function arg(){a[0]=7;return 0;}console.log(a.slice(arg()).join(),a.join());',
    'let a=[1,2,3];console.log(a.slice(1).join("-"));',
    'let a=[{x:1}];console.log(a.pop().x,a.length);',
    'let Array=0;let Object=0;let Reflect=0;let TypeError=0;let Error=0;let a=[];a.push(1);console.log(a.join());',
    'let a=[1,2];function sep(){console.log("sep");return "|";}console.log(a.join(sep()));',
    'let a=[1,2];function unused(){console.log("arg");return 9;}console.log(a.pop(unused()),a.join());',
    'let a=[1];a.push(2);', '"use strict";let a=[];console.log(a.push(1),a.join());',
    'let a=[];a.length=4294967295;a.push(1);',
  ]) expect(await evaluate(quick, source, compileDebugger(draft(source))), source).toEqual(await evaluate(quick, source));
});

test('Ressourcenbegrenzung nativer Methoden; nach Überlast läuft eine frische Sitzung', async ({ page }) => {
  await open(page, 'let a=[];a.length=1000000000;a.join("-");'); await start(page); const begin = Date.now(); await go(page); await expect(region(page).getByLabel('Debugfehler')).toBeVisible(); expect(Date.now() - begin).toBeLessThan(7000);
  await region(page).getByLabel('Eigener Debugcode', { exact: true }).fill('let a=[1,2];console.log(a.join("-"));'); await start(page); await go(page); await expect(region(page).getByLabel('Debugkonsole')).toHaveText('1-2');
});

test('Electron: Array-Methoden mit eigenen Argumentfunktionen lokal ausführen @desktop', async ({}, info) => {
  test.skip(process.platform !== 'win32', 'Windows-Electron'); test.setTimeout(60000);
  const profile = info.outputPath('profil'), env = { ...process.env, DATABASE_URL: '', AZUBIPREP_AI_DIR: path.join(profile, 'ki'), AZUBIPREP_RAG_DIR: path.join(profile, 'rag') }; delete env.ELECTRON_RUN_AS_NODE;
  let app;
  try { app = await _electron.launch({ executablePath: path.join(repo, 'desktop/node_modules/electron/dist/electron.exe'), args: [path.join(repo, 'desktop'), `--user-data-dir=${profile}`], env }); const page = await app.firstWindow(); await page.waitForURL(/^http:/); await open(page, 'const a=[];function wert(){return 3;}a.push(wert());console.log(a.join("-"));', new URL(page.url()).origin + '/frontendkurs'); await start(page); await go(page); await expect(region(page).getByLabel('Debugkonsole')).toHaveText('3'); }
  finally { if (app) await app.close(); }
});
