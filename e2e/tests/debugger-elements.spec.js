import {test,expect,_electron} from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {initialElementsProject,DOM_TAGS,DOM_LIMITS,installDebugDOM,validDOMTree} from '../../frontend/src/pilot/debugger-dom.js';
import {parseDebugHTML} from '../../frontend/src/pilot/debugger-dom-parse.js';
import {compileDebugProject} from '../../frontend/src/pilot/debugger-compiler.js';
import {unterdrueckeOnboardingPopups,openDebugger} from './helpers.js';
test.use({serviceWorkers:'block'});
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const region=p=>p.getByRole('region',{name:'Debugger-Technikpilot',exact:true});
const status=p=>region(p).getByLabel('Debugstatus',{exact:true});
const button=(p,name)=>region(p).getByRole('button',{name,exact:true});
const output=p=>region(p).getByLabel('Debugkonsole',{exact:true});
const view=p=>p.frameLocator('iframe[title="Gestaltete Debugvorschau"]');
const preview=p=>region(p).getByRole('region',{name:'DOM-Debugvorschau',exact:true});
const project=(html,source)=>({schema:1,mode:'module',entry:'main.js',html,files:{'main.js':source}});
async function open(page,url='/frontendkurs/debugger'){await unterdrueckeOnboardingPopups(page);await page.goto(url);await openDebugger(page);await region(page).getByLabel('Debugmodus',{exact:true}).selectOption('dom');}
async function load(page,p=initialElementsProject()){page.once('dialog',d=>d.accept());await region(page).getByLabel('Modulsicherung lesen',{exact:true}).setInputFiles({name:'elemente.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(p))});await expect(region(page).getByLabel('Eigener Debugcode',{exact:true})).toHaveValue(p.files[p.entry]);}
async function start(page){await button(page,'Debuggen starten').click();await expect(status(page)).toContainText('Angehalten');}
async function go(page){await button(page,'Weiter / bis zum nächsten Haltepunkt').click();}
async function idle(page){await expect(status(page)).toContainText('Bereit für Klicks');}
async function fire(page,action){await action();await expect(status(page)).toContainText('Ereignisstart');}
function artifact(p){const a=compileDebugProject(p,undefined,{dom:true});a.dom={tree:parseDebugHTML(p.html),eventPoint:a.points.at(-1).id};return a;}
async function raw(page,p,actions=[],options={}){
 let a;try{a=artifact(p);}catch(error){return [{type:'error',text:error.message}];}const asset=fs.readdirSync(path.join(repo,'frontend/dist/assets')).find(n=>/^debugger\.worker-.*\.js$/.test(n));
 return page.evaluate(({artifact,asset,actions,options})=>new Promise(resolve=>{
  const worker=new Worker('/assets/'+asset,{type:'module'}),events=[];let command=0,index=0,duplicated=false;
  const finish=()=>{clearTimeout(timer);worker.terminate();resolve(events);},timer=setTimeout(()=>{events.push({type:'timeout'});finish();},14000);
  worker.onmessage=({data})=>{events.push(data);const control=body=>worker.postMessage({type:'control',session:'elements',revision:'rev',commandId:++command,...body});
   if(data.type==='paused'){
    if(options.duplicate&&!duplicated&&index>0){duplicated=true;worker.postMessage({type:'control',session:'elements',revision:'rev',commandId:command+1,event:actions[index-1]});}
    control({pauseId:data.pauseId,mode:'continue'});
   }
   if(data.type==='idle'){if(index<actions.length)control({event:actions[index++]});else finish();}
   if(data.type==='error'||data.type==='done')finish();
  };worker.postMessage({type:'start',session:'elements',revision:'rev',artifact,limits:{}});
 }),{artifact:a,asset,actions,options});
}
function model(html=''){
 const sent=[],core={guard(){},abort(text){throw new Error(text);},registered:fn=>typeof fn==='function',invoke:(fn,args,target)=>Reflect.apply(fn,target,args)};
 const tree=parseDebugHTML(html),m=installDebugDOM(tree,core,text=>{const t=JSON.parse(text);sent.push(t);return !t.error&&validDOMTree(t);},DOM_LIMITS,DOM_TAGS);
 return {m,sent,tree,body:m.ref(m.document,'body').value,get:id=>m.bound(m.document,'getElementById')(id),create:tag=>m.bound(m.document,'createElement')(tag),call:(n,key,...args)=>m.bound(n,key)(...args),read:(n,key)=>m.ref(n,key).value,write:(n,key,value)=>{m.ref(n,key).value=value;}};
}

test('Aufgabenliste: Erzeugen bleibt unsichtbar, Einfügen/Entfernen exakt nach Haltepunkt und Closure',async({page})=>{
 await open(page);page.once('dialog',d=>d.accept());await button(page,'Aufgabenlisten-Beispiel laden').click();await start(page);await go(page);await idle(page);await expect(region(page).getByLabel('CSS-Hinweise')).toHaveCount(0);
 await region(page).getByRole('button',{name:'Debug-Haltepunkt main.js Zeile 25 Spalte 3',exact:true}).click();await view(page).getByLabel('Neue Aufgabe').fill('HTML wiederholen');await fire(page,()=>view(page).getByRole('button',{name:'Aufgabe hinzufügen'}).click());await go(page);await expect(status(page)).toContainText('main.js:25:3. Angehalten · Haltepunkt');await expect(view(page).locator('li')).toHaveCount(0);await button(page,'Einzelner Schritt').click();await expect(view(page).locator('li')).toHaveCount(1);await expect(view(page).locator('li')).toHaveText('HTML wiederholenEntfernen');await expect(view(page).locator('li')).toHaveCSS('display','flex');await go(page);await idle(page);await expect(view(page).getByLabel('Neue Aufgabe')).toHaveValue('');await expect(output(page)).toHaveText('Hinzugefügt: HTML wiederholen');
 await region(page).getByRole('button',{name:'Debug-Haltepunkt main.js Zeile 25 Spalte 3',exact:true}).click();await region(page).getByRole('button',{name:'Debug-Haltepunkt main.js Zeile 20 Spalte 5',exact:true}).click();await fire(page,()=>view(page).getByRole('button',{name:'Entfernen'}).click());await go(page);await expect(status(page)).toContainText('main.js:20:5. Angehalten · Haltepunkt');await expect(view(page).locator('li')).toHaveCount(1);await button(page,'Einzelner Schritt').click();await expect(view(page).locator('li')).toHaveCount(0);await go(page);await idle(page);await expect(output(page)).toHaveText('Hinzugefügt: HTML wiederholen\nEntfernt: HTML wiederholen');await expect(view(page).locator('#hinweis')).toHaveText('0 Aufgaben');
});

test('Native Referenz: Identität, Verschieben, Wiederholung, Textargumente, replaceChildren und abgetrennte Suche',async({page})=>{
 await open(page);const html='<div id="a"></div><section id="b"></section>';
 const source=`const a=document.getElementById('a');const b=document.getElementById('b');const x=document.createElement('SPAN');const y=document.createElement('em');x.id='x';x.textContent='X';y.textContent='Y';
console.log(x.tagName,x.parentNode===null,x.isConnected);console.log(a.appendChild(x)===x,x.parentNode===a,x.isConnected);console.log(b.appendChild(x)===x,a.textContent,b.textContent);
console.log(b.append(x,y,x)===undefined,b.textContent,b.querySelectorAll('span').length);console.log(b.removeChild(x)===x,x.parentNode===null,x.isConnected,document.getElementById('x')===null);console.log(x.remove()===undefined);a.append(x);console.log(x.isConnected,document.getElementById('x')===x);
const group=document.createElement('div');const child=document.createElement('p');child.textContent='C';group.append(child);b.replaceChildren(group,child,group);console.log(b.textContent,group.textContent,child.parentNode===b,b.querySelectorAll('div').length);a.replaceChildren('A',1,null,undefined);console.log(a.textContent,x.isConnected);b.replaceChildren();console.log(b.textContent,group.parentNode===null);group.append(x);console.log(group.querySelector('#x')===x,x.isConnected);`;
 const expected=await page.evaluate(({html,source})=>{const doc=document.implementation.createHTMLDocument('synthetic');doc.body.innerHTML=html;const logs=[];new Function('document','console',source)(doc,{log:(...args)=>logs.push(args.join(' '))});return logs;},{html,source});
 const result=await raw(page,project(html,source));expect(result.at(-1).type,JSON.stringify(result.at(-1))).toBe('idle');expect(result.filter(e=>e.type==='log').map(e=>e.text)).toEqual(expected);
});

test('Worker: dynamische IDs, Listener über Entfernen/Wiedereinfügen und keine Klickqueue',async({page})=>{
 await open(page);const source=`const box=document.getElementById('box');const b=document.createElement('button');b.id='neu';b.type='button';b.textContent='Neu';let n=0;b.addEventListener('click',e=>{n++;console.log(n,e.target.id,e.currentTarget===b,b.isConnected);b.remove();box.append(b);});box.append(b);`;
 const result=await raw(page,project('<div id="box"></div>',source),[{id:3},{id:3}],{duplicate:true});expect(result.at(-1).type).toBe('idle');expect(result.filter(e=>e.type==='log').map(e=>e.text)).toEqual(['1 neu true true','2 neu true true']);
 const detached=await raw(page,project('<div id="box"></div>',source.replace('box.append(b);});','});')),[{id:3},{id:3}]);expect(detached.at(-1).type).toBe('error');expect(detached.at(-1).text).toContain('gehört nicht mehr');expect(detached.filter(e=>e.type==='log')).toHaveLength(1);
});

test('Native Referenz: Entfernen und Umhängen im Handler behalten den begonnenen Bubblingpfad',async({page})=>{
 await open(page);const html='<div id="a"><button id="b">Los</button></div><section id="z"></section>';
 const source=`const a=document.getElementById('a');const b=document.getElementById('b');const z=document.getElementById('z');b.addEventListener('click',e=>{console.log('b',e.currentTarget.id);b.remove();z.append(b);});a.addEventListener('click',e=>console.log('a',e.currentTarget.id,e.target.parentNode===z));z.addEventListener('click',()=>console.log('z'));`;
 const expected=await page.evaluate(({html,source})=>{const doc=document.implementation.createHTMLDocument('synthetic');doc.body.innerHTML=html;const logs=[];new Function('document','console',source)(doc,{log:(...a)=>logs.push(a.join(' '))});doc.getElementById('b').click();doc.getElementById('b').click();return logs;},{html,source});const result=await raw(page,project(html,source),[{id:3},{id:3}]);expect(result.at(-1).type).toBe('idle');expect(result.filter(e=>e.type==='log').map(e=>e.text)).toEqual(expected);
});

test('Grenzen: 128 gehaltene Knoten einschließlich Text, IDs nicht wiederverwenden und entfernte Texte mitzählen',()=>{
 const a=model();for(let i=0;i<127;i++){const n=a.create('div');a.call(a.body,'appendChild',n);a.call(n,'remove');}expect(a.sent.at(-1).children).toHaveLength(0);expect(()=>a.create('div')).toThrow('Knotengrenze');
 const b=model();for(let i=0;i<126;i++)b.create('div');const n=b.create('p');expect(()=>b.write(n,'textContent','x')).toThrow('Knotengrenze');
 const c=model();for(let i=0;i<8;i++){const n=c.create('p');c.write(n,'textContent','ä'.repeat(1024));}const ninth=c.create('p');expect(()=>c.write(ninth,'textContent','ä')).toThrow('Gesamttextgrenze');
 for(const amount of [16383,16384]){const t=model();for(let offset=0;offset<amount;offset+=2048)t.write(t.create('p'),'textContent','a'.repeat(Math.min(2048,amount-offset)));expect(t.sent.at(-1).tag).toBe('body');}
 const d=model();let at=d.body;for(let i=0;i<16;i++){const n=d.create('div');d.call(at,'appendChild',n);at=n;}expect(()=>d.call(at,'appendChild',d.create('div'))).toThrow('Tiefengrenze');
 const e=model(),input=e.create('input');for(let i=0;i<2047;i++)e.write(input,'value','a');expect(()=>e.write(input,'value','b')).toThrow('Schreibgrenze');
 const initial=parseDebugHTML('');initial.id=128;const core={guard(){},abort(t){throw new Error(t);}};const m=installDebugDOM(initial,core,()=>true,DOM_LIMITS,DOM_TAGS);expect(()=>m.bound(m.document,'createElement')('p')).toThrow('Knotengrenze');
});

test('Compiler/Worker-Negative: keine Ressourcen-/HTML-/Prototype-/Options-/Hierarchieabkürzung, Catch umgeht Grenze nicht',async({page})=>{
 await open(page);for(const source of [
  'document.createElement("script");','document.createElement("img");','document.createElement("iframe");','document.createElement("svg");','document.createElement("x-probe");','document.createElement("body");','document.createElement("div",{});',
  'document.body.appendChild(document.body);','const x=document.createElement("div");document.body.append(x);x.append(document.body);','document.body.appendChild({});','document.body.append({toString:()=>"NICHT"});',
  'document.body.innerHTML="<p>NICHT</p>";','document.createElement("div").setAttribute("onclick","NICHT");','document.createElement("button").type="reset";','document.createElement("input").type="file";','document.createElement("input").append(document.createElement("span"));',
  'const b=document.createElement("button");document.body.removeChild(b);','document.body.remove();','const b=document.createElement("button");b.ownerDocument;','try { for(let i=0;i<128;i++){const n=document.createElement("div");n.remove();} } catch(e) {console.log("NICHT");}console.log("NICHT");',
 ]){const result=await raw(page,project('',source));expect(result.at(-1).type,source+JSON.stringify(result.at(-1))).toBe('error');expect(result.filter(e=>e.type==='log'),source).toHaveLength(0);}
});

test('Strukturansicht: dynamische Textfelder, Labels und entfernter Feldentwurf bleiben getrennt',async({page})=>{
 await open(page);const p=project('<div id="box"></div><button id="wechsel">Wechseln</button>','const box=document.getElementById("box");const label=document.createElement("label");label.textContent="Dynamischer Text";const feld=document.createElement("input");label.append(feld);box.append(label);document.getElementById("wechsel").addEventListener("click",()=>{box.replaceChildren();const neu=document.createElement("input");box.append(neu);});');await load(page,p);await start(page);await go(page);await idle(page);await preview(page).getByLabel('Dynamischer Text').fill('Nur erster Entwurf');await fire(page,()=>preview(page).getByRole('button',{name:'Wechseln'}).click());await go(page);await idle(page);await expect(preview(page).getByRole('textbox')).toHaveValue('');await expect(region(page).getByLabel('Offene Eingaben')).toContainText('0 offene Eingaben');await preview(page).getByRole('textbox').fill('Zweiter Entwurf');await button(page,'Eingabe übernehmen').click();await idle(page);await expect(preview(page).getByRole('textbox')).toHaveValue('Zweiter Entwurf');
});

test('Aufgabenliste: Texte bleiben Text, CSS nur im Frame, Mobil/Tastatur und Originalexport/Reload',async({page},info)=>{
 await page.setViewportSize({width:390,height:844});await open(page);await load(page);await start(page);await go(page);await idle(page);await view(page).getByLabel('Neue Aufgabe').fill('<img src="https://example.invalid/x" onerror="alert(1)">');await fire(page,()=>view(page).getByLabel('Neue Aufgabe').press('Enter'));await go(page);await idle(page);await expect(view(page).locator('li')).toContainText('<img src=');await expect(view(page).locator('img')).toHaveCount(0);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);await expect(page.getByRole('heading',{name:'Debugger',exact:true})).toBeVisible();
 const pending=page.waitForEvent('download');await button(page,'Modulprojekt exportieren (JSON)').click();const file=await pending,filename=info.outputPath('originale.json');await file.saveAs(filename);expect(JSON.parse(fs.readFileSync(filename,'utf8'))).toEqual(initialElementsProject());await expect(page.locator('.pilot-status')).toHaveText('Gespeichert');await page.reload();await openDebugger(page);await expect(page.locator('iframe[title="Gestaltete Debugvorschau"]')).toHaveCount(0);await start(page);await go(page);await idle(page);await expect(view(page).locator('li')).toHaveCount(0);await view(page).getByLabel('Neue Aufgabe').fill('Tastatur');await fire(page,()=>view(page).getByLabel('Neue Aufgabe').press('Enter'));await go(page);await idle(page);await view(page).getByRole('button',{name:'Entfernen'}).focus();await page.keyboard.press('Enter');await expect(status(page)).toContainText('Ereignisstart');await go(page);await idle(page);await expect(view(page).locator('li')).toHaveCount(0);await button(page,'Debuggen stoppen').focus();await page.keyboard.press('Enter');await expect(status(page)).toContainText('gestoppt');
});

test('Electron: dynamische Liste flüchtig, Quellen nach vollständigem Neustart erhalten @desktop',async({},info)=>{
 test.skip(process.platform!=='win32','Windows-Electron');test.setTimeout(60000);const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;env.DATABASE_URL='';env.AZUBIPREP_KI_ENABLED='false';env.AZUBIPREP_CHATGPT_ENABLED='false';let app;const launch=()=>_electron.launch({executablePath:path.join(repo,'desktop/node_modules/electron/dist/electron.exe'),args:[path.join(repo,'desktop'),'--user-data-dir='+info.outputPath('profil')],env});
 try{app=await launch();let page=await app.firstWindow();await page.waitForURL(/^http:/);let origin=new URL(page.url()).origin;await open(page,origin+'/frontendkurs/debugger');await load(page);await start(page);await go(page);await idle(page);await view(page).getByLabel('Neue Aufgabe').fill('Desktop');await fire(page,()=>view(page).getByRole('button',{name:'Aufgabe hinzufügen'}).click());await go(page);await idle(page);await expect(view(page).locator('li')).toContainText('Desktop');await expect(page.locator('.pilot-status')).toHaveText('Gespeichert');await app.close();app=null;
 app=await launch();page=await app.firstWindow();await page.waitForURL(/^http:/);origin=new URL(page.url()).origin;await open(page,origin+'/frontendkurs/debugger');await expect(region(page).getByLabel('Eigener Debugcode')).toHaveValue(initialElementsProject().files['main.js']);await expect(page.locator('iframe[title="Gestaltete Debugvorschau"]')).toHaveCount(0);await start(page);await go(page);await idle(page);await expect(view(page).locator('li')).toHaveCount(0);await expect(output(page)).toHaveText('Noch keine Ausgabe.');
 }finally{await app?.close();}
});
