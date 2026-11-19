// Lernreise (Phase 5, seit FE-020 nach Lernfeld gegliedert): virtuelle
// Landkarte des Lernwegs mit barrierefreier Listenansicht. Die Logik liegt
// in utils/lernreise.js, hier nur Darstellung.
import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useApi } from '../utils/useApi.js';
import { api } from '../api/client.js';
import { profileStore, progressStore } from '../store/localStore.js';
import { modulStatusAusFortschritt } from '../utils/modulStatus.js';
import { BEHERRSCHT_AB } from '../utils/gamification.js';
import {
  baueLernreise,
  naechsteStation,
  fachrichtungsUebersicht,
  GRUPPE_GEMEINSAM,
} from '../utils/lernreise.js';
import Akkordeon from '../components/Akkordeon.jsx';
import JourneyEntry from '../components/JourneyEntry.jsx';

function ReiseStation({ station, journeyReturn }) {
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
          {s.bearbeitet && <span className="badge badge-neutral">{s.richtig} von {s.gesamt} richtig · {s.beherrschung}% des Moduls</span>}
        </div>
        <div className="progress-label mt-1">
          <span>Fragen bearbeitet</span>
          <span>{s.anzahl} von {s.gesamt} ({s.abdeckung} %)</span>
        </div>
        <div className="progress">
          <div style={{ width: `${s.abdeckung}%`, background: s.beherrscht ? 'var(--success)' : undefined }} />
        </div>
        <div className="mt-1">
          <Link id={`reise-station-${s.modulId}`} className="btn btn-primary btn-sm" to={`/lernen/${s.modulId}`} state={{ journeyReturn, journeyEntry: 'station' }}>Station öffnen →</Link>
        </div>
      </div>
    </li>
  );
}

function ReiseBlock({ titel, stationen, offen, onToggle, journeyReturn }) {
  if (!stationen.length) return null;
  const beherrschtAnzahl = stationen.filter((s) => s.beherrscht).length;
  const untertitel = `${beherrschtAnzahl} / ${stationen.length} Stationen beherrscht`;
  return (
    <div className="mb-2">
      <Akkordeon titel={titel} untertitel={untertitel} offen={offen} onToggle={onToggle}>
        <ol className="reise-pfad">
          {stationen.map((s) => <ReiseStation key={s.modulId} station={s} journeyReturn={journeyReturn} />)}
        </ol>
      </Akkordeon>
    </div>
  );
}

function ReiseTabelle({ stationen, journeyReturn }) {
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
                <td>{s.gesamt ? `${s.anzahl} von ${s.gesamt} bearbeitet (${s.abdeckung} %) · ${s.beherrschung}% des Moduls richtig` : '–'}</td>
                <td><Link id={`reise-station-${s.modulId}`} to={`/lernen/${s.modulId}`} state={{ journeyReturn, journeyEntry: 'station' }} aria-label={`${s.titel} öffnen`}>Öffnen</Link></td>
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { state: origin } = useLocation();
  const { daten: module, laden, fehler } = useApi(() => api.get('/module'), []);
  const { daten: fachrichtungen } = useApi(() => api.get('/fachrichtungen'), []);
  const ansicht = searchParams.get('ansicht') === 'liste' ? 'liste' : 'karte';
  function setAnsicht(value) {
    const next = new URLSearchParams(searchParams);
    if (value === 'liste') next.set('ansicht', value);
    else next.delete('ansicht');
    setSearchParams(next);
  }
  // FE-020: welche Lernfeld-Gruppen aufgeklappt sind – standardmäßig nur die
  // erste Gruppe mit einer noch nicht beherrschten Station (also der
  // nächste sinnvolle Einstiegspunkt), damit die Seite nicht mit 10+
  // aufgeklappten Akkordeons überwältigt.
  const [offeneGruppen, setOffeneGruppen] = useState(null);

  // Beim Wechsel der Fachrichtung (Link oben, ändert nur ?fr=…, kein
  // Seiten-Remount) sollen die aufgeklappten Gruppen neu bestimmt werden,
  // statt die alte Auswahl der vorherigen Fachrichtung zu behalten.
  useEffect(() => { setOffeneGruppen(null); }, [searchParams]);

  const frListe = fachrichtungen || [];
  const gewaehlt = searchParams.get('fr') || profil.fachrichtung || 'FIAE';
  const guided = gewaehlt === 'FIAE' && searchParams.get('weg') !== 'module';
  const journeyReturn = `/lernreise?fr=${encodeURIComponent(gewaehlt)}&weg=module${ansicht === 'liste' ? '&ansicht=liste' : ''}`;
  const gewaehltName = frListe.find((f) => f.code === gewaehlt)?.name || gewaehlt;

  const statusMap = modulStatusAusFortschritt(
    progressStore.get(),
    (id) => module?.find((m) => m.modul_id === id)?.fragenAnzahl || 0,
  );
  const reise = baueLernreise(module || [], gewaehlt, statusMap);
  const naechste = naechsteStation(reise);
  const uebersicht = fachrichtungsUebersicht(module || [], statusMap, frListe);
  const f = reise.fortschritt;

  if (offeneGruppen === null && reise.gruppen.length) {
    const originGroup = origin?.journeyStation && reise.gruppen.find(group => group.stationen.some(station => station.modulId === origin.journeyStation));
    const ersteOffene = originGroup || reise.gruppen.find((g) => g.stationen.some((s) => !s.beherrscht)) || reise.gruppen[0];
    setOffeneGruppen(new Set([ersteOffene.lernfeld]));
  }
  useEffect(() => {
    if (!module || guided || !origin?.journeyEntry) return;
    const id = origin.journeyEntry === 'next' ? 'reise-naechste-station' : `reise-station-${origin.journeyStation}`;
    document.getElementById(id)?.focus();
  }, [module, guided, origin]);
  const gruppenOffen = offeneGruppen || new Set();
  function toggleGruppe(lernfeld) {
    setOffeneGruppen((vorher) => {
      const naechsteMenge = new Set(vorher || []);
      if (naechsteMenge.has(lernfeld)) naechsteMenge.delete(lernfeld); else naechsteMenge.add(lernfeld);
      return naechsteMenge;
    });
  }

  return (
    <div className="journey-overview">
      <header className="main-header">
        <div><h1 className="mb-0">Lernreise</h1>
          <p className="text-muted mt-0">Folge der geführten FIAE-Lernreise oder wähle Module aus deiner Fachrichtung.</p>
        </div>
      </header>
      <nav className="journey-switch" aria-label="Lernweg wählen">
        <Link to="/lernreise?fr=FIAE" aria-current={guided ? 'page' : undefined}>Geführte Lernreise</Link>
        <Link to={`/lernreise?fr=${gewaehlt}&weg=module`} aria-current={!guided ? 'page' : undefined}>Freie Modulreise</Link>
      </nav>
      {guided ? <JourneyEntry /> : <>
      <div className="card journey-lead mb-2">
        <div className="journey-module-head">
          <h2 className="mb-0">Module zum freien Lernen</h2>
          <nav className="journey-directions" aria-label="Fachrichtung wählen">
            {frListe.map(fr => <Link key={fr.code} to={`/lernreise?fr=${fr.code}&weg=module`}
              aria-current={fr.code === gewaehlt ? 'page' : undefined}>{fr.code}</Link>)}
          </nav>
        </div>
        {laden ? <p role="status">Stationen werden geladen …</p> : fehler ? <p role="alert">{fehler}</p> :
          !f.gesamt ? <p>Für diese Fachrichtung sind noch keine Stationen verfügbar.</p> : <>
          {naechste ? <>
            <p>Nächste Station: <strong>{naechste.titel}</strong> · {naechste.fragenAnzahl} Fragen</p>
            <Link id="reise-naechste-station" className="btn btn-primary" to={`/lernen/${naechste.modulId}`} state={{ journeyReturn, journeyEntry: 'next' }}>{naechste.bearbeitet ? 'Station fortsetzen' : 'Station beginnen'}</Link>
          </> : <p className="alert alert-success">Alle Stationen beherrscht.</p>}
          <div className="journey-progress">
            <span>{f.beherrscht} / {f.gesamt} Stationen beherrscht</span>
            <progress aria-label="Modulfortschritt" max={100} value={f.prozentBeherrscht} />
            <span className="small text-muted">{gewaehltName} · {f.bearbeitet} begonnen · Eine Station zählt ab {BEHERRSCHT_AB} % richtig beantworteten Fragen als beherrscht.</span>
          </div>
        </>}
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
          {/* FE-020: Lernfeld-Gruppen in chronologischer Reihenfolge statt
              zweier fester Blöcke "gemeinsam"/"eigene Fachrichtung" – bildet
              den tatsächlichen Ausbildungsverlauf ab (siehe CONTENT-007). */}
          {reise.gruppen.map((g) => (
            <ReiseBlock
              key={g.lernfeld}
              journeyReturn={journeyReturn}
              titel={g.titel}
              stationen={g.stationen}
              offen={gruppenOffen.has(g.lernfeld)}
              onToggle={() => toggleGruppe(g.lernfeld)}
            />
          ))}
        </>
      ) : (
        <ReiseTabelle stationen={reise.alle} journeyReturn={journeyReturn} />
      )}

      <details className="card journey-directory mb-2">
        <summary>Fortschritt aller Fachrichtungen vergleichen</summary>
        <p className="small text-muted mt-0">
          Die gemeinsamen Module zählen in jeder Fachrichtung mit. Dieser Modulstatus ist vom geführten Themenabschnitt getrennt.
        </p>
        {uebersicht.map((u) => (
          <div key={u.code} style={{ marginBottom: 12 }}>
            <div className="progress-label">
              <span>
                {u.code}{' '}
                <Link className="small" to={`/lernreise?fr=${u.code}&weg=module`}>{u.name}</Link>
              </span>
              <span>{u.beherrscht} / {u.gesamt} beherrscht · {u.bearbeitet} bearbeitet</span>
            </div>
            <div className="progress">
              <div style={{ width: `${u.prozentBeherrscht}%`, background: 'var(--success)' }} />
            </div>
          </div>
        ))}
        {uebersicht.length === 0 && <p className="text-muted">Noch keine Module geladen.</p>}
      </details>
      </>}
    </div>
  );
}
