import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExamStore, setExamState } from '../store/examStore.js';
import { api } from '../api/client.js';
import { optionenListe, buchstabeZuZiffer } from '../utils/fragen.js';

export default function PruefungLauf() {
  const navigate = useNavigate();
  const store = useExamStore();
  const { fragen, antworten, konfig } = store;

  const [aktuell, setAktuell] = useState(0);
  const questionHeading = useRef(null);
  const [abgabe, setAbgabe] = useState(false);
  const [fehler, setFehler] = useState('');

  const zeitlimitSek = (konfig?.zeitlimitMin || 60) * 60;
  const startAm = store.startAm ? new Date(store.startAm).getTime() : Date.now();
  const [restSek, setRestSek] = useState(zeitlimitSek);

  // Countdown
  useEffect(() => {
    const interval = setInterval(() => {
      const vergangen = Math.floor((Date.now() - startAm) / 1000);
      setRestSek(Math.max(0, zeitlimitSek - vergangen));
    }, 1000);
    return () => clearInterval(interval);
  }, [startAm, zeitlimitSek]);

  // Automatische Abgabe bei Zeitablauf
  useEffect(() => {
    if (restSek === 0 && !abgabe && fragen.length) {
      abgeben();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restSek]);

  if (!fragen?.length) {
    return (
      <div className="loading">
        <div className="spinner" />
        Keine aktive Prüfung. <button className="btn btn-primary" onClick={() => navigate('/pruefung')}>Zur Konfiguration</button>
      </div>
    );
  }

  const frage = fragen[aktuell];
  const optionen = frage.gemischt?.liste || optionenListe(frage);
  const auswahl = antworten[frage.id] || [];

  function waehle(letter) {
    if (abgabe) return;
    let neu;
    if (frage.typ === 'SC') neu = letter;
    else if (frage.typ === 'MC') {
      const akt = auswahl.includes(letter) ? auswahl.filter((l) => l !== letter) : [...auswahl, letter];
      neu = akt;
    } else neu = antworten[frage.id] || '';
    setExamState({ antworten: { ...antworten, [frage.id]: neu } });
  }

  async function abgeben() {
    if (abgabe) return;
    setAbgabe(true);
    setFehler('');
    try {
      // Anzeige-Buchstaben (gemischt) zurück auf Original-Buchstaben abbilden
      const payload = fragen.map((f) => {
        const roh = antworten[f.id];
        let antwort = '';
        if (f.typ === 'FT') {
          antwort = (roh || '').trim();
        } else {
          const zuOriginal = f.gemischt?.anzeigeZuOriginal || {};
          const liste = Array.isArray(roh) ? roh : (roh ? [roh] : []);
          antwort = liste.map((l) => zuOriginal[l] || l).join(',');
        }
        return { id: f.id, antwort };
      });
      const ergebnis = await api.post('/pruefung/auswerten', { fragen: payload });
      setExamState({ ergebnis });
      navigate('/pruefung/ergebnis');
    } catch (e) {
      setFehler(e.message);
      setAbgabe(false);
    }
  }

  function moveQuestion(direction) {
    setAktuell(value => value + direction);
    requestAnimationFrame(() => questionHeading.current?.focus());
  }

  const beantwortet = fragen.filter((f) => (antworten[f.id]?.length ?? 0) > 0).length;
  const min = Math.floor(restSek / 60);
  const sek = restSek % 60;

  return (
    <div>
      {/* Timer bewusst dezent: normalerweise nur gedämpfter Text statt
          auffälligem Badge – wird erst unter 5 Minuten zum Warn-Badge, um
          nicht dauerhaft vom eigentlichen Lerninhalt abzulenken. */}
      <div className="flex-between wrap mb-2">
        <h1 className="mb-0" style={{ fontSize: '1.3rem' }}>Prüfung: {konfig?.fachrichtung}</h1>
        <div className="flex wrap" style={{ gap: 10, alignItems: 'center' }}>
          {restSek < 300 ? (
            <span className="badge badge-schwer" style={{ fontVariantNumeric: 'tabular-nums' }}>
              ⏱ {min}:{String(sek).padStart(2, '0')}
            </span>
          ) : (
            <span className="small text-muted" style={{ fontVariantNumeric: 'tabular-nums' }}>
              ⏱ {min}:{String(sek).padStart(2, '0')}
            </span>
          )}
          <span className="small text-muted">{beantwortet}/{fragen.length} beantwortet</span>
        </div>
      </div>

      <div className="progress mb-2">
        <div style={{ width: `${((aktuell + 1) / fragen.length) * 100}%` }} />
      </div>

      {fehler && <div className="alert alert-danger">{fehler}</div>}

      <div className="card">
        <div className="flex-between wrap mb-2">
          <span className="small text-muted">Frage {aktuell + 1} von {fragen.length}</span>
          <span className={`badge badge-${frage.schwierigkeit}`}>{frage.schwierigkeit}</span>
        </div>
        <h2 id="exam-question" tabIndex={-1} ref={questionHeading} style={{ fontSize: '1.15rem' }}>{frage.frage}</h2>

        {frage.typ === 'FT' ? (
          <div className="field">
            <label htmlFor="exam-answer">Deine Antwort</label>
            <textarea id="exam-answer" className="input" rows={3}
              disabled={abgabe}
              value={antworten[frage.id] || ''}
              onChange={event => setExamState({ antworten: { ...antworten, [frage.id]: event.target.value } })}
              placeholder="Antwort eingeben …"
            />
          </div>
        ) : (
          <div className="exam-options" role="group" aria-labelledby="exam-question" aria-describedby="exam-choice-hint">
            <p className="small text-muted" id="exam-choice-hint">{frage.typ === 'MC' ? 'Mehrere Antworten möglich.' : 'Wähle eine Antwort.'}</p>
            {optionen.map((o) => {
              const isSel = auswahl.includes(o.buchstabe);
              return (
                <button type="button" key={o.buchstabe} className={`option-row ${isSel ? 'selected' : ''}`}
                  aria-pressed={isSel} disabled={abgabe} onClick={() => waehle(o.buchstabe)}>
                  <span className="option-letter">{buchstabeZuZiffer(o.buchstabe)}</span>
                  <span>{o.text}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex-between mt-2 wrap">
          <button className="btn btn-ghost" disabled={abgabe || aktuell === 0} onClick={() => moveQuestion(-1)}>← Zurück</button>
          {aktuell + 1 < fragen.length ? (
            <button className="btn btn-primary" disabled={abgabe} onClick={() => moveQuestion(1)}>Weiter →</button>
          ) : (
            <button className="btn btn-success" onClick={abgeben} disabled={abgabe}>Prüfung abgeben ✓</button>
          )}
        </div>
      </div>

      <button className="btn btn-danger btn-sm" onClick={abgeben} disabled={abgabe}>Vorzeitig abgeben</button>
    </div>
  );
}
