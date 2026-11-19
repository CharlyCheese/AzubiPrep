import { useId } from 'react';
import { NETWORK_CASES, DIAGNOSES, probeNetwork, initialProbe, networkPassed, createNetwork } from '../utils/journeyNetwork.js';

function Evidence({ result }) {
  return <>
    <ul>{result.checks.map(item => <li key={item.id}><strong>{item.label}: {item.skipped ? 'noch nicht geprüft' : item.passed ? 'erfüllt' : 'Fehler'}.</strong> {!item.skipped && item.text}</li>)}</ul>
    <p>Probe zur Server-IP 198.51.100.20: {result.ipReachable ? 'im Modell erfolgreich' : 'im Modell noch nicht erfolgreich'}.</p>
    <p>{result.application}</p>
  </>;
}

export default function JourneyNetwork({ value, disabled = false, busy = false, completed = false, onAction }) {
  const prefix = useId();
  const complete = networkPassed(value);
  const c = value.cases[value.index];
  const result = probeNetwork(c);
  const configure = (field, selected) => onAction({ type: 'configure', field, value: selected });
  const canFinish = c.observed && c.checked && result.passed && c.diagnosis === NETWORK_CASES[value.index].id;
  return <section className="journey-network" aria-label="Netzwerklabor">
    <h3>Clientverbindung im Modell prüfen</h3>
    <p>Diese Simulation sendet keine Netzwerkanfragen und verändert nichts an deinem PC.
      Router, Server und Firewall funktionieren im vorgegebenen Modell. Eine erfolgreiche IP-Probe allein beweist keine funktionierende Anwendung.</p>
    <div className="journey-example">
      <h4>Dein Netzplan</h4>
      <p>Client → Switch → Router → Portalserver. Netz: <strong>192.0.2.0/24</strong>,
        Standardgateway: <strong>192.0.2.1</strong>, DNS-Dienst: <strong>192.0.2.53</strong>.
        Ein weiterer Client belegt 192.0.2.10. Der Name <strong>portal.example.test</strong> verweist auf den Server <strong>198.51.100.20</strong> in einem anderen Netz.</p>
      <p>Wähle eine freie Clientadresse von 192.0.2.2 bis 192.0.2.254, außer .10 und .53.
        Die .1 ist bereits der Router; .0 und .255 sind in diesem /24 keine Hostadressen.
        Alle Adressen und Ergebnisse sind ausschließlich Übungsdaten.</p>
    </div>
    {!complete && <>
      <h4>{NETWORK_CASES[value.index].title}</h4>
      <p>Rufe zuerst die Ausgangsprobe ab. Ordne den Befund ein, korrigiere die Konfiguration und prüfe erneut.
        Nach jeder Änderung wird die bisherige Prüfung verworfen.</p>
      {c.observed && <details className="journey-detail"><summary>Ausgangsbefund nachlesen</summary><Evidence result={initialProbe(value.index)} /></details>}
      <fieldset disabled={disabled || !c.observed} className="journey-network-fields">
        <legend>Konfiguration und Einordnung</legend>
        <label htmlFor={`${prefix}-linked`}>Verbindung</label>
        <select id={`${prefix}-linked`} value={String(c.linked)} onChange={e => configure('linked', e.target.value === 'true')}>
          <option value="false">Unterbrochen</option><option value="true">Mit dem vorgesehenen Switch verbunden</option>
        </select>
        {[['ip', 'IPv4-Adresse'], ['gateway', 'Standardgateway'], ['dns', 'DNS-Server']].map(([field, label]) => <div key={field}>
          <label htmlFor={`${prefix}-${field}`}>{label}</label>
          <input id={`${prefix}-${field}`} inputMode="decimal" autoComplete="off" spellCheck={false} maxLength={15} value={c[field]} onChange={e => configure(field, e.target.value)} />
        </div>)}
        <label htmlFor={`${prefix}-prefix`}>Netzpräfix</label>
        <select id={`${prefix}-prefix`} value={c.prefix} onChange={e => configure('prefix', e.target.value)}>{['24', '25', '26'].map(p => <option key={p} value={p}>/{p}</option>)}</select>
        <label htmlFor={`${prefix}-diagnosis`}>Ursache des Ausgangsfehlers</label>
        <select id={`${prefix}-diagnosis`} value={c.diagnosis} onChange={e => configure('diagnosis', e.target.value)}>
          <option value="">Bitte einordnen</option>{Object.entries(DIAGNOSES).map(([id, title]) => <option key={id} value={id}>{title}</option>)}
        </select>
      </fieldset>
      <div className="journey-actions">
        <button type="button" className="btn btn-primary" disabled={disabled || busy} onClick={() => onAction({ type: 'test' })}>{c.observed ? 'Erneut prüfen' : 'Ausgangsprobe abrufen'}</button>
        <button type="button" className="btn btn-ghost" disabled={disabled || busy || !canFinish} onClick={() => onAction({ type: 'finish' })}>{value.index < 2 ? 'Fall abschließen – weiter' : 'Labor abschließen'}</button>
      </div>
      {c.checked && <div role="status" aria-label="Ergebnis der Netzwerkprobe" className={`alert ${result.passed ? 'alert-success' : 'alert-warning'}`}>
        <strong>{result.passed ? 'Die Verbindung funktioniert im Modell.' : 'Eine Störung bleibt zu bearbeiten.'}</strong>
        <Evidence result={result} />
        {result.passed && c.diagnosis !== NETWORK_CASES[value.index].id && <p>Vergleiche deine Einordnung mit dem Ausgangsbefund. Die Ursache muss zu diesem ursprünglichen Befund passen.</p>}
      </div>}
    </>}
    {complete && <p role="status">Alle drei Fälle sind geprüft und abgeschlossen. {completed ? 'Der bestätigte Stand bleibt zum Nachlesen erhalten.' : 'Vergleiche das Protokoll mit deinem Vorgehen und bestätige anschließend die praktische Aufgabe.'}</p>}
    {value.cases.some(item => item.done) && <section className="journey-example" aria-label="Netzwerkprotokoll">
      <h4>Gespeichertes Modellprotokoll</h4>
      {value.cases.map((item, i) => item.done && <details className="journey-detail" key={NETWORK_CASES[i].id}>
        <summary>Fall {i + 1}: {DIAGNOSES[item.diagnosis]} – behoben</summary>
        <p>Ausgangskonfiguration: Verbindung {createNetwork().cases[i].linked ? 'vorhanden' : 'unterbrochen'},
          Client {createNetwork().cases[i].ip}/24, Gateway 192.0.2.1, DNS {createNetwork().cases[i].dns}.</p>
        <p>Ausgangsprobe abgerufen: {initialProbe(i).checks.find(check => check.id === NETWORK_CASES[i].id).text}</p>
        <p>Abschließend: Verbindung vorhanden, Client {item.ip}/{item.prefix}, Gateway {item.gateway}, DNS {item.dns}.
          Einordnung: {DIAGNOSES[item.diagnosis]}. Erneute IP-, Namens- und Anwendungsprobe im Modell erfolgreich.</p>
      </details>)}
      <p>Abgeschlossene Fälle bleiben unverändert zum Nachlesen erhalten. Die eigene Reflexion kann eine Begründung oder Verbesserung ergänzen.</p>
    </section>}
  </section>;
}
