# Festiva AI — Fixes Applied

This bundle starts from the uploaded source project and contains the following changes.

## Application corrections
- Aligns demo dashboard task, confirmed-vendor, budget, spend, and remaining-balance figures with the underlying demo fixture.
- Replaces fixed/stale demo countdown values with local calendar-date calculations and clearly distinguishes future, current-day, and past events.
- Refreshes the demo event to a future date and shifts its sample task deadlines consistently.
- Separates budget allocation, estimates, and recorded spending; warns only when the relevant totals actually exceed the cap.
- Adds safeguards for malformed local storage and numeric inputs where the application processes them.
- Computes guest RSVP totals consistently when party sizes arrive as numeric strings or invalid data.
- Lets the user mark a vendor as checked only after confirming the vendor independently; AI-generated vendor placeholders are never pre-verified.

## Security and privacy
- Removes browser-side Gemini API-key settings and the browser's legacy stored key on startup.
- Moves Gemini calls behind an optional server-side endpoint using `GEMINI_API_KEY` from the server environment.
- Keeps a heuristic-only fallback for static GitHub Pages and when the backend is unavailable.
- Adds input schema validation, size bounds, origin allow-listing, request rate limiting, timeouts, HTTP security headers, and explicit proxy-trust configuration.
- Constrains conditional event details before they enter the AI prompt and bounds AI-generated collection sizes.
- Escapes user-controlled HTML, constrains dynamic CSS colors, encodes inline arguments, and protects CSV exports from spreadsheet formula injection.
- Adds an in-app notice explaining which selected planning details are sent to Google Gemini when that option is enabled. The browser probes backend health first and will not POST event details unless the backend reports Gemini is configured.

## Quality and maintainability
- Adds dependency-free unit tests for date arithmetic, budget metrics, HTML escaping, CSS color validation, inline arguments, guest RSVP counts, CSV formula-injection mitigation, demo consistency, confidence score bounds, and backend request validation.
- Adds a GitHub Actions quality workflow and local `npm test` / `npm run check` commands.
- Documents the static frontend vs. server backend separation and the deployment configuration needed for Gemini.

## Verification performed in this environment
- `npm test`: **15 tests passed, 0 failed**.
- `npm run check`: passed all JavaScript syntax checks.
- HTML source audit: no duplicate element IDs; all local script and stylesheet paths exist.
- A full browser workflow and live Express/Gemini integration could not be completed in this environment. Installing Express was blocked by npm-registry DNS/network errors (`EAI_AGAIN`). Run `npm ci`, `npm test`, and `npm run check` after extracting the bundle in a network-enabled environment. Gemini generation also requires a valid server-side key and a deployed Node backend.

This fix bundle has not been pushed to GitHub. Publishing requires an authorized GitHub write connection or a manual push from the repository owner.
