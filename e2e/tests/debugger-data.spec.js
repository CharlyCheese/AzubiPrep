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
const draft = source => ({ schema: 1, name: 'daten.js', source });
const region = page => page.getByRole('region', { name: 'Debugger-Technikpilot', exact: true });
const status = page => region(page).getByLabel('Debugstatus', { exact: true });
const values = page => region(page).getByRole('region', { name: 'Debugvariablen', exact: true });
const click = (page, name) => region(page).getByRole('button', { name, exact: true }).click();
const go = page => click(page, 'Weiter / bis zum nächsten Haltepunkt');
async function open(page, source, url = '/frontendkurs') {
  await unterdrueckeOnboardingPopups(page); await page.goto(url); await openDebugger(page);
  await region(page).getByRole('textbox', { name: 'Eigener Debugcode', exact: true }).fill(source);
}
async function start(page) { await click(page, 'Debuggen starten'); await expect(status(page)).toContainText('Angehalten'); }
async function breakpoint(page, source, line) {
  const point = compileDebugger(draft(source)).points.find(item => item.line === line && item.kind === 'statement');
  await click(page, `Debug-Haltepunkt Zeile ${point.line} Spalte ${point.column}`);
}
const example = 'const person = {name:"Alex",alter:17};\nconst zahlen=[2,3,4];\nlet summe=0;\nfor(let i=0;i<zahlen.length;i++){\n summe+=zahlen[i];\n}\nfunction geburtstag(p){p.alter++;return p.alter;}\nlet alter=geburtstag(person);\nconsole.log(person.name,alter,summe,zahlen.length);';

test('Daten im Browser: Arrayindex/length, Objektfelder und Mutation über eigene Funktion', async ({ page }) => {
  await open(page, example); await start(page); await breakpoint(page, example, 5);
  for (const index of [0, 1, 2]) {
    await go(page); await expect(status(page)).toContainText('uebung.js:5:');
    await expect(values(page).locator('tbody tr').filter({ hasText: new RegExp('^inumber' + index + '$') })).toHaveCount(1);
    await expect(values(page).locator('tbody tr').filter({ hasText: /^zahlenopaque/ })).toContainText('[Nicht inspiziert]');
    await expect(values(page)).not.toContainText('Alex');
  }
  await go(page); await expect(status(page)).toContainText('Programm ist beendet'); await expect(region(page).getByLabel('Debugkonsole')).toHaveText('Alex 18 9 3');
});

test('Zusammengesetzte Feldzuweisung pausiert in RHS-Funktion und setzt dieselbe Referenz einmal fort', async ({ page }) => {
  const source = 'let aufrufe=0;\nconst daten={wert:1};\nfunction berechne(){aufrufe++;return 2;}\ndaten.wert+=berechne();\nlet wert=daten.wert;\nconsole.log(wert,aufrufe);';
  await open(page, source); await start(page); await breakpoint(page, source, 4); await go(page); await expect(status(page)).toContainText(':4:');
  await click(page, 'Einzelner Schritt'); await expect(values(page)).toContainText('Funktion berechne'); await expect(region(page).getByLabel('Debugkonsole')).toHaveText('Noch keine Ausgabe.');
  await click(page, 'Funktion verlassen'); await expect(status(page)).toContainText(':5:'); await go(page); await expect(region(page).getByLabel('Debugkonsole')).toHaveText('3 1');
});

async function runWorker(page, source, limits = {}) {
  const artifact = compileDebugger(draft(source)), asset = fs.readdirSync(path.join(repo, 'frontend/dist/assets')).find(name => /^debugger\.worker-.*\.js$/.test(name));
  return page.evaluate(({ artifact, asset, limits }) => new Promise(resolve => {
    const worker = new Worker('/assets/' + asset, { type: 'module' }), events = []; let commandId = 0;
    const timer = setTimeout(() => { worker.terminate(); resolve([{ type: 'timeout' }]); }, 14000);
    worker.onmessage = ({ data }) => {
      events.push(data); if (data.type === 'paused') worker.postMessage({ type: 'control', session: 'test', revision: 'rev', commandId: ++commandId, pauseId: data.pauseId, mode: 'continue' });
      if (data.type === 'done' || data.type === 'error') { clearTimeout(timer); worker.terminate(); resolve(events); }
    };
    worker.postMessage({ type: 'start', session: 'test', revision: 'rev', artifact, limits });
  }), { artifact, asset, limits });
}

test('Berechnete Schlüssel umgehen Daten-/Prototypgrenzen nicht; frische VM bleibt funktionsfähig', async ({ page }) => {
  await open(page, 'let x=1;');
  for (const source of [
    'let a=[];let k="con"+"structor";let f=a[k];console.log("NICHT");',
    'let a={};let k="__pro"+"to__";a[k]={};console.log("NICHT");',
    'let a={};let k="to"+"String";a[k]=1;console.log("NICHT");',
    'let a=[];let f=a.map;console.log("NICHT");',
    'let a={};let key={};a[key]=1;console.log("NICHT");',
  ]) { const events = await runWorker(page, source); expect(events.at(-1).type, source).toBe('error'); expect(events.some(e => e.type === 'log')).toBe(false); }
  const events = await runWorker(page, 'let a=[];for(let i=0;i<50;i++){a[i]={wert:i};}console.log(a[49].wert);'); expect(events.at(-1).type).toBe('done'); expect(events.filter(e => e.type === 'log').map(e => e.text)).toEqual(['49']);
  const limited = await runWorker(page, 'let a=[];for(let i=0;i<10000;i++){a[i]={wert:i};}', { checkpointHits: 5 }); expect(limited.at(-1).type).toBe('error');
});

test('Geschlossene Datensyntax: keine Methodendefinitionen, Getter oder Introspektionswege', async () => {
  for (const source of [
    'const a={get wert(){return 1;}};', 'const a={set wert(x){}};', 'const a={m(){return 1;}};', 'const a={...{}};',
    'const a={__proto__:{}};', 'const a={"constructor":1};', 'const a={toString:1};', 'const a={["x"]:1};',
    'let a=[];a.constructor;', 'let a={};a["__proto__"];', 'let a={};a.__azubi_dbg_checkpoint;', 'let a=[];a.map(async n=>n);',
    'let a={};delete a.x;',
  ]) expect(() => compileDebugger(draft(source)), source).toThrow('noch nicht unterstützt');
});

async function evaluate(quick, source, compiled = null) {
  const runtime = quick.newRuntime(); runtime.setMemoryLimit(DEBUG_LIMITS.heapBytes); runtime.setMaxStackSize(DEBUG_LIMITS.stackBytes); const vm = runtime.newContext();
  let boot = vm.evalCode('var __logs=[];var __snapshots=[];var __testString=String;var __testStringify=JSON.stringify;globalThis.console={log:(...args)=>{__logs.push(args.map(x=>x===null?"null":["number","string","boolean","undefined"].includes(typeof x)?__testString(x):"[Nicht inspiziert]").join(" "));}};'); boot.value.dispose();
  if (compiled) { boot = vm.evalCode('(' + installDebugger.toString() + ')((text)=>__snapshots.push(text),(text)=>{__logs.push(text);},' + JSON.stringify(DEBUG_LIMITS) + ')'); vm.setProp(vm.global, compiled.helper, boot.value); boot.value.dispose(); }
  const result = vm.evalCode(compiled ? compiled.code : source, 'daten.js'); let error = null, value;
  if (result.error) { const name = vm.getProp(result.error, 'name'); error = vm.getString(name); name.dispose(); result.error.dispose(); }
  else { value = vm.dump(result.value); result.value.dispose(); }
  const data = vm.evalCode('__testStringify({logs:__logs,snapshots:__snapshots})'); const parsed = JSON.parse(vm.getString(data.value)); data.value.dispose();
  if (compiled) for (const text of parsed.snapshots) { const snapshot = JSON.parse(text); expect(validateDebugSnapshot(snapshot, compiled.points[snapshot.point], DEBUG_LIMITS, compiled)).toBe(true); }
  vm.dispose(); runtime.dispose(); return { error, value, logs: parsed.logs };
}

test('Differential: Datenreferenzen, Reihenfolge, Aliase, Operatoren, native Längen und Strict-Modus', async () => {
  const quick = await newQuickJSWASMModuleFromVariant(variant);
  const sources = [
    'let a=[2,3,4];let s=0;for(let i=0;i<a.length;i++){s+=a[i];}console.log(s,a.length);',
    'let alter=17;let p={alter,name:"Alex"};p.alter++;console.log(p.name,p.alter);',
    'let p={daten:{werte:[1,2]}};p.daten.werte[0]+=3;console.log(p.daten.werte[0]);',
    'let a=[2];let i=0;function rhs(){console.log("rhs");return 3;}console.log(a[i++] += rhs(),i,a[0]);',
    'let a={x:1};let alt=a;function rhs(){a={x:100};return 3;}a.x+=rhs();console.log(alt.x,a.x);',
    'let a={x:1};function basis(){console.log("basis");return a;}function key(){console.log("key");return "x";}function rhs(){console.log("rhs");return 2;}basis()[key()]+=rhs();console.log(a.x);',
    'let a=[1];console.log(a[0]++,++a[0],a[0]--,--a[0]);',
    'let a={};a.x=2;a.x*=3;a.x-=1;a.x/=5;console.log(a.x);',
    'let a=[1,2,3];a.length=1;console.log(a.length,a[1]);a[3]=4;console.log(a.length,a[3],a[2]);',
    'let a=[];a.length=3;console.log(a.length,a[0]);',
    'let a={x:1,x:2,"y":3,0:4};console.log(a.x,a["y"],a[0]);',
    'let a={};a.self=a;console.log(a.self===a);',
    'let a={};a.x=a.y=3;console.log(a.x,a.y);',
    'let a={};console.log(a.missing,typeof a.missing);',
    'let a="abc";console.log(a.length,a[0],a[9]);a[0]="x";console.log(a[0]);',
    'let a={};a[true]=2;a[null]=3;a[undefined]=4;console.log(a[true],a[null],a[undefined]);',
    'let a=[];a[-1]=2;a[NaN]=3;console.log(a[-1],a[NaN]);',
    'let n=0;function f(){n++;return 2;}let a={x:0};false && (a.x=f());true || (a.x=f());console.log(a.x,n);',
    'function f(a){a.x++;return a;}let a={x:1};console.log(f(a).x,a.x);',
    'let a=[{x:1},{x:2}];for(const p of a){p.x++;}console.log(a[0].x,a[1].x);',
    'let a=1;a.x=2;console.log(a.x);',
    '"use strict";let a={x:1};a.x++;console.log(a.x);',
    'function f(){"use strict";let a={x:1};a.x++;return a.x;}console.log(f());',
    '"use\\x20strict";let a=1;a.x=2;console.log(a.x);',
    '({x:2});',
    'let Object=0;let a=[1];console.log(a[0]);',
    'function Object(){return 1;}let a={x:2};console.log(a.x);',
    'let Reflect=0;let String=0;let JSON=0;let Array=0;let Set=0;let a={x:2};a.x++;console.log(a.x);',
  ];
  for (const source of sources) expect(await evaluate(quick, source, compileDebugger(draft(source))), source).toEqual(await evaluate(quick, source));
});

test('Differentialfehler: RHS-Reihenfolge bei null/undefined, Readonly/Strict und ungültiger Arraylänge', async () => {
  const quick = await newQuickJSWASMModuleFromVariant(variant);
  for (const source of [
    'function rhs(){console.log("rhs");return 2;}null.x=rhs();',
    'function key(){console.log("key");return "x";}function rhs(){console.log("rhs");return 2;}null[key()]=rhs();',
    'function rhs(){console.log("NICHT");return 2;}null.x+=rhs();',
    'function key(){console.log("key");return "x";}undefined[key()];',
    '"use strict";let a=1;a.x=2;', '"use strict";let a="abc";a[0]="x";',
    'function f(){"use strict";let a=1;a.x=2;}f();',
    '"use strict";function f(){let a=1;a.x=2;}f();',
    'let a=[];a.length=-1;', 'let a=[];a.length=1.5;',
    'function TypeError(){console.log("NICHT");}let a=null;console.log(a.x);',
  ]) expect(await evaluate(quick, source, compileDebugger(draft(source))), source).toEqual(await evaluate(quick, source));
});

test('Electron: eigene Arrays/Objekte lokal debuggen und nach Neustart ohne Dateninspektion fortsetzen @desktop', async ({}, info) => {
  test.skip(process.platform !== 'win32', 'Windows-Electron'); test.setTimeout(90000);
  const profile = info.outputPath('profil'), env = { ...process.env, DATABASE_URL: '', AZUBIPREP_AI_DIR: path.join(profile, 'ki'), AZUBIPREP_RAG_DIR: path.join(profile, 'rag') }; delete env.ELECTRON_RUN_AS_NODE;
  const options = { executablePath: path.join(repo, 'desktop/node_modules/electron/dist/electron.exe'), args: [path.join(repo, 'desktop'), `--user-data-dir=${profile}`], env }; let app;
  try {
    app = await _electron.launch(options); let page = await app.firstWindow(); await page.waitForURL(/^http:/); await open(page, example, new URL(page.url()).origin + '/frontendkurs'); await start(page); await go(page); await expect(region(page).getByLabel('Debugkonsole')).toHaveText('Alex 18 9 3');
    await expect(page.locator('.pilot-status')).toHaveText('Gespeichert'); await app.close(); app = null;
    app = await _electron.launch(options); page = await app.firstWindow(); await page.waitForURL(/^http:/); await unterdrueckeOnboardingPopups(page); await page.goto(new URL(page.url()).origin + '/frontendkurs'); await openDebugger(page); await expect(values(page)).toContainText('Noch kein Halt'); await expect(region(page).getByRole('textbox', { name: 'Eigener Debugcode', exact: true })).toHaveValue(example); await start(page); await go(page); await expect(region(page).getByLabel('Debugkonsole')).toHaveText('Alex 18 9 3');
  } finally { if (app) await app.close(); }
});
