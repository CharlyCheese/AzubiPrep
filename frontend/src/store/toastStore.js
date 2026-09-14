// Leichtgewichtiger Toast-Store (fluechtig, nicht persistiert).
let listeners = new Set();
let toasts = [];

function emit() { listeners.forEach((l) => l()); }

export const toastStore = {
  subscribe(cb) { listeners.add(cb); return () => listeners.delete(cb); },
  snapshot() { return toasts; },
  push(message, typ = 'info') {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    toasts = [...toasts, { id, message, typ }];
    emit();
    setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== id);
      emit();
    }, 3500);
  },
};