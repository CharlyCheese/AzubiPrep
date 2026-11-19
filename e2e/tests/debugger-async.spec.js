import { test, expect, _electron } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initialAsyncProject } from '../../frontend/src/pilot/debugger-promises.js';
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
async function load(page,p=initialAsyncProject()){page.once('dialog',d=>d.accept());await region(page).getByLabel('Modulsicherung lesen',{exact:true}).setInputFiles({name:'promise-probe.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(p))});await expect(region(page).getByLabel('Eigener Debugcode')).toHaveValue(p.files[p.entry]);}
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
  worker.onmessage=({data})=>{events.push(data);if(data.type==='paused'){if(options.hold&&data.cause==='promise'){const length=events.length;setTimeout(()=>{events.push({type:'hold-proof',unchanged:events.length===length});send({mode:options.step?'step':'continue',pauseId:data.pauseId});},100);}else send({mode:options.step?'step':'continue',pauseId:data.pauseId});}if(data.type==='idle'){if(data.timers.pending)wake=setTimeout(()=>send({timer:true}),Math.ceil(data.timers.nextDelay));else finish();}if(['error','done'].includes(data.type))finish();};
  worker.postMessage({type:'start',session:'promise',revision:'rev',artifact:a,limits:{}});
 }),{a,asset,options});
}


test('Async nativ: paralleles Warten, erfülltes/abgelehntes await, catch/finally und Reihenfolge',async({page})=>{
 await open(page);
 const source=`const logs=[];
async function arbeit(name,fehler){logs.push(name+"-start");try{const n=await Promise.resolve(2);logs.push(name+n);if(fehler)throw new Error("oh");return await Promise.resolve(n+1);}catch(e){logs.push(name+e.message);return await Promise.resolve(9);}finally{logs.push(name+"-ende");}}
const a=arbeit("a",false);const b=arbeit("b",true);a.then(n=>{logs.push("a="+n);});b.then(n=>{logs.push("b="+n);});logs.push("sync");setTimeout(()=>{console.log(logs.join("|"));},0);`;
 const native=await page.evaluate(()=>new Promise(done=>{const logs=[];async function arbeit(name,fehler){logs.push(name+'-start');try{const n=await Promise.resolve(2);logs.push(name+n);if(fehler)throw new Error('oh');return await Promise.resolve(n+1);}catch(e){logs.push(name+e.message);return await Promise.resolve(9);}finally{logs.push(name+'-ende');}}const a=arbeit('a',false),b=arbeit('b',true);a.then(n=>logs.push('a='+n));b.then(n=>logs.push('b='+n));logs.push('sync');setTimeout(()=>done(logs.join('|')),0);}));
 const events=await raw(page,source,{step:true,hold:true});expect(events.at(-1).type,JSON.stringify(events.at(-1))).toBe('idle');expect(events.filter(e=>e.type==='log').map(e=>e.text)).toEqual([native]);expect(events.some(e=>e.snapshot?.waiting?.length===2)).toBe(true);for(const e of events.filter(e=>e.snapshot?.frames)){const ids=e.snapshot.frames.concat(e.snapshot.waiting||[]).map(f=>f.id);expect(new Set(ids).size).toBe(ids.length);}
});

test('Async-Ausdrücke, Assimilation, Ablehnung und endlich überschriebene Rückgaben',async({page})=>{
 test.setTimeout(60000);await open(page);
 const cases=[
 ['let count=0;function wert(){count++;return Promise.resolve(4);}async function f(){const x=(await wert())+(await wert());console.log(x);console.log(count);}f();',['8','2']],
 ['const f=async x=>await Promise.resolve(x+1);const g=async function(x){return await f(x);};g(4).then(x=>{console.log(x);});',['5']],
 ['const o={f:async x=>await Promise.resolve(x*2)};o.f(4).then(x=>{console.log(x);});',['8']],
 ['async function f(){try{await Promise.reject("x");}catch(e){console.log(e);await 1;}finally{await 2;console.log("fin");}return 3;}f().then(x=>{console.log(x);});',['x','fin','3']],
 ['async function f(){return Promise.reject("adoptiert");}f().catch(x=>{console.log(x);});',['adoptiert']],
 ['async function f(){await 1;return Promise.reject("adoptiert");}f().catch(x=>{console.log(x);});',['adoptiert']],
 ['async function f(){try{return 1;}finally{return;}}f().then(x=>{console.log(x);});',['undefined']],
 ['async function f(){try{return 1;}finally{await 0;throw "neu";}}f().catch(x=>{console.log(x);});',['neu']],
 ['let p;async function f(){await 1;return p;}p=f();p.catch(e=>{console.log(e.name);});',['TypeError']],
 ['async function f(){try{await Promise.reject("x");}finally{console.log("fin");}}f().catch(e=>{console.log(e);});',['fin','x']],
 ['async function f(){try{return Promise.reject("outer");}finally{for(let i=0;i<1;i++){try{return 1;}finally{break;}}}}f().catch(e=>{console.log(e);});',['outer']],
 ['async function f(){try{return Promise.reject("outer");}finally{for(let i=0;i<1;i++){break;}}}f().catch(e=>{console.log(e);});',['outer']],
 ];
 for(const [source,expected] of cases){const events=await raw(page,source);expect(events.at(-1).type,source+' '+JSON.stringify(events.at(-1))).toBe('idle');expect(events.filter(e=>e.type==='log').map(e=>e.text),source).toEqual(expected);}
 for(const source of ['async function f(){try{return Promise.reject("alt");}finally{return 1;}}f();','async function f(){try{return Promise.reject("alt");}finally{return;}}f();','async function f(){throw "unhandled";}f();','async function f(){for(let i=0;i<1;i++){try{return Promise.reject("alt");}finally{break;}}}f();','async function f(){for(let i=0;i<1;i++){try{return Promise.reject("alt");}finally{continue;}}}f();','async function f(){try{try{return Promise.reject("alt");}finally{throw 1;}}catch(e){console.log(e);}}f();']){const events=await raw(page,source);expect(events.at(-1).text,source).toMatch(/Unbehandelte/);}
});

test('Async-Grenzen: aktive und wartende Frames gemeinsam, Speicher endgültig, unzulässige Syntax',async({page})=>{
 test.setTimeout(60000);await open(page);
 const at=await raw(page,'const p=new Promise(resolve=>{});async function f(){await p;}for(let i=0;i<31;i++){f();}console.log("31");');expect(at.at(-1).type,JSON.stringify(at.at(-1))).toBe('idle');expect(at.filter(e=>e.type==='log').map(e=>e.text)).toEqual(['31']);
 for(const [source,message] of [
 ['const p=new Promise(resolve=>{});async function f(){await p;}for(let i=0;i<32;i++){f();}console.log("verboten");',/Aufrufgrenze/],
 ['async function f(){let s="x";for(let i=0;i<28;i++){s=s+s;}s.trim();}f().catch(e=>{console.log("verboten");});',/Speichergrenze/],
 ['async function f(){await 1;let s="x";for(let i=0;i<28;i++){s=s+s;}s.trim();}f().catch(e=>{console.log("verboten");});',/Speichergrenze/],
 ['[1].map(async n=>await n);',/Asynchrone Array/],
 ['async function f(){await {then:()=>{console.log("verboten");}};}f();',/Thenables/],
 ['await 1;',/nicht unterstützt/],['function* g(){yield 1;}g();',/nicht unterstützt/],
 ]){const events=await raw(page,source);expect(events.at(-1).type,source).toBe('error');expect(events.at(-1).text,source).toMatch(message);expect(events.filter(e=>e.type==='log').map(e=>e.text)).not.toContain('verboten');}
});

test('Async-Module halten auf Originalquelle und zeigen wartende statt falscher aktiver Caller',async({page})=>{
 await open(page);const p=project('import { arbeit } from "./async.js";\nconst p=arbeit(3);\nconsole.log("start");\np.then(n=>{console.log(n);});');p.files['async.js']='export async function arbeit(n){\n const x=await Promise.resolve(n);\n return x+2;\n}';const a=artifact(p);const events=await raw(page,p,{step:true});expect(events.at(-1).type,JSON.stringify(events.at(-1))).toBe('idle');expect(events.filter(e=>e.type==='log').map(e=>e.text)).toEqual(['start','5']);const waiting=events.find(e=>e.snapshot?.waiting?.length);expect(waiting.snapshot.frames.length).toBe(1);expect(a.points[waiting.snapshot.waiting[0].point].file).toBe('async.js');expect(events.some(e=>e.snapshot?.frames?.length===2&&a.points[e.point]?.file==='async.js'&&a.points[e.point].line===3)).toBe(true);
});

test('Async-Beispiel: echter Halt nach await, Erfolg/Fehler und wartende Anzeige',async({page})=>{
 await open(page);await load(page);await start(page);await go(page);await idle(page);
 async function run(name,expected){await frame(page).getByRole('button',{name,exact:true}).click();await expect(status(page)).toContainText('Ereignisstart');await go(page);await expect(status(page)).toContainText('Timerstart');await expect(region(page).getByLabel('Wartende async-Aufrufe')).toContainText('starten');await go(page);await expect(status(page)).toContainText('Promise-Fortsetzung');await expect(frame(page).locator('#status')).toHaveText('Wird geladen …');await go(page);await idle(page);await expect(frame(page).locator('#status')).toHaveText(expected);}
 await run('Erfolg ausprobieren','Die Übungsdaten sind bereit.');await run('Fehler ausprobieren','Die Übungsabfrage ist fehlgeschlagen.');await expect(output(page)).toContainText('Fehler behandelt');await expect(output(page)).toContainText('Dieser Ablauf ist abgeschlossen.');
});

test('Async-Stop während einer Fortsetzung, schmale Ansicht und neuer Lauf',async({page})=>{
 await page.setViewportSize({width:390,height:844});await open(page);await load(page,project('async function f(){await 1;console.log("alt");}f();'));await start(page);await go(page);await expect(status(page)).toContainText('Promise-Fortsetzung');await button(page,'Debuggen stoppen').focus();await page.keyboard.press('Enter');await expect(status(page)).toContainText('gestoppt');await page.waitForTimeout(100);expect(page.workers()).toHaveLength(0);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);await region(page).getByLabel('Eigener Debugcode').fill('console.log("neu");');await start(page);await go(page);await idle(page);await expect(output(page)).toHaveText('neu');
});

test('Electron: async-Funktion wartet, läuft weiter und Projekt bleibt nach Neustart @desktop',async({},info)=>{
 test.skip(process.platform!=='win32','Windows-Electron');test.setTimeout(60000);const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;env.DATABASE_URL='';env.AZUBIPREP_KI_ENABLED='false';env.AZUBIPREP_CHATGPT_ENABLED='false';let app;const launch=()=>_electron.launch({executablePath:path.join(repo,'desktop/node_modules/electron/dist/electron.exe'),args:[path.join(repo,'desktop'),'--user-data-dir='+info.outputPath('profil')],env});
 try{for(let i=0;i<2;i++){app=await launch();const page=await app.firstWindow();await page.waitForURL(/^http:/);await open(page,new URL(page.url()).origin+'/frontendkurs/debugger');if(!i)await load(page,project('async function f(){const x=await Promise.resolve(3);console.log(x+1);}f();'));await start(page);await go(page);await expect(status(page)).toContainText('Promise-Fortsetzung');await go(page);await idle(page);await expect(output(page)).toHaveText('4');await expect(page.locator('.pilot-status')).toHaveText('Gespeichert');await app.close();app=null;}}finally{await app?.close();}
});

test('Async-Quellenwechsel und Moduswechsel verwerfen wartende Fortsetzungen',async({page})=>{
 await open(page);await load(page,project('async function f(){await 1;console.log("alt");}f();'));await start(page);await go(page);await expect(status(page)).toContainText('Promise-Fortsetzung');
 await region(page).getByLabel('Debugmodus',{exact:true}).selectOption('script');await expect(status(page)).toContainText('Quellstand bereit');await page.waitForTimeout(100);expect(page.workers()).toHaveLength(0);await expect(output(page)).toHaveText('Noch keine Ausgabe.');
 await region(page).getByLabel('Debugmodus',{exact:true}).selectOption('dom');await start(page);await go(page);await expect(status(page)).toContainText('Promise-Fortsetzung');await load(page,project('console.log("neu");'));await page.waitForTimeout(100);expect(page.workers()).toHaveLength(0);await start(page);await go(page);await idle(page);await expect(output(page)).toHaveText('neu');
});
