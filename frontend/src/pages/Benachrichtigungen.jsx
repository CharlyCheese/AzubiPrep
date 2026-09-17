// FE-014/BE-005: eigener Bereich für Benachrichtigungen ("Mailbox"), aus
// den Einstellungen herausgelöst. Zeigt die Benachrichtigungs-Historie
// (bewusst generisch – aktuell nur Systemereignisse wie "Meldung
// bearbeitet"/"Neue Meldung", später ggf. auch private Nachrichten
// zwischen Nutzern, ohne dass Backend/Route dafür nochmal umgebaut werden
// müssten) sowie den Push-Ein/Aus-Schalter (PushEinstellungen, aus BE-001).
import { useState, useSyncExternalStore } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApi } from '../utils/useApi.js';
import { api } from '../api/client.js';
import { authStore } from '../store/authStore.js';
import PushEinstellungen from '../components/PushEinstellungen.jsx';

function formatiereZeit(iso) {
  try {
    return new Date(iso).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

export default function Benachrichtigungen() {
  const navigate = useNavigate();
  const auth = useSyncExternalStore(authStore.subscribe, authStore.snapshot);
  const { daten: status } = useApi(() => api.get('/status'), []);
  const syncAktiviert = Boolean(status?.syncAktiviert);
  const eingeloggt = Boolean(auth?.token);

  // BE-006: zweite Ansicht fürs Archiv, gleicher Endpunkt mit ?ansicht=archiv.
  const [ansicht, setAnsicht] = useState('aktiv'); // 'aktiv' | 'archiv'
  const [reloadKey, setReloadKey] = useState(0);
  const { daten, laden, fehler } = useApi(
    () => (eingeloggt && syncAktiviert
      ? api.get(`/benachrichtigungen${ansicht === 'archiv' ? '?ansicht=archiv' : ''}`)
      : Promise.resolve({ eintraege: [], ungelesen: 0 })),
    [eingeloggt, syncAktiviert, ansicht, reloadKey],
  );
  const eintraege = daten?.eintraege || [];

  async function oeffnen(eintrag) {
    if (!eintrag.gelesen_am) {
      await api.post(`/benachrichtigungen/${eintrag.id}/gelesen`, {}).catch(() => {});
      setReloadKey((k) => k + 1);
    }
    if (eintrag.url) navigate(eintrag.url);
  }

  async function alleAlsGelesen() {
    await api.post('/benachrichtigungen/alle-gelesen', {}).catch(() => {});
    setReloadKey((k) => k + 1);
  }

  // BE-006: Archivieren/Wiederherstellen/Löschen – stopPropagation, damit
  // der Klick auf den Button nicht gleichzeitig oeffnen() auf der Karte
  // auslöst (Navigation zur verlinkten Seite).
  async function archivieren(e, eintrag) {
    e.stopPropagation();
    await api.post(`/benachrichtigungen/${eintrag.id}/archivieren`, {}).catch(() => {});
    setReloadKey((k) => k + 1);
  }

  async function wiederherstellen(e, eintrag) {
    e.stopPropagation();
    await api.post(`/benachrichtigungen/${eintrag.id}/wiederherstellen`, {}).catch(() => {});
    setReloadKey((k) => k + 1);
  }

  async function loeschen(e, eintrag) {
    e.stopPropagation();
    if (!confirm('Diese Benachrichtigung endgültig löschen? Das kann nicht rückgängig gemacht werden.')) return;
    await api.del(`/benachrichtigungen/${eintrag.id}`).catch(() => {});
    setReloadKey((k) => k + 1);
  }

  if (!syncAktiviert) {
    return (
      <div>
        <header className="main-header"><h1 className="mb-0">Benachrichtigungen</h1></header>
        <div className="card">
          <p className="text-muted">Auf diesem Server ist kein Konto/Sync verfügbar – Benachrichtigungen setzen ein Konto voraus.</p>
        </div>
      </div>
    );
  }

  if (!eingeloggt) {
    return (
      <div>
        <header className="main-header"><h1 className="mb-0">Benachrichtigungen</h1></header>
        <div className="card">
          <p className="text-muted">Bitte zuerst in <Link to="/profil">Profil</Link> einloggen, um Benachrichtigungen zu sehen.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="main-header">
        <div>
          <h1 className="mb-0">Benachrichtigungen</h1>
          <p className="text-muted mt-0">
            {daten?.ungelesen > 0 ? `${daten.ungelesen} ungelesen` : 'Alles gelesen'}
          </p>
        </div>
      </header>

      <div className="card mb-2">
        <h2>Push-Benachrichtigungen</h2>
        {status?.pushAktiviert
          ? <PushEinstellungen />
          : <p className="small text-muted mt-2">Push ist auf diesem Server nicht konfiguriert – die Liste unten funktioniert trotzdem.</p>}
      </div>

      {laden && <p className="text-muted">Lädt …</p>}
      {fehler && <p className="text-muted">Fehler: {fehler}</p>}

      {!laden && !fehler && (
        <div className="card">
          <div className="flex-between wrap mb-2">
            <h2 className="mb-0">{ansicht === 'archiv' ? 'Archiv' : 'Verlauf'}</h2>
            <div className="flex wrap" style={{ gap: 8 }}>
              {ansicht === 'aktiv' && daten?.ungelesen > 0 && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={alleAlsGelesen}>Alle als gelesen markieren</button>
              )}
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setAnsicht(ansicht === 'archiv' ? 'aktiv' : 'archiv')}
              >
                {ansicht === 'archiv' ? '← Zurück zum Verlauf' : 'Archiv anzeigen'}
              </button>
            </div>
          </div>
          {eintraege.length === 0 && (
            <p className="text-muted">
              {ansicht === 'archiv' ? 'Noch nichts archiviert.' : 'Noch keine Benachrichtigungen.'}
            </p>
          )}
          {eintraege.map((e) => (
            <div
              key={e.id}
              className="card mb-1"
              style={{ cursor: 'pointer', borderLeft: e.gelesen_am ? undefined : '3px solid var(--primary)' }}
              onClick={() => oeffnen(e)}
            >
              <div className="flex-between wrap">
                <strong>{e.titel}</strong>
                <span className="small text-muted">{formatiereZeit(e.erstellt_am)}</span>
              </div>
              {e.text && <p className="text-muted mt-1 mb-0">{e.text}</p>}
              <div className="flex wrap mt-1" style={{ gap: 8 }}>
                {ansicht === 'archiv' ? (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={(ev) => wiederherstellen(ev, e)}>
                    Wiederherstellen
                  </button>
                ) : (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={(ev) => archivieren(ev, e)}>
                    Archivieren
                  </button>
                )}
                <button type="button" className="btn btn-ghost btn-sm" onClick={(ev) => loeschen(ev, e)} style={{ color: 'var(--danger-ink)' }}>
                  Löschen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
