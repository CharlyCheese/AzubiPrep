import { test, expect, _electron } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initialFetchProject, checkFetchFixtures } from '../../frontend/src/pilot/debugger-fetch.js';
import { createDebugTimerQueue } from '../../frontend/src/pilot/debugger-timers.js';
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
async function load(page,p=initialFetchProject()){page.once('dialog',d=>d.accept());await region(page).getByLabel('Modulsicherung lesen',{exact:true}).setInputFiles({name:'promise-probe.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(p))});await expect(region(page).getByLabel('Eigener Debugcode')).toHaveValue(p.files[p.entry]);}
async function start(page){await button(page,'Debuggen starten').click();await expect(status(page)).toContainText('Programmstart');}
async function go(page){const id=await status(page).getAttribute('data-pause-id');await button(page,'Weiter / bis zum nächsten Haltepunkt').click();await expect.poll(async()=>await status(page).getAttribute('data-phase')!=='paused'||await status(page).getAttribute('data-pause-id')!==id).toBe(true);}
async function idle(page){await expect(status(page)).toContainText('Bereit für Klicks');}
function artifact(p){const a=compileDebugProject(p,undefined,{dom:true});a.dom={tree:parseDebugHTML(p.html),eventPoint:a.points.at(-1).id};a.fixtures=checkFetchFixtures(p.fixtures);return a;}
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
  worker.onmessage=({data})=>{events.push(data);if(data.type==='paused'){if(options.hold&&data.cause==='promise'){const length=events.length;setTimeout(()=>{events.push({type:'hold-proof',unchanged:events.length===length});send({mode:options.step?'step':'continue',pauseId:data.pauseId});},100);}else send({mode:options.step?'step':'continue',pauseId:data.pauseId});}if(data.type==='idle'){if((data.wake??data.timers).pending)wake=setTimeout(()=>send({timer:true}),Math.ceil((data.wake??data.timers).nextDelay));else finish();}if(['error','done'].includes(data.type))finish();};
  worker.postMessage({type:'start',session:'promise',revision:'rev',artifact:a,limits:{}});
 }),{a,asset,options});
}



const route=(status=200,body='{"zahl":4}',path='/uebung/test',delayMs=0)=>({path,kind:'http',status,body,delayMs});
const withRoutes=(source,routes=[route()])=>({...project(source),fixtures:{schema:1,routes}});

test('fetch: Status, ok, bodyUsed, text/json, Nullbody und Fehlerarten',async({page})=>{
 test.setTimeout(60000);await open(page);
 const cases=[
 ['async function f(){const r=await fetch("/uebung/test");console.log(r.status);console.log(r.ok);console.log(r.bodyUsed);const d=await r.json();console.log(d.zahl);console.log(r.bodyUsed);try{await r.text();}catch(e){console.log(e.name);}}f();',[route()],['200','true','false','4','true','TypeError']],
 ['async function f(){const r=await fetch("/uebung/test");console.log(r.status);console.log(r.ok);console.log(await r.text());}f();',[route(404,'fehlt')],['404','false','fehlt']],
 ['async function f(){try{await fetch("/uebung/test");}catch(e){console.log(e.name);}}f();',[{path:'/uebung/test',kind:'network-error',delayMs:0}],['TypeError']],
 ['async function f(){const r=await fetch("/uebung/test");try{await r.json();}catch(e){console.log(e.name);}console.log(r.bodyUsed);}f();',[route(200,'{bad')],['SyntaxError','true']],
 ['async function f(){const r=await fetch("/uebung/test");console.log(await r.text());console.log(r.bodyUsed);console.log(await r.text());try{await r.json();}catch(e){console.log(e.name);}}f();',[route(204,'')],['','false','','SyntaxError']],
 ['fetch("/uebung/missing").catch(e=>{console.log(e.name);});',[],['TypeError']],
 ];
 for(const [source,routes,expected] of cases){const events=await raw(page,withRoutes(source,routes),{hold:true});expect(events.at(-1).type,source+' '+JSON.stringify(events.at(-1))).toBe('idle');expect(events.filter(e=>e.type==='log').map(e=>e.text)).toEqual(expected);expect(events.filter(e=>e.type==='hold-proof').every(e=>e.unchanged)).toBe(true);}
});

test('Gemeinsame Uhr: Aufgabenreihenfolge, getrennte Budgets und eingefrorene Pause',async({page})=>{
 let clock=0;const q=createDebugTimerQueue(()=>clock);q.scheduleFetch(1,10);q.schedule(1,10);q.scheduleFetch(2,10);clock=5;q.pause();clock=100;expect(q.takeTask()).toBeNull();expect(q.wakeSnapshot()).toEqual({pending:3,nextDelay:5});q.resume();clock=105;expect(q.takeTask()).toEqual({kind:'fetch',id:1});q.endTask();expect(q.takeTask()).toEqual({kind:'timer',id:1});q.endTask();expect(q.takeTask()).toEqual({kind:'fetch',id:2});
 await open(page);const source='fetch("/uebung/test").then(r=>{console.log("fetch1");});setTimeout(()=>{console.log("timer");Promise.resolve().then(()=>{console.log("micro");});},0);fetch("/uebung/test").then(r=>{console.log("fetch2");});console.log("sync");';const events=await raw(page,withRoutes(source));expect(events.at(-1).type,JSON.stringify(events.at(-1))).toBe('idle');expect(events.filter(e=>e.type==='log').map(e=>e.text)).toEqual(['sync','fetch1','timer','micro','fetch2']);
});

test('Übungsantworten: Metadaten und endgültige Laufzeitgrenzen',async({page})=>{
 test.setTimeout(60000);await open(page);
 for(const path of ['https://example.org/a','file:///secret','/uebung/../secret','/uebung/local-rag/a','/uebung/a?token=1','//uebung/a'])expect(()=>checkFetchFixtures({schema:1,routes:[route(200,'',path)]})).toThrow();
 expect(()=>checkFetchFixtures({schema:1,routes:[route(302,'')]})).toThrow();expect(()=>checkFetchFixtures({schema:1,routes:[route(200,'x'.repeat(16385))]})).toThrow();expect(()=>checkFetchFixtures({schema:1,routes:[route(204,'x')]})).toThrow();
 const cases=[
 ['fetch("https://example.org");',/uebung/],['const f=fetch;',/nicht unterstützt/],
 ['async function f(){const r=await fetch("/uebung/test");r.status=201;}f();',/lesbar/],
 ['async function f(){const r=await fetch("/uebung/test");const t=r.text;}f();',/direkte/],
 ['for(let i=0;i<9;i++){fetch("/uebung/test");}',/Anfragegrenze/],
 ['async function f(){for(let i=0;i<65;i++){await fetch("/uebung/test");}}f();',/Anfragegrenze/],
 ['async function f(){const r=await fetch("/uebung/test");for(let i=0;i<256;i++){r.status;}}f();',/Operationsgrenze/],
 ];
 for(const [source,message] of cases){const events=await raw(page,withRoutes(source));expect(events.at(-1).type,source).toBe('error');expect(events.at(-1).text,source).toMatch(message);}
 const at=await raw(page,withRoutes('async function f(){for(let i=0;i<64;i++){await fetch("/uebung/test");}console.log("64");}f();'));expect(at.at(-1).type,JSON.stringify(at.at(-1))).toBe('idle');
 const over=await raw(page,withRoutes('async function f(){for(let i=0;i<17;i++){await fetch("/uebung/test");}}f();',[route(200,'x'.repeat(16384))]));expect(over.at(-1).text).toContain('Gesamtgrenze');
 const badJSON=await raw(page,withRoutes('async function f(){try{const r=await fetch("/uebung/test");await r.json();}catch(e){console.log("verboten");}}f();',[route(200,JSON.stringify('x'.repeat(2049)))]));expect(badJSON.at(-1).text).toContain('Feldgrenze');expect(badJSON.filter(e=>e.type==='log')).toHaveLength(0);
});

async function drain(page){for(let i=0;i<15;i++){await expect.poll(async()=>{const text=await status(page).textContent();return text.includes('Angehalten')||text.includes('Bereit für Klicks')||text.includes('beendet');}).toBe(true);if((await status(page).textContent()).includes('Bereit für Klicks'))return;await go(page);}throw new Error('Beispiel bleibt angehalten');}

test('Datenladebeispiel: vier Ergebnisse und keine Netzabfragen aus eigenem Code',async({page})=>{
 await open(page);await load(page);await start(page);await go(page);await idle(page);
 const requests=[];page.on('request',r=>requests.push(r.url()));
 for(const [name,expected] of [['Erfolg laden','Die Übungsdaten sind bereit.'],['HTTP 404 ausprobieren','HTTP-Fehler 404'],['Transportfehler ausprobieren','TypeError'],['Ungültiges JSON ausprobieren','SyntaxError']]){await frame(page).getByRole('button',{name,exact:true}).click();await expect(status(page)).toContainText('Ereignisstart');await go(page);await expect(status(page)).toContainText('Promise-Fortsetzung');await drain(page);await expect(frame(page).locator('#status')).toContainText(expected);}
 expect(requests.filter(url=>!url.startsWith('blob:'))).toEqual([]);
});

test('Übungsantworten bearbeiten, sichern und ohne automatischen Start einlesen',async({page},info)=>{
 await page.setViewportSize({width:390,height:844});await open(page);await load(page);const editor=region(page).getByLabel('Übungsantworten bearbeiten',{exact:true});await editor.locator('summary').click();await editor.getByLabel('Antwort 1: Antworttext',{exact:true}).fill('{"text":"Neu"}');await editor.getByRole('button',{name:'Übungsantworten übernehmen',exact:true}).click();
 const download=page.waitForEvent('download');await button(page,'Modulprojekt exportieren (JSON)').click();const file=await download;await file.saveAs(info.outputPath('projekt.json'));const saved=JSON.parse(fs.readFileSync(info.outputPath('projekt.json'),'utf8'));expect(saved.fixtures.routes[0].body).toBe('{"text":"Neu"}');expect(saved).not.toHaveProperty('snapshot');await load(page,saved);expect(page.workers()).toHaveLength(0);await start(page);await go(page);await idle(page);await frame(page).getByRole('button',{name:'Erfolg laden',exact:true}).click();await expect(status(page)).toContainText('Ereignisstart');await go(page);await expect(status(page)).toContainText('Promise-Fortsetzung');await drain(page);await expect(frame(page).locator('#status')).toHaveText('Neu');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});

test('Electron: kontrollierte Antwort läuft nach vollständigem Neustart weiter im eigenen Projekt @desktop',async({},info)=>{
 test.skip(process.platform!=='win32','Windows-Electron');test.setTimeout(60000);const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;env.DATABASE_URL='';env.AZUBIPREP_KI_ENABLED='false';env.AZUBIPREP_CHATGPT_ENABLED='false';let app;const launch=()=>_electron.launch({executablePath:path.join(repo,'desktop/node_modules/electron/dist/electron.exe'),args:[path.join(repo,'desktop'),'--user-data-dir='+info.outputPath('profil')],env});
 try{for(let i=0;i<2;i++){app=await launch();const page=await app.firstWindow();await page.waitForURL(/^http:/);await open(page,new URL(page.url()).origin+'/frontendkurs/debugger');if(!i)await load(page,withRoutes('async function f(){const r=await fetch("/uebung/test");const d=await r.json();console.log(d.zahl);}f();'));await start(page);await go(page);await expect(status(page)).toContainText('Promise-Fortsetzung');await drain(page);await expect(output(page)).toHaveText('4');await expect(page.locator('.pilot-status')).toHaveText('Gespeichert');await app.close();app=null;}}finally{await app?.close();}
});

test('Unveränderte Übungsantworten übernehmen beendet Pause mit bedienbarem Neustart',async({page})=>{
 await open(page);await load(page);await start(page);const editor=region(page).getByLabel('Übungsantworten bearbeiten',{exact:true});await editor.locator('summary').click();await editor.getByRole('button',{name:'Übungsantworten übernehmen',exact:true}).click();await expect(status(page)).toContainText('Quellstand bereit');await expect(button(page,'Weiter / bis zum nächsten Haltepunkt')).toBeDisabled();await expect(button(page,'Debuggen stoppen')).toBeDisabled();expect(page.workers()).toHaveLength(0);await start(page);await go(page);await idle(page);
});
