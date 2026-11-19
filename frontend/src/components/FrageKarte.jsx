// Wiederverwendbare Anzeige einer Frage mit Antwortoptionen.
// Props: frage, auswahl (Array von Buchstaben), onToggle(letter), feedback (bool)

import { optionenListe, TYP_LABEL, buchstabeZuZiffer } from '../utils/fragen.js';

export default function FrageKarte({ frage, auswahl = [], onToggle, disabled = false, zeigeFeedback, korrektBuchstaben = [], optionen: optionenProp }) {
  // Gemischte Reihenfolge kann übergeben werden; sonst Originalreihenfolge.
  const optionen = optionenProp && optionenProp.length
    ? optionenProp.map((o) => ({ buchstabe: o.buchstabe, text: o.text }))
    : optionenListe(frage);

  function isSelected(letter) {
    return auswahl.includes(letter);
  }

  function cssClass(letter) {
    let cls = 'option-row';
    if (isSelected(letter)) cls += ' selected';
    if (zeigeFeedback) {
      if (korrektBuchstaben.includes(letter)) cls += ' correct';
      else if (isSelected(letter)) cls += ' wrong';
    }
    return cls;
  }

  if (frage.typ === 'FT') {
    return (
      <div className="card">
        <div className="flex-between wrap">
          <span className="text-muted small">Freitext – bitte stichwortartig beantworten</span>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-options" role="group" aria-label="Antwortmöglichkeiten">
      <div className="small text-muted mb-2">
        <span className="badge badge-neutral">{TYP_LABEL[frage.typ] || frage.typ}</span>
      </div>
      {optionen.map((opt) => (
        <button type="button"
          key={opt.buchstabe}
          className={cssClass(opt.buchstabe)}
          aria-pressed={isSelected(opt.buchstabe)}
          disabled={disabled || zeigeFeedback}
          onClick={() => onToggle?.(opt.buchstabe)}
        >
          <span className="option-letter">{buchstabeZuZiffer(opt.buchstabe)}</span>
          <span>{opt.text}</span>
        </button>
      ))}
    </div>
  );
}
