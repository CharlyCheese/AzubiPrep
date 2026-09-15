import { NavLink, Outlet } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import ToastHost from '../components/ToastHost.jsx';
import WillkommenModal from '../components/WillkommenModal.jsx';

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

export default function Layout() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app-layout">
      <WillkommenModal />
      <aside className="sidebar">
        <div className="logo">
          <span className="logo-badge">A</span>
          AzubiPrep
        </div>
        <nav>
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              <span className="nav-icon">{item.icon}</span>
              {item.label}
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
