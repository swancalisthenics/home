# Dynamisches Laden der Blog-Posts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die 15 statischen Blog-Post-Seiten und die fest verdrahtete Blog-Übersicht durch ein daten-/template-basiertes System ersetzen, und Post 4 endgültig löschen.

**Architecture:** Ein JS-Array (`BLOG_POSTS`) ist die einzige Inhaltsquelle. Eine Render-Datei (`blog.js`) füllt daraus zwei Seiten: die Übersicht (`blog.html`, generiert Karten in ein leeres Grid) und eine einzige Post-Template-Seite (`blog-post.html`, liest `?id=` aus der URL). Kein `fetch()`, kein Framework, kein Build-Schritt — reines Vanilla JS, funktioniert auch offline per `file://`.

**Tech Stack:** HTML5, CSS3, Vanilla JS (ES6+). Keine Testframeworks im Projekt vorhanden — Verifikation erfolgt über einen lokalen statischen HTTP-Server plus gezielte JS-Snippets, die im Browser ausgeführt werden (siehe Testserver-Hinweis in Task 1).

**Spec:** `docs/superpowers/specs/2026-08-19-dynamic-blog-loading-design.md`

## Global Constraints

- Kein Framework, reines HTML5/CSS3/Vanilla-JS (GEMINI.md, „No-Framework-Gebot").
- 4-Leerzeichen-Einrückung in HTML/CSS/JS.
- Einfache Anführungszeichen in JS-Dateien.
- Deutsche Kommentare und Texte; bestehende Kommentare in unveränderten Dateibereichen nicht umschreiben.
- IDs der Posts bleiben die bisherigen Postnummern: 1,2,3,5,6,7,8,9,10,11,12,13,14,15 (Lücke bei 4, keine Neunummerierung).
- `author` ist für alle Posts der feste String `'Nicolas Brand'`.
- Das CTA-Button-Ziel ist für alle Posts fest `../../index.html#times` (nicht Teil der Daten, sondern im Template hartkodiert).
- Commit-Message-Stil dieses Repos: kurze, beschreibende deutsche Sätze ohne Präfix wie `feat:`/`fix:` (siehe `git log`).

---

## Task 1: Datenquelle `lib/blog-posts-data.js` erstellen

**Files:**
- Create: `lib/blog-posts-data.js`
- Read (Quelle, nicht ändern): `html/blog/blog-post-1.html`, `blog-post-2.html`, `blog-post-3.html`, `blog-post-5.html` … `blog-post-15.html` (14 Dateien, **ohne** `blog-post-4.html`), `html/blog/blog.html`

**Interfaces:**
- Produces: globale `const BLOG_POSTS` — Array von 14 Objekten. Dieses Interface nutzen Task 2 und Task 3.

### Wichtige Erkenntnis beim frischen Einlesen der Quelldateien

Titel, Kategorie-Label, Datum und Bild unterscheiden sich bei den meisten Posts
zwischen der Übersichtskarte (`blog.html`) und der Post-Seite selbst — das ist
bereits im aktuellen Live-Stand so vorhanden (z. B. Post 5: Karte zeigt „12.
Juni 2026", die Post-Seite selbst „08. Juli 2026"; Post 8: Karte zeigt
`handstand3.jpeg`, der Post-Header selbst `park.jpg`). Um „keine inhaltlichen
Änderungen" einzuhalten, werden Karte und Post-Seite deshalb **nicht** auf ein
gemeinsames Feld vereinheitlicht, sondern mit eigenen `card*`-Feldern separat
abgebildet. Das Datenmodell hat deshalb folgende Felder:

- `id` (number)
- `cardTitle`, `cardCategory`, `cardDate`, `cardImage` (strings) — exklusiv für die Übersichtskarte
- `excerpt` (string) — nur auf der Übersichtskarte vorhanden
- `filterCategory` (string, `'uebungen'` oder `'ernaehrung'`) — steuert die Filter-Buttons
- `metaTitle`, `title`, `category`, `date`, `heroImage` (strings) — exklusiv für die Post-Seite
- `content` (string, HTML) — nur auf der Post-Seite
- `ctaHeading`, `ctaText`, `ctaButton` (strings) — nur auf der Post-Seite
- `author` (string) — für beide gleich, immer `'Nicolas Brand'`

### Feld-Herkunft (pro Post, exakt so extrahieren)

Aus der **eigenen Post-Seite** `html/blog/blog-post-<id>.html`:
- `metaTitle` ← Inhalt des `<title>`-Tags, wörtlich (inkl. „ | Blog"-Suffix).
- `title` ← inneres HTML von `<h1 class="section-title">` innerhalb von `.hero-content` (inkl. eventueller `<span>`-Tags, wörtlich übernehmen).
- `category` ← Textinhalt von `<span class="blog-category">` innerhalb von `.hero-content`.
- `date` ← Textinhalt des `<span>` direkt nach `<i class="fa-solid fa-calendar-days"></i>` innerhalb von `.blog-card-meta`.
- `heroImage` ← der Pfad innerhalb von `url('...')` im `style="--post-hero-img: url('...')"`-Attribut von `<header class="post-header" style="...">`.
- `content` ← das komplette innere HTML von `<div class="post-content">...</div>` — alles zwischen dem öffnenden und dem zugehörigen schließenden Tag, unverändert als HTML-String übernehmen (Bilder, Blockquotes, Listen etc. bleiben wie sie sind).
- `ctaHeading` ← Textinhalt des `<h3>` im letzten `<div style="margin-top: 60px; border-top: 1px solid var(--border-glass); padding-top: 40px;">`-Block.
- `ctaText` ← Textinhalt des `<p>` direkt nach diesem `<h3>`.
- `ctaButton` ← Textinhalt des `<a class="btn btn-primary">` in diesem selben Block.

Aus der **Karte in `html/blog/blog.html`** (identifiziert über das `blog-post-<id>.html` in `onclick`/`href` der Karte):
- `cardTitle` ← Textinhalt von `<h2 class="blog-card-title">`.
- `cardCategory` ← Textinhalt von `<span class="blog-category">` innerhalb der Karte.
- `cardDate` ← Textinhalt des `<span>` direkt nach `<i class="fa-solid fa-calendar-days"></i>` innerhalb von `.blog-card-meta` der Karte.
- `cardImage` ← `src`-Attribut des `<img class="blog-card-img">`.
- `excerpt` ← Textinhalt von `<p class="blog-card-excerpt">` (führende/folgende Leerzeichen und Zeilenumbrüche trimmen).
- `filterCategory` ← Wert des `data-category`-Attributs auf `<article class="blog-card">`.

`author` ist immer `'Nicolas Brand'` (nicht extrahieren, fest eintragen).

**Wichtig:** `cardTitle`/`title`/`metaTitle`, `cardCategory`/`category` und `cardDate`/`date` sind bei den meisten Posts unterschiedliche Werte (nicht auseinander ableiten, z. B. nicht `<span>`-Tags aus `title` herausschneiden, um `cardTitle` zu erzeugen). Jedes Feld einzeln aus seiner jeweiligen, oben genannten Quelle lesen.

Template-Literals (Backticks) fürs `content`-Feld verwenden. Keiner der 15 Posts enthält ein literales Backtick-Zeichen oder eine `${`-Sequenz (bereits geprüft) — kein Escaping nötig.

### Vollständig ausgearbeitetes Beispiel (Post 1)

```js
const BLOG_POSTS = [
    {
        id: 1,
        cardTitle: 'Die 5 wichtigsten Basics für Calisthenics-Anfänger',
        cardCategory: 'Übungen & Kraftaufbau',
        cardDate: '12. Juni 2026',
        cardImage: '../../images/blogs/basics.jpeg',
        title: 'Die 5 wichtigsten <span>Basics</span>',
        metaTitle: 'Die 5 wichtigsten Basics für Calisthenics-Anfänger | Blog',
        category: 'Übungen & Kraftaufbau',
        filterCategory: 'uebungen',
        date: '12. Juni 2026',
        author: 'Nicolas Brand',
        heroImage: '../../images/blogs/basics.jpeg',
        excerpt: 'Egal ob du den Muscle-Up oder die Human Flag lernen willst: Ohne die richtigen Grundlagen wird es schwierig. Ich zeige dir die 5 Übungen, die jeder beherrschen sollte.',
        content: `
            <p>Calisthenics ist mehr als nur Training mit dem eigenen Körpergewicht – es ist eine Kunstform, die Disziplin, Körperbeherrschung und vor allem eine solide Basis erfordert. Viele Anfänger machen den Fehler, direkt die beeindruckenden Skills wie den Muscle-Up oder den Handstand lernen zu wollen, ohne die notwendige Grundkraft zu besitzen.</p>

            <blockquote>"Ein Haus ist nur so stabil wie sein Fundament. Das Gleiche gilt für deinen Körper im Calisthenics."</blockquote>

            <p>Hier sind die 5 Übungen, die du meistern musst, bevor du dich an fortgeschrittene Skills wagst:</p>

            <h2>1. Die perfekte Liegestütze (Push-Ups)</h2>
            <p>Es geht nicht um die Anzahl, sondern um die Qualität. Dein Körper muss eine gerade Linie bilden, die Ellbogen sollten nah am Körper bleiben und die Brust sollte fast den Boden berühren. Liegestütze bauen die notwendige Druckkraft für Übungen wie Dips oder Handstand-Push-Ups auf.</p>

            <h2>2. Klimmzüge (Pull-Ups)</h2>
            <p>Der Inbegriff der Zugkraft. Achte darauf, den vollen Bewegungsumfang (Full Range of Motion) zu nutzen: Von komplett gestreckten Armen bis das Kinn über der Stange ist. Wenn du noch keinen freien Klimmzug schaffst, starte mit Negativ-Wiederholungen oder Widerstandsbändern.</p>

            <img src="../../images/blogs/traininganderKlimmzugstange.JPG" alt="(Bild) Training an der Klimmzugstange">

            <h2>3. Dips</h2>
            <p>Dips sind die Kniebeugen für den Oberkörper. Sie trainieren Trizeps, Brust und Schultern extrem effektiv. Wichtig hierbei: Stabile Schultern und eine kontrollierte Abwärtsbewegung.</p>

            <h2>4. Bodyweight Squats</h2>
            <p>Vergiss niemals deine Beine! Squats sind essentiell für einen ausbalancierten Körper und fördern die allgemeine Beweglichkeit und Stabilität.</p>

            <h2>5. Core-Stabilität (Plank & Hollow Body)</h2>
            <p>Ohne einen starken Kern gibt es keine Körperbeherrschung. Die "Hollow Body Position" ist die wichtigste Haltung im gesamten Calisthenics-Sport. Sie ist die Basis für fast jeden Skill.</p>

            <p>Fokussiere dich für die nächsten 8-12 Wochen darauf, in diesen 5 Übungen stärker zu werden. Deine zukünftige Form wird es dir danken!</p>
        `,
        ctaHeading: 'Hat dir dieser Beitrag geholfen?',
        ctaText: 'Komm vorbei zum Training und wir zeigen dir die richtige Technik!',
        ctaButton: 'Zum nächsten Training'
    },
    // Posts 2, 3, 5–15 nach demselben Muster ergänzen (siehe Feld-Herkunft oben).
];
```

- [ ] **Step 1: Für jeden der 14 Posts (2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15) die zugehörige `html/blog/blog-post-<id>.html` sowie die passende Karte in `html/blog/blog.html` lesen und ein Objekt nach obigem Schema in `BLOG_POSTS` ergänzen.**

Datei `lib/blog-posts-data.js` mit dem Array-Literal schreiben (Post 1 wie oben, plus die 13 weiteren Objekte).

- [ ] **Step 2: Testserver starten**

Falls `python3`/`node`/`npx` verfügbar sind, reicht z. B. `python3 -m http.server 8123` im Projekt-Root. Falls nicht (wie in der vorherigen Session auf dieser Maschine), folgendes PowerShell-Skript nach `docs/superpowers/scratch-serve.ps1` schreiben und im Hintergrund starten:

```powershell
$root = (Get-Location).Path
$port = 8123
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Serving $root on http://localhost:$port/"

$mime = @{
    ".html" = "text/html"; ".css" = "text/css"; ".js" = "application/javascript"
    ".png" = "image/png"; ".jpg" = "image/jpeg"; ".jpeg" = "image/jpeg"; ".svg" = "image/svg+xml"
    ".ico" = "image/x-icon"; ".webmanifest" = "application/manifest+json"; ".woff2" = "font/woff2"
}

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $reqPath = [System.Uri]::UnescapeDataString($context.Request.Url.LocalPath)
    if ($reqPath -eq "/") { $reqPath = "/index.html" }
    $filePath = Join-Path $root ($reqPath -replace "^/", "")
    try {
        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath)
            $contentType = $mime[$ext]
            if (-not $contentType) { $contentType = "application/octet-stream" }
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $context.Response.ContentType = $contentType
            $context.Response.ContentLength64 = $bytes.Length
            $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $context.Response.StatusCode = 404
        }
    } catch {
    } finally {
        $context.Response.OutputStream.Close()
    }
}
```

Ausführen (im Hintergrund, aus dem `home`-Repo-Root): `powershell -ExecutionPolicy Bypass -File docs/superpowers/scratch-serve.ps1`

- [ ] **Step 3: Datenfile im Browser laden und stichprobenartig prüfen**

Mit dem Browser-Tool zu `http://localhost:8123/html/blog/blog.html` navigieren (die alte, noch unveränderte Seite reicht als Host-Kontext), dann per `javascript_exec` das neue Datenfile dynamisch nachladen und prüfen:

```js
(function() {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = '../../lib/blog-posts-data.js';
        script.onload = () => {
            const ids = BLOG_POSTS.map(p => p.id);
            resolve(JSON.stringify({
                count: BLOG_POSTS.length,
                ids: ids,
                hasNoId4: !ids.includes(4),
                post1CardTitle: BLOG_POSTS.find(p => p.id === 1).cardTitle,
                post8Date: BLOG_POSTS.find(p => p.id === 8).date,
                post15CtaButton: BLOG_POSTS.find(p => p.id === 15).ctaButton
            }));
        };
        document.head.appendChild(script);
    });
})()
```

Erwartet: `count: 14`, `ids` enthält genau `[1,2,3,5,6,7,8,9,10,11,12,13,14,15]`, `hasNoId4: true`, sowie plausible, nicht-leere Werte für die drei Stichproben-Felder.

- [ ] **Step 4: Commit**

```bash
git add lib/blog-posts-data.js
git commit -m "Blog-Post-Inhalte als Datenarray angelegt"
```

---

## Task 2: `lib/blog.js` mit `renderBlogPost()` + `html/blog/blog-post.html`-Template erstellen

**Files:**
- Create: `lib/blog.js`
- Create: `html/blog/blog-post.html`

**Interfaces:**
- Consumes: `BLOG_POSTS` (Array, siehe Task 1), Element-IDs im neuen Template: `postHeader`, `postCategory`, `postTitle`, `postDate`, `postAuthor`, `postContent`, `postCtaBlock`, `postCtaHeading`, `postCtaText`, `postCtaButton`, `postMetaDescription`.
- Produces: Funktionen `findPostById(id)` (gibt Objekt aus `BLOG_POSTS` oder `null` zurück) und `renderBlogPost()` in `lib/blog.js` — werden von Task 3 im selben File erweitert, Namen bleiben stabil.

- [ ] **Step 1: `html/blog/blog-post.html` erstellen**

```html
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- FontAwesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <title>Blog | Swan Calisthenics</title>
    <meta name="description" id="postMetaDescription" content="Tipps zu Training, Ernährung und Calisthenics-Skills von Swan Calisthenics.">

    <!-- Favicon -->
    <link rel="icon" type="image/png" href="../../favicon/favicon-96x96.png" sizes="96x96" />
    <link rel="icon" type="image/svg+xml" href="../../favicon/favicon.svg" />
    <link rel="stylesheet" href="../../css/global.css">
    <link rel="stylesheet" href="../../css/blog/blog-post-global.css">
</head>
<body>
<!-- NAVIGATION -->
<nav class="navbar">
    <div class="nav-container">
        <a href="../../index.html" class="nav-logo">
            <img src="../../images/logo.png" alt="Swan Calisthenics Logo">
            <span>Swan Calisthenics</span>
        </a>
        <div class="menu-toggle" id="mobile-menu-btn">
            <img src="../../images/icons/bars-solid-full.svg" alt="Menü" class="custom-icon">
        </div>
        <ul class="nav-menu" id="nav-links">
            <li><a href="../../index.html#home" class="nav-lnk">Home</a></li>
            <li><a href="../../index.html#about" class="nav-lnk" onclick="switchPage('home')">Über uns</a></li>
            <li><a href="../../index.html#times" class="nav-lnk" onclick="switchPage('home')">Zeiten</a></li>
            <li><a href="../../index.html#location" class="nav-lnk" onclick="switchPage('home')">Standort</a></li>
            <li><a href="blog.html" class="nav-lnk">Blog</a></li>
            <li><a href="../team.html" class="nav-lnk">Team</a></li>
            <li><a href="../kontakt.html" class="nav-lnk">Kontakt</a></li>
        </ul>
    </div>
</nav>

<!-- POST HEADER -->
<header class="post-header" id="postHeader">
    <div class="hero-content">
        <span class="blog-category" id="postCategory"></span>
        <h1 class="section-title" id="postTitle"></h1>
        <div class="blog-card-meta" style="justify-content: center; color: white;">
            <span><i class="fa-solid fa-calendar-days"></i> <span id="postDate"></span></span>
            <span><a style="color: white; text-decoration: none" href="../team.html"><i class="fa-solid fa-user"></i> <span id="postAuthor"></span> </a></span>
        </div>
    </div>
</header>

<!-- POST CONTENT -->
<article class="blog-container">
    <div class="post-container">
        <div class="post-back-nav">
            <a href="blog.html" class="btn btn-tertiary" style="height: 50px;"><i class="fa-solid fa-arrow-left"></i> Zurück zur Übersicht</a>
        </div>

        <div class="post-content" id="postContent"></div>

        <div style="margin-top: 60px; border-top: 1px solid var(--border-glass); padding-top: 40px;" id="postCtaBlock">
            <h3 id="postCtaHeading"></h3>
            <p id="postCtaText"></p>
            <br>
            <a href="../../index.html#times" class="btn btn-primary" id="postCtaButton"></a>
        </div>
    </div>
</article>

<!-- FOOTER -->
<footer>
    <div class="footer-content">
        <p>&copy; 2026 Swan Calisthenics Community</p>
        <p style="font-size: 0.8rem; opacity: 0.7; margin-top: 5px;">Erstellt von Nicolas Brand</p>
        <ul class="footer-links">
            <li><a href="../datenschutz_impressum.html">Datenschutz & Impressum</a></li>
        </ul>
    </div>
</footer>

<!-- BACK TO TOP BUTTON -->
<a href="#" class="back-to-top" id="backToTop"><img src="../../images/icons/arrow-up.svg" alt="Pfeil" class="custom-icon small"></a>

<script src="../../lib/main.js"></script>
<script src="../../lib/blog-posts-data.js"></script>
<script src="../../lib/blog.js"></script>
</body>
</html>
```

- [ ] **Step 2: `lib/blog.js` erstellen**

```js
// Blog: Rendering der Übersicht und der Einzel-Post-Ansicht aus BLOG_POSTS

function findPostById(id) {
    const numericId = Number(id);
    return BLOG_POSTS.find(post => post.id === numericId) || null;
}

function renderBlogPost() {
    const contentEl = document.getElementById('postContent');
    if (!contentEl) return;

    const id = new URLSearchParams(window.location.search).get('id');
    const post = findPostById(id);

    if (!post) {
        document.getElementById('postHeader').style.display = 'none';
        document.getElementById('postCtaBlock').style.display = 'none';
        contentEl.innerHTML = '<p>Diesen Beitrag gibt es nicht (mehr).</p>';
        document.title = 'Beitrag nicht gefunden | Blog | Swan Calisthenics';
        return;
    }

    document.title = post.metaTitle;
    const metaDescription = document.getElementById('postMetaDescription');
    if (metaDescription) {
        metaDescription.setAttribute('content', post.excerpt);
    }

    document.getElementById('postHeader').style.setProperty('--post-hero-img', `url('${post.heroImage}')`);
    document.getElementById('postCategory').textContent = post.category;
    document.getElementById('postTitle').innerHTML = post.title;
    document.getElementById('postDate').textContent = post.date;
    document.getElementById('postAuthor').textContent = post.author;
    contentEl.innerHTML = post.content;
    document.getElementById('postCtaHeading').textContent = post.ctaHeading;
    document.getElementById('postCtaText').textContent = post.ctaText;
    document.getElementById('postCtaButton').textContent = post.ctaButton;
}

if (document.getElementById('postContent')) {
    renderBlogPost();
}
```

- [ ] **Step 3: Testserver aus Task 1 nutzen (neu starten, falls nicht mehr aktiv), dann per `javascript_exec` prüfen**

Zu `http://localhost:8123/html/blog/blog-post.html?id=1` navigieren, dann:

```js
JSON.stringify({
    title: document.title,
    h1: document.getElementById('postTitle').innerHTML,
    category: document.getElementById('postCategory').textContent,
    hasContent: document.getElementById('postContent').innerHTML.includes('Liegestütze'),
    heroStyle: document.getElementById('postHeader').style.getPropertyValue('--post-hero-img')
})
```

Erwartet: `title` = "Die 5 wichtigsten Basics für Calisthenics-Anfänger | Blog", `h1` enthält `<span>Basics</span>`, `category` = "Übungen & Kraftaufbau", `hasContent: true`, `heroStyle` enthält `basics.jpeg`.

Danach zu `http://localhost:8123/html/blog/blog-post.html?id=15` navigieren und `document.title` sowie `document.getElementById('postContent').innerHTML.length > 0` prüfen (anderer Post lädt korrekt).

Zuletzt zu `http://localhost:8123/html/blog/blog-post.html?id=4` (gelöschter Post) und `?id=99` (nie existent) navigieren:

```js
JSON.stringify({
    text: document.getElementById('postContent').textContent,
    headerHidden: document.getElementById('postHeader').style.display === 'none'
})
```

Erwartet in beiden Fällen: `text` enthält "gibt es nicht", `headerHidden: true`.

- [ ] **Step 4: Commit**

```bash
git add lib/blog.js html/blog/blog-post.html
git commit -m "Template-Seite und Renderer für einzelne Blog-Posts hinzugefügt"
```

---

## Task 3: `renderBlogGrid()` + `initBlogFilters()` ergänzen, `html/blog/blog.html` umstellen

**Files:**
- Modify: `lib/blog.js`
- Modify: `html/blog/blog.html`

**Interfaces:**
- Consumes: `BLOG_POSTS` (Task 1), `findPostById` bleibt unverändert (Task 2).
- Produces: `renderBlogGrid()` und `initBlogFilters()` in `lib/blog.js`; `html/blog/blog.html` erwartet ein Element `id="blogGrid"`.

- [ ] **Step 1: `lib/blog.js` um Grid-Rendering und Filter erweitern**

Direkt vor der abschließenden `if (document.getElementById('postContent')) { renderBlogPost(); }`-Zeile einfügen:

```js
function renderBlogGrid() {
    const grid = document.getElementById('blogGrid');
    if (!grid) return;

    grid.innerHTML = BLOG_POSTS.map(post => `
        <article class="blog-card" data-category="${post.filterCategory}" onclick="window.location.href='blog-post.html?id=${post.id}';" style="cursor: pointer;">
            <img src="${post.cardImage}" alt="${post.cardTitle}" class="blog-card-img">
            <div class="blog-card-content">
                <span class="blog-category">${post.cardCategory}</span>
                <h2 class="blog-card-title">${post.cardTitle}</h2>
                <div class="blog-card-meta">
                    <span><i class="fa-solid fa-calendar-days"></i> ${post.cardDate}</span>
                    <span><i class="fa-solid fa-user"></i> ${post.author}</span>
                </div>
                <p class="blog-card-excerpt">
                    ${post.excerpt}
                </p>
                <div class="blog-card-footer">
                    <a href="blog-post.html?id=${post.id}" class="btn btn-primary">Mehr lesen <i class="fa-solid fa-arrow-right"></i></a>
                </div>
            </div>
        </article>
    `).join('');

    initBlogFilters();
}

function initBlogFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const blogCards = document.querySelectorAll('.blog-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            blogCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');

                if (filterValue === 'all' || cardCategory === filterValue) {
                    card.style.display = 'block';
                    setTimeout(() => { card.style.opacity = cardCategory === 'ernaehrung' && filterValue !== 'all' ? '0.5' : '1'; }, 10);
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

if (document.getElementById('blogGrid')) {
    renderBlogGrid();
}
```

- [ ] **Step 2: `html/blog/blog.html` umstellen**

Kompletten Inhalt zwischen `<main class="blog-container">` und `</main>` (aktuell 14 einzelne `<article class="blog-card">`-Blöcke plus zwei bereits auskommentierte Karten für Post 4 und einen generischen Platzhalter) ersetzen durch:

```html
<main class="blog-container">
    <div class="blog-grid" id="blogGrid"></div>
</main>
```

Direkt vor `</body>` die beiden neuen Script-Tags **vor** `main.js`-Tag ergänzen, sodass die Reihenfolge stimmt (Daten und Renderer müssen vor `main.js`s Blog-Filter-Referenzen ohnehin nicht mehr existieren, aber `main.js` bleibt aus Konsistenzgründen zuerst geladen):

```html
<script src="../../lib/main.js"></script>
<script src="../../lib/blog-posts-data.js"></script>
<script src="../../lib/blog.js"></script>
```

(Kopf-Bereich, Navigation, `<header class="blog-hero">` und der `<div class="filter-container">`-Block mit den drei Filter-Buttons bleiben unverändert.)

- [ ] **Step 3: Testserver-Check**

Zu `http://localhost:8123/html/blog/blog.html` navigieren:

```js
JSON.stringify({
    cardCount: document.querySelectorAll('.blog-card').length,
    firstCardHref: document.querySelector('.blog-card .btn-primary').getAttribute('href')
})
```

Erwartet: `cardCount: 14`, `firstCardHref` = `"blog-post.html?id=1"`.

Dann den Filter testen:

```js
(function() {
    document.querySelector('[data-filter="ernaehrung"]').click();
    const visible = Array.from(document.querySelectorAll('.blog-card')).filter(c => c.style.display !== 'none').length;
    document.querySelector('[data-filter="all"]').click();
    const visibleAfterReset = Array.from(document.querySelectorAll('.blog-card')).filter(c => c.style.display !== 'none').length;
    return JSON.stringify({ visibleErnaehrung: visible, visibleAfterReset: visibleAfterReset });
})()
```

Erwartet: `visibleErnaehrung` kleiner als 14 und größer 0, `visibleAfterReset: 14`.

- [ ] **Step 4: Commit**

```bash
git add lib/blog.js html/blog/blog.html
git commit -m "Blog-Übersicht rendert Karten jetzt dynamisch aus den Post-Daten"
```

---

## Task 4: Alte Post-Dateien, verwaistes Bild und Filter-Altcode entfernen

**Files:**
- Delete: `html/blog/blog-post-1.html` … `html/blog/blog-post-15.html` (alle 15 Dateien)
- Delete: `images/blogs/xs1.jpeg`
- Modify: `lib/main.js`

**Interfaces:**
- Keine neuen Interfaces — reine Aufräumarbeit auf Basis der in Task 1–3 fertiggestellten Funktionalität.

- [ ] **Step 1: Alte Post-Dateien löschen**

```bash
cd html/blog
rm -f blog-post-1.html blog-post-2.html blog-post-3.html blog-post-4.html blog-post-5.html blog-post-6.html blog-post-7.html blog-post-8.html blog-post-9.html blog-post-10.html blog-post-11.html blog-post-12.html blog-post-13.html blog-post-14.html blog-post-15.html
cd ../..
```

- [ ] **Step 2: Verwaistes Hero-Bild von Post 4 löschen**

```bash
rm -f images/blogs/xs1.jpeg
```

- [ ] **Step 3: Filter-Altcode aus `lib/main.js` entfernen**

Den kompletten Block am Ende der Datei entfernen (alles ab der Zeile `document.addEventListener('DOMContentLoaded', () => {` bis zum Dateiende), sodass die Datei nach der vorherigen Funktion `formatPhoneNumber` endet:

```js
function formatPhoneNumber(phone) {
    // Einfache Formatierung für die Anzeige (z.B. +41 00 000 00 00)
    if (phone.startsWith('+41')) {
        return `+41 ${phone.substring(3, 5)} ${phone.substring(5, 8)} ${phone.substring(8, 10)} ${phone.substring(10)}`;
    }
    return phone;
}
```

- [ ] **Step 4: Verifizieren, dass nichts mehr auf die gelöschten Dateien verweist**

Bewusst nur auf Code-Dateitypen beschränkt (HTML/JS/CSS) — `CLAUDE.md` enthält bis Task 5 noch einen Verweis auf `xs1.jpeg` in der „Bekannte Probleme"-Liste, das ist ein reiner Doku-Nachtrag und kein Code-Fehler:

```bash
grep -rn "blog-post-[0-9]" --include="*.html" --include="*.js" --include="*.css" . || echo "keine Treffer"
grep -rn "xs1.jpeg" --include="*.html" --include="*.js" --include="*.css" . || echo "keine Treffer"
```

Erwartet: beide Befehle geben „keine Treffer" aus (die Vorkommen in `lib/blog-posts-data.js`, die auf `blog-post.html?id=` verweisen, matchen das Muster `blog-post-[0-9]` nicht, da kein Bindestrich vor der Zahl steht).

- [ ] **Step 5: Testserver-Check nach dem Löschen**

Server neu starten (Dateisystem hat sich geändert), dann `http://localhost:8123/html/blog/blog.html` und `http://localhost:8123/html/blog/blog-post.html?id=15` erneut laden und per `read_network_requests` prüfen, dass keine 404-Antworten auftreten, sowie per `read_console_messages` prüfen, dass keine Fehler geloggt wurden.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Alte Blog-Post-Dateien, verwaistes Post-4-Bild und Filter-Altcode aus main.js entfernt"
```

---

## Task 5: `CLAUDE.md` aktualisieren

**Files:**
- Modify: `CLAUDE.md` (Repo-Root)

**Interfaces:** keine — reine Dokumentation.

- [ ] **Step 1: Struktur-Abschnitt aktualisieren**

Im Baum unter `html/blog/` die 15 Einzeldateien durch `blog-post.html` (Template) ersetzen; unter `lib/` `blog-posts-data.js` und `blog.js` ergänzen.

- [ ] **Step 2: „Bekannte Probleme"-Liste bereinigen**

Punkt 1 (Post 4 unveröffentlicht/verwaist) entfernen — erledigt durch Löschung. In Punkt 3 (nicht mehr referenzierte Bilder) den Hinweis zu `xs.jpeg` vs. `xs1.jpeg` entfernen, da `xs1.jpeg` jetzt ebenfalls gelöscht ist und nicht mehr existiert.

- [ ] **Step 3: Neuen Abschnitt „Dynamisches Blog-System" ergänzen**

Kurz beschreiben: `lib/blog-posts-data.js` als einzige Inhaltsquelle, `lib/blog.js` rendert Übersicht (`blog.html`) und Einzel-Post (`blog-post.html?id=`), Verweis auf die Spec unter `docs/superpowers/specs/2026-08-19-dynamic-blog-loading-design.md`. Erwähnen, dass ein neuer Post ab jetzt durch Ergänzen eines Objekts in `BLOG_POSTS` angelegt wird (keine neue HTML-Datei mehr nötig) — analog zur bestehenden „Anleitung zur Erweiterung"-Sektion in `GEMINI.md`, die ebenfalls einen entsprechenden Hinweis verdient (kurze Ergänzung dort, nicht die ganze Datei umschreiben).

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md GEMINI.md
git commit -m "CLAUDE.md und GEMINI.md an das neue dynamische Blog-System angepasst"
```
