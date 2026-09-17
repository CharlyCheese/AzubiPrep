// FE-012: Merkt sich lokal (localStorage – nicht sessionStorage, bewusst
// dauerhaft), ob die Landing-Page bereits gesehen/übersprungen wurde, damit
// sie nur beim allerersten Besuch automatisch erscheint (siehe
// App.jsx/Startpunkt). Manuell ist die Seite über "/willkommen" jederzeit
// weiter erreichbar.
const FLAG_KEY = 'azubiprep.landing-gesehen';

export function landingBereitsGesehen() {
  try {
    return localStorage.getItem(FLAG_KEY) === 'true';
  } catch {
    // localStorage evtl. blockiert (privater Modus o. ä.) – dann lieber
    // nicht bei jedem Aufruf erneut die Landing-Page erzwingen.
    return true;
  }
}

export function landingAlsGesehenMerken() {
  try {
    localStorage.setItem(FLAG_KEY, 'true');
  } catch {
    /* ignore */
  }
}
