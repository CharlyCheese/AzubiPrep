import { checkJsDraft } from './js-draft.js';
import { checkDebugProject, checkDOMProject } from './debugger-project.js';
import { validDOMTree, DOM_LIMITS } from './debugger-dom.js';
import { debuggerLimits, encodedSize, validateDebugArtifact, validateDebugSnapshot } from './debugger-core.js';

export function startDebugger(draft,onEvent,overrides){
  draft=draft?.mode==='dom'?checkDOMProject(draft):draft?.mode==='module'?checkDebugProject(draft):checkJsDraft(draft);const limits=debuggerLimits(overrides);
  const session=crypto.randomUUID(),revision=crypto.randomUUID();let active=true,phase='preparing',pauseId=0,artifact=null;
  let compiler,worker,timer,seq=0,totalBytes=0,remaining=limits.activeMs,logLines=0,logChars=0,finalSeen=false;
  let commandSeq=0,inflight=null,pending=null,messageCount=0,pausedDepth=1;
  const dispose=()=>{active=false;clearTimeout(timer);compiler?.terminate();worker?.terminate();compiler=null;worker=null;inflight=null;pending=null;};
  const finish=(type,text='',extra={})=>{if(!active)return;dispose();onEvent({...extra,type,text});};
  const arm=(ms,text)=>{clearTimeout(timer);timer=setTimeout(()=>finish('error',text),ms);};
  compiler=new Worker(new URL('./debugger-compiler.worker.js',import.meta.url),{type:'module',name:'Debug-Vorbereitung'});
  arm(limits.prepareMs,'Vorbereitung hat die Zeitgrenze erreicht.');
  compiler.onerror=event=>{event.preventDefault();finish('error','Debugvorbereitung fehlgeschlagen.');};
  compiler.onmessage=({data})=>{
    if(!active||!compiler)return;compiler.terminate();compiler=null;
    if(data.type==='error'){finish('error',String(data.text).slice(0,2000));return;}
    try{artifact=validateDebugArtifact(data.artifact,limits);}catch(error){finish('error',error.message);return;}
    onEvent({type:'prepared',artifact,session,revision});
    if(!active)return;
    worker=new Worker(new URL('./debugger.worker.js',import.meta.url),{type:'module',name:'Debug-Ausführung'});phase='starting';
    arm(limits.startupMs,'Debuglaufzeit hat die Startgrenze erreicht.');
    worker.onerror=event=>{event.preventDefault();finish('error','Debuglaufzeit wurde beendet.');};
    worker.onmessageerror=()=>finish('error','Ungültige Debugnachricht.');
    worker.onmessage=({data})=>{
      if(!active||!data||data.session!==session||data.revision!==revision)return;
      try{
        totalBytes+=encodedSize(JSON.stringify(data));
        if(data.seq!==seq+1||++messageCount>limits.messages||totalBytes>limits.protocolBytes)throw new Error('Debugprotokollgrenze erreicht.');seq=data.seq;
        if(data.type==='error'){finish('error',typeof data.text==='string'?data.text.slice(0,2000):'Debugfehler.',{point:Number.isSafeInteger(data.point)&&artifact.points[data.point]?data.point:null});return;}
        if(data.type==='ack'){
          if(!inflight||data.commandId!==inflight.commandId)throw new Error('Ungültige Befehlsbestätigung.');inflight=null;flushCommand();return;
        }else if(data.type==='running'){
          if(!['starting','resuming','dispatching'].includes(phase)||typeof data.remaining!=='number'||data.remaining<=0||data.remaining>remaining)throw new Error('Ungültiges Zeitbudget/Zustand.');remaining=data.remaining;phase='running';arm(remaining+limits.watchdogSlackMs,'Aktive Zeitgrenze erreicht.');
        }else if(data.type==='paused'||data.type==='final'){
          const point=artifact.points[data.snapshot?.point];
          if(phase!=='running'||!point||!validateDebugSnapshot(data.snapshot,point,limits,artifact)||encodedSize(JSON.stringify(data.snapshot))>limits.snapshotBytes)throw new Error('Ungültiger Debugzustand.');
          if(data.type==='paused'){
            if(point.end||data.pauseId!==pauseId+1||typeof data.remaining!=='number'||data.remaining<=0||data.remaining>remaining)throw new Error('Ungültige Pause.');pauseId=data.pauseId;pausedDepth=data.snapshot.frames.length;remaining=data.remaining;phase='paused';arm(limits.idleMs,'Die unbediente Pause wurde beendet. Starte dein Programm erneut.');
          }else{if(!point.end||finalSeen)throw new Error('Ungültiges Programmende.');finalSeen=true;}
        }else if(data.type==='dom'){
          if(!artifact.dom||!['starting','running'].includes(phase)||!validDOMTree(data.tree)||encodedSize(JSON.stringify(data.tree))>DOM_LIMITS.snapshotBytes)throw new Error('Ungültige DOM-Darstellung.');
        }else if(data.type==='idle'){
          if(!artifact.dom||phase!=='running'||!finalSeen||typeof data.remaining!=='number'||data.remaining<=0||data.remaining>remaining)throw new Error('Ungültiger Ereigniswartepunkt.');remaining=data.remaining;phase='idle';arm(limits.idleMs,'Die unbediente Ereigniswartezeit wurde beendet. Starte erneut.');
        }else if(data.type==='log'){
          if(phase!=='running'||typeof data.text!=='string'||data.text.length>limits.logLineChars||++logLines>limits.logLines||(logChars+=data.text.length)>limits.logChars)throw new Error('Ungültige Ausgabe.');
        }else if(data.type==='done'){
          if(phase!=='running'||!finalSeen)throw new Error('Ungültiges Programmende.');dispose();onEvent(data);return;
        }else if(data.type==='memory'){
          if(phase!=='starting'||!Number.isInteger(data.bytes)||data.bytes<0||data.bytes>limits.wasmMaxPages*65536||data.maximum!==limits.wasmMaxPages*65536)throw new Error('Ungültiger Speicherzustand.');
        }else throw new Error('Unbekannte Debugnachricht.');
        onEvent(data);
      }catch(error){finish('error',error.message);}
    };
    worker.postMessage({type:'start',session,revision,artifact,limits});
    flushCommand();
  };
  compiler.postMessage({draft,limits});
  function flushCommand(){
    if(!active||!worker||inflight||!pending)return;
    const command={...pending,type:'control',session,revision,commandId:++commandSeq};pending=null;
    totalBytes+=encodedSize(JSON.stringify(command));if(++messageCount>limits.messages||totalBytes>limits.protocolBytes){finish('error','Protokollgrenze erreicht.');return;}
    inflight=command;worker.postMessage(command);
  }
  return{dispose,stop:()=>finish('stopped','Debuglauf gestoppt.'),resume(mode='step'){
    if(!active||phase!=='paused'||!['step','continue','over','out'].includes(mode)||mode==='out'&&pausedDepth<=1)return false;
    phase='resuming';arm(remaining+limits.watchdogSlackMs,'Fortsetzen hat die Zeitgrenze erreicht.');pending={...pending,pauseId,mode};flushCommand();return true;
  },click(id){
    if(!active||!artifact?.dom||phase!=='idle'||!Number.isSafeInteger(id)||id<1||id>DOM_LIMITS.nodes)return false;
    phase='dispatching';arm(remaining+limits.watchdogSlackMs,'Ereignisstart hat die Zeitgrenze erreicht.');pending={...pending,event:{id}};flushCommand();return true;
  },breakpoints(ids){
    if(!active||!artifact||!Array.isArray(ids)||ids.length>limits.points||ids.some(id=>!Number.isSafeInteger(id)||!artifact.points[id]||artifact.points[id].end||artifact.points[id].kind==='context'))return false;
    pending={...pending,ids:[...ids]};flushCommand();return true;
  }};
}
