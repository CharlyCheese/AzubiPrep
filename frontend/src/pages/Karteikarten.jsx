import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../utils/useApi.js';
import { api } from '../api/client.js';
import { flashcardStore, profileStore } from '../store/localStore.js';
import { optionenListe } from '../utils/fragen.js';
import { korrekteAntwortText } from '../utils/antworten.js';

export default function Karteikarten() {
  const profil = profileStore.get();
  const fr = profil.fachrichtung || 'FIAE';
  const { daten: fragen, laden } = useApi(() => api.get(`/fragen?fachrichtung=${fr}`), [fr]);

  const [faellige, setFaellige] = useState([]);
  const [index, setIndex] = useState(0);
  const [umgedreht, setUmgedreht] = useState(false);
  const [zusammenfassung, setZusammenfassung] = useState({ leicht: 0, mittel: 0, schwer: 0, gesamt: 0 });

  // Karten aktualisieren, sobald Fragen geladen sind
  useEffect(() => {
    if (!fragen) return;
    const alleKarten = flashcardStore.alle(false); // alle bekannten Karten
    const bekannteIds = new Set(alleKarten.map((k) => k.frageId));
    const frageIds = new Set(fragen.map((f) => f.id));

    // Neu im Lernbestand → direkt ins fällige Deck aufnehmen
    const neueKarten = fragen
      .filter((f) => !bekannteIds.has(f.id))
      .map((f) => ({ frageId: f.id, box: 1, wiederholungen: 0 }));

    const jetzt = new Date().toISOString();
    const faellige = alleKarten
      .filter((k) => frageIds.has(k.frageId))
      .filter((k) => !k.faelligAm || k.faelligAm <= jetzt);

    const deck = [...neueKarten, ...faellige].sort((a, b) => a.box - b.box);
    setFaellige(deck);
    setIndex(0);
    setUmgedreht(false);
    const stats = { leicht: 0, mittel: 0, schwer: 0, gesamt: deck.length };
    deck.forEach((k) => {
      const frage = fragen.find((f) => f.id === k.frageId);
      if (frage) stats[frage.schwierigkeit] = (stats[frage.schwierigkeit] || 0) + 1;
    });
    setZusammenfassung(stats);
  }, [fragen]);

  if (laden) return <div className="loading"><div className="spinner" />Lade Karteikarten …</div>;

  const karte = faellige[index];
  if (!karte) {
    return (
      <div>
        <h1 className="mb-0">Karteikarten</h1>
        <p className="text-muted mt-0">Lerne mit Spaced Repetition – Karten kommen automatisch zum idealen Zeitpunkt zurück.</p>
        <div className="card">
          <div className="empty">Keine Karten fällig 🎉 – neue Fragen erscheinen nach dem ersten Quiz automatisch im Deck.</div>
          <div className="flex wrap" style={{ justifyContent: 'center' }}>
            <Link className="btn btn-primary" to="/lernen">Zum Lernbereich</Link>
          </div>
        </div>
      </div>
    );
  }

  const frage = fragen.find((f) => f.id === karte.frageId);
  if (!frage) return <div className="empty">Frage nicht gefunden.</div>;
  const optionen = optionenListe(frage);

  function bewerten(bewertung) {
    flashcardStore.review(frage.id, bewertung);
    setFaellige((deck) => {
      const neuesDeck = deck.filter((_, i) => i !== index);
      // Index anpassen, falls die letzte Karte entfernt wurde
      if (index >= neuesDeck.length) setIndex(Math.max(0, neuesDeck.length - 1));
      return neuesDeck;
    });
    setUmgedreht(false);
  }

  return (
    <div>
      <header className="main-header">
        <div>
          <h1 className="mb-0">Karteikarten</h1>
          <p className="text-muted mt-0">Deck ({faellige.length} Karten) · {fr}</p>
        </div>
      </header>

      <div className="flex wrap mb-2">
        <div className="badge badge-neutral">Leicht: {zusammenfassung.leicht}</div>
        <div className="badge badge-neutral">Mittel: {zusammenfassung.mittel}</div>
        <div className="badge badge-neutral">Schwer: {zusammenfassung.schwer}</div>
      </div>

      <div className={`flashcard ${umgedreht ? 'flipped' : ''}`} onClick={() => setUmgedreht((u) => !u)}>
        <div className="flashcard-inner">
          <div className="flashcard-face">
            <span className="small text-muted mb-2">Frage · Box {karte.box} · {frage.schwierigkeit}</span>
            <h3>{frage.frage}</h3>
            {optionen.length > 0 && (
              <div className="mt-2">
                {optionen.map((o) => (
                  <div key={o.buchstabe} className="small">{o.buchstabe}) {o.text}</div>
                ))}
              </div>
            )}
            {!umgedreht && <p className="text-muted small mt-2">👆 Karte antippen für die Lösung</p>}
          </div>
          <div className="flashcard-face flashcard-back">
            <span className="small text-muted mb-2">Lösung</span>
            <div className="alert alert-success mb-2"><strong>{korrekteAntwortText(frage)}</strong></div>
            {frage.erklaerung && <p className="small">{frage.erklaerung}</p>}
          </div>
        </div>
      </div>

      {umgedreht && (
        <div className="flex wrap mt-2" style={{ justifyContent: 'center' }}>
          <button className="btn btn-danger" onClick={() => bewerten('schwer')}>Nochmal üben</button>
          <button className="btn btn-ghost" onClick={() => bewerten('mittel')}>Ok</button>
          <button className="btn btn-success" onClick={() => bewerten('leicht')}>Leicht / Gewusst</button>
        </div>
      )}
    </div>
  );
}
