from fastapi import APIRouter
from pydantic import BaseModel
from app.services.matching import match_occupation

router = APIRouter()

class TextInput(BaseModel):
    text: str

@router.post("/match")
def match_endpoint(input: TextInput):
    results = match_occupation(input.text)
    return {"matches": results}