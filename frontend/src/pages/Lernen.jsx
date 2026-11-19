import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useApi } from '../utils/useApi.js';
import { api } from '../api/client.js';
import { profileStore, progressStore } from '../store/localStore.js';
import { modulStatusAusFortschritt, statusAnzeige, abdeckungProzent } from '../utils/modulStatus.js';
import { gruppiereNachLernfeld } from '../utils/lernfeldOrdnung.js';
import '../styles/learning-home.css';

function ModuleCard({ module, status, catalogSearch, direction }) {
  const stage = statusAnzeige(status);
  const total = module.fragenAnzahl || 0;
  const covered = status?.anzahl || 0;
  const percentage = abdeckungProzent(covered, total);
  return (
    <article className="card lh-module-card">
      <div className="lh-meta">
        <span>{module.fachrichtung === 'ALLE' ? 'Alle Fachrichtungen' : module.fachrichtung}{module.fachrichtung === direction && ' · deine Fachrichtung'}</span>
        {module.lernfeld && module.lernfeld !== 'KEIN_LF' && <span>{module.lernfeld}</span>}
        <span>{total} Fragen</span>
        {status?.bearbeitet && <span className={`badge ${stage.klasse}`}>{stage.label}</span>}
      </div>
      <h3><Link to={`/lernen/${module.modul_id}`} state={{ catalogSearch }}>{module.titel} <span aria-hidden="true">→</span></Link></h3>
      <p>{module.beschreibung}</p>
      {status?.bearbeitet && (
        <div>
          <div className="progress-label"><span>Bearbeitet</span><span>{covered} von {total} ({percentage} %)</span></div>
          <div className="progress"><div style={{ width: `${percentage}%` }} /></div>
          <small>{status.richtig} von {total} richtig · {status.beherrschung}% des Moduls</small>
        </div>
      )}
    </article>
  );
}

export default function Lernen() {
  const { fachrichtung = 'FIAE' } = profileStore.get();
  const { daten: modules, laden, fehler } = useApi(() => api.get('/module'), []);
  const [params, setParams] = useSearchParams();
  const { search } = useLocation();
  const query = params.get('q') || '';
  const direction = params.get('richtung') || '';
  const expanded = params.getAll('offen');
  const moduleCounts = new Map((modules || []).map((module) => [module.modul_id, module.fragenAnzahl]));
  const statuses = modulStatusAusFortschritt(progressStore.get(), (id) => moduleCounts.get(id));
  const needle = query.trim().toLocaleLowerCase('de');
  const filtered = (modules || []).filter((module) => {
    const matchesDirection = !direction || module.fachrichtung === direction || module.fachrichtung === 'ALLE';
    const terms = [module.titel, module.beschreibung, module.modul_id, module.lernfeld].join(' ').toLocaleLowerCase('de');
    return matchesDirection && terms.includes(needle);
  });
  const groups = gruppiereNachLernfeld(filtered, fachrichtung);
  function changeFilter(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace: true, preventScrollReset: true });
  }
  function toggleGroup(field) {
    const next = new URLSearchParams(params);
    next.delete('offen');
    expanded.filter((code) => code !== field).forEach((code) => next.append('offen', code));
    if (!expanded.includes(field)) next.append('offen', field);
    setParams(next, { replace: true, preventScrollReset: true });
  }
  function renderModule(module) {
    return <ModuleCard key={module.modul_id} module={module} status={statuses[module.modul_id]} catalogSearch={search} direction={fachrichtung} />;
  }

  return (
    <div className="learning-home">
      <header className="lh-header">
        <div>
          <h1>Lernbereich</h1>
          <p>Finde dein Modul nach Thema, Lernfeld oder Fachrichtung.</p>
        </div>
        <Link className="lh-text-link" to="/theorie">Theorie &amp; Glossar →</Link>
      </header>

      <div className="lh-panel lh-catalog-filters">
        <div>
          <label htmlFor="catalog-query">Modul suchen</label>
          <input id="catalog-query" className="input" type="search" value={query} onChange={(event) => changeFilter('q', event.target.value)} placeholder="Thema oder Lernfeld, z. B. SQL" />
        </div>
        <div>
          <label htmlFor="catalog-direction">Fachrichtung</label>
          <select id="catalog-direction" className="select" value={direction} onChange={(event) => changeFilter('richtung', event.target.value)}>
            <option value="">Alle Fachrichtungen</option>
            {['FIAE', 'FISI', 'DPA', 'DVK'].map((code) => <option key={code} value={code}>{code}{code === fachrichtung ? ' (deine)' : ''} + Grundlagen</option>)}
          </select>
        </div>
      </div>

      {laden ? <p role="status">Module werden geladen …</p> : fehler ? <p className="alert alert-danger" role="alert">Module konnten nicht geladen werden. {fehler}</p> : (
        <section aria-labelledby="catalog-groups">
          <div className="lh-section-head">
            <h2 id="catalog-groups">{needle || direction ? 'Passende Module' : 'Module nach Lernfeld'}</h2>
            <span className="lh-count" role="status">{filtered.length} {filtered.length === 1 ? 'Modul' : 'Module'}</span>
          </div>
          {filtered.length === 0 && <div className="lh-panel"><p>Kein Modul passt zu deiner Auswahl.</p><button className="btn btn-ghost" onClick={() => setParams({}, { replace: true })}>Filter zurücksetzen</button></div>}
          {needle || direction ? (
            <div className="lh-module-grid">{groups.flatMap((group) => group.module).map(renderModule)}</div>
          ) : (
            <div className="lh-fields">
              {groups.map((group) => {
                const open = expanded.includes(group.lernfeld);
                const topics = [...new Set(group.module.map((module) => module.titel))];
                const field = group.lernfeld === 'KEIN_LF' ? 'Weitere' : group.titel;
                return (
                  <div className="lh-field" key={group.lernfeld}>
                    <button className="lh-field-toggle" aria-expanded={open} aria-controls={`field-${group.lernfeld}`} onClick={() => toggleGroup(group.lernfeld)}>
                      <span className="lh-field-code">{field}</span>
                      <span className="lh-field-topic">{topics.slice(0, 2).join(' · ')}{topics.length > 2 ? ' …' : ''}</span>
                      <span className="lh-count">{group.module.length} {group.module.length === 1 ? 'Modul' : 'Module'}</span>
                      <span className="lh-chevron" aria-hidden="true" />
                    </button>
                    <div id={`field-${group.lernfeld}`} hidden={!open}>
                      {open && <div className="lh-module-grid">{group.module.map(renderModule)}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
