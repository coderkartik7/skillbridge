# SkillBridge Frontend

Career-security and transition mapping tool for tech professionals.

Built with React (Vite), Tailwind CSS, React Flow (@xyflow/react), Framer Motion, and Lucide React.

---

## 🎨 Design Philosophy & Palette

SkillBridge employs a calm, minimalist aesthetic with lots of whitespace, rounded surfaces (`rounded-2xl`), hairline warm borders, and accessible contrast:

- **Cream (`#FFEDB9`)**: Soft accents, hover fills, selected cards
- **Amber (`#FFCB56`)**: Primary actions, key highlights, progress indicators, low risk
- **Orange (`#FFA259`)**: Secondary accents, "Lateral pivot" badges, medium risk
- **Coral (`#FF7E7E`)**: Layoff risk / warnings, "Emerging" badges, trending flames, high risk
- **Ink (`#1F1B16`)**: Warm near-black text on all surfaces (contrast compliant)
- **Background (`#FFFDF7`)**: Warm off-white page background

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

By default, SkillBridge runs in **Mock Mode** (`VITE_USE_MOCK=true`) with complete realistic data including 4 career pivot options and an 8-step interactive learning roadmap with simulated network latency (~850ms).

To connect to your live FastAPI backend:

1. Open `.env` (or copy from `.env.example`):
   ```env
   VITE_USE_MOCK=false
   VITE_API_URL=http://localhost:8000
   ```
2. Restart the Vite dev server (`npm run dev`).
3. Ensure the FastAPI backend is running on `http://localhost:8000`.

---

## 📐 Architecture & Folder Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── client.js         # Single point for all HTTP requests & mock logic
│   ├── components/
│   │   ├── Badge.jsx         # Role labels (Step up, Lateral, Emerging) & risk states
│   │   ├── EmptyState.jsx    # Zero-option and zero-step graceful states
│   │   ├── ErrorAlert.jsx    # Coral-tinted error banners with retry action
│   │   ├── Header.jsx        # Sticky navigation with bridge glyph & "Start over"
│   │   ├── Layout.jsx        # Centered container with Framer Motion transitions
│   │   ├── RiskGauge.jsx     # Semicircular risk gauge with market explanation
│   │   ├── RoleNode.jsx      # Custom React Flow node for career pivots
│   │   ├── SkillChips.jsx    # Extracted skill pills with "+N more" expand
│   │   ├── Spinner.jsx       # Minimalist inline/block spinner
│   │   ├── StepNode.jsx      # Sequential roadmap step node
│   │   └── TopicDrawer.jsx   # Learning resource drawer with free/paid links
│   ├── lib/
│   │   ├── format.js         # Title casing, byte formatting, and theme mapping
│   │   └── layout.js         # Trigonometric radial calculation for career map
│   ├── pages/
│   │   ├── Upload.jsx        # Drag-and-drop, personas, paste option, analyze action
│   │   ├── CareerMap.jsx     # Radial React Flow graph & mobile stack fallback
│   │   └── Roadmap.jsx       # Sequential reveal roadmap & animated camera
│   ├── App.jsx               # Application routing and fallback handling
│   ├── index.css             # Tailwind base and React Flow overrides
│   └── main.jsx
├── tailwind.config.js        # Design tokens and custom palette
└── package.json
```
