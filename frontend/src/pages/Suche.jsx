import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import TheorieLektion from '../components/TheorieLektion.jsx';
import { authStore } from '../store/authStore.js';
import { notesStore } from '../store/localStore.js';
import { findNotes, findTools } from '../utils/appSearch.js';
import { isPortfolio } from '../utils/deployment.js';
import { useApi } from '../utils/useApi.js';
import '../styles/learning-home.css';
import '../styles/search.css';

const PAGE_SIZE = 6;
const TYPES = {
  alle: 'Alle Bereiche', fragen: 'Fragen', module: 'Module', theorie: 'Theorie',
  glossar: 'Glossar', lernreise: 'Lernreise', werkstatt: 'Werkstatt',
  funktionen: 'App-Funktionen', notizen: 'Eigene Notizen',
};
const KIND = {
  fragen: 'Frage', module: 'Modul', theorie: 'Theorie', glossar: 'Glossar',
  lernreise: 'Lernreise', werkstatt: 'Werkstatt', funktionen: 'App-Funktion', notizen: 'Eigene Notiz',
};

function HitList({ items, returnState, label }) {
  return <ul className="lh-hits" aria-label={label}>{items.map(item =>
    <li key={`${item.type}-${item.id}`}>
      <small>{KIND[item.type]}{item.context && ` · ${item.context}`}</small>
      <h3>{item.type === 'fragen' ? item.title :
        <Link to={item.url} state={returnState}>{item.title}<span aria-hidden="true"> →</span></Link>}</h3>
      {item.description && <p>{item.description}</p>}
      {item.type === 'fragen' && <div className="lh-actions">
        <Link className="btn btn-ghost btn-sm" to={item.url} state={returnState}>Diese Frage üben</Link>
        {item.modulId && <Link className="lh-text-link" to={`/lernen/${encodeURIComponent(item.modulId)}`} state={returnState}>Zum Modul</Link>}
      </div>}
    </li>
  )}</ul>;
}

function Pager({ page, total, onPage }) {
  const pages = Math.ceil(total / PAGE_SIZE);
  const [number, setNumber] = useState(String(page));
  if (pages < 2) return null;
  return <nav className="search-pager" aria-label="Ergebnisseiten">
    <div className="lh-pager">
      <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>Zurück</button>
      <span>Seite {page} von {pages}</span>
      <button className="btn btn-ghost btn-sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>Weiter</button>
    </div>
    {pages > 3 && <form onSubmit={event => { event.preventDefault(); onPage(Number(number)); }}>
      <label htmlFor="search-page-number">Direkt zu Seite</label>
      <input id="search-page-number" type="number" className="input" min="1" max={pages} step="1" required value={number} onChange={event => setNumber(event.target.value)} />
      <button className="btn btn-ghost btn-sm">Öffnen</button>
    </form>}
  </nav>;
}

function LocalPreview({ items, type, onScope, returnState }) {
  if (!items.length) return null;
  return <section className="search-group" aria-label={TYPES[type]}>
    <div className="lh-section-head"><h2>{TYPES[type]} ({items.length})</h2>
      {items.length > 2 && <button className="btn btn-ghost btn-sm" onClick={() => onScope(type)}>Alle {items.length} anzeigen</button>}
    </div>
    <HitList label={TYPES[type]} items={items.slice(0, 2)} returnState={returnState} />
  </section>;
}

export default function Suche() {
  const auth = useSyncExternalStore(authStore.subscribe, authStore.snapshot);
  const noteOwner = notesStore.scope();
  return <ProfileSearch key={noteOwner} noteOwner={noteOwner} role={auth?.token ? auth.user?.rolle : null} />;
}

function ProfileSearch({ noteOwner, role }) {
  const [params, setParams] = useSearchParams();
  const { search, state } = useLocation();
  const selected = params.get('typ');
  const scope = Object.hasOwn(TYPES, selected) ? selected : 'alle';
  // History state keeps private terms available on return without putting them
  // in a page URL, network request or referrer.
  const privateQuery = noteOwner && state?.noteOwner === noteOwner && typeof state.noteQuery === 'string' ? state.noteQuery : '';
  const query = ((scope === 'notizen' ? privateQuery : params.get('q')) || '').trim().slice(0, 200);
  const valid = query.length >= 2;
  const requested = Number(params.get('seite'));
  const page = Number.isSafeInteger(requested) && requested > 0 ? requested : 1;
  const localOnly = scope === 'notizen' || scope === 'funktionen';
  const [draft, setDraft] = useState(query);
  const [retry, setRetry] = useState(0);
  const [knowledgeLoaded, setKnowledgeLoaded] = useState(false);
  const focusResults = useRef(false);
  const heading = useRef(null);
  const notes = useSyncExternalStore(notesStore.subscribe, notesStore.snapshot);
  const noteHits = useMemo(() => valid ? findNotes(query, notes) : [], [query, valid, notes]);
  const matchedTools = useMemo(() => valid ? findTools(query, role) : [], [query, valid, role]);
  const checkAccounts = (scope === 'alle' || scope === 'funktionen') && matchedTools.some(tool => tool.requiresAccounts);
  const { daten: serverStatus, laden: checkingAccounts } = useApi(
    () => checkAccounts ? api.get('/status') : Promise.resolve(null), [checkAccounts]);
  const toolHits = matchedTools.filter(tool => !tool.requiresAccounts || (checkAccounts && serverStatus?.syncAktiviert));

  const request = new URLSearchParams({ q: query, seite: String(page), limit: String(PAGE_SIZE) });
  if (scope !== 'alle') request.set('typ', scope);
  const path = valid && !localOnly ? `/suche/inhalte?${request}` : '';
  const { daten: loaded, laden, fehler } = useApi(
    () => path ? api.get(path).then(response => ({ path, response })) : Promise.resolve(null), [path, retry]);
  const daten = loaded?.path === path ? loaded.response : null;
  const error = path && fehler;
  const pending = Boolean(path && (laden || (!error && !daten))) ||
    (scope === 'funktionen' && checkAccounts && checkingAccounts);
  const returnState = scope === 'notizen' ? { resultSearch: search, noteQuery: query, noteOwner } : { resultSearch: search };
  const localItems = scope === 'notizen' ? noteHits : toolHits;
  const total = localOnly ? localItems.length : (daten?.total || 0);
  const currentPage = localOnly ? Math.min(page, Math.max(1, Math.ceil(total / PAGE_SIZE))) : (daten?.page || 1);
  const start = (currentPage - 1) * PAGE_SIZE;
  const items = localOnly ? localItems.slice(start, start + PAGE_SIZE) : (daten?.results || []);
  const showPreviews = scope === 'alle' && (daten ? currentPage : page) === 1;
  const hasPreview = showPreviews && (noteHits.length > 0 || toolHits.length > 0);
  const counts = { ...daten?.counts, notizen: noteHits.length, funktionen: toolHits.length };
  if (daten?.counts) counts.alle = Object.values(counts).reduce((sum, count) => sum + count, 0);

  useEffect(() => { setDraft(query); }, [query]);
  useEffect(() => {
    if (valid && focusResults.current && heading.current) {
      heading.current.focus({ preventScroll: true });
      heading.current.scrollIntoView({ block: 'nearest' });
      focusResults.current = false;
    }
  }, [search, state, valid]);

  function open(nextScope, term, nextPage = 1, replace = false) {
    const next = new URLSearchParams();
    if (term && nextScope !== 'notizen') next.set('q', term);
    if (nextScope !== 'alle') next.set('typ', nextScope);
    if (nextPage > 1) next.set('seite', String(nextPage));
    const nextState = nextScope === 'notizen' && term ? { noteQuery: term, noteOwner } : null;
    setParams(next, { replace, preventScrollReset: true, state: nextState });
  }
  function changeScope(nextScope) {
    // Moving to a public scope never submits a previous notes-only query.
    const nextTerm = scope === 'notizen' && nextScope !== 'notizen' ? '' : query;
    if (scope === 'notizen' && nextScope !== 'notizen') setDraft('');
    open(nextScope, nextTerm, 1, true);
  }
  function changePage(nextPage) {
    focusResults.current = true;
    open(scope, query, nextPage, true);
  }
  function submit(event) {
    event.preventDefault();
    if (draft.trim().length < 2) return;
    focusResults.current = true;
    open(scope, draft.trim());
  }

  return <div className="learning-home app-search">
    <header className="lh-header"><div><h1>Suche</h1>
      <p>Finde Lerninhalte, Übungen, Funktionen und deine eigenen Notizen.</p>
    </div><Link className="lh-text-link" to="/theorie?modus=glossary">Zum Theorie-Glossar →</Link></header>
    <form className="lh-panel search-form" role="search" onSubmit={submit}>
      <div className="search-term"><label htmlFor="learning-query">Suchbegriff</label>
        <input id="learning-query" className="input" type="search" minLength={2} maxLength={200} required value={draft}
          onChange={event => setDraft(event.target.value)} placeholder="z. B. SQL, Tagesplan oder Scrum" aria-describedby="search-hint" /></div>
      <div className="search-scope"><label htmlFor="search-scope">Suchbereich</label>
        <select id="search-scope" className="select" value={scope} onChange={event => changeScope(event.target.value)}>
          {Object.entries(TYPES).map(([value, name]) => <option key={value} value={value}>
            {name}{valid && draft.trim() === query && counts[value] !== undefined ? ` (${counts[value]})` : ''}
          </option>)}
        </select></div>
      <button className="btn btn-primary" disabled={draft.trim().length < 2}>Suchen</button>
      <small id="search-hint">{scope === 'notizen' ? 'Suchbegriff und Notizen bleiben auf diesem Gerät.' : 'Mindestens zwei Zeichen eingeben.'}</small>
    </form>
    {valid && <section className="search-results" aria-labelledby="search-results-heading">
      <h2 id="search-results-heading" ref={heading} tabIndex={-1}>Treffer für „{query}“</h2>
      {showPreviews && <>
        <LocalPreview items={toolHits} type="funktionen" returnState={returnState} onScope={changeScope} />
        <LocalPreview items={noteHits} type="notizen" returnState={returnState} onScope={changeScope} />
      </>}
      {pending ? <p role="status">Suchergebnisse werden geladen …</p> :
        error ? <div className="lh-panel"><p role="alert">Die Lerninhalte konnten nicht durchsucht werden. {error}</p>
          <button className="btn btn-ghost" onClick={() => setRetry(value => value + 1)}>Erneut suchen</button></div> :
          total > 0 ? <section className="search-group" aria-label={scope === 'alle' ? 'Gefundene Lerninhalte' : TYPES[scope]}>
            <h2>{scope === 'alle' ? 'Lerninhalte' : TYPES[scope]} ({total})</h2>
            <HitList items={items} label={scope === 'alle' ? 'Lerninhalte' : TYPES[scope]} returnState={returnState} />
            <Pager key={currentPage} page={currentPage} total={total} onPage={changePage} />
          </section> : !hasPreview && <div className="lh-panel" role="status"><p><strong>Keine Treffer in diesem Suchbereich.</strong></p>
            <p>Probiere einen kürzeren Begriff oder wähle einen anderen Suchbereich.</p></div>}
    </section>}
    <details className="lh-disclosure" onToggle={event => { if (event.currentTarget.open) setKnowledgeLoaded(true); }}>
      <summary><strong>{isPortfolio ? 'Fundstellen aus den Lerninhalten lesen' : 'Wissensfrage stellen oder Fundstellen lesen'}</strong></summary>
      {knowledgeLoaded && <TheorieLektion />}
    </details>
  </div>;
}
