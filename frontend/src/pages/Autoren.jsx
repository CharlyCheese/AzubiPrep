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

const EDITIERBARE_FELDER = [
  'frage', 'option_a', 'option_b', 'option_c', 'option_d',
  'antwort', 'erklaerung', 'thema', 'schwierigkeit', 'quelle',
];
const SCHWIERIGKEITEN = ['leicht', 'mittel', 'schwer'];
const REVIEW_STATUS = ['ungeprueft', 'geprueft', 'gemeldet', 'korrigiert', 'deaktiviert'];
const SEITENGROESSE = 20;

function leeresFormular(frage) {
  const f = {};
  for (const feld of EDITIERBARE_FELDER) f[feld] = frage[feld] ?? '';
  return f;
}

export default function Autoren() {
  const auth = useSyncExternalStore(authStore.subscribe, authStore.snapshot);
  const rolle = auth?.user?.rolle;
  const darfPflegen = rolle === 'autor' || rolle === 'admin';

  const [modulFilter, setModulFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [suche, setSuche] = useState('');
  const [seite, setSeite] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [ausgewaehlt, setAusgewaehlt] = useState(null); // aktuell bearbeitete Frage
  const [formular, setFormular] = useState(null);
  const [speichern, setSpeichern] = useState(false);
  const [meldung, setMeldung] = useState('');
  const formularRef = useRef(null);

  const { daten: module } = useApi(() => api.get('/module'), []);

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
  }, [modulFilter, statusFilter, suche, reloadKey]);

  // Formular nach dem Öffnen automatisch in den sichtbaren Bereich scrollen
  // (es steht unterhalb der – teils langen – Tabelle, ohne das würde man
  // es sonst leicht übersehen/für "passiert nichts" halten).
  useEffect(() => {
    if (ausgewaehlt) {
      formularRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [ausgewaehlt]);

  function bearbeiten(frage) {
    setAusgewaehlt(frage);
    setFormular(leeresFormular(frage));
    setMeldung('');
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
          <p className="text-muted">Bitte zuerst in <Link to="/einstellungen">Einstellungen</Link> einloggen – die Fragenpflege ist nur für Autor:innen zugänglich.</p>
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
        </div>
      </div>
    );
  }

  return (
    <div>
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

      <div className="card mb-2">
        <div className="flex-between wrap">
          <div className="field">
            <label>Suche (ID, Frage, Thema)</label>
            <input
              className="input"
              type="search"
              placeholder="z. B. Ausreißer, FIAE-DB-057 …"
              value={suche}
              onChange={(e) => setSuche(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Modul</label>
            <select className="select" value={modulFilter} onChange={(e) => setModulFilter(e.target.value)}>
              <option value="">Alle Module</option>
              {(module || []).map((m) => (
                <option key={m.modul_id} value={m.modul_id}>{m.titel} ({m.modul_id})</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Review-Status</label>
            <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Alle Status</option>
              {REVIEW_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {laden && <p className="text-muted">Lädt …</p>}
      {fehler && <p className="text-muted">Fehler: {fehler}</p>}

      {!laden && !fehler && (
        <div className="card mb-2 reise-tabelle-wrapper">
          <table className="reise-tabelle">
            <thead>
              <tr>
                <th>ID</th>
                <th>Modul</th>
                <th>Frage</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sichtbar.map((f) => (
                <tr key={f.id}>
                  <td className="small text-muted">{f.id}</td>
                  <td>{f.modul_id}</td>
                  <td>{f.frage.length > 80 ? `${f.frage.slice(0, 80)}…` : f.frage}</td>
                  <td><span className="badge badge-neutral">{f.review_status}</span></td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => bearbeiten(f)}>Bearbeiten</button></td>
                </tr>
              ))}
              {gefiltert.length === 0 && (
                <tr><td colSpan={5} className="text-muted">Keine Fragen für diese Filter/Suche.</td></tr>
              )}
            </tbody>
          </table>

          {gefiltert.length > 0 && (
            <div className="flex-between wrap mt-2">
              <span className="small text-muted">
                {gefiltert.length} Frage(n) – Seite {seiteBegrenzt} von {seitenAnzahl}
              </span>
              <div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setSeite((s) => Math.max(1, s - 1))}
                  disabled={seiteBegrenzt <= 1}
                >
                  ← Zurück
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setSeite((s) => Math.min(seitenAnzahl, s + 1))}
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

      {ausgewaehlt && formular && (
        <div className="card" ref={formularRef}>
          <div className="flex-between wrap mb-2">
            <h2 className="mb-0">Bearbeiten: {ausgewaehlt.id}</h2>
            <span className="badge badge-neutral">{ausgewaehlt.review_status}</span>
          </div>

          <form onSubmit={speichernAbsenden}>
            <div className="field">
              <label>Frage</label>
              <textarea className="input" rows={2} value={formular.frage} onChange={(e) => setFormular({ ...formular, frage: e.target.value })} required />
            </div>
            <div className="field">
              <label>Option A</label>
              <input className="input" value={formular.option_a} onChange={(e) => setFormular({ ...formular, option_a: e.target.value })} />
            </div>
            <div className="field">
              <label>Option B</label>
              <input className="input" value={formular.option_b} onChange={(e) => setFormular({ ...formular, option_b: e.target.value })} />
            </div>
            <div className="field">
              <label>Option C</label>
              <input className="input" value={formular.option_c} onChange={(e) => setFormular({ ...formular, option_c: e.target.value })} />
            </div>
            <div className="field">
              <label>Option D</label>
              <input className="input" value={formular.option_d} onChange={(e) => setFormular({ ...formular, option_d: e.target.value })} />
            </div>
            <div className="field">
              <label>Antwort (Musterlösung)</label>
              <input className="input" value={formular.antwort} onChange={(e) => setFormular({ ...formular, antwort: e.target.value })} required />
            </div>
            <div className="field">
              <label>Erklärung</label>
              <textarea className="input" rows={3} value={formular.erklaerung} onChange={(e) => setFormular({ ...formular, erklaerung: e.target.value })} />
            </div>
            <div className="field">
              <label>Thema</label>
              <input className="input" value={formular.thema} onChange={(e) => setFormular({ ...formular, thema: e.target.value })} />
            </div>
            <div className="field">
              <label>Schwierigkeit</label>
              <select className="select" value={formular.schwierigkeit} onChange={(e) => setFormular({ ...formular, schwierigkeit: e.target.value })}>
                {SCHWIERIGKEITEN.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Quelle</label>
              <input className="input" value={formular.quelle} onChange={(e) => setFormular({ ...formular, quelle: e.target.value })} />
            </div>

            <div className="flex-between wrap mt-2">
              <div>
                <button type="submit" className="btn btn-primary" disabled={speichern}>Speichern</button>
                <button type="button" className="btn btn-ghost" onClick={() => setAusgewaehlt(null)} disabled={speichern} style={{ marginLeft: 8 }}>Abbrechen</button>
              </div>
              <div>
                {rolle === 'admin' && ausgewaehlt.review_status !== 'geprueft' && ausgewaehlt.review_status !== 'deaktiviert' && (
                  <button type="button" className="btn btn-ghost" onClick={alsGeprueftMarkieren} disabled={speichern} style={{ marginRight: 8 }}>
                    Als geprüft markieren
                  </button>
                )}
                {ausgewaehlt.review_status === 'deaktiviert' ? (
                  <button type="button" className="btn btn-ghost" onClick={() => statusUmschalten(false)} disabled={speichern}>Reaktivieren</button>
                ) : (
                  <button type="button" className="btn btn-ghost" onClick={() => statusUmschalten(true)} disabled={speichern}>Deaktivieren</button>
                )}
              </div>
            </div>
          </form>

          {meldung && <p className="small mt-1">{meldung}</p>}
        </div>
      )}
    </div>
  );
}
