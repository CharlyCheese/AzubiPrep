import { useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useApi } from '../utils/useApi.js';
import { api } from '../api/client.js';
import { progressStore, quizOptionenStore } from '../store/localStore.js';
import { modulStatusEines, statusAnzeige } from '../utils/modulStatus.js';
import { BEHERRSCHT_AB } from '../utils/gamification.js';
import { anzahlAuswahl } from '../utils/quizOptionen.js';
import { korrekteAntwortText } from '../utils/antworten.js';
import '../styles/learning-home.css';

function QuestionCatalog({ moduleId }) {
  const { daten: questions, laden, fehler } = useApi(() => api.get(`/fragen?modulId=${moduleId}`), [moduleId]);
  if (laden) return <p role="status">Fragen werden geladen …</p>;
  if (fehler) return <p role="alert">Die Fragen konnten nicht geladen werden. {fehler}</p>;
  if (!questions?.length) return <p>Für dieses Modul sind noch keine Fragen verfügbar.</p>;
  return questions.map((question, index) => (
    <details key={question.id} className="frage-details">
      <summary><span className="lh-question-number">{index + 1}</span><span><strong>{question.frage}</strong><small>{question.schwierigkeit} · {question.typ} · {question.thema}</small></span></summary>
      <div className="frage-loesung">
        <p><strong>Lösung</strong> · {korrekteAntwortText(question)}</p>
        {question.erklaerung && <p>{question.erklaerung}</p>}
      </div>
    </details>
  ));
}

export default function Modul() {
  const { modulId } = useParams();
  const { state } = useLocation();
  const { daten: module, laden, fehler } = useApi(() => api.get(`/module/${modulId}`), [modulId]);
  const [catalogFor, setCatalogFor] = useState(null);
  const [quizSize, setQuizSize] = useState(() => Number(quizOptionenStore.get().anzahl) || 0);

  const fromSearch = typeof state?.resultSearch === 'string';
  const fromJourney = /^\/lernreise\?fr=(FIAE|FISI|DPA|DVK)&weg=module(?:&ansicht=liste)?$/.test(state?.journeyReturn || '');
  const backState = fromJourney ? { journeyEntry: state.journeyEntry, journeyStation: modulId } : undefined;
  let backLink = { pathname: '/lernen', search: state?.catalogSearch || '' };
  let backLabel = '← Lernbereich';
  if (fromSearch) {
    backLink = { pathname: '/suche', search: state.resultSearch };
    backLabel = '← Suchergebnisse';
  } else if (fromJourney) {
    backLink = state.journeyReturn;
    backLabel = '← Lernreise';
  }
  if (laden) return <p className="loading" role="status">Modul wird geladen …</p>;
  if (fehler || !module) return <div className="learning-home"><Link className="lh-back" to={backLink} state={backState}>{backLabel}</Link><h1>Modul nicht verfügbar</h1><p>{fehler || 'Das Modul konnte nicht geladen werden.'}</p></div>;

  const total = module.fragenAnzahl ?? 0;
  const status = modulStatusEines(module.modul_id, progressStore.get(), total);
  const stage = statusAnzeige(status);
  const options = anzahlAuswahl(total);
  const selected = options.includes(quizSize) ? quizSize : 0;
  function chooseSize(event) {
    const value = Number(event.target.value);
    setQuizSize(value);
    quizOptionenStore.set({ anzahl: value });
  }
  const theoryOrigin = { theoryModule: module.modul_id, moduleOrigin: state };
  const theoryUrl = `/theorie?modul=${encodeURIComponent(module.modul_id)}`;

  return (
    <div className="learning-home">
      <header className="lh-module-heading">
        <Link to={backLink} state={backState} className="lh-back">{backLabel}</Link>
        <div className="lh-meta">
          <span>{module.lernfeld === 'KEIN_LF' ? 'Weitere Prüfungsbereiche' : module.lernfeld}</span>
          <span>{module.fachrichtung === 'ALLE' ? 'Alle Fachrichtungen' : module.fachrichtung}</span>
          <span>{total} Fragen</span>
        </div>
        <h1>{module.titel}</h1>
        <p>{module.beschreibung}</p>
      </header>

      <div className="lh-columns lh-module-actions">
        <section className="lh-panel lh-feature" aria-labelledby="module-quiz">
          <h2 id="module-quiz">Quiz starten</h2>
          {total > 0 ? (
            <>
              <label htmlFor="module-size">Fragenumfang</label>
              <div className="lh-quiz-controls">
                <select id="module-size" className="select" aria-label="Anzahl der Fragen im Quiz" value={selected} onChange={chooseSize}>
                  <option value={0}>Alle {total} Fragen</option>
                  {options.map((size) => <option key={size} value={size}>{size} Fragen</option>)}
                </select>
                <Link className="btn btn-primary" to={`/quiz/${module.modul_id}${selected ? `?anzahl=${selected}` : ''}`} state={{ moduleOrigin: state }}>Quiz starten →</Link>
              </div>
            </>
          ) : <p>Für dieses Modul sind noch keine Quizfragen verfügbar.</p>}
        </section>
        <section className="lh-panel" aria-labelledby="module-theory">
          <h2 id="module-theory">Theorie &amp; Glossar</h2>
          <p>Lies die Themen des Moduls oder schlage einen Fachbegriff nach.</p>
          <div className="lh-actions">
            <Link className="btn btn-ghost" to={theoryUrl} state={theoryOrigin}>Theorie lernen →</Link>
            <Link className="lh-text-link" to={`${theoryUrl}&modus=glossary`} state={theoryOrigin}>Begriffe nachschlagen</Link>
          </div>
        </section>
      </div>

      <section className="lh-panel" aria-labelledby="module-progress">
        <div className="lh-section-head">
          <h2 id="module-progress">Dein Modulfortschritt</h2>
          <span className={`badge ${stage.klasse}`}>{stage.label}</span>
        </div>
        <div className="lh-row"><strong>{status.anzahl} von {total} Fragen bearbeitet</strong><span>{status.abdeckung || 0} %</span></div>
        <div className="progress"><div style={{ width: `${status.abdeckung || 0}%` }} /></div>
        {status.bearbeitet && <p>{status.richtig} zuletzt richtig · {status.falsch} zuletzt falsch · {status.quote} % Erfolgsquote</p>}
        <small>Das Modul gilt als beherrscht, sobald du {BEHERRSCHT_AB} % aller Fragen zuletzt richtig beantwortet hast.</small>
      </section>

      <details className="lh-disclosure" key={modulId} onToggle={(event) => { if (event.currentTarget.open) setCatalogFor(modulId); }}>
        <summary><strong>Fragen des Moduls</strong><span>{total} Fragen mit Lösungen</span></summary>
        <div className="lh-inset">
          {catalogFor === modulId && <QuestionCatalog moduleId={modulId} />}
        </div>
      </details>
      <Link className="lh-text-link lh-bottom-link" to="/karteikarten">Mit Karteikarten wiederholen →</Link>
    </div>
  );
}
