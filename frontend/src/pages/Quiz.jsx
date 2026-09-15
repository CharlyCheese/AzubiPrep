import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useApi } from '../utils/useApi.js';
import { api } from '../api/client.js';
import FrageKarte from '../components/FrageKarte.jsx';
import { optionenListe } from '../utils/fragen.js';
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
  const [feedback, setFeedback] = useState(null); // { richtig, erwartet, erklaerung }
  const [richtig, setRichtig] = useState(0);
  const [verlauf, setVerlauf] = useState([]); // Ergebnisse aller beantworteten Fragen
  const [nurFehler, setNurFehler] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);
  const [pruefFehler, setPruefFehler] = useState('');

  // Umfang des Quizdurchlaufs: verfuegbare und tatsaechlich gestellte Fragen
  const umfang = quizUmfang(fragenRaw || [], { schwierigkeit, anzahl });
  const bestand = fragenRaw?.length || 0;
  // Auswahl bezieht sich auf den Modulbestand; groessere Werte werden als "Alle" gezeigt
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

  // Fragen filtern (Schwierigkeit) und mischen; Deep-Link-Frage nach vorne
  useEffect(() => {
    starteQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fragenRaw, schwierigkeit, anzahl, frageParam]);

  if (laden) return <div className="loading"><div className="spinner" />Lade Fragen …</div>;
  if (!fragenRaw?.length) return <div className="empty">Keine Fragen für dieses Modul verfügbar.</div>;

  // Keine (passenden) Fragen – z. B. Schwierigkeitsfilter ohne Treffer
  if (reihenfolge.length === 0) {
    const gibtEsMitFilter = fragenRaw.some((f) => schwierigkeit === 'alle' || f.schwierigkeit === schwierigkeit);
    if (gibtEsMitFilter) {
      // Der Effekt baut die Reihenfolge gleich auf – kurzer Zwischenzustand
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
      // Modul-Status (bearbeitet/beherrscht) aktualisieren und neue Stufen melden
      meldeModulStatus(
        aktualisiereModulStatus(
          progressStore.get(),
          (id) => (id === modul?.modul_id ? modul.titel : id),
          (id) => (id === modul?.modul_id ? modul.fragenAnzahl || 0 : 0),
        ),
      );
      // Missionen (Phase 4): Fragen, richtige Antworten und abgeschlossene Quizrunden
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

  const korrektBuchstaben = feedback
    ? (frage.typ === 'MC' ? feedback.erwartet.split(',').map((s) => s.trim().toUpperCase()) : [feedback.erwartet.toUpperCase()])
    : [];

  // Erwartete Antwort auf die gemischte Anzeige abbilden
  const originalZuAnzeigeMap = {};
  (frage?.gemischt?.liste || []).forEach((o) => { originalZuAnzeigeMap[o.original] = o.buchstabe; });
  const erwartetAnzeige = feedback
    ? feedback.erwartet.split(',').map((s) => originalZuAnzeigeMap[s.trim().toUpperCase()] || s.trim()).join(', ')
    : '';

  const prozent = reihenfolge.length ? Math.round((richtig / reihenfolge.length) * 100) : 0;
  const falschAnzahl = Math.max(0, reihenfolge.length - richtig);
  const anzeigeVerlauf = nurFehler ? verlauf.filter((e) => !e.richtig) : verlauf;

  return (
    <div>
      <header className="main-header">
        <div>
          <div className="flex wrap">
            <Link to={`/lernen/${modulId}`} className="small">← Modul</Link>
            <span className="small text-muted">{modul?.titel || modulId}</span>
          </div>
          <h1 className="mb-0 mt-2">Quizmodus</h1>
        </div>
        <div className="flex wrap">
          <div className="small text-muted">Frage {Math.min(position + 1, reihenfolge.length)} von {reihenfolge.length}</div>
          <select
            className="select"
            style={{ width: 'auto' }}
            value={schwierigkeit}
            onChange={(e) => aendereOptionen({ schwierigkeit: e.target.value })}
            title="Schwierigkeit filtern"
          >
            <option value="alle">Alle Schwierigkeiten</option>
            <option value="leicht">Nur leicht</option>
            <option value="mittel">Nur mittel</option>
            <option value="schwer">Nur schwer</option>
          </select>
          <select
            className="select"
            style={{ width: 'auto' }}
            value={anzahlAnzeige}
            onChange={(e) => aendereOptionen({ anzahl: Number(e.target.value) })}
            title="Anzahl der Fragen"
            aria-label="Anzahl der Fragen"
          >
            <option value={0}>Alle Fragen ({umfang.verfuegbar})</option>
            {anzahlListe.map((n) => (
              <option key={n} value={n}>{n} Fragen</option>
            ))}
          </select>
        </div>
      </header>

      <div className="progress mb-2">
        <div style={{ width: `${((position + (feedback ? 1 : 0)) / reihenfolge.length) * 100}%` }} />
      </div>

      {pruefFehler && <div className="alert alert-danger">{pruefFehler}</div>}

      {position < reihenfolge.length ? (
        <div className="card">
          <div className="flex-between wrap mb-2">
            <span className={`badge badge-${frage.schwierigkeit}`}>{frage.schwierigkeit}</span>
            <span className="small text-muted">{frage.thema}</span>
          </div>
          <h2 style={{ fontSize: '1.2rem' }}>{frage.frage}</h2>

          {frage.typ === 'FT' ? (
            <textarea
              className="input"
              rows={3}
              value={freitext}
              disabled={!!feedback}
              onChange={(e) => setFreitext(e.target.value)}
              placeholder="Antwort eingeben …"
            />
          ) : (
            <FrageKarte frage={frage} auswahl={auswahl} onToggle={toggle} optionen={frage.gemischt?.liste} />
          )}

          {!feedback && (
            <button className="btn btn-primary mt-2" onClick={pruefen} disabled={frage.typ === 'FT' ? !freitext.trim() : auswahl.length === 0}>
              Antwort prüfen
            </button>
          )}

          {feedback && (
            <div className={`alert ${feedback.richtig ? 'alert-success' : 'alert-danger'} mt-2`}>
              <strong>{feedback.richtig ? '✓ Richtig!' : '✗ Leider falsch.'}</strong>
              {!feedback.richtig && feedback.erwartet && (
                <div className="small">Richtige Antwort: {erwartetAnzeige || feedback.erwartet}</div>
              )}
              {feedback.erklaerung && <div className="mt-2">{feedback.erklaerung}</div>}
              <button className="btn btn-primary btn-sm mt-2" onClick={weiter}>
                {position + 1 >= reihenfolge.length ? 'Quiz beenden' : 'Nächste Frage →'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          <h2 className="mb-0">Lernergebnis 🎉</h2>
        <p className="text-muted mt-0">{modul?.titel || modulId} · {umfangLabel(umfang)}{schwierigkeit !== 'alle' ? ` · nur ${schwierigkeit}` : ''}</p>

          <div className="grid grid-4 mb-2">
            <div><div className="stat-value">{prozent}%</div><div className="stat-label">Ergebnis</div></div>
            <div><div className="stat-value">{richtig}</div><div className="stat-label">richtig</div></div>
            <div><div className="stat-value">{falschAnzahl}</div><div className="stat-label">falsch</div></div>
            <div><div className={`stat-value ${prozent >= 50 ? '' : 'text-muted'}`}>{prozent >= 50 ? '✓' : '–'}</div><div className="stat-label">≥ 50 % erreicht</div></div>
          </div>
          <div className="progress mb-2"><div style={{ width: `${prozent}%` }} /></div>

          <div className="flex wrap mb-2">
            <button className={`btn btn-sm ${nurFehler ? 'btn-ghost' : 'btn-primary'}`} onClick={() => setNurFehler(false)}>
              Alle ({verlauf.length})
            </button>
            <button className={`btn btn-sm ${nurFehler ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setNurFehler(true)}>
              Nur Fehler ({falschAnzahl})
            </button>
          </div>

          {anzeigeVerlauf.length === 0 && (
            <div className="alert alert-success">Keine Fehler – stark! 🎯</div>
          )}

          {anzeigeVerlauf.map((e, i) => {
            const optionenE = optionenListe(e.frage);
            const korrektE = e.frage.typ !== 'FT' ? (e.frage.antwort || '').toUpperCase().split(',').map((s) => s.trim()) : [];
            const nutzerE = (e.nutzerAntwort || '').toUpperCase().split(',').map((s) => s.trim()).filter(Boolean);
            return (
              <div key={`${e.frage.id}-${i}`} className="card" style={{ padding: 12, marginBottom: 10 }}>
                <div className="flex-between wrap mb-1">
                  <span className={`badge ${e.richtig ? 'badge-leicht' : 'badge-schwer'}`}>{e.richtig ? '✓ richtig' : '✗ falsch'}</span>
                  <span className="small text-muted">{e.frage.thema}</span>
                </div>
                <div style={{ fontWeight: 600 }}>{e.frage.frage}</div>

                {e.frage.typ === 'FT' ? (
                  <div className="small mt-2">
                    <div><strong>Deine Antwort:</strong> {e.nutzerAntwort || '– (keine)'}</div>
                    <div><strong>Musterlösung:</strong> {e.erwartet}</div>
                  </div>
                ) : (
                  <>
                    <div className="small mt-1">
                      <strong>Deine Antwort:</strong> {nutzerE.length ? nutzerE.join(', ') : '– (keine)'} · <strong>Richtig:</strong> {e.erwartet}
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
                            <span className="option-letter">{o.buchstabe}</span>
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

          <div className="flex wrap mt-2">
            <button className="btn btn-primary" onClick={starteQuiz}>Quiz wiederholen</button>
            <Link className="btn btn-ghost" to="/karteikarten">Karteikarten trainieren</Link>
            <Link className="btn btn-ghost" to={`/lernen/${modulId}`}>Zurück zum Modul</Link>
          </div>
        </div>
      )}
    </div>
  );
}
