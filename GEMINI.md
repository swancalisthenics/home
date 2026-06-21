# 🦢 Swan Calisthenics — KI-Projektbegleiter & Dokumentation

Willkommen im offiziellen **KI-README (`readmeKI.md`)** für das Projekt **Swan Calisthenics**. Diese Datei dient als intelligenter Kompass für Entwickler und Künstliche Intelligenzen (KIs), um die Struktur, die Design-Philosophie und die Weiterentwicklung dieser Web-Applikation nahtlos zu verstehen und zu unterstützen.

---

## 1.0 Projektübersicht & Vision

**Swan Calisthenics** ist eine moderne, responsive und performante Webplattform für eine leidenschaftliche Calisthenics-Community in Horgen. Die Seite bietet Trainingsbegeisterten aller Stufen – von absoluten Anfängern bis zu fortgeschrittenen Athleten – eine zentrale Anlaufstelle für gemeinsames Outdoor-Training, wertvolles Wissen und gegenseitigen Support.

### 🌐 Live-Links
* **Startseite des Projekts:** [https://swancalisthenics.github.io/home/](https://swancalisthenics.github.io/home/)
* **Calisthenics Blog:** [https://swancalisthenics.github.io/home/html/blog.html](https://swancalisthenics.github.io/home/html/blog.html)

---

## 2.0 Architektur & Verzeichnisstruktur

Das Projekt zeichnet sich durch eine **extrem saubere, framework-freie Entwicklung** aus. Es wurde vollständig mit nativem HTML5, CSS3 und Vanilla JavaScript umgesetzt. 

Hier ist der strukturelle Aufbau des Repositories:

```text
C:\Users\nicol\IdeaProjects\home\
├── index.html                  # Die interaktive Startseite (Landingpage & Core-Sektionen)
├── README.md                   # Das originale, studentische README mit Anforderungen & TODOs
├── readmeKI.md                 # Diese KI-Dokumentation (Struktur, Richtlinien & Code-Architektur)
├── css/
│   └── stylesheet.css          # Zentrales Stylesheet (Layouts, Variablen, responsive Breakpoints)
├── html/                       # Unterseiten und Blog-Inhalte
│   ├── blog.html               # Übersicht aller Blog-Artikel inkl. Filterfunktionen
│   ├── post-basics.html        # Detailansicht für den Calisthenics-Grundlagen-Artikel
│   ├── support.html            # Anfragen- & Kontaktformular sowie Team-Vorstellungen
│   └── impressum.html          # Rechtlich gefordertes Impressum
├── images/                     # Bildressourcen und Team-Fotos (Alessandro, Louie, Nicolas etc.)
├── favicon/                    # Plattformübergreifende Favicons und Web-App-Manifest
└── lib/
    └── main.js                 # Vanilla JavaScript für Navigation, Mobil-Menüs und Interaktivität
```

---

## 3.0 Funktionsumfang & Features

### 3.1 Startseite (`index.html`)
* **Responsive Navigation:** Vollwertiges, interaktives Hamburger-Menü für Mobilgeräte.
* **Hero-Bereich:** Visuell ansprechender Einstieg mit klarer Botschaft (*Train Together. Get Stronger.*).
* **Über uns & Team:** Vorstellung der Community-Idee und der Gesichter dahinter.
* **Trainingszeiten & Standort:** Übersichtliche Darstellung der Trainingszeiten und eine interaktive Standortkarte für das Outdoor-Training in Horgen.
* **Interaktives FAQ:** Ausklappbare Sektionen mit sanften Animationen für häufig gestellte Fragen.

### 3.2 Calisthenics Blog (`html/blog.html` & `post-basics.html`)
* **Grid-Layout:** Ein modernes, CSS-Grid-basiertes Layout für die Artikelübersicht.
* **Filterfunktion:** Ermöglicht Benutzern das dynamische Filtern von Artikeln nach Kategorien (z.B. Ernährung, Training, Mindset).
* **Kuratiertes Content-Erlebnis:** Detailseiten mit strukturiertem Text, hochauflösenden Medien (Bildern/Videos) und klaren Autoren-Nennungen (inklusive Verlinkungen zu deren Kontaktprofilen).

### 3.3 Support- & Kontaktseite (`html/support.html`)
* **Team-Direktkontakt:** Übersicht der Ansprechpartner (z.B. Alessandro für Finanzen/Events) mit individuellen Fotos und Profilen.
* **Dynamisches Kontaktformular:** Formular mit intelligentem Dropdown-Betreff. Dies ermöglicht die automatische Kategorisierung eingehender E-Mails im Mailprogramm.

---

## 4.0 KI-Entwicklungsrichtlinien (Für LLMs & KIs)

Wenn du als KI an diesem Projekt arbeitest (z.B. um neue Features hinzuzufügen oder Fehler zu beheben), **musst** du dich strikt an die folgenden Architektur- und Design-Prinzipien halten:

### ⚠️ Das "No-Framework"-Gebot
* **Kein Tailwind CSS, Bootstrap, React, Vue oder Svelte!** 
* Der gesamte Code muss zu **100% in reinem HTML5, CSS3 und Vanilla JavaScript** geschrieben sein.
* Nutze moderne CSS-Features wie CSS-Variablen, Flexbox und CSS-Grid für Layouts.

### 🎨 Design & Styleguide (Kompakt)
* **Typografie:** Eingebunden sind die Google Fonts `Inter` (für leserlichen Fließtext, Gewichte: 300, 400, 600, 800) und `Libre Baskerville` (für elegante, klassische Überschriften).
* **Farbpalette:** Ein edles, dunkles Farbschema mit kontrastierenden Akzentfarben (z.B. frisches Grün/Mint als Akzent und dunkle Grautöne für den Hintergrund).
* **Icons:** Nutze ausschließlich die bereits eingebundene Bibliothek **FontAwesome 6.4.0** (`<i class="fa-solid fa-..."></i>`).

### 📱 Responsivität & Best Practices
* Verwende stets ein **Mobile-First-Denkmuster** oder stelle sicher, dass neue Layouts nahtlos auf Handys, Tablets und Desktops funktionieren.
* Nutze in CSS die im `stylesheet.css` etablierten Breakpoints (mittels `@media (max-width: ...)`).
* Achte auf performantes Laden von Bildern (`loading="lazy"`-Attribut) und die semantische HTML-Struktur (Verwendung von `<header>`, `<nav>`, `<main>`, `<section>`, `<article>` und `<footer>`).

### 🛠️ Anleitung zur Erweiterung des Codes

#### 1. Einen neuen Blog-Artikel hinzufügen:
1. Erstelle eine neue Datei in `/html/` (z.B. `post-nutrition.html`), basierend auf der Struktur von `post-basics.html`.
2. Verlinke den neuen Artikel in der Grid-Übersicht von `html/blog.html`.
3. Weise dem Artikel die passenden Filter-Klassen im Blog-Grid zu, damit die Javascript-Filterung einwandfrei funktioniert.

#### 2. Javascript-Interaktionen erweitern (`lib/main.js`):
* Halte das Javascript modular und sauber dokumentiert.
* Nutze Event-Delegation und vermeide Inline-Event-Handler (`onclick="..."` direkt im HTML) bei neuem Code, um eine saubere Trennung von Struktur und Verhalten zu wahren (außer es passt zur bestehenden Implementierung).

---

## 5.0 TODOs & Roadmap

Basierend auf den Projektzielen stehen folgende nächste Schritte an:
* [ ] **Newsletter-Anmeldung:** Implementierung eines datenschutzkonformen Formulars für die Newsletter-Anmeldung auf der Startseite.
* [ ] **Erweiterung des Contents:** Ausbau auf mindestens 10 kuratierte Artikel inklusive passender Videos und Grafiken.
* [ ] **Feinschliff der Blog-Filterung:** Absichern der Javascript-Filterung bei wachsender Artikelanzahl.
* [ ] **Validierung:** Laufende Prüfung des Codes gegen die offiziellen W3C-Standards für HTML5 und CSS3.

---

*Dieses Projekt wird mit Liebe zum Detail und handgeschriebenem Code gepflegt. KIs sind herzlich eingeladen, die Codequalität auf diesem hohen Niveau fortzuführen!* 🦢💪
