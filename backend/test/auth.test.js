// Testet die reinen Hilfsfunktionen aus backend/src/auth.js sowie die
// authPflicht-Middleware (JWT-Prüfung). autorPflicht/adminPflicht fragen
// zusätzlich die Nutzerrolle live aus der Datenbank ab und sind damit
// eher ein Fall für spätere API-Integrationstests (Stufe 3, mit echter
// Test-DB) als für isolierte Logik-Tests hier.
import { describe, it, expect, vi } from 'vitest';
import {
  passwortGueltig,
  emailGueltig,
  resetTokenErzeugen,
  resetTokenHashen,
  tokenErstellen,
  tokenPruefen,
  authPflicht,
} from '../src/auth.js';

describe('emailGueltig', () => {
  it('akzeptiert eine normale E-Mail-Adresse', () => {
    expect(emailGueltig('azubi@example.com')).toBe(true);
  });

  it('lehnt Adressen ohne @ oder ohne Domain-Punkt ab', () => {
    expect(emailGueltig('keine-email')).toBe(false);
    expect(emailGueltig('azubi@example')).toBe(false);
  });

  it('lehnt Nicht-Strings und überlange Adressen ab', () => {
    expect(emailGueltig(null)).toBe(false);
    expect(emailGueltig('a'.repeat(250) + '@example.com')).toBe(false);
  });
});

describe('passwortGueltig', () => {
  it('akzeptiert ein Passwort mit Klein-/Großbuchstabe, Ziffer und Sonderzeichen', () => {
    expect(passwortGueltig('Azubi2026!')).toBe(true);
  });

  it('lehnt ein zu kurzes Passwort ab', () => {
    expect(passwortGueltig('Az1!')).toBe(false);
  });

  it('lehnt ein Passwort ohne Sonderzeichen ab', () => {
    expect(passwortGueltig('Azubi2026')).toBe(false);
  });

  it('lehnt ein Passwort ohne Großbuchstabe ab', () => {
    expect(passwortGueltig('azubi2026!')).toBe(false);
  });

  it('lehnt ein Passwort ohne Ziffer ab', () => {
    expect(passwortGueltig('Azubiabcd!')).toBe(false);
  });
});

describe('resetTokenErzeugen / resetTokenHashen', () => {
  it('erzeugt bei jedem Aufruf einen anderen Klartext-Token', () => {
    const a = resetTokenErzeugen();
    const b = resetTokenErzeugen();
    expect(a.klartext).not.toBe(b.klartext);
  });

  it('der gespeicherte Hash passt zum Klartext (für den späteren DB-Vergleich)', () => {
    const { klartext, hash } = resetTokenErzeugen();
    expect(resetTokenHashen(klartext)).toBe(hash);
  });

  it('hasht denselben Klartext immer gleich (deterministisch, für Gleichheitsvergleich in der DB)', () => {
    expect(resetTokenHashen('abc123')).toBe(resetTokenHashen('abc123'));
  });

  it('setzt eine Ablaufzeit in der Zukunft (ca. 24h)', () => {
    const { laeuftAbAm } = resetTokenErzeugen();
    const stunden = (laeuftAbAm.getTime() - Date.now()) / (60 * 60 * 1000);
    expect(stunden).toBeGreaterThan(23);
    expect(stunden).toBeLessThanOrEqual(24);
  });
});

describe('tokenErstellen / tokenPruefen (JWT)', () => {
  it('erzeugt ein Token, das sich wieder auf denselben Nutzer zurückführen lässt', () => {
    const token = tokenErstellen({ id: 'user-1', email: 'azubi@example.com' });
    const payload = tokenPruefen(token);
    expect(payload.sub).toBe('user-1');
    expect(payload.email).toBe('azubi@example.com');
  });

  it('lehnt ein manipuliertes Token ab', () => {
    const token = tokenErstellen({ id: 'user-1', email: 'azubi@example.com' });
    expect(() => tokenPruefen(token + 'x')).toThrow();
  });
});

describe('authPflicht (Middleware)', () => {
  function fakeRes() {
    const res = {};
    res.status = vi.fn(() => res);
    res.json = vi.fn(() => res);
    return res;
  }

  it('lehnt eine Anfrage ohne Authorization-Header mit 401 ab', () => {
    const req = { header: () => undefined };
    const res = fakeRes();
    const next = vi.fn();
    authPflicht(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('lehnt ein ungültiges Token mit 401 ab', () => {
    const req = { header: () => 'Bearer ungueltiges-token' };
    const res = fakeRes();
    const next = vi.fn();
    authPflicht(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('lässt eine Anfrage mit gültigem Token durch und setzt req.userId', () => {
    const token = tokenErstellen({ id: 'user-42', email: 'azubi@example.com' });
    const req = { header: () => `Bearer ${token}` };
    const res = fakeRes();
    const next = vi.fn();
    authPflicht(req, res, next);
    expect(next).toHaveBeenCalledOnce();
    expect(req.userId).toBe('user-42');
    expect(res.status).not.toHaveBeenCalled();
  });
});
