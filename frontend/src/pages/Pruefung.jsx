import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApi } from '../utils/useApi.js';
import { api } from '../api/client.js';
import { profileStore } from '../store/localStore.js';
import { setExamState } from '../store/examStore.js';
import { mischeOptionen } from '../utils/optionen.js';

export default function Pruefung() {
  const navigate = useNavigate();
  const profil = profileStore.get();
  const { daten: fachrichtungen } = useApi(() => api.get('/fachrichtungen'), []);

  const [fachrichtung, setFachrichtung] = useState(profil.fachrichtung || 'FIAE');
  const [anzahl, setAnzahl] = useState(30);
  const [zeitlimit, setZeitlimit] = useState(60);
  const [schwierigkeit, setSchwierigkeit] = useState('alle');
  const [laden, setLaden] = useState(false);
  const [fehler, setFehler] = useState('');

  async function starten() {
    setLaden(true);
    setFehler('');
    try {
      const erg = await api.post('/pruefung/generieren', { fachrichtung, anzahl, schwierigkeit });
      setExamState({
        fragen: erg.fragen.map((f) => ({ ...f, gemischt: mischeOptionen(f) })),
        antworten: {},
        konfig: { fachrichtung, anzahl: erg.anzahl, zeitlimitMin: zeitlimit, schwierigkeit },
        startAm: new Date().toISOString(),
        ergebnis: null,
        gespeichert: false,
      });
      navigate('/pruefung/lauf');
    } catch (e) {
      setFehler(e.message);
    } finally {
      setLaden(false);
    }
  }

  return (
    <div>
      <header className="main-header">
        <div>
          <h1 className="mb-0">Prüfungssimulation</h1>
          <p className="text-muted mt-0">Simuliere die IHK-Prüfung mit Zeitlimit, Zufallsfragen und Themengewichtung.</p>
        </div>
      </header>

      <div className="card">
        <div className="field">
          <label>Fachrichtung</label>
          <select className="select" value={fachrichtung} onChange={(e) => setFachrichtung(e.target.value)}>
            {(fachrichtungen || []).map((fr) => (
              <option key={fr.code} value={fr.code}>{fr.code} – {fr.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-3">
          <div className="field">
            <label>Anzahl Fragen</label>
            <select className="select" value={anzahl} onChange={(e) => setAnzahl(Number(e.target.value))}>
              {[10, 15, 20, 30, 40, 60].map((n) => (
                <option key={n} value={n}>{n} Fragen</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Zeitlimit (Minuten)</label>
            <select className="select" value={zeitlimit} onChange={(e) => setZeitlimit(Number(e.target.value))}>
              {[15, 30, 45, 60, 90, 120].map((n) => (
                <option key={n} value={n}>{n} Minuten</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Schwierigkeit (optional)</label>
            <select className="select" value={schwierigkeit} onChange={(e) => setSchwierigkeit(e.target.value)}>
              <option value="alle">Alle Schwierigkeiten</option>
              <option value="leicht">Nur leicht</option>
              <option value="mittel">Nur mittel</option>
              <option value="schwer">Nur schwer</option>
            </select>
          </div>
        </div>

        <div className="alert alert-info">
          <strong>Hinweis:</strong> Die Simulation mischt zufällige Fragen aus allen Modulen deiner Fachrichtung
          (inkl. gemeinsamer Module WiSo/Projektmanagement). Bestehensgrenze: 50 %.
          <div className="small mt-1">
            Ergebnisse dienen der <strong>Selbstkontrolle</strong> und werden nur lokal gespeichert – sie
            sind kein zertifizierter Prüfungsnachweis.
          </div>
        </div>

        {fehler && <div className="alert alert-danger">{fehler}</div>}

        <button className="btn btn-primary btn-block" onClick={starten} disabled={laden}>
          {laden ? 'Generiere Prüfung …' : 'Prüfung starten ⏱'}
        </button>

        <div className="flex wrap mt-2">
          <Link className="btn btn-ghost btn-sm" to="/pruefung/verlauf">🗂️ Vergangene Prüfungen ansehen →</Link>
        </div>
      </div>
    </div>
  );
}
