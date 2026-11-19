import { theoryCatalog } from './theory.js';
import { theorySections } from './theory-outline.js';

const encode = encodeURIComponent;
const label = (...parts) => parts.filter(Boolean).join(' · ');

// Only fields of the released learning catalogs enter this projection. In
// particular, user storage, reports, AI conversations and materials are not inputs.
export function* publicSearchDocuments(content, journey, workshop, practices) {
  const { modules, topics } = theoryCatalog(content);
  const directionName = code => content.fachrichtungenByCode?.get(code)?.name || code;
  for (const module of modules.values()) {
    const id = module.modul_id;
    yield {
      type: 'module', id, title: module.titel, description: module.beschreibung,
      context: label(id, module.fachrichtung === 'ALLE' ? 'Alle Fachrichtungen' : module.fachrichtung),
      url: `/lernen/${encode(id)}`, keywords: [id, module.lernfeld, directionName(module.fachrichtung)],
    };
  }
  for (const question of content.questionsById.values()) {
    if (!modules.has(question.modul_id)) continue;
    yield {
      type: 'fragen', id: question.id, title: question.frage, description: question.thema, modulId: question.modul_id,
      context: label(question.modul_id, question.schwierigkeit, question.typ),
      url: `/quiz/${encode(question.modul_id)}?frage=${encode(question.id)}`,
      keywords: [question.id, question.thema, question.lernfeld, directionName(question.fachrichtung)],
      passages: [question.erklaerung],
      extra: [...(question.optionen || []), question.typ === 'FT' ? question.antwort : ''],
    };
  }
  for (const topic of topics.values()) {
    const glossary = topic.kind === 'term';
    const sections = theorySections(topic);
    const reading = topic.kind === 'module' ? content.theorieByModul?.get(topic.moduleIds[0]) : '';
    yield {
      type: glossary ? 'glossar' : 'theorie', id: topic.id, title: topic.title,
      shortId: topic.kind === 'overview' ? topic.field : '',
      description: sections.map(section => section.title).join(' · ') || topic.moduleIds.map(id => modules.get(id)?.titel).filter(title => title !== topic.title).join(' · '),
      context: label(topic.field, ...topic.moduleIds),
      url: `/theorie?${glossary ? 'modus=glossary&' : ''}thema=${encode(topic.id)}`,
      keywords: sections.map(section => section.title),
      passages: reading?.split(/\r?\n/).map(line => line.replace(/^[#\s-]+|[*`]/g, '').trim()),
      extra: sections.map(section => section.keywords),
    };
  }
  for (const { id } of journey?.getSummary().readyTopics || []) {
    const topic = journey.getTopic(id);
    const practice = practices[id];
    const questions = [...topic.quiz.questions, ...topic.exam.questions];
    yield {
      type: 'lernreise', id, title: topic.title, description: topic.objectives[0]?.text,
      context: label('Lernreise FIAE', topic.fieldId, topic.field.title), url: `/lernreise/fiae/${encode(id)}`,
      keywords: [...topic.blocks.map(block => block.title), ...(practice?.labels || [])],
      passages: [
        topic.caseStudy.title, topic.caseStudy.text, ...topic.objectives.map(objective => objective.text),
        ...topic.blocks.flatMap(block => [...block.paragraphs, block.takeaway, block.example.title, block.example.text, block.misconception.claim, block.misconception.correction]),
        ...topic.cards.flatMap(card => [card.front, card.back]),
        ...topic.interview.flatMap(item => [
          item.prompt, ...item.keyPoints, ...item.acceptableAlternatives, ...item.misconceptions, item.sampleAnswer,
          item.followUp, item.practice?.task, ...(item.practice?.checklist || []),
        ]),
        ...questions.map(item => item.frage),
        ...(practice?.passages || []),
      ],
      extra: [...topic.sources.map(source => source.title), ...questions.flatMap(item => [item.option_a, item.option_b, item.option_c, item.option_d])],
    };
  }
  for (const lesson of workshop) {
    yield {
      type: 'werkstatt', id: lesson.id, title: lesson.title, description: lesson.task,
      context: `Frontend-Werkstatt · Kapitel ${lesson.chapter}`, url: `/frontendkurs?lektion=${encode(lesson.id)}`,
      keywords: [lesson.id], passages: [lesson.theory],
    };
  }
  yield {
    type: 'werkstatt', id: 'debugger', title: 'JavaScript-Debugger',
    context: 'Frontend-Werkstatt', url: '/frontendkurs/debugger',
    description: 'JavaScript schrittweise ausführen, Haltepunkte setzen und Variablen untersuchen.',
    keywords: ['Fehlersuche', 'Debugging', 'Breakpoints', 'Einzelschritt', 'DOM', 'Ereignisse', 'Promise', 'Timer', 'Fetch', 'TypeScript', 'React'],
  };
}
