// BE-001: dünner Wrapper um die 'web-push'-Bibliothek. Push ist genau wie
// Login/Sync (DATABASE_URL) optional – fehlen die VAPID-Schlüssel, bleibt
// die Funktion einfach deaktiviert, nichts anderes an der App ändert sich
// (siehe isPushAktiviert-Nutzung in app.js/routes).
import webpush from 'web-push';
import { config } from './config.js';
import { query } from './db.js';

let konfiguriert = false;

export function isPushAktiviert() {
  return Boolean(config.vapidPublicKey && config.vapidPrivateKey);
}

function sicherstellenKonfiguriert() {
  if (konfiguriert || !isPushAktiviert()) return;
  webpush.setVapidDetails(config.vapidSubject, config.vapidPublicKey, config.vapidPrivateKey);
  konfiguriert = true;
}

// Schickt payload (wird im Service Worker als JSON gelesen, siehe
// frontend/public/sw.js) an alle Geräte/Subscriptions des Nutzers. Ist Push
// nicht konfiguriert, passiert nichts (kein Fehler) – die Benachrichtigung
// landet trotzdem in der Historie, siehe benachrichtigeNutzer() unten.
// Ungültig gewordene Subscriptions (Nutzer hat Benachrichtigungen im
// Browser deaktiviert, Gerät lange offline, o. ä. -> 404/410 vom Push-
// Dienst) werden dabei automatisch aus der DB entfernt, statt bei jedem
// künftigen Versuch erneut fehlzuschlagen.
async function sendePushAnNutzer(userId, payload) {
  if (!isPushAktiviert()) return;
  sicherstellenKonfiguriert();

  const { rows } = await query(
    'SELECT id, endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = $1',
    [userId],
  );

  await Promise.all(rows.map(async (row) => {
    try {
      await webpush.sendNotification(
        { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } },
        JSON.stringify(payload),
      );
    } catch (err) {
      if (err?.statusCode === 404 || err?.statusCode === 410) {
        await query('DELETE FROM push_subscriptions WHERE id = $1', [row.id]).catch(() => {});
      } else {
        console.warn(`[Push] Zustellung an Subscription ${row.id} fehlgeschlagen:`, err?.message || err);
      }
    }
  }));
}

// BE-005: zentrale Stelle für jede Benachrichtigung an einen Nutzer –
// schreibt IMMER einen Eintrag in die Historie (unabhängig davon, ob Push
// konfiguriert/aktiv ist), und stößt zusätzlich, best-effort, eine
// Push-Zustellung an (falls konfiguriert). Alle bisherigen Trigger
// (content-admin.routes.js, melden.routes.js) nutzen ab jetzt diese
// Funktion statt sendePushAnNutzer() direkt.
export async function benachrichtigeNutzer(userId, { titel, text, url }) {
  await query(
    'INSERT INTO benachrichtigungen (user_id, titel, text, url) VALUES ($1, $2, $3, $4)',
    [userId, titel, text || '', url || '/'],
  );
  await sendePushAnNutzer(userId, { titel, text, url });
}
