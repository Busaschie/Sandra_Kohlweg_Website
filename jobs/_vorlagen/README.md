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
- Leere Liste: `{{JOB_LIST}}` = `<div class="job-none"><p>…</p></div>`, `{{JOB_COUNT}}` = `0`. Die Vorlage blendet dann ihren eigenen Hinweis aus.

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

- Bewerben (`a.job-apply` oder `a.job-apply-link`) mit `href="#"`: Das Script setzt `mailto:cv@kohlweg.de`. Betreff ist `data-subject`, wenn vorhanden (mit Slug, damit das CRM die Bewerbung zuordnet), sonst „Bewerbung: <data-title>“ bzw. „Application: <data-title>“. Die Adresse steht nicht im HTML (Schutz vor Spam-Bots).
- `job-copy` mit `data-job-copy` kopiert die Adresse der Stelle.
- Kontakt (Sandra), Vertraulichkeitshinweis und „Alle Stellen“ stehen bereits in der Vorlage, nicht in `{{JOB_BODY}}`.
- In `<section class="job-section">` sind `h2`, `h3`, `p`, `ul`, `ol`, `a` gestaltet. Weitere Klassen: `job-facts`/`job-fact`, `job-salary`, `job-note`.
- Österreich: Die Mindestgehaltsangabe ist Pflicht, deshalb `job-salary` bei AT-Stellen immer füllen.

## Weitere Dateien

- `/jobs/vergeben.html` (noindex): wird über `/jobs/.htaccess` bei 404 angezeigt, auch für `/jobs/en/`, z. B. für gelöschte Stellen.
- `/jobs/sitemap-jobs.xml`: Sitemap aller Stellenseiten (DE und EN), in `robots.txt` eingetragen.
- `/jobs/_vorlagen/.htaccess`: sperrt die Vorlagen für Browser (403), SFTP-Zugriff bleibt möglich.
- `/css/jobs.css`, `/js/jobs.js`: Gestaltung und Verhalten aller Jobseiten. Werden mit der Website hochgeladen, nicht vom CRM.

## Markup, das das CRM aktuell erzeugt (gestaltet in `/css/jobs.css`)

Beide Varianten sind gestaltet: die Beispiele oben und das folgende Markup des CRM.

Detail (`{{JOB_BODY}}`):

```html
<article class="job">
  <h1>Titel</h1>
  <dl class="job-facts"><dt>Ort</dt><dd>…</dd><dt>Arbeitszeit</dt><dd>…</dd><dt>Bereich</dt><dd>…</dd><dt>Gehalt</dt><dd>…</dd></dl>
  <div class="job-text"><p>…</p><h2>Ihre Aufgaben</h2><ul><li>…</li></ul></div>
  <p class="job-company">Industrieunternehmen, Maschinenbau</p>          <!-- optional -->
  <ul class="job-tags"><li class="job-tag">Vollzeit</li></ul>            <!-- optional -->
  <section class="job-salary"><p>Jahresbruttogehalt ab …</p></section>   <!-- optional, nach job-text -->
  <p class="job-apply"><a class="job-apply-link button" href="#" data-title="Titel" data-subject="Bewerbung: Titel (slug)">Jetzt bewerben</a></p>
  <p class="job-legal"><a href="…">Datenschutz</a> · <a href="…">Impressum</a></p>
</article>
```

Liste (`{{JOB_LIST}}`):

```html
<article class="job-card">
  <h2><a href="/jobs/<slug>.html">Titel</a></h2>
  <p class="job-meta">Ort · Bereich</p>
  <p class="job-date">Veröffentlicht am <time datetime="2026-11-18">18.11.2026</time></p>
  <a class="job-more" href="/jobs/<slug>.html">Zur Stelle</a>
</article>
```

Leere Liste: `<div class="job-none"><p>…</p></div>` mit `{{JOB_COUNT}}` = `0` (die Vorlage blendet ihren eigenen Hinweis dann aus).
Zusätzlich an `article.job-card`: `data-bereich`, `data-bereich-label` (Filter-Chips), `data-ort` (Feld „Wo“) sowie `p.job-card-company`, `ul.job-tags`, `p.job-card-snippet`.

## Darstellung wie im Prototyp (`/jobs-1/`)

`/js/jobs.js` bringt das CRM-Markup im Browser in den Aufbau des Prototyps: Kopf mit Titel, Bereich, Ort · Arbeitszeit, „Jetzt bewerben“ und „Link kopieren“ (bleibt beim Scrollen stehen), Eckdaten als Kacheln „Auf einen Blick“, ein Abschnitt je `h2`. Kacheln bis 7 Tage alt bekommen „Neu“.
Kontakt (Sandra mit Foto) und Vertraulichkeitshinweis stehen in der Detail-Vorlage innerhalb von `data-job-body` und erscheinen dadurch auch rechts in der Liste.
Für die Kopfzeile liest das Script die Eckdaten über ihre Bezeichnungen: `Ort`/`Location`, `Arbeitszeit`/`Working hours`, `Bereich`/`Area` (sonst Position 1–3).
Für Kacheln wie im Prototyp (anonymer Firmenname, Merkmale, Teaser) müsste das CRM zusätzlich `job-card-company`, `job-tags` und `job-card-snippet` liefern.
