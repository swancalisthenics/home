// Mobil-Menü Logik
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navLinks = document.getElementById('nav-links');
const navLnkItems = document.querySelectorAll('.nav-lnk');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileMenuBtn.querySelector('i').classList.toggle('fa-bars');
    mobileMenuBtn.querySelector('i').classList.toggle('fa-xmark');
});

// Schließen des Mobil-Menüs nach Klick
navLnkItems.forEach(item => {
    item.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileMenuBtn.querySelector('i').classList.add('fa-bars');
        mobileMenuBtn.querySelector('i').classList.remove('fa-xmark');
    });
});

// SPA-Seitenwechsel (Home <-> Blog)
function switchPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active-page'));
    document.querySelectorAll('.nav-lnk').forEach(lnk => lnk.classList.remove('active'));

    if(pageId === 'blog') {
        document.getElementById('blog-page').classList.add('active-page');
        document.getElementById('blog-menu-item').classList.add('active');
        window.scrollTo({top: 0});
    } else {
        document.getElementById('home-page').classList.add('active-page');
        document.querySelector('[href="#home"]').classList.add('active');
    }
}

// FAQ Akkordeon System
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content');

    trigger.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Schließe alle anderen offenen Items
        faqItems.forEach(i => {
            i.classList.remove('active');
            i.querySelector('.faq-content').style.maxHeight = null;
        });

        if(!isActive) {
            item.classList.add('active');
            content.style.maxHeight = content.scrollHeight + "px";
        }
    });
});

// Back-to-Top Button Sichtbarkeit & Active Navigation Highlight beim Scannen
const backToTop = document.getElementById('backToTop');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    // Back to top appearance
    if (window.scrollY > 400) {
        backToTop.classList.add('show');
    } else {
        backToTop.classList.remove('show');
    }

    // Highlighting der Nav-Links beim Scrollen
    let scrollY = window.pageYOffset;
    sections.forEach(current => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 100;
        const sectionId = current.getAttribute('id');
        const targetLnk = document.querySelector(`.nav-menu a[href*=${sectionId}]`);

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight && targetLnk) {
            document.querySelectorAll('.nav-lnk').forEach(el => el.classList.remove('active'));
            targetLnk.classList.add('active');
        }
    });
});