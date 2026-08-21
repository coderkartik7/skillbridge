from fastapi import APIRouter
from app.services.gap_analysis import gap_analysis
from app.services.skill_extraction import extract_skills

router = APIRouter()

@router.get("/gap/{occupation_id}")
def gap_endpoint(occupation_id: str, text: str):
    user_skills = extract_skills(text)
    result = gap_analysis(occupation_id, user_skills)
    return {"missing_skills": result}