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
const draft = source => ({ schema: 1, name: 'fehler.js', source });
const region = page => page.getByRole('region', { name: 'Debugger-Technikpilot', exact: true });
const status = page => region(page).getByLabel('Debugstatus', { exact: true });
const values = page => region(page).getByRole('region', { name: 'Debugvariablen', exact: true });
const stack = page => region(page).getByRole('group', { name: 'Debug-Aufrufkette' });
const click = (page, name) => region(page).getByRole('button', { name, exact: true }).click();
const go = page => click(page, 'Weiter / bis zum nächsten Haltepunkt');
async function open(page, source, url = '/frontendkurs') { await unterdrueckeOnboardingPopups(page); await page.goto(url); await openDebugger(page); await region(page).getByLabel('Eigener Debugcode', { exact: true }).fill(source); }
async function start(page) { await click(page, 'Debuggen starten'); await expect(status(page)).toContainText('Angehalten'); }
async function breakpoint(page, source, line, kind = 'statement') { const point = compileDebugger(draft(source)).points.find(item => item.line === line && item.kind === kind); expect(point).toBeTruthy(); await click(page, `Debug-Haltepunkt Zeile ${point.line} Spalte ${point.column}`); }

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


async function evaluate(quick, source, compiled = null, heap = DEBUG_LIMITS.heapBytes) {
  const runtime = quick.newRuntime(); runtime.setMemoryLimit(heap); runtime.setMaxStackSize(DEBUG_LIMITS.stackBytes); const vm = runtime.newContext();
  let boot = vm.evalCode('var __logs=[],__snapshots=[];var __testString=String,__testStringify=JSON.stringify;globalThis.console={log:(...args)=>{__logs.push(args.map(x=>x===null?"null":["number","string","boolean","undefined"].includes(typeof x)?__testString(x):"[Nicht inspiziert]").join(" "));}};'); boot.value.dispose();
  if (compiled) { boot = vm.evalCode('(' + installDebugger.toString() + ')((text)=>__snapshots.push(text),(text)=>{__logs.push(text);},' + JSON.stringify(DEBUG_LIMITS) + ')'); vm.setProp(vm.global, compiled.helper, boot.value); boot.value.dispose(); }
  const result = vm.evalCode(compiled ? compiled.code : source, 'closures.js'); let error = null, value;
  if (result.error) { const name = vm.getProp(result.error, 'name'); error = vm.getString(name); name.dispose(); result.error.dispose(); } else { value = vm.dump(result.value); result.value.dispose(); }
  const data = vm.evalCode('__testStringify({logs:__logs,snapshots:__snapshots})'), parsed = JSON.parse(vm.getString(data.value)); data.value.dispose();
  if (compiled) for (const text of parsed.snapshots) { const snapshot = JSON.parse(text); expect(validateDebugSnapshot(snapshot, compiled.points[snapshot.point], DEBUG_LIMITS, compiled), source).toBe(true); }
  vm.dispose(); runtime.dispose(); return { error, value, logs: parsed.logs };
}

const unwind = 'function lesen(){\n try {\n  throw new Error("Test");\n } finally {\n  console.log("aufräumen");\n }\n}\ntry {\n lesen();\n} catch(fehler) {\n console.log(fehler.name,fehler.message);\n}\nconsole.log("weiter");';

test('Echte Finally-/Catchpause: Unwinding entfernt den Funktionsframe, Fehler bleibt opaque', async ({ page }) => {
  await open(page, unwind); await start(page); await breakpoint(page, unwind, 4, 'finally'); await breakpoint(page, unwind, 10, 'catch');
  await go(page); await expect(status(page)).toContainText(':4:'); await expect(stack(page).getByRole('button')).toHaveCount(2); await expect(region(page).getByLabel('Debugkonsole')).toHaveText('Noch keine Ausgabe.');
  await go(page); await expect(status(page)).toContainText(':10:'); await expect(stack(page).getByRole('button')).toHaveCount(1); await expect(values(page)).toContainText('Catchbindung'); await expect(values(page).locator('tbody tr').filter({ hasText: /^fehleropaque\[Nicht inspiziert\]$/ })).toHaveCount(1); await expect(region(page).getByLabel('Debugkonsole')).toHaveText('aufräumen');
  await go(page); await expect(status(page)).toContainText('Programm ist beendet'); await expect(region(page).getByLabel('Debugkonsole')).toHaveText('aufräumen\nError Test\nweiter');
});

test('Über/Aus: expliziter Haltepunkt im Finally gewinnt vor tatsächlicher Rückgabe', async ({ page }) => {
  const source = 'function wert(){\n try { return 1; }\n finally {\n  console.log("final");\n }\n}\nconst n=wert();\nconsole.log(n);';
  await open(page, source); await start(page); await breakpoint(page, source, 4); await click(page, 'Funktion überspringen'); await expect(status(page)).toContainText(':4:'); await expect(stack(page).getByRole('button')).toHaveCount(2);
  await click(page, 'Funktion verlassen'); await expect(status(page)).toContainText(':8:'); await expect(stack(page).getByRole('button')).toHaveCount(1); await expect(region(page).getByLabel('Debugkonsole')).toHaveText('final'); await go(page); await expect(region(page).getByLabel('Debugkonsole')).toHaveText('final\n1');
});

test('Differential: Completion, throw/return/finally, Schleifen, Catch-TDZ/Closures und native Fehler', async () => {
  const quick = await newQuickJSWASMModuleFromVariant(variant);
  const cases = [
    '1;try{}finally{}', '1;try{let x=2;}finally{}', '1;try{throw 3;}catch{}', 'try{4;}finally{5;}',
    'try{throw 2;}catch(e){e+1;}', 'try{throw 2;}catch(e){let x=e;}finally{3;}',
    'try{try{throw "a";}finally{console.log("innen");}}catch(e){console.log(e);}finally{console.log("außen");}',
    'function f(){try{return 1;}finally{return 2;}}console.log(f());',
    'function f(){try{throw 1;}finally{return 2;}}console.log(f());',
    'function f(){try{return 1;}finally{throw 2;}}try{console.log(f());}catch(e){console.log(e);}',
    'function f(){try{throw 1;}catch(e){return e+1;}finally{console.log("f");}}console.log(f());',
    'let e=9;try{throw 2;}catch(e){e++;{let e=4;console.log(e);}console.log(e);}console.log(e);',
    'try{throw 2;}catch(e){console.log(x);let x=1;}',
    'let f;try{throw 2;}catch(e){f=()=>++e;}console.log(f(),f());',
    'let f=[];for(let i=0;i<2;i++){try{throw i;}catch(e){f.push(()=>e);}}const a=f[0];const b=f[1];console.log(a(),b());',
    'let log="";for(let i=0;i<3;i++){try{if(i===0)continue;if(i===2)break;log+=i;}finally{log+="f";}}console.log(log);',
    'let n=0;for(let i=0;i<3;i++){try{break;}finally{n++;if(i<1)continue;}}console.log(n);',
    'try{[1,2,3].map(n=>{if(n===2)throw n;return n;});}catch(e){console.log(e);}',
    'function f(){throw {x:2};}try{f();}catch(e){console.log(e.x);throw e;}',
    'const e={x:2};try{throw e;}catch(f){console.log(e===f);}',
    'const fn=()=>2;try{throw fn;}catch(f){console.log(fn===f,f());}',
    'try{null.x;}catch(e){console.log(e.name);}', 'try{const x=1;x++;}catch(e){console.log(e.name);}',
    'try{let f=2;f();}catch(e){console.log(e.name);}', 'try{[].map(1);}catch(e){console.log(e.name);}',
    'try{console.log(x);let x=2;}catch(e){console.log(e.name);}',
    'try{throw null;}catch(e){console.log(e);}', 'try{throw undefined;}catch(e){console.log(e);}',
    'try{throw 0;}catch(e){console.log(e);}', 'throw "fehler";', 'throw new Error("fehler");',
    'try{throw new Error;}catch(e){console.log(e.name,e.message);}',
    'const e=new TypeError("x");try{throw e;}catch(f){console.log(e===f,f.name,f.message);}',
    'try{throw new Error({x:1});}catch(e){console.log(e.message);}',
  ];
  for (const name of ['Error','TypeError','RangeError','ReferenceError','SyntaxError','URIError','EvalError']) for (const arg of ['"Text"','15','false','null','undefined']) cases.push('try{throw new ' + name + '(' + arg + ');}catch(e){console.log(e.name,e.message);}');
  for (const source of cases) expect(await evaluate(quick, source, compileDebugger(draft(source))), source).toEqual(await evaluate(quick, source));
});

test('Catchbindung pro Eintritt lebt in Closure weiter, leere Handler haben echte gültige Haltepositionen', async ({ page }) => {
  await open(page, 'let x=1;');
  const source = 'let f;try{throw 2;}catch(e){f=()=>e;}finally{}console.log(f());', artifact = compileDebugger(draft(source)), events = await raw(page, source, {}, 'step');
  expect(events.at(-1).type).toBe('done'); expect(events.filter(event => event.type === 'log').map(event => event.text)).toEqual(['2']);
  for (const event of events.filter(event => event.type === 'paused')) expect(validateDebugSnapshot(event.snapshot, artifact.points[event.point], DEBUG_LIMITS, artifact)).toBe(true);
  for (const kind of ['catch','finally']) expect(events.some(event => event.type === 'paused' && artifact.points[event.point].kind === kind)).toBe(true);
  const entry = events.find(event => event.type === 'paused' && artifact.points[event.point].kind === 'entry'); expect(entry.snapshot.frames).toHaveLength(2);
  const meta = artifact.points[entry.point]; expect(meta.scopes.find(scope => scope.names.includes('e')).captured).toBe(true); expect(entry.snapshot.scopes.flatMap(scope => scope.values).find(value => value.name === 'e').display).toBe('2');
});

test('Catch/Finally öffnen keine Sprach-, Stack-, Konstruktor- oder Funktionskonvertierungswege', async ({ page }) => {
  await open(page, 'let x=1;');
  for (const source of ['try{throw 1;}catch({x}){}','try{throw 1;}catch(e){let e=2;}','try{throw 1;}catch(e){const e=2;}','try{}','throw\n1;','new Date();','new Error("x",{});','let Error=()=>1;new Error();','const E=Error;new E();','try{throw 1;}catch(e){eval("1");}','try{throw new Error("x");}catch(e){e.constructor;}']) expect(() => compileDebugger(draft(source)), source).toThrow();
  for (const expression of ['new Error("x").stack','new Error("x").cause','new Error("x").name="neu"','new Error("x").message++','(()=>1).name','""+(()=>1)','[].sort()','(()=>1).call(null)']) {
    const source = 'try{try{' + expression + ';}catch(e){console.log("NICHT");}}finally{console.log("NICHT");}console.log("NICHT");';
    const events = await raw(page, source); expect(events.at(-1).type, source).toBe('error'); expect(events.some(event => event.type === 'log'), source).toBe(false);
  }
  const injected = 'const e=new Error("test");Object.defineProperty(e,"name",{get(){console.log("GETTER");return "x";}});__azubi_dbg_checkpoint(0,[[0,[]]]);console.log(e);__azubi_dbg_checkpoint.ref(e,"name",false).value;';
  const events = await raw(page, ';', {}, 'continue', injected); expect(events.at(-1).type).toBe('error'); expect(events.filter(event => event.type === 'log').map(event => event.text)).toEqual(['[Nicht inspiziert]']);
});

test('Ressourcenabbruch ist auch mit Catch/Finally-return endgültig; normale TypeErrors bleiben fangbar', async ({ page }) => {
  await open(page, 'let x=1;');
  const cases = [
    ['function f(){try{while(true){}}catch(e){console.log("NICHT");}finally{return 7;}}console.log(f());', { checkpointHits: 12 }],
    ['function f(){try{while(true){}}catch(e){console.log("NICHT");}finally{return 7;}}console.log(f());', { pauses: 3 }, 'step'],
    ['const f=()=>{try{return f();}catch(e){console.log("NICHT");}finally{return 7;}};console.log(f());', { frames: 4 }],
    ['function f(){try{console.log("eins");console.log("zwei");}catch(e){console.log("NICHT");}finally{return 7;}}console.log(f());', { logLines: 1 }],
    ['function f(){try{console.log("eins");}catch(e){console.log("NICHT");}finally{return 7;}}console.log(f());', { messages: 5 }],
    ['function f(){try{let a=[];a.length=3000000;a.join("xxxxxxxx");}catch(e){console.log("NICHT");}finally{return 7;}}console.log(f());', {}],
    ['function f(){try{console.log("begin");while(true){}}catch(e){console.log("NICHT");}finally{return 7;}}console.log(f());', { activeMs: 50 }],
  ];
  for (const [source, limits, mode = 'continue'] of cases) {
    const events = await raw(page, source, limits, mode); expect(events.at(-1).type, source).toBe('error'); expect(events.filter(event => event.type === 'log').some(event => event.text === 'NICHT' || event.text === '7'), source).toBe(false);
    if (limits.activeMs) { expect(events.some(event => event.type === 'log' && event.text === 'begin')).toBe(true); expect(events.at(-1).text).toContain('Aktive Zeitgrenze'); }
  }
  const normal = await raw(page, 'try{let f=1;f();}catch(e){console.log(e.name);}finally{console.log("final");}console.log("weiter");'); expect(normal.at(-1).type).toBe('done'); expect(normal.filter(event => event.type === 'log').map(event => event.text)).toEqual(['TypeError','final','weiter']);
});

test('Echte kleine Heapquota: Fehler aus Try/Catch/Finally vor übersteuerndem Source-finally erkannt', async () => {
  const quick = await newQuickJSWASMModuleFromVariant(variant), allocate = 'let a=[];a.length=1000000;a.join("xxxxxxxx");';
  expect((await evaluate(quick, 'try{' + allocate + '}catch(e){console.log(e.name,e.message);}', null, 600000)).logs).toEqual(['InternalError out of memory']);
  for (const source of [
    'function f(){try{' + allocate + '}catch{}finally{return 456;}}console.log(f());',
    'function f(){try{throw 1;}catch(e){' + allocate + '}finally{return 456;}}console.log(f());',
    'function f(){try{try{}finally{' + allocate + '}}catch{}finally{return 456;}}console.log(f());',
  ]) {
    expect((await evaluate(quick, source, null, 600000)).logs).toEqual(['456']);
    const instrumented = await evaluate(quick, source, compileDebugger(draft(source)), 600000); expect(instrumented.error).toBeTruthy(); expect(instrumented.logs).toEqual([]);
  }
});

test('Stop/Quellwechsel im Catch verwirft alte Fehlerbindung und frischer Lauf funktioniert', async ({ page }) => {
  await open(page, unwind); await start(page); await breakpoint(page, unwind, 10, 'catch'); await go(page); await expect(values(page)).toContainText('Catchbindung'); await click(page, 'Debuggen stoppen'); await expect(status(page)).toContainText('gestoppt');
  await start(page); await breakpoint(page, unwind, 10, 'catch'); await go(page); await region(page).getByLabel('Eigener Debugcode', { exact: true }).fill('try{throw 2;}catch(e){console.log(e+1);}'); await expect(values(page)).toContainText('Noch kein Halt'); await start(page); await go(page); await expect(region(page).getByLabel('Debugkonsole')).toHaveText('3');
});

test('Electron: Catch/Finally derselben Ausführung und Neustart ohne alte Fehlerbindung @desktop', async ({}, info) => {
  test.skip(process.platform !== 'win32', 'Windows-Electron'); test.setTimeout(90000);
  const profile = info.outputPath('profil'), env = { ...process.env, DATABASE_URL: '', AZUBIPREP_AI_DIR: path.join(profile,'ki'), AZUBIPREP_RAG_DIR: path.join(profile,'rag') }; delete env.ELECTRON_RUN_AS_NODE;
  const options = { executablePath: path.join(repo,'desktop/node_modules/electron/dist/electron.exe'), args: [path.join(repo,'desktop'), `--user-data-dir=${profile}`], env }; let app;
  try {
    app = await _electron.launch(options); let page = await app.firstWindow(); await page.waitForURL(/^http:/); await open(page, unwind, new URL(page.url()).origin + '/frontendkurs'); await start(page); await breakpoint(page, unwind, 10, 'catch'); await go(page); await expect(values(page)).toContainText('Catchbindung'); await expect(stack(page).getByRole('button')).toHaveCount(1); await go(page); await expect(region(page).getByLabel('Debugkonsole')).toHaveText('aufräumen\nError Test\nweiter'); await expect(page.locator('.pilot-status')).toHaveText('Gespeichert'); await app.close(); app = null;
    app = await _electron.launch(options); page = await app.firstWindow(); await page.waitForURL(/^http:/); await unterdrueckeOnboardingPopups(page); await page.goto(new URL(page.url()).origin + '/frontendkurs'); await openDebugger(page); await expect(values(page)).toContainText('Noch kein Halt'); await expect(region(page).getByLabel('Eigener Debugcode', { exact: true })).toHaveValue(unwind);
  } finally { if (app) await app.close(); }
});

