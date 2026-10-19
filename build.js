// Static site generator for mccate.com. No dependencies.
// Reads content/<lang>/*.json (edited via the Decap CMS at /admin) and writes dist/.
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'dist');
const BASE = 'https://www.mccate.com';
const DEFAULT = 'en';
const PAGES = ['home', 'services', 'cases', 'about', 'contact'];

const LANGS = fs.readdirSync(path.join(ROOT, 'content'))
  .filter(d => fs.statSync(path.join(ROOT, 'content', d)).isDirectory())
  .sort((a, b) => (a === DEFAULT ? -1 : b === DEFAULT ? 1 : a.localeCompare(b)));

const read = (lang, name) =>
  JSON.parse(fs.readFileSync(path.join(ROOT, 'content', lang, name + '.json'), 'utf8'));

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const paras = s => String(s || '').split(/\n\s*\n/).filter(Boolean)
  .map(p => `<p>${esc(p.trim()).replace(/\n/g, '<br>')}</p>`).join('\n');

const data = {};
for (const l of LANGS) {
  data[l] = { site: read(l, 'site') };
  for (const p of PAGES) data[l][p] = read(l, p);
}

// URL of a page in a language: en at root, others under /<lang>/, optional translated slugs.
function urlFor(lang, key) {
  const slug = key === 'home' ? '' : ((data[lang].site.slugs || {})[key] || key);
  const prefix = lang === DEFAULT ? '' : '/' + lang;
  return (prefix + '/' + (slug ? slug + '/' : '')).replace(/\/{2,}/g, '/');
}

const ART = {
  rings: `<svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g fill="none" stroke="#fff" stroke-width="3"><circle cx="200" cy="200" r="140" stroke-dasharray="720 160"/><circle cx="200" cy="200" r="88" stroke-dasharray="400 153" stroke-opacity=".65"/><circle cx="200" cy="200" r="38" stroke-opacity=".4"/></g><circle cx="200" cy="200" r="12" fill="#fff"/><path d="M338 232 l-14 -22 l30 4z" fill="#fff"/></svg>`,
  bars: `<svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect x="70" y="190" width="72" height="110" rx="36" fill="#6b6b6b"/><rect x="162" y="135" width="92" height="165" rx="46" fill="#fff"/><rect x="274" y="70" width="80" height="230" rx="40" fill="#e0241b"/><rect x="50" y="300" width="300" height="3" fill="#fff" opacity=".6"/></svg>`
};
const artBg = a => (a === 'bars' ? '#000' : '#e0241b');

const PLAN = `<svg class="bg-plan" viewBox="0 0 420 460" aria-hidden="true"><rect class="parcel" x="10" y="10" width="120" height="100"/><rect class="parcel" x="140" y="10" width="130" height="70"/><rect class="parcel" x="280" y="10" width="130" height="150"/><rect class="parcel" x="10" y="120" width="90" height="130"/><rect class="parcel" x="110" y="90" width="160" height="160"/><rect class="target" x="280" y="170" width="130" height="110"/><rect class="parcel" x="10" y="260" width="150" height="110"/><rect class="parcel" x="170" y="260" width="100" height="190"/><rect class="parcel" x="280" y="290" width="130" height="160"/><path class="road" d="M60 330 C 60 230, 190 300, 190 200 S 250 150, 345 225"/></svg>`;

function layout(lang, key, bodyHtml) {
  const d = data[lang];
  const site = d.site;
  const seo = d[key].seo || {};
  const self = BASE + urlFor(lang, key);
  const alts = LANGS.map(l => `  <link rel="alternate" hreflang="${l}" href="${BASE + urlFor(l, key)}">`).join('\n') +
    `\n  <link rel="alternate" hreflang="x-default" href="${BASE + urlFor(DEFAULT, key)}">`;
  const nav = PAGES.map(k =>
    `<a href="${urlFor(lang, k)}"${k === key ? ' aria-current="page"' : ''}>${esc(site.nav[k])}</a>`).join('\n        ');
  const switcher = LANGS.length > 1
    ? `<span class="lang">${LANGS.map(l => l === lang
        ? `<span aria-current="true">${l.toUpperCase()}</span>`
        : `<a href="${urlFor(l, key)}" hreflang="${l}" lang="${l}">${l.toUpperCase()}</a>`).join(' ')}</span>` : '';
  const jsonld = key === 'home' ? `
  <script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'ProfessionalService', name: site.brand + ' & Company',
    url: BASE + '/', description: seo.description, founder: { '@type': 'Person', name: site.founder },
    areaServed: ['NL', 'SE'], telephone: site.phoneRaw, email: site.email
  })}</script>` : '';
  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(seo.title)}</title>
  <meta name="description" content="${esc(seo.description)}">
  <link rel="canonical" href="${self}">
${alts}
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${esc(site.brand)} &amp; Company">
  <meta property="og:title" content="${esc(seo.title)}">
  <meta property="og:description" content="${esc(seo.description)}">
  <meta property="og:url" content="${self}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=Hanken+Grotesk:wght@400;500;600&display=swap">
  <link rel="stylesheet" href="/style.css">${jsonld}
</head>
<body>
  <a class="skip" href="#main">${esc(site.skip)}</a>
  <header class="hdr">
    <div class="wrap">
      <a class="brand" href="${urlFor(lang, 'home')}">${esc(site.brand)} <span>&amp; Company</span></a>
      <nav class="nav" aria-label="Main">
        ${nav}
        ${switcher}
      </nav>
    </div>
  </header>

  <main id="main">
${bodyHtml}
  </main>

  <footer class="site-footer">
    <div class="wrap">
      <p class="tagline">${site.tagline.map(esc).join('<br>')}</p>
      <p>${esc(site.brand)} &amp; Company<br>${esc(site.location)}<br><a href="mailto:${esc(site.email)}">${esc(site.email)}</a><br><a href="tel:${esc(site.phoneRaw)}">${esc(site.phone)}</a></p>
      <p class="fine">&copy; ${new Date().getFullYear()} ${esc(site.brand)} &amp; Company</p>
    </div>
  </footer>
</body>
</html>
`;
}

const band = (title, sub, image, extra = '') => `    <div class="band">
${image ? `      <img src="${esc(image)}" alt="">\n` : ''}${extra}      <div class="wrap">
        <h1><span class="line"><span style="--i:0">${esc(title)}</span></span></h1>
        ${sub ? `<p class="sub">${esc(sub)}</p>` : ''}
      </div>
    </div>`;

const emailLine = (site, intro) => `    <section>
      <div class="wrap">
        ${intro ? `<p class="cta-sub">${esc(intro)}</p>` : ''}
        <a class="cta-line" href="mailto:${esc(site.email)}">${esc(site.email)}</a>
      </div>
    </section>`;

function caseVisual(c) {
  if (c.image) return `<img src="${esc(c.image)}" alt="${esc(c.imageAlt || c.title)}" loading="lazy">`;
  return ART[c.art] || '';
}

const builders = {
  home(lang) {
    const { site, home: h, cases } = data[lang];
    const lines = (h.hero.lines || []).map((l, i) => `          <span class="line"><span style="--i:${i}">${esc(l)}</span></span>`).join('\n');
    const rows = (h.services || []).map(s => `          <a class="index-row" href="${urlFor(lang, 'services')}#${esc(s.anchor)}">
            <h3>${esc(s.title)}</h3>
            <p>${esc(s.text)}</p>
          </a>`).join('\n');
    const tiles = (cases.cases || []).slice(0, 4).map(c => `          <a class="tile" href="${urlFor(lang, 'cases')}#${esc(c.id)}" style="background:${artBg(c.art)}">
            ${caseVisual(c)}
            <div class="cap">
              <h3>${esc(c.title)}</h3>
              <p>${esc(c.summary)}</p>
            </div>
          </a>`).join('\n');
    return `    <div class="cover">
${h.hero.image ? `      <img src="${esc(h.hero.image)}" alt="" fetchpriority="high">\n` : ''}      <div class="wrap">
        <h1>
${lines}
        </h1>
        <div class="cover-foot">
          <p>${esc(h.hero.intro)}</p>
          <a class="btn" href="${urlFor(lang, 'contact')}">${esc(h.hero.button)}</a>
        </div>
      </div>
    </div>

    <section>
      <div class="wrap">
        <p class="statement">${esc(h.statement)}</p>
      </div>
    </section>

    <section style="padding-top:0">
      <div class="wrap">
        <p class="kicker">${esc(h.servicesHeading)}</p>
        <div class="index">
${rows}
        </div>
      </div>
    </section>

    <section style="padding-top:0">
      <div class="wrap">
        <p class="kicker">${esc(h.workHeading)}</p>
        <div class="tiles">
${tiles}
        </div>
        <p class="more"><a href="${urlFor(lang, 'cases')}">${esc(h.allCases)}</a></p>
      </div>
    </section>

    <section class="mission">
      <div class="wrap">
        <p class="statement">${esc(h.mission)}</p>
      </div>
    </section>

${emailLine(site, h.cta)}`;
  },

  services(lang) {
    const { site, services: s } = data[lang];
    const items = (s.items || []).map((it, i, arr) => {
      const bullets = (it.bullets || []).filter(Boolean);
      return `        <div class="svc" id="${esc(it.id)}"${i === arr.length - 1 ? ' style="border-bottom:2px solid var(--ink)"' : ''}>
          <h2>${esc(it.title)}</h2>
          <div>
            <p>${esc(it.text)}</p>
${bullets.length ? `            <ul>\n${bullets.map(b => `              <li>${esc(b)}</li>`).join('\n')}\n            </ul>` : ''}
          </div>
        </div>`;
    }).join('\n');
    return `${band(s.title, s.sub, s.image, '      ' + PLAN + '\n')}

    <section>
      <div class="wrap">
${items}
      </div>
    </section>

${emailLine(site, s.cta)}`;
  },

  cases(lang) {
    const { cases: c } = data[lang];
    const L = c.labels || {};
    const items = (c.cases || []).map((x, i, arr) => {
      const rows = ['challenge', 'approach', 'result'].filter(k => (x[k] || '').trim())
        .map(k => `              <dt>${esc(L[k] || k)}</dt><dd>${esc(x[k])}</dd>`).join('\n');
      return `        <article class="case-big" id="${esc(x.id)}"${i === arr.length - 1 ? ' style="border-bottom:2px solid var(--ink)"' : ''}>
          <div class="art" style="background:${artBg(x.art)}">${caseVisual(x)}</div>
          <div>
            <h2>${esc(x.title)}</h2>
            <p>${esc(x.summary)}</p>
${rows ? `            <dl>\n${rows}\n            </dl>` : ''}
          </div>
        </article>`;
    }).join('\n');
    return `${band(c.title, c.sub, c.image)}

    <section>
      <div class="wrap">
${items}
      </div>
    </section>`;
  },

  about(lang) {
    const { about: a } = data[lang];
    return `${band(a.title, a.sub, a.image)}

    <section>
      <div class="wrap profile">
        <div class="portrait">${a.portrait ? `<img src="${esc(a.portrait)}" alt="${esc(a.portraitAlt || a.name)}" loading="lazy">` : ''}</div>
        <div>
          <h2>${esc(a.name)}</h2>
          <p class="role">${esc(a.role)}</p>
${paras(a.body)}
${a.linkedinLabel ? `          <p><a href="${esc(data[lang].site.linkedin)}" rel="noopener">${esc(a.linkedinLabel)}</a></p>` : ''}
        </div>
      </div>
    </section>

    <section class="mission">
      <div class="wrap">
        <p class="statement">${esc(a.mission)}</p>
      </div>
    </section>`;
  },

  contact(lang) {
    const { site, contact: c } = data[lang];
    return `${band(c.title, c.sub, c.image)}

    <section>
      <div class="wrap">
        <a class="cta-line" href="mailto:${esc(site.email)}">${esc(site.email)}</a>
        <ul class="contact-list">
          <li><span>${esc(c.phoneLabel)}</span><a href="tel:${esc(site.phoneRaw)}">${esc(site.phone)}</a></li>
          <li><span>LinkedIn</span><a href="${esc(site.linkedin)}" rel="noopener">${esc(site.founder)}</a></li>
          <li><span>${esc(c.basedLabel)}</span>${esc(site.location)}</li>
        </ul>
      </div>
    </section>`;
  }
};

// ---- build ----
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const sitemap = [];
for (const lang of LANGS) {
  for (const key of PAGES) {
    const url = urlFor(lang, key);
    const dir = path.join(OUT, url);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), layout(lang, key, builders[key](lang)));
    sitemap.push(BASE + url);
  }
}

const copy = (src, dst) => { if (fs.existsSync(src)) fs.cpSync(src, dst, { recursive: true }); };
copy(path.join(ROOT, 'style.css'), path.join(OUT, 'style.css'));
copy(path.join(ROOT, 'images'), path.join(OUT, 'images'));
copy(path.join(ROOT, 'admin'), path.join(OUT, 'admin'));
copy(path.join(ROOT, 'robots.txt'), path.join(OUT, 'robots.txt'));
copy(path.join(ROOT, '_redirects'), path.join(OUT, '_redirects'));
fs.writeFileSync(path.join(OUT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap.map(u => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`);

console.log(`Built ${sitemap.length} pages in ${LANGS.join(', ')} -> dist/`);
