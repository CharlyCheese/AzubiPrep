// Begrüßt nach einer neuen Anmeldung innerhalb der App (z. B. im Profil).
import { useEffect, useRef, useState } from 'react';
import AppDialog from './AppDialog.jsx';
import { profileStore } from '../store/localStore.js';
import { authStore } from '../store/authStore.js';

export default function WillkommenModal() {
  const [sichtbar, setSichtbar] = useState(false);
  const vorherigerToken = useRef(authStore.token());

  useEffect(() => {
    // Bei jedem neuen Login (Token wechselt von "keiner"/anders zu einem
    // neuen Wert) das Popup erneut zeigen, auch ohne Browser-Neustart.
    const unsubscribe = authStore.subscribe(() => {
      const aktuellerToken = authStore.token();
      if (aktuellerToken && aktuellerToken !== vorherigerToken.current) {
        vorherigerToken.current = aktuellerToken;
        setSichtbar(true);
      } else {
        vorherigerToken.current = aktuellerToken;
      }
    });
    return unsubscribe;
  }, []);

  function schliessen() {
    setSichtbar(false);
  }

  if (!sichtbar) return null;

  const profil = profileStore.get();
  const name = profil.name && profil.name !== 'Lernende:r' ? profil.name : '';

  return (
    <AppDialog titleId="willkommen-titel" onDismiss={schliessen}>
        <h2 id="willkommen-titel" className="mb-0">Willkommen zurück{name ? `, ${name}` : ''} 👋</h2>
        <p className="text-muted">Schön, dass du lernst! Deine Prüfungsvorbereitung läuft.</p>
        <button className="btn btn-primary btn-block" onClick={schliessen} autoFocus>Los geht's</button>
    </AppDialog>
  );
}
