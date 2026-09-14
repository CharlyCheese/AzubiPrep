// Lernreise (Phase 5): virtuelle Landkarte des Lernwegs.
// Reine Funktionen (testbar) - die Seite Lernreise.jsx rendert nur.
// Aufbau: Stationen der gewaehlten Fachrichtung + gemeinsame Module (ALLE).
import { modulStufe, statusAnzeige, abdeckungProzent } from './modulStatus.js';

export const GRUPPE_FACHRICHTUNG = 'fachrichtung';
export const GRUPPE_GEMEINSAM = 'gemeinsam';

export const GRUPPEN_ANZEIGE = {
  [GRUPPE_FACHRICHTUNG]: 'Deine Fachrichtung',
  [GRUPPE_GEMEINSAM]: 'Gemeinsame Module (alle Fachrichtungen)',
};

/** Eine Station der Lernreise aus Modul + Modul-Status. */
export function baueStation(modul, nummer, gruppe = GRUPPE_FACHRICHTUNG, statusMap = {}) {
  const status = statusMap?.[modul.modul_id];
  const stufe = modulStufe(status);
  return {
    modulId: modul.modul_id,
    titel: modul.titel,
    beschreibung: modul.beschreibung || '',
    fachrichtung: modul.fachrichtung,
    fragenAnzahl: modul.fragenAnzahl || 0,
    nummer,
    gruppe,
    stufe,
    anzeige: statusAnzeige(status),
    bearbeitet: Boolean(status?.bearbeitet),
    beherrscht: Boolean(status?.beherrscht),
    anzahl: status?.anzahl || 0,
    quote: status?.quote || 0,
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

/** Lernreise einer Fachrichtung: eigene Stationen + gemeinsame Module (ALLE). */
export function baueLernreise(module = [], fachrichtung = 'FIAE', statusMap = {}) {
  const alle = module || [];
  const eigene = alle.filter((m) => m.fachrichtung === fachrichtung);
  const gemeinsam = alle.filter((m) => m.fachrichtung === 'ALLE');
  const stationen = eigene.map((m, i) => baueStation(m, i + 1, GRUPPE_FACHRICHTUNG, statusMap));
  const gemeinsame = gemeinsam.map((m, i) => baueStation(m, i + 1, GRUPPE_GEMEINSAM, statusMap));
  return {
    fachrichtung,
    stationen,
    gemeinsam: gemeinsame,
    alle: [...stationen, ...gemeinsame],
    fortschritt: fortschritt([...eigene, ...gemeinsam], statusMap),
  };
}

/** Naechste offene Station: erste nicht beherrschte Station (eigene zuerst). */
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