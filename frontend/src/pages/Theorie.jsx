import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useApi } from '../utils/useApi.js';
import TheorieLektion from '../components/TheorieLektion.jsx';
import '../styles/theorie.css';

export default function Theorie() {
  const [params, setParams] = useSearchParams(); const [selected, setSelected] = useState(null); const [draft, setDraft] = useState(params.get('q') || '');
  const field = params.get('lf') || ''; const module = params.get('modul') || ''; const mode = params.get('modus') || 'overview';
  const direction = params.get('fachrichtung') || '';
  const query = new URLSearchParams({ field, module, mode, fachrichtung: direction, q: params.get('q') || '', page: params.get('seite') || '1' }).toString();
  const { daten: catalog, laden, fehler } = useApi(() => api.get(`/theorie?${query}`), [query]);
  useEffect(() => { setSelected(null); }, [query]);
  function change(key, value) { const next = new URLSearchParams(params); next.delete('seite'); if (key === 'fachrichtung') next.delete('modul'); if (value) next.set(key, value); else next.delete(key); setSelected(null); setParams(next); }
  return <div><header className="main-header"><div><h1 className="mb-0">Theorie & Glossar</h1><p className="text-muted mt-0">Erst verstehen, dann üben. Wähle ein Lernfeld oder suche einen Begriff aus dem Lernbereich.</p><p className="small">Themenverzeichnis aus Lernfeldern, Modulen und Fragenthemen. Eine angezeigte Themenliste ist kein Nachweis vollständiger Theorieabdeckung.</p></div></header>
    <div className="card mb-2"><div className="theorie-filters">
      <label>Fachrichtung<select aria-label="Fachrichtung" className="select" value={direction} onChange={event => change('fachrichtung', event.target.value)}><option value="">Alle Fachrichtungen</option>{['FIAE', 'FISI', 'DPA', 'DVK'].map(value => <option key={value} value={value}>{value}</option>)}</select></label>
      <label>Ansicht<select aria-label="Ansicht" className="select" value={mode} onChange={event => change('modus', event.target.value)}><option value="overview">Lernfelder & Lernbereiche</option><option value="glossary">Glossar der Fragenthemen</option></select></label>
      <label>Lernfeld<select aria-label="Lernfeld" className="select" value={field} onChange={event => change('lf', event.target.value)}><option value="">Alle Lernfelder</option>{catalog?.fields.map(item => <option key={item.id} value={item.id}>{item.id} · {item.title}</option>)}</select></label>
      <label>Lernbereich<select aria-label="Lernbereich" className="select" value={module} onChange={event => change('modul', event.target.value)}><option value="">Alle Lernbereiche</option>{catalog?.modules.map(item => <option key={item.id} value={item.id}>{item.title} · {item.fachrichtung}</option>)}</select></label>
    </div><form className="flex wrap mt-2" onSubmit={event => { event.preventDefault(); change('q', draft.trim()); }}><label className="theorie-search">Thema oder Begriff<input className="input" maxLength={200} value={draft} onChange={event => setDraft(event.target.value)} placeholder="z. B. LF2, Arbeitsplatz, RAM …" /></label><button className="btn btn-primary">Themen suchen</button><button type="button" className="btn btn-ghost" onClick={() => { setParams({}); setDraft(''); setSelected(null); }}>Filter zurücksetzen</button></form></div>
    {fehler && <p role="alert">{fehler}</p>}{laden && <p role="status">Themen werden geladen …</p>}
    {!laden && catalog && <><p>{catalog.total} Themen in dieser Ansicht{mode === 'glossary' ? ` · insgesamt ${catalog.glossaryTotal} Fragenthemen` : ''}</p><div className="theorie-grid">{catalog.topics.map(topic => <button className={`card theorie-topic ${selected?.id === topic.id ? 'theorie-selected' : ''}`} key={topic.id} onClick={() => setSelected(topic)} aria-pressed={selected?.id === topic.id}><span className="badge badge-neutral">{topic.field}</span><strong>{topic.title}</strong><span className="small text-muted">{topic.kind === 'overview' ? 'Lernfeldeinstieg · ' + (topic.sections?.length || 0) + ' Abschnitte' : topic.kind === 'module' ? 'Lernbereich' : 'Fragenthema'} · {topic.questionCount} zugeordnete Fragen</span></button>)}</div>{!catalog.total && <p>Keine passenden Themen. Ändere die Filter oder nutze die freie Wissenssuche unten.</p>}<div className="flex wrap mt-2 mb-2"><button className="btn btn-ghost" disabled={catalog.page <= 1} onClick={() => change('seite', String(catalog.page - 1))}>Vorherige Themen</button><span>Seite {catalog.page} von {Math.max(1, Math.ceil(catalog.total / catalog.pageSize))}</span><button className="btn btn-ghost" disabled={catalog.page * catalog.pageSize >= catalog.total} onClick={() => change('seite', String(catalog.page + 1))}>Weitere Themen</button></div></>}
    <div id="theorie-lesebereich"><TheorieLektion key={selected?.id || 'search'} topic={selected} /></div>
    <p className="small mt-2">Gemeinsame Lernfelder nach dem KMK-Rahmenlehrplan: LF1 Unternehmen und eigene Rolle, LF2 Arbeitsplätze nach Kundenwunsch. Fachrichtungsspezifische Bereiche behalten ihre Lernfeldkennung. <Link to="/lernen">Zur Modulübersicht</Link>.</p>
  </div>;
}
