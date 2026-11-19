import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { journeyApi } from '../api/journey.js';
import { createJourneyStore, journeyStorageKey, latestObjectiveScores } from '../store/journeyStore.js';
import '../styles/journey.css';

export const FIRST_JOURNEY_TOPIC = 'common-lf1-role';

const nextStageHints = {
  LF1: 'Die FIAE-Lernreise geht weiter mit Wirtschafts- und Sozialkunde, beginnend bei „Ausbildung im dualen System“.',
  WISO: 'Nach WISO folgt Projektmanagement mit praktischen Kalkulationen.',
  PM: 'Als Nächstes folgt LF2 mit Anforderungen, Ausstattung, Angebotsvergleich und Übergabe.',
  LF2: 'Als Nächstes folgt LF3 mit Netzwerkwegen, Adressen, Diensten und systematischer Fehlersuche.',
  LF3: 'Als Nächstes folgt LF4 mit Schutzzielen, Schutzbedarfsanalyse und passenden Maßnahmen.',
  LF4: 'Als Nächstes folgt LF5 mit einer kleinen Datenanwendung und geprüften Änderungen.',
  LF5: 'Als Nächstes folgt LF6 mit Aufnahme, Diagnose und Abschluss von Serviceanfragen.',
  LF6: 'Als Nächstes folgt LF7 mit Sensoren, Aktoren und Steuerlogik.',
  LF7: 'Als Nächstes folgt LF8 mit systemübergreifender Datenbereitstellung.',
  LF8: 'Als Nächstes folgt LF9 mit Netzwerken und Diensten.',
  LF9: 'Mit LF10a beginnt die FIAE-Spezialisierung. Du gestaltest die Oberfläche einer Reparaturanwendung.',
  LF10a: 'In LF11a entwickelst und testest du die Fachlogik der Anwendung.',
  LF11a: 'In LF12a führst du den Kundenauftrag bis zur Übergabe und Auswertung.',
};

export default function JourneyEntry() {
  const [entry, setEntry] = useState({ loading: true });
  const [expanded, setExpanded] = useState({});
  useEffect(() => {
    let active = true;
    let generation = 0;
    let storageKeys = [];
    const refresh = async () => {
      const current = ++generation;
      try {
        const catalog = await journeyApi.progressCatalog();
        storageKeys = catalog.readyTopics.map(item => journeyStorageKey(item.id));
        const store = createJourneyStore();
        const topics = await Promise.all(catalog.readyTopics.map(async topic => ({
          topic, saved: await store.load(topic),
        })));
        if (active && current === generation) setEntry({ catalog, topics });
      } catch (error) {
        if (active && current === generation) setEntry({ error: error.message });
      }
    };
    const changed = event => {
      if (event.key === null || storageKeys.includes(event.key)) refresh();
    };
    refresh();
    window.addEventListener('storage', changed);
    return () => { active = false; window.removeEventListener('storage', changed); };
  }, []);
  const { hash } = useLocation();
  const resumeLink = useRef(null);
  const loaded = Boolean(entry.topics);
  useEffect(() => {
    if (loaded && hash === '#reise-fortsetzen') resumeLink.current?.focus();
  }, [loaded, hash]);
  const topics = entry.topics || [];
  const passedIds = new Set(topics.filter(item => item.saved.state?.bestResult?.passed).map(item => item.topic.id));
  const available = item => (item.topic.navigationPrerequisites || item.topic.prerequisites).every(id => passedIds.has(id));
  const next = topics.find(item => available(item) && !item.saved.state?.bestResult?.passed) || topics[0];
  const started = topics.some(item => item.saved.state);
  const complete = topics.length > 0 && topics.every(item => item.saved.state?.bestResult?.passed);
  const stages = (entry.catalog?.stages || entry.catalog?.fields || []).map(stage => {
    const items = topics.filter(item => stage.topicIds?.includes(item.topic.id));
    const passed = items.filter(item => item.saved.state?.bestResult?.passed).length;
    return { ...stage, items, passed, complete: Boolean(stage.reviewTopicId && stage.topicIds.length > 0 && passed === stage.topicIds.length) };
  });
  const currentStage = stages.find(stage => stage.id === next?.topic.fieldId);
  const lastCompleted = stages.filter(stage => stage.complete).at(-1);
  const totalPassed = stages.reduce((sum, stage) => sum + stage.passed, 0);
  return (
    <section aria-label="Geführte Lernreise">
      {entry.loading ? <p role="status">Lernreise wird geladen …</p> : entry.error ? (
        <p role="alert">{entry.error} <Link to={`/lernreise/fiae/${FIRST_JOURNEY_TOPIC}`}>Abschnitt erneut öffnen</Link></p>
      ) : (
        <>
          <div className="card journey-lead">
            {next && <>
              <p className="journey-kicker">{complete ? 'Wiederholung' : 'Nächstes Thema'} · {next.topic.fieldId}</p>
              <h2>{next.topic.title}</h2>
              <p>{currentStage?.title}</p>
              <Link id="reise-fortsetzen" ref={resumeLink} className="btn btn-primary" to={`/lernreise/fiae/${next.topic.id}`}>
                {next.saved.error ? 'Gespeicherten Stand prüfen' : complete ? 'Lernreise wiederholen' : started ? 'Lernreise fortsetzen' : 'Lernreise beginnen'}
              </Link>
              <div className="journey-progress">
                <strong>{currentStage.id}: {currentStage.passed} von {currentStage.total} Themen bestanden.</strong>
                <progress aria-label={`Fortschritt in ${currentStage.id}`} max={currentStage.total} value={currentStage.passed} />
                <span className="small text-muted">Gesamte Lernreise · {totalPassed} von {entry.catalog.totalTopics} Themen bestanden</span>
              </div>
            </>}
            {!next && <p>Die ersten Themen werden vorbereitet.</p>}
          </div>
          {complete && topics.length === entry.catalog.totalTopics && stages.length === 14 && stages.every(stage => stage.complete) &&
            <section className="alert alert-success" aria-label="FIAE-Abschluss">
              <h3>FIAE-Lernreise abgeschlossen</h3>
              <p>Du hast alle {topics.length} Themenchecks bestanden und die Praxisaufträge bestätigt.</p>
              <details><summary>Meine Lernziele und Ergebnisse ansehen</summary>
                <p>Die Zahlen zeigen die richtigen Antworten je Lernziel im letzten verfügbaren Mini-Test.</p>
                {stages.map(stage => <details key={stage.id}><summary>{stage.id} · {stage.title}</summary>
                  {stage.items.map(({ topic, saved }) => {
                    const scores = latestObjectiveScores(saved.state, topic);
                    return (
                      <section key={topic.id}>
                        <h4><Link to={`/lernreise/fiae/${topic.id}`}>{topic.title}</Link></h4>
                        <ul>{topic.objectives.map(goal => {
                          const score = scores.find(result => result.id === goal.id);
                          return <li key={goal.id}>{goal.text} {score ? `(${score.correct}/${score.total} richtig)` : '(Detailauswertung nach Abgabe der Wiederholung)'}</li>;
                        })}</ul>
                      </section>
                    );
                  })}
                </details>)}
              </details>
            </section>}
          {topics.some(item => item.saved.error) && <p className="alert alert-warning">Ein vorhandener Lernstand braucht Aufmerksamkeit. Er wird nicht überschrieben.</p>}
          {lastCompleted && <div className="alert alert-success journey-milestone" role="status">
            <h3>{lastCompleted.id} in der Lernreise abgeschlossen</h3>
            {lastCompleted.id !== currentStage?.id && <strong>{lastCompleted.id}: {lastCompleted.passed} von {lastCompleted.total} Themen bestanden.</strong>}
            {nextStageHints[lastCompleted.id] && stages[stages.indexOf(lastCompleted) + 1]?.available > 0 && <p>{nextStageHints[lastCompleted.id]}</p>}
          </div>}
          <details className="card journey-directory">
            <summary>Etappen und Themen ansehen <span className="small text-muted">{stages.length} Etappen</span></summary>
            <p className="text-muted">Jede Etappe führt von der Theorie über Quiz, Selbstreflexion und Karteikarten zum Mini-Test. Nach einem bestandenen Themencheck wird das nächste Thema frei. Der Rückblick gehört zum letzten Thema.</p>
            <div className="journey-stages" role="group" aria-label="Etappen der geführten Lernreise">
          {stages.map(stage => <details className="journey-stage" key={stage.id}
            open={expanded[stage.id] ?? stage.id === next?.topic.fieldId}>
            <summary onClick={event => { event.preventDefault(); setExpanded(current => ({ ...current, [stage.id]: !(current[stage.id] ?? stage.id === next?.topic.fieldId) })); }}>
              {stage.id === 'WISO' ? 'WISO · Wirtschafts- und Sozialkunde' : stage.id === 'PM' ? stage.title : `${stage.id} · ${stage.title}`}
              <span className="small">{stage.available ? `${stage.passed} von ${stage.total} Themen bestanden` : 'In Vorbereitung'}</span>
            </summary>
            {stage.complete && <div className="alert alert-success">
            <strong>Etappenrückblick</strong>
            <p>Alle {stage.topicIds.length} Themenchecks bestanden und den Rückblick bearbeitet.
              {stage.id === 'LF1' && ' Die praktische Präsentation hast du selbst durchgeführt und bestätigt; ihre Qualität wurde nicht automatisch benotet.'}
              {stage.id === 'LF3' && ' Die drei Netzwerkfälle hast du im Modell geprüft und bestätigt; echte Netzwerke wurden dabei nicht konfiguriert.'}
              {['LF4', 'LF5', 'LF6', 'LF7', 'LF8', 'LF9'].includes(stage.id) && ' Die praktische Übung hast du im lokalen Modell geprüft und bestätigt.'}
              {stage.id === 'LF2' && ' Die Modellübung hast du geprüft und bestätigt; sie ist kein Nachweis der Einrichtung echter Hardware.'}</p>
            {stage.id.endsWith('a') && <p>Den Praxisauftrag hast du anhand der Checkliste selbst geprüft und bestätigt.</p>}
            </div>}
            {stage.items.length > 0 ? <>
              <ol className="journey-topic-list" aria-label={`Verfügbare Themen in ${stage.id}`}>
            {stage.items.map(item => {
              const { topic, saved } = item;
              const unlocked = available(item);
              return <li key={topic.id}>
                <h3>{topic.title}</h3>
                {unlocked ? <Link className="btn btn-ghost" to={`/lernreise/fiae/${topic.id}`} aria-label={`${topic.title}: ${saved.state ? 'öffnen' : 'beginnen'}`}>
                  {saved.error ? 'Stand prüfen' : saved.state?.bestResult?.passed ? 'Ergebnis und Wiederholung' : saved.state ? 'Abschnitt fortsetzen' : 'Abschnitt öffnen'}
                </Link> : <span className="small text-muted">Gesperrt</span>}
              </li>;
            })}
              </ol>
            </> : <p>{stage.id === 'PM' ? 'Die geführte Etappe Projektmanagement folgt nach WISO. Inhalte und Themenchecks sind noch in Vorbereitung.' : 'Diese Etappe wird später ergänzt.'}</p>}
          </details>)}
          </div>
          </details>
          <p className="small text-muted">{topics.length} von {entry.catalog.totalTopics} geplanten Themen sind verfügbar. Dein Stand bleibt in diesem Browser- bzw. App-Profil.</p>
        </>
      )}
    </section>
  );
}
