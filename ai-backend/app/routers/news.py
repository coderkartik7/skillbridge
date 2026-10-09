from fastapi import APIRouter, Query
from app.services.news import get_news, CATEGORIES

router = APIRouter(tags=["news"])


@router.get("/news")
def news(category: str | None = Query(None), limit: int = Query(30, ge=1, le=100)):
    if category and category not in CATEGORIES:
        category = None                      # unknown filter: show everything
    items = get_news(category, limit)
    return {"categories": CATEGORIES, "count": len(items), "items": items}