// BE-001: Opt-in/Opt-out für Push-Benachrichtigungen, in den Einstellungen
// unter "Konto & Synchronisierung" eingebunden (nur sichtbar, wenn
// eingeloggt UND der Server Push anbietet, siehe /api/status.pushAktiviert
// – ohne Konto ergibt eine Subscription keinen Sinn, siehe BE-001-Brief,
// Entscheidung "Variante A").
import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { pushWirdUnterstuetzt, aktuelleSubscription, pushAbonnieren } from '../utils/push.js';

export default function PushEinstellungen() {
  const [unterstuetzt] = useState(pushWirdUnterstuetzt());
  const [aktiv, setAktiv] = useState(false);
  const [laden, setLaden] = useState(false);
  const [meldung, setMeldung] = useState('');

  useEffect(() => {
    if (!unterstuetzt) return;
    aktuelleSubscription().then((sub) => setAktiv(Boolean(sub))).catch(() => {});
  }, [unterstuetzt]);

  async function aktivieren() {
    setLaden(true);
    setMeldung('');
    try {
      const { publicKey } = await api.get('/push/public-key');
      if (!publicKey) throw new Error('Push ist auf diesem Server nicht konfiguriert.');
      const subscription = await pushAbonnieren(publicKey);
      const roh = subscription.toJSON();
      await api.post('/push/subscribe', { endpoint: roh.endpoint, keys: roh.keys });
      setAktiv(true);
      setMeldung('Benachrichtigungen aktiviert ✓');
    } catch (err) {
      setMeldung(`Fehler: ${err.message}`);
    } finally {
      setLaden(false);
    }
  }

  async function deaktivieren() {
    setLaden(true);
    setMeldung('');
    try {
      const sub = await aktuelleSubscription();
      if (sub) {
        await api.post('/push/unsubscribe', { endpoint: sub.endpoint });
        await sub.unsubscribe();
      }
      setAktiv(false);
      setMeldung('Benachrichtigungen deaktiviert.');
    } catch (err) {
      setMeldung(`Fehler: ${err.message}`);
    } finally {
      setLaden(false);
    }
  }

  if (!unterstuetzt) {
    return <p className="small text-muted mt-2">Push-Benachrichtigungen werden von diesem Browser/Gerät nicht unterstützt.</p>;
  }

  return (
    <div className="mt-2">
      <p className="text-muted mt-0 mb-1">
        Benachrichtigt dich z. B., wenn eine von dir gemeldete Frage bearbeitet wurde.
      </p>
      <button type="button" className="btn btn-ghost" onClick={aktiv ? deaktivieren : aktivieren} disabled={laden}>
        {laden ? '…' : aktiv ? '🔕 Benachrichtigungen deaktivieren' : '🔔 Benachrichtigungen aktivieren'}
      </button>
      {meldung && <p className="small mt-1">{meldung}</p>}
    </div>
  );
}
