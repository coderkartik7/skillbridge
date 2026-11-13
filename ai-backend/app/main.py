import os
import logging
import threading
import bcrypt
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.routers import (
    extract,
    match,
    gap,
    live_demand,
    upload,
    analyze,
    roadmap,
    auth,
    me,
    jobs,
    news,
    quiz,
    recruiter,
)
from app.db.database import init_db, get_conn

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def seed_demo_user():
    conn = get_conn()
    try:
        with conn:
            row = conn.execute("SELECT COUNT(*) FROM users").fetchone()
            if row and row[0] == 0:
                demo_email = os.getenv("DEMO_EMAIL", "demo@skillbridge.app").strip().lower()
                demo_password = os.getenv("DEMO_PASSWORD")
                if demo_password:
                    pw_hash = bcrypt.hashpw(demo_password.encode(), bcrypt.gensalt()).decode()
                    conn.execute(
                        "INSERT INTO users (email, password_hash) VALUES (?, ?)",
                        (demo_email, pw_hash),
                    )
                    logger.info(f"Seeded demo user: {demo_email}")
                else:
                    logger.info("DEMO_PASSWORD is not set; skipping demo user seeding.")
    except Exception as e:
        logger.error(f"Failed to seed demo user: {e}")
    finally:
        conn.close()


def warm_news_cache():
    if os.getenv("GEMINI_API_KEY"):
        try:
            logger.info("Warming news cache in background...")
            from app.services.news import get_news
            get_news()
            logger.info("News cache warmup finished successfully.")
        except Exception as e:
            logger.error(f"News cache warmup failed: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    seed_demo_user()
    if os.getenv("GEMINI_API_KEY"):
        t = threading.Thread(target=warm_news_cache, daemon=True)
        t.start()
    yield


app = FastAPI(title="SkillBridge Backend", lifespan=lifespan)

cors_origins_env = os.getenv("CORS_ORIGINS", "http://localhost:5173")
origins = [o.strip() for o in cors_origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


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
