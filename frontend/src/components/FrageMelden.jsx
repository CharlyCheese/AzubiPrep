// BE-003: "Frage melden" – Button + kleines Formular, nur sichtbar bei
// aktivem Login UND aktiver Content-DB (ohne DB gibt es kein
// review_status, das gesetzt werden könnte). Wird pro Frage neu gemountet
// (der Aufrufer schlüsselt die Karte über frage.id), daher kein eigener
// Reset-Mechanismus nötig.
import { useState, useSyncExternalStore } from 'react';
import { useApi } from '../utils/useApi.js';
import { api } from '../api/client.js';
import { authStore } from '../store/authStore.js';

export default function FrageMelden({ frageId }) {
  const auth = useSyncExternalStore(authStore.subscribe, authStore.snapshot);
  const { daten: status } = useApi(() => api.get('/status'), []);

  const [offen, setOffen] = useState(false);
  const [grund, setGrund] = useState('');
  const [senden, setSenden] = useState(false);
  const [gemeldet, setGemeldet] = useState(false);
  const [fehler, setFehler] = useState('');

  if (!auth?.token || !status?.syncAktiviert) return null;

  if (gemeldet) {
    return <div className="small text-muted mt-2">Danke, die Frage wurde gemeldet ✓</div>;
  }

  if (!offen) {
    return (
      <button type="button" className="btn btn-ghost btn-sm mt-2" onClick={() => setOffen(true)}>
        🚩 Frage melden
      </button>
    );
  }

  async function absenden() {
    setSenden(true);
    setFehler('');
    try {
      await api.post(`/fragen/${frageId}/melden`, { grund });
      setGemeldet(true);
    } catch (err) {
      setFehler(err.message);
    } finally {
      setSenden(false);
    }
  }

  return (
    <div className="mt-2">
      <textarea
        className="input"
        rows={2}
        placeholder="Was ist falsch/unklar? (optional)"
        value={grund}
        onChange={(e) => setGrund(e.target.value)}
      />
      <div className="mt-1">
        <button type="button" className="btn btn-primary btn-sm" onClick={absenden} disabled={senden}>
          Melden absenden
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOffen(false)} disabled={senden} style={{ marginLeft: 8 }}>
          Abbrechen
        </button>
      </div>
      {fehler && <div className="small mt-1">Fehler: {fehler}</div>}
    </div>
  );
}
