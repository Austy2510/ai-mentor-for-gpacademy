GP Academy — Career Quest, with Virus

RUN LOCALLY
Unzip the folder. Open index.html, or run python3 -m http.server 8080 inside this folder and visit http://localhost:8080. No npm install or build step is needed.

DEPLOY
Upload this folder to any static website host. index.html must be at the site root. Keep app.js, style.css, and assets/ beside it. Hash-based routes need no server rewrites.

SOURCE
index.html: entry point and metadata
style.css: responsive design and Virus animation
app.js: navigation, onboarding, quest logic, simulated mentor, CV editor, sample jobs and events
assets/virus-transparent.png: current character cutout

ANIMATION
Virus gently breathes and sways, reacts on hover, and hops during the roadmap reveal. Animations are disabled when prefers-reduced-motion is enabled.

PROTOTYPE LIMITS
AI responses, learning exercises, vacancies, events, and community rankings are simulated. Progress is stored in browser localStorage. No live AI, accounts, job feeds, or application submissions are connected. Course links lead to GP Academy. CV export uses the browser print dialog. Google Fonts requires an internet connection; system fonts are used as fallback.

PUBLICATION STATUS
Publication through Sites was blocked by automatic approval review of the credential handoff. This ZIP contains the complete static source and assets for independent hosting.
