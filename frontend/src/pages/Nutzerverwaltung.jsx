// BE-007: admin-only Seite zum Erzeugen von Passwort-Reset-Links. Bewusst
// schlank (nur Liste + Reset-Button), keine vollständige Nutzerverwaltung
// (Rollenvergabe bleibt weiterhin bewusst per SQL, siehe CONTENT-001-Brief)
// – dieser Task deckt gezielt nur BE-007 (Passwort-Reset) ab.
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../utils/useApi.js';
import { api } from '../api/client.js';
import { authStore } from '../store/authStore.js';
import '../styles/account.css';

export default function Nutzerverwaltung() {
  const auth = useSyncExternalStore(authStore.subscribe, authStore.snapshot);
  const istAdmin = Boolean(auth?.token) && auth.user?.rolle === 'admin';

  const { daten: nutzer, laden, fehler } = useApi(
    () => (istAdmin ? api.get('/admin/users') : Promise.resolve([])),
    [istAdmin],
  );

  const [linkFuer, setLinkFuer] = useState(null); // { email, link, laeuftAbAm }
  const [erzeugenFehler, setErzeugenFehler] = useState('');
  const [pendingId, setPendingId] = useState(null);
  const [suche, setSuche] = useState('');
  const [kopierMeldung, setKopierMeldung] = useState('');
  const linkRef = useRef(null);
  const triggerRef = useRef(null);
  const suchRef = useRef(null);
  const gefiltert = (nutzer || []).filter(n => n.email.toLowerCase().includes(suche.trim().toLowerCase()));

  useEffect(() => {
    if (linkFuer) linkRef.current?.focus();
  }, [linkFuer]);

  async function resetLinkErzeugen(nutzerEintrag, trigger) {
    triggerRef.current = trigger;
    setPendingId(nutzerEintrag.id);
    setErzeugenFehler('');
    setKopierMeldung('');
    setLinkFuer(null);
    try {
      const erg = await api.post(`/admin/users/${nutzerEintrag.id}/passwort-reset`, {});
      const link = `${window.location.origin}/passwort-zuruecksetzen?token=${erg.token}`;
      setLinkFuer({ email: erg.email, link, laeuftAbAm: erg.laeuftAbAm });
    } catch (err) {
      setErzeugenFehler(err.message);
    } finally {
      setPendingId(null);
    }
  }

  async function linkKopieren() {
    try {
      await navigator.clipboard.writeText(linkFuer.link);
      setKopierMeldung('Link kopiert.');
    } catch {
      linkRef.current?.focus();
      setKopierMeldung('Kopiere den markierten Link über das Kontextmenü oder die Tastatur.');
    }
  }

  if (!auth?.token) {
    return (
      <div>
        <header className="main-header"><h1 className="mb-0">Nutzerverwaltung</h1></header>
        <div className="card">
          <p className="text-muted">Melde dich mit einem Admin-Konto an, um Konten zu verwalten.</p>
          <Link className="btn btn-primary" to="/profil#konto">Zur Anmeldung</Link>
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
          <Link className="btn btn-ghost" to="/profil">Zum Profil</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="account-page">
      <header className="main-header">
        <div>
          <h1 className="mb-0">Nutzerverwaltung</h1>
          <p className="text-muted mt-0">
            Erzeuge einen Link zum Zurücksetzen des Passworts und gib ihn persönlich oder per Chat weiter.
          </p>
        </div>
      </header>

      {linkFuer && (
        <div className="card mb-2">
          <div className="flex-between wrap mb-1">
            <h2 className="mb-0">Reset-Link für {linkFuer.email}</h2>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => {
              setLinkFuer(null);
              (triggerRef.current?.isConnected ? triggerRef.current : suchRef.current)?.focus();
            }}>Schließen</button>
          </div>
          <p className="small text-muted mt-0">
            Nur jetzt sichtbar – wird nicht erneut angezeigt. Gültig bis{' '}
            {new Date(linkFuer.laeuftAbAm).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })}.
          </p>
          <label htmlFor="admin-reset-link">Einmal-Link für {linkFuer.email}</label>
          <input id="admin-reset-link" className="input" ref={linkRef} readOnly value={linkFuer.link} onFocus={(e) => e.target.select()} />
          <button type="button" className="btn btn-primary btn-sm mt-1" onClick={linkKopieren}>Link kopieren</button>
          {kopierMeldung && <p role="status" className="small">{kopierMeldung}</p>}
        </div>
      )}
      {erzeugenFehler && <div className="alert alert-danger" role="alert">{erzeugenFehler}</div>}

      {laden && <p className="text-muted">Lädt …</p>}
      {fehler && <p className="text-muted">Fehler: {fehler}</p>}

      {!laden && !fehler && (
        <div className="card">
          <label htmlFor="admin-kontosuche">Konto nach E-Mail suchen</label>
          <input type="search" className="input" id="admin-kontosuche" ref={suchRef} value={suche} onChange={e => setSuche(e.target.value)} />
          <ul className="management-list" aria-label="Konten">
            {gefiltert.map(n => <li key={n.id}>
              <div>
                <strong>{n.email}</strong>
                <div className="small text-muted">Fachrichtung: {n.fachrichtung || '–'} · Rolle: {n.rolle}</div>
              </div>
              <button type="button" className="btn btn-ghost btn-sm" aria-label={`Reset-Link erzeugen für ${n.email}`}
                disabled={pendingId !== null} onClick={e => resetLinkErzeugen(n, e.currentTarget)}>
                {pendingId === n.id ? 'Link wird erzeugt …' : 'Reset-Link erzeugen'}
              </button>
            </li>)}
          </ul>
          {gefiltert.length === 0 && <p role="status" className="text-muted">{nutzer?.length ? 'Kein Konto für diese Suche gefunden.' : 'Keine Konten vorhanden.'}</p>}
        </div>
      )}
    </div>
  );
}
