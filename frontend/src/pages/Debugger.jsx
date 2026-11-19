import { lazy, Suspense, useEffect, useRef } from 'react';
import { Link, useOutletContext } from 'react-router-dom';

const JsDebuggerPilot = lazy(() => import('../components/JsDebuggerPilot.jsx'));

export default function Debugger() {
  const { state, changeState, ready, saveStatus } = useOutletContext();
  const heading = useRef(null);
  useEffect(() => { heading.current?.focus(); window.scrollTo(0, 0); }, []);
  return <div className="pilot debugger-page">
    <header className="main-header pilot-page-header">
      <div><h1 ref={heading} tabIndex={-1}>Debugger</h1><p>JavaScript schrittweise ausführen und Variablen untersuchen.</p></div>
      <Link className="btn btn-ghost" to="/frontendkurs">← Zurück zur Werkstatt</Link>
    </header>
    <p className="pilot-status" role="status">{saveStatus}</p>
    <p className="small debug-exit-note">Dein Entwurf gehört zur lokalen Werkstatt. Beim Verlassen endet der Debuglauf.</p>
    <Suspense fallback={<p>Debugger wird geladen …</p>}><JsDebuggerPilot standalone moduleProject={state.debugProject} onModuleChange={debugProject => changeState(previous => ({ ...previous, debugProject }))} draft={state.jsDraft} onChange={jsDraft => changeState(previous => ({ ...previous, jsDraft }))} ready={ready} /></Suspense>
  </div>;
}
