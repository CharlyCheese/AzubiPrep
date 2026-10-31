import { useEffect, useRef, useState } from 'react';
import { ai, isLocalAi } from '../api/ai.js';
import { aiStore } from '../store/aiStore.js';

const labels = { empty: 'Noch keine eigenen Unterlagen', unprepared: 'Material muss aufbereitet werden', processing: 'Material wird lokal aufbereitet', ready: 'Lokaler Suchindex bereit', stale: 'Material wurde verändert – bitte neu einlesen', error: 'Materialverwaltung prüfen', removing: 'Entfernen wurde unterbrochen – bitte erneut entfernen' };
export default function RagEinstellungen() {
  const [status, setStatus] = useState(null); const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(''); const [error, setError] = useState('');
  const statusRequest = useRef(null); const upload = useRef(null);
  async function refresh() {
    if (!isLocalAi()) return;
    statusRequest.current?.abort(); const controller = new AbortController(); statusRequest.current = controller;
    try { const value = await ai.materialStatus(controller.signal); if (!controller.signal.aborted) setStatus(value); }
    catch (e) { if (!controller.signal.aborted) setError(e.message); }
  }
  useEffect(() => {
    refresh(); const timer = setInterval(refresh, 5000);
    return () => { clearInterval(timer); statusRequest.current?.abort(); upload.current?.abort(); };
  }, []); // Statuspolling enthält keine PDF-Texte und keine Modellanfrage.
  async function action(run) {
    setBusy(true); setError(''); setMessage('');
    try { await run(); await refresh(); window.dispatchEvent(new Event('azubiprep-material-changed')); }
    catch (e) { if (e.name !== 'AbortError') setError(e.message); }
    finally { setBusy(false); }
  }
  function add(event) {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file) return;
    if (!/\.pdf$/i.test(file.name)) { setError('Bitte eine PDF auswählen.'); return; }
    const controller = new AbortController(); upload.current = controller;
    action(async () => { await ai.addPdf(file, controller.signal); setMessage('PDF als lokale Arbeitskopie hinzugefügt. Starte jetzt „Material aufbereiten“.'); });
  }
  function remove(document) {
    if (!window.confirm('Diese Unterlage aus AzubiPrep entfernen und ihre Suchdaten löschen? Importierte Arbeitskopien werden ebenfalls gelöscht. Zuvor selbst abgelegte Originale bleiben erhalten.')) return;
    action(async () => {
      const result = await ai.removeMaterial(document.id, aiStore.get().model);
      setMessage(result.modelContextCleared ? 'Material und zugehörige Suchdaten entfernt; der lokale Modellkontext wurde entladen.' : 'Suchdaten entfernt. Der Modellkontext konnte nicht bestätigt entladen werden; beende gegebenenfalls die laufende Ollama-Sitzung.');
    });
  }
  return <section className="ki-material" aria-label="Eigene lokale Lernunterlagen">
    <h3>Eigene lokale Lernunterlagen</h3>
    <p>PDFs werden ausschließlich auf diesem Rechner verarbeitet. Originale, Seitentexte und Suchindex bleiben in der privaten Ablage und werden weder veröffentlicht noch mit der App verteilt. Andere Anwender fügen ihr eigenes Material hinzu.</p>
    <p className="small">Zuerst eine PDF hinzufügen oder im Materialordner ablegen, dann aufbereiten. Die Suche arbeitet zunächst mit Textbegriffen, ohne zusätzliches Embedding-Modell. Gescannte PDFs ohne lesbaren Text benötigen eine später separat verfügbare OCR-Erkennung.</p>
    {status && <><p role="status">{labels[status.state] || 'Lokalen Materialstatus prüfen'}{status.pending ? ` · ${status.pending} noch nicht eingelesene PDF(s)` : ''}</p>{status.location && <p className="ki-text small">Privater Materialordner: {status.location}</p>}{status.progress && <p>{status.progress.label}: {status.progress.page} / {status.progress.total || '?'} PDF-Seiten</p>}</>}
    <div className="ki-actions">
      <label className="btn btn-primary pilot-upload">PDF hinzufügen<input type="file" accept=".pdf,application/pdf" aria-label="PDF hinzufügen" disabled={busy || status?.state === 'processing' || !isLocalAi()} onChange={add} /></label>
      <button className="btn btn-ghost" disabled={busy || status?.state === 'processing' || !isLocalAi()} onClick={() => action(async () => { await ai.prepareMaterial(); setMessage('Die lokale Aufbereitung wurde gestartet.'); })}>Material aufbereiten / neu einlesen</button>
      {status?.state === 'processing' && <button className="btn btn-ghost" disabled={busy} onClick={() => action(async () => { await ai.cancelMaterial(); setMessage('Aufbereitung abgebrochen.'); })}>Aufbereitung abbrechen</button>}
      {window.azubiDesktop?.openMaterialFolder && <button className="btn btn-ghost" onClick={() => action(() => window.azubiDesktop.openMaterialFolder())}>Materialordner öffnen</button>}
    </div>
    {busy && <p role="status">Lokaler Vorgang läuft …</p>}
    {(status?.documents || []).map(document => <div className="ki-document" key={document.id}><strong>{document.label}</strong><p>{labels[document.state] || document.state}{document.pages ? ` · ${document.pages} PDF-Seiten` : ''}</p>{document.emptyPages > 0 && <p className="small">{document.emptyPages} Seite(n) mit wenig oder keinem Text. Bilder und Tabellen können unvollständig erfasst sein.</p>}{document.failedPages > 0 && <p className="small">{document.failedPages} Seite(n) konnten nicht gelesen werden.</p>}{document.error && <p role="alert">{document.error}</p>}<button className="btn btn-ghost" disabled={busy || status?.state === 'processing'} onClick={() => remove(document)}>Unterlage entfernen</button></div>)}
    {(error || status?.error) && <p role="alert">{error || status.error}</p>}{message && <p role="status">{message}</p>}
    <p className="small">Quellenbelege nennen neutrale Unterlagenkennungen und PDF-Seiten; gedruckte Seitennummern können davon abweichen. Eigene Unterlagen werden erst mit deiner Zustimmung bei der jeweiligen Lernanfrage verwendet. Sie können veraltet sein und ersetzen keine fachliche Prüfung.</p>
  </section>;
}
