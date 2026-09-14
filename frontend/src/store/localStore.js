import { gamificationStore } from './gamificationStore.js';
// Lokale Datenhaltung (localStorage). Da es kein Login/keine Benutzer-IDs gibt,
// wird ein einzelner lokaler Profilbereich verwendet. Alle Module hier sind
// synchron und werfen bei JSON-Fehlern keine Ausnahme (Defensive).
const PREFIX = 'azubiprep.';

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.warn('localStorage nicht verfügbar:', err);
  }
}

// ---- Lernprofil / Einstellungen ----
export const profileStore = {
  get() {
    return read('profil', {
      fachrichtung: 'FIAE',
      name: 'Lernende:r',
      prüfungstermin: null, // ISO-Datum, optional
      erstelltAm: null,
    });
  },
  set(profil) {
    write('profil', profil);
  },
};

// ---- Lernfortschritt je Frage ----
// Struktur: { [frageId]: { richtig, falsch, letzteAntwort, letztesErgebnis, geübtAm } }
export const progressStore = {
  get() {
    return read('fortschritt', {});
  },
  record(frageId, richtig, modulId) {
    const all = this.get();
    const eintrag = all[frageId] || { richtig: 0, falsch: 0, letztesErgebnis: null, geübtAm: null };
    if (richtig) eintrag.richtig += 1;
    else eintrag.falsch += 1;
    eintrag.letztesErgebnis = richtig;
    eintrag.modulId = modulId || eintrag.modulId || '';
    eintrag.geübtAm = new Date().toISOString();
    all[frageId] = eintrag;
    write('fortschritt', all);
    return eintrag;
  },
  reset() {
    write('fortschritt', {});
  },
};

// ---- Prüfungsverlauf ----
export const examStore = {
  get() {
    return read('pruefungen', []);
  },
  add(ergebnis) {
    const list = this.get();
    list.push({ ...ergebnis, am: new Date().toISOString() });
    write('pruefungen', list);
    return list;
  },
  reset() {
    write('pruefungen', []);
  },
};

// ---- Notizen ----
// Snapshot-Cache: useSyncExternalStore verlangt eine STABILE Referenz, solange
// sich die Daten nicht ändern – sonst Endlos-Renderloop und die Seite bricht.
let notizenCache = [];
let notizenRaw = null;

function notizenSnapshot() {
  let raw = '[]';
  try {
    raw = localStorage.getItem(PREFIX + 'notizen') || '[]';
  } catch {
    raw = '[]';
  }
  if (raw !== notizenRaw) {
    notizenRaw = raw;
    try {
      const parsed = JSON.parse(raw);
      notizenCache = Array.isArray(parsed) ? parsed : [];
    } catch {
      notizenCache = [];
    }
  }
  return notizenCache;
}

export const notesStore = {
  get() {
    return notizenSnapshot();
  },
  /** Stabile Referenz für useSyncExternalStore. */
  snapshot() {
    return notizenSnapshot();
  },
  /** Abonnement für useSyncExternalStore. */
  subscribe(cb) {
    const handler = () => cb();
    window.addEventListener('azubiprep-notizen', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('azubiprep-notizen', handler);
      window.removeEventListener('storage', handler);
    };
  },
  add({ modulId, titel, inhalt }) {
    const list = [...this.get()];
    list.unshift({
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      modulId: modulId || '',
      titel: titel || 'Ohne Titel',
      inhalt: inhalt || '',
      erstelltAm: new Date().toISOString(),
    });
    write('notizen', list);
    return list;
  },
  /** Mehrere Notizen in einem Schritt ergänzen (Import). */
  addBulk(items) {
    const list = [...this.get()];
    const jetzt = Date.now();
    items.forEach((item, i) => {
      if (!item || (!item.titel && !item.inhalt)) return;
      list.unshift({
        id: `note-${jetzt}-${i}-${Math.random().toString(36).slice(2, 6)}`,
        modulId: item.modulId || '',
        titel: item.titel || 'Ohne Titel',
        inhalt: item.inhalt || '',
        erstelltAm: new Date().toISOString(),
      });
    });
    write('notizen', list);
    return list;
  },
  /** Notiz bearbeiten (Titel/Modul/Inhalt). */
  update(id, patch) {
    const list = this.get().map((n) =>
      n.id === id ? { ...n, ...patch, geaendertAm: new Date().toISOString() } : n,
    );
    write('notizen', list);
    return list;
  },
  setAll(list) {
    write('notizen', Array.isArray(list) ? list : []);
    return this.get();
  },
  remove(id) {
    write('notizen', this.get().filter((n) => n.id !== id));
  },
};

// ---- Lernaktivität je Tag (für Kalender & Serien) ----
export const activityStore = {
  get() {
    return read('aktivitaet', {});
  },
  add(dateKey, anteil = 1) {
    const all = this.get();
    all[dateKey] = (all[dateKey] || 0) + anteil;
    write('aktivitaet', all);
  },
  reset() {
    write('aktivitaet', {});
  },
};

// ---- Eigene Tagesplanung (Kalender) ----
// Struktur: { [dateKey]: [ { id, titel, modulId, erledigt } ] }
export const planStore = {
  get() {
    return read('plan', {});
  },
  fuerTag(dateKey) {
    return this.get()[dateKey] || [];
  },
  add(dateKey, { titel, modulId }) {
    const all = this.get();
    const liste = [...(all[dateKey] || [])];
    liste.push({
      id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      titel: titel || 'Lerneinheit',
      modulId: modulId || '',
      erledigt: false,
    });
    all[dateKey] = liste;
    write('plan', all);
    return liste;
  },
  toggle(dateKey, id) {
    const all = this.get();
    all[dateKey] = (all[dateKey] || []).map((p) => (p.id === id ? { ...p, erledigt: !p.erledigt } : p));
    write('plan', all);
  },
  update(dateKey, id, patch) {
    const all = this.get();
    all[dateKey] = (all[dateKey] || []).map((p) => (p.id === id ? { ...p, ...patch } : p));
    write('plan', all);
  },
  remove(dateKey, id) {
    const all = this.get();
    all[dateKey] = (all[dateKey] || []).filter((p) => p.id !== id);
    if (all[dateKey].length === 0) delete all[dateKey];
    write('plan', all);
  },
  reset() {
    write('plan', {});
  },
};

// ---- Karteikarten (Spaced Repetition, Leitner-Boxen 1–5) ----
// Intervall je Box: 1=1 Tag, 2=3, 3=7, 4=14, 5=30 Tage.
const BOX_INTERVALLE = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 };

export const flashcardStore = {
  get() {
    return read('karten', {});
  },
  /** Bewertung 'schwer' | 'mittel' | 'leicht' verschiebt die Karte. */
  review(frageId, bewertung) {
    const all = this.get();
    const karte = all[frageId] || { box: 1, wiederholungen: 0, letzteBewertung: null };
    if (bewertung === 'schwer') karte.box = Math.max(1, karte.box - 1);
    else if (bewertung === 'leicht') karte.box = Math.min(5, karte.box + 1);
    karte.letzteBewertung = bewertung;
    karte.wiederholungen += 1;
    karte.faelligAm = addDays(BOX_INTERVALLE[karte.box] || 1);
    all[frageId] = karte;
    write('karten', all);
    return karte;
  },
  /** Karte auf ein bestimmtes Datum verschieben (YYYY-MM-DD oder ISO). */
  reschedule(frageId, datum) {
    const all = this.get();
    const karte = all[frageId] || { box: 1, wiederholungen: 0, letzteBewertung: null };
    karte.faelligAm = tagZuIso(datum);
    all[frageId] = karte;
    write('karten', all);
    return karte;
  },
  /** Als erledigt markieren: nächste Wiederholung nach dem Box-Intervall. */
  markDone(frageId) {
    const all = this.get();
    const karte = all[frageId] || { box: 1, wiederholungen: 0, letzteBewertung: null };
    karte.wiederholungen = (karte.wiederholungen || 0) + 1;
    karte.faelligAm = addDays(BOX_INTERVALLE[karte.box] || 1);
    all[frageId] = karte;
    write('karten', all);
    return karte;
  },
  /** Alle Karten (ggf. gefiltert nach fälligen) */
  alle(faelligNur = false) {
    const all = this.get();
    const now = new Date().toISOString();
    return Object.entries(all)
      .filter(([, k]) => !faelligNur || !k.faelligAm || k.faelligAm <= now)
      .map(([frageId, k]) => ({ frageId, ...k }));
  },
  reset() {
    write('karten', {});
  },
};

function addDays(tage) {
  const d = new Date();
  d.setDate(d.getDate() + tage);
  return d.toISOString();
}

/** 'YYYY-MM-DD' → ISO um 12:00 Ortszeit (vermeidet Zeitzonen-Randfälle). */
function tagZuIso(datum) {
  if (typeof datum === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(datum)) {
    return new Date(`${datum}T12:00:00`).toISOString();
  }
  return new Date(datum).toISOString();
}

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

// ---- Quiz-Optionen (Schwierigkeit und Anzahl der Fragen) ----
export const quizOptionenStore = {
  get() {
    return read('quizoptionen', { schwierigkeit: 'alle', anzahl: 0 });
  },
  set(optionen) {
    write('quizoptionen', { ...this.get(), ...optionen });
  },
  reset() {
    write('quizoptionen', { schwierigkeit: 'alle', anzahl: 0 });
  },
};

export function resetAll() {
  write('notizen', []);
  progressStore.reset();
  examStore.reset();
  activityStore.reset();
  flashcardStore.reset();
  planStore.reset();
  quizOptionenStore.reset();
  gamificationStore.reset();
}
