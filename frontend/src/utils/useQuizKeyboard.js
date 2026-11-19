import { useEffect } from 'react';

/**
 * Hook für Keyboard-Navigation in Quiz- & Karteikartenansichten.
 * Quelle: Stitch-AI-Vorschlag (siehe docs/agent-briefs/FE-011-ux-polish-stitch.md).
 *
 * @param {Object} params
 * @param {Array<string>} params.optionen - Verfügbare Optionen z. B. ['A', 'B', 'C', 'D']
 * @param {Function} params.onSelectOption - Callback (letter: string) => void
 * @param {Function} params.onSubmitOrNext - Callback () => void (für Enter)
 * @param {boolean} params.istEingabeAktiv - Blockiert Shortcuts, wenn Freitext oder Input fokussiert ist
 * @param {boolean} [params.aktiv=true] - Hook komplett deaktivieren (z. B. während des Ladens)
 */
export function useQuizKeyboard({
  optionen = ['A', 'B', 'C', 'D'],
  onSelectOption,
  onSubmitOrNext,
  istEingabeAktiv = false,
  aktiv = true,
}) {
  useEffect(() => {
    if (!aktiv) return undefined;

    function handleKeyDown(event) {
      const target = event.target;
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.isComposing || istEingabeAktiv) return;
      if (target instanceof Element && target.closest('input, textarea, select, [contenteditable="true"], dialog, [role="dialog"]')) return;
      // Enter auf einem fokussierten Bedienelement gehört dem Element selbst.
      if (event.key === 'Enter' && target instanceof Element && target.closest('button, a[href], summary, [role="button"]')) return;

      const key = event.key.toUpperCase();

      // Zahlen auf Buchstaben mappen (1 -> A, 2 -> B, … 6 -> F) – Ziffern sind
      // der primäre Shortcut, da die Optionen jetzt auch als Ziffern angezeigt
      // werden (siehe buchstabeZuZiffer in utils/fragen.js); Buchstabentasten
      // funktionieren weiterhin zusätzlich.
      const numMap = { '1': 'A', '2': 'B', '3': 'C', '4': 'D', '5': 'E', '6': 'F' };
      const buchstabe = numMap[key] || key;

      if (optionen.includes(buchstabe)) {
        event.preventDefault();
        onSelectOption?.(buchstabe);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        onSubmitOrNext?.();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [optionen, onSelectOption, onSubmitOrNext, istEingabeAktiv, aktiv]);
}
