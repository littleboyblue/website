# AGENTS.md

Static HTML blog with all site CSS/JS in `index.html`; no package manager, build step, lint, or test config.

## Commands

- Local site preview: `python -m http.server 8000`
- Worker deployment is CI-driven on pushes to `main` touching `worker/**`; manual dispatch is also available in `.github/workflows/deploy-worker.yml`.

## Adding Posts

1. Create `posts/YYYY-MM-DD_NNN.md`.
2. Add the metadata object to `blogConfig.posts` in `index.html`.
3. Use chronological IDs like `post-042`; keep `blogConfig.posts` oldest to newest.
4. Home/category/archive views sort by numeric ID descending, so do not reorder newest-first manually.
5. Put post assets under `images/post-XXX/` when possible and reference them from Markdown as `images/post-XXX/...`.

## Architecture

- `index.html` is the site entrypoint: routing, blog metadata, Markdown rendering, theme handling, stats UI, and all styles live inline.
- Hash routes are handled in `handleHashChange()`: posts must match `/^post-\d{1,4}$/`; other known routes are `#categories`, `#archives`, `#category/<name>`, and hidden stats route `#stats`.
- Markdown is fetched from `posts/*.md`, rendered with `marked`, highlighted with `highlight.js`, then sanitized with `DOMPurify` before insertion.
- Post pages generate the left TOC from `h1/h2/h3`; home always forces light mode, while post theme preference persists in `localStorage`.
- Daily background is `/images/bing-daily.jpg`; the GitHub Action overwrites and force-adds it, with an in-page gradient fallback.

## Stats Worker

- `STATS_WORKER_URL` in `index.html` points to `https://blog-stats.washi.lol`.
- Worker source is `worker/src/index.js`; config is `worker/wrangler.toml`.
- The Worker exposes `POST /track` and `GET /stats`, stores counts in KV binding `STATS`, and only allows origin `https://washi.lol` via `ALLOWED_ORIGIN`.

## Security Notes

- Keep CDN scripts SRI-pinned with `integrity` and `crossorigin`.
- Keep rendered HTML sanitized with `DOMPurify.sanitize()`.
- CSP intentionally allows inline scripts/styles because this repo is a single static HTML file; preserve `base-uri 'self'`, `form-action 'self'`, and `object-src 'none'`.
- If adding external fetches or media, update the CSP meta tag in `index.html`.

## SVG Image Guidelines

- Use enough viewBox height; 800x300 to 800x400 usually fits blog diagrams.
- Keep Chinese text baselines at least 1.4x font size apart.
- For arc paths, keep endpoints on the declared radius and use `sweep-flag=1` for upper semicircles in SVG y-down coordinates.
