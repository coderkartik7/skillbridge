import json
from typing import Literal
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.db.database import get_conn
from app.routers.auth import get_current_user
from app.services.quiz import create_quiz, grade_quiz

router = APIRouter(prefix="/quiz", tags=["quiz"])


class StartRequest(BaseModel):
    roadmap_id: int
    skill: str
    level: Literal["easy", "medium", "hard"] = "easy"


class SubmitRequest(BaseModel):
    answers: dict[str, int]          # {"0": 2, "1": 0}  question id -> chosen option index


@router.post("")
def start_quiz(req: StartRequest, user_id: int = Depends(get_current_user)):
    with get_conn() as conn:
        row = conn.execute("SELECT roadmap_json FROM roadmaps WHERE id = ? AND user_id = ?",
                           (req.roadmap_id, user_id)).fetchone()
    if not row:
        raise HTTPException(404, "Roadmap not found.")

    step = next((s for s in json.loads(row["roadmap_json"])["steps"] if s["skill"] == req.skill), None)
    if not step:
        raise HTTPException(422, "This skill is not part of the roadmap.")

    try:
        return create_quiz(req.skill, [t["name"] for t in step["topics"]], req.level)
    except KeyError:
        raise HTTPException(503, "Quiz generation is not configured on the server.")
    except Exception:
        import logging, traceback
        logging.exception("create_quiz failed")          # or logger.exception(...)
        raise HTTPException(502, "Could not generate the quiz. Please try again.")


@router.post("/{quiz_id}/submit")
def submit_quiz(quiz_id: str, req: SubmitRequest, user_id: int = Depends(get_current_user)):
    try:
        return grade_quiz(quiz_id, req.answers)
    except KeyError:
        raise HTTPException(404, "Quiz expired or not found. Please start a new one.")