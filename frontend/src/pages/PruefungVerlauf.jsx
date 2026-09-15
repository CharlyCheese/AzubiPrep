import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApi } from '../utils/useApi.js';
import { api } from '../api/client.js';
import { examStore } from '../store/localStore.js';
import { optionenListe, buchstabeZuZiffer } from '../utils/fragen.js';

export default function PruefungVerlauf() {
  const [searchParams] = useSearchParams();
  const { daten: fragenAlle } = useApi(() => api.get('/fragen'), []);
  const pruefungen = examStore.get();
  const fragenMap = new Map((fragenAlle || []).map((f) => [f.id, f]));

  const indexParam = searchParams.get('index');
  const index = indexParam !== null && indexParam !== '' ? Number(indexParam) : null;
  const ausgewaehlt = index !== null && pruefungen[index] ? index : null;

  const [position, setPosition] = useState(0);
  const [nurFehler, setNurFehler] = useState(false);

  // Frageposition und Filter beim Wechsel der Prüfung zurücksetzen
  useEffect(() => {
    setPosition(0);
    setNurFehler(false);
  }, [ausgewaehlt]);

  if (pruefungen.length === 0) {
    return (
      <div>
        <header className="main-header">
          <h1 className="mb-0">Prüfungsverlauf</h1>
        </header>
        <div className="card empty">
          Noch keine abgeschlossenen Prüfungen vorhanden.
          <div className="mt-2"><Link className="btn btn-primary" to="/pruefung">Prüfung starten</Link></div>
        </div>
      </div>
    );
  }

  if (ausgewaehlt === null) {
    return (
      <div>
        <header className="main-header">
          <div>
            <h1 className="mb-0">Prüfungsverlauf</h1>
            <p className="text-muted mt-0">{pruefungen.length} abgeschlossene Simulation(en) – zum Durchblättern auswählen.</p>
          </div>
          <Link className="btn btn-primary" to="/pruefung">Neue Prüfung</Link>
        </header>
        <div className="card">
          {pruefungen
            .map((p, i) => ({ ...p, i }))
            .reverse()
            .map((p) => (
              <div key={p.i} className="module-row">
                <div>
                  <strong>{new Date(p.am).toLocaleString('de-DE')}</strong>
                  <div className="small text-muted">
                    {p.fachrichtung || '–'} · {p.gesamt} Fragen · {p.gesamt - p.richtig} Fehler
                    {p.schwierigkeit && p.schwierigkeit !== 'alle' ? ` · ${p.schwierigkeit}` : ''}
                  </div>
                </div>
                <div className="flex">
                  <span className={`badge ${p.bestanden ? 'badge-leicht' : 'badge-schwer'}`}>{p.scoreProzent}%</span>
                  <Link className="btn btn-ghost btn-sm" to={`/pruefung/verlauf?index=${p.i}`}>Ansehen →</Link>
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  }

  const p = pruefungen[ausgewaehlt];
  const detail = p.detail || [];
  const falscheAnzahl = detail.filter((x) => !x.richtig).length;
  // Indizes der anzuzeigenden Fragen (ggf. nur Fehler)
  const indizes = nurFehler
    ? detail.map((x, i) => (!x.richtig ? i : -1)).filter((i) => i >= 0)
    : detail.map((_, i) => i);
  const posInListe = Math.min(position, Math.max(0, indizes.length - 1));
  const aktIndex = indizes.length ? indizes[posInListe] : 0;
  const d = detail[aktIndex];
  const frage = d ? fragenMap.get(d.frageId) : null;
  const optionen = frage ? optionenListe(frage) : [];
  const rohNutzer = Array.isArray(d?.nutzerAntwort) ? d.nutzerAntwort.join(',') : (d?.nutzerAntwort || '');
  const nutzerBuchstaben = String(rohNutzer)
    .toUpperCase().split(',').map((s) => s.trim()).filter(Boolean);
  const korrektBuchstaben = frage && frage.typ !== 'FT'
    ? (frage.antwort || '').toUpperCase().split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div>
      <header className="main-header">
        <div>
          <Link to="/pruefung/verlauf" className="small">← Verlauf</Link>
          <h1 className="mb-0 mt-2">Prüfung vom {new Date(p.am).toLocaleDateString('de-DE')}</h1>
          <p className="text-muted mt-0">
            {p.fachrichtung} · {p.richtig}/{p.gesamt} richtig · {p.scoreProzent}% · {p.bestanden ? 'bestanden' : 'nicht bestanden'}
          </p>
        </div>
      </header>

      <div className="progress mb-2"><div style={{ width: `${Math.min(100, p.scoreProzent || 0)}%` }} /></div>

      <div className="flex wrap mb-2">
        <button className={`btn btn-sm ${nurFehler ? 'btn-ghost' : 'btn-primary'}`} onClick={() => { setNurFehler(false); setPosition(0); }}>
          Alle Fragen ({detail.length})
        </button>
        <button className={`btn btn-sm ${nurFehler ? 'btn-primary' : 'btn-ghost'}`} onClick={() => { setNurFehler(true); setPosition(0); }}>
          Nur Fehler ({falscheAnzahl})
        </button>
      </div>

      {detail.length === 0 ? (
        <div className="empty">Für diese Prüfung liegt keine Detailauswertung vor.</div>
      ) : indizes.length === 0 ? (
        <div className="alert alert-success">Keine Fehler in dieser Prüfung – stark! 🎯</div>
      ) : (
        <>
          <div className="card">
            <div className="flex-between wrap mb-2">
              <span className="small text-muted">
                Frage {aktIndex + 1} von {detail.length}
                {nurFehler ? ` · Fehler ${posInListe + 1}/${indizes.length}` : ''}
              </span>
              <span className={`badge ${d.richtig ? 'badge-leicht' : 'badge-schwer'}`}>{d.richtig ? '✓ richtig' : '✗ falsch'}</span>
            </div>
            <h2 style={{ fontSize: '1.15rem' }}>{frage?.frage || d.frageId}</h2>

            {frage && frage.typ === 'FT' ? (
              <>
                <div className="alert alert-info"><strong>Deine Antwort:</strong> {d.nutzerAntwort || '– (keine Antwort)'}</div>
                <div className="alert alert-success"><strong>Musterlösung:</strong> {d.erwartet}</div>
              </>
            ) : optionen.length > 0 ? (
              <>
                {optionen.map((o) => {
                  const isKorrekt = korrektBuchstaben.includes(o.buchstabe);
                  const isNutzer = nutzerBuchstaben.includes(o.buchstabe);
                  let cls = 'option-row';
                  if (isKorrekt) cls += ' correct';
                  else if (isNutzer) cls += ' wrong';
                  return (
                    <div key={o.buchstabe} className={cls}>
                      <span className="option-letter">{buchstabeZuZiffer(o.buchstabe)}</span>
                      <span>{o.text}</span>
                      {isKorrekt && <span className="badge badge-leicht" style={{ marginLeft: 'auto' }}>richtig</span>}
                      {isNutzer && !isKorrekt && <span className="badge badge-schwer" style={{ marginLeft: 'auto' }}>deine Wahl</span>}
                    </div>
                  );
                })}
                <div className="small mt-2">
                  <strong>Deine Antwort{d.richtig ? '' : ' (falsch)'}:</strong>{' '}
                  <span style={{ color: d.richtig ? 'var(--success-ink)' : 'var(--danger-ink)', fontWeight: 600 }}>
                    {nutzerBuchstaben.length ? nutzerBuchstaben.map(buchstabeZuZiffer).join(', ') : '– (keine)'}
                  </span>
                  {' · '}<strong>Richtige Antwort:</strong>{' '}
                  <span style={{ color: 'var(--success-ink)', fontWeight: 600 }}>
                    {korrektBuchstaben.map(buchstabeZuZiffer).join(', ') || d.erwartet}
                  </span>
                </div>
              </>
            ) : (
              <div className="alert alert-info">Deine Antwort: {d.nutzerAntwort || '–'} · richtige Antwort: {d.erwartet}</div>
            )}

            {d.erklaerung && <div className="alert alert-info mt-2">{d.erklaerung}</div>}

            <div className="flex-between mt-2 wrap">
              <button className="btn btn-ghost" disabled={posInListe === 0} onClick={() => setPosition(posInListe - 1)}>← Zurück</button>
              <button className="btn btn-primary" disabled={posInListe >= indizes.length - 1} onClick={() => setPosition(posInListe + 1)}>Weiter →</button>
            </div>
          </div>

          <div className="card">
            <h3>Sprung zu Frage{nurFehler ? ' (nur Fehler)' : ''}</h3>
            <div className="flex wrap">
              {indizes.map((absIdx, relIdx) => (
                <button
                  key={`${detail[absIdx].frageId}-${absIdx}`}
                  className={`btn btn-sm ${relIdx === posInListe ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setPosition(relIdx)}
                  title={detail[absIdx].richtig ? 'richtig' : 'falsch'}
                >
                  {absIdx + 1}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="flex wrap mt-2">
        <Link className="btn btn-ghost" to="/pruefung/verlauf">Zur Liste</Link>
        <Link className="btn btn-primary" to="/pruefung">Neue Prüfung</Link>
      </div>
    </div>
  );
}
