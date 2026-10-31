# ⚡ Campus Pulse
> **AI-Powered Campus Notice and Event Hub for College Students**  
> *Built for the College AI Buildathon*

---

## 📌 Problem Statement
College students miss critical hackathon registrations, workshop deadlines, and academic notices every single week. Announcements are scattered across chaotic WhatsApp forwards, emails, and poster captions filled with emojis, typos, and Hinglish walls of text. Students constantly struggle to answer four essential questions:
1. *What’s happening on campus today?*
2. *Which deadlines are closing soon?*
3. *What should I attend?*
4. *What do I need to know this week?*

**Campus Pulse** bridges this gap: paste ANY messy announcement, and the system extracts a structured event card, checks for ambiguous dates, computes deterministic urgency rankings, and organizes everything in a clean dashboard, interactive calendar, and weekly briefing digest.

---

## ✨ Key Features

### 1. 🤖 Smart Notice Parser & Ambiguity Detector (F1)
* Accepts WhatsApp forwards, emails, and poster captions (supports emojis, Hinglish, all-caps, and typos).
* Extracts title, date, start time, end time, venue, category, 1-2 sentence description, registration deadline, and instructions.
* **Ambiguity Detection**: Numeric dates like `04/05/2026` are automatically flagged with options (e.g. 4th May vs 5th April) so students never attend an event on the wrong day.
* **Pre-Save Review Card**: Displays extracted details in an editable preview. Missing or unconfirmed dates are saved with status `DATE UNCONFIRMED`.
* **Zero-Setup Demo Mode**: 5 built-in sample notices allow anyone to test the application immediately without an API key.

### 2. 🗂️ Deterministic Priority System (F3)
* Urgency is calculated by pure JavaScript functions locked to the `Asia/Kolkata` timezone—never by hallucinating AI models:
  * 🔴 **URGENT**: Happening today/now, or starting / deadline closing within 24 hours.
  * 🔵 **UPCOMING**: Confirmed event more than 24 hours away.
  * ⚪ **EXPIRED**: Event end time and registration deadline have passed.
  * 🟡 **DATE UNCONFIRMED**: Missing or tentative date.
  * ⚠️ **Registration Closed**: Sub-badge indicating that registration has closed while the event itself is still upcoming.

### 3. 📅 Zero-Dependency Month Calendar & Search (F2)
* Hand-crafted custom month grid showing weekday headers, day numbers, and event pills.
* Clicking any day opens an instant schedule drawer for that date.
* Multi-filter search: query by keywords (title, venue, description), category presets, or date ranges (Today, This Week, Unconfirmed, Expired).

### 4. 📰 AI Weekly Digest (F4)
* One-click *"What do I need to know this week?"* briefing analyzing only events occurring in the rolling next 7 days.
* **Hallucination Defense**: The server verifies every referenced event ID against real stored events and purges invalid references. Dates and venues displayed are verified from storage, not invented AI text.

### 5. 💾 Local Event Management (F5)
* Persisted in `localStorage` behind a modular abstraction layer (`storage.js`).
* Complete CRUD: Create, Edit, Star (Important), Copy clean plain text summary to clipboard, and Delete with confirmation.
* Duplicate detection: Warns the student if an event with the same title, date, and start time already exists.

---

## 🛠️ Tech Stack & Architecture

* **Frontend**: React 19 + JavaScript with Vite.
* **Styling**: Plain CSS with CSS Variables (design tokens for navy typography, electric indigo/violet accents, 4/8px spacing grid, and mobile-friendly responsive breakpoints).
* **Icons**: `lucide-react`.
* **Backend**: Serverless endpoints in `/api` (`/api/extract.js` and `/api/digest.js`).
* **AI Model**: Google Gemini API via official REST interface (defaulting to `gemini-2.5-flash` with structured JSON mode and prompt injection hardening).
* **Testing**: Vitest for unit tests covering priority math, calendar dates, and API validation.

---

## 🚀 Getting Started (Step-by-Step for Beginners)

### 1. Prerequisites
Ensure you have **Node.js** (v18 or higher) installed on your system.

### 2. Installation
Open your terminal in the project directory and run:
```bash
npm install
```

### 3. Run Locally
To start the local development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser. The app starts immediately in **Demo Mode** with 5 pre-loaded sample notices.

### 4. Run Unit Tests
To verify all date calculations, priority rules, and API validation logic:
```bash
npm run test
```

### 5. Build for Production
To build the optimized static bundle:
```bash
npm run build
```

---

## 🔑 Adding a Live Gemini API Key (Optional)

By default, Campus Pulse runs in **Demo Mode** using realistic sample extractions. To connect to live Google Gemini AI:

1. Obtain a free API key from [Google AI Studio](https://aistudio.google.com/).
2. Create a file named `.env` in the root folder:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   GEMINI_MODEL=gemini-2.5-flash
   ```
3. Restart the dev server (`npm run dev`). The top header will automatically transition from **Demo Mode** to **Live Gemini**.

---

## 🌐 Deploying to Vercel

### Option A: Deploy via GitHub (Recommended)
1. Push your repository to GitHub:
   ```bash
   git remote add origin https://github.com/your-username/campus-pulse.git
   git branch -M main
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Select your GitHub repository.
4. (Optional) Under **Environment Variables**, add `GEMINI_API_KEY`.
5. Click **Deploy**. Vercel will build the frontend and deploy the `/api` serverless functions automatically.

### Option B: Deploy via Vercel CLI
```bash
npx vercel
```
Follow the interactive prompts to link your account and deploy.

---

## 🔒 Known Limitations & Architecture Notes

1. **Local Storage Scoping**: Events are stored in the browser's `localStorage`. Data is saved per-device and per-browser, private to that session, and does not automatically sync across multiple computers unless exported as JSON.
2. **Clear Site Data**: If the user clears browser cookies and site cache, local events are reset. A built-in **Export JSON** feature is provided in the Settings tab to safeguard backups.
3. **Multi-Notice Parsing**: If a student pastes a text containing multiple separate announcements, the parser extracts the primary event and flags an ambiguity alerting the user that additional events were found.

---

## ⏱️ 2-Minute Buildathon Demo Script

> **Judge**: *"What did you build and why?"*

* **0:00 - 0:25 (The Problem)**:  
  *"Judges, college students get their daily campus updates through messy WhatsApp forwards and posters with emojis and Hinglish. We constantly miss hackathon deadlines or arrive at workshops at the wrong time. This is Campus Pulse."*

* **0:25 - 0:50 (The Live Parser & Ambiguity Resolution)**:  
  *"Watch what happens when I paste this messy WhatsApp forward with an ambiguous date like `04/05/2026`. I click 'Extract Event Details'. The AI extracts the exact fields, but notice what our engine does: it flags an amber warning because `04/05` could mean 4th May or 5th April. It forces me to choose or confirm before saving, so I never miss an event due to a date format misunderstanding."*

* **0:50 - 1:20 (Deterministic Priority System)**:  
  *"Once saved, notice our priority tags. We do NOT ask an AI whether something is urgent. We wrote a pure, mathematically verified priority engine locked to Indian Standard Time. If an event or its registration deadline is within 24 hours, it jumps to red URGENT at the top of the dashboard. Everything else is blue UPCOMING, and expired events are archived."*

* **1:20 - 1:45 (Calendar & Weekly Digest)**:  
  *"Students can toggle directly to our custom-built Month Calendar to see all events visually, or click 'What do I need to know this week?' to get an executive 7-day AI briefing. Most importantly: our server cross-checks every single event ID in that briefing against real storage so the AI cannot hallucinate fake events."*

* **1:45 - 2:00 (Engineering Excellence & Security)**:  
  *"The app works in Demo Mode offline or with live Gemini API keys. All API keys remain strictly on the server—zero secrets in the client bundle. It's responsive, accessible, and ready for production on Vercel."*

