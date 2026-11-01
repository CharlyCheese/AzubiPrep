import { test, expect, _electron } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileDebugProject } from '../../frontend/src/pilot/debugger-compiler.js';
import { initialDOMProject, validDOMTree, checkDebugHTML, installDebugDOM, DOM_LIMITS } from '../../frontend/src/pilot/debugger-dom.js';
import { parseDebugHTML } from '../../frontend/src/pilot/debugger-dom-parse.js';
import { DEBUG_LIMITS, validateDebugArtifact } from '../../frontend/src/pilot/debugger-core.js';
import { unterdrueckeOnboardingPopups, openDebugger } from './helpers.js';

test.use({serviceWorkers:'block'});
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const region=page=>page.getByRole('region',{name:'Debugger-Technikpilot',exact:true});
const status=page=>region(page).getByLabel('Debugstatus',{exact:true});
const output=page=>region(page).getByLabel('Debugkonsole',{exact:true});
const preview=page=>region(page).getByRole('region',{name:'DOM-Debugvorschau',exact:true});
const button=(page,name)=>region(page).getByRole('button',{name,exact:true});
async function open(page,url='/frontendkurs'){await unterdrueckeOnboardingPopups(page);await page.goto(url);await openDebugger(page);}
async function load(page,p=initialDOMProject()){
 await region(page).getByLabel('Debugmodus',{exact:true}).selectOption('dom');
 page.once('dialog',d=>d.accept());await region(page).getByLabel('Modulsicherung lesen',{exact:true}).setInputFiles({name:'dom.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(p))});
 await expect(region(page).getByLabel('Eigener Debugcode',{exact:true})).toHaveValue(p.files[p.entry]);
}
async function start(page){await button(page,'Debuggen starten').click();await expect(status(page)).toContainText('Angehalten');}
async function go(page){await button(page,'Weiter / bis zum nächsten Haltepunkt').click();}
async function idle(page){await expect(status(page)).toContainText('Bereit für Klicks');}
async function fire(page){await preview(page).getByRole('button',{name:'Eins dazu',exact:true}).click();await expect(status(page)).toContainText('Ereignisstart');}
function artifact(p){const a=compileDebugProject(p,undefined,{dom:true});a.dom={tree:parseDebugHTML(p.html),eventPoint:a.points.at(-1).id};return a;}
async function raw(page,p,options={}){
 const a=artifact(p),asset=fs.readdirSync(path.join(repo,'frontend/dist/assets')).find(n=>/^debugger\.worker-.*\.js$/.test(n));
 return page.evaluate(({artifact,asset,options})=>new Promise(resolve=>{
  if(options.badTree)artifact.dom.tree.attrs.style='position:fixed';
  const worker=new Worker('/assets/'+asset,{type:'module'}),events=[];let command=0,clicks=0,duplicate=false;
  const finish=()=>{clearTimeout(timer);worker.terminate();resolve(events);};const timer=setTimeout(()=>{events.push({type:'timeout'});finish();},14000);
  worker.onmessage=({data})=>{events.push(data);
   const control=body=>worker.postMessage({type:'control',session:'domtest',revision:'rev',commandId:++command,...body});
   if(data.type==='paused')control({pauseId:data.pauseId,mode:'continue'});
   if(data.type==='idle'){
    if(clicks++<(options.clicks??1)){control({event:{id:options.id??3}});if(options.duplicate&&!duplicate){duplicate=true;worker.postMessage({type:'control',session:'domtest',revision:'rev',commandId:command+1,event:{id:options.id??3}});}}
    else finish();
   }
   if(data.type==='error'||data.type==='done')finish();
  };
  worker.postMessage({type:'start',session:'domtest',revision:'rev',artifact,limits:options.limits||{}});
 }),{artifact:a,asset,options});
}

test('DOM: echte Initialisierung, erster Ereignishalt, einzelne Mutation, Closures und kein zweiter Klick in Pause',async({page})=>{
 await open(page);await load(page);await start(page);await expect(preview(page).getByRole('button')).toBeDisabled();await go(page);await idle(page);
 await fire(page);await expect(preview(page).getByRole('button')).toBeDisabled();await expect(preview(page)).toContainText('Stand: 0');await expect(region(page).getByRole('group',{name:'Debug-Aufrufkette'})).toContainText('Vorschauklick');
 await button(page,'Einzelner Schritt').click();await expect(status(page)).toContainText('main.js:5:');await button(page,'Einzelner Schritt').click();await expect(status(page)).toContainText('main.js:6:');await expect(preview(page)).toContainText('Stand: 0');await button(page,'Einzelner Schritt').click();await expect(status(page)).toContainText('main.js:7:');await expect(preview(page)).toContainText('Stand: 1');await expect(output(page)).toHaveText('Noch keine Ausgabe.');await go(page);await idle(page);await expect(output(page)).toHaveText('1');
 await fire(page);await go(page);await idle(page);await expect(output(page)).toHaveText('1\n2');await expect(preview(page)).toContainText('Stand: 2');await button(page,'Debuggen stoppen').click();await expect(preview(page).getByRole('button')).toBeDisabled();await start(page);await expect(preview(page)).toContainText('Stand: 0');await go(page);await idle(page);
});

test('HTML/Snapshot: geschlossene Tags, Attribute, IDs und Größen vor der VM prüfen',()=>{
 for(const html of ['<script>alert(1)</script>','<img src="https://example.org/x">','<style>body{display:none}</style>','<a href="/">x</a>','<form></form>','<input>','<button onclick="x()">x</button>','<p style="color:red">x</p>','<button type="submit">x</button>','<svg></svg>','<iframe></iframe>'])expect(()=>parseDebugHTML(html),html).toThrow();
 expect(()=>checkDebugHTML('a'.repeat(16385))).toThrow();expect(()=>parseDebugHTML('<div>'.repeat(17)+'x'+'</div>'.repeat(17))).toThrow();expect(()=>parseDebugHTML('<span>x</span>'.repeat(65))).toThrow();expect(()=>parseDebugHTML('a'.repeat(2049))).toThrow();
 const tree=parseDebugHTML('<p id="a">Text</p>');expect(validDOMTree(tree)).toBe(true);
 for(const mutate of [t=>{t.extra=1;},t=>{t.attrs.style='x';},t=>{t.children[0].id=t.id;},t=>{t.children[0].tag='script';},t=>{t.children[0].children[0].text='x'.repeat(2049);},t=>{t.children[0].disabled=true;}]){const t=structuredClone(tree);mutate(t);expect(validDOMTree(t)).toBe(false);}
 const a=artifact(initialDOMProject());expect(validateDebugArtifact(a,DEBUG_LIMITS)).toBe(a);expect(()=>validateDebugArtifact({...a,dom:{...a.dom,eventPoint:0}},DEBUG_LIMITS)).toThrow();
});

test('Worker: Selektoren, Klassen, statische Listen, Entfernen und echtes Ereignisbubbling',async({page})=>{
 await open(page);const p={schema:1,mode:'module',entry:'main.js',html:'<div id="box"><button id="b" class="a a c"><span id="child">Klick</span></button><p>Text</p></div>',files:{'main.js':`const box=document.querySelector('#box');const b=document.getElementById('b');const child=document.querySelector('#child');const all=box.querySelectorAll('p');
console.log(document.body.tagName,all.length,b.classList.contains('a'));
b.classList.toggle('a',true);b.classList.add('z');b.classList.remove('c');console.log(b.className);
const removed=e=>console.log('NICHT');b.addEventListener('click',removed);b.removeEventListener('click',removed);
const first=e=>{console.log(e.type,e.target.id,e.currentTarget.id,e.bubbles,e.defaultPrevented);e.preventDefault();};
b.addEventListener('click',first);b.addEventListener('click',first);box.addEventListener('click',e=>{console.log(e.currentTarget.id,e.defaultPrevented);box.textContent='Neu';console.log(all.length,document.querySelectorAll('p').length,child.textContent);});`}};
 const r=await raw(page,p,{id:4});expect(r.at(-1).type).toBe('idle');expect(r.filter(e=>e.type==='log').map(e=>e.text)).toEqual(['BODY 1 true','a z','click child b true false','box true','1 0 Klick']);expect(r.filter(e=>e.type==='final')).toHaveLength(1);expect(r.filter(e=>e.type==='paused').at(-1).cause).toBe('event');
});

test('Worker: Listeneränderung, Stop, Mehrdateien und kumulativer Zustand ohne Replay',async({page})=>{
 await open(page);const p={schema:1,mode:'module',entry:'main.js',html:'<div id="box"><button id="b">B</button></div>',files:{'main.js':`import {attach} from './events.js';console.log('init');attach();`,'events.js':`export function attach(){const b=document.querySelector('#b');const box=document.querySelector('#box');let n=0;const late=e=>console.log('late');const removed=e=>console.log('removed');b.addEventListener('click',e=>{n++;console.log(n);b.removeEventListener('click',removed);b.addEventListener('click',late);box.addEventListener('click',e=>console.log('ancestor'));e.stopPropagation();});b.addEventListener('click',removed);b.addEventListener('click',e=>{console.log('second');e.stopImmediatePropagation();});b.addEventListener('click',e=>console.log('NICHT'));}`}};
 const r=await raw(page,p,{id:3,clicks:2,duplicate:true});expect(r.at(-1).type).toBe('idle');expect(r.filter(e=>e.type==='log').map(e=>e.text)).toEqual(['init','1','second','2','second']);expect(r.filter(e=>e.type==='paused'&&e.cause==='event')).toHaveLength(2);expect(r.filter(e=>e.type==='final')).toHaveLength(1);expect(r.filter(e=>e.type==='paused'&&e.cause==='event').every(e=>e.snapshot.frames.at(-1).point>=0)).toBe(true);
});

test('Worker: DOM-Reflexion, unbekannte Methoden und Schutzverstöße bleiben endgültig',async({page})=>{
 await open(page);
 for(const source of ['document.body.innerHTML="x";','const f=document.querySelector;','document.body.constructor;','document.body.onclick=()=>{};','document.body.click();','document.body.addEventListener("mouseover",()=>{});','document.body.addEventListener("click",()=>{},true);','document.body.style;','document.body["__proto__"];','document.body.textContent={x:1};','document.body.classList.add("a b");']){
  const p=initialDOMProject();p.files={'main.js':`try{${source}}catch(e){console.log('NICHT');}console.log('NICHT');`};let r;try{r=await raw(page,p,{clicks:0});}catch(error){expect(error.message).toMatch(/nicht|unterstützt|gesperrt|erlaubt|Eigenschaft/i);continue;}expect(r.at(-1).type,source).toBe('error');expect(r.filter(e=>e.type==='log'),source).toEqual([]);
 }
 const p=initialDOMProject();const r=await raw(page,p,{badTree:true,clicks:0});expect(r.at(-1).type).toBe('error');expect(r.filter(e=>e.type==='dom')).toEqual([]);
 expect(()=>compileDebugProject(p)).toThrow();
});

test('Worker: Ereignis-/Listener-/Text-/Schreib- und geteilte Laufgrenzen',async({page})=>{
 await open(page);
 const cases=[['document.body.addEventListener("click",()=>{});',{clicks:65,id:1},'Klickgrenze'],['for(let i=0;i<129;i++){document.body.addEventListener("click",()=>{});}',{clicks:0},'Listenergrenze'],['document.body.textContent="x".repeat(2049);',{clicks:0},null],['document.body.addEventListener("click",()=>{for(let i=0;i<2050;i++){document.body.id="a";}});',{id:1},null],['let n=0;document.body.addEventListener("click",()=>{n++;console.log(n);});',{id:1,clicks:3,limits:{logLines:2}},'Ausgabegrenze'],['document.body.addEventListener("click",()=>{while(true){}});',{id:1,limits:{checkpointHits:50}},null]];
 for(const [source,options,error]of cases){const p=initialDOMProject();p.html='';p.files={'main.js':source};const r=await raw(page,p,options);expect(r.at(-1).type,source).toBe('error');if(error)expect(r.at(-1).text).toContain(error);}
});

test('Browser: Originalquellen sichern, Laden ohne Ausführen, Quellwechsel und mobile Vorschau',async({page})=>{
 await page.setViewportSize({width:390,height:844});await open(page);await load(page);await start(page);await go(page);await idle(page);await fire(page);await go(page);await idle(page);await expect(preview(page)).toContainText('Stand: 1');
 const download=page.waitForEvent('download');await button(page,'Modulprojekt exportieren (JSON)').click();const saved=JSON.parse(fs.readFileSync(await (await download).path(),'utf8'));expect(saved).toEqual(initialDOMProject());await expect(page.locator('.pilot-status')).toHaveText('Gespeichert');await page.reload();await openDebugger(page);await expect(region(page).getByLabel('Debugmodus',{exact:true})).toHaveValue('dom');await expect(preview(page)).toHaveCount(0);await expect(output(page)).toHaveText('Noch keine Ausgabe.');await start(page);await go(page);await idle(page);await expect(preview(page)).toContainText('Stand: 0');await fire(page);await region(page).getByLabel('HTML für Debugvorschau',{exact:true}).fill('<button>Anders</button>');await expect(status(page)).toContainText('Quellstand bereit');await expect(preview(page)).toHaveCount(0);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});

test('Browser: Quell-IDs/Klassen bleiben Daten, keine App-CSS-/DOM-Kollision oder Netzressourcen',async({page})=>{
 await open(page);const p=initialDOMProject();p.html='<button id="root" class="sidebar modal btn-primary">Test</button>';p.files={'main.js':'document.body.id="app";document.body.className="sidebar";'};await load(page,p);await start(page);await go(page);await idle(page);const view=preview(page).locator('.debug-dom-preview');expect(await view.locator('[id],[class]').count()).toBe(0);expect(await page.locator('#root').count()).toBe(1);await expect(view.getByRole('button')).toBeVisible();
});

test('Electron: HTML/JS nach Neustart, keine Live-DOM-/Listenerwerte @desktop',async({},info)=>{
 test.skip(process.platform!=='win32');test.setTimeout(90000);const profile=info.outputPath('profil'),env={...process.env,DATABASE_URL:'',AZUBIPREP_AI_DIR:path.join(profile,'ki'),AZUBIPREP_RAG_DIR:path.join(profile,'rag')};delete env.ELECTRON_RUN_AS_NODE;const options={executablePath:path.join(repo,'desktop/node_modules/electron/dist/electron.exe'),args:[path.join(repo,'desktop'),`--user-data-dir=${profile}`],env};let app;
 try{app=await _electron.launch(options);let page=await app.firstWindow();await page.waitForURL(/^http:/);await open(page,new URL(page.url()).origin+'/frontendkurs');await load(page);await start(page);await go(page);await idle(page);await fire(page);await go(page);await idle(page);await expect(preview(page)).toContainText('Stand: 1');await expect(page.locator('.pilot-status')).toHaveText('Gespeichert');await app.close();app=null;
 app=await _electron.launch(options);page=await app.firstWindow();await page.waitForURL(/^http:/);await open(page,new URL(page.url()).origin+'/frontendkurs');await expect(region(page).getByLabel('Debugmodus',{exact:true})).toHaveValue('dom');await expect(region(page).getByLabel('HTML für Debugvorschau',{exact:true})).toHaveValue(initialDOMProject().html);await expect(preview(page)).toHaveCount(0);await start(page);await go(page);await idle(page);await expect(preview(page)).toContainText('Stand: 0');}finally{if(app)await app.close();}
});

test('Native DOM-Referenz: Listenerreihenfolge, spätes Hinzufügen, Identität und Klassentoken',async({page})=>{
 await open(page);
 const html='<div id="box"><button id="b" class=" a  b a ">B</button></div>';
 const source=`const box=document.getElementById('box');const b=document.getElementById('b');let saved=null;let n=0;
console.log(document.getElementById('')===null);b.classList.toggle('a',true);console.log(b.className);b.classList.add();console.log(b.className);b.classList.remove();console.log(b.className);b.classList.toggle('b',false);b.classList.add('z','z');console.log(b.className);b.id=null;b.className=null;b.classList.add(null);console.log(b.id,b.className);b.id='b';b.textContent=undefined;console.log(b.textContent==='');b.textContent=null;console.log(b.textContent==='');b.textContent='B';
const late=e=>console.log('late',e.currentTarget.id);const removed=e=>console.log('NICHT');
b.addEventListener('click',e=>{n++;if(saved!==null)console.log(saved.currentTarget===null);saved=e;console.log('first',n,e.target.id,e.currentTarget.id,e.defaultPrevented);b.removeEventListener('click',removed);b.addEventListener('click',late);box.addEventListener('click',late);e.preventDefault();});b.addEventListener('click',removed);b.addEventListener('click',e=>console.log('second',e.defaultPrevented));`;
 // Authored synthetic reference only; no learner input is executed in the browser.
 const reference=await page.evaluate(({html,source})=>{const doc=document.implementation.createHTMLDocument('reference');doc.body.innerHTML=html;const logs=[];new Function('document','console',source)(doc,{log:(...args)=>logs.push(args.join(' '))});for(let i=0;i<2;i++)doc.querySelector('#b').dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return logs;},{html,source});
 const r=await raw(page,{schema:1,mode:'module',entry:'main.js',html,files:{'main.js':source}},{id:3,clicks:2});expect(r.at(-1).type).toBe('idle');expect(r.filter(e=>e.type==='log').map(e=>e.text)).toEqual(reference);
});

test('Controller: Klickgates, genau ein Ereignis, Ereigniswartefrist und ungültige Baumdaten',async()=>{
 const {startDebugger}=await import('../../frontend/src/pilot/debugger.js');const original=globalThis.Worker;
 class Fake{static all=[];constructor(){this.messages=[];Fake.all.push(this);}postMessage(data){this.messages.push(data);}terminate(){this.terminated=true;}}
 globalThis.Worker=Fake;
 try{
  for(const badTree of [false,true]){
   Fake.all=[];const p=initialDOMProject(),a=artifact(p),events=[];const run=startDebugger({...p,mode:'dom'},e=>events.push(e),{idleMs:30});expect(run.click(3)).toBe(false);Fake.all[0].onmessage({data:{artifact:a}});const worker=Fake.all[1],initial=worker.messages[0],base={session:initial.session,revision:initial.revision};let seq=0;
   const send=data=>worker.onmessage({data:{...data,...base,seq:++seq}});
   send({type:'dom',tree:a.dom.tree});send({type:'running',remaining:1000});expect(run.click(3)).toBe(false);
   const point=a.points.find(x=>x.end),scopes=point.scopes.map(s=>({id:s.id,values:s.names.map(name=>({name,type:'uninitialized',display:'noch nicht initialisiert'}))})),snapshot={point:point.id,truncated:false,scopes,frames:[{id:0,functionId:0,point:point.id,scopes}]};
   send({type:'final',snapshot});send({type:'idle',remaining:900});expect(run.click(3)).toBe(true);expect(run.click(3)).toBe(false);const command=worker.messages.at(-1);expect(command.event).toEqual({id:3});send({type:'ack',commandId:command.commandId});send({type:'running',remaining:900});
   if(badTree){send({type:'dom',tree:{...a.dom.tree,attrs:{style:'bad'}}});expect(events.at(-1).type).toBe('error');}
   else {send({type:'idle',remaining:850});await new Promise(resolve=>setTimeout(resolve,60));expect(events.at(-1).text).toContain('Ereigniswartezeit');}
   expect(worker.terminated).toBe(true);expect(run.click(3)).toBe(false);run.dispose();
  }
 }finally{globalThis.Worker=original;}
});

test('DOM-Modell: Produktionsgrenzen exakt und jede Nullargument-Normalisierung gezählt',()=>{
 const create=()=>{const sent=[],core={guard(){},abort(text){throw new Error(text);},registered:fn=>typeof fn==='function',invoke:(fn,args,target)=>Reflect.apply(fn,target,args)};const model=installDebugDOM(parseDebugHTML('<button id="b" class=" a  a ">B</button>'),core,text=>{const data=JSON.parse(text);sent.push(data);return !data.error&&validDOMTree(data);},DOM_LIMITS);return{model,sent,body:model.ref(model.document,'body').value};};
 const writes=create();for(let i=0;i<2048;i++)writes.model.ref(writes.body,'id').value='a';expect(writes.sent).toHaveLength(2048);expect(()=>{writes.model.ref(writes.body,'id').value='a';}).toThrow('Schreibgrenze');
 const listeners=create();for(let i=0;i<128;i++)listeners.model.bound(listeners.body,'addEventListener')('click',()=>{});expect(()=>listeners.model.bound(listeners.body,'addEventListener')('click',()=>{})).toThrow('Listenergrenze');
 const events=create();let calls=0;events.model.bound(events.body,'addEventListener')('click',()=>calls++);for(let i=0;i<64;i++)events.model.dispatch(1);expect(calls).toBe(64);expect(()=>events.model.dispatch(1)).toThrow('Klickgrenze');expect(calls).toBe(64);
 const normalize=create(),b=normalize.model.bound(normalize.model.document,'getElementById')('b'),classes=normalize.model.ref(b,'classList').value;normalize.model.bound(classes,'add')();expect(normalize.sent).toHaveLength(1);expect(normalize.model.ref(b,'className').value).toBe('a');
});
