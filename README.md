# Festiva AI — The Smart Celebration & Event Planner

> *"Your Vision. Your Celebration. Perfectly Planned."*

**Festiva AI** is an intelligent, personalized, GenAI-powered event planning application built to turn weddings, milestone birthdays, anniversaries, corporate galas, baby showers, and community festivals into practical, stress-free execution roadmaps.

---

## 🌟 Key Highlights & Competitive Advantages

### 1. The Celebration Confidence Score (Signature Differentiator)
Rather than an arbitrary percentage, the **Celebration Confidence Score (0–100)** is an objective, mathematically calculated readiness metric computed from real event data:
- **Task Milestones (35 pts)**: % of completed tasks and phase pacing.
- **Vendor Contracts (30 pts)**: Essential vendor confirmations (Venue, Catering, Photography, Florals, Sound).
- **Budget Health & Discipline (20 pts)**: Financial variance, committed actuals vs. budget caps, and contingency preservation.
- **Timeline Health (15 pts)**: Deadline pacing and resolution of overdue or high-priority blockers.
- **Top 3 High-Impact Next Actions**: Ranked recommendations showing exactly how to raise your score with 1-click navigation.

### 2. Dual-Engine Event Intelligence
- **Google Gemini Generative AI (Optional Server Mode)**: Secure server-side generation through `/api/generate-plan` when `GEMINI_API_KEY` is configured on a backend host. The browser never stores or sends a provider secret.
- **Current Model Configuration**: Defaults to `gemini-3.8-flash` and can be changed with the `GEMINI_MODEL` backend environment variable. Check Google's official model/deprecation documentation before changing production models.
- **Festiva Intelligent Heuristic Engine (Zero-Key Fallback)**: Deterministic, instant, and mathematically consistent planning engine that works offline with zero setup, ensuring 100% reliability for evaluators.
- **Transparent AI Transparency**: Clear status indicators distinguish estimated benchmarks from confirmed contracts.

### 3. Comprehensive 7-Pillar Event Dashboard
1. **Overview**: Countdown clock, Celebration Confidence Score gauge, quick stats, and next actions.
2. **My Event Plan**: 3 distinctly different tailored concepts with hex color palettes, decor styles, lighting schemes, venue architecture, menu ideas, and active concept switcher.
3. **Intelligent Budget Planner**: Visual category donut distribution (Chart.js), editable allocated and actual expenses, over-budget warning system, and realistic savings opportunities.
4. **Personalized Execution Timeline**: Chronological tasks relative to the event date, priority badges, assignee tags, and functional checkboxes that immediately update your readiness score.
5. **Smart Vendor Checklist**: Comprehensive vendor tracker with service scopes, payment schedules (Cost = Deposit + Balance Due), booking status pills, and a user-controlled check mark that requires independent verification.
6. **Creative Idea Studio**: Curated experiential touches with **Affordable**, **Balanced**, and **Luxury Premium** tiers, plus an instant **"Surprise Me!"** idea generator with confetti.
7. **Guest Hospitality & RSVP Tracker**: Headcount monitoring, confirmed attending vs. declined, dietary allergy notes, and table seating directory with CSV export.

---

## 🎨 Editorial Visual Identity & Design System
- **Warm Ivory Backgrounds**: `#FAF8F5`, `#FFFFFF`, `#F5EFEB`
- **Deep Plum & Midnight Typography**: `#1E152A`, `#2A1B3D`, `#4A3E56`
- **Sophisticated Coral Accents**: `#E06A55`, `#E8725C`
- **Champagne Gold Highlights**: `#C5A059`, `#D4AF37`, `#F7F1E5`
- **Sage Success Accents**: `#4A7C59`, `#EEF5F0`
- **Typography**: Playfair Display (editorial celebration headlines) + Plus Jakarta Sans (crisp SaaS data visualization).
- **Print & Binder Ready**: Dedicated `@media print` CSS layout for physical coordinator binders and PDF export.

---

## 🚀 Quick Start & How to Run

Requires Node.js 20 or later.

```bash
npm install
npm test
npm run check
npm start
# Open http://localhost:3000 in your browser
```

The browser-based planner and heuristic engine work on static hosting without a Gemini key. Directly opening `index.html` with a `file://` URL may restrict some browser features; use `npm start` for the most predictable local experience.

### Static GitHub Pages + separate backend

GitHub Pages only serves static files and does not execute `server.js`. To use Gemini from the Pages site:

1. Deploy `server.js` to a Node.js host that supports environment variables.
2. Set `GEMINI_API_KEY` on that backend host. Never commit the real key.
3. Set `FRONTEND_ORIGINS=https://shubh07272.github.io` (and any trusted local development origin you need) on the backend. Set `TRUST_PROXY=true` only if the service sits behind exactly one trusted reverse proxy; leave it false for direct hosting.
4. Edit `config.js` so `window.FESTIVA_API_BASE_URL` is the HTTPS origin of your backend, without a trailing slash. Leave it empty for same-origin hosting.
5. Verify the backend `/api/health` endpoint, then test plan generation from the GitHub Pages site. When the backend is unavailable, the planner falls back to its heuristic engine.

---

## 🔒 Responsible & Trustworthy AI Principles
1. **No Invented Vendor Verification**: Generated vendor entries are illustrative placeholders, not real recommendations. The app strips generated contact details and defaults every vendor to unverified; confirm identity, credentials, contact details, and availability independently.
2. **Budget Transparency**: Allocation, estimate, recorded spending, and remaining balance are shown as distinct figures.
3. **Inclusive Hospitality**: Planning can take account of dietary preferences, allergies, cultural traditions, and accessibility requirements. Avoid entering unnecessary sensitive personal details.
4. **Browser Data Storage**: Event plans are saved in the browser's `localStorage` by default. They are not backed up to an application database.
5. **Clear AI Data Flow**: With the optional backend enabled, selected event-planning fields—including event style, location, budget, and any dietary or cultural notes you supply—are sent to Google Gemini to generate a plan. Do not enter sensitive guest records into this generator.
6. **Secret Handling**: Gemini keys belong only in backend environment variables. The frontend settings do not accept or store API keys.


## 🧪 Verification

- `npm test` runs the date, budget, HTML-escaping, CSV-injection, demo-data, and confidence-score unit tests.
- `npm run check` checks JavaScript syntax for the application, shared utilities, and server.
- Server integration with Google Gemini requires a valid provider API key and network access. Do not report an AI integration test as passed unless it was performed with the backend configured.

## 🔐 Configuration files

- `.env.example` lists backend environment variables with no real secrets.
- `config.js` contains only the public backend URL. Do not put credentials there.
- `.env`, local config overrides, dependencies, and test outputs are excluded from Git by `.gitignore`.
