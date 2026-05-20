# AGENTS.md

Static HTML blog, vanilla JS, no build tools.

## Dev Command

```bash
python -m http.server 8000
```

## Adding Posts

1. Create `posts/<slug>.md`
2. Add entry to `blogConfig.posts` array in `index.html`
3. Set `id` using chronological numbering format `post-XXX` (e.g. `post-007`)
4. Keep `blogConfig.posts` in ascending chronological order (oldest -> newest); home page display is handled by ID-desc sorting so newest appears first
5. Keep the post file name format as `YYYY-MM-DD_NNN.md`

## Architecture

- `index.html` - All CSS/JS inlined, single entry point
- Hash routing (`#post-XXX`) with regex validation `/^post-\d{1,4}$/`
- Markdown: `marked.js` + `highlight.js` for code blocks, rendered via custom `code` renderer in `marked.use()`
- Post layout: left TOC sidebar (auto from h1/h2/h3), right content area
- Home always uses light theme regardless of saved preference
- Theme toggle persists to localStorage
- Background: daily Bing wallpaper via GitHub Actions, with CSS gradient overlay (`#bg-wallpaper` + `#bg-overlay`)

## Security

- **CSP**: `Content-Security-Policy` meta tag with `base-uri 'self'`, `form-action 'self'`, `object-src 'none'`
- **XSS Prevention**: `DOMPurify.sanitize()` on all HTML output (`renderHome()`, `loadPost()`)
- **SRI**: All CDN scripts use `integrity` + `crossorigin="anonymous"`
- **Hash Validation**: `handleHashChange()` validates hash against `/^post-\d{1,4}$/` before routing
- **No `unsafe-inline`**: CSP allows inline scripts/styles only because all JS/CSS is inlined in a single file; external scripts are SRI-verified

## Daily Wallpaper

`.github/workflows/bing-wallpaper.yml` runs daily at 8:00 CST (cron: `0 0 * * *` UTC):
- Fetches Bing API `HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN`
- Downloads image to `images/bing-daily.jpg` (overwrites)
- Commits via `git add -f` (file is `.gitignore`d to avoid history bloat)
- Falls back to CSS gradient if image not yet available

## SVG Image Guidelines

When creating SVG illustrations for posts:

- **ViewBox height**: Ensure sufficient height for all elements; prefer 800×300–800×400 range
- **Text spacing**: Minimum 1.4× font-size between text baselines for Chinese characters (e.g., font-size 11 → 16px gap)
- **Arc paths**: Ensure arc endpoints lie on the specified radius circle (e.g., `M-75,0 A75,75...` not `M-70,50 A80,80...`)
- **Sweep direction**: Use `sweep-flag=1` (clockwise) for upper semicircle arcs in SVG's y-down coordinate system
- **Check alignment**: Verify all annotations/labels align with the elements they reference (e.g., "leak points" between funnel layers, not inside them)

## Deployment

- Static site, GitHub Pages
- GitHub Actions triggers on push and cron schedule
