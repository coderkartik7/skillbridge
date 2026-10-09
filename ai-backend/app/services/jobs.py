import os, csv, json, re, time, requests
from app.services.skill_extraction import extract_skills

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(BASE_DIR, "../../data")
CACHE_PATH = os.path.join(DATA, "market/jobs_cache.json")
TIERS_PATH = os.path.join(DATA, "processed/company_tiers.csv")

COUNTRY = os.getenv("ADZUNA_COUNTRY", "in")        # "in" = India
CACHE_TTL = 6 * 3600                               # 6 hours


def _norm(name):
    name = re.sub(r"[^a-z0-9 ]", " ", (name or "").lower())
    name = re.sub(r"\b(pvt|private|ltd|limited|inc|llc|corp|corporation|technologies|india)\b", " ", name)
    return re.sub(r"\s+", " ", name).strip()


def _load_tiers():
    tiers = {}
    if os.path.exists(TIERS_PATH):
        with open(TIERS_PATH, encoding="utf-8") as f:
            for row in csv.DictReader(f):
                tiers[_norm(row["company"])] = [t.strip() for t in row["tiers"].split(";") if t.strip()]
    return tiers


TIERS = _load_tiers()


def _cache_read():
    if os.path.exists(CACHE_PATH):
        with open(CACHE_PATH, encoding="utf-8") as f:
            return json.load(f)
    return {}


def _fetch(role_title, location, remote):
    r = requests.get(f"https://api.adzuna.com/v1/api/jobs/{COUNTRY}/search/1", timeout=20, params={
        "app_id": os.environ["ADZUNA_APP_ID"], "app_key": os.environ["ADZUNA_APP_KEY"],
        "results_per_page": 30, "what": role_title + (" remote" if remote else ""),
        "where": location or "", "content-type": "application/json"})
    r.raise_for_status()
    return r.json().get("results", [])


def _raw_jobs(role_title, location, remote):
    key = f"{role_title}|{location}|{remote}".lower()
    cache = _cache_read()
    entry = cache.get(key)
    if entry and time.time() - entry["ts"] < CACHE_TTL:
        return entry["jobs"]
    try:
        jobs = _fetch(role_title, location, remote)
    except Exception:
        if entry:                                   # API down: serve stale cache
            return entry["jobs"]
        raise
    cache[key] = {"ts": time.time(), "jobs": jobs}
    os.makedirs(os.path.dirname(CACHE_PATH), exist_ok=True)
    with open(CACHE_PATH, "w", encoding="utf-8") as f:
        json.dump(cache, f)
    return jobs


def find_jobs(role_title, user_skills, location="", remote=False, tier=None):
    user_skills = set(user_skills)
    out = []
    for j in _raw_jobs(role_title, location, remote):
        company = (j.get("company") or {}).get("display_name", "Unknown")
        job_skills = extract_skills(f"{j.get('title', '')} {j.get('description', '')}")
        missing = sorted(job_skills - user_skills)
        match = round(100 * len(job_skills & user_skills) / len(job_skills)) if job_skills else None
        tiers = TIERS.get(_norm(company), ["Other"])
        if tier and tier not in tiers:
            continue
        out.append({"title": j.get("title"), "company": company,
                    "location": (j.get("location") or {}).get("display_name", ""),
                    "url": j.get("redirect_url"), "tiers": tiers,
                    "skill_match_pct": match, "missing_skills": missing[:5],
                    "needs_more": len(missing) if job_skills else None})
    out.sort(key=lambda x: (x["needs_more"] is None, x["needs_more"] or 0, -(x["skill_match_pct"] or 0)))
    return out