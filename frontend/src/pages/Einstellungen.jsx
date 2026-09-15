import { useState, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../utils/useApi.js';
import { api } from '../api/client.js';
import { profileStore, resetAll } from '../store/localStore.js';
import { authStore } from '../store/authStore.js';
import { hochladen, herunterladen } from '../api/sync.js';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Einstellungen() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { daten: fachrichtungen } = useApi(() => api.get('/fachrichtungen'), []);
  const { daten: status } = useApi(() => api.get('/status'), []);
  const [profil, setProfil] = useState(profileStore.get());
  const [meldung, setMeldung] = useState('');

  const auth = useSyncExternalStore(authStore.subscribe, authStore.snapshot);
  const syncAktiviert = Boolean(status?.syncAktiviert);
  const eingeloggt = Boolean(auth?.token);

  // Login-/Registrier-Formular
  const [modus, setModus] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [passwort, setPasswort] = useState('');
  const [kontoLaden, setKontoLaden] = useState(false);
  const [kontoFehler, setKontoFehler] = useState('');
  const [syncLaden, setSyncLaden] = useState(false);
  const [syncMeldung, setSyncMeldung] = useState('');

  async function kontoAbsenden(e) {
    e.preventDefault();
    setKontoLaden(true);
    setKontoFehler('');
    try {
      const pfad = modus === 'login' ? '/auth/login' : '/auth/register';
      const body = modus === 'login'
        ? { email, passwort }
        : { email, passwort, fachrichtung: profil.fachrichtung };
      const erg = await api.post(pfad, body);
      authStore.setSession(erg.token, erg.user);
      // Das Konto (SQL) ist jetzt die bevorzugte Quelle für die
      // Fachrichtung – lokal übernehmen, falls im Konto hinterlegt (bei
      // Login eines Bestandskontos kann sie z. B. von der aktuellen
      // lokalen Auswahl abweichen).
      if (erg.user?.fachrichtung) {
        const neu = { ...profileStore.get(), fachrichtung: erg.user.fachrichtung };
        profileStore.set(neu);
        setProfil(neu);
      }
      setEmail('');
      setPasswort('');
    } catch (err) {
      setKontoFehler(err.message);
    } finally {
      setKontoLaden(false);
    }
  }

  function abmelden() {
    authStore.logout();
    setSyncMeldung('');
  }

  async function syncHochladen() {
    setSyncLaden(true);
    setSyncMeldung('');
    try {
      const anzahl = await hochladen();
      setSyncMeldung(`${anzahl} Bereiche hochgeladen ✓`);
    } catch (err) {
      setSyncMeldung(`Fehler: ${err.message}`);
    } finally {
      setSyncLaden(false);
    }
  }

  async function syncHerunterladen() {
    if (!confirm('Lokalen Lernstand mit dem Serverstand überschreiben? Nicht hochgeladene lokale Änderungen gehen dabei verloren.')) return;
    setSyncLaden(true);
    setSyncMeldung('');
    try {
      const anzahl = await herunterladen();
      setProfil(profileStore.get());
      setSyncMeldung(`${anzahl} Bereiche heruntergeladen ✓`);
    } catch (err) {
      setSyncMeldung(`Fehler: ${err.message}`);
    } finally {
      setSyncLaden(false);
    }
  }

  function speichern() {
    profileStore.set(profil);
    setMeldung('Einstellungen gespeichert ✓');
    setTimeout(() => setMeldung(''), 2500);
  }

  function reset() {
    if (!confirm('Wirklich alle lokalen Lerndaten löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) return;
    resetAll();
    setProfil(profileStore.get());
    navigate('/');
  }

  return (
    <div>
      <header className="main-header">
        <div>
          <h1 className="mb-0">Einstellungen & Profil</h1>
          <p className="text-muted mt-0">
            Dein Lernprofil liegt lokal auf diesem Gerät – Login ist optional
            {syncAktiviert ? ' und nur für die geräteübergreifende Synchronisierung nötig.' : ' (auf diesem Server derzeit nicht verfügbar).'}
          </p>
        </div>
      </header>

      <div className="card mb-2">
        <h2>Lernprofil</h2>
        <div className="field">
          <label>Anzeigename</label>
          <input className="input" value={profil.name || ''} onChange={(e) => setProfil({ ...profil, name: e.target.value })} />
        </div>
        <div className="field">
          <label>Fachrichtung</label>
          <select className="select" value={profil.fachrichtung || 'FIAE'} onChange={(e) => setProfil({ ...profil, fachrichtung: e.target.value })}>
            {(fachrichtungen || []).map((fr) => (
              <option key={fr.code} value={fr.code}>{fr.code} – {fr.name}</option>
            ))}
          </select>
          <div className="field-hint">
            Nur eine Vorauswahl/Priorität (z. B. Standard bei Prüfungssimulation und Lernreise) – der Lernbereich
            zeigt dir trotzdem immer alle Module aller Fachrichtungen.
            {syncAktiviert && eingeloggt ? ' Wird mit deinem Konto synchronisiert, sobald du „Jetzt hochladen" nutzt.' : ''}
          </div>
        </div>
        <div className="field">
          <label>Prüfungstermin (optional)</label>
          <input
            type="date"
            className="input"
            value={profil.prüfungstermin ? profil.prüfungstermin.slice(0, 10) : ''}
            onChange={(e) => setProfil({ ...profil, prüfungstermin: e.target.value || null })}
          />
          <div className="field-hint">Wird für die Rückwärtsplanung im Lernkalender genutzt.</div>
        </div>
        {meldung && <div className="alert alert-success">{meldung}</div>}
        <button className="btn btn-primary" onClick={speichern}>Speichern</button>
      </div>

      {syncAktiviert && (
        <div className="card mb-2">
          <h2>Konto & Synchronisierung</h2>
          {eingeloggt ? (
            <>
              <p className="text-muted mt-0">
                Angemeldet als <strong>{auth.user?.email}</strong>. Der Sync ist bewusst manuell:
                du entscheidest, wann lokaler und Server-Stand abgeglichen werden.
              </p>
              {syncMeldung && <div className={`alert ${syncMeldung.startsWith('Fehler') ? 'alert-danger' : 'alert-success'}`}>{syncMeldung}</div>}
              <div className="flex wrap">
                <button className="btn btn-primary" onClick={syncHochladen} disabled={syncLaden}>
                  {syncLaden ? '…' : '⬆ Jetzt hochladen'}
                </button>
                <button className="btn btn-ghost" onClick={syncHerunterladen} disabled={syncLaden}>
                  {syncLaden ? '…' : '⬇ Jetzt herunterladen'}
                </button>
                <button className="btn btn-ghost" onClick={abmelden} disabled={syncLaden}>Abmelden</button>
              </div>
            </>
          ) : (
            <>
              <p className="text-muted mt-0">
                Optional: mit einem Konto kannst du deinen Lernstand manuell zwischen
                Geräten synchronisieren. Ohne Konto funktioniert die App unverändert rein lokal.
              </p>
              <form onSubmit={kontoAbsenden}>
                <div className="grid grid-2">
                  <div className="field">
                    <label>E-Mail</label>
                    <input type="email" className="input" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Passwort</label>
                    <input type="password" className="input" required minLength={8} value={passwort} onChange={(e) => setPasswort(e.target.value)} />
                    {modus === 'register' && (
                      <div className="field-hint">
                        Mind. 8 Zeichen, mit Groß- und Kleinbuchstaben, einer Zahl und einem Sonderzeichen (z. B. „Azubi2026!").
                      </div>
                    )}
                  </div>
                </div>
                {modus === 'register' && (
                  <div className="field">
                    <label>Fachrichtung</label>
                    <select
                      className="select"
                      value={profil.fachrichtung || 'FIAE'}
                      onChange={(e) => setProfil({ ...profil, fachrichtung: e.target.value })}
                    >
                      {(fachrichtungen || []).map((fr) => (
                        <option key={fr.code} value={fr.code}>{fr.code} – {fr.name}</option>
                      ))}
                    </select>
                    <div className="field-hint">Wird mit deinem Konto gespeichert – nur eine Vorauswahl, keine Zugriffsbeschränkung.</div>
                  </div>
                )}
                {kontoFehler && <div className="alert alert-danger">{kontoFehler}</div>}
                <div className="flex wrap">
                  <button className="btn btn-primary" disabled={kontoLaden}>
                    {kontoLaden ? '…' : modus === 'login' ? 'Anmelden' : 'Registrieren'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => { setModus(modus === 'login' ? 'register' : 'login'); setKontoFehler(''); }}
                  >
                    {modus === 'login' ? 'Noch kein Konto? Registrieren' : 'Schon registriert? Anmelden'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}

      <div className="card mb-2">
        <h2>Darstellung</h2>
        <button className="btn btn-ghost" onClick={toggleTheme}>
          {theme === 'dark' ? '☀️ Helles Design aktivieren' : '🌙 Dunkles Design aktivieren'}
        </button>
      </div>

      <div className="card mb-2">
        <h2>Datenschutz & Hinweise</h2>
        <ul className="small text-muted" style={{ paddingLeft: 18 }}>
          <li>
            Alle Lernstände, Notizen, Karteikarten und Einstellungen liegen <strong>grundsätzlich lokal im
            Browser</strong> dieses Geräts (localStorage).
            {syncAktiviert
              ? ' Nur wenn du dich freiwillig registrierst und aktiv „Jetzt hochladen" nutzt, wird dein Lernstand zusätzlich auf dem Server gespeichert (Passwörter werden dabei ausschließlich als Hash abgelegt, nie im Klartext).'
              : ' Es gibt kein Benutzerkonto und keine Speicherung auf dem Server.'}
          </li>
          <li>
            Auf gemeinsam genutzten Geräten kann jede Person diese lokalen Daten einsehen. Sichere Notizen bei
            Bedarf über den Export und nutze danach „Alle lokalen Lerndaten löschen“.
          </li>
          <li>
            AzubiPrep ist ein <strong>Lernwerkzeug zur Selbstkontrolle</strong>; Ergebnisse sind nicht
            zertifiziert und ersetzen keinen Prüfungsnachweis.
          </li>
          <li>
            Fragen und Lösungen werden über die lokale API geladen – die Lösungen sind dort technisch abrufbar.
            Bitte als Lernhilfe nutzen (Details in docs/17-Sicherheit.md).
          </li>
        </ul>
      </div>

      <div className="card">
        <h2 style={{ color: 'var(--danger-ink)' }}>Gefahrenzone</h2>
        <p className="text-muted">Löscht Fortschritt, Karteikarten, Notizen und Prüfungsverlauf auf diesem Gerät.</p>
        <button className="btn btn-danger" onClick={reset}>Alle lokalen Lerndaten löschen</button>
      </div>
    </div>
  );
}
