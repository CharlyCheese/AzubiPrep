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
  // --- WICHTIG: Rules of Hooks (alle Hooks VOR den if-Returns) ---
  const { modulId } = useParams();
  const { daten: modul, laden, fehler } = useApi(() => api.get(`/module/${modulId}`), [modulId]);
  const { daten: fragen } = useApi(() => api.get(`/fragen?modulId=${modulId}`), [modulId]);

  const [offenTheorie, setOffenTheorie] = useState(true);
  const [offenFragen, setOffenFragen] = useState(false);
  const [quizAnzahl, setQuizAnzahl] = useState(() => quizOptionenStore.get().anzahl || 0);

  if (laden) return <div className="loading"><div className="spinner" />Lade Modul …</div>;
  if (fehler || !modul) return <div className="empty">Modul nicht gefunden.</div>;

  const fortschritt = progressStore.get();

  function aendereQuizAnzahl(neueAnzahl) {
    setQuizAnzahl(neueAnzahl);
    quizOptionenStore.set({ anzahl: neueAnzahl });
  }

  const modulFragen = fragen || [];
  const beantwortet = modulFragen.filter((f) => fortschritt[f.id]).length;
  const richtig = modulFragen.filter((f) => fortschritt[f.id]?.letztesErgebnis === true).length;
  const quote = beantwortet ? Math.round((richtig / beantwortet) * 100) : 0;

  const status = modulStatusEines(modul.modul_id, fortschritt, modulFragen.length);
  const stufe = statusAnzeige(status);

  return (
    <div>
      <header className="main-header">
        <div>
          <div className="flex wrap" style={{ gap: 6, alignItems: 'center' }}>
            <Link to="/lernen" className="small">← Lernbereich</Link>
            <span className={`badge badge-${modul.fachrichtung.toLowerCase()}`}>{modul.fachrichtung}</span>
            <span className="badge badge-neutral">{modul.fragenAnzahl} Fragen</span>
            <span className={`badge ${stufe.klasse}`}>{stufe.label}</span>
          </div>
          <h1 className="mb-0 mt-2">{modul.titel}</h1>
          <p className="text-muted mt-0">{modul.beschreibung}</p>
        </div>
      </header>

      <div className="dashboard-layout">
        {/* Hauptspalte: Theorie & Fragenkatalog */}
        <div>
          {modul.theorie && (
            <div className="mb-2">
              <Akkordeon
                titel="Theorie"
                untertitel="Lies den Theorietext, bevor du die Wissensabfrage startest."
                offen={offenTheorie}
                onToggle={() => setOffenTheorie((v) => !v)}
              >
                <div className="markdown">{renderMarkdown(modul.theorie)}</div>
              </Akkordeon>
            </div>
          )}

          <Akkordeon
            titel="Fragen des Moduls"
            untertitel={`${modulFragen.length} Fragen · Antwortoptionen werden gemischt · Klick zum Aufklappen der Lösung`}
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
                        <span className="small text-muted" style={{ display: 'block', marginTop: 4 }}>
                          <span className={`badge badge-${f.schwierigkeit}`}>{f.schwierigkeit}</span>{' '}
                          <span className="badge badge-neutral">{f.typ}</span>{' '}
                          <span>{f.thema}</span>
                        </span>
                      </span>
                    </summary>
                    <div className="frage-loesung">
                      <div className="alert alert-success"><strong>Lösung:</strong> {korrekteAntwortText(f)}</div>
                      {f.erklaerung && <div className="small text-muted mt-1">{f.erklaerung}</div>}
                    </div>
                  </details>
                ))}
              </div>
            ) : (
              <div className="empty">Noch keine Fragen für dieses Modul hinterlegt.</div>
            )}
          </Akkordeon>
        </div>

        {/* Nebenspalte: Schnellstart & Modul-Lernergebnis */}
        <aside>
          {/* Quick-Start & Quizkonfiguration */}
          <div className="card mb-2">
            <h2 className="mb-0" style={{ fontSize: '1.05rem' }}>⚡ Quiz starten</h2>
            <div className="mt-2">
              <label className="small text-muted mb-1" style={{ display: 'block' }}>Fragenumfang:</label>
              <select
                className="select"
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
            <Link
              className="btn btn-primary btn-block mt-2"
              to={`/quiz/${modul.modul_id}${quizAnzahl > 0 ? `?anzahl=${quizAnzahl}` : ''}`}
            >
              ▶ Quiz starten
            </Link>
            <Link className="btn btn-ghost btn-block mt-1" to="/karteikarten">
              🃏 Karteikarten öffnen
            </Link>
          </div>

          {/* Dein Lernergebnis in diesem Modul */}
          <div className="card">
            <div className="flex-between wrap mb-2">
              <h2 className="mb-0" style={{ fontSize: '1.05rem' }}>Modul-Status</h2>
              <span className={`badge ${stufe.klasse}`}>{stufe.label}</span>
            </div>

            <div className="grid-kpi mb-2">
              <div className="card" style={{ padding: 12 }}>
                <div className="stat-label">Beantwortet</div>
                <div className="stat-value" style={{ fontSize: '1.4rem' }}>{beantwortet}/{modulFragen.length}</div>
              </div>
              <div className="card" style={{ padding: 12 }}>
                <div className="stat-label">Quote</div>
                <div className="stat-value" style={{ fontSize: '1.4rem', color: quote >= 80 ? 'var(--success)' : 'var(--primary)' }}>
                  {quote}%
                </div>
              </div>
              <div className="card" style={{ padding: 12 }}>
                <div className="stat-label">Richtig</div>
                <div className="stat-value" style={{ fontSize: '1.4rem', color: 'var(--success)' }}>{richtig}</div>
              </div>
              <div className="card" style={{ padding: 12 }}>
                <div className="stat-label">Falsch</div>
                <div className="stat-value" style={{ fontSize: '1.4rem', color: 'var(--danger)' }}>
                  {Math.max(0, beantwortet - richtig)}
                </div>
              </div>
            </div>

            <div className="progress-label">
              <span>Fortschritt</span>
              <span>{status.abdeckung ?? 0}%</span>
            </div>
            <div className="progress mb-2">
              <div style={{ width: `${status.abdeckung ?? 0}%`, background: status.beherrscht ? 'var(--success)' : undefined }} />
            </div>

            <p className="small text-muted mb-0">
              {beantwortet === 0
                ? 'Noch keine Fragen beantwortet – starte das Quiz, um dein Ergebnis zu sehen. '
                : ''}
              Als <strong>beherrscht</strong> eingestuft ab {BEHERRSCHT_AB}% Erfolgsquote.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
