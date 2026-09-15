import { useEffect, useState } from 'react';

// Schwebender XP-Indikator, der bei richtiger Beantwortung kurz aufsteigt
// und verblasst. Ergänzt die bestehende Toast-Benachrichtigung (meldeBelohnung)
// um direktes visuelles Feedback an der Fragenkarte selbst.
// Quelle: Stitch-AI-Vorschlag (siehe docs/agent-briefs/FE-011-ux-polish-stitch.md).
//
// Wichtig: der Elternknoten braucht `position: relative`, damit der
// Indikator (position: absolute) korrekt an der Karte verankert ist.
export default function XpGainIndicator({ xp = 15, triggerKey }) {
  const [sichtbar, setSichtbar] = useState(false);

  useEffect(() => {
    if (!triggerKey) return undefined;
    setSichtbar(true);
    const timer = setTimeout(() => setSichtbar(false), 1200);
    return () => clearTimeout(timer);
  }, [triggerKey]);

  if (!sichtbar) return null;

  return (
    <div className="xp-float-badge" aria-live="polite">
      +{xp} XP ⚡
    </div>
  );
}
