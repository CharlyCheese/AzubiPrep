import { initialElementsProject } from './debugger-dom.js';

export const STORAGE_LIMITS=Object.freeze({entries:16,key:128,value:2048,bytes:16384,operations:256,snapshotBytes:32768});
export function validStorageSnapshot(data){
  if(!data||typeof data!=='object'||Array.isArray(data)||Object.keys(data).length!==2||!Object.hasOwn(data,'entries')||!Object.hasOwn(data,'bytes')||!Array.isArray(data.entries)||data.entries.length>STORAGE_LIMITS.entries||!Number.isSafeInteger(data.bytes)||data.bytes<0||data.bytes>STORAGE_LIMITS.bytes)return false;
  const keys=new Set();let bytes=0;
  for(const item of data.entries){
    if(!item||typeof item!=='object'||Array.isArray(item)||Object.keys(item).length!==2||!Object.hasOwn(item,'key')||!Object.hasOwn(item,'value')||typeof item.key!=='string'||typeof item.value!=='string'||item.key.length>STORAGE_LIMITS.key||item.value.length>STORAGE_LIMITS.value||keys.has(item.key))return false;
    keys.add(item.key);bytes+=new TextEncoder().encode(item.key).length+new TextEncoder().encode(item.value).length;
  }
  return bytes===data.bytes&&new TextEncoder().encode(JSON.stringify(data)).length<=STORAGE_LIMITS.snapshotBytes;
}

// This entire function executes only inside QuickJS. No browser storage,
// files, app data or host objects are captured or returned to learner code.
export function installDebugStorage(core,emit,limits){
  const stringify=JSON.stringify,string=String,number=Number,define=Object.defineProperty,ErrorClass=Error,TypeErrorClass=TypeError;
  const handle=Object.create(null),items=new Map();let bytes=0,operations=0;
  const fail=text=>{emit(stringify({error:text}));core.abort(text);};
  const guard=()=>{core.guard();if(++operations>limits.operations)fail('Übungsspeicher: Operationsgrenze erreicht.');};
  const text=value=>{if(['object','function','symbol'].includes(typeof value)&&value!==null)fail('Übungsspeicher benötigt primitive Schlüssel und Werte ohne Objektkonvertierung.');return string(value);};
  function size(value){let result=0;for(let i=0;i<value.length;i++){const c=value.charCodeAt(i);if(c<128)result++;else if(c<2048)result+=2;else if(c>=55296&&c<=56319&&i+1<value.length&&value.charCodeAt(i+1)>=56320&&value.charCodeAt(i+1)<=57343){result+=4;i++;}else result+=3;}return result;}
  const snapshot=(map=items,total=bytes)=>({entries:[...map].map(([key,value])=>({key,value})),bytes:total});
  function publish(){core.guard();if(emit(stringify(snapshot()))!==true)fail('Ungültige Übungsspeicher-Darstellung oder Protokollgrenze.');}
  function quota(){const error=new ErrorClass('Übungsspeicher ist voll: maximal 16 Einträge, 128 Zeichen je Schlüssel, 2048 je Wert, 16 KiB Text und 32 KiB Darstellung.');error.name='QuotaExceededError';throw error;}
  function ref(key){
    if(key!=='length')fail('Beim Übungsspeicher bitte die freigegebenen Methoden oder length verwenden.');
    return define({},'value',{get(){guard();return items.size;},set(){fail('Die Länge des Übungsspeichers ist nur lesbar.');}});
  }
  function bound(key){
    core.guard();if(!['getItem','setItem','removeItem','clear','key'].includes(key))fail('Diese Übungsspeicher-Methode ist nicht unterstützt.');
    return (...args)=>{
      guard();const required=key==='setItem'?2:key==='clear'?0:1;
      if(args.length<required)throw new TypeErrorClass('Übungsspeicher: '+key+' benötigt '+required+' Argumente.');
      if(key==='clear'){if(items.size){items.clear();bytes=0;publish();}return;}
      if(key==='key'){
        const value=args[0];if(value!==null&&['object','function'].includes(typeof value))fail('Speicherindex benötigt einen primitiven Wert.');
        if(['bigint','symbol'].includes(typeof value))throw new TypeErrorClass('Speicherindex kann nicht in eine Zahl umgewandelt werden.');
        const index=number(value)>>>0;return [...items.keys()][index]??null;
      }
      const name=text(args[0]);
      if(key==='getItem')return items.has(name)?items.get(name):null;
      if(key==='removeItem'){if(items.has(name)){bytes-=size(name)+size(items.get(name));items.delete(name);publish();}return;}
      const value=text(args[1]);
      if(name.length>limits.key||value.length>limits.value)quota();
      if(items.has(name)&&items.get(name)===value)return;
      const next=new Map(items);next.set(name,value);
      const total=bytes-(items.has(name)?size(items.get(name)):0)+(items.has(name)?0:size(name))+size(value);
      if(next.size>limits.entries||total>limits.bytes||size(stringify(snapshot(next,total)))>limits.snapshotBytes)quota();
      items.set(name,value);bytes=total;publish();
    };
  }
  return {handle,has:value=>value===handle,ref,bound,publish};
}

export function initialStorageProject(){
  const base=initialElementsProject();
  return {...base,html:'<h1>Aufgaben im Übungsspeicher</h1>\n<form id="formular">\n<label for="titel">Neue Aufgabe</label>\n<input id="titel" type="text">\n<button type="submit">Aufgabe speichern</button>\n</form>\n<p id="hinweis">Der Übungsspeicher gilt nur für diesen Debuglauf.</p>\n<div class="aktionen"><button id="ansicht" type="button">Nur Ansicht leeren</button><button id="laden" type="button">Aus Übungsspeicher laden</button><button id="leeren" type="button">Übungsspeicher löschen</button></div>\n<ul id="aufgaben"></ul>',files:{'main.js':`const formular = document.getElementById("formular");
const feld = document.getElementById("titel");
const liste = document.getElementById("aufgaben");
const hinweis = document.getElementById("hinweis");
let nummer = 1;
function zeigeAufgabe(schluessel, titel) {
  const eintrag = document.createElement("li");
  eintrag.className = "aufgabe";
  const text = document.createElement("span");
  text.textContent = titel;
  const entfernen = document.createElement("button");
  entfernen.type = "button";
  entfernen.textContent = "Entfernen";
  entfernen.addEventListener("click", () => {
    localStorage.removeItem(schluessel);
    eintrag.remove();
    hinweis.textContent = localStorage.length + " gespeicherte Aufgaben";
  });
  eintrag.append(text, entfernen);
  liste.append(eintrag);
}
formular.addEventListener("submit", event => {
  event.preventDefault();
  const titel = feld.value.trim();
  if (titel === "") {
    hinweis.textContent = "Bitte gib einen Titel ein.";
    return;
  }
  const schluessel = "aufgabe-" + nummer;
  try {
    localStorage.setItem(schluessel, titel);
  } catch (fehler) {
    hinweis.textContent = "Nicht gespeichert: " + fehler.message;
    return;
  }
  nummer++;
  zeigeAufgabe(schluessel, titel);
  feld.value = "";
  hinweis.textContent = localStorage.length + " gespeicherte Aufgaben";
});
document.getElementById("ansicht").addEventListener("click", () => {
  liste.replaceChildren();
  hinweis.textContent = "Ansicht leer, Übungsspeicher unverändert.";
});
document.getElementById("laden").addEventListener("click", () => {
  liste.replaceChildren();
  for (let i = 0; i < localStorage.length; i++) {
    const schluessel = localStorage.key(i);
    const titel = localStorage.getItem(schluessel);
    zeigeAufgabe(schluessel, titel);
  }
  hinweis.textContent = "Aus dem laufenden Übungsspeicher geladen.";
});
document.getElementById("leeren").addEventListener("click", () => {
  localStorage.clear();
  liste.replaceChildren();
  hinweis.textContent = "Übungsspeicher leer.";
});
`}};
}
