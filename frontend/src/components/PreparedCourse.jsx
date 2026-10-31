import { useEffect, useRef, useState } from 'react';
import { PREPARED_CHAPTERS, PREPARED_LESSONS } from '../pilot/prepared/catalog.js';
import { downloadFile } from '../pilot/project.js';

export default function PreparedCourse() {
  const [lessonId, setLessonId] = useState(PREPARED_LESSONS[0].id);
  const [hints, setHints] = useState(0);
  const title = useRef(null);
  const lesson = PREPARED_LESSONS.find(item => item.id === lessonId);
  const chapter = PREPARED_CHAPTERS.find(item => item.number === lesson.chapter);
  const index = PREPARED_LESSONS.indexOf(lesson);
  const chapterIndex = chapter.lessons.indexOf(lesson);

  useEffect(() => { setHints(0); }, [lessonId]);
  function select(id) { setHints(0); setLessonId(id); }
  function navigate(id) { select(id); requestAnimationFrame(() => title.current?.focus()); }
  function exportLesson() {
    const text = [
      `Kapitel ${chapter.number}: ${chapter.title}`, lesson.title, lesson.status,
      `Voraussetzung: ${lesson.prerequisite}`, `Lernziel: ${lesson.goal}`,
      `Arbeitsumgebung: ${chapter.environment}`, ...lesson.explain,
      'Beispiel', lesson.example, 'Aufgabe', lesson.task,
      'Hinweise', ...lesson.hints, 'Eine mögliche Lösung', lesson.solution,
      'Abnahmekriterien für die spätere Praxisprüfung', ...lesson.criteria,
      `Fachreferenz: ${lesson.reference}`, `Inhaltsstand: ${lesson.checked}`,
    ].join('\n\n');
    downloadFile(`kapitel-${chapter.number}-lektion-${chapterIndex + 1}.txt`, { kind: 'text', content: text });
  }

  return <section className="prepared-course" aria-label="Weitere Kurskapitel">
    <p className="pilot-status">Inhaltsfassung · Kapitel 18–31 · {PREPARED_LESSONS.length} vorbereitete Lektionen</p>
    <p>Hier kannst du die nächsten Kapitel mit Aufgaben, Hilfen und Lösungen lesen. Die gemeinsame Einbindung von DOM, Browserfunktionen, Debugger und Werkzeugen folgt anschließend. Diese Inhaltsfassung führt keinen Beispielcode aus und vergibt keine bestandenen Prüfungen. Eigene Projekte bearbeitest du weiterhin in deinem Editor.</p>
    <div className="prepared-selectors">
      <label>Kapitel der Inhaltsfassung<select aria-label="Kapitel der Inhaltsfassung" value={chapter.number} onChange={event => select(PREPARED_CHAPTERS.find(item => item.number === Number(event.target.value)).lessons[0].id)}>{PREPARED_CHAPTERS.map(item => <option key={item.number} value={item.number}>{item.number}. {item.title}</option>)}</select></label>
      <label>Lektion der Inhaltsfassung<select aria-label="Lektion der Inhaltsfassung" value={lessonId} onChange={event => select(event.target.value)}>{chapter.lessons.map((item, position) => <option key={item.id} value={item.id}>{position + 1}. {item.title}</option>)}</select></label>
    </div>
    <article key={lesson.id} className="card pilot-lesson prepared-lesson" aria-label="Vorbereiteter Lektionstext">
      <p>Kapitel {chapter.number} · Lektion {chapterIndex + 1}/{chapter.lessons.length}</p>
      <h2 ref={title} tabIndex={-1}>{lesson.title}</h2>
      <p className="prepared-status">{lesson.status}</p>
      <p><strong>Voraussetzung:</strong> {lesson.prerequisite}</p>
      <p><strong>Lernziel:</strong> {lesson.goal}</p>
      <details className="pilot-disclosure"><summary>Arbeitsumgebung und Vorbereitung</summary><p>{chapter.environment}</p><p>Programme und Befehle sind Lernmaterial für das spätere eigene Übungsprojekt. Es wird nichts automatisch installiert, ausgeführt oder veröffentlicht. Die bestehenden Ausführungsgrenzen der Werkstatt gelten weiter.</p></details>
      {lesson.explain.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
      <h3>Beispiel</h3><pre>{lesson.example}</pre>
      <h3>Deine Aufgabe</h3><p>{lesson.task}</p>
      <h3>Abnahmekriterien für die spätere Praxisprüfung</h3>
      <ul>{lesson.criteria.map(criterion => <li key={criterion}>{criterion}</li>)}</ul>
      <details className="pilot-disclosure"><summary>Schrittweise Hinweise</summary><button className="btn btn-ghost" disabled={hints >= lesson.hints.length} onClick={() => setHints(previous => Math.min(previous + 1, lesson.hints.length))}>Nächsten Hinweis zeigen</button>{lesson.hints.slice(0, hints).map(hint => <p key={hint}>{hint}</p>)}</details>
      <details className="pilot-disclosure"><summary>Musterlösung bewusst ansehen</summary><p>Eine mögliche Umsetzung. Ansehen oder Kopieren ist kein selbstständiger Kompetenznachweis. Ergänzende Dateien und frühere Bausteine stehen in den jeweils genannten Lektionen.</p><pre>{lesson.solution}</pre></details>
      <details className="pilot-disclosure"><summary>Lektion mit Lösung als Text mitnehmen</summary><p>Der Download enthält nur diesen öffentlichen Kurstext einschließlich der Musterlösung. Er liest keine Projektdateien oder privaten Unterlagen.</p><button className="btn btn-ghost" onClick={exportLesson}>Lektion einschließlich Lösung herunterladen</button></details>
      <p>Quelle: <a href={lesson.reference} target="_blank" rel="noreferrer">Fachreferenz zur Lektion</a> · Inhaltsabgleich {lesson.checked}</p>
    </article>
    <nav className="pilot-toolbar" aria-label="Lektionsfolge der Inhaltsfassung">
      <button className="btn btn-ghost" disabled={index === 0} onClick={() => navigate(PREPARED_LESSONS[index - 1].id)}>← Vorherige Lektion</button>
      <span>{index + 1} von {PREPARED_LESSONS.length}</span>
      <button className="btn btn-primary" disabled={index === PREPARED_LESSONS.length - 1} onClick={() => navigate(PREPARED_LESSONS[index + 1].id)}>Nächste Lektion →</button>
    </nav>
  </section>;
}
