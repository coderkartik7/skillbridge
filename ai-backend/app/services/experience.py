import re
from datetime import date

MONTHS = {m: i for i, m in enumerate(
    ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"], start=1)}
MONTH_RE = (r"(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?"
            r"|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)")
YEAR_RE = r"(?:19|20)\d{2}"
DATE_RE = rf"(?:{MONTH_RE}\.?,?\s+{YEAR_RE}|(?:0?[1-9]|1[0-2])[/-]{YEAR_RE}|{YEAR_RE})"
NOW_RE = r"(?:present|current|currently|now|ongoing|till date|to date)"
RANGE = re.compile(rf"\b({DATE_RE})\s*(?:-|–|—|to|until|till)\s*({DATE_RE}|{NOW_RE})\b", re.I)
STATED = re.compile(r"(\d{1,2})\+?\s*(?:years?|yrs?)\s+(?:of\s+)?(?:\w+\s+)?experience", re.I)
EDU_WORDS = re.compile(r"\b(b\.?\s?tech|m\.?\s?tech|bsc|msc|bca|mca|mba|bachelor|master|diploma"
                       r"|university|college|school|degree)\b", re.I)

KEEP = {"experience", "work experience", "professional experience", "employment", "employment history",
        "work history", "internship", "internships", "career history"}
SKIP = {"education", "academic background", "academics", "education & certifications",
        "education and certifications", "certifications", "certificates", "projects", "personal projects",
        "academic projects", "technical projects", "key projects", "awards", "achievements",
        "publications", "courses", "skills", "technical skills", "key skills", "core skills",
        "summary", "professional summary", "objective", "interests", "languages"}


def _month_index(d):
    return d.year * 12 + d.month


def _to_index(token, now_idx):
    token = token.lower().strip()
    if re.fullmatch(NOW_RE, token):
        return now_idx
    year = int(re.search(YEAR_RE, token).group())
    numeric = re.match(r"(0?[1-9]|1[0-2])[/-]", token)
    if numeric:
        month = int(numeric.group(1))
    else:
        name = re.match(MONTH_RE, token)
        month = MONTHS[name.group()[:3]] if name else 1      # year only: assume January
    return year * 12 + month


def estimate_experience(text):
    """Best-effort total years of work experience. Returns {"years": float | None, "source": str | None}."""
    now_idx = _month_index(date.today())
    spans, skipping = [], False

    for line in text.splitlines():
        head = re.sub(r"[^a-z& ]", "", line.lower()).strip()
        if head in KEEP:
            skipping = False
            continue
        if head in SKIP:
            skipping = True
            continue
        if skipping or EDU_WORDS.search(line):
            continue
        for m in RANGE.finditer(line):
            start, end = _to_index(m.group(1), now_idx), min(_to_index(m.group(2), now_idx), now_idx)
            if start < end and start >= 1980 * 12:
                spans.append([start, end])

    spans.sort()
    merged = []
    for start, end in spans:                                  # merge overlaps so parallel jobs aren't double counted
        if merged and start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])

    months = sum(e - s for s, e in merged)
    if months > 0:
        return {"years": min(round(months / 12, 1), 50.0), "source": "dates"}

    stated = STATED.search(text)
    if stated:
        return {"years": float(stated.group(1)), "source": "stated"}
    return {"years": None, "source": None}