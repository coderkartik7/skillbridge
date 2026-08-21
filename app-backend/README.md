# SkillBridge App Backend (Node.js)

A lightweight Node.js/Express backend that sits between the React frontend and the FastAPI AI service.

## Architecture

```
React Frontend (Port 5173) ──> Node.js Express Backend (Port 4000) ──> FastAPI AI Service (Port 8000)
```

This backend is a stateless passthrough layer with no database, no authentication, and no storage.

## Folder Structure

```
app-backend/
├── src/
│   ├── index.js              # Entrypoint, Express server setup & CORS middleware
│   ├── routes/
│   │   └── resume.js         # Passthrough routes for /api/* endpoints
│   ├── services/
│   │   └── aiClient.js       # Isolated HTTP client communicating with FastAPI
│   └── config/
│       └── env.js            # Environment variable loader
├── .env                      # Local environment configuration
├── package.json
└── README.md
```

## Setup & Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create or verify `.env` in `app-backend/`:
```env
PORT=4000
AI_BACKEND_URL=http://127.0.0.1:8000
```

### 3. Run the Development Server
```bash
npm run dev
```

### 4. Run in Production Mode
```bash
npm start
```

## API Endpoints

All endpoints are prefixed with `/api`:

### 1. Extract Skills
- **URL:** `POST /api/extract-skills`
- **Body:** `{ "text": "<resume or free text>" }`
- **Response:**
  ```json
  { "skills": ["python", "sql", "react"] }
  ```

### 2. Match Occupations
- **URL:** `POST /api/match`
- **Body:** `{ "text": "<resume or free text>" }`
- **Response:**
  ```json
  {
    "matches": [
      ["15-2051.00", "Data Scientists", 0.537],
      ["15-2041.00", "Clinical Data Managers", 0.448]
    ]
  }
  ```

### 3. Skill Gap Analysis
- **URL:** `GET /api/gap/:occupationId?text=<resume text>`
- **Path Param:** `occupationId` (e.g. `15-2051.00`)
- **Query Param:** `text` (resume / candidate text)
- **Response:**
  ```json
  {
    "missing_skills": [
      {
        "skill_id": 32,
        "skill_name": "data base management system software",
        "relevance": 6.0,
        "is_trending": true
      }
    ]
  }
  ```
