import { test, expect, _electron } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initialReactDebugProject } from '../../frontend/src/pilot/debugger-react.js';
import { unterdrueckeOnboardingPopups, openDebugger } from './helpers.js';

test.use({ serviceWorkers: 'block' });
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const region=p=>p.getByRole('region',{name:'Debugger-Technikpilot',exact:true});
const button=(p,name)=>region(p).getByRole('button',{name,exact:true});
const status=p=>region(p).getByLabel('Debugstatus',{exact:true});
const output=p=>region(p).getByLabel('Debugkonsole',{exact:true});
const failure=p=>region(p).getByLabel('Debugfehler',{exact:true});
const editor=p=>region(p).getByLabel('Eigener Debugcode',{exact:true});
const frame=p=>region(p).locator('.debug-dom-preview');
async function open(page,url='/frontendkurs/debugger'){await unterdrueckeOnboardingPopups(page);await page.goto(url);await openDebugger(page);}
async function example(page){page.once('dialog',d=>d.accept());await button(page,'React-Beispiel laden').click();await expect(region(page).getByLabel('Debugmodus',{exact:true})).toHaveValue('react');}
async function load(page,value){await region(page).getByLabel('Debugmodus',{exact:true}).selectOption('module');page.once('dialog',d=>d.accept());await region(page).getByLabel('Modulsicherung lesen',{exact:true}).setInputFiles({name:'react-probe.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(value))});await expect(editor(page)).toHaveValue(value.files[value.entry]);}
async function go(page){const id=await status(page).getAttribute('data-pause-id');await button(page,'Weiter / bis zum nächsten Haltepunkt').click();await expect.poll(async()=>await status(page).getAttribute('data-phase')!=='paused'||await status(page).getAttribute('data-pause-id')!==id).toBe(true);}
async function drain(page){for(let i=0;i<45;i++){await expect.poll(async()=>['paused','idle','error'].includes(await status(page).getAttribute('data-phase'))).toBe(true);const phase=await status(page).getAttribute('data-phase');if(phase==='idle')return;if(phase==='error')throw new Error(await failure(page).textContent());await go(page);}throw new Error('React bleibt angehalten');}
async function start(page){await button(page,'Debuggen starten').click();await drain(page);}
async function click(page,name){await frame(page).getByRole('button',{name,exact:true}).click();await drain(page);}
const project=(source,extra={})=>({schema:1,mode:'module',entry:'App.jsx',react:true,files:{'App.jsx':source},...extra});

test('React: echtes Beispiel, Zustandsänderung, Eingabe, Effekte und Cleanup',async({page})=>{
 await open(page);await example(page);await start(page);
 await expect(frame(page).getByRole('heading',{name:'Mein React-Zähler'})).toBeVisible();
 await expect(output(page)).toHaveText('Effekt für Stand 0');
 await click(page,'Eins dazu');await expect(frame(page).locator('p')).toHaveText('Hallo ! Stand: 1');
 await expect(output(page)).toHaveText('Effekt für Stand 0\nAufräumen für Stand 0\nEffekt für Stand 1');
 await frame(page).getByLabel('Dein Name').fill('Ada');await click(page,'Eins dazu');
 await expect(frame(page).locator('p')).toHaveText('Hallo Ada! Stand: 2');
 await button(page,'React-Komponente entfernen').click();await drain(page);
 await expect(frame(page).getByRole('heading')).toHaveCount(0);await expect(output(page)).toContainText('Aufräumen für Stand 2');
 await button(page,'Debuggen stoppen').click();await expect.poll(()=>page.workers().length).toBe(0);
});

test('React: Haltepunkt im Updater zeigt vorherigen Zustand, Rendern bleibt in derselben VM',async({page})=>{
 await open(page);await example(page);await start(page);
 await button(page,'Debug-Haltepunkt App.jsx Zeile 19 Spalte 28').click();
 await frame(page).getByRole('button',{name:'Eins dazu'}).click();
 await expect(status(page)).toHaveAttribute('data-phase','paused');
 // First event hold precedes the updater; explicit breakpoint remains enabled.
 for(let i=0;i<10;i++){if((await status(page).textContent()).includes('App.jsx:19:28'))break;await go(page);await expect(status(page)).toHaveAttribute('data-phase','paused');}
 await expect(status(page)).toContainText('App.jsx:19:28');
 await expect(region(page).getByLabel('Debugvariablen').locator('tbody tr').filter({hasText:/^previousnumber0$/})).toHaveCount(1);
 await expect(frame(page).locator('p')).toHaveText('Hallo ! Stand: 0');
 await go(page);await drain(page);await expect(frame(page).locator('p')).toHaveText('Hallo ! Stand: 1');
});

test('React: Komponentenprops, Callback und Listen mit stabilen Schlüsseln',async({page})=>{
 await open(page);await load(page,project('import { useState } from "react";\nfunction Child(props) { return <button onClick={() => props.onPick(props.name)}>{props.name}</button>; }\nexport default function App() {\n const [value, setValue] = useState("offen");\n const names = ["HTML", "CSS"];\n return <main><p>{value}</p>{names.map(name => <Child key={name} name={name} onPick={setValue} />)}</main>;\n}\n'));
 await start(page);await click(page,'CSS');await expect(frame(page).locator('p')).toHaveText('CSS');
});

test('React: Formular verhindert Standardaktion und übernimmt Texte ohne Hostzugriff',async({page})=>{
 await open(page);await load(page,project('import { useState } from "react";\nexport default function App() {\n const [text, setText] = useState("");\n const [saved, setSaved] = useState("");\n return <form onSubmit={event => { event.preventDefault(); console.log(event.defaultPrevented); setSaved(text); }}><label htmlFor="text">Text</label><textarea id="text" value={text} onChange={event => setText(event.target.value)} /><button type="submit">Speichern</button><p>{saved}</p></form>;\n}\n'));
 await start(page);await frame(page).getByLabel('Text',{exact:true}).fill('Erste\nZweite');await click(page,'Speichern');
 await expect(frame(page).locator('p')).toHaveText('Erste\nZweite');await expect(output(page)).toHaveText('true');expect(page.url()).toContain('/frontendkurs/debugger');
});

test('React: Browserzugriff, fremde Bibliotheken, Roh-HTML und async werden abgewiesen',async({page})=>{
 await open(page);
 const sources=[
  'export default function App(){ return document.body; }',
  'import {createRoot} from "react-dom/client"; export default function App(){return <p>Nein</p>;}',
  'export default function App(){return <div dangerouslySetInnerHTML={{__html:"<script>bad</script>"}}/>;}',
  'export default async function App(){return <p>Nein</p>;}',
  'export default function App(){return <iframe src="https://example.invalid"/>;}',
 ];
 for(const source of sources){
   // Load via existing module import without leaving React mode.
   page.once('dialog',d=>d.accept());await region(page).getByLabel('Debugmodus',{exact:true}).selectOption('module');
   if(await region(page).getByLabel('Modulsicherung lesen').count()===0)throw new Error('Modulimport fehlt');
   page.removeAllListeners('dialog');page.once('dialog',d=>d.accept());await region(page).getByLabel('Modulsicherung lesen').setInputFiles({name:'react-grenze.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(project(source)))});
   await button(page,'Debuggen starten').click();
   for(let i=0;i<8;i++){await expect.poll(async()=>['paused','error'].includes(await status(page).getAttribute('data-phase'))).toBe(true);if(await status(page).getAttribute('data-phase')==='error')break;await go(page);}
   await expect(failure(page)).toBeVisible();await expect.poll(()=>page.workers().length).toBe(0);
 }
});

test('React: schmale Ansicht, Quellsicherung und Neustart ohne alte Laufwerte',async({page},info)=>{
 await page.setViewportSize({width:390,height:844});await open(page);await example(page);await start(page);await click(page,'Eins dazu');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 const pending=page.waitForEvent('download');await button(page,'Modulprojekt exportieren (JSON)').click();const file=await pending;await file.saveAs(info.outputPath('react-quellen.json'));expect(JSON.parse(fs.readFileSync(info.outputPath('react-quellen.json'),'utf8'))).toEqual(initialReactDebugProject());
 await expect(page.locator('.pilot-status')).toHaveText('Gespeichert');await page.reload();await openDebugger(page);await expect(region(page).getByLabel('Debugmodus')).toHaveValue('react');await start(page);await expect(frame(page).locator('p')).toHaveText('Hallo ! Stand: 0');
});

test('TSX: lokale Typprüfung, Originalcode und ursprünglicher Updater-Haltepunkt',async({page})=>{
 const source='import { useState } from "react";\nexport default function App() {\n const [count, setCount] = useState<number>(0);\n return <button onClick={() => { setCount(previous => previous + 1); }}>{count}</button>;\n}\n';
 await open(page);await load(page,project(source,{entry:'App.tsx',files:{'App.tsx':source}}));await start(page);
 await expect(region(page).getByLabel('TypeScript-Prüfung')).toBeVisible();await expect(editor(page)).toHaveValue(source);
 await click(page,'0');await expect(frame(page).getByRole('button',{name:'1',exact:true})).toBeVisible();
 await button(page,'Debuggen stoppen').click();await editor(page).fill(source.replace('useState<number>(0)','useState<number>("falsch")'));await button(page,'Debuggen starten').click();
 await expect(failure(page)).toContainText('TypeScript-Typfehler');await expect(failure(page)).toContainText('App.tsx:3:');await expect(output(page)).toHaveText('Noch keine Ausgabe.');
});

test('Electron: React rendern, pausieren und nach vollständigem Neustart fortsetzen @desktop',async({},info)=>{
 test.skip(process.platform!=='win32','Windows-Electron');test.setTimeout(90000);const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;env.DATABASE_URL='';env.AZUBIPREP_KI_ENABLED='false';env.AZUBIPREP_CHATGPT_ENABLED='false';let app;const launch=()=>_electron.launch({executablePath:path.join(repo,'desktop/node_modules/electron/dist/electron.exe'),args:[path.join(repo,'desktop'),'--user-data-dir='+info.outputPath('profil')],env});
 try{app=await launch();let page=await app.firstWindow();await page.waitForURL(/^http:/);await open(page,new URL(page.url()).origin+'/frontendkurs/debugger');await example(page);await start(page);await click(page,'Eins dazu');await expect(frame(page).locator('p')).toHaveText('Hallo ! Stand: 1');await expect(page.locator('.pilot-status')).toHaveText('Gespeichert');await app.close();app=null;app=await launch();page=await app.firstWindow();await page.waitForURL(/^http:/);await open(page,new URL(page.url()).origin+'/frontendkurs/debugger');await start(page);await expect(frame(page).locator('p')).toHaveText('Hallo ! Stand: 0');}finally{await app?.close();}
});
