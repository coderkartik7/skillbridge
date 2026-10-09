from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.embeddings import oc_df
from app.services.jobs import find_jobs

router = APIRouter(tags=["jobs"])

TITLES = dict(zip(oc_df["occupation_code"], oc_df["title"]))


class JobsRequest(BaseModel):
    role_code: str
    skills: list[str]
    location: str = ""
    remote: bool = False
    tier: str | None = None        # "FAANG", "Top MNC", "Government", "Startup", "Unicorn", "Other"


@router.post("/jobs")
def jobs(req: JobsRequest):
    title = TITLES.get(req.role_code)
    if not title:
        raise HTTPException(404, "Unknown role.")
    try:
        results = find_jobs(title, set(req.skills), req.location.strip(), req.remote, req.tier)
    except KeyError:
        raise HTTPException(503, "Job search is not configured on the server.")
    except Exception:
        raise HTTPException(502, "Could not fetch jobs right now. Please try again.")
    return {"role": {"code": req.role_code, "title": title}, "count": len(results), "jobs": results[:30]}