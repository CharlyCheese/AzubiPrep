// Einfaches, wiederverwendbares Akkordeon für Kartenbereiche.
export default function Akkordeon({ titel, untertitel, offen, onToggle, children }) {
  return (
    <div className="card">
      <button type="button" className="akkordeon-kopf" onClick={onToggle} aria-expanded={offen}>
        <span style={{ minWidth: 0 }}>
          <span className="akkordeon-titel">{titel}</span>
          {untertitel ? <span className="small text-muted" style={{ display: 'block' }}>{untertitel}</span> : null}
        </span>
        <span className={`akkordeon-pfeil ${offen ? 'offen' : ''}`} aria-hidden="true">▾</span>
      </button>
      {offen && <div className="akkordeon-inhalt">{children}</div>}
    </div>
  );
}
