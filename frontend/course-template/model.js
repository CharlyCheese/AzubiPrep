export function selectTopics(items, query, category) {
  const normalized = query.trim().toLowerCase();
  return items.filter(item => item.title.toLowerCase().includes(normalized) && (category === 'all' || item.category === category));
}
