import { test, expect, _electron } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initialDebuggerCapstoneProject } from '../../frontend/src/pilot/debugger-capstone.js';
import { unterdrueckeOnboardingPopups, openDebugger } from './helpers.js';
test.use({ serviceWorkers: 'block' });
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const region=p=>p.getByRole('region',{name:'Debugger-Technikpilot',exact:true});
const button=(p,name)=>region(p).getByRole('button',{name,exact:true});
const status=p=>region(p).getByLabel('Debugstatus',{exact:true});
const output=p=>region(p).getByLabel('Debugkonsole',{exact:true});
const frame=p=>p.frameLocator('iframe[title="Gestaltete Debugvorschau"]');
async function open(page,url='/frontendkurs/debugger'){await unterdrueckeOnboardingPopups(page);await page.goto(url);await openDebugger(page);await region(page).getByLabel('Debugmodus',{exact:true}).selectOption('dom');}
async function load(page,p=initialDebuggerCapstoneProject()){page.once('dialog',d=>d.accept());await region(page).getByLabel('Modulsicherung lesen',{exact:true}).setInputFiles({name:'promise-probe.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(p))});await expect(region(page).getByLabel('Eigener Debugcode')).toHaveValue(p.files[p.entry]);}
async function start(page){await button(page,'Debuggen starten').click();await expect(status(page)).toContainText('Programmstart');}
async function go(page){const id=await status(page).getAttribute('data-pause-id');await button(page,'Weiter / bis zum nächsten Haltepunkt').click();await expect.poll(async()=>await status(page).getAttribute('data-phase')!=='paused'||await status(page).getAttribute('data-pause-id')!==id).toBe(true);}
async function idle(page){await expect(status(page)).toContainText('Bereit für Klicks');}
async function drain(page){for(let i=0;i<20;i++){await expect.poll(async()=>{const text=await status(page).textContent();return text.includes('Angehalten')||text.includes('Bereit für Klicks')||text.includes('beendet');}).toBe(true);if((await status(page).textContent()).includes('Bereit für Klicks'))return;if((await status(page).textContent()).includes('beendet'))throw new Error(await region(page).getByLabel('Debugfehler').textContent());await go(page);}throw new Error('Gesamtprojekt bleibt angehalten');}
async function action(page,name){await frame(page).getByRole('button',{name,exact:true}).click();await expect(status(page)).toContainText('Ereignisstart');await go(page);await drain(page);}
async function ready(page){await start(page);await go(page);await idle(page);await expect(region(page).getByLabel('CSS-Hinweise')).toHaveCount(0);await expect(frame(page).locator('#task-list li')).toHaveCount(1);}
async function workflow(page){
 await ready(page);await frame(page).getByLabel('Aufgabe',{exact:true}).fill('SQL üben');await frame(page).getByLabel('Minuten (1–240)',{exact:true}).fill('20');await action(page,'Aufgabe hinzufügen');await expect(frame(page).locator('#task-list li')).toHaveCount(2);await expect(output(page)).toContainText('Hinzugefügt: 2 Aufgaben');
 await action(page,'Im Übungsspeicher sichern');await frame(page).getByRole('button',{name:'Entfernen',exact:true}).last().click();await expect(status(page)).toContainText('Ereignisstart');await go(page);await idle(page);await expect(frame(page).locator('#task-list li')).toHaveCount(1);await action(page,'Gesicherten Stand lesen');await expect(frame(page).locator('#task-list li')).toHaveCount(2);await expect(frame(page).locator('#task-list')).toContainText('SQL üben');
 await action(page,'Langsam laden');await action(page,'Schnell laden');await expect.poll(async()=>{if((await status(page).textContent()).includes('Angehalten'))await go(page);return await frame(page).locator('#status').textContent();}).toContain('Schnelle Antwort übernommen: 2 Aufgaben.');await drain(page);await expect(frame(page).locator('#task-list')).toContainText('Neue Antwort verstehen');
 await action(page,'Ungültige Daten laden');await expect.poll(async()=>{if((await status(page).textContent()).includes('Angehalten'))await go(page);return await frame(page).locator('#status').textContent();}).toContain('Nicht übernommen:');await drain(page);await expect(frame(page).locator('#task-list')).toContainText('Neue Antwort verstehen');await expect(frame(page).locator('#task-list li')).toHaveCount(2);
 await action(page,'Langsam laden');await action(page,'Laden abbrechen');await expect(frame(page).locator('#status')).toContainText('Laden abgebrochen.');await expect(frame(page).locator('#task-list')).toContainText('Neue Antwort verstehen');await expect(output(page)).toContainText('Geladen: Schnelle Antwort');
}

test('JavaScript-Gesamtprojekt: Formular, Module, Elemente, Speicher, Datenprüfung und Aktualität',async({page})=>{
 test.setTimeout(60000);await open(page);page.once('dialog',d=>d.accept());await button(page,'JavaScript-Gesamtprojekt laden').click();await workflow(page);
 await region(page).getByLabel('Debugdatei',{exact:true}).selectOption('data.js');const bp=region(page).getByRole('button',{name:'Debug-Haltepunkt data.js Zeile 2 Spalte 3',exact:true});await bp.click();await frame(page).getByRole('button',{name:'Gesicherten Stand lesen',exact:true}).click();await expect(status(page)).toContainText('Ereignisstart');await go(page);await expect(status(page)).toContainText('data.js:2:3. Angehalten · Haltepunkt');await expect(region(page).getByLabel('Debugvariablen')).toContainText('value');await button(page,'Funktion verlassen').click();await expect(status(page)).toContainText('main.js:141:5. Angehalten');await go(page);await idle(page);await expect(frame(page).locator('#task-list')).toContainText('SQL üben');
});

test('Gesamtprojekt: schmale Tastatur, Quellsicherung und flüchtiger Übungsstand',async({page},info)=>{
 await page.setViewportSize({width:390,height:844});await open(page);await load(page);await ready(page);await frame(page).getByLabel('Aufgabe',{exact:true}).fill('Tastatur');await frame(page).getByLabel('Aufgabe',{exact:true}).press('Enter');await expect(status(page)).toContainText('Ereignisstart');await go(page);await idle(page);await expect(frame(page).locator('#task-list li')).toHaveCount(2);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 const pending=page.waitForEvent('download');await button(page,'Modulprojekt exportieren (JSON)').click();const file=await pending;await file.saveAs(info.outputPath('quellen.json'));expect(JSON.parse(fs.readFileSync(info.outputPath('quellen.json'),'utf8'))).toEqual(initialDebuggerCapstoneProject());await expect(page.locator('.pilot-status')).toHaveText('Gespeichert');await page.reload();await openDebugger(page);expect(page.workers()).toHaveLength(0);await ready(page);await expect(frame(page).locator('#task-list')).not.toContainText('Tastatur');
});

test('Electron: Gesamtprojekt-Ablauf und vollständiger Neustart @desktop',async({},info)=>{
 test.skip(process.platform!=='win32','Windows-Electron');test.setTimeout(90000);const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;env.DATABASE_URL='';env.AZUBIPREP_KI_ENABLED='false';env.AZUBIPREP_CHATGPT_ENABLED='false';let app;const launch=()=>_electron.launch({executablePath:path.join(repo,'desktop/node_modules/electron/dist/electron.exe'),args:[path.join(repo,'desktop'),'--user-data-dir='+info.outputPath('profil')],env});
 try{app=await launch();let page=await app.firstWindow();await page.waitForURL(/^http:/);await open(page,new URL(page.url()).origin+'/frontendkurs/debugger');await load(page);await workflow(page);await expect(page.locator('.pilot-status')).toHaveText('Gespeichert');await app.close();app=null;app=await launch();page=await app.firstWindow();await page.waitForURL(/^http:/);await open(page,new URL(page.url()).origin+'/frontendkurs/debugger');await ready(page);await expect(frame(page).locator('#task-list')).toContainText('Haltepunkte ausprobieren');await expect(output(page)).toHaveText('Noch keine Ausgabe.');}finally{await app?.close();}
});
