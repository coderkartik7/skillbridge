import json, os
from urllib.parse import quote_plus
from app.services.gap_analysis import gap_analysis, readiness
from app.services.embeddings import oc_df

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(BASE_DIR, "../../data")

with open(os.path.join(DATA, "roadmap_topics.json")) as f:
    _cfg = json.load(f)
PREREQS, TOPICS = _cfg["prereqs"], _cfg["topics"]
MAX_STEPS = 8


def _depth(skill, seen=()):
    pre = [p for p in PREREQS.get(skill, []) if p not in seen]
    return 0 if not pre else 1 + max(_depth(p, seen + (skill,)) for p in pre)


def _fallback_topics(skill):
    q = quote_plus(skill)
    with open(os.path.join(DATA, "needs_curation.txt"), "a") as f:   # free to-do list
        f.write(skill + "\n")
    return [{
        "name": f"Learn {skill}",
        "free": {"title": f"{skill} tutorials on YouTube", "url": f"https://www.youtube.com/results?search_query={q}+tutorial"},
        "paid": {"title": f"{skill} courses on Coursera", "url": f"https://www.coursera.org/search?query={q}"},
        "fallback": True,
    }]

def _with_links(skill, t):
    if t.get("free") and t.get("paid"):                      # hand-curated, keep as is
        return {**t, "fallback": False}
    q = quote_plus(f"{skill} {t['name']}")
    return {
        "name": t["name"],
        "free": t.get("free") or {"title": f"{t['name']} on YouTube",
                                  "url": f"https://www.youtube.com/results?search_query={q}+tutorial"},
        "paid": t.get("paid") or {"title": f"{t['name']} courses on Coursera",
                                  "url": f"https://www.coursera.org/search?query={q}"},
        "fallback": True,
    }

def build_roadmap(role_code, user_skills):
    gaps = gap_analysis(role_code, user_skills)
    gaps.sort(key=lambda g: (_depth(g["skill_name"]), not g["is_trending"], -g["relevance"]))
    steps = []
    for i, g in enumerate(gaps[:MAX_STEPS], start=1):
        name = g["skill_name"]
        if name in TOPICS:
            topics = [_with_links(name, t) for t in TOPICS[name]]
        else:
            topics = _fallback_topics(name)
        steps.append({"skill": name, "order": i, "is_trending": bool(g["is_trending"]), "topics": topics})

    row = oc_df[oc_df["occupation_code"] == role_code]
    title = row.iloc[0]["title"] if len(row) else role_code
    return {"role": {"code": role_code, "title": title},
            "readiness": readiness(role_code, user_skills),
            "steps": steps}