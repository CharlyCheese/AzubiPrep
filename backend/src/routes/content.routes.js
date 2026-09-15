// Content-Routen: health, fachrichtungen, module, fragen, suche, konstanten,
// admin/reload – siehe docs/09-API-Referenz.md.
import { Router } from 'express';
import { fragenAnzahlFachrichtung, moduleFuerFachrichtung, loadContent } from '../content.js';
import { pruefeAntwort, musterloesungFT } from '../answer.js';
import { adminSchutz, rateLimiter } from '../sicherheit.js';
import { config } from '../config.js';

export function buildContentRoutes(store) {
  const router = Router();

  router.get('/health', (req, res) => {
    const c = store.get();
    res.json({
      status: 'ok',
      geladenAm: c.geladenAm,
      fragenAnzahl: c.gesamtFragen,
      modulAnzahl: c.modulesById.size,
      fachrichtungAnzahl: c.fachrichtungenByCode.size,
      warnungen: c.warnungen.length,
    });
  });

  router.get('/konstanten', (req, res) => {
    const c = store.get();
    res.json({
      fachrichtungen: [...c.fachrichtungenByCode.keys()],
      fragetypen: ['SC', 'MC', 'FT'],
      schwierigkeiten: ['leicht', 'mittel', 'schwer'],
      bestehensgrenzeProzent: config.bestehensgrenzeProzent,
    });
  });

  router.get('/fachrichtungen', (req, res) => {
    const c = store.get();
    const liste = [...c.fachrichtungenByCode.values()].map((f) => ({
      ...f,
      fragenAnzahl: fragenAnzahlFachrichtung(c, f.code),
    }));
    res.json(liste);
  });

  router.get('/module', (req, res) => {
    const c = store.get();
    const { fachrichtung } = req.query;
    const basisliste = fachrichtung
      ? moduleFuerFachrichtung(c, String(fachrichtung))
      : [...c.modulesById.values()];
    const liste = basisliste.map((m) => ({
      ...m,
      fragenAnzahl: (c.questionsByModul.get(m.modul_id) || []).length,
    }));
    res.json(liste);
  });

  router.get('/module/:modulId', (req, res) => {
    const c = store.get();
    const modul = c.modulesById.get(req.params.modulId);
    if (!modul) {
      res.status(404).json({ error: 'Modul nicht gefunden' });
      return;
    }
    const fragen = c.questionsByModul.get(modul.modul_id) || [];
    const verteilung = { SC: 0, MC: 0, FT: 0, leicht: 0, mittel: 0, schwer: 0 };
    for (const f of fragen) {
      verteilung[f.typ] = (verteilung[f.typ] || 0) + 1;
      verteilung[f.schwierigkeit] = (verteilung[f.schwierigkeit] || 0) + 1;
    }
    res.json({
      ...modul,
      fragenAnzahl: fragen.length,
      verteilung,
      theorie: c.theorieByModul.get(modul.modul_id) || '',
    });
  });

  router.get('/fragen', (req, res) => {
    const c = store.get();
    const { modulId, fachrichtung, typ, schwierigkeit, limit } = req.query;

    let liste;
    if (modulId) {
      liste = [...(c.questionsByModul.get(String(modulId)) || [])];
    } else {
      liste = [...c.questionsById.values()];
    }
    if (fachrichtung) liste = liste.filter((f) => f.fachrichtung === fachrichtung);
    if (typ) liste = liste.filter((f) => f.typ === typ);
    if (schwierigkeit) liste = liste.filter((f) => f.schwierigkeit === schwierigkeit);

    const limitN = Number.parseInt(limit, 10);
    if (Number.isFinite(limitN) && limitN > 0) liste = liste.slice(0, limitN);

    res.json(liste);
  });

  router.get('/fragen/:id', (req, res) => {
    const c = store.get();
    const frage = c.questionsById.get(req.params.id);
    if (!frage) {
      res.status(404).json({ error: 'Frage nicht gefunden' });
      return;
    }
    res.json(frage);
  });

  router.post('/fragen/:id/pruefen', (req, res) => {
    const c = store.get();
    const frage = c.questionsById.get(req.params.id);
    if (!frage) {
      res.status(404).json({ error: 'Frage nicht gefunden' });
      return;
    }
    const nutzerAntwort = req.body?.antwort;
    if (nutzerAntwort === undefined || nutzerAntwort === null || String(nutzerAntwort).trim() === '') {
      res.status(400).json({ error: 'Antwort fehlt' });
      return;
    }
    const { richtig } = pruefeAntwort(frage, nutzerAntwort);
    const erwartet = frage.typ === 'FT' ? musterloesungFT(frage) : frage.antwort;
    res.json({
      frageId: frage.id,
      typ: frage.typ,
      richtig,
      erwartet,
      erklaerung: frage.erklaerung,
      nutzerAntwort,
    });
  });

  router.get('/suche', (req, res) => {
    const c = store.get();
    const q = String(req.query.q || '').trim().toLowerCase();
    if (q.length < 2) {
      res.status(400).json({ error: 'Suchbegriff zu kurz (mind. 2 Zeichen)' });
      return;
    }
    const module = [...c.modulesById.values()]
      .filter((m) => `${m.titel} ${m.beschreibung}`.toLowerCase().includes(q))
      .slice(0, 50);
    const fragen = [...c.questionsById.values()]
      .filter((f) => `${f.frage} ${f.erklaerung} ${f.thema}`.toLowerCase().includes(q))
      .slice(0, 100);
    res.json({ q, module, fragen });
  });

  // Fehlerbehandlung bewusst wie in exam.routes.js: try/catch + next(err),
  // zentraler fehlerHandler loggt und antwortet einheitlich (OPS-005).
  router.post('/admin/reload', adminSchutz, rateLimiter({ maxProMinute: config.rateLimitAdminMax, keyPrefix: 'admin:' }), (req, res, next) => {
    try {
      const neuerInhalt = loadContent(config.contentDir);
      store.set(neuerInhalt);
      res.json({
        status: 'ok',
        geladenAm: neuerInhalt.geladenAm,
        fragenAnzahl: neuerInhalt.gesamtFragen,
        warnungen: neuerInhalt.warnungen,
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
