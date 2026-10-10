import re
from sentence_transformers import util
from app.services.embeddings import model
from app.services.skill_extraction import extract_skills

MAX_REQS = 25        # most JD requirements we score
MAX_CHUNKS = 40      # most resume chunks we embed
CHUNK_MAX = 350      # characters per resume chunk
SUPPORTED = 0.35     # similarity above which a requirement counts as "met" (tune after testing)
MAX_PER_CHUNK = 2    # one resume line can back at most 2 requirements

BULLET = re.compile(r"^\s*(?:[-*•●▪◦]|\d+[.)])\s+")
EMAIL = re.compile(r"\S+@\S+\.\S+")
URL = re.compile(r"https?://\S+|www\.\S+|(?:github|linkedin|leetcode)\.com/\S+")
PHONE = re.compile(r"(?<!\d)(?:\+?\d{1,3}[\s-]?)?(?:\d{10}|\d{5}[\s-]\d{5})(?!\d)")


def scrub(text):
    """Remove contact details so they never influence the ranking."""
    for pattern in (EMAIL, URL, PHONE):
        text = pattern.sub(" ", text)
    return text


def split_requirements(jd_text):
    reqs = []
    for line in jd_text.splitlines():
        line = BULLET.sub("", line).strip()
        if len(line) < 20:                                   # headings and blanks
            continue
        parts = re.split(r"(?<=[.!?])\s+", line) if len(line) > 300 else [line]
        reqs += [p.strip() for p in parts if len(p.strip()) >= 20]
    return list(dict.fromkeys(reqs))[:MAX_REQS]              # dedupe, keep order


def chunk_resume(text):
    pieces = [s.strip() for line in text.splitlines()
              for s in re.split(r"(?<=[.!?])\s+", BULLET.sub("", line).strip())]
    chunks, current = [], ""
    for piece in pieces:
        if not piece:
            continue
        if current and (len(current) >= 40 or len(current) + len(piece) + 1 > CHUNK_MAX):
            chunks.append(current)
            current = piece
        else:
            current = f"{current} {piece}".strip()
    if current:
        chunks.append(current)
    return [c for c in chunks if len(c) >= 15][:MAX_CHUNKS]


def _band(met, total):
    share = met / total
    return "Strong" if share >= 0.7 else "Good" if share >= 0.4 else "Weak"


def _score_candidate(name, text, reqs, req_emb, jd_skills):
    text = scrub(text)
    cand_skills = extract_skills(text)
    base = {"name": name, "skills_count": len(cand_skills),
            "matched_skills": sorted(cand_skills & jd_skills),
            "missing_skills": sorted(jd_skills - cand_skills)}

    chunks = chunk_resume(text)
    if not chunks:
        return {**base, "score": 0.0, "band": "Weak", "requirements_met": 0,
                "requirements_total": len(reqs), "evidence": [], "unmet": reqs[:3]}

    chunk_emb = model.encode(chunks, convert_to_tensor=True)
    sims = util.cos_sim(req_emb, chunk_emb).clamp(min=0).tolist()
    pairs = sorted(((s, r, c) for r, row in enumerate(sims) for c, s in enumerate(row)), reverse=True)
    assigned, used = {}, {}
    for s, r, c in pairs:                                   # strongest matches first
        if r in assigned or used.get(c, 0) >= MAX_PER_CHUNK:
            continue
        assigned[r] = (c, s)
        used[c] = used.get(c, 0) + 1
    best = [assigned[r][1] if r in assigned else 0.0 for r in range(len(reqs))]
    idx = [assigned[r][0] if r in assigned else 0 for r in range(len(reqs))]

    per_req = [{"requirement": r, "evidence": chunks[i][:160], "similarity": round(s, 3)}
               for r, i, s in zip(reqs, idx, best)]
    met = [p for p in per_req if p["similarity"] >= SUPPORTED]
    unmet = sorted((p for p in per_req if p["similarity"] < SUPPORTED), key=lambda p: p["similarity"])

    return {**base, "score": round(sum(best) / len(reqs), 4), "band": _band(len(met), len(reqs)),
            "requirements_met": len(met), "requirements_total": len(reqs),
            "evidence": sorted(met, key=lambda p: -p["similarity"])[:3],
            "unmet": [p["requirement"] for p in unmet[:3]]}


def screen(jd_text, candidates):
    """candidates: [{"name": str, "text": str}] -> ranked list with explanations."""
    reqs = split_requirements(jd_text)
    if not reqs:
        raise ValueError("Could not find any requirements in the job description.")
    req_emb = model.encode(reqs, convert_to_tensor=True)
    jd_skills = extract_skills(jd_text)

    results = [_score_candidate(c["name"], c["text"], reqs, req_emb, jd_skills) for c in candidates]
    results.sort(key=lambda r: r["score"], reverse=True)
    for rank, r in enumerate(results, start=1):
        r["rank"] = rank
        r["top_percent"] = round(100 * rank / len(results))     # "top X%" for the filter
    return {"jd_requirements": reqs, "jd_skills": sorted(jd_skills), "candidates": results}