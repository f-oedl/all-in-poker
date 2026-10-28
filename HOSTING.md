# All In – eigenes Hosting (ohne ChatGPT)

Die Daten liegen schon in eurer eigenen Supabase-Datenbank (`okgvubkibtkgcofkdpsd`), nicht bei ChatGPT.
Online gehen muss nur der Ordner `dist/`.

## GitHub Pages (gratis)

1. Auf github.com ein neues, leeres, öffentliches Repository `all-in-poker` anlegen (ohne README).
2. Dieses Projekt dorthin pushen: `git remote add origin https://github.com/f-oedl/all-in-poker.git` und `git push -u origin main`.
3. Im Repo: Settings → Pages → Source: „GitHub Actions“.
4. Nach ca. 1 Minute ist die Seite unter `https://f-oedl.github.io/all-in-poker/` online. Jeder weitere Push aktualisiert sie automatisch.

## Alternative: Netlify Drop (gratis, ohne Git)

1. https://app.netlify.com/drop öffnen und kostenlos anmelden.
2. Den Ordner `dist/` aus diesem Projekt auf die Seite ziehen.
3. Fertig – Netlify zeigt den Link (z. B. `xyz.netlify.app`). Unter
   „Site configuration → Change site name“ kannst du ihn z. B. in `all-in-poker.netlify.app` ändern.
4. Updates: im Netlify-Dashboard unter „Deploys“ den neuen `dist/`-Ordner wieder hineinziehen.

## Hinweise

- Die Schreibsperre „Geschützte Vorschau“ (`preview-guard.js`) ist entfernt: Speichern funktioniert direkt.
- Gratis-Supabase pausiert ein Projekt nach einer Woche ohne Nutzung; im Supabase-Dashboard mit „Restore“ wieder starten.
- 100 Profile sind für den Gratis-Plan kein Problem.
- Ein neu angelegter Spieler erscheint auf anderen Geräten erst, wenn für ihn ein Ergebnis gespeichert wurde.
- Die ChatGPT-Seite kannst du danach in ChatGPT löschen – die Daten bleiben in Supabase.
