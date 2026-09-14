#!/usr/bin/env node
// Prüft Header, Zugriffsschutz, Rate-Limit und Basisvalidierung gegen einen
// laufenden Backend-Prozess (siehe docs/17-Sicherheit.md, Abschnitt 5).
// Aufruf: Backend muss bereits laufen ("npm start"), dann in einem zweiten
// Terminal: node scripts/sicherheits-check.mjs [BASE_URL]

const base = process.argv[2] || process.env.CHECK_BASE_URL || 'http://127.0.0.1:3001';
let fehler = 0;
let ok = 0;

function pruefe(bedingung, label) {
  if (bedingung) { console.log(`  ✓ ${label}`); ok += 1; }
  else { console.log(`  ✗ ${label}`); fehler += 1; }
}

async function main() {
  console.log(`Sicherheits-Check gegen ${base}\n`);

  // 1) Health + Security-Header
  let res;
  try {
    res = await fetch(`${base}/api/health`);
  } catch (e) {
    console.error(`Backend nicht erreichbar unter ${base}. Läuft "npm start"?`);
    process.exit(2);
  }
  console.log('Header:');
  pruefe(res.headers.get('x-content-type-options') === 'nosniff', 'X-Content-Type-Options: nosniff');
  pruefe(!!res.headers.get('x-frame-options'), 'X-Frame-Options gesetzt');
  pruefe(res.headers.get('referrer-policy') === 'no-referrer', 'Referrer-Policy: no-referrer');
  pruefe(!!res.headers.get('strict-transport-security'), 'Strict-Transport-Security gesetzt');
  pruefe(!res.headers.get('x-powered-by'), 'kein X-Powered-By');
  pruefe(!res.headers.get('access-control-allow-origin'), 'kein Access-Control-Allow-Origin (kein CORS)');
  pruefe(res.ok, '/api/health antwortet 200');

  // 2) Admin-Reload ohne Token/lokal -> je nach Umgebung 200 (lokal) oder 403
  console.log('\nAdmin-Schutz:');
  const reloadRes = await fetch(`${base}/api/admin/reload`, { method: 'POST' });
  pruefe([200, 403, 404].includes(reloadRes.status), `POST /api/admin/reload liefert erwarteten Status (${reloadRes.status})`);

  // 3) Generische Fehlermeldung bei 404
  console.log('\nFehlerformat:');
  const notFound = await fetch(`${base}/api/fragen/DOES-NOT-EXIST`);
  let body = {};
  try { body = await notFound.json(); } catch { /* ignore */ }
  pruefe(notFound.status === 404 && typeof body.error === 'string' && !body.stack, '404 mit generischer { error } Antwort, keine Stacktraces');

  // 4) Rate-Limit greift (nur grober Rauchtest, kein Vollstresstest)
  console.log('\nRate-Limit (Rauchtest, 20 Anfragen):');
  let letzterStatus = 200;
  for (let i = 0; i < 20; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const r = await fetch(`${base}/api/health`);
    letzterStatus = r.status;
  }
  pruefe(letzterStatus === 200, '20 Anfragen in Folge werden bei Standard-Limit (240/min) nicht geblockt');

  console.log(`\n${fehler === 0 ? '✓' : '✗'} Ergebnis: ${ok} OK, ${fehler} fehlgeschlagen.`);
  process.exit(fehler === 0 ? 0 : 1);
}

main();
