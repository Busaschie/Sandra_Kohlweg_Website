/* Kohlweg Headhunting – Jobbörse: Suche, Filter, Detailansicht, Bewerben-Link */
(function () {
    var EN = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0;
    var T = EN ? {
        one: 'open position', many: 'open positions', all: 'All',
        copy: 'Copy link', copied: 'Link copied', subject: 'Application: ', more: 'Open job page', glance: 'At a glance', isNew: 'New',
        keys: { loc: ['location', 'place'], hours: ['working hours', 'hours', 'type'], area: ['area', 'field', 'department'] },
        none: 'No matching position found', noneText: 'Change your search or write to me directly – I fill many positions without advertising them.'
    } : {
        one: 'offene Stelle', many: 'offene Stellen', all: 'Alle',
        copy: 'Link kopieren', copied: 'Link kopiert', subject: 'Bewerbung: ', more: 'Zur Stellenseite', glance: 'Auf einen Blick', isNew: 'Neu',
        keys: { loc: ['ort', 'standort'], hours: ['arbeitszeit'], area: ['bereich'] },
        none: 'Keine passende Stelle gefunden', noneText: 'Ändern Sie die Suche oder schreiben Sie mir direkt – viele Stellen besetze ich, ohne sie auszuschreiben.'
    };
    var MAIL = ['cv', 'kohlweg.de'].join('@'); // Bewerbungspostfach, landet im CRM

    function icons() { if (window.lucide) window.lucide.createIcons(); }
    function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }

    /* Bewerben-Knöpfe: Adresse per Script, Betreff aus data-title (gegen Spam-Bots) */
    function wireApply(root) {
        root.querySelectorAll('a.job-apply, a.job-apply-link').forEach(function (a) {
            var h = a.getAttribute('href');
            if (!h || h === '#' || h.indexOf('mailto:') === 0 && h.indexOf('@') === -1) {
                // data-subject vom CRM bevorzugen: enthält den Slug, über den das CRM die Bewerbung zuordnet
                var subject = a.getAttribute('data-subject');
                if (!subject) {
                    var title = a.getAttribute('data-title') || (root.querySelector('.job-title') || {}).textContent || '';
                    subject = T.subject + title.trim();
                }
                a.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(subject);
            }
        });
        root.querySelectorAll('[data-job-copy]').forEach(function (b) {
            b.addEventListener('click', function () {
                var url = b.getAttribute('data-url') || location.href, label = b.querySelector('span') || b;
                if (!navigator.clipboard) return;
                navigator.clipboard.writeText(url).then(function () {
                    label.textContent = T.copied;
                    setTimeout(function () { label.textContent = T.copy; }, 2000);
                }, function () {});
            });
        });
    }


    /* CRM-Markup (article.job) in den Aufbau des Prototyps bringen:
       Kopf mit Titel, Ort · Arbeitszeit, Bereich und Knöpfen; Eckdaten als Kacheln; Abschnitte je h2 */
    function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; }
    function enhance(root) {
        root.querySelectorAll('article.job:not(.is-enhanced)').forEach(function (job) {
            job.classList.add('is-enhanced');
            var h1 = job.querySelector(':scope > h1');
            var facts = job.querySelector(':scope > dl.job-facts');
            var text = job.querySelector(':scope > .job-text');
            var apply = job.querySelector(':scope > .job-apply a, :scope > a.job-apply, :scope a.job-apply-link');
            var company = job.querySelector(':scope > .job-company');
            var location = job.querySelector(':scope > .job-location');
            var tags = job.querySelector(':scope > .job-tags');
            var salary = job.querySelector(':scope > .job-salary');
            var head = el('header', 'job-header');
            if (h1) { h1.classList.add('job-title'); head.appendChild(h1); }
            // Eckdaten auslesen
            var pairs = [];
            if (facts) facts.querySelectorAll('dt').forEach(function (dt) {
                var dd = dt.nextElementSibling;
                if (dd && dd.tagName === 'DD') pairs.push([dt.textContent.trim(), dd.textContent.trim(), dd]);
            });
            function find(keys, idx) {
                for (var i = 0; i < pairs.length; i++) if (keys.indexOf(pairs[i][0].toLowerCase()) !== -1) return pairs[i][1];
                return pairs[idx] ? pairs[idx][1] : '';
            }
            var area = find(T.keys.area, 2), loc = find(T.keys.loc, 0), hours = find(T.keys.hours, 1);
            // Firmenzeile: job-company vom CRM, sonst der Bereich
            if (company) head.appendChild(company);
            else if (area) head.appendChild(el('p', 'job-company', area));
            if (location) { location.classList.add('job-location'); head.appendChild(location); }
            else {
                var line = [loc, hours].filter(Boolean).join(' · ');
                if (line) head.appendChild(el('p', 'job-location', line));
            }
            if (tags) head.appendChild(tags);
            var actions = el('div', 'job-actions');
            if (apply) {
                var a = el('a', 'job-apply'); a.href = apply.getAttribute('href') || '#';
                a.innerHTML = '<i data-lucide="send"></i>'; a.appendChild(document.createTextNode(apply.textContent.trim()));
                ['data-title', 'data-subject'].forEach(function (k) { if (apply.hasAttribute(k)) a.setAttribute(k, apply.getAttribute(k)); });
                if (!a.hasAttribute('data-title') && h1) a.setAttribute('data-title', h1.textContent.trim());
                actions.appendChild(a);
            }
            var copy = el('button', 'job-copy'); copy.type = 'button'; copy.setAttribute('data-job-copy', '');
            copy.innerHTML = '<i data-lucide="link"></i>'; copy.appendChild(el('span', '', T.copy));
            actions.appendChild(copy); head.appendChild(actions);
            job.insertBefore(head, job.firstChild);
            // Eckdaten als Kacheln
            if (facts && pairs.length) {
                var sec = el('section', 'job-section'); sec.appendChild(el('h2', '', T.glance));
                var dl = el('dl', 'job-facts');
                pairs.forEach(function (p) {
                    var box = el('div', 'job-fact'); box.appendChild(el('dt', '', p[0]));
                    var dd = el('dd'); dd.innerHTML = p[2].innerHTML; box.appendChild(dd); dl.appendChild(box);
                });
                sec.appendChild(dl); facts.replaceWith(sec);
            }
            // Fließtext: je Zwischenüberschrift ein Abschnitt
            if (text) {
                var frag = document.createDocumentFragment(), cur = null;
                Array.prototype.slice.call(text.childNodes).forEach(function (n) {
                    if (n.nodeType === 1 && /^H2$/.test(n.tagName) || !cur) { cur = el('section', 'job-section job-text'); frag.appendChild(cur); }
                    cur.appendChild(n);
                });
                text.replaceWith(frag);
            }
            // Gehalt: als eigener Abschnitt nach dem Fließtext
            if (salary) {
                if (salary.tagName === 'P') { var ss = el('section', 'job-section'); salary.replaceWith(ss); ss.appendChild(salary); }
                else salary.classList.add('job-section');
            }
        });
        // Merkmale: Symbol wie im Prototyp (Uhr für Arbeitszeit, Geldschein für Gehalt)
        root.querySelectorAll('.job-tags > li').forEach(function (li) {
            if (li.querySelector('svg, i')) return;
            var t = li.textContent.toLowerCase(), icon = null;
            if (/€|eur|chf|gehalt|salary|jahr|year/.test(t)) icon = 'banknote';
            else if (/zeit|time|stunden|hours/.test(t)) icon = 'clock';
            else if (/homeoffice|remote|hybrid/.test(t)) icon = 'home';
            if (icon) { var i = document.createElement('i'); i.setAttribute('data-lucide', icon); li.insertBefore(i, li.firstChild); }
        });
        // Kacheln: „Neu“ bei Stellen bis 7 Tage
        root.querySelectorAll('article.job-card').forEach(function (c) {
            var t = c.querySelector('time[datetime]');
            if (!t || c.querySelector('.job-new')) return;
            var age = (Date.now() - new Date(t.getAttribute('datetime')).getTime()) / 864e5;
            if (age >= 0 && age <= 7) c.insertBefore(el('span', 'job-new', T.isNew), c.firstChild);
        });
    }

    /* Sprachumschalter: Ziel aus <link rel="alternate" hreflang> übernehmen, das das CRM setzt */
    document.querySelectorAll('[data-lang-switch]').forEach(function (a) {
        var alt = document.querySelector('link[rel="alternate"][hreflang="' + a.getAttribute('data-lang-switch') + '"]');
        if (alt && alt.href) { a.href = alt.href; return; }
        // Fallback aus der Adresse: /jobs/<slug>.html <-> /jobs/en/<slug>.html
        var p = location.pathname;
        if (/^\/jobs\/en\//.test(p)) a.href = p.replace(/^\/jobs\/en\//, '/jobs/');
        else if (/^\/jobs\//.test(p)) a.href = p.replace(/^\/jobs\//, '/jobs/en/');
    });

    enhance(document);
    wireApply(document);

    /* ---------------- Liste ---------------- */
    var list = document.getElementById('job-list');
    if (!list) return;
    var pane = document.getElementById('job-pane');
    var cards = Array.prototype.slice.call(list.querySelectorAll('.job-card'));
    // Kachel ist entweder selbst ein Link (a.job-card) oder enthält ihn (article.job-card > h2 > a)
    function linkOf(c) { return c.matches('a[href]') ? c : c.querySelector('h2 a[href], a[href]'); }
    function slugOf(c) { var a = linkOf(c); return a ? a.getAttribute('href').split('/').pop().replace(/\.html$/, '') : ''; }
    var empty = document.getElementById('job-empty');
    var countEl = document.getElementById('job-count');
    var q = document.getElementById('job-q'), l = document.getElementById('job-l');
    var chipBox = document.getElementById('job-chips');
    var wide = window.matchMedia('(min-width: 1024px)');
    var cache = {}, bereich = '', current = null;

    // Filter-Chips aus den Bereichen der Kacheln bauen
    var seen = {}, chips = [];
    cards.forEach(function (c) {
        var b = c.getAttribute('data-bereich');
        if (b && !seen[b]) seen[b] = c.getAttribute('data-bereich-label') || b.charAt(0).toUpperCase() + b.slice(1);
    });
    function addChip(value, label) {
        var btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'job-chip'; btn.textContent = label;
        btn.setAttribute('aria-pressed', value === '' ? 'true' : 'false');
        btn.addEventListener('click', function () {
            bereich = value;
            chips.forEach(function (x) { x.setAttribute('aria-pressed', x === btn ? 'true' : 'false'); });
            filter();
        });
        chipBox.appendChild(btn); chips.push(btn);
    }
    if (Object.keys(seen).length > 1) {
        addChip('', T.all);
        Object.keys(seen).sort().forEach(function (k) { addChip(k, seen[k]); });
    }

    function setCount(n) { countEl.textContent = n + ' ' + (n === 1 ? T.one : T.many); }

    function show(card) {
        if (!card || !pane) return;
        current = card;
        cards.forEach(function (c) { c.setAttribute('aria-current', c === card ? 'true' : 'false'); });
        var id = slugOf(card);
        if (history.replaceState) history.replaceState(null, '', '#' + id);
        var url = linkOf(card).href;
        var render = function (html) {
            if (current !== card) return;
            pane.innerHTML = html + '<a class="job-pane-more" href="' + url + '">' + T.more + ' <i data-lucide="arrow-right"></i></a>';
            pane.scrollTop = 0;
            enhance(pane);
            pane.querySelectorAll('[data-job-copy]').forEach(function (b) { b.setAttribute('data-url', url); });
            wireApply(pane); icons();
        };
        if (cache[url]) return render(cache[url]);
        fetch(url, { credentials: 'same-origin' }).then(function (r) { return r.ok ? r.text() : Promise.reject(); }).then(function (txt) {
            var doc = new DOMParser().parseFromString(txt, 'text/html');
            var body = doc.querySelector('[data-job-body]');
            cache[url] = body ? body.innerHTML : '';
            render(cache[url]);
        }).catch(function () { if (current === card) location.href = url; });
    }

    function filter() {
        var tq = norm(q.value).trim(), tl = norm(l.value).trim(), n = 0, first = null;
        cards.forEach(function (c) {
            var ok = (!bereich || c.getAttribute('data-bereich') === bereich)
                && (!tq || norm(c.textContent + ' ' + (c.getAttribute('data-bereich-label') || '')).indexOf(tq) !== -1)
                && (!tl || norm((c.getAttribute('data-ort') || '') + ' ' + c.textContent).indexOf(tl) !== -1);
            c.hidden = !ok;
            if (ok) { n++; if (!first) first = c; }
        });
        setCount(n);
        if (empty) empty.hidden = n !== 0 || cards.length === 0;
        if (wide.matches && first && (!current || current.hidden)) show(first);
    }

    cards.forEach(function (c) {
        c.addEventListener('click', function (e) {
            if (!wide.matches || e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1 || !linkOf(c)) return; // Handy: echte Detailseite
            e.preventDefault(); show(c);
        });
    });
    q.addEventListener('input', filter);
    l.addEventListener('input', filter);
    document.getElementById('job-form').addEventListener('submit', function (e) { e.preventDefault(); filter(); });
    wide.addEventListener('change', function () { if (wide.matches && !current) filter(); });

    // Leere Liste: Hinweis statt Filter
    if (!cards.length) {
        setCount(0);
        if (!list.querySelector('.job-none:not(#job-none)')) document.getElementById('job-none').hidden = false; // eigener Hinweis nur, wenn das CRM keinen liefert
        if (pane) pane.hidden = true;
        return;
    }
    var start = location.hash.slice(1), startCard = null;
    if (start) cards.forEach(function (c) { if (slugOf(c) === start) startCard = c; });
    filter();
    if (wide.matches && startCard) show(startCard);
})();
