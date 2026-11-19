import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useApi } from '../utils/useApi.js';
import TheorieLektion from '../components/TheorieLektion.jsx';
import '../styles/theorie.css';

function DirectTopic({ id, moduleId, direction }) {
  const filters = new URLSearchParams();
  if (moduleId) filters.set('module', moduleId);
  if (direction) filters.set('fachrichtung', direction);
  const suffix = filters.size ? `?${filters}` : '';
  const { daten: topic, laden, fehler } = useApi(() => api.get(`/theorie/themen/${encodeURIComponent(id)}${suffix}`), [id, suffix]);
  if (laden) return <p role="status">Thema wird geladen …</p>;
  if (fehler || !topic) return <p role="alert">{fehler || 'Dieses Thema ist nicht verfügbar.'}</p>;
  return <TheorieLektion topic={topic} standalone />;
}

export default function Theorie() {
  const [params, setParams] = useSearchParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const moduleContext = state?.theoryModule ? { theoryModule: state.theoryModule, moduleOrigin: state.moduleOrigin } : undefined;
  function updateParams(next) { setParams(next, { state: moduleContext }); }
  const term = params.get('q') || '';
  const field = params.get('lf') || '';
  const module = params.get('modul') || '';
  const returnModule = moduleContext?.theoryModule || module;
  const direction = params.get('fachrichtung') || '';
  const mode = params.get('modus') || 'overview';
  const page = params.get('seite') || '1';
  const topicId = params.get('thema');
  const knowledge = params.get('wissen') === '1';
  const [draft, setDraft] = useState(term);
  const [filterOpen, setFilterOpen] = useState(false);
  const lastItem = useRef(null);
  const resultHeading = useRef(null);
  const movedPage = useRef(false);
  const wanted = new URLSearchParams({ field, module, mode, fachrichtung: direction, q: term, page }).toString();
  const directTopic = Boolean(topicId && !state?.theoryList);
  const { daten: catalog, laden, fehler } = useApi(() => directTopic ? Promise.resolve(null) : api.get(`/theorie?${wanted}`), [wanted, directTopic]);
  // Keep the existing 24-topic API pages and their URLs. Split each page into shorter lists.
  const listSize = 8;
  const groupsPerPage = catalog ? Math.ceil(catalog.pageSize / listSize) : 1;
  const lastGroup = Math.max(1, Math.ceil((catalog?.topics.length || 0) / listSize));
  const group = Math.min(lastGroup, Math.max(1, parseInt(params.get('gruppe'), 10) || 1));
  const visibleTopics = catalog?.topics.slice((group - 1) * listSize, group * listSize) || [];
  const listNumber = catalog ? (catalog.page - 1) * groupsPerPage + group : 1;
  const totalLists = catalog ? Math.floor(catalog.total / catalog.pageSize) * groupsPerPage + Math.ceil((catalog.total % catalog.pageSize) / listSize) : 0;
  const selected = catalog?.topics.find(topic => topic.id === topicId);
  const base = new URLSearchParams(params);
  base.delete('thema');
  base.delete('wissen');
  function address(search) {
    return search.size ? `/theorie?${search}` : '/theorie';
  }
  const listUrl = address(base);
  function linkFor(key, value) {
    const next = new URLSearchParams(base);
    if (key !== 'thema' && key !== 'wissen') {
      next.delete('gruppe');
      if (key !== 'seite') next.delete('seite');
    }
    if (key === 'fachrichtung') next.delete('modul');
    if (value) next.set(key, value);
    else next.delete(key);
    return next;
  }
  function goToList(number) {
    const next = linkFor('seite', String(Math.ceil(number / groupsPerPage)));
    const nextGroup = (number - 1) % groupsPerPage + 1;
    if (nextGroup > 1) next.set('gruppe', String(nextGroup));
    movedPage.current = true;
    updateParams(next);
  }
  useEffect(() => { setDraft(term); }, [term]);
  useEffect(() => {
    if (topicId || knowledge) {
      lastItem.current = knowledge ? 'freie-wissenssuche' : `theorie-${topicId}`;
    } else if (!laden && catalog) {
      if (lastItem.current) {
        (document.getElementById(lastItem.current) || resultHeading.current)?.focus();
        lastItem.current = null;
      } else if (movedPage.current && String(catalog.page) === page) {
        resultHeading.current?.focus();
        resultHeading.current?.scrollIntoView({ block: 'start' });
        movedPage.current = false;
      }
    }
  }, [topicId, knowledge, laden, catalog, page, group]);
  function backToList(event) {
    if (state?.theoryList !== listUrl || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(-1);
  }
  if (topicId || knowledge) return (
    <div className="theorie-page theorie-reader">
      <Link className="theorie-back" to={listUrl} replace state={moduleContext} onClick={backToList}>← Zur Themenübersicht</Link>
      {knowledge ? <TheorieLektion key="wissen" standalone /> : directTopic ?
        <DirectTopic key={topicId} id={topicId} moduleId={module} direction={direction} /> :
        laden ? <p role="status">Thema wird geladen …</p> : selected ? <TheorieLektion key={topicId} topic={selected} standalone /> :
          <DirectTopic key={topicId} id={topicId} moduleId={module} direction={direction} />}
    </div>
  );

  const filters = [direction, field, module].filter(Boolean);
  return (
    <div className="theorie-page">
      <header className="main-header">
        <div><h1 className="mb-0">Theorie &amp; Glossar</h1>
          <p className="text-muted mt-0">Finde ein Lernfeld, schlage einen Begriff nach oder stelle eine eigene Frage.</p>
          {returnModule && <Link to={`/lernen/${encodeURIComponent(returnModule)}`} state={moduleContext?.moduleOrigin}>← Zum Modul {returnModule}</Link>}
        </div>
      </header>
      <nav className="theorie-modes" aria-label="Theoriebereich wählen">
        <Link to={address(linkFor('modus', ''))} state={moduleContext} aria-current={mode !== 'glossary' ? 'page' : undefined}>Lernfelder &amp; Lernbereiche</Link>
        <Link to={address(linkFor('modus', 'glossary'))} state={moduleContext} aria-current={mode === 'glossary' ? 'page' : undefined}>Glossar</Link>
        <Link id="freie-wissenssuche" to={address(linkFor('wissen', '1'))} state={{ ...moduleContext, theoryList: listUrl }}>Freie Wissenssuche</Link>
      </nav>
      <div className="card theorie-controls">
        <form className="theorie-search-form" onSubmit={event => { event.preventDefault(); updateParams(linkFor('q', draft.trim())); }}>
          <label className="theorie-search">Thema oder Begriff
            <input className="input" maxLength={200} value={draft} onChange={event => setDraft(event.target.value)} placeholder="z. B. LF2, Arbeitsplatz, RAM …" />
          </label>
          <button className="btn btn-primary">Themen suchen</button>
        </form>
        <details className="theorie-filter-panel" open={filterOpen} onToggle={event => setFilterOpen(event.currentTarget.open)}>
          <summary>Filter {filters.length > 0 && <span className="small">· {filters.join(' · ')}</span>}</summary>
          <div className="theorie-filters">
            <label>Fachrichtung<select aria-label="Fachrichtung" className="select" value={direction} onChange={event => updateParams(linkFor('fachrichtung', event.target.value))}>
              <option value="">Alle Fachrichtungen</option>{['FIAE', 'FISI', 'DPA', 'DVK'].map(value => <option key={value}>{value}</option>)}
            </select></label>
            <label>Lernfeld<select aria-label="Lernfeld" className="select" value={field} onChange={event => updateParams(linkFor('lf', event.target.value))}>
              <option value="">Alle Lernfelder</option>{catalog?.fields.map(item => <option key={item.id} value={item.id}>{item.id} · {item.title}</option>)}
            </select></label>
            <label>Lernbereich<select aria-label="Lernbereich" className="select" value={module} onChange={event => updateParams(linkFor('modul', event.target.value))}>
              <option value="">Alle Lernbereiche</option>{catalog?.modules.map(item => <option key={item.id} value={item.id}>{item.title} · {item.fachrichtung}</option>)}
            </select></label>
          </div>
          <button type="button" className="btn btn-ghost" onClick={() => { updateParams({}); setDraft(''); }}>Filter zurücksetzen</button>
        </details>
      </div>
      {fehler && <p role="alert">{fehler}</p>}
      {laden && <p role="status">Themen werden geladen …</p>}
      {!laden && !fehler && catalog && <>
        <h2 ref={resultHeading} tabIndex={-1} className="theorie-results-title">{catalog.total} {catalog.total === 1 ? 'Thema' : 'Themen'}{mode === 'glossary' ? ' im Glossar' : ' in dieser Ansicht'}</h2>
        {mode === 'glossary' && (filters.length > 0 || term) && <p className="small text-muted">Insgesamt {catalog.glossaryTotal} Fragenthemen im Glossar</p>}
        <div className="theorie-grid">{visibleTopics.map(topic => (
          <Link className="card theorie-topic" key={topic.id} id={`theorie-${topic.id}`}
            to={address(linkFor('thema', topic.id))} state={{ ...moduleContext, theoryList: listUrl }}>
            <span className="small text-muted">{topic.field}</span>
            <strong>{topic.title}</strong>
            <span className="small text-muted">{topic.kind === 'overview' ? `Lernfeldeinstieg · ${topic.sections?.length || 0} Abschnitte` : topic.kind === 'module' ? 'Lernbereich' : 'Fragenthema'} · {topic.questionCount} Fragen</span>
          </Link>
        ))}</div>
        {!catalog.total && <p>Keine passenden Themen. Ändere den Suchbegriff oder die Filter.</p>}
        {totalLists > 1 && <nav className="theorie-pagination" aria-label="Ergebnisseiten">
          <button className="btn btn-ghost" disabled={listNumber <= 1} onClick={() => goToList(listNumber - 1)}>Vorherige Themen</button>
          <span>Seite {listNumber} von {totalLists}</span>
          <button className="btn btn-ghost" disabled={listNumber >= totalLists} onClick={() => goToList(listNumber + 1)}>Weitere Themen</button>
        </nav>}
        <p className="small text-muted">Das Verzeichnis umfasst Lernfelder, Module und Fragenthemen. Die Theorieabdeckung variiert je Thema. <Link to="/lernen">Zur Modulübersicht</Link></p>
      </>}
    </div>
  );
}
