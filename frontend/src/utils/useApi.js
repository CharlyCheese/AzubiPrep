// Kleiner Hook zum Laden von API-Daten mit Lade-/Fehlerzustand.
import { useEffect, useState } from 'react';

export function useApi(loader, deps = []) {
  const [daten, setDaten] = useState(null);
  const [laden, setLaden] = useState(true);
  const [fehler, setFehler] = useState(null);

  useEffect(() => {
    let aktiv = true;
    setLaden(true);
    setFehler(null);
    loader()
      .then((d) => aktiv && setDaten(d))
      .catch((e) => aktiv && setFehler(e.message || 'Unbekannter Fehler'))
      .finally(() => aktiv && setLaden(false));
    return () => { aktiv = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { daten, laden, fehler };
}
