import { useEffect, useState } from 'react';
import { checkFetchFixtures, FETCH_LIMITS } from '../pilot/debugger-fetch.js';

export default function DebugFetchFixtures({project,ready,onChange}) {
  const saved=JSON.stringify(project.fixtures||{schema:1,routes:[]});
  const [routes,setRoutes]=useState(()=>JSON.parse(saved).routes),[error,setError]=useState('');
  useEffect(()=>{setRoutes(JSON.parse(saved).routes);setError('');},[saved]);
  const edit=(index,field,value)=>setRoutes(items=>items.map((item,i)=>i===index?{...item,...(field==='kind'&&value==='http'?{status:item.status??200,body:item.body??''}:{}),[field]:value}:item));
  function apply(){try{const fixtures=checkFetchFixtures({schema:1,routes:routes.map(item=>item.kind==='network-error'?{path:item.path,kind:item.kind,delayMs:Number(item.delayMs)}:{...item,status:Number(item.status),delayMs:Number(item.delayMs)})});onChange({...project,fixtures});setError('');}catch(e){setError(e.message);}}
  return <details className="pilot-disclosure" aria-label="Übungsantworten bearbeiten"><summary>Übungsantworten ({routes.length})</summary>
    <p>fetch lädt hier nur deine vorbereiteten Antworten. Es werden keine Internetadressen oder Dateien abgerufen. Jeder Pfad beginnt mit /uebung/. HTTP-Fehler sind Antworten; ein Verbindungsausfall ist eine Ablehnung.</p>
    <p className="small">Änderungen mit „Übungsantworten übernehmen“ aktivieren; das beendet einen laufenden Debugversuch. Die Modulsicherung enthält diese Definitionen. Ungültiger JSON-Text ist für Fehlerübungen erlaubt.</p>
    {routes.map((item,index)=><fieldset key={index}><legend>Antwort {index+1}</legend>
      <label>Pfad<input aria-label={`Antwort ${index+1}: Pfad`} disabled={!ready} value={item.path} onChange={e=>edit(index,'path',e.target.value)}/></label>
      <label>Ergebnis<select aria-label={`Antwort ${index+1}: Ergebnis`} disabled={!ready} value={item.kind} onChange={e=>edit(index,'kind',e.target.value)}><option value="http">HTTP-Antwort</option><option value="network-error">Verbindungsausfall</option></select></label>
      <label>Wartezeit (ms)<input aria-label={`Antwort ${index+1}: Wartezeit`} type="number" min="0" max="30000" disabled={!ready} value={item.delayMs} onChange={e=>edit(index,'delayMs',e.target.value)}/></label>
      {item.kind==='http'&&<><label>HTTP-Status<input aria-label={`Antwort ${index+1}: HTTP-Status`} type="number" disabled={!ready} value={item.status??200} onChange={e=>edit(index,'status',e.target.value)}/></label><label>Antworttext<textarea aria-label={`Antwort ${index+1}: Antworttext`} className="pilot-code" disabled={!ready} value={item.body??''} onChange={e=>edit(index,'body',e.target.value)}/></label></>}
      <button className="btn btn-ghost" disabled={!ready} onClick={()=>setRoutes(items=>items.filter((_,i)=>i!==index))}>Antwort {index+1} entfernen</button>
    </fieldset>)}
    <div className="pilot-toolbar"><button className="btn btn-ghost" disabled={!ready||routes.length>=FETCH_LIMITS.fixtures} onClick={()=>setRoutes(items=>[...items,{path:'/uebung/antwort-'+(items.length+1),kind:'http',status:200,delayMs:600,body:'{}'}])}>Übungsantwort hinzufügen</button><button className="btn btn-primary" disabled={!ready} onClick={apply}>Übungsantworten übernehmen</button></div>
    {error&&<p role="alert">{error}</p>}
  </details>;
}
