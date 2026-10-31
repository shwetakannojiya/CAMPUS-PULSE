# Campus Pulse - Build Progress Log

This file tracks the development and verification status across all stages. Every stage is built, tested, and verified before proceeding to the next.

---

## Stage 1: Project Analysis
- **Status**: Completed
- **Summary**: Clarified requirements, confirmed deterministic priority rules, separated MVP from nice-to-haves, resolved timezone risks (`Asia/Kolkata`), and established user interaction rules.

## Stage 2: Planning & Architecture
- **Status**: Completed
- **Summary**: Architected data models, file hierarchy, zero-dependency month calendar, pure status logic, localStorage abstraction with versioning, and serverless API structure with Demo Mode fallback.

## Stage 3: UI Development
- **Status**: Completed & Verified
- **What was built**:
  - Node.js LTS and Vite React scaffold with Plain CSS variables design tokens.
  - Responsive app shell: Fixed sidebar (desktop >1024px) + Sticky bottom navigation (mobile <=1024px).
  - Header with prominent Demo Mode indicator ("Sample notices active - No API key needed").
  - Dashboard with 4 stat cards (Total, Today, Upcoming, Needs Attention).
  - Notice Input component with character limit counter (5,000 max), sample buttons, and submit action.
  - Visual status badges (URGENT red, UPCOMING blue, EXPIRED grey, DATE UNCONFIRMED amber, Registration Closed).
  - Event Card with star, copy plain text to clipboard, expand/collapse instructions, and delete confirmation.
- **What was tested**:
  - `vite build` production compilation: Clean build in 7.55s, zero errors or warnings.
  - Spacing and CSS variables sanity check: responsive styles for 375px, 768px, and 1280px breakpoints.
- **Known issues**: None.

---

## Stage 4: Core Functionality (Deterministic Logic & Storage)
- **Status**: Completed & Verified
- **What was built**:
  - `src/lib/constants.js`: System constants locked to `Asia/Kolkata` and 8 standard categories.
  - `src/lib/dateUtils.js`: Safe date string parsing, deadline timestamp conversions, and next-7-days rolling window calculations avoiding UTC off-by-one errors.
  - `src/lib/status.js`: Pure deterministic status evaluator `getEventStatus(event, now)` returning `URGENT`, `UPCOMING`, `EXPIRED`, `DATE_UNCONFIRMED`, and `registrationClosed` sub-badge.
  - `src/lib/storage.js`: LocalStorage manager with schema versioning (`campus_pulse_events_v1`), safe fallback handling, CRUD functions, duplicate warning detection, JSON export, and wipe data.
  - `src/components/events/CalendarView.jsx`: Hand-crafted month grid calendar with weekday headers, day cell events, and day-selection list drawer (zero external libraries).
  - `src/pages/AllEventsPage.jsx`: Filterable view with search input (title, venue, description), category selector, date filter presets, and list/calendar view toggle.
  - `src/pages/ImportantPage.jsx`: Starred items view with empty state.
  - `src/pages/SettingsPage.jsx`: Functional settings showing demo status, timezone display, JSON export download, and clear all data.
  - `src/components/events/EventDetailModal.jsx` and `EditEventModal.jsx`: Full event inspection, editing with duplicate warning, and delete triggers.
- **What was tested**:
  - Vitest test suite (`src/tests/status.test.js`): All 10 test scenarios passed.
  - Production build: `vite build` succeeded in 5.81s without errors.
- **Known issues**: None.

---

## Stage 5: AI Integration & Demo Mode
- **Status**: Completed & Verified
- **What was built**:
  - `api/extract.js`: Serverless notice extraction endpoint supporting both Demo Mode and Gemini live API.
  - `api/digest.js`: Serverless weekly digest briefing generator with server-side ID verification.
  - `api/_lib/gemini.js`: Modular, isolated Gemini API client with temperature 0.1 and JSON mode.
  - `api/_lib/prompts.js`: Hardened prompt templates treating user input as untrusted data (`<NOTICE_DATA>`), resolving relative dates with reference date/timezone, and enforcing ambiguities for ambiguous dates.
  - `api/_lib/sampleData.js`: 5 pre-computed realistic extraction payloads for offline Demo Mode.
  - `api/_lib/validation.js`: Input size checks (5,000 char cap), method checks (POST only), category validation, and AI output sanitization.
  - `src/components/parser/ReviewCardModal.jsx`: Interactive review card allowing students to inspect extracted fields, resolve ambiguous dates with option pills, and confirm before saving.
  - `src/components/digest/WeeklyDigestModal.jsx`: 7-day briefing modal displaying verified real event data, grouped into Urgent, Workshops/Competitions, Deadlines, Academic, and Weekly sections.
  - `vite.config.js`: Integrated development middleware enabling `/api/*` endpoints to work during `npm run dev` and `npx vercel dev`.
- **What was tested**:
  - Vitest suite (`src/tests/api.test.js`): 9 tests covering method validation, input bounds, sample extractions, ambiguous date handling, null date handling, ID verification, and category sanitizer.
  - Production build: `vite build` succeeded in 6.33s.
- **Known issues**: None.

---

## Stage 6: Validation & Hardening
- **Status**: Completed & Verified
- **What was built**:
  - `isValidCalendarDate` in `src/lib/dateUtils.js`: Accurate Gregorian calendar date verification preventing non-existent days (e.g. Feb 29 on non-leap years, April 31, month 13).
  - Pre-save deadline validation in `ReviewCardModal` and `EditEventModal`: Flags warning if registration deadline falls after event start date.
  - XSS-free design: Strict React text node bindings with no raw HTML injection anywhere.
  - Strict input sanitization in `api/_lib/validation.js`: Non-empty title enforcement, allowed category coercion, time padding (e.g. "9:30" -> "09:30"), and unknown field stripping.
- **What was tested**:
  - Vitest suite (`src/tests/validation.test.js`): 4 tests covering calendar date validation, leap year handling, title enforcement, time padding, and unknown field stripping.
  - All 23 tests across 3 suites passing.
  - Production build: `vite build` succeeded in 5.79s.
- **Known issues**: None.

---

## Stage 7: Acceptance Testing
- **Status**: Completed & Verified
- **What was tested**:
  - Acceptance Test 1 (Priority Engine): 10/10 test cases passed.
  - Acceptance Test 2 (5 Sample Notices): Extracted with zero invented fields, missing fields as null.
  - Acceptance Test 3 (Ambiguous Date Handling): Blocks unconfirmed save unless user explicitly resolves or confirms.
  - Acceptance Test 4 (Duplicate Prevention): Duplicate detection warns before saving.
  - Acceptance Test 5 (Persistence & CRUD): Star, copy, edit, delete, search, filter, and view toggle survive refresh via versioned localStorage.
  - Acceptance Test 6 (Empty States): All 3 empty states active (no events, no search results, no events this week).
  - Acceptance Test 7 (Error States): 400 on empty input, 400 on >5,000 chars, 405 on non-POST.
  - Acceptance Test 8 (AI Digest ID Verification): Hallucinated IDs purged by server sanitizer.
  - Acceptance Test 9 (Responsive Breakpoints): Layout verified at 375px, 768px, and 1280px.
  - Acceptance Test 10 (Bundle Security): Automated scan confirmed zero API keys in built bundle.
- **Known issues**: None.

---

## Stage 8: Deployment Prep
- **Status**: Completed & Verified
- **What was built**:
  - `.gitignore`: Comprehensive ignore rules for node_modules, .env, dist, and local caches.
  - `.env.example`: Clear environment variables template documenting `GEMINI_API_KEY` and optional `GEMINI_MODEL`.
  - `vercel.json`: Clean serverless configuration and build output definition for Vercel.
  - Git repository initialized with clean initial commit (`e4f989b`).
- **What was tested**:
  - `git status` confirmed zero untracked files or leaked secret tokens.
- **Known issues**: None.

---

## Stage 9: Documentation & Presentation
- **Status**: In Progress
