# AGENTS.md

Static HTML blog, vanilla JS, no build tools.

## Dev Command

```bash
python -m http.server 8000
```

## Adding Posts

1. Create `posts/<slug>.md`
2. Add entry to `blogConfig.posts` array in `index.html` - posts are ordered by writing date (YYYY-MM-DD_NNN.md format)

## Architecture

- `index.html` - All CSS/JS inlined, single entry point
- Hash routing (`#post-id`)
- Markdown: `marked.js` + `highlight.js` for code blocks
- Post layout: left TOC sidebar (auto from h1/h2/h3), right content area
- Home always uses light theme regardless of saved preference
- Theme toggle persists to localStorage

## Deployment

- Static site, GitHub Pages