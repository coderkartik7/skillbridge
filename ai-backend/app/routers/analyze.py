from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.resume_parser import extract_resume_text
from app.services.skill_extraction import extract_skills
from app.services.role_detection import detect_current_role, get_options
from app.services.gap_analysis import occ_sk

router = APIRouter()
MAX_SIZE = 5 * 1024 * 1024

# skills that appear as trending in any role (heuristic, replaced by real market data on Day 2)
TRENDING = set(occ_sk[occ_sk["is_trending"] == True]["skill_name"])


def risk_score(user_skills):
    if not user_skills:
        return 100, "High"
    trending_share = len(user_skills & TRENDING) / len(user_skills)
    score = round(100 * (1 - trending_share))
    label = "Low" if score < 40 else "Medium" if score < 70 else "High"
    return score, label


@router.post("/analyze")
async def analyze(file: UploadFile | None = File(None), text: str | None = Form(None)):
    if file is not None:
        data = await file.read()
        if len(data) > MAX_SIZE:
            raise HTTPException(413, "File too large (max 5 MB).")
        try:
            text = extract_resume_text(file.filename, data)
        except ValueError as e:
            raise HTTPException(400, str(e))

    if not text or not text.strip():
        raise HTTPException(422, "No readable text found. Upload a PDF/DOCX or paste text.")

    skills = extract_skills(text)
    role = detect_current_role(text)
    options = get_options(role["code"], skills)
    for o in options:
        o["score"] = round(o["score"] * 100)       # 0-1 -> percent for the frontend

    score, label = risk_score(skills)
    return {
        "skills": sorted(skills),
        "current_role": role,
        "risk_score": score,
        "risk_label": label,
        "options": options,
    }