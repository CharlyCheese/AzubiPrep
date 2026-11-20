import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApi } from '../utils/useApi.js';
import { api } from '../api/client.js';
import { resetAll } from '../store/localStore.js';
import { useTheme } from '../context/ThemeContext.jsx';
import { tourManuellStarten } from '../utils/tour.js';
import KiEinstellungen from '../components/KiEinstellungen.jsx';
import { aiStore } from '../store/aiStore.js';
import { isPortfolio } from '../utils/deployment.js';
import '../styles/settings.css';

export default function Einstellungen() {
  const navigate = useNavigate();
  const { hash } = useLocation();
  useEffect(() => {
    if (hash !== '#ki-anbieter' && hash !== '#lernunterlagen') return;
    const frame = requestAnimationFrame(() => {
      const target = document.getElementById(hash.slice(1));
      target?.focus({ preventScroll: true });
      target?.scrollIntoView({ block: 'start' });
    });
    return () => cancelAnimationFrame(frame);
  }, [hash]);
  const { theme, toggleTheme } = useTheme();
  const { daten: status } = useApi(() => api.get('/status'), []);
  const syncAktiviert = !isPortfolio && Boolean(status?.syncAktiviert);

  function reset() {
    const question = isPortfolio ? 'Die aufgeführten Lern- und Übungsdaten auf diesem Gerät endgültig löschen?' : 'Die aufgeführten lokalen Lern- und Übungsdaten endgültig löschen und die KI-Einstellungen zurücksetzen?';
    if (!confirm(question)) return;
    resetAll();
    if (!isPortfolio) aiStore.reset();
    navigate('/dashboard');
  }

  return (
    <div className="settings-page">
      <header className="main-header">
        <h1>Einstellungen</h1>
        <nav aria-label="Einstellungsbereiche" className="settings-links">
          {!isPortfolio && <><Link to="#ki-anbieter">KI-Anbieter</Link>
            <Link to="#lernunterlagen">Lernunterlagen</Link></>}
          <Link to="/profil">{isPortfolio ? 'Lernprofil' : 'Lernprofil und Konto'}</Link>
        </nav>
      </header>

      <section className="settings-quick" aria-label="Darstellung und Hilfe">
        <div className="card">
          <h2>Darstellung</h2>
          <button className="btn btn-ghost" onClick={toggleTheme}>
            {theme === 'dark' ? '☀️ Helles Design aktivieren' : '🌙 Dunkles Design aktivieren'}
          </button>
        </div>
        <div className="card settings-help">
          <h2>Hilfe</h2>
          <button className="btn btn-ghost" onClick={tourManuellStarten}>🧭 Kurze Tour erneut anzeigen</button>
          <p className="small text-muted">Kurze Führung durch Dashboard, Lernreise, Lernbereich, Frontend-Werkstatt und Prüfungssimulation.</p>
        </div>
      </section>

      {isPortfolio ? <section className="card">
        <h2>Lernen im Browser</h2>
        <p>In dieser Webversion lernst du als Gast. Dein Lernstand und deine Notizen bleiben in diesem Browserprofil. KI-Lernbegleitung und eigene PDF-Unterlagen stehen in der lokal installierten Version zur Verfügung.</p>
      </section> : <KiEinstellungen />}

      <details className="card settings-details">
        <summary>Datenschutz &amp; Hinweise</summary>
        <ul className="small text-muted" style={{ paddingLeft: 18 }}>
          <li>
            Alle Lernstände, Notizen, Karteikarten und Einstellungen liegen <strong>grundsätzlich lokal im
            Browser</strong> dieses Geräts (localStorage).
            {syncAktiviert
              ? ' Nur wenn du dich freiwillig registrierst und aktiv „Jetzt hochladen" nutzt, wird dein Lernstand zusätzlich auf dem Server gespeichert (Passwörter werden dabei ausschließlich als Hash abgelegt, nie im Klartext).'
              : ' Diese Version speichert deinen Lernstand im Browserprofil.'}
          </li>
          <li>
            Auf gemeinsam genutzten Geräten kann jede Person diese lokalen Daten einsehen. Sichere Notizen bei
            Bedarf über den Export und nutze danach „Aufgeführte Daten löschen“.
          </li>
          <li>
            AzubiPrep ist ein <strong>Lernwerkzeug zur Selbstkontrolle</strong>; Ergebnisse sind nicht
            zertifiziert und ersetzen keinen Prüfungsnachweis.
          </li>
          <li>
            {isPortfolio ? 'Die Website verarbeitet Suchbegriffe und eingereichte Prüfungsantworten. Beim Üben kannst du die Musterlösungen ansehen.' : 'Fragen und Lösungen werden über die lokale API geladen – die Lösungen sind dort technisch abrufbar. Bitte als Lernhilfe nutzen (Details in docs/17-Sicherheit.md).'}
          </li>
        </ul>
      </details>

      <details className="card settings-details settings-delete">
        <summary>Lokale Lerndaten zurücksetzen</summary>
        <p>Du löschst auf diesem Gerät den Modulfortschritt, Prüfungsverlauf, Karteikarten, Lernplan und Lernaktivitäten einschließlich Punkten. Auch die Notizen des aktuellen Profils sowie {isPortfolio ? 'Quiz- und Karteikarteneinstellungen' : 'Quiz-, Karteikarten- und KI-Einstellungen'} werden zurückgesetzt. Sichere wichtige Notizen vorher über den Export.</p>
        <button className="btn btn-danger" onClick={reset}>Aufgeführte Daten löschen</button>
      </details>
    </div>
  );
}
