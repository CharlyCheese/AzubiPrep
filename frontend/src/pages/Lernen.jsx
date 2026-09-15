import { Link } from 'react-router-dom';
import { useApi } from '../utils/useApi.js';
import { api } from '../api/client.js';
import { profileStore, progressStore } from '../store/localStore.js';
import { modulStatusAusFortschritt, statusAnzeige, abdeckungProzent } from '../utils/modulStatus.js';
import { BEHERRSCHT_AB } from '../utils/gamification.js';

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

function ModulBlock({ id, titel, hinweis, module, statusMap, hervorgehoben }) {
  if (!module.length) return null;
  const bearbeitetAnzahl = module.filter((m) => statusMap[m.modul_id]?.bearbeitet).length;
  const beherrschtAnzahl = module.filter((m) => statusMap[m.modul_id]?.beherrscht).length;
  return (
    <section id={id} className="mb-2" style={{ scrollMarginTop: 12 }}>
      {/* Titel und Fortschritts-Text bewusst eng nebeneinander (flex statt
          flex-between) – bei breiten Fenstern würde space-between den Text
          bis zum rechten Rand auseinanderziehen, sodass er ohne sichtbaren
          Bezug zur Überschrift "verloren" wirkt. */}
      <div className="flex wrap" style={{ gap: 12, rowGap: 4 }}>
        <h2 className="mb-0">
          {titel}
          {hervorgehoben && <span className="badge badge-leicht" style={{ marginLeft: 8 }}>deine Fachrichtung</span>}
        </h2>
        <span className="small text-muted">
          {bearbeitetAnzahl} von {module.length} bearbeitet · {beherrschtAnzahl} beherrscht (ab {BEHERRSCHT_AB} %)
        </span>
      </div>
      {hinweis && <p className="text-muted small mt-0">{hinweis}</p>}
      <div className="grid grid-2-max">
        {module.map((m) => <ModulKarte key={m.modul_id} m={m} status={statusMap[m.modul_id]} />)}
      </div>
    </section>
  );
}

export default function Lernen() {
  const profil = profileStore.get();
  const eigeneFachrichtung = profil.fachrichtung || 'FIAE';
  const { daten: fachrichtungen } = useApi(() => api.get('/fachrichtungen'), []);
  const { daten: module } = useApi(() => api.get('/module'), []);

  const fachrichtungenListe = fachrichtungen || [];
  // Eigene Fachrichtung zuerst, Rest in der Reihenfolge aus dem Backend –
  // rein eine Anzeige-Priorisierung, keine Zugriffsbeschränkung: alle
  // Module aller Fachrichtungen sind hier sichtbar und offen.
  const fachrichtungenSortiert = [...fachrichtungenListe].sort((a, b) => {
    if (a.code === eigeneFachrichtung) return -1;
    if (b.code === eigeneFachrichtung) return 1;
    return 0;
  });

  const allgemeinModule = (module || []).filter((m) => m.fachrichtung === 'ALLE');
  const statusMap = modulStatusAusFortschritt(
    progressStore.get(),
    (id) => module?.find((m) => m.modul_id === id)?.fragenAnzahl || 0,
  );

  return (
    <div>
      <header className="main-header">
        <div>
          <h1 className="mb-0">Lernbereich</h1>
          <p className="text-muted mt-0">
            Alle Module aller Fachrichtungen stehen dir offen – deine Fachrichtung ({eigeneFachrichtung}) ist nur
            als Orientierung hervorgehoben, keine Einschränkung.
          </p>
        </div>
      </header>

      <div className="flex wrap mb-2">
        <a className="btn btn-ghost btn-sm" href="#allgemein">Allgemein</a>
        {fachrichtungenSortiert.map((fr) => (
          <a
            key={fr.code}
            className={`btn btn-sm ${fr.code === eigeneFachrichtung ? 'btn-primary' : 'btn-ghost'}`}
            href={`#fr-${fr.code}`}
          >
            {fr.code}
          </a>
        ))}
      </div>

      <ModulBlock
        id="allgemein"
        titel="Allgemein"
        hinweis="Gemeinsame Module – für alle Fachrichtungen prüfungsrelevant."
        module={allgemeinModule}
        statusMap={statusMap}
      />

      {fachrichtungenSortiert.map((fr) => (
        <ModulBlock
          key={fr.code}
          id={`fr-${fr.code}`}
          titel={`${fr.code} – ${fr.name}`}
          module={(module || []).filter((m) => m.fachrichtung === fr.code)}
          statusMap={statusMap}
          hervorgehoben={fr.code === eigeneFachrichtung}
        />
      ))}
    </div>
  );
}
