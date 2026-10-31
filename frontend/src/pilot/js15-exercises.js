// Public, fixed synthetic data and probes; executed only inside QuickJS.
const ageInputs15 = [0, 11, 12, 17, 18, 65].map(alter => ({ alter }));
export const JS15_EXERCISES = {
  'js15-texte': {
    inputs: [{ vorname: 'Mira', kurs: 'HTML' }, { vorname: 'Alex', kurs: 'JavaScript' }, { vorname: 'O\'Neil', kurs: 'CSS Layout' }],
    probe: 'begruessung === "Hallo " + vorname + "!" && kursLaenge === kurs.length && check(0,"string",begruessung) && check(1,"number",kursLaenge)',
  },
  'js15-vorlagen': {
    inputs: [{ minutenProTag: 20, tage: 5 }, { minutenProTag: 15, tage: 3 }, { minutenProTag: 30, tage: 1 }],
    probe: 'gesamtMinuten === minutenProTag * tage && planText === "Lernzeit: " + gesamtMinuten + " Minuten in " + tage + " Tagen." && check(0,"string",planText)',
  },
  'js15-textmethoden': {
    inputs: [{ themaRoh: '  HTML Lernen  ' }, { themaRoh: ' CSS Layout ' }, { themaRoh: '\tHtml & CSS\n' }, { themaRoh: '   ' }],
    probe: 'sauber === themaRoh.trim() && normalisiert === sauber.toLowerCase() && enthaeltHtml === normalisiert.includes("html") && check(0,"string",sauber) && check(1,"string",normalisiert) && check(2,"boolean",enthaeltHtml)',
  },
  'js15-vergleiche': {
    inputs: [17, 18, 20].map(alter => ({ alter, textAlter: String(alter) })),
    probe: 'check(0,"boolean",alter > 18) && check(1,"boolean",alter >= 18) && check(2,"boolean",alter < 18) && check(3,"boolean",alter <= 18) && check(4,"boolean",alter === 18) && check(5,"boolean",alter === textAlter) && check(6,"boolean",alter !== textAlter)',
  },
  'js15-entscheidung': {
    inputs: [{ alter: 17 }, { alter: 18 }, { alter: 65 }],
    probe: 'meldung === (alter >= 18 ? "Volljährig" : "Minderjährig") && check(0,"string",meldung)',
  },
  'js15-tarifstufen': {
    inputs: ageInputs15,
    probe: 'preis === (alter < 12 ? 4 : alter < 18 ? 6 : 10) && check(0,"number",preis)',
  },
  'js15-logik': {
    inputs: [
      { alter: 16, ticketVorhanden: true, gesperrt: false, azubi: true, schueler: false },
      { alter: 15, ticketVorhanden: true, gesperrt: false, azubi: false, schueler: true },
      { alter: 18, ticketVorhanden: false, gesperrt: false, azubi: false, schueler: false },
      { alter: 20, ticketVorhanden: true, gesperrt: true, azubi: true, schueler: true },
    ],
    probe: 'darfTeilnehmen === (alter >= 16 && ticketVorhanden && !gesperrt) && rabattBerechtigt === (azubi || schueler) && check(0,"boolean",darfTeilnehmen) && check(1,"boolean",rabattBerechtigt)',
  },
  'js15-umwandeln': {
    inputs: [{ betragText: '12.5', anzahl: 3, flagText: 'false' }, { betragText: '0', anzahl: 0, flagText: '' }, { betragText: ' 8 ', anzahl: 7, flagText: '0' }],
    probe: 'betrag === Number(betragText) && anzahlText === String(anzahl) && hatText === Boolean(flagText) && check(0,"number",betrag) && check(1,"string","number") && check(2,"string",anzahlText) && check(3,"boolean",hatText)',
  },
  'js15-eingaben': {
    inputs: [' 18 ', '0', '120', '', '   ', 'abc', '18abc', '2,5', '18.5', '-1', '121', 'Infinity', '0x10'].map(alterText => ({ alterText })),
    probe: '(() => { const text = alterText.trim(); const value = Number(text); const valid = text !== "" && Number.isFinite(value) && Number.isInteger(value) && value >= 0 && value <= 120; return eingabe === text && (alter === value || (Number.isNaN(alter) && Number.isNaN(value))) && gueltig === valid && rueckmeldung === (valid ? "Gültig" : "Bitte Alter prüfen") && check(0,"string",rueckmeldung); })()',
  },
  'js15-tarifprojekt': {
    inputs: [
      { alterText: '18', anzahlText: '3', azubi: true },
      { alterText: '18', anzahlText: '2', azubi: false },
      { alterText: '11', anzahlText: '2', azubi: true },
      { alterText: '12', anzahlText: '3', azubi: true },
      { alterText: '17', anzahlText: '2', azubi: false },
      { alterText: ' 0 ', anzahlText: '10', azubi: false },
      { alterText: '120', anzahlText: '1', azubi: true },
      { alterText: ' ', anzahlText: '2', azubi: false },
      { alterText: '121', anzahlText: '1', azubi: false },
      { alterText: 'abc', anzahlText: '1', azubi: true },
      { alterText: '18', anzahlText: '', azubi: false },
      { alterText: '18', anzahlText: '0', azubi: true },
      { alterText: '18', anzahlText: '11', azubi: true },
      { alterText: '18', anzahlText: '1.5', azubi: false },
      { alterText: '18.5', anzahlText: '2', azubi: false },
      { alterText: '-1', anzahlText: '1', azubi: false },
    ],
    probe: '(() => { const a = Number(alterText.trim()); const n = Number(anzahlText.trim()); const valid = alterText.trim() !== "" && anzahlText.trim() !== "" && Number.isFinite(a) && Number.isInteger(a) && a >= 0 && a <= 120 && Number.isFinite(n) && Number.isInteger(n) && n >= 1 && n <= 10; const price = valid ? (a < 12 ? 4 : a < 18 ? 6 : azubi ? 8 : 10) : null; const total = valid ? price * n : null; const message = valid ? "Gesamt: " + total + " Euro" : "Bitte Eingaben prüfen."; return preisProTicket === price && gesamtPreis === total && ausgabe === message && check(0,"string",message); })()',
  },
};
