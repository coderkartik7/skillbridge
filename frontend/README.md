# SkillBridge Frontend

Career-security and transition mapping tool for tech professionals.

Built with React 19 (Vite), Tailwind CSS, React Router v7, Axios, React Flow (@xyflow/react), Framer Motion, and Lucide React.

---

## 🎨 Design Philosophy & Palette

SkillBridge employs a calm, minimalist aesthetic with lots of whitespace, rounded surfaces (`rounded-2xl`), hairline warm borders (`#F1E7CC`), amber focus rings, and accessible ink-on-color typography:

- **Cream (`#FFEDB9`)**: Soft accents, hover fills, selected cards, secondary button fills
- **Amber (`#FFCB56`)**: Primary actions, key highlights, progress indicators, low risk, checkboxes
- **Orange (`#FFA259`)**: Secondary accents, "Lateral pivot" badges, medium risk, Government tier
- **Coral (`#FF7E7E`)**: Layoff risk / warnings, "Emerging" badges, trending flames, high risk
- **Ink (`#1F1B16`)**: Warm near-black text on all surfaces (contrast compliant)
- **Background Warm (`#FFFDF7`)**: Warm off-white canvas and surfaces
- **Borders (`#F1E7CC`)**: Hairline borders

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Run the Development Server

```bash
npm run dev
```

Visit the local Vite URL (typically `http://localhost:5173`).

---

## 🔌 Switching Between Mock Data and Live Backend

SkillBridge works out of the box with zero backend dependencies using **Mock Mode** (`VITE_USE_MOCK=true`). Realistic mock data is served matching all FastAPI contracts (resolves after ~600ms; mock auth accepts any email and 6+ character password).

To connect to your live FastAPI backend:

1. Open `.env` (or copy from `.env.example`):
   ```env
   # Set to false to proxy requests directly to the FastAPI backend
   VITE_USE_MOCK=false
   VITE_API_URL=http://localhost:8000
   ```
2. Restart the Vite dev server (`npm run dev`).
3. Ensure the FastAPI backend is running on `http://localhost:8000`.

---

## 📱 Features & Workflows

1. **Free Assessment Flow** (`/`, `/map`, `/roadmap`):
   - **Upload (`/`)**: Drag & drop PDF/DOCX or paste resume text, demo personas.
   - **Career Map (`/map`)**: Radial interactive node graph of target pivot roles with match scores & risk gauge.
   - **Roadmap Preview (`/roadmap`)**: Sequential step reveal with course drawer and prominent **"Become Irreplaceable"** primary button.
2. **Authentication System** (`src/context/AuthContext.jsx` & `src/components/AuthModal.jsx`):
   - Accessible modal with Log in / Sign up tabs, inline error handling, focus trap, Esc to close.
   - Session stored in `localStorage` under `sb_session`.
   - Axios request interceptor attaches `Authorization: Bearer <token>` on all requests.
   - Automatic 401 interception: clears session, shows "Session expired, please log in again" toast, and opens login modal.
3. **Personal Dashboard** (`/dashboard`):
   - Grid of saved user roadmaps showing role title, creation date, animated circular progress ring, and "Open" action.
   - Empty state CTA with "Analyze a resume" action.
4. **Roadmap Tracker** (`/dashboard/:id`):
   - Left column milestone accordion cards with step order, trending flame badges, and mini progress bars.
   - Expandable topic rows with accessible checkboxes (optimistic updates + amber check animation), free/paid resource links with fallback search badges, and debounced personal notes (up to 2,000 characters).
   - Celebration toast upon completing all topics of a step (`Skill complete: {skill}`).
   - Sticky summary panel with overall progress ring and a **"Continue"** button that scrolls and highlights the next suggested undone topic.
   - 100% completion celebration banner with direct link to job openings.
5. **Targeted Job Matching** (`/jobs`):
   - Select saved roadmap context to dynamically union verified resume skills with completed step skills.
   - Location filtering and Remote-only toggle.
   - Company tier chips (FAANG, Top MNC, Government, Startup, Unicorn, Other).
   - Live skill match percentage bars and missing skill tags.
6. **Market Intelligence News**    - Public tech news feed with relative timestamps (e.g. `2h ago`).
    - Category filtering with curated colored dots (Layoffs = coral, Funding/Unicorn = amber, Packages = orange, Launches = cream, Hiring/Other = neutral).
7. **Skill Assessment Quiz System** (`src/components/quiz/`):
   - Entry point: "Take quiz" button on each step card on `/dashboard/:id`, enabled once at least 1 topic is ticked.
   - Step 1 (Setup): Segmented difficulty selector (Easy, Medium, Hard) with guidance helpers.
   - Step 2 (Loading): Animated skeleton with "Writing your questions..." (up to 15s).
   - Step 3 (Questions): Single question presentation with Framer Motion slide transitions, progress bar, topic pill, 4 large options with keyboard shortcuts (1-4 select, Enter proceed), unanswered warning check.
   - Step 4 (Results): Large `ScoreRing` percentage ring, level badge, API summary, strong & weak topic chips, expandable detailed review with "Your answer" vs "Correct answer" indicators, and a "Review these topics" button that automatically highlights weak topics in the roadmap.
   - Accessible keyboard trap, Esc key confirmation, and radiogroup semantics.

8. **Recruiter Assisted Candidate Screening** (`/recruiter`, `src/pages/Recruiter.jsx`):
   - **Assists, never decides**: Ranks candidates based on semantic meaning, not keyword matching, with evidence lines backing every claim and zero automated rejections.
   - **Setup View**:
     - Large JD input with character count & inline validation (40 to 10,000 characters).
     - Drag-and-drop resume uploader for PDF/DOCX (max 5 MB each, client-side validation, 50 resumes maximum).
     - Pasted multi-resume support with `---` delimiter.
     - "Load demo data" prefilling realistic senior backend JD and 6 diverse candidate resumes (including keyword-stuffed vs semantic equivalence).
     - Stepper loading state ("Reading resumes" -> "Understanding the job description" -> "Ranking candidates") with in-memory privacy notice.
   - **Results View**:
     - Summary strip: Total screened count, expandable skipped file alerts, collapsible extracted JD requirements chip list.
     - Sticky client-side filter bar: "Show top" percentile control (All, Top 5%, 10%, 25%, 50%), "Minimum experience" slider with the rule that candidates with unknown experience always stay visible, "Minimum skills" stepper, and multi-select Fit band chips (Strong, Good, Weak).
     - Candidate cards: Large rank numeral badge, band badge with accessible icons, segmented fit meter without raw scores or pseudo-percentages, facts row, "Why this ranking" evidence accordion with quotes, and matched/missing skill chips.
     - Expandable Developer Profile Panel: Editable handle inputs (GitHub, Codeforces, LeetCode) calling `POST /recruiter/enrich` to retrieve public stats (stars, active repos, ratings, contests, problem difficulties) with explicit neutrality notice.
     - Pure client-side "Export shortlist" CSV button downloading starred candidate rows.

---

## 📐 Architecture & Folder Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── client.js         # Single point for all HTTP requests, mock data, and 401 interceptor
│   ├── context/
│   │   └── AuthContext.jsx   # Global session state, auth modal triggers, and toast notifications
│   ├── hooks/
│   │   ├── useAsync.js       # Async state management hook
│   │   └── useDebounce.js    # Debounce hook for filter inputs
│   ├── components/
│   │   ├── quiz/             # Quiz feature components
│   │   │   ├── QuizModal.jsx     # Full-screen modal managing 4-step quiz lifecycle
│   │   │   ├── QuizSetup.jsx     # Difficulty level selector & quiz initialization
│   │   │   ├── QuizQuestion.jsx  # Single question view with keyboard shortcuts
│   │   │   ├── QuizResults.jsx   # Score breakdown, topic chips, and detailed review
│   │   │   └── ScoreRing.jsx     # Prominent results circular percentage gauge
│   │   ├── AuthModal.jsx     # Accessible dialog with Log In / Sign Up tabs
│   │   ├── Badge.jsx         # Role labels & risk states
│   │   ├── CategoryChips.jsx # Color-coded filter chips
│   │   ├── EmptyState.jsx    # Graceful zero-item states
│   │   ├── ErrorAlert.jsx    # Coral-tinted error banners with retry action
│   │   ├── Header.jsx        # Navigation header with avatar menu and mobile sheet
│   │   ├── JobCard.jsx       # Job opening card with skill match & company tiers
│   │   ├── Layout.jsx        # Centered container with Framer Motion transitions & toasts
│   │   ├── NewsCard.jsx      # Tech news item card with relative timestamps
│   │   ├── ProgressRing.jsx  # Reusable SVG circular progress ring
│   │   ├── ProtectedRoute.jsx# Auth route guard redirecting to "/" with login modal
│   │   ├── RiskGauge.jsx     # Semicircular risk gauge with market explanation
│   │   ├── RoleNode.jsx      # Custom React Flow node for career pivots
│   │   ├── SkillChips.jsx    # Extracted skill pills with expand support
│   │   ├── Spinner.jsx       # Minimalist inline/block spinner
│   │   ├── StepAccordion.jsx # Roadmap step accordion card with "Take quiz" action
│   │   ├── StepNode.jsx      # Sequential roadmap step node
│   │   ├── TopicDrawer.jsx   # Learning resource drawer for preview flow
│   │   ├── TopicRow.jsx      # Checkbox, resource links, fallback pill, and inline notes
│   │   └── Toast.jsx         # Auto-dismissing floating toast notification
│   ├── lib/
│   │   ├── format.js         # Title casing, byte formatting, and theme mapping
│   │   └── layout.js         # Trigonometric radial calculation for career map
│   ├── pages/
│   │   ├── Upload.jsx        # Drag-and-drop, personas, paste option, analyze action
│   │   ├── CareerMap.jsx     # Radial React Flow graph & mobile stack fallback
│   │   ├── Roadmap.jsx       # Sequential reveal roadmap & "Become Irreplaceable" button
│   │   ├── Dashboard.jsx     # Saved roadmap cards with progress rings
│   │   ├── RoadmapTracker.jsx# Interactive step checklist, notes, quiz triggers
│   │   ├── Jobs.jsx          # Job search matched against roadmap skills
│   │   ├── News.jsx          # Tech market news feed with category chips
│   │   └── NotFound.jsx      # 404 page
│   ├── App.jsx               # Application routing and providers
│   ├── index.css             # Tailwind base and design utilities
│   └── main.jsx
├── tailwind.config.js        # Design tokens and custom palette
```

