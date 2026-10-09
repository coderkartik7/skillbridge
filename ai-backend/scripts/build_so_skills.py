import os, time, requests
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROC = os.path.join(BASE_DIR, "../data/processed")
API = "https://api.stackexchange.com/2.3"

MIN_COUNT = 300       
TAG_PAGES = 25         
SYN_PAGES = 20

# Generic SO tags that cause false positives in resumes (extend as you notice more)
STOPLIST = {"string", "list", "function", "class", "loops", "arrays", "array", "performance",
            "windows", "image", "date", "file", "variables", "sorting", "search", "time",
            "validation", "forms", "button", "table", "email", "text", "object", "design",
            "if statement", "for loop", "while loop", "dictionary", "view", "model"}

# New-market skills Stack Overflow may lag on
MANUAL_SKILLS = ["rag", "langchain", "llamaindex", "llm", "vector database", "prompt engineering",
                 "mlops", "llmops", "agentic ai", "generative ai", "websockets", "oop",
                 "rest api", "data structures", "algorithms", "system design", "github",
                 "html5", "css3", "ai agents", "fine tuning", "embeddings", "devops"]

MANUAL_ALIASES = {
    "rag pipeline": "rag", "rag pipelines": "rag", "socket.io": "websockets",
    "google generative ai": "generative ai", "rest apis": "rest api", "restful api": "rest api",
    "restful apis": "rest api", "object oriented programming": "oop", "dsa": "data structures",
    "data structure": "data structures", "js": "javascript", "ts": "typescript",
    "k8s": "kubernetes", "aws": "amazon web services", "ec2": "amazon ec2", "s3": "amazon s3",
    "llamaindex": "llamaindex", "llama index": "llamaindex", "large language models": "llm",
    "large language model": "llm", "llms": "llm",
}


def clean(tag):
    return tag.replace("-", " ").lower().strip()


def fetch(endpoint, params, pages):
    items = []
    for page in range(1, pages + 1):
        r = requests.get(f"{API}/{endpoint}", timeout=20,
                         params={**params, "site": "stackoverflow", "pagesize": 100, "page": page})
        r.raise_for_status()
        data = r.json()
        items += data["items"]
        if not data.get("has_more"):
            break
        time.sleep(max(data.get("backoff", 0), 0.3))
    return items


# 1) Skills from tags
tags = fetch("tags", {"order": "desc", "sort": "popular"}, TAG_PAGES)
names = {clean(t["name"]) for t in tags if t["count"] >= MIN_COUNT}
names = {n for n in names if n not in STOPLIST and (len(n) > 2 or n in {"c#", "c++"})}
names |= set(MANUAL_SKILLS) | set(MANUAL_ALIASES.values())

# 2) Aliases from SO synonyms + manual
syns = fetch("tags/synonyms", {"order": "desc", "sort": "applied"}, SYN_PAGES)
aliases = {clean(s["from_tag"]): clean(s["to_tag"]) for s in syns}
aliases = {a: c for a, c in aliases.items() if c in names and a not in STOPLIST and len(a) > 1}
aliases.update(MANUAL_ALIASES)
pd.DataFrame(list(aliases.items()), columns=["alias", "canonical"]).to_csv(
    os.path.join(PROC, "aliases.csv"), index=False)

# 3) Append only NEW skills (existing skill_ids must never change)
skills = pd.read_csv(os.path.join(PROC, "skills.csv"))
new = sorted(names - set(skills["skill_name"].str.lower()))
start = int(skills["skill_id"].max()) + 1
new_df = pd.DataFrame({"skill_id": range(start, start + len(new)),
                       "skill_name": new, "skill_type": "tech_specific"})
pd.concat([skills, new_df], ignore_index=True).to_csv(os.path.join(PROC, "skills.csv"), index=False)
print(f"Added {len(new)} skills, {len(aliases)} aliases")