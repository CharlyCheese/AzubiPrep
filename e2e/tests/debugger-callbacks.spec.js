import { test, expect, _electron } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileDebugger } from '../../frontend/src/pilot/debugger-compiler.js';
import { DEBUG_LIMITS, installDebugger, validateDebugSnapshot } from '../../frontend/src/pilot/debugger-core.js';
import variant from '../../frontend/node_modules/@jitl/quickjs-singlefile-browser-release-sync/dist/index.mjs';
import { newQuickJSWASMModuleFromVariant } from '../../frontend/node_modules/quickjs-emscripten-core/dist/index.mjs';
import { unterdrueckeOnboardingPopups, openDebugger } from './helpers.js';

test.use({ serviceWorkers: 'block' });
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const draft=source=>({schema:1,name:'callbacks.js',source});
const region=page=>page.getByRole('region',{name:'Debugger-Technikpilot',exact:true});
const status=page=>region(page).getByLabel('Debugstatus',{exact:true});
const values=page=>region(page).getByRole('region',{name:'Debugvariablen',exact:true});
const click=(page,name)=>region(page).getByRole('button',{name,exact:true}).click();
const go=page=>click(page,'Weiter / bis zum nächsten Haltepunkt');
async function open(page,source,url='/frontendkurs'){await unterdrueckeOnboardingPopups(page);await page.goto(url);await openDebugger(page);await region(page).getByLabel('Eigener Debugcode',{exact:true}).fill(source);}
async function start(page){await click(page,'Debuggen starten');await expect(status(page)).toContainText('Angehalten');}
async function breakpoint(page,source,line,kind='statement'){const point=compileDebugger(draft(source)).points.find(item=>item.line===line&&item.kind===kind);expect(point).toBeTruthy();await click(page,`Debug-Haltepunkt Zeile ${point.line} Spalte ${point.column}`);}
const example='const zahlen=[1,2,3];\nlet faktor=2;\nconst doppelt=zahlen.map((zahl,index)=>{\n const wert=zahl*faktor;\n console.log(index,wert);\n return wert;\n});\nconst auswahl=doppelt.filter(wert=>wert>=4);\nconsole.log(auswahl.join(","));';

test('Echte native map/filter-Callbacks halten pro Element an und setzen ohne wiederholte Ausgabe fort',async({page})=>{
  await open(page,example);await start(page);await breakpoint(page,example,4);
  for(const n of [1,2,3]){await go(page);await expect(status(page)).toContainText(':4:');await expect(values(page).locator('tbody tr').filter({hasText:new RegExp('^zahlnumber'+n+'$')})).toHaveCount(1);await expect(values(page)).toContainText('noch nicht initialisiert');await expect(region(page).getByRole('group',{name:'Debug-Aufrufkette'}).getByRole('button')).toHaveCount(2);await expect(region(page).getByLabel('Debugkonsole')).toHaveText(n===1?'Noch keine Ausgabe.':n===2?'0 2':'0 2\n1 4');}
  await go(page);await expect(status(page)).toContainText('Programm ist beendet');await expect(region(page).getByLabel('Debugkonsole')).toHaveText('0 2\n1 4\n2 6\n4,6');
});

test('Benannter Callback: Über/Aus, expliziter Haltepunkt und Parameter derselben Ausführung',async({page})=>{
  const source='function doppelt(n){\n return n*2;\n}\nconst werte=[1,2].map(doppelt);\nconsole.log(werte.join("-"));';
  await open(page,source);await start(page);await click(page,'Funktion überspringen');await expect(status(page)).toContainText(':5:');await go(page);await expect(region(page).getByLabel('Debugkonsole')).toHaveText('2-4');
  await start(page);await breakpoint(page,source,2,'return');await click(page,'Funktion überspringen');await expect(status(page)).toContainText(':2:');await expect(status(page)).toContainText('Haltepunkt');await expect(values(page).locator('tbody tr').filter({hasText:/^nnumber1$/})).toHaveCount(1);await breakpoint(page,source,2,'return');await click(page,'Funktion verlassen');await expect(status(page)).toContainText(':5:');await go(page);await expect(region(page).getByLabel('Debugkonsole')).toHaveText('2-4');
});

async function raw(page,source,limits={},mode='continue',tamper=null){
  const artifact=compileDebugger(draft(source)),asset=fs.readdirSync(path.join(repo,'frontend/dist/assets')).find(name=>/^debugger\.worker-.*\.js$/.test(name));
  return page.evaluate(({artifact,asset,limits,mode,tamper})=>new Promise(resolve=>{if(tamper)artifact.code=tamper;const worker=new Worker('/assets/'+asset,{type:'module'}),events=[];let commandId=0;const timer=setTimeout(()=>{worker.terminate();resolve([{type:'timeout'}]);},14000);worker.onmessage=({data})=>{events.push(data);if(data.type==='paused')worker.postMessage({type:'control',session:'test',revision:'rev',commandId:++commandId,pauseId:data.pauseId,mode});if(data.type==='done'||data.type==='error'){clearTimeout(timer);worker.terminate();resolve(events);}};worker.postMessage({type:'start',session:'test',revision:'rev',artifact,limits});}),{artifact,asset,limits,mode,tamper});
}

test('Captures in Schleifenheadern und verschachtelten Callbacks zeigen aktuelle lexikalische Werte',async({page})=>{
  await open(page,'let x=1;');const source='for(let i=0;[1].some(n=>n>i);i++){let alt=i;}';const artifact=compileDebugger(draft(source));const events=await raw(page,source,{},'step');expect(events.at(-1).type).toBe('done');const entries=events.filter(event=>event.type==='paused'&&artifact.points[event.point].kind==='entry');expect(entries).toHaveLength(2);
  for(const [index,event] of entries.entries()){const caller=event.snapshot.frames[0],callee=event.snapshot.frames.at(-1);expect(artifact.points[caller.point].kind).toBe('context');for(const frame of [caller,callee]){const bindings=frame.scopes.flatMap(scope=>scope.values);expect(bindings.find(item=>item.name==='i').display).toBe(String(index));expect(bindings.some(item=>item.name==='alt')).toBe(false);}}
  const nested='let result=[1].map(x=>[2].map(y=>x+y));console.log(result[0][0]);';const nestedEvents=await raw(page,nested,{},'step');expect(nestedEvents.at(-1).type).toBe('done');expect(nestedEvents.some(event=>event.snapshot?.frames.length===3)).toBe(true);expect(nestedEvents.filter(event=>event.type==='log').map(event=>event.text)).toEqual(['3']);
});

test('Positivliste verhindert spätere Syntax und Ausführung uninstrumentierter Funktionen',async({page})=>{
  for(const source of [
    'console.log("NICHT");[1].map(n=>eval("1"));','[1].map(n=>n.constructor);','[1].map(n=>__azubi_dbg_checkpoint(0,[]));',
    '[1].map(async n=>n);','[1].map(function benannt(n){return n;});','[1].map((n=1)=>n);','[1].map((...n)=>n);','[1].map(({x})=>x);',
    '[1]["map"](n=>n);','[1].map(console.log);',
    '[1].map(n=>this);','[1].map(function(n){return arguments;});','[1].map(n=>{function f(){return n;}return f();});',
  ])expect(()=>compileDebugger(draft(source)),source).toThrow('noch nicht unterstützt');
  await open(page,'let x=1;');const events=await raw(page,'let x=1;',{},'continue','__azubi_dbg_checkpoint.callbackMethod(0,[],[1],"map")((n)=>n);');expect(events.at(-1).type).toBe('error');
});

async function evaluate(quick,source,compiled=null){
  const runtime=quick.newRuntime();runtime.setMemoryLimit(DEBUG_LIMITS.heapBytes);runtime.setMaxStackSize(DEBUG_LIMITS.stackBytes);const vm=runtime.newContext();let boot=vm.evalCode('var __logs=[],__snapshots=[];var __testString=String,__testStringify=JSON.stringify;globalThis.console={log:(...args)=>{__logs.push(args.map(x=>x===null?"null":["number","string","boolean","undefined"].includes(typeof x)?__testString(x):"[Nicht inspiziert]").join(" "));}};');boot.value.dispose();
  if(compiled){boot=vm.evalCode('('+installDebugger.toString()+')((text)=>__snapshots.push(text),(text)=>{__logs.push(text);},'+JSON.stringify(DEBUG_LIMITS)+')');vm.setProp(vm.global,compiled.helper,boot.value);boot.value.dispose();}
  const result=vm.evalCode(compiled?compiled.code:source,'callbacks.js');let error=null,value;if(result.error){const name=vm.getProp(result.error,'name');error=vm.getString(name);name.dispose();result.error.dispose();}else{value=vm.dump(result.value);result.value.dispose();}
  const data=vm.evalCode('__testStringify({logs:__logs,snapshots:__snapshots})'),parsed=JSON.parse(vm.getString(data.value));data.value.dispose();if(compiled)for(const text of parsed.snapshots){const snapshot=JSON.parse(text);expect(validateDebugSnapshot(snapshot,compiled.points[snapshot.point],DEBUG_LIMITS,compiled),source).toBe(true);}vm.dispose();runtime.dispose();return{error,value,logs:parsed.logs};
}

test('Differential: Rückgaben, Captures/Shadowing/TDZ, sparse Arrays, Reduce, Short-Circuit und Mutation',async()=>{
  const quick=await newQuickJSWASMModuleFromVariant(variant);
  for(const source of [
    example,'function f(n){return n*2;}console.log([1,2].map(f).join());',
    'console.log([1,2].map(n=>n*2).join());','console.log([1,2].map(function(n){return n*2;}).join());',
    'let total=0;[1,2].forEach(n=>{total+=n;});console.log(total);',
    'console.log([1,2,3].filter(n=>n>1).join());',
    'let n=0;console.log([1,2,3].some(x=>{n++;return x===2;}),n);',
    'let n=0;console.log([1,2,3].every(x=>{n++;return x<2;}),n);',
    'let n=0;console.log([1,2,3].find(x=>{n++;return x===2;}),n);',
    'console.log([1,2,3].reduce((sum,n)=>sum+n,0));','console.log([1,2,3].reduce((sum,n)=>sum+n));','[].reduce((a,b)=>a+b);',
    'let total=0;let a=[];a.length=3;console.log(a.map(n=>++total).length,a.filter(n=>++total).length,a.some(n=>++total),a.every(n=>++total),a.find(n=>{total++;return false;}),total);',
    'let a=[1,2];console.log(a.map((n,i,arr)=>arr===a?n+i:0).join());',
    'let a=[1,2];console.log(a.map((n,i)=>{if(i===0)a.push(3);return n;}).join(),a.join());',
    'function f(faktor){return [1,2].map(n=>{faktor++;return n*faktor;});}console.log(f(2).join());',
    'let x=10;console.log([1].map(x=>{let y=x+1;return y;}).join(),x);',
    'console.log([1,2].map(x=>[3].map(y=>x+y)[0]).join());',
    'for(let i=0;[1].some(n=>n>i);i++){let alt=i;}console.log("fertig");',
    'for(const x of [1,2]){console.log([3].map(y=>x+y).join());}',
    'let a=[1];let alt=a;function start(){a=[9];return 0;}console.log(alt.map((n)=>n,start()).join(),a.join());',
    'let a=[1];function basis(){console.log("basis");return a;}function arg(){console.log("arg");return 1;}console.log(basis().map(n=>n,arg()).join());',
    'console.log([1,2].map(n=>({wert:n})).filter(p=>p.wert>1).map(p=>p.wert).join());',
    'let Array=0;let WeakSet=0;let Object=0;let Reflect=0;let TypeError=0;console.log([1].map(n=>n+1).join());',
    '"use strict";console.log([1].map(function(n){"use strict";return n+1;}).join());',
    'console.log([1].map(n=>{return\n n+1;}).join());','[1].map(n=>{const x=1;return x++;});',
    'let a=[{x:1},{x:2}];console.log(a.reduce((sum,p)=>sum+p.x,0));',
    'let x=[1].map(n=>z);let z=2;', '"use strict";function f(){return 1;}',
  ])expect(await evaluate(quick,source,compileDebugger(draft(source))),source).toEqual(await evaluate(quick,source));
});

test('Callbackbudgets, Stop/Quelländerung und frischer Lauf bleiben wirksam',async({page})=>{
  await open(page,'let x=1;');const limited=await raw(page,'[1,2,3].map(n=>n+1);',{pauses:2},'step');expect(limited.at(-1).type).toBe('error');
  const source='const a=[1,2].map(n=>{\n console.log(n);\n return n+1;\n});';await region(page).getByLabel('Eigener Debugcode',{exact:true}).fill(source);await start(page);await breakpoint(page,source,2);await go(page);await expect(status(page)).toContainText(':2:');await expect(values(page)).toContainText('Callback');await click(page,'Debuggen stoppen');await expect(status(page)).toContainText('gestoppt');await expect(region(page).getByLabel('Debugkonsole')).toHaveText('Noch keine Ausgabe.');
  await start(page);await breakpoint(page,source,2);await go(page);await region(page).getByLabel('Eigener Debugcode',{exact:true}).fill('console.log([1].map(n=>n+2).join());');await expect(values(page)).toContainText('Noch kein Halt');await start(page);await go(page);await expect(region(page).getByLabel('Debugkonsole')).toHaveText('3');
});

test('Electron: Callback-Parameter anhalten, danach gleiche native Ausführung und Neustart @desktop',async({},info)=>{
  test.skip(process.platform!=='win32','Windows-Electron');test.setTimeout(90000);const profile=info.outputPath('profil'),env={...process.env,DATABASE_URL:'',AZUBIPREP_AI_DIR:path.join(profile,'ki'),AZUBIPREP_RAG_DIR:path.join(profile,'rag')};delete env.ELECTRON_RUN_AS_NODE;const options={executablePath:path.join(repo,'desktop/node_modules/electron/dist/electron.exe'),args:[path.join(repo,'desktop'),`--user-data-dir=${profile}`],env};let app;
  try{app=await _electron.launch(options);let page=await app.firstWindow();await page.waitForURL(/^http:/);await open(page,example,new URL(page.url()).origin+'/frontendkurs');await start(page);await breakpoint(page,example,4);await go(page);await expect(values(page)).toContainText('Callback');await breakpoint(page,example,4);await go(page);await expect(region(page).getByLabel('Debugkonsole')).toHaveText('0 2\n1 4\n2 6\n4,6');await expect(page.locator('.pilot-status')).toHaveText('Gespeichert');await app.close();app=null;
    app=await _electron.launch(options);page=await app.firstWindow();await page.waitForURL(/^http:/);await unterdrueckeOnboardingPopups(page);await page.goto(new URL(page.url()).origin+'/frontendkurs');await openDebugger(page);await expect(values(page)).toContainText('Noch kein Halt');await expect(region(page).getByLabel('Eigener Debugcode',{exact:true})).toHaveValue(example);
  }finally{if(app)await app.close();}
});
