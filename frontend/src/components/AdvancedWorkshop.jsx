import { createElement, useEffect, useId, useRef, useState } from 'react';
import { startAdvanced } from '../pilot/advanced-runtime.js';

const tags = new Set('div main header footer nav section article aside h1 h2 h3 h4 p span strong em small ul ol li form label input textarea select option button a table thead tbody tr th td caption fieldset legend output pre code br hr'.split(' '));
export default function AdvancedWorkshop({ files, entry, lesson, onSaveStore }) {
  const [snapshot, setSnapshot] = useState(null); const [status, setStatus] = useState('Starte dein Projekt bewusst.');
  const [logs, setLogs] = useState([]); const [scenario, setScenario] = useState('ok'); const [error, setError] = useState('');
  const [active, setActive] = useState(false); const run = useRef(null); const generation = useRef(0); const container = useRef(null); const prefix = useId().replace(/:/g, '') + '-';
  useEffect(() => { generation.current++; run.current?.dispose(); setActive(false); setSnapshot(null); setLogs([]); setError(''); setStatus('Code bereit. Starte dein Projekt ausdrücklich.'); return () => { generation.current++; run.current?.dispose(); }; }, [files, entry, lesson.id]);
  useEffect(() => { if (snapshot?.focus) container.current?.querySelector(`[data-course-node="${Number(snapshot.focus)}"]`)?.focus(); }, [snapshot?.focus]);
  useEffect(() => {
    const sync = node => {
      if (!node || typeof node.text === 'string') return;
      if (['input','textarea','select'].includes(node.tag)) {
        const element = container.current?.querySelector(`[data-course-node="${node.id}"]`);
        if(element) { if(element.value!==node.value)element.value=node.value; if(node.tag==='input'&&element.type==='checkbox')element.checked=node.checked; }
      }
      node.children.forEach(sync);
    };
    sync(snapshot?.tree);
  }, [snapshot]);
  function start() {
    run.current?.dispose(); const id = ++generation.current;
    setSnapshot(null); setLogs([]); setError(''); setActive(true); setStatus('Projekt wird lokal vorbereitet …');
    try { run.current = startAdvanced(files, entry, lesson, event => {
      if (id !== generation.current) return;
      if (event.type === 'snapshot') setSnapshot(event);
      if (event.type === 'types') setStatus(event.text);
      if (event.type === 'log') setLogs(lines => [...lines, event.text]);
      if (event.type === 'ready') setStatus('Projekt läuft in der begrenzten Übungsansicht.');
      if (event.type === 'error') { setError(event.text); setActive(false); setStatus('Projekt beendet.'); }
      if (event.type === 'stopped') { setActive(false); setStatus('Projekt gestoppt.'); }
    }, { scenario }); } catch (error) { setError(error.message); setActive(false); }
  }
  function send(event, type) {
    if (type === 'submit' || type === 'click' && event.target.closest('a')) event.preventDefault();
    const node = event.target.closest('[data-course-node]');
    if (!node || !active) return;
    run.current?.event({ id: Number(node.dataset.courseNode), type, ...(typeof event.target.value === 'string' ? { value: event.target.value.slice(0, 2000) } : {}), ...(typeof event.target.checked === 'boolean' ? { checked: event.target.checked } : {}) });
  }
  function render(node, depth = 0) {
    if (!node || depth > 32) return null;
    if (typeof node.text === 'string') return node.text.slice(0, 4000);
    const tag = node.tag === 'body' ? 'div' : node.tag;
    if (!tags.has(tag) || !Number.isSafeInteger(node.id) || !Array.isArray(node.children)) return null;
    const props = { key: node.id, 'data-course-node': node.id };
    const attrs = node.attrs || {};
    for (const name of ['role','aria-label','aria-invalid','aria-live','placeholder','min','max','step']) if (typeof attrs[name] === 'string') props[name] = attrs[name].slice(0, 300);
    if (attrs.id) props.id = prefix + attrs.id;
    if (attrs.for) props.htmlFor = prefix + attrs.for;
    if (attrs.tabindex) props.tabIndex = Math.max(-1, Math.min(0, Number(attrs.tabindex) || 0));
    if (tag === 'button') props.type = attrs.type === 'button' ? 'button' : 'submit';
    if (tag === 'input') props.type = ['text','number','search','checkbox'].includes(attrs.type) ? attrs.type : 'text';
    if (['input','select','textarea'].includes(tag)) { props.defaultValue = typeof node.value === 'string' ? node.value : ''; props.required = node.required === true; props.disabled = !active || node.disabled === true; if(tag==='input'&&props.type==='checkbox')props.defaultChecked=node.checked===true; }
    if (tag === 'button') props.disabled = !active || node.disabled === true;
    if (tag === 'option' && typeof node.value === 'string') props.value = node.value;
    if (tag === 'a') { props.href = '#'; }
    if (tag === 'input' || tag === 'textarea' || tag === 'br' || tag === 'hr') return createElement(tag, props);
    return createElement(tag, props, node.children.slice(0,3000).map(child => render(child, depth + 1)));
  }
  return <section aria-label="Interaktive Übungsansicht" className="advanced-workshop">
    <h3>Interaktive Übungsansicht</h3>
    <p>Dein Code läuft mit lokalem DOM-Modell in einer getrennten, begrenzten Laufzeit. Keine echten Netz-, Datei- oder Apprechte. Die normale HTML-Vorschau bleibt skriptfrei.</p>
    <details><summary>Umgebung und Grenzen</summary><p className="small">Die Ansicht zeigt sichere Elemente und Formularaktionen. Eigenes CSS, Browserlayout, vollständige native Formularprüfung und reale Navigation prüfst du zusätzlich extern. Timer laufen hier als begrenzte Übungsjobs, nicht nach echter Wartezeit. Grenzen: 3 Sekunden je Aktion, 96 MiB Interpreter-Heap, 3.000 Elemente/Textknoten und begrenzte Ausgabe.</p></details>
    <label>Übungsfall <select value={scenario} onChange={event => { run.current?.stop(); setScenario(event.target.value); }}><option value="ok">Erfolg</option><option value="empty">Leere Antwort</option><option value="http">HTTP 503</option><option value="network">Anfragefehler</option><option value="json">JSON-Fehler</option><option value="schema">Schemafehler</option><option value="quota">Speichern schlägt fehl</option></select></label>
    <div className="pilot-toolbar"><button className="btn btn-primary" onClick={start}>Projekt ausführen</button><button className="btn btn-ghost" disabled={!active} onClick={() => run.current?.stop()}>Projekt stoppen</button><button className="btn btn-ghost" disabled={!snapshot} onClick={() => { onSaveStore(snapshot.store); setStatus('Übungsspeicher als Projektdatei übernommen. Neu starten zum Wiederherstellen.'); }}>Übungsspeicher übernehmen</button></div>
    <p role="status">{status}</p>{error && <pre role="alert" aria-label="Projektfehler">{error}</pre>}
    <div className="advanced-output" ref={container} onClick={event => send(event,'click')} onInput={event => send(event,'input')} onChange={event => { if(event.target.tagName==='SELECT'||event.target.type==='checkbox')send(event,'change'); }} onSubmit={event => send(event,'submit')} aria-label="Projektdarstellung">{snapshot ? render(snapshot.tree) : <p>Noch kein Projekt gestartet.</p>}</div>
    <pre aria-label="Projektkonsole">{logs.length ? logs.join('\n') : 'Noch keine Konsolenausgabe.'}</pre>
  </section>;
}
