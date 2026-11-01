import { test, expect } from '@playwright/test';
import { unterdrueckeOnboardingPopups, openDebugger } from './helpers.js';
test.use({ serviceWorkers:'block' });

test('Gespeichert bestätigt den neuesten Kursstand erst nach tatsächlichem Commit, auch bei neuem Edit während altem Commit',async({page})=>{
  await page.addInitScript(()=>{
    const native=FileSystemFileHandle.prototype.createWritable;window.__saveAudit={hold:false,arrivals:0,releases:[]};
    FileSystemFileHandle.prototype.createWritable=async function(...args){const stream=await native.apply(this,args);if(this.name==='head.json'){const close=stream.close.bind(stream);stream.close=async()=>{if(window.__saveAudit.hold){window.__saveAudit.arrivals++;await new Promise(resolve=>window.__saveAudit.releases.push(resolve));}return close();};}return stream;};
  });
  await unterdrueckeOnboardingPopups(page);await page.goto('/frontendkurs');await openDebugger(page);const editor=page.getByRole('region',{name:'Debugger-Technikpilot',exact:true}).getByLabel('Eigener Debugcode',{exact:true});const status=page.locator('.pilot-status');await expect(status).toHaveText('Gespeichert');
  const read=()=>page.evaluate(async()=>{const dir=await(await navigator.storage.getDirectory()).getDirectoryHandle('azubiprep-frontendpilot-v1');const json=async name=>JSON.parse(await(await(await dir.getFileHandle(name)).getFile()).text());const head=await json('head.json');return(await json(head.slot+'.json')).jsDraft.source;});
  let confirmed=false;
  try{
    await page.evaluate(()=>{window.__saveAudit.hold=true;});await editor.fill('let wert=1;');const confirmation=expect(status).toHaveText('Gespeichert').then(()=>{confirmed=true;});
    await expect.poll(()=>page.evaluate(()=>window.__saveAudit.arrivals)).toBe(1);expect(confirmed).toBe(false);
    await editor.fill('let wert=2;');await page.evaluate(()=>window.__saveAudit.releases.shift()());await expect.poll(()=>page.evaluate(()=>window.__saveAudit.arrivals)).toBe(2);expect(confirmed).toBe(false);expect(await read()).toBe('let wert=1;');
    await page.evaluate(()=>window.__saveAudit.releases.shift()());await confirmation;expect(await read()).toBe('let wert=2;');await page.reload();await openDebugger(page);await expect(editor).toHaveValue('let wert=2;');
  }finally{await page.evaluate(()=>{window.__saveAudit.hold=false;for(const release of window.__saveAudit.releases.splice(0))release();});}
});
