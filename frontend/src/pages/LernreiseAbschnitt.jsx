import JourneyLab from '../components/JourneyLab.jsx';
import { LAB_TOPICS, createLab, labPassed } from '../utils/journeyLabs.js';
import JourneyPractice from '../components/JourneyPractice.jsx';
import { PRACTICE_TOPICS, createPractice, practicePassed } from '../utils/journeyPractices.js';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { journeyApi } from '../api/journey.js';
import JourneyTutor from '../components/JourneyTutor.jsx';
import JourneyCalculation from '../components/JourneyCalculation.jsx';
import { createCalculation } from '../utils/journeyCalculation.js';
import JourneyWorkplace from '../components/JourneyWorkplace.jsx';
import JourneyNetwork from '../components/JourneyNetwork.jsx';
import { NETWORK_TOPIC, createNetwork, networkPassed } from '../utils/journeyNetwork.js';
import { WORKPLACE_TOPIC, createWorkplace, checkWorkplace } from '../utils/journeyWorkplace.js';
import { journeyStorageKey, createJourneyState, createJourneyStore, reduceJourney, exportJourney, parseJourneyBackup } from '../store/journeyStore.js';
import '../styles/journey.css';

const phases = { theory: 'Theorie', quiz: 'Quiz', reflection: 'Selbstreflexion', cards: 'Karteikarten', 'exam-intro': 'Mini-Test', exam: 'Mini-Test', result: 'Auswertung' };

function download(text, name) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function TheoryBlock({ block }) {
  return (
    <>
      {block.paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
      <div className="journey-example"><h3>{block.example.title}</h3><p className="journey-code">{block.example.text}</p></div>
      <details className="journey-detail"><summary>Ein häufiges Missverständnis</summary>
        <p>{block.misconception.claim}</p><p><strong>So ist es richtig:</strong> {block.misconception.correction}</p>
      </details>
      <p className="alert alert-info"><strong>Merke:</strong> {block.takeaway}</p>
    </>
  );
}

function Question({ question, order, answer, disabled, onSelect }) {
  return (
    <fieldset className="journey-question" disabled={disabled}>
      <legend>{question.frage}</legend>
      {order.map((original, i) => (
        <label className={`journey-option ${answer === original ? 'selected' : ''}`} key={original}>
          <input type="radio" name={question.id} value={original} checked={answer === original} onChange={() => onSelect(original)} />
          <span><strong>{String.fromCharCode(65 + i)}.</strong> {question[`option_${original}`]}</span>
        </label>
      ))}
    </fieldset>
  );
}

function Feedback({ item, topic, onReview }) {
  const question = [...topic.quiz.questions, ...topic.exam.questions].find(q => q.id === item.questionId);
  return (
    <div className={`alert ${item.correct ? 'alert-success' : 'alert-warning'}`}>
      <p><strong>{item.correct ? 'Richtig.' : 'Das passt noch nicht.'}</strong> {item.explanation}</p>
      {!item.correct && <p>Passende Antwort: {question?.[`option_${item.expected}`]}</p>}
      <div className="journey-actions">{item.blockIds.map(id => (
        <button type="button" className="btn btn-ghost btn-sm" key={id} onClick={() => onReview(id)}>
          Theorie: {topic.blocks.find(block => block.id === id)?.title}
        </button>
      ))}</div>
    </div>
  );
}

function JourneySession({ topic }) {
  const store = useMemo(() => createJourneyStore(), []);
  const [state, setState] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState(null);
  const [actionError, setActionError] = useState('');
  const [saving, setSaving] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [exclusive, setExclusive] = useState(false);
  const [reviewBlock, setReviewBlock] = useState(null);
  const [backup, setBackup] = useState(null);
  const externalProject = ['LF10a', 'LF11a', 'LF12a'].includes(topic.fieldId);
  const projectReflection = externalProject && topic.interview.find(item => item.practice);
  const [practiceConfirmed, setPracticeConfirmed] = useState(false);
  const stateRef = useRef(null);
  const revision = useRef(0);
  const raw = useRef(null);
  const queue = useRef(Promise.resolve());
  const pending = useRef(0);
  const blocked = useRef(false);
  const request = useRef(false);
  const exclusiveRef = useRef(false);
  const mounted = useRef(true);
  const heading = useRef(null);
  const toolsPanel = useRef(null);

  function lockEditing(value) { exclusiveRef.current = value; setExclusive(value); }

  async function readSaved() {
    const saved = await store.load(topic);
    if (!mounted.current) return;
    raw.current = saved.raw;
    revision.current = saved.state?.revision ?? 0;
    stateRef.current = saved.state;
    blocked.current = Boolean(saved.error);
    setState(saved.state); setStorageError(saved.error); setLoaded(true);
    setActionError(''); setBackup(null); setPracticeConfirmed(false);
  }
  useEffect(() => {
    mounted.current = true;
    let active = true;
    (async () => {
      try {
        const saved = await store.load(topic);
        if (!active) return;
        raw.current = saved.raw; revision.current = saved.state?.revision ?? 0;
        stateRef.current = saved.state; blocked.current = Boolean(saved.error);
        setState(saved.state); setStorageError(saved.error); setLoaded(true);
      } catch (error) { if (active) { blocked.current = true; setStorageError(error); setLoaded(true); } }
    })();
    const onStorage = event => {
      if (event.key !== null && event.key !== journeyStorageKey(topic.id)) return;
      blocked.current = true;
      setStorageError({ code: 'CONFLICT', message: 'Ein anderer Tab hat den Lernstand verändert. Lade den gespeicherten Stand, bevor du fortfährst. Deinen aktuellen Stand kannst du vorher sichern.' });
    };
    window.addEventListener('storage', onStorage);
    const beforeUnload = event => {
      if (pending.current || blocked.current && stateRef.current) { event.preventDefault(); event.returnValue = ''; }
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => { active = false; mounted.current = false; window.removeEventListener('storage', onStorage); window.removeEventListener('beforeunload', beforeUnload); };
  }, [store, topic]);

  useEffect(() => { if (loaded) heading.current?.focus(); }, [loaded, state?.phase, state?.index, reviewBlock]);
  useEffect(() => { setPracticeConfirmed(false); }, [state?.phase, state?.index]);

  function persist(next, draft = false) {
    // Inputs remain responsive; progress and results appear only after a confirmed save.
    stateRef.current = next;
    if (draft) setState(next);
    else lockEditing(true);
    setSaving(true); pending.current++;
    queue.current = queue.current.then(async () => {
      try {
        if (blocked.current) return;
        const saved = await store.save(next, revision.current, topic);
        revision.current = saved.revision; raw.current = JSON.stringify(saved);
        if (stateRef.current) stateRef.current = { ...stateRef.current, revision: saved.revision, updatedAt: saved.updatedAt };
        if (mounted.current) setState(stateRef.current);
      } catch (error) {
        blocked.current = true;
        if (mounted.current) setStorageError(error);
      } finally {
        pending.current--;
        if (mounted.current && !pending.current) { setSaving(false); lockEditing(false); }
      }
    });
  }
  function act(action) {
    const draft = (action.type === 'lab-action' && ['answer', 'code', 'request-edit', 'configure'].includes(action.action?.type)) || (action.type === 'practice-action' && ['answer', 'code'].includes(action.action?.type)) || ['reflection-draft', 'select-answer', 'calculation-cell'].includes(action.type) || (action.type === 'network-action' && action.action?.type === 'configure');
    if (blocked.current || exclusiveRef.current || !draft && pending.current) return;
    try { setActionError(''); persist(reduceJourney(stateRef.current, action, topic), draft); }
    catch (error) { setActionError(error.message); }
  }
  async function acceptLabResult(action) {
    // Die asynchrone Codeprüfung darf nicht an einer gleichzeitig gesicherten Notiz scheitern.
    while (pending.current) {
      await queue.current;
      if (!mounted.current || blocked.current) return;
    }
    const current = stateRef.current;
    if (!mounted.current || blocked.current || exclusiveRef.current || current?.phase !== 'reflection'
      || current.index !== 1 || current.lab?.source !== action.source) return;
    act({ type: 'lab-action', action });
  }
  function start() {
    if (stateRef.current || pending.current || blocked.current || exclusiveRef.current) return;
    persist(createJourneyState(topic));
  }
  async function check() {
    if (request.current || pending.current || blocked.current) return;
    request.current = true; setRequesting(true); setActionError('');
    const current = stateRef.current;
    const questionId = topic.quiz.questionIds[current.index];
    const answer = current.quiz.answers[questionId];
    try {
      const feedback = await journeyApi.check(topic.id, { version: topic.version, questionId, answer });
      if (mounted.current && stateRef.current.phase === 'quiz' && topic.quiz.questionIds[stateRef.current.index] === questionId && stateRef.current.quiz.answers[questionId] === answer) act({ type: 'quiz-feedback', feedback });
    } catch (error) { if (mounted.current) setActionError(`${error.message} Deine Auswahl bleibt erhalten. Du kannst die Prüfung erneut anfordern.`); }
    finally { request.current = false; if (mounted.current) setRequesting(false); }
  }
  async function evaluate() {
    if (request.current || pending.current || blocked.current) return;
    request.current = true; setRequesting(true); setActionError('');
    const current = stateRef.current;
    const attemptId = current.exam.attemptId;
    const answers = topic.exam.questionIds.map(questionId => ({ questionId, answer: current.exam.answers[questionId] }));
    try {
      const result = await journeyApi.evaluate(topic.id, { version: topic.version, attemptId, answers });
      if (mounted.current && stateRef.current.phase === 'exam' && stateRef.current.exam.attemptId === attemptId && answers.every(item => stateRef.current.exam.answers[item.questionId] === item.answer)) act({ type: 'exam-result', result, completedAt: new Date().toISOString() });
    } catch (error) { if (mounted.current) setActionError(`${error.message} Deine Antworten bleiben erhalten. Erneut abgeben verwendet denselben Versuch.`); }
    finally { request.current = false; if (mounted.current) setRequesting(false); }
  }
  function exportCurrent() {
    try { download(exportJourney(stateRef.current, topic), topic.id === 'common-lf1-role' ? 'AzubiPrep-Lernreise-FIAE.json' : `AzubiPrep-Lernreise-${topic.id}.json`); }
    catch (error) { setActionError(error.message); }
  }
  async function importFile(event) {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file || exclusiveRef.current) return;
    try {
      if (file.size > 128 * 1024) throw new Error('Die Sicherung ist größer als 128 KiB.');
      setBackup(parseJourneyBackup(await file.text(), topic)); setActionError('');
    } catch (error) { setBackup(null); setActionError(error.message); }
  }
  async function replaceBackup() {
    if (!backup || pending.current || request.current || exclusiveRef.current) return;
    lockEditing(true); setSaving(true);
    try {
      const saved = await store.replace(backup, raw.current, topic);
      if (!mounted.current) return;
      stateRef.current = saved; revision.current = saved.revision; raw.current = JSON.stringify(saved);
      blocked.current = false; setStorageError(null); setState(saved); setBackup(null); setReviewBlock(null); setActionError(''); setPracticeConfirmed(false);
    } catch (error) { if (mounted.current) { setStorageError(error); blocked.current = true; } }
    finally { if (mounted.current) { setSaving(false); lockEditing(false); } }
  }
  async function reloadSaved() {
    if (pending.current || request.current || exclusiveRef.current) return;
    lockEditing(true); setSaving(true);
    try { await readSaved(); } catch (error) { if (mounted.current) setStorageError(error); }
    finally { if (mounted.current) { setSaving(false); lockEditing(false); } }
  }
  function prepareFreshState() {
    if (pending.current || request.current || exclusiveRef.current) return;
    setBackup(createJourneyState(topic));
    if (toolsPanel.current) toolsPanel.current.open = true;
  }

  const disabled = saving || requesting || Boolean(storageError);
  const currentBlock = topic.blocks.find(block => block.id === reviewBlock);
  const phase = state?.phase;
  const index = state?.index ?? 0;
  const question = phase === 'quiz' ? topic.quiz.questions[index] : phase === 'exam' ? topic.exam.questions[index] : null;
  const reflection = topic.interview[index];
  const card = topic.cards[index];
  const feedback = phase === 'quiz' && question ? state.quiz.feedback[question.id] : null;
  const result = state?.exam.result;
  const progress = state ? state.completedBlocks.length + Object.keys(state.quiz.feedback).length + state.reflection.done.length + Object.keys(state.cards.ratings).length + (state.bestResult?.passed ? 1 : 0) : 0;
  const totalSteps = topic.blocks.length + topic.quiz.questionIds.length + topic.interview.length + topic.cards.length + 1;

  return (
    <div className="journey-page">
      <header className="main-header">
        <div><Link to="/lernreise?fr=FIAE#reise-fortsetzen" onClick={event => { if (saving || requesting) event.preventDefault(); }}>← Lernreise</Link>
          <p className="journey-kicker">FIAE · {topic.fieldId} · {externalProject ? 'Spezialisierung' : 'Allgemeine Grundlagen'}</p>
          <h1>{topic.title}</h1>
        </div>
      </header>
      <div className="journey-status" role="status" aria-live="polite">
        {!loaded ? 'Lernstand wird geladen …' : storageError ? 'Nicht gespeichert – bitte Hinweis beachten' : requesting ? 'Antwort wird geprüft …' : saving ? 'Wird gespeichert …' : state ? 'Gespeichert' : 'Bereit zum Beginnen'}
      </div>
      {storageError && <div className="alert alert-warning" role="alert"><p>{storageError.message}</p>
        <div className="journey-actions">
          {stateRef.current && storageError.code !== 'CONFLICT' && <button className="btn btn-primary" disabled={saving} onClick={() => { blocked.current = false; setStorageError(null); persist(stateRef.current); }}>Speichern erneut versuchen</button>}
          <button className="btn btn-ghost" disabled={saving || requesting} onClick={reloadSaved}>Gespeicherten Stand laden</button>
          {raw.current !== null && <button className="btn btn-ghost" onClick={() => download(raw.current, 'AzubiPrep-Lernreise-Originalstand.json')}>Originalstand sichern</button>}
          {stateRef.current && <button className="btn btn-ghost" onClick={exportCurrent}>Aktuellen Stand sichern</button>}
          {!state && raw.current !== null && <button className="btn btn-ghost" disabled={saving || requesting} onClick={prepareFreshState}>Neuen Stand vorbereiten</button>}
        </div>
        <p className="small">Ein erneutes Laden verwirft ungesicherte Änderungen in dieser Ansicht. Sichere sie bei Bedarf zuerst. Ein ungültiger oder neuerer Originalstand wird nicht automatisch ersetzt.</p>
      </div>}
      {actionError && <p className="alert alert-warning" role="alert">{actionError}</p>}

      {loaded && !state && !storageError && <section className="card journey-work">
        <h2 ref={heading} tabIndex={-1}>{topic.prerequisites.length ? `Dein nächster Schritt in ${topic.fieldId}` : `Dein Einstieg in ${topic.fieldId}`}</h2>
        <p>Theorie, Quiz, Selbstreflexion, Karteikarten und Mini-Test. Dein Stand wird in diesem Profil gespeichert.</p>
        <button className="btn btn-primary" onClick={start} disabled={saving}>Abschnitt beginnen</button>
        <details className="journey-detail"><summary>Fallbeispiel und Lernziele</summary>
          <p>{topic.caseStudy.text}</p><h3>Danach kannst du …</h3>
          <ul>{topic.objectives.map(goal => <li key={goal.id}>{goal.text}</li>)}</ul>
        </details>
      </section>}

      {state && <>
        <div className="journey-progress"><span>{phases[phase]} · {progress} von {totalSteps} Lernschritten bearbeitet</span>
          <progress aria-label="Fortschritt dieses Themenabschnitts" value={progress} max={totalSteps} />
        </div>
        {currentBlock ? <section className="card journey-work" aria-label="Theorie nachlesen">
          <p className="small">Dein aktueller Lernschritt bleibt erhalten.</p>
          <h2 ref={heading} tabIndex={-1}>{currentBlock.title}</h2><TheoryBlock block={currentBlock} />
          {phase !== 'exam' && <JourneyTutor key={currentBlock.id} topic={topic} kind="theory" targetId={currentBlock.id} />}
          <button className="btn btn-primary" onClick={() => setReviewBlock(null)}>Zurück zum Lernschritt</button>
        </section> : <section className="card journey-work" aria-label="Aktueller Lernschritt">
          {phase === 'theory' && <>
            <p className="small text-muted">Theorieblock {index + 1} von {topic.blocks.length}</p>
            <h2 ref={heading} tabIndex={-1}>{topic.blocks[index].title}</h2>
            {index === 0 && <details className="journey-detail"><summary>Unser gemeinsames Beispiel</summary><p>{topic.caseStudy.text}</p></details>}
            <TheoryBlock block={topic.blocks[index]} />
            <JourneyTutor key={topic.blocks[index].id} topic={topic} kind="theory" targetId={topic.blocks[index].id} />
            <div className="journey-actions">{index > 0 && <button className="btn btn-ghost" disabled={disabled} onClick={() => act({ type: 'previous' })}>Vorheriger Block</button>}
              <button className="btn btn-primary" disabled={disabled} onClick={() => act({ type: 'read-block' })}>{index === topic.blocks.length - 1 ? 'Gelesen – zum Quiz' : 'Gelesen – weiter'}</button>
            </div>
          </>}
          {(phase === 'quiz' || phase === 'exam') && <>
            <h2 ref={heading} tabIndex={-1}>{phase === 'quiz' ? 'Quiz' : 'Mini-Test'}: Frage {index + 1} von {phase === 'quiz' ? topic.quiz.questions.length : topic.exam.questions.length}</h2>
            <Question question={question} order={state.optionOrder[question.id]} answer={phase === 'quiz' ? state.quiz.answers[question.id] : state.exam.answers[question.id]}
              disabled={disabled || Boolean(feedback)} onSelect={answer => act({ type: 'select-answer', questionId: question.id, answer })} />
            {feedback && <Feedback item={feedback} topic={topic} onReview={setReviewBlock} />}
            <div className="journey-actions">
              {index > 0 && <button className="btn btn-ghost" disabled={disabled} onClick={() => act({ type: 'previous' })}>Vorherige Frage</button>}
              {phase === 'quiz' ? feedback ? <button className="btn btn-primary" disabled={disabled} onClick={() => act({ type: 'next-quiz' })}>{index === 5 ? 'Weiter zur Selbstreflexion' : 'Nächste Frage'}</button>
                : <button className="btn btn-primary" disabled={disabled || !state.quiz.answers[question.id]} onClick={check}>{requesting ? 'Wird geprüft …' : 'Antwort prüfen'}</button>
                : index < topic.exam.questions.length - 1 ? <button className="btn btn-primary" disabled={disabled || !state.exam.answers[question.id]} onClick={() => act({ type: 'next-exam' })}>Nächste Testfrage</button>
                  : <button className="btn btn-primary" disabled={disabled || topic.exam.questionIds.some(id => !state.exam.answers[id])} onClick={evaluate}>{requesting ? 'Wird ausgewertet …' : 'Mini-Test abgeben'}</button>}
            </div>
          </>}
          {phase === 'reflection' && <>
            <h2 ref={heading} tabIndex={-1}>Selbstreflexion {index + 1} von {topic.interview.length}</h2>
            <p>{reflection.practice ? externalProject ? 'Bearbeite den Praxisauftrag mit einem Werkzeug deiner Wahl. Halte deine Beobachtungen fest und vergleiche sie mit der Checkliste.' : [...PRACTICE_TOPICS, ...LAB_TOPICS].includes(topic.id) ? 'Bearbeite die praktische Übung Schritt für Schritt. Prüfe die Ergebnisse, vergleiche das gespeicherte Protokoll und bestätige deine Durchführung.' : topic.id === NETWORK_TOPIC ? 'Untersuche die drei Störungen im Modell, korrigiere sie und prüfe erneut. Vergleiche danach das gespeicherte Protokoll und bestätige deine Durchführung.' : topic.id === WORKPLACE_TOPIC ? 'Richte den Modellarbeitsplatz ein, prüfe seine Funktionen und vergleiche das Übergabeprotokoll mit dem Auftrag. Danach bestätigst du deine Durchführung.' : 'Erstelle deine Darstellung, trage sie vor und prüfe sie mit den folgenden Kriterien. Danach bestätigst du deine Durchführung.' : 'Erkläre es in eigenen Worten – schriftlich, gedanklich oder im freiwilligen KI-Gespräch. Vergleiche danach mit den festen Kernpunkten.'} Die KI vergibt keine Note und schließt keinen Lernschritt ab.</p>
            <p><strong>{reflection.prompt}</strong></p>
            {reflection.practice && <section className="journey-example" aria-label={externalProject ? 'Praktischer Projektauftrag' : [...PRACTICE_TOPICS, ...LAB_TOPICS].includes(topic.id) ? 'Praktischer Arbeitsauftrag' : topic.id === NETWORK_TOPIC ? 'Praktisches Netzwerklabor' : topic.id === WORKPLACE_TOPIC ? 'Praktische Einrichtungsaufgabe' : 'Praktische Präsentationsaufgabe'}>
              <h3>{externalProject ? 'Dein Projektauftrag' : [...PRACTICE_TOPICS, ...LAB_TOPICS].includes(topic.id) ? 'Jetzt Schritt für Schritt bearbeiten und prüfen' : topic.id === NETWORK_TOPIC ? 'Jetzt selbst untersuchen und korrigieren' : topic.id === WORKPLACE_TOPIC ? 'Jetzt selbst einrichten und prüfen' : 'Jetzt selbst erstellen und präsentieren'}</h3>
              <p className="journey-code">{reflection.practice.task}</p>
              <ul>{reflection.practice.checklist.map(item => <li key={item}>{item}</li>)}</ul>
              {!externalProject && ![WORKPLACE_TOPIC, NETWORK_TOPIC, ...PRACTICE_TOPICS, ...LAB_TOPICS].includes(topic.id) && <p className="small">Du kannst außerhalb der App arbeiten und allein vortragen. Deine Dateien bleiben bei dir; ein Upload ist nicht nötig. Die KI oder der Mini-Test können deine tatsächliche Präsentation nicht nachweisen.</p>}
            </section>}
            {reflection.practice && LAB_TOPICS.includes(topic.id) && <JourneyLab topicId={topic.id} value={state.lab || createLab(topic.id)} disabled={exclusive || requesting || Boolean(storageError) || state.reflection.done.includes(reflection.id)} busy={saving} completed={state.reflection.done.includes(reflection.id)} onAction={action => { setPracticeConfirmed(false); if (action.type === 'code-result') acceptLabResult(action); else act({ type: 'lab-action', action }); }} />}
            {reflection.practice && PRACTICE_TOPICS.includes(topic.id) && <JourneyPractice topicId={topic.id} value={state.practice || createPractice(topic.id)} disabled={exclusive || requesting || Boolean(storageError) || state.reflection.done.includes(reflection.id)} busy={saving} completed={state.reflection.done.includes(reflection.id)} onAction={action => { setPracticeConfirmed(false); act({ type: 'practice-action', action }); }} />}
            {reflection.practice && topic.id === WORKPLACE_TOPIC && <JourneyWorkplace value={state.workplace || createWorkplace()} disabled={disabled} completed={state.reflection.done.includes(reflection.id)} onAction={action => { setPracticeConfirmed(false); act({ type: 'workplace-action', action }); }} />}
            {reflection.practice && topic.id === NETWORK_TOPIC && <JourneyNetwork value={state.network || createNetwork()} disabled={exclusive || requesting || Boolean(storageError) || state.reflection.done.includes(reflection.id)} busy={saving} completed={state.reflection.done.includes(reflection.id)} onAction={action => { setPracticeConfirmed(false); act({ type: 'network-action', action }); }} />}
            <label htmlFor="journey-reflection">Deine Antwort (optional, nur lokal)</label>
            <textarea id="journey-reflection" rows={5} maxLength={2000} value={state.reflection.drafts[reflection.id] || ''} disabled={exclusive || Boolean(storageError)} onChange={event => act({ type: 'reflection-draft', text: event.target.value })} />
            <JourneyTutor key={reflection.id} topic={topic} kind="reflection" targetId={reflection.id} />
            {!state.reflection.revealed.includes(reflection.id) ? <button className="btn btn-primary" disabled={disabled} onClick={() => act({ type: 'reflection-reveal' })}>Kernpunkte ansehen</button> : <>
              <h3>Vergleiche deine Erklärung</h3><ul>{reflection.keyPoints.map(point => <li key={point}>{point}</li>)}</ul>
              <p>{reflection.sampleAnswer}</p>
              <details className="journey-detail"><summary>Andere Formulierungen und typische Missverständnisse</summary>
                <ul>{reflection.acceptableAlternatives.map(item => <li key={item}>{item}</li>)}</ul>
                <h4>Darauf achten</h4><ul>{reflection.misconceptions.map(item => <li key={item}>{item}</li>)}</ul>
              </details><p><strong>Zum Weiterdenken:</strong> {reflection.followUp}</p>
              <p className="small text-muted">Dein eigener Vergleich zählt als Reflexion, nicht als benotete mündliche Prüfung.</p>
              {reflection.practice && <label className="journey-practice-check">
                <input type="checkbox" checked={practiceConfirmed} disabled={disabled} onChange={event => setPracticeConfirmed(event.target.checked)} />
                <span>{reflection.practice.confirmation}</span>
              </label>}
              <button className="btn btn-primary" disabled={disabled || Boolean(reflection.practice && (!practiceConfirmed || (LAB_TOPICS.includes(topic.id) && !labPassed(topic.id, state.lab)) || (PRACTICE_TOPICS.includes(topic.id) && !practicePassed(topic.id, state.practice)) || (topic.id === WORKPLACE_TOPIC && !(state.workplace?.checked && checkWorkplace(state.workplace).passed)) || (topic.id === NETWORK_TOPIC && !networkPassed(state.network))))} onClick={() => act({ type: 'reflection-done', ...(reflection.practice ? { practiceConfirmed } : {}) })}>{index === topic.interview.length - 1 ? 'Verglichen – zu den Karteikarten' : 'Verglichen – weiter'}</button>
            </>}
          </>}
          {phase === 'cards' && <>
            <h2 ref={heading} tabIndex={-1}>Karteikarte {index + 1} von {topic.cards.length}</h2>
            <p className="journey-card-front">{card.front}</p><p>Erinnere dich zuerst selbst an die Antwort.</p>
            {!state.cards.revealed.includes(card.id) ? <button className="btn btn-primary" disabled={disabled} onClick={() => act({ type: 'card-reveal' })}>Kartenantwort zeigen</button> : <>
              <p className="alert alert-info">{card.back}</p><div className="journey-actions">
                <button className="btn btn-primary" disabled={disabled} onClick={() => act({ type: 'card-rate', rating: 'known' })}>Gewusst – weiter</button>
                <button className="btn btn-ghost" disabled={disabled} onClick={() => act({ type: 'card-rate', rating: 'repeat' })}>Noch üben – weiter</button>
              </div>
            </>}
          </>}
          {phase === 'exam-intro' && <>
            <h2 ref={heading} tabIndex={-1}>Bereit für den Mini-Test?</h2>
            <p>Acht Fragen zum gerade Gelernten, ohne Zeitdruck. Jede Frage zählt gleich viel. Sieben richtige Antworten reichen zum Bestehen; die Auswertung zeigt dir auch einzelne unsichere Lernziele.</p>
            <p>Musterlösungen erscheinen nach der Abgabe. Du kannst deine Auswahl vorher ändern und einen begonnenen Test später fortsetzen.</p>
            {state.history.length > 0 && <p className="alert alert-info">Wiederholung mit denselben acht Aufgaben. Diese Runde festigt das Gelernte und ist kein unabhängiger neuer Nachweis.</p>}
            <button className="btn btn-primary" disabled={disabled} onClick={() => act({ type: 'start-exam', attemptId: crypto.randomUUID() })}>Mini-Test beginnen</button>
          </>}
          {phase === 'result' && result && <>
            <h2 ref={heading} tabIndex={-1}>Deine Auswertung</h2>
            <p className={`alert ${result.passed ? 'alert-success' : 'alert-warning'}`}><strong>{result.correct} von {result.total} richtig ({result.percent} %).</strong> {result.passed ? (topic.prerequisites.length ? 'Themenabschnitt bestanden.' : 'Erster Themenabschnitt bestanden.') : 'Noch nicht bestanden – wiederhole gezielt die unsicheren Inhalte.'}</p>
            {!result.passed && state.bestResult?.passed && <p>Ein früherer bestandener Versuch bleibt erhalten. Dieser Versuch zeigt zusätzlichen Wiederholungsbedarf.</p>}
            <div className="journey-actions">
              {topic.nextTopic && state.bestResult?.passed && !disabled &&
                <Link className="btn btn-primary" to={`/lernreise/fiae/${topic.nextTopic.id}`}>Nächstes Thema: {topic.nextTopic.title}</Link>}
              <button className={`btn ${state.bestResult?.passed ? 'btn-ghost' : 'btn-primary'}`} disabled={disabled} onClick={() => act({ type: 'repeat-exam' })}>Mini-Test wiederholen</button>
              <Link className="btn btn-ghost" to="/lernreise?fr=FIAE#reise-fortsetzen">Zur Lernreise</Link>
            </div>
            <h3>Deine Lernziele</h3><ul>{result.objectives.map(goal => <li key={goal.id}>
              <strong>{goal.correct} von {goal.total} richtig:</strong> {topic.objectives.find(item => item.id === goal.id)?.text}
              {goal.correct < goal.total && <span> – hier noch einmal nachlesen.</span>}
            </li>)}</ul>
            <details className="journey-detail"><summary>Antworten und passende Theorie ansehen</summary>
              {result.results.map(item => <div key={item.questionId}><h3>{topic.exam.questions.find(q => q.id === item.questionId)?.frage}</h3><Feedback item={item} topic={topic} onReview={setReviewBlock} /></div>)}
            </details>
            {Object.values(state.cards.ratings).includes('repeat') && <details className="journey-detail"><summary>Karten zum Wiederholen</summary>
              {topic.cards.filter(item => state.cards.ratings[item.id] === 'repeat').map(item => <div key={item.id}><h3>{item.front}</h3><p>{item.back}</p></div>)}
            </details>}
            {!topic.nextTopic && <p>{topic.id === 'fiae-lf12a-review' ? 'Deinen Gesamtstand und deine Lernziele findest du in der Lernreiseübersicht.' : 'Weitere Themenabschnitte sind noch in Vorbereitung.'}</p>}
            {topic.fieldReview ? <p>Der {topic.fieldId}-Abschluss setzt alle {topic.field.topicIds.length} bestandenen Themen und diesen Rückblick{externalProject ? ' sowie deinen bestätigten Projektauftrag' : topic.fieldId === 'LF1' ? ' sowie deine bestätigte Präsentationsaufgabe' : ['LF2', 'LF3', 'LF4', 'LF5', 'LF6', 'LF7', 'LF8', 'LF9'].includes(topic.fieldId) ? ' sowie deine geprüfte und bestätigte Modellübung' : ''} voraus. Den Gesamtstand siehst du in der Lernreiseübersicht. {topic.nextTopic && 'Danach geht es mit „' + topic.nextTopic.title + '“ weiter.'}</p>
              : <p>Dieser Abschluss gilt für dieses Thema. Zum {topic.fieldId}-Abschluss gehören alle {topic.field.topicIds.length} Themen und der Rückblick.</p>}
            <p className="small text-muted">Die Einschätzung ist eine Lernhilfe, keine IHK-Note. Dieser Pilot vergibt keine zusätzlichen XP und verändert deine bisherigen Quiz- oder Kartenstände nicht.</p>
          </>}
        </section>}
      </>}

      {projectReflection && state?.reflection.done.includes(projectReflection.id) && <details className="card journey-tools">
        <summary>Bestätigten Projektauftrag nachlesen</summary>
        <p className="journey-code">{projectReflection.practice.task}</p>
        <ul>{projectReflection.practice.checklist.map(step => <li key={step}>{step}</li>)}</ul>
        {state.reflection.drafts[projectReflection.id] && <><h3>Deine Projektnotiz</h3><p className="journey-code">{state.reflection.drafts[projectReflection.id]}</p></>}
      </details>}
      {state && createCalculation(topic.id) && (phase !== 'theory' || index === 3) && <details className="card journey-tools" open={phase === 'theory' && index === 3}>
        <summary>Kalkulation und Rechenhilfe</summary>
        <JourneyCalculation topicId={topic.id} value={state.calculation || createCalculation(topic.id)}
          disabled={exclusive || requesting || Boolean(storageError)} onChange={(cellId, text) => act({ type: 'calculation-cell', cellId, text })} />
      </details>}
      {LAB_TOPICS.includes(topic.id) && state?.reflection.done.includes(topic.interview[1].id) && !(phase === 'reflection' && index === 1) && <details className="card journey-tools"><summary>Lernlabor nachlesen</summary><JourneyLab topicId={topic.id} value={state.lab} disabled completed /></details>}
      {PRACTICE_TOPICS.includes(topic.id) && state?.reflection.done.includes(topic.interview[1].id) && !(phase === 'reflection' && index === 1) && <details className="card journey-tools"><summary>Praxisprotokoll nachlesen</summary><JourneyPractice topicId={topic.id} value={state.practice} disabled completed /></details>}
      {topic.id === NETWORK_TOPIC && state?.reflection.done.includes(topic.interview[1].id) && !(phase === 'reflection' && index === 1) && <details className="card journey-tools"><summary>Netzwerklabor nachlesen</summary><JourneyNetwork value={state.network} disabled completed /></details>}
      {topic.id === WORKPLACE_TOPIC && state?.reflection.done.includes(topic.interview[1].id) && !(phase === 'reflection' && index === 1) && <details className="card journey-tools"><summary>Einrichtungsübung nachlesen</summary><JourneyWorkplace value={state.workplace} disabled completed /></details>}
      {loaded && <details className="card journey-tools" ref={toolsPanel}><summary>Nachlesen, Sicherung und Quellen</summary>
        {state && <><h2>Theorie nachlesen</h2><div className="journey-actions">{topic.blocks.map(block => <button className="btn btn-ghost btn-sm" key={block.id} onClick={() => setReviewBlock(block.id)}>{block.title}</button>)}</div></>}
        <h2>Lokale Sicherung</h2><p>Die Sicherung enthält den Lernstand dieses Themenabschnitts, deine selbst eingegebenen Reflexionsantworten und gegebenenfalls die Kalkulationstabelle, Einrichtungsübung oder das Netzwerklabor. Sichere jeden Abschnitt einzeln. Bewahre die Dateien persönlich auf. Sie werden nicht automatisch hochgeladen.</p>
        <div className="journey-actions">{state && <button className="btn btn-ghost" disabled={requesting} onClick={exportCurrent}>Lernreise sichern</button>}
          <label className="btn btn-ghost journey-upload">Sicherung auswählen<input type="file" accept=".json,application/json" aria-label="Lernreise-Sicherung einlesen" onChange={importFile} disabled={saving || requesting} /></label>
        </div>
        {backup && <div className="alert alert-info"><h3>Sicherung vor der Übernahme prüfen</h3><p>{topic.title} · {phases[backup.phase]} · {backup.history.length} gespeicherte Testversuche.</p><p>Die Übernahme ersetzt den Stand dieses Themenabschnitts in diesem Profil. Andere Themen und Lernbereiche bleiben erhalten.</p>
          <div className="journey-actions"><button className="btn btn-primary" disabled={saving || requesting} onClick={replaceBackup}>Diesen Reisestand ersetzen</button><button className="btn btn-ghost" disabled={saving || requesting} onClick={() => setBackup(null)}>Abbrechen</button></div>
        </div>}
        <h2>Öffentliche Fachgrundlagen</h2><ul>{topic.sources.map(source => <li key={source.id}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a></li>)}</ul>
        <p className="small text-muted">Erklärungen und Beispiele sind eigenständig verfasst. Für Prüfungen muss der App-Dienst erreichbar sein. Der Lernstand ist auf 128 KiB und zehn jüngste Testzusammenfassungen begrenzt; der beste Versuch bleibt zusätzlich erhalten.</p>
      </details>}
    </div>
  );
}

export default function LernreiseAbschnitt() {
  const { topicId } = useParams();
  const [topic, setTopic] = useState(null);
  const [missing, setMissing] = useState([]);
  const [firstOpen, setFirstOpen] = useState(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    let generation = 0;
    let prerequisiteIds = [];
    setTopic(null); setMissing([]); setError('');
    const checkAccess = async () => {
      const current = ++generation;
      try {
        const value = await journeyApi.topic(topicId);
        prerequisiteIds = value.navigationPrerequisites || value.prerequisites;
        const store = createJourneyStore();
        const catalog = prerequisiteIds.length ? await journeyApi.progressCatalog() : { readyTopics: [] };
        const byId = new Map(catalog.readyTopics.map(item => [item.id, item]));
        // Include indirect prerequisites so even a deep link can lead directly to an open topic.
        const ancestors = new Set();
        function include(id) {
          if (ancestors.has(id)) return;
          ancestors.add(id);
          const item = byId.get(id);
          if (!item) throw new Error('Die Voraussetzungen konnten nicht vollständig geladen werden.');
          (item.navigationPrerequisites || item.prerequisites).forEach(include);
        }
        prerequisiteIds.forEach(include);
        prerequisiteIds = [...ancestors];
        const requirements = await Promise.all(catalog.readyTopics.filter(item => ancestors.has(item.id)).map(async item => {
          const saved = await store.load(item);
          return { ...item, passed: Boolean(saved.state?.bestResult?.passed), error: saved.error };
        }));
        if (active && current === generation) {
          const direct = new Set(value.prerequisiteTopics.map(item => item.id));
          const outstanding = requirements.filter(item => !item.passed);
          setMissing(outstanding.some(item => direct.has(item.id)) ? outstanding : []);
          setFirstOpen(outstanding[0]);
          setTopic(previous => previous?.id === value.id && previous.version === value.version ? previous : value);
          setError('');
        }
      } catch (reason) { if (active && current === generation) setError(reason.message); }
    };
    const changed = event => {
      if (event.key === null || prerequisiteIds.some(id => event.key === journeyStorageKey(id))) checkAccess();
    };
    checkAccess();
    window.addEventListener('storage', changed);
    return () => { active = false; window.removeEventListener('storage', changed); };
  }, [topicId, retry]);
  if (error) return <div className="card"><h1>Lernabschnitt nicht erreichbar</h1><p role="alert">{error}</p><button className="btn btn-primary" onClick={() => setRetry(value => value + 1)}>Erneut laden</button> <Link to="/lernreise?fr=FIAE#reise-fortsetzen">Zur Lernreise</Link></div>;
  if (topic?.id !== topicId) return <p role="status">Lernabschnitt wird geladen …</p>;
  if (missing.length) return <section className="card journey-page">
    <h1>Zuerst die Grundlage abschließen</h1>
    <p>Für „{topic.title}“ {missing.length === 1 ? 'fehlt noch ein bestandener Themencheck' : `fehlen noch ${missing.length} bestandene Themenchecks`}. Hier kannst du weiterlernen.</p>
    {(firstOpen?.error || missing.some(item => item.error)) && <p role="alert">Der gespeicherte Stand eines Vorgängerthemas muss zuerst geprüft werden.</p>}
    {firstOpen && <Link className="btn btn-primary" to={`/lernreise/fiae/${firstOpen.id}`}>{firstOpen.title} öffnen</Link>}
    <p><Link to="/lernreise?fr=FIAE#reise-fortsetzen">Zur Lernreise</Link></p>
  </section>;
  return <JourneySession key={`${topic.id}:${topic.version}`} topic={topic} />;
}
