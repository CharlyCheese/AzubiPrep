// Prüfungs-Generierung & -Auswertung (stateless) – siehe docs/09-API-Referenz.md
// und docs/03-Pruefungssimulation.md.
import { fragenFuerFachrichtung } from './content.js';
import { pruefeAntwort, musterloesungFT } from './answer.js';
import { config } from './config.js';

/** Fisher-Yates, optional gewichtet nach Thema (höheres Gewicht = eher vorne). */
function mischen(liste, gewichtung) {
  const arr = liste.map((f) => ({
    f,
    schluessel: Math.random() / (gewichtung?.[f.thema] > 0 ? gewichtung[f.thema] : 1),
  }));
  arr.sort((a, b) => a.schluessel - b.schluessel);
  return arr.map((x) => x.f);
}

export function generierePruefung(content, { fachrichtung, anzahl, gewichtung, schwierigkeit }) {
  if (!fachrichtung || !content.fachrichtungenByCode.has(fachrichtung)) {
    const err = new Error('Unbekannte oder fehlende Fachrichtung');
    err.status = 400;
    throw err;
  }
  const anzahlSicher = Math.max(1, Math.min(200, Number.isFinite(anzahl) ? Math.trunc(anzahl) : 40));

  let pool = fragenFuerFachrichtung(content, fachrichtung);
  if (schwierigkeit && schwierigkeit !== 'alle') {
    pool = pool.filter((f) => f.schwierigkeit === schwierigkeit);
  }
  if (pool.length === 0) {
    const err = new Error('Keine Fragen zur Auswahl (Filter zu eng)');
    err.status = 400;
    throw err;
  }

  const gemischt = mischen(pool, gewichtung);
  const gewaehlt = gemischt.slice(0, Math.min(anzahlSicher, gemischt.length));

  return {
    fragen: gewaehlt.map((f) => ({
      id: f.id,
      fachrichtung: f.fachrichtung,
      modul_id: f.modul_id,
      thema: f.thema,
      typ: f.typ,
      frage: f.frage,
      optionen: f.optionen,
      schwierigkeit: f.schwierigkeit,
    })),
    anzahl: gewaehlt.length,
    erstelltAm: new Date().toISOString(),
  };
}

export function auswertePruefung(content, { fragen }) {
  if (!Array.isArray(fragen) || fragen.length === 0) {
    const err = new Error('Keine Antworten übermittelt');
    err.status = 400;
    throw err;
  }

  const detail = [];
  const proModul = {};
  const proTyp = {};
  let richtigGesamt = 0;

  for (const eintrag of fragen) {
    const frage = content.questionsById.get(eintrag?.id);
    if (!frage) continue; // unbekannte/entfernte ID wird übersprungen

    const { richtig } = pruefeAntwort(frage, eintrag.antwort);
    const erwartetAnzeige = frage.typ === 'FT' ? musterloesungFT(frage) : frage.antwort;

    if (richtig) richtigGesamt += 1;

    detail.push({
      frageId: frage.id,
      modulId: frage.modul_id,
      typ: frage.typ,
      richtig,
      erwartet: erwartetAnzeige,
      nutzerAntwort: eintrag.antwort ?? '',
    });

    if (!proModul[frage.modul_id]) proModul[frage.modul_id] = { richtig: 0, gesamt: 0 };
    proModul[frage.modul_id].gesamt += 1;
    if (richtig) proModul[frage.modul_id].richtig += 1;

    if (!proTyp[frage.typ]) proTyp[frage.typ] = { richtig: 0, gesamt: 0 };
    proTyp[frage.typ].gesamt += 1;
    if (richtig) proTyp[frage.typ].richtig += 1;
  }

  const gesamt = detail.length;
  const scoreProzent = gesamt > 0 ? Math.round((richtigGesamt / gesamt) * 100) : 0;
  const bestanden = scoreProzent >= config.bestehensgrenzeProzent;

  const staerken = [];
  const schwaechen = [];
  for (const [modulId, stats] of Object.entries(proModul)) {
    const quote = stats.gesamt ? Math.round((stats.richtig / stats.gesamt) * 100) : 0;
    (quote >= 60 ? staerken : schwaechen).push({ modulId, quote });
  }
  staerken.sort((a, b) => b.quote - a.quote);
  schwaechen.sort((a, b) => a.quote - b.quote);

  return {
    scoreProzent,
    richtig: richtigGesamt,
    gesamt,
    bestanden,
    detail,
    proModul,
    proTyp,
    staerken,
    schwaechen,
  };
}
