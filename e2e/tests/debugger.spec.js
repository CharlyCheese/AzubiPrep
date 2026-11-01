import {test,expect,_electron} from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {compileDebugger} from '../../frontend/src/pilot/debugger-compiler.js';
import {DEBUG_LIMITS,debuggerLimits,installDebugger,debugSourceLines} from '../../frontend/src/pilot/debugger-core.js';
import {startDebugger} from '../../frontend/src/pilot/debugger.js';
import variant from '../../frontend/node_modules/@jitl/quickjs-singlefile-browser-release-sync/dist/index.mjs';
import {newQuickJSWASMModuleFromVariant} from '../../frontend/node_modules/quickjs-emscripten-core/dist/index.mjs';
import {unterdrueckeOnboardingPopups,openDebugger} from './helpers.js';
test.use({serviceWorkers:'block'});
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const draft=source=>({schema:1,name:'eigen.js',source});
const region=page=>page.getByRole('region',{name:'Debugger-Technikpilot',exact:true});
async function open(page,url='/frontendkurs'){await unterdrueckeOnboardingPopups(page);await page.goto(url);await openDebugger(page);await expect(region(page)).toBeVisible();}
async function fill(page,source){await region(page).getByRole('textbox',{name:'Eigener Debugcode',exact:true}).fill(source);}
async function start(page){await region(page).getByRole('button',{name:'Debuggen starten',exact:true}).click();}
async function paused(page){await expect(region(page).getByLabel('Debugstatus',{exact:true})).toContainText('Angehalten');}
const step=page=>region(page).getByRole('button',{name:'Einzelner Schritt',exact:true}).click();
const go=page=>region(page).getByRole('button',{name:'Weiter / bis zum nächsten Haltepunkt',exact:true}).click();
const values=page=>region(page).getByRole('region',{name:'Debugvariablen',exact:true});

async function rawRun(page,artifact,{limits={},tamper,duplicate=false}={}){
  const asset=fs.readdirSync(path.join(repo,'frontend/dist/assets')).find(name=>/^debugger\.worker-.*\.js$/.test(name));
  return page.evaluate(({artifact,asset,limits,tamper,duplicate})=>new Promise(resolve=>{
    if(tamper)artifact.code=tamper;
    const worker=new Worker('/assets/'+asset,{type:'module'});const events=[];let commandId=0;const timer=setTimeout(()=>{worker.terminate();resolve([{type:'test-timeout'}]);},14000);
    worker.onmessage=({data})=>{
      events.push(data);
      if(data.type==='paused'){
        worker.postMessage({type:'control',commandId:commandId+1,session:'FREMD',revision:'rev',pauseId:data.pauseId,mode:'continue'});
        worker.postMessage({type:'control',commandId:commandId+1,session:'test',revision:'rev',pauseId:data.pauseId-1,mode:'continue'});
        const next={type:'control',commandId:++commandId,session:'test',revision:'rev',pauseId:data.pauseId,mode:'step'};
        worker.postMessage(next);if(duplicate)worker.postMessage(next);
      }
      if(data.type==='done'||data.type==='error'){clearTimeout(timer);worker.terminate();resolve(events);}
    };
    worker.postMessage({type:'start',session:'test',revision:'rev',artifact,limits});
  }),{artifact,asset,limits,tamper,duplicate});
}

test('Eigener Code hält tatsächlich an; Lesepause verbraucht keine Laufzeit, Ausgaben genau einmal',async({page})=>{
  await open(page);await fill(page,'let alter = 15;\nconsole.log("vorher");\nif (alter < 18) {\n alter += 1;\n}\nconsole.log("nachher", alter);');
  await expect(region(page).getByLabel('Debugkonsole')).toHaveText('Noch keine Ausgabe.');await start(page);await paused(page);await expect(values(page)).toContainText('noch nicht initialisiert');await expect(region(page).getByLabel('Debugkonsole')).not.toContainText('vorher');
  await step(page);await paused(page);await expect(values(page).locator('tbody tr').filter({hasText:'alter'})).toContainText('15');
  await new Promise(resolve=>setTimeout(resolve,1300));await expect(region(page).getByLabel('Debugstatus')).toContainText('Angehalten');
  await go(page);await expect(region(page).getByLabel('Debugstatus')).toContainText('Programm ist beendet');await expect(region(page).getByLabel('Debugkonsole')).toHaveText('vorher\nnachher 16');await expect(values(page)).toContainText('16');
  await fill(page,'let alter = 22;\nconsole.log(alter);');await start(page);await paused(page);await go(page);await expect(region(page).getByLabel('Debugkonsole')).toHaveText('22');
});

test('Haltepunkt, Quellspalte, Blockscope und Shadowing zeigen echte aktuelle Werte',async({page})=>{
  await open(page);await fill(page,'let x = 1;\n{\n let x = 2;\n console.log(x);\n}\nconsole.log(x);');await start(page);await paused(page);
  await region(page).getByRole('button',{name:'Debug-Haltepunkt Zeile 4 Spalte 2',exact:true}).click();await go(page);await paused(page);await expect(region(page).getByLabel('Debugstatus')).toContainText('uebung.js:4:2');
  const scopes=values(page).locator('details');await expect(scopes).toHaveCount(2);await expect(scopes.nth(0)).toContainText('1');await expect(scopes.nth(1)).toContainText('2');await expect(region(page).getByLabel('Debugkonsole')).toHaveText('Noch keine Ausgabe.');await go(page);await expect(region(page).getByLabel('Debugkonsole')).toHaveText('2\n1');await expect(values(page).locator('details')).toHaveCount(1);
});

test('Gültige spätere Syntax und dynamische Umgehungen werden vor Ausführung verständlich abgewiesen',async({page})=>{
  await open(page);
  for(const source of ['console.log("NICHT");const f=async()=>1;','const f=eval;f("1");','console.log.constructor("return 1")();','console["log"]("NICHT");','globalThis["eval"]("1");','__azubi_dbg_checkpoint(0,[]);','let __azubi_dbg_scope_0=3;','const p={get value(){console.log("NICHT");}};','new Proxy({},{});']){
    await fill(page,source);await start(page);await expect(region(page).getByLabel('Debugfehler')).toContainText('noch nicht unterstützt');await expect(region(page).getByLabel('Debugkonsole')).not.toContainText('NICHT');
  }
  await fill(page,'const = ;');await start(page);await expect(region(page).getByLabel('Debugfehler')).toContainText('Syntaxfehler');
});

test('Quelländerung, Stop und Schließen verwerfen die pausierte Sitzung; keine Debugwerte in Sicherung',async({page})=>{
  await open(page);await fill(page,'let geheim = "SYNTHETISCHER_WERT";\nconsole.log(geheim);');await start(page);await paused(page);await step(page);await paused(page);await expect(values(page)).toContainText('SYNTHETISCHER_WERT');
  await region(page).getByRole('button',{name:'Debuggen stoppen',exact:true}).click();await expect(region(page).getByRole('button',{name:'Einzelner Schritt',exact:true})).toBeDisabled();
  await start(page);await paused(page);await fill(page,'let neu = 99;');await expect(region(page).getByLabel('Debugstatus')).toContainText('Quellstand bereit');await expect(values(page)).toContainText('Noch kein Halt');
  await start(page);await paused(page);await page.locator('.js-debug-pilot > summary').click();await page.locator('.js-debug-pilot > summary').click();await expect(region(page).getByLabel('Debugstatus')).toContainText('Ausführung beendet');
  const state=await page.evaluate(async()=>{await new Promise(r=>setTimeout(r,650));const directory=await (await navigator.storage.getDirectory()).getDirectoryHandle('azubiprep-frontendpilot-v1');const read=async name=>JSON.parse(await(await(await directory.getFileHandle(name)).getFile()).text());const head=await read('head.json');return read(head.slot+'.json');});
  expect(Object.keys(state).some(key=>/debug|snapshot|scope/i.test(key))).toBe(false);expect(state.jsDraft.source).toBe('let neu = 99;');
});

test('Primitive Sonderwerte und HTML-artige Strings bleiben passiv',async({page})=>{
  await open(page);await fill(page,'let a; let b = null; let c = -0; let d = NaN; let e = Infinity; let text = "<img src=x onerror=alert(1)>";');await start(page);await paused(page);await go(page);await expect(region(page).getByLabel('Debugstatus')).toContainText('Programm ist beendet');await expect(values(page)).toContainText('undefined');await expect(values(page)).toContainText('null');await expect(values(page)).toContainText('-0');await expect(values(page)).toContainText('NaN');await expect(values(page)).toContainText('Infinity');await expect(values(page).locator('img')).toHaveCount(0);
});

test('Keine automatische Ausführung; pro Sitzung nur ein Ausführungsworker und vollständiges externes Beenden',async({page})=>{
  await page.addInitScript(()=>{const Native=window.Worker;window.__debugWorkers={created:0,active:0};window.Worker=class extends Native{constructor(...args){super(...args);this.__counted=true;window.__debugWorkers.created++;window.__debugWorkers.active++;}terminate(){if(this.__counted){this.__counted=false;window.__debugWorkers.active--;}super.terminate();}};});
  await open(page);await fill(page,'let x=1;console.log(x);');expect(await page.evaluate(()=>window.__debugWorkers)).toEqual({created:0,active:0});
  await start(page);await paused(page);expect((await page.evaluate(()=>window.__debugWorkers)).active).toBe(1);await region(page).getByRole('button',{name:'Debuggen stoppen',exact:true}).click();expect((await page.evaluate(()=>window.__debugWorkers)).active).toBe(0);
  await start(page);await paused(page);await go(page);await expect(region(page).getByLabel('Debugstatus')).toContainText('Programm ist beendet');expect((await page.evaluate(()=>window.__debugWorkers)).active).toBe(0);
});

test('VM besitzt keine Host-/Netzrechte; unabhängige aktive Zeit-/Heap-/WASM-Grenzen',async({page})=>{
  test.setTimeout(60000);await open(page);const artifact=compileDebugger(draft('let x = 1;'));
  const rights=await rawRun(page,artifact,{tamper:'console.log(typeof process,typeof fetch,typeof window,typeof require,typeof self);'});expect(rights.filter(e=>e.type==='log').map(e=>e.text)).toEqual(['undefined undefined undefined undefined undefined']);
  const time=await rawRun(page,artifact,{tamper:'while(true){}',limits:{activeMs:30}});expect(time.at(-1).type).toBe('error');expect(time.at(-1).text).toContain('Zeitgrenze');
  const heap=await rawRun(page,artifact,{tamper:'let a=[];while(true)a.push("x".repeat(10000));'});expect(heap.at(-1).type).toBe('error');
  const fresh=await rawRun(page,artifact);expect(fresh.at(-1).type).toBe('done');const memory=fresh.find(e=>e.type==='memory');expect(memory.bytes).toBe(16777216);expect(memory.maximum).toBe(33554432);
});

test('Doppelte und alte Resume-Kommandos überspringen keine Pause',async({page})=>{
  await open(page);const artifact=compileDebugger(draft('let x=1;\nx++;\nconsole.log(x);'));const events=await rawRun(page,artifact,{duplicate:true});expect(events.at(-1).type).toBe('done');expect(events.filter(e=>e.type==='paused').map(e=>e.point)).toEqual([0,1,2]);expect(events.filter(e=>e.type==='log').map(e=>e.text)).toEqual(['2']);
});

test('Ressourcencaps sind reduzierbar, nicht vergrößerbar und greifen im echten Worker',async({page})=>{
  await open(page);const artifact=compileDebugger(draft('let a=1; a++; console.log(a);'));
  for(const limits of [{checkpointHits:2},{pauses:1},{messages:2},{protocolBytes:100},{snapshotBytes:10},{logLines:1}]){
    const data={...artifact,code:limits.logLines?'console.log("a");console.log("b");'+artifact.code:artifact.code};
    const events=await rawRun(page,data,{limits});expect(events.at(-1).type).toBe('error');
  }
  expect(()=>debuggerLimits({activeMs:DEBUG_LIMITS.activeMs+1})).toThrow();
});

test('Mobile Tastaturbedienung und Fokus, keine horizontale Überbreite',async({page},info)=>{
  await page.setViewportSize({width:390,height:844});await open(page);await fill(page,'let alter = 15;\nif(alter < 18) {\n alter++;\n}\nconsole.log(alter);');const button=region(page).getByRole('button',{name:'Debuggen starten',exact:true});await button.focus();await page.keyboard.press('Enter');await paused(page);const next=region(page).getByRole('button',{name:'Einzelner Schritt',exact:true});await next.focus();await page.keyboard.press('Enter');await paused(page);await expect(next).toBeFocused();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await region(page).screenshot({path:info.outputPath('debugger-mobil.png')});
});

test('Compilergrenzen und semantische Differentialfälle inklusive Script-Completion',async()=>{
  for(const [source,limit] of [['let a=1;', {astNodes:1}],['let a=1;', {astDepth:1}],['let a=1;', {generatedBytes:1}],['let a=1;let b=2;', {points:1}],['let a=1;', {sourceBytes:1}],['\n\n',{sourceLines:1}]])expect(()=>compileDebugger(draft(source),limit)).toThrow();
  const quick=await newQuickJSWASMModuleFromVariant(variant);
  for(const source of ['let alter=15; if(alter<18){alter++;} console.log(alter);','let x=1;{let x=2;console.log(x);}console.log(x);','"use strict";let x=1\nx += 2\nconsole.log(x);','let x=0; if(++x===1){console.log("einmal");}console.log(x);','let a;console.log(a,null,-0,NaN,Infinity);','3; let x=1;','3;if(false){console.log("nein");}','let a=1; a++; a;','console.log("// if {} /* kein Code */");','let a=1,b=a+1; console.log(a,b);','console.log("'+ 'l'.repeat(200)+'");','null;','false;','-0;','"Abschluss";']){
    const compiled=compileDebugger(draft(source));const results=[];
    for(const instrumented of [false,true]){
      const runtime=quick.newRuntime();runtime.setMemoryLimit(DEBUG_LIMITS.heapBytes);runtime.setMaxStackSize(DEBUG_LIMITS.stackBytes);const vm=runtime.newContext();
      let boot=vm.evalCode('var __logs=[];var __snapshots=[];globalThis.console={log:(...args)=>{__logs.push(args.map(x=>String(x)).join(" "));}};');boot.value.dispose();
      if(instrumented){boot=vm.evalCode('('+installDebugger.toString()+')((text)=>{__snapshots.push(text);},(text)=>{__logs.push(text);},'+JSON.stringify(DEBUG_LIMITS)+')');vm.setProp(vm.global,compiled.helper,boot.value);boot.value.dispose();}
      const result=vm.evalCode(instrumented?compiled.code:source,'probe.js');expect(result.error).toBeUndefined();const value=vm.dump(result.value);result.value.dispose();const log=vm.evalCode('JSON.stringify(__logs)');const logs=vm.getString(log.value);log.value.dispose();results.push({value,logs});vm.dispose();runtime.dispose();
    }
    expect(results[1]).toEqual(results[0]);
  }
});

test('D0-Compilergrenzen stimmen unter/auf/über Caps; alle JavaScript-Zeilentrenner erhalten Originalpositionen',async()=>{
  const source='let x=1;\nx++;';const result=compileDebugger(draft(source));
  for(const [key,value] of [['sourceBytes',new TextEncoder().encode(source).length],['sourceLines',2],['astNodes',result.stats.nodes],['astDepth',result.stats.maxDepth],['generatedBytes',result.stats.generatedBytes],['points',result.points.length]]){
    expect(()=>compileDebugger(draft(source),{[key]:value-1})).toThrow();expect(()=>compileDebugger(draft(source),{[key]:value})).not.toThrow();expect(()=>compileDebugger(draft(source),{[key]:value+1})).not.toThrow();
  }
  for(const separator of ['\r','\n','\r\n','\u2028','\u2029']){const code='let x=1;'+separator+'x++;';expect(debugSourceLines(code)).toHaveLength(2);expect(()=>compileDebugger(draft(code),{sourceLines:1})).toThrow('Zeilengrenze');expect(compileDebugger(draft(code)).points[1].line).toBe(2);}
  expect(()=>compileDebugger(draft('let '+ 'x'.repeat(128)+'=1;'))).not.toThrow();expect(()=>compileDebugger(draft('let '+ 'x'.repeat(129)+'=1;'))).toThrow();
});

test('Unicode-Zeilentrenner haben sichtbare Haltepunkte auf der richtigen Zeile',async({page})=>{
  await open(page);await fill(page,'let x=1;\u2028console.log(x);');await start(page);await paused(page);await expect(region(page).getByRole('button',{name:'Debug-Haltepunkt Zeile 2 Spalte 1',exact:true})).toBeVisible();await step(page);await expect(region(page).getByLabel('Debugstatus')).toContainText(':2:1');
});

test('Controller begrenzt Befehle auf einen Inflight und ein zusammengefasstes Intent; Dispose in prepared startet keinen Worker',async()=>{
  const original=globalThis.Worker;const workers=[];
  class FakeWorker{constructor(){this.messages=[];workers.push(this);}postMessage(data){this.messages.push(data);this.sent=data;}terminate(){this.terminated=true;}}
  globalThis.Worker=FakeWorker;
  try{
    let run=startDebugger(draft('let x=1;console.log(x);'),event=>{if(event.type==='prepared')run.dispose();});
    workers[0].onmessage({data:{type:'compiled',artifact:compileDebugger(draft('let x=1;console.log(x);'))}});expect(workers).toHaveLength(1);expect(workers[0].terminated).toBe(true);
    workers.length=0;const events=[];run=startDebugger(draft('let x=1;console.log(x);'),event=>events.push(event));workers[0].onmessage({data:{type:'compiled',artifact:compileDebugger(draft('let x=1;console.log(x);'))}});
    const worker=workers[1],data=worker.sent,scope=data.artifact.points[0].scopes[0];
    const base={session:data.session,revision:data.revision};worker.onmessage({data:{...base,type:'running',seq:1,remaining:1000}});
    worker.onmessage({data:{...base,type:'paused',seq:2,pauseId:1,remaining:999,snapshot:{point:0,frames:[{id:0,functionId:0,point:0,scopes:[{id:scope.id,values:[{name:'x',type:'uninitialized',display:'noch nicht initialisiert'}]}]}],scopes:[{id:scope.id,values:[{name:'x',type:'uninitialized',display:'noch nicht initialisiert'}]}],truncated:false}}});
    for(let i=0;i<100;i++)expect(run.breakpoints([i%2])).toBe(true);
    expect(worker.messages).toHaveLength(2);expect(run.resume('continue')).toBe(true);expect(run.resume('step')).toBe(false);
    worker.onmessage({data:{...base,type:'ack',seq:3,commandId:1}});expect(worker.messages).toHaveLength(3);expect(worker.sent.ids).toEqual([1]);expect(worker.sent.mode).toBe('continue');
    worker.onmessage({data:{...base,type:'ack',seq:4,commandId:2}});expect(worker.messages).toHaveLength(3);run.dispose();expect(workers.every(w=>w.terminated)).toBe(true);
  }finally{globalThis.Worker=original;}
});

test('Controller beendet Vorbereitung, Start und unbediente Pause extern',async()=>{
  const original=globalThis.Worker;const workers=[];
  class FakeWorker{constructor(url){this.url=url;workers.push(this);}postMessage(data){this.sent=data;}terminate(){this.terminated=true;}}
  globalThis.Worker=FakeWorker;
  try{
    for(const stage of ['prepare','start','pause']){
      workers.length=0;const events=[];const run=startDebugger(draft('let x=1;'),event=>events.push(event),{prepareMs:50,startupMs:50,idleMs:50});
      if(stage!=='prepare'){
        workers[0].onmessage({data:{type:'compiled',artifact:compileDebugger(draft('let x=1;'))}});
        if(stage==='pause'){const worker=workers[1];const data=worker.sent;const point=data.artifact.points[0];const snapshot={point:0,frames:[{id:0,functionId:0,point:0,scopes:[{id:point.scopes[0].id,values:[{name:'x',type:'uninitialized',display:'noch nicht initialisiert'}]}]}],scopes:[{id:point.scopes[0].id,values:[{name:'x',type:'uninitialized',display:'noch nicht initialisiert'}]}],truncated:false};worker.onmessage({data:{type:'running',session:data.session,revision:data.revision,seq:1,remaining:1000}});worker.onmessage({data:{type:'paused',session:data.session,revision:data.revision,seq:2,pauseId:1,remaining:1000,snapshot}});}
      }
      await new Promise(resolve=>setTimeout(resolve,85));expect(events.at(-1).type).toBe('error');expect(workers.every(worker=>worker.terminated)).toBe(true);run.dispose();
    }
  }finally{globalThis.Worker=original;}
});

test('Electron: echten Halt fortsetzen, Stop und vollständigen Neustart ohne pausierte VM @desktop',async({},info)=>{
  test.skip(process.platform!=='win32','Windows-Electron');test.setTimeout(90000);let app;const profile=info.outputPath('profil');const env={...process.env,DATABASE_URL:'',AZUBIPREP_AI_DIR:path.join(profile,'ki'),AZUBIPREP_RAG_DIR:path.join(profile,'rag')};delete env.ELECTRON_RUN_AS_NODE;
  const options={executablePath:path.join(repo,'desktop/node_modules/electron/dist/electron.exe'),args:[path.join(repo,'desktop'),`--user-data-dir=${profile}`],env};
  try{app=await _electron.launch(options);let page=await app.firstWindow();await page.waitForURL(/^http:/);await open(page,new URL(page.url()).origin+'/frontendkurs');await fill(page,'let alter=15;\nconsole.log(alter+1);');await start(page);await paused(page);await go(page);await expect(region(page).getByLabel('Debugkonsole')).toHaveText('16');await start(page);await paused(page);await expect(page.locator('.pilot-status')).toHaveText('Gespeichert');await app.close();app=null;
    app=await _electron.launch(options);page=await app.firstWindow();await page.waitForURL(/^http:/);await open(page,new URL(page.url()).origin+'/frontendkurs');await expect(region(page).getByLabel('Debugstatus')).toContainText('Quellstand bereit');await expect(values(page)).toContainText('Noch kein Halt');await start(page);await paused(page);await region(page).getByRole('button',{name:'Debuggen stoppen',exact:true}).click();await expect(region(page).getByLabel('Debugstatus')).toContainText('gestoppt');
  }finally{if(app)await app.close();}
});

