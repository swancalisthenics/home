# home (Swan Calisthenics)

## Überblick

Statische Website ohne Framework — reines HTML5/CSS3/Vanilla-JS, gehostet über
GitHub Pages (`https://swancalisthenics.github.io/home/`). Kein Build-Schritt,
kein npm/package.json, keine Bundler. Website für die Swan-Calisthenics-
Trainingscommunity in Horgen; laut `README.md` ein Schulprojekt (M293 TBZ).

Es existiert bereits `GEMINI.md`, ein von einer KI geschriebenes Begleitdokument
mit ähnlichem Zweck wie diese Datei. `GEMINI.md` enthält an mehreren Stellen
veraltete Angaben (falscher Dateibaum, referenziert nicht mehr existierende
Dateien wie `post-basics.html`/`support.html`) — diese Datei hier (`CLAUDE.md`)
ist der aktuelle Stand; `GEMINI.md` wurde nur beim offensichtlich toten Blog-Link
korrigiert, sonst bewusst nicht überarbeitet (siehe „Bekannte Probleme" unten).

## Struktur

```
home/
├── index.html                  Startseite: Hero, Über uns, Team-Teaser, Zeiten,
│                                Level-Guide, Standort, FAQ-Accordion
├── README.md                   Ursprüngliches, schulisches README (Anforderungen/TODO)
├── GEMINI.md                   KI-Begleitdoku (teils veraltet, siehe oben)
├── css/
│   ├── global.css              Variablen (:root), Navigation, Footer, Buttons, Google-Fonts @font-face
│   ├── index.css                Startseite
│   ├── contact-person-shared.css  Gemeinsame Kontaktkarten-/Telefon-Email-Modal-Styles
│   ├── team.css                 Nur noch team-spezifische Ergänzungen (siehe oben)
│   ├── kontakt.css              Nur noch kontakt-spezifische Ergänzungen (Formular etc.)
│   ├── datenschutz_impressum.css
│   └── blog/
│       ├── blog.css              Blog-Übersicht (Grid-Layout, Filter-Buttons)
│       └── blog-post-global.css  Gemeinsames Layout aller Post-Detailseiten,
│                                  inkl. `.post-header` mit `var(--post-hero-img)`
├── html/
│   ├── team.html                Team-/Vorstand-Übersicht
│   ├── kontakt.html             Kontaktformular + Ansprechperson
│   ├── datenschutz_impressum.html
│   └── blog/
│       ├── blog.html             Blog-Übersicht — Karten werden per JS aus BLOG_POSTS gerendert
│       └── blog-post.html        Einzige Template-Seite für alle Posts, liest `?id=` aus der URL
├── lib/
│   ├── main.js                   Mobil-Menü, Scroll-Spy, FAQ-Accordion,
│   │                              Telefon-/Email-Dialogmodal, `switchPage()` (Altlast, siehe unten),
│   │                              `resolvePictureSources()` für responsive Bilder (siehe unten)
│   ├── blog-posts-data.js        Inhaltsquelle: BLOG_POSTS-Array, ein Objekt pro Post
│   └── blog.js                   Rendert Übersicht (`renderBlogGrid`) und Einzel-Post
│                                  (`renderBlogPost`) aus BLOG_POSTS, inkl. Kategorie-Filter
├── images/                      inkl. images/blogs/ (Artikel-Bilder) und images/icons/ (FontAwesome-SVGs)
├── favicon/
└── fonts/                       Lokal gehostete Google Fonts (Inter, Libre Baskerville)
```

**Bildgrößen:** Alle aktuell verwendeten Fotos wurden auf max. 1920 px
Kantenlänge verkleinert und als JPEG (Qualität 85) neu gespeichert (~54 MB
eingespart, größter Einzelfall: `nicolas.png` 25 MB → `nicolas.jpg` 0.5 MB —
war als Foto verlustfrei in PNG gespeichert, das war der eigentliche Grund
für die Größe, daher direkt zu `.jpg` konvertiert statt nur verkleinert).
Neue Fotos bitte vor dem Einchecken auf ähnliche Größenordnung bringen, sonst
wächst das Repo wieder unnötig. `logo.png`, die SVG-Icons und die bereits
unreferenzierten Dateien (siehe „Bekannte Probleme") wurden bewusst nicht
angefasst.

**Responsive Bilder (Mobil lädt kleinere Dateien):** Für alle größeren Fotos
(Blog-Karten, Blog-Post-Hero-Bilder, Bilder im Artikeltext, Team-Foto auf der
Startseite) gibt es zusätzlich eine `-small`-Variante (max. 900 px, Qualität
80), z. B. `basics.jpeg` + `basics-small.jpeg`. Avatare/Logo/Icons blieben
unangetastet — die waren nach der obigen Optimierung schon klein genug.

- **Hintergrundbilder** (`.blog-hero`, `.post-header`) wechseln rein per CSS
  über den bestehenden `@media (max-width: 767px)`-Breakpoint auf die kleine
  Variante — funktioniert zuverlässig, keine Besonderheiten.
- **`<img>`-Elemente** (Karten, Team-Foto, Bilder im Artikeltext) nutzen
  `<picture><source media="(max-width: 767px)" srcset="...-small...">
  <img src="..." data-large="...">`. Die native Browser-Bildauswahl für
  `<picture>` erwies sich beim Testen als unzuverlässig, sobald das Element
  dynamisch per `innerHTML` eingefügt wird (betrifft die Blog-Karten und alle
  Post-Inhalte) — der Browser schrieb dabei teils schon das `src`-Attribut
  selbst auf die falsche Variante um, bevor eigenes JS überhaupt lief. Deshalb
  übernimmt `resolvePictureSources()` in `lib/main.js` die Auswahl komplett
  selbst: es setzt `img.src` explizit anhand von `window.innerWidth`, wobei
  `data-large` (ein Attribut, das der Browser nicht kennt und daher nicht
  anfasst) zuverlässig die große Variante bereithält. Die Funktion läuft
  direkt beim Laden von `main.js`, nochmal bei `window.onload`, nochmal 300ms
  verzögert und bei jedem `resize` — die Mehrfachausführung ist bewusst so:
  in Tests reichte ein einzelner Aufruf teils nicht, weil `window.innerWidth`
  unmittelbar beim ersten Skriptdurchlauf nicht überall schon den finalen Wert
  lieferte. `blog.js` ruft `resolvePictureSources()` zusätzlich explizit nach
  jedem dynamischen Rendern auf (`renderBlogGrid`/`renderBlogPost`).

## Bekannte Probleme (bewusst nicht angefasst — bei Gelegenheit klären, nicht eigenmächtig ändern)

1. **Erwogen, aber bewusst nicht umgesetzt:** `team.html`, `kontakt.html` und
   `datenschutz_impressum.html` analog zu `html/blog/` in einen eigenen
   `html/pages/`-Unterordner verschieben. Hätte ~20 Dateien mit
   tiefenabhängigen Pfadanpassungen (`../` vs. `../../`) betroffen — für eine
   live gehostete Seite mit nur 3 betroffenen Dateien ein ungünstiges
   Risiko/Nutzen-Verhältnis für einen rein organisatorischen Umbau. Kann bei
   Bedarf als eigener, separat verifizierter Schritt nachgeholt werden.
2. **Vermutlich nicht mehr referenzierte Bilddateien** (per Grep in dieser
   Session verifiziert, nicht nur vermutet): `images/comingSoon.png`,
   `images/nicolas.alt.png`, `images/test3.png`, `images/team.jpg`,
   `images/blogs/handstand1.jpeg`, `images/blogs/jedes-alter.jpeg`,
   `images/blogs/xs.jpeg`, sowie die unkomprimierte `images/blogs/5.7.2026.JPG`
   (nur die `-klein`-Variante wird eingebunden). Nicht gelöscht, da
   Bild-Aufräumen explizit außerhalb des Scopes dieser Session war.
3. **`switchPage('blog')`/`switchPage('legal')` in `lib/main.js` sind
   unreachable.** Kein einziger Aufruf im gesamten Code übergibt diese Werte —
   die Blog-/Team-/Kontakt-Navigation läuft inzwischen über echte
   Mehrseiten-Links statt über eine SPA-Umschaltung. Die zugehörigen
   Ziel-Elemente existieren nur fragmentarisch (`#legal-page` nur in
   `datenschutz_impressum.html`, ohne die `.page`-Klasse, die die Funktion
   erwartet; `#blog-page`/`#blog-menu-item` existieren gar nicht mehr). Die
   Zweige wurden in dieser Session nur defensiv gegen Null-Referenzen
   abgesichert (verhindert `TypeError`), aber bewusst **nicht entfernt** —
   der Kommentar direkt über der Funktion (`// SPA-Seitenwechsel (Home <->
   Blog <-> Legal)`) beschreibt eine dreiteilige Umschaltung, und Kommentare
   wurden in dieser Aufräum-Session grundsätzlich nicht angetastet. Eine
   echte Bereinigung (ganz entfernen, oder zu einer tatsächlichen
   SPA-Navigation ausbauen) steht noch aus und sollte erst nach Rücksprache
   entschieden werden.
4. **Kosmetischer Rest derselben SPA-Vergangenheit:** Auf `index.html` markiert
   `switchPage('home')` nach Klick auf „Über uns"/„Zeiten"/„Standort" kurz den
   Nav-Punkt „Home" statt des tatsächlich angeklickten — wird vom Scroll-Spy
   (`handleScroll` in `main.js`) fast sofort wieder korrigiert, daher optisch
   kaum wahrnehmbar.
5. **Duplizierte CSS-Regel** `.contact-person-links a { ... }` (zwei
   aufeinanderfolgende Blöcke mit identischem Selektor, der zweite überschreibt
   den ersten) wurde unverändert nach `css/contact-person-shared.css`
   übernommen — unklar, ob absichtliche Override-Kaskade oder Copy-Paste-Rest;
   nicht bereinigt, um keine visuelle Regression zu riskieren.
6. **Kommentar-Duplikat** `<!-- SUPPORT CONTENT -->` (zweimal hintereinander)
   in `html/kontakt.html` wurde nicht entfernt, da es sich um einen Kommentar
   handelt und diese in dieser Session bewusst nicht verändert wurden. (Die
   früher hier ebenfalls erwähnten auskommentierten Blog-Karten in
   `html/blog/blog.html` gibt es nicht mehr — die Übersicht rendert ihre
   Karten inzwischen komplett dynamisch, siehe „Dynamisches Blog-System"
   unten.)

## Code-Stil (aus bestehendem Code abgeleitet — bitte beibehalten)

- **4-Leerzeichen-Einrückung** durchgängig in HTML/CSS/JS (die Posts 11–15
  nutzten abweichend 2 Leerzeichen und wurden in dieser Session auf 4
  vereinheitlicht).
- **Einfache Anführungszeichen** in `main.js` (der Blog-Filter-Block nutzte
  abweichend doppelte und wurde in dieser Session vereinheitlicht).
- Deutsche Kommentare, grobe HTML-Abschnitte per
  `<!-- GROSSBUCHSTABEN-LABEL -->` markiert (`<!-- NAVIGATION -->`,
  `<!-- POST HEADER -->`, `<!-- FOOTER -->`, `<!-- BACK TO TOP BUTTON -->`) —
  bei neuen Seiten/Posts beibehalten.
- CSS-Variablen (`--bg-dark`, `--accent-red`, `--border-glass` etc.) zentral
  in `:root` in `global.css` — neue Farben/Werte dort ergänzen, nicht
  hartkodieren.
- Inline `style="..."`-Attribute für Einzelfall-Anpassungen sind im
  bestehenden Code etabliert (kein Anti-Pattern in diesem Projekt) — wurde in
  dieser Session auch für die neue `--post-hero-img`-Custom-Property auf
  `<header class="post-header" style="--post-hero-img: url('...')">` genutzt.
- Jede Blog-Post-Seite folgt exakt derselben Grundstruktur (Navigation →
  Post-Header → Post-Content → Footer → Back-to-Top) — beim Hinzufügen eines
  neuen Posts eine bestehende Datei als Vorlage kopieren, nicht neu aufbauen.

## In dieser Session durchgeführtes Aufräumen

- **Zwei Absturz-Bugs in `lib/main.js` behoben** (beide lösten bei jedem
  Klick einen `TypeError` aus, da das Ziel-Element nie existierte):
  Mobil-Menü-Icon-Toggle suchte per `querySelector('i')` nach einem
  FontAwesome-Icon, das Markup nutzt aber überall ein `<img>` statt eines
  `<i>`-Tags; `switchPage('home')` griff auf `#home-page` und
  `[href="#home"]` zu, die auf allen Unterseiten (Team/Kontakt/Impressum/alle
  Blog-Posts) gar nicht existieren. Beide Stellen sind jetzt gegen fehlende
  Elemente abgesichert statt ungeprüft zuzugreifen.
- Anführungszeichen im Blog-Filter-Teil von `main.js` von doppelt auf einfach
  vereinheitlicht (Rest der Datei nutzte durchgängig einfache).
- Toten CSS-Code entfernt: `.page`/`.page.active-page`/`.blog-placeholder` in
  `css/blog/blog.css` — nirgends mehr wirksam, da keine Seite, die diese
  Klassen setzt, `blog.css` lädt (siehe „Bekannte Probleme" Punkt 3 zum
  zugehörigen, bewusst nicht entfernten JS).
- Falschen Alt-Text `alt="Standort"` auf dem Mobil-Menü-Hamburger-Icon (Icon
  ist `bars-solid-full.svg`, hat mit Standort nichts zu tun — Copy-Paste-Rest)
  auf `alt="Menü"` korrigiert, in 7 betroffenen Dateien.
- Kaputte Bildreferenz `images/blogs/wrist-mobility.jpg` (Datei existiert
  nicht) aus `blog-post-5.html` entfernt — der zugehörige Platzhalter-Kommentar
  bleibt stehen, echtes Bild kann später ergänzt werden.
- Toten Link `.../html/blog.html` (fehlte ein Verzeichnis-Level) auf
  `.../html/blog/blog.html` korrigiert in `README.md` und `GEMINI.md`.
- **15 fast identische `css/blog/blog-post-N.css`-Dateien** (jede nur eine
  einzige `.post-header`-Regel, die sich ausschließlich im Bild-URL
  unterschied) zusammengeführt: Die gemeinsame Regel liegt jetzt einmalig in
  `css/blog/blog-post-global.css` und nutzt die CSS-Custom-Property
  `--post-hero-img`, die jede `blog-post-N.html` per Inline-Style auf ihrem
  `<header class="post-header">` setzt. Die 15 Einzeldateien und ihre
  `<link>`-Tags wurden entfernt.
- **`css/team.css` und `css/kontakt.css` dedupliziert:** Die zu über 90 %
  identischen Kontaktkarten-/Telefon-Email-Modal-Regeln liegen jetzt einmalig
  in `css/contact-person-shared.css` (vor `team.css`/`kontakt.css` verlinkt);
  die beiden Original-Dateien enthalten nur noch ihre jeweils einzigartigen
  Ergänzungen.
- Einrückung der Posts 11–15 von 2 auf 4 Leerzeichen vereinheitlicht (Rest des
  Projekts nutzt durchgängig 4).
- **Kommentare wurden bei alldem bewusst nicht verändert** — auch nicht dort,
  wo ein Kommentar durch eine Code-Änderung leicht ungenau wurde (siehe
  „Bekannte Probleme" Punkt 3).
- **Verifiziert per lokalem Testserver** (PowerShell-`HttpListener`, da
  `python3`/`node`/`npx` auf dieser Maschine nicht verfügbar waren): Beide
  vormals abstürzenden Klick-Handler wurden per `javascript_exec` direkt
  ausgelöst und werfen keinen Fehler mehr; das neue
  `--post-hero-img`-Custom-Property löst korrekt zum richtigen Bild auf;
  `css/contact-person-shared.css` liefert auf `team.html` und `kontakt.html`
  200 OK und die erwarteten Styles kommen an; keine 404s auf den geprüften
  Seiten.

## Dynamisches Blog-System (Post 4 gelöscht)

Der Blog wurde von 15 statischen Einzeldateien auf ein daten-/template-
basiertes System umgestellt; siehe
`docs/superpowers/specs/2026-08-19-dynamic-blog-loading-design.md` für das
vollständige Design und `docs/superpowers/plans/2026-08-19-dynamic-blog-loading.md`
für den Umsetzungsplan.

- **`lib/blog-posts-data.js`** ist die einzige Inhaltsquelle: ein Array
  `BLOG_POSTS`, ein Objekt pro Post. Jedes Objekt trägt getrennte Felder für
  die Übersichtskarte (`cardTitle`, `cardCategory`, `cardDate`, `cardImage`,
  `excerpt`, `filterCategory`) und für die Post-Seite selbst (`title`,
  `metaTitle`, `category`, `date`, `heroImage`, `content`, `ctaHeading`,
  `ctaText`, `ctaButton`) — diese Trennung ist bewusst und nötig, da Karte und
  Post-Seite unterschiedliche Anrisstexte/Bilder brauchen können. Beim
  Migrieren der alten Dateien stellte sich heraus, dass Karte und Post-Seite
  bei mehreren Posts (3, 5, 6, 7, 8) unterschiedliche Datums- oder Bildwerte
  hatten — ursprünglich 1:1 übernommen, in einer späteren Session aber
  bereinigt: `cardDate`/`date` zeigen jetzt je Post denselben Wert, und
  Post 8 nutzt auf der Post-Seite (`heroImage`/`heroImageSmall`) dasselbe
  Handstand-Foto wie die Übersichtskarte statt eines unpassenden Park-Bilds.
- **`lib/blog.js`** rendert daraus beide Seiten: `renderBlogGrid()` befüllt
  `#blogGrid` auf `html/blog/blog.html`, `renderBlogPost()` befüllt
  `html/blog/blog-post.html` anhand der `?id=`-Query-Parameter. Beide
  Funktionen prüfen selbst per `getElementById`, ob ihre Zielseite gerade
  geladen ist. `initBlogFilters()` (vormals in `main.js`, siehe oben) läuft
  nach jedem Grid-Render neu, da die Karten erst zur Laufzeit entstehen.
  Existiert keine passende ID zu `?id=`, zeigt die Seite einen Hinweis „Diesen
  Beitrag gibt es nicht (mehr)." statt eines Fehlers.
- **Neuen Post anlegen:** kein neues HTML-File mehr nötig — einfach ein neues
  Objekt zu `BLOG_POSTS` in `lib/blog-posts-data.js` hinzufügen (IDs sind
  bisher 1,2,3,5–15, aufsteigend fortsetzen).
- **Post 4** (das ehemals unveröffentlichte „XS Sports Nutrition"-Sponsor-Thema,
  siehe frühere Fassung dieser Datei) wurde auf ausdrücklichen Wunsch endgültig
  gelöscht — Datei, Karte in `blog.html` und das zugehörige Hero-Bild
  `images/blogs/xs1.jpeg` existieren nicht mehr.
- **Bekannter Kompromiss:** Da der Post-Inhalt erst per JS nachgeladen wird,
  sehen Social-Media-Crawler (die kein JS ausführen) beim Teilen eines
  Post-Links nur den generischen Fallback-`<title>`, nicht den echten
  Post-Titel. Für dieses Projekt als unkritisch eingestuft.
- Alte, direkte Links wie `blog-post-6.html` funktionieren nicht mehr — bewusst
  akzeptiert, da diese Umstellung explizit gewünscht war.
- Verifiziert über denselben lokalen Testserver: Übersicht rendert genau 14
  Karten, Kategorie-Filter funktioniert weiterhin, mehrere Posts
  unterschiedlicher ID laden korrekt, `?id=4` und `?id=99` zeigen die
  Nicht-gefunden-Meldung, keine 404s oder Konsolenfehler nach dem Löschen der
  alten Dateien.
