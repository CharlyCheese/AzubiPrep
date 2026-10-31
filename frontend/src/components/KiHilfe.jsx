import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ai, isLocalAi } from '../api/ai.js';
import { aiStore } from '../store/aiStore.js';
import '../styles/ki.css';

export default function KiHilfe({ contextKey, makeContext, course = false, onHint }) {
  const settings = aiStore.useStore();
  const cloud = settings.provider === 'chatgpt';
  const [question, setQuestion] = useState('');
  const [includeCode, setIncludeCode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  const [useMaterial, setUseMaterial] = useState(false);
  const [material, setMaterial] = useState(null);
  const active = useRef(null); const revision = useRef(0);
  const materialStand = useMaterial ? `${material?.revision}:${material?.state}:${(material?.documents || []).map(document => `${document.id}:${document.state}`).join(',')}` : '';
  const key = `${contextKey}:${settings.enabled}:${settings.provider}:${settings.accountRevision}:${settings.model}:${useMaterial}:${materialStand}`;
  const contextPreview = makeContext(includeCode);
  useEffect(() => {
    if (settings.provider !== 'qwen' || !isLocalAi()) return undefined;
    let controller; let mounted = true;
    const refresh = async () => {
      controller?.abort(); const current = new AbortController(); controller = current;
      try { const value = await ai.materialStatus(current.signal); if (mounted && !current.signal.aborted) setMaterial(value); }
      catch { if (mounted && !current.signal.aborted) setMaterial({ state: 'unavailable', revision: 'unavailable' }); }
    };
    refresh(); const timer = setInterval(refresh, 5000); window.addEventListener('azubiprep-material-changed', refresh);
    return () => { mounted = false; clearInterval(timer); controller?.abort(); window.removeEventListener('azubiprep-material-changed', refresh); };
  }, [settings.provider]);
  useEffect(() => { setUseMaterial(false); setIncludeCode(false); setQuestion(''); }, [settings.provider, settings.accountRevision]);
  useEffect(() => {
    revision.current++; active.current?.abort(); setBusy(false); setAnswer(null); setError(''); setQuestion('');
    return () => { revision.current++; active.current?.abort(); };
  }, [key]);
  function cancel() { revision.current++; active.current?.abort(); setBusy(false); setError('Anfrage abgebrochen. Du kannst mit den festen Hinweisen weiterlernen.'); }
  async function help(intent) {
    const version = ++revision.current; active.current?.abort();
    const controller = new AbortController(); active.current = controller;
    const context = makeContext(includeCode);
    setBusy(true); setAnswer(null); setError('');
    try {
      const value = await ai.help({ provider: settings.provider, model: settings.model, intent, question, context, useMaterial: !cloud && useMaterial }, controller.signal);
      if (controller.signal.aborted || version !== revision.current) return;
      setAnswer(value); if (value.source === 'model' || value.source === 'code_hint') onHint?.();
    } catch (e) { if (!controller.signal.aborted && version === revision.current) setError(e.message || 'Ollama ist nicht erreichbar. Nutze vorerst die festen Hinweise.'); }
    finally { if (version === revision.current) setBusy(false); }
  }
  if (!settings.enabled || !isLocalAi()) return <section className="ki" aria-label="Lokale Lernbegleitung"><h3>KI-Lernbegleitung</h3><p>Optional: In den <Link to="/einstellungen">Einstellungen</Link> kannst du den KI-Anbieter auswählen. Die festen Hinweise und Prüfungen bleiben verfügbar.</p></section>;
  return <section className="ki" aria-label={cloud ? 'ChatGPT-Lernbegleitung' : 'Lokale Lernbegleitung'} onKeyDown={event => event.stopPropagation()}>
    <h3>{cloud ? 'ChatGPT-Lernbegleitung' : 'Lokale Lernbegleitung'}</h3>
    {cloud && <p><strong>Eigenes ChatGPT-Abo · Internet nötig.</strong> Die angefragten Lerninhalte und freiwillig ausgewählten Codeausschnitte werden an OpenAI gesendet. Private PDFs und daraus abgeleitete Daten bleiben ausgeschlossen. Keine privaten Unterlagen in Rückfragen oder Code einfügen.</p>}
    <p className="small">{course ? 'Gesendet werden aktuelle Aufgabe, Lektionstext und aktuelle Prüfermeldungen. Auf Wunsch kommen höchstens drei HTML-/CSS-Ausschnitte hinzu (erste Datei bis 3000, weitere bis je 1000 Zeichen); Bilder und übrige Dateien werden nicht übertragen.' : 'Gesendet werden diese Prüfungsfrage mit Antwortoptionen, hinterlegter Lösung und Erklärung. Deine übrigen Lerndaten werden nicht übertragen.'} Modell: {settings.model}. {useMaterial ? 'Zusätzlich werden wenige passende Abschnitte deiner lokalen Unterlagen an Qwen auf diesem Rechner gegeben.' : 'Eigene Unterlagen sind für diese Anfrage nicht aktiviert.'}</p>
    <label className="ki-check"><input type="checkbox" checked={!cloud && useMaterial} disabled={cloud || busy || (!useMaterial && material?.state !== 'ready')} onChange={event => setUseMaterial(event.target.checked)} /> Eigene lokale Unterlagen für diese Lernanfrage verwenden</label>
    {!cloud && material?.state !== 'ready' && <p className="small">Die private Wissenssuche ist noch nicht bereit. Prüfe die Materialverwaltung in den <Link to="/einstellungen">Einstellungen</Link>. Allgemeine Hinweise bleiben verfügbar.</p>}
    {course && <label className="ki-check"><input type="checkbox" checked={includeCode} disabled={busy} onChange={event => { setIncludeCode(event.target.checked); setAnswer(null); }} /> Aktuelle Codeausschnitte und gegebenenfalls ausgewähltes Element mitsenden</label>}
    {course && <details><summary>Lernkontext vor dem Senden ansehen</summary><p>{contextPreview.task}</p><p>{contextPreview.explanation}</p>{contextPreview.files.map(file => <details key={file.path}><summary>{file.path} · {file.content.length} Zeichen als Ausschnitt</summary><pre className="ki-text">{file.content}</pre></details>)}{contextPreview.checks.map((item, index) => <p key={index}>{item.file}: {item.message}</p>)}{contextPreview.element && <pre className="ki-text">{contextPreview.element.html}{'\n'}{contextPreview.element.rules}{'\n'}{contextPreview.element.values}</pre>}</details>}
    <label className="ki-field">Deine Rückfrage (optional)<textarea maxLength={600} rows={2} value={question} disabled={busy} onChange={event => setQuestion(event.target.value)} placeholder="Was möchtest du besser verstehen?" /></label>
    <div className="ki-actions"><button className="btn btn-primary" disabled={busy || !settings.model} onClick={() => help('hint')}>Kleinen Hinweis anfordern</button><button className="btn btn-ghost" disabled={busy || !settings.model} onClick={() => help('explain')}>{course ? 'Prüfermeldung oder Element erklären' : 'Frage verständlich erklären'}</button>{busy && <button className="btn btn-ghost" onClick={cancel}>KI-Anfrage abbrechen</button>}</div>
    {cloud && !settings.model && <p>Verbinde dein ChatGPT-Konto und wähle ein Modell in den <Link to="/einstellungen">Einstellungen</Link>.</p>}
    {busy && <p role="status">{cloud ? 'ChatGPT beantwortet die Anfrage …' : 'Qwen arbeitet lokal …'} Du kannst die Anfrage abbrechen oder ohne KI weiterlernen.</p>}
    {error && <p role="alert">{error}</p>}
    {answer && <div className="ki-answer" aria-label="KI-Antwort"><p className="small">{answer.source === 'context_guard' ? 'Feste Rückmeldung zum verfügbaren Kontext' : answer.source === 'code_hint' ? 'Fester Codehinweis' : `Unverbindliche KI-Lernhilfe · ${answer.model} · ${(answer.durationMs / 1000).toFixed(1)} s`} · aktueller angefragter Stand</p><div className="ki-text">{answer.text}</div>{answer.sources?.length > 0 && <ul aria-label="Verwendete Quellen">{answer.sources.map(source => <li key={source.id}>[{source.id}] {source.label} · PDF-Seite {source.page}</li>)}</ul>}{answer.truncated && <p>Die Antwort wurde an der Ausgabelänge begrenzt. Stelle bei Bedarf eine engere Rückfrage.</p>}<p className="small">Keine Bewertung. Gleiche Hinweise mit Aufgabe, festen Prüfermeldungen und Referenzen ab. Quellenkennungen und Seiten stammen aus dem lokalen Index; die fachliche Interpretation kann trotzdem fehlerhaft sein.</p></div>}
  </section>;
}
