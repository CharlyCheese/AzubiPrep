import { REACT_LIMITS, installDebugReactEnvironment, installDebugReact } from './debugger-react.js';
import { FETCH_LIMITS, installDebugFetch } from './debugger-fetch.js';
import variant from '@jitl/quickjs-singlefile-browser-release-asyncify';
import { newQuickJSAsyncWASMModuleFromVariant, newVariant } from 'quickjs-emscripten-core';
import { debuggerLimits, encodedSize, validDebugId, validateDebugArtifact, validateDebugSnapshot, installDebugger } from './debugger-core.js';
import { resolveDebugImport } from './debugger-project.js';
import { DOM_LIMITS, DOM_TAGS, installDebugDOM, validDOMTree, validDOMEvent } from './debugger-dom.js';
import { STORAGE_LIMITS, installDebugStorage, validStorageSnapshot } from './debugger-storage.js';
import { JSON_LIMITS, installDebugJSON } from './debugger-json.js';
import { TIMER_LIMITS, createDebugTimerQueue, installDebugTimers } from './debugger-timers.js';
import { PROMISE_LIMITS, installDebugPromises } from './debugger-promises.js';
import { createAsyncJobRunner } from './debugger-jobs.js';

let state='fresh',session,revision,limits,artifact,vm,runtime,memory;
let seq=0,bytes=0,hits=0,pauses=0,pauseId=0,logs=0,logChars=0;
let remaining=0,started=null,release=null,lastMode='step',first=true,reason='';
let breakpoints=new Set();
let currentPoint=null;
let lastCommand=0,messageCount=0;
let pausedDepth=1,stepDepth=1;
let eventRun=false,timerRun=false,timerQueue=null;
let promiseRun=false,executeJob=null,jobs=0;
const promiseHandles=[],handledPromises=new Set();
async function drainJobs(){
  if(!artifact.dom){if(runtime.hasPendingJob())throw new Error('Asynchrone Modulaufgaben sind hier nicht unterstützt.');return;}
  while(runtime.hasPendingJob()){
    if(++jobs>PROMISE_LIMITS.jobs)throw new Error('Promise-Jobgrenze erreicht.');
    const prep=await vm.evalCodeAsync(artifact.helper+'.prepareJob('+artifact.dom.eventPoint+');','promise-vorbereitung.js');
    if(prep.error){prep.error.dispose();throw new Error(reason||'Promise-Aufrufkette ungültig.');}prep.value.dispose();
    promiseRun=true;first=true;lastMode='continue';
    await executeJob();
    if(reason)throw new Error(reason);
    promiseRun=false;
  }
  for(let id=0;id<promiseHandles.length;id++)if(!handledPromises.has(id)){
    const result=vm.getPromiseState(promiseHandles[id]);
    if(result.type==='rejected'){result.error.dispose();throw new Error('Unbehandelte Promise-Ablehnung. Ergänze einen catch-Handler.');}
    if(result.type==='fulfilled')result.value.dispose();
  }
}
async function settle(){
  if(!artifact.react){await drainJobs();return;}
  for(let cycle=0;cycle<REACT_LIMITS.flushCycles;cycle++){
    const result=await vm.evalCodeAsync(artifact.helper+'.flushReact();','react-fortsetzung.js');
    if(result.error){result.error.dispose();throw new Error(reason||'React-Fortsetzung fehlgeschlagen.');}
    const flushed=vm.getNumber(result.value);result.value.dispose();
    const pending=runtime.hasPendingJob();await drainJobs();
    if(!flushed&&!pending){
      const published=await vm.evalCodeAsync(artifact.helper+'.publishReact();','react-vorschau.js');
      if(published.error){published.error.dispose();throw new Error(reason||'React-Vorschau fehlgeschlagen.');}published.value.dispose();return;
    }
  }
  throw new Error('React-Fortsetzungsgrenze erreicht.');
}
function idle(){state='idle';send('idle',{remaining,timers:timerQueue.snapshot(),wake:timerQueue.wakeSnapshot(),requests:timerQueue.requestSnapshot()});}
function consume(){if(started!==null){remaining-=performance.now()-started;started=null;}if(remaining<=0){reason='Aktive Zeitgrenze erreicht.';throw new Error(reason);}}
function send(type,body={}){
  const data={...body,type,session,revision,seq:++seq};
  const size=encodedSize(JSON.stringify(data));bytes+=size;
  if(++messageCount>limits.messages||bytes>limits.protocolBytes)throw new Error('Protokollgrenze erreicht.');
  self.postMessage(data);
}
function primitiveText(handle,max){
  if(vm.typeof(handle)!=='string')throw new Error('Ungültige Debugnachricht.');
  const size=vm.getProp(handle,'length');let length;try{length=vm.getNumber(size);}finally{size.dispose();}
  if(length>max)throw new Error('Textgrenze erreicht.');return vm.getString(handle);
}
function finished(reasonText){
  state='ended';
  try{send('error',{text:String(reasonText).slice(0,2000),point:currentPoint});}catch{self.postMessage({type:'error',session,revision,seq:++seq,text:'Debuggrenze erreicht.'});}
  // Version 0.32.0 can fail while disposing async host refs. Each session owns
  // its whole WASM/Worker; the parent always terminates it, including while paused.
  self.close();
}
async function start(data){
  try{
    limits=debuggerLimits(data.limits);if(!validDebugId(data.session)||!validDebugId(data.revision))throw new Error('Ungültige Sitzung.');
    session=data.session;revision=data.revision;artifact=validateDebugArtifact(data.artifact,limits);remaining=limits.activeMs;
    memory=new WebAssembly.Memory({initial:limits.wasmInitialPages,maximum:limits.wasmMaxPages});
    const quickJS=await newQuickJSAsyncWASMModuleFromVariant(newVariant(variant,{wasmMemory:memory}));
    const configureModules=(target,sources=artifact.modules)=>target.setModuleLoader(name=>{
      if(!Object.hasOwn(sources,name)){reason='Modul nicht im geprüften Projekt.';throw new Error(reason);}
      return sources[name];
    },(base,name)=>{
      try{return resolveDebugImport(base,name,sources);}catch(error){reason=error.message;throw error;}
    });
    const token='__azubi_preflight_'+crypto.randomUUID();
    const guarded=artifact.mode==='module'?Object.fromEntries(Object.entries(artifact.modules).map(([name,code])=>[name,'throw '+JSON.stringify(token)+';\n'+code])):null;
    if(artifact.mode==='module') for(const name of Object.keys(artifact.modules)){
      // The 0.32.0 module compileOnly wrapper reads an uninitialized pointer.
      // Normal module evaluation is safe: EVERY source starts with a private
      // throw, so linking is checked but no learner statement can execute.
      const checkRuntime=quickJS.newRuntime();checkRuntime.setMemoryLimit(limits.heapBytes);checkRuntime.setMaxStackSize(limits.stackBytes);configureModules(checkRuntime,guarded);
      const preflight=checkRuntime.newContext();
      try{
        const checked=await preflight.evalCodeAsync(guarded[name],name,{type:'module'});
        if(!checked.error){checked.value.dispose();throw new Error('Ungültige Modulvorprüfung.');}
        const valid=preflight.typeof(checked.error)==='string'&&preflight.getString(checked.error)===token;checked.error.dispose();
        if(!valid)throw new Error('Modulsyntax oder Verknüpfung ungültig: '+name);
      }finally{preflight.dispose();checkRuntime.dispose();}
    }
    runtime=quickJS.newRuntime();runtime.setMemoryLimit(limits.heapBytes);runtime.setMaxStackSize(limits.stackBytes);
    runtime.setInterruptHandler(()=>{if(reason)return true;if(started!==null&&performance.now()-started>=remaining){reason='Aktive Zeitgrenze erreicht.';return true;}return false;});
    if(artifact.mode==='module')configureModules(runtime);
    vm=runtime.newContext();
    executeJob=createAsyncJobRunner(runtime,vm);
    const emit=vm.newFunction('debugLog',value=>{
      try{const text=primitiveText(value,limits.logLineChars);if(++logs>limits.logLines||(logChars+=text.length)>limits.logChars)throw new Error('Ausgabegrenze erreicht.');send('log',{text});}catch(error){reason=error.message;}
      return vm.undefined;
    });
    const pause=vm.newAsyncifiedFunction('debugPause',async payload=>{
      try{
      if(reason)throw new Error(reason);
      let text=primitiveText(payload,limits.snapshotUnits);payload=undefined;
      if(encodedSize(text)>limits.snapshotBytes)throw new Error('Zustandsgrenze erreicht.');
      const snapshot=JSON.parse(text);text='';
      const point=artifact.points[snapshot.point];
      if(!point||!validateDebugSnapshot(snapshot,point,limits,artifact)||++hits>limits.checkpointHits)throw new Error('Ungültiger Kontrollpunkt oder Grenze erreicht.');
      currentPoint=point.id;
      consume();
      if(point.end){send('final',{snapshot});started=performance.now();return;}
      const depth=snapshot.frames.length;
      const stepHit=lastMode==='step'||lastMode==='over'&&depth<=stepDepth||lastMode==='out'&&depth<stepDepth;
      if(first||stepHit||breakpoints.has(point.id)){
        const cause=first?(promiseRun?'promise':timerRun?'timer':eventRun?'event':'start'):breakpoints.has(point.id)?'breakpoint':'step';first=false;
        if(++pauses>limits.pauses)throw new Error('Pausengrenze erreicht.');
        state='paused';timerQueue?.pause();pauseId++;pausedDepth=depth;
        // Install the resolver before posting, without retaining borrowed handles.
        const waiting=new Promise(resolve=>{release=resolve;});
        send('paused',{snapshot,point:point.id,pauseId,cause,remaining});
        await waiting;
        timerQueue?.resume();started=performance.now();state='running';send('running',{remaining});
      }else started=performance.now();
      }catch(error){reason=reason||error.message;throw error;}
    });
    vm.setProp(vm.global,'__azubi_dbg_native_pause',pause);pause.dispose();
    vm.setProp(vm.global,'__azubi_dbg_native_emit',emit);emit.dispose();
    const boot=await vm.evalCodeAsync('('+installDebugger.toString()+')(__azubi_dbg_native_pause,__azubi_dbg_native_emit,'+JSON.stringify(limits)+')','debug-hilfe.js');
    if(boot.error){boot.error.dispose();throw new Error('Debughilfe konnte nicht starten.');}
    vm.setProp(vm.global,artifact.helper,boot.value);boot.value.dispose();
    if(artifact.dom&&!artifact.react){
      timerQueue=createDebugTimerQueue(()=>performance.now());
      const timerEmit=vm.newFunction('debugTimer',value=>{
        try{
          if(reason)return vm.false;
          const message=JSON.parse(primitiveText(value,512));
          if(!message||typeof message!=='object'||Array.isArray(message))throw new Error('Ungültige Timerdaten.');
          if(Object.keys(message).length===1&&typeof message.error==='string'&&message.error.length<=400){reason=message.error;return vm.false;}
          if(state!=='running')throw new Error('Timer können nur im laufenden Programm geändert werden.');
          if(message.action==='schedule'&&Object.keys(message).length===3)timerQueue.schedule(message.id,message.delay);
          else if(message.action==='cancel'&&Object.keys(message).length===2&&Number.isSafeInteger(message.id)&&message.id>0&&message.id<=TIMER_LIMITS.registrations)timerQueue.cancel(message.id);
          else throw new Error('Ungültige Timeroperation.');
          send('timers',{snapshot:timerQueue.snapshot()});return vm.true;
        }catch(error){reason=error.message;return vm.false;}
      });
      vm.setProp(vm.global,'__azubi_dbg_native_timer',timerEmit);timerEmit.dispose();
      const timerSetup=await vm.evalCodeAsync('(()=>{const model=('+installDebugTimers.toString()+')('+artifact.helper+',__azubi_dbg_native_timer,'+JSON.stringify(TIMER_LIMITS)+');'+artifact.helper+'.attachTimers(model);})();','timer-aufbau.js');
      if(timerSetup.error){timerSetup.error.dispose();throw new Error(reason||'Timer konnten nicht starten.');}timerSetup.value.dispose();
      const storageEmit=vm.newFunction('debugStorage',value=>{
        try{if(reason)return vm.false;const text=primitiveText(value,STORAGE_LIMITS.snapshotBytes);if(encodedSize(text)>STORAGE_LIMITS.snapshotBytes)throw new Error('Übungsspeicher-Darstellungsgrenze erreicht.');const snapshot=JSON.parse(text);if(snapshot&&Object.keys(snapshot).length===1&&typeof snapshot.error==='string'&&snapshot.error.length<=2000){reason=snapshot.error;return vm.false;}if(!validStorageSnapshot(snapshot))throw new Error('Ungültige Übungsspeicher-Daten.');send('storage',{snapshot});return vm.true;}catch(error){reason=error.message;return vm.false;}
      });
      vm.setProp(vm.global,'__azubi_dbg_native_storage',storageEmit);storageEmit.dispose();
      const storageSetup=await vm.evalCodeAsync('(()=>{const model=('+installDebugStorage.toString()+')('+artifact.helper+',__azubi_dbg_native_storage,'+JSON.stringify(STORAGE_LIMITS)+');'+artifact.helper+'.attachStorage(model);model.publish();})();','speicher-aufbau.js');
      if(storageSetup.error){storageSetup.error.dispose();throw new Error(reason||'Übungsspeicher konnte nicht starten.');}storageSetup.value.dispose();
      const domEmit=vm.newFunction('debugDOM',value=>{
        try{if(reason)return vm.false;const text=primitiveText(value,DOM_LIMITS.snapshotBytes);if(encodedSize(text)>DOM_LIMITS.snapshotBytes)throw new Error('DOM-Bytegrenze erreicht.');const tree=JSON.parse(text);if(tree&&typeof tree.error==='string'&&Object.keys(tree).length===1&&tree.error.length<=2000){reason=tree.error;return vm.false;}if(!validDOMTree(tree))throw new Error('Ungültige oder zu große DOM-Darstellung.');send('dom',{tree});return vm.true;}catch(error){reason=error.message;return vm.false;}
      });
      vm.setProp(vm.global,'__azubi_dbg_native_dom',domEmit);domEmit.dispose();
      const setup=await vm.evalCodeAsync('(()=>{const model=('+installDebugDOM.toString()+')('+JSON.stringify(artifact.dom.tree)+','+artifact.helper+',__azubi_dbg_native_dom,'+JSON.stringify(DOM_LIMITS)+','+JSON.stringify(DOM_TAGS)+');'+artifact.helper+'.attachDOM(model);model.publish();})();','dom-aufbau.js');
      if(setup.error){setup.error.dispose();throw new Error(reason||'DOM-Modell konnte nicht starten.');}setup.value.dispose();
      const dataSetup=await vm.evalCodeAsync('(()=>{const model=('+installDebugJSON.toString()+')('+artifact.helper+',__azubi_dbg_native_storage,'+JSON.stringify(JSON_LIMITS)+');'+artifact.helper+'.attachData(model);})();','daten-aufbau.js');
      if(dataSetup.error){dataSetup.error.dispose();throw new Error(reason||'JSON-/Prüfmethoden konnten nicht starten.');}dataSetup.value.dispose();
      const observePromise=vm.newFunction('observePromise',(mode,value)=>{
        try{
          if(reason||state!=='running')throw new Error('Promise-Beobachtung außerhalb der Ausführung.');
          const action=primitiveText(mode,16);
          if(action==='track'){
            if(promiseHandles.length>=PROMISE_LIMITS.promises||vm.typeof(value)!=='object')throw new Error('Promise-Anzahlgrenze erreicht.');
            const id=promiseHandles.length;promiseHandles.push(value.dup());return vm.newNumber(id);
          }
          if(action==='handled'&&vm.typeof(value)==='number'){
            const id=vm.getNumber(value);if(!Number.isInteger(id)||id<0||id>=promiseHandles.length)throw new Error('Ungültige Promise-Kennung.');handledPromises.add(id);return vm.undefined;
          }
          throw new Error('Ungültige Promise-Beobachtung.');
        }catch(error){reason=error.message;return vm.undefined;}
      });
      vm.setProp(vm.global,'__azubi_dbg_native_promise',observePromise);observePromise.dispose();
      const promiseSetup=await vm.evalCodeAsync('(()=>{const model=('+installDebugPromises.toString()+')('+artifact.helper+',__azubi_dbg_native_storage,'+JSON.stringify(PROMISE_LIMITS)+',__azubi_dbg_native_promise);'+artifact.helper+'.attachPromises(model);})();','promise-aufbau.js');
      if(promiseSetup.error){promiseSetup.error.dispose();throw new Error(reason||'Promises konnten nicht starten.');}promiseSetup.value.dispose();
      const fetchEmit=vm.newFunction('debugFetch',value=>{
        try{
          if(reason)return vm.false;const message=JSON.parse(primitiveText(value,1024));
          if(message&&Object.keys(message).length===1&&typeof message.error==='string'&&message.error.length<=400){reason=message.error;return vm.false;}
          if(state!=='running'||!message||typeof message!=='object')throw new Error('Ungültiger Anfragezustand.');
          if(message.action==='schedule'&&Object.keys(message).length===3)timerQueue.scheduleFetch(message.id,message.delay);
          else if(message.action==='cancel'&&Object.keys(message).length===2&&Number.isInteger(message.id)&&message.id>0&&message.id<=FETCH_LIMITS.requests)timerQueue.cancelFetch(message.id);
          else throw new Error('Ungültige Anfrageoperation.');
          send('requests',{snapshot:timerQueue.requestSnapshot()});return vm.true;
        }catch(error){reason=error.message;return vm.false;}
      });
      vm.setProp(vm.global,'__azubi_dbg_native_fetch',fetchEmit);fetchEmit.dispose();
      const fetchSetup=await vm.evalCodeAsync(artifact.helper+'.attachFetch(('+installDebugFetch.toString()+'),__azubi_dbg_native_fetch,'+JSON.stringify(FETCH_LIMITS)+','+JSON.stringify(artifact.fixtures||{schema:1,routes:[]})+');','anfrage-aufbau.js');
      if(fetchSetup.error){fetchSetup.error.dispose();throw new Error(reason||'Übungsanfragen konnten nicht starten.');}fetchSetup.value.dispose();
    }
    if(artifact.react){
      timerQueue=createDebugTimerQueue(()=>performance.now());
      const domEmit=vm.newFunction('debugReactDOM',value=>{
        try{if(reason)return vm.false;const text=primitiveText(value,DOM_LIMITS.snapshotBytes);if(encodedSize(text)>DOM_LIMITS.snapshotBytes)throw new Error('React-DOM-Bytegrenze erreicht.');const tree=JSON.parse(text);if(!validDOMTree(tree))throw new Error('Ungültige React-Darstellung.');send('dom',{tree});return vm.true;}catch(error){reason=error.message;return vm.false;}
      });
      vm.setProp(vm.global,'__azubi_dbg_native_dom',domEmit);domEmit.dispose();
      const vendor=(await import('virtual:debugger-vendor')).default;
      for(const [name,code] of [
        ['react-dom-bibliothek.js',vendor.dom],
        ['react-umgebung.js','globalThis.__azubi_dbg_react_environment=('+installDebugReactEnvironment.toString()+')('+JSON.stringify(REACT_LIMITS)+');'],
        ['react-bibliothek.js',vendor.react],
        ['react-aufbau.js','(()=>{const model=('+installDebugReact.toString()+')('+artifact.helper+',__azubi_dbg_native_dom,'+JSON.stringify(REACT_LIMITS)+','+JSON.stringify(DOM_LIMITS)+','+JSON.stringify(DOM_TAGS)+');'+artifact.helper+'.attachReact(model);model.publish();})();'],
      ]){
        const setup=await vm.evalCodeAsync(code,name);if(setup.error){setup.error.dispose();throw new Error(reason||'React konnte nicht vorbereitet werden: '+name);}setup.value.dispose();
      }
    }
    const hidden=await vm.evalCodeAsync('delete globalThis.__azubi_dbg_native_pause;delete globalThis.__azubi_dbg_native_emit;delete globalThis.__azubi_dbg_native_dom;delete globalThis.__azubi_dbg_native_storage;delete globalThis.__azubi_dbg_native_timer;delete globalThis.__azubi_dbg_native_promise;delete globalThis.__azubi_dbg_native_fetch;','debug-setup.js');
    if(hidden.error){hidden.error.dispose();throw new Error('Debughilfe konnte nicht vorbereitet werden.');}hidden.value.dispose();
    send('memory',{bytes:memory.buffer.byteLength,maximum:limits.wasmMaxPages*65536});
    started=performance.now();state='running';send('running',{remaining});
    const result=await vm.evalCodeAsync(artifact.code,artifact.name,{type:artifact.mode==='module'?'module':'global'});
    if(result.error){result.error.dispose();throw new Error(reason||'Laufzeitfehler im eigenen Programm. Prüfe die markierte Anweisung.');}
    if(reason){result.value.dispose();throw new Error(reason);}
    try{
      if(artifact.react){first=true;lastMode='continue';eventRun=true;const mounted=await vm.evalCodeAsync(artifact.helper+'.mountReact('+artifact.dom.eventPoint+');','react-start.js');if(mounted.error){mounted.error.dispose();throw new Error(reason||'React-Komponente konnte nicht starten.');}mounted.value.dispose();}
      await settle();eventRun=false;
    }catch(error){result.value.dispose();throw error;}
    consume();
    if(artifact.dom){result.value.dispose();idle();return;}
    let completion={type:vm.typeof(result.value),display:'[Nicht inspiziert]'};
    if(completion.type==='number') {const n=vm.getNumber(result.value);completion.display=Object.is(n,-0)?'-0':String(n);}
    else if(completion.type==='string'){
      const length=vm.getProp(result.value,'length');let size;try{size=vm.getNumber(length);}finally{length.dispose();}
      completion.display=size<=limits.valueChars?primitiveText(result.value,limits.valueChars):'[Lange Zeichenfolge]';
    }
    else if(completion.type==='undefined')completion.display='undefined';
    else if(completion.type==='boolean')completion.display=vm.getNumber(result.value)===1?'true':'false';
    else if(completion.type==='object'&&vm.sameValue(result.value,vm.null))completion={type:'null',display:'null'};
    result.value.dispose();state='ended';send('done',{completion,remaining,wasmBytes:memory.buffer.byteLength});self.close();
  }catch(error){finished(reason||error.message);}
}
async function dispatchEvent(event,unmount=false){
  try{
    eventRun=true;first=true;lastMode='continue';currentPoint=artifact.dom.eventPoint;started=performance.now();state='running';send('running',{remaining});
    const result=await vm.evalCodeAsync(artifact.helper+(unmount?'.unmountReact('+artifact.dom.eventPoint+');':'.dispatchDOM('+JSON.stringify(event)+','+artifact.dom.eventPoint+');'),'vorschauereignis.js');
    if(result.error){result.error.dispose();throw new Error(reason||'Laufzeitfehler im Ereignishandler. Prüfe die markierte Anweisung.');}result.value.dispose();
    if(reason)throw new Error(reason);await settle();consume();eventRun=false;idle();
  }catch(error){finished(reason||error.message);}
}
async function dispatchTimer(){
  try{
    const task=timerQueue.takeTask();
    // An early wake only refreshes the wait. It never enters the VM.
    if(task===null){state='idle';send('idle',{remaining,timers:timerQueue.snapshot(),wake:timerQueue.wakeSnapshot(),requests:timerQueue.requestSnapshot(),timerWait:true});return;}
    timerRun=task.kind==='timer';first=true;lastMode='continue';currentPoint=artifact.dom.eventPoint;started=performance.now();state='running';send('running',{remaining});
    send('timers',{snapshot:timerQueue.snapshot()});send('requests',{snapshot:timerQueue.requestSnapshot()});
    const result=await vm.evalCodeAsync(artifact.helper+(task.kind==='timer'?'.dispatchTimer(':'.dispatchFetch(')+task.id+','+artifact.dom.eventPoint+');','timerereignis.js');
    if(result.error){result.error.dispose();throw new Error(reason||'Laufzeitfehler im Timer-Callback. Prüfe die markierte Anweisung.');}result.value.dispose();
    if(reason)throw new Error(reason);timerQueue.endTask();await drainJobs();
    consume();timerRun=false;idle();
  }catch(error){finished(reason||error.message);}
}
self.onmessage=({data})=>{
  if(!data||typeof data!=='object')return;
  if(data.type==='start'&&state==='fresh'){state='starting';void start(data);return;}
  if(data.session!==session||data.revision!==revision||state==='ended')return;
  if(data.type==='control'&&Number.isSafeInteger(data.commandId)&&data.commandId===lastCommand+1){
    if(data.unmount!==undefined&&(!artifact.react||state!=='idle'||data.unmount!==true||data.mode!==undefined||data.event!==undefined||data.timer!==undefined))return;
    if(data.event!==undefined&&(!artifact.dom||state!=='idle'||data.mode!==undefined||data.timer!==undefined||!validDOMEvent(data.event)))return;
    if(data.timer!==undefined&&(!artifact.dom||state!=='idle'||data.timer!==true||data.mode!==undefined||data.event!==undefined))return;
    if(data.ids!==undefined&&(!Array.isArray(data.ids)||data.ids.length>limits.points||data.ids.some(id=>!Number.isSafeInteger(id)||!artifact.points[id]||artifact.points[id].end||artifact.points[id].kind==='context')))return;
    if(data.mode!==undefined&&(state!=='paused'||data.pauseId!==pauseId||!['step','continue','over','out'].includes(data.mode)||data.mode==='out'&&pausedDepth<=1||!release))return;
    try{
      bytes+=encodedSize(JSON.stringify(data));if(++messageCount>limits.messages||bytes>limits.protocolBytes)throw new Error('Protokollgrenze erreicht.');
      if(data.ids)breakpoints=new Set(data.ids);lastCommand=data.commandId;send('ack',{commandId:lastCommand});
      if(data.unmount){state='dispatching';void dispatchEvent(null,true);return;}
      if(data.event){state='dispatching';void dispatchEvent(data.event);return;}
      if(data.timer){state='dispatching';void dispatchTimer();return;}
      if(data.mode!==undefined){const resolve=release;release=null;lastMode=data.mode;stepDepth=pausedDepth;state='resuming';resolve();}
    }catch(error){finished(error.message);}
  }
};
