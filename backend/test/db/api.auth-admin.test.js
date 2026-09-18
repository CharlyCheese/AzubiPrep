// DB-Integrationstests: Registrierung/Login (auth.routes.js) und die
// Rechteprüfung der Autoren-Weboberfläche (content-admin.routes.js,
// autorPflicht-Middleware). Läuft NUR über "npm run test:db" gegen eine
// per DATABASE_URL konfigurierte Wegwerf-Datenbank (siehe
// vitest.db.config.js + test/db/setup.js – dort die Sicherheits-Sperre
// ALLOW_DB_TESTS).
//
// Bewusst als eigener Testlauf statt Teil von test/api.content-exam.test.js:
// diese Routen existieren laut backend/src/app.js nur, wenn DATABASE_URL
// gesetzt ist (isDbAktiviert()) – ein Mischen mit den DB-freien Tests
// würde die beiden Betriebsmodi (mit/ohne DB) in derselben Datei
// vermischen.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { query, schliessen } from '../../src/db.js';

// Eindeutiger Lauf-Präfix, damit parallele/wiederholte Testläufe sich nicht
// über bestehende E-Mail-Adressen in die Quere kommen.
const LAUF_ID = Date.now();
const email = (name) => `test-${LAUF_ID}-${name}@example.invalid`;

function baueLeerenStore() {
  const content = {
    geladenAm: new Date().toISOString(),
    quelle: 'test-fixture',
    warnungen: [],
    fachrichtungenByCode: new Map(),
    modulesById: new Map(),
    questionsById: new Map(),
    questionsByModul: new Map(),
    theorieByModul: new Map(),
    gesamtFragen: 0,
  };
  return { get: () => content, set: () => {} };
}

const app = createApp(baueLeerenStore());

afterAll(async () => {
  // Aufräumen: nur die in diesem Lauf angelegten Test-Nutzer löschen.
  await query('DELETE FROM users WHERE email LIKE $1', [`test-${LAUF_ID}-%`]);
  await schliessen();
});

describe('POST /api/auth/register', () => {
  it('lehnt ein zu schwaches Passwort ab', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: email('schwach'), passwort: 'zuschwach' });
    expect(res.status).toBe(400);
  });

  it('registriert einen neuen Nutzer mit Standardrolle "lernende"', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: email('neu'), passwort: 'Azubi2026!', fachrichtung: 'FIAE' });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.rolle).toBe('lernende');
  });

  it('lehnt eine bereits registrierte E-Mail-Adresse ab (generische Meldung)', async () => {
    const doppelt = email('doppelt');
    const erste = await request(app).post('/api/auth/register').send({ email: doppelt, passwort: 'Azubi2026!' });
    expect(erste.status).toBe(201);

    const zweite = await request(app).post('/api/auth/register').send({ email: doppelt, passwort: 'Azubi2026!' });
    expect(zweite.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  const loginEmail = email('login');
  beforeAll(async () => {
    await request(app).post('/api/auth/register').send({ email: loginEmail, passwort: 'Azubi2026!' });
  });

  it('lehnt ein falsches Passwort ab (401, generische Meldung)', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: loginEmail, passwort: 'FalschesPasswort1!' });
    expect(res.status).toBe(401);
  });

  it('lehnt eine unbekannte E-Mail-Adresse ab, ohne das zu verraten', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: email('unbekannt'), passwort: 'Azubi2026!' });
    expect(res.status).toBe(401);
    // Gleiche Fehlermeldung wie bei falschem Passwort -> kein Enumeration-Leck.
    const falschesPasswort = await request(app).post('/api/auth/login').send({ email: loginEmail, passwort: 'FalschesPasswort1!' });
    expect(res.body.error).toBe(falschesPasswort.body.error);
  });

  it('meldet einen Nutzer mit korrektem Passwort an', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: loginEmail, passwort: 'Azubi2026!' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe(loginEmail);
  });
});

describe('GET /api/auth/me', () => {
  it('lehnt eine Anfrage ohne Token ab', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('liefert den eigenen Nutzer bei gültigem Token', async () => {
    const meEmail = email('me');
    const registrieren = await request(app).post('/api/auth/register').send({ email: meEmail, passwort: 'Azubi2026!' });
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${registrieren.body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(meEmail);
  });
});

describe('GET /api/admin/questions (Autoren-Rechteprüfung)', () => {
  it('lehnt eine Anfrage ohne Token mit 401 ab', async () => {
    const res = await request(app).get('/api/admin/questions');
    expect(res.status).toBe(401);
  });

  it('lehnt einen eingeloggten Nutzer ohne autor/admin-Rolle mit 403 ab', async () => {
    const registrieren = await request(app)
      .post('/api/auth/register')
      .send({ email: email('lernende'), passwort: 'Azubi2026!' });
    const res = await request(app)
      .get('/api/admin/questions')
      .set('Authorization', `Bearer ${registrieren.body.token}`);
    expect(res.status).toBe(403);
  });

  it('lässt einen Nutzer mit Rolle "autor" durch, sobald die Rolle gesetzt ist', async () => {
    const autorEmail = email('autor');
    const registrieren = await request(app).post('/api/auth/register').send({ email: autorEmail, passwort: 'Azubi2026!' });
    // Rollenvergabe passiert in der echten App nie über die API (bewusst kein
    // Self-Service), sondern direkt per SQL durch eine Admin-Person – das
    // hier simuliert genau diesen Schritt.
    await query("UPDATE users SET rolle = 'autor' WHERE email = $1", [autorEmail]);

    const res = await request(app)
      .get('/api/admin/questions')
      .set('Authorization', `Bearer ${registrieren.body.token}`);
    expect(res.status).toBe(200);
  });
});
