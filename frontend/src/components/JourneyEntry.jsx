import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  const topics = entry.topics || [];
  const available = item => (item.topic.navigationPrerequisites || item.topic.prerequisites).every(id => topics.find(other => other.topic.id === id)?.saved.state?.bestResult?.passed);
  const next = topics.find(item => available(item) && !item.saved.state?.bestResult?.passed) || topics[0];
  const started = topics.some(item => item.saved.state);
  const complete = topics.length > 0 && topics.every(item => item.saved.state?.bestResult?.passed);
  const stages = (entry.catalog?.stages || entry.catalog?.fields || []).map(stage => {
    const items = topics.filter(item => stage.topicIds?.includes(item.topic.id));
    const passed = items.filter(item => item.saved.state?.bestResult?.passed).length;
    return { ...stage, items, passed, complete: Boolean(stage.reviewTopicId && stage.topicIds.length > 0 && passed === stage.topicIds.length) };
  });
  return (
    <section className="card mb-2" aria-labelledby="journey-entry-title">
      <span className="badge badge-neutral">Geführte Lernreise · FIAE</span>
      <h2 id="journey-entry-title">Allgemeine Grundlagen zuerst</h2>
      <p>Dein Weg: LF1 → Wirtschafts- und Sozialkunde → Projektmanagement → LF2 und die weiteren Lernfelder. Passende Theorie, Quiz, Selbstreflexion,
        Karteikarten und ein kleiner Test gehören jeweils zusammen.</p>
      {entry.loading ? <p role="status">Lernreise wird geladen …</p> : entry.error ? (
        <p role="alert">{entry.error} <Link to={`/lernreise/fiae/${FIRST_JOURNEY_TOPIC}`}>Abschnitt erneut öffnen</Link></p>
      ) : (
        <>
          <p>{topics.length} von {entry.catalog.totalTopics} geplanten Themen sind verfügbar. {topics.length < entry.catalog.totalTopics && 'Weitere Themen und Lernfelder folgen.'}</p>
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
          {stages.filter(stage => stage.available).map(stage => <p key={stage.id}><strong>{stage.id}: {stage.passed} von {stage.total} Themen bestanden.</strong></p>)}
          {stages.filter(stage => stage.complete).map(stage => <div key={stage.id} className="alert alert-success" role="status">
            <h3>{stage.id} in der Lernreise abgeschlossen</h3>
            <p>Alle {stage.topicIds.length} Themenchecks bestanden und den Rückblick bearbeitet.
              {stage.id === 'LF1' && ' Die praktische Präsentation hast du selbst durchgeführt und bestätigt; ihre Qualität wurde nicht automatisch benotet.'}
              {stage.id === 'LF3' && ' Die drei Netzwerkfälle hast du im Modell geprüft und bestätigt; echte Netzwerke wurden dabei nicht konfiguriert.'}
              {['LF4', 'LF5', 'LF6', 'LF7', 'LF8', 'LF9'].includes(stage.id) && ' Die praktische Übung hast du im lokalen Modell geprüft und bestätigt.'}
              {stage.id === 'LF2' && ' Die Modellübung hast du geprüft und bestätigt; sie ist kein Nachweis der Einrichtung echter Hardware.'}</p>
            {stage.id.endsWith('a') && <p>Den Praxisauftrag hast du anhand der Checkliste selbst geprüft und bestätigt.</p>}
            {nextStageHints[stage.id] && stages[stages.indexOf(stage) + 1]?.available > 0 && <p>{nextStageHints[stage.id]}</p>}
          </div>)}
          {next && <Link className="btn btn-primary" to={`/lernreise/fiae/${next.topic.id}`}>
            {next.saved.error ? 'Gespeicherten Stand prüfen' : complete ? 'Lernreise wiederholen' : started ? 'Lernreise fortsetzen' : 'Lernreise beginnen'}
          </Link>}
          <div className="journey-stages" role="group" aria-label="Etappen der geführten Lernreise">
          {stages.map(stage => <details className="journey-stage" key={stage.id}
            open={expanded[stage.id] ?? stage.id === next?.topic.fieldId}>
            <summary onClick={event => { event.preventDefault(); setExpanded(current => ({ ...current, [stage.id]: !(current[stage.id] ?? stage.id === next?.topic.fieldId) })); }}>{stage.id === 'WISO' ? 'Sonstige Prüfungsbereiche · Wirtschafts- und Sozialkunde' : stage.id === 'PM' ? stage.title : `${stage.id} · ${stage.title}`}
              <span className="small">{stage.available ? `${stage.passed} von ${stage.total} Themen bestanden` : 'In Vorbereitung'}</span>
            </summary>
            {stage.items.length > 0 ? <>
              <p>Der Rückblick gehört zum letzten Thema.</p>
              <ol className="journey-topic-list" aria-label={`Verfügbare Themen in ${stage.id}`}>
            {stage.items.map(item => {
              const { topic, saved } = item;
              const unlocked = available(item);
              return <li key={topic.id}>
                <h3>{topic.title}</h3>
                <p className="small">{topic.fieldId} · {saved.error ? 'Gespeicherten Stand prüfen' : saved.state?.bestResult?.passed ? 'Bestanden' : saved.state ? 'Begonnen' : 'Noch nicht begonnen'}</p>
                {unlocked ? <Link className="btn btn-ghost" to={`/lernreise/fiae/${topic.id}`} aria-label={`${topic.title}: ${saved.state ? 'öffnen' : 'beginnen'}`}>
                  {saved.error ? 'Stand prüfen' : saved.state?.bestResult?.passed ? 'Ergebnis und Wiederholung' : saved.state ? 'Abschnitt fortsetzen' : 'Abschnitt öffnen'}
                </Link> : <p>Zuerst abschließen: {(topic.navigationPrerequisites || topic.prerequisites).map(id => topics.find(other => other.topic.id === id)).filter(required => required && !required.saved.state?.bestResult?.passed).map(required => required.topic.title).join(' · ')}.</p>}
              </li>;
            })}
              </ol>
            </> : <p>{stage.id === 'PM' ? 'Die geführte Etappe Projektmanagement folgt nach WISO. Inhalte und Themenchecks sind noch in Vorbereitung.' : 'Diese Etappe wird später ergänzt.'}</p>}
          </details>)}
          </div>
        </>
      )}
      <p className="small text-muted mb-0">Ohne KI und ohne Konto nutzbar. Der Lernstand bleibt in diesem Browser- bzw. App-Profil; Kontosync übernimmt ihn noch nicht.</p>
    </section>
  );
}
