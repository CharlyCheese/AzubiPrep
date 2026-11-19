# Promises im Debugger

„HTML und Ereignisse“ → „Promisebeispiel laden“. Nach Start und „Weiter“
stehen Erfolg und Fehler zur Auswahl. Der Klick plant ein Ergebnis. Zuerst
läuft der synchrone Code, dann der Timer, anschließend die Promise-Handler.
Jeder eigene Handler hält mit „Promise-Fortsetzung“ vor seiner ersten Anweisung.
Mit „Weiter“ wird dieselbe Ausführung fortgesetzt.

`new Promise((resolve, reject) => { ... })` führt den Executor sofort aus.
`resolve` oder `reject` legt den Ausgang einmalig fest. `.then` verarbeitet
Ergebnisse; `.catch` behandelt Ablehnungen; `.finally` läuft bei beiden
Ausgängen. Eine Rückgabe aus `then` wird an die nächste Fortsetzung weitergegeben.
Zurückgegebene Promises werden übernommen. `finally` erhält keinen Ergebniswert
und verändert ihn bei normaler Rückkehr nicht; ein eigener Fehler kann ihn
dagegen durch eine Ablehnung ersetzen. `Promise.resolve` und `Promise.reject`
sind ebenfalls verfügbar. Die App verwendet native QuickJS-Promises.

Fortsetzungen laufen nach dem aktuellen synchronen Aufruf und vor dem nächsten
Timer oder Vorschauereignis. Während eines echten Debugger-Halts laufen weder
weitere Promise-Jobs noch Timer oder Klickhandler. Timerzeit bleibt eingefroren.
Der Compiler zeigt Originaldateien und eigene Aufrufe; interne Auflösejobs haben
keine erfundenen Lerncodepositionen.

Freigegeben sind ausschließlich die genannten Promise-Funktionen im DOM-Modus.
Eigene Thenables/Getter, Kombinatoren und Unterklassen sind noch nicht unterstützt.
Eingebaute Promise-Methoden werden direkt aufgerufen, Methodenaliase bleiben
gesperrt. Eigene gleichnamige Bindungen und Imports behalten ihre Bedeutung.
Eine nach leerer Microtaskqueue unbehandelte Ablehnung beendet diese Debugsitzung
mit Hinweis auf einen catch-Handler. Das ist die bewusste Fehlerbehandlung des
Lernwerkzeugs; sie ist kein Anspruch auf eine vollständige Browserkonsole.

Grenzen pro Sitzung: 128 Lern-Promises, 512 Promiseoperationen, 512 native Jobs
einschließlich Auflösejobs. Speicher-/Stack-/Zeit-/Protokollgrenzen bleiben
unverändert. Ressourcenfehler werden vor nativer Umwandlung in Ablehnungen
erkannt und bleiben endgültig, auch wenn Lerncode einen catch-Handler besitzt.
Stop/Quellwechsel/Navigation/Reload beenden sämtliche Arbeit. Es werden nur
Originalquellen gespeichert, keine Promise-Ergebnisse, Ablehnungen oder Handles.

Die fest verwendete Engine 0.32.0 benötigt für Jobpausen einen explizit
asynchronen Aufruf des nativen Jobexports. Der normale synchrone Wrapper und
dessen optimierte MaybeAsync-Fassung eignen sich dafür nicht. Der private
Adapter wartet vollständig, liest nach möglichem WASM-Wachstum eine frische
Speicheransicht und gibt Zeiger/Ergebnishandles frei. Native Promisezustände
werden über höchstens 128 eigene Handles im Worker passiv geprüft, ausschließlich
nach vollständiger Beendigung der Jobausführung. Keine Beobachterreaktionen
verändern die Queue. Handles gelangen nicht in Oberfläche, Sicherung oder KI.

Nachweise: acht Promiseprüfungen, bestehende Timer-/Fehlerregression und
unabhängige Engine-/Speicherwachstumsprobe; Details im
[FE-060-Brief](agent-briefs/FE-060-debugger-promises.md).
