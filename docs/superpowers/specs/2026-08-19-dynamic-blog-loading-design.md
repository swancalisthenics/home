# Design: Dynamisches Laden der Blog-Posts

Datum: 2026-08-19
Status: zur Review

## Kontext

Der Blog besteht aktuell aus `html/blog/blog.html` (Übersicht mit 15 fest
verdrahteten Karten) und 15 fast identischen Einzeldateien
`html/blog/blog-post-1.html` … `blog-post-15.html`. Post 4 ("XS Sports
Nutrition") ist unveröffentlicht (Karte in `blog.html` auskommentiert, Bild
`xs-partner.jpg` existiert nicht) und soll komplett entfernt werden.

Ziel dieser Änderung: den Blog von 15 statischen Einzeldateien auf ein
daten-/template-basiertes System umstellen, das sowohl die Übersicht als auch
die Einzel-Post-Ansicht aus einer gemeinsamen Datenquelle rendert — und dabei
Post 4 endgültig löschen.

## Entscheidungen (bereits mit Nutzer abgestimmt)

- **Umfang:** sowohl Übersicht (`blog.html`) als auch Einzel-Posts werden
  dynamisch gerendert (nicht nur eine Seite von beiden).
- **Speicherung der Inhalte:** ein reines JS-Datenarray (kein `fetch()` auf
  separate Dateien, kein JSON), damit die Seite auch ganz ohne Server per
  `file://`-Doppelklick funktioniert — `fetch()` würde dort an CORS scheitern.
- **Routing:** eine gemeinsame Template-Seite `blog-post.html` liest die
  Post-ID aus der Query-String (`?id=6`). Kein GitHub-Pages-404-Routing-Trick
  (zu viel Komplexität für den Nutzen), keine Redirect-Stub-Dateien für die
  alten Dateinamen. **Bewusst akzeptiert:** alte Direktlinks wie
  `blog-post-6.html` funktionieren danach nicht mehr.
- **IDs bleiben stabil:** die bisherigen Postnummern 1,2,3,5,6,…,15 werden
  beibehalten (Lücke bei 4), keine Neunummerierung.

## Betroffene Dateien

**Neu:**
- `lib/blog-posts-data.js` — `const BLOG_POSTS = [...]`, ein Objekt pro Post.
- `lib/blog.js` — Rendering- und Filter-Logik für Übersicht und Einzelseite.
- `html/blog/blog-post.html` — einzige Template-Seite für alle Posts.

**Gelöscht:**
- `html/blog/blog-post-1.html` … `blog-post-15.html` (alle 15; 14 werden zu
  Daten migriert, Post 4 wird ersatzlos entfernt).
- `images/blogs/xs1.jpeg` (Hero-Bild von Post 4, danach nirgends mehr
  referenziert).

**Geändert:**
- `html/blog/blog.html` — die 14 hartkodierten `<article class="blog-card">`-
  Blöcke weichen einem leeren `<div class="blog-grid" id="blogGrid"></div>`;
  neue `<script>`-Tags für `blog-posts-data.js` und `blog.js`; die
  auskommentierte Post-4-Karte wird ganz entfernt statt weiter auskommentiert
  zu bleiben.
- `lib/main.js` — der Blog-Filter-Block (aktuell der
  `DOMContentLoaded`-Listener am Dateiende, der `.filter-btn`/`.blog-card`
  verdrahtet) wird nach `lib/blog.js` verschoben. Begründung: Er ist
  ausschließlich für die Blog-Seite relevant und muss ohnehin *nach* dem
  dynamischen Rendern der Karten laufen, nicht beim initialen
  `DOMContentLoaded` (die Karten existieren zu dem Zeitpunkt noch nicht).
  `css/blog/blog-post-global.css` bleibt unverändert — die
  `--post-hero-img`-Custom-Property wird nur nicht mehr per Inline-HTML-Attribut,
  sondern per `element.style.setProperty(...)` aus `blog.js` gesetzt.

## Datenmodell

Ein Eintrag in `BLOG_POSTS` (Array von Objekten, `id` ist die stabile,
bisherige Postnummer):

```js
{
  id: 1,
  metaTitle: 'Die 5 wichtigsten Basics für Calisthenics-Anfänger | Blog', // <title> auf der Post-Seite
  title: 'Die 5 wichtigsten <span>Basics</span>',   // H1, darf Inline-HTML (<span>) enthalten wie bisher
  category: 'Übungen & Kraftaufbau',                 // Anzeigetext des Kategorie-Badges
  filterCategory: 'uebungen',                        // Wert für data-category / Filter-Buttons ('uebungen' | 'ernaehrung')
  date: '12. Juni 2026',
  author: 'Nicolas Brand',
  heroImage: '../../images/blogs/basics.jpeg',       // Pfad relativ zu html/blog/
  excerpt: 'Egal ob du den Muscle-Up oder die Human Flag lernen willst …', // Kartentext auf der Übersicht
  content: `
      <p>…</p>
      <blockquote>…</blockquote>
      …
  `,                                                  // vollständiger Post-Body als HTML-String (Template-Literal)
  ctaHeading: 'Hat dir dieser Beitrag geholfen?',
  ctaText: 'Komm vorbei zum Training und wir zeigen dir die richtige Technik!',
  ctaButton: 'Zum nächsten Training'                  // Button-Linktext; Ziel ist immer ../../index.html#times
}
```

Alle 14 verbleibenden Posts (Inhalt, Bilder, Daten, Kategorien, CTA-Texte)
werden 1:1 aus den bestehenden `blog-post-N.html`-Dateien übernommen — keine
inhaltlichen Änderungen, reine Formatmigration. Vor der Migration werden die
aktuellen Dateien nochmal frisch gelesen (nicht aus dem Gedächtnis
übertragen), um Abschreibfehler zu vermeiden.

## Rendering-Ablauf

**`blog.html`:**
1. `renderBlogGrid()` iteriert über `BLOG_POSTS`, baut pro Post eine
   `<article class="blog-card" data-category="...">`-Karte (gleiches Markup
   wie bisher, inkl. Klick-Navigation zu `blog-post.html?id=<id>`) und hängt
   sie in `#blogGrid` ein.
2. Direkt danach `initBlogFilters()` (verdrahtet `.filter-btn`-Klicks neu, da
   die Karten erst jetzt existieren).

**`blog-post.html`:**
1. `renderBlogPost()` liest `new URLSearchParams(location.search).get('id')`.
2. Sucht den passenden Eintrag in `BLOG_POSTS` (Vergleich als Zahl).
3. **Gefunden:** befüllt `document.title`, die Meta-Description, Kategorie,
   H1, Datum, Autor, setzt `--post-hero-img` auf dem Header-Element, schreibt
   `content` per `innerHTML` in den Content-Container, befüllt den
   Abschluss-CTA-Block.
4. **Nicht gefunden** (fehlende, ungültige oder gelöschte ID wie `4`): zeigt
   im Content-Bereich einen freundlichen Hinweis „Diesen Beitrag gibt es
   nicht (mehr)." mit Link zurück zu `blog.html`, Header/Hero bleibt im
   generischen Blog-Look (kein kaputtes Hero-Bild).

Beide Funktionen werden über eine einzige Bootstrap-Prüfung am Ende von
`blog.js` ausgelöst (`if (document.getElementById('blogGrid')) renderBlogGrid();
if (document.getElementById('postContent')) renderBlogPost();`) — beide Seiten
laden dieselbe `blog.js`, jede Seite nutzt nur die für sie passende Funktion.

## Bewusste Kompromisse / Nicht-Ziele

- **Sharing-Vorschau:** Social-Media-Crawler ohne JS-Ausführung sehen beim
  Teilen eines Post-Links nur den generischen Fallback-`<title>`/Meta-
  Description aus dem statischen HTML, nicht den tatsächlichen Post-Titel.
  Für dieses Projekt als unkritisch eingestuft.
- **Keine Backward-Compatibility** für alte Dateinamen-URLs — siehe oben.
- Keine Änderungen an CSS-Dateien, an der Navigation, an Team-/Kontakt-Seiten
  oder an sonstigen Teilen der Seite.

## Testing-Plan

Über einen lokalen Testserver (wie in der letzten Session, da
`python3`/`node`/`npx` auf dieser Maschine nicht verfügbar sind) per
`javascript_exec` verifizieren:
- Übersicht rendert genau 14 Karten (nicht 15, nicht 13).
- Kategorie-Filter (Alle/Ernährung/Übungen) funktioniert weiterhin korrekt.
- Mehrere Posts unterschiedlicher ID (niedrig, hoch, z. B. 1, 6, 15) laden
  über `blog-post.html?id=<n>` mit korrektem Titel/Bild/Inhalt/CTA.
- `blog-post.html?id=4` und `blog-post.html?id=99` zeigen die
  Nicht-gefunden-Meldung statt eines Fehlers oder leerer Seite.
- Keine 404s (insbesondere nicht mehr für `xs1.jpeg`), keine Konsolenfehler.
- `CLAUDE.md` wird im Anschluss aktualisiert (Struktur-Abschnitt, bekannte
  Probleme rund um Post 4 entfällt, neuer Abschnitt zur Blog-Architektur).
