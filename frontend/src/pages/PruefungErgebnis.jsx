import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useExamStore, setExamState } from '../store/examStore.js';
import { examStore, progressStore, activityStore, flashcardStore, todayKey } from '../store/localStore.js';
import { gamificationStore } from '../store/gamificationStore.js';
import { XP_REGELN } from '../utils/gamification.js';
import { meldeBelohnung } from '../utils/belohnung.js';
import { aktualisiereModulStatus, meldeModulStatus } from '../utils/modulStatus.js';
import { meldeMissionen } from '../utils/missionen.js';
import { pruefeTagesziel } from '../utils/ziele.js';
import { useApi } from '../utils/useApi.js';
import { api } from '../api/client.js';

export default function PruefungErgebnis() {
  const store = useExamStore();
  const ergebnis = store.ergebnis;
  const konfig = store.konfig;

  // Modulnamen für die Aufbereitung
  const { daten: module } = useApi(() => api.get('/module'), []);

  // Ergebnis genau einmal lokal speichern (StrictMode-sicher)
  useEffect(() => {
    if (!ergebnis || store.gespeichert) return;
    examStore.add({ ...ergebnis, fachrichtung: konfig?.fachrichtung, schwierigkeit: konfig?.schwierigkeit, anzahl: ergebnis.gesamt });
    ergebnis.detail?.forEach((d) => {
      progressStore.record(d.frageId, d.richtig, d.modulId);
      flashcardStore.review(d.frageId, d.richtig ? 'leicht' : 'schwer');
    });
    activityStore.add(todayKey(), Math.min(ergebnis.gesamt, 40));
    pruefeTagesziel();
    meldeBelohnung(
      gamificationStore.addXp(`exam:${store.startAm}`, XP_REGELN.pruefungAbgeschlossen),
      'Prüfung abgeschlossen',
    );
    // Modul-Status (bearbeitet/beherrscht) aktualisieren und neue Stufen melden
    meldeModulStatus(
      aktualisiereModulStatus(
        progressStore.get(),
        (id) => module?.find((m) => m.modul_id === id)?.titel || id,
        (id) => module?.find((m) => m.modul_id === id)?.fragenAnzahl || 0,
      ),
    );
    // Missionen (Phase 4): Pruefung sowie beantwortete und richtige Fragen
    meldeMissionen(gamificationStore.merkeMission('pruefung'));
    const detail = ergebnis.detail || [];
    meldeMissionen(gamificationStore.merkeMission('frage', detail.length || ergebnis.gesamt || 0));
    meldeMissionen(gamificationStore.merkeMission('richtig', detail.filter((d) => d.richtig).length));
    setExamState({ gespeichert: true });
  }, [ergebnis, store.gespeichert, konfig]);

  if (!ergebnis) {
    return (
      <div className="empty">
        Kein Prüfungsergebnis vorhanden.
        <div className="mt-2"><Link className="btn btn-primary" to="/pruefung">Neue Prüfung starten</Link></div>
      </div>
    );
  }

  const modulName = (id) => module?.find((m) => m.modul_id === id)?.titel || id;
  const modulStats = Object.entries(ergebnis.proModul || {});

  return (
    <div>
      <header className="main-header">
        <div>
          <h1 className="mb-0">Prüfungsergebnis</h1>
          <p className="text-muted mt-0">{konfig?.fachrichtung} · {ergebnis.gesamt} Fragen</p>
        </div>
        <div>
          <Link className="btn btn-ghost" to="/pruefung">Neue Prüfung</Link>
        </div>
      </header>

      <div className="card mb-2">
        <div className="grid grid-4">
          <div>
            <div className={`stat-value ${ergebnis.bestanden ? 'badge-leicht' : 'badge-schwer'}`}>{ergebnis.scoreProzent}%</div>
            <div className="stat-label">Gesamtergebnis</div>
          </div>
          <div>
            <div className="stat-value">{ergebnis.richtig}</div>
            <div className="stat-label">richtig</div>
          </div>
          <div>
            <div className="stat-value">{ergebnis.gesamt - ergebnis.richtig}</div>
            <div className="stat-label">falsch</div>
          </div>
          <div>
            <div className={`stat-value ${ergebnis.bestanden ? '' : 'text-muted'}`}>
              {ergebnis.bestanden ? '✓ Bestanden' : '✗ Nicht bestanden'}
            </div>
            <div className="stat-label">Bestehensgrenze 50 %</div>
          </div>
        </div>
        <div className="progress mt-2">
          <div style={{ width: `${Math.min(100, ergebnis.scoreProzent)}%` }} />
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h2>Auswertung je Modul</h2>
          {modulStats.length ? (
            modulStats.map(([modulId, stats]) => {
              const quote = stats.gesamt ? Math.round((stats.richtig / stats.gesamt) * 100) : 0;
              return (
                <div key={modulId} style={{ marginBottom: 12 }}>
                  <div className="progress-label"><span>{modulName(modulId)}</span><span>{stats.richtig}/{stats.gesamt} ({quote}%)</span></div>
                  <div className="progress"><div style={{ width: `${quote}%`, background: quote >= 60 ? 'var(--success)' : 'var(--danger)' }} /></div>
                </div>
              );
            })
          ) : (
            <p className="text-muted">Keine Modul-Statistik verfügbar.</p>
          )}
        </div>

        <div className="card">
          <h2>Stärken & Schwächen</h2>
          {ergebnis.schwaechen?.length > 0 && (
            <div className="mb-2">
              <div className="stat-label" style={{ color: 'var(--danger-ink)' }}>Schwächen (&lt; 60 %)</div>
              {ergebnis.schwaechen.map((s) => (
                <div key={s.modulId} className="module-row"><span>{modulName(s.modulId)}</span><strong>{s.quote}%</strong></div>
              ))}
            </div>
          )}
          {ergebnis.staerken?.length > 0 && (
            <div>
              <div className="stat-label" style={{ color: 'var(--success-ink)' }}>Stärken (≥ 60 %)</div>
              {ergebnis.staerken.map((s) => (
                <div key={s.modulId} className="module-row"><span>{modulName(s.modulId)}</span><strong>{s.quote}%</strong></div>
              ))}
            </div>
          )}
          <Link className="btn btn-primary btn-sm mt-2" to="/karteikarten">🃏 Schwache Themen als Karteikarten üben</Link>
        </div>
      </div>
    </div>
  );
}
