# Gestaltung und Bildmotiv

Die aktuelle Oberfläche ist als Club-App aufgebaut: feste untere Navigation, Player Pass, persönliches Profil mit drei Bereichen und sammelbare Auszeichnungen. Der manuelle Eintrag ist ein eigener geführter Ablauf. Frühere Gestaltungsstudien liegen in `design-archive`.

## Bildmotiv

Das Poker-Motiv ist ein generisches, KI-generiertes Studiomotiv und kein Foto eurer Pokerrunde.

- Werkzeug: eingebautes Imagegen-Tool (kein API-/CLI-Fallback).
- Gespeicherte Projektdatei: `/Users/f.oedl/Documents/ChatGPT/Ideas/tracker-redesign/dist/assets/poker-lobby.png`.
- Verwendung: Atmosphäre im kompakten Session-Einstieg; Zahlen und Bedienung sind echte App-Elemente.

Verwendeter Prompt:

> Use case: product-mockup. Asset type: full-bleed photographic background for an exclusive private poker club app. Create one extremely premium cinematic studio photograph, wide landscape 3:2 composition, no text anywhere, no logos. Deep ink-black poker table with graphite suede texture, brushed chrome and cobalt blue poker chips arranged in a few beautifully tactile uneven stacks, two real crisp ivory playing cards (ace of spades and king of clubs) overlapping naturally, thin blue edge light and warm white spotlight. Shot very close at table level with a slight elevated angle, shallow depth of field, sophisticated luxury editorial product campaign, physically believable materials and subtle grain. All card and chip objects concentrated in the RIGHT two thirds; LEFT third is dark uninterrupted negative space for real UI typography. Background fades to almost black. Restrained color palette black, graphite, platinum silver, midnight blue and ivory. No green, no gold, no people, no hands, no casinos, no neon signs, no UI, no lettering, no watermarks.


## Standalone club mark
Generated with the built-in image tool, then resized for web and install icons. Source: `dist/assets/club-mark-source.png`. Prompt: Extract only the dark navy geometric A monogram with spade negative space from the approved concept; preserve silhouette, transparent background, no text, no duplicate marks or containers. Header uses the transparent mark; install icons use a light solid background with maskable safe padding.

## Mobile evening filters
Bottom sheet combines year, month, date range, player participation and sort order. Summaries and CSV use the complete matching evenings, retaining every participant. No backend mutations. Browser checks at 390×844 covered combined player/month/oldest ordering, date input, empty month and resetting to the current year.

## Ladebildschirm und Handy-Animationen
`loader.css`/`loader.js`: Startbildschirm mit zwei Chip-Stapeln, die sich ineinander mischen und wieder teilen. Er erscheint direkt mit dem HTML, bleibt mindestens eine Mischrunde (1,1 s) sichtbar und blendet aus, sobald Inhalt, Willkommensseite oder Fehleransicht da ist (spätestens nach 15 s).
`mobile.css`/`mobile.js` (bis 767 px): gestaffelter Aufbau jeder Seite, Listen-Kaskade, Antipp-Feedback, Glas-Kopfzeile beim Scrollen, Fenster gleiten von unten hoch, Navigations-Icon hüpft, Installationshinweis als wegklickbare Pille über der Navigation. Animationen behalten danach keinen `transform`, damit feste Dialoge im Bild bleiben. „Bewegung reduzieren“ schaltet alles ab.
