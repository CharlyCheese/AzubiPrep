import { test, expect, chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileDebugger } from '../../frontend/src/pilot/debugger-compiler.js';
import { DEBUG_LIMITS, debuggerLimits, encodedSize } from '../../frontend/src/pilot/debugger-core.js';
import { startDebugger } from '../../frontend/src/pilot/debugger.js';
import asyncVariant from '../../frontend/node_modules/@jitl/quickjs-singlefile-browser-release-asyncify/dist/index.mjs';
import { newQuickJSAsyncWASMModuleFromVariant, newVariant } from '../../frontend/node_modules/quickjs-emscripten-core/dist/index.mjs';
import { unterdrueckeOnboardingPopups, openDebugger } from './helpers.js';

test.use({ serviceWorkers: 'block' });
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const draft = source => ({ schema: 1, name: 'abnahme.js', source });
const region = page => page.getByRole('region', { name: 'Debugger-Technikpilot', exact: true });
const status = page => region(page).getByLabel('Debugstatus', { exact: true });
const values = page => region(page).getByRole('region', { name: 'Debugvariablen', exact: true });
const click = (page, name) => region(page).getByRole('button', { name, exact: true }).click();
const go = page => click(page, 'Weiter / bis zum nächsten Haltepunkt');
async function open(page, source) { await unterdrueckeOnboardingPopups(page); await page.goto('/frontendkurs'); await openDebugger(page); await region(page).getByLabel('Eigener Debugcode', { exact: true }).fill(source); }
async function start(page) { await click(page, 'Debuggen starten'); await expect(status(page)).toContainText('Angehalten'); }

async function raw(page, source, limits = {}, mode = 'continue') {
  const artifact = compileDebugger(draft(source)); const asset = fs.readdirSync(path.join(repo, 'frontend/dist/assets')).find(name => /^debugger\.worker-.*\.js$/.test(name));
  return page.evaluate(({ artifact, asset, limits, mode }) => new Promise(resolve => {
    const worker = new Worker('/assets/' + asset, { type: 'module' }), events = []; let commandId = 0;
    const timer = setTimeout(() => { worker.terminate(); resolve([{ type: 'timeout' }]); }, 14000);
    worker.onmessage = ({ data }) => { events.push(data); if (data.type === 'paused') worker.postMessage({ type: 'control', session: 'test', revision: 'rev', commandId: ++commandId, pauseId: data.pauseId, mode }); if (data.type === 'done' || data.type === 'error') { clearTimeout(timer); worker.terminate(); resolve(events); } };
    worker.postMessage({ type: 'start', session: 'test', revision: 'rev', artifact, limits });
  }), { artifact, asset, limits, mode });
}

test('DB23: Produktionsgrenzen des Compilers unter/auf/über Quelle, AST, Tiefe, Positionen, Namen und Scopes', () => {
  for (const delta of [-1, 0, 1]) {
    const source = 'let x="' + 'x'.repeat(65536 - 9 + delta) + '";'; expect(encodedSize(source)).toBe(65536 + delta);
    if (delta > 0) expect(() => compileDebugger(draft(source))).toThrow(); else expect(() => compileDebugger(draft(source))).not.toThrow();
    const lines = '\n'.repeat(511 + delta); if (delta > 0) expect(() => compileDebugger(draft(lines))).toThrow('Zeilengrenze'); else expect(() => compileDebugger(draft(lines))).not.toThrow();
    const name = 'x'.repeat(128 + delta); if (delta > 0) expect(() => compileDebugger(draft('let ' + name + '=1;'))).toThrow(); else expect(() => compileDebugger(draft('let ' + name + '=1;'))).not.toThrow();
    const blocks = '{'.repeat(31 + delta) + 'let x=1;' + '}'.repeat(31 + delta); if (delta > 0) expect(() => compileDebugger(draft(blocks))).toThrow('Scope-Grenze'); else expect(() => compileDebugger(draft(blocks))).not.toThrow();
    const points = '1;'.repeat(1023 + delta); if (delta > 0) expect(() => compileDebugger(draft(points))).toThrow('Debugpositionen'); else expect(compileDebugger(draft(points)).points.length).toBe(1024 + delta);
  }
  const overhead = compileDebugger(draft('let a=[0];')).stats.nodes - 1;
  for (const delta of [-1, 0, 1]) { const source = 'let a=[' + Array(8192 - overhead + delta).fill('0').join(',') + '];'; if (delta > 0) expect(() => compileDebugger(draft(source))).toThrow('AST'); else expect(compileDebugger(draft(source)).stats.nodes).toBe(8192 + delta); }
  const depth = compileDebugger(draft('let a=1;')).stats.maxDepth;
  for (const delta of [-1, 0, 1]) { const count = 64 - depth + delta, source = 'let a=' + '('.repeat(count) + '1' + ')'.repeat(count) + ';'; if (delta > 0) expect(() => compileDebugger(draft(source))).toThrow('AST'); else expect(compileDebugger(draft(source)).stats.maxDepth).toBe(64 + delta); }
  const unicode = 'let x="' + 'ä'.repeat(32764) + '";'; expect(encodedSize(unicode)).toBeGreaterThan(65536); expect(unicode.length).toBeLessThan(65536); expect(() => compileDebugger(draft(unicode))).toThrow();
});

test('DB23: generierte Bytes tatsächlich an 256-KiB-Grenze, Limits können nicht vergrößert werden', () => {
  const declarations = Array.from({ length: 50 }, (_, i) => 'let v' + i + 'x'.repeat(30) + '=1;').join('');
  let last;
  for (let count = 1; count < 100; count++) {
    const source = declarations + 'let pad="";function f(){return 1;}' + 'f();'.repeat(count);
    try { last = { source, bytes: compileDebugger(draft(source)).stats.generatedBytes }; } catch (error) { expect(error.message).toContain('Generierter'); break; }
  }
  expect(last).toBeTruthy(); const gap = DEBUG_LIMITS.generatedBytes - last.bytes;
  for (const delta of [-1, 0, 1]) { const source = last.source.replace('pad=""', 'pad="' + 'p'.repeat(gap + delta) + '"'); if (delta > 0) expect(() => compileDebugger(draft(source))).toThrow('Generierter'); else expect(compileDebugger(draft(source)).stats.generatedBytes).toBe(DEBUG_LIMITS.generatedBytes + delta); }
  for (const [name, cap] of Object.entries(DEBUG_LIMITS)) {
    expect(debuggerLimits({ [name]: cap })[name]).toBe(cap); if (cap > 1) expect(debuggerLimits({ [name]: cap - 1 })[name]).toBe(cap - 1);
    for (const value of [0, -1, cap + 1, 1.5, NaN, Infinity]) expect(() => debuggerLimits({ [name]: value })).toThrow();
  }
  expect(() => debuggerLimits({ unknown: 1 })).toThrow();
});

function snapshotFor(artifact, pointId = 0) {
  const point = artifact.points[pointId], scopes = point.scopes.map(scope => ({ id: scope.id, values: scope.names.map(name => ({ name, type: 'uninitialized', display: 'noch nicht initialisiert' })) }));
  return { point: point.id, truncated: false, scopes, frames: [{ id: 0, functionId: 0, point: point.id, scopes }] };
}

test('DB10/DB12/DB23: Hostgrenzen für kumulative Nachrichten/Bytes exakt; monotone Restzeit', () => {
  const original = globalThis.Worker;
  class Fake { static all=[]; constructor(){this.messages=[];Fake.all.push(this);}postMessage(data){this.messages.push(data);}terminate(){this.terminated=true;} }
  globalThis.Worker = Fake;
  try {
    const runTrace = overrides => {
      Fake.all=[]; const events=[]; const run=startDebugger(draft('let x=1;'),event=>events.push(event),overrides); const artifact=compileDebugger(draft('let x=1;'));
      Fake.all[0].onmessage({data:{type:'compiled',artifact}});const worker=Fake.all[1], initial=worker.messages[0], base={session:initial.session,revision:initial.revision};let seq=0,totalBytes=0,totalMessages=0;
      const send = body => { const data={...body,...base,seq:++seq};totalMessages++;totalBytes+=encodedSize(JSON.stringify(data));worker.onmessage({data}); };
      send({type:'running',remaining:1000});send({type:'paused',remaining:900,pauseId:1,snapshot:snapshotFor(artifact)});
      if(run.resume('continue')){const command=worker.messages.at(-1);totalMessages++;totalBytes+=encodedSize(JSON.stringify(command));send({type:'ack',commandId:command.commandId});send({type:'running',remaining:900});send({type:'final',snapshot:snapshotFor(artifact,artifact.points.length-1)});send({type:'done'});}
      run.dispose();return{events,totalBytes,totalMessages,workers:Fake.all};
    };
    const baseline=runTrace();expect(baseline.events.at(-1).type).toBe('done');
    for(const [name,cap] of [['messages',baseline.totalMessages],['protocolBytes',baseline.totalBytes]])for(const delta of [-1,0,1]){const result=runTrace({[name]:cap+delta});expect(result.events.at(-1).type).toBe(delta<0?'error':'done');expect(result.workers.every(worker=>worker.terminated)).toBe(true);}
    Fake.all=[];const events=[];const run=startDebugger(draft('let x=1;'),event=>events.push(event));const artifact=compileDebugger(draft('let x=1;'));Fake.all[0].onmessage({data:{artifact}});const worker=Fake.all[1],initial=worker.messages[0],base={session:initial.session,revision:initial.revision};
    worker.onmessage({data:{...base,type:'running',seq:1,remaining:1000}});worker.onmessage({data:{...base,type:'paused',seq:2,pauseId:1,remaining:900,snapshot:snapshotFor(artifact)}});run.resume();worker.onmessage({data:{...base,type:'ack',seq:3,commandId:1}});worker.onmessage({data:{...base,type:'running',seq:4,remaining:901}});expect(events.at(-1).text).toContain('Zeitbudget');expect(worker.terminated).toBe(true);run.dispose();
  }finally{globalThis.Worker=original;}
});

test('DB23: echte reduzierte Kontrollpunkt-/Pausengrenzen sowie Produktionsgrenzen für Werte/Bindungen/Ausgaben', async ({ page }) => {
  test.setTimeout(90000);await open(page,'let x=1;');
  for(const [source,name,cap,mode] of [['let i=0;while(i<3){i++;}i;','checkpointHits',10,'continue'],['let x=0;x++;x++;','pauses',3,'step']])for(const delta of [-1,0,1]){const events=await raw(page,source,{[name]:cap+delta},mode);expect(events.at(-1).type,JSON.stringify({name,delta})).toBe(delta<0?'error':'done');}
  for(const length of [79,80,81]){const events=await raw(page,'let text="'+'x'.repeat(length)+'";');expect(events.at(-1).type).toBe('done');const final=events.find(event=>event.type==='final');expect(final.snapshot.scopes[0].values[0].display).toBe('x'.repeat(Math.min(80,length))+(length>80?'…':''));}
  const tiny=await raw(page,'let text="abc";',{valueChars:1});expect(tiny.at(-1).type).toBe('done');expect(tiny.find(event=>event.type==='paused').snapshot.scopes[0].values[0].display).toBe('noch nicht initialisiert');expect(tiny.find(event=>event.type==='final').snapshot.scopes[0].values[0].display).toBe('a…');
  for(const count of [63,64,65]){const events=await raw(page,Array.from({length:count},(_,i)=>'let v'+i+'='+i+';').join(''));expect(events.at(-1).type).toBe('done');const final=events.find(event=>event.type==='final');expect(final.snapshot.scopes[0].values).toHaveLength(Math.min(count,64));expect(final.snapshot.truncated).toBe(count>64);}
  for(const count of [79,80,81]){const events=await raw(page,'for(let i=0;i<'+count+';i++){console.log("x");}');expect(events.at(-1).type).toBe(count>80?'error':'done');expect(events.filter(event=>event.type==='log')).toHaveLength(Math.min(count,80));}
  for(const count of [31,32,33]){const events=await raw(page,'for(let i=0;i<'+count+';i++){console.log("'+'x'.repeat(1000)+'");}');expect(events.at(-1).type).toBe(count>32?'error':'done');}
  for(const count of [999,1000,1001]){const events=await raw(page,'console.log("'+'x'.repeat(count)+'");');expect(events.at(-1).type).toBe('done');expect(events.find(event=>event.type==='log').text).toHaveLength(Math.min(count,1000));}
  const fresh=await raw(page,'console.log(1);');expect(fresh.at(-1).type).toBe('done');
  for(const [depth,expected] of [[29,'done'],[30,'done'],[31,'error']]){const events=await raw(page,'function f(n){if(n===0)return 0;return f(n-1);}f('+depth+');');expect(events.at(-1).type,'aktive Frames '+(depth+2)).toBe(expected);}
});

test('DB23: 20 Argumente werden bei Console, eigenen Funktionen und Arraymethoden vorab begrenzt', () => {
  for(const count of [19,20,21])for(const source of ['console.log('+Array(count).fill('0').join(',')+');','function f(n){return n;}f('+Array(count).fill('0').join(',')+');','let a=[];a.push('+Array(count).fill('0').join(',')+');']){if(count>20)expect(()=>compileDebugger(draft(source))).toThrow('noch nicht unterstützt');else expect(()=>compileDebugger(draft(source))).not.toThrow();}
});

test('DB23: externe Vorbereitungs-/Start-/Idlefristen mit gemessener Toleranz und Ende aller Worker', async () => {
  const original=globalThis.Worker;const workers=[];class Fake{constructor(){workers.push(this);}postMessage(data){this.initial=data;}terminate(){this.terminated=true;}}globalThis.Worker=Fake;
  try{for(const phase of ['prepare','startup','idle']){workers.length=0;const events=[];let endedAt=0;const run=startDebugger(draft('let x=1;'),event=>{events.push(event);if(event.type==='error')endedAt=Date.now();},{prepareMs:50,startupMs:50,idleMs:50});
    const artifact=compileDebugger(draft('let x=1;'));if(phase!=='prepare'){workers[0].onmessage({data:{artifact}});if(phase==='idle'){const worker=workers[1],base={session:worker.initial.session,revision:worker.initial.revision};worker.onmessage({data:{...base,type:'running',seq:1,remaining:1000}});worker.onmessage({data:{...base,type:'paused',seq:2,pauseId:1,remaining:999,snapshot:snapshotFor(artifact)}});}}
    const startedAt=Date.now();await new Promise(resolve=>setTimeout(resolve,20));expect(events.some(event=>event.type==='error')).toBe(false);await new Promise(resolve=>setTimeout(resolve,60));expect(events.at(-1).text).toContain(phase==='prepare'?'Vorbereitung':phase==='startup'?'Startgrenze':'unbediente Pause');expect(endedAt-startedAt).toBeGreaterThanOrEqual(30);expect(endedAt-startedAt).toBeLessThan(1500);expect(workers.every(worker=>worker.terminated)).toBe(true);run.dispose();
  }}finally{globalThis.Worker=original;}
});

test('DB23: injizierte echte Asyncify-WASM-Memory wächst bis maximal 32 MiB', async () => {
  const memory=new WebAssembly.Memory({initial:256,maximum:512});await newQuickJSAsyncWASMModuleFromVariant(newVariant(asyncVariant,{wasmMemory:memory}));
  expect(memory.buffer.byteLength).toBe(16777216);memory.grow(255);expect(memory.buffer.byteLength).toBe(511*65536);memory.grow(1);expect(memory.buffer.byteLength).toBe(33554432);expect(()=>memory.grow(1)).toThrow(RangeError);
});

test('DB23: Snapshot-Bytes und konservative Units unter/auf/über Grenze; aktive Zeit über echte Pausen kumulativ', async ({page}) => {
  await open(page,'let x=1;');const source='let text="'+'漢'.repeat(80)+'";';const baseline=await raw(page,source);const state=baseline.find(event=>event.type==='final').snapshot;expect(encodedSize(JSON.stringify(state))).toBeGreaterThan(JSON.stringify(state).length);
  for(const delta of [-1,0,1]){const bytes=await raw(page,source,{snapshotBytes:encodedSize(JSON.stringify(state))+delta});expect(bytes.at(-1).type).toBe(delta<0?'error':'done');const units=await raw(page,source,{snapshotUnits:JSON.stringify(state).length+128+delta});expect(units.at(-1).type).toBe('done');expect(units.find(event=>event.type==='final').snapshot.truncated).toBe(delta<0);}
  const events=await raw(page,'let summe=0;for(let i=0;i<100000;i++){summe+=i;}',{activeMs:20},'step');const pauses=events.filter(event=>event.type==='paused');expect(pauses.length).toBeGreaterThan(1);for(let i=1;i<pauses.length;i++)expect(pauses[i].remaining).toBeLessThanOrEqual(pauses[i-1].remaining);expect(pauses.at(-1).remaining).toBeLessThan(pauses[0].remaining);expect(events.at(-1).text).toBe('Aktive Zeitgrenze erreicht.');
});

test('DB23: echte Asyncify-Heapquota und Stacküberlauf mit frischem Folgeruntime', async () => {
  const quick=await newQuickJSAsyncWASMModuleFromVariant(asyncVariant);
  for(const source of ['function f(n){return n?f(n-1)+1:0;}f(2);','function f(n){return n?f(n-1)+1:0;}f(10000);','var a=[];for(let i=0;i<1000000;i++){a.push({i});}a.length;','function f(n){return n?f(n-1)+1:0;}f(2);']){
    const runtime=quick.newRuntime();runtime.setMemoryLimit(DEBUG_LIMITS.heapBytes);runtime.setMaxStackSize(DEBUG_LIMITS.stackBytes);const vm=runtime.newContext();const usage=runtime.computeMemoryUsage();expect(vm.dump(usage).malloc_limit).toBe(16777216);usage.dispose();
    const result=await vm.evalCodeAsync(source);if(source.includes('10000')||source.includes('1000000')){expect(result.error).toBeTruthy();const error=vm.dump(result.error);expect(error.message).toBe(source.includes('1000000')?'out of memory':'stack overflow');result.error.dispose();}else{expect(result.error).toBeUndefined();expect(vm.getNumber(result.value)).toBe(2);result.value.dispose();}vm.dispose();runtime.dispose();
  }
});

test('DB01/DB04/DB05: praktische Summenvorlage ergibt 5 und bei leerer Liste 0', async ({page}) => {
  const sample=items=>'function summe(zahlen) {\n let ergebnis=0;\n for(const zahl of zahlen) {\n  ergebnis+=zahl;\n }\n return ergebnis;\n}\nlet gesamt=summe('+items+');\nconsole.log(gesamt);';
  await open(page,sample('[2,3]'));await start(page);await go(page);await expect(region(page).getByLabel('Debugkonsole')).toHaveText('5');await region(page).getByLabel('Eigener Debugcode',{exact:true}).fill(sample('[]'));await start(page);await go(page);await expect(region(page).getByLabel('Debugkonsole')).toHaveText('0');
});

test('DB09/DB10: tatsächlicher Controller beendet hängenden echten Worker unabhängig von VM und kann neu starten', async ({ page }) => {
  await page.addInitScript(()=>{const Native=window.Worker;window.__workerAudit={active:0,terminated:0};window.Worker=class extends Native{constructor(...args){super(...args);this.counted=true;window.__workerAudit.active++;}terminate(){if(this.counted){this.counted=false;window.__workerAudit.active--;window.__workerAudit.terminated++;}super.terminate();}};});
  const pattern='**/assets/debugger.worker-*.js';await page.route(pattern,route=>route.fulfill({contentType:'text/javascript',body:'self.onmessage=({data})=>{self.postMessage({type:"running",session:data.session,revision:data.revision,seq:1,remaining:data.limits.activeMs});while(true){}};'}));
  await open(page,'let x=1;');const before=Date.now();await click(page,'Debuggen starten');await expect(region(page).getByLabel('Debugfehler')).toHaveText('Aktive Zeitgrenze erreicht.');expect(Date.now()-before).toBeLessThan(7000);expect(await page.evaluate(()=>window.__workerAudit.active)).toBe(0);
  await click(page,'Debuggen starten');await expect(status(page)).toContainText('Programm läuft');await click(page,'Debuggen stoppen');await expect(status(page)).toContainText('gestoppt');expect(await page.evaluate(()=>window.__workerAudit.active)).toBe(0);
  await page.unroute(pattern);await start(page);await go(page);await expect(status(page)).toContainText('Programm ist beendet');expect(await page.evaluate(()=>window.__workerAudit.active)).toBe(0);
});

test('DB14/DB17/DB20/DB21: unveränderte Datei exportieren/einlesen, keine Debugdaten oder KI-/Netzanfragen', async ({ page }) => {
  const requests=[];let phase='loading';page.on('request',request=>{const url=new URL(request.url());if(url.protocol.startsWith('http'))requests.push({origin:url.origin,path:url.pathname,method:request.method(),phase});});
  const source='let wert=15;\nconsole.log(wert);';await open(page,source);await page.waitForLoadState('networkidle');phase='debugging';await start(page);await click(page,'Einzelner Schritt');await expect(values(page)).toContainText('15');
  await page.getByRole('link',{name:'← Zurück zur Werkstatt',exact:true}).click();
  const playground=page.getByRole('region',{name:'JavaScript-Grundlagen',exact:true});await playground.getByRole('button',{name:'JavaScript ausprobieren',exact:true}).click();
  const downloaded=page.waitForEvent('download');await playground.getByRole('button',{name:'JavaScript-Datei exportieren',exact:true}).click();const file=await downloaded;expect(fs.readFileSync(await file.path(),'utf8')).toBe(source);
  page.once('dialog',dialog=>dialog.accept());await playground.getByLabel('JavaScript-Datei einlesen',{exact:true}).setInputFiles({name:'anders.js',mimeType:'text/javascript',buffer:Buffer.from(source)});
  await openDebugger(page);await expect(status(page)).toContainText('Quellstand bereit');await expect(values(page)).toContainText('Noch kein Halt');await expect(region(page).getByLabel('Eigener Debugcode',{exact:true})).toHaveValue(source);await expect(region(page).getByLabel('Debugkonsole')).toHaveText('Noch keine Ausgabe.');
  await start(page);await go(page);await expect(region(page).getByLabel('Debugkonsole')).toHaveText('15');await page.getByRole('link',{name:'← Zurück zur Werkstatt',exact:true}).click();await expect(page.getByLabel('Lektion',{exact:true}).locator('option')).toHaveCount(167);
  await expect(page.locator('.pilot-status')).toHaveText('Gespeichert');const saved=await page.evaluate(async()=>{const directory=await(await navigator.storage.getDirectory()).getDirectoryHandle('azubiprep-frontendpilot-v1');const read=async name=>JSON.parse(await(await(await directory.getFileHandle(name)).getFile()).text());const head=await read('head.json');return read(head.slot+'.json');});expect(Object.keys(saved).some(key=>/debug|snapshot|frame/i.test(key))).toBe(false);expect(saved.jsDraft).toEqual({schema:1,name:'anders.js',source});
  expect(requests.filter(request=>request.phase==='debugging'&&(request.method!=='GET'||/\/api\/(ai|rag|theorie)/.test(request.path)||request.origin!=='http://127.0.0.1:3001'))).toEqual([]);
});

test('DB18: echter Browserzoom 200 %, Tastatur-Haltepunkte, Scope/Stack und erreichbarer Stop', async ({}, info) => {
  test.setTimeout(60000);const extension=info.outputPath('zoom-extension');fs.mkdirSync(extension,{recursive:true});fs.writeFileSync(path.join(extension,'manifest.json'),JSON.stringify({manifest_version:3,name:'Lokaler Abnahmezoom',version:'1.0',permissions:['tabs'],background:{service_worker:'background.js'}}));fs.writeFileSync(path.join(extension,'background.js'),'chrome.runtime.onInstalled.addListener(()=>{});');
  const context=await chromium.launchPersistentContext(info.outputPath('zoom-profil'),{channel:'chromium',headless:true,viewport:{width:1280,height:900},serviceWorkers:'block',args:['--disable-extensions-except='+extension,'--load-extension='+extension]});
  try{const worker=context.serviceWorkers()[0]||await context.waitForEvent('serviceworker');const page=await context.newPage();await page.bringToFront();await unterdrueckeOnboardingPopups(page);await page.goto('http://127.0.0.1:3001/frontendkurs');
    const zoom=await worker.evaluate(async url=>{const tabs=await chrome.tabs.query({});const tab=tabs.find(item=>item.url===url);await chrome.tabs.setZoom(tab.id,2);return chrome.tabs.getZoom(tab.id);},page.url());expect(zoom).toBe(2);expect(await page.evaluate(()=>innerWidth)).toBeLessThanOrEqual(650);
    await openDebugger(page);await region(page).getByLabel('Eigener Debugcode',{exact:true}).fill('function plus(n){\n let wert=n+1;\n return wert;\n}\nlet alter=plus(14);\nconsole.log(alter);');const begin=region(page).getByRole('button',{name:'Debuggen starten',exact:true});await begin.focus();await page.keyboard.press('Enter');await expect(status(page)).toContainText('Angehalten');
    const bp=region(page).getByRole('button',{name:'Debug-Haltepunkt Zeile 6 Spalte 1',exact:true});await bp.focus();await page.keyboard.press('Enter');await expect(bp).toHaveAttribute('aria-pressed','true');const over=region(page).getByRole('button',{name:'Funktion überspringen',exact:true});await over.focus();await page.keyboard.press('Enter');await expect(status(page)).toContainText(':6:1');const forward=region(page).getByRole('button',{name:'Weiter / bis zum nächsten Haltepunkt',exact:true});await forward.focus();await page.keyboard.press('Enter');await expect(region(page).getByLabel('Debugkonsole')).toHaveText('15');
    await begin.focus();await page.keyboard.press('Enter');await expect(status(page)).toContainText('Angehalten');const step=region(page).getByRole('button',{name:'Einzelner Schritt',exact:true});await step.focus();await page.keyboard.press('Enter');await expect(values(page)).toContainText('Funktion plus');const chain=region(page).getByRole('group',{name:'Debug-Aufrufkette'});const caller=chain.getByRole('button',{name:/^Programm/});await caller.focus();await page.keyboard.press('Enter');await expect(values(page)).toContainText('Ausgewählter Aufruf: Programm');const callee=chain.getByRole('button',{name:/^plus/});await callee.focus();await page.keyboard.press('Enter');await expect(values(page)).toContainText('Funktion plus');const chainSummary=chain.locator('..').locator(':scope > summary');await chainSummary.focus();await page.keyboard.press('Enter');await expect(chain).toBeHidden();await page.keyboard.press('Enter');await expect(chain).toBeVisible();
    const scope=values(page).locator('details > summary').first();await scope.focus();await page.keyboard.press('Enter');await expect(values(page).locator('details').first()).not.toHaveAttribute('open','');await page.keyboard.press('Enter');await expect(values(page).locator('details').first()).toHaveAttribute('open','');
    const out=region(page).getByRole('button',{name:'Funktion verlassen',exact:true});await out.focus();await page.keyboard.press('Enter');await expect(status(page)).toContainText(':6:1');
    const stop=region(page).getByRole('button',{name:'Debuggen stoppen',exact:true});await stop.scrollIntoViewIfNeeded();await stop.click({trial:true});await stop.focus();expect(await stop.evaluate(element=>parseFloat(getComputedStyle(element).outlineWidth))).toBeGreaterThanOrEqual(2);await page.keyboard.press('Enter');await expect(status(page)).toContainText('gestoppt');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.bringToFront();await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));const capture=await context.newCDPSession(page);const shot=await capture.send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false});fs.writeFileSync(info.outputPath('debugger-zoom-200.png'),Buffer.from(shot.data,'base64'));await capture.detach();
  }finally{await context.close();}
});
