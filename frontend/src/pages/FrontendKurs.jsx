import { useEffect, useRef, useState } from 'react';
import { LESSONS, COURSE_VERSION, VALIDATOR_VERSION, BLUE_IMAGE, htmlPage, starterFor, solutionFor } from '../pilot/course.js';
import { checkFiles, checkPath, isText, importFiles, importProject, newStand, downloadProject, downloadZip, downloadFile } from '../pilot/project.js';
import { loadCourse, saveCourse } from '../pilot/storage.js';
import { validateProject } from '../pilot/validator.js';
import PilotPreview from '../components/PilotPreview.jsx';
import KiHilfe from '../components/KiHilfe.jsx';
import { courseContext } from '../api/ai.js';
import '../styles/pilot.css';

const draft = (lesson) => ({ files: starterFor(lesson), entry: 'index.html', stand: newStand(), hints: 0, aiHints: 0, solutionSeen: false, checks: [], reports: [], skipped: false, manual: false });
const resultCurrent = (project, lesson) => { const result = project?.checks.at(-1); return Boolean(result && result.stand === project.stand && result.lessonVersion === lesson.version && result.validatorVersion === VALIDATOR_VERSION); };
const initial = () => ({ schema: 1, courseVersion: COURSE_VERSION, projects: Object.fromEntries(LESSONS.map((lesson) => [lesson.id, draft(lesson)])) });

export default function FrontendKurs() {
  const [state, setState] = useState(initial);
  const [lessonId, setLessonId] = useState(LESSONS[0].id);
  const [ready, setReady] = useState(false);
  const [writable, setWritable] = useState(false);
  const [saveStatus, setSaveStatus] = useState('Projektspeicher wird geöffnet …');
  const [message, setMessage] = useState('');
  const [selected, setSelected] = useState('index.html');
  const [page, setPage] = useState('index.html');
  const [view, setView] = useState('lernen');
  const [filename, setFilename] = useState('');
  const [font, setFont] = useState(16);
  const [showSolution, setShowSolution] = useState(false);
  const [pending, setPending] = useState(null);
  const [paths, setPaths] = useState({});
  const [pendingSkipped, setPendingSkipped] = useState(0);
  const revision = useRef(0);
  const lesson = LESSONS.find((item) => item.id === lessonId);
  const current = state.projects[lessonId] || draft(lesson);
  const latest = current.checks.at(-1);
  const external = lesson.stage >= 4;
  const desktop = window.azubiDesktop?.version === 1;
  const currentRef = useRef(null);
  currentRef.current = { lessonId, project: current };

  useEffect(() => {
    let active = true;
    loadCourse().then((saved) => {
      if (!active) return;
      if (saved) {
        if (saved.schema !== 1 || !saved.projects || Object.keys(saved.projects).length > 40) throw new Error('Unbekannter Kursstand; Daten bleiben erhalten.');
        for (const project of Object.values(saved.projects)) { checkFiles(project.files); if (!Array.isArray(project.checks) || !Array.isArray(project.reports)) throw new Error('Ungültiger Entwurf.'); }
        setState({ ...saved, projects: { ...initial().projects, ...saved.projects } });
      }
      setWritable(true); setSaveStatus('Projektspeicher bereit'); setReady(true);
    }).catch((error) => { if (active) { setSaveStatus(`${error.message} Weiterarbeit ohne Sicherung möglich; bitte exportieren.`); setReady(true); } });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!ready || !writable) return;
    const id = ++revision.current;
    setSaveStatus('Änderungen noch nicht gespeichert …');
    const timer = setTimeout(() => {
      saveCourse(state).then(() => { if (id === revision.current) setSaveStatus('Gespeichert'); })
        .catch((error) => { if (id === revision.current) setSaveStatus(`Speichern fehlgeschlagen: ${error.message}. Bitte Projekt exportieren.`); });
    }, 500);
    return () => clearTimeout(timer);
  }, [state, ready, writable]);

  function update(change) {
    setState((previous) => {
      const project = previous.projects[lessonId] || draft(lesson);
      const next = typeof change === 'function' ? change(project) : { ...project, ...change };
      return { ...previous, projects: { ...previous.projects, [lessonId]: next } };
    });
  }
  function changeFiles(files) {
    try { checkFiles(files); update((project) => ({ ...project, files, stand: newStand(), manual: false })); setMessage(''); }
    catch (error) { setMessage(error.message); }
  }
  function selectLesson(id) {
    setLessonId(id); setSelected('index.html'); setPage('index.html'); setMessage(''); setShowSolution(false); setPending(null); setView('lernen');
  }
  async function acceptFiles(files, { entry, mode = 'replace', skipped = 0 } = {}) {
    if (currentRef.current.lessonId !== lessonId) return;
    const existing = currentRef.current.project;
    const merged = mode === 'merge' ? { ...existing.files, ...files } : files;
    checkFiles(merged);
    const collisions = Object.keys(files).filter((name) => Object.hasOwn(existing.files, name));
    const prompt = mode === 'merge'
      ? collisions.length ? `${collisions.length} vorhandene Datei(en) aktualisieren: ${collisions.join(', ')}? Alle anderen Dateien bleiben erhalten.` : null
      : 'Den gesamten aktuellen Aufgabenentwurf durch diesen Ordner oder diese Sicherung ersetzen? Nicht enthaltene Dateien werden aus dem Entwurf entfernt. Andere Aufgaben und externe Originale bleiben erhalten.';
    if (prompt && !window.confirm(prompt)) return;
    const first = mode === 'merge' && merged[existing.entry] ? existing.entry : entry || (Object.hasOwn(merged, 'index.html') ? 'index.html' : Object.keys(merged).find((name) => /\.html$/i.test(name)));
    update((project) => ({ ...project, files: merged, entry: first, stand: newStand(), manual: false }));
    setSelected(mode === 'merge' ? Object.keys(files)[0] : first); setPage(first); setView('schreiben');
    setMessage(`${Object.keys(files).length} Datei(en) lokal ${mode === 'merge' ? 'ergänzt oder aktualisiert; alle anderen Dateien bleiben erhalten' : 'als vollständiges Projekt eingelesen'}.${skipped ? ` ${skipped} private oder nicht unterstützte Datei(en) übersprungen.` : ''} Nach externen Änderungen bitte neu einlesen.`);
    setPending(null);
  }
  async function handleImport(event, format) {
    const list = Array.from(event.target.files || []); event.target.value = '';
    if (!list.length) return;
    try {
      if (format === 'json') { const imported = await importProject(list[0]); await acceptFiles(imported.files, { entry: imported.entry }); }
      else if (format === 'files') { setPending(list); setPendingSkipped(0); setPaths(Object.fromEntries(list.map((file, index) => [index, file.name]))); }
      else { let skipped = 0; const files = await importFiles(list, { onSkip: () => skipped++ }); await acceptFiles(files, { skipped }); }
    } catch (error) { setMessage(error.message); }
  }
  async function acceptMappedFiles() {
    try {
      const list = pending.map((file, index) => ({ name: paths[index], size: file.size, text: () => file.text(), arrayBuffer: () => file.arrayBuffer() }));
      let skipped = pendingSkipped;
      const files = await importFiles(list, { partial: true, onSkip: () => skipped++ });
      await acceptFiles(files, { mode: 'merge', skipped });
    } catch (error) { setMessage(error.message); }
  }
  async function chooseDesktop(mode) {
    const target = lessonId;
    try {
      const selected = await window.azubiDesktop.chooseProject(mode);
      if (!selected || currentRef.current.lessonId !== target) return;
      checkFiles(selected.files, { requireHTML: mode === 'folder' });
      if (mode === 'files') {
        const entries = Object.entries(selected.files).map(([name, file]) => {
          const bytes = file.kind === 'text' ? new TextEncoder().encode(file.content) : Uint8Array.from(atob(file.content.split(',')[1]), (c) => c.charCodeAt(0));
          return { name, size: bytes.length, text: async () => file.content, arrayBuffer: async () => bytes.buffer };
        });
        setPending(entries); setPendingSkipped(selected.skipped || 0); setPaths(Object.fromEntries(entries.map((file, index) => [index, file.name])));
        return;
      }
      await acceptFiles(selected.files, { mode: mode === 'files' ? 'merge' : 'replace', skipped: selected.skipped });
    } catch (error) { setMessage(error.message); }
  }
  function createFile(event) {
    event.preventDefault();
    try {
      const name = checkPath(filename);
      if (!isText(name)) throw new Error('Bitte eine .html- oder .css-Datei anlegen.');
      if (Object.hasOwn(current.files, name)) throw new Error('Dieser Pfad existiert bereits.');
      changeFiles({ ...current.files, [name]: { kind: 'text', content: /\.html$/i.test(name) ? htmlPage('') : '' } });
      setSelected(name); setFilename('');
    } catch (error) { setMessage(error.message); }
  }
  function deleteFile() {
    if (!window.confirm(`Nur ${selected} aus diesem Aufgabenentwurf entfernen? Externe Originale bleiben unverändert.`)) return;
    const files = { ...current.files }; delete files[selected];
    try {
      checkFiles(files);
      const entry = Object.keys(files).find((name) => /\.html$/i.test(name));
      update((project) => ({ ...project, files, stand: newStand(), manual: false, entry: files[project.entry] ? project.entry : entry }));
      setSelected(entry); setPage(entry);
    } catch (error) { setMessage(error.message); }
  }
  function addExampleImage() {
    if (current.files['bilder/beispiel.png']) { setMessage('bilder/beispiel.png ist bereits vorhanden und bleibt unverändert. Wähle einen anderen Bildpfad oder entferne die Datei bewusst.'); return; }
    changeFiles({ ...current.files, 'bilder/beispiel.png': { ...BLUE_IMAGE } });
  }
  function check() {
    try {
      const result = validateProject(current.files, lesson, current.stand, current.entry);
      update((project) => ({ ...project, checks: [...project.checks.slice(-9), result], lastSubmission: { stand: project.stand, files: project.files, entry: project.entry } })); setView('pruefen'); setMessage('');
    } catch (error) { setMessage(`Prüfung konnte nicht abgeschlossen werden: ${error.message}`); }
  }
  function report() {
    const report = { at: new Date().toISOString(), lesson: lesson.id, lessonVersion: lesson.version, stand: latest?.stand || current.stand, result: latest || null, submission: latest ? current.lastSubmission : { stand: current.stand, files: current.files, entry: current.entry }, note: 'Bewertung zur Überprüfung vorgemerkt' };
    const localReport = { ...report, submission: { stand: report.submission?.stand, entry: report.submission?.entry, fileCount: Object.keys(report.submission?.files || {}).length } };
    update((project) => ({ ...project, reports: [...project.reports.slice(-9), localReport] }));
    const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'bewertungsmeldung.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage('Meldung lokal gespeichert und heruntergeladen. Es wurde nichts versendet. Du kannst offen weiterarbeiten oder die Meldung später selbst weitergeben.');
  }
  const file = current.files[selected];
  const htmlFiles = Object.keys(current.files).filter((name) => /\.html$/i.test(name));
  const activePage = current.files[page] ? page : htmlFiles[0];

  return <div className="pilot">
    <header className="main-header"><div><h1>Frontend-Werkstatt</h1><p>HTML und CSS · Pilot, Kapitel 1–6 · optionale lokale Lernhilfe</p></div></header>
    <p className="pilot-status" role="status">{saveStatus}</p>
    <p className="small">{desktop ? 'Deine Projekte werden im lokalen Desktop-App-Profil gespeichert und bleiben unabhängig von der internen Adresse erhalten.' : 'Deine Projekte bleiben in diesem Browserprofil auf diesem Gerät. Löschen von Browserdaten entfernt auch Entwürfe.'} Exportiere wichtige Projekte. Bestehender Quiz-Lernfortschritt bleibt getrennt.</p>
    <p className="small">Der Pilot sichert insgesamt bis zu 32 MiB einschließlich eingereichter Prüfstände. Bilder und ihre Prüfabgaben benötigen mehr Platz als Text. Bei ausgeschöpftem Speicher bleibt die Arbeit exportierbar; „Gespeichert“ erscheint dann nicht.</p>
    {!ready ? <p>Entwürfe werden geladen …</p> : <>
      {state.courseVersion !== COURSE_VERSION && <p role="status">Entwürfe aus Kursversion {state.courseVersion}. Frühere Ergebnisse bleiben erhalten; aktuelle Aufgaben bitte erneut prüfen.</p>}
      <label>Lektion <select aria-label="Lektion" value={lessonId} onChange={(event) => selectLesson(event.target.value)}>{LESSONS.map((item, index) => <option key={item.id} value={item.id}>{index + 1}. Kapitel {item.chapter}: {item.title}{resultCurrent(state.projects[item.id], item) && state.projects[item.id].checks.at(-1)?.passed ? ' · Prüfung bestanden' : ''}</option>)}</select></label>
      <label>Projektstartseite <select aria-label="Projektstartseite" value={current.entry || htmlFiles[0]} onChange={(event) => { const entry = event.target.value; update((project) => ({ ...project, entry, stand: newStand(), manual: false })); setPage(entry); }}>{htmlFiles.map((name) => <option key={name}>{name}</option>)}</select></label>
      <div className="pilot-tabs" aria-label="Arbeitsansichten">{[['lernen', 'Lernen'], ['schreiben', 'Schreiben'], ['vorschau', 'Vorschau'], ['pruefen', 'Prüfen'], ['geteilt', 'Geteilte Ansicht']].map(([id, label]) => <button className={`btn ${view === id ? 'btn-primary' : 'btn-ghost'}`} aria-pressed={view === id} key={id} onClick={() => setView(id)}>{label}</button>)}</div>
      {message && <p className="alert" role="alert">{message}</p>}
      {(view === 'lernen' || view === 'geteilt') && <section className="card pilot-lesson" aria-label="Lektionstext"><p>Kapitel {lesson.chapter} · Voraussetzung: {lesson.prerequisite}</p><h2>{lesson.title}</h2>{lesson.explain.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<h3>Beispiel</h3><pre>{lesson.example}</pre><h3>Deine Aufgabe</h3><p>{lesson.task}</p><p className="small">Pflicht sind die genannten Inhalte und Techniken. Eigene Texte, gültige alternative Strukturen und Dateinamen sind erlaubt. Empfehlungen beeinflussen die Pflichtprüfung nicht.</p><button className="btn btn-primary" onClick={() => setView('schreiben')}>Selbst ausprobieren</button><p>Quelle: <a href={lesson.reference} target="_blank" rel="noreferrer">Fachreferenz zur Lektion</a> · geprüft {lesson.checked}</p></section>}
      <div className={view === 'geteilt' ? 'pilot-split' : ''}>
        {(view === 'schreiben' || view === 'geteilt') && <section className="card" aria-label="Projekteditor">
          <h2>Deine Dateien</h2><div className="pilot-filetree" role="group" aria-label="Dateibaum">{Object.keys(current.files).map((name) => <button key={name} className={`btn ${name === selected ? 'btn-primary' : 'btn-ghost'}`} aria-pressed={name === selected} onClick={() => setSelected(name)}>{name}</button>)}</div>
          <form onSubmit={createFile} className="pilot-toolbar"><label>Neuer relativer Dateipfad <input value={filename} placeholder="z. B. ueber-uns.html" onChange={(event) => setFilename(event.target.value)} required /></label><button className="btn btn-ghost">Datei anlegen</button></form>
          <div className="pilot-toolbar"><label>Schriftgröße <input type="range" min="14" max="28" value={font} onChange={(event) => setFont(Number(event.target.value))} /></label>{file && <><button className="btn btn-ghost" onClick={() => downloadFile(selected, file)}>Datei herunterladen</button><button className="btn btn-ghost" onClick={deleteFile}>Datei entfernen</button></>}<button className="btn btn-ghost" onClick={addExampleImage}>Beispielbild ergänzen</button></div>
          {file?.kind === 'text' ? <label className="pilot-code-label">Code: {selected}<textarea aria-label={`Code ${selected}`} className="pilot-code" spellCheck="false" style={{ fontSize: font }} value={file.content} onChange={(event) => changeFiles({ ...current.files, [selected]: { kind: 'text', content: event.target.value } })} /></label> : file?.kind === 'image' ? <img src={file.content} alt="Eingelesene Projektdatei" className="pilot-image" /> : <p>Bitte eine Datei auswählen.</p>}
          <p className="small">Tab verlässt den Editor. Dateien bleiben getrennt. Erlaubt sind HTML/CSS und PNG/JPEG/WebP, 50 Dateien, 128 KiB pro Textdatei, 2 MiB pro Bild und 10 MiB insgesamt.</p>
          <div className="pilot-toolbar"><button className="btn btn-primary" onClick={check}>Aufgabe prüfen</button><button className="btn btn-ghost" onClick={() => setView('vorschau')}>Browser-Vorschau ansehen</button></div>
        </section>}
        {(view === 'vorschau' || view === 'geteilt') && <section className="card"><label>Projektseite <select aria-label="Projektseite" value={activePage} onChange={(event) => setPage(event.target.value)}>{htmlFiles.map((name) => <option key={name}>{name}</option>)}</select></label><PilotPreview files={current.files} page={activePage} onPage={setPage} lesson={lesson} project={current} onAiHint={() => update(project => ({ ...project, aiHints: (project.aiHints || 0) + 1 }))} /></section>}
      </div>
      {view === 'pruefen' && <section className="card" aria-label="Prüfergebnisse"><h2>Prüfung und Verständnis</h2><button className="btn btn-primary" onClick={check}>Neu prüfen</button>{latest ? <><p>{resultCurrent(current, lesson) ? 'Aktueller Datei- und Regelstand' : 'Älterer Datei- oder Regelstand – bitte neu prüfen'} · {latest.lessonVersion} · {latest.validatorVersion}</p><p>{latest.passed ? 'Dieser eingereichte Stand hat die Pflichtprüfung bestanden. Ergänze die Selbstprüfung.' : 'Noch offene Pflichtkriterien:'}</p><ul>{latest.results.map((result, index) => <li key={`${result.rule}:${index}`}>{result.passed ? '✓ Erfüllt' : '○ Offen'} · {result.file}: {result.message}</li>)}</ul></> : <p>Noch keine Prüfung für diese Aufgabe.</p>}
        <p className="small">Die Pflichtprüfung bewertet die Lernziele dieser Aufgabe. Eine offene Anforderung bedeutet nicht automatisch einen HTML-Syntaxfehler. Die Prüfung ersetzt keinen vollständigen HTML-Validator.</p>
        <label className="pilot-check"><input type="checkbox" checked={current.manual} onChange={(event) => update({ manual: event.target.checked })} /> Ich habe Links mit Tab/Enter, Bildbeschreibung, Verständlichkeit und die verwendeten Pfade selbst geprüft.</label>
        <p>Feste Hilfen: {current.hints} · Lernbegleitung: {current.aiHints || 0} · Musterlösung {current.solutionSeen ? 'angesehen' : 'nicht angesehen'} · Selbstständiger Transfer {latest?.passed && current.manual && !current.solutionSeen && !current.hints && !current.aiHints && lesson.id === 'transfer' && resultCurrent(current, lesson) ? 'nach Pflicht- und Selbstprüfung bestätigt' : 'noch nicht bestätigt'}. Hilfen kosten keine Punkte.</p>
        <div className="pilot-toolbar"><button className="btn btn-ghost" onClick={report}>Bewertung fragwürdig? Meldung exportieren</button><button className="btn btn-ghost" onClick={() => { update({ skipped: true }); selectLesson(LESSONS[Math.min(LESSONS.indexOf(lesson) + 1, LESSONS.length - 1)].id); }}>Offen lassen und weiterlernen</button></div><p>Die Regelprüfung ist keine vollständige Standard- oder Barrierefreiheitsprüfung. Eine offene Aufgabe wird durch Weiterlernen nicht als bestanden markiert.</p>
      </section>}
      <section className="card"><h2>Hilfestellung und Projektstand</h2><button className="btn btn-ghost" onClick={() => update({ hints: Math.min(lesson.hints.length, current.hints + 1) })}>Nächsten Hinweis zeigen</button>{lesson.hints.slice(0, current.hints).map((hint) => <p key={hint}>{hint}</p>)}<button className="btn btn-ghost" onClick={() => { update({ solutionSeen: true }); setShowSolution(!showSolution); }}>Musterlösung bewusst ansehen</button>{showSolution && <details open><summary>Musterlösung – eine mögliche Umsetzung, kein Kompetenznachweis</summary>{Object.entries(solutionFor(lesson)).filter(([, item]) => item.kind === 'text').map(([name, item]) => <div key={name}><h3>{name}</h3><pre>{item.content}</pre></div>)}</details>}
        <KiHilfe course contextKey={`${lesson.id}:${current.stand}:${selected}:${latest?.at || ''}`} makeContext={includeCode => courseContext(lesson, current, selected, includeCode)} onHint={() => update(project => ({ ...project, aiHints: (project.aiHints || 0) + 1 }))} />
        <div className="pilot-toolbar"><button className="btn btn-ghost" onClick={() => downloadProject(current)}>Sicherung exportieren (JSON)</button><button className="btn btn-ghost" onClick={() => downloadZip(current.files)}>Dateien für eigenen Editor (ZIP)</button><button className="btn btn-ghost" onClick={() => { if (window.confirm('Nur diese Aufgabe zurücksetzen? Eigene Änderungen dieser Aufgabe gehen verloren. Andere Projekte bleiben erhalten.')) { update(draft(lesson)); setSelected('index.html'); setPage('index.html'); setMessage('Diese Aufgabe wurde zurückgesetzt.'); } }}>Diese Aufgabe zurücksetzen</button></div>
        <p>ZIP im eigenen Projektordner entpacken. Mit dem gewünschten Editor öffnen. Für erneutes Einlesen den Ordner auswählen; ZIP-Dateien werden nicht automatisch ausgeführt oder importiert. JSON dient als vollständige Dateisicherung.</p>
        {external ? <>
          <h3>Extern arbeiten / neu einlesen</h3>
          <p>{desktop ? 'Die native Auswahl liest ausschließlich von dir freigegebene Projektdateien. Verknüpfungen werden abgewiesen.' : 'Die Auswahl wird lokal im Browser verarbeitet.'} Kein Serverupload, keine Veröffentlichung. Ordnerpfade bleiben erhalten.</p>
          <p id="pilot-folder-help"><strong>Ordner einlesen:</strong> Der Auswahldialog zeigt Ordner statt einzelner Dateien. Wähle deinen Projektordner und bestätige die Ordnerauswahl. Danach erscheinen seine unterstützten Dateien im Dateibaum. Ein ganzer Ordner oder eine Sicherung ersetzt nach Rückfrage den aktuellen Entwurf.</p>
          <p><strong>Dateien auswählen:</strong> Einzelne Dateien werden ergänzt. Bereits eingelesene andere Dateien bleiben erhalten. Bei gleichem Pfad bestätigst du die Aktualisierung; im nächsten Schritt kannst du Unterordner zuordnen. Private Dateien und im Pilot nicht unterstützte Typen werden übersprungen.</p>
          <div className="pilot-toolbar">
            {desktop ? <>
              <button className="btn btn-primary" aria-describedby="pilot-folder-help" onClick={() => chooseDesktop('folder')}>📂 Ordner einlesen</button>
              <button className="btn btn-primary" onClick={() => chooseDesktop('files')}>＋ Dateien auswählen</button>
            </> : <>
              <label className="btn btn-primary pilot-upload">📂 Ordner einlesen<input aria-label="Ordner einlesen" aria-describedby="pilot-folder-help" type="file" multiple webkitdirectory="" onChange={(event) => handleImport(event, 'folder')} /></label>
              <label className="btn btn-primary pilot-upload">＋ Dateien auswählen<input aria-label="Dateien auswählen" type="file" multiple accept=".html,.css,.png,.jpg,.jpeg,.webp" onChange={(event) => handleImport(event, 'files')} /></label>
            </>}
            <label className="btn btn-ghost pilot-upload">↥ Sicherung einlesen<input aria-label="Sicherung einlesen" type="file" accept=".json" onChange={(event) => handleImport(event, 'json')} /></label>
          </div>
        </> : <p>Externe Bearbeitung wird bei „Links und die zweite Datei“ freigeschaltet. Die Schritte erklären wir dort vor der ersten Mehrdateiübung.</p>}
        {pending && <div className="pilot-paths"><h3>Relative Pfade zuordnen</h3><p>Diese Dateien werden deinem Entwurf hinzugefügt. Beispiel: style.css unter css/style.css, Bild unter bilder/beispiel.png. Bereits vorhandene andere Dateien bleiben erhalten.</p>{pending.map((item, index) => <label key={index}>{item.name}<input aria-label={`Relativer Pfad ${index + 1}`} value={paths[index]} onChange={(event) => setPaths({ ...paths, [index]: event.target.value })} /></label>)}<button className="btn btn-primary" onClick={acceptMappedFiles}>Ausgewählte Dateien übernehmen</button><button className="btn btn-ghost" onClick={() => setPending(null)}>Abbrechen</button></div>}
      </section>
    </>}
  </div>;
}
