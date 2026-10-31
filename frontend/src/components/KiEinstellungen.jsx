import { useEffect, useRef, useState } from 'react';
import { ai, isLocalAi } from '../api/ai.js';
import { aiStore } from '../store/aiStore.js';
import '../styles/ki.css';
import RagEinstellungen from './RagEinstellungen.jsx';

const labels = { ready: 'Lokales Qwen ist bereit', no_model: 'Kein unterstütztes Modell gefunden', unavailable: 'Modelldienst ist nicht erreichbar', disabled: 'Lernbegleitung ausgeschaltet', configuration: 'KI-Konfiguration prüfen', timeout: 'Verbindungstest hat zu lange gebraucht', signin_required: 'Bitte mit ChatGPT anmelden', plan_unavailable: 'ChatGPT-Abo ist nicht freigegeben' };
export default function KiEinstellungen() {
  const settings = aiStore.useStore(); const cloud = settings.provider === 'chatgpt';
  const [status, setStatus] = useState(null), [account, setAccount] = useState(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [authorizeUrl, setAuthorizeUrl] = useState('');
  const active = useRef(null), accountKey = useRef('');
  useEffect(() => () => active.current?.abort(), []);
  async function readAccount() {
    const value = await ai.chatgptStatus();
    const key = `${value.activeId}:${value.connected}:${value.planEnabled}:${value.revision}`;
    if (key !== accountKey.current) { accountKey.current = key; aiStore.accountChanged(); }
    setAccount(value); if (value.loginState !== 'pending') setAuthorizeUrl(''); return value;
  }
  useEffect(() => {
    active.current?.abort(); setBusy(false); setStatus(null); setError(''); setAuthorizeUrl('');
    if (cloud) readAccount().catch(e => setError(e.message));
  }, [settings.provider]);
  useEffect(() => {
    if (!cloud || account?.loginState !== 'pending') return undefined;
    const timer = setInterval(() => readAccount().catch(e => setError(e.message)), 2000);
    return () => clearInterval(timer);
  }, [cloud, account?.loginState]);
  async function check() {
    const provider = aiStore.get().provider;
    active.current?.abort(); const controller = new AbortController(); active.current = controller;
    setBusy(true); setError('');
    try {
      const value = await ai.status(controller.signal, provider); if (controller.signal.aborted || aiStore.get().provider !== provider) return;
      setStatus(value);
      if (value.models.length && !value.models.some(model => model.name === aiStore.get().model)) await aiStore.set({ model: value.models.some(model => model.name === value.defaultModel) ? value.defaultModel : value.models[0].name });
    } catch (e) { if (!controller.signal.aborted) setError(e.message || 'Verbindung nicht möglich.'); }
    finally { if (!controller.signal.aborted) setBusy(false); }
  }
  async function accountAction(action) {
    setBusy(true); setError(''); setStatus(null); aiStore.accountChanged(); await aiStore.set({ chatgptModel: '' });
    try { const result = await action(); await readAccount(); if (result?.message) setError(result.message); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  async function signin(accountId) {
    await accountAction(async () => { const result = await ai.chatgptSignin(accountId); if (aiStore.get().provider !== 'chatgpt') { await ai.chatgptCancel(); return; } setAuthorizeUrl(result.authorizeUrl); window.open(result.authorizeUrl, '_blank', 'noopener,noreferrer'); });
  }
  function chooseProvider(provider) { active.current?.abort(); if (cloud && provider !== 'chatgpt') ai.chatgptCancel().catch(() => {}); aiStore.set({ provider }); }
  return <section className="card mb-2 ki" aria-labelledby="ki-settings-title">
    <h2 id="ki-settings-title">KI und Lernmaterial</h2>
    <p>Wähle freiwillige Lernhilfe. Quiz, Werkstatt und feste Prüfungen funktionieren auch ohne KI. Es werden keine Modelle automatisch installiert.</p>
    <label className="ki-field">KI-Anbieter<select value={settings.provider} disabled={!isLocalAi()} onChange={event => chooseProvider(event.target.value)}><option value="none">Ohne KI</option><option value="qwen">Lokales Qwen über Ollama</option><option value="chatgpt">Eigenes ChatGPT-Abo</option></select></label>
    {!isLocalAi() && <p>Die Anbieterauswahl steht in der lokal gestarteten AzubiPrep-App zur Verfügung.</p>}
    {settings.provider === 'none' && <p>KI ist ausgeschaltet. Eigene PDFs bleiben lokal durchsuchbar; Fundstellen lesen benötigt kein Sprachmodell.</p>}
    {settings.provider === 'qwen' && <p>Qwen läuft auf diesem Rechner. Erst beim Anfordern einer Hilfe werden Aufgaben und freiwillig ausgewählte Ausschnitte an den lokalen Ollama-Dienst gegeben.</p>}
    {cloud && <>
      <p>ChatGPT benötigt Internet und ein berechtigtes eigenes Abo. Angefragte Lernfragen, öffentliche App-Inhalte und ausdrücklich freigegebene Codeausschnitte werden an OpenAI gesendet. <strong>Eigene PDFs, Auszüge, Suchindizes und daraus abgeleitete Daten werden niemals dafür verwendet.</strong></p>
      <p className="small">Deine Anfragen nutzen das Kontingent deines ChatGPT-Abos. Ohne Internet oder bei einem Limit kannst du ohne KI weiterlernen. Keine Zugangsdaten oder Inhalte privater Unterlagen in Lernfragen/Code einfügen.</p>
      {account?.accounts?.length > 0 && <label className="ki-field">ChatGPT-Konto<select value={account.activeId || ''} disabled={busy} onChange={event => accountAction(() => ai.chatgptSelect(event.target.value))}>{account.accounts.map(item => <option key={item.id} value={item.id}>{item.label}{item.connected ? '' : ' · abgemeldet'}</option>)}</select></label>}
      <div className="ki-actions">
        <button className="btn btn-primary" disabled={busy} onClick={() => signin(account?.activeId)}>Continue with ChatGPT</button>
        {account?.accounts?.length > 0 && <button className="btn btn-ghost" disabled={busy} onClick={() => signin()}>Anderes Konto hinzufügen</button>}
        {account?.connected && <button className="btn btn-ghost" disabled={busy} onClick={() => accountAction(ai.chatgptSignout)}>ChatGPT abmelden</button>}
        {account?.loginState === 'pending' && <button className="btn btn-ghost" onClick={() => accountAction(ai.chatgptCancel)}>Anmeldung abbrechen</button>}
        <a className="btn btn-ghost" href="https://chatgpt.com/#settings/Usage" target="_blank" rel="noopener noreferrer">ChatGPT-Nutzung verwalten</a>
      </div>
      {authorizeUrl && <p><a href={authorizeUrl} target="_blank" rel="noopener noreferrer">ChatGPT-Anmeldung im Browser öffnen</a> · Falls kein Fenster geöffnet wurde.</p>}
      {account && <p role="status">{account.loginState === 'pending' ? 'Anmeldung im Browser abschließen …' : account.message || (account.connected ? account.planEnabled ? 'ChatGPT-Konto verbunden. Prüfe jetzt die Verbindung und wähle ein Modell.' : 'Angemeldet, aber die Nutzung des Abos ist nicht freigegeben.' : 'Noch kein ChatGPT-Konto verbunden.')}</p>}
    </>}
    {settings.enabled && <>
      <div className="ki-actions"><button className="btn btn-primary" disabled={busy || !isLocalAi() || (cloud && !account?.planEnabled)} onClick={check}>{busy ? 'Verbindung wird geprüft …' : cloud ? 'ChatGPT-Verbindung prüfen' : 'Lokale Verbindung prüfen'}</button>{busy && <button className="btn btn-ghost" onClick={() => { active.current?.abort(); setBusy(false); }}>Abbrechen</button>}</div>
      {status && <p role="status">{cloud && status.state === 'ready' ? 'ChatGPT ist bereit · Eigenes Abo wird verwendet' : labels[status.state] || 'Modelldienst prüfen'}{status.message ? `: ${status.message}` : ''}</p>}
      {status?.models.length > 0 && <label className="ki-field">{cloud ? 'ChatGPT-Modell' : 'Lokales Modell'}<select value={settings.model} onChange={event => aiStore.set({ model: event.target.value })}>{status.models.map(model => <option key={model.name} value={model.name}>{model.label || model.name}{!cloud && model.size ? ` (${(model.size / 1024 ** 3).toFixed(1)} GiB Modelldateien)` : ''}</option>)}</select></label>}
      {!cloud && <p className="small">Wenn Ollama nicht läuft, starte die installierte Ollama-Anwendung. Fehlt Qwen, muss ein lokales Modell separat eingerichtet werden.</p>}
    </>}
    {(error || settings.storageError) && <p role="alert">{error || settings.storageError}</p>}
    <p className="small">Antworten werden nicht dauerhaft gespeichert und vergeben keine Punkte. Bei Anbieter- oder Kontowechsel werden alte Antworten verworfen.</p>
    <RagEinstellungen />
  </section>;
}
