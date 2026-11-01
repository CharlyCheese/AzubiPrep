import variant from '@jitl/quickjs-singlefile-browser-release-asyncify';
import { newQuickJSAsyncWASMModuleFromVariant, newVariant } from 'quickjs-emscripten-core';
import { debuggerLimits, encodedSize, validDebugId, validateDebugArtifact, validateDebugSnapshot, installDebugger } from './debugger-core.js';
import { resolveDebugImport } from './debugger-project.js';
import { DOM_LIMITS, installDebugDOM, validDOMTree } from './debugger-dom.js';

let state='fresh',session,revision,limits,artifact,vm,runtime,memory;
let seq=0,bytes=0,hits=0,pauses=0,pauseId=0,logs=0,logChars=0;
let remaining=0,started=null,release=null,lastMode='step',first=true,reason='';
let breakpoints=new Set();
let currentPoint=null;
let lastCommand=0,messageCount=0;
let pausedDepth=1,stepDepth=1;
let eventRun=false;
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
        const cause=first?(eventRun?'event':'start'):breakpoints.has(point.id)?'breakpoint':'step';first=false;
        if(++pauses>limits.pauses)throw new Error('Pausengrenze erreicht.');
        state='paused';pauseId++;pausedDepth=depth;
        // Install the resolver before posting, without retaining borrowed handles.
        const waiting=new Promise(resolve=>{release=resolve;});
        send('paused',{snapshot,point:point.id,pauseId,cause,remaining});
        await waiting;
        started=performance.now();state='running';send('running',{remaining});
      }else started=performance.now();
      }catch(error){reason=reason||error.message;throw error;}
    });
    vm.setProp(vm.global,'__azubi_dbg_native_pause',pause);pause.dispose();
    vm.setProp(vm.global,'__azubi_dbg_native_emit',emit);emit.dispose();
    const boot=await vm.evalCodeAsync('('+installDebugger.toString()+')(__azubi_dbg_native_pause,__azubi_dbg_native_emit,'+JSON.stringify(limits)+')','debug-hilfe.js');
    if(boot.error){boot.error.dispose();throw new Error('Debughilfe konnte nicht starten.');}
    vm.setProp(vm.global,artifact.helper,boot.value);boot.value.dispose();
    if(artifact.dom){
      const domEmit=vm.newFunction('debugDOM',value=>{
        try{if(reason)return vm.false;const text=primitiveText(value,DOM_LIMITS.snapshotBytes);if(encodedSize(text)>DOM_LIMITS.snapshotBytes)throw new Error('DOM-Bytegrenze erreicht.');const tree=JSON.parse(text);if(tree&&typeof tree.error==='string'&&Object.keys(tree).length===1&&tree.error.length<=2000){reason=tree.error;return vm.false;}if(!validDOMTree(tree))throw new Error('Ungültige oder zu große DOM-Darstellung.');send('dom',{tree});return vm.true;}catch(error){reason=error.message;return vm.false;}
      });
      vm.setProp(vm.global,'__azubi_dbg_native_dom',domEmit);domEmit.dispose();
      const setup=await vm.evalCodeAsync('(()=>{const model=('+installDebugDOM.toString()+')('+JSON.stringify(artifact.dom.tree)+','+artifact.helper+',__azubi_dbg_native_dom,'+JSON.stringify(DOM_LIMITS)+');'+artifact.helper+'.attachDOM(model);model.publish();})();','dom-aufbau.js');
      if(setup.error){setup.error.dispose();throw new Error(reason||'DOM-Modell konnte nicht starten.');}setup.value.dispose();
    }
    const hidden=await vm.evalCodeAsync('delete globalThis.__azubi_dbg_native_pause;delete globalThis.__azubi_dbg_native_emit;delete globalThis.__azubi_dbg_native_dom;','debug-setup.js');
    if(hidden.error){hidden.error.dispose();throw new Error('Debughilfe konnte nicht vorbereitet werden.');}hidden.value.dispose();
    send('memory',{bytes:memory.buffer.byteLength,maximum:limits.wasmMaxPages*65536});
    started=performance.now();state='running';send('running',{remaining});
    const result=await vm.evalCodeAsync(artifact.code,artifact.name,{type:artifact.mode==='module'?'module':'global'});
    if(result.error){result.error.dispose();throw new Error(reason||'Laufzeitfehler im eigenen Programm. Prüfe die markierte Anweisung.');}
    if(reason){result.value.dispose();throw new Error(reason);}
    if(artifact.mode==='module'&&runtime.hasPendingJob()){result.value.dispose();throw new Error('Asynchrone Modulaufgaben sind nicht unterstützt.');}
    consume();
    if(artifact.dom){result.value.dispose();state='idle';send('idle',{remaining});return;}
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
async function dispatchEvent(event){
  try{
    eventRun=true;first=true;lastMode='continue';currentPoint=artifact.dom.eventPoint;started=performance.now();state='running';send('running',{remaining});
    const result=await vm.evalCodeAsync(artifact.helper+'.dispatchDOM('+event.id+','+artifact.dom.eventPoint+');','vorschauklick.js');
    if(result.error){result.error.dispose();throw new Error(reason||'Laufzeitfehler im Klickhandler. Prüfe die markierte Anweisung.');}result.value.dispose();
    if(reason)throw new Error(reason);if(runtime.hasPendingJob())throw new Error('Asynchrone Ereignisaufgaben sind nicht unterstützt.');consume();state='idle';eventRun=false;send('idle',{remaining});
  }catch(error){finished(reason||error.message);}
}
self.onmessage=({data})=>{
  if(!data||typeof data!=='object')return;
  if(data.type==='start'&&state==='fresh'){state='starting';void start(data);return;}
  if(data.session!==session||data.revision!==revision||state==='ended')return;
  if(data.type==='control'&&Number.isSafeInteger(data.commandId)&&data.commandId===lastCommand+1){
    if(data.event!==undefined&&(!artifact.dom||state!=='idle'||data.mode!==undefined||!data.event||typeof data.event!=='object'||Array.isArray(data.event)||Object.keys(data.event).length!==1||!Number.isSafeInteger(data.event.id)||data.event.id<1||data.event.id>DOM_LIMITS.nodes))return;
    if(data.ids!==undefined&&(!Array.isArray(data.ids)||data.ids.length>limits.points||data.ids.some(id=>!Number.isSafeInteger(id)||!artifact.points[id]||artifact.points[id].end||artifact.points[id].kind==='context')))return;
    if(data.mode!==undefined&&(state!=='paused'||data.pauseId!==pauseId||!['step','continue','over','out'].includes(data.mode)||data.mode==='out'&&pausedDepth<=1||!release))return;
    try{
      bytes+=encodedSize(JSON.stringify(data));if(++messageCount>limits.messages||bytes>limits.protocolBytes)throw new Error('Protokollgrenze erreicht.');
      if(data.ids)breakpoints=new Set(data.ids);lastCommand=data.commandId;send('ack',{commandId:lastCommand});
      if(data.event){state='dispatching';void dispatchEvent(data.event);return;}
      if(data.mode!==undefined){const resolve=release;release=null;lastMode=data.mode;stepDepth=pausedDepth;state='resuming';resolve();}
    }catch(error){finished(error.message);}
  }
};
