/* Kohlweg Headhunting – Jobbörse: Suche, Filter, Detailansicht, Bewerben-Link */
(function () {
    var EN = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0;
    var T = EN ? {
        one: 'open position', many: 'open positions', all: 'All',
        copy: 'Copy link', copied: 'Link copied', subject: 'Application: ', more: 'Open job page',
        none: 'No matching position found', noneText: 'Change your search or write to me directly – I fill many positions without advertising them.'
    } : {
        one: 'offene Stelle', many: 'offene Stellen', all: 'Alle',
        copy: 'Link kopieren', copied: 'Link kopiert', subject: 'Bewerbung: ', more: 'Zur Stellenseite',
        none: 'Keine passende Stelle gefunden', noneText: 'Ändern Sie die Suche oder schreiben Sie mir direkt – viele Stellen besetze ich, ohne sie auszuschreiben.'
    };
    var MAIL = ['sandra', 'kohlweg.de'].join('@');

    function icons() { if (window.lucide) window.lucide.createIcons(); }
    function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }

    /* Bewerben-Knöpfe: Adresse per Script, Betreff aus data-title (gegen Spam-Bots) */
    function wireApply(root) {
        root.querySelectorAll('a.job-apply').forEach(function (a) {
            var h = a.getAttribute('href');
            if (!h || h === '#' || h.indexOf('mailto:') === 0 && h.indexOf('@') === -1) {
                var title = a.getAttribute('data-title') || (root.querySelector('.job-title') || {}).textContent || '';
                a.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(T.subject + title.trim());
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

    /* Sprachumschalter: Ziel aus <link rel="alternate" hreflang> übernehmen, das das CRM setzt */
    document.querySelectorAll('[data-lang-switch]').forEach(function (a) {
        var alt = document.querySelector('link[rel="alternate"][hreflang="' + a.getAttribute('data-lang-switch') + '"]');
        if (alt && alt.href) { a.href = alt.href; return; }
        // Fallback aus der Adresse: /jobs/<slug>.html <-> /jobs/en/<slug>.html
        var p = location.pathname;
        if (/^\/jobs\/en\//.test(p)) a.href = p.replace(/^\/jobs\/en\//, '/jobs/');
        else if (/^\/jobs\//.test(p)) a.href = p.replace(/^\/jobs\//, '/jobs/en/');
    });

    wireApply(document);

    /* ---------------- Liste ---------------- */
    var list = document.getElementById('job-list');
    if (!list) return;
    var pane = document.getElementById('job-pane');
    var cards = Array.prototype.slice.call(list.querySelectorAll('.job-card'));
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
        var id = card.getAttribute('href').split('/').pop().replace(/\.html$/, '');
        if (history.replaceState) history.replaceState(null, '', '#' + id);
        var url = card.href;
        var render = function (html) {
            if (current !== card) return;
            pane.innerHTML = html + '<a class="job-pane-more" href="' + url + '">' + T.more + ' <i data-lucide="arrow-right"></i></a>';
            pane.scrollTop = 0;
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
            if (!wide.matches || e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; // Handy: echte Detailseite
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
        document.getElementById('job-none').hidden = false;
        if (pane) pane.hidden = true;
        return;
    }
    var start = location.hash.slice(1), startCard = null;
    if (start) cards.forEach(function (c) { if (c.getAttribute('href').split('/').pop().replace(/\.html$/, '') === start) startCard = c; });
    filter();
    if (wide.matches && startCard) show(startCard);
})();
