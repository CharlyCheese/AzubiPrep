import { useSyncExternalStore } from 'react';
import { toastStore } from '../store/toastStore.js';

export default function ToastHost() {
  const toasts = useSyncExternalStore(toastStore.subscribe, toastStore.snapshot);
  if (!toasts.length) return null;
  // Hoechstens die letzten drei Hinweise zeigen (verhindert lange Toast-Stapel)
  const sichtbar = toasts.slice(-3);

  return (
    <div className="toast-host" role="status" aria-live="polite">
      {sichtbar.map((t) => (
        <div key={t.id} className={`toast toast-${t.typ}`}>{t.message}</div>
      ))}
    </div>
  );
}
