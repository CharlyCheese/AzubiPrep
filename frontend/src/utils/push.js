// BE-001: Hilfsfunktionen rund um Web-Push-Subscriptions. Reine
// Browser-API-Logik (kein eigener State), damit sie sowohl von der
// Komponente als auch – falls später gebraucht – von anderer Stelle aus
// genutzt werden kann.

// Push-API verlangt den VAPID-Public-Key als Uint8Array, der Server liefert
// ihn aber als URL-safe Base64-String (Standardformat von 'web-push').
function urlBase64ZuUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rohdaten = atob(base64);
  return Uint8Array.from([...rohdaten].map((zeichen) => zeichen.charCodeAt(0)));
}

export function pushWirdUnterstuetzt() {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

export async function aktuelleSubscription() {
  if (!pushWirdUnterstuetzt()) return null;
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

export async function pushAbonnieren(publicKey) {
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ZuUint8Array(publicKey),
  });
}
