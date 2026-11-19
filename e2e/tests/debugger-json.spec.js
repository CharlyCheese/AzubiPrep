import {test,expect,_electron} from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {initialJSONProject,installDebugJSON,JSON_LIMITS} from '../../frontend/src/pilot/debugger-json.js';
import {compileDebugger,compileDebugProject} from '../../frontend/src/pilot/debugger-compiler.js';
import {parseDebugHTML} from '../../frontend/src/pilot/debugger-dom-parse.js';
import {unterdrueckeOnboardingPopups,openDebugger} from './helpers.js';
test.use({serviceWorkers:'block'});
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const region=p=>p.getByRole('region',{name:'Debugger-Technikpilot',exact:true});
const status=p=>region(p).getByLabel('Debugstatus',{exact:true});
const button=(p,name)=>region(p).getByRole('button',{name,exact:true});
const output=p=>region(p).getByLabel('Debugkonsole',{exact:true});
const store=p=>region(p).getByRole('region',{name:'Übungsspeicher',exact:true});
const view=p=>p.frameLocator('iframe[title="Gestaltete Debugvorschau"]');
const project=source=>({schema:1,mode:'module',entry:'main.js',html:'',files:{'main.js':source}});
async function open(page,url='/frontendkurs/debugger'){await unterdrueckeOnboardingPopups(page);await page.goto(url);await openDebugger(page);await region(page).getByLabel('Debugmodus',{exact:true}).selectOption('dom');}
async function load(page,p=initialJSONProject()){page.once('dialog',d=>d.accept());await region(page).getByLabel('Modulsicherung lesen',{exact:true}).setInputFiles({name:'json-probe.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(p))});await expect(region(page).getByLabel('Eigener Debugcode',{exact:true})).toHaveValue(p.files[p.entry]);}
async function start(page){await button(page,'Debuggen starten').click();await expect(status(page)).toContainText('Angehalten');}
async function go(page){await button(page,'Weiter / bis zum nächsten Haltepunkt').click();}
async function idle(page){await expect(status(page)).toContainText('Bereit für Klicks');}
async function fire(page,name){await view(page).getByRole('button',{name,exact:true}).click();await expect(status(page)).toContainText('Ereignisstart');await go(page);await idle(page);}
const state=title=>({version:1,tasks:[{id:'a',title,minutes:25,done:false}]});
async function put(page,text){await view(page).getByLabel('JSON-Testtext',{exact:true}).fill(text);await fire(page,'Testtext im Übungsspeicher ablegen');}
function artifact(p){const a=compileDebugProject(p,undefined,{dom:true});a.dom={tree:parseDebugHTML(p.html),eventPoint:a.points.at(-1).id};return a;}
async function raw(page,p){let a;try{a=artifact(p);}catch(error){return[{type:'error',text:error.message}];}const asset=fs.readdirSync(path.join(repo,'frontend/dist/assets')).find(n=>/^debugger\.worker-.*\.js$/.test(n));return page.evaluate(({artifact,asset})=>new Promise(resolve=>{const worker=new Worker('/assets/'+asset,{type:'module'}),events=[];let command=0;const finish=()=>{clearTimeout(timer);worker.terminate();resolve(events);},timer=setTimeout(()=>{events.push({type:'timeout'});finish();},14000);worker.onmessage=({data})=>{events.push(data);if(data.type==='paused')worker.postMessage({type:'control',session:'json',revision:'rev',commandId:++command,pauseId:data.pauseId,mode:'continue'});if(['idle','error','done'].includes(data.type))finish();};worker.postMessage({type:'start',session:'json',revision:'rev',artifact,limits:{}});}),{artifact:a,asset});}
function model(opaque=()=>false){let fatal='';const core={guard(){if(fatal)throw Error(fatal);},opaque,abort(t){fatal=t;throw Error(t);}},m=installDebugJSON(core,()=>true,JSON_LIMITS);return {parse:(...args)=>m.bound(m.globals.JSON,'parse')(...args),stringify:(...args)=>m.bound(m.globals.JSON,'stringify')(...args),call:(kind,key,...args)=>m.bound(m.globals[kind],key)(...args)};}

test('JSON-Beispiel: Speichern und vor parse/Übernahme halten, danach erst neue Ansicht',async({page})=>{
 await open(page);page.once('dialog',d=>d.accept());await button(page,'JSON-Beispiel laden').click();await start(page);await go(page);await idle(page);await expect(region(page).getByLabel('CSS-Hinweise')).toHaveCount(0);await view(page).getByLabel('Neue Aufgabe').fill('Alter Zustand');await fire(page,'Aufgabe hinzufügen');await fire(page,'Zustand speichern');await store(page).locator('summary').click();await expect(store(page)).toContainText('"version":1');await expect(store(page)).toContainText('Alter Zustand');await fire(page,'Nur Ansicht leeren');await expect(view(page).locator('li')).toHaveCount(0);await fire(page,'Zustand laden');await expect(view(page).locator('li')).toContainText('Alter Zustand');
 await put(page,JSON.stringify(state('Neuer Zustand')));await region(page).getByRole('button',{name:'Debug-Haltepunkt main.js Zeile 60 Spalte 5',exact:true}).click();await region(page).getByRole('button',{name:'Debug-Haltepunkt main.js Zeile 62 Spalte 5',exact:true}).click();await view(page).getByRole('button',{name:'Zustand laden',exact:true}).click();await expect(status(page)).toContainText('Ereignisstart');await go(page);await expect(status(page)).toContainText('main.js:60:5. Angehalten · Haltepunkt');await expect(view(page).locator('li')).toContainText('Alter Zustand');await button(page,'Einzelner Schritt').click();await expect(status(page)).toContainText('main.js:61:5');await expect(view(page).locator('li')).toContainText('Alter Zustand');await go(page);await expect(status(page)).toContainText('main.js:62:5. Angehalten · Haltepunkt');await expect(view(page).locator('li')).toContainText('Alter Zustand');await button(page,'Einzelner Schritt').click();await expect(view(page).locator('li')).toContainText('Alter Zustand');await go(page);await idle(page);await expect(view(page).locator('li')).toContainText('Neuer Zustand');await expect(view(page).locator('#meldung')).toContainText('Format geprüft');
});

test('Schema: kaputter oder unpassender gespeicherter Text überschreibt weder Daten noch Ansicht',async({page})=>{
 await open(page);await load(page);await start(page);await go(page);await idle(page);await view(page).getByLabel('Neue Aufgabe').fill('Bleibt erhalten');await fire(page,'Aufgabe hinzufügen');await store(page).locator('summary').click();
 const a=state('Test'),bad=['{broken','null',JSON.stringify({...a,version:2}),'{"version":1,"tasks":"falsch"}',JSON.stringify({...a,tasks:[...a.tasks,...a.tasks]}),JSON.stringify({...a,tasks:[{...a.tasks[0],minutes:2.5}]}),JSON.stringify({...a,tasks:[{...a.tasks[0],done:'false'}]}),JSON.stringify({...a,tasks:[{...a.tasks[0],title:' '}]}),JSON.stringify({...a,tasks:Array.from({length:7},(_,i)=>({...a.tasks[0],id:String(i)}))})];
 for(const text of bad){await put(page,text);await fire(page,'Zustand laden');await expect(view(page).locator('li')).toHaveText('Bleibt erhalten · 25 Min · offen');await expect(view(page).locator('#meldung')).toContainText(text==='{broken'?'SyntaxError':'Error');await expect(store(page).getByRole('table',{name:'Speicherinhalt'})).toContainText(text);}
 await put(page,JSON.stringify({version:1,tasks:[]}));await fire(page,'Zustand laden');await expect(view(page).locator('li')).toHaveCount(0);await expect(view(page).locator('#meldung')).toContainText('übernommen');
});

test('Native Referenz: Daten, Sonderzahlen, Löcher, geteilte Referenzen, Syntaxfehler und Zyklen',async({page})=>{
 await open(page);const source=`const shared={n:2};const a=[1,undefined,NaN,Infinity,-0,shared,shared];console.log(JSON.stringify(a));console.log(JSON.stringify({x:undefined,n:null,b:true,s:'ä😀'}));console.log(JSON.stringify(undefined)===undefined);const holes=[];holes[2]=3;console.log(JSON.stringify(holes));const value=JSON.parse(' {"a":[1,true,null],"u":"\\ud800"} ');console.log(JSON.stringify(value));console.log(JSON.stringify(JSON.parse('1e400')));console.log(Array.isArray(value.a),Array.isArray(null),Number.isInteger(2),Number.isInteger('2'),Number.isInteger(Infinity));try{JSON.parse('{broken');}catch(e){console.log(e.name);}const cycle=[];cycle.push(cycle);try{JSON.stringify(cycle);}catch(e){console.log(e.name);}`;
 const expected=await page.evaluate(source=>{const logs=[];new Function('console',source)({log:(...a)=>logs.push(a.join(' '))});return logs;},source);const result=await raw(page,project(source));expect(result.at(-1).type,JSON.stringify(result.at(-1))).toBe('idle');expect(result.filter(e=>e.type==='log').map(e=>e.text)).toEqual(expected);
});

test('Prüfmethoden und Compiler: lokale Namen, Objektkeys, Shorthand und Modulbindung bleiben korrekt',async({page})=>{
 await open(page);for(const source of ['const JSON={x:1};const Array={x:2};const Number={x:3};console.log(JSON.x,Array.x,Number.x);','const keys={JSON:3,Array:4,Number:5};console.log(keys.JSON,keys.Array,keys.Number);const wrapper={JSON};console.log(wrapper.JSON.parse("1"));','function check(Array){return Array.x;}console.log(check({x:7}),Array.isArray([]),Number.isInteger(0));']){const result=await raw(page,project(source));expect(result.at(-1).type,source+JSON.stringify(result.at(-1))).toBe('idle');}
 expect(()=>compileDebugger({schema:1,name:'main.js',source:'JSON.parse("[]");'})).toThrow();
});

test('Daten-Grenzen: UTF8-Eingabe/Ausgabe, Container, Felder, Knoten und Operationsbudget exakt',()=>{
 for(const n of [16383,16384,16385]){const a=model();if(n<=16384)expect(a.parse(' '.repeat(n-1)+'0')).toBe(0);else expect(()=>a.parse(' '.repeat(n-1)+'0')).toThrow('Eingabegrenze');}
 for(const target of [16383,16384,16385]){const a=model();let value;for(let n=0;n<=2048;n++){const data=[...Array(7).fill('a'.repeat(2048)),'x'.repeat(n)];if(Buffer.byteLength(JSON.stringify(data))===target){value=data;break;}}expect(value).toBeDefined();if(target<=16384)expect(Buffer.byteLength(a.stringify(value))).toBe(target);else expect(()=>a.stringify(value)).toThrow('Ausgabegrenze');}
 for(const n of [15,16,17]){const a=model(),text='['.repeat(n)+'0'+']'.repeat(n);if(n<=16)expect(a.stringify(a.parse(text))).toBe(text);else expect(()=>a.parse(text)).toThrow('Tiefengrenze');}
 for(const n of [2047,2048,2049]){const a=model();if(n<=2048)expect(a.stringify('x'.repeat(n))).toBe(JSON.stringify('x'.repeat(n)));else expect(()=>a.stringify('x'.repeat(n))).toThrow('Feldgrenze');}
 for(const n of [510,511,512]){const a=model(),value=Array(n).fill(0);if(n<=511)expect(a.stringify(value)).toBe(JSON.stringify(value));else expect(()=>a.stringify(value)).toThrow('Datenmengengrenze');}
 const a=model();for(let i=0;i<256;i++)expect(a.call('Number','isInteger',1)).toBe(true);expect(()=>a.parse('1')).toThrow('Operationsgrenze');expect(()=>a.stringify(1)).toThrow('Operationsgrenze');
});

test('Keine Getter-/toJSON-Ausführung: kopierte Daten, unerlaubte Handles und Callbackoptionen',()=>{
 let calls=0;for(const value of [Object.defineProperty({},'x',{get(){calls++;return 1;},enumerable:true}),Object.defineProperty({},'toJSON',{get(){calls++;return ()=>1;}}),{toJSON(){calls++;return 1;}},{x:()=>1},new Date()]){const a=model();expect(()=>a.stringify(value)).toThrow();}expect(calls).toBe(0);
 const opaque={};expect(()=>model(v=>v===opaque).stringify({x:opaque})).toThrow('Modellhandles');expect(()=>model().parse({toString(){calls++;return '1';}})).toThrow('Objektkonvertierung');expect(calls).toBe(0);expect(()=>model().parse('[]',()=>calls++)).toThrow('Reviver');expect(()=>model().stringify({},()=>calls++)).toThrow('Replacer');expect(calls).toBe(0);
 const a=model(),source=Object.create(null);source['__proto__']={data:1};expect(a.stringify(source)).toBe('{"__proto__":{"data":1}}');expect(Object.getPrototypeOf(a.parse('{"__proto__":{"data":1}}'))).toBe(Object.prototype);
});

test('Compiler/Worker-Gates: keine Konstruktoren, Aliase, Hosthandles, Hookpfade oder unterdrückte Abbrüche',async({page})=>{
 await open(page);for(const source of ['JSON.parse("[]",()=>1);','JSON.stringify({},null,2);','const p=JSON.parse;p("[]");','JSON.constructor;','Array.prototype;','Number("1");','Array(1);','JSON.stringify(document.body);','JSON.stringify(localStorage);','JSON.stringify(JSON);','JSON.stringify({fn:()=>1});','JSON.stringify({get x(){return 1;}});','const p=new Proxy({},{});JSON.stringify(p);','try{for(let i=0;i<257;i++){Array.isArray([]);}}catch(e){console.log("NICHT");}console.log("NICHT");']){const result=await raw(page,project(source));expect(result.at(-1).type,source).toBe('error');expect(result.filter(e=>e.type==='log'),source).toHaveLength(0);}
 const result=await raw(page,project('const x=JSON.parse("{\\"x\\":1}");console.log(x.x);'));expect(result.at(-1).type).toBe('idle');expect(result.filter(e=>e.type==='log').map(e=>e.text)).toEqual(['1']);
 // Production limits also run through the actual serialized QuickJS helper,
 // in addition to the fine-grained direct model boundary checks above.
 for(const [source,expected] of [
  ['console.log(JSON.stringify(JSON.parse('+JSON.stringify('['.repeat(16)+'0'+']'.repeat(16))+')).length);','33'],
  ['console.log(JSON.parse('+JSON.stringify(' '.repeat(16383)+'0')+'));','0'],
  ['const value='+JSON.stringify(Array(511).fill(0))+';console.log(JSON.stringify(value).length);','1023'],
  ['for(let i=0;i<256;i++){Array.isArray([]);}console.log("Grenze erreicht");','Grenze erreicht'],
 ]){const r=await raw(page,project(source));expect(r.at(-1).type,JSON.stringify(r.at(-1))).toBe('idle');expect(r.filter(e=>e.type==='log').map(e=>e.text)).toEqual([expected]);}
 for(const source of ['JSON.parse('+JSON.stringify('['.repeat(17)+'0'+']'.repeat(17))+');','JSON.stringify('+JSON.stringify(Array(512).fill(0))+');']){const r=await raw(page,project(source));expect(r.at(-1).type).toBe('error');expect(r.at(-1).text).toMatch(/JSON-(Tiefen|Datenmengen)grenze/);}
});

test('JSON-Texte inert und nur in der Sitzung: Appmarker, Originalexport, Reload und neue Quelle',async({page},info)=>{
 await open(page);await page.evaluate(()=>localStorage.setItem('lernplan-v1','APP_MARKER'));await load(page);await start(page);await go(page);await idle(page);await put(page,JSON.stringify(state('<img src=x onerror=alert(1)>')));await fire(page,'Zustand laden');await expect(view(page).locator('li')).toContainText('<img src=');await expect(view(page).locator('img')).toHaveCount(0);expect(await page.evaluate(()=>localStorage.getItem('lernplan-v1'))).toBe('APP_MARKER');const pending=page.waitForEvent('download');await button(page,'Modulprojekt exportieren (JSON)').click();const file=await pending,name=info.outputPath('originale.json');await file.saveAs(name);expect(JSON.parse(fs.readFileSync(name,'utf8'))).toEqual(initialJSONProject());await page.reload();await openDebugger(page);await expect(store(page)).toHaveCount(0);await start(page);await go(page);await idle(page);await expect(view(page).locator('li')).toHaveCount(0);await region(page).getByLabel('Eigener Debugcode').fill(initialJSONProject().files['main.js']+'\n// Neue Revision');await expect(store(page)).toHaveCount(0);
});

test('Mobil/Tastatur: JSON sichern und geprüften Stand laden, Stop erreichbar',async({page})=>{
 await page.setViewportSize({width:390,height:844});await open(page);await load(page);await start(page);await go(page);await idle(page);await view(page).getByLabel('Neue Aufgabe').fill('Mobil');await view(page).getByLabel('Neue Aufgabe').press('Enter');await expect(status(page)).toContainText('Ereignisstart');await go(page);await idle(page);await view(page).getByRole('button',{name:'Zustand speichern',exact:true}).focus();await page.keyboard.press('Enter');await expect(status(page)).toContainText('Ereignisstart');await go(page);await idle(page);await fire(page,'Nur Ansicht leeren');await fire(page,'Zustand laden');await expect(view(page).locator('li')).toContainText('Mobil');await store(page).locator('summary').focus();await page.keyboard.press('Enter');await expect(store(page)).toContainText('Mobil');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);await button(page,'Debuggen stoppen').focus();await page.keyboard.press('Enter');await expect(store(page)).toHaveCount(0);
});

test('Electron: JSON-Lernprojekt nach Neustart erhalten, strukturierter Live-Speicher leer @desktop',async({},info)=>{
 test.skip(process.platform!=='win32','Windows-Electron');test.setTimeout(60000);const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;env.DATABASE_URL='';env.AZUBIPREP_KI_ENABLED='false';env.AZUBIPREP_CHATGPT_ENABLED='false';let app;const launch=()=>_electron.launch({executablePath:path.join(repo,'desktop/node_modules/electron/dist/electron.exe'),args:[path.join(repo,'desktop'),'--user-data-dir='+info.outputPath('profil')],env});
 try{app=await launch();let page=await app.firstWindow();await page.waitForURL(/^http:/);let origin=new URL(page.url()).origin;await open(page,origin+'/frontendkurs/debugger');await load(page);await start(page);await go(page);await idle(page);await view(page).getByLabel('Neue Aufgabe').fill('Desktop');await fire(page,'Aufgabe hinzufügen');await fire(page,'Zustand speichern');await store(page).locator('summary').click();await expect(store(page)).toContainText('Desktop');await expect(page.locator('.pilot-status')).toHaveText('Gespeichert');await app.close();app=null;app=await launch();page=await app.firstWindow();await page.waitForURL(/^http:/);origin=new URL(page.url()).origin;await open(page,origin+'/frontendkurs/debugger');await expect(region(page).getByLabel('Eigener Debugcode')).toHaveValue(initialJSONProject().files['main.js']);await expect(store(page)).toHaveCount(0);await start(page);await store(page).locator('summary').click();await expect(store(page)).toContainText('ist leer');await go(page);await idle(page);await expect(view(page).locator('li')).toHaveCount(0);
 }finally{await app?.close();}
});
