// Leichtgewichtiges Markdown-Rendering für Theorietexte (ohne Externe).
// Unterstützt: Überschriften, Listen, Code, fett. Reicht für die Inhalte.

export function renderMarkdown(md) {
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
    if (line.startsWith('### ')) { flushList(); out.push(<h3 key={out.length}>{inline(line.slice(4))}</h3>); continue; }
    if (line.startsWith('## ')) { flushList(); out.push(<h2 key={out.length}>{inline(line.slice(3))}</h2>); continue; }
    if (line.startsWith('# ')) { flushList(); out.push(<h1 key={out.length}>{inline(line.slice(2))}</h1>); continue; }
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
