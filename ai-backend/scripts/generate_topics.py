import os, json, time
import pandas as pd
from google import genai

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(BASE_DIR, "../data")
MODEL = "gemini-3.5-flash"      # change if Google has renamed it
BATCH = 8

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

occ_sk = pd.read_csv(os.path.join(DATA, "processed/occupation_skills.csv"))
targets = sorted(occ_sk[occ_sk["skill_type"] == "tech_specific"]["skill_name"].str.lower().unique())

out_path = os.path.join(DATA, "roadmap_topics.json")
cfg = json.load(open(out_path)) if os.path.exists(out_path) else {"prereqs": {}, "topics": {}}
todo = [s for s in targets if s not in cfg["topics"]]       # skip curated / already done
print(f"{len(todo)} skills to generate")

PROMPT = """For each skill below, return JSON mapping skill -> {{"topics": [...], "prereqs": [...]}}.
topics: 6-10 sub-topic names in the order a learner should study them, short names only.
prereqs: skills from THIS list that should be learned first (may be empty): {known}
Return only JSON. No URLs. Skills: {batch}"""

for i in range(0, len(todo), BATCH):
    batch = todo[i:i + BATCH]
    try:
        r = client.models.generate_content(
            model=MODEL,
            contents=PROMPT.format(known=targets, batch=batch),
            config={"response_mime_type": "application/json"})
        result = json.loads(r.text)
    except Exception as e:
        print("failed batch", batch, e)
        continue
    for skill in batch:
        item = result.get(skill)
        if not item:
            continue
        cfg["topics"][skill] = [{"name": t, "free": None, "paid": None, "fallback": True}
                                for t in item["topics"]]
        pre = [p for p in item.get("prereqs", []) if p in targets and p != skill]
        if pre:
            cfg["prereqs"][skill] = pre
    json.dump(cfg, open(out_path, "w"), indent=2)           # save after every batch
    print("done", batch)
    time.sleep(4)