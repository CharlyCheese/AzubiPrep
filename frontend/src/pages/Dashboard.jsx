import { useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../utils/useApi.js';
import { api } from '../api/client.js';
import { profileStore, progressStore, flashcardStore, examStore, activityStore } from '../store/localStore.js';
import { gamificationStore } from '../store/gamificationStore.js';
import { levelAusXp, naechsteStufe } from '../utils/gamification.js';
import { tagesFortschritt, wochenFortschritt } from '../utils/ziele.js';
import { missionenMitStatus } from '../utils/missionen.js';
import '../styles/learning-home.css';

function MissionList({ title, missions }) {
  return (
    <section>
      <h3>{title}</h3>
      <ul className="lh-missions">
        {missions.map((mission) => (
          <li key={mission.id}>
            <div className="lh-row">
              <strong>{mission.erreicht ? '✓ ' : ''}{mission.titel}</strong>
              <span>{mission.ist} / {mission.ziel}</span>
            </div>
            <small>{mission.beschreibung} · +{mission.xp} XP</small>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Goal({ label, value, unit }) {
  return (
    <div className="lh-goal">
      <div className="lh-row">
        <strong>{label}</strong>
        <span>{value.ist} / {value.ziel} {unit}</span>
      </div>
      <div className="progress" aria-hidden="true"><div style={{ width: `${value.prozent}%` }} /></div>
      {value.erreicht && <small>{label === 'Tagesziel' ? 'Tagesziel erreicht (+30 XP)' : 'Wochenziel erreicht'}</small>}
    </div>
  );
}

export default function Dashboard() {
  const profile = profileStore.get();
  const game = useSyncExternalStore(gamificationStore.subscribe, gamificationStore.snapshot);
  const { daten: modules } = useApi(() => api.get('/module'), []);
  const records = Object.values(progressStore.get()).filter(Boolean);
  const correct = records.filter((record) => record.letztesErgebnis === true).length;
  const moduleIds = new Map((modules || []).map((module) => [module.modul_id, module]));
  const recent = records.reduce((latest, record) => {
    if (!moduleIds.has(record.modulId) || !record.geübtAm) return latest;
    return !latest || record.geübtAm > latest.geübtAm ? record : latest;
  }, null);
  const currentModule = moduleIds.get(recent?.modulId);
  const due = flashcardStore.alle(true).length;
  const exams = examStore.get();
  const latestExam = exams.at(-1);
  const xp = game.xp || 0;
  const level = levelAusXp(xp);
  const nextLevel = naechsteStufe(xp);
  const missions = missionenMitStatus(game.missionen);
  const today = tagesFortschritt();
  const week = wochenFortschritt();
  const date = new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="learning-home">
      <header className="lh-header">
        <div>
          <h1>Dashboard</h1>
          <p>{date} · {profile.fachrichtung || 'FIAE'}</p>
        </div>
        <Link className="lh-text-link" to="/profil">Lernprofil</Link>
      </header>

      <section className="lh-panel lh-feature" aria-labelledby="home-next">
        <div className="lh-feature-copy">
          <h2 id="home-next">{currentModule ? 'Weiterlernen' : 'Mit einem Modul starten'}</h2>
          <p>{currentModule ? `Zuletzt geübt: ${currentModule.titel}.` : 'Wähle ein Thema aus deinem Lernbereich und übe die ersten Fragen.'}</p>
        </div>
        <div className="lh-actions">
          <Link className="btn btn-primary" to={currentModule ? `/lernen/${currentModule.modul_id}` : '/lernen'}>
            {currentModule ? 'Modul fortsetzen' : 'Modul auswählen'} →
          </Link>
          <Link className="lh-text-link" to="/lernreise">Zur Lernreise</Link>
        </div>
      </section>

      <div className="lh-shortcuts" aria-label="Weitere Lernwege">
        <Link to="/pruefung">Prüfung simulieren <span aria-hidden="true">→</span></Link>
        <Link to="/karteikarten">Karteikarten{due > 0 && ` (${due} fällig)`} <span aria-hidden="true">→</span></Link>
      </div>

      <div className="lh-columns">
        <section className="lh-panel" aria-labelledby="home-goals">
          <div className="lh-section-head">
            <h2 id="home-goals">Deine Lernziele</h2>
            <Link className="lh-text-link" to="/kalender">Kalender</Link>
          </div>
          <Goal label="Tagesziel" value={today} unit="Fragen" />
          <Goal label="Wochenziel" value={week} unit="Tage" />
          {profile.prüfungstermin && <p className="small">Geplante Prüfung am {new Date(profile.prüfungstermin).toLocaleDateString('de-DE')}.</p>}
        </section>
        <section className="lh-panel" aria-labelledby="home-progress">
          <div className="lh-section-head">
            <h2 id="home-progress">Dein Lernstand</h2>
            <Link className="lh-text-link" to="/statistik">Statistik</Link>
          </div>
          <dl className="lh-facts">
            <div><dt>Beantwortet</dt><dd>{records.length}</dd></div>
            <div><dt>Zuletzt richtig</dt><dd>{records.length ? `${Math.round(correct / records.length * 100)} %` : '–'}</dd></div>
            <div><dt>Lerntage</dt><dd>{Object.keys(activityStore.get()).length}</dd></div>
          </dl>
          <p className="lh-level"><strong>{xp} XP</strong> · Level {level.level} · {level.titel}</p>
          <small>{nextLevel ? `Noch ${nextLevel.minXp - xp} XP bis Level ${nextLevel.level} (${nextLevel.titel}).` : 'Höchstes Level erreicht.'}</small>
        </section>
      </div>

      {latestExam && (
        <section className="lh-panel lh-section-head">
          <div>
            <h2>Letzte Prüfungssimulation</h2>
            <p>{new Date(latestExam.am).toLocaleDateString('de-DE')} · {latestExam.fachrichtung} · {latestExam.bestanden ? 'Bestanden' : 'Nicht bestanden'}</p>
            <strong>{latestExam.scoreProzent} %</strong> · {latestExam.richtig} von {latestExam.gesamt} richtig
          </div>
          <Link className="lh-text-link" to={`/pruefung/verlauf?index=${exams.length - 1}`}>Auswertung öffnen</Link>
        </section>
      )}

      <details className="lh-disclosure">
        <summary><strong>Missionen</strong><span>{missions.liste.filter((mission) => mission.erreicht).length} von {missions.liste.length} erreicht</span></summary>
        <div className="lh-columns lh-inset">
          <MissionList title="Heute" missions={missions.tag} />
          <MissionList title="Diese Woche" missions={missions.woche} />
        </div>
      </details>
    </div>
  );
}
