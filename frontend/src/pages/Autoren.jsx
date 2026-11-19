// CONTENT-001: Autoren-Weboberfläche für Fragenpflege.
// Nur sichtbar/nutzbar für eingeloggte Nutzer mit rolle 'autor'/'admin'
// (Backend erzwingt das ohnehin über authPflicht + autorPflicht – die
// Sperre hier ist nur für eine verständliche Fehlermeldung statt eines
// rohen 401/403 aus dem Netzwerk-Tab).
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../utils/useApi.js';
import { api } from '../api/client.js';
import { authStore } from '../store/authStore.js';
import '../styles/account.css';

const EDITIERBARE_FELDER = [
  'frage', 'option_a', 'option_b', 'option_c', 'option_d',
  'antwort', 'erklaerung', 'thema', 'schwierigkeit', 'quelle',
];
const SCHWIERIGKEITEN = ['leicht', 'mittel', 'schwer'];
const REVIEW_STATUS = { ungeprueft: 'Ungeprüft', geprueft: 'Geprüft', gemeldet: 'Gemeldet', korrigiert: 'Korrigiert', deaktiviert: 'Deaktiviert' };
const SEITENGROESSE = 20;

function leeresFormular(frage) {
  const f = {};
  for (const feld of EDITIERBARE_FELDER) f[feld] = frage[feld] ?? '';
  return f;
}

export default function Autoren() {
  const auth = useSyncExternalStore(authStore.subscribe, authStore.snapshot);
  const rolle = auth?.user?.rolle;
  const darfPflegen = Boolean(auth?.token) && (rolle === 'autor' || rolle === 'admin');

  const [modulFilter, setModulFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [filterOffen, setFilterOffen] = useState(() => window.matchMedia('(min-width: 861px)').matches);
  const [suche, setSuche] = useState('');
  const [seite, setSeite] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [ausgewaehlt, setAusgewaehlt] = useState(null); // aktuell bearbeitete Frage
  const [formular, setFormular] = useState(null);
  const [speichern, setSpeichern] = useState(false);
  const [meldung, setMeldung] = useState('');
  const formularRef = useRef(null);
  const listRef = useRef(null);
  const returnId = useRef(null);
  const selectedId = ausgewaehlt?.id;
  const ungespeichert = formular && ausgewaehlt && EDITIERBARE_FELDER.some(
    feld => formular[feld] !== (ausgewaehlt[feld] ?? ''),
  );

  const modulePath = rolle === 'autor'
    ? `/module?fachrichtung=${encodeURIComponent(auth.user.fachrichtung || 'ALLE')}` : '/module';
  const { daten: module } = useApi(() => darfPflegen ? api.get(modulePath) : Promise.resolve([]), [darfPflegen, modulePath]);

  const query = new URLSearchParams();
  if (modulFilter) query.set('modul_id', modulFilter);
  if (statusFilter) query.set('review_status', statusFilter);
  const pfad = `/admin/questions${query.toString() ? `?${query.toString()}` : ''}`;

  const { daten: fragen, laden, fehler } = useApi(
    () => (darfPflegen ? api.get(pfad) : Promise.resolve([])),
    [pfad, reloadKey, darfPflegen],
  );

  // Suche läuft clientseitig über die (schon nach Modul/Status gefilterte)
  // Liste – die Menge ist pro Fachrichtung überschaubar (max. ein paar
  // hundert Fragen), ein eigener Server-Endpunkt lohnt sich dafür nicht.
  const gefiltert = useMemo(() => {
    const liste = fragen || [];
    const q = suche.trim().toLowerCase();
    if (!q) return liste;
    return liste.filter((f) => `${f.id} ${f.frage} ${f.thema}`.toLowerCase().includes(q));
  }, [fragen, suche]);

  const seitenAnzahl = Math.max(1, Math.ceil(gefiltert.length / SEITENGROESSE));
  const seiteBegrenzt = Math.min(seite, seitenAnzahl);
  const sichtbar = gefiltert.slice((seiteBegrenzt - 1) * SEITENGROESSE, seiteBegrenzt * SEITENGROESSE);

  // Bei jeder Filter-/Suchänderung zurück auf Seite 1 (sonst könnte man auf
  // einer jetzt nicht mehr existierenden Seite "landen").
  useEffect(() => {
    setSeite(1);
  }, [modulFilter, statusFilter, suche]);

  useEffect(() => {
    if (selectedId) formularRef.current?.focus();
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId && returnId.current && !laden) {
      const trigger = document.getElementById(`edit-${returnId.current}`);
      (trigger || listRef.current)?.focus();
      returnId.current = null;
    }
  }, [selectedId, laden]);

  function bearbeiten(frage) {
    returnId.current = frage.id;
    setAusgewaehlt(frage);
    setFormular(leeresFormular(frage));
    setMeldung('');
  }

  function zurListe() {
    if (ungespeichert && !window.confirm('Ungespeicherte Änderungen verwerfen und zur Fragenliste zurückkehren?')) return;
    setAusgewaehlt(null);
    setFormular(null);
  }

  async function speichernAbsenden(e) {
    e.preventDefault();
    if (!ausgewaehlt) return;
    setSpeichern(true);
    setMeldung('');
    try {
      const aktualisiert = await api.put(`/admin/questions/${ausgewaehlt.id}`, formular);
      setAusgewaehlt(aktualisiert);
      setFormular(leeresFormular(aktualisiert));
      setReloadKey((k) => k + 1);
      setMeldung('Gespeichert ✓ – Status auf „ungeprüft" zurückgesetzt (Review steht noch aus).');
    } catch (err) {
      setMeldung(`Fehler: ${err.message}`);
    } finally {
      setSpeichern(false);
    }
  }

  async function statusUmschalten(deaktivieren) {
    if (!ausgewaehlt) return;
    setSpeichern(true);
    setMeldung('');
    try {
      const aktualisiert = await api.put(`/admin/questions/${ausgewaehlt.id}`, { deaktiviert: deaktivieren });
      setAusgewaehlt(aktualisiert);
      setReloadKey((k) => k + 1);
      setMeldung(deaktivieren ? 'Frage deaktiviert – ausgeblendet aus dem Lernbereich.' : 'Frage reaktiviert (Status: ungeprüft, muss erneut geprüft werden).');
    } catch (err) {
      setMeldung(`Fehler: ${err.message}`);
    } finally {
      setSpeichern(false);
    }
  }

  // CONTENT-004: manuelles Als-geprüft-Markieren, bewusst nur für 'admin'
  // (Backend erzwingt das ebenfalls – diese Sperre hier ist nur für eine
  // verständliche Oberfläche statt eines rohen 403 nach Klick).
  async function alsGeprueftMarkieren() {
    if (!ausgewaehlt) return;
    setSpeichern(true);
    setMeldung('');
    try {
      const aktualisiert = await api.put(`/admin/questions/${ausgewaehlt.id}`, { geprueft: true });
      setAusgewaehlt(aktualisiert);
      setReloadKey((k) => k + 1);
      setMeldung('Als geprüft markiert ✓');
    } catch (err) {
      setMeldung(`Fehler: ${err.message}`);
    } finally {
      setSpeichern(false);
    }
  }

  if (!auth?.token) {
    return (
      <div>
        <header className="main-header"><h1 className="mb-0">Fragenpflege</h1></header>
        <div className="card">
          <p className="text-muted">Melde dich mit einem Autoren- oder Admin-Konto an, um Fragen zu bearbeiten.</p>
          <Link className="btn btn-primary" to="/profil#konto">Zur Anmeldung</Link>
        </div>
      </div>
    );
  }

  if (!darfPflegen) {
    return (
      <div>
        <header className="main-header"><h1 className="mb-0">Fragenpflege</h1></header>
        <div className="card">
          <p className="text-muted">Dein Konto hat keine Autor:innen-Rolle. Diese Rolle wird manuell vergeben – wende dich an die Projektleitung, falls du Fragen pflegen sollst.</p>
          <Link className="btn btn-ghost" to="/profil">Zum Profil</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="account-page">
      <header className="main-header">
        <div>
          <h1 className="mb-0">Fragenpflege</h1>
          <p className="text-muted mt-0">
            {rolle === 'admin'
              ? 'Als Admin siehst du alle Fachrichtungen.'
              : `Als Autor:in siehst du nur deine Fachrichtung (${auth.user.fachrichtung || '–'}) sowie fachrichtungsübergreifende Module.`}
            {' '}Änderungen setzen den Review-Status automatisch auf „ungeprüft" zurück.
          </p>
        </div>
      </header>

      {!ausgewaehlt && <>
        <div className="card mb-2">
          <div className="management-search">
            <div className="field">
              <label htmlFor="author-suche-id-frage-thema">Suche (ID, Frage, Thema)</label>
              <input id="author-suche-id-frage-thema"
                className="input"
                type="search"
                placeholder="z. B. Ausreißer, FIAE-DB-057 …"
                value={suche}
                onChange={(e) => setSuche(e.target.value)}
              />
            </div>
            <details open={filterOffen} onToggle={event => setFilterOffen(event.currentTarget.open)}>
              <summary>Modul und Review-Status{(modulFilter || statusFilter) && ' · gefiltert'}</summary>
              <div className="management-filters">
                <div className="field">
                  <label htmlFor="author-modul">Modul</label>
                  <select id="author-modul" className="select" value={modulFilter} onChange={(e) => setModulFilter(e.target.value)}>
                    <option value="">Alle Module</option>
                    {(module || []).map((m) => (
                      <option key={m.modul_id} value={m.modul_id}>{m.titel} ({m.modul_id})</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="author-review-status">Review-Status</label>
                  <select id="author-review-status" className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">Alle Status</option>
                    {Object.entries(REVIEW_STATUS).map(([wert, label]) => <option key={wert} value={wert}>{label}</option>)}
                  </select>
                </div>
              </div>
            </details>
          </div>
        </div>

        {laden && <p className="text-muted">Lädt …</p>}
        {fehler && <p className="text-muted">Fehler: {fehler}</p>}

        {!laden && !fehler && (
          <div className="card mb-2">
            <h2 className="mb-0" ref={listRef} tabIndex={-1}>{gefiltert.length} {gefiltert.length === 1 ? 'Frage' : 'Fragen'}</h2>
            {gefiltert.length === 0 && <p role="status" className="text-muted">Keine Fragen für diese Filter oder Suche.</p>}
            <ul className="management-list" aria-label="Fragen">
              {sichtbar.map(f => <li key={f.id}>
                <div>
                  <strong>{f.frage}</strong>
                  <div className="small text-muted">
                    <span className="badge badge-neutral">{REVIEW_STATUS[f.review_status] || f.review_status}</span>
                    {f.id} · Modul {f.modul_id}
                  </div>
                </div>
                <button id={`edit-${f.id}`} className="btn btn-ghost btn-sm" aria-label={`Bearbeiten: ${f.id}`} onClick={() => bearbeiten(f)}>Bearbeiten</button>
              </li>)}
            </ul>

            {seitenAnzahl > 1 && (
              <div className="flex-between wrap mt-2">
                <span className="small text-muted">
                  Seite {seiteBegrenzt} von {seitenAnzahl}
                </span>
                <div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => { setSeite(seiteBegrenzt - 1); listRef.current?.focus(); }}
                    disabled={seiteBegrenzt <= 1}
                  >
                    ← Zurück
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => { setSeite(seiteBegrenzt + 1); listRef.current?.focus(); }}
                    disabled={seiteBegrenzt >= seitenAnzahl}
                    style={{ marginLeft: 8 }}
                  >
                    Weiter →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </>}

      {ausgewaehlt && formular && (
        <div className="card">
          <button type="button" className="btn btn-ghost btn-sm mb-2" onClick={zurListe} disabled={speichern}>← Zur Fragenliste</button>
          <div className="flex-between wrap mb-2">
            <h2 className="mb-0" tabIndex={-1} ref={formularRef}>Bearbeiten: {ausgewaehlt.id}</h2>
            <span className="badge badge-neutral">{REVIEW_STATUS[ausgewaehlt.review_status] || ausgewaehlt.review_status}</span>
          </div>

          <form onSubmit={speichernAbsenden}>
            <div className="field">
              <label htmlFor="author-frage">Frage</label>
              <textarea id="author-frage" className="input" rows={2} value={formular.frage} onChange={(e) => setFormular({ ...formular, frage: e.target.value })} required />
            </div>
            <div className="field">
              <label htmlFor="author-option-a">Option A</label>
              <input id="author-option-a" className="input" value={formular.option_a} onChange={(e) => setFormular({ ...formular, option_a: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="author-option-b">Option B</label>
              <input id="author-option-b" className="input" value={formular.option_b} onChange={(e) => setFormular({ ...formular, option_b: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="author-option-c">Option C</label>
              <input id="author-option-c" className="input" value={formular.option_c} onChange={(e) => setFormular({ ...formular, option_c: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="author-option-d">Option D</label>
              <input id="author-option-d" className="input" value={formular.option_d} onChange={(e) => setFormular({ ...formular, option_d: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="author-antwort-musterlosung">Antwort (Musterlösung)</label>
              <input id="author-antwort-musterlosung" className="input" value={formular.antwort} onChange={(e) => setFormular({ ...formular, antwort: e.target.value })} required />
            </div>
            <div className="field">
              <label htmlFor="author-erklarung">Erklärung</label>
              <textarea id="author-erklarung" className="input" rows={3} value={formular.erklaerung} onChange={(e) => setFormular({ ...formular, erklaerung: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="author-thema">Thema</label>
              <input id="author-thema" className="input" value={formular.thema} onChange={(e) => setFormular({ ...formular, thema: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="author-schwierigkeit">Schwierigkeit</label>
              <select id="author-schwierigkeit" className="select" value={formular.schwierigkeit} onChange={(e) => setFormular({ ...formular, schwierigkeit: e.target.value })}>
                {SCHWIERIGKEITEN.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="author-quelle">Quelle</label>
              <input id="author-quelle" className="input" value={formular.quelle} onChange={(e) => setFormular({ ...formular, quelle: e.target.value })} />
            </div>

            <div className="flex-between wrap mt-2">
              <div className="flex wrap">
                <button type="submit" className="btn btn-primary" disabled={speichern}>Speichern</button>
                <button type="button" className="btn btn-ghost" onClick={zurListe} disabled={speichern}>Zur Fragenliste</button>
              </div>
              <div className="flex wrap">
                {rolle === 'admin' && ausgewaehlt.review_status !== 'geprueft' && ausgewaehlt.review_status !== 'deaktiviert' && (
                  <button type="button" className="btn btn-ghost" onClick={alsGeprueftMarkieren} disabled={speichern || ungespeichert}>
                    Als geprüft markieren
                  </button>
                )}
                {ausgewaehlt.review_status === 'deaktiviert' ? (
                  <button type="button" className="btn btn-ghost" onClick={() => statusUmschalten(false)} disabled={speichern || ungespeichert}>Reaktivieren</button>
                ) : (
                  <button type="button" className="btn btn-ghost" onClick={() => statusUmschalten(true)} disabled={speichern || ungespeichert}>Deaktivieren</button>
                )}
              </div>
            </div>
          </form>

          {ungespeichert && <p className="small text-muted">Speichere deine Änderungen, bevor du den Status wechselst.</p>}
          {meldung && <p role="status" className="small mt-1">{meldung}</p>}
        </div>
      )}
    </div>
  );
}
