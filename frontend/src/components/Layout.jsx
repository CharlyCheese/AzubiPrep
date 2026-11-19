import { Link, Outlet, useLocation, useNavigationType } from 'react-router-dom';
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useTheme } from '../context/ThemeContext.jsx';
import ToastHost from './ToastHost.jsx';
import WillkommenModal from './WillkommenModal.jsx';
import AppTour from './AppTour.jsx';
import { authStore } from '../store/authStore.js';
import { api } from '../api/client.js';

const GROUPS = [
  { title: 'Lernen', links: [
    { to: '/dashboard', label: 'Dashboard', short: 'Start', icon: '⌂' },
    { to: '/lernreise', label: 'Lernreise', icon: '◇' },
    { to: '/lernen', label: 'Lernbereich', short: 'Lernen', icon: '▤' },
    { to: '/theorie', label: 'Theorie & Glossar', icon: '¶' },
    { to: '/frontendkurs', label: 'Frontend-Werkstatt', icon: '›_' },
    { to: '/karteikarten', label: 'Karteikarten', icon: '▱' },
  ] },
  { title: 'Prüfen & planen', links: [
    { to: '/pruefung', label: 'Prüfungssimulation', icon: '◷' },
    { to: '/pruefung/verlauf', label: 'Prüfungsverlauf', icon: '☷' },
    { to: '/statistik', label: 'Statistik', icon: '▥' },
    { to: '/kalender', label: 'Lernkalender', icon: '▦' },
  ] },
  { title: 'Persönlich', links: [
    { to: '/suche', label: 'Suche', icon: '⚲' },
    { to: '/notizen', label: 'Notizen', icon: '✎' },
    { to: '/profil', label: 'Profil', icon: '◎' },
    { to: '/benachrichtigungen', label: 'Benachrichtigungen', icon: '◌' },
    { to: '/einstellungen', label: 'Einstellungen', icon: '⚙' },
  ] },
];

const ADMIN = { title: 'Verwaltung', links: [
  { to: '/autoren', label: 'Fragenpflege', icon: '✎' },
  { to: '/nutzerverwaltung', label: 'Nutzerverwaltung', icon: '⚿' },
] };
const shortcuts = ['/dashboard', '/lernreise', '/lernen', '/suche'].map(path =>
  GROUPS.flatMap(group => group.links).find(item => item.to === path));

function ThemeSwitch() {
  const { theme, toggleTheme } = useTheme();
  return <button className="btn btn-ghost design-switch" role="switch" aria-checked={theme === 'dark'}
    aria-label="Design zwischen hell und dunkel umschalten" onClick={toggleTheme}>
    <span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span>{theme === 'dark' ? 'Helles Design' : 'Dunkles Design'}
  </button>;
}

function MenuLinks({ groups, current, unread, onNavigate }) {
  return groups.map(group => <div className="nav-section" key={group.title}>
    <span className="nav-section-label">{group.title}</span>
    {group.links.map(item => <Link key={item.to} to={item.to} onClick={onNavigate}
      aria-current={current === item.to ? 'page' : undefined} className={current === item.to ? 'active' : undefined}>
      <span className="nav-icon" aria-hidden="true">{item.icon}</span><span>{item.label}</span>
      {item.to === '/benachrichtigungen' && unread > 0 && <span className="badge badge-neutral">{unread}</span>}
    </Link>)}
  </div>);
}

export default function Layout() {
  const location = useLocation();
  const navType = useNavigationType();
  const auth = useSyncExternalStore(authStore.subscribe, authStore.snapshot);
  const rolle = auth?.user?.rolle;
  const eingeloggt = Boolean(auth?.token);
  const [ungelesen, setUngelesen] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const dialog = useRef(null);
  const main = useRef(null);
  const lastPage = useRef(location.pathname);
  const positions = useRef(new Map());
  const groups = rolle === 'admin' || rolle === 'autor'
    ? [...GROUPS, { ...ADMIN, links: rolle === 'admin' ? ADMIN.links : ADMIN.links.slice(0, 1) }] : GROUPS;
  const path = location.pathname;
  const current = path.startsWith('/quiz/') ? '/lernen' : groups.flatMap(group => group.links)
    .filter(item => path === item.to || path.startsWith(item.to + '/'))
    .sort((a, b) => b.to.length - a.to.length)[0]?.to;
  const closeMenu = () => dialog.current?.close();

  useEffect(() => {
    if (!eingeloggt) { setUngelesen(0); return undefined; }
    let aktiv = true;
    async function laden() {
      try {
        const d = await api.get('/benachrichtigungen');
        if (aktiv) setUngelesen(d?.ungelesen || 0);
      } catch { /* Der Zähler ist optional. */ }
    }
    laden();
    const intervall = setInterval(laden, 60_000);
    return () => { aktiv = false; clearInterval(intervall); };
  }, [eingeloggt]);

  useEffect(() => {
    if (eingeloggt && path === '/benachrichtigungen') {
      api.get('/benachrichtigungen').then(d => setUngelesen(d?.ungelesen || 0)).catch(() => {});
    }
  }, [path, eingeloggt]);

  useEffect(() => {
    const wide = window.matchMedia('(min-width: 861px)');
    const resized = () => { if (wide.matches) closeMenu(); };
    wide.addEventListener('change', resized);
    return () => wide.removeEventListener('change', resized);
  }, []);

  useLayoutEffect(() => {
    let observer;
    let timer;
    const stop = () => { observer?.disconnect(); clearTimeout(timer); };
    const previous = positions.current.get(location.key);
    if (lastPage.current !== path) {
      closeMenu();
      main.current?.focus({ preventScroll: true });
      if (!location.hash || (path === '/notizen' && location.hash.startsWith('#notiz='))) {
        const target = navType === 'POP' ? previous || 0 : 0;
        const restore = () => {
          window.scrollTo({ top: target, behavior: 'instant' });
          if (Math.abs(window.scrollY - target) < 2) stop();
        };
        if (target > 0) {
          observer = new ResizeObserver(restore);
          observer.observe(main.current);
          timer = setTimeout(stop, 1800);
        }
        restore();
      }
    }
    lastPage.current = path;
    const remember = () => {
      positions.current.set(location.key, window.scrollY);
      if (positions.current.size > 80) positions.current.delete(positions.current.keys().next().value);
    };
    window.addEventListener('scroll', remember, { passive: true });
    for (const event of ['wheel', 'touchstart', 'keydown']) window.addEventListener(event, stop, { passive: true });
    return () => {
      stop();
      window.removeEventListener('scroll', remember);
      for (const event of ['wheel', 'touchstart', 'keydown']) window.removeEventListener(event, stop);
    };
  }, [location.key, location.hash, navType, path]);

  return <div className="app-layout">
    <a className="skip-content" href="#hauptinhalt">Zum Inhalt</a>
    <WillkommenModal />
    <AppTour />
    <aside className="sidebar">
      <Link className="logo" to="/dashboard" aria-label="AzubiPrep Dashboard"><span className="logo-badge" aria-hidden="true">A</span>AzubiPrep</Link>
      <nav className="shell-menu" aria-label="Hauptnavigation">
        <MenuLinks groups={groups} current={current} unread={ungelesen} />
      </nav>
      <div className="sidebar-footer"><ThemeSwitch /></div>
    </aside>
    <main className="main" id="hauptinhalt" ref={main} tabIndex={-1}>
      {typeof location.state?.resultSearch === 'string' && !/^\/(quiz|lernen)\//.test(path) && path !== '/suche' &&
        <Link className="search-return" to={{ pathname: '/suche', search: location.state.resultSearch }}
          state={{ noteQuery: location.state.noteQuery, noteOwner: location.state.noteOwner }}>← Suchergebnisse</Link>}
      <Outlet />
    </main>
    <nav className="mobile-nav" aria-label="Schnellnavigation">
      {shortcuts.map(item => <Link key={item.to} to={item.to} aria-label={item.label}
        aria-current={current === item.to ? 'page' : undefined} className={current === item.to ? 'active' : undefined}>
        <span className="nav-icon" aria-hidden="true">{item.icon}</span>{item.short || item.label}
      </Link>)}
      <button type="button" className={current && !shortcuts.some(item => item.to === current) ? 'active' : undefined}
        aria-haspopup="dialog" aria-controls="app-menue" aria-expanded={menuOpen}
        onClick={() => { dialog.current.showModal(); setMenuOpen(true); }}>
        <span className="nav-icon" aria-hidden="true">☰</span>Menü
      </button>
    </nav>
    <dialog ref={dialog} id="app-menue" className="mobile-menu" aria-labelledby="app-menue-title"
      onClose={() => setMenuOpen(false)} onClick={event => { if (event.target === dialog.current) closeMenu(); }}>
      <div className="mobile-menu-body">
        <header><h2 id="app-menue-title">Menü</h2><button type="button" className="btn btn-ghost btn-sm" autoFocus onClick={closeMenu}>Schließen</button></header>
        <nav className="shell-menu" aria-label="Alle Bereiche"><MenuLinks groups={groups} current={current} unread={ungelesen} onNavigate={closeMenu} /></nav>
        <ThemeSwitch />
      </div>
    </dialog>
    <ToastHost />
  </div>;
}
