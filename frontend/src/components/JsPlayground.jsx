import { useEffect, useRef, useState } from 'react';
import { checkJsDraft, initialJsDraft, SOURCE_BYTES } from '../pilot/js-draft.js';
import { startJs } from '../pilot/js-runner.js';
import { downloadFile } from '../pilot/project.js';

const messages = {
  success: 'Programm beendet.', manual: 'Programm gestoppt.', time: 'Zeitgrenze erreicht. Prüfe insbesondere Schleifen und Rekursion.',
  output: 'Ausgabegrenze erreicht. Bitte weniger protokollieren.', jobs: 'Zu viele Folgeaufgaben. Programm beendet.',
  error: 'JavaScript-Fehler: Prüfe Syntax, Variablen und Speicherbedarf.', startup: 'Die Laufzeit konnte nicht rechtzeitig starten.',
  engine: 'Die Ausführung ist fehlgeschlagen. Speichergrenze oder Laufzeitfehler; bitte das Programm verkleinern oder erneut starten.',
};
export default function JsPlayground({ draft, onChange, ready, saveStatus }) {
  const [opened, setOpened] = useState(false);
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState('Noch kein Programm gestartet.');
  const [logs, setLogs] = useState([]);
  const [details, setDetails] = useState('');
  const [message, setMessage] = useState('');
  const run = useRef(null);
  const generation = useRef(0);
  const importGeneration = useRef(0);
  const current = useRef(draft); current.current = draft;
  useEffect(() => () => { generation.current++; importGeneration.current++; run.current?.dispose(); }, []);
  function dispose() { generation.current++; run.current?.dispose(); run.current = null; setActive(false); }
  function change(value) {
    try { const checked = checkJsDraft(value); importGeneration.current++; dispose(); onChange(checked); setLogs([]); setDetails(''); setMessage(''); setStatus('Code geändert. Für die neue Fassung erneut ausführen.'); }
    catch (error) { setMessage(error.message); }
  }
  function start() {
    dispose(); setLogs([]); setDetails(''); setActive(true); setStatus('Laufzeit wird gestartet …');
    const id = generation.current;
    try {
      run.current = startJs(draft, event => {
        if (id !== generation.current) return;
        if (event.type === 'running') setStatus('Programm läuft …');
        if (event.type === 'log') setLogs(previous => [...previous, event.text]);
        if (event.type === 'done') { setActive(false); setStatus(messages[event.reason] || messages.engine); setDetails(event.details || ''); }
      });
    } catch { setActive(false); setStatus(messages.engine); }
  }
  async function importSource(event) {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file) return;
    const id = ++importGeneration.current;
    const before = current.current;
    try {
      if (file.size > SOURCE_BYTES) throw new Error('Die Datei ist größer als 64 KiB.');
      checkJsDraft({ schema: 1, name: file.name, source: '' });
      const value = checkJsDraft({ schema: 1, name: file.name, source: await file.text() });
      if (id !== importGeneration.current || before !== current.current) return;
      if (!window.confirm('Den aktuellen JavaScript-Entwurf durch diese Datei ersetzen? Die Datei wird nicht automatisch ausgeführt.')) return;
      change(value);
    } catch (error) { if (id === importGeneration.current) setMessage(error.message); }
  }
  return <section className="card" aria-label="JavaScript-Grundlagen">
    <h2 className="pilot-disclosure-title"><button className="pilot-disclosure-button" aria-expanded={opened} onClick={() => { dispose(); importGeneration.current++; setStatus('Kein Programm aktiv.'); setOpened(!opened); }}><span aria-hidden="true">{opened ? '▾' : '▸'}</span>JavaScript ausprobieren</button></h2>
    {opened && <>
      <p>Eigene Programme mit Konsole in Web und Desktop frei ausprobieren. Schrittweise geführte Übungen findest du oben in der Lektionsauswahl ab Kapitel 14.</p>
      <p>Dies ist eine reine JavaScript-Konsole ohne HTML-/CSS-Vorschau, DOM, Netzwerk, Dateien oder App-Zugriff. Jeder Start beginnt mit frischen Variablen. Browserfunktionen wie <code>document</code>, <code>fetch</code> und <code>setTimeout</code> sind hier nicht vorhanden.</p>
      <p className="small">Grenzen: 1 Sekunde Laufzeit, 16 MiB Interpreter-Heap, 64 KiB Stack, höchstens 80 Ausgaben / 32.000 Zeichen. Objekte und Arrays erscheinen als Platzhalter; protokolliere zum Lernen einzelne Eigenschaften oder Einträge. Diese Grenzen betreffen die Übung, nicht den gesamten Speicher der App.</p>
      <p>Datei: <strong>{draft.name}</strong></p>
      <label className="pilot-code-label">Code: {draft.name}<textarea aria-label="JavaScript-Code" className="pilot-code" spellCheck="false" value={draft.source} disabled={!ready} onChange={event => change({ ...draft, source: event.target.value })} /></label>
      <div className="pilot-toolbar">
        <button className="btn btn-primary" onClick={start} disabled={!ready}>JavaScript ausführen</button>
        <button className="btn btn-ghost" onClick={() => run.current?.stop()} disabled={!active}>JavaScript stoppen</button>
        <label className="btn btn-ghost pilot-upload">JavaScript-Datei einlesen<input type="file" accept=".js" aria-label="JavaScript-Datei einlesen" disabled={!ready} onChange={importSource} /></label>
        <button className="btn btn-ghost" onClick={() => downloadFile(draft.name, { kind: 'text', content: draft.source })}>JavaScript-Datei exportieren</button>
        <button className="btn btn-ghost" disabled={!ready} onClick={() => { if (window.confirm('Nur den JavaScript-Entwurf auf das Beispiel zurücksetzen?')) change(initialJsDraft()); }}>JavaScript-Beispiel zurücksetzen</button>
      </div>
      <p className="small">Der Entwurf wird mit dem lokalen Kursstand gespeichert: {saveStatus}. Exportiere die .js-Datei auch als eigene Sicherung. Einlesen und Öffnen führen keinen Code aus. Ausgaben werden nicht gespeichert und nicht an eine KI gesendet.</p>
      <p role="status" className="js-playground-status">{status}</p>{message && <p role="alert">{message}</p>}
      <h3>Konsole</h3><pre aria-label="JavaScript-Konsole">{logs.length ? logs.join('\n') : 'Noch keine Ausgabe.'}</pre>
      {details && <pre aria-label="JavaScript-Fehlerdetails">{details}</pre>}
    </>}
  </section>;
}
