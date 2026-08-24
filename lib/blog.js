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
    document.getElementById('postHeader').style.setProperty('--post-hero-img-small', `url('${post.heroImageSmall}')`);
    document.getElementById('postCategory').textContent = post.category;
    document.getElementById('postTitle').innerHTML = post.title;
    document.getElementById('postDate').textContent = post.date;
    document.getElementById('postAuthor').textContent = post.author;
    contentEl.innerHTML = post.content;
    document.getElementById('postCtaHeading').textContent = post.ctaHeading;
    document.getElementById('postCtaText').textContent = post.ctaText;
    document.getElementById('postCtaButton').textContent = post.ctaButton;
    resolvePictureSources(contentEl);
}

function renderBlogGrid() {
    const grid = document.getElementById('blogGrid');
    if (!grid) return;

    grid.innerHTML = BLOG_POSTS.map(post => `
        <article class="blog-card" data-category="${post.filterCategory}" onclick="window.location.href='blog-post.html?id=${post.id}';" style="cursor: pointer;">
            <picture>
                <source media="(max-width: 767px)" srcset="${post.cardImageSmall}">
                <img src="${post.cardImage}" data-large="${post.cardImage}" alt="${post.cardTitle}" class="blog-card-img">
            </picture>
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

    resolvePictureSources(grid);
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

if (document.getElementById('postContent')) {
    renderBlogPost();
}
if (document.getElementById('blogGrid')) {
    renderBlogGrid();
}
