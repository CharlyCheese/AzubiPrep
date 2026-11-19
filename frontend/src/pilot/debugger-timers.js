import { FETCH_LIMITS } from './debugger-fetch.js';
export const TIMER_LIMITS = Object.freeze({ pending: 16, registrations: 128, fired: 64, operations: 256, delayMs: 30000, args: 8 });

export function validTimerSnapshot(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 2 &&
    Number.isSafeInteger(value.pending) && value.pending >= 0 && value.pending <= TIMER_LIMITS.pending &&
    (value.pending === 0 ? value.nextDelay === null : typeof value.nextDelay === 'number' && Number.isFinite(value.nextDelay) && value.nextDelay >= 0 && value.nextDelay <= TIMER_LIMITS.delayMs);
}

// Host-side metadata only. No learner function, argument, source or VM handle
// enters this queue. Time advances between pauses; taking a timer never runs it.
export function validWakeSnapshot(value) {
  return !!value && typeof value==='object' && !Array.isArray(value) && Object.keys(value).length===2 && Number.isSafeInteger(value.pending) && value.pending>=0 && value.pending<=TIMER_LIMITS.pending+FETCH_LIMITS.pending && (value.pending===0?value.nextDelay===null:typeof value.nextDelay==='number'&&Number.isFinite(value.nextDelay)&&value.nextDelay>=0&&value.nextDelay<=30000);
}
export function createDebugTimerQueue(now, limits = TIMER_LIMITS) {
  const entries=new Map(),origin=now();let pausedAt=null,pausedMs=0,lastId=0,lastFetch=0,fired=0,nesting=0,order=0;
  const time=()=>(pausedAt??now())-origin-pausedMs;
  const all=kind=>[...entries.values()].filter(e=>!kind||e.kind===kind);
  const first=kind=>all(kind).sort((a,b)=>a.due-b.due||a.order-b.order)[0];
  const snapshot=kind=>{const entry=first(kind);return {pending:all(kind).length,nextDelay:entry?Math.max(0,entry.due-time()):null};};
  const take=()=>{
    if(pausedAt!==null)return null;const entry=first();if(!entry||entry.due>time())return null;
    if(entry.kind==='timer'&&++fired>limits.fired)throw new Error('Timer-Ausführungsgrenze erreicht.');
    entries.delete(entry.kind+entry.id);nesting=entry.kind==='timer'?entry.nesting:0;return {kind:entry.kind,id:entry.id};
  };
  return {
    schedule(id,delay){
      if(!Number.isSafeInteger(id)||id!==lastId+1||id>limits.registrations||all('timer').length>=limits.pending||!Number.isInteger(delay)||delay<0||delay>limits.delayMs)throw new Error('Timer-Registrierungsgrenze oder ungültiger Timer.');
      entries.set('timer'+id,{kind:'timer',id,due:time()+(nesting>5?Math.max(4,delay):delay),nesting:nesting+1,order:++order});lastId=id;
    },
    scheduleFetch(id,delay){
      if(!Number.isSafeInteger(id)||id!==lastFetch+1||id>FETCH_LIMITS.requests||all('fetch').length>=FETCH_LIMITS.pending||!Number.isInteger(delay)||delay<0||delay>FETCH_LIMITS.delayMs)throw new Error('Anfragegrenze oder ungültige Übungsanfrage.');
      entries.set('fetch'+id,{kind:'fetch',id,due:time()+delay,order:++order});lastFetch=id;
    },
    cancel(id){entries.delete('timer'+id);},cancelFetch(id){entries.delete('fetch'+id);},
    snapshot:()=>snapshot('timer'),wakeSnapshot:()=>snapshot(),requestSnapshot:()=>({pending:all('fetch').length}),
    take:()=>take()?.id??null,takeTask:take,
    endTask(){nesting=0;},pause(){if(pausedAt===null)pausedAt=now();},resume(){if(pausedAt!==null){pausedMs+=now()-pausedAt;pausedAt=null;}},
  };
}

// Serialized into QuickJS. Only validated primitive metadata crosses the private
// bridge. Registered callbacks and their original argument references stay here.
export function installDebugTimers(core, emit, limits) {
  const stringify = JSON.stringify, finite = Number.isFinite, integer = Number.isSafeInteger, trunc = Math.trunc;
  const entries = new Map();
  let nextId = 0, operations = 0, fired = 0;
  const fail = text => { emit(stringify({ error: text })); core.abort(text); };
  const send = message => { if (emit(stringify(message)) !== true) fail('Timer-Brücke wurde beendet oder abgewiesen.'); };
  function call(name, args) {
    core.guard(); if (++operations > limits.operations) fail('Timer-Operationsgrenze erreicht.');
    if (name === 'clearTimeout') {
      const id = args[0];
      if (args.length > 1 || id !== undefined && !integer(id)) fail('clearTimeout benötigt die numerische Timer-ID oder undefined.');
      if (entries.delete(id)) send({ action: 'cancel', id });
      return;
    }
    if (name !== 'setTimeout' || !core.registered(args[0])) fail('setTimeout benötigt eine eigene Funktion; Textprogramme sind nicht erlaubt.');
    if (args.length > limits.args + 2) fail('Timer: höchstens acht Zusatzargumente.');
    const value = args[1] === undefined ? 0 : args[1];
    if (typeof value !== 'number' || !finite(value) || value > limits.delayMs) fail('Timer-Wartezeit: eine endliche Zahl bis 30000 Millisekunden verwenden.');
    if (entries.size >= limits.pending || nextId >= limits.registrations) fail('Timer-Registrierungsgrenze erreicht (16 offen, 128 pro Sitzung).');
    const id = ++nextId;
    entries.set(id, { fn: args[0], args: args.slice(2) });
    send({ action: 'schedule', id, delay: Math.max(0, trunc(value)) });
    return id;
  }
  function dispatch(id) {
    core.guard(); const entry = entries.get(id);
    if (!entry) fail('Timer ist nicht mehr verfügbar.');
    if (++fired > limits.fired) fail('Timer-Ausführungsgrenze erreicht.');
    entries.delete(id); // A running timer cannot be cancelled or run twice.
    core.invoke(entry.fn, entry.args, undefined);
    core.guard();
  }
  return { call, dispatch };
}

export function initialTimerProject() {
  return {
    schema: 1, mode: 'module', entry: 'main.js',
    html: '<h1>Eine Meldung später anzeigen</h1>\n<p>Plane eine Meldung für frühestens drei Sekunden später. Du kannst sie vorher abbrechen.</p>\n<button id="planen" type="button">Meldung planen</button>\n<button id="abbrechen" type="button">Meldung abbrechen</button>\n<p id="meldung">Noch keine Meldung geplant.</p>',
    css: 'body { font-family: sans-serif; padding: 16px; color: #163344; background-color: #f3f7fa; }\nbutton { margin: 4px; padding: 10px; background-color: #d1f3ec; color: #163344; border-width: 1px; border-style: solid; border-color: #28776b; }\n#meldung { padding: 12px; border-width: 1px; border-style: solid; border-color: #28776b; }',
    files: { 'main.js': `const meldung = document.getElementById("meldung");
const planen = document.getElementById("planen");
const abbrechen = document.getElementById("abbrechen");
let timerId;

function zeigeMeldung(text) {
  timerId = undefined;
  meldung.textContent = text;
  console.log(text);
}

planen.addEventListener("click", () => {
  // Eine vorher geplante Meldung zuerst abbrechen.
  clearTimeout(timerId);
  // Die Funktion übergeben, ohne sie hier aufzurufen.
  timerId = setTimeout(zeigeMeldung, 3000, "Die Wartezeit ist vorbei!");
  meldung.textContent = "Meldung geplant – du kannst sie noch abbrechen.";
  console.log("Geplant: " + timerId);
});

abbrechen.addEventListener("click", () => {
  if (timerId === undefined) {
    meldung.textContent = "Es ist keine Meldung mehr geplant.";
    return;
  }
  clearTimeout(timerId);
  timerId = undefined;
  meldung.textContent = "Die geplante Meldung wurde abgebrochen.";
  console.log("Abgebrochen");
});` },
  };
}
