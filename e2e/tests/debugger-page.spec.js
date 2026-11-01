import {test,expect,_electron} from '@playwright/test';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {unterdrueckeOnboardingPopups,openDebugger} from './helpers.js';
import {LESSONS,solutionFor} from '../../frontend/src/pilot/course.js';
import {initialDOMProject} from '../../frontend/src/pilot/debugger-dom.js';
test.use({serviceWorkers:'block'});
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const region=p=>p.getByRole('region',{name:'Debugger-Technikpilot',exact:true});
const status=p=>region(p).getByLabel('Debugstatus',{exact:true});
const editor=p=>region(p).getByLabel('Eigener Debugcode',{exact:true});
const back=p=>p.getByRole('link',{name:'← Zurück zur Werkstatt',exact:true}).click();
const click=(p,name)=>region(p).getByRole('button',{name,exact:true}).click();
async function init(page,url='/frontendkurs'){await unterdrueckeOnboardingPopups(page);await page.goto(url);}
async function paused(page){await click(page,'Debuggen starten');await expect(status(page)).toContainText('Angehalten');}
async function audit(page){await page.addInitScript(()=>{const Native=window.Worker;window.__debugPageWorkers={active:0};window.Worker=class extends Native{constructor(...args){super(...args);this.counted=true;window.__debugPageWorkers.active++;}terminate(){if(this.counted){this.counted=false;window.__debugPageWorkers.active--;}super.terminate();}};});}

test('Eigene Seite: kompakter Einstieg, Lektion/Editor und sofortige geteilte Änderungen bleiben erhalten',async({page})=>{
 await init(page);await expect(page.locator('.js-debug-pilot')).toHaveCount(0);const lesson=page.getByLabel('Lektion',{exact:true});await lesson.selectOption({index:2});const selected=await lesson.inputValue();await page.getByRole('button',{name:'Schreiben',exact:true}).click();await page.getByLabel('Code index.html',{exact:true}).fill('<h1>Eigener Kursstand</h1>');
 await openDebugger(page);await expect(page).toHaveURL(/\/frontendkurs\/debugger$/);await expect(page.getByRole('heading',{name:'Debugger',exact:true})).toBeFocused();await expect(region(page)).toBeVisible();await expect(page.getByLabel('Lektion',{exact:true})).toHaveCount(0);await expect(page.getByRole('region',{name:'JavaScript-Grundlagen',exact:true})).toHaveCount(0);
 await editor(page).fill('console.log("geteilt");');await back(page);await expect(lesson).toHaveValue(selected);await expect(page.getByLabel('Code index.html',{exact:true})).toHaveValue('<h1>Eigener Kursstand</h1>');await expect(page.getByRole('link',{name:'Debugger öffnen',exact:true})).toBeFocused();await expect(page.locator('.js-debug-pilot')).toHaveCount(0);
 const playground=page.getByRole('region',{name:'JavaScript-Grundlagen',exact:true});await playground.getByRole('button',{name:'JavaScript ausprobieren',exact:true}).click();await expect(playground.getByLabel('JavaScript-Code',{exact:true})).toHaveValue('console.log("geteilt");');await playground.getByLabel('JavaScript-Code',{exact:true}).fill('console.log("von Werkstatt");');await openDebugger(page);await expect(editor(page)).toHaveValue('console.log("von Werkstatt");');await expect(page.locator('.pilot-status')).toHaveText('Gespeichert');await page.reload();await expect(editor(page)).toHaveValue('console.log("von Werkstatt");');await expect(region(page).getByLabel('Debugkonsole')).toHaveText('Noch keine Ausgabe.');
});

for(const phase of ['Vorbereitung','Pause','Lauf','Klickwartepunkt'])test(`Seitenwechsel beendet Worker physisch: ${phase}`,async({page})=>{
 await audit(page);
 if(phase==='Vorbereitung')await page.route('**/assets/debugger-compiler.worker-*.js',r=>r.fulfill({contentType:'text/javascript',body:'self.onmessage=()=>{};'}));
 if(phase==='Lauf')await page.route('**/assets/debugger.worker-*.js',r=>r.fulfill({contentType:'text/javascript',body:'self.onmessage=({data})=>{self.postMessage({type:"running",session:data.session,revision:data.revision,seq:1,remaining:data.limits.activeMs});while(true){}};'}));
 await init(page,'/frontendkurs/debugger');await expect(region(page)).toBeVisible();await expect.poll(()=>page.evaluate(()=>window.__debugPageWorkers.active)).toBe(0);
 if(phase==='Klickwartepunkt'){await region(page).getByLabel('Debugmodus',{exact:true}).selectOption('dom');page.once('dialog',d=>d.accept());await click(page,'DOM-Beispiel laden');}
 await click(page,'Debuggen starten');if(phase==='Pause'||phase==='Klickwartepunkt')await expect(status(page)).toContainText('Angehalten');else if(phase==='Lauf')await expect(status(page)).toContainText('Programm läuft');else await expect.poll(()=>page.evaluate(()=>window.__debugPageWorkers.active)).toBe(1);
 if(phase==='Klickwartepunkt'){await click(page,'Weiter / bis zum nächsten Haltepunkt');await expect(status(page)).toContainText('Bereit für Klicks');}
 await back(page);await expect.poll(()=>page.evaluate(()=>window.__debugPageWorkers.active)).toBe(0);await openDebugger(page);await expect(region(page).getByLabel('Debugvariablen')).toContainText('Noch kein Halt');await expect(region(page).getByLabel('Debugkonsole')).toHaveText('Noch keine Ausgabe.');await expect.poll(()=>page.evaluate(()=>window.__debugPageWorkers.active)).toBe(0);
});

test('Modul/HTML-Speicher läuft über schnellen Hin-/Rückwechsel weiter, Reload bleibt passiv',async({page})=>{
 await init(page,'/frontendkurs/debugger');await region(page).getByLabel('Debugmodus',{exact:true}).selectOption('dom');page.once('dialog',d=>d.accept());await click(page,'DOM-Beispiel laden');const html='<button id="plus">Mein Button</button><p id="stand">Start</p>';await region(page).getByLabel('HTML für Debugvorschau',{exact:true}).fill(html);await editor(page).fill(initialDOMProject().files['main.js']+'\n// eigener Stand');await back(page);await openDebugger(page);await expect(editor(page)).toHaveValue(initialDOMProject().files['main.js']+'\n// eigener Stand');await expect(region(page).getByLabel('HTML für Debugvorschau',{exact:true})).toHaveValue(html);await expect(page.locator('.pilot-status')).toHaveText('Gespeichert');await page.reload();await expect(region(page).getByLabel('HTML für Debugvorschau',{exact:true})).toHaveValue(html);await expect(region(page).getByRole('region',{name:'DOM-Debugvorschau',exact:true})).toHaveCount(0);
});

test('Mobil/Tastatur: Einstieg und Rückweg ohne Überbreite, Seitenkopf fokussiert',async({page})=>{
 await page.setViewportSize({width:390,height:844});await init(page);const entry=page.getByRole('link',{name:'Debugger öffnen',exact:true});await entry.focus();await page.keyboard.press('Enter');await expect(page.getByRole('heading',{name:'Debugger',exact:true})).toBeFocused();await expect(region(page)).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);const link=page.getByRole('link',{name:'← Zurück zur Werkstatt',exact:true});await link.focus();await page.keyboard.press('Enter');await expect(entry).toBeFocused();
});

test('Electron: direkte Debuggerroute, Rückweg und lokale Quelle nach vollständigem Neustart @desktop',async({},info)=>{
 test.skip(process.platform!=='win32');test.setTimeout(90000);const profile=info.outputPath('profil'),env={...process.env,DATABASE_URL:'',AZUBIPREP_AI_DIR:path.join(profile,'ki'),AZUBIPREP_RAG_DIR:path.join(profile,'rag')};delete env.ELECTRON_RUN_AS_NODE;const options={executablePath:path.join(repo,'desktop/node_modules/electron/dist/electron.exe'),args:[path.join(repo,'desktop'),`--user-data-dir=${profile}`],env};let app;
 try{app=await _electron.launch(options);let page=await app.firstWindow();await page.waitForURL(/^http:/);await init(page,new URL(page.url()).origin+'/frontendkurs/debugger');await expect(region(page)).toBeVisible();await editor(page).fill('console.log(53);');await back(page);await expect(page.locator('.js-debug-pilot')).toHaveCount(0);await openDebugger(page);await expect(editor(page)).toHaveValue('console.log(53);');await expect(page.locator('.pilot-status')).toHaveText('Gespeichert');await app.close();app=null;
 app=await _electron.launch(options);page=await app.firstWindow();await page.waitForURL(/^http:/);await init(page,new URL(page.url()).origin+'/frontendkurs/debugger');await expect(editor(page)).toHaveValue('console.log(53);');await paused(page);await click(page,'Weiter / bis zum nächsten Haltepunkt');await expect(region(page).getByLabel('Debugkonsole')).toHaveText('53');}finally{if(app)await app.close();}
});


test('Eintritt beendet das unsichtbar werdende Kursprogramm und bewahrt die Lektion',async({page})=>{
 await audit(page);await page.route('**/assets/js-runner.worker-*.js',r=>r.fulfill({contentType:'text/javascript',body:'self.onmessage=()=>{self.postMessage({type:"running"});while(true){}};'}));await init(page);const lesson=LESSONS.find(item=>item.jsStep);await page.getByLabel('Lektion',{exact:true}).selectOption(lesson.id);await page.getByRole('button',{name:'Schreiben',exact:true}).click();await page.getByLabel('Code index.html',{exact:true}).fill(solutionFor(lesson)['index.html'].content);await page.getByRole('button',{name:'Vorschau / Konsole',exact:true}).click();const course=page.getByRole('region',{name:'Kurskonsole',exact:true});await course.getByRole('button',{name:'Kursprogramm ausführen',exact:true}).click();await expect(course.locator('.js-course-status')).toContainText('Kursprogramm läuft');expect(await page.evaluate(()=>window.__debugPageWorkers.active)).toBe(1);await openDebugger(page);await expect.poll(()=>page.evaluate(()=>window.__debugPageWorkers.active)).toBe(0);await back(page);await expect(page.getByLabel('Lektion',{exact:true})).toHaveValue(lesson.id);await expect(course.locator('.js-course-status')).toContainText('Code bereit');expect(await page.evaluate(()=>window.__debugPageWorkers.active)).toBe(0);
});
