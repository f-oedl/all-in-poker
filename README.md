# All In — Club-App

Geschützte Vorschau der neu strukturierten Website und installierbaren Web-App. Stand: 28.10.2026.

## Start

`python3 -m http.server 8787 --directory dist`

Der Standardzeitraum ist immer das aktuelle Kalenderjahr des Geräts. Frühere Jahre und alle Jahre sind ausdrücklich auswählbar. Desktop und Smartphones verwenden eine feste Navigation am unteren Bildschirmrand.

## Neue App-Bereiche

- Club: Player Pass mit Ergebnisverlauf, Session-Start, Saison-Podium und letzte Spielabende.
- Crew: Profile, Suche und Sortierung.
- Profile: Übersicht, Vitrine, Erfolgssammlung mit offenen/freigeschalteten Badges, Fortschritte und Spielhistorie.
- Ich: Spieler auf diesem Gerät auswählen. Das ist eine persönliche Anzeigepräferenz, keine Authentifizierung und kein Eigentumsnachweis.
- Bis zu drei freigeschaltete Erfolge im eigenen Profil anheften. Diese Auswahl bleibt lokal auf diesem Gerät.
- Direktvergleich gemeinsamer Abende und CSV-Export im Archiv.
- Vier zusätzliche Meilensteine: 50 Runden, 100 Runden, 50 Gewinnrunden, sechs gespielte Kalendermonate.
- Alte Achievement-Regeln werden weiterverwendet. Die ursprünglichen Sammler-Erfolge behalten ihre ursprüngliche Berechnungsbasis.
- Animierte Übergänge, Zähler, Gewinnkurven, Fortschritte und Medaillen. Reduzierte Bewegung wird berücksichtigt.

Die bisherigen Live-Sessions, Abrechnung, Galerie, Monatswertung, Statistiken, Turniere, Awards und Spieler-/Avatar-Verwaltung bleiben über die App erreichbar.

## Daten und Schutz

Die App liest dieselbe bestehende Supabase-Datenbank und dieselben Bilder wie das Original. Keine Migration, keine neue Datenbank und keine Änderung der Datenstruktur. Es wurden keine vorhandenen Clubdaten verändert.

preview-guard.js blockiert standardmäßig schreibende Backend-Anfragen. Erst nach ausdrücklicher Freigabe können echte Änderungen stattfinden. Neuladen setzt den Schutz zurück. Dies ist ein Bedienungsschutz der Vorschau, keine serverseitige Zugriffskontrolle. Bestehende Backend-Berechtigungen und die ursprüngliche Website werden dadurch nicht abgesichert.

Der neue manuelle Eintrag verwendet die bisherigen Datenfelder, prüft Beträge in exakten Cent und verhindert doppelte Spieler-/Datums-Einträge. Berechnete Auszeichnungen verändern keine Datenbankeinträge.

## Smartphone-App

Manifest, App-Icons, Standalone-Modus, Installationshilfe und Service Worker sind enthalten. iPhone: Safari → Teilen → Zum Home-Bildschirm. Android: Chrome → App installieren. Internet ist für Clubdaten und Änderungen erforderlich. Der Service Worker speichert keine privaten Datensätze.

Eine Installation und vollständige Live-Session auf echten iPhone-/Android-Geräten wurde noch nicht verifiziert. Vor dem produktiven Gruppenbetrieb fehlen vollständige Schreibtests in einer separaten Testumgebung und eine Prüfung der Backend-Berechtigungen. Keine Garantie auf Fehlerfreiheit.

## Weiterentwicklung und Prüfung

`python3 build.py` erzeugt die App aus dem abgerufenen ursprünglichen App-Bundle und `src/club-app.js`. Die Geschäftsabläufe bleiben im ursprünglichen Bundle; die neue Oberfläche und lokale Funktionen sind separat lesbar. Ressourcen werden in der HTML-Datei mit Inhaltsversionen referenziert, damit Browser keine gemischten Revisionen laden.

Prüfungen:

- `node --check dist/assets/app.js`
- `node tests/club-core.cjs`
- `node tests/original-achievements.cjs`
- `node tests/preview-guard.cjs`

Geprüft werden Beträge, Statistiken, gemeinsame Runden, Serien, Meilensteine, Original-Achievement-Regeln, CSV, doppelte Einträge und blockierte Schreibanfragen. Browserprüfung von Navigation, Profilen, Filtern und responsiver Darstellung. Keine produktiven Schreibtests.
