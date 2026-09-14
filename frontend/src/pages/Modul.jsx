import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '../utils/useApi.js';
import { api } from '../api/client.js';
import { renderMarkdown } from '../utils/markdown.jsx';
import { progressStore, quizOptionenStore } from '../store/localStore.js';
import { modulStatusEines, statusAnzeige } from '../utils/modulStatus.js';
import { BEHERRSCHT_AB } from '../utils/gamification.js';
import { anzahlAuswahl } from '../utils/quizOptionen.js';
import Akkordeon from '../components/Akkordeon.jsx';
import { korrekteAntwortText } from '../utils/antworten.js';

export default function Modul() {
  const { modulId } = useParams();
  const { daten: modul, laden, fehler } = useApi(() => api.get(`/module/${modulId}`), [modulId]);
  const { daten: fragen } = useApi(() => api.get(`/fragen?modulId=${modulId}`), [modulId]);

  const [offenTheorie, setOffenTheorie] = useState(true);
  const [offenFragen, setOffenFragen] = useState(false);

  if (laden) return <div className="loading"><div className="spinner" />Lade Modul …</div>;
  if (fehler || !modul) return <div className="empty">Modul nicht gefunden.</div>;

  // Lernergebnis dieses Moduls aus dem lokalen Fortschritt
  const fortschritt = progressStore.get();

  // Anzahl der Fragen fuer das Quiz (0 = alle Fragen des Moduls)
  const [quizAnzahl, setQuizAnzahl] = useState(() => quizOptionenStore.get().anzahl || 0);

  function aendereQuizAnzahl(neueAnzahl) {
    setQuizAnzahl(neueAnzahl);
    quizOptionenStore.set({ anzahl: neueAnzahl });
  }
  const modulFragen = fragen || [];
  const beantwortet = modulFragen.filter((f) => fortschritt[f.id]).length;
  const richtig = modulFragen.filter((f) => fortschritt[f.id]?.letztesErgebnis === true).length;
  const quote = beantwortet ? Math.round((richtig / beantwortet) * 100) : 0;

  // Status laut Gamification-Plan: bearbeitet / beherrscht (ab 80 % Erfolgsquote)
  const status = modulStatusEines(modul.modul_id, fortschritt, modulFragen.length);
  const stufe = statusAnzeige(status);

  return (
    <div>
      <header className="main-header">
        <div>
          <div className="flex wrap">
            <Link to="/lernen" className="small">← Lernbereich</Link>
            <span className={`badge badge-${modul.fachrichtung.toLowerCase()}`}>{modul.fachrichtung}</span>
            <span className="badge badge-neutral">{modul.fragenAnzahl} Fragen</span>
            <span className={`badge ${stufe.klasse}`}>{stufe.label}</span>
          </div>
          <h1 className="mb-0 mt-2">{modul.titel}</h1>
          <p className="text-muted mt-0">{modul.beschreibung}</p>
        </div>
      </header>

      <div className="card mb-2">
        <div className="flex-between wrap">
          <div className="flex wrap">
            <span className="small text-muted">Fragen im Quiz</span>
            <select
              className="select"
              style={{ width: 'auto' }}
              value={quizAnzahl}
              onChange={(e) => aendereQuizAnzahl(Number(e.target.value))}
              aria-label="Anzahl der Fragen im Quiz"
            >
              <option value={0}>Alle {modulFragen.length} Fragen</option>
              {anzahlAuswahl(modulFragen.length).map((n) => (
                <option key={n} value={n}>{n} Fragen</option>
              ))}
            </select>
          </div>
          <div className="flex wrap">
            <Link className="btn btn-primary" to={`/quiz/${modul.modul_id}${quizAnzahl > 0 ? `?anzahl=${quizAnzahl}` : ''}`}>▶ Quiz starten</Link>
            <Link className="btn btn-ghost" to="/karteikarten">🃏 Karteikarten öffnen</Link>
          </div>
        </div>
      </div>

      <div className="card mb-2">
        <h2 className="mb-0">Dein Lernergebnis in diesem Modul</h2>
        <div className="grid grid-4 mt-2">
          <div><div className="stat-value">{beantwortet}</div><div className="stat-label">beantwortet</div></div>
          <div><div className="stat-value">{richtig}</div><div className="stat-label">richtig</div></div>
          <div><div className="stat-value">{Math.max(0, beantwortet - richtig)}</div><div className="stat-label">falsch</div></div>
          <div><div className="stat-value">{quote}%</div><div className="stat-label">Erfolgsquote</div></div>
        </div>
        <div className="progress-label mt-2">
          <span>Fragen bearbeitet</span>
          <span>{beantwortet} von {modulFragen.length} ({status.abdeckung ?? 0} %)</span>
        </div>
        <div className="progress"><div style={{ width: `${status.abdeckung ?? 0}%` }} /></div>
        <p className="small text-muted mt-1 mb-0">
          {beantwortet === 0
            ? 'Noch keine Fragen beantwortet – starte das Quiz, um dein Ergebnis zu sehen.'
            : `${beantwortet} von ${modulFragen.length} Fragen bearbeitet.`}
        </p>
        <p className="small text-muted mt-1 mb-0">
          Status: <strong>{stufe.label}</strong> · als beherrscht ab {BEHERRSCHT_AB} % Erfolgsquote
          {status.bearbeitet ? ` (aktuell ${status.quote} % aus ${status.anzahl} beantworteten Fragen)` : ''}
        </p>
      </div>

      <div className="grid">
        {modul.theorie && (
          <Akkordeon
            titel="Theorie"
            untertitel="Lies den Theorietext, bevor du die Wissensabfrage startest."
            offen={offenTheorie}
            onToggle={() => setOffenTheorie((v) => !v)}
          >
            <div className="markdown">{renderMarkdown(modul.theorie)}</div>
          </Akkordeon>
        )}

        <Akkordeon
          titel="Fragen des Moduls"
          untertitel={`${modulFragen.length} Fragen · Antwortoptionen werden gemischt · Frage zum Aufklappen der Lösung anklicken`}
          offen={offenFragen}
          onToggle={() => setOffenFragen((v) => !v)}
        >
          {fragen && fragen.length > 0 ? (
            <div>
              {fragen.map((f, i) => (
                <details key={f.id} className="frage-details">
                  <summary>
                    <span className="badge badge-neutral" style={{ minWidth: 28, textAlign: 'center' }}>{i + 1}</span>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ fontWeight: 600 }}>{f.frage}</span>
                      <span className="small text-muted" style={{ display: 'block' }}>
                        <span className={`badge badge-${f.schwierigkeit}`}>{f.schwierigkeit}</span>{' '}
                        <span className="badge badge-neutral">{f.typ}</span>{' '}
                        <span>{f.thema}</span>
                      </span>
                    </span>
                  </summary>
                  <div className="frage-loesung">
                    <div className="alert alert-success"><strong>Lösung:</strong> {korrekteAntwortText(f)}</div>
                    {f.erklaerung && <div className="small text-muted">{f.erklaerung}</div>}
                  </div>
                </details>
              ))}
            </div>
          ) : (
            <div className="empty">Noch keine Fragen für dieses Modul hinterlegt.</div>
          )}
        </Akkordeon>
      </div>
    </div>
  );
}
