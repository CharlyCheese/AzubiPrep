import { useRef, useState } from 'react';
import { useApi } from '../utils/useApi.js';
import { api } from '../api/client.js';
import { notesStore } from '../store/localStore.js';
import { useSyncExternalStore } from 'react';
import { notizenToText, textToNotizen, downloadTextDatei } from '../utils/notizenFormat.js';

// Der Notizen-Store liefert einen stabilen Snapshot und ein Abo
// (siehe store/localStore.js) – nötig für useSyncExternalStore.
function useNotizen() {
  return useSyncExternalStore(notesStore.subscribe, notesStore.snapshot);
}
function notify() {
  window.dispatchEvent(new Event('azubiprep-notizen'));
}

export default function Notizen() {
  const notizen = useNotizen();
  const { daten: module } = useApi(() => api.get('/module'), []);
  const [titel, setTitel] = useState('');
  const [inhalt, setInhalt] = useState('');
  const [modulId, setModulId] = useState('');
  const [meldung, setMeldung] = useState('');
  const dateiInput = useRef(null);

  // Bearbeiten einer Notiz
  const [bearbeitenId, setBearbeitenId] = useState(null);
  const [editTitel, setEditTitel] = useState('');
  const [editInhalt, setEditInhalt] = useState('');
  const [editModul, setEditModul] = useState('');

  const modulName = (id) => module?.find((m) => m.modul_id === id)?.titel || id || 'Allgemein';

  function add() {
    if (!titel.trim() && !inhalt.trim()) return;
    notesStore.add({ titel, inhalt, modulId });
    notify();
    setTitel('');
    setInhalt('');
    setModulId('');
    setMeldung('Notiz gespeichert ✓');
    setTimeout(() => setMeldung(''), 2500);
  }

  function remove(id) {
    notesStore.remove(id);
    notify();
  }

  function startEdit(n) {
    setBearbeitenId(n.id);
    setEditTitel(n.titel || '');
    setEditInhalt(n.inhalt || '');
    setEditModul(n.modulId || '');
  }

  function speichernEdit() {
    notesStore.update(bearbeitenId, { titel: editTitel, inhalt: editInhalt, modulId: editModul });
    notify();
    setBearbeitenId(null);
    setMeldung('Notiz aktualisiert ✓');
    setTimeout(() => setMeldung(''), 2500);
  }

  // Export: alle Notizen als Textdatei (z. B. in Notepad bearbeitbar)
  function exportieren() {
    if (notizen.length === 0) {
      setMeldung('Keine Notizen zum Exportieren vorhanden.');
      return;
    }
    const text = notizenToText(notizen);
    const datum = new Date().toISOString().slice(0, 10);
    downloadTextDatei(`azubiprep-notizen-${datum}.txt`, text);
    setMeldung(`Export erstellt (${notizen.length} Notizen). Datei kann in Notepad/Editor bearbeitet werden.`);
  }

  // Import: Textdatei einlesen und Notizen ergänzen
  function importieren(event) {
    const datei = event.target.files?.[0];
    if (!datei) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const neu = textToNotizen(String(reader.result || ''));
        if (neu.length === 0) {
          setMeldung('Keine Notizen in der Datei gefunden (Format prüfen: "===NOTE===").');
          return;
        }
        notesStore.addBulk(neu);
        notify();
        setMeldung(`${neu.length} Notiz(en) importiert und ergänzt.`);
      } catch (e) {
        setMeldung('Import fehlgeschlagen: ' + e.message);
      } finally {
        if (dateiInput.current) dateiInput.current.value = '';
      }
    };
    reader.onerror = () => setMeldung('Datei konnte nicht gelesen werden.');
    reader.readAsText(datei, 'utf-8');
  }

  return (
    <div>
      <header className="main-header">
        <div>
          <h1 className="mb-0">Lernnotizen</h1>
          <p className="text-muted mt-0">Halte Merksätze, Fehler und Erkenntnisse fest – lokal auf diesem Gerät.</p>
        </div>
        <div className="flex wrap">
          <button className="btn btn-ghost btn-sm" onClick={exportieren} title="Notizen als Textdatei speichern">⬇ Exportieren (.txt)</button>
          <button className="btn btn-ghost btn-sm" onClick={() => dateiInput.current?.click()} title="Textdatei importieren">⬆ Importieren</button>
          <input
            ref={dateiInput}
            type="file"
            accept=".txt,.md,text/plain"
            style={{ display: 'none' }}
            onChange={importieren}
          />
        </div>
      </header>

      <div className="alert alert-info">
        <strong>Tipp:</strong> Notizen als <code>.txt</code> exportieren, in <strong>Notepad/Editor</strong> bearbeiten
        und anschließend wieder importieren. Das Format ist zeilenbasiert
        (<code>Titel:</code>, <code>Modul:</code>, <code>Inhalt:</code>, Blöcke durch <code>===NOTE===</code>).
      </div>

      {meldung && <div className="alert alert-success">{meldung}</div>}

      <div className="card mb-2">
        <div className="grid grid-2">
          <div className="field">
            <label>Titel</label>
            <input className="input" value={titel} onChange={(e) => setTitel(e.target.value)} placeholder="z. B. Subnetting-Merkregel" />
          </div>
          <div className="field">
            <label>Modul (optional)</label>
            <select className="select" value={modulId} onChange={(e) => setModulId(e.target.value)}>
              <option value="">– Allgemein –</option>
              {(module || []).map((m) => <option key={m.modul_id} value={m.modul_id}>{m.modul_id} · {m.titel}</option>)}
            </select>
          </div>
        </div>
        <div className="field">
          <label>Notiz</label>
          <textarea className="input" rows={3} value={inhalt} onChange={(e) => setInhalt(e.target.value)} placeholder="Notiz eingeben …" />
        </div>
        <button className="btn btn-primary" onClick={add}>Notiz speichern</button>
      </div>

      {notizen.length === 0 && <div className="empty">Noch keine Notizen vorhanden.</div>}

      <div className="grid grid-2">
        {notizen.map((n) => (
          <div className="card" key={n.id}>
            {bearbeitenId === n.id ? (
              <>
                <div className="field">
                  <label>Titel</label>
                  <input className="input" value={editTitel} onChange={(e) => setEditTitel(e.target.value)} />
                </div>
                <div className="field">
                  <label>Modul (optional)</label>
                  <select className="select" value={editModul} onChange={(e) => setEditModul(e.target.value)}>
                    <option value="">– Allgemein –</option>
                    {(module || []).map((m) => <option key={m.modul_id} value={m.modul_id}>{m.modul_id} · {m.titel}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Notiz</label>
                  <textarea className="input" rows={4} value={editInhalt} onChange={(e) => setEditInhalt(e.target.value)} />
                </div>
                <div className="flex wrap">
                  <button className="btn btn-primary btn-sm" onClick={speichernEdit}>Speichern</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setBearbeitenId(null)}>Abbrechen</button>
                </div>
              </>
            ) : (
              <>
                <div className="flex-between wrap">
                  <h3 className="mb-0">{n.titel}</h3>
                  <span className="badge badge-neutral">{modulName(n.modulId)}</span>
                </div>
                <p className="small text-muted mt-0 mb-0">Erstellt: {new Date(n.erstelltAm).toLocaleDateString('de-DE')}</p>
                <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{n.inhalt}</p>
                <div className="flex wrap mt-2">
                  <button className="btn btn-ghost btn-sm" onClick={() => startEdit(n)}>Bearbeiten</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => remove(n.id)}>Löschen</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
