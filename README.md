# 🌉 SkillBridge

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live%20Demo-4F46E5?style=for-the-badge&logo=vercel&logoColor=white)](https://skillbridge-v01.vercel.app/)

![SkillBridge Banner](https://img.shields.io/badge/SkillBridge-AI%20Career%20Intelligence-4F46E5?style=for-the-badge&logoColor=white)

**An intelligent career navigation, semantic skill matching, and recruiter screening platform tailored for tech professionals.**

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![ONNX Runtime](https://img.shields.io/badge/ONNX_Runtime-005CED?style=for-the-badge&logo=onnx&logoColor=white)](https://onnxruntime.ai/)
[![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)

[Key Features](#-key-features) •
[Architecture](#-architecture) •
[Quickstart](#-quickstart) •
[API Reference](#-api-endpoints) •
[Render Deployment](#-deployment-on-render)

</div>

---

## 💡 Overview

**SkillBridge** empowers engineers to map career transitions, identify skill gaps against 1,000+ standardized O*NET occupations, and track personalized learning roadmaps. For hiring teams, SkillBridge delivers semantic recruiter screening that evaluates candidate resumes by core competencies rather than fragile keyword matching.

Optimized to run on ultra-lean infrastructure, SkillBridge executes ONNX vector embeddings and NLP tokenization within **< 200 MB RAM**, making it free-tier deployment ready.

---

## ✨ Key Features

### 🎯 1. Semantic Resume & Career Analysis
- **Automatic Skill Extraction:** Blazingly fast entity matching with custom rule pipelines across 4,000+ technical taxonomy patterns.
- **Role Detection:** Vector projection against industry occupation profiles using FastEmbed ONNX embeddings (`sentence-transformers/all-MiniLM-L6-v2`).
- **Gap & Readiness Analysis:** Dynamic readiness percentage calculation, isolating trending "Hot Tech" missing competencies.

### 👥 2. Recruiter Resume Screening
- **Evidence-Based Matching:** Breaks down Job Descriptions into granular requirements and matches them against resume chunks using cosine similarity.
- **Noise & Bias Scrubbing:** Strips contact info, URLs, phone numbers, and demographics to evaluate candidates purely on verified technical merit.
- **Candidate Badging & Ranking:** Categorizes candidates into `Strong`, `Good`, and `Weak` tiers with supporting snippet citations.

### 🗺️ 3. Interactive Roadmap & Skill Tracking
- **Personalized Milestones:** Generates tailored learning steps from current skill set to target role.
- **Progress Tracking:** Interactive topic checklists with SQLite persistence.
- **Skill Quizzes:** Contextual self-assessment quizzes to validate acquired competencies.

### 📰 4. Tech Market Intelligence
- **Live News Curation:** Aggregated tech hiring, funding, and layoff updates tagged via Google Gemini.
- **Real-Time Job Feeds:** Integrated live job openings via Adzuna API.

---

## 🏗️ Architecture

```
SkillBridge/
├── ai-backend/                     # FastAPI ML & NLP Service
│   ├── app/
│   │   ├── main.py                 # FastAPI application, CORS, health & demo seeding
│   │   ├── routers/                # API endpoints (analyze, recruiter, jobs, news, ...)
│   │   ├── services/               # ML inference, embeddings, screening, extraction
│   │   └── db/                     # SQLite schema & persistence
│   ├── data/
│   │   ├── processed/              # Normalized O*NET datasets & occupation_embeddings.npy
│   │   └── market/                 # News & jobs cached datasets
│   ├── scripts/                    # Model download & offline embedding precomputation
│   └── requirements.txt            # Slimmed dependencies (No PyTorch runtime required)
│
├── frontend/                       # Modern React + Vite Single Page Application
│   ├── src/
│   │   ├── api/client.js           # Axios client with auto-retry & wakeup handling
│   │   ├── components/             # Reusable UI widgets, recruiter components, modals
│   │   ├── pages/                  # Upload, CareerMap, Roadmap, Recruiter, News, Jobs
│   │   └── lib/                    # Recruiter filtering algorithms & layout helpers
│   └── package.json
│
├── render.yaml                     # Infrastructure-as-Code Render Blueprint
└── DEPLOY.md                       # Comprehensive Render deployment playbook
```

---

## ⚡ Memory & Performance Optimization

SkillBridge is engineered for tight memory constraints:
- **No PyTorch Overhead:** PyTorch and `sentence-transformers` have been replaced with **FastEmbed (ONNX Runtime)** and NumPy vector operations.
- **Offline Embedding Cache:** 1,066 occupation vector representations are precomputed and committed (`occupation_embeddings.npy`), eliminating startup delays.
- **Low Footprint:** CPU memory arena disabled (`enable_cpu_mem_arena=False`), keeping runtime RSS below **200 MB** under full screening load (comfortably within Render's 512 MB free tier).

---

## 🚀 Quickstart

### Prerequisites
- **Python:** 3.10 or 3.11
- **Node.js:** 18+ and `npm`

### 1. Backend Setup

```bash
cd ai-backend

# Create virtual environment
python -m venv venv
# On Windows: .\venv\Scripts\activate
# On Linux/macOS: source venv/bin/activate

# Install slim dependencies
pip install -r requirements.txt

# Pre-download the ONNX model to local cache
python scripts/download_model.py

# Launch FastAPI server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- API Base: `http://localhost:8000`
- Interactive Swagger UI: `http://localhost:8000/docs`
- Health Endpoint: `http://localhost:8000/health`

### 2. Frontend Setup

```bash
cd frontend

# Install packages
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🔑 Environment Configuration

Create a `.env` file in `ai-backend/` (or configure via Render environment variables):

```env
# Database & Network
DB_PATH="data/skillbridge.db"
CORS_ORIGINS="http://localhost:5173"

# Authentication & Seeding
JWT_SECRET="your-super-secret-jwt-key"
DEMO_EMAIL="demo@skillbridge.app"
DEMO_PASSWORD="YourSecurePassword123"

# Screening Limit
MAX_CANDIDATES=50

# Integrations (Optional)
GEMINI_API_KEY=""
ADZUNA_APP_ID=""
ADZUNA_APP_KEY=""
ADZUNA_COUNTRY="in"
GITHUB_TOKEN=""
LEETCODE_ENABLED=0
```

---

## 📡 API Endpoints

| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Instant ping endpoint (touches neither DB nor model) |
| `POST` | `/analyze` | Extracts skills, detects current role, and calculates transition paths |
| `POST` | `/recruiter/screen` | Evaluates batches of candidate resumes against a Job Description |
| `POST` | `/extract-skills` | Tokenizes and extracts recognized taxonomy skills from text |
| `POST` | `/match` | Vector similarity match against O*NET occupations |
| `GET` | `/gap/{occupation_id}` | Computes missing technical skills and readiness percentage |
| `GET` | `/news` | Returns AI-categorized tech market news & trends |
| `GET` | `/jobs` | Live developer job openings powered by Adzuna |
| `POST` | `/auth/signup` & `/login`| JWT user authentication |

---

## ☁️ Deployment on Render

Deploying SkillBridge on Render's free tier takes less than 5 minutes using the included `render.yaml` blueprint:

1. **Push your code** to GitHub.
2. In Render, select **New +** → **Blueprint** and select your repository.
3. Configure the environment variables (`DEMO_PASSWORD`, etc.).
4. Link `VITE_API_URL` on the frontend and `CORS_ORIGINS` on the backend.

👉 For comprehensive step-by-step instructions, see [DEPLOY.md](file:///c:/D%20Drive/Primary/Tech/Projects/SkillBridge/DEPLOY.md).

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

