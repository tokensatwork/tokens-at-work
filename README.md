\# Tokens at Work



Static GitHub Pages website for a weekly technology intelligence publication covering AI Infrastructure, Quantum Computing, and emerging technologies. Built with HTML, CSS, and vanilla JavaScript; no build process or framework is required.



\## Changelog



\- \*\*v2.0 (2026-11-27):\*\* Topic-scoped paths (`ai/`, `quantum/`), removed placeholder folders, documented episode record format with `topics` array, added automation section, added repository structure tree.

\- \*\*v1.0 (2026-11-24):\*\* Initial site with root-level `podcast/`, placeholder topic folders, GitHub Pages deployment.



\## Preview



Run a local static server from the repository root (`python3 -m http.server 8000`) and open http://localhost:8000. A server is required because the site loads `data/catalog.json` with `fetch()`.



\## GitHub Pages deployment



In repository Settings → Pages, choose \*\*Deploy from a branch\*\*, select `main` and `/` (root), and save. Project sites and custom domains are supported. JavaScript derives the site root from the resolved `assets/js/main.js` URL, rather than assuming a page depth or domain path.



\## Repository structure



ai/

reports/YYYY-WXX/index.html ← AI Infrastructure weekly report

reports/YYYY-WXX/index.md ← Source markdown

podcast/signal\_YYYY-WXX.mp3 ← AI podcast episode

podcast/signal\_YYYY-WXX.chapters ← Chapter markers (RSS.com format)

quantum/

reports/YYYY-WXX/index.html ← Quantum Signal weekly report

reports/YYYY-WXX/index.md

podcast/signal\_YYYY-WXX.mp3

podcast/signal\_YYYY-WXX.chapters

archive/

index.html ← Functional archive (renders from catalog.json)

assets/

js/main.js ← Site logic (catalog rendering, nav)

css/ ← Styles

data/

catalog.json ← Index for reports, episodes, metrics, platforms

index.html ← Homepage

CNAME ← Custom domain (tokensatwork.com)





\## Publication catalog and automation



`data/catalog.json` is the index for reports, episodes, metrics, and distribution links. The homepage, topic pages, and archive render from it.



\### Publishing a report



To publish a report, add its page and a catalog entry in the same commit:



ai/reports/YYYY-WXX/index.html

quantum/reports/YYYY-WXX/index.html



Status values



&#x20;   published — live on site, counted in metrics



&#x20;   preview — visible on site with "PREVIEW" tag, excluded from published totals



&#x20;   draft — hidden from all listings



Automation



The n8n workflow (Podcast \& Publish) handles:



&#x20;   Audio generation (Kokoro TTS + ffmpeg)



&#x20;   Email with attachments (MP3, MD, HTML, chapters, logo)



&#x20;   Catalog update (topic-scoped, idempotent)



&#x20;   Git push (copies files to topic-scoped paths, commits, pushes)



Automation keeps report files and catalog entries in the same commit. New topic keys can be added to topics, with a landing page and navigation link, without changing the catalog rendering model.



Accessibility and performance



Semantic HTML, responsive layout, skip navigation, keyboard-operable menu, reduced-motion support, system font fallbacks, and no third-party runtime dependencies. The site uses relative internal links; report pages use relative CSS paths from their nested directories.



