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
const draft = source => ({ schema: 1, name: 'closures.js', source });
const region = page => page.getByRole('region', { name: 'Debugger-Technikpilot', exact: true });
const status = page => region(page).getByLabel('Debugstatus', { exact: true });
const values = page => region(page).getByRole('region', { name: 'Debugvariablen', exact: true });
const stack = page => region(page).getByRole('group', { name: 'Debug-Aufrufkette' });
const click = (page, name) => region(page).getByRole('button', { name, exact: true }).click();
const go = page => click(page, 'Weiter / bis zum nächsten Haltepunkt');
async function open(page, source, url = '/frontendkurs') { await unterdrueckeOnboardingPopups(page); await page.goto(url); await openDebugger(page); await region(page).getByLabel('Eigener Debugcode', { exact: true }).fill(source); }
async function start(page) { await click(page, 'Debuggen starten'); await expect(status(page)).toContainText('Angehalten'); }
async function breakpoint(page, source, line, kind = 'statement') { const point = compileDebugger(draft(source)).points.find(item => item.line === line && item.kind === kind); expect(point).toBeTruthy(); await click(page, `Debug-Haltepunkt Zeile ${point.line} Spalte ${point.column}`); }
const counter = 'function zaehler(start){\n let wert=start;\n return schritt=>{\n  wert+=schritt;\n  return wert;\n };\n}\nconst a=zaehler(10);\nconst alias=a;\nconst b=zaehler(100);\nconsole.log(a(2));\nconsole.log(alias(3));\nconsole.log(b(1));';

test('Gespeicherte Funktion und eigener Callback: Hinein/Über/Aus und Haltepunkt derselben Ausführung', async ({ page }) => {
  const source = 'const doppelt=n=>{\n return n*2;\n};\nfunction anwenden(fn,n){\n return fn(n);\n}\nconst alias=doppelt;\nconst ergebnis=anwenden(alias,3);\nconsole.log(ergebnis);';
  await open(page, source); await start(page); await click(page, 'Einzelner Schritt'); await expect(status(page)).toContainText(':7:'); await click(page, 'Einzelner Schritt'); await expect(status(page)).toContainText(':8:');
  await click(page, 'Einzelner Schritt'); await expect(stack(page).getByRole('button')).toHaveCount(2); await expect(values(page)).toContainText('anwenden'); await click(page, 'Einzelner Schritt'); await expect(status(page)).toContainText(':5:');
  await breakpoint(page, source, 2, 'return'); await click(page, 'Funktion überspringen'); await expect(status(page)).toContainText(':2:'); await expect(stack(page).getByRole('button')).toHaveCount(3); await expect(values(page).locator('tbody tr').filter({ hasText: /^nnumber3$/ })).toHaveCount(1);
  await stack(page).getByRole('button', { name: /^anwenden ·/ }).click(); await expect(values(page).locator('tbody tr').filter({ hasText: /^nnumber3$/ })).toHaveCount(1); await expect(values(page)).toContainText('[Nicht inspiziert]');
  await stack(page).getByRole('button', { name: /^doppelt ·/ }).click();
  await breakpoint(page, source, 2, 'return'); await click(page, 'Funktion verlassen'); await expect(stack(page).getByRole('button')).toHaveCount(1); await go(page); await expect(region(page).getByLabel('Debugkonsole')).toHaveText('6');
});

test('Zurückgegebene Closure: lebende äußere Bindung, geteilte Aliasse und unabhängiger Zustand ohne alten Frame', async ({ page }) => {
  await open(page, counter); await start(page); await breakpoint(page, counter, 4);
  for (const wert of [10, 12, 100]) {
    await go(page); await expect(status(page)).toContainText(':4:'); await expect(stack(page).getByRole('button')).toHaveCount(2);
    await expect(stack(page).getByRole('button', { name: /^zaehler ·/ })).toHaveCount(0);
    await expect(values(page).locator('details').filter({ has: page.locator('summary', { hasText: 'Funktion zaehler · äußere Bindungen' }) })).toContainText('wert');
    await expect(values(page).locator('tbody tr').filter({ hasText: new RegExp('^wertnumber' + wert + '$') })).toHaveCount(1);
    await expect(region(page).getByLabel('Debugkonsole')).toHaveText(wert === 10 ? 'Noch keine Ausgabe.' : wert === 12 ? '12' : '12\n15');
  }
  await go(page); await expect(status(page)).toContainText('Programm ist beendet'); await expect(region(page).getByLabel('Debugkonsole')).toHaveText('12\n15\n101');
});

async function raw(page, source, limits = {}, mode = 'continue', tamper = null) {
  const artifact = compileDebugger(draft(source)), asset = fs.readdirSync(path.join(repo, 'frontend/dist/assets')).find(name => /^debugger\.worker-.*\.js$/.test(name));
  return page.evaluate(({ artifact, asset, limits, mode, tamper }) => new Promise(resolve => {
    if (tamper) artifact.code = tamper;
    const worker = new Worker('/assets/' + asset, { type: 'module' }), events = []; let commandId = 0;
    const timer = setTimeout(() => { worker.terminate(); resolve([{ type: 'timeout' }]); }, 14000);
    worker.onmessage = ({ data }) => { events.push(data); if (data.type === 'paused') worker.postMessage({ type: 'control', session: 'test', revision: 'rev', commandId: ++commandId, pauseId: data.pauseId, mode }); if (data.type === 'done' || data.type === 'error') { clearTimeout(timer); worker.terminate(); resolve(events); } };
    worker.postMessage({ type: 'start', session: 'test', revision: 'rev', artifact, limits });
  }), { artifact, asset, limits, mode, tamper });
}

test('For-let-Closures und Caller-Kontext behalten echte Umgebungen und gültige Snapshots', async ({ page }) => {
  await open(page, 'let x=1;');
  const source = 'const f=[];for(let i=0;i<2;i++){f.push(()=>i);}const a=f[0];const b=f[1];console.log(a(),b());', artifact = compileDebugger(draft(source));
  const events = await raw(page, source, {}, 'step'); expect(events.at(-1).type).toBe('done'); expect(events.filter(event => event.type === 'log').map(event => event.text)).toEqual(['0 1']);
  const entries = events.filter(event => event.type === 'paused' && artifact.points[event.point].kind === 'entry'); expect(entries).toHaveLength(2);
  for (const [index, event] of entries.entries()) {
    expect(validateDebugSnapshot(event.snapshot, artifact.points[event.point], DEBUG_LIMITS, artifact)).toBe(true);
    const top = event.snapshot.frames.at(-1); expect(top.scopes.flatMap(scope => scope.values).find(item => item.name === 'i').display).toBe(String(index));
    expect(artifact.points[top.point].scopes.find(scope => scope.names.includes('i')).captured).toBe(true);
    expect(artifact.points[event.snapshot.frames[0].point].kind).toBe('context');
  }
});

async function evaluate(quick, source, compiled = null) {
  const runtime = quick.newRuntime(); runtime.setMemoryLimit(DEBUG_LIMITS.heapBytes); runtime.setMaxStackSize(DEBUG_LIMITS.stackBytes); const vm = runtime.newContext();
  let boot = vm.evalCode('var __logs=[],__snapshots=[];var __testString=String,__testStringify=JSON.stringify;globalThis.console={log:(...args)=>{__logs.push(args.map(x=>x===null?"null":["number","string","boolean","undefined"].includes(typeof x)?__testString(x):"[Nicht inspiziert]").join(" "));}};'); boot.value.dispose();
  if (compiled) { boot = vm.evalCode('(' + installDebugger.toString() + ')((text)=>__snapshots.push(text),(text)=>{__logs.push(text);},' + JSON.stringify(DEBUG_LIMITS) + ')'); vm.setProp(vm.global, compiled.helper, boot.value); boot.value.dispose(); }
  const result = vm.evalCode(compiled ? compiled.code : source, 'closures.js'); let error = null, value;
  if (result.error) { const name = vm.getProp(result.error, 'name'); error = vm.getString(name); name.dispose(); result.error.dispose(); } else { value = vm.dump(result.value); result.value.dispose(); }
  const data = vm.evalCode('__testStringify({logs:__logs,snapshots:__snapshots})'), parsed = JSON.parse(vm.getString(data.value)); data.value.dispose();
  if (compiled) for (const text of parsed.snapshots) { const snapshot = JSON.parse(text); expect(validateDebugSnapshot(snapshot, compiled.points[snapshot.point], DEBUG_LIMITS, compiled), source).toBe(true); }
  vm.dispose(); runtime.dispose(); return { error, value, logs: parsed.logs };
}

test('Differential: Funktionsidentität, eigene HOFs, Closures, TDZ, Completion und Aufrufreihenfolge', async () => {
  const quick = await newQuickJSWASMModuleFromVariant(variant);
  const cases = [
    counter, 'const f=n=>n*2;const alias=f;console.log(alias===f,typeof f,!f,[1,2].map(alias).join());',
    'const f=function(n){return n+1;};console.log(f(2));',
    'function f(n){return n+1;}const alias=f;console.log(alias(3),alias===f);',
    'function anwenden(fn,n){return fn(n);}console.log(anwenden(n=>n*2,3));',
    'function baue(x){return y=>x+y;}console.log(baue(2)(3));',
    'function baue(){let n=0;return {plus:()=>++n,lesen:()=>n};}const a=baue();console.log(a.plus(),a.lesen(),a.plus());',
    'const f=[];for(let i=0;i<3;i++){f.push(()=>i);}const a=f[0];const b=f[1];const c=f[2];console.log(a(),b(),c());',
    'const f=[];for(const n of [2,3]){f.push(()=>n);}console.log(f.map(fn=>fn()).join());',
    'let f;{let x=2;f=()=>x;x=3;}console.log(f());',
    'let f;{f=()=>x;let x=2;}console.log(f());',
    'let f;{f=()=>x;f();let x=2;}',
    'function baue(){let fn=()=>n;let n=2;return fn;}console.log(baue()());',
    'let x=100;const f=x=>()=>x;const g=f(3);console.log(g(),x);',
    'let f=n=>n+1;const a=f;f=n=>n+2;console.log(a(1),f(1));',
    'const f=n=>n;const obj={f};console.log(obj.f===f,obj.f(2));obj.f=n=>n*2;console.log(obj.f(3));',
    'let obj={f:n=>typeof n};console.log(obj.f(obj.f=n=>n*2),obj.f(3));',
    'const obj={f:n=>n+1};function arg(){obj.f=n=>n*2;return 3;}console.log(obj.f(arg()),obj.f(3));',
    'const a={f:1};a.f(console.log("arg"));', 'const a={map:1};a.map(console.log("arg"));',
    'const a=null;a.f(console.log("NICHT"));', 'const a=undefined;a.map(console.log("NICHT"));',
    'let f=2;f(console.log("arg"));', 'const a={x:1};a.x(console.log("arg"));',
    '[].map();', '[].filter(1);',
    'let f=()=>1;console.log((true?f:()=>2)());',
    'let Array=0;let WeakSet=0;let Object=0;let Reflect=0;let Symbol=0;let Error=0;const f=()=>2;console.log(f());',
    '"use strict";const f=function(n){"use strict";return n+1;};console.log(f(2));',
    'const f=()=>{return\n 2;};console.log(f());', '"use strict";const f=()=>1;',
    'const f=()=>f();', 'const f=()=>2;console.log(f);',
  ];
  for (const method of ['push','pop','shift','unshift','slice','includes','indexOf','join','map','filter','forEach','some','every','find','reduce']) cases.push('const obj={' + method + ':()=>3};console.log(obj.' + method + '());');
  for (const source of cases) expect(await evaluate(quick, source, compileDebugger(draft(source))), source).toEqual(await evaluate(quick, source));
});

test('Funktionskonvertierung, Reflexion und unregistrierte Werte geben keinen generierten Quelltext frei', async ({ page }) => {
  await open(page, 'let x=1;');
  for (const source of ['const f=()=>1;console.log(""+f);','function f(){return 1;}const a=f;console.log(+a);','const f=()=>1;console.log([f].join());','const f=()=>1;console.log(f>0);','function weiter(fn){console.log([fn].join());}weiter(()=>1);']) {
    const events = await raw(page, source); expect(events.at(-1).type, source).toBe('error'); expect(events.filter(event => event.type === 'log'), source).toEqual([]);
    expect(JSON.stringify(events).includes('__azubi_dbg_checkpoint')).toBe(false);
  }
  for (const source of ['const f=()=>1;f.constructor;','const f=()=>1;f["toString"]();','const f=()=>1;f.toString();','const f=()=>globalThis;','const f=async()=>1;','function outer(){function inner(){}return inner;}','const f=function benannt(){return 1;};']) expect(() => compileDebugger(draft(source)), source).toThrow('noch nicht unterstützt');
  for (const source of ['const f=()=>1;f.call(null);','const f=()=>1;f.bind(null);','const f=()=>1;console.log(f.name);','const f=()=>1;console.log(f.length);']) {
    const events = await raw(page, source); expect(events.at(-1).type, source).toBe('error'); expect(events.filter(event => event.type === 'log'), source).toEqual([]);
  }
  for (const code of ['__azubi_dbg_checkpoint.call(0,[],()=>1,[]);','__azubi_dbg_checkpoint.bound(0,[],{f:()=>1},"f")();']) {
    const events = await raw(page, 'let x=1;', {}, 'continue', code); expect(events.at(-1).type).toBe('error');
  }
  const opaque = await raw(page, 'const f=()=>1;console.log(f,typeof f,f===f);'); expect(opaque.filter(event => event.type === 'log').map(event => event.text)).toEqual(['[Nicht inspiziert] function true']);
});

test('Closure-Limits, Stop und Quellwechsel entfernen VM und Captures; frischer Lauf startet sauber', async ({ page }) => {
  await open(page, counter); const limited = await raw(page, counter, { pauses: 2 }, 'step'); expect(limited.at(-1).type).toBe('error');
  const recursive = await raw(page, 'const f=()=>f();f();', { frames: 4 }); expect(recursive.at(-1).type).toBe('error');
  await start(page); await breakpoint(page, counter, 4); await go(page); await click(page, 'Debuggen stoppen'); await expect(status(page)).toContainText('gestoppt');
  await start(page); await breakpoint(page, counter, 4); await go(page); await expect(status(page)).toContainText(':4:'); await region(page).getByLabel('Eigener Debugcode', { exact: true }).fill('const f=()=>7;console.log(f());'); await expect(values(page)).toContainText('Noch kein Halt'); await start(page); await go(page); await expect(region(page).getByLabel('Debugkonsole')).toHaveText('7');
});

test('Electron: Closure nach Erzeugerrückkehr pausieren; Neustart speichert nur Quelltext @desktop', async ({}, info) => {
  test.skip(process.platform !== 'win32', 'Windows-Electron'); test.setTimeout(90000);
  const profile = info.outputPath('profil'), env = { ...process.env, DATABASE_URL: '', AZUBIPREP_AI_DIR: path.join(profile,'ki'), AZUBIPREP_RAG_DIR: path.join(profile,'rag') }; delete env.ELECTRON_RUN_AS_NODE;
  const options = { executablePath: path.join(repo,'desktop/node_modules/electron/dist/electron.exe'), args: [path.join(repo,'desktop'), `--user-data-dir=${profile}`], env }; let app;
  try {
    app = await _electron.launch(options); let page = await app.firstWindow(); await page.waitForURL(/^http:/); await open(page, counter, new URL(page.url()).origin + '/frontendkurs'); await start(page); await breakpoint(page, counter, 4); await go(page); await expect(values(page)).toContainText('äußere Bindungen'); await expect(stack(page).getByRole('button')).toHaveCount(2); await breakpoint(page, counter, 4); await go(page); await expect(region(page).getByLabel('Debugkonsole')).toHaveText('12\n15\n101'); await expect(page.locator('.pilot-status')).toHaveText('Gespeichert'); await app.close(); app = null;
    app = await _electron.launch(options); page = await app.firstWindow(); await page.waitForURL(/^http:/); await unterdrueckeOnboardingPopups(page); await page.goto(new URL(page.url()).origin + '/frontendkurs'); await openDebugger(page); await expect(values(page)).toContainText('Noch kein Halt'); await expect(region(page).getByLabel('Eigener Debugcode', { exact: true })).toHaveValue(counter);
  } finally { if (app) await app.close(); }
});
