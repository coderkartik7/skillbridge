import os, re, json, time, html, calendar
import feedparser
from google import genai

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CACHE_PATH = os.path.join(BASE_DIR, "../../data/market/news_cache.json")
MODEL = "gemini-3.5-flash"
TTL = 3 * 3600
BATCH = 20

FEEDS = [
    "https://techcrunch.com/feed/",
    "https://inc42.com/feed/",
    "https://news.google.com/rss/search?q=tech+layoffs&hl=en-IN&gl=IN&ceid=IN:en",
    "https://news.google.com/rss/search?q=tech+startup+unicorn+funding&hl=en-IN&gl=IN&ceid=IN:en",
    "https://news.google.com/rss/search?q=software+engineer+hiring+salary+package&hl=en-IN&gl=IN&ceid=IN:en",
]
CATEGORIES = ["layoff", "funding", "unicorn", "package", "launch", "hiring", "other"]

PROMPT = """Classify each tech news item and write a one-sentence summary.
Use ONLY the given title and snippet. Do not add facts, names or numbers that are not in them.
category must be one of: {cats}
Return only a JSON list: [{{"id": 0, "category": "...", "summary": "..."}}]
Items: {items}"""


def _clean(text):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", text or ""))).strip()


def _load():
    if os.path.exists(CACHE_PATH):
        with open(CACHE_PATH, encoding="utf-8") as f:
            return json.load(f)
    return {"fetched_at": 0, "items": {}}


def _save(cache):
    os.makedirs(os.path.dirname(CACHE_PATH), exist_ok=True)
    newest = sorted(cache["items"].values(), key=lambda i: i["published"], reverse=True)[:150]
    cache["items"] = {i["link"]: i for i in newest}
    with open(CACHE_PATH, "w", encoding="utf-8") as f:
        json.dump(cache, f)


def _collect():
    items = []
    for url in FEEDS:
        try:
            feed = feedparser.parse(url)
        except Exception:
            continue
        for e in feed.entries[:25]:
            ts = calendar.timegm(e.published_parsed) if e.get("published_parsed") else 0
            items.append({"title": _clean(e.get("title")), "link": e.get("link"),
                          "snippet": _clean(e.get("summary"))[:300], "published": ts,
                          "source": (e.get("source") or {}).get("title") or feed.feed.get("title", ""),
                          "category": "other", "summary": "", "tagged": False})
    return [i for i in items if i["link"] and i["title"]]


def _tag(items):
    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    for start in range(0, len(items), BATCH):
        batch = items[start:start + BATCH]
        payload = [{"id": n, "title": i["title"], "snippet": i["snippet"]} for n, i in enumerate(batch)]
        try:
            r = client.models.generate_content(
                model=MODEL, contents=PROMPT.format(cats=CATEGORIES, items=json.dumps(payload)),
                config={"response_mime_type": "application/json"})
            for res in json.loads(r.text):
                item = batch[res["id"]]
                item["category"] = res["category"] if res["category"] in CATEGORIES else "other"
                item["summary"] = _clean(res.get("summary"))
                item["tagged"] = True
        except Exception as e:
            print("tagging failed for a batch:", e)          # items stay untagged, retried next refresh


def refresh():
    cache = _load()
    seen = cache["items"]
    fresh = [i for i in _collect() if i["link"] not in seen or not seen[i["link"]]["tagged"]]
    fresh = sorted({i["link"]: i for i in fresh}.values(), key=lambda i: i["published"], reverse=True)[:60]
    _tag(fresh)
    for i in fresh:
        if not i["summary"]:
            i["summary"] = i["snippet"][:160]                 # fallback when Gemini failed
        seen[i["link"]] = i
    cache["fetched_at"] = time.time()
    _save(cache)
    return cache


def get_news(category=None, limit=30):
    cache = _load()
    if time.time() - cache["fetched_at"] > TTL:
        try:
            cache = refresh()
        except Exception as e:
            print("news refresh failed, serving cache:", e)
    items = sorted(cache["items"].values(), key=lambda i: i["published"], reverse=True)
    if category:
        items = [i for i in items if i["category"] == category]
    return [{k: i[k] for k in ("title", "link", "source", "published", "category", "summary")}
            for i in items[:limit]]