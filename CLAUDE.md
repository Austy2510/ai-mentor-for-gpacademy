# Project context: SkillSheba / Career Quest (AI mentor for GP Academy)

AI career-growth layer for Grameenphone Academy (GP Academy), Bangladesh. Students are Bangladeshi university students and fresh graduates. Product spec: `docs/SkillSheba_PRD.md`.

**Live site:** https://austy2510.github.io/ai-mentor-for-gpacademy/ (GitHub Pages)
**Working branch:** `claude/open-these-2-dr3t9k`. It is currently the repo's only and default branch; there is no `main`.

## What's in the repo

| Path | What it is |
|---|---|
| `index.html` + `public/app.js`, `public/style.css`, `public/assets/` | **Front end: Career Quest.** A gamified GP Academy app with the mascot **Virus**. Plain JS, no framework, no build step (Vite copies `public/` as-is). State lives in localStorage key `gp-quest-v1`. Original notes: `docs/career-quest-README.txt`. |
| `src/quest-ai.ts` | Bridge from Career Quest to Claude. Exposes `window.SkillShebaAI` (`chat`, `reset`, `isConfigured`, `saveSettings`, …) and fires the `skillsheba-ai-ready` event. `app.js` builds `questCatalog()` (courses, events, jobs) and `questContext()` (student data) and calls `SkillShebaAI.chat()`. Its `reply()` is the offline fallback. |
| `mentor.html` + `src/` (React 19 + TS + Tailwind v4) | **SkillSheba mentor app**: profile, AI skill gap, 1-click CV, employer match, events, EN/বাংলা. Served at `/mentor.html`. |
| `public/skillsheba-widget.js` | Vanilla JS loader. One `<script>` tag adds a chat bubble to any page and opens `mentor.html` in an iframe. |
| `src/ai/client.ts` | **All Claude calls.** Settings (proxy URL or user key), `structuredCall` (JSON output via zod), and `streamChat`. |
| `src/ai/features.ts`, `src/ai/mentor.ts` | Prompts and schemas for skill gap, CV and employer match, plus the mentor system prompt and context. |
| `src/data/*.ts` | Seeded demo catalogs: courses, events and fictional employers. |
| `worker/` | Cloudflare Worker proxy that holds `ANTHROPIC_API_KEY` and forwards only `POST /v1/messages`, with an origin allowlist, a model allowlist and a `max_tokens` cap. |
| `.github/workflows/deploy-pages.yml` | Builds and deploys Pages on push to `main` or the working branch. The `vars.AI_PROXY_URL` repo variable becomes `VITE_AI_PROXY_URL` at build time. |
| `public/career-quest/index.html` | Redirect from the old `/career-quest/` URL to the site root. |
| `docs/` | PRD, original GP Academy page text, Career Quest README. |

## Commands

```bash
npm install
npm run dev        # http://localhost:5173  (Career Quest; /mentor.html for SkillSheba)
npm run build      # tsc -b && vite build → dist/
npx tsc --noEmit -p .                     # typecheck src/
node --check public/app.js                # syntax-check Career Quest
cd worker && npx wrangler deploy          # deploy proxy (needs: wrangler secret put ANTHROPIC_API_KEY)
```

There is no test suite. Verify UI changes in a browser: Playwright with Chromium at `/opt/pw-browsers` in cloud sessions, and mock `https://<proxy>/v1/messages` when there's no API key.

## Rules and gotchas

- **Static hosting.** GitHub Pages only serves files. The browser reaches Claude either through the Worker proxy (recommended) or a user-pasted key (`dangerouslyAllowBrowser`, stored in localStorage key `skillsheba.ai`). Never commit an API key.
- **Claude API.** Use the official `@anthropic-ai/sdk`, never raw fetch. Model `claude-opus-5-5`. Thinking is adaptive and can't be disabled, so control depth with `output_config.effort` (`low` for chat, `medium` for analyses). Server-side refusal fallback: `betas: ["server-side-fallback-2026-07-01"]` + `fallbacks: "default"`. Check `stop_reason` (`refusal`, `max_tokens`) before reading content. If you add a model, also add it to `ALLOWED_MODELS` in `worker/src/index.ts`.
- **Chat history must stay append-only** (preserved thinking). Freeze the top-level `system` for a session; send changing student or page context as an appended `{role: "system"}` message, and only when it changed. Append the assistant's full `content` blocks unchanged. Never edit, trim or reorder earlier turns; "New chat" resets everything.
- **No invented listings.** Prompts tell Claude to choose only from the supplied catalog. Results are filtered against `src/data` IDs before display. Keep both safeguards when adding features.
- **Demo data.** Employers and upcoming events are fictional or demo and are labelled "Demo data" in the UI. Don't present them as real.
- **Career Quest (`public/app.js`)** is minified-style code written as one function per line. Edit it surgically, keep the existing style and `esc()` escaping for any user text, and run `node --check` afterwards. It must keep working offline: if AI is off or fails, fall back to `reply()`.
- **i18n.** The SkillSheba app has EN/BN strings in `src/i18n.ts`, and every key needs both languages. Career Quest is English only.
- **Base path.** `vite.config.ts` uses `base: "./"` so the site works under `/ai-mentor-for-gpacademy/`. Use relative URLs in output.
- Commit to the working branch; pushes auto-deploy. Don't put model identifiers in commit messages.
