# SkillBridge AI Backend (FastAPI)

FastAPI-powered machine learning and natural language processing service that handles skill extraction, semantic occupation matching, and career skill gap analysis based on the O*NET taxonomy.

---

## 🚀 Overview

The AI Backend serves as the intelligence engine for SkillBridge:
- **Skill Extraction:** Parses unstructured resume/profile text and identifies recognized technical and domain competencies.
- **Occupation Matching:** Matches candidate skill sets against 1,000+ industry occupations using vector embeddings and similarity scoring.
- **Skill Gap Analysis:** Cross-references the candidate's skills against standard occupation profiles to identify missing competencies, ranking them by relevance and trending status ("Hot Tech").
- **Course Recommendations:** Associates missing skills with curated online courses and learning materials.

---

## 📁 Directory Structure

```
ai-backend/
├── app/
│   ├── main.py                     # FastAPI application setup and router mounting
│   ├── core/                       # Core configuration and settings
│   ├── routers/                    # API route endpoints
│   │   ├── extract.py              # POST /extract-skills
│   │   ├── match.py                # POST /match
│   │   └── gap.py                  # GET /gap/{occupation_id}
│   ├── services/                   # Business and ML logic
│   │   ├── skill_extraction.py     # NLP/Regex skill extraction routines
│   │   ├── matching.py             # Occupation similarity matching
│   │   ├── gap_analysis.py         # Skill gap calculation & trending sort
│   │   ├── embeddings.py           # Vector embedding utilities
│   │   └── course_recommendation.py# Course mapping logic
│   ├── models/                     # Pydantic schemas and data models
│   └── db/                         # Database connection & queries
├── data/
│   ├── raw/                        # Original source data (O*NET taxonomy)
│   └── processed/                  # Normalized CSV datasets (occupations, skills, courses)
├── notebooks/                      # Data exploration & modeling experiments
├── scripts/                        # Data processing & embedding generation scripts
├── requirements.txt                # Python package dependencies
└── README.md                       # Service documentation
```

---

## 🛠️ Setup & Running

### 1. Prerequisites
- Python 3.10+
- Virtual environment (`venv` or `conda`)

### 2. Create and Activate Virtual Environment

**Windows:**
```powershell
python -m venv venv
.\venv\Scripts\activate
```

**Linux / macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Start the FastAPI Server
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- **Service Base URL:** `http://127.0.0.1:8000`
- **Interactive Swagger Docs:** `http://127.0.0.1:8000/docs`
- **ReDoc:** `http://127.0.0.1:8000/redoc`

---

## 🌐 API Endpoints

### 1. Extract Skills
Extracts recognized skills from raw resume or profile text.

- **Endpoint:** `POST /extract-skills`
- **Request Body:**
  ```json
  {
    "text": "Experienced in Python, SQL, machine learning, and React."
  }
  ```
- **Response:**
  ```json
  {
    "skills": ["python", "sql", "machine learning", "react"]
  }
  ```

---

### 2. Match Occupations
Ranks the top 5 matching occupations based on semantic similarity to the input profile.

- **Endpoint:** `POST /match`
- **Request Body:**
  ```json
  {
    "text": "Data science professional specializing in predictive modeling and statistics."
  }
  ```
- **Response:**
  ```json
  {
    "matches": [
      ["15-2051.00", "Data Scientists", 0.537],
      ["15-2041.00", "Clinical Data Managers", 0.448],
      ["15-2031.00", "Operations Research Analysts", 0.412],
      ["15-1251.00", "Computer Programmers", 0.389],
      ["15-1211.00", "Computer Systems Analysts", 0.365]
    ]
  }
  ```

---

### 3. Skill Gap Analysis
Calculates missing competencies for a specific target occupation, sorted by trending status and relevance.

- **Endpoint:** `GET /gap/{occupation_id}?text=<resume_text>`
- **Parameters:**
  - `occupation_id` (*path parameter*): O*NET occupation code (e.g. `15-2051.00`)
  - `text` (*query parameter*): Candidate's resume or skill text
- **Response:**
  ```json
  {
    "missing_skills": [
      {
        "skill_id": 32,
        "skill_name": "data base management system software",
        "relevance": 6.0,
        "is_trending": true
      },
      {
        "skill_id": 45,
        "skill_name": "data visualization",
        "relevance": 5.5,
        "is_trending": false
      }
    ]
  }
  ```

---

## 📊 Data Taxonomy

The service utilizes processed datasets stored under `data/processed/`:
- **`occupations.csv`**: Standard O*NET occupation codes, titles, and descriptions.
- **`skills.csv`**: Taxonomy of essential, technical, and domain-specific skills.
- **`occupation_skills.csv`**: Normalized mapping with importance/relevance scores and hot technology flags.
- **`courses.csv`**: Curated learning materials for skill gap fulfillment.
