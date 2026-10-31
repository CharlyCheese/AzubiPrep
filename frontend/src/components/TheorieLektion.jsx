import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ai, isLocalAi } from '../api/ai.js';
import { aiStore } from '../store/aiStore.js';
import '../styles/ki.css';
import '../styles/theorie.css';

export default function TheorieLektion({ topic = null }) {
  const settings = aiStore.useStore(); const [question, setQuestion] = useState('');
  const cloud = settings.provider === 'chatgpt';
  const [privateSource, setPrivateSource] = useState(false); const [material, setMaterial] = useState(null);
  const [answer, setAnswer] = useState(null); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const [detail, setDetail] = useState('detailed'); const [parts, setParts] = useState({}); const [phase, setPhase] = useState('');
  const sections = topic?.sections || [];
  const active = useRef(null); const version = useRef(0);
  const heading = useRef(null);
  useEffect(() => { if (topic) { heading.current?.scrollIntoView({ block: 'start' }); heading.current?.focus({ preventScroll: true }); } }, [topic?.id]);
  const materialStand = privateSource ? `${material?.revision}:${material?.state}:${(material?.documents || []).map(document => `${document.id}:${document.state}`).join(',')}` : '';
  const key = `${topic?.id || 'search'}:${privateSource}:${settings.enabled}:${settings.provider}:${settings.accountRevision}:${settings.model}:${detail}:${materialStand}`;
  useEffect(() => { setQuestion(''); }, [settings.provider, settings.accountRevision, privateSource]);
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
  useEffect(() => { version.current++; active.current?.abort(); setBusy(false); setAnswer(null); setParts({}); setPhase(''); setError(''); return () => { version.current++; active.current?.abort(); }; }, [key]);
  async function request(intent) {
    const current = ++version.current; active.current?.abort(); const controller = new AbortController(); active.current = controller;
    setBusy(true); setAnswer(null); setError('');
    try {
      const value = await ai.help({ provider: intent === 'read' ? 'none' : settings.provider, model: settings.model, intent, question: question.trim(), context: { kind: 'theory', topicId: topic?.id || 'search', detail }, useMaterial: privateSource }, controller.signal);
      if (!controller.signal.aborted && current === version.current) setAnswer(value);
    } catch (e) { if (!controller.signal.aborted && current === version.current) setError(e.message); }
    finally { if (current === version.current) setBusy(false); }
  }
  async function explainSections(selected) {
    if (busy || !selected.length) return;
    const current = ++version.current; active.current?.abort(); const controller = new AbortController(); active.current = controller;
    setBusy(true); setPhase(''); setError('');
    try {
      for (const section of selected) {
        if (controller.signal.aborted || current !== version.current) break;
        setPhase(`${section.number}. ${section.title}`); setParts(previous => ({ ...previous, [section.id]: { state: 'loading' } }));
        try {
          const value = await ai.help({ provider: settings.provider, model: settings.model, intent: 'explain', question: '', context: { kind: 'theory', topicId: topic.id, sectionId: section.id, detail: 'detailed' }, useMaterial: privateSource }, controller.signal);
          if (controller.signal.aborted || current !== version.current) break;
          setParts(previous => ({ ...previous, [section.id]: { state: value.source === 'model' ? 'done' : 'gap', answer: value } }));
        } catch (e) {
          if (controller.signal.aborted || current !== version.current) break;
          setParts(previous => ({ ...previous, [section.id]: { state: 'error', error: e.message } }));
          setError('Der Ablauf wurde angehalten. Fertige Abschnitte bleiben sichtbar; du kannst den offenen Teil erneut anfordern.'); break;
        }
      }
    } finally { if (current === version.current) { setBusy(false); setPhase(''); } }
  }
  function cancel() {
    version.current++; active.current?.abort(); setBusy(false); setPhase(''); setError('Anfrage abgebrochen. Fertige Abschnitte bleiben sichtbar.');
    setParts(previous => Object.fromEntries(Object.entries(previous).map(([id, part]) => [id, part.state === 'loading' ? { state: 'error', error: 'Anfrage abgebrochen.' } : part])));
  }
  const canRead = isLocalAi() && !busy && (topic || question.trim().length >= 3) && (!privateSource || material?.state === 'ready');
  const canExplain = canRead && settings.enabled && settings.model && (!privateSource || settings.provider === 'qwen');
  const openSections = sections.filter(section => !parts[section.id] || parts[section.id].state === 'error');
  const explained = sections.filter(section => parts[section.id]?.state === 'done').length;
  const gaps = sections.filter(section => parts[section.id]?.state === 'gap').length;
  return <section className="card theorie-lesson" aria-label="Theorie lernen">
    <h2 ref={heading} tabIndex={-1}>{topic?.title || 'Wissenssuche'}</h2>
    {cloud && <p><strong>Eigenes ChatGPT-Abo · Internet nötig.</strong> Erklärungen zu App-Lerninhalten senden die angefragten Inhalte und deine Frage an OpenAI. Private Unterlagen bleiben ausschließlich lokal; sie können hier ohne KI gelesen werden. Keine privaten Unterlagen in das Fragefeld kopieren.</p>}
    {cloud && privateSource && <p>Für eigene Unterlagen steht mit ChatGPT ausschließlich „Fundstellen lesen“ zur Verfügung. Wähle lokales Qwen für eine private KI-Erklärung.</p>}
    <p>{topic ? `${topic.field} · Erklärung, Praxisbeispiel und Merksatz – ohne vorher ein Quiz zu beantworten.` : 'Frage nach einem Begriff oder Zusammenhang aus deiner Ausbildung, zum Beispiel: „Was ist der Unterschied zwischen RAM und SSD?“'}</p>
    {topic && !sections.length && /^LF\d/.test(topic.field) && <p><Link to={`/theorie?lf=${encodeURIComponent(topic.field)}`}>Den Lernfeldeinstieg zu {topic.field} mit allen Abschnitten öffnen →</Link></p>}
    <fieldset disabled={busy || !isLocalAi()} className="theorie-sources"><legend>Lernquellen für diese Anfrage</legend>
      <label><input type="radio" name={`sources-${topic?.id || 'search'}`} checked={!privateSource} onChange={() => setPrivateSource(false)} /> App-Lerninhalte</label>
      <label><input type="radio" name={`sources-${topic?.id || 'search'}`} checked={privateSource} disabled={!privateSource && material?.state !== 'ready'} onChange={() => setPrivateSource(true)} /> Eigene lokale Unterlagen</label>
    </fieldset>
    <p className="small text-muted">{privateSource ? 'Nur passende Abschnitte deiner lokalen Unterlagen werden verwendet. Es gibt keinen stillen Wechsel auf andere Quellen. Auszüge und Antworten werden hier nicht dauerhaft gespeichert.' : 'Verwendet werden vorhandene Erklärungen und Kurztexte aus der App. Das ist ein Theorieeinstieg, kein vollständig geprüfter Lehrgang; besonders Rechtsstände können sich ändern.'}</p>
    {material?.state !== 'ready' && <p className="small">Eigene Unterlagen sind noch nicht bereit. <Link to="/einstellungen">Materialverwaltung öffnen</Link>.</p>}
    {sections.length > 0 && <section className="theorie-outline" aria-label="Lernfeld Schritt für Schritt">
      <h3>Das Lernfeld Schritt für Schritt</h3>
      <p>Die folgende Gliederung führt durch die zentralen Themen. Jeder Abschnitt erhält eigene Fundstellen und eine ausführliche Erklärung mit Grundlagen, Beispiel, typischen Fehlern und Zusammenfassung.</p>
      <p className="small">Der gesamte Ablauf benötigt mehrere Modellanfragen und kann länger dauern. Bei ChatGPT nutzen diese dein Abo-Kontingent. Fertige Erklärungen bleiben auf dieser Seite; Wechsel von Quellen, Anbieter, Konto, Modell oder Erklärungstiefe sowie Verlassen der Seite verwirft sie. Die Gliederung beweist keine vollständige Stoff- oder Quellenabdeckung.</p>
      <button className="btn btn-primary" disabled={!canExplain || !openSections.length} onClick={() => explainSections(openSections)}>Alle offenen Abschnitte ausführlich erklären</button>
      <p role="status">{explained} von {sections.length} Abschnitten mit Erklärung · {gaps} mit Quellenlücke{phase ? ` · Aktuell: ${phase}` : ''}</p>
      {busy && phase && <button className="btn btn-ghost" onClick={cancel}>Lernfeldablauf abbrechen</button>}
      {sections.map(section => <details className="theorie-part" key={section.id} open={Boolean(parts[section.id])} aria-label={`Abschnitt ${section.id}`}>
        <summary>{section.number}. {section.title}{parts[section.id]?.state === 'gap' ? ' · Quellenlücke' : parts[section.id]?.state === 'done' ? ' · Erklärung vorhanden' : ''}</summary>
        <button className="btn btn-ghost mt-2" disabled={!canExplain} onClick={() => explainSections([section])}>Diesen Abschnitt ausführlich erklären</button>
        {parts[section.id]?.state === 'loading' && <p>Abschnitt wird erklärt …</p>}
        {parts[section.id]?.error && <p role="alert">{parts[section.id].error}</p>}
        {parts[section.id]?.answer && <TheoryAnswer answer={parts[section.id].answer} />}
      </details>)}
    </section>}
    <label className="ki-field">Erklärungstiefe<select aria-label="Erklärungstiefe" value={detail} disabled={busy} onChange={event => setDetail(event.target.value)}><option value="detailed">Ausführlich – Grundlagen, Beispiel und typische Fehler</option><option value="short">Kompakt – kurzer Überblick</option></select></label>
    <label className="ki-field">Deine Frage oder Rückfrage{topic ? ' (optional)' : ''}<textarea rows={3} maxLength={600} value={question} onChange={event => { if (busy) cancel(); setQuestion(event.target.value); setAnswer(null); }} placeholder={topic ? 'Zum Beispiel: Erkläre das einfacher oder zeige ein kleines Beispiel.' : 'Erkläre mir …'} /></label>
    <p className="small">Rückfragen beziehen sich auf dieses Thema und neue passende Fundstellen. Es wird kein Chatverlauf mitgeschickt. Für eine konkrete Rückfrage den Begriff erneut nennen.</p>
    <div className="ki-actions">
      <button className="btn btn-primary" disabled={!canExplain} onClick={() => request('explain')}>{topic ? 'Thema erklären' : 'Frage erklären'}</button>
      <button className="btn btn-ghost" disabled={!canRead} onClick={() => request('read')}>Fundstellen lesen</button>
      {busy && <button className="btn btn-ghost" onClick={cancel}>Anfrage abbrechen</button>}
    </div>
    {(!settings.enabled || !settings.model) && <p>Für Erklärungen einen <Link to="/einstellungen">KI-Anbieter und Modell auswählen</Link>. Fundstellen lesen funktioniert auch ohne laufendes Modell.</p>}
    {!isLocalAi() && <p>Eigene Unterlagen und Qwen sind nur in der lokal gestarteten App verfügbar.</p>}
    {busy && <p role="status">{cloud && !privateSource ? 'App-Lerninhalte werden gesucht; die Erklärung kommt von ChatGPT …' : 'Die Lernquellen werden lokal durchsucht …'}</p>}
    {error && <p role="alert">{error} Du kannst auch „Fundstellen lesen“ versuchen.</p>}
    {answer && <TheoryAnswer answer={answer} />}
    {topic?.practice && <Link className="btn btn-ghost mt-2" to={`/quiz/${encodeURIComponent(topic.practice.moduleId)}?frage=${encodeURIComponent(topic.practice.id)}`}>Passende Frage üben →</Link>}
  </section>;
}

function TheoryAnswer({ answer }) {
  return <div className="ki-answer" aria-label="Theorieantwort"><p className="small">{answer.source === 'sources' ? 'Originalfundstellen · ohne KI-Erklärung' : answer.source === 'context_guard' ? 'Rückmeldung zu den Lernquellen' : `KI-Erklärung · ${answer.model}`}</p><div className="ki-text">{answer.text}</div>
    {answer.sources?.length > 0 && <div aria-label="Fundstellen"><h3>Originalauszüge</h3>{answer.sources.map(source => <figure className="theorie-quote" key={source.id}><figcaption>[{source.id}] {source.label}{source.kind !== 'public' && ` · PDF-Seite ${source.page}`}</figcaption><blockquote className="ki-text">{source.excerpt}</blockquote><p className="small">Begrenzter Ausschnitt aus der Fundstelle.</p></figure>)}</div>}
    {answer.truncated && <p>Die Erklärung hat die Ausgabelänge erreicht. Frage gezielt zu einem Teilbegriff nach.</p>}
    <p className="small text-muted">Quellenzuordnung prüft keine fachliche Wahrheit. Vergleiche die Erklärung mit dem Original und deinem Unterricht. Keine Benotung oder Änderung deines Lernstands.</p>
  </div>;
}
