# Testbericht – All In Poker Club

Stand: 28.10.2026. Getestet wurde in einer lokalen Testumgebung mit einer Kopie des Backups. Die echte Datenbank wurde nicht verändert, kein Schreibzugriff hat Supabase erreicht.

## Backup

`backups/2026-10-28_1420/` (nicht im Repository, weil das Repo öffentlich ist):

- `poker_sessions.json`: 687 Einträge, abgeglichen mit der Datenbank (687/687)
- `poker_tournaments.json`: 3, `seating_history.json`: 6; `live_session*`/`live_tournament`: leer
- `photos/`: 45 Fotos (14 Avatare, 25 Abende, 6 Turniere), 100 MB

Nicht im Backup, weil das nur mit dem Supabase-Admin-Zugang geht: Tabellen-Schema und Zugriffsregeln (RLS). Diese lassen sich im Supabase-Dashboard unter *Database → Backups* sichern.

## Testumgebung

```sh
python3 test/server.py
```

Dann `http://localhost:8790/` öffnen. Oben steht ein oranges Banner „TESTUMGEBUNG“. `test/mock-supabase.js` beantwortet alle Datenbank-, Foto- und Live-Sync-Aufrufe aus der Backup-Kopie im Browser. Mit `__mockDb.reset()` in der Browser-Konsole wird die Testumgebung auf den Backup-Stand zurückgesetzt.

## Geprüft und korrekt

| Bereich | Ergebnis |
| --- | --- |
| Profil-Kennzahlen (Madrasch, 15 Werte) | stimmen auf den Cent mit eigener Nachrechnung |
| Rangliste 2026, alle 42 Spieler | Gewinn, Runden, Siegquote identisch |
| Archiv: Buy-ins gesamt, je Abend, Tagessieger | identisch |
| Live-Session: Start, Rebuy, Cash-out, Beenden, Neuladen während der Session | korrekt gespeichert, Live-Daten danach aufgeräumt |
| Ergebnis nachtragen (Kommabeträge, Rebuy, Doppelt-Schutz) | korrekt |
| Eintrag bearbeiten / löschen / ganzen Abend löschen | nur die betroffenen Einträge geändert, Rest identisch mit Backup |
| Abrechnung pro Abend, Monatsabrechnung | Beträge stimmen, Summen gehen auf |
| Turnier: Start, Rebuy, Ausscheiden, Auszahlung 50/30/20, Speichern, Löschen | korrekt (nach Fix 3) |
| Spieler anlegen, umbenennen, Foto hochladen | korrekt (nach Fix 4 und 5) |
| CSV-Export | 687 Zeilen, Summen identisch |
| Automatische Prüfungen (`npm run check`) | alle bestanden |

## Gefundene und behobene Fehler

Alle Korrekturen stehen in `build.py`, damit sie bei jedem Neubau erhalten bleiben. Die Fehler 1 bis 5 stammen unverändert aus der alten Tracker-Seite.

1. **Rebuys/Cash-outs in der Live-Session doppelt gezählt.** Die App zählte ein Ereignis lokal und noch einmal, wenn es über die Live-Synchronisation zurückkam. Ob das im echten Betrieb auftritt, hängt davon ab, ob in Supabase „Realtime“ für `live_session_events` aktiv ist. Jetzt werden bereits bekannte Ereignisse ignoriert.
2. **Abrechnung um einen Cent daneben.** Bei Abenden, die nicht aufgehen, wurde die Differenz pro Person gerundet (z. B. Max zahlte 29,99 € statt 30,00 €). Jetzt wird auf exakte Cent verteilt.
3. **Turniersieger nicht gespeichert.** Wer mit einem verbliebenen Spieler auf „Beenden & Speichern“ drückte, speicherte das Turnier ohne Platz 1. Der Sieg und die Auszahlung fehlten dann in der Turnier-Rangliste. Jetzt bekommt der letzte Spieler automatisch Platz 1.
4. **Umbenennen unvollständig und ohne Schutz.** Turniere und Sitzordnungen behielten den alten Namen. Ein Umbenennen auf einen bestehenden Namen verschmolz zwei Spieler ohne Rückfrage. Jetzt wird alles umbenannt, und vor einem Zusammenführen kommt eine Rückfrage.
5. **Foto ging beim Umbenennen verloren** bei Namen mit Leerzeichen, Umlauten oder Klammern (z. B. „Niki Rötzer“, „Daniel (Benji)“).
6. **Bestätigungsfenster außerhalb des Bildschirms.** Im gescrollten Archiv („Eintrag löschen?“, „Turnier beenden?“ …) lagen die Abfragen oberhalb des sichtbaren Bereichs. Ursache war der Weichzeichner-Effekt des Hintergrunds. Behoben in `dist/app-experience.css`.

## Hinweise ohne Änderung

- **Neue Spieler gibt es zunächst nur auf dem Gerät, auf dem sie angelegt wurden.** Auf anderen Geräten erscheinen sie erst, wenn ein Ergebnis für sie gespeichert ist. Gemeinsame Profile ohne Ergebnis bräuchten eine zusätzliche Tabelle in Supabase (Admin-Zugang nötig).
- **90 von 107 Abenden gehen nicht genau auf** (Summe Cash-outs ≠ Buy-ins, meist Cent-Beträge, insgesamt +127,55 €). Das sind Eingabe- bzw. Zählfehler in den Daten, keine Rechenfehler der App.
- **Monatsabrechnung:** Geht ein Monat nicht auf, zahlt der letzte Verlierer in der Liste weniger. Die Abrechnung pro Abend verteilt die Differenz dagegen gleichmäßig. Das ist eine Regelfrage.
- **Schreibschutz:** Jeder mit dem Link kann Daten ändern und löschen (wie bei der alten Seite). Echter Schutz geht nur über Zugriffsregeln in Supabase.
- Nicht im Detail getestet: Sitzplatz-Auslosung, Abend-/Turnierfotos, TV-Modus, Diagramme in der Statistik.
