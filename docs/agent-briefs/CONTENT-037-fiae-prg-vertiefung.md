# Brief CONTENT-037: FIAE-PRG mit Code- und Datenstrukturaufgaben vertiefen

Status: done
Bereich: CONTENT
Angelegt: 2026-10-20

## Ziel

FIAE-PRG von 74 auf 98 Fragen erweitern. 24 zusätzliche Anwendungsfragen zu
Python-/Java-Semantik, Datenstrukturen, Algorithmen und Zustandsänderungen
ergänzen den stark definitionsorientierten Bestand. Modulzuordnung LF11a.

## Betroffene Dateien

- `content/questions/FIAE-PRG.csv`
- `docs/agent-briefs/CONTENT-037-fiae-prg-vertiefung.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Primärquellen

AGENTS.md, ORCHESTRATOR.md, CONTENT-008. Eigene Aufgaben und Codebeispiele,
keine übernommenen Prüfungsfragen, Recherche am 2026-10-20.

- [Python-Datenstrukturen](https://docs.python.org/3/tutorial/datastructures.html)
- [Python-Kopien](https://docs.python.org/3/library/copy.html)
- [Python-Standardargumente](https://docs.python.org/3/tutorial/controlflow.html#default-argument-values)
- [Python-Ausdrücke](https://docs.python.org/3/reference/expressions.html)
- [Python deque](https://docs.python.org/3/library/collections.html#collections.deque)
- [Python decimal](https://docs.python.org/3/library/decimal.html)
- [Java Object](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html)
- [Java Operators](https://docs.oracle.com/javase/tutorial/java/nutsandbolts/op2.html)
- [Java Exceptions](https://docs.oracle.com/javase/tutorial/essential/exceptions/)
- [Java Collections](https://docs.oracle.com/javase/tutorial/collections/)
- [NIST: Binary Search](https://xlinux.nist.gov/dads/HTML/binarySearch.html)
- [OpenDSA: Hashing](https://opendsa-server.cs.vt.edu/ODSA/StandaloneModules/20231208151338/html/HashIntro.html) und [Rekursion](https://opendsa-server.cs.vt.edu/ODSA/StandaloneModules/20231208151338/html/RecIntro.html)
- [JLS finally](https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.20.2), [Ganzzahldivision](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.17.2), [AtomicInteger](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/atomic/AtomicInteger.html)

## Umsetzung und Abnahme

- [x] 24 neue SC-Fragen FIAE-PRG-075 bis -098 im 14-Spalten-Schema.
- [x] 74 bestehende Zeilen unverändert, eindeutige IDs/Texte und vier verschiedene Optionen.
- [x] Codeausgaben/Arithmetik selbst nachgerechnet, Sprache und Annahmen explizit.
- [x] Keine bloßen Definitionsduplikate, plausible nahe Fehleralternativen.
- [x] Kein systematischer Längen-/Schablonen-Tell.
- [x] Vollständiger unabhängiger Fachreview mit Primärquellen ohne offene Findings.
- [x] Content-Validierung und Archivierungscheck grün.

## Ergebnis

24 neue SC-Fragen, FIAE-PRG jetzt 98. Vollständiger unabhängiger Review
am 2026-10-20 gegen die genannten Primärquellen: keine falsche Musterlösung
oder Sprachsemantik, keine uneindeutige Lösung, kein systematischer
Längen-/Meta-Tell. Alte 74 Datensätze samt Header unverändert, 14 Spalten,
eindeutige IDs/Texte und je vier verschiedene Optionen.

Vier Findings umgesetzt und vom Reviewer nachgelesen:

- 090 wiederholte zunächst die abstrakte Catch/Declare-Regel aus 022.
  Durch eine konkrete IOException-/Untertypen-throws-Auswahl ersetzt.
- 088 durch tatsächliche Rückgabewerte eines dynamischen Methodenaufrufs
  konkretisiert, statt zweier fernliegender Alternativen.
- 092: alphabetische Reihenfolge als Distraktor durch typische fehlerhafte
  Annahme zur manuellen Schließung der ersten Ressource ersetzt.
- 081: fernliegende tuple-/String-Alternativen durch nahe FIFO-/LIFO-
  Verwechslungen bei list/deque ersetzt. Nachreview: **BESTANDEN**,
  keine offenen Findings.

Ausgaben 075/076/078/079/080/094/097 zusätzlich mit lokalem Python 3.13
tatsächlich ausgeführt: [1,2,3], [[1,9],[2]], ([1,3],2), 2, get = 0
ohne Einfügen, -4 sowie sortierte Kopie bei unveränderter Ursprungsliste.
083 unabhängig n × n nachgerechnet. Java-Aussagen anhand Oracle/JLS
geprüft, keine lokale JVM-Ausführung behauptet.

ID-Quellen: 075–081 Python-Grundlagen/copy/deque; 082 NIST/bisect;
083 eigene Schleifenaufgabe; 084 OpenDSA Hashing; 085 OpenDSA Rekursion;
086–093 Oracle/JLS; 094 Python-Ausdrücke; 095 decimal; 096 AtomicInteger;
097 Python-Sortierung; 098 ArrayList/Iterator.

Gesamt nach CONTENT-033 bis -037: 2409 Fragen. Content-Validator ohne
Fehler, Archivierung und check-agent-briefs grün. Kein DB-Import, Build
oder Commit. Vorherige Änderungen erhalten, persönliche Freigabe nicht
vorweggenommen.
