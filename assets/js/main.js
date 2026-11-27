// =============================================================================
// Tokens at Work — Homepage
// Version: 2.0 (2026-11-27)
//
// Changelog:
//   v2.0  2026-11-27  Aligned with multi-report config. Removed dead code
//                     (platforms, preview/draft status checks). Made tagClass
//                     generic. Topics derived from catalog.topics map.
//   v1.0  2026-11-22  Initial release.
//
// Depends on: /data/tokens-at-work/data/catalog.json
//   Required fields: topics, reports[], episodes[], metrics{}
// =============================================================================

document.addEventListener('DOMContentLoaded', async () => {
  // --- Mobile nav toggle ---
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.primary-nav');
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
    });
    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) {
        menuButton.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      }
    });
  }

  // --- Dynamic year ---
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  // --- Resolve site root ---
  const scriptElement = document.querySelector('script[src*="main.js"]');
  if (!scriptElement) return;
  const siteRoot = new URL('../../', scriptElement.src);

  // --- Load catalog ---
  let catalog;
  try {
    const response = await fetch(new URL('data/catalog.json', siteRoot));
    if (!response.ok) throw new Error(`Catalog request failed: ${response.status}`);
    catalog = await response.json();
  } catch (error) {
    document.querySelectorAll('[data-report-list], [data-archive], [data-topic-reports], [data-episode-list], [data-latest-episode], [data-topic-episode]').forEach((el) => {
      el.innerHTML = '<p class="empty-state">The publication index is temporarily unavailable.</p>';
    });
    console.error('Tokens at Work catalog could not be loaded.', error);
    return;
  }

  // --- Helpers ---
  const siteUrl = (path) => new URL(String(path || '').replace(/^\//, ''), siteRoot).href;
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

  // Topics map from catalog (e.g. { "ai": "AI Infrastructure", "quantum": "Quantum Computing" })
  const topics = catalog.topics || {};
  const topicName = (key) => topics[key] || key;
  const tagClass = (topic) => 'tag-' + (topic || 'default');

  // --- Data ---
  const reports = [...(Array.isArray(catalog.reports) ? catalog.reports : [])]
    .filter((r) => r && r.week && r.url && r.title)
    .sort((a, b) => b.week.localeCompare(a.week) || String(a.topic).localeCompare(String(b.topic)));

  const episodes = [...(Array.isArray(catalog.episodes) ? catalog.episodes : [])]
    .filter((ep) => ep && ep.title)
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));

  // --- Renderers ---
  const reportCard = (report) => `<article class="report-card"><div class="card-topline"><span class="topic-tag ${tagClass(report.topic)}">${escapeHtml(topicName(report.topic).toUpperCase())}</span><span class="mono">${escapeHtml(report.week)}</span></div><h3>${escapeHtml(report.title)}</h3><p>${escapeHtml(report.summary || '')}</p><div class="card-footer"><span>${report.minutes ? `${escapeHtml(report.minutes)} MIN READ · ` : ''}WEEKLY INTELLIGENCE</span><a href="${escapeHtml(siteUrl(report.url))}" aria-label="Open ${escapeHtml(report.title)}">↗</a></div></article>`;

  const episodeCard = (ep) => `<article class="episode-row"><span class="mono">${escapeHtml(ep.date || '')}</span><div><h3>${escapeHtml(ep.title)}</h3><p>${escapeHtml(ep.summary || '')}</p></div>${ep.url ? `<a class="text-link" href="${escapeHtml(siteUrl(ep.url))}">Episode details ↗</a>` : ''}</article>`;

  // --- Metrics ---
  document.querySelectorAll('[data-metric]').forEach((el) => {
    const key = el.dataset.metric;
    if (catalog.metrics && catalog.metrics[key] !== undefined) el.textContent = String(catalog.metrics[key]);
  });

  // --- Latest reports grid ---
  document.querySelectorAll('[data-report-list]').forEach((el) => {
    const limit = Number(el.dataset.limit) || reports.length;
    const items = reports.slice(0, limit);
    el.innerHTML = items.length ? items.map(reportCard).join('') : '<p class="empty-state">The first weekly reports are in preparation.</p>';
  });

  // --- Per-topic report sections ---
  document.querySelectorAll('[data-topic-reports]').forEach((el) => {
    const items = reports.filter((r) => r.topic === el.dataset.topicReports);
    el.innerHTML = items.length ? `<div class="report-grid">${items.map(reportCard).join('')}</div>` : '<p class="empty-state">The first topic reports are in preparation.</p>';
  });

  // --- Archive (grouped by year → week) ---
  const archive = document.querySelector('[data-archive]');
  if (archive) {
    const years = new Map();
    reports.forEach((r) => {
      const [year, week] = r.week.split('-');
      if (!/^\d{4}$/.test(year || '') || !/^W\d{2}$/.test(week || '')) return;
      if (!years.has(year)) years.set(year, new Map());
      const weeks = years.get(year);
      if (!weeks.has(week)) weeks.set(week, []);
      weeks.get(week).push(r);
    });
    archive.innerHTML = years.size
      ? [...years.entries()].sort((a, b) => b[0].localeCompare(a[0])).map(([year, weeks]) =>
          `<section class="archive-year"><h2>${escapeHtml(year)}</h2>${[...weeks.entries()].sort((a, b) => b[0].localeCompare(a[0])).map(([week, items]) =>
            `<div class="week-group"><h3>${escapeHtml(week)}</h3>${items.map((r) =>
              `<a class="archive-row" href="${escapeHtml(siteUrl(r.url))}"><span class="topic-tag ${tagClass(r.topic)}">${escapeHtml(topicName(r.topic))}</span><span class="archive-title">${escapeHtml(r.title)}</span><span aria-hidden="true">↗</span></a>`
            ).join('')}</div>`
          ).join('')}</section>`
        ).join('')
      : '<p class="empty-state">No reports have been published yet.</p>';
  }

  // --- Episode list ---
  const episodeList = document.querySelector('[data-episode-list]');
  if (episodeList) {
    episodeList.innerHTML = episodes.length
      ? `<div class="episode-list">${episodes.map(episodeCard).join('')}</div>`
      : '<p class="empty-state">The first weekly podcast briefings are in preparation.</p>';
  }

  // --- Latest episode (hero) ---
  const latestEpisode = document.querySelector('[data-latest-episode]');
  if (latestEpisode) {
    latestEpisode.innerHTML = episodes.length
      ? episodeCard(episodes[0])
      : '<p class="empty-state">Our first topic briefings are in preparation.</p>';
  }

  // --- Per-topic episode (hero section) ---
  document.querySelectorAll('[data-topic-episode]').forEach((el) => {
    const episode = episodes.find((ep) => (Array.isArray(ep.topics) ? ep.topics : []).includes(el.dataset.topicEpisode));
    el.innerHTML = episode
      ? episodeCard(episode)
      : `<div class="episode-preview"><strong>First topic briefing in preparation</strong><p>Opening briefings cover ${Object.values(topics).join(' and ')}.</p><a class="text-link" href="${escapeHtml(siteUrl('archive/index.html'))}">View published episodes →</a></div>`;
  });
});   
