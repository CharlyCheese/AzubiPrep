// Öffentliche Suchbegriffe, keine Inhalte aus privaten Lernunterlagen.
// Langformen sind Suchäquivalente im IT-Ausbildungskontext, keine Definitionen.
const nist = 'https://www.nccoe.nist.gov/publication/1800-15/VolC/vol-c-appendix.html';
const glossary = term => `https://csrc.nist.gov/glossary/term/${term}`;
const mdn = term => `https://developer.mozilla.org/en-US/docs/Glossary/${term}`;
const firmware = 'https://learn.microsoft.com/en-us/windows-hardware/drivers/bringup/firmware-weg';
export const IT_ALIASES = Object.freeze([
  ['IoT', ['Internet of Things'], nist],
  ['CPU', ['Central Processing Unit'], glossary('cpu')],
  ['GPU', ['Graphics Processing Unit'], glossary('gpu')],
  ['RAM', ['Random Access Memory'], glossary('ram')],
  ['ROM', ['Read Only Memory'], glossary('rom')],
  ['SSD', ['Solid State Drive', 'Solid State Drives'], firmware],
  ['HDD', ['Hard Disk Drive', 'Hard Disk Drives'], firmware],
  ['USB', ['Universal Serial Bus'], glossary('usb')],
  ['BIOS', ['Basic Input Output System', 'Basic Input/Output System'], glossary('bios')],
  ['UEFI', ['Unified Extensible Firmware Interface'], firmware],
  ['NVMe', ['Non Volatile Memory Express', 'NVM Express'], glossary('non_volatile_memory_express')],
  ['LAN', ['Local Area Network'], nist],
  ['WLAN', ['Wireless Local Area Network'], glossary('wlan')],
  ['WAN', ['Wide Area Network'], nist],
  ['VLAN', ['Virtual Local Area Network'], nist],
  ['VPN', ['Virtual Private Network'], glossary('vpn')],
  ['DNS', ['Domain Name System'], nist],
  ['DHCP', ['Dynamic Host Configuration Protocol'], nist],
  ['TCP', ['Transmission Control Protocol'], nist],
  ['UDP', ['User Datagram Protocol'], nist],
  ['IPv4', ['Internet Protocol Version 4'], nist],
  ['IPv6', ['Internet Protocol Version 6'], nist],
  ['HTTP', ['Hypertext Transfer Protocol'], nist],
  ['HTTPS', ['Hypertext Transfer Protocol Secure', 'HTTP Secure'], nist],
  ['TLS', ['Transport Layer Security'], nist],
  ['SSL', ['Secure Sockets Layer'], nist],
  ['SSH', ['Secure Shell'], nist],
  ['FTP', ['File Transfer Protocol'], glossary('ftp')],
  ['SMTP', ['Simple Mail Transfer Protocol'], glossary('smtp')],
  ['IMAP', ['Internet Message Access Protocol'], glossary('imap')],
  ['POP3', ['Post Office Protocol Version 3', 'Post Office Protocol 3'], 'https://www.rfc-editor.org/rfc/rfc1939'],
  ['SNMP', ['Simple Network Management Protocol'], glossary('snmp')],
  ['NTP', ['Network Time Protocol'], glossary('ntp')],
  ['ARP', ['Address Resolution Protocol'], glossary('arp')],
  ['ICMP', ['Internet Control Message Protocol'], glossary('icmp')],
  ['NAT', ['Network Address Translation'], nist],
  ['RDP', ['Remote Desktop Protocol'], glossary('rdp')],
  ['HTML', ['Hypertext Markup Language', 'Hyper Text Markup Language'], mdn('HTML')],
  ['CSS', ['Cascading Style Sheets'], mdn('CSS')],
  ['JS', ['JavaScript'], 'https://developer.mozilla.org/en-US/docs/Web/JavaScript'],
  ['DOM', ['Document Object Model'], mdn('DOM')],
  ['JSON', ['JavaScript Object Notation'], mdn('JSON')],
  ['XML', ['Extensible Markup Language'], mdn('XML')],
  ['SQL', ['Structured Query Language'], mdn('SQL')],
  ['DBMS', ['Database Management System'], glossary('dbms')],
  ['RDBMS', ['Relational Database Management System'], 'https://www.ibm.com/think/topics/relational-databases'],
  ['OOP', ['Object Oriented Programming'], mdn('OOP')],
  ['UML', ['Unified Modeling Language'], 'https://www.omg.org/spec/UML/'],
  ['API', ['Application Programming Interface'], nist],
  ['REST', ['Representational State Transfer'], nist],
  ['CRUD', ['Create Read Update Delete'], mdn('CRUD')],
  ['URL', ['Uniform Resource Locator'], nist],
  ['URI', ['Uniform Resource Identifier'], mdn('URI')],
  ['IaaS', ['Infrastructure as a Service'], glossary('iaas')],
  ['PaaS', ['Platform as a Service'], glossary('paas')],
  ['SaaS', ['Software as a Service'], glossary('saas')],
  ['IAM', ['Identity and Access Management'], 'https://pages.nist.gov/zero-trust-architecture/acronyms.html'],
  ['MFA', ['Multi Factor Authentication', 'Multifactor Authentication'], glossary('mfa')],
  ['RBAC', ['Role Based Access Control'], glossary('rbac')],
  ['ACL', ['Access Control List'], nist],
  ['AES', ['Advanced Encryption Standard'], glossary('aes')],
  ['IDS', ['Intrusion Detection System'], glossary('ids')],
  ['SIEM', ['Security Information and Event Management'], glossary('siem')],
  ['AI', ['Artificial Intelligence', 'Künstliche Intelligenz', 'KI'], 'https://www.dke.de/resource/blob/2019486/99bc6d952073ca88f52c0ae4a8c351a8/nr-ki-english---download-data.pdf'],
  ['ML', ['Machine Learning', 'Maschinelles Lernen'], 'https://www.foerderdatenbank.de/FDB/Content/DE/Foerderprogramm/Bund/BMBF/ki-methoden-ml-modelle-grundlagen.html'],
  ['LLM', ['Large Language Model', 'Large Language Models'], glossary('large_language_model')],
  ['RAG', ['Retrieval Augmented Generation'], 'https://learn.microsoft.com/en-us/azure/search/retrieval-augmented-generation-overview'],
  ['GUI', ['Graphical User Interface'], glossary('gui')],
  ['CLI', ['Command Line Interface'], 'https://pages.nist.gov/zero-trust-architecture/acronyms.html'],
].map(([abbreviation, forms, source]) => Object.freeze({ abbreviation, forms: Object.freeze(forms), source })));

// Häufige Mehrdeutigkeiten innerhalb der IT: nicht automatisch aus Quellen lernen.
const ambiguous = new Set(['MAC', 'NAS', 'CA', 'AP', 'CD', 'PC', 'OS', 'IP', 'AD', 'SFTP', 'IPS', 'CMS', 'IDE']);
export const ALIAS_LIMITS = Object.freeze({ learned: 128, definitions: 2048, textChars: 96 * 1024 * 1024, formChars: 100, words: 8 });
const known = new Set(IT_ALIASES.flatMap(entry => [entry.abbreviation.toUpperCase(), ...entry.forms.filter(form => /^[A-Z]{2,10}$/.test(form))]));
const fold = text => text.normalize('NFKC').toLocaleLowerCase('en').replace(/[\s\-\u2010\u2011]+/gu, ' ').trim();
const knownForms = new Set(IT_ALIASES.flatMap(entry => entry.forms.map(fold)));
const escape = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function compile(entries, learnedCount = 0) {
  const forms = new Map();
  for (const entry of entries) for (const form of entry.forms) forms.set(fold(form), entry.abbreviation);
  const alternatives = [...forms.keys()].sort((a, b) => b.length - a.length).map(form => form.split(' ').map(escape).join('[\\s\\-\\u2010\\u2011]+'));
  const pattern = new RegExp(`(?<![\\p{L}\\p{N}_])(?:${alternatives.join('|')})(?![\\p{L}\\p{N}_])`, 'giu');
  const acronyms = new Set([...entries.map(entry => entry.abbreviation.toLowerCase()), ...ambiguous].map(value => value.toLowerCase()));
  return Object.freeze({ learnedCount, isAcronym: word => acronyms.has(word.toLowerCase()), normalize: text => String(text).replace(pattern, match => forms.get(fold(match))) });
}
export const DEFAULT_ALIASES = compile(IT_ALIASES);

function definitionForm(text, abbreviation, allowPrefix) {
  const words = text.trim().split(/[\s\-\u2010\u2011]+/u);
  if (words.length > ALIAS_LIMITS.words) return null;
  for (let start = allowPrefix ? words.length - 2 : 0; start >= 0; start--) {
    const part = words.slice(start);
    if (part.length < 2) continue;
    if (part.join(' ').length > ALIAS_LIMITS.formChars) continue;
    const initials = part.map(word => word[0]).join('').toUpperCase();
    const significant = part.filter(word => !/^(of|the|and|for|as|a|an|to)$/i.test(word)).map(word => word[0]).join('').toUpperCase();
    if (initials === abbreviation || significant === abbreviation) return part.join(' ');
    if (!allowPrefix) break;
  }
  return null;
}
export function createSearchAliasCollector() {
  const found = new Map(); const conflicts = new Set(); const owners = new Map(); let chars = 0; let definitions = 0;
  // Nur begrenzte explizite Klammerdefinitionen, keine Abkürzungs-Erfindung.
  const word = '[\\p{L}][\\p{L}\\p{N}]{0,29}';
  const phrase = `(?:${word}[ \\t\\-\\u2010\\u2011]+){1,7}${word}`;
  const forward = new RegExp(`(?<![\\p{L}\\p{N}_])(${phrase})[ \\t]*\\(([A-Z][A-Z0-9]{2,9})\\)`, 'gu');
  const reverse = new RegExp(`(?<![\\p{L}\\p{N}_])([A-Z][A-Z0-9]{2,9})[ \\t]*\\((${phrase})\\)`, 'gu');
  function add(texts) { for (const text of texts) {
    if (chars >= ALIAS_LIMITS.textChars || definitions >= ALIAS_LIMITS.definitions) break;
    const value = String(text).slice(0, ALIAS_LIMITS.textChars - chars); chars += value.length;
    for (const [pattern, reversed] of [[forward, false], [reverse, true]]) for (const match of value.matchAll(pattern)) {
      if (++definitions > ALIAS_LIMITS.definitions) break;
      const abbreviation = reversed ? match[1] : match[2];
      if (known.has(abbreviation) || ambiguous.has(abbreviation)) continue;
      const form = definitionForm(reversed ? match[2] : match[1], abbreviation, !reversed);
      if (!form || knownForms.has(fold(form))) continue;
      const key = fold(form);
      if (owners.has(key) && owners.get(key) !== abbreviation) { conflicts.add(abbreviation); conflicts.add(owners.get(key)); }
      else owners.set(key, abbreviation);
      if (found.has(abbreviation) && fold(found.get(abbreviation)) !== fold(form)) conflicts.add(abbreviation);
      else if (found.size < ALIAS_LIMITS.learned || found.has(abbreviation)) found.set(abbreviation, form);
    }
  } }
  function finish() {
    const learned = [...found].filter(([abbreviation]) => !conflicts.has(abbreviation)).map(([abbreviation, form]) => ({ abbreviation, forms: [form] }));
    return learned.length ? compile([...IT_ALIASES, ...learned], learned.length) : DEFAULT_ALIASES;
  }
  return { add, finish };
}
export function createSearchAliases(texts = []) {
  const collector = createSearchAliasCollector(); collector.add(texts); return collector.finish();
}
