import { test, expect, _electron } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initialPromiseProject, installDebugPromises } from '../../frontend/src/pilot/debugger-promises.js';
import { compileDebugProject } from '../../frontend/src/pilot/debugger-compiler.js';
import { parseDebugHTML } from '../../frontend/src/pilot/debugger-dom-parse.js';
import { unterdrueckeOnboardingPopups, openDebugger } from './helpers.js';
test.use({ serviceWorkers: 'block' });
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const region=p=>p.getByRole('region',{name:'Debugger-Technikpilot',exact:true});
const button=(p,name)=>region(p).getByRole('button',{name,exact:true});
const status=p=>region(p).getByLabel('Debugstatus',{exact:true});
const output=p=>region(p).getByLabel('Debugkonsole',{exact:true});
const frame=p=>p.frameLocator('iframe[title="Gestaltete Debugvorschau"]');
const project=source=>({schema:1,mode:'module',entry:'main.js',html:'<p id="text">Start</p>',css:'body {color: #163344;}',files:{'main.js':source}});
async function open(page,url='/frontendkurs/debugger'){await unterdrueckeOnboardingPopups(page);await page.goto(url);await openDebugger(page);await region(page).getByLabel('Debugmodus',{exact:true}).selectOption('dom');}
async function load(page,p=initialPromiseProject()){page.once('dialog',d=>d.accept());await region(page).getByLabel('Modulsicherung lesen',{exact:true}).setInputFiles({name:'promise-probe.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(p))});await expect(region(page).getByLabel('Eigener Debugcode')).toHaveValue(p.files[p.entry]);}
async function start(page){await button(page,'Debuggen starten').click();await expect(status(page)).toContainText('Programmstart');}
async function go(page){await button(page,'Weiter / bis zum nächsten Haltepunkt').click();}
async function idle(page){await expect(status(page)).toContainText('Bereit für Klicks');}
function artifact(p){const a=compileDebugProject(p,undefined,{dom:true});a.dom={tree:parseDebugHTML(p.html),eventPoint:a.points.at(-1).id};return a;}
async function raw(page,source,options={}){
 let a;try{a=artifact(typeof source==='string'?project(source):source);}catch(error){return[{type:'error',text:error.message}];}
 // Trusted test-only queue filling exercises the outer native-job budget even
 // though learner Promise-count limits normally stop such a large fan-out first.
 if(options.nativeJobs){a.modules[a.name]+='\n{const p=Promise.resolve();for(let i=0;i<'+options.nativeJobs+';i++){p.then(()=>{});}}';a.code=a.modules[a.name];}
 const asset=fs.readdirSync(path.join(repo,'frontend/dist/assets')).find(n=>/^debugger\.worker-.*\.js$/.test(n));
 return page.evaluate(({a,asset,options})=>new Promise(resolve=>{
  const worker=new Worker('/assets/'+asset,{type:'module'}),events=[];let command=0,wake;
  const finish=()=>{clearTimeout(timeout);clearTimeout(wake);worker.terminate();resolve(events);},timeout=setTimeout(()=>{events.push({type:'timeout'});finish();},14000);
  const send=fields=>worker.postMessage({type:'control',session:'promise',revision:'rev',commandId:++command,...fields});
  worker.onmessage=({data})=>{events.push(data);if(data.type==='paused'){if(options.hold&&data.cause==='promise'){const length=events.length;setTimeout(()=>{events.push({type:'hold-proof',unchanged:events.length===length});send({mode:'continue',pauseId:data.pauseId});},100);}else send({mode:'continue',pauseId:data.pauseId});}if(data.type==='idle'){if(data.timers.pending)wake=setTimeout(()=>send({timer:true}),Math.ceil(data.timers.nextDelay));else finish();}if(['error','done'].includes(data.type))finish();};
  worker.postMessage({type:'start',session:'promise',revision:'rev',artifact:a,limits:{}});
 }),{a,asset,options});
}

test('Native Promise-Ketten: Reihenfolge, Executor, Werte, Ablehnung, finally und Timer',async({page})=>{
 await open(page);const source=`const logs=[];const p=new Promise((resolve,reject)=>{logs.push("executor");resolve(2);reject(99);resolve(3);});p.then(x=>{logs.push(x);return Promise.resolve(x+1);}).then(x=>{logs.push(x);throw new Error("oops");}).catch(e=>{logs.push(e.message);return 7;}).finally(()=>{logs.push("finally");return 88;}).then(x=>{logs.push(x);});Promise.resolve().then(()=>{logs.push("sibling");});logs.push("sync");setTimeout(()=>{console.log(logs.join("|"));},0);`;
 const native=await page.evaluate(()=>new Promise(done=>{const logs=[];const p=new Promise((resolve,reject)=>{logs.push('executor');resolve(2);reject(99);resolve(3);});p.then(x=>{logs.push(x);return Promise.resolve(x+1);}).then(x=>{logs.push(x);throw new Error('oops');}).catch(e=>{logs.push(e.message);return 7;}).finally(()=>{logs.push('finally');return 88;}).then(x=>{logs.push(x);});Promise.resolve().then(()=>{logs.push('sibling');});logs.push('sync');setTimeout(()=>done(logs.join('|')),0);}));
 const events=await raw(page,source,{hold:true});expect(events.at(-1).type,JSON.stringify(events.at(-1))).toBe('idle');expect(events.filter(e=>e.type==='log').map(e=>e.text)).toEqual([native]);expect(events.filter(e=>e.type==='hold-proof').every(e=>e.unchanged)).toBe(true);expect(events.filter(e=>e.type==='paused'&&e.cause==='promise').length).toBeGreaterThan(4);
});

test('Promise-Identität, Handlerweitergabe, Rückgabeverkettung und finally-Ablehnung',async({page})=>{
 await open(page);
 const cases=[
 ['const p=Promise.resolve(4);console.log(Promise.resolve(p)===p);p.then(null).then(x=>{console.log(x);});',['true','4']],
 ['Promise.reject("alt").finally(()=>Promise.reject("neu")).catch(x=>{console.log(x);});',['neu']],
 ['Promise.resolve(1).then(()=>Promise.reject("übernommen")).catch(x=>{console.log(x);});',['übernommen']],
 ['new Promise(resolve=>{resolve(Promise.reject("adoptiert"));}).catch(x=>{console.log(x);});',['adoptiert']],
 ['new Promise((resolve,reject)=>{throw new Error("executor");}).catch(e=>{console.log(e.message);});',['executor']],
 ['const p=Promise.reject(3);p.then().catch(x=>{console.log(x+1);});',['4']],
 ['let later;const p=new Promise(resolve=>{later=resolve;});p.then(x=>{console.log(x);});setTimeout(()=>{later(9);later(10);},0);',['9']],
 ['let p;p=Promise.resolve().then(()=>p);p.catch(e=>{console.log(e.name);});',['TypeError']],
 ];
 for(const [source,expected] of cases){const events=await raw(page,source);expect(events.at(-1).type,JSON.stringify(events.at(-1))).toBe('idle');expect(events.filter(e=>e.type==='log').map(e=>e.text)).toEqual(expected);}
});

test('Promise-Schutz: unhandled, Thenables, private Methoden und endgültige Budgets',async({page})=>{
 test.setTimeout(60000);await open(page);
 for(const [source,message] of [
 ['Promise.reject("nicht behandelt");',/Unbehandelte/],
 ['Promise.resolve().then(()=>{throw new Error("nicht behandelt");});',/Unbehandelte/],
 ['Promise.resolve().then(()=>{let s="x";for(let i=0;i<28;i++){s=s+s;}s.trim();}).catch(e=>{console.log("verboten");});',/Speichergrenze/],
 ['new Promise(resolve=>{let s="x";for(let i=0;i<28;i++){s=s+s;}s.trim();}).catch(e=>{console.log("verboten");});',/Speichergrenze/],
 ['let resolve;const p=new Promise(r=>{resolve=r;});resolve(p);',/Unbehandelte/],
 ['let p;p=Promise.resolve().then(()=>p);',/Unbehandelte/],
 ['Promise.resolve({then:()=>{console.log("verboten");}});',/Thenables/],
 ['const p=Promise.resolve();const method=p.then;method(()=>{});',/Methoden/],
 ['try{for(let i=0;i<129;i++){Promise.resolve(i);}}catch(e){}console.log("verboten");',/Anzahlgrenze/],
 ['const p=Promise.resolve();for(let i=0;i<512;i++){Promise.resolve(p);}',/Operationsgrenze/],
 ['Promise.all([]);',/resolve und reject/],
 ]){const events=await raw(page,source);expect(events.at(-1).type,source).toBe('error');expect(events.at(-1).text).toMatch(message);expect(events.filter(e=>e.type==='log').map(e=>e.text)).not.toContain('verboten');}
 for(const source of ['for(let i=0;i<128;i++){Promise.resolve(i);}console.log("128");','const p=Promise.resolve();for(let i=0;i<511;i++){Promise.resolve(p);}console.log("512");']){const events=await raw(page,source);expect(events.at(-1).type,JSON.stringify(events.at(-1))).toBe('idle');}
});

test('Promise-Namen und importierte Callbackquellen bleiben original',async({page})=>{
 await open(page);const p=project('import { done } from "./handler.js";Promise.resolve(5).then(done);');p.files['handler.js']='export function done(value){\n console.log(value*2);\n}';const events=await raw(page,p);expect(events.at(-1).type).toBe('idle');const a=artifact(p),pause=events.find(e=>e.cause==='promise');expect(a.points[pause.point].file).toBe('handler.js');expect(pause.snapshot.frames.length).toBe(2);expect(events.filter(e=>e.type==='log').map(e=>e.text)).toEqual(['10']);
 const shadow=await raw(page,'const Promise={resolve:n=>n+2};console.log(Promise.resolve(3));');expect(shadow.filter(e=>e.type==='log').map(e=>e.text)).toEqual(['5']);
});

test('Äußere native Jobgrenze: 512 echte Jobs möglich, 513. Job beendet vor Ausführung',async({page})=>{
 await open(page);const at=await raw(page,'console.log("vor Jobs");',{nativeJobs:512});expect(at.at(-1).type,JSON.stringify(at.at(-1))).toBe('idle');const over=await raw(page,'console.log("vor Jobs");',{nativeJobs:513});expect(over.at(-1).type).toBe('error');expect(over.at(-1).text).toContain('Jobgrenze');
});

test('Promisebeispiel: Erfolg, Fehler und Abschluss sichtbar, Haltepunkte halten andere Jobs auf',async({page})=>{
 await open(page);await load(page);await start(page);await go(page);await idle(page);
 async function run(name,expected){await frame(page).getByRole('button',{name,exact:true}).click();await expect(status(page)).toContainText('Ereignisstart');await go(page);await expect(status(page)).toContainText('Timerstart');await go(page);await expect(status(page)).toContainText('Promise-Fortsetzung');await expect(frame(page).locator('#status')).toHaveText('Wird geladen …');await page.waitForTimeout(150);await expect(frame(page).locator('#status')).toHaveText('Wird geladen …');await go(page);await expect(status(page)).toContainText('Promise-Fortsetzung');await go(page);await idle(page);await expect(frame(page).locator('#status')).toHaveText(expected);}
 await run('Erfolg ausprobieren','Die Übungsdaten sind bereit.');await run('Fehler ausprobieren','Die Übungsabfrage ist fehlgeschlagen.');await expect(output(page)).toContainText('Fehler behandelt');await expect(output(page)).toContainText('Dieser Ablauf ist abgeschlossen.');
});

test('Promise-Stop, neue Quelle und mobile Tastatur lassen keine Fortsetzung zurück',async({page})=>{
 await page.setViewportSize({width:390,height:844});await open(page);await load(page,project('Promise.resolve(2).then(value=>{console.log(value);});Promise.resolve().then(()=>{console.log("anderer");});'));await start(page);await go(page);await expect(status(page)).toContainText('Promise-Fortsetzung');await page.waitForTimeout(150);await expect(output(page)).toHaveText('Noch keine Ausgabe.');await button(page,'Debuggen stoppen').focus();await page.keyboard.press('Enter');await expect(status(page)).toContainText('gestoppt');await page.waitForTimeout(100);await expect(output(page)).toHaveText('Noch keine Ausgabe.');expect(page.workers()).toHaveLength(0);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);await region(page).getByLabel('Eigener Debugcode').fill('console.log("neu");');await start(page);await go(page);await idle(page);await expect(output(page)).toHaveText('neu');
});

test('Electron: native Promise-Fortsetzung hält in gleicher VM und Projekt übersteht Neustart @desktop',async({},info)=>{
 test.skip(process.platform!=='win32','Windows-Electron');test.setTimeout(60000);const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;env.DATABASE_URL='';env.AZUBIPREP_KI_ENABLED='false';env.AZUBIPREP_CHATGPT_ENABLED='false';let app;const launch=()=>_electron.launch({executablePath:path.join(repo,'desktop/node_modules/electron/dist/electron.exe'),args:[path.join(repo,'desktop'),'--user-data-dir='+info.outputPath('profil')],env});
 try{app=await launch();let page=await app.firstWindow();await page.waitForURL(/^http:/);await open(page,new URL(page.url()).origin+'/frontendkurs/debugger');await load(page,project('let total=1;Promise.resolve(3).then(value=>{total+=value;console.log(total);});'));await start(page);await go(page);await expect(status(page)).toContainText('Promise-Fortsetzung');await go(page);await idle(page);await expect(output(page)).toHaveText('4');await expect(page.locator('.pilot-status')).toHaveText('Gespeichert');await app.close();app=null;app=await launch();page=await app.firstWindow();await page.waitForURL(/^http:/);await open(page,new URL(page.url()).origin+'/frontendkurs/debugger');await expect(output(page)).toHaveText('Noch keine Ausgabe.');await start(page);await go(page);await expect(status(page)).toContainText('Promise-Fortsetzung');await go(page);await idle(page);await expect(output(page)).toHaveText('4');}finally{await app?.close();}
});
