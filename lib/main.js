// Mobil-Menü Logik
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navLinks = document.getElementById('nav-links');
const navLnkItems = document.querySelectorAll('.nav-lnk');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileMenuBtn.querySelector('i').classList.toggle('fa-bars');
    mobileMenuBtn.querySelector('i').classList.toggle('fa-xmark');
});

// Navigation Klick Logik
navLnkItems.forEach(item => {
    item.addEventListener('click', (e) => {
        const targetId = item.getAttribute('href');
        
        // Nur eingreifen, wenn es ein interner Link ist
        if (targetId && targetId.startsWith('#') && targetId !== '#home' && targetId !== '#') {
            const sectionId = targetId.substring(1);
            
            // NUR für FAQ: Automatisches Aufklappen beibehalten
            if (sectionId === 'faq') {
                e.preventDefault();
                navLinks.classList.remove('active');
                mobileMenuBtn.querySelector('i').classList.add('fa-bars');
                mobileMenuBtn.querySelector('i').classList.remove('fa-xmark');
                
                openSectionById('faq');
                scrollToSection('faq');
            } else {
                // Für alle anderen: Standard-Verhalten (Scrollen durch Browser)
                navLinks.classList.remove('active');
                mobileMenuBtn.querySelector('i').classList.add('fa-bars');
                mobileMenuBtn.querySelector('i').classList.remove('fa-xmark');
            }
        }
    });
});

// Hilfsfunktion für präzises Scrollen (hauptsächlich für FAQ genutzt)
function scrollToSection(sectionId) {
    const targetElement = document.getElementById(sectionId);
    if (targetElement) {
        const offset = 80; // Navbar Höhe
        const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

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

// --- SEKTIONS MANAGEMENT ---

function openSectionById(sectionId) {
    if (sectionId === 'faq') {
        const wrapper = document.querySelector('.faq-master-wrapper');
        const content = document.getElementById('faqMasterContent');
        if (wrapper && content) {
            wrapper.classList.add('active');
            content.style.maxHeight = content.scrollHeight + "px";
        }
    }
}

// --- FAQ MASTER TOGGLE LOGIK ---

const faqMasterTrigger = document.getElementById('faqMasterTrigger');
const faqMasterContent = document.getElementById('faqMasterContent');
const faqMasterWrapper = document.querySelector('.faq-master-wrapper');

if (faqMasterTrigger) {
    faqMasterTrigger.addEventListener('click', () => {
        const isActive = faqMasterWrapper.classList.contains('active');
        if (isActive) {
            faqMasterWrapper.classList.remove('active');
            faqMasterContent.style.maxHeight = null;
        } else {
            faqMasterWrapper.classList.add('active');
            faqMasterContent.style.maxHeight = faqMasterContent.scrollHeight + "px";
        }
    });
}

// FAQ Item Accordion (Internal)
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content');

    trigger.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        faqItems.forEach(i => {
            i.classList.remove('active');
            i.querySelector('.faq-content').style.maxHeight = null;
        });

        if(!isActive) {
            item.classList.add('active');
            content.style.maxHeight = content.scrollHeight + "px";
            
            // Master Höhe anpassen
            if (faqMasterWrapper && faqMasterWrapper.classList.contains('active')) {
                faqMasterContent.style.maxHeight = (faqMasterContent.scrollHeight + content.scrollHeight) + "px";
            }
        } else {
             if (faqMasterWrapper && faqMasterWrapper.classList.contains('active')) {
                setTimeout(() => {
                    faqMasterContent.style.maxHeight = faqMasterContent.scrollHeight + "px";
                }, 300);
            }
        }
    });
});

// Back-to-Top Button & Scroll Spy
const backToTop = document.getElementById('backToTop');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
        backToTop.classList.add('show');
    } else {
        backToTop.classList.remove('show');
    }

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