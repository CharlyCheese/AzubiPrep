import { useEffect, useRef, useState } from 'react';

const reasons = { manual: 'Manuell gestoppt.', restart: 'Für einen neuen Lauf beendet.', time: 'Zeitgrenze erreicht; Übungsprozess beendet.', output: 'Ausgabegrenze erreicht; Übungsprozess beendet.', memory: 'Beobachteter Speicherzuwachs zu groß; Übungsprozess beendet.', closed: 'Übungsfenster geschlossen.', error: 'Testprogramm mit Fehler beendet.', startup: 'Startzeit überschritten.', isolation: 'Prozesstrennung nicht mehr nachgewiesen.', monitor: 'Speicherbeobachtung nicht mehr verfügbar.', crashed: 'Übungsprozess wurde beendet.', parent: 'Hauptfenster geschlossen.' };
export default function JsSandboxPilot() {
  const api = window.azubiDesktop?.jsPilot;
  const [opened, setOpened] = useState(false);
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState('dom');
  const [state, setState] = useState('Noch kein Test gestartet.');
  const [logs, setLogs] = useState([]);
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const run = useRef(null);
  const alive = useRef(true);
  const epoch = useRef(0);
  const item = items.find(item => item.id === selected);
  useEffect(() => {
    epoch.current++;
    alive.current = true;
    if (!api || !opened) return () => { alive.current = false; };
    let valid = true;
    setActive(false);
    setBusy(false);
    setState('Kein aktiver Übungsprozess.');
    api.catalog().then(value => { if (valid) setItems(value); }).catch(() => { if (valid) setState('Der Technikpilot konnte nicht geladen werden.'); });
    const off = api.onEvent(value => {
      if (!valid || value?.runId !== run.current) return;
      if (value.type === 'ready') { setActive(true); setState('Getrennter Übungsprozess bereit.'); }
      if (value.type === 'stopped') { setActive(false); setState(reasons[value.reason] || 'Übung beendet.'); }
      if (value.type === 'console' || value.type === 'error' || value.type === 'blocked') setLogs(previous => [...previous.slice(-79), value.type === 'blocked' ? `Gesperrt: ${value.kind}` : `${value.file || 'Pilot'}${value.line ? `:${value.line}` : ''}: ${String(value.message).slice(0, 2000)}`]);
    });
    return () => { valid = false; alive.current = false; epoch.current++; off(); if (run.current) api.stop(run.current).catch(() => {}); run.current = null; };
  }, [api, opened]);
  async function start() {
    if (!api || busy) return;
    const generation = epoch.current;
    setBusy(true); setLogs([]); setState('Getrennte Übung wird gestartet …');
    try {
      const result = await api.start(selected);
      if (!alive.current || epoch.current !== generation) { api.stop(result.runId).catch(() => {}); return; }
      run.current = result.runId; setActive(true);
    } catch (error) { if (alive.current && epoch.current === generation) { setActive(false); setState(error.message || 'Start fehlgeschlagen.'); } }
    finally { if (alive.current && epoch.current === generation) setBusy(false); }
  }
  async function stop() {
    if (api && run.current) { try { await api.stop(run.current); } catch { setState('Stoppen fehlgeschlagen.'); } }
  }
  return <details className="card pilot-disclosure" onToggle={event => setOpened(event.currentTarget.open)}>
    <summary>JavaScript-Technikpilot öffnen</summary>
    <section aria-label="JavaScript-Technikpilot">
      <p>Technischer Versuch für spätere DOM-Übungen: festgelegte Testprogramme in einer getrennten Desktop-Übung. Dieser Versuch nimmt keine eigenen Skripte oder Importe an. Für eigene Konsolenprogramme gibt es den JavaScript-Bereich.</p>
      {!api ? <p>In der Webversion ist dieser Browser-DOM-Technikpilot nicht verfügbar. Eigene Konsolenprogramme kannst du im JavaScript-Bereich ausprobieren.</p> : <>
        <label>Testprogramm <select value={selected} onChange={event => setSelected(event.target.value)}>{items.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
        <p className="small">Ein Test öffnet ein eigenes Fenster. Stoppen und Neustart werden außerhalb der Übung gesteuert. Der Speichertest beobachtet Zuwachs; eine harte Speicherobergrenze ist damit noch nicht nachgewiesen.</p>
        <div className="pilot-toolbar"><button className="btn btn-primary" onClick={start} disabled={busy || !items.length}>Test starten / zurücksetzen</button><button className="btn btn-ghost" onClick={stop} disabled={!active}>Übung stoppen</button></div>
        <p aria-live="polite" className="js-pilot-status">{state}</p>
        <label>Quelltext des Testprogramms<textarea className="pilot-code" readOnly value={item?.code || ''} aria-label="Quelltext des Testprogramms" /></label>
        <h3>Begrenzte Konsolenausgabe</h3><pre aria-label="Pilotkonsole">{logs.join('\n') || 'Noch keine Ausgabe.'}</pre>
      </>}
    </section>
  </details>;
}
