import { useSyncExternalStore } from 'react';
import { useApi } from '../utils/useApi.js';
import { api } from '../api/client.js';
import { progressStore, examStore, flashcardStore, profileStore } from '../store/localStore.js';
import { modulStatusAusFortschritt, abdeckungProzent } from '../utils/modulStatus.js';
import { gamificationStore } from '../store/gamificationStore.js';
import { levelAusXp, naechsteStufe, badgesMitStatus } from '../utils/gamification.js';
import { Link } from 'react-router-dom';

export default function Statistik() {
  const { daten: module } = useApi(() => api.get('/module'), []);
  const profil = profileStore.get();
  const progress = progressStore.get();
  const pruefungen = examStore.get();
  const karten = flashcardStore.get();
  const game = useSyncExternalStore(gamificationStore.subscribe, gamificationStore.snapshot);
  const xp = game.xp || 0;
  const level = levelAusXp(xp);
  const naechste = naechsteStufe(xp);
  const xpProzent = naechste ? Math.min(100, Math.round(((xp - level.minXp) / (naechste.minXp - level.minXp)) * 100)) : 100;

  const badges = badgesMitStatus(game);
  const badgesErreicht = badges.filter((b) => b.erreicht).length;
  const gesamtVon = (id) => module?.find((m) => m.modul_id === id)?.fragenAnzahl || 0;
  const statusMap = modulStatusAusFortschritt(progress, gesamtVon);
  const modulName = (id) => module?.find((m) => m.modul_id === id)?.titel || id;

  const proModul = {};
  for (const eintrag of Object.values(progress)) {
    const modulId = eintrag.modulId || 'unbekannt';
    proModul[modulId] = proModul[modulId] || { richtig: 0, falsch: 0 };
    if (eintrag.letztesErgebnis) proModul[modulId].richtig += 1;
    else proModul[modulId].falsch += 1;
  }

  const totalRichtig = Object.values(proModul).reduce((s, m) => s + m.richtig, 0);
  const totalVersuche = Object.values(proModul).reduce((s, m) => s + m.richtig + m.falsch, 0);
  const quote = totalVersuche ? Math.round((totalRichtig / totalVersuche) * 100) : 0;
  const durchschnittPruefung = pruefungen.length
    ? Math.round(pruefungen.reduce((s, p) => s + p.scoreProzent, 0) / pruefungen.length)
    : 0;

  return (
    <div>
      <header className="main-header">
        <div>
          <h1 className="mb-0">Statistik</h1>
          <p className="text-muted mt-0">Dein Lernfortschritt im Überblick – Bereich {profil.fachrichtung}.</p>
        </div>
      </header>

      <div className="dashboard-layout">
        {/* Hauptspalte: Level, Modulfortschritt, Abzeichen */}
        <div>
          {/* Level & XP Hero-Card */}
          <div className="card mb-2">
            <div className="flex-between wrap">
              <div style={{ minWidth: 0 }}>
                <span className="badge badge-neutral mb-1">Rangstatus</span>
                <div className="stat-value">{xp} <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>XP</span></div>
                <div className="small text-muted">Level {level.level} · {level.titel}</div>
              </div>
              <div style={{ flex: 1, minWidth: 200, maxWidth: 360 }}>
                <div className="progress-label">
                  <span>{naechste ? `Nächstes Level: ${naechste.titel}` : 'Höchstes Level'}</span>
                  <span>{naechste ? `${xp - level.minXp} / ${naechste.minXp - level.minXp} XP` : 'Max.'}</span>
                </div>
                <div className="progress"><div style={{ width: `${xpProzent}%` }} /></div>
              </div>
            </div>
          </div>

          {/* Fortschritt je Modul */}
          <div className="card mb-2">
            <div className="flex-between wrap mb-2">
              <h2 className="mb-0">Fortschritt je Modul</h2>
              <span className="small text-muted">Balken: Fragenabdeckung · Prozent: Quote</span>
            </div>
            {Object.entries(proModul).length === 0 && (
              <p className="text-muted">Noch keine Lernaktivität. <Link to="/lernen">Jetzt starten →</Link></p>
            )}
            {Object.entries(proModul).map(([modulId, m]) => {
              const bearbeitet = m.richtig + m.falsch;
              const q = bearbeitet ? Math.round((m.richtig / bearbeitet) * 100) : 0;
              const gesamt = gesamtVon(modulId);
              const abdeckung = abdeckungProzent(bearbeitet, gesamt);
              const istBeherrscht = statusMap[modulId]?.beherrscht;

              return (
                <div key={modulId} style={{ marginBottom: 14 }}>
                  <div className="progress-label">
                    <span>
                      <strong>{modulName(modulId)}</strong>{' '}
                      <span className={`badge ${istBeherrscht ? 'badge-leicht' : 'badge-neutral'}`}>
                        {istBeherrscht ? 'beherrscht' : 'in Arbeit'}
                      </span>
                    </span>
                    <span>{bearbeitet} von {gesamt || '?'} Fragen ({abdeckung} %) · {q}% richtig</span>
                  </div>
                  <div className="progress">
                    <div style={{ width: `${abdeckung}%`, background: istBeherrscht ? 'var(--success)' : undefined }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Abzeichen & Trophäen */}
          <div className="card">
            <div className="flex-between wrap mb-2">
              <h2 className="mb-0">Abzeichen</h2>
              <span className="badge badge-neutral">{badgesErreicht} / {badges.length} freigeschaltet</span>
            </div>
            <div className="abzeichen-grid">
              {badges.map((b) => (
                <div key={b.id} className={`abzeichen ${b.erreicht ? 'erreicht' : 'gesperrt'}`}>
                  <div className="abzeichen-symbol" aria-hidden="true">{b.symbol}</div>
                  <div style={{ minWidth: 0 }}>
                    <div className="abzeichen-titel">{b.titel}</div>
                    <div className="small text-muted">{b.beschreibung}</div>
                    {b.erreicht ? (
                      b.am && <div className="small">Freigeschaltet am {new Date(b.am).toLocaleDateString('de-DE')}</div>
                    ) : (
                      <>
                        <div className="progress mt-1"><div style={{ width: `${Math.round(b.fortschritt * 100)}%` }} /></div>
                        <div className="small text-muted">{b.ist} / {b.ziel}</div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Nebenspalte: KPI-Grid, Leitner-Boxen, Letzte Prüfungen */}
        <aside>
          {/* KPI-Kacheln */}
          <div className="grid-kpi mb-2">
            <div className="card">
              <div className="stat-label">Erfolgsquote</div>
              <div className="stat-value" style={{ fontSize: '1.6rem', color: quote >= 70 ? 'var(--primary)' : 'inherit' }}>
                {quote}%
              </div>
              <div className="small text-muted">{totalRichtig} von {totalVersuche}</div>
            </div>
            <div className="card">
              <div className="stat-label">Ø Prüfung</div>
              <div className="stat-value" style={{ fontSize: '1.6rem', color: durchschnittPruefung >= 50 ? 'var(--success)' : 'var(--danger)' }}>
                {durchschnittPruefung}%
              </div>
              <div className="small text-muted">{pruefungen.length} Simulationen</div>
            </div>
          </div>

          {/* Karteikarten Leitner-Verteilung */}
          <div className="card mb-2">
            <h2 className="mb-0" style={{ fontSize: '1.05rem' }}>Karteikarten-Verteilung</h2>
            <p className="text-muted small mt-1 mb-2">Box 1 = neu/fällig, Box 5 = dauerhaft gelernt.</p>
            {[1, 2, 3, 4, 5].map((box) => {
              const anzahl = Object.values(karten).filter((k) => k.box === box).length;
              const max = Math.max(1, Object.keys(karten).length);
              return (
                <div key={box} style={{ marginBottom: 8 }}>
                  <div className="progress-label">
                    <span>Box {box}</span>
                    <strong>{anzahl}</strong>
                  </div>
                  <div className="progress"><div style={{ width: `${(anzahl / max) * 100}%` }} /></div>
                </div>
              );
            })}
            {Object.keys(karten).length === 0 && <p className="text-muted small mb-0">Noch keine Karteikarten vorhanden.</p>}
          </div>

          {/* Letzte Prüfungssimulationen */}
          <div className="card">
            <div className="flex-between wrap mb-2">
              <h2 className="mb-0" style={{ fontSize: '1.05rem' }}>Letzte Prüfungen</h2>
              {pruefungen.length > 0 && <Link className="btn btn-ghost btn-sm" to="/pruefung/verlauf">Alle ansehen →</Link>}
            </div>
            {pruefungen.length === 0 && <p className="text-muted small mb-0">Noch keine Simulation durchgeführt.</p>}
            {pruefungen
              .map((p, i) => ({ ...p, i }))
              .reverse()
              .slice(0, 6)
              .map((p) => (
                <Link
                  key={p.i}
                  to={`/pruefung/verlauf?index=${p.i}`}
                  className="module-row"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                  title="Prüfung ansehen und durchblättern"
                >
                  <div>
                    <strong>{p.fachrichtung}</strong>
                    <div className="small text-muted">{new Date(p.am).toLocaleDateString('de-DE')} · {p.gesamt} Fragen</div>
                  </div>
                  <div className="flex">
                    <span className={`badge ${p.bestanden ? 'badge-leicht' : 'badge-schwer'}`}>{p.scoreProzent}%</span>
                    <span className="small text-muted">→</span>
                  </div>
                </Link>
              ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
