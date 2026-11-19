// FE-014: aus Einstellungen.jsx herausgelöst – Lernprofil-Daten und
// Konto/Synchronisierung gehören inhaltlich zusammen ("alles rund um mich
// und mein Konto") und bekommen dadurch einen eigenen, direkt in der
// Navigation sichtbaren Bereich statt in den technischeren
// Einstellungen (Darstellung/Datenschutz/Gefahrenzone) unterzugehen.
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApi } from '../utils/useApi.js';
import { api } from '../api/client.js';
import { profileStore } from '../store/localStore.js';
import { authStore } from '../store/authStore.js';
import { hochladen, herunterladen } from '../api/sync.js';
import KontoFormular from '../components/KontoFormular.jsx';
import '../styles/account.css';

export default function Profil() {
  const { daten: fachrichtungen } = useApi(() => api.get('/fachrichtungen'), []);
  const { daten: status, fehler: statusFehler } = useApi(() => api.get('/status'), []);
  const [profil, setProfil] = useState(profileStore.get());
  const [meldung, setMeldung] = useState('');

  const auth = useSyncExternalStore(authStore.subscribe, authStore.snapshot);
  const syncAktiviert = Boolean(status?.syncAktiviert);
  const eingeloggt = Boolean(auth?.token);
  const location = useLocation();
  const kontoRef = useRef(null);
  useEffect(() => {
    if (location.hash === '#konto' && syncAktiviert) {
      kontoRef.current?.focus();
    }
  }, [location.key, location.hash, syncAktiviert]);

  const [syncLaden, setSyncLaden] = useState(false);
  const [syncMeldung, setSyncMeldung] = useState('');

  function kontoErfolg(erg) {
    // Das Konto (SQL) ist jetzt die bevorzugte Quelle für die
    // Fachrichtung – lokal übernehmen, falls im Konto hinterlegt (bei
    // Login eines Bestandskontos kann sie z. B. von der aktuellen
    // lokalen Auswahl abweichen).
    if (erg.user?.fachrichtung) {
      const neu = { ...profileStore.get(), fachrichtung: erg.user.fachrichtung };
      profileStore.set(neu);
      setProfil(neu);
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

  function speichern(event) {
    event.preventDefault();
    profileStore.set(profil);
    setMeldung('Profil gespeichert ✓');
    setTimeout(() => setMeldung(''), 2500);
  }

  return (
    <div className="account-page">
      <header className="main-header">
        <div>
          <h1 className="mb-0">Profil</h1>
          <p className="text-muted mt-0">
            Dein Lernprofil wird auf diesem Gerät gespeichert.
            {status && !syncAktiviert && ' Konten sind auf diesem Server deaktiviert.'}
            {statusFehler && ' Die Verfügbarkeit der Kontosynchronisierung konnte nicht geprüft werden.'}
          </p>
        </div>
        {syncAktiviert && <Link className="account-shortcut" to="#konto">{eingeloggt ? 'Zur Kontosynchronisierung' : 'Anmelden oder registrieren'}</Link>}
      </header>

      <div className="profile-grid">
        <form className="card" onSubmit={speichern}>
          <h2>Lernprofil</h2>
          <div className="field">
            <label htmlFor="profile-anzeigename">Anzeigename</label>
            <input id="profile-anzeigename" className="input" value={profil.name || ''} onChange={(e) => setProfil({ ...profil, name: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="profile-fachrichtung">Fachrichtung</label>
            <select id="profile-fachrichtung" className="select" value={profil.fachrichtung || 'FIAE'} onChange={(e) => setProfil({ ...profil, fachrichtung: e.target.value })}>
              {(fachrichtungen || []).map((fr) => (
                <option key={fr.code} value={fr.code}>{fr.code} – {fr.name}</option>
              ))}
            </select>
            <div className="field-hint">
              Vorauswahl für Lernreise und Prüfungssimulation. Im Lernbereich stehen dir alle Module offen.
              {syncAktiviert && eingeloggt ? ' Wird mit deinem Konto synchronisiert, sobald du „Jetzt hochladen" nutzt.' : ''}
            </div>
          </div>
          <div className="field">
            <label htmlFor="profile-prufungstermin-optional">Prüfungstermin (optional)</label>
            <input id="profile-prufungstermin-optional"
              type="date"
              className="input"
              value={profil.prüfungstermin ? profil.prüfungstermin.slice(0, 10) : ''}
              onChange={(e) => setProfil({ ...profil, prüfungstermin: e.target.value || null })}
            />
            <div className="field-hint">Wird für die Rückwärtsplanung im Lernkalender genutzt.</div>
          </div>
          {meldung && <div className="alert alert-success" role="status">{meldung}</div>}
          <button className="btn btn-primary" type="submit">Speichern</button>
        </form>

        {syncAktiviert && (
          <section className="card" aria-labelledby="konto">
            <h2 id="konto" ref={kontoRef} tabIndex={-1}>Konto & Synchronisierung</h2>
            {eingeloggt ? (
              <>
                <p className="text-muted mt-0">
                  Angemeldet als <strong>{auth.user?.email}</strong>. Lade deinen Lernstand auf den Server hoch oder übernimm den Serverstand auf diesem Gerät.
                </p>
                {syncMeldung && <div role="status" className={`alert ${syncMeldung.startsWith('Fehler') ? 'alert-danger' : 'alert-success'}`}>{syncMeldung}</div>}
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
                  Mit einem Konto kannst du deinen Lernstand zwischen Geräten übertragen.
                </p>
                <KontoFormular
                  fachrichtungen={fachrichtungen}
                  fachrichtung={profil.fachrichtung}
                  onFachrichtungChange={(wert) => setProfil({ ...profil, fachrichtung: wert })}
                  onErfolg={kontoErfolg}
                />
              </>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
