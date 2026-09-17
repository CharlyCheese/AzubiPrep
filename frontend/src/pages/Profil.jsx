// FE-014: aus Einstellungen.jsx herausgelöst – Lernprofil-Daten und
// Konto/Synchronisierung gehören inhaltlich zusammen ("alles rund um mich
// und mein Konto") und bekommen dadurch einen eigenen, direkt in der
// Navigation sichtbaren Bereich statt in den technischeren
// Einstellungen (Darstellung/Datenschutz/Gefahrenzone) unterzugehen.
import { useState, useSyncExternalStore } from 'react';
import { useApi } from '../utils/useApi.js';
import { api } from '../api/client.js';
import { profileStore } from '../store/localStore.js';
import { authStore } from '../store/authStore.js';
import { hochladen, herunterladen } from '../api/sync.js';
import KontoFormular from '../components/KontoFormular.jsx';

export default function Profil() {
  const { daten: fachrichtungen } = useApi(() => api.get('/fachrichtungen'), []);
  const { daten: status } = useApi(() => api.get('/status'), []);
  const [profil, setProfil] = useState(profileStore.get());
  const [meldung, setMeldung] = useState('');

  const auth = useSyncExternalStore(authStore.subscribe, authStore.snapshot);
  const syncAktiviert = Boolean(status?.syncAktiviert);
  const eingeloggt = Boolean(auth?.token);

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

  function speichern() {
    profileStore.set(profil);
    setMeldung('Profil gespeichert ✓');
    setTimeout(() => setMeldung(''), 2500);
  }

  return (
    <div>
      <header className="main-header">
        <div>
          <h1 className="mb-0">Profil</h1>
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
              <KontoFormular
                fachrichtungen={fachrichtungen}
                fachrichtung={profil.fachrichtung}
                onFachrichtungChange={(wert) => setProfil({ ...profil, fachrichtung: wert })}
                onErfolg={kontoErfolg}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
