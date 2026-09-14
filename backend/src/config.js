// Zentrale Konfiguration: alles aus Umgebungsvariablen mit sinnvollen
// Defaults (siehe docs/14-Betrieb-Wartung.md). Keine hart kodierten Pfade/Ports.
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// backend/src -> backend -> Projektwurzel
const projectRoot = path.resolve(__dirname, '..', '..');

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
  rateLimitMax: int(process.env.RATEN_LIMIT_MAX, 240),
  rateLimitAdminMax: int(process.env.RATEN_LIMIT_ADMIN_MAX, 5),
  contentDir: process.env.CONTENT_DIR
    ? path.resolve(process.env.CONTENT_DIR)
    : path.join(projectRoot, 'content'),
  frontendDist: process.env.FRONTEND_DIST
    ? path.resolve(process.env.FRONTEND_DIST)
    : path.join(projectRoot, 'frontend', 'dist'),
  bestehensgrenzeProzent: 50,
  projectRoot,
};

export default config;
