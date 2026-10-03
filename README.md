# Agent Gallery

A fast, offline-friendly gallery of all **119 open-source AI agent & RAG templates** from
[shubhamsaboo/awesome-llm-apps](https://github.com/shubhamsaboo/awesome-llm-apps) (Apache-2.0).

Browse starters, advanced agents, agent teams, voice agents, RAG tutorials, MCP apps,
generative UI, always-on agents, LLM apps, and framework crash courses — each with a
plain-English summary, key features, setup notes, and a link to the original source folder.

## Tech stack

Plain **HTML + CSS + vanilla JS**, zero dependencies, zero build step. Data lives in
`data/apps.js` (curated from the upstream README, Oct 2026) so the site works fully offline.

## Run locally

No install needed — just serve the folder (ES modules/`file://` restrictions don't apply
since everything is classic scripts, so you can even open `index.html` directly):

```bash
# option 1: zero-install
npx --yes serve .

# option 2: via npm scripts
npm install   # no-op, no dependencies
npm run dev   # serves on http://localhost:3000

# option 3: python
python3 -m http.server 8000
```

Then open the printed URL. Search, category/difficulty/tag filters, and per-template
detail pages (`#/app/<id>`) all work client-side.

## Deploy to Vercel

This is a static site — no build command, output directory is `.`:

```bash
npx --yes vercel        # preview deploy
npx --yes vercel --prod # production deploy
```

Or drag-drop the folder / connect the git repo in the Vercel dashboard (framework preset: **Other**).

## Project layout

```
index.html      # shell: header, <main>, footer
styles.css      # all styling, no framework
app.js          # hash router: home, browse (#/browse), detail (#/app/:id)
data/apps.js    # window.APP_DATA — 11 categories, 119 templates, setup guides, featured picks
package.json    # `npm run dev` (serve) convenience script
```

## Refreshing the data

Re-check the upstream [README](https://github.com/shubhamsaboo/awesome-llm-apps) for new
templates, add entries to `data/apps.js` (fields: `id, title, emoji, cat, level, tags,
path, keys, desc, summary, highlights`), and optionally feature them via `featured: [...]`.
