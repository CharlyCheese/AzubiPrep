import { PREPARED_CHAPTERS } from './prepared/catalog.js';
import { plannerHtml, taskData } from './prepared/shared.js';
import ch19 from './prepared/ch19.js';
import ch22 from './prepared/ch22.js';
import ch23 from './prepared/ch23.js';
import ch24 from './prepared/ch24.js';
import ch25 from './prepared/ch25.js';
import ch28 from './prepared/ch28.js';
import ch29 from './prepared/ch29.js';

const docSteps = new Set(['19-1','23-1','26-1','26-3','26-4','26-5','26-7','27-3','27-5','27-6','28-1','28-2','28-4','31-1','31-2','31-4','31-5']);
const manualSteps = new Set([...docSteps, '19-1','19-3','20-1','23-3','23-4','25-1','25-3','25-4','27-1','27-2','28-3','29-7','30-6','30-7','30-8','30-9','30-10','30-11','30-12','31-3']);
function activeText(text) {
  return text.replaceAll('Promise-Aufgaben benötigen später ihre eigene geprüfte Laufzeit.', 'Promise-Aufgaben laufen in der geprüften begrenzten Übungsansicht.').replaceAll('erst die spätere kontrollierte Browserintegration verwendet', 'die kontrollierte Übungsintegration verwendet').replaceAll('Router-6-Vorlage', 'deklarative Router-Vorlage (VM 6, extern 7)').replaceAll('model.test.mjs','tests/model.test.js')
    .replaceAll('Die Werkzeugvorlage ist noch technisch vorzubereiten.', 'Die externe Werkzeugvorlage findest du unter „Projekt sichern und einlesen“.')
    .replaceAll('technische Integration dieser Inhaltsfassung bleibt offen', 'die feste Teilprüfung und tatsächliche manuelle Nachweise getrennt dokumentieren')
    .replaceAll('Die automatische Werkstattprüfung wird erst nach ihrer technischen Integration als Nachweis verfügbar; bis dahin zählen nur tatsächlich ausgeführte externe Prüfungen.', 'Die Werkstattprüfung liefert feste Teilnachweise; externe Werkzeug-, Bedien- und Layoutprüfungen zusätzlich tatsächlich durchführen und dokumentieren.')
    .replaceAll('die bekannte React-Router-6-API', 'die bekannten deklarativen React-Router-APIs (lokale Übungs-VM: Version 6; externe Vorlage: Version 7 mit denselben hier verwendeten Komponenten)')
    .replaceAll('der späteren Vorlage', 'der verfügbaren externen Vorlage')
    .replaceAll('Die Typbibliotheken für DOM und Compileroptionen liefert später die feste Vorlage.', 'Die lokale Typprüfung und die externe Vorlage enthalten DOM-Typbibliotheken und feste Compileroptionen.')
    .replaceAll('TS-Dateien werden nicht in die bestehende JS-Konsole importiert.', 'TS-Dateien werden hier in der neuen Übungsansicht geprüft und übersetzt; die bisherige reine JS-Konsole bleibt getrennt.');
}
export const ADVANCED_LESSONS = PREPARED_CHAPTERS.filter(chapter => chapter.number >= 19).flatMap(chapter => chapter.lessons.map((unit, index) => {
  const key = `${chapter.number}-${index + 1}`;
  return { ...unit, id: `course-${key}`, unit: index + 1, advanced: true, jsStep: false, stage: 800 + chapter.number,
    version: 'practice-1.0', status: 'Übung eingebunden', rules: ['advanced-program'], manualStep: manualSteps.has(key), documentStep: docSteps.has(key),
    explain: [...unit.explain.map(activeText), 'Werkstatt: Nutze Schreiben für die Projektdateien und Vorschau für die begrenzte interaktive Übungsansicht. „Aufgabe prüfen“ kontrolliert feste Teilanforderungen. Eigene Begründungen, Werkzeugabläufe und Bedienprüfungen gehören zusätzlich ins Prüfprotokoll; ein bestandener Teiltest beweist kein vollständiges Verständnis.'],
    criteria: unit.criteria.map(activeText),
    solution: chapter.number===27&&index<2 ? unit.solution.replaceAll('"./model.js"','"../model.js"').replaceAll('"./data.js"','"../data.js"') : unit.solution,
    example: chapter.number===27&&index<2 ? unit.example.replaceAll('"./model.js"','"../model.js"').replaceAll('"./data.js"','"../data.js"') : unit.example,
    task: activeText(key==='26-6' ? 'Löse den Konflikt mit einer Funktion describeCount(count): 0 ergibt Keine Treffer, 2 ergibt 2 Treffer. Zeige describeCount(0) in #message und dokumentiere beide Fälle.' : unit.task).replace('Werkstattabnahme folgt später.', 'Führe die feste Prüfung aus und ergänze dein Prüfprotokoll.'),
    environment: chapter.number >= 26 ? 'Lokale Module und Übungsansicht; reale Terminal-/Git-/Buildabläufe zusätzlich extern durchführen und dokumentieren.' : 'QuickJS mit lokalem DOM-Modell und festen Daten; keine echten Netzwerk-/Apprechte.',
  };
}));
const text = content => ({ kind: 'text', content });
const html = (body, script = 'app.js', module = false) => '<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Übungsprojekt</title><script ' + (module ? 'type="module"' : 'defer') + ' src="' + script + '"></script></head><body>' + body + '</body></html>';
const basic = html('<main><h1 id="heading">Mein Lernplan</h1><p id="status">Noch keine Auswertung.</p><button id="count" type="button">Zählen</button><div id="actions"></div><ul id="tasks"></ul><p id="summary"></p><p id="message" role="status"></p></main>');
const parseMinutes = 'function parseMinutes(raw) { const text=raw.trim(); const value=Number(text); return !text || !Number.isInteger(value) || value<1 || value>240 ? null : value; }';
const validTasks = ch22.lessons[3].solution;
const loadTopics = ch24.lessons[4].solution;
const catalog = ch25.lessons[2].solution.replace('// reload.addEventListener', 'reload.addEventListener');
const taskStrings = taskData.replace(/id: (\d)/g, 'id: "$1"');
const typedValidation = ch29.lessons[4].solution.replace('function isTask', 'export function isTask');
const reactTypes = 'type Task = { id:string; title:string; minutes:number; done:boolean };\n';

function filesFor(lesson) {
  const c = lesson.chapter; const u = lesson.unit;
  let source = lesson.solution; let prefix = ''; let page = c >= 21 && c <= 23 ? plannerHtml : basic;
  let name = lesson.documentStep ? 'app.js' : c === 29 ? 'app.ts' : c >= 30 ? 'App.tsx' : 'app.js';
  const extra = {};
  if (c === 19) {
    page = basic;
    if (u===2||u===3) { prefix=taskData+'\n';source=(u===3?ch19.lessons[1].solution:source)+'\nconst result=report(tasks,20);console.log(result.count);console.log(result.minutes);for(const title of result.titles)console.log(title);'; }
    if(u===4) { prefix='const items=[{title:"Stift",stock:3,cents:100},{title:"Heft",stock:0,cents:200}];\n';source+='\nconst result=lagerBericht(items,100);console.log(result.valueCents);for(const title of result.titles)console.log(title);'; }
  }
  if (c === 20) {
    if (u === 1) { page = source.split('\n// app.js')[0]; source = ''; }
    if (u === 6) source = taskData + '\n' + ch19.lessons[1].solution + '\n' + source + '\nrenderReport(report(tasks,20));';
    if(u===4){source=source.replace('status.classList.toggle("ready", ready);','status.classList.toggle("ready", ready);\n  status.textContent=ready?"Bereit":"Noch nicht bereit";');extra['style.css']=text('.ready {font-weight:bold;}');page=page.replace('</head>','<link rel="stylesheet" href="style.css"></head>');}
  }
  if (c === 21) {
    if (u === 2) { const marker = source.indexOf('// app.js:'); page = html(source.slice(source.indexOf('<form'), marker)); source = source.slice(marker + 10); }
    if (u === 5) { page = basic; prefix = 'const message=document.querySelector("#message");\n'; }
    if (u === 6) prefix = parseMinutes + '\n';
    if (u === 1) page = basic;
  }
  if (c === 22) {
    if (u === 2) {prefix = taskStrings+'\nconst list=document.querySelector("#tasks"),summary=document.querySelector("#summary");\n';source+='\nrender(tasks);';}
    if (u === 3) prefix = taskStrings + '\n';
    if (u === 5) prefix = validTasks + '\n';
  }
  if (c === 23) {
    if (u === 1) source = '';
    if (u === 2) {
      prefix = 'const titleInput=document.querySelector("#title"); function render(){document.querySelector("#summary").textContent=tasks.length+" Aufgaben";}\n';
    }
    if (u === 3) source = ch23.lessons[3].solution;
  }
  if (c === 24) {
    if (u === 3) prefix = ch24.lessons[1].solution.split('verdoppelnSpaeter(3)')[0] + '\n';
    if (u === 6 || u === 7) prefix = loadTopics + '\nconst button=document.querySelector("button"); let state={status:"idle",items:[],error:""}; function render(value){ document.querySelector("#status").textContent=value.status; }\n';
  }
  if (c === 25) {
    page = ch25.lessons[0].solution;
    if (u === 1) source = '';
    if (u === 4) source = catalog;
    if (u === 3) source = catalog;
  }
  if (c === 26 && u === 2) {
    page = html('<h1>Module</h1><p>Die reine Auswahl wird separat geprüft.</p>', 'app.js', true);
    extra['model.js'] = text(source.split('// app.js')[0].replace('// model.js',''));
    source = 'import {selectTopics} from "./model.js"; export {selectTopics};\nconsole.log(selectTopics([{id:"1",title:"CSS",category:"Web"}]," css ","all").length);';
  }
  if (c === 26 && u === 6) source = 'function describeCount(count) { return count === 0 ? "Keine Treffer" : count + " Treffer"; }\ndocument.querySelector("#message").textContent=describeCount(0);';
  if (c === 27 && (u === 1 || u === 2)) {
    name = u===1 ? 'tests/model.test.js' : 'tests/data.test.js';
    page = html('<h1>Lokale Modelltests</h1><p>Die verknüpfte Testdatei läuft ausschließlich in der VM; echte Node-Tests zusätzlich in der externen Vorlage ausführen.</p>', name, true);
    extra[u === 1 ? 'model.js' : 'data.js'] = text(u === 1 ? ch25.lessons[1].solution.replace('function selectTopics', 'export function selectTopics') : loadTopics.replace('async function loadTopics', 'export async function loadTopics'));
  }
  if (c === 28 && u === 3) {
    const sections = ch28.lessons[2].solution.split('Aufteilung, jeder Dateiname beginnt einen eigenen Abschnitt:')[1];
    const matches = [...sections.matchAll(/\/\/ (model|data|view|request|app)\.js[^\n]*\n/g)];
    for (let i=0;i<matches.length;i++) { const file = matches[i][1]+'.js'; const code=sections.slice(matches[i].index+matches[i][0].length,matches[i+1]?.index).split('// index.html aus Projekt 5')[0]; if(file==='app.js')source=code;else extra[file]=text(code); }
    page = ch25.lessons[0].solution.replace('src="app.js" defer', 'src="app.js" type="module"');
  }
  if (c === 29 && u === 6) prefix = 'function parseMinutes(raw:string):number|null { const value=Number(raw); return raw.trim() && Number.isInteger(value) && value>=1 && value<=240 ? value : null; }\n';
  if (c === 29) page = plannerHtml.replace('src="app.js" defer','src="app.ts" type="module"');
  if (c >= 30 && !lesson.documentStep) {
    page = html('<div id="root"></div>', name, true);
    extra['validation.ts'] = text(typedValidation);
    if (c === 30 && u === 3) source += '\nexport default function App(){return <main><h1>Liste</h1><TaskList tasks={[{id:"1",title:"HTML",minutes:20,done:false}]} /></main>;}';
    if (c === 30 && u === 5) source += '\nexport default TaskForm;';
    if (c === 30 && [6,7,8,9].includes(u)) source = reactStage(u);
    if (c === 30 && u === 10) source = 'import {useState,useEffect} from "react";\n' + loadTopics.replace('const ids = [];', 'const ids: string[] = [];').replace('function validTopics(value)', 'function validTopics(value: unknown): value is {id:string;title:string;category:string}[]').replace('function loadTopics(request)', 'function loadTopics(request: typeof fetch)') + '\nconst request=fetch;\nexport default function App(){const [state,setState]=useState<{status:"loading"}|{status:"ready";items:{id:string;title:string;category:string}[]}|{status:"error";error:string}>({status:"loading"});\n' + source + '\nreturn <main><h1>Katalog</h1><p role="status">{state.status==="loading"?"Katalog wird geladen":state.status==="error"?state.error:state.items.length===0?"Katalog ist leer":state.items.length+" Themen"}</p><ul>{state.status==="ready"?state.items.map(item=><li key={item.id}>{item.title}</li>):null}</ul></main>;}';
    if (c === 30 && u === 11) source = 'import {BrowserRouter,Routes,Route,Link,useParams} from "react-router-dom";\n' + reactTypes + source + '\nexport default function App(){const tasks:Task[]=[{id:"1",title:"HTML",minutes:20,done:false}];return <BrowserRouter><Routes><Route path="/" element={<main><h1>Übersicht</h1><Link to="/tasks/1">Details HTML</Link></main>}/><Route path="/tasks/:id" element={<Detail tasks={tasks}/>}/><Route path="*" element={<h1>Seite nicht gefunden</h1>}/></Routes></BrowserRouter>;}';
  }
  extra['index.html'] = text(page);
  extra[name] = text(prefix + source + '\n');
  extra['pruefprotokoll.md'] = text('# Referenzerwartungen – eigene Durchführung zusätzlich nötig\n\n' + lesson.criteria.join('\n\n') + '\n\nDie Referenz ist kein Beleg eigener Durchführung. Eigene Soll-/Istwerte und tatsächliche Nachweise ergänzen.');
  return { files: extra, name, prefix };
}

function reactStage(unit) {
  const refs = unit >= 8;
  const persistence = unit >= 9;
  return `import {useState${refs ? ',useRef' : ''}${persistence ? ',useEffect' : ''}} from "react";
${reactTypes}
${persistence ? `import {isTask} from "./validation";
type Snapshot={tasks:Task[];writable:boolean;error:string};
function readInitial():Snapshot{try{const raw=localStorage.getItem("react-plan-v1");if(raw===null)return{tasks:[],writable:true,error:""};const value:unknown=JSON.parse(raw);if(typeof value!=="object"||value===null||!("version" in value)||value.version!==1||!("tasks" in value)||!Array.isArray(value.tasks)||value.tasks.length>200||!value.tasks.every(isTask))throw new Error("Format");const tasks:Task[]=value.tasks;if(new Set(tasks.map(t=>t.id)).size!==tasks.length)throw new Error("Doppelte ID");return{tasks,writable:true,error:""};}catch{return{tasks:[],writable:false,error:"Alter Stand nicht lesbar; bleibt unverändert."};}}` : ''}
function TaskForm({onAdd}:{onAdd:(title:string,minutes:number)=>boolean}){
  const [title,setTitle]=useState("");const [raw,setRaw]=useState("");const [error,setError]=useState("");
  ${refs ? 'const input=useRef<HTMLInputElement>(null);' : ''}
  function submit(event:React.FormEvent<HTMLFormElement>){event.preventDefault();const n=Number(raw);if(!title.trim()||title.trim().length>80||!raw.trim()||!Number.isInteger(n)||n<1||n>240){setError("Titel und Minuten prüfen");return;}if(!onAdd(title.trim(),n)){setError("Höchstens 200 Aufgaben");return;}setTitle("");setRaw("");setError("");${refs ? 'input.current?.focus();' : ''}}
  return <form onSubmit={submit}><label htmlFor="title">Lernziel</label><input id="title" ${refs ? 'ref={input}' : ''} value={title} onChange={e=>setTitle(e.target.value)}/><label htmlFor="minutes">Minuten</label><input id="minutes" value={raw} onChange={e=>setRaw(e.target.value)}/><button>Hinzufügen</button><p role="status">{error}</p></form>;
}
function TaskList({tasks${unit >= 7 ? ',onToggle,onRemove' : ''}}:{tasks:Task[]${unit >= 7 ? ';onToggle:(id:string)=>void;onRemove:(id:string)=>void' : ''}}){return <ul>{tasks.map(task=><li key={task.id}>{task.title} · {task.minutes} Minuten${unit >= 7 ? '<button onClick={()=>onToggle(task.id)}>Erledigen</button><button onClick={()=>onRemove(task.id)}>Entfernen</button>' : ''}</li>)}</ul>;}
export default function App(){
  ${persistence ? 'const [initial]=useState(readInitial);const [tasks,setTasks]=useState<Task[]>(initial.tasks);const [message,setMessage]=useState(initial.error);' : 'const [tasks,setTasks]=useState<Task[]>([]);'}
  ${unit >= 7 ? 'const [query,setQuery]=useState("");' : ''}
  ${refs ? 'const heading=useRef<HTMLHeadingElement>(null);' : ''}
  ${persistence ? 'useEffect(()=>{if(!initial.writable)return;try{localStorage.setItem("react-plan-v1",JSON.stringify({version:1,tasks}));setMessage("Lokal gespeichert");}catch{setMessage("Nicht gespeichert; nur Arbeitsspeicher.");}},[tasks,initial.writable]);' : ''}
  function add(title:string,minutes:number):boolean{if(tasks.length>=200)return false;const id=crypto.randomUUID();setTasks(previous=>[...previous,{id,title,minutes,done:false}]);return true;}
  ${unit >= 7 ? 'function toggle(id:string){setTasks(previous=>previous.map(task=>task.id===id?{...task,done:!task.done}:task));}function remove(id:string){setTasks(previous=>previous.filter(task=>task.id!==id));'+(refs?'heading.current?.focus();':'')+'}const visible=tasks.filter(task=>task.title.toLowerCase().includes(query.trim().toLowerCase()));' : 'const visible=tasks;'}
  return <main><h1>Lernplan</h1><TaskForm onAdd={add}/>${persistence ? '<p role="status">{message}</p>' : ''}${unit >= 7 ? '<label htmlFor="search">Suchen</label><input id="search" value={query} onChange={e=>setQuery(e.target.value)}/>' : ''}<h2 ${refs ? 'ref={heading} tabIndex={-1}' : ''}>Lernziele</h2><p role="status">{visible.length} Treffer</p>{tasks.length===0?<p>Noch keine Lernziele</p>:visible.length===0?<p>Keine passenden Lernziele</p>:null}<TaskList tasks={visible} ${unit >= 7 ? 'onToggle={toggle} onRemove={remove}' : ''}/>${unit >= 7 ? '<p>{tasks.filter(t=>!t.done).reduce((sum,t)=>sum+t.minutes,0)} Minuten offen</p>' : ''}</main>;
}`;
}

export function advancedFiles(lesson, starter = false) {
  const { files, name, prefix } = filesFor(lesson);
  if (lesson.documentStep) { files['pruefprotokoll.md'] = text(starter ? '# Eigenes Prüfprotokoll\n\n' : lesson.solution); files[name] = text('// Diese Etappe verlangt einen dokumentierten eigenen Nachweis.\n'); }
  else if (starter) {
    files[name] = text(prefix + '// Bearbeite hier die aktuelle Aufgabe.\n');
    if (lesson.chapter===30 && lesson.unit>=2) {
      const previous=ADVANCED_LESSONS.find(item=>item.chapter===30&&item.unit===lesson.unit-1);
      files[name]=text(filesFor(previous).files['App.tsx'].content+'\n// TODO: Ergänze jetzt nur die neue Anforderung dieser Lektion.\n');
    }
    if (lesson.chapter===19&&lesson.unit===3)files[name]=text(ch19.lessons[1].solution+'\n// TODO: Eigene Grenz- und Mutationstests samt Ist-/Sollwerten dokumentieren.\n');
    if (lesson.chapter === 26 && lesson.unit === 2) files['model.js'] = text('// Exportiere hier selectTopics nach dem Vertrag aus Kapitel 25.\n');
    if (lesson.chapter === 28 && lesson.unit === 3) {
      files['model.js'].content=files['model.js'].content.replace('query.trim().toLowerCase()', 'query').replace('&& (category', '|| (category');
      files['view.js'].content=files['view.js'].content.replace('list.replaceChildren();','// BUG: alter Listeninhalt bleibt erhalten.');
      files['data.js'].content=files['data.js'].content.replace('if (!response.ok)', 'if (false)');
    }
    if (lesson.chapter === 20 && lesson.unit === 1 || lesson.chapter === 25 && lesson.unit === 1) files['index.html'] = text(html('<main><!-- Baue hier die verlangte Oberfläche. --></main>'));
  }
  if(starter)files['pruefprotokoll.md']=text('# Eigenes Prüfprotokoll\n\nAuftrag / Vorhersage:\n\nFälle mit Soll / Ist / Nachweis:\n\nEigene Erklärung und offene Grenzen:\n');
  return files;
}
