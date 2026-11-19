import { useState } from 'react';
import { calculationSheet, evaluateCells, calculateExpression, checkCalculation, MAX_CELL_LENGTH } from '../utils/journeyCalculation.js';

const number = value => new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(value);

export default function JourneyCalculation({ topicId, value, disabled, onChange }) {
  const [checked, setChecked] = useState(false);
  const [showSolutions, setShowSolutions] = useState(false);
  const [expression, setExpression] = useState('');
  const [calculator, setCalculator] = useState(null);
  const sheet = calculationSheet(topicId);
  if (!sheet || !value) return null;
  const evaluated = evaluateCells(value.cells);
  const result = checked ? checkCalculation(topicId, value.cells) : null;
  function change(id, text) { setChecked(false); setCalculator(null); onChange(id, text); }
  return <section className="journey-calculation" aria-label="Kalkulation zum Thema">
    <h3>{sheet.title}</h3>
    <p>{sheet.task}</p>
    <p>Runde berechnete Geldbeträge auf Cent, etwa mit <code>=RUNDEN(B1*B2;2)</code>. Für Verhältnisse wie Marge, rechnerische Gewinnschwelle und Jahre genügt eine Zahl auf zwei Nachkommastellen; mit Formeln kannst du genauer weiterrechnen.</p>
    <p>Ändere die Vorgaben für eigene Fälle. Löse die Ergebniszeilen mit einer Zahl oder einer Formel, zum Beispiel <code>=B1*B2</code>.
      Die Rückmeldung prüft die Rechnung mit deinen aktuellen Vorgaben. Sie vergibt keine Note und verändert den Themenabschluss nicht.</p>
    <details className="journey-detail"><summary>So bedienst du die Tabelle</summary>
      <p>Dezimalkomma und Dezimalpunkt sind möglich: <code>35,50</code> oder <code>35.50</code>. Schreibe Zahlen ohne Tausendertrennzeichen.
        Eine Zahl wie <code>20</code> in einer Prozentzeile bedeutet 20 Prozent; in einer Formel teilst du dafür durch 100.</p>
      <p>Formeln beginnen mit =. Erlaubt sind +, −, *, /, Klammern und die Zellen dieser Tabelle.
        <code> =SUMME(B3;B5:B6)</code> addiert B3, B5 und B6. <code>=RUNDEN(B1*B2;2)</code> rundet auf zwei Nachkommastellen.
        Ohne RUNDEN bleibt der Rechenwert genauer als die auf zwei Stellen gerundete Anzeige.</p>
      <p>Leere Bezugszellen, Kreisbezüge und Division durch null werden erklärt. Deine Eingaben und Formeln bleiben mit diesem Themenstand gespeichert und sind in seiner Sicherung enthalten.</p>
    </details>
    <div className="journey-calculation-scroll" tabIndex={0} role="region" aria-label="Kalkulationstabelle, bei Bedarf seitlich verschieben">
      <table className="journey-calculation-table">
        <caption>Vorgaben und eigene Rechenwege · Beträge im Modell vor Steuern, außer ausdrücklich ausgewiesener Umsatzsteuer</caption>
        <thead><tr><th scope="col">Zelle / Größe</th><th scope="col">Zahl oder Formel</th><th scope="col">Rechenwert</th></tr></thead>
        <tbody>{sheet.rows.map((row, index) => {
          const id = `B${index + 1}`; const calculated = evaluated[id];
          return <tr key={id}>
            <th scope="row"><label htmlFor={`calculation-${id}`}>{id} · {row.label}</label><span className="small">{index < sheet.inputs ? 'Vorgabe' : 'Deine Berechnung'} · {row.unit}</span></th>
            <td><input id={`calculation-${id}`} aria-label={`${id} ${row.label}`} type="text" autoComplete="off" spellCheck={false}
              maxLength={MAX_CELL_LENGTH} value={value.cells[id]} disabled={disabled} onChange={event => change(id, event.target.value)} /></td>
            <td>{calculated?.error ? <span className="small">{value.cells[id].trim() ? calculated.error : 'Noch offen'}</span>
              : <output aria-label={`${id} Rechenwert`}>{topicId === 'common-pm-feasibility' && id === 'B8' ? '≈ ' : ''}{number(calculated.value)} {row.unit}</output>}</td>
          </tr>;
        })}</tbody>
      </table>
    </div>
    <div className="journey-actions"><button type="button" className="btn btn-primary" disabled={disabled} onClick={() => setChecked(true)}>Rechnung prüfen</button>
      <button type="button" className="btn btn-ghost" onClick={() => setShowSolutions(!showSolutions)}>{showSolutions ? 'Musterformeln ausblenden' : 'Musterformeln ansehen'}</button></div>
    {result && <div role="status" aria-label="Prüfergebnis der Kalkulation" className={`alert ${result.passed ? 'alert-success' : 'alert-warning'}`}>
      <strong>{result.passed ? 'Die Rechnung passt zu deinen Vorgaben.' : 'Prüfe deinen Rechenweg noch einmal.'}</strong>
      {result.error ? <p>{result.error}</p> : <ul>{result.results.map(item => <li key={item.id}>
        {item.id}: {item.correct ? 'Richtig.' : item.error || `Erwartet werden rund ${number(item.expected)}. Prüfe Bezugsgröße und Rechenzeichen.`}
      </li>)}</ul>}
      {Number.isFinite(result.minimumWholeUnits) && <p>Die angezeigte rechnerische Gewinnschwelle ist gerundet. Aus deinen Vorgaben folgt als kleinste ganze Menge ohne Verlust: <strong>{number(result.minimumWholeUnits)} Stück</strong>. Auch ein kleiner Rest über einer ganzen Zahl erfordert das nächste Stück.</p>}
    </div>}
    {showSolutions && <div className="journey-example"><h4>Mögliche Formeln</h4><p>Andere gleichwertige Formeln oder korrekt ausgerechnete Zahlen sind ebenfalls möglich.</p>
      <ul>{sheet.rows.map((row, index) => row.formula && <li key={index}>B{index + 1}: <code>{row.formula}</code></li>)}</ul>
    </div>}
    <details className="journey-detail"><summary>Rechenhilfe öffnen</summary>
      <label htmlFor="journey-calculator">Deine Rechnung, zum Beispiel (80*35)*20/100</label>
      <input id="journey-calculator" value={expression} maxLength={MAX_CELL_LENGTH} onChange={event => { setExpression(event.target.value); setCalculator(null); }} />
      <button type="button" className="btn btn-ghost" onClick={() => setCalculator(calculateExpression(expression, value.cells))}>Ausrechnen</button>
      {calculator && <p role="status">{calculator.error || `Ergebnis: ${number(calculator.value)}. Übertrage den Wert bei Bedarf in die passende Zelle.`}</p>}
    </details>
  </section>;
}
