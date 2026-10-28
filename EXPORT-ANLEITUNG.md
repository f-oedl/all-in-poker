# All In – vollständiger verfügbarer Website-Quellcode

Stand: 28. Oktober 2026. Veröffentlichter Quellstand: `1bc712dcd07303e546f782abb034f474efdd424f`. Für den Export wurden diese Anleitung, die Datenbeschreibung, ein optionales Paketmanifest und portable Icon-Skripte ergänzt.

## Lokal öffnen

ZIP entpacken, ein Terminal im Ordner `All-In-Quellcode` öffnen:

```sh
python3 -m http.server 8787 --directory dist
```

Dann `http://localhost:8787/` öffnen. Nicht per Doppelklick auf die HTML-Datei starten. Der fertige Ordner `dist/` braucht keinen Node-Build. Internet ist für Clubdaten nötig.

Die App ist noch mit eurer bestehenden produktiven Supabase-Datenbank verbunden. Bearbeitung ist standardmäßig gesperrt; ihre Freigabe aktiviert echte Änderungen.

## Projektdateien

- `src/club-app.js`: neue lesbare React-Oberfläche, Profile, Filter, Erststart und Eingabeformular.
- `dist/club-core.js`: Berechnungen und Eingabeprüfungen.
- `dist/club.css`, `dist/app-experience.css`: Styles.
- `dist/assets/original.js`: ursprüngliches App-Bundle mit bisherigen Funktionen und Bibliotheken. Der ursprüngliche ungebündelte React-Code liegt nicht vor.
- `dist/assets/app.js`: fertig erzeugter ausführbarer Website-Code.
- `build.py`: integriert die neue Oberfläche in das Original-Bundle; aktualisiert Ressourcen-Versionen in HTML.
- `dist/index.html`: Einstiegspunkt und Installationshilfe.
- `dist/manifest.webmanifest`, `dist/pwa.js`, `dist/sw.js`, `dist/icons/`: PWA und Installationsicons.
- `dist/assets/club-mark-source.png`: Logo ohne Schriftzug; `club-mark.png`: Webversion. Vorhandene frühere Logos sind ebenfalls enthalten.
- `scripts/`: optionale Icon-Erzeugung. Fertige Icons sind enthalten. Für Neuerzeugung `npm install` und `npm run icons` (benötigt Sharp).
- `tests/`: Prüfungen der Berechnungen, Erfolgsregeln und Vorschau-Sperre.
- `design-archive/`: frühere, aktuell nicht eingebundene Styles.
- `.openai/hosting.json`: bestehende Site-ID und statisches Verzeichnis, keine Zugangsdaten. Diese ID identifiziert die bestehende Site, kein neues Projekt.
- `DATENSPEICHERUNG.md`: Datenarten, Speicherorte, Zugriff und Exportgrenzen.

## Änderungen bauen und prüfen

Nach Änderungen an Oberfläche, CSS oder Kernberechnungen:

```sh
python3 build.py
node --check dist/assets/app.js
node tests/club-core.cjs
node tests/original-achievements.cjs
node tests/preview-guard.cjs
```

Python 3 wird für den Build benötigt, Node.js für die Prüfungen. Die normale Website kann direkt aus `dist/` gestartet werden.

## Anderes Hosting

Den gesamten Inhalt von `dist/` auf ein statisches HTTPS-Hosting hochladen. `index.html` ist die Startseite; die Assetpfade sind relativ. HTTPS ist für PWA-/Service-Worker-Funktionen erforderlich (localhost ist die Entwicklungsausnahme). Die Supabase-Verbindung bleibt bestehen. Eine Datenbank oder private Gruppenfreigabe wird durch diese Dateien nicht eingerichtet. Beim Domainwechsel werden lokale Browserpräferenzen nicht automatisch übertragen.

## Vollständigkeit

`DATEIEN-SHA256.json` enthält Prüfsummen aller Exportdateien außer sich selbst. Git-Historie, temporäre Dateien, Git-Zugangstoken und Hosting-Sitzungen sind ausgeschlossen. Nutzer-Datensätze und Nutzerfotos wurden nicht exportiert; das ZIP ist kein Backend-Backup. Siehe Datenbeschreibung.
