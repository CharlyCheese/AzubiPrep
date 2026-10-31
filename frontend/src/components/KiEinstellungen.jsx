import { useEffect, useRef, useState } from 'react';
import { ai, isLocalAi } from '../api/ai.js';
import { aiStore } from '../store/aiStore.js';
import '../styles/ki.css';
import RagEinstellungen from './RagEinstellungen.jsx';

const labels = { ready: 'Lokales Qwen ist bereit', no_model: 'Kein unterstütztes lokales Qwen-Modell gefunden', unavailable: 'Ollama ist nicht erreichbar', disabled: 'Lernbegleitung am Anwendungsdienst ausgeschaltet', configuration: 'Lokale KI-Konfiguration prüfen', timeout: 'Verbindungstest hat zu lange gebraucht' };
export default function KiEinstellungen() {
  const settings = aiStore.useStore();
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const active = useRef(null);
  useEffect(() => () => active.current?.abort(), []);
  async function check() {
    active.current?.abort(); const controller = new AbortController(); active.current = controller;
    setBusy(true); setError('');
    try {
      const value = await ai.status(controller.signal); if (controller.signal.aborted) return;
      setStatus(value);
      if (value.models.length && !value.models.some(model => model.name === aiStore.get().model)) await aiStore.set({ model: value.models.some(model => model.name === value.defaultModel) ? value.defaultModel : value.models[0].name });
    } catch (e) { if (!controller.signal.aborted) setError(e.message || 'Verbindung nicht möglich.'); }
    finally { if (!controller.signal.aborted) setBusy(false); }
  }
  return <section className="card mb-2 ki" aria-labelledby="ki-settings-title">
    <h2 id="ki-settings-title">KI und Lernmaterial</h2>
    <p>Die freiwillige Qwen-Lernbegleitung wird derzeit erprobt und läuft über Ollama auf diesem Rechner. Es werden keine Modelle automatisch heruntergeladen und keine Cloudmodelle verwendet.</p>
    {!isLocalAi() && <p>Bitte öffne die lokale AzubiPrep-Version auf dem Rechner mit Ollama. Auf einer entfernten Website steht diese Anbindung nicht zur Verfügung.</p>}
    <label className="ki-check"><input type="checkbox" checked={settings.enabled} disabled={!isLocalAi()} onChange={event => aiStore.set({ enabled: event.target.checked })} /> Lokale Lernbegleitung aktivieren</label>
    <p className="small">Erst beim Anfordern einer Hilfe werden der angezeigte Aufgaben-/Fragenkontext und freiwillig gewählte Codeausschnitte an den lokalen Dienst gesendet. Antworten werden nicht dauerhaft gespeichert und vergeben keine Punkte.</p>
    <div className="ki-actions"><button className="btn btn-primary" disabled={busy || !isLocalAi()} onClick={check}>{busy ? 'Verbindung wird geprüft …' : 'Lokale Verbindung prüfen'}</button>
      {busy && <button className="btn btn-ghost" onClick={() => { active.current?.abort(); setBusy(false); }}>Abbrechen</button>}
    </div>
    {status && <p role="status">{labels[status.state] || 'Modelldienst prüfen'}{status.message ? `: ${status.message}` : ''}</p>}
    {status?.models.length > 0 && <label className="ki-field">Lokales Modell<select value={settings.model} onChange={event => aiStore.set({ model: event.target.value })}>{status.models.map(model => <option key={model.name} value={model.name}>{model.name} ({(model.size / 1024 ** 3).toFixed(1)} GiB Modelldateien)</option>)}</select></label>}
    {(error || settings.storageError) && <p role="alert">{error || settings.storageError}</p>}
    <p className="small">Wenn Ollama nicht läuft, starte die installierte Ollama-Anwendung und prüfe erneut. Fehlt Qwen, muss ein lokales Modell separat eingerichtet werden. Der Kurs und die festen Prüfungen funktionieren auch ohne KI.</p>
    <RagEinstellungen />
  </section>;
}
