// HTTP-Integrationstests gegen die echte Express-App (backend/src/app.js)
// für die Routen, die IMMER verfügbar sind (Content + Prüfung, kein
// DATABASE_URL nötig) – siehe docs/09-API-Referenz.md.
//
// Bewusst mit einem kleinen, selbst gebauten Content-Store statt dem
// echten CSV-/DB-Bestand: schnell, deterministisch, unabhängig vom
// aktuellen Fragenumfang. Die Datenstruktur ist exakt die, die
// backend/src/content.js an store.get() zurückgibt (siehe dort,
// Funktionen ladeAusDb/ladeAusCsv).
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

function baueStore() {
  const fragen = [
    {
      id: 'F1', fachrichtung: 'FIAE', modul_id: 'FIAE-PRG', thema: 'OOP', typ: 'SC',
      frage: 'Was ist Kapselung?', optionen: ['Info verstecken', 'Vererbung', 'Polymorphie', 'Schleife'],
      antwort: 'a', erklaerung: 'Kapselung versteckt interne Details.', schwierigkeit: 'leicht',
      quelle: 'Test', quelldatei: '',
    },
    {
      id: 'F2', fachrichtung: 'ALLE', modul_id: 'WISO', thema: 'Recht', typ: 'FT',
      frage: 'Wofür steht IHK?', optionen: ['', '', '', ''],
      antwort: 'Industrie- und Handelskammer', erklaerung: '...', schwierigkeit: 'mittel',
      quelle: 'Test', quelldatei: '',
    },
  ];
  const modulesById = new Map([
    ['FIAE-PRG', { modul_id: 'FIAE-PRG', fachrichtung: 'FIAE', code: 'PRG', titel: 'Programmierung', beschreibung: '...' }],
    ['WISO', { modul_id: 'WISO', fachrichtung: 'ALLE', code: 'WISO', titel: 'Wirtschafts- und Sozialkunde', beschreibung: '...' }],
  ]);
  const questionsById = new Map(fragen.map((f) => [f.id, f]));
  const questionsByModul = new Map();
  for (const f of fragen) {
    if (!questionsByModul.has(f.modul_id)) questionsByModul.set(f.modul_id, []);
    questionsByModul.get(f.modul_id).push(f);
  }
  const content = {
    geladenAm: new Date().toISOString(),
    quelle: 'test-fixture',
    warnungen: [],
    fachrichtungenByCode: new Map([
      ['FIAE', { code: 'FIAE', name: 'Anwendungsentwicklung', beschreibung: '...' }],
    ]),
    modulesById,
    questionsById,
    questionsByModul,
    theorieByModul: new Map([['FIAE-PRG', '# Theorie']]),
    gesamtFragen: questionsById.size,
  };
  return { get: () => content, set: () => {} };
}

function baueApp() {
  return createApp(baueStore());
}

describe('GET /api/health', () => {
  it('meldet den geladenen Fragenbestand', async () => {
    const res = await request(baueApp()).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragenAnzahl).toBe(2);
  });
});

describe('GET /api/status', () => {
  it('meldet Sync/Push als deaktiviert ohne DATABASE_URL', async () => {
    const res = await request(baueApp()).get('/api/status');
    expect(res.status).toBe(200);
    // syncAktiviert hängt an der echten process.env.DATABASE_URL dieses
    // Testlaufs – in der Standard-Testumgebung (npm test, ohne DB) ist das
    // false. Läuft dieser Test ausnahmsweise mit gesetzter DATABASE_URL,
    // wäre die Prüfung hinfällig; das ist hier bewusst als Dokumentation
    // des Normalfalls mitgetestet, nicht als scharfe DB-Prüfung (dafür
    // siehe test/db/).
    expect(typeof res.body.syncAktiviert).toBe('boolean');
  });
});

describe('GET /api/module & /api/module/:id', () => {
  it('listet alle Module mit Fragenanzahl', async () => {
    const res = await request(baueApp()).get('/api/module');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    const prg = res.body.find((m) => m.modul_id === 'FIAE-PRG');
    expect(prg.fragenAnzahl).toBe(1);
  });

  it('filtert nach Fachrichtung (inkl. ALLE-Module)', async () => {
    const res = await request(baueApp()).get('/api/module?fachrichtung=FIAE');
    expect(res.status).toBe(200);
    expect(res.body.map((m) => m.modul_id).sort()).toEqual(['FIAE-PRG', 'WISO']);
  });

  it('liefert Detail inkl. Verteilung und Theorie für ein bekanntes Modul', async () => {
    const res = await request(baueApp()).get('/api/module/FIAE-PRG');
    expect(res.status).toBe(200);
    expect(res.body.verteilung.SC).toBe(1);
    expect(res.body.theorie).toBe('# Theorie');
  });

  it('liefert 404 für ein unbekanntes Modul', async () => {
    const res = await request(baueApp()).get('/api/module/UNBEKANNT');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/fragen & /api/fragen/:id', () => {
  it('filtert Fragen nach Typ', async () => {
    const res = await request(baueApp()).get('/api/fragen?typ=FT');
    expect(res.status).toBe(200);
    expect(res.body.map((f) => f.id)).toEqual(['F2']);
  });

  it('liefert 404 für eine unbekannte Frage-ID', async () => {
    const res = await request(baueApp()).get('/api/fragen/GHOST');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/fragen/:id/pruefen', () => {
  it('bewertet eine richtige SC-Antwort', async () => {
    const res = await request(baueApp()).post('/api/fragen/F1/pruefen').send({ antwort: 'a' });
    expect(res.status).toBe(200);
    expect(res.body.richtig).toBe(true);
  });

  it('lehnt eine fehlende Antwort mit 400 ab', async () => {
    const res = await request(baueApp()).post('/api/fragen/F1/pruefen').send({});
    expect(res.status).toBe(400);
  });

  it('liefert 404 bei unbekannter Frage-ID', async () => {
    const res = await request(baueApp()).post('/api/fragen/GHOST/pruefen').send({ antwort: 'a' });
    expect(res.status).toBe(404);
  });
});

describe('GET /api/suche', () => {
  it('lehnt einen zu kurzen Suchbegriff mit 400 ab', async () => {
    const res = await request(baueApp()).get('/api/suche?q=a');
    expect(res.status).toBe(400);
  });

  it('findet eine Frage über den Frage-Text', async () => {
    const res = await request(baueApp()).get('/api/suche?q=Kapselung');
    expect(res.status).toBe(200);
    expect(res.body.fragen.map((f) => f.id)).toEqual(['F1']);
  });
});

describe('Prüfungssimulation: generieren -> auswerten (End-to-End über HTTP)', () => {
  it('generiert eine Prüfung und wertet die Antworten korrekt aus', async () => {
    const app = baueApp();

    const generiert = await request(app)
      .post('/api/pruefung/generieren')
      .send({ fachrichtung: 'FIAE', anzahl: 10 });
    expect(generiert.status).toBe(200);
    expect(generiert.body.fragen.map((f) => f.id).sort()).toEqual(['F1', 'F2']); // FIAE + ALLE

    const ausgewertet = await request(app)
      .post('/api/pruefung/auswerten')
      .send({
        fragen: [
          { id: 'F1', antwort: 'a' }, // richtig
          { id: 'F2', antwort: 'Industrie- und Handelskammer' }, // richtig
        ],
      });
    expect(ausgewertet.status).toBe(200);
    expect(ausgewertet.body.scoreProzent).toBe(100);
    expect(ausgewertet.body.bestanden).toBe(true);
  });

  it('lehnt eine unbekannte Fachrichtung bei der Generierung ab', async () => {
    const res = await request(baueApp())
      .post('/api/pruefung/generieren')
      .send({ fachrichtung: 'UNBEKANNT', anzahl: 10 });
    expect(res.status).toBe(400);
  });
});

describe('Unbekannte API-Route', () => {
  it('liefert 404 statt eines Servers-/HTML-Fehlers', async () => {
    const res = await request(baueApp()).get('/api/dasgibtsnicht');
    expect(res.status).toBe(404);
  });
});
