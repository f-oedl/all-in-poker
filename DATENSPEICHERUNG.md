# Gespeicherte Daten

Stand: 28. Oktober 2026. Beschreibung anhand des verfügbaren Website-Codes, kein Audit der Backendkonfiguration.

## Gemeinsame Daten: Supabase

Die App verwendet weiterhin das bestehende Projekt `okgvubkibtkgcofkdpsd`. Die Browser-Verbindung ist in `dist/assets/original.js` und im erzeugten `dist/assets/app.js` enthalten.

| Tabelle | Inhalte / Zweck |
| --- | --- |
| `poker_sessions` | Spielername, Datum, Buy-in inklusive Rebuys, Cash-out, Rebuy-Summe und -Anzahl; bei Live-Abenden zusätzlich Sessionname und Dauer. IDs identifizieren bearbeitbare Datensätze. |
| `poker_tournaments` | Turnier-ID, Name, Datum, Buy-in, Teilnehmer, Ergebnisse und Auszahlungen. |
| `live_session` | Aktuelle Session unter `id=current`, Metadaten mit Name, Datum, Startzeit, Buy-in und Spielern sowie Aktualisierungszeit. |
| `live_session_events` | Ereignisse wie Rebuys, Cash-outs, Rücknahmen und Zeitstempel. Nach Sessionabschluss löscht der Code diese Ereignisse. |
| `live_tournament` | Laufendes Turnier als Datenobjekt, Teilnehmer, Blindstruktur, Timer/Pausen, Ergebnisse, Synchronisierungskennung und Aktualisierungszeit. |
| `seating_history` | Sessiondatum und -name, Sitzordnung einschließlich Dealer-Zuordnung und Erstellungszeit. |

Die Tabelle beschreibt verwendete Daten, nicht das vollständige SQL-Schema. SQL-Definitionen, Migrationen, Row-Level-Security-Regeln und Backups des ursprünglichen Backends liegen nicht als Quelldateien vor.

### Fotos

Im Supabase-Storage-Bucket `poker-photos` liegen Spielerfotos unter `avatars/`, Abendfotos unter `nights/` und Turnierfotos unter `tournaments/`. Dateinamen werden aus Namen bzw. Zuordnungen abgeleitet. Der Code nutzt öffentliche Storage-URLs; tatsächliche Zugriffsrechte hängen von der Backendkonfiguration ab. Die App unterstützt Upload, Ersetzen und Löschen dieser Dateien.

## Lokale Daten im jeweiligen Browser

| Local-Storage-Schlüssel | Inhalt |
| --- | --- |
| `allin_my_player` | Gewählter Spielername, persönliches Profil und Überspringen der einmaligen Erstauswahl. |
| `allin_pinned_awards` | Je Spieler bis zu drei angeheftete Erfolge. |
| `poker_players` | Lokale Spielerliste, zusammengeführt mit Spielernamen aus gespeicherten Sessions. Ein neuer Name allein erzeugt noch keinen gemeinsamen Datenbankeintrag. |
| `poker_tab` | Auswahl des Navigationsbereichs aus der ursprünglichen App. |

Diese Werte gelten für die jeweilige Website-Adresse und den jeweiligen Browser. Andere Geräte, andere Browser, eine neue Domain, privates Surfen oder gelöschte Browserdaten können eine erneute Auswahl nötig machen.

Filter, offene Dialoge und Bearbeitungsfreigabe sind flüchtiger Zustand. Die Freigabe wird beim Neuladen zurückgesetzt.

## Berechnungen, Export und Teilen

Gewinn, Rankings, Kurven, Erfolgsfortschritte, Vergleiche, Monatsabrechnungen und Ausgleichsvorschläge werden aus Ergebnissen berechnet. Die neue Oberfläche legt dafür keine zusätzlichen Tabellen an. Ein CSV-Export erzeugt eine Datei auf dem Gerät. Beim Teilen einer Abrechnung wird die Teilen-Funktion des Geräts oder die Zwischenablage verwendet.

## Zugriff und Schutz

Die Profilauswahl ist keine Anmeldung und kein Identitätsnachweis. `preview-guard.js` blockiert standardmäßig schreibende Backendanfragen dieser geöffneten Website. Nach Freigabe betreffen Speichern, Löschen und Uploads dieselben echten Clubdaten wie die ursprüngliche Website. Diese Sperre verhindert versehentliche Bedienung, ist aber keine serverseitige Zugriffskontrolle. Tatsächlicher Schutz muss über Backendberechtigungen erfolgen. Diese wurden nicht verifiziert.

Die bestehenden öffentlichen Supabase-Clientparameter sind im Browser-Code enthalten; sie sind kein serverseitiger Administrationsschlüssel. Git-Zugangstoken und Hosting-Anmeldesitzungen sind nicht Teil dieses Exports. Die Zugriffsfreigabe der gehosteten Site liegt beim Hostingdienst und wird durch das ZIP nicht übernommen. Hosting- und Backenddienste können technische Protokolle führen; Umfang und Aufbewahrung lassen sich aus dem Website-Code nicht bestimmen. Die neue Oberfläche ergänzt kein eigenes Analytics-System.

## App / Offlinebetrieb

Die App ist eine installierbare Website (PWA). `dist/sw.js` legt keinen Offline-Datencache an. Internet ist für gemeinsame Daten und Änderungen nötig. Normales Browser-Caching statischer Dateien und Bilder ist davon unabhängig.

## Grenzen des ZIP-Exports

Enthalten sind alle verfügbaren Projektdateien: neue lesbare Oberfläche, gemeinsame Berechnungen, ursprüngliches gebündeltes JavaScript samt Bibliotheken und bisherigen Abläufen, Styles, Designbilder, Logos, Icons, PWA, Buildskript, Tests, Designarchiv und Hostingmanifest.

Nicht enthalten sind ein Export der Spiel-/Turnierdatensätze, eine Kopie aller Nutzerfotos aus Supabase, ursprüngliche ungebündelte React-Dateien, Datenbankschema/RLS-Definitionen und Hosting-Konten. Der Originalcode ist als Bundle vorhanden; seine ursprüngliche Projektstruktur liegt nicht vor.

Das ZIP ist der vollständige Export des verfügbaren Website-Projekts, kein vollständiges Backend-Backup. Für eine unabhängige Wiederherstellung werden zusätzlich Datenbank-/Storage-Export sowie Schema und Berechtigungen benötigt.
