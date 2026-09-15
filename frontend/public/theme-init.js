// Setzt das Theme (data-theme) und die Browser-Farbe vor dem ersten Paint.
// Bewusst als eigene Datei statt inline: die Content-Security-Policy erlaubt
// nur Skripte von der eigenen Origin (kein 'unsafe-inline').
(function () {
  try {
    var gespeichert = localStorage.getItem('azubiprep.theme');
    var dunkel = gespeichert
      ? gespeichert === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = dunkel ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    var meta = document.getElementById('theme-color-meta');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0b0f17' : '#f8fafc');
  } catch (e) {
    /* localStorage nicht verfuegbar */
  }
})();
