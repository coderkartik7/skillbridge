import os, re, json, html, requests

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(BASE_DIR, "../../data/market")
API = "https://hn.algolia.com/api/v1"


def _clean(raw):
    text = re.sub(r"<[^>]+>", " ", raw or "")       # strip HTML tags
    return re.sub(r"\s+", " ", html.unescape(text)).strip()


def fetch_months(n=3):
    """Download the last n monthly threads; skips months already saved."""
    os.makedirs(OUT_DIR, exist_ok=True)
    r = requests.get(f"{API}/search_by_date", timeout=20, params={
        "tags": "story,author_whoishiring", "query": "Who is hiring", "hitsPerPage": 12})
    r.raise_for_status()
    stories = [h for h in r.json()["hits"] if h["title"].startswith("Ask HN: Who is hiring")][:n]

    saved = []
    for s in stories:
        month = s["created_at"][:7]                    # e.g. "2026-10"
        path = os.path.join(OUT_DIR, f"postings_{month}.json")
        if os.path.exists(path):
            continue
        item = requests.get(f"{API}/items/{s['objectID']}", timeout=60)
        item.raise_for_status()
        posts = [_clean(c.get("text")) for c in item.json().get("children", [])]
        posts = [p for p in posts if len(p) > 80]      # drop empty/deleted comments
        with open(path, "w", encoding="utf-8") as f:
            json.dump(posts, f)
        saved.append((month, len(posts)))
    return saved


if __name__ == "__main__":
    print(fetch_months())