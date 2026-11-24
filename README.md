# Tokens at Work

Static GitHub Pages website for a weekly technology intelligence publication covering AI Infrastructure, Quantum Computing, and emerging technologies. Built with HTML, CSS, and vanilla JavaScript; no build process or framework is required.

## Preview

Run a local static server from the repository root (`python3 -m http.server 8000`) and open <http://localhost:8000>. A server is required because the site loads `data/catalog.json` with `fetch()`.

## GitHub Pages deployment

In repository **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, and save. Project sites and custom domains are supported. JavaScript derives the site root from the resolved `assets/js/main.js` URL, rather than assuming a page depth or domain path.

## Publication catalog and automation

`data/catalog.json` is the index for reports, episodes, metrics, and distribution links. The homepage, topic pages, and archive render from it. To publish a report, add its page and a catalog entry in the same commit:

- `ai/reports/YYYY-WXX/index.html`
- `quantum/reports/YYYY-WXX/index.html`

Catalog report `url` paths are relative to the deployed site root (for example `ai/reports/2026-W48/index.html`). Add episode records to `episodes`; each can include `title`, `date`, `summary`, `url`, and `topics`. Configure RSS, Spotify, Apple Podcasts, or RSS.com URLs under `platforms`. Update metric placeholders in `metrics` as required. Reports marked `preview` are excluded from published totals; drafts are hidden from listings.

The archive automatically groups report entries by year and ISO week. Automation should keep report files and catalog entries in the same commit. New topic keys can be added to `topics`, with a landing page and navigation link, without changing the catalog rendering model.

## Accessibility and performance

Semantic HTML, responsive layout, skip navigation, keyboard-operable menu, reduced-motion support, system font fallbacks, and no third-party runtime dependencies. The site uses relative internal links; report pages use relative CSS paths from their nested directories.
