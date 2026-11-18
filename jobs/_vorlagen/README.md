# Jobseiten – Vorlagen für das CRM

Das CRM füllt diese Vorlagen aus und lädt das Ergebnis per FTP hoch.
Alle Stellenseiten liegen unter `/jobs/` (SFTP-Zugang des CRM ist auf diesen Ordner beschränkt), Englisch unter `/jobs/en/`.
Alle Pfade in den Vorlagen sind absolut (`/css/…`, `/jobs/…`), damit sie in `/jobs/` und `/jobs/en/` gleich funktionieren.

| Vorlage | Ziel | Platzhalter |
|---|---|---|
| `_vorlage_liste.de.html` | `/jobs/index.html` | `{{JOB_HEAD}}`, `{{JOB_COUNT}}`, `{{JOB_LIST}}` |
| `_vorlage_liste.en.html` | `/jobs/en/index.html` | `{{JOB_HEAD}}`, `{{JOB_COUNT}}`, `{{JOB_LIST}}` |
| `_vorlage_detail.de.html` | `/jobs/<slug>.html` | `{{JOB_HEAD}}`, `{{JOB_BODY}}` |
| `_vorlage_detail.en.html` | `/jobs/en/<slug>.html` | `{{JOB_HEAD}}`, `{{JOB_BODY}}` |

Gleicher `<slug>` in DE und EN.

## `{{JOB_HEAD}}`

`<title>`, `<meta name="description">`, `<link rel="canonical">`, `<link rel="alternate" hreflang="de|en|x-default">`, JSON-LD (`JobPosting` auf Detailseiten).
Die Vorlage hat keinen eigenen `<title>`. `robots` setzt die Vorlage (`index, follow`).
Der Sprachumschalter DE/EN übernimmt sein Ziel aus dem `hreflang`-Link der anderen Sprache. Fehlt der Link, leitet das Script es aus der Adresse ab: `/jobs/<slug>.html` ↔ `/jobs/en/<slug>.html`.

## `{{JOB_COUNT}}`

Nur die Zahl, z. B. `7`. Die Vorlage schreibt „offene Stellen“ bzw. „open positions“ dahinter, das Script korrigiert die Einzahl.

## `{{JOB_LIST}}` – eine Kachel pro Stelle

```html
<a class="job-card" href="/jobs/projektleiter-sondermaschinenbau.html"
   data-bereich="technik" data-bereich-label="Technik" data-ort="Klagenfurt Kärnten Österreich">
  <span class="job-new">Neu</span>                                   <!-- optional, z. B. jünger als 7 Tage -->
  <h2 class="job-card-title">Projektleiter/in Sondermaschinenbau</h2>
  <p class="job-card-company">Industrieunternehmen, Maschinenbau</p>  <!-- anonym -->
  <p class="job-card-location">Klagenfurt, Kärnten</p>
  <ul class="job-tags">
    <li class="job-tag">Vollzeit</li>
    <li class="job-tag">ab 62.000 € / Jahr</li>
  </ul>
  <p class="job-card-snippet">Ein Satz zur Stelle.</p>
  <time class="job-card-date" datetime="2026-11-16">Veröffentlicht am 16.11.2026</time>
</a>
```

- `data-bereich`: Schlüssel für die Filter-Chips (klein, ohne Umlaute). Die Chips baut das Script aus den vorhandenen Werten, `data-bereich-label` ist der angezeigte Name.
- `data-ort`: Suchbegriffe für das Feld „Wo“ (Ort, Bundesland, Land).
- Reihenfolge der Kacheln = Reihenfolge der Liste (neueste zuerst).
- Leere Liste: `{{JOB_LIST}}` leer lassen, `{{JOB_COUNT}}` = `0`. Die Seite zeigt dann einen Hinweis.

Am Desktop lädt die Liste beim Klick die Detailseite der Kachel und zeigt deren `{{JOB_BODY}}` rechts an. Auf dem Handy öffnet die Kachel die Detailseite.

## `{{JOB_BODY}}` – Inhalt der Detailseite

```html
<header class="job-header">
  <h1 class="job-title">Projektleiter/in Sondermaschinenbau</h1>
  <p class="job-company">Industrieunternehmen, Maschinenbau</p>
  <p class="job-location">Klagenfurt, Kärnten · Vollzeit</p>
  <ul class="job-tags"><li class="job-tag">Vollzeit</li><li class="job-tag">ab 62.000 € / Jahr</li></ul>
  <div class="job-actions">
    <a class="job-apply" href="#" data-title="Projektleiter/in Sondermaschinenbau">Jetzt bewerben</a>
    <button type="button" class="job-copy" data-job-copy><span>Link kopieren</span></button>
  </div>
</header>

<section class="job-section">
  <h2>Auf einen Blick</h2>
  <dl class="job-facts">
    <div class="job-fact"><dt>Standort</dt><dd>Klagenfurt, Kärnten</dd></div>
    <div class="job-fact"><dt>Arbeitszeit</dt><dd>Vollzeit</dd></div>
  </dl>
</section>

<section class="job-section">
  <h2>Ihre Aufgaben</h2>
  <ul><li>…</li></ul>
</section>
<!-- weitere job-section: Ihr Profil, Das Angebot … (EN: Your role, Your profile, What we offer) -->

<section class="job-section">
  <p class="job-salary">Für diese Position gilt ein Jahresbruttogehalt ab 62.000 €. Eine Überzahlung ist je nach Erfahrung vorgesehen.</p>
</section>
```

- `job-apply` mit `href="#"` und `data-title`: Das Script setzt `mailto:` mit Betreff „Bewerbung: <Titel>“ bzw. „Application: <title>“. Die Adresse steht nicht im HTML (Schutz vor Spam-Bots).
- `job-copy` mit `data-job-copy` kopiert die Adresse der Stelle.
- Kontakt (Sandra), Vertraulichkeitshinweis und „Alle Stellen“ stehen bereits in der Vorlage, nicht in `{{JOB_BODY}}`.
- In `<section class="job-section">` sind `h2`, `h3`, `p`, `ul`, `ol`, `a` gestaltet. Weitere Klassen: `job-facts`/`job-fact`, `job-salary`, `job-note`.
- Österreich: Die Mindestgehaltsangabe ist Pflicht, deshalb `job-salary` bei AT-Stellen immer füllen.

## Weitere Dateien

- `/jobs/vergeben.html` (noindex): wird über `/jobs/.htaccess` bei 404 angezeigt, auch für `/jobs/en/`, z. B. für gelöschte Stellen.
- `/jobs/sitemap-jobs.xml`: Sitemap aller Stellenseiten (DE und EN), in `robots.txt` eingetragen.
- `/jobs/_vorlagen/.htaccess`: sperrt die Vorlagen für Browser (403), SFTP-Zugriff bleibt möglich.
- `/css/jobs.css`, `/js/jobs.js`: Gestaltung und Verhalten aller Jobseiten. Werden mit der Website hochgeladen, nicht vom CRM.
