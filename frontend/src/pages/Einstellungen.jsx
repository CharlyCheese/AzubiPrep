import { useNavigate } from 'react-router-dom';
import { useApi } from '../utils/useApi.js';
import { api } from '../api/client.js';
import { resetAll } from '../store/localStore.js';
import { useTheme } from '../context/ThemeContext.jsx';
import { tourManuellStarten } from '../utils/tour.js';

export default function Einstellungen() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { daten: status } = useApi(() => api.get('/status'), []);
  const syncAktiviert = Boolean(status?.syncAktiviert);

  function reset() {
    if (!confirm('Wirklich alle lokalen Lerndaten löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) return;
    resetAll();
    navigate('/');
  }

  return (
    <div>
      <header className="main-header">
        <div>
          <h1 className="mb-0">Einstellungen</h1>
          <p className="text-muted mt-0">Darstellung, Datenschutz und Geräte-Daten. Lernprofil und Konto findest du unter Profil.</p>
        </div>
      </header>

      <div className="card mb-2">
        <h2>Darstellung</h2>
        <button className="btn btn-ghost" onClick={toggleTheme}>
          {theme === 'dark' ? '☀️ Helles Design aktivieren' : '🌙 Dunkles Design aktivieren'}
        </button>
      </div>

      <div className="card mb-2">
        <h2>Hilfe</h2>
        <p className="text-muted mt-0">Kurze Führung durch Dashboard, Lernreise, Lernbereich und Prüfungssimulation.</p>
        <button className="btn btn-ghost" onClick={tourManuellStarten}>🧭 Kurze Tour erneut anzeigen</button>
      </div>

      <div className="card mb-2">
        <h2>Datenschutz & Hinweise</h2>
        <ul className="small text-muted" style={{ paddingLeft: 18 }}>
          <li>
            Alle Lernstände, Notizen, Karteikarten und Einstellungen liegen <strong>grundsätzlich lokal im
            Browser</strong> dieses Geräts (localStorage).
            {syncAktiviert
              ? ' Nur wenn du dich freiwillig registrierst und aktiv „Jetzt hochladen" nutzt, wird dein Lernstand zusätzlich auf dem Server gespeichert (Passwörter werden dabei ausschließlich als Hash abgelegt, nie im Klartext).'
              : ' Es gibt kein Benutzerkonto und keine Speicherung auf dem Server.'}
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
