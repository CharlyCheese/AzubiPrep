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

  // Abzeichen und Modul-Status (Phase 3)
  const badges = badgesMitStatus(game);
  const badgesErreicht = badges.filter((b) => b.erreicht).length;
  const gesamtVon = (id) => module?.find((m) => m.modul_id === id)?.fragenAnzahl || 0;
  const statusMap = modulStatusAusFortschritt(progress, gesamtVon);

  const modulName = (id) => module?.find((m) => m.modul_id === id)?.titel || id;

  // Fortschritt je Modul (modulId wird beim Beantworten mitgespeichert)
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


      <div className="card mb-2">
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
      <div className="card mb-2">
        <div className="flex-between wrap">
          <div>
            <div className="small text-muted">Level {level.level} · {level.titel}</div>
            <div className="stat-value">{xp} XP</div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div className="progress-label">
              <span>{naechste ? `Nächstes Level: ${naechste.titel}` : 'Höchstes Level'}</span>
              <span>{naechste ? `${xp - level.minXp} / ${naechste.minXp - level.minXp} XP` : 'Max.'}</span>
            </div>
            <div className="progress"><div style={{ width: `${xpProzent}%` }} /></div>
          </div>
        </div>
      </div>
      <div className="grid grid-4 mb-2">
        <div className="card"><div className="stat-value">{quote}%</div><div className="stat-label">Erfolgsquote</div></div>
        <div className="card"><div className="stat-value">{totalRichtig}/{totalVersuche}</div><div className="stat-label">richtig/beantwortet</div></div>
        <div className="card"><div className="stat-value">{pruefungen.length}</div><div className="stat-label">Prüfungssimulationen</div></div>
        <div className="card"><div className="stat-value">{durchschnittPruefung}%</div><div className="stat-label">Ø Prüfungsergebnis</div></div>
      </div>

      <div className="card mb-2">
        <h2>Fortschritt je Modul</h2>
        <p className="small text-muted mt-0">
          Balken: bearbeitete Fragen bezogen auf alle Fragen des Moduls. Prozent: Erfolgsquote aus den bearbeiteten Fragen.
        </p>
        {Object.entries(proModul).length === 0 && (
          <p className="text-muted">Noch keine Lernaktivität. <Link to="/lernen">Jetzt starten →</Link></p>
        )}
        {Object.entries(proModul).map(([modulId, m]) => {
          const bearbeitet = m.richtig + m.falsch;
          const q = bearbeitet ? Math.round((m.richtig / bearbeitet) * 100) : 0;
          const gesamt = gesamtVon(modulId);
          // Fortschritt immer bezogen auf die maximale Fragenzahl des Moduls
          const abdeckung = abdeckungProzent(bearbeitet, gesamt);
          return (
            <div key={modulId} style={{ marginBottom: 12 }}>
              <div className="progress-label">
                <span>
                  {modulName(modulId)}{' '}
                  <span className={`badge ${statusMap[modulId]?.beherrscht ? 'badge-leicht' : 'badge-neutral'}`}>
                    {statusMap[modulId]?.beherrscht ? 'beherrscht' : 'in Arbeit'}
                  </span>
                </span>
                <span>{bearbeitet} von {gesamt || '?'} Fragen ({abdeckung} %) · {q}% richtig</span>
              </div>
              <div className="progress">
                <div style={{ width: `${abdeckung}%`, background: statusMap[modulId]?.beherrscht ? 'var(--success)' : undefined }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h2>Karteikarten-Verteilung</h2>
          <p className="text-muted small">Box 1 = neu/fällig, Box 5 = langfristig gelernt.</p>
          {[1, 2, 3, 4, 5].map((box) => {
            const anzahl = Object.values(karten).filter((k) => k.box === box).length;
            const max = Math.max(1, Object.keys(karten).length);
            return (
              <div key={box} style={{ marginBottom: 8 }}>
                <div className="progress-label"><span>Box {box}</span><span>{anzahl}</span></div>
                <div className="progress"><div style={{ width: `${(anzahl / max) * 100}%` }} /></div>
              </div>
            );
          })}
          {Object.keys(karten).length === 0 && <p className="text-muted">Noch keine Karteikarten vorhanden.</p>}
        </div>

        <div className="card">
          <div className="flex-between wrap mb-2">
            <h2 className="mb-0">Letzte Prüfungssimulationen</h2>
            {pruefungen.length > 0 && <Link className="btn btn-ghost btn-sm" to="/pruefung/verlauf">Alle ansehen →</Link>}
          </div>
          {pruefungen.length === 0 && <p className="text-muted">Noch keine Simulation durchgeführt.</p>}
          {pruefungen
            .map((p, i) => ({ ...p, i }))
            .reverse()
            .slice(0, 8)
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
      </div>
    </div>
  );
}
