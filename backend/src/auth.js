// Passwort-Hashing und JWT-Hilfsfunktionen für Login/Registrierung.
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from './config.js';
import { query } from './db.js';

const SALZ_RUNDEN = 12;

export async function passwortHashen(klartext) {
  return bcrypt.hash(klartext, SALZ_RUNDEN);
}

export async function passwortPruefen(klartext, hash) {
  return bcrypt.compare(klartext, hash);
}

export function tokenErstellen(user) {
  if (!config.jwtSecret) {
    throw new Error('JWT_SECRET ist nicht konfiguriert');
  }
  return jwt.sign({ sub: user.id, email: user.email }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

export function tokenPruefen(token) {
  if (!config.jwtSecret) {
    throw new Error('JWT_SECRET ist nicht konfiguriert');
  }
  return jwt.verify(token, config.jwtSecret);
}

/** Express-Middleware: verlangt einen gültigen "Authorization: Bearer <token>"-Header. */
export function authPflicht(req, res, next) {
  const header = req.header('authorization') || '';
  const [typ, token] = header.split(' ');
  if (typ !== 'Bearer' || !token) {
    res.status(401).json({ error: 'Anmeldung erforderlich' });
    return;
  }
  try {
    const payload = tokenPruefen(token);
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: 'Ungültiges oder abgelaufenes Login-Token' });
    return;
  }
}

/**
 * Express-Middleware (CONTENT-001, nach authPflicht einsetzen): verlangt
 * die Rolle 'autor' oder 'admin'. Fragt die Rolle bewusst frisch aus der
 * DB ab (nicht aus dem JWT), damit eine per SQL geänderte Rolle sofort
 * wirkt, ohne dass sich der Nutzer neu einloggen muss. Hängt bei Erfolg
 * `req.userRolle` und `req.userFachrichtung` für die nachgelagerten Routen
 * an (Fachrichtungs-Scoping: 'autor' nur eigene fachrichtung + 'ALLE',
 * 'admin' uneingeschränkt).
 */
export async function autorPflicht(req, res, next) {
  try {
    const { rows } = await query('SELECT rolle, fachrichtung FROM users WHERE id = $1', [req.userId]);
    const user = rows[0];
    if (!user || (user.rolle !== 'autor' && user.rolle !== 'admin')) {
      res.status(403).json({ error: 'Keine Berechtigung für die Content-Pflege' });
      return;
    }
    req.userRolle = user.rolle;
    req.userFachrichtung = user.fachrichtung;
    next();
  } catch (err) {
    next(err);
  }
}

const EMAIL_MUSTER = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function emailGueltig(email) {
  return typeof email === 'string' && email.length <= 254 && EMAIL_MUSTER.test(email);
}

const PASSWORT_MIN_LAENGE = 8;
const PASSWORT_MAX_LAENGE = 200;

/**
 * Passwort-Komplexität für die Registrierung: Mindestlänge plus je mindestens
 * ein Klein-/Großbuchstabe, eine Ziffer und ein Sonderzeichen. Bewusst NUR
 * bei der Registrierung genutzt (nicht beim Login), damit Bestandsnutzer mit
 * einem vor dieser Regel angelegten, einfacheren Passwort nicht ausgesperrt
 * werden.
 */
export function passwortGueltig(passwort) {
  if (typeof passwort !== 'string') return false;
  if (passwort.length < PASSWORT_MIN_LAENGE || passwort.length > PASSWORT_MAX_LAENGE) return false;
  const hatKleinbuchstabe = /[a-z]/.test(passwort);
  const hatGrossbuchstabe = /[A-Z]/.test(passwort);
  const hatZiffer = /[0-9]/.test(passwort);
  const hatSonderzeichen = /[^A-Za-z0-9]/.test(passwort);
  return hatKleinbuchstabe && hatGrossbuchstabe && hatZiffer && hatSonderzeichen;
}
