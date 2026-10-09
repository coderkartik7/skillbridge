from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.resume_parser import extract_resume_text
from app.services.skill_extraction import extract_skills

router = APIRouter()

MAX_SIZE = 5 * 1024 * 1024  # 5 MB


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    data = await file.read()

    if len(data) > MAX_SIZE:
        raise HTTPException(status_code=413, detail="File too large (max 5 MB).")

    try:
        text = extract_resume_text(file.filename, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not text.strip():
        raise HTTPException(
            status_code=422,
            detail="No readable text found. The file may be a scanned image.",
        )

    skills = sorted(extract_skills(text))
    return {"text": text, "skills": skills}