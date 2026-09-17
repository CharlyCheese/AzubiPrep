// BE-007: öffentliche Seite für den admin-gestützten Passwort-Reset.
// Kein Selbstbedienungs-Flow (kein E-Mail-Versand im Projekt, siehe Brief) –
// ein Admin erzeugt den eigentlichen Link über /nutzerverwaltung. Diese
// Seite zeigt drei Zustände: (1) kein Token in der URL → Formular, um eine
// Admin-Benachrichtigung ("Reset angefragt") auszulösen; (2) Token
// vorhanden → Formular für ein neues Passwort, Gültigkeit wird erst beim
// Absenden serverseitig geprüft (siehe auth.routes.js, Begründung dort);
// (3) Anfrage abgeschickt → Bestätigung.
import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../api/client.js';

export default function PasswortZuruecksetzen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

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
    try {
      // Bewusst kein Fehlerzustand hier: die Route antwortet immer generisch
      // "ok", egal ob die E-Mail existiert (kein Enumeration-Leck) – ein
      // Netzwerkfehler ist die einzig sichtbare Ausnahme, dafür reicht der
      // catch unten, ohne extra Fehlermeldung anzuzeigen (Anfrage ist
      // ohnehin unkritisch, einfach nochmal versuchen).
      await api.post('/auth/passwort-reset-anfordern', { email: anfrageEmail }).catch(() => {});
    } finally {
      setAnfrageLaden(false);
      setAnfrageAbgeschickt(true);
    }
  }

  return (
    <div className="landing-seite">
      <div className="landing-karte card">
        <h1 className="mb-0">Passwort zurücksetzen</h1>

        {!token && anfrageAbgeschickt && (
          <p className="text-muted mt-0">
            Danke – falls diese E-Mail-Adresse bei uns registriert ist, wurde
            soeben eine Admin-Person benachrichtigt. Du bekommst den
            eigentlichen Reset-Link dann außerhalb der App zugeschickt (z. B.
            persönlich oder per Chat).
          </p>
        )}

        {!token && !anfrageAbgeschickt && (
          <>
            <p className="text-muted mt-0">
              Für diese Seite fehlt ein gültiger Reset-Link. Passwort-Resets
              laufen bei AzubiPrep über eine Admin-Person – trag unten deine
              E-Mail-Adresse ein, damit sie benachrichtigt wird.
            </p>
            <form onSubmit={anfrageAbsenden}>
              <div className="field">
                <label>E-Mail</label>
                <input
                  type="email"
                  className="input"
                  required
                  value={anfrageEmail}
                  onChange={(e) => setAnfrageEmail(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-block mt-2" disabled={anfrageLaden}>
                {anfrageLaden ? '…' : 'Admin benachrichtigen'}
              </button>
            </form>
          </>
        )}

        {token && erledigt && (
          <>
            <p className="text-muted mt-0">
              Dein Passwort wurde geändert. Du kannst dich jetzt mit dem neuen
              Passwort anmelden.
            </p>
            <button type="button" className="btn btn-primary btn-block mt-2" onClick={() => navigate('/profil')}>
              Zum Login →
            </button>
          </>
        )}

        {token && !erledigt && (
          <form onSubmit={absenden}>
            <p className="text-muted mt-0">Neues Passwort festlegen:</p>
            <div className="field">
              <label>Neues Passwort</label>
              <input
                type="password"
                className="input"
                required
                minLength={8}
                value={passwort}
                onChange={(e) => setPasswort(e.target.value)}
              />
              <div className="field-hint">
                Mind. 8 Zeichen, mit Groß- und Kleinbuchstaben, einer Zahl und einem Sonderzeichen (z. B. „Azubi2026!").
              </div>
            </div>
            {fehler && <div className="alert alert-danger">{fehler}</div>}
            <button type="submit" className="btn btn-primary btn-block mt-2" disabled={laden}>
              {laden ? '…' : 'Passwort setzen'}
            </button>
          </form>
        )}

        <p className="small text-muted mt-2">
          <Link to="/profil">← Zurück zu Profil/Login</Link>
        </p>
      </div>
    </div>
  );
}
