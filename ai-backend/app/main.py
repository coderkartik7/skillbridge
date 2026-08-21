from fastapi import FastAPI
from app.routers import extract, match, gap

app = FastAPI()

@app.get("/")
def root():
    return {"status": "SkillBridge AI backend running"}

app.include_router(extract.router)
app.include_router(match.router)
app.include_router(gap.router)