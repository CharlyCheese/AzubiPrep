import { test, expect, _electron } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initialAbortProject, checkFetchFixtures } from '../../frontend/src/pilot/debugger-fetch.js';
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
async function load(page,p=initialAbortProject()){page.once('dialog',d=>d.accept());await region(page).getByLabel('Modulsicherung lesen',{exact:true}).setInputFiles({name:'promise-probe.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(p))});await expect(region(page).getByLabel('Eigener Debugcode')).toHaveValue(p.files[p.entry]);}
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


test('AbortController: Identität, vorab abgebrochen, gemeinsames Signal und doppelt abbrechen',async({page})=>{
 await open(page);const source='const c=new AbortController();console.log(c.signal===c.signal);console.log(c.signal.aborted);console.log(c.signal.reason);fetch("/uebung/test",{signal:c.signal}).catch(e=>{console.log(e.name);console.log(e===c.signal.reason);});fetch("/uebung/test",{signal:c.signal}).catch(e=>{console.log(e.name);});c.abort();const reason=c.signal.reason;c.abort();console.log(c.signal.reason===reason);console.log(c.signal.aborted);fetch("/uebung/test",{signal:c.signal}).catch(e=>{console.log(e.name);});fetch("/uebung/test").then(r=>{console.log(r.status);});';
 const events=await raw(page,withRoutes(source));expect(events.at(-1).type,JSON.stringify(events.at(-1))).toBe('idle');expect(events.filter(e=>e.type==='log').map(e=>e.text)).toEqual(['true','false','undefined','true','true','AbortError','true','AbortError','AbortError','200']);expect(events.some(e=>e.type==='requests'&&e.snapshot.pending===0)).toBe(true);
});

test('Abbruch nach Zustellung: ungelesener Body, verbrauchter Body und fertige Promise',async({page})=>{
 await open(page);
 const cases=[
 ['async function f(){const c=new AbortController();const r=await fetch("/uebung/test",{signal:c.signal});c.abort();try{await r.text();}catch(e){console.log(e.name);}console.log(r.bodyUsed);try{await r.json();}catch(e){console.log(e.name);}}f();',[route(200,'Hallo')],['AbortError','false','AbortError']],
 ['async function f(){const c=new AbortController();const r=await fetch("/uebung/test",{signal:c.signal});const p=r.text();c.abort();console.log(await p);}f();',[route(200,'Hallo')],['Hallo']],
 ['async function f(){const c=new AbortController();const r=await fetch("/uebung/test",{signal:c.signal});c.abort();console.log(await r.text());console.log(r.bodyUsed);}f();',[route(204,'')],['','false']],
 ];for(const [source,routes,expected] of cases){const events=await raw(page,withRoutes(source,routes));expect(events.at(-1).type,JSON.stringify(events.at(-1))).toBe('idle');expect(events.filter(e=>e.type==='log').map(e=>e.text)).toEqual(expected);}
 const nativePage=await page.context().newPage();const native=await nativePage.evaluate(async()=>{const c=new AbortController(),r=await fetch('data:text/plain,Hallo',{signal:c.signal});c.abort();const result=[];try{await r.text();}catch(e){result.push(e.name);}result.push(String(r.bodyUsed));try{await r.text();}catch(e){result.push(e.name);}return result;});await nativePage.close();expect(native).toEqual(['AbortError','false','AbortError']);
});

test('Abort-Grenzen und Signalrechte sind endgültig',async({page})=>{
 await open(page);for(const [source,message] of [
 ['for(let i=0;i<65;i++){new AbortController();}',/64/],
 ['const c=new AbortController();c.abort("eigenerGrund");',/Abbruchgründe/],
 ['fetch("/uebung/test",{signal:{aborted:false}});',/eigenes AbortSignal/],
 ['const c=new AbortController();c.signal.aborted=true;',/lesbar/],
 ['const c=new AbortController();const abort=c.abort;',/Abort-Zustand/],
 ['const c=new AbortController();fetch("/uebung/test",{signal:c.signal,method:"POST"});',/Optionen/],
 ]){const events=await raw(page,withRoutes(source));expect(events.at(-1).type,source).toBe('error');expect(events.at(-1).text).toMatch(message);}
 const at=await raw(page,withRoutes('for(let i=0;i<64;i++){new AbortController();}console.log("64");'));expect(at.at(-1).type,JSON.stringify(at.at(-1))).toBe('idle');
});

test('Anfragenummer schützt neuen Erfolg vor altem Erfolg, Fehler und finally auch ohne Abbruch',async({page})=>{
 await open(page);const routes=[route(200,'alt','/uebung/langsam',150),route(200,'neu','/uebung/schnell',0),{path:'/uebung/fehler',kind:'network-error',delayMs:150}];
 for(const path of ['/uebung/langsam','/uebung/fehler']){const source='let generation=0;let state="";let loading=false;async function load(path){generation++;const own=generation;loading=true;try{const r=await fetch(path);const text=await r.text();if(own===generation)state=text;}catch(e){if(own===generation)state="fehler";}finally{if(own===generation){loading=false;console.log(state);}}}load("'+path+'");load("/uebung/schnell");setTimeout(()=>{console.log(state);console.log(loading);},200);';const events=await raw(page,withRoutes(source,routes));expect(events.at(-1).type,JSON.stringify(events.at(-1))).toBe('idle');expect(events.filter(e=>e.type==='log').map(e=>e.text)).toEqual(['neu','neu','false']);}
});

async function drain(page){for(let i=0;i<16;i++){await expect.poll(async()=>{const text=await status(page).textContent();return text.includes('Angehalten')||text.includes('Bereit für Klicks')||text.includes('beendet');}).toBe(true);if((await status(page).textContent()).includes('Bereit für Klicks'))return;await go(page);}throw new Error('Abbruchbeispiel bleibt angehalten');}

test('Abbruchbeispiel: langsam durch schnell ersetzen, bewusst abbrechen und Stop',async({page})=>{
 await page.setViewportSize({width:390,height:844});await open(page);await load(page);await start(page);await go(page);await idle(page);
 await frame(page).getByRole('button',{name:'Langsam laden',exact:true}).click();await expect(status(page)).toContainText('Ereignisstart');await go(page);await idle(page);await expect(region(page).getByLabel('Geplante Übungsanfragen',{exact:true})).toContainText(': 1.');
 await frame(page).getByRole('button',{name:'Schnell laden',exact:true}).click();await expect(status(page)).toContainText('Ereignisstart');await go(page);await expect(status(page)).toContainText('Promise-Fortsetzung');await drain(page);await expect.poll(async()=>{if((await status(page).textContent()).includes('Angehalten'))await go(page);return await frame(page).locator('#daten').textContent();}).toBe('Schnelle Antwort');await idle(page);await expect(frame(page).locator('#status')).toHaveText('Antwort übernommen.');
 await frame(page).getByRole('button',{name:'Langsam laden',exact:true}).click();await expect(status(page)).toContainText('Ereignisstart');await go(page);await idle(page);await frame(page).getByRole('button',{name:'Anfrage abbrechen',exact:true}).click();await expect(status(page)).toContainText('Ereignisstart');await go(page);await expect(status(page)).toContainText('Promise-Fortsetzung');await drain(page);await expect(frame(page).locator('#status')).toHaveText('Anfrage abgebrochen.');await expect(frame(page).locator('#daten')).toHaveText('Schnelle Antwort');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await button(page,'Debuggen stoppen').click();expect(page.workers()).toHaveLength(0);await page.waitForTimeout(200);await expect(status(page)).toContainText('gestoppt');
});

test('Electron: Abbruchsignale bleiben flüchtig und Projekt startet nach Neustart frisch @desktop',async({},info)=>{
 test.skip(process.platform!=='win32','Windows-Electron');test.setTimeout(60000);const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;env.DATABASE_URL='';env.AZUBIPREP_KI_ENABLED='false';env.AZUBIPREP_CHATGPT_ENABLED='false';let app;const launch=()=>_electron.launch({executablePath:path.join(repo,'desktop/node_modules/electron/dist/electron.exe'),args:[path.join(repo,'desktop'),'--user-data-dir='+info.outputPath('profil')],env});
 try{for(let i=0;i<2;i++){app=await launch();const page=await app.firstWindow();await page.waitForURL(/^http:/);await open(page,new URL(page.url()).origin+'/frontendkurs/debugger');if(!i)await load(page,withRoutes('const c=new AbortController();console.log(c.signal.aborted);fetch("/uebung/test",{signal:c.signal}).catch(e=>{console.log(e.name);});c.abort();'));await start(page);await go(page);await expect(status(page)).toContainText('Promise-Fortsetzung');await drain(page);await expect(output(page)).toHaveText('false\nAbortError');await expect(page.locator('.pilot-status')).toHaveText('Gespeichert');await app.close();app=null;}}finally{await app?.close();}
});
