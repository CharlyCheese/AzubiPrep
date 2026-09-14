# Datenbanken & SQL (FIAE)

## 1. Relationale Modellierung
- **ER-Modell**: Entitäten, Attribute, Beziehungen mit Kardinalitäten (1:1, 1:n, n:m).
- **Primärschlüssel** identifiziert Zeilen eindeutig, **Fremdschlüssel** stellt referenzielle Integrität her.

## 2. Normalisierung
- **1. NF**: atomare Werte.
- **2. NF**: keine teilweise Abhängigkeit vom zusammengesetzten Schlüssel.
- **3. NF**: keine transitiven Abhängigkeiten (Nichtschlüsselattribut hängt nur vom Schlüssel ab).

## 3. SQL-Kategorien
- **DDL**: CREATE, ALTER, DROP.
- **DML**: SELECT, INSERT, UPDATE, DELETE.
- **DCL**: GRANT, REVOKE.

## 4. Wichtige SELECT-Bausteine
- `WHERE` filtert vor der Gruppierung, `HAVING` danach.
- `JOIN` (INNER/LEFT) verbindet Tabellen.
- Aggregatfunktionen: COUNT, SUM, AVG, MIN, MAX.

## 5. Transaktionen (ACID)
Atomicity, Consistency, Isolation, Durability – Garantien für konsistente Änderungen.
