// Begrüßungs-Popup beim Programm-/Browserstart. Wird einmal pro
// Browser-Sitzung gezeigt (sessionStorage – verschwindet automatisch bei
// Neustart) und zusätzlich bei jedem neuen Login zurückgesetzt, damit es
// nach der nächsten Anmeldung wieder erscheint (siehe FE-005).
import { useEffect, useRef, useState } from 'react';
import { profileStore } from '../store/localStore.js';
import { authStore } from '../store/authStore.js';

const FLAG_KEY = 'azubiprep.begruessung-gezeigt';

function schonGezeigt() {
  try {
    return sessionStorage.getItem(FLAG_KEY) === 'true';
  } catch {
    return false;
  }
}

function alsGezeigtMerken() {
  try {
    sessionStorage.setItem(FLAG_KEY, 'true');
  } catch {
    /* ignore */
  }
}

export default function WillkommenModal() {
  const [sichtbar, setSichtbar] = useState(() => !schonGezeigt());
  const vorherigerToken = useRef(authStore.token());

  useEffect(() => {
    // Bei jedem neuen Login (Token wechselt von "keiner"/anders zu einem
    // neuen Wert) das Popup erneut zeigen, auch ohne Browser-Neustart.
    const unsubscribe = authStore.subscribe(() => {
      const aktuellerToken = authStore.token();
      if (aktuellerToken && aktuellerToken !== vorherigerToken.current) {
        vorherigerToken.current = aktuellerToken;
        try { sessionStorage.removeItem(FLAG_KEY); } catch { /* ignore */ }
        setSichtbar(true);
      } else {
        vorherigerToken.current = aktuellerToken;
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!sichtbar) return undefined;
    function aufEscape(e) {
      if (e.key === 'Escape') schliessen();
    }
    window.addEventListener('keydown', aufEscape);
    return () => window.removeEventListener('keydown', aufEscape);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sichtbar]);

  function schliessen() {
    setSichtbar(false);
    alsGezeigtMerken();
  }

  if (!sichtbar) return null;

  const profil = profileStore.get();
  const name = profil.name && profil.name !== 'Lernende:r' ? profil.name : '';

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="willkommen-titel"
      onClick={(e) => { if (e.target === e.currentTarget) schliessen(); }}
    >
      <div className="modal-box">
        <h2 id="willkommen-titel" className="mb-0">Willkommen zurück{name ? `, ${name}` : ''} 👋</h2>
        <p className="text-muted">Schön, dass du lernst! Deine Prüfungsvorbereitung läuft.</p>
        <button className="btn btn-primary btn-block" onClick={schliessen} autoFocus>Los geht's</button>
      </div>
    </div>
  );
}
