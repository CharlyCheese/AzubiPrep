import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApi } from '../utils/useApi.js';
import { api } from '../api/client.js';
import { profileStore, progressStore } from '../store/localStore.js';
import { setExamState } from '../store/examStore.js';
import { mischeOptionen } from '../utils/optionen.js';

// Mindestanzahl Versuche je Thema, bevor eine Quote als aussagekräftig
// gilt – ein einziger Zufallstreffer/-fehler soll ein Thema nicht sofort
// als "Schwäche" markieren.
const MIN_VERSUCHE_JE_THEMA = 3;
// Dieselbe Schwelle wie bei "Stärken/Schwächen" in der Auswertung
// (backend/src/exam.js#auswertePruefung), damit "Schwäche" im Produkt
// überall dasselbe bedeutet.
const SCHWAECHE_SCHWELLE_PROZENT = 60;
// Gewichtsfaktor für schwache Themen (siehe backend/src/exam.js#mischen:
// höheres Gewicht senkt den Zufalls-Schlüssel im Schnitt, das Thema landet
// dadurch häufiger unter den ersten gezogenen Fragen).
const SCHWAECHE_GEWICHT = 3;

/**
 * Themengewichtung für die Prüfungsgenerierung (FE-018): Themen, in denen
 * bisher unter `SCHWAECHE_SCHWELLE_PROZENT` % richtig beantwortet wurde
 * (bei mindestens `MIN_VERSUCHE_JE_THEMA` Versuchen), bekommen ein erhöhtes
 * Gewicht und werden dadurch häufiger gezogen. Themen ohne ausreichend
 * Daten bleiben absichtlich ohne Eintrag – das Backend behandelt einen
 * fehlenden Schlüssel bereits wie Gewicht 1 (siehe exam.js#mischen).
 */
function berechneGewichtung(alleFragen, fachrichtungCode) {
  if (!alleFragen?.length) return {};
  const passend = alleFragen.filter(
    (f) => f.fachrichtung === fachrichtungCode || f.fachrichtung === 'ALLE',
  );
  const fortschritt = progressStore.get();

  const proThema = {};
  for (const f of passend) {
    const eintrag = fortschritt[f.id];
    if (!eintrag) continue;
    const gesamt = (eintrag.richtig || 0) + (eintrag.falsch || 0);
    if (gesamt === 0) continue;
    if (!proThema[f.thema]) proThema[f.thema] = { richtig: 0, gesamt: 0 };
    proThema[f.thema].richtig += eintrag.richtig || 0;
    proThema[f.thema].gesamt += gesamt;
  }

  const gewichtung = {};
  for (const [thema, stats] of Object.entries(proThema)) {
    if (stats.gesamt < MIN_VERSUCHE_JE_THEMA) continue;
    const quote = (stats.richtig / stats.gesamt) * 100;
    if (quote < SCHWAECHE_SCHWELLE_PROZENT) gewichtung[thema] = SCHWAECHE_GEWICHT;
  }
  return gewichtung;
}

export default function Pruefung() {
  const navigate = useNavigate();
  const profil = profileStore.get();
  const { daten: fachrichtungen } = useApi(() => api.get('/fachrichtungen'), []);
  // Ungefiltert wie in PruefungVerlauf.jsx – die Fachrichtungs-/ALLE-Filterung
  // passiert client-seitig in berechneGewichtung(), spiegelt exakt die
  // serverseitige Logik aus content.js#fragenFuerFachrichtung.
  const { daten: alleFragen } = useApi(() => api.get('/fragen'), []);

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
      const gewichtung = berechneGewichtung(alleFragen, fachrichtung);
      const erg = await api.post('/pruefung/generieren', { fachrichtung, anzahl, schwierigkeit, gewichtung });
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
          (inkl. gemeinsamer Module WiSo/Projektmanagement) und zieht Themen, in denen du bisher unter 60 %
          richtig lagst, dabei bevorzugt. Bestehensgrenze: 50 %.
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
