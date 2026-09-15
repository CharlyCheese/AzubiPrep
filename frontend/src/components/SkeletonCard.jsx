// Shimmer-Ladekarten gegen Cumulative Layout Shift (CLS) – ersetzt den
// reinen Text-/Spinner-Ladezustand bei Seiten mit Karten-Layout.
// Quelle: Stitch-AI-Vorschlag (siehe docs/agent-briefs/FE-011-ux-polish-stitch.md).
export default function SkeletonCard({ lines = 3, hasBadge = true }) {
  return (
    <div className="card card-appear mb-2">
      <div className="flex-between wrap mb-2">
        <div className="skeleton-box" style={{ width: 140, height: 18 }} />
        {hasBadge && (
          <div className="skeleton-box" style={{ width: 64, height: 20, borderRadius: 999 }} />
        )}
      </div>
      <div className="skeleton-box mb-2" style={{ width: '85%', height: 22 }} />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton-box mt-1"
          style={{ width: `${95 - i * 15}%`, height: 14 }}
        />
      ))}
      <div className="flex wrap mt-3" style={{ gap: 8 }}>
        <div className="skeleton-box" style={{ width: 110, height: 32 }} />
        <div className="skeleton-box" style={{ width: 80, height: 32 }} />
      </div>
    </div>
  );
}
