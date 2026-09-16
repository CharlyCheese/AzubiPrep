import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useApi } from '../utils/useApi.js';
import { api } from '../api/client.js';
import FrageKarte from '../components/FrageKarte.jsx';
import FrageMelden from '../components/FrageMelden.jsx';
import SkeletonCard from '../components/SkeletonCard.jsx';
import XpGainIndicator from '../components/XpGainIndicator.jsx';
import { useQuizKeyboard } from '../utils/useQuizKeyboard.js';
import { optionenListe, BUCHSTABEN, buchstabeZuZiffer } from '../utils/fragen.js';
import { mischeOptionen } from '../utils/optionen.js';
import { progressStore, activityStore, quizOptionenStore, todayKey } from '../store/localStore.js';
import { gamificationStore } from '../store/gamificationStore.js';
import { XP_REGELN } from '../utils/gamification.js';
import { ANZAHL_OPTIONEN, anzahlAuswahl, filtereNachSchwierigkeit, begrenzeAnzahl, quizUmfang, umfangLabel } from '../utils/quizOptionen.js';
import { meldeBelohnung } from '../utils/belohnung.js';
import { pruefeTagesziel } from '../utils/ziele.js';
import { aktualisiereModulStatus, meldeModulStatus } from '../utils/modulStatus.js';
import { meldeMissionen } from '../utils/missionen.js';

export default function Quiz() {
  const { modulId } = useParams();
  const [searchParams] = useSearchParams();
  const frageParam = searchParams.get('frage');
  const { daten: modul } = useApi(() => api.get(`/module/${modulId}`), [modulId]);
  const { daten: fragenRaw, laden } = useApi(() => api.get(`/fragen?modulId=${modulId}`), [modulId]);

  const optionenStand = quizOptionenStore.get();
  const [schwierigkeit, setSchwierigkeit] = useState(optionenStand.schwierigkeit || 'alle');
  const [anzahl, setAnzahl] = useState(() => {
    const ausUrl = Number(searchParams.get('anzahl') || 0);
    return ausUrl > 0 ? ausUrl : Number(optionenStand.anzahl) || 0;
  });
  const [reihenfolge, setReihenfolge] = useState([]);
  const [position, setPosition] = useState(0);
  const [auswahl, setAuswahl] = useState([]);
  const [freitext, setFreitext] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [richtig, setRichtig] = useState(0);
  const [verlauf, setVerlauf] = useState([]);
  const [nurFehler, setNurFehler] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);
  const [pruefFehler, setPruefFehler] = useState('');
  const [xpKey, setXpKey] = useState(0);
  const [xpBetrag, setXpBetrag] = useState(15);

  const umfang = quizUmfang(fragenRaw || [], { schwierigkeit, anzahl });
  const bestand = fragenRaw?.length || 0;
  const anzahlAnzeige = bestand && anzahl > bestand ? 0 : anzahl;
  const anzahlListe = anzahlAuswahl(bestand);

  function aendereOptionen(patch) {
    const neu = { ...patch };
    if (neu.anzahl !== undefined) {
      const gewaehlt = Number(neu.anzahl) || 0;
      neu.anzahl = bestand ? Math.min(gewaehlt, bestand) : gewaehlt;
    }
    if (patch.schwierigkeit !== undefined) setSchwierigkeit(patch.schwierigkeit);
    if (neu.anzahl !== undefined) setAnzahl(neu.anzahl);
    quizOptionenStore.set(neu);
  }

  function starteQuiz() {
    if (!fragenRaw?.length) return;
    const pool = filtereNachSchwierigkeit(fragenRaw, schwierigkeit);
    const gemischt = [...pool].sort(() => Math.random() - 0.5);
    if (frageParam) {
      const idx = gemischt.findIndex((f) => f.id === frageParam);
      if (idx > 0) {
        const [f] = gemischt.splice(idx, 1);
        gemischt.unshift(f);
      }
    }
    setReihenfolge(begrenzeAnzahl(gemischt, anzahl).map((f) => ({ ...f, gemischt: mischeOptionen(f) })));
    setPosition(0);
    setRichtig(0);
    setVerlauf([]);
    setNurFehler(false);
    setSessionKey(Date.now());
    setFeedback(null);
    setAuswahl([]);
    setFreitext('');
  }

  useEffect(() => {
    starteQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fragenRaw, schwierigkeit, anzahl, frageParam]);

  const frageAktuell = reihenfolge[position];
  const zeigeFrageAnsicht = !laden && position < reihenfolge.length && !!frageAktuell;

  // --- WICHTIG: Keyboard-Shortcuts bleiben voll erhalten ---
  useQuizKeyboard({
    optionen: BUCHSTABEN.slice(0, frageAktuell?.optionen?.length || 4),
    onSelectOption: (buchstabe) => toggle(buchstabe),
    onSubmitOrNext: () => {
      if (feedback) { weiter(); return; }
      const kannPruefen = frageAktuell?.typ === 'FT' ? freitext.trim().length > 0 : auswahl.length > 0;
      if (kannPruefen) pruefen();
    },
    istEingabeAktiv: frageAktuell?.typ === 'FT',
    aktiv: zeigeFrageAnsicht,
  });

  if (laden) return <SkeletonCard lines={4} />;
  if (!fragenRaw?.length) return <div className="empty">Keine Fragen für dieses Modul verfügbar.</div>;

  if (reihenfolge.length === 0) {
    const gibtEsMitFilter = fragenRaw.some((f) => schwierigkeit === 'alle' || f.schwierigkeit === schwierigkeit);
    if (gibtEsMitFilter) {
      return <div className="loading"><div className="spinner" />Bereite Fragen vor …</div>;
    }
    return (
      <div>
        <header className="main-header">
          <div>
            <Link to={`/lernen/${modulId}`} className="small">← Modul</Link>
            <h1 className="mb-0 mt-2">Quizmodus</h1>
          </div>
        </header>
        <div className="card">
          <div className="empty">
            Keine Fragen mit der Schwierigkeit „{schwierigkeit}" in diesem Modul.
            <div className="mt-2">
              <button className="btn btn-primary" onClick={() => aendereOptionen({ schwierigkeit: 'alle' })}>Alle Schwierigkeiten anzeigen</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const frage = reihenfolge[position];
  const optionen = optionenListe(frage);

  function toggle(letter) {
    if (feedback) return;
    if (frage.typ === 'SC') {
      setAuswahl([letter]);
    } else {
      setAuswahl((prev) => (prev.includes(letter) ? prev.filter((l) => l !== letter) : [...prev, letter]));
    }
  }

  async function pruefen() {
    let antwort;
    if (frage.typ === 'FT') {
      antwort = freitext.trim();
    } else {
      const zuOriginal = frage.gemischt?.anzeigeZuOriginal || {};
      antwort = auswahl.map((l) => zuOriginal[l] || l).sort().join(',');
    }
    if (!antwort) return;

    setPruefFehler('');
    try {
      const erg = await api.post(`/fragen/${frage.id}/pruefen`, { antwort });
      setFeedback(erg);
      progressStore.record(frage.id, erg.richtig, frage.modul_id);
      if (erg.richtig) {
        const entry = progressStore.get()[frage.id];
        const firstCorrect = entry && entry.richtig === 1;
        if (firstCorrect) {
          let xp = XP_REGELN.frageRichtig;
          if (frage.schwierigkeit === 'schwer') xp += XP_REGELN.frageSchwer;
          if ((entry.falsch || 0) > 0) xp += XP_REGELN.fehlerSpaeterRichtig;
          meldeBelohnung(gamificationStore.addXp(`frage:${frage.id}`, xp));
          setXpBetrag(xp);
          setXpKey(Date.now());
        }
        if (position + 1 >= reihenfolge.length) {
          meldeBelohnung(
            gamificationStore.addXp(`quiz:${sessionKey}`, XP_REGELN.quizAbgeschlossen),
            'Quiz abgeschlossen',
          );
        }
      }
      activityStore.add(todayKey());
      pruefeTagesziel();
      meldeModulStatus(
        aktualisiereModulStatus(
          progressStore.get(),
          (id) => (id === modul?.modul_id ? modul.titel : id),
          (id) => (id === modul?.modul_id ? modul.fragenAnzahl || 0 : 0),
        ),
      );
      meldeMissionen(gamificationStore.merkeMission('frage'));
      if (erg.richtig) meldeMissionen(gamificationStore.merkeMission('richtig'));
      if (position + 1 >= reihenfolge.length) meldeMissionen(gamificationStore.merkeMission('quiz'));
      if (erg.richtig) setRichtig((r) => r + 1);
      setVerlauf((v) => [
        ...v,
        { frage, richtig: erg.richtig, nutzerAntwort: antwort, erwartet: erg.erwartet, erklaerung: erg.erklaerung },
      ]);
    } catch (e) {
      setPruefFehler(e.message);
    }
  }

  function weiter() {
    setAuswahl([]);
    setFreitext('');
    setFeedback(null);
    setPosition((p) => p + 1);
  }

  const originalZuAnzeigeMap = {};
  (frage?.gemischt?.liste || []).forEach((o) => { originalZuAnzeigeMap[o.original] = o.buchstabe; });
  const erwartetAnzeige = feedback
    ? feedback.erwartet
        .split(',')
        .map((s) => buchstabeZuZiffer(originalZuAnzeigeMap[s.trim().toUpperCase()] || s.trim()))
        .join(', ')
    : '';

  const prozent = reihenfolge.length ? Math.round((richtig / reihenfolge.length) * 100) : 0;
  const falschAnzahl = Math.max(0, reihenfolge.length - richtig);
  const anzeigeVerlauf = nurFehler ? verlauf.filter((e) => !e.richtig) : verlauf;

  return (
    <div>
      <header className="main-header">
        <div>
          <div className="flex wrap" style={{ gap: 6, alignItems: 'center' }}>
            <Link to={`/lernen/${modulId}`} className="small">← Modul</Link>
            <span className="small text-muted">{modul?.titel || modulId}</span>
          </div>
          <h1 className="mb-0 mt-1">Quizmodus</h1>
        </div>
      </header>

      {pruefFehler && <div className="alert alert-danger mb-2">{pruefFehler}</div>}

      {position < reihenfolge.length ? (
        /* --- AKTIVES QUIZ: 2-SPALTIGES FOKUS-LAYOUT --- */
        <div className="dashboard-layout">
          {/* Hauptspalte: Fokussierte Frage & Antwortoptionen */}
          <div>
            <div className="card card-appear" style={{ position: 'relative' }} key={frage.id}>
              <XpGainIndicator xp={xpBetrag} triggerKey={xpKey} />
              <div className="flex-between wrap mb-2">
                <span className={`badge badge-${frage.schwierigkeit}`}>{frage.schwierigkeit}</span>
                <span className="small text-muted">{frage.thema}</span>
              </div>
              <h2 style={{ fontSize: '1.25rem', lineHeight: 1.4 }}>{frage.frage}</h2>

              {frage.typ === 'FT' ? (
                <textarea
                  className="input mt-2"
                  rows={4}
                  value={freitext}
                  disabled={!!feedback}
                  onChange={(e) => setFreitext(e.target.value)}
                  placeholder="Antwort eingeben …"
                />
              ) : (
                <div className="mt-2">
                  <FrageKarte frage={frage} auswahl={auswahl} onToggle={toggle} optionen={frage.gemischt?.liste} />
                </div>
              )}

              {!feedback && (
                <button
                  className="btn btn-primary mt-3"
                  onClick={pruefen}
                  disabled={frage.typ === 'FT' ? !freitext.trim() : auswahl.length === 0}
                >
                  Antwort prüfen [Enter]
                </button>
              )}

              {feedback && (
                <div className={`alert ${feedback.richtig ? 'alert-success' : 'alert-danger'} mt-3`}>
                  <strong>{feedback.richtig ? '✓ Richtig!' : '✗ Leider falsch.'}</strong>
                  {!feedback.richtig && feedback.erwartet && (
                    <div className="small mt-1">Richtige Antwort: {erwartetAnzeige || feedback.erwartet}</div>
                  )}
                  {feedback.erklaerung && <div className="mt-2">{feedback.erklaerung}</div>}
                  <button className="btn btn-primary btn-sm mt-2" onClick={weiter}>
                    {position + 1 >= reihenfolge.length ? 'Quiz beenden' : 'Nächste Frage [Enter] →'}
                  </button>
                  <div>
                    <FrageMelden frageId={frage.id} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Nebenspalte: Session-Metriken & Quizfilter */}
          <aside>
            <div className="card mb-2">
              <h2 className="mb-0" style={{ fontSize: '1.05rem' }}>Session-Fortschritt</h2>
              <div className="progress-label mt-2">
                <span>Frage {position + 1} von {reihenfolge.length}</span>
                <span>{Math.round(((position + (feedback ? 1 : 0)) / reihenfolge.length) * 100)}%</span>
              </div>
              <div className="progress mb-2">
                <div style={{ width: `${((position + (feedback ? 1 : 0)) / reihenfolge.length) * 100}%` }} />
              </div>

              <div className="grid-kpi mt-2">
                <div className="card" style={{ padding: 12 }}>
                  <div className="small text-muted">Richtig</div>
                  <div className="stat-value" style={{ fontSize: '1.4rem', color: 'var(--success)' }}>{richtig}</div>
                </div>
                <div className="card" style={{ padding: 12 }}>
                  <div className="small text-muted">Fehler</div>
                  <div className="stat-value" style={{ fontSize: '1.4rem', color: 'var(--danger)' }}>
                    {verlauf.filter((v) => !v.richtig).length}
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="mb-0" style={{ fontSize: '1.05rem' }}>Einstellungen</h2>
              <div className="field mt-2">
                <label className="small text-muted">Schwierigkeit</label>
                <select
                  className="select"
                  value={schwierigkeit}
                  onChange={(e) => aendereOptionen({ schwierigkeit: e.target.value })}
                >
                  <option value="alle">Alle Schwierigkeiten</option>
                  <option value="leicht">Nur leicht</option>
                  <option value="mittel">Nur mittel</option>
                  <option value="schwer">Nur schwer</option>
                </select>
              </div>
              <div className="field mt-2">
                <label className="small text-muted">Fragenumfang</label>
                <select
                  className="select"
                  value={anzahlAnzeige}
                  onChange={(e) => aendereOptionen({ anzahl: Number(e.target.value) })}
                >
                  <option value={0}>Alle Fragen ({umfang.verfuegbar})</option>
                  {anzahlListe.map((n) => (
                    <option key={n} value={n}>{n} Fragen</option>
                  ))}
                </select>
              </div>
            </div>
          </aside>
        </div>
      ) : (
        /* --- QUIZ-ABSCHLUSS: ERGEBNIS-LAYOUT --- */
        <div className="dashboard-layout">
          {/* Hauptspalte: Fehlerauswertung & Detailkarten */}
          <div>
            <div className="card mb-2">
              <div className="flex-between wrap">
                <h2 className="mb-0">Detaillierte Auswertung</h2>
                <div className="flex wrap" style={{ gap: 8 }}>
                  <button className={`btn btn-sm ${nurFehler ? 'btn-ghost' : 'btn-primary'}`} onClick={() => setNurFehler(false)}>
                    Alle ({verlauf.length})
                  </button>
                  <button className={`btn btn-sm ${nurFehler ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setNurFehler(true)}>
                    Nur Fehler ({falschAnzahl})
                  </button>
                </div>
              </div>
            </div>

            {anzeigeVerlauf.length === 0 && (
              <div className="alert alert-success mb-2">Keine Fehler in diesem Durchlauf – stark! 🎯</div>
            )}

            {anzeigeVerlauf.map((e, i) => {
              const optionenE = optionenListe(e.frage);
              const korrektE = e.frage.typ !== 'FT' ? (e.frage.antwort || '').toUpperCase().split(',').map((s) => s.trim()) : [];
              const nutzerE = (e.nutzerAntwort || '').toUpperCase().split(',').map((s) => s.trim()).filter(Boolean);
              return (
                <div key={`${e.frage.id}-${i}`} className="card mb-2" style={{ padding: 16, borderLeft: `3px solid ${e.richtig ? 'var(--success)' : 'var(--danger)'}` }}>
                  <div className="flex-between wrap mb-1">
                    <span className={`badge ${e.richtig ? 'badge-leicht' : 'badge-schwer'}`}>{e.richtig ? '✓ richtig' : '✗ falsch'}</span>
                    <span className="small text-muted">{e.frage.thema}</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>{e.frage.frage}</div>

                  {e.frage.typ === 'FT' ? (
                    <div className="small mt-2">
                      <div><strong>Deine Antwort:</strong> {e.nutzerAntwort || '– (keine)'}</div>
                      <div><strong>Musterlösung:</strong> {e.erwartet}</div>
                    </div>
                  ) : (
                    <>
                      <div className="small mt-1">
                        <strong>Deine Antwort:</strong> {nutzerE.length ? nutzerE.map(buchstabeZuZiffer).join(', ') : '– (keine)'} · <strong>Richtig:</strong> {korrektE.map(buchstabeZuZiffer).join(', ')}
                      </div>
                      <div className="mt-2">
                        {optionenE.map((o) => {
                          const isKorrekt = korrektE.includes(o.buchstabe);
                          const isNutzer = nutzerE.includes(o.buchstabe);
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
                      </div>
                    </>
                  )}
                  {e.erklaerung && <div className="small text-muted mt-2">{e.erklaerung}</div>}
                </div>
              );
            })}
          </div>

          {/* Nebenspalte: Scorecard & Weiterlernen */}
          <aside>
            <div className="card mb-2">
              <h2 className="mb-0" style={{ fontSize: '1.1rem' }}>Lernergebnis 🎉</h2>
              <p className="text-muted mt-0 small">{modul?.titel || modulId} · {umfangLabel(umfang)}</p>

              <div className="stat-value mt-2" style={{ fontSize: '2.2rem', color: prozent >= 50 ? 'var(--success)' : 'var(--danger)' }}>
                {prozent}%
              </div>
              <div className="small text-muted mb-2">{richtig} von {reihenfolge.length} richtig beantwortet</div>
              <div className="progress mb-2"><div style={{ width: `${prozent}%`, background: prozent >= 50 ? 'var(--success)' : 'var(--danger)' }} /></div>

              <div className="grid-kpi mb-2">
                <div className="card" style={{ padding: 10 }}>
                  <div className="stat-label">Richtig</div>
                  <div className="stat-value" style={{ fontSize: '1.3rem', color: 'var(--success)' }}>{richtig}</div>
                </div>
                <div className="card" style={{ padding: 10 }}>
                  <div className="stat-label">Falsch</div>
                  <div className="stat-value" style={{ fontSize: '1.3rem', color: 'var(--danger)' }}>{falschAnzahl}</div>
                </div>
              </div>

              <button className="btn btn-primary btn-block" onClick={starteQuiz}>Quiz wiederholen</button>
              <Link className="btn btn-ghost btn-block mt-1" to="/karteikarten">Karteikarten trainieren</Link>
              <Link className="btn btn-ghost btn-block mt-1" to={`/lernen/${modulId}`}>Zurück zum Modul</Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
