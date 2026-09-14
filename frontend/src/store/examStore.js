// In-Memory-Store für den laufenden Prüfungs-/Übungsdurchgang.
// Kein Login/keine Benutzer-ID: Der Zustand liegt nur im Browser (kein Backend).
import { create } from './miniStore.js';

const store = create({
  fragen: [], // Fragen ohne Antwort (für die Prüfung)
  antworten: {}, // frageId -> antwort (String, z. B. 'a' | 'a,b' | Freitext)
  konfig: { fachrichtung: 'FIAE', anzahl: 30, zeitlimitMin: 45 },
  startAm: null,
  ergebnis: null,
  gespeichert: false,
});

export function useExamStore() {
  return store.useStore();
}
export const setExamState = store.setState;
export const getExamState = store.getState;
