// BE-007: admin-only Seite zum Erzeugen von Passwort-Reset-Links. Bewusst
// schlank (nur Liste + Reset-Button), keine vollständige Nutzerverwaltung
// (Rollenvergabe bleibt weiterhin bewusst per SQL, siehe CONTENT-001-Brief)
// – dieser Task deckt gezielt nur BE-007 (Passwort-Reset) ab.
import { useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../utils/useApi.js';
import { api } from '../api/client.js';
import { authStore } from '../store/authStore.js';

export default function Nutzerverwaltung() {
  const auth = useSyncExternalStore(authStore.subscribe, authStore.snapshot);
  const istAdmin = auth?.user?.rolle === 'admin';

  const [reloadKey, setReloadKey] = useState(0);
  const { daten: nutzer, laden, fehler } = useApi(
    () => (istAdmin ? api.get('/admin/users') : Promise.resolve([])),
    [istAdmin, reloadKey],
  );

  const [linkFuer, setLinkFuer] = useState(null); // { email, link, laeuftAbAm }
  const [erzeugenFehler, setErzeugenFehler] = useState('');

  async function resetLinkErzeugen(nutzerEintrag) {
    setErzeugenFehler('');
    setLinkFuer(null);
    try {
      const erg = await api.post(`/admin/users/${nutzerEintrag.id}/passwort-reset`, {});
      const link = `${window.location.origin}/passwort-zuruecksetzen?token=${erg.token}`;
      setLinkFuer({ email: erg.email, link, laeuftAbAm: erg.laeuftAbAm });
    } catch (err) {
      setErzeugenFehler(err.message);
    }
  }

  async function linkKopieren() {
    try {
      await navigator.clipboard.writeText(linkFuer.link);
    } catch {
      // Zwischenablage kann in manchen Kontexten (z. B. ohne HTTPS) fehlen –
      // der Link steht ohnehin sichtbar im Textfeld, einfach manuell markieren.
    }
  }

  if (!auth?.token) {
    return (
      <div>
        <header className="main-header"><h1 className="mb-0">Nutzerverwaltung</h1></header>
        <div className="card">
          <p className="text-muted">Bitte zuerst in <Link to="/profil">Profil</Link> einloggen.</p>
        </div>
      </div>
    );
  }

  if (!istAdmin) {
    return (
      <div>
        <header className="main-header"><h1 className="mb-0">Nutzerverwaltung</h1></header>
        <div className="card">
          <p className="text-muted">Dieser Bereich ist nur für Admin-Konten zugänglich.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="main-header">
        <div>
          <h1 className="mb-0">Nutzerverwaltung</h1>
          <p className="text-muted mt-0">
            Passwort-Reset-Links erzeugen. Der Link muss außerhalb der App
            (z. B. Chat, persönlich) an die Person geschickt werden – es gibt
            keinen automatischen E-Mail-Versand.
          </p>
        </div>
      </header>

      {linkFuer && (
        <div className="card mb-2">
          <div className="flex-between wrap mb-1">
            <h2 className="mb-0">Reset-Link für {linkFuer.email}</h2>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setLinkFuer(null)}>Schließen</button>
          </div>
          <p className="small text-muted mt-0">
            Nur jetzt sichtbar – wird nicht erneut angezeigt. Gültig bis{' '}
            {new Date(linkFuer.laeuftAbAm).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })}.
          </p>
          <input className="input" readOnly value={linkFuer.link} onFocus={(e) => e.target.select()} />
          <button type="button" className="btn btn-primary btn-sm mt-1" onClick={linkKopieren}>Link kopieren</button>
        </div>
      )}
      {erzeugenFehler && <div className="alert alert-danger">{erzeugenFehler}</div>}

      {laden && <p className="text-muted">Lädt …</p>}
      {fehler && <p className="text-muted">Fehler: {fehler}</p>}

      {!laden && !fehler && (
        <div className="card reise-tabelle-wrapper">
          <table className="reise-tabelle">
            <thead>
              <tr>
                <th>E-Mail</th>
                <th>Fachrichtung</th>
                <th>Rolle</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(nutzer || []).map((n) => (
                <tr key={n.id}>
                  <td>{n.email}</td>
                  <td className="small text-muted">{n.fachrichtung || '–'}</td>
                  <td><span className="badge badge-neutral">{n.rolle}</span></td>
                  <td><button type="button" className="btn btn-ghost btn-sm" onClick={() => resetLinkErzeugen(n)}>Reset-Link erzeugen</button></td>
                </tr>
              ))}
              {(nutzer || []).length === 0 && (
                <tr><td colSpan={4} className="text-muted">Keine Konten vorhanden.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
