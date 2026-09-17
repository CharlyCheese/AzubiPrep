// Kurze, seitenunabhängige Tour (Modal-Sequenz statt an Bildschirm-
// Elemente angehefteter Tooltips – robuster gegenüber Layout-Änderungen
// und funktioniert auf jeder Seite gleich). Reihenfolge und Inhalte laut
// Absprache: Dashboard -> Lernreise -> Lernbereich -> Prüfungssimulation
// (inkl. Hinweis, dass die Fehler-Nachbereitung bewusst im
// Prüfungsverlauf liegt statt direkt nach der Simulation).
//
// Start: einmalig automatisch nach dem ersten Verlassen der Landing-Page
// bzw. dem bestehenden Begrüßungs-Popup (FE-005) – um beide Dialoge nicht
// gleichzeitig übereinander zu zeigen, wartet die Tour, bis das
// Begrüßungs-Popup (sessionStorage-Flag) geschlossen wurde, mit einem
// Timeout als Fallback. Danach jederzeit manuell über
// utils/tour.js#tourManuellStarten() erneut aufrufbar (Button in den
// Einstellungen).
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tourBereitsGesehen, tourAlsGesehenMerken, aufTourStartHoeren } from '../utils/tour.js';

const BEGRUESSUNG_FLAG_KEY = 'azubiprep.begruessung-gezeigt';

const SCHRITTE = [
  {
    titel: 'Dashboard 🏠',
    text: 'Deine Startseite: XP und Level, Tages-/Wochenziel und aktuelle Missionen – auf einen Blick, wie es gerade läuft.',
    pfad: '/',
  },
  {
    titel: 'Lernreise 🗺️',
    text: 'Der empfohlene Einstieg: ein Stationenweg durch die Module, zuerst die fachrichtungsübergreifenden Grundlagen, danach deine eigene Fachrichtung.',
    pfad: '/lernreise',
  },
  {
    titel: 'Lernbereich 📚',
    text: 'Alle Module nach Fachrichtung sortiert. Pro Modul: Theorie zum Nachlesen, Quiz mit Sofort-Feedback und Karteikarten mit Spaced Repetition (Leitner-System) zum Wiederholen.',
    pfad: '/lernen',
  },
  {
    titel: 'Prüfungssimulation ⏱️',
    text: 'Zeitlimitierte Simulation mit Zufallsfragen und Themengewichtung. Die Fehler-Nachbereitung findest du bewusst nicht direkt danach, sondern gesammelt im Prüfungsverlauf – dort kannst du jede Frage im Frage-für-Frage-Review noch einmal durchgehen.',
    pfad: '/pruefung/verlauf',
  },
];

function begruessungSchonGezeigt() {
  try {
    return sessionStorage.getItem(BEGRUESSUNG_FLAG_KEY) === 'true';
  } catch {
    return true;
  }
}

export default function AppTour() {
  const navigate = useNavigate();
  const [sichtbar, setSichtbar] = useState(false);
  const [schritt, setSchritt] = useState(0);

  // Automatischer Start: einmalig, wartet kurz auf das Begrüßungs-Popup.
  useEffect(() => {
    if (tourBereitsGesehen()) return undefined;
    let versuche = 0;
    const intervall = setInterval(() => {
      versuche += 1;
      if (begruessungSchonGezeigt() || versuche >= 10) {
        clearInterval(intervall);
        setSchritt(0);
        setSichtbar(true);
      }
    }, 400);
    return () => clearInterval(intervall);
  }, []);

  // Manueller Start (z. B. Button in den Einstellungen).
  useEffect(() => aufTourStartHoeren(() => {
    setSchritt(0);
    setSichtbar(true);
  }), []);

  // Navigation an den jeweils ANGEZEIGTEN Schritt gekoppelt (statt separat
  // in weiter()/zurueck() ausgelöst): vorher wurde beim Klick auf "Weiter"
  // zum Pfad des GERADE VERLASSENEN Schritts navigiert und im selben Zug
  // schon das Popup des NÄCHSTEN Schritts angezeigt – dadurch passten Popup-
  // Text und sichtbare Seite immer einen Schritt lang nicht zusammen. Jetzt
  // navigiert genau dieser Effekt, ausgelöst durch die Schritt-Änderung, was
  // Anzeige und Navigation zuverlässig synchron hält.
  useEffect(() => {
    if (!sichtbar) return;
    const aktuell = SCHRITTE[schritt];
    if (aktuell?.pfad) navigate(aktuell.pfad);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sichtbar, schritt]);

  useEffect(() => {
    if (!sichtbar) return undefined;
    function aufEscape(e) {
      if (e.key === 'Escape') beenden();
    }
    window.addEventListener('keydown', aufEscape);
    return () => window.removeEventListener('keydown', aufEscape);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sichtbar]);

  function beenden() {
    setSichtbar(false);
    tourAlsGesehenMerken();
  }

  function weiter() {
    if (schritt + 1 >= SCHRITTE.length) {
      beenden();
      return;
    }
    setSchritt(schritt + 1);
  }

  function zurueck() {
    setSchritt((s) => Math.max(0, s - 1));
  }

  if (!sichtbar) return null;

  const aktuell = SCHRITTE[schritt];
  const istLetzter = schritt + 1 >= SCHRITTE.length;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-titel"
      onClick={(e) => { if (e.target === e.currentTarget) beenden(); }}
    >
      <div className="modal-box">
        <p className="small text-muted mt-0 mb-1">Kurze Führung ({schritt + 1}/{SCHRITTE.length})</p>
        <h2 id="tour-titel" className="mb-0">{aktuell.titel}</h2>
        <p className="text-muted">{aktuell.text}</p>
        <div className="flex-between wrap mt-2">
          <button type="button" className="btn btn-ghost btn-sm" onClick={beenden}>Überspringen</button>
          <div>
            {schritt > 0 && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={zurueck} style={{ marginRight: 8 }}>← Zurück</button>
            )}
            <button type="button" className="btn btn-primary btn-sm" onClick={weiter} autoFocus>
              {istLetzter ? 'Fertig' : 'Weiter →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
