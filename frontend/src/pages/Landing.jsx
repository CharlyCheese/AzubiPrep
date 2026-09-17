// FE-012: öffentliche Startseite vor der eigentlichen App. Erklärt kurz,
// was AzubiPrep ist, und dient gleichzeitig als Login-/Registrierfenster
// (KontoFormular). Bewusst KEIN Zwang: "Ohne Konto weiter nutzen" bleibt
// immer sichtbar, damit die MVP-Philosophie (kein Pflicht-Login) erhalten
// bleibt – die Seite wird nur einmalig automatisch angezeigt (siehe
// App.jsx/Startpunkt), danach jederzeit manuell über einen Link erreichbar.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../utils/useApi.js';
import { api } from '../api/client.js';
import { profileStore } from '../store/localStore.js';
import KontoFormular from '../components/KontoFormular.jsx';
import { landingAlsGesehenMerken } from '../utils/landing.js';

export default function Landing() {
  const navigate = useNavigate();
  const { daten: fachrichtungen } = useApi(() => api.get('/fachrichtungen'), []);
  const { daten: status } = useApi(() => api.get('/status'), []);
  const syncAktiviert = Boolean(status?.syncAktiviert);
  const [fachrichtung, setFachrichtung] = useState(profileStore.get().fachrichtung || 'FIAE');

  function weiter() {
    landingAlsGesehenMerken();
    navigate('/', { replace: true });
  }

  function kontoErfolg(erg) {
    if (erg.user?.fachrichtung) {
      profileStore.set({ ...profileStore.get(), fachrichtung: erg.user.fachrichtung });
    }
    weiter();
  }

  return (
    <div className="landing-seite">
      <div className="landing-wrap">
        {/* Linke Spalte: Nutzenerklärung + Feature-Überblick – nutzt auf
            breiten Bildschirmen den Platz neben der Login-Karte, statt wie
            vorher rein vertikal in einer schmalen zentrierten Karte zu
            stehen. Fällt unter 860px zurück auf eine einzige Spalte
            (siehe global.css), damit mobile Ansicht/Barrierefreiheit
            (Lesereihenfolge, keine erzwungene Breite) unverändert bleiben. */}
        <div className="landing-intro">
          <h1 className="mb-0">Willkommen bei AzubiPrep 👋</h1>
          <p className="text-muted mt-0">
            Deine Prüfungsvorbereitung für die IHK-Abschlussprüfung als
            Fachinformatiker:in (FIAE, FISI, DPA, DVK): über 1600
            Prüfungsfragen, Karteikarten mit Spaced Repetition und eine
            zeitlimitierte Prüfungssimulation – alles an einem Ort, damit du
            gezielt übst statt planlos zu pauken.
          </p>
          <p className="text-muted">
            <strong>Tipp zum Einstieg:</strong> Starte am besten mit der{' '}
            <strong>Lernreise</strong> – sie führt dich als Stationenweg durch
            die Module, zuerst die gemeinsamen Grundlagen, danach deine
            Fachrichtung.
          </p>

          <div className="landing-features">
            <div className="landing-feature">
              <div className="landing-feature-icon">📚</div>
              <strong>Über 1600 Prüfungsfragen</strong>
              <p className="text-muted small mt-1 mb-0">Nach Modul und Fachrichtung sortiert, mit Erklärung zur Musterlösung.</p>
            </div>
            <div className="landing-feature">
              <div className="landing-feature-icon">🃏</div>
              <strong>Karteikarten (Spaced Repetition)</strong>
              <p className="text-muted small mt-1 mb-0">Leitner-System – Karten, die du oft falsch beantwortest, kommen öfter dran.</p>
            </div>
            <div className="landing-feature">
              <div className="landing-feature-icon">⏱️</div>
              <strong>Prüfungssimulation</strong>
              <p className="text-muted small mt-1 mb-0">Zeitlimitiert mit Zufallsfragen; Fehler-Review gesammelt im Prüfungsverlauf.</p>
            </div>
          </div>
        </div>

        <div className="landing-karte card">
          {syncAktiviert ? (
            <>
              <h2 className="mb-0">Konto (optional)</h2>
              <p className="text-muted mt-0">
                Mit einem kostenlosen Konto synchronisierst du deinen Lernstand
                zwischen mehreren Geräten und kannst Benachrichtigungen
                aktivieren (z. B. wenn eine von dir gemeldete Frage bearbeitet
                wurde).
              </p>
              <KontoFormular
                fachrichtungen={fachrichtungen}
                fachrichtung={fachrichtung}
                onFachrichtungChange={setFachrichtung}
                onErfolg={kontoErfolg}
                startModus="register"
              />
              <p className="small text-muted mt-2">
                Kein Konto nötig – die App funktioniert komplett ohne Login.
              </p>
            </>
          ) : (
            <>
              <h2 className="mb-0">Ohne Konto nutzbar</h2>
              <p className="text-muted mt-0">
                Auf diesem Server ist kein Konto/Sync verfügbar – die App läuft
                vollständig lokal in deinem Browser.
              </p>
              <p className="small text-muted">
                Du betreibst diese Instanz selbst (z. B. für eine Klasse) und
                möchtest Konto-Sync und Benachrichtigungen freischalten?
                Anleitung: <a href="https://github.com/CharlyCheese/AzubiPrep/blob/main/docs/19-Datenbank-Login.md" target="_blank" rel="noreferrer">docs/19-Datenbank-Login.md</a> im
                Projekt-Repository (optionale PostgreSQL-Einrichtung, kein
                Pflichtschritt). Eine optionale lokale KI-Integration ohne
                Internetverbindung ist als Idee auf dem Backlog, aber noch
                nicht umgesetzt.
              </p>
            </>
          )}

          <button type="button" className="btn btn-ghost btn-block mt-2" onClick={weiter}>
            Ohne Konto weiter nutzen →
          </button>
        </div>
      </div>
    </div>
  );
}
