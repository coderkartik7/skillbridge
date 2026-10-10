import os, re
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from app.routers.auth import get_current_user
from app.services.experience import estimate_experience
from app.services.resume_parser import extract_resume_text
from app.services.screening import screen
from pydantic import BaseModel
from app.services.profiles import enrich, find_handles

router = APIRouter(prefix="/recruiter", tags=["recruiter"])

MAX_CANDIDATES = 50
MAX_FILE = 5 * 1024 * 1024
MAX_JD = 10_000
MAX_RESUME_CHARS = 20_000
SPLIT = re.compile(r"\n\s*-{3,}\s*\n")          # a line of --- separates pasted resumes


def _unique(name, taken):
    base, n = name, 2
    while name in taken:
        name = f"{base} ({n})"
        n += 1
    taken.add(name)
    return name


@router.post("/screen")
def screen_candidates(
    jd: str = Form(...),
    pasted: str | None = Form(None),
    files: list[UploadFile] = File(default=[]),
    user_id: int = Depends(get_current_user),
):
    jd = jd.strip()
    if len(jd) < 40:
        raise HTTPException(422, "Paste a fuller job description.")
    if len(jd) > MAX_JD:
        raise HTTPException(422, "Job description is too long (max 10,000 characters).")
    if len(files or []) > MAX_CANDIDATES:
        raise HTTPException(413, f"Too many resumes (max {MAX_CANDIDATES}).")

    candidates, skipped, taken = [], [], set()

    for f in files or []:
        base = os.path.splitext(os.path.basename(f.filename or ""))[0][:80] or "resume"
        name = _unique(base, taken)
        data = f.file.read(MAX_FILE + 1)
        if len(data) > MAX_FILE:
            skipped.append({"name": name, "reason": "File is larger than 5 MB."})
            continue
        try:
            text = extract_resume_text(f.filename or "", data)
        except ValueError as e:
            skipped.append({"name": name, "reason": str(e)})
            continue
        except Exception:
            skipped.append({"name": name, "reason": "Could not read this file."})
            continue
        if not text.strip():
            skipped.append({"name": name, "reason": "No readable text (it may be a scanned image)."})
            continue
        candidates.append({"name": name, "text": text[:MAX_RESUME_CHARS]})

    for i, part in enumerate(SPLIT.split(pasted or ""), start=1):
        if part.strip():
            candidates.append({"name": _unique(f"Pasted {i}", taken), "text": part.strip()[:MAX_RESUME_CHARS]})

    if not candidates:
        raise HTTPException(422, "No readable resumes were provided.")
    if len(candidates) > MAX_CANDIDATES:
        raise HTTPException(413, f"Too many resumes (max {MAX_CANDIDATES}).")

    try:
        result = screen(jd, candidates)
    except ValueError as e:
        raise HTTPException(422, str(e))

    experience = {c["name"]: estimate_experience(c["text"]) for c in candidates}
    handles = {c["name"]: find_handles(c["text"]) for c in candidates}
    for c in result["candidates"]:
        exp = experience[c["name"]]
        c["years_experience"] = exp["years"]
        c["years_source"] = exp["source"]
        c["handles"] = handles[c["name"]]

    result["skipped"] = skipped
    result["screened"] = len(candidates)
    return result

class EnrichRequest(BaseModel):
    github: str | None = None
    codeforces: str | None = None
    leetcode: str | None = None


def _clean(source, value):
    value = (value or "").strip()
    if "/" in value:                          # a pasted profile URL
        return find_handles(value)[source]
    return value or None


@router.post("/enrich")
def enrich_candidate(req: EnrichRequest, user_id: int = Depends(get_current_user)):
    handles = {s: _clean(s, getattr(req, s)) for s in ("github", "codeforces", "leetcode")}
    return enrich(handles)