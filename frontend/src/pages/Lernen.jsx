import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../utils/useApi.js';
import { api } from '../api/client.js';
import { profileStore, progressStore } from '../store/localStore.js';
import { modulStatusAusFortschritt, statusAnzeige, abdeckungProzent } from '../utils/modulStatus.js';
import { BEHERRSCHT_AB } from '../utils/gamification.js';
import { gruppiereNachLernfeld } from '../utils/lernfeldOrdnung.js';
import Akkordeon from '../components/Akkordeon.jsx';

// Statusfarbe als Kartenakzent (linker Rand) – macht den Bearbeitungsstand
// einer Modulkarte auf einen Blick erkennbar, ohne den Fließtext lesen zu
// müssen (Stitch-Leitlinie: "Gruppierung … mit subtilen Status-Badges").
const STATUS_AKZENT = {
  beherrscht: 'var(--success)',
  bearbeitet: 'var(--warning, var(--primary))',
  offen: 'var(--border)',
};

// Modulkarte – identisch für Allgemein- und Fachrichtungsblöcke.
function ModulKarte({ m, status }) {
  const stufe = statusAnzeige(status);
  const gesamt = m.fragenAnzahl || 0;
  const bearbeitet = status?.anzahl || 0;
  const abdeckung = abdeckungProzent(bearbeitet, gesamt);
  const stufeKey = status?.beherrscht ? 'beherrscht' : status?.bearbeitet ? 'bearbeitet' : 'offen';
  return (
    <div
      className="card"
      key={m.modul_id}
      style={{ borderLeft: `3px solid ${STATUS_AKZENT[stufeKey]}` }}
    >
      <div className="flex-between wrap">
        <h3 className="mb-0">{m.titel}</h3>
        <div className="flex wrap" style={{ gap: 6, justifyContent: 'flex-end' }}>
          <span className={`badge ${stufe.klasse}`}>{stufe.label}</span>
          <span className={`badge ${m.fachrichtung === 'ALLE' ? 'badge-neutral' : `badge-${m.fachrichtung.toLowerCase()}`}`}>
            {m.fachrichtung === 'ALLE' ? 'Allgemein' : m.fachrichtung}
          </span>
        </div>
      </div>
      <p className="text-muted small">{m.beschreibung}</p>
      <div className="progress-label mt-2">
        <span>Fragen bearbeitet</span>
        <span>{bearbeitet} von {gesamt} ({abdeckung} %)</span>
      </div>
      <div className="progress">
        <div style={{ width: `${abdeckung}%`, background: status?.beherrscht ? 'var(--success)' : undefined }} />
      </div>
      {status?.bearbeitet && (
        <div className="flex wrap mt-2" style={{ gap: 6 }}>
          <span className="badge badge-neutral">
            {status.richtig}/{status.anzahl} richtig · {status.quote}% Erfolgsquote
          </span>
        </div>
      )}
      <div className="flex-between mt-2">
        <span className="small text-muted">{gesamt} Fragen</span>
        <Link className="btn btn-primary btn-sm" to={`/lernen/${m.modul_id}`}>Öffnen →</Link>
      </div>
    </div>
  );
}

// FE-020: Lernfeld-Gruppe als Akkordeon statt fester Fachrichtungs-Blöcke –
// führt Lernende chronologisch durch die KMK-Lernfeldstruktur (LF1…LF12,
// siehe CONTENT-007) statt sie nach Fachrichtung zu sortieren.
function LernfeldBlock({ lernfeld, titel, module, statusMap, eigeneFachrichtung, offen, onToggle }) {
  if (!module.length) return null;
  const bearbeitetAnzahl = module.filter((m) => statusMap[m.modul_id]?.bearbeitet).length;
  const beherrschtAnzahl = module.filter((m) => statusMap[m.modul_id]?.beherrscht).length;
  const enthaeltEigene = module.some((m) => m.fachrichtung === eigeneFachrichtung);
  const untertitel = `${module.length} Modul${module.length === 1 ? '' : 'e'} · `
    + `${bearbeitetAnzahl} bearbeitet · ${beherrschtAnzahl} beherrscht (ab ${BEHERRSCHT_AB} %)`;
  return (
    <div className="mb-2">
      <Akkordeon
        titel={(
          <>
            {titel}
            {enthaeltEigene && lernfeld !== 'KEIN_LF' && (
              <span className="badge badge-leicht" style={{ marginLeft: 8 }}>deine Fachrichtung</span>
            )}
          </>
        )}
        untertitel={untertitel}
        offen={offen}
        onToggle={onToggle}
      >
        <div className="grid grid-2-max">
          {module.map((m) => <ModulKarte key={m.modul_id} m={m} status={statusMap[m.modul_id]} />)}
        </div>
      </Akkordeon>
    </div>
  );
}

export default function Lernen() {
  const profil = profileStore.get();
  const eigeneFachrichtung = profil.fachrichtung || 'FIAE';
  const { daten: module } = useApi(() => api.get('/module'), []);

  const statusMap = modulStatusAusFortschritt(
    progressStore.get(),
    (id) => module?.find((m) => m.modul_id === id)?.fragenAnzahl || 0,
  );

  const lernfeldGruppen = gruppiereNachLernfeld(module || [], eigeneFachrichtung);

  // Alle Gruppen starten eingeklappt (Sven, 2026-09-18: "am besten die zu
  // Start alle eingeklappt laden") – ein Set statt eines einzelnen Werts,
  // damit mehrere Gruppen gleichzeitig offen sein können und Zuklappen
  // (Entfernen aus dem Set) nicht mit "noch nicht initialisiert" kollidiert.
  const [offeneGruppen, setOffeneGruppen] = useState(() => new Set());
  function toggleGruppe(lernfeld) {
    setOffeneGruppen((vorher) => {
      const naechste = new Set(vorher);
      if (naechste.has(lernfeld)) naechste.delete(lernfeld); else naechste.add(lernfeld);
      return naechste;
    });
  }

  return (
    <div>
      <header className="main-header">
        <div>
          <h1 className="mb-0">Lernbereich</h1>
          <p className="text-muted mt-0">
            Alle Module aller Fachrichtungen stehen dir offen, gegliedert nach Lernfeld (LF1–LF12) – so folgst du dem
            tatsächlichen Ausbildungsverlauf. Deine Fachrichtung ({eigeneFachrichtung}) ist markiert, keine
            Einschränkung.
          </p>
        </div>
      </header>

      {lernfeldGruppen.map((g) => (
        <LernfeldBlock
          key={g.lernfeld}
          lernfeld={g.lernfeld}
          titel={g.titel}
          module={g.module}
          statusMap={statusMap}
          eigeneFachrichtung={eigeneFachrichtung}
          offen={offeneGruppen.has(g.lernfeld)}
          onToggle={() => toggleGruppe(g.lernfeld)}
        />
      ))}
    </div>
  );
}
