import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';

export default function Suche() {
  const [begriff, setBegriff] = useState('');
  const [ergebnis, setErgebnis] = useState(null);
  const [laden, setLaden] = useState(false);
  const [fehler, setFehler] = useState('');

  async function suchen(e) {
    e.preventDefault();
    if (begriff.trim().length < 2) return;
    setLaden(true);
    setFehler('');
    try {
      const erg = await api.get(`/suche?q=${encodeURIComponent(begriff.trim())}`);
      setErgebnis(erg);
    } catch (err) {
      setFehler(err.message);
    } finally {
      setLaden(false);
    }
  }

  return (
    <div>
      <header className="main-header">
        <div>
          <h1 className="mb-0">Suche</h1>
          <p className="text-muted mt-0">Volltextsuche über alle Fragen, Erklärungen, Module und Themen.</p>
        </div>
      </header>

      <form className="card mb-2" onSubmit={suchen}>
        <div className="flex wrap">
          <input
            className="input search-input"
            style={{ flex: 1, minWidth: 240 }}
            value={begriff}
            onChange={(e) => setBegriff(e.target.value)}
            placeholder="Suchbegriff, z. B. Scrum, SQL, Subnetting …"
          />
          <button className="btn btn-primary" disabled={laden}>{laden ? 'Suche …' : 'Suchen'}</button>
        </div>
      </form>

      {fehler && <div className="alert alert-danger">{fehler}</div>}

      {ergebnis && (
        <>
          <div className="card mb-2">
            <h2 className="mb-0">Module ({ergebnis.module?.length})</h2>
            {ergebnis.module?.map((m) => (
              <div key={m.modul_id} className="module-row">
                <div>
                  <strong>{m.titel}</strong>
                  <div className="small text-muted">{m.modul_id} · {m.fachrichtung}</div>
                </div>
                <Link className="btn btn-ghost btn-sm" to={`/lernen/${m.modul_id}`}>Öffnen →</Link>
              </div>
            ))}
            {ergebnis.module?.length === 0 && <p className="text-muted mb-0">Keine passenden Module.</p>}
          </div>

          <div className="card">
            <h2 className="mb-0">Fragen ({ergebnis.fragen?.length})</h2>
            {ergebnis.fragen?.map((f) => (
              <div key={f.id} className="module-row">
                <div>
                  <strong>{f.frage}</strong>
                  <div className="small text-muted">
                    <span className="badge badge-neutral">{f.typ}</span>{' '}
                    <span className={`badge badge-${f.schwierigkeit}`}>{f.schwierigkeit}</span>{' '}
                    {f.modul_id} · {f.fachrichtung}
                  </div>
                </div>
                <div className="flex">
                  <Link className="btn btn-ghost btn-sm" to={`/lernen/${f.modul_id}`}>Modul</Link>
                  <Link className="btn btn-primary btn-sm" to={`/quiz/${f.modul_id}?frage=${f.id}`}>Diese Frage üben</Link>
                </div>
              </div>
            ))}
            {ergebnis.fragen?.length === 0 && <p className="text-muted mb-0">Keine passenden Fragen.</p>}
          </div>
        </>
      )}
    </div>
  );
}
