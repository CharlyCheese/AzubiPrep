// Lernreise (Phase 5, seit FE-020 nach Lernfeld gegliedert): virtuelle
// Landkarte des Lernwegs. Reine Funktionen (testbar) - die Seite
// Lernreise.jsx rendert nur.
// Aufbau: Stationen der gewaehlten Fachrichtung + gemeinsame Module (ALLE),
// Lernfelder behalten ihre offizielle Zuordnung. Für den Lernweg stehen
// WISO und Projektmanagement als eigene Etappen direkt hinter LF1.
import { modulStufe, statusAnzeige, abdeckungProzent } from './modulStatus.js';
import { gruppiereNachLernfeld } from './lernfeldOrdnung.js';

// Weiterhin exportiert: markiert auf einer einzelnen Station, ob ihr Modul
// gemeinsam (ALLE) oder fachrichtungsspezifisch ist (Badge-Anzeige in
// Lernreise.jsx) – nicht mehr die primäre Gruppierung der Seite.
export const GRUPPE_FACHRICHTUNG = 'fachrichtung';
export const GRUPPE_GEMEINSAM = 'gemeinsam';

/** Eine Station der Lernreise aus Modul + Modul-Status. */
export function baueStation(modul, nummer, statusMap = {}) {
  const status = statusMap?.[modul.modul_id];
  const stufe = modulStufe(status);
  return {
    modulId: modul.modul_id,
    titel: modul.titel,
    beschreibung: modul.beschreibung || '',
    fachrichtung: modul.fachrichtung,
    lernfeld: modul.lernfeld || '',
    fragenAnzahl: modul.fragenAnzahl || 0,
    nummer,
    gruppe: modul.fachrichtung === 'ALLE' ? GRUPPE_GEMEINSAM : GRUPPE_FACHRICHTUNG,
    stufe,
    anzeige: statusAnzeige(status),
    bearbeitet: Boolean(status?.bearbeitet),
    beherrscht: Boolean(status?.beherrscht),
    anzahl: status?.anzahl || 0,
    quote: status?.quote || 0,
    richtig: status?.richtig || 0,
    beherrschung: status?.beherrschung || 0,
    gesamt: modul.fragenAnzahl || 0,
    // Fortschritt immer bezogen auf die maximale Fragenzahl des Moduls
    abdeckung: abdeckungProzent(status?.anzahl || 0, modul.fragenAnzahl || 0),
  };
}

/** Fortschritt einer Modulliste. */
export function fortschritt(module = [], statusMap = {}) {
  const gesamt = module.length;
  const bearbeitet = module.filter((m) => statusMap?.[m.modul_id]?.bearbeitet).length;
  const beherrscht = module.filter((m) => statusMap?.[m.modul_id]?.beherrscht).length;
  const anteil = (n) => (gesamt ? Math.round((n / gesamt) * 100) : 0);
  return {
    gesamt,
    bearbeitet,
    beherrscht,
    prozentBearbeitet: anteil(bearbeitet),
    prozentBeherrscht: anteil(beherrscht),
  };
}

/**
 * Lernreise einer Fachrichtung: eigene Module + gemeinsame Module (ALLE),
 * in Etappen gegliedert (LF1, WISO, PM, LF2…LF9, dann LF10-12). Die
 * Stationsnummerierung läuft durchgehend über alle Gruppen hinweg, damit
 * sie den chronologischen Ausbildungsverlauf abbildet.
 */
export function baueLernreise(module = [], fachrichtung = 'FIAE', statusMap = {}) {
  const alle = module || [];
  const relevante = alle.filter((m) => m.fachrichtung === fachrichtung || m.fachrichtung === 'ALLE');
  const extraStages = [
    { lernfeld: 'WISO', titel: 'Sonstige Prüfungsbereiche · Wirtschafts- und Sozialkunde' },
    { lernfeld: 'PM', titel: 'Projektmanagement' },
  ].map(stage => ({ ...stage, module: relevante.filter(m => m.modul_id === stage.lernfeld) }))
    .filter(stage => stage.module.length);
  const lernfeldGruppen = gruppiereNachLernfeld(relevante.filter(m => !['WISO', 'PM'].includes(m.modul_id)), fachrichtung);
  const afterLF1 = lernfeldGruppen.findIndex(group => group.lernfeld.split('/')[0] === 'LF1') + 1;
  lernfeldGruppen.splice(afterLF1, 0, ...extraStages);

  let laufendeNummer = 0;
  const gruppen = lernfeldGruppen.map((g) => ({
    lernfeld: g.lernfeld,
    titel: g.titel,
    stationen: g.module.map((m) => {
      laufendeNummer += 1;
      // Gruppenschlüssel für Aufklappen/Fortsetzen; die Modulmetadaten bleiben unverändert.
      return { ...baueStation(m, laufendeNummer, statusMap), lernfeld: g.lernfeld };
    }),
  }));

  return {
    fachrichtung,
    gruppen,
    alle: gruppen.flatMap((g) => g.stationen),
    fortschritt: fortschritt(relevante, statusMap),
  };
}

/** Naechste offene Station: erste nicht beherrschte Station in Lernfeld-Reihenfolge. */
export function naechsteStation(reise) {
  return reise?.alle?.find((s) => !s.beherrscht) || null;
}

/** Uebersicht ueber alle Fachrichtungen (gemeinsame Module zaehlen jeweils mit). */
export function fachrichtungsUebersicht(module = [], statusMap = {}, fachrichtungen = []) {
  const liste = fachrichtungen || [];
  const ausModulen = [...new Set((module || []).map((m) => m.fachrichtung).filter((c) => c && c !== 'ALLE'))];
  const codes = liste.length ? liste.map((f) => f.code) : ausModulen;
  return codes.map((code) => {
    const reise = baueLernreise(module, code, statusMap);
    const name = liste.find((f) => f.code === code)?.name || code;
    return { code, name, ...reise.fortschritt };
  });
}
