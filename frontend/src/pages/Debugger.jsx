import { lazy, Suspense, useEffect, useRef } from 'react';
import { Link, useOutletContext } from 'react-router-dom';

const JsDebuggerPilot = lazy(() => import('../components/JsDebuggerPilot.jsx'));

export default function Debugger() {
  const { state, changeState, ready, saveStatus } = useOutletContext();
  const heading = useRef(null);
  useEffect(() => { heading.current?.focus(); window.scrollTo(0, 0); }, []);
  return <div className="pilot debugger-page">
    <header className="main-header"><div><h1 ref={heading} tabIndex={-1}>Debugger</h1><p>Eigenen JavaScript-Code, Module und HTML-Klickereignisse Schritt für Schritt untersuchen.</p></div></header>
    <Link className="btn btn-ghost" to="/frontendkurs">← Zurück zur Werkstatt</Link>
    <p className="pilot-status" role="status">{saveStatus}</p>
    <p className="small">Deine Entwürfe verwenden denselben lokalen Speicher wie die Werkstatt. Beim Verlassen endet die Ausführung. Starte deinen Code hier immer ausdrücklich neu.</p>
    <Suspense fallback={<p>Debugger wird geladen …</p>}><JsDebuggerPilot standalone moduleProject={state.debugProject} onModuleChange={debugProject => changeState(previous => ({ ...previous, debugProject }))} draft={state.jsDraft} onChange={jsDraft => changeState(previous => ({ ...previous, jsDraft }))} ready={ready} /></Suspense>
  </div>;
}
