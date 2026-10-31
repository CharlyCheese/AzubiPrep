import { useEffect, useRef, useState } from 'react';
import { buildPreview, cleanCSS } from '../pilot/preview.js';
import KiHilfe from './KiHilfe.jsx';
import { courseContext } from '../api/ai.js';

export default function PilotPreview({ files, page, onPage, lesson, project, onAiHint }) {
  const ref = useRef(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [selection, setSelection] = useState(null);
  const [width, setWidth] = useState('100%');
  const [inspect, setInspect] = useState(false);
  const [reset, setReset] = useState(0);
  const desktop = window.azubiDesktop?.version === 1;
  async function inspectDesktop() {
    if (!preview) return;
    try { await window.azubiDesktop.inspectPreview(preview.html); } catch (e) { setError(`Entwicklerwerkzeuge: ${e.message}`); }
  }
  useEffect(() => {
    if (!desktop) return undefined;
    return window.azubiDesktop.onInspectRequest(inspectDesktop);
  }, [preview, desktop]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const timer = setTimeout(() => {
      try { setPreview(buildPreview(files, page)); setError(''); setSelection(null); }
      catch (e) { setError(e.message); setPreview(null); }
    }, 300);
    return () => clearTimeout(timer);
  }, [files, page]);
  function inspectElement(element) {
    if (!element || !preview) return;
    const computed = ref.current.contentWindow.getComputedStyle(element);
    const data = preview.nodes[element.dataset.pilotNode];
    const rules = [];
    for (const entry of preview.styles) {
      const sheet = new CSSStyleSheet(); sheet.replaceSync(cleanCSS(entry.content));
      for (const rule of sheet.cssRules) {
        try {
          if (rule.selectorText && element.matches(rule.selectorText)) rules.push(`${entry.path}: ${rule.cssText}`);
          else for (let parent = element.parentElement; parent; parent = parent.parentElement) {
            if (rule.selectorText && parent.matches(rule.selectorText)) { rules.push(`${entry.path} (Regel am übergeordneten ${parent.localName}): ${rule.cssText}`); break; }
          }
        } catch { /* Ungültige Selektoren werden ignoriert. */ }
      }
    }
    setSelection({ ...data, id: element.dataset.pilotNode, rules, values: ['color', 'background-color', 'font-size', 'margin', 'padding', 'border', 'width', 'height'].map((property) => `${property}: ${computed.getPropertyValue(property)}`) });
  }
  function loaded() {
    const doc = ref.current?.contentDocument;
    if (!doc || !preview) return;
    doc.addEventListener('click', (event) => {
      event.preventDefault();
      const element = event.target.closest('[data-pilot-node]');
      if (inspect && element) {
        inspectElement(element);
        return;
      }
      const link = event.target.closest('a[data-pilot-target]');
      if (link) {
        if (link.dataset.pilotTarget !== page) onPage(link.dataset.pilotTarget);
        else doc.getElementById(link.dataset.pilotFragment)?.scrollIntoView();
      }
    });
    doc.addEventListener('auxclick', (event) => event.preventDefault());
    doc.addEventListener('contextmenu', (event) => event.preventDefault());
  }
  return <section aria-label="Browser-Vorschau">
    <div className="pilot-toolbar">
      <label>Vorschaugröße <select value={width} onChange={(e) => setWidth(e.target.value)}><option value="100%">Desktop</option><option value="768px">Tablet</option><option value="375px">Handy</option></select></label>
      <button className="btn btn-ghost" aria-pressed={inspect} onClick={() => setInspect(!inspect)}>Element untersuchen</button>
      <button className="btn btn-ghost" onClick={() => { setReset(reset + 1); setSelection(null); }}>Vorschau zurücksetzen</button>
      {desktop && <button className="btn btn-ghost" disabled={!preview} onClick={inspectDesktop}>Entwicklerwerkzeuge (F12)</button>}
    </div>
    <p className="small">Nur HTML/CSS. JavaScript und externe Ressourcen sind gesperrt. Zum Untersuchen den Modus aktivieren und ein Element anklicken. {desktop ? 'F12 öffnet eine separate, isolierte Kopie der Vorschau mit Entwicklerwerkzeugen. Änderungen dort verändern deine Projektdateien nicht.' : 'Browser-F12 untersucht die Seite; wähle dort den Vorschaukontext.'}</p>
    {error && <p role="alert">Vorschau: {error}</p>}
    <div className="pilot-frame-wrap"><iframe key={`${page}:${inspect}:${reset}:${preview?.html}`} ref={ref} title="Dein Projekt" sandbox="allow-same-origin" referrerPolicy="no-referrer" srcDoc={preview?.html || ''} onLoad={loaded} style={{ width }} /></div>
    {!!preview && <label>Element per Tastatur untersuchen <select aria-label="Element per Tastatur untersuchen" value={selection?.id || ''} onChange={(event) => inspectElement(ref.current?.contentDocument?.querySelector(`[data-pilot-node="${event.target.value}"]`))}><option value="">Element auswählen</option>{Object.entries(preview.nodes).map(([id, node]) => <option key={id} value={id}>{node.tag} · {node.html.slice(0, 65)}</option>)}</select></label>}
    {!!preview?.warnings.length && <details><summary>Hinweise zur eingeschränkten Vorschau ({preview.warnings.length})</summary><ul>{preview.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></details>}
    {selection && <div className="pilot-inspector" aria-live="polite"><h3>{selection.tag} in {selection.path}</h3><pre>{selection.html}</pre><h4>Passende CSS-Regeln</h4><pre>{selection.rules.join('\n') || 'Keine externe Regel passt.'}</pre><h4>Berechnete Darstellung und Boxmodell</h4><pre>{selection.values.join('\n')}</pre></div>}
    {selection && lesson && project && <KiHilfe course contextKey={`${lesson.id}:${project.stand}:${selection.id}`} makeContext={includeCode => courseContext(lesson, project, selection.path, includeCode, selection)} onHint={onAiHint} />}
  </section>;
}
