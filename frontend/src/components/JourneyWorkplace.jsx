import { useId } from 'react';
import { DEVICES, TEST_DOCUMENT, checkWorkplace } from '../utils/journeyWorkplace.js';

export default function JourneyWorkplace({ value, disabled, completed = false, onAction }) {
  const result = checkWorkplace(value);
  const deviceDescriptionId = useId();
  const selectedDevice = DEVICES.find(device => device.id === value.device);
  const configure = (field, selected) => onAction({ type: 'configure', field, value: selected });
  const locked = disabled || completed;
  return <section className="journey-workplace" aria-label="Einrichtungsübung">
    <h3>Büroarbeitsplatz im Modell einrichten</h3>
    <p>Diese Übung bleibt in der App. Geräte, Benutzerkonto, Aktualisierung und Dateiablage sind Lernmodelle;
      an deinem echten PC wird nichts installiert oder umgestellt. Sie ersetzt keine Einrichtung echter Hardware unter Anleitung.</p>
    <p><strong>Auftrag:</strong> Ticketportal und Wissenssuche benötigen mindestens 16 GB RAM, 512 GB SSD,
      zwei digitale Bildschirmausgänge und zwei eingerichtete Bildschirme. Verwende den freigegebenen Browser,
      ein Standardkonto und die freigegebenen Systemupdates. Lege anschließend eine Testdatei im Arbeitsordner an und öffne sie wieder.</p>
    <fieldset disabled={locked} className="journey-workplace-fields">
      <legend>1. Ausstattung auswählen und vorbereiten</legend>
      <label>Gerätemodell<select value={value.device} aria-describedby={deviceDescriptionId} onChange={e => configure('device', e.target.value)}>
        <option value="">Bitte auswählen</option>{DEVICES.map(device => <option key={device.id} value={device.id}>{device.title}: {device.ram} GB RAM, {device.storage} GB SSD, {device.outputs === 1 ? '1 digitaler Ausgang' : `${device.outputs} digitale Ausgänge`}</option>)}
      </select></label>
      <p id={deviceDescriptionId}>{selectedDevice
        ? `${selectedDevice.title}: ${selectedDevice.ram} GB Arbeitsspeicher, ${selectedDevice.storage} GB SSD und ${selectedDevice.outputs === 1 ? 'ein digitaler Bildschirmausgang' : `${selectedDevice.outputs} digitale Bildschirmausgänge`}.`
        : 'Wähle ein Modell aus und vergleiche seine vollständigen Gerätedaten mit dem Auftrag.'}</p>
      <label>Browser<select value={value.software} onChange={e => configure('software', e.target.value)}><option value="">Bitte auswählen</option><option value="approved">Freigegebener Browser</option><option value="preview">Ungeprüfte Testversion</option></select></label>
      <label>Benutzerkonto<select value={value.account} onChange={e => configure('account', e.target.value)}><option value="">Bitte auswählen</option><option value="standard">Standardkonto</option><option value="admin">Administratorkonto</option></select></label>
      <label>Eingerichtete Bildschirme<select value={value.displays} onChange={e => configure('displays', e.target.value)}><option value="">Bitte auswählen</option><option value="1">Ein Bildschirm</option><option value="2">Zwei Bildschirme</option></select></label>
      <label className="journey-practice-check"><input type="checkbox" checked={value.updated} onChange={e => configure('updated', e.target.checked)} />Freigegebene Systemupdates im Modell anwenden</label>
    </fieldset>
    <h4>2. Dateiablage vorbereiten und testen</h4>
    <div className="journey-actions">
      <button type="button" className="btn btn-ghost" disabled={locked || value.folder} onClick={() => onAction({ type: 'create-folder' })}>Arbeitsordner erstellen</button>
      <button type="button" className="btn btn-ghost" disabled={locked || !value.folder || value.file} onClick={() => onAction({ type: 'create-file' })}>Testdatei anlegen</button>
      <button type="button" className="btn btn-ghost" disabled={locked || !value.file} onClick={() => onAction({ type: 'open-file' })}>Testdatei öffnen</button>
    </div>
    <p>{value.folder ? 'Modellordner „Arbeitsplatz“ vorhanden.' : 'Noch kein Arbeitsordner angelegt.'} {value.file && 'Testdatei „funktionstest.txt“ vorhanden.'}</p>
    {value.opened && <div className="journey-example"><h4>Geöffnete Testdatei</h4><p>{TEST_DOCUMENT}</p></div>}
    <h4>3. Funktionen prüfen und Übergabe vorbereiten</h4>
    <button type="button" className="btn btn-primary" disabled={locked} onClick={() => onAction({ type: 'check' })}>Funktionen prüfen</button>
    {value.checked && <div role="status" aria-label="Ergebnis der Einrichtungsübung" className={`alert ${result.passed ? 'alert-success' : 'alert-warning'}`}>
      <strong>{result.passed ? 'Die Modellprüfung ist bestanden.' : 'Hier musst du noch nacharbeiten.'}</strong>
      <ul>{result.checks.map(item => <li key={item.label}><strong>{item.label}: {item.passed ? 'erfüllt' : 'noch offen'}.</strong> {!item.passed && item.explanation}</li>)}</ul>
    </div>}
    {value.checked && result.passed && <div className="journey-example" role="region" aria-label="Übergabeprotokoll der Modellübung">
      <h4>Übergabeprotokoll</h4>
      <p>Gerät: {selectedDevice.title}. Freigegebener Browser, Standardkonto,
        Systemupdates und zwei Bildschirme eingerichtet. Testdatei im Arbeitsordner angelegt und wieder geöffnet.
        Alle sechs Modellprüfungen bestanden; im Modell sind keine offenen Fehler vorhanden.</p>
      <p>Einweisung: Ticketportal und Wissenssuche im freigegebenen Browser nutzen, mit dem Standardkonto arbeiten
        und Dateien im vereinbarten Arbeitsordner ablegen. Bei Änderungen die betroffenen Funktionen erneut prüfen.</p>
      <p>Vergleiche dieses Ergebnis mit dem Auftrag. Halte in deiner Reflexion fest, welche Wahl du korrigiert hast
        oder wie du beim nächsten Auftrag einen Fehler vermeiden würdest.</p>
    </div>}
    {completed && <p>Die Durchführung ist bestätigt. Dieser gespeicherte Übungsstand bleibt zum Nachlesen erhalten.</p>}
  </section>;
}
