import json, os
from sentence_transformers import util
from app.services.embeddings import encode_text, occ_embeddings, oc_df
from app.services.gap_analysis import occ_sk, readiness

ROLE_SKILLS = {c: dict(zip(g["skill_name"], g["relevance"])) for c, g in occ_sk.groupby("occupation_code")}
code_to_idx = {c: i for i, c in enumerate(oc_df["occupation_code"])}
ladder_idx = [code_to_idx[c] for c in ROLE_SKILLS if c in code_to_idx]

def _role(idx):
    row = oc_df.iloc[idx]
    return {"code": row["occupation_code"], "title": row["title"]}


def detect_current_role(text):
    emb = encode_text(text)
    scores = util.cos_sim(emb, occ_embeddings[ladder_idx])[0]
    best = int(scores.argmax())
    return _role(ladder_idx[best])

def get_options(current_code, user_skills, k=4):
    cur_size = len(ROLE_SKILLS.get(current_code, {}))
    scored = []
    for code, skills in ROLE_SKILLS.items():
        if code == current_code or len(skills) < 5 or code not in code_to_idx:
            continue
        cov = readiness(code, user_skills) / 100          # step 3: how close the user already is
        if not 0.2 <= cov <= 0.9:                         # skip "no chance" and "already there"
            continue
        if code.startswith("AI-"):
            label = "emerging"                            # step 2: label from data
        elif len(skills) > 1.2 * cur_size:
            label = "step_up"
        else:
            label = "lateral"
        role = _role(code_to_idx[code])
        scored.append({**role, "label": label, "score": cov, "is_trending": code.startswith("AI-")})

    scored.sort(key=lambda r: r["score"], reverse=True)
    picked, seen = [], set()
    for r in scored:                                      # best one per label first
        if r["label"] not in seen:
            picked.append(r); seen.add(r["label"])
    picked += [r for r in scored if r not in picked]      # then fill remaining slots
    return picked[:k]