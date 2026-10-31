// Ausschließlich kontrollierte Programme. Hier gibt es keinen Nutzercode-Eingang.
const FIXTURES = new Map([
  ['dom', { title: 'Button verändert Text', duration: 60000, code: `const button = document.getElementById('demo-button');
button.addEventListener('click', () => {
  document.getElementById('demo-output').textContent = 'JavaScript verändert diese Übungsseite.';
  console.log('DOM geändert');
});
console.log('Bereit: Klicke auf Text ändern.');` }],
  ['loop', { title: 'Endlosschleife abbrechen', duration: 2000, code: `console.log('Endlosschleife gestartet');
while (true) { /* Der Abbruch muss von außerhalb dieses Prozesses kommen. */ }` }],
  ['output', { title: 'Zu viel Konsolenausgabe', duration: 2000, code: `for (let i = 0; i < 10000; i++) console.log('Ausgabe', i);` }],
  ['memory', { title: 'Speicherzuwachs beobachten', duration: 4000, code: `const blocks = [];
const timer = setInterval(() => {
  blocks.push(new Uint8Array(4 * 1024 * 1024).fill(7));
  if (blocks.length === 24) clearInterval(timer);
}, 50);
console.log('Begrenzter Speichertest gestartet');` }],
  ['access', { title: 'App-Zugriff und frische Sitzung', duration: 60000, code: `console.log('require:', typeof require);
console.log('process:', typeof process);
console.log('App-Brücke:', typeof window.azubiDesktop);
console.log('Öffner:', window.opener === null ? 'keiner' : 'vorhanden');
console.log('Eigener Hauptkontext:', window.parent === window);
console.log('Vorheriger Übungswert:', localStorage.getItem('js-pilot-value') || 'leer');
localStorage.setItem('js-pilot-value', 'nur diese Sitzung');` }],
  ['network', { title: 'Netzwerk und Navigation sperren', duration: 60000, network: true, code: `for (const target of TARGETS) {
  fetch(target).catch(() => console.log('Anfrage gesperrt'));
}
const image = new Image(); image.src = TARGETS[1];
console.log('Popup:', window.open(TARGETS[1]) === null ? 'gesperrt' : 'offen');
window.location.href = TARGETS[0];` }],
  ['error', { title: 'Programmfehler anzeigen', duration: 60000, code: `const wert = fehlenderName + 1;
console.log(wert);` }],
]);
function fixture(id, appOrigin) {
  if (typeof id !== 'string' || !FIXTURES.has(id)) throw Error('Unbekanntes Testprogramm. Eigene Skripte sind noch nicht freigegeben.');
  const item = FIXTURES.get(id);
  const targets = [new URL('/api/health', appOrigin).href, 'https://example.invalid/js-pilot', 'file:///azubiprep-pilot-denied'];
  return { id, title: item.title, duration: item.duration, code: item.network ? `const TARGETS = ${JSON.stringify(targets)};\n${item.code}` : item.code };
}
function catalog(appOrigin) { return [...FIXTURES.keys()].map(id => fixture(id, appOrigin)); }
module.exports = { fixture, catalog };
