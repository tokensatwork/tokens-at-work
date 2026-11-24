document.addEventListener('DOMContentLoaded', async () => {
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
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  // Derive the deploy root from this script's resolved URL. The script always
  // lives at <site-root>/assets/js/main.js, independent of page depth, a Pages
  // project prefix, or a custom domain.
  const scriptElement = document.querySelector('script[src$="/assets/js/main.js"]');
  if (!scriptElement) return;
  const siteRoot = new URL('../../', scriptElement.src);
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
  const siteUrl = (path) => new URL(String(path || '').replace(/^\//, ''), siteRoot).href;
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const topicName = (key) => catalog.topics?.[key] || key;
  const reports = [...(Array.isArray(catalog.reports) ? catalog.reports : [])].filter((r) => r && r.week && r.url && r.title).sort((a,b) => b.week.localeCompare(a.week) || String(a.topic).localeCompare(String(b.topic)));
  const episodes = [...(Array.isArray(catalog.episodes) ? catalog.episodes : [])].filter((ep) => ep && ep.title).sort((a,b) => String(b.date || '').localeCompare(String(a.date || '')));
  const tagClass = (topic) => topic === 'quantum' ? 'tag-quantum' : 'tag-ai';
  const reportCard = (report) => `<article class="report-card"><div class="card-topline"><span class="topic-tag ${tagClass(report.topic)}">${escapeHtml(topicName(report.topic).toUpperCase())}</span><span class="mono">${escapeHtml(report.week)}${report.status === 'preview' ? ' · PREVIEW' : ''}</span></div><h3>${escapeHtml(report.title)}</h3><p>${escapeHtml(report.summary || '')}</p><div class="card-footer"><span>${report.minutes ? `${escapeHtml(report.minutes)} MIN READ · ` : ''}${report.status === 'preview' ? 'LAUNCH PREVIEW' : 'WEEKLY INTELLIGENCE'}</span><a href="${escapeHtml(siteUrl(report.url))}" aria-label="Open ${escapeHtml(report.title)}">↗</a></div></article>`;

  document.querySelectorAll('[data-metric]').forEach((el) => {
    const key = el.dataset.metric;
    if (catalog.metrics && catalog.metrics[key] !== undefined) el.textContent = String(catalog.metrics[key]);
  });
  document.querySelectorAll('[data-report-list]').forEach((el) => {
    const limit = Number(el.dataset.limit) || reports.length;
    const items = reports.filter((r) => r.status !== 'draft').slice(0, limit);
    el.innerHTML = items.length ? items.map(reportCard).join('') : '<p class="empty-state">The first weekly reports are in preparation.</p>';
  });
  document.querySelectorAll('[data-topic-reports]').forEach((el) => {
    const items = reports.filter((r) => r.topic === el.dataset.topicReports && r.status !== 'draft');
    el.innerHTML = items.length ? `<div class="report-grid">${items.map(reportCard).join('')}</div>` : '<p class="empty-state">The first topic reports are in preparation.</p>';
  });
  const archive = document.querySelector('[data-archive]');
  if (archive) {
    const years = new Map();
    reports.filter((r) => r.status !== 'draft').forEach((r) => {
      const [year, week] = r.week.split('-');
      if (!/^\d{4}$/.test(year || '') || !/^W\d{2}$/.test(week || '')) return;
      if (!years.has(year)) years.set(year, new Map());
      const weeks = years.get(year);
      if (!weeks.has(week)) weeks.set(week, []);
      weeks.get(week).push(r);
    });
    archive.innerHTML = years.size ? [...years.entries()].sort((a,b) => b[0].localeCompare(a[0])).map(([year,weeks]) => `<section class="archive-year"><h2>${escapeHtml(year)}</h2>${[...weeks.entries()].sort((a,b) => b[0].localeCompare(a[0])).map(([week,items]) => `<div class="week-group"><h3>${escapeHtml(week)}</h3>${items.map((r) => `<a class="archive-row" href="${escapeHtml(siteUrl(r.url))}"><span class="topic-tag ${tagClass(r.topic)}">${escapeHtml(topicName(r.topic))}</span><span class="archive-title">${escapeHtml(r.title)}${r.status === 'preview' ? ' (preview)' : ''}</span><span aria-hidden="true">↗</span></a>`).join('')}</div>`).join('')}</section>`).join('') : '<p class="empty-state">No reports have been published yet.</p>';
  }
  const episodeCard = (ep) => `<article class="episode-row"><span class="mono">${escapeHtml(ep.date || '')}</span><div><h3>${escapeHtml(ep.title)}</h3><p>${escapeHtml(ep.summary || '')}</p></div>${ep.url ? `<a class="text-link" href="${escapeHtml(siteUrl(ep.url))}">Episode details ↗</a>` : ''}</article>`;
  const episodeList = document.querySelector('[data-episode-list]');
  if (episodeList) episodeList.innerHTML = episodes.length ? `<div class="episode-list">${episodes.map(episodeCard).join('')}</div>` : '<p class="empty-state">The first weekly podcast briefings are in preparation.</p>';
  const latestEpisode = document.querySelector('[data-latest-episode]');
  if (latestEpisode) latestEpisode.innerHTML = episodes.length ? episodeCard(episodes[0]) : '<p class="empty-state">Our first topic briefings are in preparation.</p>';
  document.querySelectorAll('[data-topic-episode]').forEach((el) => {
    const episode = episodes.find((ep) => (Array.isArray(ep.topics) ? ep.topics : []).includes(el.dataset.topicEpisode));
    el.innerHTML = episode ? episodeCard(episode) : '<div class="episode-preview"><strong>First topic briefing in preparation</strong><p>Opening briefings cover AI Infrastructure and Quantum Computing.</p><a class="text-link" href="' + escapeHtml(siteUrl('podcast/index.html')) + '">Podcast launch information →</a></div>';
  });
  Object.entries(catalog.platforms || {}).forEach(([key, url]) => {
    const link = document.querySelector(`[data-platform="${key}"]`);
    if (link && url) { link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.removeAttribute('aria-disabled'); }
  });
});
