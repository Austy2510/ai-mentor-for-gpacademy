# SkillSheba — PRD & Tech Stack

Oct 12, 2026 · @Raisul Alam

## Problem Statement

Most Bangladeshi university students graduate without ever getting personalized career guidance. There is no dedicated counselor at most institutions, so students pick career directions based on peer pressure or trends (everyone preparing for BCS, everyone wanting to be a "software engineer") rather than their own subject, interests, and the real job market.

The result is a widening gap between academic learning and employable skill: graduates don't know which free or paid courses actually close their skill gap, their CVs are generic and self-written, and they have no direct channel to employers who are hiring for the skills they do have. Talented students lose months or years to the wrong path while employers in Bangladesh report a parallel shortage of job-ready candidates.

## Product Overview & Vision

**SkillSheba** (দক্ষতা + সেবা) is an AI career-growth layer designed to sit on top of an existing skill platform such as **GP Academy**, rather than compete as a new standalone app. GP Academy already delivers courses to a large user base; SkillSheba adds the layer that's missing: a student builds one profile (who they are, what they dream of becoming), and AI continuously turns that profile into a personalized skill roadmap, an auto-generated CV, and a shortlist of employers actively looking for their exact skill set.

Concretely, SkillSheba is an \*\*always-on AI Mentor widget\*\* — a persistent chat bubble present on every page of the GP Academy website, the way a support-chat widget would be, except it already knows the student. It continuously has context on the student's profile, skill progress, generated CV, and employer matches, so a student can ask it anything from any page ("which course should I finish next?", "is my CV ready?") without navigating anywhere else. Building it as an embedded module — not a rival platform — means SkillSheba can reuse GP Academy's course catalog, user accounts, and Grameenphone's own employer/partner network, making the employer-match feature immediately credible rather than speculative.

GP Academy already has real scale to build on: 391K+ enrollments, 156K+ course completions, 400+ partner institutions, and 50+ courses, delivered with partners like Cisco Networking Academy, LEAD Academy, Animation with Shinchon, CodersTrust and Amar iSchool, across categories including Career Readiness, Digital Skills, Freelancing Skill and the Cisco Series. SkillSheba's job is to turn that existing catalog into a personalized path instead of a browsable list.

## Target Users & Personas

| Persona | Who they are | Core pain point |
| --- | --- | --- |
| Final-year undergrad | CSE/BBA/EEE/Textile etc. student, 3rd–4th year, decent GPA | Doesn't know which career path fits their subject + interest; anxious about being "left behind" |
| Fresh graduate | Graduated in the last 0–2 years, actively job hunting | CV gets no response; doesn't know the real skill gap vs job postings |
| Early-stage skill learner | 1st–2nd year student, motivated but directionless | Takes random free courses with no plan tied to a career outcome |

All three share one need: turning "I don't know what to do" into a concrete, personalized next step.

## Core Features

| # | Feature | What it does | AI touchpoint |
| --- | --- | --- | --- |
| 0 | Always-On AI Mentor | A persistent chat widget on every GP Academy page, aware of the student's full profile and progress at all times | Holds context across the whole journey; answers any question from any page without the student navigating away |
| 1 | Who I Am + My Dream | One-time profile: department, GPA, interests, long-term goal in the student's own words | AI parses free-text goals into structured career targets |
| 2 | AI Skill Gap + Course/Event Suggestion | Compares profile to BD market demand and GP Academy's catalog; recommends specific courses, free resources, events and bootcamps | Core reasoning engine — ranks and explains *why* each suggestion fits |
| 3 | 1-Click CV Generator | Student uploads a photo; AI writes a polished summary, bullet points and formatting from profile + completed courses | Drafts CV copy, scores it, and suggests improvements |
| 4 | AI Employer Match | Matches the student's current skill set against company/employer hiring needs, with reasoning for each match | Ranks employers and explains the fit, not just a static list |
| 5 | Events (Upcoming + Participated) | Shows upcoming workshops/bootcamps to join and a history of ones attended, feeding back into the skill profile | Suggests events worth attending based on the current skill gap |

## Additional / Future Features (Stretch Goals)

- **Skill progress meter** — a visual tracker showing completion % per recommended skill
- **Resume score** — AI scores the generated CV against the target role and flags weak sections
- **Ask Mentor AI** — a chat assistant for open-ended career questions, using the student's saved profile as context
- **Weekly nudge** — a reminder when a student hasn't made progress in a week, to keep the roadmap from going stale
- **Leaderboard / badges** — light gamification tied to skills completed, for engagement

These are not part of the bootcamp demo but strengthen the pitch's growth story.

## Tech Stack

Chosen for a stack a small student team can build, demo and deploy within a bootcamp timeline, while staying production-credible.

| Layer | Choice | Why |
| --- | --- | --- |
| Widget embed | Vanilla JS widget loaded via one `<script>` tag (optionally an iframe for isolation) | Lets the AI Mentor appear on every existing GP Academy page without rebuilding the host site |
| Frontend | React + TypeScript, Tailwind CSS | Fast to build forms/dashboards; large component ecosystem; TypeScript catches bugs before demo day |
| Backend | Node.js + Express (or FastAPI/Python as an alternative) | Simple REST API layer between frontend, database and the AI layer |
| Database | PostgreSQL (via Supabase for speed) | Relational data fits profiles, skills, events, employer records well; Supabase gives auth + hosting in one |
| AI / LLM layer | Claude API (Anthropic) | Powers skill-gap reasoning, CV copywriting, and employer-match explanations with a single model; the same API call pattern also powers the always-on mentor chat |
| Authentication | Supabase Auth / Firebase Auth, or GP Academy's existing session (SSO) once embedded | Email + Google sign-in for the standalone MVP; shared session once embedded in GP Academy |
| File storage | Supabase Storage / AWS S3 | Stores profile photos and generated CV PDFs |
| CV generation | HTML/CSS template rendered server-side to PDF (e.g. Puppeteer or a PDF library) | Keeps CV formatting consistent and print-ready |
| Hosting / Deployment | Frontend on Vercel; backend on Render or Railway | Free-tier friendly, fast to deploy for a live demo |
| Course/event data | Seeded dataset for GP Academy + partner sources at MVP; scraping/API integration as a later phase | Avoids live-scraping complexity during the bootcamp demo |

This is one reasonable stack, not the only one — the backend language (Node vs Python) and database hosting can swap based on what the team already knows best; the choice that matters most for the pitch is the Claude API layer, since that's where the product's intelligence lives.

## System Architecture

&#91;embedded content: architecture · frontend, backend, database, AI, GP Academy data\]

The frontend and GP Academy's course/employer data both pass through one backend API, which calls the Claude API for every piece of reasoning (skill gaps, CV copy, employer matching) before writing results to the database.

## AI Integration Details

Every AI call goes through the Claude API from the backend (never directly from the browser, so no API key is exposed to the client). Three distinct prompts drive the product:

1. **Skill-gap & course reasoning** — input: profile (department, GPA, interests, dream role) + a curated list of available courses/events. Claude is prompted to return structured JSON: 2–3 ranked skill gaps, for each a 1-line reason tied to the student's stated goal, and matching course/event picks from the provided list (never invented ones).
2. **CV copywriting** — input: profile + completed skills/courses + target role. Claude drafts a professional summary and 3–5 bullet points per experience/project in the student's own language register, which the frontend then renders into the CV template alongside the uploaded photo.
3. **Employer match** — input: profile skills + a list of partner employers with their stated hiring needs. Claude ranks the employers for this student and writes a 1-sentence reason per match, so the list reads as explained recommendations rather than a plain directory.

All three prompts constrain Claude to choose only from data the backend supplies (courses, employers) to prevent hallucinated recommendations — Claude's job is matching and reasoning, not inventing listings.

## MVP Scope for the Bootcamp Demo

| Build today | Roadmap only |
| --- | --- |
| Profile form (who I am + dream) | Live web scraping of course/event sites |
| AI skill-gap + course suggestion (seeded course dataset) | Real GP Academy account integration |
| 1-click CV generator with photo upload | Payment/premium tier |
| AI employer match (seeded employer dataset) | Leaderboard, badges, weekly nudges |
| Events list (upcoming + participated, static/demo data) | Ask Mentor AI chat assistant |

This keeps the demo honest: every AI feature shown is a real, live Claude API call — only the underlying course/employer datasets are seeded rather than scraped live, which is clearly stated in the pitch.

## Success Metrics

- **Profile completion rate** — % of sign-ups that finish the full profile (who I am + dream)
- **CV generation rate** — % of active users who generate at least one CV
- **Skill-to-course click-through** — % of AI skill suggestions that lead to a course click
- **Employer-match engagement** — % of students who view or contact a matched employer
- **7-day return rate** — % of users who come back within a week of their first session, as a proxy for whether the roadmap felt worth following
