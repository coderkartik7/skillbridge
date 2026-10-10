from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import extract, match, gap, live_demand, upload, analyze, roadmap, auth, me, jobs, news, quiz, recruiter
from app.db.database import init_db
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="SkillBridge Backend")

init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "SkillBridge backend running"}

app.include_router(extract.router)
app.include_router(match.router)
app.include_router(gap.router)
app.include_router(live_demand.router)
app.include_router(upload.router)
app.include_router(analyze.router)
app.include_router(roadmap.router)
app.include_router(auth.router)
app.include_router(me.router)
app.include_router(jobs.router)
app.include_router(news.router)
app.include_router(quiz.router)
app.include_router(recruiter.router)