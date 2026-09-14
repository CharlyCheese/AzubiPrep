import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExamStore, setExamState } from '../store/examStore.js';
import { api } from '../api/client.js';
import { optionenListe } from '../utils/fragen.js';

export default function PruefungLauf() {
  const navigate = useNavigate();
  const store = useExamStore();
  const { fragen, antworten, konfig } = store;

  const [aktuell, setAktuell] = useState(0);
  const [freitext, setFreitext] = useState('');
  const [abgabe, setAbgabe] = useState(false);

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
    try {
      // Freitext der aktuellen Frage übernehmen
      const antwortenFinal = { ...antworten };
      if (frage.typ === 'FT' && freitext.trim()) antwortenFinal[frage.id] = freitext.trim();
      // Anzeige-Buchstaben (gemischt) zurück auf Original-Buchstaben abbilden
      const payload = fragen.map((f) => {
        const roh = antwortenFinal[f.id];
        let antwort = '';
        if (f.typ === 'FT') {
          antwort = roh || '';
        } else {
          const zuOriginal = f.gemischt?.anzeigeZuOriginal || {};
          const liste = Array.isArray(roh) ? roh : (roh ? [roh] : []);
          antwort = liste.map((l) => zuOriginal[l] || l).join(',');
        }
        return { id: f.id, antwort };
      });
      const ergebnis = await api.post('/pruefung/auswerten', { fragen: payload });
      setExamState({ ergebnis, antworten: antwortenFinal });
      navigate('/pruefung/ergebnis');
    } catch (e) {
      alert(e.message);
      setAbgabe(false);
    }
  }

  function freitextMerken(text) {
    setFreitext(text);
    setExamState({ antworten: { ...antworten, [frage.id]: text } });
  }

  const beantwortet = fragen.filter((f) => (antworten[f.id]?.length ?? 0) > 0).length;
  const min = Math.floor(restSek / 60);
  const sek = restSek % 60;

  return (
    <div>
      <div className="flex-between wrap mb-2">
        <h1 className="mb-0" style={{ fontSize: '1.3rem' }}>Prüfung: {konfig?.fachrichtung}</h1>
        <div className={`badge ${restSek < 300 ? 'badge-schwer' : 'badge-neutral'}`}>
          ⏱ {min}:{String(sek).padStart(2, '0')} · {beantwortet}/{fragen.length} beantwortet
        </div>
      </div>

      <div className="progress mb-2">
        <div style={{ width: `${((aktuell + 1) / fragen.length) * 100}%` }} />
      </div>

      <div className="card">
        <div className="flex-between wrap mb-2">
          <span className="small text-muted">Frage {aktuell + 1} von {fragen.length}</span>
          <span className={`badge badge-${frage.schwierigkeit}`}>{frage.schwierigkeit}</span>
        </div>
        <h2 style={{ fontSize: '1.15rem' }}>{frage.frage}</h2>

        {frage.typ === 'FT' ? (
          <textarea
            className="input"
            rows={3}
            value={antworten[frage.id] || ''}
            onChange={(e) => freitextMerken(e.target.value)}
            placeholder="Antwort eingeben …"
          />
        ) : (
          <div>
            {optionen.map((o) => {
              const isSel = auswahl.includes(o.buchstabe);
              return (
                <div key={o.buchstabe} className={`option-row ${isSel ? 'selected' : ''}`} onClick={() => waehle(o.buchstabe)}>
                  <span className="option-letter">{o.buchstabe}</span>
                  <span>{o.text}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex-between mt-2 wrap">
          <button className="btn btn-ghost" disabled={aktuell === 0} onClick={() => setAktuell((a) => a - 1)}>← Zurück</button>
          {aktuell + 1 < fragen.length ? (
            <button className="btn btn-primary" onClick={() => setAktuell((a) => a + 1)}>Weiter →</button>
          ) : (
            <button className="btn btn-success" onClick={abgeben} disabled={abgabe}>Prüfung abgeben ✓</button>
          )}
        </div>
      </div>

      <button className="btn btn-danger btn-sm" onClick={abgeben} disabled={abgabe}>Vorzeitig abgeben</button>
    </div>
  );
}
