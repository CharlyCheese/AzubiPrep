// Leichtgewichtiges Markdown-Rendering für Theorietexte (ohne Externe).
// Unterstützt: Überschriften, Listen, Code, fett. Reicht für die Inhalte.

export function renderMarkdown(md, headingOffset = 0) {
  if (!md) return [];
  const lines = md.split(/\r?\n/);
  const out = [];
  let list = null;

  const flushList = () => {
    if (list) {
      out.push(<ul key={`ul-${out.length}`}>{list}</ul>);
      list = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) { flushList(); continue; }
    const heading = /^(#{1,3}) (.*)$/.exec(line);
    if (heading) {
      flushList();
      const Heading = `h${heading[1].length + headingOffset}`;
      out.push(<Heading key={out.length}>{inline(heading[2])}</Heading>);
      continue;
    }
    if (/^[-*]\s/.test(line)) {
      list = list || [];
      list.push(<li key={list.length}>{inline(line.replace(/^[-*]\s/, ''))}</li>);
      continue;
    }
    if (/^\d+\.\s/.test(line)) {
      list = list || [];
      list.push(<li key={list.length}>{inline(line.replace(/^\d+\.\s/, ''))}</li>);
      continue;
    }
    flushList();
    out.push(<p key={out.length}>{inline(line)}</p>);
  }
  flushList();
  return out;
}

function inline(text) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) return <code key={i}>{part.slice(1, -1)}</code>;
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
    return part;
  });
}
