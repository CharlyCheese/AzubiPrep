import { initialElementsProject } from './debugger-dom.js';

export const JSON_LIMITS=Object.freeze({bytes:16384,depth:16,nodes:512,field:2048,operations:256});

// Executed wholly inside QuickJS. Explicit program serialization is separate
// from the passive debugger display. Source cannot construct getters/Proxies;
// descriptors below additionally reject accessors without invoking them.
export function installDebugJSON(core,emit,limits){
  const stringify=JSON.stringify,parse=JSON.parse,string=String,isArray=Array.isArray,isInteger=Number.isInteger;
  const descriptor=Object.getOwnPropertyDescriptor,keys=Object.keys,proto=Object.getPrototypeOf,create=Object.create,define=Object.defineProperty,setProto=Object.setPrototypeOf;
  const objectProto=Object.prototype,arrayProto=Array.prototype,TypeErrorClass=TypeError;
  const globals=Object.create(null);for(const name of ['JSON','Array','Number'])globals[name]=create(null);
  let operations=0;
  const fail=text=>{emit(stringify({error:text}));core.abort(text);};
  const guard=()=>{core.guard();if(++operations>limits.operations)fail('JSON-/Prüfmethoden: Operationsgrenze erreicht.');};
  function size(value){let n=0;for(let i=0;i<value.length;i++){const c=value.charCodeAt(i);if(c<128)n++;else if(c<2048)n+=2;else if(c>=55296&&c<=56319&&i+1<value.length&&value.charCodeAt(i+1)>=56320&&value.charCodeAt(i+1)<=57343){n+=4;i++;}else n+=3;}return n;}
  function copyData(root){
    let count=0,bytes=0;const path=new Set();
    function field(text){if(text.length>limits.field)fail('JSON-Feldgrenze erreicht.');bytes+=size(text);if(bytes>limits.bytes)fail('JSON-Textgrenze erreicht.');}
    function walk(value,depth){
      if(++count>limits.nodes)fail('JSON-Datenmengengrenze erreicht.');
      if(value===null||['undefined','boolean','number'].includes(typeof value))return value;
      if(typeof value==='string'){field(value);return value;}
      if(typeof value!=='object'||core.opaque(value))fail('JSON unterstützt hier nur eigene Daten ohne Funktionen oder Modellhandles.');
      if(depth>=limits.depth)fail('JSON-Tiefengrenze erreicht.');
      if(path.has(value))throw new TypeErrorClass('Zyklische Daten können nicht als JSON gespeichert werden.');
      const array=isArray(value),parent=proto(value);
      if(parent!==null&&parent!==(array?arrayProto:objectProto))fail('JSON unterstützt hier nur einfache Datenobjekte und Arrays.');
      const hook=descriptor(value,'toJSON');if(hook&&(!Object.hasOwn(hook,'value')||typeof hook.value==='function'))fail('JSON-Hooks und Getter sind im Debugger nicht freigegeben.');
      path.add(value);let result;
      try{
        if(array){
          const length=descriptor(value,'length').value;if(length>limits.nodes)fail('JSON-Datenmengengrenze erreicht.');
          result=[];setProto(result,null);
          for(let i=0;i<length;i++){const own=descriptor(value,string(i));if(own&&!Object.hasOwn(own,'value'))fail('JSON-Getter sind nicht freigegeben.');define(result,string(i),{value:walk(own?.value,depth+1),enumerable:true,writable:true,configurable:true});}
        }else{
          result=create(null);const names=keys(value);if(names.length>limits.nodes)fail('JSON-Datenmengengrenze erreicht.');
          for(const key of names){field(key);const own=descriptor(value,key);if(!Object.hasOwn(own,'value'))fail('JSON-Getter sind nicht freigegeben.');define(result,key,{value:walk(own.value,depth+1),enumerable:true,writable:true,configurable:true});}
        }
        return result;
      }finally{path.delete(value);}
    }
    return walk(root,0);
  }
  function depthCheck(text){let depth=0,quoted=false,escape=false;for(const c of text){if(quoted){if(escape)escape=false;else if(c==='\\')escape=true;else if(c==='"')quoted=false;}else if(c==='"')quoted=true;else if(c==='['||c==='{'){if(++depth>limits.depth)fail('JSON-Tiefengrenze erreicht.');}else if(c===']'||c==='}')depth--;}}
  function kind(handle){for(const name of ['JSON','Array','Number'])if(handle===globals[name])return name;return null;}
  function bound(handle,key){
    core.guard();const name=kind(handle);
    if(!(name==='JSON'&&['parse','stringify'].includes(key)||name==='Array'&&key==='isArray'||name==='Number'&&key==='isInteger'))fail('Diese JSON-/Prüfmethode ist nicht freigegeben.');
    return(...args)=>{
      guard();if(name==='Array')return isArray(args[0]);if(name==='Number')return isInteger(args[0]);
      if(args.length>1)fail('JSON bitte ohne Reviver, Replacer oder Formatierungsoptionen verwenden.');
      if(key==='stringify'){const text=stringify(copyData(args[0]));if(text!==undefined&&size(text)>limits.bytes)fail('JSON-Ausgabegrenze erreicht.');return text;}
      const value=args[0];if(value!==null&&['object','function','symbol'].includes(typeof value))fail('JSON-Eingabe benötigt primitiven Text ohne Objektkonvertierung.');
      const text=string(value);if(size(text)>limits.bytes)fail('JSON-Eingabegrenze erreicht.');depthCheck(text);
      const result=parse(text);copyData(result);return result;
    };
  }
  return {globals,has:handle=>kind(handle)!==null,bound,ref(){fail('JSON-/Prüfmethoden bitte direkt aufrufen; Aliase und freie Eigenschaften sind nicht freigegeben.');}};
}

export function initialJSONProject(){
  const base=initialElementsProject();
  return {...base,css:base.css+' label {display:block; margin-top:12px} textarea {display:block; width:100%; max-width:600px; height:100px; font-size:16px; padding:10px} button {margin-right:8px; margin-bottom:8px}',html:'<h1>Geprüfter JSON-Aufgabenstand</h1>\n<form id="formular"><label for="titel">Neue Aufgabe</label><input id="titel" type="text"><button type="submit">Aufgabe hinzufügen</button></form>\n<p id="meldung">Zustand und Übungsspeicher sind zunächst leer.</p>\n<ul id="liste"></ul>\n<button id="speichern" type="button">Zustand speichern</button><button id="ansicht" type="button">Nur Ansicht leeren</button><button id="laden" type="button">Zustand laden</button>\n<label for="json">JSON-Testtext</label><textarea id="json">{"version":1,"tasks":[]}</textarea><button id="test" type="button">Testtext im Übungsspeicher ablegen</button>',files:{'main.js':`const formular = document.getElementById("formular");
const feld = document.getElementById("titel");
const liste = document.getElementById("liste");
const meldung = document.getElementById("meldung");
const testfeld = document.getElementById("json");
let tasks = [];
let nextId = 1;
function validTasks(value) {
  if (!Array.isArray(value) || value.length > 6) return false;
  const ids = [];
  for (const task of value) {
    if (!task || typeof task !== "object" || Array.isArray(task)) return false;
    if (typeof task.id !== "string" || !task.id || task.id.length > 40 || ids.includes(task.id)) return false;
    if (typeof task.title !== "string" || !task.title.trim() || task.title.length > 80) return false;
    if (!Number.isInteger(task.minutes) || task.minutes < 1 || task.minutes > 240) return false;
    if (typeof task.done !== "boolean") return false;
    ids.push(task.id);
  }
  return true;
}
function render() {
  liste.replaceChildren();
  for (const task of tasks) {
    const li = document.createElement("li");
    li.className = "aufgabe";
    li.textContent = task.title + " · " + task.minutes + " Min · " + (task.done ? "erledigt" : "offen");
    liste.append(li);
  }
}
formular.addEventListener("submit", event => {
  event.preventDefault();
  const title = feld.value.trim();
  if (!title || title.length > 80 || tasks.length >= 6) {
    meldung.textContent = "Bitte Titel mit 1–80 Zeichen verwenden; höchstens 6 Aufgaben.";
    return;
  }
  while (tasks.some(task => task.id === "t" + nextId)) nextId++;
  tasks.push({ id: "t" + nextId, title, minutes: 25, done: false });
  nextId++;
  render();
  feld.value = "";
  meldung.textContent = "Aufgabe im Arbeitsspeicher. Zum Sichern Zustand speichern wählen.";
});
document.getElementById("speichern").addEventListener("click", () => {
  try {
    if (!validTasks(tasks)) throw new Error("Ungültige Aufgaben");
    const text = JSON.stringify({ version: 1, tasks });
    localStorage.setItem("lernplan-v1", text);
    meldung.textContent = "JSON im laufenden Übungsspeicher gesichert.";
  } catch (error) { meldung.textContent = "Nicht gespeichert: " + error.message; }
});
document.getElementById("ansicht").addEventListener("click", () => {
  liste.replaceChildren();
  meldung.textContent = "Nur Ansicht geleert; Aufgaben und Übungsspeicher unverändert.";
});
document.getElementById("laden").addEventListener("click", () => {
  try {
    const raw = localStorage.getItem("lernplan-v1");
    if (raw === null) { meldung.textContent = "Noch kein gespeicherter Stand."; return; }
    const value = JSON.parse(raw);
    if (!value || value.version !== 1 || !validTasks(value.tasks)) throw new Error("Ungültiges Datenformat");
    tasks = value.tasks;
    render();
    meldung.textContent = "JSON gelesen, Format geprüft und erst dann übernommen.";
  } catch (error) {
    meldung.textContent = "Nicht geladen: " + error.name + ". Alter Zustand und gespeicherter Text bleiben unverändert.";
  }
});
document.getElementById("test").addEventListener("click", () => {
  try {
    localStorage.setItem("lernplan-v1", testfeld.value);
    meldung.textContent = "Testtext bewusst abgelegt. Zustand laden prüft ihn vor der Übernahme.";
  } catch (error) { meldung.textContent = "Testtext nicht gespeichert: " + error.message; }
});
`}};
}
