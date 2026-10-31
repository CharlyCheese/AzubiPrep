import { useEffect, useRef, useState } from 'react';
import { jsProgram } from '../pilot/js-checks.js';
import { JS_EXERCISES } from '../pilot/js-exercises.js';
import { startJs } from '../pilot/js-runner.js';

export default function JsCourseConsole({ files, entry, lesson, onOutput }) {
  const [status, setStatus] = useState('Noch kein Kursprogramm gestartet.');
  const [logs, setLogs] = useState([]);
  const [details, setDetails] = useState('');
  const [active, setActive] = useState(false);
  const run = useRef(null);
  const epoch = useRef(0);
  const output = useRef([]);
  useEffect(() => {
    epoch.current++; run.current?.dispose(); run.current = null;
    output.current = []; onOutput?.(null);
    setActive(false); setLogs([]); setDetails(''); setStatus('Code bereit. Starte das Kursprogramm ausdrücklich.');
    return () => { epoch.current++; run.current?.dispose(); run.current = null; onOutput?.(null); };
  }, [files, entry, lesson.id, onOutput]);
  function start() {
    epoch.current++; run.current?.dispose();
    const id = epoch.current; output.current = []; onOutput?.(null); setLogs([]); setDetails('');
    try {
      const program = jsProgram(files, entry);
      setActive(true); setStatus('Kursprogramm startet …');
      run.current = startJs(program.draft, event => {
        if (id !== epoch.current) return;
        if (event.type === 'running') setStatus('Kursprogramm läuft …');
        if (event.type === 'log') {
          output.current = [...output.current, event.text];
          setLogs(output.current);
          onOutput?.({ files, entry, lessonId: lesson.id, lines: output.current });
        }
        if (event.type === 'done') {
          setActive(false); setDetails(event.details || '');
          setStatus(event.reason === 'success' ? 'Kursprogramm beendet.' : event.reason === 'manual' ? 'Kursprogramm gestoppt.' : `Kursprogramm beendet: ${event.reason === 'time' ? 'Zeitgrenze' : event.reason === 'output' ? 'Ausgabegrenze' : 'Fehler oder Ressourcengrenze'}.`);
        }
      }, { id: lesson.id, caseIndex: 0, check: false });
    } catch (error) { setActive(false); setStatus(error.message); }
  }
  const inputs = JS_EXERCISES[lesson.id].inputs[0];
  return <section aria-label="Kurskonsole">
    <h3>JavaScript-Kurskonsole</h3>
    <p>Die HTML-Vorschau bleibt ohne aktive Skripte. Hier läuft ausschließlich die verknüpfte JS-Datei, mit frischen Variablen bei jedem Start. Keine DOM-, Netzwerk-, Datei- oder App-Funktionen.</p>
    <p className="small">Grenzen: 1 Sekunde, 16 MiB Interpreter-Heap, 64 KiB Stack und begrenzte Ausgaben. Die App kann Konsolenausgaben zusätzlich als Text in der Vorschau anzeigen. console.log selbst schreibt weiterhin nur in die Konsole; es verändert keine HTML-Elemente.</p>
    {Object.keys(inputs).length > 0 && <><p>Diese Konstanten stehen deinem Programm bereits zur Verfügung; nicht erneut deklarieren:</p><pre aria-label="Kurs-Testdaten">{Object.entries(inputs).map(([key, value]) => `const ${key} = ${JSON.stringify(value)};`).join('\n')}</pre><p className="small">Die Prüfung verwendet zusätzlich andere Werte.</p></>}
    <div className="pilot-toolbar"><button className="btn btn-primary" onClick={start}>Kursprogramm ausführen</button><button className="btn btn-ghost" disabled={!active} onClick={() => run.current?.stop()}>Kursprogramm stoppen</button></div>
    <p role="status" className="js-course-status">{status}</p>
    <pre aria-label="Kurs-Konsolenausgabe">{logs.length ? logs.join('\n') : 'Noch keine Ausgabe.'}</pre>
    {details && <pre aria-label="Kurs-Fehlerdetails">{details}</pre>}
  </section>;
}
