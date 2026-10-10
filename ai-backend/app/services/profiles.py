import os, re, time
from collections import Counter
from datetime import datetime, timedelta, timezone
from urllib.parse import quote

import requests
from app.services.skill_extraction import extract_skills

TIMEOUT = 8
TTL = 6 * 3600
ACTIVE_DAYS = 180
LEETCODE_ENABLED = os.getenv("LEETCODE_ENABLED") == "1"      # unofficial API: opt-in only
HEADERS = {"User-Agent": "SkillBridge/1.0"}

GH_RE = re.compile(r"^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$")
CF_RE = re.compile(r"^[A-Za-z0-9_.-]{3,24}$")
LC_RE = re.compile(r"^[A-Za-z0-9_-]{1,40}$")
GH_RESERVED = {"orgs", "features", "about", "topics", "settings", "sponsors", "marketplace",
               "login", "pricing", "enterprise", "collections", "explore", "apps"}
LC_RESERVED = {"problems", "contest", "discuss", "explore", "study-plan", "u", "problemset", "tag"}

_cache = {}
_last_cf_call = 0.0


# ---------- finding handles in a resume ----------
def _most_common(matches, valid, reserved=()):
    good = [m.rstrip(".") for m in matches]
    good = [m for m in good if valid.match(m) and m.lower() not in reserved]
    return Counter(good).most_common(1)[0][0] if good else None


def find_handles(text):
    return {
        "github": _most_common(re.findall(r"github\.com/([A-Za-z0-9-]+)", text, re.I), GH_RE, GH_RESERVED),
        "codeforces": _most_common(re.findall(r"codeforces\.com/profile/([A-Za-z0-9_.-]+)", text, re.I), CF_RE),
        "leetcode": _most_common(re.findall(r"leetcode\.com/(?:u/)?([A-Za-z0-9_-]+)", text, re.I), LC_RE, LC_RESERVED),
    }


# ---------- GitHub (official REST API) ----------
def _github(handle):
    headers = {**HEADERS, "Accept": "application/vnd.github+json"}
    if os.getenv("GITHUB_TOKEN"):
        headers["Authorization"] = f"Bearer {os.getenv('GITHUB_TOKEN')}"
    base = f"https://api.github.com/users/{quote(handle)}"
    try:
        u = requests.get(base, headers=headers, timeout=TIMEOUT)
        if u.status_code == 404:
            return {"status": "not_found"}
        if u.status_code in (403, 429):
            return {"status": "unavailable", "reason": "GitHub rate limit reached. Set GITHUB_TOKEN or try later."}
        u.raise_for_status()
        r = requests.get(f"{base}/repos", headers=headers, timeout=TIMEOUT,
                         params={"per_page": 100, "sort": "pushed", "type": "owner"})
        r.raise_for_status()
        repos = [x for x in r.json() if not x.get("fork")]
    except (requests.RequestException, ValueError):
        return {"status": "unavailable", "reason": "GitHub could not be reached."}

    cutoff = datetime.now(timezone.utc) - timedelta(days=ACTIVE_DAYS)

    def is_recent(repo):
        try:
            return datetime.fromisoformat(repo["pushed_at"].replace("Z", "+00:00")) >= cutoff
        except (TypeError, ValueError, KeyError, AttributeError):
            return False

    languages = Counter(x["language"] for x in repos if x.get("language"))
    skills = Counter()
    for x in repos[:30]:
        blob = " ".join([x.get("name") or "", x.get("description") or "", " ".join(x.get("topics") or [])])
        skills.update(extract_skills(blob.replace("-", " ").replace("_", " ")))
    top = sorted(repos, key=lambda x: x.get("stargazers_count", 0), reverse=True)[:3]

    return {"status": "ok", "handle": handle, "url": f"https://github.com/{handle}",
            "repos": len(repos), "active_repos": sum(is_recent(x) for x in repos),
            "top_languages": [l for l, _ in languages.most_common(3)],
            "stars": sum(x.get("stargazers_count", 0) for x in repos),
            "skills": [s for s, _ in skills.most_common(6)],
            "top_repos": [{"name": x["name"], "stars": x.get("stargazers_count", 0),
                           "language": x.get("language"), "description": (x.get("description") or "")[:100]}
                          for x in top]}


# ---------- Codeforces (official public API, max 1 request per 2 seconds) ----------
def _cf_get(method, params):
    global _last_cf_call
    wait = 2.0 - (time.time() - _last_cf_call)
    if wait > 0:
        time.sleep(wait)
    _last_cf_call = time.time()
    return requests.get(f"https://codeforces.com/api/{method}", params=params,
                        headers=HEADERS, timeout=TIMEOUT).json()


def _codeforces(handle):
    try:
        info = _cf_get("user.info", {"handles": handle})
        if info.get("status") != "OK":
            if "not found" in str(info.get("comment", "")).lower():
                return {"status": "not_found"}
            return {"status": "unavailable", "reason": "Codeforces is not responding."}
        user = info["result"][0]
        history = _cf_get("user.rating", {"handle": handle})
        contests = len(history["result"]) if history.get("status") == "OK" else None
    except (requests.RequestException, ValueError, KeyError, IndexError):
        return {"status": "unavailable", "reason": "Codeforces could not be reached."}

    name = user.get("handle", handle)
    return {"status": "ok", "handle": name, "url": f"https://codeforces.com/profile/{name}",
            "rating": user.get("rating"), "max_rating": user.get("maxRating"),
            "rank": user.get("rank"), "max_rank": user.get("maxRank"), "contests": contests}


# ---------- LeetCode (UNOFFICIAL, can break; off unless LEETCODE_ENABLED=1) ----------
LC_QUERY = """query($u: String!) {
  matchedUser(username: $u) { submitStatsGlobal { acSubmissionNum { difficulty count } } }
  userContestRanking(username: $u) { rating attendedContestsCount }
}"""


def _leetcode(handle):
    try:
        r = requests.post("https://leetcode.com/graphql", timeout=TIMEOUT,
                          headers={**HEADERS, "Content-Type": "application/json", "Referer": "https://leetcode.com"},
                          json={"query": LC_QUERY, "variables": {"u": handle}})
        r.raise_for_status()
        data = r.json()
        if data.get("errors") and not data.get("data"):
            return {"status": "unavailable", "reason": "LeetCode data is not available."}
        user = (data.get("data") or {}).get("matchedUser")
        if not user:
            return {"status": "not_found"}
        counts = {x["difficulty"]: x["count"] for x in user["submitStatsGlobal"]["acSubmissionNum"]}
        contest = (data["data"].get("userContestRanking") or {})
    except (requests.RequestException, ValueError, KeyError, TypeError):
        return {"status": "unavailable", "reason": "LeetCode could not be reached."}

    return {"status": "ok", "handle": handle, "url": f"https://leetcode.com/u/{handle}",
            "solved": counts.get("All"), "easy": counts.get("Easy"), "medium": counts.get("Medium"),
            "hard": counts.get("Hard"), "contest_rating": contest.get("rating"),
            "contests": contest.get("attendedContestsCount")}


# ---------- combine ----------
def _cached(key, fn):
    hit = _cache.get(key)
    if hit and time.time() - hit[0] < TTL:
        return hit[1]
    result = fn()
    if result["status"] in ("ok", "not_found"):               # never cache failures
        _cache[key] = (time.time(), result)
    return result


def _summary(d):
    parts = []
    g, cf, lc = d["github"], d["codeforces"], d["leetcode"]
    if g["status"] == "ok":
        s = f"GitHub: {g['active_repos']} active of {g['repos']} repos"
        if g["top_languages"]:
            s += ", mostly " + ", ".join(g["top_languages"])
        if g["skills"]:
            s += "; repo topics: " + ", ".join(g["skills"][:4])
        parts.append(s)
    if cf["status"] == "ok":
        if cf.get("rating"):
            s = f"Codeforces: {cf['rank']} ({cf['rating']})"
        else:
            s = "Codeforces: unrated"
        if cf.get("contests"):
            s += f", {cf['contests']} contests"
        parts.append(s)
    if lc["status"] == "ok":
        s = f"LeetCode: {lc['solved']} solved ({lc['easy']}E/{lc['medium']}M/{lc['hard']}H)"
        if lc.get("contests"):
            s += f", {lc['contests']} contests"
        parts.append(s)
    return ". ".join(parts) + "." if parts else "No public developer profiles found."


def enrich(handles):
    """handles: {"github": str|None, "codeforces": str|None, "leetcode": str|None} -> per-source data + summary."""
    out = {}
    for source, fn, valid in (("github", _github, GH_RE), ("codeforces", _codeforces, CF_RE),
                              ("leetcode", _leetcode, LC_RE)):
        handle = (handles.get(source) or "").strip()
        if not handle:
            out[source] = {"status": "not_provided"}
        elif not valid.match(handle):
            out[source] = {"status": "invalid"}
        elif source == "leetcode" and not LEETCODE_ENABLED:
            out[source] = {"status": "disabled"}
        else:
            out[source] = _cached((source, handle.lower()), lambda f=fn, h=handle: f(h))
    out["summary"] = _summary(out)
    return out