from fastapi import APIRouter
from pydantic import BaseModel
from app.services.skill_extraction import extract_skills

router = APIRouter()

class TextInput(BaseModel):
    text: str

@router.post("/extract-skills")
def extract_endpoint(input: TextInput):
    skills = extract_skills(input.text)
    return {"skills": list(skills)}