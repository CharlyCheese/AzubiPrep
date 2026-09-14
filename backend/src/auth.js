// Passwort-Hashing und JWT-Hilfsfunktionen für Login/Registrierung.
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from './config.js';

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
  }
}

const EMAIL_MUSTER = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function emailGueltig(email) {
  return typeof email === 'string' && email.length <= 254 && EMAIL_MUSTER.test(email);
}

export function passwortGueltig(passwort) {
  return typeof passwort === 'string' && passwort.length >= 8 && passwort.length <= 200;
}
