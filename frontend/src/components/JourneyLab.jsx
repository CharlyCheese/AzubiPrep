import { useEffect, useRef, useState } from 'react';
import { LAB_TOPICS, LAB_STEPS, labFieldPassed, labStagePassed, prepareReport, replayReports, probeService, SERVICE_FIELDS } from '../utils/journeyLabs.js';
import { CONTROL_CASES } from '../pilot/journey-exercise.js';
import { evaluateJs } from '../pilot/js-runner.js';

function Table({ rows, title }) {
  const columns = rows.length ? Object.keys(rows[0]) : [];
  return <div className="journey-table-scroll"><table className="journey-stock"><caption>{title}</caption><thead><tr>{columns.map(key => <th scope="col" key={key}>{key}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr key={i}>{columns.map(k => <td key={k}>{r[k] === null ? 'fehlend' : String(r[k])}</td>)}</tr>)}</tbody></table>{!rows.length && <p>Keine übernommenen Zeilen.</p>}</div>;
}
export default function JourneyLab({ topicId, value, disabled = false, busy = false, completed = false, onAction }) {
  const [running, setRunning] = useState(false); const [results, setResults] = useState([]); const abortRef = useRef(null);
  useEffect(() => () => abortRef.current?.abort(), []);
  useEffect(() => { setResults([]); }, [value.source]);
  const kind = LAB_TOPICS.indexOf(topicId); const steps = LAB_STEPS[topicId]; const step = steps[value.stage];
  const title = ['Sensorsteuerung', 'Datenübertragung', 'Netzwerk und Dienste'][kind];
  const locked = disabled || completed || value.done || running;
  const report = kind === 1 ? prepareReport(value.answers[0]) : null;
  const delivery = kind === 1 ? replayReports(value.requests) : null;
  const currentCase = kind === 2 ? value.cases[value.index] : null;
  const probe = currentCase ? probeService(currentCase) : null;
  async function run() {
    if (locked || busy) return;
    const abort = new AbortController(); abortRef.current = abort; setRunning(true); setResults([]);
    const source = value.source; const checks = [];
    try {
      for (let i = 0; i < CONTROL_CASES.length; i++) {
        const result = await evaluateJs({ schema: 1, name: 'steuerung.js', source }, { id: 'journey-lf7-control', caseIndex: i, check: true }, abort.signal);
        checks.push({ passed: result.reason === 'success' && result.checked, text: result.reason === 'time' ? 'Zeitgrenze erreicht.' : result.details || 'Rückgabe, Datentyp und Fehlerreaktion prüfen.' });
        setResults([...checks]); if (result.reason !== 'success') break;
      }
      if (!abort.signal.aborted) onAction({ type: 'code-result', source, passed: checks.length === CONTROL_CASES.length && checks.every(c => c.passed) });
    } catch (error) { if (!abort.signal.aborted) setResults([{ passed: false, text: error.message }]); }
    finally { if (!abort.signal.aborted) setRunning(false); }
  }
  const action = a => onAction(a);
  return <section className="journey-model" aria-label={`Lernlabor: ${title}`}>
    <h3>{title} im lokalen Modell</h3><p>Fiktive Daten und Geräte. Dein Stand bleibt in diesem Lernabschnitt. Es werden keine echten Systeme angesprochen.</p>
    {value.done ? <p className="alert alert-success" role="status">Lernlabor erfolgreich abgeschlossen. Vergleiche dein Protokoll und bestätige deine Durchführung.</p> : <>
      <h4>{value.stage + 1}. {step.title}</h4><p>{step.text}</p>
      {step.fields.map(f => <label className="journey-model-field" key={f.key}>{f.label}
        {f.kind === 'number' ? <input className="input" inputMode="decimal" maxLength={12} value={value.answers[value.stage][f.key]} disabled={locked} onChange={e => action({ type: 'answer', field: f.key, value: e.target.value })} /> : <select value={value.answers[value.stage][f.key]} disabled={locked} onChange={e => action({ type: 'answer', field: f.key, value: e.target.value })}><option value="">Bitte auswählen</option>{f.options.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>}
      </label>)}
      {value.stage !== 1 && <>
        <button className="btn btn-primary" disabled={locked || busy} onClick={() => action({ type: 'check' })}>{kind === 1 && value.stage === 0 ? 'Bericht erzeugen und prüfen' : 'Schritt prüfen'}</button>
        {value.checked && <div aria-live="polite"><ul>{step.fields.map(f => <li key={f.key}>{labFieldPassed(f, value.answers[value.stage][f.key]) ? '✓' : '✗'} {f.label}: {f.text}</li>)}</ul>
          {kind === 1 && value.stage === 0 && <><p>Quelle: {report.input} Zeilen · Duplikate: {report.duplicates} · Zurückgestellt: {report.quarantined} · Übernommen: {report.accepted.length}.</p><Table rows={report.joined} title="Verknüpfte Aufträge" /><Table rows={report.rows} title="Erzeugter Bericht" /></>}
        </div>}
      </>}
      {value.stage === 1 && kind === 0 && <>
        <label className="journey-model-field">Deine Steuerfunktion<textarea className="journey-code-input" rows={10} maxLength={4096} spellCheck={false} value={value.source} disabled={locked} onChange={e => action({ type: 'code', value: e.target.value })} /></label>
        <p><code>Number.isFinite</code> prüft endliche Zahlen. Vergleiche die Verbindung strikt mit <code>true</code>. Liefere mit <code>return</code> einen der drei Texte. Maximal 4096 Zeichen.</p>
        <button className="btn btn-primary" disabled={locked || busy} onClick={run}>Steuerung ausführen und prüfen</button>
        {running && <button className="btn btn-ghost" onClick={() => { abortRef.current?.abort(); setRunning(false); }}>Prüfung stoppen</button>}
        <p role="status">{running ? `Modellproben laufen: ${results.length}/${CONTROL_CASES.length}.` : value.checked ? value.codePassed ? 'Alle Steuerungsproben bestanden.' : 'Die Steuerung braucht eine Korrektur.' : 'Führe deine Steuerung aus und prüfe die Reaktionen.'}</p>
        <details open={results.length > 0}><summary>Messwerte und Aktorreaktionen ansehen</summary><p>Pro Eingabe wird die tatsächliche Rückgabe mit dem erwarteten Modellzustand verglichen. Zusätzlich werden NaN, ±Infinity, ein fehlender Wert und danach erneut 20 °C bei gültiger Verbindung geprüft.</p><ol>{CONTROL_CASES.map((c, i) => <li key={i}><code>{JSON.stringify(c.temperature)}</code>, verbunden: <code>{JSON.stringify(c.connected)}</code> → {c.expected === 'on' ? 'Lüfter an' : c.expected === 'off' ? 'Lüfter aus' : 'Lüfter aus, Alarm an'} ({c.expected}){results[i] && <span> · {results[i].passed ? `✓ Rückgabe ${c.expected} und Fehler-/Wiederanlaufproben bestätigt` : `✗ ${results[i].text}`}</span>}</li>)}</ol></details>
      </>}
      {value.stage === 1 && kind === 1 && <>
        <Table rows={report.rows} title="Sollbericht aus den geprüften Quellen" />
        <p>POST /reports · Content-Type: application/json · ausschließlich simuliert. Im vorbereiteten Text ist „30“ ein Textwert: Sende ihn zuerst als Fehlerfall, entferne danach die Anführungszeichen um 30. Wiederhole den korrigierten Auftrag. Ändere zuletzt 30 auf 31 bei gleichem batchId, um den Konflikt zu prüfen.</p>
        <label className="journey-model-field">Transport<select value={value.transport} disabled={locked} onChange={e => action({ type: 'request-edit', field: 'transport', value: e.target.value })}><option value="https">HTTPS im Modell</option><option value="http">HTTP im Modell</option></select></label>
        <label className="journey-model-field">Senderrolle<select value={value.auth} disabled={locked} onChange={e => action({ type: 'request-edit', field: 'auth', value: e.target.value })}><option value="allowed">Freigegebene Senderrolle</option><option value="denied">Ohne Freigabe</option></select></label>
        <label className="journey-model-field">JSON-Anfrage<textarea className="journey-code-input" rows={7} maxLength={4096} spellCheck={false} value={value.payload} disabled={locked} onChange={e => action({ type: 'request-edit', field: 'payload', value: e.target.value })} /></label>
        <p>Nur fiktive Übungsdaten eingeben. Keine Zugangsdaten erforderlich. Maximal 16 Anfragen je Testfolge; anschließend kannst du die Folge neu beginnen.</p>
        <button className="btn btn-primary" disabled={locked || busy || value.requests.length >= 16} onClick={() => action({ type: 'send' })}>Anfrage im Modell senden</button>
        <button className="btn btn-ghost" disabled={locked || busy || !value.requests.length} onClick={() => action({ type: 'reset-requests' })}>Testfolge neu beginnen</button>
        <div role="status">{delivery.results.length ? `Antwort ${delivery.results.at(-1).status}: ${delivery.results.at(-1).message}` : 'Noch keine Übertragung.'}</div>
        <Table rows={delivery.receiver?.rows || []} title="Tatsächlicher Empfängerbestand im Modell" />
        <p role="status">{labStagePassed(topicId, value) ? 'Fehler, Erfolg, Wiederholung und Konflikt geprüft; Empfängerbestand stimmt.' : 'Erforderlich: 422 → 201 → 200 → 409 und Empfängerbestand Nord 30 / Süd 5.'}</p>
      </>}
      {value.stage === 1 && kind === 2 && <>
        <h4>Fall {value.index + 1} von 3</h4>
        <button className="btn btn-primary" disabled={locked || busy || currentCase.done} onClick={() => action({ type: 'probe' })}>{currentCase.observed ? 'Dienst erneut prüfen' : 'Befund abrufen'}</button>
        {Object.entries(SERVICE_FIELDS).map(([key, options]) => <label className="journey-model-field" key={key}>{{ address: 'Serveradresse', prefix: 'Netzpräfix', gateway: 'Servergateway', dns: 'DNS-Zieladresse', port: 'Dienstport', policy: 'Portalzugriff', diagnosis: 'Ursache des Ausgangsfehlers' }[key]}<select value={currentCase[key]} disabled={locked || !currentCase.observed || currentCase.done} onChange={e => action({ type: 'configure', field: key, value: e.target.value })}>{options.map(option => <option key={option} value={option}>{{ '': 'Bitte auswählen', staff: 'Nur Mitarbeitende', all: 'Mitarbeitende und Gäste', none: 'Kein Portalzugriff', dns: 'DNS-Eintrag', service: 'Dienstbetrieb', policy: 'Zugriffsregel' }[option] || option}</option>)}</select></label>)}
        <label className="journey-model-field">Dienstbetrieb<select value={String(currentCase.running)} disabled={locked || !currentCase.observed || currentCase.done} onChange={e => action({ type: 'configure', field: 'running', value: e.target.value === 'true' })}><option value="true">Gestartet</option><option value="false">Gestoppt</option></select></label>
        {currentCase.checked && <div role="status"><ul>{probe.messages.map(text => <li key={text}>{text}</li>)}</ul></div>}
        <button className="btn btn-primary" disabled={locked || busy || currentCase.done || !currentCase.checked || !probe.passed || currentCase.diagnosis !== ['dns', 'service', 'policy'][value.index]} onClick={() => action({ type: 'finish-case' })}>Dienstfall abschließen</button>
        {value.cases.every(c => c.done) && <p role="status">Alle drei Dienstfälle erfolgreich geprüft.</p>}
      </>}
      <button className="btn btn-primary" disabled={locked || busy || !value.checked || !labStagePassed(topicId, value)} onClick={() => action({ type: 'next' })}>{value.stage === 2 ? 'Lernlabor abschließen' : 'Geprüften Laborschritt übernehmen'}</button>
    </>}
    {(value.stage > 0 || value.done) && <details open={value.done}><summary>Laborprotokoll ansehen</summary><ol>{steps.slice(0, value.done ? 3 : value.stage).map((s, i) => <li key={s.title}><strong>{s.title}</strong><ul>{s.fields.map(f => <li key={f.key}>{f.label}: {f.kind === 'number' ? value.answers[i][f.key] : f.options.find(([key]) => key === value.answers[i][f.key])?.[1]}</li>)}</ul></li>)}</ol>
      {kind === 0 && value.codePassed && <><p>Steuerung einschließlich Verbindungs-/Wertefehlern geprüft.</p><pre className="journey-code">{value.testedSource}</pre></>}
      {kind === 1 && <><Table rows={report.rows} title="Quellbericht" /><ol>{delivery.results.map((r, i) => <li key={i}>Anfrage {i + 1}: {r.status} – {r.message}</li>)}</ol><Table rows={delivery.receiver?.rows || []} title="Empfangsprotokoll" /></>}
      {kind === 2 && value.cases.filter(c => c.done).map((c, i) => <details key={i}><summary>Fall {i + 1}: {['DNS', 'Dienst', 'Zugriffsregel'][i]} korrigiert</summary><p>{c.address}/{c.prefix}, Gateway {c.gateway}, DNS-Ziel {c.dns}, TCP {c.port}, Portalregel: {c.policy}.</p><ul>{probeService(c).messages.map(text => <li key={text}>{text}</li>)}</ul></details>)}
    </details>}
  </section>;
}
