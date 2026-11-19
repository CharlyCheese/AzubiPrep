// BE-007: öffentliche Seite für den admin-gestützten Passwort-Reset.
// Kein Selbstbedienungs-Flow (kein E-Mail-Versand im Projekt, siehe Brief) –
// ein Admin erzeugt den eigentlichen Link über /nutzerverwaltung. Diese
// Seite zeigt drei Zustände: (1) kein Token in der URL → Formular, um eine
// Admin-Benachrichtigung ("Reset angefragt") auszulösen; (2) Token
// vorhanden → Formular für ein neues Passwort, Gültigkeit wird erst beim
// Absenden serverseitig geprüft (siehe auth.routes.js, Begründung dort);
// (3) Anfrage abgeschickt → Bestätigung.
import { useState } from 'react';
import { useLocation, useSearchParams, Link } from 'react-router-dom';
import { api } from '../api/client.js';
import '../styles/account.css';

export default function PasswortZuruecksetzen() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  return <ResetFormular key={token} token={token} />;
}

function ResetFormular({ token }) {
  const { state } = useLocation();
  const [passwort, setPasswort] = useState('');
  const [laden, setLaden] = useState(false);
  const [fehler, setFehler] = useState('');
  const [erledigt, setErledigt] = useState(false);

  const [anfrageEmail, setAnfrageEmail] = useState('');
  const [anfrageLaden, setAnfrageLaden] = useState(false);
  const [anfrageAbgeschickt, setAnfrageAbgeschickt] = useState(false);

  async function absenden(e) {
    e.preventDefault();
    setLaden(true);
    setFehler('');
    try {
      await api.post('/auth/passwort-reset', { token, neuesPasswort: passwort });
      setErledigt(true);
    } catch (err) {
      setFehler(err.message);
    } finally {
      setLaden(false);
    }
  }

  async function anfrageAbsenden(e) {
    e.preventDefault();
    setAnfrageLaden(true);
    setFehler('');
    try {
      await api.post('/auth/passwort-reset-anfordern', { email: anfrageEmail });
      setAnfrageAbgeschickt(true);
    } catch {
      setFehler('Die Anfrage konnte nicht gesendet werden. Bitte versuche es erneut.');
    } finally {
      setAnfrageLaden(false);
    }
  }

  return (
    <main className="landing-seite account-page">
      <div className="card reset-card">
        {typeof state?.resultSearch === 'string' && <Link className="search-return" to={{ pathname: '/suche', search: state.resultSearch }}>← Suchergebnisse</Link>}
        <h1 className="mb-0">Passwort zurücksetzen</h1>

        {!token && anfrageAbgeschickt && (
          <p className="text-muted mt-0" role="status">
            Danke – falls diese E-Mail-Adresse bei uns registriert ist, wurde
            soeben eine Admin-Person benachrichtigt. Du bekommst den
            eigentlichen Reset-Link dann außerhalb der App zugeschickt (z. B.
            persönlich oder per Chat).
          </p>
        )}

        {!token && !anfrageAbgeschickt && (
          <>
            <p className="text-muted mt-0">
              Gib die E-Mail-Adresse deines Kontos ein. Die Administration kann dir anschließend persönlich oder per Chat einen Link zum Zurücksetzen geben.
            </p>
            <form onSubmit={anfrageAbsenden}>
              <div className="field">
                <label htmlFor="reset-e-mail">E-Mail</label>
                <input id="reset-e-mail"
                  type="email"
                  autoComplete="email"
                  className="input"
                  required
                  value={anfrageEmail}
                  onChange={(e) => setAnfrageEmail(e.target.value)}
                />
              </div>
              {fehler && <div className="alert alert-danger" role="alert">{fehler}</div>}
              <button type="submit" className="btn btn-primary btn-block mt-2" disabled={anfrageLaden}>
                {anfrageLaden ? 'Anfrage wird gesendet …' : 'Admin benachrichtigen'}
              </button>
            </form>
          </>
        )}

        {token && erledigt && (
          <p className="text-muted mt-0" role="status">
            Dein Passwort wurde geändert. Du kannst dich jetzt mit dem neuen Passwort anmelden.
          </p>
        )}

        {token && !erledigt && (
          <form onSubmit={absenden}>
            <div className="field">
              <label htmlFor="reset-neues-passwort">Neues Passwort</label>
              <input id="reset-neues-passwort"
                type="password"
                autoComplete="new-password"
                aria-describedby="reset-password-rules"
                className="input"
                required
                minLength={8}
                value={passwort}
                onChange={(e) => setPasswort(e.target.value)}
              />
              <div className="field-hint" id="reset-password-rules">
                Mindestens 8 Zeichen mit Groß- und Kleinbuchstaben, einer Zahl und einem Sonderzeichen.
              </div>
            </div>
            {fehler && <>
              <div className="alert alert-danger" role="alert">{fehler}</div>
              <Link className="account-shortcut" to="/passwort-zuruecksetzen">Neuen Link anfordern</Link>
            </>}
            <button type="submit" className="btn btn-primary btn-block mt-2" disabled={laden}>
              {laden ? 'Passwort wird gespeichert …' : 'Passwort setzen'}
            </button>
          </form>
        )}

        <Link to="/profil#konto" className={erledigt || anfrageAbgeschickt ? 'btn btn-primary mt-2' : 'account-shortcut mt-2'}>Zur Anmeldung</Link>
      </div>
    </main>
  );
}
