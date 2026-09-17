// Zentrale Konfiguration: alles aus Umgebungsvariablen mit sinnvollen
// Defaults (siehe docs/14-Betrieb-Wartung.md). Keine hart kodierten Pfade/Ports.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as dotenvConfig } from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// backend/src -> backend -> Projektwurzel
const backendRoot = path.resolve(__dirname, '..');
const projectRoot = path.resolve(backendRoot, '..');

// Lädt backend/.env, falls vorhanden (z. B. DATABASE_URL, JWT_SECRET).
// Existiert die Datei nicht (z. B. in Produktion, wo echte Umgebungs-
// variablen gesetzt werden), passiert einfach nichts – kein Fehler.
dotenvConfig({ path: path.join(backendRoot, '.env') });

function bool(value, fallback) {
  if (value === undefined || value === '') return fallback;
  return value === '1' || value.toLowerCase() === 'true';
}

function int(value, fallback) {
  const n = Number.parseInt(value ?? '', 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export const config = {
  port: int(process.env.PORT, 3001),
  host: process.env.HOST || '127.0.0.1',
  adminToken: process.env.ADMIN_TOKEN || '',
  adminReloadEnabled: bool(process.env.ADMIN_RELOAD, true),
  demoEndpoints: bool(process.env.DEMO_ENDPOINTS, false),
  // War 240 – bei intensiven manuellen Testphasen (viele Reloads/Klicks
  // kurz hintereinander, zusätzlich durch React-StrictMode in der
  // Entwicklung effektiv verdoppelte Anfragen) kam es zu spürbaren „Zu
  // viele Anfragen“-Fehlern. Der eigentliche Haupttreiber (Benachrichtigungs-
  // Badge bei jedem Seitenwechsel) wurde in Layout.jsx behoben; dieser Wert
  // ist zusätzlich als Sicherheitsmarge angehoben.
  rateLimitMax: int(process.env.RATEN_LIMIT_MAX, 360),
  rateLimitAdminMax: int(process.env.RATEN_LIMIT_ADMIN_MAX, 5),
  contentDir: process.env.CONTENT_DIR
    ? path.resolve(process.env.CONTENT_DIR)
    : path.join(projectRoot, 'content'),
  frontendDist: process.env.FRONTEND_DIST
    ? path.resolve(process.env.FRONTEND_DIST)
    : path.join(projectRoot, 'frontend', 'dist'),
  bestehensgrenzeProzent: 50,
  projectRoot,

  // Datenbank (optional): ist DATABASE_URL nicht gesetzt, läuft die App
  // weiter im reinen Offline-/localStorage-Modus ohne Login/Sync (siehe db.js).
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',

  // Push-Benachrichtigungen (BE-001, optional): ohne diese drei Werte
  // bleibt die Funktion einfach deaktiviert (siehe push.js/isPushAktiviert),
  // genau wie DATABASE_URL bei Login/Sync. Erzeugung: siehe
  // backend/scripts/generate-vapid-keys.mjs.
  vapidPublicKey: process.env.VAPID_PUBLIC_KEY || '',
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY || '',
  vapidSubject: process.env.VAPID_SUBJECT || 'mailto:kontakt@example.com',
};

export default config;
