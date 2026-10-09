from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.live_data import fetch_live_demand

router = APIRouter()


class LiveDemandResponse(BaseModel):
    occupation_code: str
    soc_code: Optional[str] = None
    demand_score: float
    employment_count: Optional[float] = None
    annual_mean_wage: Optional[float] = None
    period: Optional[str] = None
    source: str
    updated_at: str


@router.get("/live-demand/{occupation_code}", response_model=LiveDemandResponse)
def get_live_demand(occupation_code: str):
    """
    Fetch live labor-market demand data for a given O*NET-SOC occupation code.
    """
    data = fetch_live_demand(occupation_code)
    if not data:
        raise HTTPException(
            status_code=404,
            detail=f"Unable to fetch live demand data for occupation code: {occupation_code}",
        )
    return data
