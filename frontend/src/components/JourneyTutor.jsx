import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ai, isLocalAi } from '../api/ai.js';
import { aiStore } from '../store/aiStore.js';

const endSession = id => { if (id) ai.journeyEnd(id).catch(() => {}); };

function ContextPreview({ topic, kind, target }) {
  const blocks = kind === 'theory' ? [target] : [];
  return <details className="journey-detail"><summary>Gesendeten Lernkontext ansehen</summary>
    <p>{topic.title}</p><p>{topic.caseStudy.text}</p>
    <ul>{topic.objectives.filter(goal => target.objectiveIds.includes(goal.id)).map(goal => <li key={goal.id}>{goal.text}</li>)}</ul>
    {blocks.map(block => <details key={block.id}><summary>{block.title}</summary>
      {block.paragraphs.map((text, i) => <p key={i}>{text}</p>)}
      <p>{block.example.title}: {block.example.text}</p>
      <p>{block.misconception.claim} {block.misconception.correction}</p><p>{block.takeaway}</p>
    </details>)}
    {kind === 'reflection' && <details><summary>Gesprächsfrage und feste Kernpunkte</summary>
      <p>{target.prompt}</p><ul>{target.keyPoints.map(text => <li key={text}>{text}</li>)}</ul>
      <ul>{target.acceptableAlternatives.map(text => <li key={text}>{text}</li>)}</ul>
    </details>}
    <p className="small">Dazu kommen ausschließlich deine hier ausdrücklich gesendeten Eingaben und die jeweiligen Gesprächsfragen. Frühere KI-Bewertungen werden nicht erneut mitgesendet. Gespeicherte Notizen, Quizantworten und Mini-Test-Aufgaben gehören nicht dazu.</p>
  </details>;
}

function TutorSession({ topic, kind, target, settings, useMaterial, onClose }) {
  const cloud = settings.provider === 'chatgpt';
  const privacy = useMaterial ? 'local-private' : 'public';
  const [consent, setConsent] = useState(false);
  const [session, setSession] = useState(null);
  const [draft, setDraft] = useState('');
  const [turns, setTurns] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const active = useRef(null);
  const generation = useRef(0);
  const sessionRef = useRef(null);
  const pending = useRef(false);
  const attempt = useRef(null);
  const input = useRef(null);

  useEffect(() => () => {
    generation.current++; active.current?.abort(); endSession(sessionRef.current?.sessionId);
  }, []);

  function discard(message = '', keepDraft = false) {
    generation.current++; active.current?.abort(); endSession(sessionRef.current?.sessionId);
    sessionRef.current = null; pending.current = false; attempt.current = null;
    setSession(null); setTurns([]); setBusy(false); setError(message);
    if (!keepDraft) setDraft('');
  }
  async function start() {
    if (pending.current || sessionRef.current || cloud && !consent) return;
    pending.current = true; setBusy(true); setError('');
    const current = ++generation.current; const controller = new AbortController(); active.current = controller;
    try {
      const value = await ai.journeyStart({ topicId: topic.id, version: topic.version, kind, targetId: target.id, provider: settings.provider, model: settings.model, useMaterial }, controller.signal);
      if (controller.signal.aborted || current !== generation.current) { endSession(value.sessionId); return; }
      if (typeof value.sessionId !== 'string' || value.privacy !== privacy || typeof value.opening !== 'string' || value.opening.length > 4000 || value.maxTurns !== 4 || !Array.isArray(value.objectiveIds) || value.objectiveIds.some(id => !target.objectiveIds.includes(id))) {
        endSession(value.sessionId);
        throw Error('Die Gesprächsantwort passt nicht zum gewählten Lernschritt. Bitte neu beginnen.');
      }
      sessionRef.current = value; setSession(value);
    } catch (reason) { if (!controller.signal.aborted && current === generation.current) setError(reason.message); }
    finally { if (current === generation.current) { pending.current = false; setBusy(false); } }
  }
  async function send() {
    if (pending.current || !sessionRef.current || !draft.trim() || turns.length >= 4) return;
    pending.current = true; setBusy(true); setError('');
    const current = ++generation.current; const controller = new AbortController(); active.current = controller;
    const answer = draft.trim(); const id = sessionRef.current.sessionId;
    if (!attempt.current || attempt.current.answer !== answer) attempt.current = { requestId: crypto.randomUUID(), answer };
    const requestId = attempt.current.requestId;
    try {
      const value = await ai.journeyTurn({ sessionId: id, requestId, answer }, controller.signal);
      if (controller.signal.aborted || current !== generation.current || id !== sessionRef.current?.sessionId) return;
      if (value.sessionId !== id || value.requestId !== requestId || value.privacy !== privacy || typeof value.text !== 'string' || value.text.length > 4000 || typeof value.followUp !== 'string' || value.followUp.length > 500 || value.turn !== turns.length + 1 || value.remainingTurns !== 4 - value.turn || !Array.isArray(value.objectiveIds) || value.objectiveIds.some(goal => !target.objectiveIds.includes(goal))) throw Error('Die Rückmeldung passt nicht zu diesem Gespräch. Verwirf es und beginne bei Bedarf neu.');
      setTurns(previous => [...previous, { answer, result: value }]); setDraft(''); attempt.current = null;
    } catch (reason) { if (!controller.signal.aborted && current === generation.current) setError(`${reason.message} Deine Eingabe bleibt hier erhalten. Du kannst erneut senden oder ohne KI weiterlernen.`); }
    finally { if (current === generation.current) { pending.current = false; setBusy(false); } }
  }
  useEffect(() => { if (session && !busy && turns.length < 4) input.current?.focus({ preventScroll: true }); }, [session, busy, turns.length]);

  return <>
    <p>{cloud ? <><strong>Eigenes ChatGPT-Konto · Internet nötig.</strong> Öffentlicher Lernkontext und deine ausdrücklich gesendeten Eingaben gehen an ChatGPT. Keine privaten Unterlagen oder daraus entstandenen Texte einfügen.</> : useMaterial ? 'Qwen erklärt auf diesem Rechner mit freiwillig hinzugezogenen lokalen Unterlagen. Antworten und Rückfragen bleiben in diesem lokalen Gespräch.' : 'Qwen arbeitet auf diesem Rechner mit den öffentlichen Lerninhalten dieses Abschnitts.'}</p>
    <p className="small">Modell: {settings.model}. Höchstens vier Antworten pro Gespräch, nach 20 Minuten endet die Sitzung. Beim Schließen, Neuladen oder Wechseln von Lernschritt, Anbieter oder Quelle werden Gespräch und Eingabe verworfen. Sie erscheinen nicht in deiner Reisesicherung.</p>
    <ContextPreview topic={topic} kind={kind} target={target} />
    {cloud && !session && <label className="journey-tutor-check"><input type="checkbox" checked={consent} disabled={busy} onChange={event => setConsent(event.target.checked)} /> Öffentlichen Lernkontext und meine Eingaben an ChatGPT senden</label>}
    {!session ? <button className="btn btn-primary" disabled={busy || !settings.model || cloud && !consent} onClick={start}>KI-Gespräch beginnen</button> : <>
      <p className="journey-example"><strong>Gesprächseinstieg:</strong> {session.opening}</p>
      <div aria-label="Gesprächsverlauf">{turns.map((turn, index) => <div key={turn.result.requestId} className="journey-tutor-turn">
        <h4>Dein Beitrag {index + 1}</h4><p className="journey-tutor-text">{turn.answer}</p>
        <div aria-label="KI-Rückmeldung"><h4>Rückmeldung zur Erklärung</h4><p className="journey-tutor-text">{turn.result.text}</p>
          {turn.result.followUp && <p className="journey-tutor-text"><strong>Zum Weiterdenken:</strong> {turn.result.followUp}</p>}
        </div>
      </div>)}</div>
      {turns.length < 4 ? <>
        <label>Deine Antwort oder Rückfrage<textarea className="input" ref={input} rows={4} maxLength={2000} value={draft} disabled={busy} onChange={event => setDraft(event.target.value)} /></label>
        <p className="small">Noch {4 - turns.length} Beiträge möglich. Diese Eingabe gehört nur zum flüchtigen Gespräch; sie wird nicht in deine gespeicherte Selbstreflexion übernommen.</p>
        <button className="btn btn-primary" onClick={send} disabled={busy || !draft.trim()}>Antwort senden</button>
      </> : <p role="status">Die vier Gesprächsbeiträge sind abgeschlossen. Vergleiche die Hinweise jetzt mit den festen Kernpunkten bzw. dem Theorieblock.</p>}
      <button className="btn btn-ghost" onClick={() => discard()}>Gespräch verwerfen</button>
    </>}
    {busy && <><p role="status">{session ? 'Die Lernbegleitung antwortet …' : 'Gespräch wird vorbereitet …'}</p><button className="btn btn-ghost" onClick={() => discard('Anfrage abgebrochen. Deine Eingabe bleibt bis zum Schließen erhalten.', true)}>Anfrage abbrechen</button></>}
    {error && <p role="alert">{error}</p>}
    {!settings.model && <p>Bitte in den <Link to="/einstellungen#ki-anbieter">Einstellungen</Link> ein verfügbares Modell wählen.</p>}
    <p className="small">Unverbindliche Lernhilfe, keine Benotung. Die KI verändert weder Fortschritt noch Testergebnis. {useMaterial && 'Übernimm Inhalte dieses privaten Gesprächs nicht in allgemeine Notizen oder Sicherungen.'}</p>
    <button className="btn btn-ghost" onClick={onClose}>Ohne KI weiter</button>
  </>;
}

export default function JourneyTutor({ topic, kind, targetId }) {
  const settings = aiStore.useStore();
  const [open, setOpen] = useState(false);
  const [privateSource, setPrivateSource] = useState(false);
  const [materialEpoch, setMaterialEpoch] = useState(0);
  const details = useRef(null);
  const useMaterial = settings.provider === 'qwen' && privateSource;
  const target = kind === 'theory' ? topic.blocks.find(block => block.id === targetId) : topic.interview.find(item => item.id === targetId);
  const key = `${topic.id}:${topic.version}:${kind}:${targetId}:${settings.provider}:${settings.model}:${settings.accountRevision}:${useMaterial}:${materialEpoch}`;
  useEffect(() => { setPrivateSource(false); }, [settings.provider, settings.accountRevision]);
  useEffect(() => {
    if (!open || !useMaterial || !isLocalAi()) return undefined;
    let alive = true; let controller; let last = null;
    const refresh = async () => {
      controller?.abort(); controller = new AbortController(); const current = controller;
      try {
        const value = await ai.materialStatus(current.signal);
        if (!alive || current.signal.aborted) return;
        const next = `${value.state}:${value.revision}`;
        if (last !== null && next !== last) setMaterialEpoch(epoch => epoch + 1);
        last = next;
      } catch { if (alive && !current.signal.aborted && last !== 'unavailable') { last = 'unavailable'; setMaterialEpoch(epoch => epoch + 1); } }
    };
    const changed = () => { setMaterialEpoch(epoch => epoch + 1); refresh(); };
    refresh(); const timer = setInterval(refresh, 5000);
    window.addEventListener('azubiprep-material-changed', changed);
    return () => { alive = false; controller?.abort(); clearInterval(timer); window.removeEventListener('azubiprep-material-changed', changed); };
  }, [open, useMaterial]);
  if (!target) return null;
  return <details className="journey-detail journey-tutor" ref={details} onToggle={event => { if (event.target === details.current) setOpen(event.currentTarget.open); }}>
    <summary>{kind === 'reflection' ? 'Optional: KI-Fachgespräch' : 'Optional: Erklärung mit KI'}</summary>
    {open && <section aria-label="KI-Lernbegleitung im Abschnitt">
      {!settings.enabled || !isLocalAi() ? <p>Für freiwillige Lernbegleitung kannst du in den <Link to="/einstellungen#ki-anbieter">Einstellungen</Link> einen KI-Anbieter auswählen. Die feste Theorie und Selbstreflexion funktionieren weiterhin ohne KI. KI-Zugriff ist nur in der lokal geöffneten App verfügbar.</p> : <>
        <label>Lernquelle für die KI<select className="select" value={useMaterial ? 'private' : 'public'} onChange={event => setPrivateSource(event.target.value === 'private')}>
          <option value="public">Öffentliche Inhalte dieses Abschnitts</option>
          {settings.provider === 'qwen' && <option value="private">Zusätzlich eigene lokale Unterlagen</option>}
        </select></label>
        <TutorSession key={key} topic={topic} kind={kind} target={target} settings={settings} useMaterial={useMaterial} onClose={() => { setOpen(false); if (details.current) { details.current.open = false; details.current.querySelector('summary')?.focus(); } }} />
      </>}
    </section>}
  </details>;
}
