# TypeScript im Quellcode-Debugger

FE-065 ergänzt die lokale strenge TypeScript-Prüfung für Modulprojekte.
„TypeScript-Beispiel laden“ zeigt einen Artikeltyp und eine importierte
Preisberechnung. Nach Start und Weiter erscheint `Tastatur 29.75`.
Ein Haltepunkt vor der Rückgabe in preise.ts zeigt netto und steuer.

## Ablauf und Grenzen

1. Eigene .ts-Dateien einzeln oder als Modulordner einlesen. Relative Imports
   verwenden vollständige Dateinamen. Typen mit `import type` importieren.
2. Vor jedem Lauf eines Projekts mit .ts-Dateien prüft der lokale Compiler alle
   TypeScript-Dateien streng. Importierte JavaScript-Dateien liefern
   Typinformationen, werden selbst aber nicht streng typgeprüft. Typfehler
   verhindern den Start der Ausführung.
3. Typanmerkungen, Interfaces/Aliase, Generics, Assertionen und ganze type-only
   Imports/Exports werden positionsgleich entfernt. Jede UTF-16-Position und
   jeder Zeilenumbruch bleibt erhalten. Angezeigt und exportiert wird Originalcode.
4. Laufzeit bleibt der dokumentierte JavaScript-Umfang. Klassen, Enums,
   Namespaces, Dekoratoren, gemischte Typ-/Wertimportlisten und Erasure mit
   veränderter JavaScript-Semantik werden ausdrücklich abgewiesen.

Die Prüfung nutzt ausschließlich Projektdateien und mitgelieferte Typdefinitionen
in einem virtuellen Dateisystem. Kein ts.sys-Dateizugriff, Paketnachladen oder
Netzwerkzugriff. Deklarationsdateien und private Ordner werden vor dem Lesen
ausgefiltert. Unterdrückungsdirektiven und externe Referenzdirektiven sind gesperrt.
Die vorhandenen Quellen-, Speicher-, Zeit- und Protokollgrenzen gelten unverändert.
Typprüfung ist keine Erweiterung der freigegebenen Laufzeit-APIs.

## Prüfstatus

Acht neue Browser-/Windows-Electronfälle und achtzehn Modulregressionsfälle:
26/26 ohne Wiederholung bestanden. Geprüft sind das echte Beispiel, Fehler vor
VM-Start, Originalquellen/Unicodepositionen, type-only Imports, klare Ablehnung
nicht unterstützter Syntax, Metadatenfilter sowie Sicherung und Desktop-Neustart.
Isolierte Vorprüfung: 34 Prüfgruppen und 140 native Vergleiche. Frischer
unabhängiger Review ergänzt elf Gruppen einschließlich semantischer Vergleiche
und aller Zeilenumbruchvarianten. Abschließender Reviewstatus im
[Brief](agent-briefs/FE-065-debugger-typescript.md).
