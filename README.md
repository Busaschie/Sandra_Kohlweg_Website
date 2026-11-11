# Sandra Kohlweg – Website

Statische, zweisprachige Website (DE/EN) für **Sandra Kohlweg – Headhunting & Direktansprache** im technischen und industriellen Sektor (Kärnten, Österreich & Deutschland).

## Demo

- Live: <https://www.kohlweg.de/>
- Englische Version: <https://www.kohlweg.de/en/>

<!-- TODO: Screenshot der Startseite (Desktop + Mobil) in images/ ablegen und hier einbinden -->

## Warum das Projekt

Eine Personalberaterin braucht einen seriösen Webauftritt, der ohne Datenbank, CMS oder Wartungsaufwand läuft und datenschutzrechtlich unkritisch ist. Die Seite stellt Leistungen, Referenzen, FAQ und Kontakt dar und ist auf normalem Apache-Webspace lauffähig.

## Funktionen

- 9 Seiten pro Sprache: Start, Leistungen, Über mich, Referenzen, FAQ, Kontakt, Impressum, Datenschutz, AGB (plus eigene 404-Seite)
- Deutsche Hauptversion im Root, englische Version in `en/` mit `hreflang`-Verknüpfung (`de`, `en`, `x-default`)
- Kontaktdaten (E-Mail/Telefon) werden per JavaScript zusammengesetzt, um Spam-Bots zu erschweren; es gibt kein Formular
- SEO-Grundlagen: `canonical`, Open-Graph-Bild, schema.org-Markup
- Serverkonfiguration per `.htaccess`: HTTPS-Weiterleitung, Sicherheits-Header, Gzip, Browser-Caching, gesperrte Dotfiles, kein Directory Listing

## Besonderheit / Designentscheidung

**Keine externen Requests.** Schriften (Plus Jakarta Sans, Playfair Display als woff2) und Icons (Lucide) liegen lokal im Repo; es werden keine CDNs oder Fremdskripte geladen. Externe Adressen kommen nur als normale Links vor (z. B. LinkedIn, Referenzgeber). Das ist aus Datenschutzsicht (DSGVO) einfacher; ob ein Cookie-Hinweis nötig ist, ist in `datenschutz.html` geregelt.

**Staging und Live in einer `.htaccess`.** Die Datei ist aktuell auf Staging eingestellt (`X-Robots-Tag: noindex, nofollow`). Für `kohlweg.de` sind die markierten Zeilen umzustellen:

- `noindex`-Header entfernen
- www-Weiterleitung einkommentieren
- HSTS einkommentieren, sobald HTTPS stabil läuft

## Tech-Stack

- **Markup:** handgeschriebenes HTML5
- **Styling:** Tailwind CSS v4 (Quelle `css/main.css`, Build nach `css/output.css`)
- **Icons:** Lucide (lokal, `js/lucide.min.js`)
- **Schriften:** lokal, `@font-face` in `css/fonts.css`
- **Hosting:** Apache mit `mod_rewrite`, `mod_headers`, `mod_deflate`, `mod_expires`

## Projektstruktur

```
index.html, leistungen.html, ueber-mich.html, referenzen.html,
faq.html, kontakt.html, impressum.html, datenschutz.html, agb.html, 404.html
en/             englische Fassung der Seiten
css/
  main.css      Tailwind-Quelle (Theme: Brand-Farben, Schriften, eigene Klassen)
  output.css    generiertes CSS (Build, s. u.)
  fonts.css     @font-face für lokale Schriften
fonts/          Plus Jakarta Sans, Playfair Display (woff2)
images/         Logos, Fotos, Favicons
js/
  lucide.min.js Icon-Bibliothek
.htaccess       Weiterleitung, Header, Caching
work/           Entwürfe & Archiv – nicht im Repo (.gitignore)
```

## Setup

Voraussetzung für den CSS-Build: Node.js. Die Seite selbst braucht keinen Build-Schritt außer dem CSS.

```bash
git clone <repo-url>
cd html

# CSS einmalig bauen
npx @tailwindcss/cli -i css/main.css -o css/output.css --minify

# oder während der Entwicklung
npx @tailwindcss/cli -i css/main.css -o css/output.css --watch
```

Lokal ansehen mit einem beliebigen statischen Server, z. B.:

```bash
python -m http.server 8000
```

Danach <http://localhost:8000/> öffnen. Hinweis: `.htaccess` wirkt dabei nicht (nur auf Apache).

Deployment: Dateien per FTP/SFTP in das Webroot bzw. Unterverzeichnis kopieren (`work/`, `.idea/`, `node_modules/` nicht hochladen). Es gibt keine CI/CD-Pipeline.

## Tests

Noch keine. Es gibt keine automatisierten Tests; Seiten und Links werden von Hand geprüft.

## Status & Roadmap

- Live auf kohlweg.de; `.htaccess` enthält noch die Staging-Einstellungen (siehe oben)
- Englische Fassung in `en/` ist neu und noch nicht committet
- Offen: Screenshots, Link-Check und Lighthouse-Messung, `package.json` für reproduzierbare Tailwind-Version

## Lizenz / Kontakt

Alle Rechte vorbehalten. Texte, Logos und Fotos gehören Sandra Kohlweg und dürfen nicht ohne Zustimmung weiterverwendet werden. Kontakt über <https://www.kohlweg.de/kontakt.html>.
