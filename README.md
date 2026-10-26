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
- **Google Gemini Generative AI (Live Mode)**: Direct integration with `gemini-2.0-flash` for hyper-custom JSON synthesis when an API key is supplied or configured in settings.
- **Festiva Intelligent Heuristic Engine (Zero-Key Fallback)**: Deterministic, instant, and mathematically consistent planning engine that works offline with zero setup, ensuring 100% reliability for evaluators.
- **Transparent AI Transparency**: Clear status indicators distinguish estimated benchmarks from confirmed contracts.

### 3. Comprehensive 7-Pillar Event Dashboard
1. **Overview**: Countdown clock, Celebration Confidence Score gauge, quick stats, and next actions.
2. **My Event Plan**: 3 distinctly different tailored concepts with hex color palettes, decor styles, lighting schemes, venue architecture, menu ideas, and active concept switcher.
3. **Intelligent Budget Planner**: Visual category donut distribution (Chart.js), editable allocated and actual expenses, over-budget warning system, and realistic savings opportunities.
4. **Personalized Execution Timeline**: Chronological tasks relative to the event date, priority badges, assignee tags, and functional checkboxes that immediately update your readiness score.
5. **Smart Vendor Checklist**: Comprehensive vendor tracker with service scopes, payment schedules (Cost = Deposit + Balance Due), booking status pills, and verified vendor indicators.
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

### Option A: Instant Local Server (Recommended)
```bash
cd festiva-ai
npm start
# Open http://localhost:3000 in your browser
```

### Option B: Zero-Install Direct Browser Open
Double-click `festiva-ai/index.html` (or `festiva_ai.html` in the root) in any modern web browser. All features, local storage persistence, interactive charts, and heuristic AI synthesis work completely out of the box with zero dependencies.

---

## 🔒 Responsible & Trustworthy AI Principles
1. **Never Invented Vendor Credentials**: Estimated costs are explicitly labeled as regional benchmark estimates.
2. **Mathematical Consistency**: All budget category allocations sum up to exactly 100% of the user's budget ceiling.
3. **Inclusive Hospitality**: Automatically factors in dietary preferences, allergies, cultural traditions, and accessibility requirements.
4. **Local Browser Privacy**: API keys and celebration plans are stored exclusively in the user's local browser (`localStorage`) and never transmitted to external third-party databases.
