// Only public descriptions of destinations belong here. Notes are matched
// separately against the current browser profile and never enter an API request.
import { isPortfolio } from './deployment.js';

const tools = [
  { title: 'Dashboard', url: '/dashboard', description: 'Lernen fortsetzen, Tagesziel und Lernstand ansehen.', keywords: 'Startseite Übersicht Fortschritt' },
  { title: 'Willkommen', url: '/willkommen', description: 'Einstieg in AzubiPrep und kurze Führung durch die App.', keywords: 'Erste Schritte Tour' },
  { title: 'Lernbereich', url: '/lernen', description: 'Module und Quizfragen nach Fachrichtung und Lernfeld auswählen.', keywords: 'Modulkatalog Übungen' },
  { title: 'Geführte Lernreise', url: '/lernreise?fr=FIAE', description: 'Die Abschnitte der FIAE-Lernreise in Reihenfolge bearbeiten.' },
  { title: 'Freie Modulreise', url: '/lernreise?weg=module', description: 'Stationen deiner Fachrichtung in der Karten- oder Listenansicht öffnen.', keywords: 'Lernreise Lernpfad' },
  { title: 'Theorie & Glossar', url: '/theorie', description: 'Lernfelder und Lernbereiche mit Erklärungen nachschlagen.' },
  { title: 'Glossar', url: '/theorie?modus=glossary', description: 'Fachbegriffe und Abkürzungen nachschlagen.', keywords: 'Wörterbuch Lexikon' },
  { title: 'Freie Wissenssuche', url: '/theorie?wissen=1', description: isPortfolio ? 'Fundstellen in den öffentlichen Lerninhalten nachschlagen.' : 'Eine eigene Frage stellen und Fundstellen in Lernunterlagen lesen.', keywords: isPortfolio ? 'Wissensfrage Quellen' : 'Wissensfrage Materialsuche Quellen RAG' },
  { title: 'Frontend-Werkstatt', url: '/frontendkurs', description: 'Praktische Übungen für HTML, CSS und JavaScript öffnen.', keywords: 'Editor Programmieren Frontendkurs Vorschau' },
  { title: 'Karteikarten', url: '/karteikarten', description: 'Fällige Karten wiederholen oder einen neuen Lernstapel zusammenstellen.', keywords: 'Wiederholung Lernkarten Flashcards' },
  { title: 'Prüfungssimulation', url: '/pruefung', description: 'Eine Prüfung zusammenstellen und mit Zeitlimit bearbeiten.', keywords: 'Prüfung starten Probeklausur IHK Simulator' },
  { title: 'Prüfungsverlauf', url: '/pruefung/verlauf', description: 'Deine bisherigen Prüfungsergebnisse ansehen.', keywords: 'Prüfungshistorie Auswertung' },
  { title: 'Statistik', url: '/statistik', description: 'Lernfortschritt, Aktivität und Abzeichen ansehen.', keywords: 'Punkte Erfolge Leistung' },
  { title: 'Lernkalender', url: '/kalender', description: 'Lernzeiten planen und den Tagesplan öffnen.', keywords: 'Termin Termine Lernplan Wochenplan Kalender' },
  { title: 'Lernnotizen', url: '/notizen', description: 'Eigene Notizen schreiben, bearbeiten, importieren und exportieren.', keywords: 'Merksätze' },
  { title: 'Profil', url: '/profil', description: 'Lernprofil, Fachrichtung und Prüfungstermin bearbeiten.', keywords: isPortfolio ? '' : 'Konto Anmeldung Registrierung Synchronisierung Passwort' },
  { title: 'Passwort zurücksetzen', url: '/passwort-zuruecksetzen', description: 'Bei der Administration einen Link zum Zurücksetzen anfordern.', keywords: 'Passwort vergessen Kennwort Zugang verloren Konto', requiresAccounts: true },
  { title: 'Benachrichtigungen', url: '/benachrichtigungen', description: 'Deine Mitteilungen und Push-Einstellungen öffnen.', keywords: 'Nachrichten Postfach Archiv Mailbox', localEdition: true },
  { title: 'Einstellungen', url: '/einstellungen', description: 'Design wechseln, die Führung starten oder Datenschutz und lokale Daten verwalten.', keywords: 'Hell Dunkel Dunkelmodus Dark Mode Darstellung Hilfe Tour zurücksetzen' },
  { title: 'KI-Anbieter', url: '/einstellungen#ki-anbieter', description: 'Anbieter und Modell für die Lernhilfe auswählen.', keywords: 'Einstellungen künstliche Intelligenz Qwen ChatGPT', localEdition: true },
  { title: 'Lokale Lernunterlagen', url: '/einstellungen#lernunterlagen', description: 'Unterlagen für die lokale Materialsuche verwalten.', keywords: 'Einstellungen RAG Quellen Index', localEdition: true },
  { title: 'Fragenpflege', url: '/autoren', description: 'Übungsfragen verwalten und Meldungen bearbeiten.', roles: ['admin', 'autor'] },
  { title: 'Nutzerverwaltung', url: '/nutzerverwaltung', description: 'Konten und Rollen verwalten.', roles: ['admin'] },
];

function normalize(value) {
  return String(value || '').toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

function matches(query, entries) {
  const phrase = normalize(query);
  if (!phrase) return [];
  const tokens = phrase.split(' ');
  return entries.map(entry => {
    const title = normalize(entry.title);
    const text = [title, normalize(entry.description), normalize(entry.context), normalize(entry.keywords)].join(' ');
    const score = tokens.every(token => text.includes(token))
      ? 1 + tokens.filter(token => title.includes(token)).length + Number(title === phrase) : 0;
    return { entry, score };
  }).filter(hit => hit.score > 0).sort((a, b) => b.score - a.score).map(hit => hit.entry);
}

export function findTools(query, role) {
  const available = tools.filter(tool => (!isPortfolio || !(tool.localEdition || tool.requiresAccounts))
    && (!tool.roles || tool.roles.includes(role)));
  return matches(query, available)
    .map(tool => ({ ...tool, type: 'funktionen', id: tool.url }));
}

function noteExcerpt(text, query) {
  if (text.length <= 220) return text;
  const position = text.toLowerCase().indexOf(query.toLowerCase());
  const start = Math.max(0, Math.min(position - 55, text.length - 220));
  return (start ? '…' : '') + text.slice(start, start + 220) + (start + 220 < text.length ? '…' : '');
}

export function findNotes(query, notes) {
  return matches(query, notes.filter(note => typeof note?.id === 'string' && note.id).map(note => ({
    type: 'notizen', id: note.id, title: typeof note.titel === 'string' && note.titel || 'Ohne Titel',
    description: typeof note.inhalt === 'string' ? note.inhalt : '',
    context: typeof note.modulId === 'string' ? note.modulId : '',
    url: `/notizen#notiz=${encodeURIComponent(note.id)}`,
  }))).map(note => ({ ...note, description: noteExcerpt(note.description, query) }));
}
