from fastapi import APIRouter
from pydantic import BaseModel
from app.services.roadmap import build_roadmap

router = APIRouter()

class RoadmapRequest(BaseModel):
    role_code: str
    skills: list[str]

@router.post("/roadmap")
def roadmap(req: RoadmapRequest):
    return build_roadmap(req.role_code, set(req.skills))