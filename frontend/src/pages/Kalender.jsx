import { useState } from 'react';
import { useApi } from '../utils/useApi.js';
import { api } from '../api/client.js';
import { activityStore, flashcardStore, profileStore, planStore } from '../store/localStore.js';
import { Link } from 'react-router-dom';

const WOCHENTAGE = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

const pad = (n) => String(n).padStart(2, '0');
const tagKey = (jahr, monat, tag) => `${jahr}-${pad(monat + 1)}-${pad(tag)}`;
// Lokales Datum (konsistent mit tagKey/heuteKey), nicht UTC
const isoZuTag = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return tagKey(d.getFullYear(), d.getMonth(), d.getDate());
};

export default function Kalender() {
  const { daten: fragenAlle } = useApi(() => api.get('/fragen'), []);
  const { daten: module } = useApi(() => api.get('/module'), []);
  const profil = profileStore.get();

  const heute = new Date();
  const [ansicht, setAnsicht] = useState({ jahr: heute.getFullYear(), monat: heute.getMonth() });
  const { jahr, monat } = ansicht;
  const istAktuellerMonat = jahr === heute.getFullYear() && monat === heute.getMonth();
  const [tagAuswahl, setTagAuswahl] = useState(null); // 'YYYY-MM-DD'
  const [, setTick] = useState(0);
  const neu = () => setTick((t) => t + 1);

  const aktivitaet = activityStore.get();
  const plan = planStore.get();
  const karten = flashcardStore.alle(false);
  const fragenMap = new Map((fragenAlle || []).map((f) => [f.id, f]));
  const heuteKey = tagKey(heute.getFullYear(), heute.getMonth(), heute.getDate());

  const ersteWochentag = new Date(jahr, monat, 1).getDay();
  const tageImMonat = new Date(jahr, monat + 1, 0).getDate();
  const offset = (ersteWochentag + 6) % 7;

  function monatWechseln(delta) {
    setAnsicht((a) => {
      const d = new Date(a.jahr, a.monat + delta, 1);
      return { jahr: d.getFullYear(), monat: d.getMonth() };
    });
  }
  function zuHeute() {
    setAnsicht({ jahr: heute.getFullYear(), monat: heute.getMonth() });
  }

  const wiederholungenFuerTag = (key) =>
    karten
      .filter((k) => k.faelligAm && isoZuTag(k.faelligAm) === key)
      .map((k) => {
        const frage = fragenMap.get(k.frageId);
        return { ...k, frageText: frage?.frage || k.frageId, modul: frage?.modul_id || '' };
      });

  // Lernserie
  let streak = 0;
  const cursor = new Date();
  while (aktivitaet[cursor.toISOString().slice(0, 10)]) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  const naechsteTage = [];
  for (let i = 0; i <= 6; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    naechsteTage.push(d.toISOString().slice(0, 10));
  }

  const pruefungstermin = profil.prüfungstermin ? new Date(profil.prüfungstermin) : null;

  // Formular für eigene Lerninhalte
  const [planTitel, setPlanTitel] = useState('');
  const [planModul, setPlanModul] = useState('');
  function planHinzufuegen() {
    if (!tagAuswahl) return;
    planStore.add(tagAuswahl, { titel: planTitel, modulId: planModul });
    setPlanTitel('');
    setPlanModul('');
    neu();
  }
  function planToggle(id) { planStore.toggle(tagAuswahl, id); neu(); }
  function planLoeschen(id) { planStore.remove(tagAuswahl, id); neu(); }
  function wiederErledigt(frageId) { flashcardStore.markDone(frageId); neu(); }
  function wiederVerschieben(frageId, datum) { if (datum) { flashcardStore.reschedule(frageId, datum); neu(); } }

  const modulName = (id) => (module || []).find((m) => m.modul_id === id)?.titel || id || '';

  return (
    <div>
      <header className="main-header">
        <div>
          <h1 className="mb-0">Lernkalender</h1>
          <p className="text-muted mt-0">Tage planen, Wiederholungen steuern und eigene Lerninhalte eintragen.</p>
        </div>
      </header>

      <div className="grid grid-4 mb-2">
        <div className="card">
          <div className="stat-value">{streak}</div>
          <div className="stat-label">Tage Lernserie 🔥</div>
        </div>
        <div className="card">
          <div className="stat-value">{karten.filter((k) => !k.faelligAm || isoZuTag(k.faelligAm) <= heuteKey).length}</div>
          <div className="stat-label">aktuell fällige Karten</div>
        </div>
        <div className="card">
          <div className="stat-value">{Object.values(plan).reduce((s, l) => s + l.length, 0)}</div>
          <div className="stat-label">eigene Lerninhalte geplant</div>
        </div>
        <div className="card">
          <div className="stat-value">{pruefungstermin ? Math.max(0, Math.ceil((pruefungstermin - heute) / 86400000)) : '–'}</div>
          <div className="stat-label">Tage bis zur Prüfung</div>
        </div>
      </div>

      <div className="kalender-layout">
        <div className="card">
          <div className="flex-between wrap mb-2">
            <h2 className="mb-0">{MONATE[monat]} {jahr}</h2>
            <div className="flex">
              <button className="btn btn-ghost btn-sm" onClick={() => monatWechseln(-1)} title="Vorheriger Monat">« Zurück</button>
              <button className="btn btn-ghost btn-sm" onClick={zuHeute} disabled={istAktuellerMonat}>Heute</button>
              <button className="btn btn-ghost btn-sm" onClick={() => monatWechseln(1)} title="Nächster Monat">Weiter »</button>
            </div>
          </div>
          <div className="calendar-grid mb-2">
            {WOCHENTAGE.map((tag) => <div key={tag} className="cal-day dow">{tag}</div>)}
            {Array.from({ length: offset }).map((_, i) => <div key={`leer-${i}`} className="cal-day leer" />)}
            {Array.from({ length: tageImMonat }).map((_, i) => {
              const tag = i + 1;
              const key = tagKey(jahr, monat, tag);
              const aktiv = Boolean(aktivitaet[key]);
              const geplant = (plan[key] || []).length > 0;
              const hatWiederholung = wiederholungenFuerTag(key).length > 0;
              const istHeute = istAktuellerMonat && tag === heute.getDate();
              const zukunft = new Date(jahr, monat, tag) > heute;
              const cls = [
                'cal-day',
                zukunft ? 'future' : '',
                aktiv ? 'active' : '',
                geplant ? 'hasplan' : '',
                tagAuswahl === key ? 'selected' : '',
                istHeute ? 'heute' : '',
              ].filter(Boolean).join(' ');
              return (
                <div
                  key={key}
                  className={cls}
                  role="button"
                  tabIndex={0}
                  onClick={() => setTagAuswahl(key)}
                  onKeyDown={(e) => e.key === 'Enter' && setTagAuswahl(key)}
                  title={hatWiederholung ? 'Wiederholungen fällig' : geplant ? 'Eigene Planung' : 'Tag öffnen'}
                >
                  {tag}
                  {(hatWiederholung || geplant) && (
                    <span className="cal-dots">
                      {hatWiederholung && <span className="cal-dot" title="Wiederholung fällig" />}
                      {geplant && <span className="cal-dot cal-dot-plan" title="Eigene Planung" />}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <p className="small text-muted mb-0">
            Tag anklicken zum Planen · grün = gelernt · <span className="cal-dot" style={{ display: 'inline-block' }} /> Wiederholung fällig ·{' '}
            <span className="cal-dot cal-dot-plan" style={{ display: 'inline-block' }} /> eigene Planung · Rahmen = heute.
          </p>
        </div>

        <div className="card">
          <h2>Wiederholungsplan (nächste 7 Tage)</h2>
          <p className="small text-muted mt-0">Kompakt je Tag und Modul gruppiert – Tagesklick zeigt Details.</p>
          {naechsteTage.every((t) => wiederholungenFuerTag(t).length === 0) && (
            <p className="text-muted">Keine Wiederholungen geplant. 🎉</p>
          )}
          {naechsteTage.map((tag) => {
            const items = wiederholungenFuerTag(tag);
            if (!items.length) return null;
            const gruppen = {};
            items.forEach((k) => {
              const key = k.modul || '–';
              gruppen[key] = (gruppen[key] || 0) + 1;
            });
            const label = new Date(`${tag}T12:00:00`).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });
            return (
              <div key={tag} className="module-row" style={{ alignItems: 'flex-start' }}>
                <div style={{ minWidth: 0 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setTagAuswahl(tag)}>{label} · {items.length} Karte(n)</button>
                  <div className="flex wrap" style={{ gap: 6, marginTop: 4 }}>
                    {Object.entries(gruppen).map(([modul, anzahl]) => (
                      <span key={modul} className="badge badge-neutral">{modul} ×{anzahl}</span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {tagAuswahl && (
          <div className="card">
          <div className="flex-between wrap mb-2">
            <h2 className="mb-0">
              Planung: {new Date(`${tagAuswahl}T12:00:00`).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
            </h2>
            <button className="btn btn-ghost btn-sm" onClick={() => setTagAuswahl(null)}>Schließen ✕</button>
          </div>

          <div className="grid grid-2">
            <div>
              <h3>Eigene Lerninhalte</h3>
              <div className="flex wrap mb-2">
                <input
                  className="input"
                  style={{ flex: 1, minWidth: 160 }}
                  value={planTitel}
                  onChange={(e) => setPlanTitel(e.target.value)}
                  placeholder="z. B. SQL-Joins wiederholen"
                />
                <select className="select" style={{ width: 'auto' }} value={planModul} onChange={(e) => setPlanModul(e.target.value)}>
                  <option value="">– Modul –</option>
                  {(module || []).map((m) => <option key={m.modul_id} value={m.modul_id}>{m.modul_id}</option>)}
                </select>
                <button className="btn btn-primary btn-sm" onClick={planHinzufuegen}>Hinzufügen</button>
              </div>
              {(plan[tagAuswahl] || []).length === 0 && <p className="text-muted small">Noch keine eigenen Lerninhalte für diesen Tag.</p>}
              {(plan[tagAuswahl] || []).map((p) => (
                <div key={p.id} className="module-row">
                  <label className="flex" style={{ marginBottom: 0, cursor: 'pointer' }}>
                    <input type="checkbox" checked={p.erledigt} onChange={() => planToggle(p.id)} />
                    <span style={{ textDecoration: p.erledigt ? 'line-through' : 'none' }}>
                      {p.titel}
                      {p.modulId ? <span className="small text-muted"> · {modulName(p.modulId)}</span> : null}
                    </span>
                  </label>
                  <button className="btn btn-ghost btn-sm" onClick={() => planLoeschen(p.id)}>Löschen</button>
                </div>
              ))}
            </div>

            <div>
              <h3>Wiederholungen anpassen</h3>
              <p className="small text-muted">Vorgegebene Karteikarten-Wiederholungen für diesen Tag.</p>
              {wiederholungenFuerTag(tagAuswahl).length === 0 && (
                <p className="text-muted small">Keine Wiederholungen an diesem Tag.</p>
              )}
              {wiederholungenFuerTag(tagAuswahl).map((k) => (
                <div key={k.frageId} className="card" style={{ padding: 12, marginBottom: 8 }}>
                  <div className="small">{k.frageText}</div>
                  <div className="small text-muted mb-2">{k.modul} · Box {k.box}</div>
                  <div className="flex wrap">
                    <button className="btn btn-success btn-sm" onClick={() => wiederErledigt(k.frageId)}>Erledigt</button>
                    <input
                      type="date"
                      className="input"
                      style={{ width: 'auto' }}
                      min={heuteKey}
                      onChange={(e) => wiederVerschieben(k.frageId, e.target.value)}
                      title="Wiederholung auf neues Datum verschieben"
                    />
                  </div>
                </div>
              ))}
              <Link className="btn btn-ghost btn-sm" to="/karteikarten">Zum Karteikarten-Training →</Link>
            </div>
          </div>
        </div>
        )}
      </div>

      {pruefungstermin && (
        <div className="card">
          <h2>Rückwärtsplanung bis {pruefungstermin.toLocaleDateString('de-DE')}</h2>
          <p className="text-muted">Plane pro Woche feste Wiederholungen und eine Prüfungssimulation ein.</p>
          <div className="flex wrap">
            <Link className="btn btn-primary" to="/karteikarten">Karteikarten öffnen</Link>
            <Link className="btn btn-ghost" to="/pruefung">Prüfungssimulation</Link>
          </div>
        </div>
      )}
    </div>
  );
}

