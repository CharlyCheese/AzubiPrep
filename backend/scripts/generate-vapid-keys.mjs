// BE-001: erzeugt einmalig ein VAPID-Schlüsselpaar für Web-Push.
// Aufruf:  node backend/scripts/generate-vapid-keys.mjs
// Die Ausgabe (VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY) gehört in backend/.env
// (siehe backend/.env.beispiel) – NICHT ins Repository committen, genau
// wie JWT_SECRET/DATABASE_URL.
import webpush from 'web-push';

const { publicKey, privateKey } = webpush.generateVAPIDKeys();

console.log('Neues VAPID-Schlüsselpaar erzeugt – in backend/.env eintragen:\n');
console.log(`VAPID_PUBLIC_KEY=${publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${privateKey}`);
console.log(`VAPID_SUBJECT=mailto:deine-email@example.com`);
console.log('\nDanach Backend neu starten. Der Public Key ist unbedenklich öffentlich');
console.log('(wird ohnehin über GET /api/push/public-key ans Frontend ausgeliefert) –');
console.log('nur der Private Key muss geheim bleiben.');
