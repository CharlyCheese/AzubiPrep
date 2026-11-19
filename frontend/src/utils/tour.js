// Die optionale Führung startet auf der Willkommensseite oder über die Einstellungen.
// Der gesehene Status bleibt mit bestehenden Browserprofilen kompatibel.
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
