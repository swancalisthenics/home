// Responsive Bilder: <picture>/<source media> wird explizit selbst aufgelöst statt
// sich auf die native Browser-Auswahl zu verlassen (bei dynamisch per innerHTML
// eingefügten <picture>-Elementen unzuverlässig).
function resolvePictureSources(root) {
    const isMobile = window.innerWidth <= 767;
    (root || document).querySelectorAll('picture').forEach(picture => {
        const source = picture.querySelector('source');
        const img = picture.querySelector('img');
        if (!source || !img) return;
        // data-large statt src auslesen: der Browser schreibt bei dynamisch per
        // innerHTML eingefuegten <picture>-Elementen das src-Attribut teils schon
        // (falsch) um, bevor dieses Skript laeuft - data-large bleibt unangetastet.
        img.src = isMobile ? source.getAttribute('srcset') : img.getAttribute('data-large');
    });
}
resolvePictureSources();
// Zusaetzlich nach "load", per Nachzuegler-Timer und bei Resize/Drehung nochmal
// aufloesen: window.innerWidth ist beim allerersten Skriptdurchlauf nicht in jeder
// Umgebung schon zuverlaessig final.
window.addEventListener('load', () => resolvePictureSources());
window.addEventListener('resize', () => resolvePictureSources());
setTimeout(() => resolvePictureSources(), 300);

// Mobil-Menü Logik
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navLinks = document.getElementById('nav-links');
const navLnkItems = document.querySelectorAll('.nav-lnk');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const menuIcon = mobileMenuBtn.querySelector('i');
    if (menuIcon) {
        menuIcon.classList.toggle('fa-bars');
        menuIcon.classList.toggle('fa-xmark');
    }
});

// Navigation Klick Logik
navLnkItems.forEach(item => {
    item.addEventListener('click', (e) => {
        const targetId = item.getAttribute('href');
        
        // Menü immer schließen bei Klick
        navLinks.classList.remove('active');
        const menuIcon = mobileMenuBtn.querySelector('i');
        if (menuIcon) {
            menuIcon.classList.add('fa-bars');
            menuIcon.classList.remove('fa-xmark');
        }

        // Spezial-Logik für interne Links
        if (targetId && targetId.startsWith('#') && targetId !== '#home' && targetId !== '#') {
            const sectionId = targetId.substring(1);
            
            // NUR für FAQ: Automatisches Aufklappen beibehalten
            if (sectionId === 'faq') {
                e.preventDefault();
                openSectionById('faq');
                scrollToSection('faq');
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

// SPA-Seitenwechsel (Home <-> Blog <-> Legal)
function switchPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active-page'));
    document.querySelectorAll('.nav-lnk').forEach(lnk => lnk.classList.remove('active'));

    if(pageId === 'blog') {
        const blogPage = document.getElementById('blog-page');
        const blogMenuItem = document.getElementById('blog-menu-item');
        if (blogPage) blogPage.classList.add('active-page');
        if (blogMenuItem) blogMenuItem.classList.add('active');
        window.scrollTo({top: 0});
    } else if(pageId === 'legal') {
        const legalPage = document.getElementById('legal-page');
        if (legalPage) legalPage.classList.add('active-page');
        window.scrollTo({top: 0});
    } else {
        const homePage = document.getElementById('home-page');
        const homeLink = document.querySelector('[href="#home"]');
        if (homePage) homePage.classList.add('active-page');
        if (homeLink) homeLink.classList.add('active');
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

// Hilfsfunktion: Throttle (begrenzt die Ausführung einer Funktion)
function throttle(func, limit) {
    let lastFunc;
    let lastRan;
    return function() {
        const context = this;
        const args = arguments;
        if (!lastRan) {
            func.apply(context, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(function() {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(context, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    }
}

// Back-to-Top Button & Scroll Spy (optimiert mit Throttle)
const backToTop = document.getElementById('backToTop');
const sections = document.querySelectorAll('section[id]');

const handleScroll = () => {
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
};

window.addEventListener('scroll', throttle(handleScroll, 100));

// --- PHONE DIALOG MODAL LOGIK ---

let currentPhoneNumber = "";
let currentEmailAddress = "";

function openPhoneDialog(event, phone) {
    event.preventDefault();
    currentPhoneNumber = phone;
    const modal = document.getElementById('phone-modal');
    const display = document.getElementById('modal-phone-display');
    const callBtn = document.getElementById('modal-call-btn');

    // Telefonnummer im Modal anzeigen
    display.textContent = formatPhoneNumber(phone);
    // Link für den Anrufen-Button setzen
    callBtn.href = `tel:${phone}`;
    
    modal.classList.add('active');
}

function closePhoneDialog() {
    document.getElementById('phone-modal').classList.remove('active');
}

function openEmailDialog(event, email) {
    event.preventDefault();
    currentEmailAddress = email;
    const modal = document.getElementById('email-modal');
    const display = document.getElementById('modal-email-display');
    const mailBtn = document.getElementById('modal-mail-btn');

    // Email im Modal anzeigen
    display.textContent = email;
    // Link für den Schreiben-Button setzen
    mailBtn.href = `mailto:${email}`;
    
    modal.classList.add('active');
}

function closeEmailDialog() {
    document.getElementById('email-modal').classList.remove('active');
}

// Schließen beim Klick außerhalb des Modals
window.addEventListener('click', (e) => {
    const phoneModal = document.getElementById('phone-modal');
    const emailModal = document.getElementById('email-modal');
    if (e.target === phoneModal) {
        closePhoneDialog();
    }
    if (e.target === emailModal) {
        closeEmailDialog();
    }
});

function copyPhoneNumber() {
    if (!currentPhoneNumber) return;

    navigator.clipboard.writeText(currentPhoneNumber).then(() => {
        const copyBtn = document.querySelector('#phone-modal .btn-secondary');
        const originalContent = copyBtn.innerHTML;
        
        copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Kopiert!';
        copyBtn.classList.add('btn-primary');
        copyBtn.classList.remove('btn-secondary');

        setTimeout(() => {
            copyBtn.innerHTML = originalContent;
            copyBtn.classList.add('btn-secondary');
            copyBtn.classList.remove('btn-primary');
        }, 2000);
    });
}

function copyEmailAddress() {
    if (!currentEmailAddress) return;

    navigator.clipboard.writeText(currentEmailAddress).then(() => {
        const copyBtn = document.querySelector('#email-modal .btn-secondary');
        const originalContent = copyBtn.innerHTML;
        
        copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Kopiert!';
        copyBtn.classList.add('btn-primary');
        copyBtn.classList.remove('btn-secondary');

        setTimeout(() => {
            copyBtn.innerHTML = originalContent;
            copyBtn.classList.add('btn-secondary');
            copyBtn.classList.remove('btn-primary');
        }, 2000);
    });
}

function formatPhoneNumber(phone) {
    // Einfache Formatierung für die Anzeige (z.B. +41 00 000 00 00)
    if (phone.startsWith('+41')) {
        return `+41 ${phone.substring(3, 5)} ${phone.substring(5, 8)} ${phone.substring(8, 10)} ${phone.substring(10)}`;
    }
    return phone;
}