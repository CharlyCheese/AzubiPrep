import { useEffect, useRef, useState } from 'react';
import { PRACTICE_TOPICS, practiceSteps, practiceFeedback, stockBefore, dataCommand, applyDataCommand } from '../utils/journeyPractices.js';
import { evaluateJs } from '../pilot/js-runner.js';
import { JOURNEY_CODE_ID, JOURNEY_CODE_CASES } from '../pilot/journey-exercise.js';

function StockTable({ rows, label }) {
  return <div className="journey-table-scroll"><table className="journey-stock"><caption>{label}</caption><thead><tr><th scope="col">id</th><th scope="col">name</th><th scope="col">quantity</th></tr></thead>
    <tbody>{rows.map(row => <tr key={row.id}><td>{row.id}</td><td>{row.name}</td><td>{row.quantity}</td></tr>)}</tbody></table>{rows.length === 0 && <p>Keine Datensätze ausgewählt.</p>}</div>;
}

export default function JourneyPractice({ topicId, value, disabled = false, busy = false, completed = false, onAction }) {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState([]);
  const controller = useRef(null);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => { setResults([]); }, [value.code]);
  const steps = practiceSteps(topicId);
  const data = topicId === PRACTICE_TOPICS[1];
  const title = data ? 'Datenanwendung' : topicId === PRACTICE_TOPICS[0] ? 'Schutzbedarfsanalyse' : 'Servicefall';
  const locked = disabled || completed || value.done || running;
  const current = steps[value.step];
  const feedback = practiceFeedback(topicId, value);
  const passed = data && value.step === 4 ? value.codePassed : feedback.every(item => item.passed);
  const rows = data ? stockBefore(value) : [];
  const command = data && value.step < 4 ? dataCommand(value.step, value.answers[value.step]) : null;
  const trial = command ? applyDataCommand(rows, value.step, value.answers[value.step]) : null;

  async function runCode() {
    if (locked || busy) return;
    const abort = new AbortController(); controller.current = abort;
    const source = value.code; const checks = [];
    setRunning(true); setResults([]);
    try {
      for (let caseIndex = 0; caseIndex < JOURNEY_CODE_CASES.length; caseIndex++) {
        const result = await evaluateJs({ schema: 1, name: 'bestand.js', source }, { id: JOURNEY_CODE_ID, caseIndex, check: true }, abort.signal);
        const passed = result.reason === 'success' && result.checked;
        checks.push({ index: caseIndex, passed, text: passed ? 'Rückgabewert und Typ passen.' : result.reason === 'time' ? 'Zeitgrenze erreicht. Prüfe Schleifen und Abbruchbedingungen.' : result.details || 'Rückgabewert oder Typ passt noch nicht zum Vertrag.' });
        setResults([...checks]);
        if (result.reason !== 'success') break;
      }
      if (!abort.signal.aborted) onAction({ type: 'code-result', source, passed: checks.length === JOURNEY_CODE_CASES.length && checks.every(item => item.passed) });
    } catch (error) {
      if (!abort.signal.aborted) setResults([{ index: 0, passed: false, text: error.message }]);
    } finally { if (!abort.signal.aborted) setRunning(false); }
  }

  return <section className="journey-model" aria-label={`Praktische Übung: ${title}`}>
    <h3>{title} im lokalen Übungsmodell</h3>
    <p>Eigener fiktiver Fall. Die Übung verändert keine echten Systeme. Dein Stand wird mit diesem Lernabschnitt gespeichert.</p>
    {value.done ? <p className="alert alert-success" role="status">Alle Schritte erfolgreich geprüft. Vergleiche das Protokoll und bestätige danach bewusst deine Durchführung.</p> : <>
      <h4>{current.title}</h4><p>{current.text}</p>
      {current.fields.map(field => <label className="journey-model-field" key={field.key}>{field.label}
        <select value={value.answers[value.step][field.key]} disabled={locked} onChange={event => onAction({ type: 'answer', field: field.key, value: event.target.value })}>
          <option value="">Bitte auswählen</option>{field.options.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
        </select>
      </label>)}
      {data && value.step < 4 && <>
        <StockTable rows={rows} label="Bestand vor diesem Schritt" />
        <p>SQL-Darstellung des Baukastens:</p><pre className="journey-code">{command || 'Wähle alle Felder, um die Operation anzusehen.'}</pre>
        <button className="btn btn-ghost" disabled={locked || busy || !command} onClick={() => onAction({ type: 'preview' })}>Auswahl ansehen</button>
        {value.previewed && trial && <>
          {trial.error && <p role="status">{trial.error}</p>}
          <StockTable rows={trial.affected} label={value.answers[value.step].operation === 'insert' ? 'Einzufügende Zeile' : 'Ausgewählte Zeilen vor der Änderung'} />
          <p>Kontrolliere die Bedingung und die Anzahl: {trial.affected.length} Zeile(n). Erst der erfolgreiche Schritt wird in den weiteren Übungsbestand übernommen.</p>
        </>}
      </>}
      {data && value.step === 4 && <>
        <StockTable rows={rows} label="Bearbeiteter Übungsbestand" />
        <label className="journey-model-field">Deine Bestandsfunktion
          <textarea className="journey-code-input" rows={9} maxLength={4096} spellCheck={false} value={value.code} disabled={locked} onChange={event => onAction({ type: 'code', value: event.target.value })} />
        </label>
        <p>Bis zu 4096 Zeichen. <code>Number.isInteger(wert)</code> prüft Ganzzahlen. Ungültige Fälle vor dem Mengenvergleich behandeln. Ein <code>return</code> liefert den Rückgabewert; eine Konsolenausgabe ersetzt ihn nicht.</p>
        <button className="btn btn-primary" disabled={locked || busy} onClick={runCode}>Funktion prüfen</button>
        {running && <button className="btn btn-ghost" onClick={() => { controller.current?.abort(); setRunning(false); }}>Prüfung stoppen</button>}
        <p role="status">{running ? `Prüfung läuft: ${results.length} von ${JOURNEY_CODE_CASES.length} Fällen.` : value.checked ? value.codePassed ? 'Alle Funktionsfälle bestanden.' : 'Die Funktion braucht noch eine Korrektur.' : 'Prüfe die Funktion nach jeder Änderung erneut.'}</p>
        <details><summary>Erwartungen und Prüfergebnisse</summary><ol>{JOURNEY_CODE_CASES.map((test, i) => <li key={i}><code>available({JSON.stringify(test.quantity)}, {JSON.stringify(test.requested)})</code> → <code>{String(test.expected)}</code>{results.find(row => row.index === i) && <span> · {results.find(row => row.index === i).passed ? '✓' : '✗'} {results.find(row => row.index === i).text}</span>}</li>)}</ol></details>
      </>}
      {!(data && value.step === 4) && <button className="btn btn-primary" disabled={locked || busy || (data && !value.previewed)} onClick={() => onAction({ type: 'check' })}>{data ? 'Ausführen und prüfen' : 'Schritt prüfen'}</button>}
      {value.checked && !(data && value.step === 4) && <div aria-live="polite"><ul>{feedback.map(item => <li key={item.label}><strong>{item.passed ? '✓' : '✗'} {item.label}:</strong> {item.text}</li>)}</ul>
        {data && trial && <StockTable rows={value.answers[value.step].operation === 'select' ? trial.affected : trial.rows} label={value.answers[value.step].operation === 'select' ? 'Abfrageergebnis' : 'Bestand nach dieser Modelloperation'} />}
        {data && !passed && <p>Das Ergebnis passt noch nicht zum Auftrag. Korrigiere die Auswahl; der bisherige Bestand bleibt erhalten.</p>}
      </div>}
      <button className="btn btn-primary" disabled={locked || busy || !value.checked || !passed} onClick={() => onAction({ type: 'next' })}>{value.step === steps.length - 1 ? 'Praxis abschließen' : 'Geprüften Schritt übernehmen'}</button>
    </>}
    {(value.step > 0 || value.done) && <details open={value.done}><summary>Gespeichertes Übungsprotokoll</summary>
      <ol>{steps.slice(0, value.done ? steps.length : value.step).map((step, i) => <li key={step.title}><strong>{step.title}</strong>
        <ul>{step.fields.map(field => <li key={field.key}>{field.label}: {field.options.find(([v]) => v === value.answers[i][field.key])?.[1]}</li>)}</ul>
        {data && i < 4 && <pre className="journey-code">{dataCommand(i, value.answers[i])}</pre>}
        {data && i === 4 && <><p>Alle {JOURNEY_CODE_CASES.length} festen Normal-, Grenz- und Fehlerfälle bestanden. Dies ist eine lokale Lernprüfung.</p><pre className="journey-code">{value.code}</pre></>}
      </li>)}</ol>
      {data && <StockTable rows={rows} label="Gespeicherter Übungsbestand" />}
    </details>}
  </section>;
}
