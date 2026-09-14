import { Link } from 'react-router-dom';
import { useApi } from '../utils/useApi.js';
import { api } from '../api/client.js';
import { profileStore, progressStore } from '../store/localStore.js';
import { modulStatusAusFortschritt, statusAnzeige, abdeckungProzent } from '../utils/modulStatus.js';
import { BEHERRSCHT_AB } from '../utils/gamification.js';

export default function Lernen() {
  const profil = profileStore.get();
  const gewaehlt = profil.fachrichtung || 'FIAE';
  const { daten: fachrichtungen } = useApi(() => api.get('/fachrichtungen'), []);
  const { daten: module } = useApi(() => api.get('/module'), []);

  const fachrichtungenListe = fachrichtungen || [];
  const modulFilter = (fr) => module?.filter((m) => m.fachrichtung === fr || m.fachrichtung === 'ALLE') || [];

  // Modul-Status (Phase 3) aus dem lokalen Fortschritt: bearbeitet / beherrscht.
  // Die Fragenzahl je Modul kommt aus /module, damit der Fortschritt immer auf
  // die maximale Anzahl an Fragen des Moduls bezogen ist.
  const statusMap = modulStatusAusFortschritt(
    progressStore.get(),
    (id) => module?.find((m) => m.modul_id === id)?.fragenAnzahl || 0,
  );
  const sichtbareModule = modulFilter(gewaehlt);
  const bearbeitetAnzahl = sichtbareModule.filter((m) => statusMap[m.modul_id]?.bearbeitet).length;
  const beherrschtAnzahl = sichtbareModule.filter((m) => statusMap[m.modul_id]?.beherrscht).length;

  return (
    <div>
      <header className="main-header">
        <div>
          <h1 className="mb-0">Lernbereich</h1>
          <p className="text-muted mt-0">Wähle deine Fachrichtung und starte mit einem Modul.</p>
        </div>
      </header>

      <div className="flex wrap mb-2">
        {fachrichtungenListe.map((fr) => (
          <Link
            key={fr.code}
            className={`btn ${fr.code === gewaehlt ? 'btn-primary' : 'btn-ghost'} btn-sm`}
            to={`/lernen/${fr.code}`}
          >
            {fr.code}
          </Link>
        ))}
      </div>

      <p className="text-muted mb-0">
        Aktuell gewählt: <strong>{gewaehlt}</strong> – {fachrichtungenListe.find((f) => f.code === gewaehlt)?.name}
      </p>
      <p className="small text-muted">
        {bearbeitetAnzahl} von {sichtbareModule.length} Modulen bearbeitet · {beherrschtAnzahl} beherrscht
        (ab {BEHERRSCHT_AB} % Erfolgsquote)
      </p>

      <div className="grid grid-2">
        {sichtbareModule.map((m) => {
          const status = statusMap[m.modul_id];
          const stufe = statusAnzeige(status);
          const gesamt = m.fragenAnzahl || 0;
          const bearbeitet = status?.anzahl || 0;
          // Fortschritt immer bezogen auf alle Fragen des Moduls
          const abdeckung = abdeckungProzent(bearbeitet, gesamt);
          return (
            <div className="card" key={m.modul_id}>
              <div className="flex-between wrap">
                <h3 className="mb-0">{m.titel}</h3>
                <span className={`badge badge-${m.fachrichtung.toLowerCase()}`}>{m.fachrichtung === 'ALLE' ? 'ALLE' : m.fachrichtung}</span>
              </div>
              <p className="text-muted small">{m.beschreibung}</p>
              <div className="progress-label mt-2">
                <span>Fragen bearbeitet</span>
                <span>{bearbeitet} von {gesamt} ({abdeckung} %)</span>
              </div>
              <div className="progress">
                <div style={{ width: `${abdeckung}%`, background: status?.beherrscht ? 'var(--success)' : undefined }} />
              </div>
              <div className="flex wrap mt-2" style={{ gap: 6 }}>
                <span className={`badge ${stufe.klasse}`}>{stufe.label}</span>
                {status?.bearbeitet && (
                  <span className="badge badge-neutral">
                    {status.richtig}/{status.anzahl} richtig · {status.quote}% Erfolgsquote
                  </span>
                )}
              </div>
              <div className="flex-between mt-2">
                <span className="small text-muted">{gesamt} Fragen</span>
                <Link className="btn btn-primary btn-sm" to={`/lernen/${m.modul_id}`}>Öffnen →</Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}