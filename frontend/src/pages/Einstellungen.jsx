import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../utils/useApi.js';
import { api } from '../api/client.js';
import { profileStore, resetAll } from '../store/localStore.js';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Einstellungen() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { daten: fachrichtungen } = useApi(() => api.get('/fachrichtungen'), []);
  const [profil, setProfil] = useState(profileStore.get());
  const [meldung, setMeldung] = useState('');

  function speichern() {
    profileStore.set(profil);
    setMeldung('Einstellungen gespeichert ✓');
    setTimeout(() => setMeldung(''), 2500);
  }

  function reset() {
    if (!confirm('Wirklich alle lokalen Lerndaten löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) return;
    resetAll();
    setProfil(profileStore.get());
    navigate('/');
  }

  return (
    <div>
      <header className="main-header">
        <div>
          <h1 className="mb-0">Einstellungen & Profil</h1>
          <p className="text-muted mt-0">Dein Lernprofil liegt lokal auf diesem Gerät – kein Login nötig.</p>
        </div>
      </header>

      <div className="card mb-2">
        <h2>Lernprofil</h2>
        <div className="field">
          <label>Anzeigename</label>
          <input className="input" value={profil.name || ''} onChange={(e) => setProfil({ ...profil, name: e.target.value })} />
        </div>
        <div className="field">
          <label>Fachrichtung</label>
          <select className="select" value={profil.fachrichtung || 'FIAE'} onChange={(e) => setProfil({ ...profil, fachrichtung: e.target.value })}>
            {(fachrichtungen || []).map((fr) => (
              <option key={fr.code} value={fr.code}>{fr.code} – {fr.name}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Prüfungstermin (optional)</label>
          <input
            type="date"
            className="input"
            value={profil.prüfungstermin ? profil.prüfungstermin.slice(0, 10) : ''}
            onChange={(e) => setProfil({ ...profil, prüfungstermin: e.target.value || null })}
          />
          <div className="field-hint">Wird für die Rückwärtsplanung im Lernkalender genutzt.</div>
        </div>
        {meldung && <div className="alert alert-success">{meldung}</div>}
        <button className="btn btn-primary" onClick={speichern}>Speichern</button>
      </div>

      <div className="card mb-2">
        <h2>Darstellung</h2>
        <button className="btn btn-ghost" onClick={toggleTheme}>
          {theme === 'dark' ? '☀️ Helles Design aktivieren' : '🌙 Dunkles Design aktivieren'}
        </button>
      </div>

      <div className="card mb-2">
        <h2>Datenschutz & Hinweise</h2>
        <ul className="small text-muted" style={{ paddingLeft: 18 }}>
          <li>
            Alle Lernstände, Notizen, Karteikarten und Einstellungen liegen <strong>ausschließlich lokal im
            Browser</strong> dieses Geräts (localStorage) – es gibt kein Benutzerkonto und keine Speicherung auf
            dem Server.
          </li>
          <li>
            Auf gemeinsam genutzten Geräten kann jede Person diese lokalen Daten einsehen. Sichere Notizen bei
            Bedarf über den Export und nutze danach „Alle lokalen Lerndaten löschen“.
          </li>
          <li>
            AzubiPrep ist ein <strong>Lernwerkzeug zur Selbstkontrolle</strong>; Ergebnisse sind nicht
            zertifiziert und ersetzen keinen Prüfungsnachweis.
          </li>
          <li>
            Fragen und Lösungen werden über die lokale API geladen – die Lösungen sind dort technisch abrufbar.
            Bitte als Lernhilfe nutzen (Details in docs/17-Sicherheit.md).
          </li>
        </ul>
      </div>

      <div className="card">
        <h2 style={{ color: 'var(--danger-ink)' }}>Gefahrenzone</h2>
        <p className="text-muted">Löscht Fortschritt, Karteikarten, Notizen und Prüfungsverlauf auf diesem Gerät.</p>
        <button className="btn btn-danger" onClick={reset}>Alle lokalen Lerndaten löschen</button>
      </div>
    </div>
  );
}
