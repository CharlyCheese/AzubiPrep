import { Routes, Route, Navigate } from 'react-router-dom';
import { useSyncExternalStore } from 'react';
import Layout from './components/Layout.jsx';
import Landing from './pages/Landing.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Lernen from './pages/Lernen.jsx';
import Modul from './pages/Modul.jsx';
import Quiz from './pages/Quiz.jsx';
import Karteikarten from './pages/Karteikarten.jsx';
import Pruefung from './pages/Pruefung.jsx';
import PruefungLauf from './pages/PruefungLauf.jsx';
import PruefungErgebnis from './pages/PruefungErgebnis.jsx';
import PruefungVerlauf from './pages/PruefungVerlauf.jsx';
import Statistik from './pages/Statistik.jsx';
import Kalender from './pages/Kalender.jsx';
import Suche from './pages/Suche.jsx';
import Notizen from './pages/Notizen.jsx';
import Einstellungen from './pages/Einstellungen.jsx';
import Profil from './pages/Profil.jsx';
import Benachrichtigungen from './pages/Benachrichtigungen.jsx';
import Lernreise from './pages/Lernreise.jsx';
import Autoren from './pages/Autoren.jsx';
import { authStore } from './store/authStore.js';
import { landingBereitsGesehen } from './utils/landing.js';

// FE-012: beim allerersten Besuch (kein Konto UND Landing-Page noch nie
// gesehen/übersprungen) zur Landing-Page weiterleiten. Bewusst kein Zwang –
// sobald einmal übersprungen oder eingeloggt, landet man direkt wieder im
// Dashboard wie bisher (siehe utils/landing.js).
function Startpunkt() {
  const auth = useSyncExternalStore(authStore.subscribe, authStore.snapshot);
  if (!auth?.token && !landingBereitsGesehen()) {
    return <Navigate to="/willkommen" replace />;
  }
  return <Dashboard />;
}

export default function App() {
  return (
    <Routes>
      <Route path="willkommen" element={<Landing />} />
      <Route element={<Layout />}>
        <Route index element={<Startpunkt />} />
        <Route path="lernen" element={<Lernen />} />
        <Route path="lernen/:modulId" element={<Modul />} />
        <Route path="quiz/:modulId" element={<Quiz />} />
        <Route path="karteikarten" element={<Karteikarten />} />
        <Route path="pruefung" element={<Pruefung />} />
        <Route path="pruefung/lauf" element={<PruefungLauf />} />
        <Route path="pruefung/ergebnis" element={<PruefungErgebnis />} />
        <Route path="pruefung/verlauf" element={<PruefungVerlauf />} />
        <Route path="statistik" element={<Statistik />} />
        <Route path="kalender" element={<Kalender />} />
        <Route path="suche" element={<Suche />} />
        <Route path="notizen" element={<Notizen />} />
        <Route path="einstellungen" element={<Einstellungen />} />
        <Route path="profil" element={<Profil />} />
        <Route path="benachrichtigungen" element={<Benachrichtigungen />} />
        <Route path="autoren" element={<Autoren />} />
        <Route path="lernreise" element={<Lernreise />} />
        <Route path="*" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}
