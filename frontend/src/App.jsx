import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
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
import Lernreise from './pages/Lernreise.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
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
        <Route path="lernreise" element={<Lernreise />} />
        <Route path="*" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}
