import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { useTheme } from '../context/ThemeContext.jsx';
import ToastHost from '../components/ToastHost.jsx';
import WillkommenModal from '../components/WillkommenModal.jsx';
import AppTour from '../components/AppTour.jsx';
import { authStore } from '../store/authStore.js';
import { api } from '../api/client.js';

// BE-005/Rate-Limit-Fix: vorher lud dieses Badge bei JEDEM Seitenwechsel neu
// (useApi mit location.pathname als Dependency) – bei einer Test-Session mit
// vielen Reloads/Navigationen (plus React-StrictMode-Doppelaufrufen in der
// Entwicklung) hat das spürbar zum globalen API-Limit (sicherheit.js,
// Standard 240/min) beigetragen. Jetzt: ein Ladevorgang beim Einloggen/
// Mounten, danach nur noch alle 60s im Hintergrund – plus sofort beim
// Besuch der Benachrichtigungen-Seite selbst, damit das Badge dort ohne
// Wartezeit verschwindet.
const BADGE_INTERVALL_MS = 60_000;

const NAV = [
  { to: '/', icon: '🏠', label: 'Dashboard', end: true },
  { to: '/lernen', icon: '📚', label: 'Lernbereich' },
  { to: '/karteikarten', icon: '🃏', label: 'Karteikarten' },
  { to: '/pruefung', icon: '⏱️', label: 'Prüfungssimulation' },
  { to: '/pruefung/verlauf', icon: '🗂️', label: 'Prüfungsverlauf' },
  { to: '/statistik', icon: '📊', label: 'Statistik' },
  { to: '/lernreise', icon: '🗺️', label: 'Lernreise' },
  { to: '/kalender', icon: '📅', label: 'Lernkalender' },
  { to: '/suche', icon: '🔍', label: 'Suche' },
  { to: '/notizen', icon: '📝', label: 'Notizen' },
  { to: '/einstellungen', icon: '⚙️', label: 'Einstellungen' },
];

// FE-014: Profil (Lernprofil + Konto/Sync) und Benachrichtigungen
// ("Mailbox") aus Einstellungen herausgelöst, eigene Nav-Punkte.
const PROFIL_NAV_ITEM = { to: '/profil', icon: '👤', label: 'Profil' };
const BENACHRICHTIGUNGEN_NAV_ITEM = { to: '/benachrichtigungen', icon: '🔔', label: 'Benachrichtigungen' };

// CONTENT-001: nur für eingeloggte Autor:innen/Admins sichtbar – Backend
// erzwingt den Zugriffsschutz ohnehin, das hier ist nur, um Lernenden
// keinen funktionslosen Menüpunkt zu zeigen.
const AUTOREN_NAV_ITEM = { to: '/autoren', icon: '🛠️', label: 'Fragenpflege' };

// BE-007: nur für 'admin' sichtbar (nicht 'autor') – Backend erzwingt das
// ebenfalls (adminPflicht), gleiches Muster wie AUTOREN_NAV_ITEM oben.
const NUTZERVERWALTUNG_NAV_ITEM = { to: '/nutzerverwaltung', icon: '🔑', label: 'Nutzerverwaltung' };

export default function Layout() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const auth = useSyncExternalStore(authStore.subscribe, authStore.snapshot);
  const rolle = auth?.user?.rolle;
  const eingeloggt = Boolean(auth?.token);

  // Ungelesen-Zähler für den Benachrichtigungen-Nav-Punkt (BE-005).
  const [ungelesen, setUngelesen] = useState(0);

  useEffect(() => {
    if (!eingeloggt) { setUngelesen(0); return undefined; }
    let aktiv = true;
    async function laden() {
      try {
        const d = await api.get('/benachrichtigungen');
        if (aktiv) setUngelesen(d?.ungelesen || 0);
      } catch {
        // Badge ist rein informativ – Fehler hier absichtlich ignorieren.
      }
    }
    laden();
    const intervall = setInterval(laden, BADGE_INTERVALL_MS);
    return () => { aktiv = false; clearInterval(intervall); };
  }, [eingeloggt]);

  // Sofort neu laden, sobald die Benachrichtigungen-Seite selbst besucht
  // wird (dort werden Einträge als gelesen markiert) – ohne dafür bei jedem
  // beliebigen Seitenwechsel neu zu laden.
  useEffect(() => {
    if (eingeloggt && location.pathname === '/benachrichtigungen') {
      api.get('/benachrichtigungen').then((d) => setUngelesen(d?.ungelesen || 0)).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  let nav = [...NAV.slice(0, -1), PROFIL_NAV_ITEM, BENACHRICHTIGUNGEN_NAV_ITEM, NAV[NAV.length - 1]];
  if (rolle === 'autor' || rolle === 'admin') nav = [...nav, AUTOREN_NAV_ITEM];
  if (rolle === 'admin') nav = [...nav, NUTZERVERWALTUNG_NAV_ITEM];

  return (
    <div className="app-layout">
      <WillkommenModal />
      <AppTour />
      <aside className="sidebar">
        <div className="logo">
          <span className="logo-badge">A</span>
          AzubiPrep
        </div>
        <nav>
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              <span className="nav-icon">{item.icon}</span>
              {item.label}
              {item.to === '/benachrichtigungen' && ungelesen > 0 && (
                <span className="badge badge-neutral" style={{ marginLeft: 6 }}>{ungelesen}</span>
              )}
            </NavLink>
          ))}
        </nav>
      <ToastHost />
        <div style={{ padding: '12px 10px 0', marginTop: 12, borderTop: '1px solid var(--border)' }}>
          <button
            className="btn btn-ghost btn-sm btn-block"
            role="switch"
            aria-checked={theme === 'dark'}
            aria-label="Design zwischen hell und dunkel umschalten"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? '☀️ Helles Design' : '🌙 Dunkles Design'}
          </button>
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>

      {/* Mobile Navigation unten */}
      <nav className="mobile-nav">
        {NAV.slice(0, 5).map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => (isActive ? 'active' : '')}>
            <span className="nav-icon">{item.icon}</span>
            {item.label.split(' ')[0]}
          </NavLink>
        ))}
      </nav>
      <ToastHost />
    </div>
  );
}
