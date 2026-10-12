# SkillSheba (দক্ষতা + সেবা): AI Mentor for GP Academy

An always-on AI career mentor that sits on top of GP Academy (Grameenphone Academy) as a chat bubble on every page. A student fills in one profile ("who I am + my dream"), and Claude turns it into a skill roadmap, a CV, and a ranked list of employers. The full plan is in [`docs/SkillSheba_PRD.md`](docs/SkillSheba_PRD.md).

**Demo layout**
- `index.html`: a copy of the GP Academy landing page (the host site). The only change is one `<script>` tag at the bottom.
- `public/skillsheba-widget.js`: the vanilla JS widget. It adds the bubble and opens the mentor in an iframe, so the host site's styles are never touched.
- `mentor.html` + `src/`: the mentor app (React + TypeScript + Tailwind).
- `worker/`: an optional Cloudflare Worker that keeps the Claude API key off the browser.

## Features (MVP from the PRD)

| Tab | What it does | AI call |
|---|---|---|
| 💬 Mentor | Chat that already knows the student's profile, results, and the GP Academy page they're on | Streaming Claude chat |
| 👤 Profile | Who I am + my dream, photo, completed courses. Saved in the browser | n/a |
| 🎯 Skill Gap | Turns the dream into career targets, 2–3 ranked skill gaps, and picks of courses and events | Structured JSON |
| 📄 CV | 1-click CV with photo, readiness score, and improvements. Download as PDF | Structured JSON |
| 🏢 Jobs | Ranks employer roles with a fit score, a reason, and missing skills | Structured JSON |
| 📅 Events | Upcoming events (recommended ones first) plus past events. Marking one "attended" adds it to the profile and CV | n/a |

- English / বাংলা toggle. The AI writes results in the selected language.
- Claude may only recommend items from the seeded data in `src/data/`. Any ID it returns that isn't in that data is dropped before display.
- Courses come from the GP Academy page plus a few free resources (freeCodeCamp, Kaggle, Cisco NetAcad). Employers and upcoming events are demo data and are labelled as such in the UI.
- Model: `claude-opus-5-5`, with server-side refusal fallback enabled.

## Run locally

```bash
npm install
npm run dev          # http://localhost:5173 (host page with the bubble)
```

Open the bubble, then **⚙ Settings**. Either paste your proxy URL, or choose **My own API key** for a quick local test.

## Deploy

GitHub Pages only serves static files, so the browser needs a safe way to reach Claude. The app supports both options and picks one at runtime:

1. **Proxy (recommended).** A Cloudflare Worker holds the key. The site uses it when the `AI_PROXY_URL` variable is set at build time, or when a user pastes it in Settings.
2. **Own API key.** A user pastes their key in Settings. It is stored only in that browser and sent straight to Anthropic. Fine for your own demo laptop, but don't share a key this way.

### 1. Deploy the proxy (Cloudflare Worker, free tier)

```bash
cd worker
npm install
npx wrangler login
npx wrangler secret put ANTHROPIC_API_KEY        # paste your key
# Edit ALLOWED_ORIGINS in wrangler.toml to include your Pages origin,
# e.g. "https://austy2510.github.io,http://localhost:5173"
npx wrangler deploy                              # prints https://skillsheba-proxy.<you>.workers.dev
```

The Worker only accepts `POST /v1/messages` from the allowed origins, only for the app's model, and with a `max_tokens` cap. An origin check stops other websites from using your key, but it doesn't stop scripted abuse. Also:
- set a **monthly spend limit** in the Anthropic Console;
- add a **rate-limiting rule** for the Worker route in the Cloudflare dashboard (Security → WAF → Rate limiting rules).

### 2. Deploy the site (GitHub Pages)

1. In the repo, go to **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Optional: go to **Settings → Secrets and variables → Actions → Variables** and add `AI_PROXY_URL` = your Worker URL. The site then works for everyone with no setup.
3. Push to `main` (or run the **Deploy to GitHub Pages** workflow by hand). The site is served at `https://<user>.github.io/<repo>/`.

### Embedding on the real GP Academy site

Add one line to any page:

```html
<script src="https://<user>.github.io/<repo>/skillsheba-widget.js" defer></script>
```

## Production path (from the PRD)

- Swap browser storage for Supabase (Postgres + Auth), or reuse GP Academy's session.
- Swap the seeded `src/data/` files for GP Academy's catalog and partner-employer APIs.
- Generate CV PDFs server-side (e.g. Puppeteer) instead of using the browser's print-to-PDF.
- Stretch goals: skill progress meter, weekly nudges, badges.
