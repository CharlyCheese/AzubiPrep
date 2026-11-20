import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { renderMarkdown } from '../utils/markdown.jsx';

export default function PublicTheoryLesson({ topic, standalone }) {
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState(topic ? { term: '' } : null);
  const [result, setResult] = useState(null);
  const heading = useRef(null);
  const Heading = standalone ? 'h1' : 'h2';
  const topicId = topic?.id || 'search';
  const current = result?.search === search ? result : null;

  useEffect(() => {
    if (standalone) {
      window.scrollTo(0, 0);
      heading.current?.focus({ preventScroll: true });
    }
  }, [standalone]);

  useEffect(() => {
    if (!search) return;
    const controller = new AbortController();
    const query = new URLSearchParams({ thema: topicId, q: search.term });
    api.get(`/theorie/fundstellen?${query}`, { signal: controller.signal })
      .then(data => { if (!controller.signal.aborted) setResult({ search, data }); })
      .catch(() => { if (!controller.signal.aborted) setResult({ search, failed: true }); });
    return () => controller.abort();
  }, [search, topicId]);

  function lookup(term) {
    setDraft(term);
    setSearch({ term: term.trim() });
  }

  return <section className="card theorie-lesson" aria-label="Theorie lernen">
    <Heading ref={heading} tabIndex={-1}>{topic?.title || 'Wissenssuche'}</Heading>
    {topic?.reading && <details className="theorie-reading markdown"><summary>Theorietext zum Modul lesen</summary>{renderMarkdown(topic.reading, 1)}</details>}
    {topic?.sections?.length > 0 && <details className="theorie-outline">
      <summary>Teilthemen aus {topic.field} nachschlagen</summary>
      <ol>{topic.sections.map(section => <li key={section.id}>
        <button className="btn btn-ghost" onClick={() => lookup(section.title)}>{section.title}</button>
      </li>)}</ol>
    </details>}
    <form className="theorie-search-form" onSubmit={event => { event.preventDefault(); lookup(draft); }}>
      <label className="theorie-search">Öffentliche Lerninhalte durchsuchen
        <input type="search" className="input" maxLength={200} value={draft}
          onChange={event => setDraft(event.target.value)} placeholder="z. B. DNS oder Aufgaben des BIOS" />
      </label>
      <button className="btn btn-primary" disabled={draft.trim().length < 3 && !(topic && !draft.trim())}>Fundstellen lesen</button>
    </form>
    {search && !current && <p role="status">Fundstellen werden gesucht …</p>}
    {current?.failed && <div><p role="alert">Die Fundstellen konnten nicht geladen werden.</p>
      <button className="btn btn-ghost" onClick={() => lookup(search.term)}>Erneut versuchen</button></div>}
    {current?.data && <section aria-label="Fundstellen" aria-live="polite">
      <h3>{search.term ? `Fundstellen zu „${search.term}“` : 'Fundstellen zum Thema'}</h3>
      {current.data.sources.map(source => <figure className="theorie-quote" key={source.id}>
        <figcaption><Link to={source.url}>{source.label}</Link></figcaption>
        <blockquote className="ki-text">{source.text}</blockquote>
      </figure>)}
      {!current.data.sources.length && <p>{current.data.state === 'partial_match'
        ? 'Zu diesem Vergleich gibt es nur für einen Teil der Begriffe passende Fundstellen. Suche nach einem einzelnen Begriff.'
        : 'Keine passenden Fundstellen gefunden. Versuche einen anderen Suchbegriff.'}</p>}
    </section>}
    {topic?.practice && <Link className="btn btn-ghost mt-2" to={`/quiz/${encodeURIComponent(topic.practice.moduleId)}?frage=${encodeURIComponent(topic.practice.id)}`}>Passende Frage üben →</Link>}
  </section>;
}
