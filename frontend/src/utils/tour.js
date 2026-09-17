// Kurze Seiten-Tour (Popups, die Dashboard/Lernreise/Lernbereich/
// Prüfungssimulation kurz erklären). Wird einmalig automatisch gezeigt
// (dauerhaftes Flag in localStorage, anders als das session-basierte
// Begrüßungs-Popup FE-005) und ist über Einstellungen jederzeit erneut
// aufrufbar (Custom-Event, damit AppTour.jsx nicht global im Store
// verankert werden muss).
const FLAG_KEY = 'azubiprep.tour-gezeigt';
const EVENT_NAME = 'azubiprep:tour-start';

export function tourBereitsGesehen() {
  try {
    return localStorage.getItem(FLAG_KEY) === 'true';
  } catch {
    return true;
  }
}

export function tourAlsGesehenMerken() {
  try {
    localStorage.setItem(FLAG_KEY, 'true');
  } catch {
    /* ignore */
  }
}

export function tourManuellStarten() {
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function aufTourStartHoeren(handler) {
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}
