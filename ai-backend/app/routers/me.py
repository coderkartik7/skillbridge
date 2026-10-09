import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.db.database import get_conn
from app.routers.auth import get_current_user
from app.services.roadmap import build_roadmap

router = APIRouter(prefix="/me", tags=["me"])


class SaveRequest(BaseModel):
    role_code: str
    skills: list[str]


class TopicUpdate(BaseModel):
    skill: str
    topic: str
    done: bool | None = None
    note: str | None = None


def _owned(conn, roadmap_id, user_id):
    row = conn.execute("SELECT * FROM roadmaps WHERE id = ? AND user_id = ?",
                       (roadmap_id, user_id)).fetchone()
    if not row:
        raise HTTPException(404, "Roadmap not found.")
    return row


def _all_topics(roadmap):
    return {(s["skill"], t["name"]) for s in roadmap["steps"] for t in s["topics"]}


def _progress(conn, roadmap_id, roadmap):
    rows = conn.execute("SELECT skill, topic, done, note FROM progress WHERE roadmap_id = ?",
                        (roadmap_id,)).fetchall()
    valid = _all_topics(roadmap)
    items = [{"skill": r["skill"], "topic": r["topic"], "done": bool(r["done"]), "note": r["note"]}
             for r in rows if (r["skill"], r["topic"]) in valid]
    done = sum(1 for i in items if i["done"])
    percent = round(100 * done / len(valid)) if valid else 0
    return items, percent


@router.post("/roadmaps")
def save_roadmap(req: SaveRequest, user_id: int = Depends(get_current_user)):
    roadmap = build_roadmap(req.role_code, set(req.skills))   # built server-side, not trusted from client
    if not roadmap["steps"]:
        raise HTTPException(422, "Nothing to save: this role has no skill gaps.")
    with get_conn() as conn:
        cur = conn.execute(
            "INSERT INTO roadmaps (user_id, role_code, role_title, skills_json, roadmap_json) VALUES (?,?,?,?,?)",
            (user_id, req.role_code, roadmap["role"]["title"], json.dumps(req.skills), json.dumps(roadmap)))
    return {"id": cur.lastrowid}


@router.get("/roadmaps")
def list_roadmaps(user_id: int = Depends(get_current_user)):
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM roadmaps WHERE user_id = ? ORDER BY id DESC", (user_id,)).fetchall()
        result = []
        for r in rows:
            _, percent = _progress(conn, r["id"], json.loads(r["roadmap_json"]))
            result.append({"id": r["id"], "role_code": r["role_code"], "role_title": r["role_title"],
                           "created_at": r["created_at"], "percent": percent})
    return {"roadmaps": result}


@router.get("/roadmaps/{roadmap_id}")
def get_roadmap(roadmap_id: int, user_id: int = Depends(get_current_user)):
    with get_conn() as conn:
        row = _owned(conn, roadmap_id, user_id)
        roadmap = json.loads(row["roadmap_json"])
        items, percent = _progress(conn, roadmap_id, roadmap)
    return {"id": roadmap_id, "roadmap": roadmap, "progress": items, "percent": percent, "skills": json.loads(row["skills_json"])}


@router.put("/roadmaps/{roadmap_id}/topic")
def update_topic(roadmap_id: int, u: TopicUpdate, user_id: int = Depends(get_current_user)):
    with get_conn() as conn:
        row = _owned(conn, roadmap_id, user_id)
        roadmap = json.loads(row["roadmap_json"])
        if (u.skill, u.topic) not in _all_topics(roadmap):
            raise HTTPException(422, "Topic is not part of this roadmap.")

        cur = conn.execute("SELECT done, note FROM progress WHERE roadmap_id=? AND skill=? AND topic=?",
                           (roadmap_id, u.skill, u.topic)).fetchone()
        done = u.done if u.done is not None else (bool(cur["done"]) if cur else False)
        note = u.note if u.note is not None else (cur["note"] if cur else "")

        conn.execute(
            """INSERT INTO progress (roadmap_id, skill, topic, done, note) VALUES (?,?,?,?,?)
               ON CONFLICT(roadmap_id, skill, topic) DO UPDATE SET done=excluded.done, note=excluded.note""",
            (roadmap_id, u.skill, u.topic, int(done), note[:2000]))
        _, percent = _progress(conn, roadmap_id, roadmap)
    return {"done": done, "note": note, "percent": percent}