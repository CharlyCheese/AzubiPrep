// Lernreise (Phase 5): virtuelle Landkarte des Lernwegs mit barrierefreier
// Listenansicht. Die Logik liegt in utils/lernreise.js, hier nur Darstellung.
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApi } from '../utils/useApi.js';
import { api } from '../api/client.js';
import { profileStore, progressStore } from '../store/localStore.js';
import { modulStatusAusFortschritt } from '../utils/modulStatus.js';
import { BEHERRSCHT_AB } from '../utils/gamification.js';
import {
  baueLernreise,
  naechsteStation,
  fachrichtungsUebersicht,
  GRUPPEN_ANZEIGE,
  GRUPPE_FACHRICHTUNG,
  GRUPPE_GEMEINSAM,
} from '../utils/lernreise.js';

function ReiseStation({ station }) {
  const s = station;
  return (
    <li className={`reise-station ${s.stufe}`}>
      <span className="reise-nummer" aria-hidden="true">{s.nummer}</span>
      <div className="reise-inhalt">
        <div className="flex-between wrap">
          <h3 className="mb-0">
            <span className="sr-only">Station {s.nummer}: </span>
            {s.titel}
          </h3>
          <span className={`badge ${s.anzeige.klasse}`}>{s.anzeige.label}</span>
        </div>
        <p className="small text-muted mb-1">{s.beschreibung}</p>
        <div className="flex wrap" style={{ gap: 6 }}>
          <span className="badge badge-neutral">{s.fragenAnzahl} Fragen</span>
          <span className="badge badge-neutral">{s.gruppe === GRUPPE_GEMEINSAM ? 'gemeinsam' : s.fachrichtung}</span>
          {s.bearbeitet && <span className="badge badge-neutral">{s.quote}% richtig</span>}
        </div>
        <div className="progress-label mt-1">
          <span>Fragen bearbeitet</span>
          <span>{s.anzahl} von {s.gesamt} ({s.abdeckung} %)</span>
        </div>
        <div className="progress">
          <div style={{ width: `${s.abdeckung}%`, background: s.beherrscht ? 'var(--success)' : undefined }} />
        </div>
        <div className="mt-1">
          <Link className="btn btn-primary btn-sm" to={`/lernen/${s.modulId}`}>Station öffnen →</Link>
        </div>
      </div>
    </li>
  );
}

function ReiseBlock({ gruppe, stationen }) {
  if (!stationen.length) return null;
  return (
    <section className="card mb-2" aria-label={GRUPPEN_ANZEIGE[gruppe]}>
      <h2 className="mb-0">{GRUPPEN_ANZEIGE[gruppe]}</h2>
      <p className="small text-muted mt-0">
        {gruppe === GRUPPE_GEMEINSAM
          ? 'Diese Module sind für alle vier Fachrichtungen prüfungsrelevant.'
          : `${stationen.length} Stationen in deiner gewählten Fachrichtung.`}
      </p>
      <ol className="reise-pfad">
        {stationen.map((s) => <ReiseStation key={s.modulId} station={s} />)}
      </ol>
    </section>
  );
}

function ReiseTabelle({ stationen }) {
  return (
    <div className="card mb-2">
      <h2 className="mb-0">Alle Stationen als Liste</h2>
      <p className="small text-muted mt-0">
        Gleiche Informationen wie in der Kartenansicht – ohne Grafik, gut mit Screenreader, Tastatur oder zum Ausdrucken.
      </p>
      <div className="reise-tabelle-wrapper">
        <table className="reise-tabelle">
          <caption className="sr-only">Stationen der Lernreise mit Bereich, Status und Erfolgsquote</caption>
          <thead>
            <tr>
              <th scope="col">Nr.</th>
              <th scope="col">Station</th>
              <th scope="col">Bereich</th>
              <th scope="col">Fragen</th>
              <th scope="col">Status</th>
              <th scope="col">Fortschritt</th>
              <th scope="col">Aktion</th>
            </tr>
          </thead>
          <tbody>
            {stationen.map((s, i) => (
              <tr key={s.modulId}>
                <td>{i + 1}</td>
                <td>{s.titel}</td>
                <td>{s.gruppe === GRUPPE_GEMEINSAM ? 'gemeinsam' : s.fachrichtung}</td>
                <td>{s.fragenAnzahl}</td>
                <td>{s.anzeige.label}</td>
                <td>{s.gesamt ? `${s.anzahl} von ${s.gesamt} (${s.abdeckung} %) · ${s.quote}% richtig` : '–'}</td>
                <td><Link to={`/lernen/${s.modulId}`}>Öffnen</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Lernreise() {
  const profil = profileStore.get();
  const [searchParams] = useSearchParams();
  const { daten: module } = useApi(() => api.get('/module'), []);
  const { daten: fachrichtungen } = useApi(() => api.get('/fachrichtungen'), []);
  const [ansicht, setAnsicht] = useState('karte');

  const frListe = fachrichtungen || [];
  const gewaehlt = searchParams.get('fr') || profil.fachrichtung || 'FIAE';
  const gewaehltName = frListe.find((f) => f.code === gewaehlt)?.name || gewaehlt;

  const statusMap = modulStatusAusFortschritt(progressStore.get());
  const reise = baueLernreise(module || [], gewaehlt, statusMap);
  const naechste = naechsteStation(reise);
  const uebersicht = fachrichtungsUebersicht(module || [], statusMap, frListe);
  const f = reise.fortschritt;

  return (
    <div>
      <header className="main-header">
        <div>
          <h1 className="mb-0">Lernreise</h1>
          <p className="text-muted mt-0">
            Dein Weg durch die Module – Station für Station. Wähle die Kartenansicht für den Überblick oder die
            Listenansicht als barrierefreie Alternative.
          </p>
        </div>
      </header>

      <div className="flex wrap mb-2">
        {frListe.map((fr) => (
          <Link
            key={fr.code}
            className={`btn ${fr.code === gewaehlt ? 'btn-primary' : 'btn-ghost'} btn-sm`}
            to={`/lernreise?fr=${fr.code}`}
          >
            {fr.code}
          </Link>
        ))}
      </div>

      <div className="card mb-2">
        <div className="flex-between wrap">
          <h2 className="mb-0">Reise durch {gewaehlt} – {gewaehltName}</h2>
          <span className="badge badge-neutral">{f.beherrscht} / {f.gesamt} Stationen beherrscht</span>
        </div>
        <div className="grid grid-3 mt-2">
          <div><div className="stat-value">{f.beherrscht}</div><div className="stat-label">beherrscht</div></div>
          <div><div className="stat-value">{f.bearbeitet}</div><div className="stat-label">bearbeitet</div></div>
          <div><div className="stat-value">{f.gesamt}</div><div className="stat-label">Stationen gesamt</div></div>
        </div>
        <div className="progress-label mt-2">
          <span>Reisefortschritt ({BEHERRSCHT_AB} % Erfolgsquote pro Station)</span>
          <span>{f.prozentBeherrscht}%</span>
        </div>
        <div className="progress"><div style={{ width: `${f.prozentBeherrscht}%` }} /></div>
        {naechste ? (
          <p className="alert alert-info mt-2 mb-0">
            Nächste Station: <strong>{naechste.titel}</strong> ({naechste.fragenAnzahl} Fragen) –{' '}
            <Link to={`/lernen/${naechste.modulId}`}>jetzt starten</Link>
          </p>
        ) : (
          <p className="alert alert-success mt-2 mb-0">Alle Stationen beherrscht – stark! 🎉</p>
        )}
      </div>

      <div className="flex wrap mb-2" role="group" aria-label="Ansicht der Lernreise wählen">
        <button
          type="button"
          className={`btn btn-sm ${ansicht === 'karte' ? 'btn-primary' : 'btn-ghost'}`}
          aria-pressed={ansicht === 'karte'}
          onClick={() => setAnsicht('karte')}
        >
          Kartenansicht
        </button>
        <button
          type="button"
          className={`btn btn-sm ${ansicht === 'liste' ? 'btn-primary' : 'btn-ghost'}`}
          aria-pressed={ansicht === 'liste'}
          onClick={() => setAnsicht('liste')}
        >
          Listenansicht
        </button>
      </div>

      {ansicht === 'karte' ? (
        <>
          <ReiseBlock gruppe={GRUPPE_FACHRICHTUNG} stationen={reise.stationen} />
          <ReiseBlock gruppe={GRUPPE_GEMEINSAM} stationen={reise.gemeinsam} />
        </>
      ) : (
        <ReiseTabelle stationen={reise.alle} />
      )}

      <div className="card mb-2">
        <h2 className="mb-0">Alle Fachrichtungen</h2>
        <p className="small text-muted mt-0">
          Die gemeinsamen Module (WiSo, Projektmanagement) zählen in jeder Fachrichtung mit.
        </p>
        {uebersicht.map((u) => (
          <div key={u.code} style={{ marginBottom: 12 }}>
            <div className="progress-label">
              <span>
                {u.code}{' '}
                <Link className="small" to={`/lernreise?fr=${u.code}`}>{u.name}</Link>
              </span>
              <span>{u.beherrscht} / {u.gesamt} beherrscht · {u.bearbeitet} bearbeitet</span>
            </div>
            <div className="progress">
              <div style={{ width: `${u.prozentBeherrscht}%`, background: 'var(--success)' }} />
            </div>
          </div>
        ))}
        {uebersicht.length === 0 && <p className="text-muted">Noch keine Module geladen.</p>}
      </div>
    </div>
  );
}