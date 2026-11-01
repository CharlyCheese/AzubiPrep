import { test, expect, _electron } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pathToFileURL } from 'node:url';
import { Worker as NodeWorker } from 'node:worker_threads';
import { compileDebugProject } from '../../frontend/src/pilot/debugger-compiler.js';
import { initialDebugProject, checkDebugProject, resolveDebugImport, checkModulePath, folderDebugFiles } from '../../frontend/src/pilot/debugger-project.js';
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


async function raw(page,p,limits={},mode='continue',tamper=null){const artifact=compileDebugProject(p),asset=fs.readdirSync(path.join(repo,'frontend/dist/assets')).find(n=>/^debugger\.worker-.*\.js$/.test(n));return page.evaluate(({artifact,asset,limits,mode,tamper})=>new Promise(resolve=>{if(tamper)artifact.modules[tamper.name]=tamper.code;const worker=new Worker('/assets/'+asset,{type:'module'}),events=[];let command=0;const timer=setTimeout(()=>{worker.terminate();resolve([{type:'timeout'}]);},14000);worker.onmessage=({data})=>{events.push(data);if(data.type==='paused')worker.postMessage({type:'control',session:'modules',revision:'rev',commandId:++command,pauseId:data.pauseId,mode});if(data.type==='done'||data.type==='error'){clearTimeout(timer);worker.terminate();resolve(events);}};worker.postMessage({type:'start',session:'modules',revision:'rev',artifact,limits});}),{artifact,asset,limits,mode,tamper});}


const fixture=(files,entry="js/main.js")=>({schema:1,mode:"module",entry,files});

async function nodeOracle(p,info,index){
 checkDebugProject(p);const directory=info.outputPath('node-reference',String(index));fs.mkdirSync(directory,{recursive:true});fs.writeFileSync(path.join(directory,'package.json'),JSON.stringify({type:'module'}));
 for(const [name,source]of Object.entries(p.files)){const target=path.join(directory,name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,source);}
 return new Promise((resolve,reject)=>{
  // Only authored synthetic fixtures execute here. Product learner code stays
  // in QuickJS; this independent Node engine has no app integration.
  const worker=new NodeWorker(`const {parentPort,workerData}=require('node:worker_threads');const logs=[],text=String;console.log=(...a)=>logs.push(a.map(v=>v===null?'null':['number','string','boolean','undefined'].includes(typeof v)?text(v):'[Nicht inspiziert]').join(' '));import(workerData.url).then(()=>parentPort.postMessage({error:null,logs,jobs:false}),e=>parentPort.postMessage({error:e.name,logs,jobs:false}));`,{eval:true,workerData:{url:pathToFileURL(path.join(directory,p.entry)).href}});
  const timer=setTimeout(()=>{void worker.terminate();reject(new Error('Node-Referenzzeitgrenze'));},8000);worker.once('error',error=>{clearTimeout(timer);void worker.terminate();reject(error);});worker.once('message',result=>{clearTimeout(timer);void worker.terminate().then(()=>resolve(result));});
 });
}

const sample=fixture({
 'js/main.js':'import * as api from "./index.js";\nconst result=api.double(3);\nconsole.log(result);',
 'js/index.js':'export { double } from "./model.js";',
 'js/model.js':'export function double(n){\n return n*2;\n}',
});

test('Native Semantik gegen unabhängige Node-Referenz: Namespaces/Reexports, Diamond und default',async({},info)=>{
 const quick=await newQuickJSWASMModuleFromVariant(variant);
 const cases=[sample,
 fixture({'js/main.js':'import * as api from "./index.js";console.log(api.n);api.inc();console.log(api.n);','js/index.js':'export * from "../model.js";','model.js':'export let n=1;export function inc(){n++;}'}),
 fixture({'js/main.js':'import {group} from "./index.js";import * as direct from "./model.js";console.log(group===direct,group.n);group.inc();console.log(direct.n);','js/index.js':'export * as group from "./model.js";','js/model.js':'export let n=1;export function inc(){n++;}'}),
 fixture({'js/main.js':'import * as a from "./model.js";import * as b from "../js/parts/../model.js";console.log(a===b,a.n,b.n);','js/model.js':'console.log("einmal");export let n=1;'}),
 fixture({'js/main.js':'import * as api from "./model.js";try{api.n=2;}catch(e){console.log(e.name);}try{api.neu=3;}catch(e){console.log(e.name);}console.log(api.n);','js/model.js':'export let n=1;'}),
 fixture({'js/main.js':'import * as api from "./model.js";api.obj.n++;console.log(api.obj.n);','js/model.js':'export const obj={n:1};'}),
 fixture({'js/main.js':'import {x} from "./index.js";console.log(x);','js/index.js':'export * from "./a.js";export * from "./b.js";','js/a.js':'export {x} from "../base.js";','js/b.js':'import {x as value} from "../base.js";export {value as x};','base.js':'export let x=1;'}),
 fixture({'js/main.js':'import * as api from "./index.js";console.log(api.x,api.y);','js/index.js':'export * from "./a.js";export * from "./b.js";','js/a.js':'export let x=1;export const y=3;','js/b.js':'export let x=2;'}),
 fixture({'js/main.js':'import * as api from "./index.js";console.log(api.default,api.n);','js/index.js':'export * from "./model.js";','js/model.js':'export default 7;export const n=1;'}),
 fixture({'js/main.js':'import snap,{live,inc} from "./index.js";inc();console.log(snap,live);','js/index.js':'export {default,live,inc} from "./model.js";','js/model.js':'let n=1;export default n;export {n as live};export function inc(){n++;}'}),
 fixture({'js/main.js':'import {x} from "./index.js";console.log(x(2));','js/index.js':'export * from "./a.js";export * from "./b.js";','js/a.js':'export {default as x} from "./model.js";','js/b.js':'export {f as x} from "./model.js";','js/model.js':'export default function f(n){return n+1;}export {f};'}),
 fixture({'js/main.js':'import {ns} from "./index.js";console.log(ns.n);','js/index.js':'export * from "./a.js";export * from "./b.js";','js/a.js':'export * as ns from "./model.js";','js/b.js':'import * as value from "./model.js";export {value as ns};','js/model.js':'export const n=2;'}),
 fixture({'js/main.js':'import * as api from "./model.js";const f=api.double;console.log([1,2].map(f).join());','js/model.js':'export const double=n=>n*2;'}),
 ];
 for(const explicitFirst of [true,false])cases.push(fixture({'js/main.js':'import {x} from "./index.js";console.log(x);','js/index.js':(explicitFirst?'export const x=9;':'')+'export * from "./a.js";export * from "./b.js";'+(explicitFirst?'':'export const x=9;'),'js/a.js':'export let x=1;','js/b.js':'export let x=2;'}));
 // Node24 still follows the older local-namespace-export rule. For this one
 // 2026 case use its equivalent direct native namespace-reexport reference.
 const namespace=cases.splice(11,1)[0];namespace.files['js/main.js']='import {ns} from "./index.js";import * as direct from "./model.js";console.log(ns===direct,ns.n);';
 cases.push(fixture({'js/main.js':'export {x};import "./side.js";import {x} from "./a.js";console.log(x);','js/side.js':'console.log("side");','js/a.js':'console.log("a");export const x=1;'}));
 cases.push(fixture({'js/main.js':'export {ns};import "./side.js";import * as ns from "./a.js";console.log(ns.x);','js/side.js':'console.log("side");','js/a.js':'console.log("a");export const x=1;'}));
 cases.push(fixture({'js/main.js':'export {v as first,local};export {x} from "./reexport.js";import "./side.js";import {x as v} from "./a.js";const local=2;console.log(v,local);','js/reexport.js':'console.log("reexport");export const x=9;','js/side.js':'console.log("side");','js/a.js':'console.log("a");export const x=1;'}));
 for(const [index,p]of cases.entries()){const original=await nodeOracle(p,info,index);expect(original.error,JSON.stringify(p.files)).toBeNull();expect(await evaluate(quick,p,compileDebugProject(p)),JSON.stringify(p.files)).toEqual(original);}
 const reference=fixture({...namespace.files,'js/index.js':'export * as ns from "./model.js";'}),expected={error:null,logs:['true 2'],jobs:false};expect(await nodeOracle(reference,info,'namespace-2026')).toEqual(expected);expect(await evaluate(quick,namespace,compileDebugProject(namespace))).toEqual(expected);
});

test('Kanonische Projektpfade und Caps; keine Root-/Privat-/URL-/Windows-/Encoding-Umwege',()=>{
 const files={'js/main.js':'','model.js':'','js/a.js':''};
 expect(resolveDebugImport('js/main.js','../model.js',files)).toBe('model.js');expect(resolveDebugImport('js/main.js','./parts/../a.js',files)).toBe('js/a.js');
 for(const name of ['../x.js','./x.js','/x.js','C:/x.js','js\\x.js','js//x.js','js/../x.js','.git/x.js','js/.env.js','local-rag/x.js','Local-AI/x.js','node_modules/x.js','js/%61.js','js/a.js?x','js/a.js#x','js/a.js\u0000'])expect(()=>checkModulePath(name),name).toThrow();
 for(const requested of ['../../model.js','./../../model.js','/model.js','file:///x.js','https://example.org/x.js','node:fs','react','./.git/../a.js','./node_modules/../a.js','./local-rag/../a.js','./%61.js','./a.js?x','./a.js#x','..\\model.js'])expect(()=>resolveDebugImport('js/main.js',requested,files),requested).toThrow();
 const at='a'.repeat(63)+'/'+'b'.repeat(59)+'/c.js';expect(at.length).toBe(128);expect(checkModulePath(at)).toBe(at);expect(()=>checkModulePath('x/'+at)).toThrow();
 expect(checkModulePath('a/'.repeat(7)+'m.js')).toBeTruthy();expect(()=>checkModulePath('a/'.repeat(8)+'m.js')).toThrow();
 expect(()=>checkDebugProject(fixture({'js/main.js':'','JS/Main.js':''}))).toThrow();expect(()=>checkDebugProject(fixture({'js/main.js':'','a.js':'','a.js/m.js':''}))).toThrow();
 expect(checkDebugProject(initialDebugProject())).toEqual(initialDebugProject());
});

test('Mehrdeutige/fehlende Weiterexporte und private Bindungen einschließlich unbenutzter Graphen abweisen',()=>{
 const base={'js/main.js':'import {x} from "./index.js";console.log(x);','js/index.js':'export * from "./a.js";export * from "./b.js";','js/a.js':'export let x=1;','js/b.js':'export let x=2;'};
 expect(()=>compileDebugProject(fixture(base))).toThrow('Mehrdeutig');
 expect(()=>compileDebugProject(fixture({...base,'js/index.js':'export {x} from "./a.js";','js/a.js':'export const y=2;'}))).toThrow('fehlt');
 expect(()=>compileDebugProject(fixture({'js/main.js':'import x from "./index.js";','js/index.js':'export * from "./a.js";','js/a.js':'export default 2;'}))).toThrow('fehlt');
 for(const source of ['export * as __azubi_dbg_scope_0 from "./model.js";','export {x as __azubi_dbg_checkpoint} from "./model.js";','export {__azubi_dbg_scope_0 as x} from "./model.js";','import * as __azubi_dbg_scope_0 from "./model.js";','import * as api from "./model.js";api.constructor;','import * as api from "./model.js";api=1;'])expect(()=>compileDebugProject(fixture({'js/main.js':source,'js/model.js':'export const x=1;'})),source).toThrow();
 expect(()=>compileDebugProject(fixture({'js/main.js':'console.log(1);','unused.js':'export * from "./cycle.js";','cycle.js':'export * from "./unused.js";'}))).toThrow('Kreisimport');
 expect(()=>compileDebugProject(fixture({'js/main.js':'console.log(1);','unused.js':'export * from "../outside.js";'}))).toThrow();
});

test('Namespace-Funktions-/Prototyp-/Getterwege bleiben passiv und endgültig gesperrt',async({page})=>{
 await open(page);
 for(const expression of ['api.f.call(null)','""+api.f','api[key]']){
  const p=fixture({'js/main.js':'import * as api from "./model.js";const key="con"+"structor";try{'+expression+';}catch(e){console.log("NICHT");}finally{console.log("NICHT");}','js/model.js':'export const f=()=>1;'}),r=await raw(page,p);expect(r.at(-1).type).toBe('error');expect(r.filter(e=>e.type==='log')).toEqual([]);
 }
 const p=fixture({'js/main.js':'import * as api from "./model.js";console.log(api.obj);console.log(api.obj.x);','js/model.js':'export const obj={x:1};'});
 const r=await raw(page,p,{},'continue',{name:'js/model.js',code:'const obj={};Object.defineProperty(obj,"x",{get(){console.log("GETTER");return 1;}});export {obj};'});expect(r.at(-1).type).toBe('error');expect(r.filter(e=>e.type==='log').map(e=>e.text)).toEqual(['[Nicht inspiziert]']);
 const limit=await raw(page,sample,{pauses:2},'step');expect(limit.at(-1).type).toBe('error');const ok=await raw(page,sample);expect(ok.at(-1).type).toBe('done');expect(ok.filter(e=>e.type==='log').map(e=>e.text)).toEqual(['6']);
});

test('Unterordner mit Sammelimport: dateigenaue Schritte/Haltepunkte, Pfadanlegen und JSON-Roundtrip',async({page})=>{
 await open(page);await region(page).getByLabel('Eigener Debugcode',{exact:true}).fill('console.log("Original");');await modules(page);await load(page,sample);await start(page);await expect(status(page)).toContainText('js/main.js:2:');await bp(page,sample,'js/model.js',2,'return');await go(page);await expect(status(page)).toContainText('js/model.js:2:');await expect(stack(page).getByRole('button')).toHaveCount(2);await expect(values(page).locator('tbody tr').filter({hasText:/^nnumber3$/})).toHaveCount(1);
 await region(page).getByLabel('Debugdatei',{exact:true}).selectOption('js/index.js');await expect(status(page)).toContainText('js/model.js:2:');await click(page,'Funktion verlassen');await expect(status(page)).toContainText('js/main.js:3:');await go(page);await expect(output(page)).toHaveText('6');
 await region(page).getByLabel('Neuer Moduldateiname',{exact:true}).fill('js/extra.js');await click(page,'Moduldatei anlegen');await expect(region(page).getByLabel('Debugdatei',{exact:true})).toHaveValue('js/extra.js');await region(page).getByLabel('Eigener Debugcode',{exact:true}).fill('export const extra=2;');
 const pending=page.waitForEvent('download');await click(page,'Modulprojekt exportieren (JSON)');const d=await pending,saved=JSON.parse(fs.readFileSync(await d.path(),'utf8'));expect(saved.files['js/extra.js']).toBe('export const extra=2;');expect(Object.keys(saved)).toEqual(['schema','mode','entry','files']);await expect(page.locator('.pilot-status')).toHaveText('Gespeichert');await page.reload();await openDebugger(page);await expect(region(page).getByLabel('Modulstartdatei',{exact:true})).toHaveValue('js/main.js');await region(page).getByLabel('Debugdatei',{exact:true}).selectOption('js/extra.js');await expect(region(page).getByLabel('Eigener Debugcode',{exact:true})).toHaveValue('export const extra=2;');await region(page).getByLabel('Debugmodus',{exact:true}).selectOption('script');await expect(region(page).getByLabel('Eigener Debugcode',{exact:true})).toHaveValue('console.log("Original");');
});

test('Echter Ordnerimport erhält Unterordner und überspringt private/ungeeignete Dateien ohne Ausführung',async({page},info)=>{
 const directory=info.outputPath('Projekt');fs.mkdirSync(path.join(directory,'js'),{recursive:true});fs.mkdirSync(path.join(directory,'local-rag'),{recursive:true});fs.mkdirSync(path.join(directory,'.git'),{recursive:true});for(const [name,source]of Object.entries(sample.files))fs.writeFileSync(path.join(directory,name),source);for(const [name,source]of [['local-rag/private.js','synthetisch'],['.git/config.js','synthetisch'],['.env.js','synthetisch'],['material.pdf','synthetisch'],['style.css','synthetisch']])fs.writeFileSync(path.join(directory,name),source);
 await open(page);await modules(page);await page.evaluate(()=>{globalThis.__sourceReads=[];const original=File.prototype.text;File.prototype.text=function(){globalThis.__sourceReads.push(this.webkitRelativePath||this.name);return original.call(this);};});
 page.once('dialog',d=>d.accept());await region(page).getByLabel('Modulordner einlesen',{exact:true}).setInputFiles(directory);await expect(region(page).getByLabel('Modulimportstatus')).toContainText('3 Moduldateien');await expect(region(page).getByLabel('Modulimportstatus')).toContainText('5 ungeeignete');expect((await page.evaluate(()=>globalThis.__sourceReads)).sort()).toEqual(Object.keys(sample.files).map(name=>'Projekt/'+name).sort());await expect(region(page).getByLabel('Debugdatei',{exact:true}).locator('option')).toHaveCount(3);await expect(region(page).getByLabel('Modulstartdatei',{exact:true})).toHaveValue('js/main.js');await expect(output(page)).toHaveText('Noch keine Ausgabe.');await start(page);await go(page);await expect(output(page)).toHaveText('6');
});

test('Vollständiger Metadatenpass vor text: Ordnerpfade, Caps, Privates und Abbruch erhalten alte Quellen',async({page})=>{
 await open(page);await modules(page);
 for(const bad of ['Projekt/../escape.js','Projekt/%61.js','Projekt/js//bad.js']){
  const result=await region(page).getByLabel('Modulordner einlesen',{exact:true}).evaluate((input,bad)=>{let reads=0;const t=new DataTransfer();for(const name of ['Projekt/main.js',bad]){const file=new File(['console.log(1);'],name.split('/').at(-1),{type:'text/javascript'});Object.defineProperty(file,'webkitRelativePath',{value:name});file.text=async()=>{reads++;return 'console.log(1);';};t.items.add(file);}Object.defineProperty(input,'files',{value:t.files,configurable:true});input.dispatchEvent(new Event('change',{bubbles:true}));return new Promise(resolve=>setTimeout(()=>resolve(reads),0));},bad);expect(result).toBe(0);
 }
 const metadata=folderDebugFiles([{name:'main.js',webkitRelativePath:'Projekt/js/main.js',size:2},{name:'hidden.js',webkitRelativePath:'Projekt/local-ai/hidden.js',size:999999999},{name:'material.pdf',webkitRelativePath:'Projekt/material.pdf',size:999999999}]);expect(metadata.entries.map(e=>e.name)).toEqual(['js/main.js']);expect(metadata.skipped).toBe(2);
 for(const list of [Array.from({length:17},(_,i)=>({name:'m'+i+'.js',webkitRelativePath:'Projekt/js/m'+i+'.js',size:1})),[{name:'main.js',webkitRelativePath:'Projekt/main.js',size:65537}],[{name:'main.js',webkitRelativePath:'Projekt/main.js',size:NaN}]])expect(()=>folderDebugFiles(list)).toThrow();
 await region(page).getByLabel('Modulordner einlesen',{exact:true}).evaluate(input=>delete input.files);
 await expect(region(page).getByLabel('Modulstartdatei',{exact:true})).toHaveValue('main.js');await expect(region(page).getByLabel('Debugdatei',{exact:true}).locator('option')).toHaveCount(2);
});

test('Mobil: lange Projektpfade und Namespaceframes ohne horizontale Überbreite',async({page})=>{
 const target='module/'+ 'lang'.repeat(14)+'.js',p=fixture({'js/main.js':'import * as api from "../'+target+'";console.log(api.f(3));',[target]:'export function f(n){return n*2;}'});await page.setViewportSize({width:390,height:844});await open(page);await modules(page);await load(page,p);await start(page);await click(page,'Einzelner Schritt');await expect(status(page)).toContainText(target);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);await click(page,'Debuggen stoppen');await expect(status(page)).toContainText('gestoppt');
});

test('Electron: Unterordner/Namespace/Reexport nach Neustart erhalten, keine alte VM @desktop',async({},info)=>{
 test.skip(process.platform!=='win32','Windows-Electron');test.setTimeout(90000);const profile=info.outputPath('profil'),env={...process.env,DATABASE_URL:'',AZUBIPREP_AI_DIR:path.join(profile,'ki'),AZUBIPREP_RAG_DIR:path.join(profile,'rag')};delete env.ELECTRON_RUN_AS_NODE;const options={executablePath:path.join(repo,'desktop/node_modules/electron/dist/electron.exe'),args:[path.join(repo,'desktop'),`--user-data-dir=${profile}`],env};let app;
 try{app=await _electron.launch(options);let page=await app.firstWindow();await page.waitForURL(/^http:/);await open(page,new URL(page.url()).origin+'/frontendkurs');await modules(page);await load(page,sample);await start(page);await click(page,'Einzelner Schritt');await expect(status(page)).toContainText('js/model.js');await go(page);await expect(output(page)).toHaveText('6');await expect(page.locator('.pilot-status')).toHaveText('Gespeichert');await app.close();app=null;
 app=await _electron.launch(options);page=await app.firstWindow();await page.waitForURL(/^http:/);await open(page,new URL(page.url()).origin+'/frontendkurs');await expect(region(page).getByLabel('Modulstartdatei',{exact:true})).toHaveValue('js/main.js');await expect(values(page)).toContainText('Noch kein Halt');await start(page);await go(page);await expect(output(page)).toHaveText('6');}finally{if(app)await app.close();}
});
