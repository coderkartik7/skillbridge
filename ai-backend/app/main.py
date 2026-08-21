from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import extract, match, gap

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "SkillBridge AI backend running"}

app.include_router(extract.router)
app.include_router(match.router)
app.include_router(gap.router)