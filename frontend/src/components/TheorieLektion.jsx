import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ai, isLocalAi } from '../api/ai.js';
import { aiStore } from '../store/aiStore.js';
import '../styles/ki.css';
import '../styles/theorie.css';

export default function TheorieLektion({ topic = null }) {
  const settings = aiStore.useStore(); const [question, setQuestion] = useState('');
  const [privateSource, setPrivateSource] = useState(false); const [material, setMaterial] = useState(null);
  const [answer, setAnswer] = useState(null); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const active = useRef(null); const version = useRef(0);
  const heading = useRef(null);
  useEffect(() => { if (topic) { heading.current?.scrollIntoView({ block: 'start' }); heading.current?.focus({ preventScroll: true }); } }, [topic?.id]);
  const materialStand = privateSource ? `${material?.revision}:${material?.state}:${(material?.documents || []).map(document => `${document.id}:${document.state}`).join(',')}` : '';
  const key = `${topic?.id || 'search'}:${privateSource}:${settings.enabled}:${settings.model}:${materialStand}`;
  useEffect(() => {
    if (!isLocalAi()) return undefined;
    let mounted = true; let controller;
    async function refresh() {
      controller?.abort(); const current = new AbortController(); controller = current;
      try { const value = await ai.materialStatus(current.signal); if (mounted && !current.signal.aborted) setMaterial(value); }
      catch { if (mounted && !current.signal.aborted) setMaterial({ state: 'unavailable', revision: 'unavailable' }); }
    }
    refresh(); const timer = setInterval(refresh, 5000); window.addEventListener('azubiprep-material-changed', refresh);
    return () => { mounted = false; controller?.abort(); clearInterval(timer); window.removeEventListener('azubiprep-material-changed', refresh); };
  }, []);
  useEffect(() => { version.current++; active.current?.abort(); setBusy(false); setAnswer(null); setError(''); return () => { version.current++; active.current?.abort(); }; }, [key]);
  async function request(intent) {
    const current = ++version.current; active.current?.abort(); const controller = new AbortController(); active.current = controller;
    setBusy(true); setAnswer(null); setError('');
    try {
      const value = await ai.help({ model: settings.model, intent, question: question.trim(), context: { kind: 'theory', topicId: topic?.id || 'search' }, useMaterial: privateSource }, controller.signal);
      if (!controller.signal.aborted && current === version.current) setAnswer(value);
    } catch (e) { if (!controller.signal.aborted && current === version.current) setError(e.message); }
    finally { if (current === version.current) setBusy(false); }
  }
  function cancel() { version.current++; active.current?.abort(); setBusy(false); setError('Anfrage abgebrochen.'); }
  const canRead = isLocalAi() && !busy && (topic || question.trim().length >= 3) && (!privateSource || material?.state === 'ready');
  return <section className="card theorie-lesson" aria-label="Theorie lernen">
    <h2 ref={heading} tabIndex={-1}>{topic?.title || 'Wissenssuche mit Qwen'}</h2>
    <p>{topic ? `${topic.field} · Erklärung, Praxisbeispiel und Merksatz – ohne vorher ein Quiz zu beantworten.` : 'Frage nach einem Begriff oder Zusammenhang aus deiner Ausbildung, zum Beispiel: „Was ist der Unterschied zwischen RAM und SSD?“'}</p>
    <fieldset disabled={busy || !isLocalAi()} className="theorie-sources"><legend>Lernquellen für diese Anfrage</legend>
      <label><input type="radio" name={`sources-${topic?.id || 'search'}`} checked={!privateSource} onChange={() => setPrivateSource(false)} /> App-Lerninhalte</label>
      <label><input type="radio" name={`sources-${topic?.id || 'search'}`} checked={privateSource} disabled={!privateSource && material?.state !== 'ready'} onChange={() => setPrivateSource(true)} /> Eigene lokale Unterlagen</label>
    </fieldset>
    <p className="small text-muted">{privateSource ? 'Nur passende Abschnitte deiner lokalen Unterlagen werden verwendet. Es gibt keinen stillen Wechsel auf andere Quellen. Auszüge und Antworten werden hier nicht dauerhaft gespeichert.' : 'Verwendet werden vorhandene Erklärungen und Kurztexte aus der App. Das ist ein Theorieeinstieg, kein vollständig geprüfter Lehrgang; besonders Rechtsstände können sich ändern.'}</p>
    {material?.state !== 'ready' && <p className="small">Eigene Unterlagen sind noch nicht bereit. <Link to="/einstellungen">Materialverwaltung öffnen</Link>.</p>}
    <label className="ki-field">Deine Frage oder Rückfrage{topic ? ' (optional)' : ''}<textarea rows={3} maxLength={600} value={question} onChange={event => { if (busy) cancel(); setQuestion(event.target.value); setAnswer(null); }} placeholder={topic ? 'Zum Beispiel: Erkläre das einfacher oder zeige ein kleines Beispiel.' : 'Erkläre mir …'} /></label>
    <p className="small">Rückfragen beziehen sich auf dieses Thema und neue passende Fundstellen. Es wird kein Chatverlauf mitgeschickt. Für eine konkrete Rückfrage den Begriff erneut nennen.</p>
    <div className="ki-actions">
      <button className="btn btn-primary" disabled={!canRead || !settings.enabled} onClick={() => request('explain')}>{topic ? 'Thema erklären' : 'Frage erklären'}</button>
      <button className="btn btn-ghost" disabled={!canRead} onClick={() => request('read')}>Fundstellen lesen</button>
      {busy && <button className="btn btn-ghost" onClick={cancel}>Anfrage abbrechen</button>}
    </div>
    {!settings.enabled && <p>Für Erklärungen <Link to="/einstellungen">Qwen aktivieren</Link>. Fundstellen lesen funktioniert auch ohne laufendes Modell.</p>}
    {!isLocalAi() && <p>Eigene Unterlagen und Qwen sind nur in der lokal gestarteten App verfügbar.</p>}
    {busy && <p role="status">Die Lernquellen werden lokal durchsucht …</p>}
    {error && <p role="alert">{error} Du kannst auch „Fundstellen lesen“ versuchen.</p>}
    {answer && <div className="ki-answer" aria-label="Theorieantwort"><p className="small">{answer.source === 'sources' ? 'Originalfundstellen · ohne KI-Erklärung' : answer.source === 'context_guard' ? 'Rückmeldung zu den Lernquellen' : `KI-Erklärung · ${answer.model}`}</p><div className="ki-text">{answer.text}</div>
      {answer.sources?.length > 0 && <div aria-label="Fundstellen"><h3>Originalauszüge</h3>{answer.sources.map(source => <figure className="theorie-quote" key={source.id}><figcaption>[{source.id}] {source.label}{source.kind !== 'public' && ` · PDF-Seite ${source.page}`}</figcaption><blockquote className="ki-text">{source.excerpt}</blockquote><p className="small">Begrenzter Ausschnitt aus der Fundstelle.</p></figure>)}</div>}
      {answer.truncated && <p>Die Erklärung hat die Ausgabelänge erreicht. Frage gezielt zu einem Teilbegriff nach.</p>}
      <p className="small text-muted">Quellenzuordnung prüft keine fachliche Wahrheit. Vergleiche die Erklärung mit dem Original und deinem Unterricht. Keine Benotung oder Änderung deines Lernstands.</p>
    </div>}
    {topic?.practice && <Link className="btn btn-ghost mt-2" to={`/quiz/${encodeURIComponent(topic.practice.moduleId)}?frage=${encodeURIComponent(topic.practice.id)}`}>Passende Frage üben →</Link>}
  </section>;
}
