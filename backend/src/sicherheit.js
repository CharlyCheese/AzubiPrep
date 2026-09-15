// Sicherheitsbausteine gemäß docs/17-Sicherheit.md:
// - Security-Header via helmet (CSP, nosniff, Frame-Options, Referrer-Policy, HSTS)
// - kein CORS (App + API auf gleicher Origin)
// - In-Memory-Rate-Limiter je IP (Standard: 240/min API, 5/min Admin-Reload)
// - Admin-Reload nur von Loopback oder mit gültigem x-admin-token
// - generische Fehlermeldungen (Details nur im Server-Log)
import helmet from 'helmet';
import { config } from './config.js';

export function securityHeaders() {
  return helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Inline-Styles bleiben erlaubt (F2)
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },
    referrerPolicy: { policy: 'no-referrer' },
    hsts: { maxAge: 15552000 },
    xPoweredBy: false,
  });
}

/** Einfacher In-Memory-Sliding-Window-Limiter je IP. */
export function rateLimiter({ maxProMinute, keyPrefix = '' }) {
  const hits = new Map(); // ip -> Zeitstempel[]
  const fensterMs = 60_000;

  // Periodische Bereinigung: ohne das hier würde die Map über die Laufzeit
  // unbegrenzt wachsen, weil ein einmal gesehener IP-Eintrag sonst nie
  // wieder entfernt wird, auch wenn diese IP nie wieder anfragt (OPS-005).
  const aufraeumTimer = setInterval(() => {
    const jetzt = Date.now();
    for (const [key, liste] of hits) {
      if (!liste.some((t) => jetzt - t < fensterMs)) {
        hits.delete(key);
      }
    }
  }, fensterMs);
  aufraeumTimer.unref?.(); // Timer soll ein sauberes Prozessende nie blockieren

  return function limiterMiddleware(req, res, next) {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const key = keyPrefix + ip;
    const jetzt = Date.now();
    const liste = (hits.get(key) || []).filter((t) => jetzt - t < fensterMs);
    liste.push(jetzt);
    hits.set(key, liste);

    if (liste.length > maxProMinute) {
      res.status(429).json({ error: 'Zu viele Anfragen, bitte kurz warten.' });
      return;
    }
    next();
  };
}

function istLoopback(req) {
  const ip = req.ip || req.socket?.remoteAddress || '';
  return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
}

/** Schützt den Admin-Reload-Endpunkt: nur lokal oder mit gültigem Token. */
export function adminSchutz(req, res, next) {
  if (!config.adminReloadEnabled) {
    res.status(404).json({ error: 'Nicht gefunden' });
    return;
  }
  const token = req.header('x-admin-token') || '';
  if (istLoopback(req) || (config.adminToken && token === config.adminToken)) {
    next();
    return;
  }
  res.status(403).json({ error: 'Zugriff verweigert' });
}

/** Generischer Error-Handler: keine internen Details an den Client. */
export function fehlerHandler(err, req, res, _next) {
  const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 500;
  if (status >= 500) {
    // Details nur im Server-Log, nie an den Client
    console.error('[Fehler]', err);
    res.status(500).json({ error: 'Interner Fehler' });
    return;
  }
  res.status(status).json({ error: err.message || 'Ungültige Anfrage' });
}
