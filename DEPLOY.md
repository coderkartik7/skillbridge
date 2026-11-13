# Deployment Guide: SkillBridge on Render (Free Tier)

This guide walks through deploying the **SkillBridge** full-stack application (FastAPI backend + React frontend) to Render using the Infrastructure-as-Code Blueprint (`render.yaml`).

---

## ⚡ Free Tier Architecture & Limitations

Render's free tier provides a zero-cost hosting environment with the following characteristics:
- **Memory & CPU:** 512 MB RAM and 0.1 vCPU per service. The backend ML pipeline has been optimized with ONNX Runtime, NumPy, and FastEmbed (`all-MiniLM-L6-v2`) with precomputed occupation embeddings to run at ~185 MB RSS (well below the 512 MB limit).
- **Idle Sleep:** Web services sleep automatically after **15 minutes of inactivity**. Cold start takes roughly **50–70 seconds**. The frontend shows an automatic notification banner: *"Waking up the server, this can take up to a minute on the free plan"*, and retries idempotent requests.
- **Ephemeral Filesystem:** The disk resets on redeploy or restart. The SQLite database is ephemeral; however, the startup routine automatically seeds the demo user on fresh boots.
- **Recruiter Batch Size:** Configured to `MAX_CANDIDATES=10` on Render to avoid CPU throttling on the 0.1 vCPU allocation.

---

## 📋 Click-by-Click Deployment Steps

### Step 1: Push the Repo to GitHub
Ensure all changes on the `render-deploy` branch are committed and pushed to your GitHub repository:
```bash
git checkout render-deploy
git push -u origin render-deploy
```

---

### Step 2: Create a Blueprint on Render
1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. In the top-right corner, click **New +** and select **Blueprint**.
3. Connect your GitHub account (if not already connected) and select the `SkillBridge` repository.
4. Set the branch to `render-deploy`.
5. Render will automatically parse `render.yaml` and display the two configured services:
   - `skillbridge-api` (Python Web Service)
   - `skillbridge-web` (Static Site)

---

### Step 3: Configure Environment Variables & Secrets
Render will prompt you to provide values for variables configured with `sync: false`. Fill them in as follows:

| Service | Environment Variable | Required / Optional | Value / Description |
| :--- | :--- | :--- | :--- |
| **API** | `DEMO_PASSWORD` | **Required** | Password for the default demo user (`demo@skillbridge.app`). |
| **API** | `CORS_ORIGINS` | Temporary | Leave as `http://localhost:5173` for the initial deploy; updated in Step 6. |
| **API** | `GEMINI_API_KEY` | *Optional* | Google Gemini API key (enables AI career advice and market news categorization). |
| **API** | `ADZUNA_APP_ID` | *Optional* | Adzuna Job Search App ID. |
| **API** | `ADZUNA_APP_KEY` | *Optional* | Adzuna Job Search App Key. |
| **API** | `GITHUB_TOKEN` | *Optional* | GitHub Personal Access Token (for candidate profile enrichment). |
| **API** | `JWT_SECRET` | *Auto-generated* | Render generates a cryptographically secure random value automatically. |
| **Web** | `VITE_API_URL` | Temporary | Leave empty or set to placeholder; updated in Step 5. |

Click **Apply** to start the initial build and deployment.

---

### Step 4: Wait for the API to Go Live & Copy its URL
1. In the Render Dashboard, monitor the build logs for `skillbridge-api`.
2. The build runs:
   ```bash
   pip install --no-cache-dir -r requirements.txt && python scripts/download_model.py
   ```
3. Once the health check passes, the service status turns **Live**.
4. Copy the public API URL from the header (e.g. `https://skillbridge-api-xxxx.onrender.com`).

---

### Step 5: Connect Frontend to API & Redeploy Frontend
1. Open the **skillbridge-web** service in your Render Dashboard.
2. Navigate to **Environment**.
3. Locate `VITE_API_URL` and click **Edit**.
4. Paste the API URL from Step 4 (e.g. `https://skillbridge-api-xxxx.onrender.com` without a trailing slash).
5. Click **Save Changes**.
6. Render will automatically trigger a new build of the static site with the updated backend URL embedded.

---

### Step 6: Update API CORS & Redeploy API
1. Open the **skillbridge-web** service and copy its public URL (e.g. `https://skillbridge-web-xxxx.onrender.com`).
2. Open the **skillbridge-api** service in your Render Dashboard.
3. Navigate to **Environment**.
4. Locate `CORS_ORIGINS` and click **Edit**.
5. Set `CORS_ORIGINS` to your frontend URL (e.g. `https://skillbridge-web-xxxx.onrender.com`).
   - *Tip:* You can provide comma-separated origins if testing locally: `https://skillbridge-web-xxxx.onrender.com,http://localhost:5173`.
6. Click **Save Changes**. Render will automatically restart the backend service.

---

### Step 7: Verification & Test Checklist
Once both services are Live, run through this sanity checklist:

- [ ] **Health Endpoint:** Open `https://skillbridge-api-xxxx.onrender.com/health` in your browser. Verify it returns `{"status":"ok"}` in < 100ms.
- [ ] **Interactive API Docs:** Open `https://skillbridge-api-xxxx.onrender.com/docs` to view Swagger UI.
- [ ] **Demo Login:** Visit your frontend URL, click **Sign In**, and log in with:
  - **Email:** `demo@skillbridge.app`
  - **Password:** `<The DEMO_PASSWORD you configured>`
- [ ] **Resume Analysis:** On the home page, upload a sample PDF/DOCX or paste backend developer resume text. Verify that skill extraction, current role detection, and career options render quickly.
- [ ] **Recruiter Screen:** Navigate to `/recruiter`. Paste the sample job description and upload or paste 5 resumes. Verify candidate ranking, evidence extraction, and match scores.
- [ ] **Market News:** Navigate to `/news`. Verify that market trends and news cards load.

---

## 🛠️ Troubleshooting

### 1. Out of Memory (OOM / Error 137)
- **Cause:** PyTorch or large memory arenas loaded into memory.
- **Resolution:** The codebase is now free of PyTorch and SentenceTransformers. FastEmbed runs with `enable_cpu_mem_arena=False` and single-thread execution (`OMP_NUM_THREADS=1`). Process RSS sits at ~185 MB under load. If memory spikes, ensure `MAX_CANDIDATES` is set to `10`.

### 2. CORS Errors in Browser Console
- **Symptom:** `Access to fetch at ... has been blocked by CORS policy`.
- **Resolution:** Ensure the static site's origin matches `CORS_ORIGINS` in `skillbridge-api`. The origin must include `https://` and have no trailing slash (e.g. `https://skillbridge-web-xxxx.onrender.com`).

### 3. 502 Bad Gateway / Connection Timeout While Waking Up
- **Symptom:** First request after 15+ minutes of inactivity times out or returns 502.
- **Resolution:** Render spins down free containers when idle. Waking the container takes 50–70s. The frontend has a 90s axios timeout and auto-retries idempotent requests while displaying the waking-up banner. Wait 60 seconds and refresh.

### 4. 404 Not Found on Page Refresh
- **Symptom:** Reloading a subpage like `/recruiter` or `/news` gives a 404 error.
- **Resolution:** Render static sites need a rewrite rule to redirect all routes to `index.html`. This is already configured in `render.yaml` (`routes: - type: rewrite, source: /*, destination: /index.html`).

---

## ⏰ Optional: Keep Service Awake Before Demos
To avoid cold start delays before a presentation, you can set up a free uptime monitor:
1. Register for free at [UptimeRobot](https://uptimerobot.com/) or [cron-job.org](https://cron-job.org/).
2. Create a new HTTP(s) monitor pointing to:
   ```
   https://skillbridge-api-xxxx.onrender.com/health
   ```
3. Set the monitoring interval to **every 5 minutes**.
4. This keeps the backend warm during demo hours without incurring costs.

