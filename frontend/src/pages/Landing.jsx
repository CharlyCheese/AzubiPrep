import { useState, useSyncExternalStore } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApi } from '../utils/useApi.js';
import { api } from '../api/client.js';
import { profileStore } from '../store/localStore.js';
import { authStore } from '../store/authStore.js';
import KontoFormular from '../components/KontoFormular.jsx';

export default function Landing() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const session = useSyncExternalStore(authStore.subscribe, authStore.snapshot);
  const { daten: fachrichtungen } = useApi(() => api.get('/fachrichtungen'), []);
  const { daten: status } = useApi(() => api.get('/status'), []);
  const syncAktiviert = Boolean(status?.syncAktiviert);
  const [fachrichtung, setFachrichtung] = useState(profileStore.get().fachrichtung || 'FIAE');

  function weiter(startTour = false) {
    navigate('/dashboard', { state: { startTour } });
  }

  function kontoErfolg(erg) {
    if (erg.user?.fachrichtung) {
      profileStore.set({ ...profileStore.get(), fachrichtung: erg.user.fachrichtung });
    }
    weiter();
  }

  return (
    <main className="landing-seite">
      <div className="landing-wrap">
        <section className="landing-intro" aria-labelledby="willkommen-heading">
          {typeof state?.resultSearch === 'string' && <Link className="search-return" to={{ pathname: '/suche', search: state.resultSearch }}>← Suchergebnisse</Link>}
          <div className="logo"><span className="logo-badge" aria-hidden="true">A</span>AzubiPrep</div>
          <h1 id="willkommen-heading">{session?.token ? 'Willkommen zurück bei AzubiPrep' : 'Willkommen bei AzubiPrep'}</h1>
          <p className="landing-lead">Bereite dich auf deine IT-Abschlussprüfung vor. Lerne Schritt für Schritt, übe einzelne Themen oder starte eine Prüfung auf Zeit. Wähle zwischen FIAE, FISI, DPA und DVK.</p>
          <button type="button" className="btn btn-primary landing-start" onClick={() => weiter()}>{session?.token ? 'Zum Dashboard' : 'Ohne Konto weiter nutzen'} <span aria-hidden="true">→</span></button>
          <button type="button" className="btn btn-ghost landing-tour" onClick={() => weiter(true)}>Kurze Führung</button>
          <p className="small text-muted">Dein Lernstand wird auf diesem Gerät gespeichert.</p>
        </section>
        <section className="landing-karte card" aria-labelledby="landing-options">
          <h2 id="landing-options">So kannst du lernen</h2>
          <ul className="landing-options">
            <li><strong>Lernreise</strong><span>Folge deiner Fachrichtung von den Grundlagen bis zur Spezialisierung.</span></li>
            <li><strong>Quiz und Karteikarten</strong><span>Übe mit 7.000 Fragen und wiederhole gezielt, was dir noch schwerfällt.</span></li>
            <li><strong>Prüfungssimulation</strong><span>Teste dein Wissen mit Zeitlimit und werte deine Antworten aus.</span></li>
          </ul>
          {!session?.token && syncAktiviert && <details className="landing-account">
            <summary>Anmelden oder Konto erstellen</summary>
            <p className="small text-muted">Mit einem Konto kannst du deinen Quizfortschritt zwischen Geräten synchronisieren.</p>
            <KontoFormular fachrichtungen={fachrichtungen} fachrichtung={fachrichtung}
              onFachrichtungChange={setFachrichtung} onErfolg={kontoErfolg} startModus="login" />
          </details>}
          {!session?.token && status && !syncAktiviert && <details className="landing-account">
            <summary>Kontosynchronisation einrichten</summary>
            <p className="small text-muted">Für den Einsatz auf mehreren Geräten kann die betreibende Person die Kontosynchronisation aktivieren. <a href="https://github.com/CharlyCheese/AzubiPrep/blob/main/docs/19-Datenbank-Login.md" target="_blank" rel="noreferrer">Anleitung für den Betrieb</a></p>
          </details>}
        </section>
      </div>
    </main>
  );
}
