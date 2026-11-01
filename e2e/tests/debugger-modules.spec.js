import { test, expect, _electron } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileDebugProject } from '../../frontend/src/pilot/debugger-compiler.js';
import { initialDebugProject, checkDebugProject, resolveDebugImport } from '../../frontend/src/pilot/debugger-project.js';
import { DEBUG_LIMITS, installDebugger, validateDebugArtifact, validateDebugSnapshot } from '../../frontend/src/pilot/debugger-core.js';
import variant from '../../frontend/node_modules/@jitl/quickjs-singlefile-browser-release-sync/dist/index.mjs';
import { newQuickJSWASMModuleFromVariant } from '../../frontend/node_modules/quickjs-emscripten-core/dist/index.mjs';
import { unterdrueckeOnboardingPopups, openDebugger } from './helpers.js';
test.use({ serviceWorkers: 'block' });
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const project=files=>({schema:1,mode:'module',entry:'main.js',files});
const region=page=>page.getByRole('region',{name:'Debugger-Technikpilot',exact:true});
const status=page=>region(page).getByLabel('Debugstatus',{exact:true});
const output=page=>region(page).getByLabel('Debugkonsole',{exact:true});
const values=page=>region(page).getByRole('region',{name:'Debugvariablen',exact:true});
const stack=page=>region(page).getByRole('group',{name:'Debug-Aufrufkette'});
const click=(page,name)=>region(page).getByRole('button',{name,exact:true}).click();
const go=page=>click(page,'Weiter / bis zum nächsten Haltepunkt');
async function open(page,url='/frontendkurs'){await unterdrueckeOnboardingPopups(page);await page.goto(url);await openDebugger(page);}
async function modules(page){await region(page).getByLabel('Debugmodus',{exact:true}).selectOption('module');}
async function start(page){await click(page,'Debuggen starten');await expect(status(page)).toContainText('Angehalten');}
async function bp(page,p,name,line,kind='statement'){await region(page).getByLabel('Debugdatei',{exact:true}).selectOption(name);const point=compileDebugProject(p).points.find(item=>item.file===name&&item.line===line&&item.kind===kind);expect(point).toBeTruthy();await click(page,`Debug-Haltepunkt ${name} Zeile ${point.line} Spalte ${point.column}`);}
async function load(page,p){page.once('dialog',d=>d.accept());await region(page).getByLabel('Modulsicherung lesen',{exact:true}).setInputFiles({name:'probe.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(p))});await expect(region(page).getByLabel('Modulstartdatei',{exact:true})).toHaveValue(p.entry);}

test('Native Module: Hinein/Über/Aus, dateigenaue Haltepunkte und Ansichtswechsel ohne Fortsetzen',async({page})=>{
 await open(page);await modules(page);const p=initialDebugProject();await start(page);await expect(status(page)).toContainText('main.js:2:');await click(page,'Einzelner Schritt');await expect(status(page)).toContainText('berechnung.js:1:');await expect(stack(page).getByRole('button')).toHaveCount(2);await expect(values(page)).toContainText('zahl');
 await bp(page,p,'berechnung.js',2,'return');await region(page).getByLabel('Debugdatei',{exact:true}).selectOption('main.js');await expect(status(page)).toContainText('berechnung.js:1:');await expect(output(page)).toHaveText('Noch keine Ausgabe.');await expect(region(page).getByLabel('Eigener Debugcode',{exact:true})).toHaveValue(p.files['main.js']);await go(page);await expect(status(page)).toContainText('berechnung.js:2:');await expect(region(page).getByLabel('Debugdatei',{exact:true})).toHaveValue('berechnung.js');
 await stack(page).getByRole('button',{name:/^Programm/}).click();await expect(region(page).getByLabel('Debugdatei',{exact:true})).toHaveValue('main.js');await expect(values(page)).toContainText('noch nicht initialisiert');await stack(page).getByRole('button',{name:/^verdoppeln/}).click();await click(page,'Funktion verlassen');await expect(status(page)).toContainText('main.js:3:');await go(page);await expect(output(page)).toHaveText('6');await expect(status(page)).toContainText('Programm ist beendet');
 await start(page);await click(page,'Funktion überspringen');await expect(status(page)).toContainText('main.js:3:');await expect(output(page)).toHaveText('Noch keine Ausgabe.');await go(page);await expect(output(page)).toHaveText('6');
});

async function evaluate(quick,p,compiled=null){
 const files=compiled?.modules||p.files,configure=(rt,sources=files)=>{rt.setMemoryLimit(DEBUG_LIMITS.heapBytes);rt.setMaxStackSize(DEBUG_LIMITS.stackBytes);rt.setModuleLoader(name=>sources[name],(base,name)=>resolveDebugImport(base,name,sources));};let error=null;
 const token='__azubi_test_preflight__',guarded=Object.fromEntries(Object.entries(files).map(([name,code])=>[name,'throw '+JSON.stringify(token)+';\n'+code]));
 for(const name of Object.keys(files)){const rt=quick.newRuntime();configure(rt,guarded);const preflight=rt.newContext();const checked=preflight.evalCode(guarded[name],name,{type:'module'});if(!checked.error){error='SyntaxError';checked.value.dispose();}else{if(preflight.typeof(checked.error)!=='string'||preflight.getString(checked.error)!==token)error='SyntaxError';checked.error.dispose();}preflight.dispose();rt.dispose();if(error)break;}
 const runtime=quick.newRuntime();configure(runtime);
 const vm=runtime.newContext();let r=vm.evalCode('var __logs=[],__snaps=[];var __string=String,__json=JSON.stringify;globalThis.console={log:(...a)=>__logs.push(a.map(x=>x===null?"null":["number","string","boolean","undefined"].includes(typeof x)?__string(x):"[Nicht inspiziert]").join(" "))};');r.value.dispose();
 if(compiled){r=vm.evalCode('('+installDebugger.toString()+')((s)=>__snaps.push(s),(s)=>__logs.push(s),'+JSON.stringify(DEBUG_LIMITS)+')');vm.setProp(vm.global,compiled.helper,r.value);r.value.dispose();}
 if(!error){r=vm.evalCode(files[p.entry],p.entry,{type:'module'});if(r.error){const n=vm.getProp(r.error,'name');error=vm.getString(n);n.dispose();r.error.dispose();}else r.value.dispose();}
 r=vm.evalCode('__json({logs:__logs,snaps:__snaps})');const data=JSON.parse(vm.getString(r.value));r.value.dispose();if(compiled)for(const text of data.snaps){const snap=JSON.parse(text);expect(validateDebugSnapshot(snap,compiled.points[snap.point],DEBUG_LIMITS,compiled)).toBe(true);}const jobs=runtime.hasPendingJob();vm.dispose();runtime.dispose();return{error,logs:data.logs,jobs};
}

test('Differential: Diamond/Einmaligkeit, live Imports/default Snapshot, Closures, Hoisting und Modulstrictness',async()=>{
 const quick=await newQuickJSWASMModuleFromVariant(variant);
 const cases=[initialDebugProject(),
 project({'main.js':'import {n as wert,inc} from "./model.js";console.log(wert);inc();console.log(wert);','model.js':'export let n=1;export function inc(){n++;}'}),
 project({'main.js':'import snap,{live,inc} from "./model.js";inc();console.log(snap,live);','model.js':'let n=1;export default n;export {n as live};export function inc(){n++;}'}),
 project({'main.js':'import f from "./model.js";console.log(f(3));','model.js':'export default function doppelt(n){return n*2;}'}),
 project({'main.js':'import f from "./model.js";console.log(f(3));','model.js':'export default n=>n*2;'}),
 project({'main.js':'import {f} from "./model.js";const a=f();console.log(a(),a());','model.js':'export function f(){let n=0;return()=>++n;}'}),
 project({'main.js':'import "./links.js";import "./rechts.js";console.log("main");','links.js':'import "./basis.js";console.log("links");','rechts.js':'import "./basis.js";console.log("rechts");','basis.js':'console.log("basis");'}),
 project({'main.js':'import {f} from "./model.js";try{f();}catch(e){console.log(e.name,e.message);}finally{console.log("final");}','model.js':'export function f(){throw new TypeError("Test");}'}),
 project({'main.js':'import {f} from "./model.js";try{f();}catch(e){console.log(e.name);}','model.js':'export function f(){const x=1;x.a=2;}'}),
 project({'main.js':'import {f} from "./model.js";console.log(f(3));','model.js':'console.log(f(2));export function f(n){return n+1;}'}),
 project({'main.js':'import {f} from "./model.js";const obj={f};console.log(obj.f(2));','model.js':'const g=n=>n+1;export {g as f};'}),
 project({'main.js':'import {x} from "./model.js";console.log(x);','model.js':'export const x=3;'}),
 project({'main.js':'console.log("nur main");','unused.js':'console.log("NICHT");'}),
 ];
 for(const p of cases){const original=await evaluate(quick,p);expect(original.error,JSON.stringify(p.files)).toBeNull();expect(original.jobs).toBe(false);expect(await evaluate(quick,p,compileDebugProject(p)),JSON.stringify(p.files)).toEqual(original);}
});

test('Geschlossener Graph: relative Projektdateien, Exportbindungen und sämtliche unbenutzten Quellen vorab prüfen',()=>{
 for(const requested of ['../a.js','./../a.js','./ordner/a.js','/a.js','https://example.org/a.js','file:///a.js','data:text/javascript,','node:fs','react','./a.js?x','./a.js#x','./%61.js','./.env.js','./missing.js'])expect(()=>compileDebugProject(project({'main.js':`import "${requested}";`,'a.js':''})),requested).toThrow();
 for(const source of ['import {x} from "./a.js" with {type:"json"};','import("./a.js");','console.log(import.meta);','await 1;','import {x} from "./a.js";x=2;','export {__azubi_dbg_scope_0 as x};','export {__azubi_dbg_checkpoint as x};','export {missing};','let package=1;','const yield=1;','const await=1;','function f(public){}'])expect(()=>compileDebugProject(project({'main.js':source,'a.js':'export let x=1;'})),source).toThrow();
 expect(()=>compileDebugProject(project({'main.js':'console.log("NICHT");','unused.js':'eval("1");'}))).toThrow();
 expect(()=>compileDebugProject(project({'main.js':'import "./a.js";','a.js':'import "./main.js";'}))).toThrow('Kreisimport');
 expect(()=>compileDebugProject(project({'main.js':'import {missing} from "./a.js";','a.js':'export const x=1;'}))).toThrow('fehlt');
});

test('Projektweite Caps für Dateien/Bytes/Zeilen/AST/Punkte/Code und eindeutige originale Dateimetadaten',()=>{
 const files={'main.js':''};for(let i=0;i<15;i++)files['m'+i+'.js']='';expect(checkDebugProject(project(files))).toBeTruthy();expect(()=>checkDebugProject(project({...files,'extra.js':''}))).toThrow();
 const exact=project({'main.js':'//'+ 'x'.repeat(32766),'a.js':'//'+ 'x'.repeat(32766)});expect(compileDebugProject(exact)).toBeTruthy();expect(()=>checkDebugProject(project({...exact.files,'a.js':exact.files['a.js']+'x'}))).toThrow('64 KiB');
 expect(()=>compileDebugProject(project({'main.js':'\n'.repeat(256),'a.js':'\n'.repeat(255)}))).toThrow('Zeilengrenze');
 const p=initialDebugProject(),a=compileDebugProject(p);expect(validateDebugArtifact(a,DEBUG_LIMITS)).toBe(a);expect(a.points.filter(x=>x.end)).toHaveLength(1);expect(new Set(a.points.map(x=>x.id)).size).toBe(a.points.length);
 for(const [key,cap]of [['astNodes',a.stats.nodes],['generatedBytes',a.stats.generatedBytes],['points',a.points.length]]){expect(()=>compileDebugProject(p,{[key]:cap})).not.toThrow();expect(()=>compileDebugProject(p,{[key]:cap-1})).toThrow();}
 expect(()=>validateDebugArtifact({...a,points:a.points.map((p,i)=>i===0?{...p,file:'missing.js'}:p)},DEBUG_LIMITS)).toThrow();
});

async function raw(page,p,limits={},mode='continue',tamper=null){const artifact=compileDebugProject(p),asset=fs.readdirSync(path.join(repo,'frontend/dist/assets')).find(n=>/^debugger\.worker-.*\.js$/.test(n));return page.evaluate(({artifact,asset,limits,mode,tamper})=>new Promise(resolve=>{if(tamper)artifact.modules[tamper.name]=tamper.code;const worker=new Worker('/assets/'+asset,{type:'module'}),events=[];let command=0;const timer=setTimeout(()=>{worker.terminate();resolve([{type:'timeout'}]);},14000);worker.onmessage=({data})=>{events.push(data);if(data.type==='paused')worker.postMessage({type:'control',session:'modules',revision:'rev',commandId:++command,pauseId:data.pauseId,mode});if(data.type==='done'||data.type==='error'){clearTimeout(timer);worker.terminate();resolve(events);}};worker.postMessage({type:'start',session:'modules',revision:'rev',artifact,limits});}),{artifact,asset,limits,mode,tamper});}

test('Nativer Vorabcheck auch unbenutzter Modulliterale; geteilte Laufgrenzen und geschlossener Loader',async({page})=>{
 await open(page);
 const invalid=project({'main.js':'console.log("NICHT");','unused.js':''});const events=await raw(page,invalid,{},'continue',{name:'unused.js',code:'let package=1;'});expect(events.at(-1).type).toBe('error');expect(events.filter(e=>e.type==='log')).toEqual([]);
 const p=project({'main.js':'import {f} from "./a.js";console.log(f());','a.js':'export function f(){return 1;}'});
 for(const limits of [{pauses:2},{frames:1},{checkpointHits:2}]){const r=await raw(page,p,limits,'step');expect(r.at(-1).type).toBe('error');}
 const forbidden=await raw(page,p,{},'continue',{name:'a.js',code:'import "https://example.org/a.js";'});expect(forbidden.at(-1).type).toBe('error');expect(forbidden.filter(e=>e.type==='log')).toEqual([]);
 const ok=await raw(page,p);expect(ok.at(-1).type).toBe('done');expect(ok.filter(e=>e.type==='log').map(e=>e.text)).toEqual(['1']);
});

test('Code/Entry/Moduswechsel beendet Pause; Modulprojekt speichern und Einzelentwurf erhalten',async({page})=>{
 await open(page);const text=region(page).getByLabel('Eigener Debugcode',{exact:true});await text.fill('console.log("mein Einzelentwurf");');await modules(page);await start(page);await region(page).getByLabel('Debugdatei',{exact:true}).selectOption('berechnung.js');await text.fill('export function verdoppeln(n){return n*3;}');await expect(values(page)).toContainText('Noch kein Halt');await start(page);await go(page);await expect(output(page)).toHaveText('9');
 await start(page);await region(page).getByLabel('Modulstartdatei',{exact:true}).selectOption('berechnung.js');await expect(values(page)).toContainText('Noch kein Halt');await region(page).getByLabel('Modulstartdatei',{exact:true}).selectOption('main.js');await start(page);await region(page).getByLabel('Debugmodus',{exact:true}).selectOption('script');await expect(text).toHaveValue('console.log("mein Einzelentwurf");');await expect(values(page)).toContainText('Noch kein Halt');await modules(page);await expect(page.locator('.pilot-status')).toHaveText('Gespeichert');await page.reload();await openDebugger(page);await expect(region(page).getByLabel('Debugmodus',{exact:true})).toHaveValue('module');await region(page).getByLabel('Debugdatei',{exact:true}).selectOption('berechnung.js');await expect(text).toHaveValue('export function verdoppeln(n){return n*3;}');await expect(values(page)).toContainText('Noch kein Halt');
});

test('Modulimport/Export ohne Ausführung; sensible und relative Pfade vor text() zurückweisen',async({page})=>{
 await open(page);await modules(page);const p=project({'main.js':'import {n} from "./daten.js";console.log(n);','daten.js':'export const n=7;'});await load(page,p);await expect(output(page)).toHaveText('Noch keine Ausgabe.');await start(page);await go(page);await expect(output(page)).toHaveText('7');
 const download=page.waitForEvent('download');await click(page,'Modulprojekt exportieren (JSON)');const d=await download;const saved=JSON.parse(fs.readFileSync(await d.path(),'utf8'));expect(saved).toEqual(p);expect(Object.keys(saved)).toEqual(['schema','mode','entry','files']);
 await region(page).getByLabel('Moduldateien einlesen',{exact:true}).setInputFiles({name:'weitere.js',mimeType:'text/javascript',buffer:Buffer.from('export const x=2;')});await expect(region(page).getByLabel('Debugdatei',{exact:true}).locator('option')).toHaveCount(3);await expect(values(page)).toContainText('Noch kein Halt');
 const reads=await region(page).getByLabel('Moduldateien einlesen',{exact:true}).evaluate(input=>{let reads=0;const file=new File(['NICHT'],'ok.js',{type:'text/javascript'});Object.defineProperty(file,'webkitRelativePath',{value:'.git/ok.js'});file.text=async()=>{reads++;return 'NICHT';};const transfer=new DataTransfer();transfer.items.add(file);Object.defineProperty(input,'files',{value:transfer.files,configurable:true});input.dispatchEvent(new Event('change',{bubbles:true}));return new Promise(resolve=>setTimeout(()=>resolve(reads),0));});expect(reads).toBe(0);await expect(region(page).getByRole('alert')).toContainText('Ordnerpfade');
 await region(page).getByLabel('Moduldateien einlesen',{exact:true}).evaluate(input=>delete input.files);
 await region(page).getByLabel('Moduldateien einlesen',{exact:true}).setInputFiles({name:'.env.js',mimeType:'text/javascript',buffer:Buffer.from('NICHT')});await expect(region(page).getByRole('alert')).toContainText('Dateinamen');
 for(const [name,relative]of [['.env.json',''],['backup.json','.git/backup.json']]){
   const reads=await region(page).getByLabel('Modulsicherung lesen',{exact:true}).evaluate((input,{name,relative})=>{let reads=0;const file=new File(['NICHT'],name,{type:'application/json'});Object.defineProperty(file,'webkitRelativePath',{value:relative});file.text=async()=>{reads++;return 'NICHT';};const t=new DataTransfer();t.items.add(file);Object.defineProperty(input,'files',{value:t.files,configurable:true});input.dispatchEvent(new Event('change',{bubbles:true}));return new Promise(resolve=>setTimeout(()=>resolve(reads),0));},{name,relative});expect(reads).toBe(0);
 }
});

test('Mobil: Moduldateien und Funktionsframes ohne Überbreite erreichbar',async({page})=>{
 await page.setViewportSize({width:390,height:844});await open(page);await modules(page);await start(page);await click(page,'Einzelner Schritt');await expect(status(page)).toContainText('berechnung.js');await region(page).getByLabel('Debugdatei',{exact:true}).selectOption('main.js');await expect(status(page)).toContainText('Angehalten');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);await click(page,'Debuggen stoppen');await expect(status(page)).toContainText('gestoppt');
});

test('Electron: dateiübergreifend anhalten und nach Neustart Modulquellen/Entry ohne Laufwerte erhalten @desktop',async({},info)=>{
 test.skip(process.platform!=='win32','Windows-Electron');test.setTimeout(90000);const profile=info.outputPath('profil'),env={...process.env,DATABASE_URL:'',AZUBIPREP_AI_DIR:path.join(profile,'ki'),AZUBIPREP_RAG_DIR:path.join(profile,'rag')};delete env.ELECTRON_RUN_AS_NODE;const options={executablePath:path.join(repo,'desktop/node_modules/electron/dist/electron.exe'),args:[path.join(repo,'desktop'),`--user-data-dir=${profile}`],env};let app;
 try{app=await _electron.launch(options);let page=await app.firstWindow();await page.waitForURL(/^http:/);await open(page,new URL(page.url()).origin+'/frontendkurs');await modules(page);await start(page);await click(page,'Einzelner Schritt');await expect(status(page)).toContainText('berechnung.js');await go(page);await expect(output(page)).toHaveText('6');await expect(page.locator('.pilot-status')).toHaveText('Gespeichert');await app.close();app=null;
 app=await _electron.launch(options);page=await app.firstWindow();await page.waitForURL(/^http:/);await open(page,new URL(page.url()).origin+'/frontendkurs');await expect(region(page).getByLabel('Debugmodus',{exact:true})).toHaveValue('module');await expect(region(page).getByLabel('Modulstartdatei',{exact:true})).toHaveValue('main.js');await expect(values(page)).toContainText('Noch kein Halt');await start(page);await go(page);await expect(output(page)).toHaveText('6');}finally{if(app)await app.close();}
});
