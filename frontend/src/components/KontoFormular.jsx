// FE-012: Login/Registrieren-Formular, aus Einstellungen.jsx herausgelöst,
// damit dieselbe Logik auch auf der neuen Landing-Page (frontend/src/pages/
// Landing.jsx) verwendet werden kann, ohne Code zu duplizieren.
// Reine Präsentations-/Formularlogik – wohin die Fachrichtungs-Auswahl und
// das Ergebnis (eingeloggter Nutzer) geschrieben werden, entscheidet die
// aufrufende Seite über die Props (gleiches Verhalten wie vorher in
// Einstellungen.jsx, nur wiederverwendbar gemacht).
import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { authStore } from '../store/authStore.js';
import '../styles/account.css';

export default function KontoFormular({ fachrichtungen, fachrichtung, onFachrichtungChange, onErfolg, startModus = 'login' }) {
  const formId = useId();
  const [modus, setModus] = useState(startModus); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [passwort, setPasswort] = useState('');
  const [laden, setLaden] = useState(false);
  const [fehler, setFehler] = useState('');

  async function absenden(e) {
    e.preventDefault();
    setLaden(true);
    setFehler('');
    try {
      const pfad = modus === 'login' ? '/auth/login' : '/auth/register';
      const body = modus === 'login'
        ? { email, passwort }
        : { email, passwort, fachrichtung };
      const erg = await api.post(pfad, body);
      authStore.setSession(erg.token, erg.user);
      setEmail('');
      setPasswort('');
      onErfolg?.(erg);
    } catch (err) {
      setFehler(err.message);
    } finally {
      setLaden(false);
    }
  }

  return (
    <form className="account-form" onSubmit={absenden}>
      <div className="grid grid-2">
        <div className="field">
          <label htmlFor={`${formId}-email`}>E-Mail</label>
          <input id={`${formId}-email`} type="email" autoComplete="email" className="input" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor={`${formId}-password`}>Passwort</label>
          <input id={`${formId}-password`} type="password" autoComplete={modus === 'login' ? 'current-password' : 'new-password'} className="input" required minLength={modus === 'register' ? 8 : undefined} aria-describedby={modus === 'register' ? `${formId}-rules` : undefined} value={passwort} onChange={(e) => setPasswort(e.target.value)} />
          {modus === 'register' && (
            <div className="field-hint" id={`${formId}-rules`}>
              Mindestens 8 Zeichen mit Groß- und Kleinbuchstaben, einer Zahl und einem Sonderzeichen.
            </div>
          )}
        </div>
      </div>
      {modus === 'register' && (
        <div className="field">
          <label htmlFor={`${formId}-track`}>Fachrichtung</label>
          <select id={`${formId}-track`}
            className="select"
            value={fachrichtung || 'FIAE'}
            onChange={(e) => onFachrichtungChange?.(e.target.value)}
          >
            {(fachrichtungen || []).map((fr) => (
              <option key={fr.code} value={fr.code}>{fr.code} – {fr.name}</option>
            ))}
          </select>
          <div className="field-hint">Wird mit deinem Konto gespeichert – nur eine Vorauswahl, keine Zugriffsbeschränkung.</div>
        </div>
      )}
      {fehler && <div className="alert alert-danger" role="alert">{fehler}</div>}
      <div className="flex wrap">
        <button className="btn btn-primary" disabled={laden}>
          {modus === 'login' ? (laden ? 'Anmeldung läuft …' : 'Anmelden') : (laden ? 'Konto wird erstellt …' : 'Registrieren')}
        </button>
        <button
          type="button"
          disabled={laden}
          className="btn btn-ghost btn-sm"
          onClick={() => { setModus(modus === 'login' ? 'register' : 'login'); setFehler(''); }}
        >
          {modus === 'login' ? 'Noch kein Konto? Registrieren' : 'Schon registriert? Anmelden'}
        </button>
      </div>
      {modus === 'login' && (
        // BE-007: kein Selbstbedienungs-Flow (kein E-Mail-Versand im
        // Projekt) – die Seite erklärt, sich an eine Admin-Person zu wenden.
        <p className="small text-muted mt-1">
          <Link to="/passwort-zuruecksetzen">Passwort vergessen?</Link>
        </p>
      )}
    </form>
  );
}
