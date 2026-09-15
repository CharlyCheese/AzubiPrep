// Manueller Sync des Lernstands mit dem Backend (Last-Write-Wins, siehe
// docs/19-Datenbank-Login.md). Bewusst kein automatischer Hintergrund-Sync –
// der Nutzer stößt Hoch-/Herunterladen aktiv an, damit klar bleibt, welcher
// Stand gerade "gewinnt".
import { api } from './client.js';
import {
  profileStore,
  progressStore,
  examStore,
  activityStore,
  flashcardStore,
} from '../store/localStore.js';
import { gamificationStore } from '../store/gamificationStore.js';

// Zuordnung Store-Name (Backend, siehe sync.routes.js) -> lokaler Store.
// 'karten' heißt lokal so, beim Backend aber 'karteikarten' (siehe db/schema.sql).
const STORES = {
  profil: profileStore,
  fortschritt: progressStore,
  karteikarten: flashcardStore,
  pruefungen: examStore,
  aktivitaet: activityStore,
  gamification: gamificationStore,
};

/** Aktuellen lokalen Stand aller Stores zum Server hochladen. */
export async function hochladen() {
  const namen = Object.keys(STORES);
  for (const name of namen) {
    const daten = STORES[name].get();
    // Bewusst sequenziell: einfacher nachvollziehbar und die Datenmenge ist
    // pro Nutzer klein (kein Grund für Promise.all-Komplexität hier).
    // eslint-disable-next-line no-await-in-loop
    await api.put(`/sync/${name}`, { daten });
  }
  return namen.length;
}

/** Stand vom Server holen und alle lokalen Stores damit überschreiben. */
export async function herunterladen() {
  const antwort = await api.get('/sync');
  const stores = antwort?.stores || {};
  let anzahl = 0;
  for (const [name, store] of Object.entries(STORES)) {
    const eintrag = stores[name];
    if (!eintrag) continue;
    if (name === 'gamification') store.replace(eintrag.daten);
    else if (name === 'profil') store.set(eintrag.daten);
    else store.setAll(eintrag.daten);
    anzahl += 1;
  }
  return anzahl;
}
