// Winziges React-Store-Utility (ohne externe State-Management-Bibliothek).
// Basiert auf useSyncExternalStore (React 18).

import { useSyncExternalStore } from 'react';

export function create(initialState) {
  let state = { ...initialState };
  const listeners = new Set();

  function getState() {
    return state;
  }

  function setState(partial) {
    state = { ...state, ...(typeof partial === 'function' ? partial(state) : partial) };
    listeners.forEach((l) => l());
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function useStore() {
    return useSyncExternalStore(subscribe, getState);
  }

  return { getState, setState, subscribe, useStore };
}
