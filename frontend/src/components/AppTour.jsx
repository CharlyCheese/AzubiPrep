import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { tourAlsGesehenMerken, aufTourStartHoeren } from '../utils/tour.js';
import AppDialog from './AppDialog.jsx';

const SCHRITTE = [
  {
    titel: 'Dashboard 🏠',
    text: 'Deine Startseite: XP und Level, Tages-/Wochenziel und aktuelle Missionen – auf einen Blick, wie es gerade läuft.',
    pfad: '/dashboard',
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
    titel: 'Frontend-Werkstatt 💻',
    text: 'Hier lernst du HTML, CSS und JavaScript Schritt für Schritt mit eigener Browser-Vorschau und Aufgabenprüfung. Ab der zweiten Datei kannst du auch in deinem eigenen Editor arbeiten: ganze Projektordner einlesen oder einzelne Dateien ergänzen. Hinweise, Musterlösungen und eine Projektsicherung helfen beim Lernen.',
    pfad: '/frontendkurs',
  },
  {
    titel: 'Prüfungssimulation ⏱️',
    text: 'Zeitlimitierte Simulation mit Zufallsfragen und Themengewichtung. Die Fehler-Nachbereitung findest du bewusst nicht direkt danach, sondern gesammelt im Prüfungsverlauf – dort kannst du jede Frage im Frage-für-Frage-Review noch einmal durchgehen.',
    pfad: '/pruefung',
  },
];

export default function AppTour() {
  const navigate = useNavigate();
  const location = useLocation();
  const origin = useRef('/dashboard');
  const [sichtbar, setSichtbar] = useState(() => location.state?.startTour === true);
  const [schritt, setSchritt] = useState(0);

  useEffect(() => aufTourStartHoeren(() => {
    origin.current = location.pathname + location.search + location.hash;
    setSchritt(0);
    setSichtbar(true);
  }), [location.pathname, location.search, location.hash]);

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
    if (aktuell?.pfad) navigate(aktuell.pfad, { replace: true, state: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sichtbar, schritt]);

  function beenden() {
    setSichtbar(false);
    tourAlsGesehenMerken();
    navigate(origin.current, { replace: true });
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
    <AppDialog titleId="tour-titel" onDismiss={beenden}>
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
    </AppDialog>
  );
}
