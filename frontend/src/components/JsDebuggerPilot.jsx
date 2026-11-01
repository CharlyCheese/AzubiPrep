import { checkDebugCSS, checkDebugCSSFile, initialCSSProject } from '../pilot/debugger-css.js';
import DebugDOMPreview from './DebugDOMPreview.jsx';
import { initialDebugHTML, initialDOMProject } from '../pilot/debugger-dom.js';
import { useEffect, useRef, useState } from 'react';
import { debugSourceLines } from '../pilot/debugger-core.js';
import { startDebugger } from '../pilot/debugger.js';
import { checkDebugProject, initialDebugProject, checkModulePath, folderDebugFiles } from '../pilot/debugger-project.js';
import { checkJsDraft } from '../pilot/js-draft.js';
import { downloadFile } from '../pilot/project.js';

export default function JsDebuggerPilot({draft,onChange,ready,moduleProject,onModuleChange,standalone=false}){
  const [opened,setOpened]=useState(standalone);
  const fallback=useRef(null);if(!fallback.current)fallback.current=initialDebugProject();
  const project=moduleProject||fallback.current;
  const [mode,setMode]=useState('script');const initialized=useRef(false);
  const [selectedFile,setSelectedFile]=useState(project.entry);
  useEffect(()=>{if(ready&&!initialized.current){initialized.current=true;if(moduleProject)setMode(moduleProject.html!==undefined?'dom':'module');}},[ready,moduleProject]);
  useEffect(()=>{if(!Object.hasOwn(project.files,selectedFile))setSelectedFile(project.entry);},[project,selectedFile]);
  const modular=mode!=='script',domMode=mode==='dom',input=domMode?{...project,mode:'dom',html:project.html??initialDebugHTML}:modular?project:draft,signature=JSON.stringify(input);
  const [domTree,setDomTree]=useState(null);
  const [idleCycle,setIdleCycle]=useState(0);
  const [status,setStatus]=useState('Debugger bereit. Start erfolgt nur auf deinen Klick.');
  const [phase,setPhase]=useState('ready');const [artifact,setArtifact]=useState(null);
  const [snapshot,setSnapshot]=useState(null);const [point,setPoint]=useState(null);
  const [selectedFrame,setSelectedFrame]=useState(0);
  const [logs,setLogs]=useState([]);const [error,setError]=useState('');const [breakpoints,setBreakpoints]=useState([]);
  const run=useRef(null);const epoch=useRef(0);const latest=useRef(signature);latest.current=signature;
  const cancel=()=>{epoch.current++;run.current?.dispose();run.current=null;};
  useEffect(()=>{cancel();setPhase('ready');setDomTree(null);setArtifact(null);setSnapshot(null);setPoint(null);setLogs([]);setBreakpoints([]);setError('');setStatus('Quellstand bereit. Starte den Debugger ausdrücklich.');return cancel;},[signature,mode]);
  function start(){
    cancel();const id=epoch.current;const source=signature;setPhase('preparing');setDomTree(null);setArtifact(null);setSnapshot(null);setPoint(null);setLogs([]);setError('');setBreakpoints([]);setStatus('Eigenen Code prüfen und vorbereiten …');
    let prepared=null;
    try{run.current=startDebugger(input,event=>{
      if(id!==epoch.current||source!==latest.current)return;
      if(event.type==='prepared'){prepared=event.artifact;setArtifact(event.artifact);}
      if(event.type==='dom')setDomTree(event.tree);
      if(event.type==='idle'){setIdleCycle(value=>value+1);setPhase('idle');setSnapshot(null);setPoint(null);setStatus('Bereit für Klicks in der HTML-Debugvorschau.');}
      if(event.type==='running'){setPhase('running');setStatus('Dein Programm läuft …');}
      if(event.type==='paused') {setPhase('paused');setSnapshot(event.snapshot);setSelectedFrame(event.snapshot.frames.at(-1).id);setPoint(event.point);if(modular)setSelectedFile(prepared.points[event.point].file);setStatus(`Angehalten · ${event.cause==='event'?'Ereignisstart':event.cause==='start'?'Programmstart':event.cause==='breakpoint'?'Haltepunkt':'Einzelschritt'}`);}
      if(event.type==='final'){setSnapshot(event.snapshot);setSelectedFrame(0);setPoint(null);if(modular)setSelectedFile(project.entry);}
      if(event.type==='log')setLogs(lines=>[...lines,event.text]);
      if(event.type==='done'){setPhase('done');setStatus('Dein Programm ist beendet. Es wurde dieselbe Ausführung fortgesetzt.');}
      if(event.type==='error'){setPhase('error');setSnapshot(null);setError(event.text);if(event.point!==undefined)setPoint(event.point);if(modular&&prepared?.points[event.point])setSelectedFile(prepared.points[event.point].file);setStatus('Debuglauf beendet.');}
      if(event.type==='stopped'){setPhase('stopped');setStatus(event.text);}
    });}catch(error){setPhase('error');setError(error.message);setStatus('Vorbereitung beendet.');}
  }
  function toggle(id){const ids=breakpoints.includes(id)?breakpoints.filter(value=>value!==id):[...breakpoints,id];setBreakpoints(ids);run.current?.breakpoints(ids);}
  const location=artifact?.points[point];
  const frame=snapshot?.frames.find(item=>item.id===selectedFrame)||snapshot?.frames.at(-1);
  const framePoint=artifact?.points[frame?.point];
  const shownName=modular?selectedFile:draft.name,shownSource=modular?project.files[selectedFile]||'':draft.source;
  function changeModule(value){try{const checked=checkDebugProject(value);cancel();onModuleChange(checked);}catch(error){setError(error.message);}}
  return <details open={opened} className="card pilot-disclosure js-debug-pilot" onToggle={event=>{if(event.target!==event.currentTarget)return;setOpened(event.currentTarget.open);if(!event.currentTarget.open){cancel();setPhase('stopped');setDomTree(null);setSnapshot(null);setArtifact(null);setPoint(null);setLogs([]);setError('');setStatus('Debugansicht geschlossen; Ausführung beendet.');}}}>
    <summary>Debugger-Technikpilot · eigener Code</summary>
    <section aria-label="Debugger-Technikpilot">
      <label>Debugmodus <select aria-label="Debugmodus" value={mode} disabled={!ready} onChange={event=>{cancel();setMode(event.target.value);if(event.target.value==='dom')onModuleChange(checkDebugProject({...project,html:project.html??initialDebugHTML}));else if(event.target.value==='module'&&!moduleProject)onModuleChange(checkDebugProject(project));}}><option value="script">Einzelne JavaScript-Datei</option><option value="module">Mehrere Dateien / Module</option><option value="dom">HTML und Klickereignisse</option></select></label>
      {modular&&<ModuleFiles project={project} selected={selectedFile} onSelect={setSelectedFile} onChange={changeModule} ready={ready}/>}
      {domMode&&<><label>HTML für Debugvorschau<textarea aria-label="HTML für Debugvorschau" className="pilot-code" spellCheck="false" disabled={!ready} value={project.html??initialDebugHTML} onChange={event=>changeModule({...project,html:event.target.value})}/></label><button className="btn btn-ghost" disabled={!ready} onClick={()=>{if(window.confirm('HTML, CSS und Moduldateien durch das DOM-Beispiel ersetzen?')){changeModule(initialDOMProject());setSelectedFile('main.js');}}}>DOM-Beispiel laden</button><p className="small">Erste DOM-Stufe: #id, .klasse oder Tag mit querySelector/querySelectorAll, getElementById, body, textContent, id, className, tagName, button.disabled und classList. add/removeEventListener unterstützt click ohne Optionen; Ereignisse bieten target/currentTarget, type, bubbles, defaultPrevented und die drei Steuerungsmethoden. Eigene CSS-Regeln werden ausschließlich im gesonderten Vorschaurahmen angewendet. Ressourcen, Links, Formulare und Skripte im HTML bleiben gesperrt.</p><DebugCSSFiles project={project} ready={ready} onChange={changeModule}/></>}
      <p>Debugger für eigene Variablen, Bedingungen, Schleifen und synchrone Funktionen mit einfachen Parametern und return. Auch Array-/Objektliterale, Indizes, length und eigene Datenfelder sind möglich. Er hält dein Programm tatsächlich an und setzt es fort. Arrays und Objekte bleiben in der Variablenansicht Platzhalter. Getter und asynchrone Programme folgen später. Im Modus „HTML und Klickereignisse“ kannst du Elemente auswählen, Texte und Klassen ändern und Klickhandler schrittweise verfolgen.</p>
      <p className="small">Für Arrays sind push, pop, shift, unshift, slice, includes, indexOf und join möglich. map, filter, forEach, some, every, find und reduce unterstützen synchrone Rückruffunktionen: zum Beispiel liste.map(n =&gt; n * 2), anonyme function-Ausdrücke oder direkt übergebene benannte Funktionen. Die Rückrufe bekommen eigene Aufrufe und Parameter in der Debugansicht. Gespeicherte Pfeilfunktionen, eigene Callback-Aufrufe und zurückgegebene Closures sind möglich. Äußere Bindungen bleiben auch nach dem Ende des Erzeugers sichtbar. Funktionswerte erscheinen als Platzhalter; Funktions-Quelltext und -Reflexion bleiben ausgeschlossen.</p>
      <p className="small">{modular?'Das Modulprojekt wird getrennt vom einzelnen JavaScript-Entwurf gespeichert.':'Du bearbeitest dieselbe Datei wie unter „JavaScript ausprobieren“.'} Codeänderung, Schließen oder Stop beendet den Debuglauf. Variablenwerte bleiben flüchtig und werden nicht an KI übertragen oder gesichert.</p>
      <p className="small">Mit try, catch, finally und throw kannst du eigene synchrone Fehler behandeln. Catch- und Finally-Blöcke haben eigene Haltepositionen. new Error("Nachricht") und die üblichen Standardfehler sind möglich; bei Fehlerobjekten kannst du name und message lesen. Stack und interne Fehlerdetails bleiben gesperrt. Schutz- und Ressourcengrenzen beenden den Lauf weiterhin endgültig.</p>
      <label>Eigener Debugcode · {shownName}<textarea aria-label="Eigener Debugcode" className="pilot-code" spellCheck="false" disabled={!ready} value={shownSource} onChange={event=>{if(modular)changeModule({...project,files:{...project.files,[shownName]:event.target.value}});else{cancel();onChange({...draft,source:event.target.value});}}} /></label>
      <p className="small">Beim Start hält der Debugger vor der ersten ausführbaren Anweisung an. Mit „Einzelner Schritt“ geht es eine Anweisung weiter; „Weiter / bis zum nächsten Haltepunkt“ läuft ohne gesetzte Haltepunkte bis zum Programmende.</p>
      <div className="pilot-toolbar"><button className="btn btn-primary" disabled={!ready} onClick={start}>Debuggen starten</button><button className="btn btn-ghost" disabled={phase!=='paused'} onClick={()=>run.current?.resume('step')}>Einzelner Schritt</button><button className="btn btn-ghost" disabled={phase!=='paused'} onClick={()=>run.current?.resume('over')}>Funktion überspringen</button><button className="btn btn-ghost" disabled={phase!=='paused'||snapshot?.frames.length<=1} onClick={()=>run.current?.resume('out')}>Funktion verlassen</button><button className="btn btn-ghost" disabled={phase!=='paused'} onClick={()=>run.current?.resume('continue')}>Weiter / bis zum nächsten Haltepunkt</button><button className="btn btn-ghost" disabled={!['preparing','running','paused','idle'].includes(phase)} onClick={()=>run.current?.stop()}>Debuggen stoppen</button></div>
      <p role="status" aria-label="Debugstatus">{location&&!location.synthetic?`Vor ${location.file||draft.name}:${location.line}:${location.column}. `:''}{status}</p>{error&&<pre role="alert" aria-label="Debugfehler">{error}</pre>}
      {artifact&&<><p>Setze Haltepunkte an den angebotenen Anweisungspositionen. Zeile und Spalte unterscheiden mehrere Anweisungen derselben Zeile. Die Markierung zeigt die nächste Anweisung beziehungsweise bei Fehlern den letzten Kontrollpunkt.</p><ol className="js-trace-source" aria-label="Debugquelltext">{debugSourceLines(shownSource).map((line,index)=><li key={index} aria-current={location&&!location.synthetic&&(!modular||location.file===selectedFile)&&location.line===index+1?'step':undefined}><span>{index+1}</span><code>{line||' '}</code><div className="pilot-toolbar">{artifact.points.filter(item=>!item.end&&item.kind!=='context'&&(!modular||item.file===selectedFile)&&item.line===index+1).map(item=><button key={item.id} className="btn btn-ghost" disabled={!['running','paused','idle'].includes(phase)} aria-label={`Debug-Haltepunkt ${modular?selectedFile+' ':''}Zeile ${item.line} Spalte ${item.column}`} aria-pressed={breakpoints.includes(item.id)} onClick={()=>toggle(item.id)}>{breakpoints.includes(item.id)?'●':'○'} {item.line}:{item.column}</button>)}</div></li>)}</ol></>}
      {snapshot&&<details open><summary>{phase==='paused'?'Aufrufkette':'Zuletzt erfasste Aufrufkette'}</summary><div className="pilot-toolbar" role="group" aria-label="Debug-Aufrufkette">{[...snapshot.frames].reverse().map(item=>{const pos=artifact.points[item.point];return <button key={item.id} className="btn btn-ghost" aria-pressed={frame?.id===item.id} onClick={()=>{setSelectedFrame(item.id);if(modular&&!pos.synthetic)setSelectedFile(pos.file);}}>{pos.synthetic?'Vorschauklick':`${artifact.functions[item.functionId].name} · Aufruf ${item.id} · ${modular?pos.file+':':''}${pos.line}:${pos.column}`}</button>;})}</div><p className="small">Auswahl zeigt passive Werte dieses Aufrufs. Schritte steuern immer den aktuell laufenden obersten Aufruf.</p></details>}
      <section aria-label="Debugvariablen"><h3>{phase==='paused'?'Variablen vor dem nächsten Schritt':'Zuletzt erfasste Variablen'}</h3>{frame&&<p>Ausgewählter Aufruf: {artifact.functions[frame.functionId].name} · {frame.id}</p>}{frame?frame.scopes.map(scope=><details key={scope.id} open><summary>{framePoint?.scopes.find(item=>item.id===scope.id)?.label||'Scope'}{framePoint?.scopes.find(item=>item.id===scope.id)?.captured?' · äußere Bindungen':''}</summary>{scope.values.length?<div className="js-trace-table"><table><thead><tr><th>Name</th><th>Typ</th><th>Wert</th></tr></thead><tbody>{scope.values.map(value=><tr key={value.name}><th>{value.name}</th><td>{value.type}</td><td>{value.type==='string'?JSON.stringify(value.display):value.display}</td></tr>)}</tbody></table></div>:<p>Keine angezeigten Bindungen.</p>}</details>):<p>Noch kein Halt.</p>}{snapshot?.truncated&&<p>Die Anzeige wurde wegen ihrer Größenbegrenzung gekürzt.</p>}</section>
      {domMode&&<DebugDOMPreview css={project.css??''} cycle={idleCycle} tree={domTree} active={phase==='idle'} onClick={node=>{if(run.current?.click(node)){setPhase('running');setStatus('Klick wird ausgeführt …');}}}/>}
      <pre aria-label="Debugkonsole">{logs.length?logs.join('\n'):'Noch keine Ausgabe.'}</pre>
      <details><summary>Grenzen des Technikpiloten</summary><p>64 KiB Quelltext, 512 Zeilen, höchstens 32 aktive Aufrufe einschließlich Programm, 16 MiB JS-Heap, 64 KiB Interpreter-/Asyncify-Stack, höchstens 32 MiB WASM-Speicher, eine Sekunde kumulative aktive Zeit und fünf Minuten unbediente Pause. DOM: 16 KiB HTML, 128 Knoten, Tiefe 16, 2048 Zeichen je Feld, 16 KiB Gesamttext, 32 KiB Darstellung, 128 Listenerregistrierungen, 64 Klickaktionen und 2048 Schreiboperationen pro Lauf. Weitere AST-/Ausgabe-/Nachrichtengrenzen schützen die Bedienung. Die Wartezeit beim Lesen wird nicht als aktive Programmlaufzeit gezählt.</p><p>for/for…of/while/do, break und continue sind möglich. Vor dem Schleifenstart sowie am Rumpfbeginn und vor seinen Anweisungen wird gehalten; Bedingungen und Inkremente sind keine eigenen Haltepositionen. Explizite Haltepunkte gelten auch beim Überspringen/Verlassen. Funktionsdeklarationen stehen auf Programmebene; gespeicherte Pfeile und anonyme function-Ausdrücke sind auch innerhalb anderer Funktionen möglich. Keine verschachtelten Deklarationen, Standard-/Restparameter, freien Ausdrücke/Watches, Objektinspektion oder App-, Datei- und Netzwerkrechte. Die bisherigen Kursprüfungen laufen getrennt in ihrer normalen Laufzeit.</p></details>
    </section>
  </details>;
}

function DebugCSSFiles({project,ready,onChange}){
  const [message,setMessage]=useState('');const current=useRef(project);current.current=project;const generation=useRef(0);
  useEffect(()=>()=>{generation.current++;},[]);
  async function read(event){
    const list=[...event.target.files];event.target.value='';const id=++generation.current,before=current.current;if(!list.length)return;
    try{
      if(list.length!==1)throw new Error('Bitte genau eine CSS-Datei wählen.');checkDebugCSSFile(list[0]);
      if(!window.confirm('Den CSS-Entwurf durch diese Datei ersetzen? Es wird nichts automatisch ausgeführt.'))return;
      const css=checkDebugCSS(await list[0].text());if(id!==generation.current||before!==current.current)return;
      onChange({...before,css});setMessage('CSS lokal eingelesen. Starte den Debugger für die neue Fassung.');
    }catch(error){if(id===generation.current)setMessage(error.message);}
  }
  return <details className="debug-css-editor"><summary>CSS bearbeiten und einlesen · styles.css</summary>
    <label>CSS für Debugvorschau<textarea aria-label="CSS für Debugvorschau" className="pilot-code" spellCheck="false" disabled={!ready} value={project.css??''} onChange={event=>onChange({...project,css:event.target.value})}/></label>
    <div className="pilot-toolbar"><label className="btn btn-ghost pilot-upload">CSS-Datei einlesen<input aria-label="CSS-Datei einlesen" type="file" accept=".css" disabled={!ready} onChange={read}/></label><button className="btn btn-ghost" onClick={()=>downloadFile('styles.css',{kind:'text',content:checkDebugCSS(project.css??'')})}>CSS-Datei exportieren</button></div>
    <p className="small">Eine eigene CSS-Datei bis 16 KiB. Farben, Schrift, Abstände, Flex/Grid und einfache Medienregeln sind möglich. Nicht unterstützte Regeln werden mit Hinweis entfernt; Ressourcen und Imports bleiben gesperrt. Änderungen beenden den bisherigen Debuglauf. HTML/CSS werden separat eingegeben, Modulordner lesen weiterhin ausschließlich JavaScript-Dateien.</p>
    {message&&<p role="status" aria-label="CSS-Importstatus">{message}</p>}
    <button className="btn btn-ghost" disabled={!ready} onClick={()=>{if(window.confirm('HTML, CSS und Moduldateien durch das CSS-Beispiel ersetzen?'))onChange(initialCSSProject());}}>CSS-Beispiel laden</button>
  </details>;
}

function ModuleFiles({project,selected,onSelect,onChange,ready}){
  const [name,setName]=useState('');const [message,setMessage]=useState('');const [notice,setNotice]=useState('');
  const current=useRef(project);current.current=project;const generation=useRef(0);
  useEffect(()=>()=>{generation.current++;},[]);
  function change(value){try{onChange(checkDebugProject(value));setMessage('');setNotice('');return true;}catch(error){setMessage(error.message);return false;}}
  async function read(event,backup=false,folder=false){
    const list=[...event.target.files];event.target.value='';if(!list.length)return;
    const id=++generation.current,before=current.current;
    try{
      for(const file of list){
        if(!folder&&(!Number.isSafeInteger(file.size)||file.size<0))throw new Error('Ungültige Dateigröße.');
        if(!folder&&file.webkitRelativePath&&file.webkitRelativePath!==file.name)throw new Error('Bitte einzelne Dateien ohne Ordnerpfade auswählen.');
        if(!folder&&(file.name.startsWith('.')||/[\\/:]/.test(file.name)))throw new Error('Sensible Dateinamen oder Pfade werden nicht eingelesen.');
      }
      let value,folderNotice='';
      if(folder){
        const {entries,skipped}=folderDebugFiles(list),files={};
        for(const entry of entries)files[entry.name]=await entry.file.text();
        const entry=Object.hasOwn(files,before.entry)?before.entry:Object.hasOwn(files,'main.js')?'main.js':Object.hasOwn(files,'js/main.js')?'js/main.js':Object.hasOwn(files,'src/main.js')?'src/main.js':entries[0].name;
        value=checkDebugProject({schema:1,mode:'module',entry,files});
        folderNotice=`${entries.length} Moduldateien übernommen; ${skipped} ungeeignete oder private Dateien ohne Lesen übersprungen.`;
      }else if(backup){
        if(list.length!==1||!(/^[a-zA-Z0-9_-][a-zA-Z0-9_. -]{0,100}\.json$/i).test(list[0].name)||list[0].size>512*1024)throw new Error('Bitte eine Modulprojektsicherung mit einfachem JSON-Dateinamen bis 512 KiB auswählen.');
        value=checkDebugProject(JSON.parse(await list[0].text()));
      }else{
        if(list.length>16)throw new Error('Höchstens 16 Dateien auswählen.');
        let size=0;const seen=new Set();
        for(const file of list){if(file.webkitRelativePath&&file.webkitRelativePath!==file.name)throw new Error('Bitte einzelne .js-Dateien ohne Ordnerpfade auswählen.');checkJsDraft({schema:1,name:file.name,source:''});size+=file.size;if(size>65536)throw new Error('Auswahl größer als 64 KiB.');if(seen.has(file.name.toLowerCase()))throw new Error('Doppelte Dateinamen.');seen.add(file.name.toLowerCase());}
        const preview={...before.files};for(const file of list)preview[file.name]='';
        checkDebugProject({...before,files:preview});
        const overwritten=new Set(list.map(file=>file.name));
        if(size+Object.entries(before.files).reduce((sum,[name,source])=>sum+(overwritten.has(name)?0:new TextEncoder().encode(source).length),0)>65536)throw new Error('Das ergänzte Modulprojekt wäre größer als 64 KiB.');
        const files={...before.files};for(const file of list)files[file.name]=await file.text();
        value=checkDebugProject({...before,files});
      }
      if(id!==generation.current||before!==current.current)return;
      if((backup||folder||list.some(file=>Object.hasOwn(before.files,file.name)))&&!window.confirm(folder?'Den gewählten Ordner als neues Modulprojekt übernehmen? Der Code wird nicht automatisch ausgeführt.':'Ausgewählte Moduldateien ersetzen? Der Code wird nicht automatisch ausgeführt.'))return;
      if(change(value)&&folderNotice)setNotice(folderNotice);
    }catch(error){if(id===generation.current)setMessage(error.message);}
  }
  return <section aria-label="Moduldateien">
    <p>Eigenes Modulprojekt mit höchstens 16 .js-Dateien und insgesamt 64 KiB Quelltext. Unterordner wie <code>js/main.js</code>, relative Imports innerhalb des Projekts, Sammelimports und Weiterexporte sind möglich. Kreisimporte, Pakete, URLs und asynchrone Module folgen später. Der einzelne JavaScript-Entwurf bleibt erhalten.</p>
    <label>Debugdatei <select aria-label="Debugdatei" value={selected} onChange={event=>onSelect(event.target.value)}>{Object.keys(project.files).map(file=><option key={file}>{file}</option>)}</select></label>
    <label>Modulstartdatei <select aria-label="Modulstartdatei" disabled={!ready} value={project.entry} onChange={event=>change({...project,entry:event.target.value})}>{Object.keys(project.files).map(file=><option key={file}>{file}</option>)}</select></label>
    <p className="small">Beim Anhalten wird die betroffene Datei gezeigt. Du kannst zur Ansicht wechseln, ohne fortzusetzen; Codeänderung und andere Startdatei beenden den bisherigen Lauf. Setze Haltepunkte in den gewünschten Dateien.</p>
    <label>Neuer Dateiname oder Projektpfad <input aria-label="Neuer Moduldateiname" value={name} disabled={!ready} onChange={event=>setName(event.target.value)} placeholder="js/weitere.js" /></label>
    <div className="pilot-toolbar">
      <button className="btn btn-ghost" disabled={!ready} onClick={()=>{try{checkModulePath(name);if(Object.hasOwn(project.files,name))throw new Error('Diese Datei existiert bereits.');if(change({...project,files:{...project.files,[name]:''}})){onSelect(name);setName('');}}catch(error){setMessage(error.message);}}}>Moduldatei anlegen</button>
      <button className="btn btn-ghost" disabled={!ready||Object.keys(project.files).length===1} onClick={()=>{if(!window.confirm('Diese Moduldatei aus dem Projekt entfernen?'))return;const files={...project.files};delete files[selected];change({...project,files,entry:project.entry===selected?Object.keys(files)[0]:project.entry});}}>Ausgewählte Moduldatei entfernen</button>
      <label className="btn btn-ghost pilot-upload">Moduldateien einlesen<input type="file" multiple accept=".js" aria-label="Moduldateien einlesen" disabled={!ready} onChange={event=>read(event)} /></label>
      <label className="btn btn-ghost pilot-upload">Modulordner als Projekt einlesen<input type="file" multiple webkitdirectory="" directory="" aria-label="Modulordner einlesen" disabled={!ready} onChange={event=>read(event,false,true)} /></label>
      <button className="btn btn-ghost" onClick={()=>downloadFile('modulprojekt.json',{kind:'text',content:JSON.stringify(checkDebugProject(project),null,2)})}>Modulprojekt exportieren (JSON)</button>
      <label className="btn btn-ghost pilot-upload">Modulsicherung lesen<input type="file" accept=".json" aria-label="Modulsicherung lesen" disabled={!ready} onChange={event=>read(event,true)} /></label>
    </div>
    {message&&<p role="alert">{message}</p>}
    {notice&&<p role="status" aria-label="Modulimportstatus">{notice}</p>}
  </section>;
}

