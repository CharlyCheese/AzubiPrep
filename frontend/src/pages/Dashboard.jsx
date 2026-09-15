import { useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../utils/useApi.js';
import { api } from '../api/client.js';
import { profileStore, progressStore, flashcardStore, examStore, activityStore, todayKey } from '../store/localStore.js';
import { gamificationStore } from '../store/gamificationStore.js';
import { levelAusXp, naechsteStufe } from '../utils/gamification.js';
import { tagesFortschritt, wochenFortschritt } from '../utils/ziele.js';
import { missionenMitStatus } from '../utils/missionen.js';

function Missionsliste({ titel, missionen }) {
  const erledigt = missionen.filter((m) => m.erreicht).length;
  return (
    <div>
      <div className="flex-between wrap mb-1">
        <h3 className="mb-0">{titel}</h3>
        <span className="badge badge-neutral">{erledigt} / {missionen.length}</span>
      </div>
      {missionen.map((m) => (
        <div key={m.id} style={{ marginBottom: 10 }}>
          <div className="progress-label">
            <span>{m.erreicht ? '✓ ' : ''}{m.titel}</span>
            <span>{m.ist} / {m.ziel}</span>
          </div>
          <div className="progress">
            <div style={{ width: `${Math.round(m.fortschritt * 100)}%`, background: m.erreicht ? 'var(--success)' : undefined }} />
          </div>
          <div className="small text-muted">{m.beschreibung} · +{m.xp} XP</div>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const profil = profileStore.get();
  const game = useSyncExternalStore(gamificationStore.subscribe, gamificationStore.snapshot);
  const xp = game.xp || 0;
  const level = levelAusXp(xp);
  const naechste = naechsteStufe(xp);
  const xpInLevel = xp - (level.minXp || 0);
  const xpSpanne = naechste ? naechste.minXp - level.minXp : 1;
  const xpProzent = naechste ? Math.min(100, Math.round((xpInLevel / xpSpanne) * 100)) : 100;
  const { daten: meta, laden } = useApi(() => api.get('/health'), []);

  const progress = progressStore.get();
  const beantwortet = Object.keys(progress).length;
  const richtig = Object.values(progress).filter((p) => p.letztesErgebnis === true).length;
  const faellige = flashcardStore.alle(true).length;
  const pruefungen = examStore.get();
  const letztePruefung = pruefungen[0] || null;

  const aktivitaet = activityStore.get();
  const letzteLernTage = Object.keys(aktivitaet).length;
  const tages = tagesFortschritt();
  const woche = wochenFortschritt();
  const missionen = missionenMitStatus(game.missionen);

  // Onboarding-Hinweis nur vor der ersten Lernaktivitaet
  const neuling = xp === 0 && beantwortet === 0 && pruefungen.length === 0;
  // Fortschritt je Fachrichtung der gewählten Richtung
  const moduleGesamt = meta?.moduleGesamt || 18;
  const fragenGesamt = meta?.fragenGesamt || 0;

  return (
    <div>
      <header className="main-header">
        <div>
          <h1 className="mb-0">Dashboard</h1>
          <p className="text-muted mt-0">Dein Lernfortschritt auf einen Blick.</p>
        </div>
      </header>

      {neuling && (
        <div className="alert alert-info">
          <strong>Willkommen bei AzubiPrep!</strong> Starte im <Link to="/lernen">Lernbereich</Link> mit einem
          Modul – Fortschritt, XP und Abzeichen werden automatisch gespeichert. Alle Stationen im Überblick
          zeigt die <Link to="/lernreise">Lernreise</Link>.
        </div>
      )}
<div className="card mb-2">
        <div className="flex-between wrap">
          <div style={{ minWidth: 0 }}>
            <div className="small text-muted">Level {level.level} · {level.titel}</div>
            <div className="stat-value" style={{ fontSize: '1.4rem' }}>{xp} XP</div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div className="progress-label">
              <span>{naechste ? `Nächstes Level: ${naechste.titel}` : 'Höchstes Level'}</span>
              <span>{naechste ? `${xpInLevel} / ${xpSpanne} XP` : 'Max.'}</span>
            </div>
            <div className="progress"><div style={{ width: `${xpProzent}%` }} /></div>
            {naechste ? (
              <div className="small text-muted mt-1">Noch {naechste.minXp - xp} XP bis Level {naechste.level}</div>
            ) : (
              <div className="small text-muted mt-1">Höchstes Level erreicht</div>
            )}
          </div>
        </div>
      </div>
      {laden ? (
        <div className="loading">Lade Lernstand …</div>
      ) : (
        <div className="dashboard-layout">
          {/* Hauptspalte: Ziele, Missionen, letzte Prüfung */}
          <div>
            <div className="card mb-2">
              <h2 className="mb-0">Tages- und Wochenziel</h2>
              <div className="grid grid-2 mt-2">
                <div>
                  <div className="progress-label"><span>Tagesziel (Fragen)</span><span>{tages.ist} / {tages.ziel}</span></div>
                  <div className="progress"><div style={{ width: `${tages.prozent}%` }} /></div>
                  <div className="small text-muted mt-1">
                    {tages.erreicht ? 'Tagesziel erreicht (+30 XP)' : `Noch ${Math.max(0, tages.ziel - tages.ist)} Frage(n) bis zum Ziel`}
                  </div>
                </div>
                <div>
                  <div className="progress-label"><span>Wochenziel (aktive Tage)</span><span>{woche.ist} / {woche.ziel}</span></div>
                  <div className="progress"><div style={{ width: `${woche.prozent}%` }} /></div>
                  <div className="small text-muted mt-1">
                    {woche.erreicht ? 'Wochenziel erreicht' : `Noch ${Math.max(0, woche.ziel - woche.ist)} aktive(r) Tag(e)`}
                  </div>
                </div>
              </div>
            </div>

            <div className="card mb-2">
              <h2 className="mb-0">Missionen</h2>
              <p className="small text-muted mt-0 mb-2">
                Tagesmissionen starten jeden Tag neu, Wochenmissionen jeden Montag.
              </p>
              <div className="grid grid-2">
                <Missionsliste titel="Heute" missionen={missionen.tag} />
                <Missionsliste titel="Diese Woche" missionen={missionen.woche} />
              </div>
            </div>

            {letztePruefung && (
              <div className="card">
                <h2 className="mb-0">Letzte Prüfungssimulation</h2>
                <p className="text-muted mt-0 small">
                  {new Date(letztePruefung.am).toLocaleDateString('de-DE')} · {letztePruefung.fachrichtung}
                </p>
                <div className="progress-label"><span>Ergebnis</span><span>{letztePruefung.scoreProzent}%</span></div>
                <div className="progress">
                  <div style={{ width: `${Math.min(100, letztePruefung.scoreProzent || 0)}%` }} />
                </div>
                <p className={letztePruefung.bestanden ? 'alert alert-success mt-2' : 'alert alert-danger mt-2'}>
                  {letztePruefung.bestanden ? '✓ Bestanden' : '✗ Nicht bestanden'} – {letztePruefung.richtig} von {letztePruefung.gesamt} richtig
                </p>
              </div>
            )}
          </div>

          {/* Nebenspalte: Schnellstart, KPIs, Fachrichtung */}
          <aside>
            <div className="card mb-2">
              <h2 className="mb-0" style={{ fontSize: '1.05rem' }}>⚡ Schnellstart</h2>
              <Link className="btn btn-primary btn-block mt-2" to="/pruefung">Prüfungssimulation →</Link>
              <div className="grid-kpi mt-1">
                <Link className="btn btn-ghost btn-sm" to="/karteikarten">🗂 Karteikarten</Link>
                <Link className="btn btn-ghost btn-sm" to="/statistik">📊 Statistik</Link>
              </div>
            </div>

            <div className="grid-kpi mb-2">
              <div className="card">
                <div className="small text-muted">Fragen gesamt</div>
                <div className="stat-value" style={{ fontSize: '1.5rem' }}>{beantwortet}</div>
                <div className="small text-muted">von {fragenGesamt} im Bestand</div>
              </div>
              <div className="card">
                <div className="small text-muted">Erfolgsquote</div>
                <div className="stat-value" style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>
                  {beantwortet ? Math.round((richtig / beantwortet) * 100) : 0}%
                </div>
                <div className="small text-muted">{richtig} zuletzt richtig</div>
              </div>
              <div className="card">
                <div className="small text-muted">Fällige Karten</div>
                <div className="stat-value" style={{ fontSize: '1.5rem', color: 'var(--warning)' }}>{faellige}</div>
                <Link to="/karteikarten" className="small">→ Jetzt wiederholen</Link>
              </div>
              <div className="card">
                <div className="small text-muted">Lerntage</div>
                <div className="stat-value" style={{ fontSize: '1.5rem' }}>{letzteLernTage}</div>
                <div className="small text-muted">aktive Sessions</div>
              </div>
            </div>

            <div className="card">
              <h2 className="mb-0" style={{ fontSize: '1.05rem' }}>Deine Fachrichtung</h2>
              <div className="flex wrap mt-1">
                <span className={`badge badge-${profil.fachrichtung.toLowerCase()}`}>{profil.fachrichtung}</span>
                <span>{profil.name || 'Lernende:r'}</span>
              </div>
              <p className="text-muted mt-2 mb-2 small">
                Geplante Prüfung: {profil.prüfungstermin ? new Date(profil.prüfungstermin).toLocaleDateString('de-DE') : 'noch nicht gesetzt'}
              </p>
              <Link className="btn btn-ghost btn-sm btn-block" to="/lernen">Zum Lernbereich →</Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
