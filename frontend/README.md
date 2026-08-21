# SkillBridge Frontend (React + Vite)

A modern, responsive 3-screen React application for AI-powered career skill matching and gap analysis.

## Features & Screens

1. **Screen 1 — Resume / Skills Input (`/`)**:
   - Large textarea for pasting resume text, CV summaries, or list of technical skills.
   - Quick one-click sample profiles for fast exploration.
   - Character count and interactive loading state.
   - Navigates to `/matches` with extracted results.

2. **Screen 2 — Occupation Match Results (`/matches`)**:
   - Ranked list of matched occupations with percentage match bars and raw cosine scores.
   - Visual badges for top recommendations.
   - Action to inspect the personalized skill gap for any target occupation.
   - Option to go back and edit resume text.

3. **Screen 3 — Skill Gap Analysis (`/gap`)**:
   - Detailed breakdown of missing competencies for the selected occupation.
   - Distinct badges for **Hot Tech / In-Demand (Trending)** skills.
   - 1–6 relevance metric indicator bars.
   - Positive empty state when all required skills are already mastered.
   - Back and restart actions.

## Tech Stack

- **Framework:** React 18 + Vite
- **Routing:** React Router v6
- **Styling:** Tailwind CSS + Plus Jakarta Sans & Inter typography
- **HTTP Client:** Axios (pointing to `http://localhost:4000/api`)
- **Icons:** Lucide React

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── client.js          # Isolated API client calling Node backend
│   ├── components/
│   │   └── Layout.jsx         # Header, responsive 3-step progress bar, footer
│   ├── pages/
│   │   ├── ResumeInput.jsx    # Screen 1
│   │   ├── MatchResults.jsx   # Screen 2
│   │   └── GapAnalysis.jsx    # Screen 3
│   ├── App.jsx                # Router configuration
│   ├── index.css              # Tailwind base & utilities
│   └── main.jsx               # Entrypoint
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## Running the Application

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Vite Development Server
```bash
npm run dev
```
The app will run at `http://localhost:5173`.

### 3. Production Build
```bash
npm run build
```
