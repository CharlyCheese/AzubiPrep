import {test,expect,_electron} from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {ADVANCED_LESSONS,advancedFiles} from '../../frontend/src/pilot/advanced-course.js';
import {unterdrueckeOnboardingPopups,openWorkshopTools} from './helpers.js';

test.use({serviceWorkers:'block'});
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const lesson=id=>ADVANCED_LESSONS.find(l=>l.id===id);
const simple=source=>({'index.html':{kind:'text',content:'<!doctype html><html lang="de"><head><meta charset="utf-8"><script defer src="app.js"></script></head><body><main><h1>Test</h1><p id="status"></p><button id="count" type="button">Klick</button><textarea id="note">Kommentar</textarea><input id="title"><input id="minutes"></main></body></html>'},'app.js':{kind:'text',content:source}});
async function open(page,id='course-20-3',url='/frontendkurs'){await unterdrueckeOnboardingPopups(page);await page.goto(url);await openWorkshopTools(page);page.on('dialog',dialog=>dialog.accept());await page.getByLabel('Lektion',{exact:true}).selectOption(id);}
async function load(page,files){await page.getByLabel('Sicherung einlesen',{exact:true}).setInputFiles({name:'projekt.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({format:'azubiprep-pilot',version:1,entry:'index.html',files}))});await expect(page.getByRole('alert').filter({hasText:'eingelesen'})).toContainText('eingelesen');}
async function start(page){await page.getByRole('button',{name:'Vorschau',exact:true}).click();await page.getByRole('button',{name:'Projekt ausführen',exact:true}).click();}
const output=page=>page.getByLabel('Projektdarstellung',{exact:true});
const model=page=>page.getByRole('region',{name:'Interaktive Übungsansicht',exact:true});
async function ready(page){await expect(model(page)).toContainText('Projekt läuft in der begrenzten Übungsansicht.');}

test('DOM läuft erst nach Start; Textarea, sichere Texte, Klassen und Stop bleiben bedienbar',async({page})=>{
  await open(page);await load(page,simple('document.querySelector("#status").textContent="<img src=x onerror=alert(1)>";console.log("GESTARTET");'));
  await page.getByRole('button',{name:'Vorschau',exact:true}).click();await expect(page.getByLabel('Projektkonsole')).not.toContainText('GESTARTET');
  await page.getByRole('button',{name:'Projekt ausführen',exact:true}).click();await ready(page);
  await expect(output(page).locator('textarea')).toHaveValue('Kommentar');await expect(output(page)).toContainText('<img src=x onerror=alert(1)>');await expect(output(page).locator('img')).toHaveCount(0);
  await page.getByRole('button',{name:'Projekt stoppen',exact:true}).click();await expect(output(page).getByRole('button')).toBeDisabled();
});

test('Ereignisse aktualisieren Werte, löschen Eingaben und halten Fokus lokal',async({page})=>{
  await open(page,'course-30-8');await load(page,advancedFiles(lesson('course-30-8')));await start(page);await ready(page);
  await output(page).getByLabel('Lernziel',{exact:true}).fill('Eigener Titel');await output(page).getByLabel('Minuten',{exact:true}).fill('17');await output(page).getByRole('button',{name:'Hinzufügen',exact:true}).click();
  await expect(output(page).locator('li')).toContainText('Eigener Titel');await expect(output(page).getByLabel('Lernziel',{exact:true})).toHaveValue('');await expect(output(page).getByLabel('Lernziel',{exact:true})).toBeFocused();
  await output(page).getByRole('button',{name:'Entfernen',exact:true}).click();await expect(output(page).getByRole('heading',{name:'Lernziele',exact:true})).toBeFocused();
});

test('Übungsspeicher bleibt von Appdaten getrennt und lässt sich ausdrücklich sichern/wiederherstellen',async({page})=>{
  await open(page,'course-30-9');await load(page,advancedFiles(lesson('course-30-9')));await page.evaluate(()=>localStorage.setItem('lernplan-v1','HOST-NICHT-LESEN'));
  await start(page);await ready(page);await output(page).getByLabel('Lernziel',{exact:true}).fill('Sicherung');await output(page).getByLabel('Minuten',{exact:true}).fill('13');await output(page).getByRole('button',{name:'Hinzufügen',exact:true}).click();await expect(output(page).locator('li')).toContainText('Sicherung');
  await page.getByRole('button',{name:'Übungsspeicher übernehmen',exact:true}).click();await expect(page.locator('.pilot-status')).toHaveText('Gespeichert');
  const persisted=await page.evaluate(async()=>{const dir=await(await navigator.storage.getDirectory()).getDirectoryHandle('azubiprep-frontendpilot-v1');const read=async name=>JSON.parse(await(await(await dir.getFileHandle(name)).getFile()).text());const head=await read('head.json');return(await read(head.slot+'.json')).projects['course-30-9'].files['uebungsspeicher.json'].content;});expect(persisted).toContain('Sicherung');
  await page.reload();await page.getByLabel('Lektion',{exact:true}).selectOption('course-30-9');await start(page);await ready(page);await expect(output(page).locator('li')).toContainText('Sicherung');
  expect(await page.evaluate(()=>localStorage.getItem('lernplan-v1'))).toBe('HOST-NICHT-LESEN');
});

test('Kaputter Altstand bleibt unangetastet, Schreibausfall wird sichtbar',async({page})=>{
  await open(page,'course-30-9');const files=advancedFiles(lesson('course-30-9'));files['uebungsspeicher.json']={kind:'text',content:JSON.stringify({'react-plan-v1':'KAPUTT'})};await load(page,files);await start(page);await ready(page);await expect(output(page)).toContainText('Alter Stand nicht lesbar');
  await output(page).getByLabel('Lernziel',{exact:true}).fill('Neu');await output(page).getByLabel('Minuten',{exact:true}).fill('10');await output(page).getByRole('button',{name:'Hinzufügen',exact:true}).click();await expect(output(page).locator('li')).toContainText('Neu');
  await page.getByRole('button',{name:'Übungsspeicher übernehmen',exact:true}).click();await page.getByRole('button',{name:'Schreiben',exact:true}).click();await page.getByRole('button',{name:'uebungsspeicher.json',exact:true}).click();await expect(page.getByRole('textbox',{name:'Code uebungsspeicher.json',exact:true})).toContainText('KAPUTT');
  await load(page,advancedFiles(lesson('course-30-9')));await page.getByRole('button',{name:'Vorschau',exact:true}).click();await model(page).getByLabel('Übungsfall').selectOption('quota');await page.getByRole('button',{name:'Projekt ausführen',exact:true}).click();await ready(page);await expect(output(page)).toContainText('Nicht gespeichert');
});

for(const scenario of ['empty','http','network','json','schema'])test(`Kontrollierte Datenquelle: ${scenario}, Erholung ohne echte Anfrage`,async({page})=>{
  await open(page,'course-25-3');await load(page,advancedFiles(lesson('course-25-3')));await page.getByRole('button',{name:'Vorschau',exact:true}).click();await model(page).getByLabel('Übungsfall').selectOption(scenario);await page.getByRole('button',{name:'Projekt ausführen',exact:true}).click();await ready(page);await output(page).getByRole('button',{name:'Katalog laden',exact:true}).click();await expect(output(page)).toContainText(scenario==='empty'?'Katalog ist leer':'Laden fehlgeschlagen');
  await model(page).getByLabel('Übungsfall').selectOption('ok');await page.getByRole('button',{name:'Projekt ausführen',exact:true}).click();await ready(page);await output(page).getByRole('button',{name:'Katalog laden',exact:true}).click();await expect(output(page).locator('li')).toHaveCount(3);
});

test('Gastcode erhält keine Host-/Netz-/Apprechte, Module verlassen das Projekt nicht',async({page})=>{
  let outside=0;page.on('request',request=>{if(request.url().includes('example.invalid'))outside++;});
  await open(page);await load(page,simple('console.log(typeof process,typeof require,typeof window.azubiDesktop,typeof window.parent,typeof XMLHttpRequest,typeof WebSocket);fetch("https://example.invalid/").catch(error=>console.log(error.message));document.querySelector("#status").textContent=Function("return typeof process")();'));
  await start(page);await ready(page);await expect(page.getByLabel('Projektkonsole')).toContainText('undefined undefined undefined undefined undefined undefined');await expect(page.getByLabel('Projektkonsole')).toContainText('Nur ./topics.json');expect(outside).toBe(0);
  const files=simple('import fs from "node:fs";');files['index.html'].content=files['index.html'].content.replace('defer','type="module"');await load(page,files);await start(page);await expect(page.getByLabel('Projektfehler')).toContainText('Nicht freigegebenes Modul');
});

test('Endlosschleifen in Start, Ereignis und Fehlerkonvertierung enden außerhalb der App',async({page})=>{
  test.setTimeout(60000);await open(page);
  for(const source of ['while(true){}','document.querySelector("#count").addEventListener("click",()=>{while(true){}});','throw {toString(){while(true){}}};']){
    await load(page,simple(source));await start(page);if(source.startsWith('document')){await ready(page);await output(page).getByRole('button',{name:'Klick',exact:true}).click();}await expect(page.getByLabel('Projektfehler')).toContainText('Zeitgrenze');
  }
  await load(page,simple('console.log("NEU");'));await start(page);await ready(page);await expect(page.getByLabel('Projektkonsole')).toHaveText('NEU');
});

test('Manipulierte Gast-Snapshots und fremdes CSS erzeugen keine App-Elemente',async({page})=>{
  await open(page);await load(page,simple('Object.prototype.toJSON=function(key){return key===""?{type:"ready",tree:{id:1,tag:"div",attrs:{id:{toString:{}}},children:[]},store:{},focus:null}:this;};'));await start(page);await expect(page.getByLabel('Projektfehler')).toContainText('Ungültige');await expect(page.getByRole('heading',{name:'Frontend-Werkstatt',exact:true})).toBeVisible();
  await load(page,simple('document.body.innerHTML="<style>body{display:none}</style><iframe src=https://example.invalid></iframe><a href=javascript:alert(1)>Text</a><p>WEITER</p>";'));await start(page);await ready(page);await expect(output(page)).toContainText('WEITER');await expect(output(page).locator('iframe,style,script')).toHaveCount(0);await expect(page.getByRole('heading',{name:'Frontend-Werkstatt',exact:true})).toBeVisible();
});

test('Semantische TS-Fehler werden vor der Ausführung abgefangen',async({page})=>{
  await open(page,'course-29-2');const files=advancedFiles(lesson('course-29-2'));files['app.ts'].content+='\nconst falsch: number = "15";\nconsole.log("DARF-NICHT-LAUFEN");';await load(page,files);await start(page);await expect(page.getByLabel('Projektfehler')).toContainText('not assignable');await expect(page.getByLabel('Projektkonsole')).not.toContainText('DARF-NICHT-LAUFEN');
});
test('Kontrollierter Abbruch und neue Sitzungskennungen nach Wiederherstellung',async({page})=>{
  await open(page);await load(page,simple('const controller=new AbortController();const pending=fetch("./topics.json",{signal:controller.signal});controller.abort();pending.catch(error=>console.log(error.name));console.log(crypto.randomUUID());'));await start(page);await ready(page);await expect(page.getByLabel('Projektkonsole')).toContainText('AbortError');const first=await page.getByLabel('Projektkonsole').textContent();await page.getByRole('button',{name:'Projekt ausführen',exact:true}).click();await ready(page);expect(await page.getByLabel('Projektkonsole').textContent()).not.toBe(first);
});
for(const scenario of ['empty','http'])test(`React-Effekt zeigt ${scenario} verständlich`,async({page})=>{
  await open(page,'course-30-10');await load(page,advancedFiles(lesson('course-30-10')));await page.getByRole('button',{name:'Vorschau',exact:true}).click();await model(page).getByLabel('Übungsfall').selectOption(scenario);await page.getByRole('button',{name:'Projekt ausführen',exact:true}).click();await ready(page);await expect(output(page)).toContainText(scenario==='empty'?'Katalog ist leer':'Laden fehlgeschlagen');
});
test('Speicherquote lehnt den 21. neuen Schlüssel ab und erlaubt Updates',async({page})=>{
  await open(page);await load(page,simple('for(let i=0;i<20;i++)localStorage.setItem(String(i),"x");localStorage.setItem("0","neu");try{localStorage.setItem("21","zu viel");console.log("FALSCH");}catch{console.log("QUOTE",localStorage.getItem("0"));}'));await start(page);await ready(page);await expect(page.getByLabel('Projektkonsole')).toHaveText('QUOTE neu');
});

test('Mobile Ansicht, Tastatur, Abbruch und Wechsel verwerfen alte Arbeit',async({page},info)=>{
  await page.setViewportSize({width:390,height:844});await open(page,'course-30-4');await load(page,advancedFiles(lesson('course-30-4')));await start(page);await ready(page);const plus=output(page).getByRole('button',{name:'+2',exact:true});await plus.focus();await page.keyboard.press('Enter');await expect(output(page).locator('p')).toHaveText('2');await model(page).screenshot({path:info.outputPath('interaktive-ansicht-mobil.png')});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.getByLabel('Lektion',{exact:true}).selectOption('course-20-3');await expect(page.getByLabel('Projektkonsole')).toHaveCount(0);
});

function unpackOwnZip(buffer){const files={};let offset=0;while(buffer.readUInt32LE(offset)===0x04034b50){const size=buffer.readUInt32LE(offset+18),nameSize=buffer.readUInt16LE(offset+26),extra=buffer.readUInt16LE(offset+28);const name=buffer.subarray(offset+30,offset+30+nameSize).toString();if(name.startsWith('/')||name.split('/').includes('..'))throw Error('Ungültiger eigener ZIP-Pfad');const start=offset+30+nameSize+extra;files[name]=buffer.subarray(start,start+size);offset=start+size;}return files;}
for(const id of ['course-27-2','course-27-2-single','course-31-1','course-31-3'])test(`Externe Vorlage ${id}: eigener Testlauf, strict-Typprüfung und echter Build`,async({page},info)=>{
  test.setTimeout(90000);const base=id.replace('-single','');await open(page,base);const input=advancedFiles(lesson(base));if(id.endsWith('-single')){input['tests/data.test.js'].content=input['tests/data.test.js'].content.replaceAll('"',"'");input['index.html'].content=input['index.html'].content.replace('src="tests/data.test.js"','src="./tests/data.test.js"');}await load(page,input);const download=page.waitForEvent('download');await page.getByRole('button',{name:'Externe Werkzeugvorlage mit Projekt herunterladen',exact:true}).click();const zip=await download;const buffer=await fs.readFile(await zip.path());const files=unpackOwnZip(buffer);expect(files['package-lock.json']).toBeTruthy();expect(Object.keys(files).some(name=>/local-rag|local-ai|\.pdf$|\.env$|node_modules/.test(name))).toBe(false);
  const root=info.outputPath('vorlage');await fs.mkdir(root,{recursive:true});for(const [name,content]of Object.entries(files)){await fs.mkdir(path.dirname(path.join(root,name)),{recursive:true});await fs.writeFile(path.join(root,name),content);}await fs.symlink(path.join(repo,'frontend/course-template/node_modules'),path.join(root,'node_modules'),process.platform==='win32'?'junction':'dir');
  const tool=name=>path.join(repo,'frontend/course-template/node_modules',name);
  execFileSync(process.execPath,[tool('typescript/bin/tsc'),'--noEmit'],{cwd:root,stdio:'pipe',timeout:30000});
  const logs=execFileSync(process.execPath,['--test','tests/*.test.js'],{cwd:root,encoding:'utf8',timeout:10000});if(id.startsWith('course-27-2')){expect(logs).toContain('HTTP');expect(logs).toContain('Schema');}
  execFileSync(process.execPath,[tool('vite/bin/vite.js'),'build'],{cwd:root,stdio:'pipe',timeout:30000});expect((await fs.stat(path.join(root,'dist/index.html'))).isFile()).toBe(true);
  if(id==='course-31-3'){
    const source=info.outputPath('source-only');await fs.mkdir(source,{recursive:true});for(const [name,content]of Object.entries(files)){await fs.mkdir(path.dirname(path.join(source,name)),{recursive:true});await fs.writeFile(path.join(source,name),content);}
    await page.getByLabel('Ordner einlesen',{exact:true}).setInputFiles(source);await expect(page.getByRole('button',{name:'main.tsx',exact:true})).toBeVisible();await start(page);await ready(page);await expect(output(page).getByRole('heading',{name:'Mein Lernplan',exact:true})).toBeVisible();
  }
});

test('Electron: React ausführen, Übungsspeicher sichern und nach vollständigem Neustart wiederherstellen @desktop',async({},info)=>{
  test.skip(process.platform!=='win32','Windows-Electronmatrix');test.setTimeout(90000);let app;
  const options={executablePath:path.join(repo,'desktop/node_modules/electron/dist/electron.exe'),args:[path.join(repo,'desktop'),`--user-data-dir=${info.outputPath('profil')}`],env:{...process.env,AZUBIPREP_PILOT_DATA_DIR:info.outputPath('kursdaten'),AZUBIPREP_AI_DIR:info.outputPath('ki'),AZUBIPREP_RAG_DIR:info.outputPath('rag'),DATABASE_URL:'',PORT:'0',HOST:'127.0.0.1'}};
  delete options.env.ELECTRON_RUN_AS_NODE;
  try{app=await _electron.launch(options);let page=await app.firstWindow();await page.waitForURL(/^http:/);await open(page,'course-30-9',new URL(page.url()).origin+'/frontendkurs');await load(page,advancedFiles(lesson('course-30-9')));await start(page);await ready(page);await output(page).getByLabel('Lernziel',{exact:true}).fill('Desktop');await output(page).getByLabel('Minuten',{exact:true}).fill('12');await output(page).getByRole('button',{name:'Hinzufügen',exact:true}).click();await expect(output(page).locator('li')).toContainText('Desktop');await page.getByRole('button',{name:'Übungsspeicher übernehmen',exact:true}).click();await expect(page.locator('.pilot-status')).toHaveText('Gespeichert');await app.close();app=null;
    app=await _electron.launch(options);page=await app.firstWindow();await page.waitForURL(/^http:/);await open(page,'course-30-9',new URL(page.url()).origin+'/frontendkurs');await start(page);await ready(page);await expect(output(page).locator('li')).toContainText('Desktop');
  }finally{if(app)await app.close();}
});
