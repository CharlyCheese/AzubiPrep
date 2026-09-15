import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../utils/useApi.js';
import { api } from '../api/client.js';
import { flashcardStore, profileStore, kartenOptionenStore } from '../store/localStore.js';
import { optionenListe, BUCHSTABEN, buchstabeZuZiffer } from '../utils/fragen.js';
import { mischeOptionen } from '../utils/optionen.js';
import { korrekteAntwortText } from '../utils/antworten.js';
import { useQuizKeyboard } from '../utils/useQuizKeyboard.js';
import SkeletonCard from '../components/SkeletonCard.jsx';

const STAPEL_PRESETS = [10, 25, 50];

export default function Karteikarten() {
  const profil = profileStore.get();
  const fr = profil.fachrichtung || 'FIAE';
  const { daten: fragen, laden } = useApi(() => api.get(`/fragen?fachrichtung=${fr}`), [fr]);

  // Alle aktuell fälligen Karten (unabhängig von der gewählten Stapelgröße)
  // und der tatsächlich bearbeitete Stapel dieser Sitzung.
  const [alleFaelligen, setAlleFaelligen] = useState([]);
  const [faellige, setFaellige] = useState([]);
  const [index, setIndex] = useState(0);
  const [umgedreht, setUmgedreht] = useState(false);
  const [zusammenfassung, setZusammenfassung] = useState({ leicht: 0, mittel: 0, schwer: 0, gesamt: 0 });

  // Stapelgröße: 0 = alle fälligen Karten, sonst feste Anzahl (z. B. 10/25/50).
  const [anzahl, setAnzahlState] = useState(() => kartenOptionenStore.get().anzahl || 0);
  function stapelgroesseWaehlen(n) {
    const wert = Math.max(0, Number(n) || 0);
    setAnzahlState(wert);
    kartenOptionenStore.set({ anzahl: wert });
  }

  // Gemischte Optionen + eigene Auswahl der aktuell gezeigten Karte
  // (wie im Quizmodus: pro Karte einmalig gemischt, bei Kartenwechsel neu).
  const [gemischt, setGemischt] = useState(null);
  const [auswahl, setAuswahl] = useState([]);

  // Session-Metriken (nur diese Sitzung, nicht persistiert): Startzeit,
  // Anzahl geübter Karten je Bewertung und ein „Tick" zum Auffrischen der
  // Lernzeit-Anzeige auch ohne weitere Interaktion.
  const [sessionStart] = useState(() => Date.now());
  const [jetzt, setJetzt] = useState(() => Date.now());
  const [bewertungen, setBewertungen] = useState({ leicht: 0, mittel: 0, schwer: 0 });
  useEffect(() => {
    const id = setInterval(() => setJetzt(Date.now()), 15000);
    return () => clearInterval(id);
  }, []);
  const sessionMinuten = Math.floor((jetzt - sessionStart) / 60000);
  const sessionSekunden = Math.floor(((jetzt - sessionStart) % 60000) / 1000);
  const sessionGeuebt = bewertungen.leicht + bewertungen.mittel + bewertungen.schwer;
  const sessionErfolgsquote = sessionGeuebt > 0
    ? Math.round(((bewertungen.leicht + bewertungen.mittel) / sessionGeuebt) * 100)
    : null;

  // Box-Verteilung der aktuell fälligen Karten (Leitner-Boxen 1–5) – zeigt,
  // wie weit die Karten im Wiederholungssystem bereits fortgeschritten sind.
  const boxVerteilung = [1, 2, 3, 4, 5].map((b) => ({
    box: b,
    anzahl: alleFaelligen.filter((k) => k.box === b).length,
  }));

  // Alle fälligen Karten ermitteln, sobald Fragen geladen sind.
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
    const faelligeAlle = alleKarten
      .filter((k) => frageIds.has(k.frageId))
      .filter((k) => !k.faelligAm || k.faelligAm <= jetzt);

    const deck = [...neueKarten, ...faelligeAlle].sort((a, b) => a.box - b.box);
    setAlleFaelligen(deck);
  }, [fragen]);

  // Session-Stapel aus den fälligen Karten schneiden, sobald sich die
  // fälligen Karten oder die gewählte Stapelgröße ändern. Die restlichen
  // fälligen Karten bleiben unangetastet und erscheinen beim nächsten Mal.
  useEffect(() => {
    const stapel = anzahl > 0 ? alleFaelligen.slice(0, anzahl) : alleFaelligen;
    setFaellige(stapel);
    setIndex(0);
    setUmgedreht(false);
    const stats = { leicht: 0, mittel: 0, schwer: 0, gesamt: stapel.length };
    stapel.forEach((k) => {
      const frage = fragen?.find((f) => f.id === k.frageId);
      if (frage) stats[frage.schwierigkeit] = (stats[frage.schwierigkeit] || 0) + 1;
    });
    setZusammenfassung(stats);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alleFaelligen, anzahl]);

  const karte = faellige[index];
  const frage = fragen && karte ? fragen.find((f) => f.id === karte.frageId) : null;

  // Optionen neu mischen und Auswahl zuruecksetzen, sobald eine neue Karte
  // angezeigt wird (Kartenwechsel = anderer frageId).
  useEffect(() => {
    if (!frage) { setGemischt(null); setAuswahl([]); return; }
    setGemischt(mischeOptionen(frage));
    setAuswahl([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frage?.id]);

  // Tastatur-Shortcuts: 1–6 (oder A–F) wählen eine Antwortoption (dreht die
  // Karte dabei automatisch um, wie beim Anklicken), Enter dreht die Karte um.
  // toggleAuswahl/bewerten sind weiter unten als function-Deklarationen
  // definiert und dank Hoisting hier bereits nutzbar.
  useQuizKeyboard({
    optionen: BUCHSTABEN.slice(0, frage?.optionen?.length || 4),
    onSelectOption: (buchstabe) => toggleAuswahl(buchstabe, { stopPropagation() {} }),
    onSubmitOrNext: () => { if (!umgedreht) setUmgedreht(true); },
    istEingabeAktiv: false,
    aktiv: !laden && !!frage,
  });

  if (laden) return <SkeletonCard lines={4} />;

  const stapelAuswahl = (
    <div className="card mb-2">
      <div className="flex-between wrap" style={{ alignItems: 'flex-start', rowGap: 10 }}>
        <div style={{ flex: '1 1 240px', minWidth: 240 }}>
          <h2 className="mb-0" style={{ fontSize: '1.05rem' }}>Stapelgröße</h2>
          <p className="small text-muted mt-0 mb-0">
            {alleFaelligen.length} Karte(n) insgesamt fällig – wie viele davon jetzt bearbeiten?
          </p>
        </div>
        <div className="flex wrap" style={{ gap: 6, flexShrink: 0 }}>
          {STAPEL_PRESETS.map((n) => (
            <button
              key={n}
              className={`btn btn-sm ${anzahl === n ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => stapelgroesseWaehlen(n)}
            >
              {n}
            </button>
          ))}
          <button
            className={`btn btn-sm ${anzahl === 0 ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => stapelgroesseWaehlen(0)}
          >
            Alle
          </button>
          <input
            type="number"
            min={1}
            className="input"
            style={{ width: 90 }}
            placeholder="Andere…"
            value={anzahl > 0 && !STAPEL_PRESETS.includes(anzahl) ? anzahl : ''}
            onChange={(e) => stapelgroesseWaehlen(e.target.value)}
            title="Eigene Anzahl eingeben"
          />
        </div>
      </div>
    </div>
  );

  if (!karte) {
    return (
      <div>
        <h1 className="mb-0">Karteikarten</h1>
        <p className="text-muted mt-0">Lerne mit Spaced Repetition – Karten kommen automatisch zum idealen Zeitpunkt zurück.</p>
        {alleFaelligen.length > 0 && stapelAuswahl}
        <div className="card">
          <div className="empty">
            {alleFaelligen.length > 0
              ? 'Stapel für diese Sitzung erledigt 🎉 – die restlichen fälligen Karten warten beim nächsten Besuch.'
              : 'Keine Karten fällig 🎉 – neue Fragen erscheinen nach dem ersten Quiz automatisch im Deck.'}
          </div>
          <div className="flex wrap" style={{ justifyContent: 'center' }}>
            <Link className="btn btn-primary" to="/lernen">Zum Lernbereich</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!frage) return <div className="empty">Frage nicht gefunden.</div>;
  const optionenOriginal = optionenListe(frage);
  const optionenAnzeige = gemischt?.liste || optionenOriginal;

  const korrektBuchstaben = frage.typ !== 'FT'
    ? (frage.antwort || '').toUpperCase().split(',').map((s) => s.trim()).filter(Boolean)
    : [];
  // Auswahl (Anzeige-Buchstaben) auf Original-Buchstaben zurückrechnen,
  // damit der Abgleich mit der Musterlösung unabhängig von der Mischung ist.
  const zuOriginal = gemischt?.anzeigeZuOriginal || {};
  const auswahlOriginal = auswahl.map((l) => zuOriginal[l] || l);
  const richtigBeantwortet = auswahlOriginal.length > 0
    && auswahlOriginal.length === korrektBuchstaben.length
    && korrektBuchstaben.every((b) => auswahlOriginal.includes(b));

  /** Lesbarer Text zu einer Menge von (Original-)Buchstaben, z. B. "2) Text". */
  function buchstabenText(buchstaben) {
    const optionen = frage.optionen || [];
    return buchstaben
      .map((b) => {
        const idx = BUCHSTABEN.indexOf(b);
        const text = optionen[idx] || '';
        return text ? `${buchstabeZuZiffer(b)}) ${text}` : buchstabeZuZiffer(b);
      })
      .join('   ');
  }

  function toggleAuswahl(buchstabe, e) {
    e.stopPropagation(); // Auswahl darf die Karte nicht umdrehen
    // Eine Antwort anklicken dreht die Karte direkt zur Lösung – bei
    // Multiple-Choice-Fragen lässt sich die Auswahl danach noch anpassen.
    if (frage.typ === 'SC') {
      setAuswahl([buchstabe]);
    } else {
      setAuswahl((prev) => (prev.includes(buchstabe) ? prev.filter((l) => l !== buchstabe) : [...prev, buchstabe]));
    }
    setUmgedreht(true);
  }

  function bewerten(bewertung) {
    flashcardStore.review(frage.id, bewertung);
    setBewertungen((b) => ({ ...b, [bewertung]: b[bewertung] + 1 }));
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
          <p className="text-muted mt-0">
            Stapel ({faellige.length} von {alleFaelligen.length} fälligen Karten) · {fr}
          </p>
        </div>
      </header>

      <div className="dashboard-layout">
        {/* Hauptspalte: fokussierte Lernkarte */}
        <div>
          {stapelAuswahl}

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
                {optionenAnzeige.length > 0 && (
                  <div className="mt-2">
                    {optionenAnzeige.map((o) => (
                      <div
                        key={o.buchstabe}
                        className={`option-row ${auswahl.includes(o.buchstabe) ? 'selected' : ''}`}
                        role="button"
                        tabIndex={0}
                        onClick={(e) => toggleAuswahl(o.buchstabe, e)}
                        onKeyDown={(e) => { if (e.key === 'Enter') toggleAuswahl(o.buchstabe, e); }}
                      >
                        <span className="option-letter">{buchstabeZuZiffer(o.buchstabe)}</span>
                        <span>{o.text}</span>
                      </div>
                    ))}
                  </div>
                )}
                {!umgedreht && (
                  <p className="text-muted small mt-2">
                    {optionenAnzeige.length > 0 ? '👆 Antwort auswählen oder Karte antippen für die Lösung' : '👆 Karte antippen für die Lösung'}
                  </p>
                )}
              </div>
              <div className="flashcard-face flashcard-back">
                <span className="small text-muted mb-2">Lösung</span>
                {optionenAnzeige.length > 0 ? (
                  <div className="mb-2">
                    <div className="alert alert-success mb-2"><strong>Richtige Antwort: {buchstabenText(korrektBuchstaben)}</strong></div>
                    {auswahlOriginal.length > 0 && !richtigBeantwortet && (
                      <div className="alert alert-danger mb-0">Deine Antwort: {buchstabenText(auswahlOriginal)}</div>
                    )}
                  </div>
                ) : (
                  <div className="alert alert-success mb-2"><strong>{korrekteAntwortText(frage)}</strong></div>
                )}
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

        {/* Nebenspalte: Session-Metriken + Box-Verteilung */}
        <aside>
          <div className="card mb-2">
            <h2 className="mb-0" style={{ fontSize: '1.05rem' }}>Session-Metriken</h2>
            <div className="grid-kpi mt-2">
              <div>
                <div className="small text-muted">Lernzeit</div>
                <div className="stat-value" style={{ fontSize: '1.4rem' }}>
                  {sessionMinuten}:{String(sessionSekunden).padStart(2, '0')}
                </div>
                <div className="small text-muted">min diese Sitzung</div>
              </div>
              <div>
                <div className="small text-muted">Erfolgsquote</div>
                <div className="stat-value" style={{ fontSize: '1.4rem', color: 'var(--primary)' }}>
                  {sessionErfolgsquote === null ? '–' : `${sessionErfolgsquote}%`}
                </div>
                <div className="small text-muted">{sessionGeuebt} Karte(n) geübt</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="mb-0" style={{ fontSize: '1.05rem' }}>Kartenverteilung</h2>
            <p className="small text-muted mt-0 mb-2">
              Fällige Karten nach Leitner-Box · {alleFaelligen.length} gesamt
            </p>
            {boxVerteilung.map(({ box, anzahl: n }) => (
              <div key={box} style={{ marginBottom: 8 }}>
                <div className="progress-label"><span>Box {box}</span><span>{n}</span></div>
                <div className="progress">
                  <div style={{ width: `${alleFaelligen.length ? Math.round((n / alleFaelligen.length) * 100) : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
