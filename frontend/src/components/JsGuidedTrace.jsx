import { useState } from 'react';
import { guidedSumTrace } from '../pilot/js18-trace.js';

export default function JsGuidedTrace({ onReveal }) {
  const [corrected, setCorrected] = useState(false);
  const [example, setExample] = useState('two');
  const [cursor, setCursor] = useState(0);
  const [breakpoint, setBreakpoint] = useState(4);
  const { source, frames } = guidedSumTrace(corrected, example);
  const frame = frames[Math.min(cursor, frames.length - 1)];
  const finished = cursor >= frames.length - 1;
  function nextBreak() {
    const next = frames.findIndex((item, index) => index > cursor && item.line === breakpoint);
    setCursor(next < 0 ? frames.length - 1 : next);
  }
  return <section className="card js-guided-trace" aria-label="Geführte Debugger-Spur">
    <h3>Geführte Debugger-Spur</h3>
    <p>Diese Modellspur gehört ausschließlich zum festen Beispiel unten. Sie führt deinen Editorcode nicht aus. Deine eigene Lösung startest und prüfst du separat in der Kurskonsole. Ein freier Quellcode-Debugger ist hier noch nicht enthalten.</p>
    <p className="small">Das Öffnen der korrigierten Variante zählt wie das Ansehen einer Musterlösung. Die Ergebnisprüfung belegt die Methodennutzung und dein Verständnis der Spur nicht automatisch.</p>
    <div className="pilot-toolbar">
      <label>Programmvariante<select aria-label="Programmvariante" value={corrected ? 'fixed' : 'bug'} onChange={event => { const value = event.target.value === 'fixed'; setCorrected(value); setCursor(0); if (value) onReveal?.(); }}><option value="bug">Fehlerbeispiel mit &lt;=</option><option value="fixed">Korrigiertes Beispiel ansehen (zeigt Lösung)</option></select></label>
      <label>Beispieldaten<select aria-label="Beispieldaten" value={example} onChange={event => { setExample(event.target.value); setCursor(0); }}><option value="two">[2, 3]</option><option value="empty">[]</option><option value="zero">[0]</option></select></label>
    </div>
    <p>Klicke auf eine ausführbare Zeilennummer, um einen Haltepunkt zu setzen oder zu entfernen. Ein Halt zeigt den Zustand <strong>vor</strong> der markierten Anweisung.</p>
    <ol className="js-trace-source" aria-label="Festes Spurprogramm">{source.map((line, index) => {
      const number = index + 1;
      return <li key={number} aria-current={frame.line === number ? 'step' : undefined}>
        {[2, 3, 4, 6, 8].includes(number) ? <button className="btn btn-ghost" aria-label={`Haltepunkt Zeile ${number}`} aria-pressed={breakpoint === number} onClick={() => setBreakpoint(previous => previous === number ? null : number)}>{breakpoint === number ? '● ' : ''}{number}</button> : <span aria-hidden="true">{number}</span>}
        <code>{line}</code>{frame.line === number && <strong className="small">Nächste Anweisung</strong>}
      </li>;
    })}</ol>
    <div className="pilot-toolbar">
      <button className="btn btn-primary" disabled={finished} onClick={() => setCursor(previous => Math.min(previous + 1, frames.length - 1))}>Einzelner Schritt</button>
      <button className="btn btn-ghost" disabled={finished} onClick={nextBreak}>Bis zum Haltepunkt</button>
      <button className="btn btn-ghost" onClick={() => setCursor(0)}>Spur zurücksetzen</button>
    </div>
    <p role="status">Schritt {cursor + 1} von {frames.length}: {frame.message}</p>
    <h4>Scope – Werte vor dem nächsten Schritt</h4>
    {frame.variables.length ? <div className="js-trace-table"><table aria-label="Spurvariablen"><thead><tr><th>Name</th><th>Wert</th><th>Typ</th></tr></thead><tbody>{frame.variables.map(variable => <tr key={variable.name}><th scope="row">{variable.name}</th><td>{variable.value}</td><td>{variable.type}</td></tr>)}</tbody></table></div> : <p>Im globalen Aufrufer sind keine lokalen Variablen von summe sichtbar.</p>}
    <h4>Aufrufkette der Modellspur</h4><ol>{frame.stack.map(name => <li key={name}>{name}</li>)}</ol>
    <pre aria-label="Spur-Konsolenausgabe">{frame.output === null ? 'Ausgabe noch nicht erreicht.' : frame.output}</pre>
  </section>;
}
