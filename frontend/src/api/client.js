// Schlanker API-Client. Basis-URL aus Umgebungsvariable oder Default
// (gleiche Origin im Produktions-Build, Vite-Proxy im Dev-Modus).
import { authStore } from '../store/authStore.js';

const BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

async function request(path, options = {}) {
  const token = authStore.token();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    let message = `Fehler ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      /* ignore */
    }
    // Ungültiger/abgelaufener Token: lokal ausloggen statt in einer
    // Endlos-Fehlerschleife hängenzubleiben (nächster Aufruf würde sonst
    // wieder mit dem gleichen kaputten Token scheitern).
    if (res.status === 401 && token) {
      authStore.logout();
    }
    throw new Error(message);
  }
  return res.json();
}

export const api = {
  get: (path) => request(path),
  post: (path, body) =>
    request(path, { method: 'POST', body: JSON.stringify(body ?? {}) }),
  put: (path, body) =>
    request(path, { method: 'PUT', body: JSON.stringify(body ?? {}) }),
  del: (path) => request(path, { method: 'DELETE' }),
};
