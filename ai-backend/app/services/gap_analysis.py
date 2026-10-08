import os
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TECH_TYPES = {"tech_specific", "software"}

occ_sk = pd.read_csv(os.path.join(BASE_DIR, "../../data/processed/occupation_skills.csv"))
occ_sk = occ_sk[occ_sk["skill_type"].isin(TECH_TYPES)]
occ_sk = occ_sk.sort_values("relevance", ascending=False)
occ_sk = occ_sk.drop_duplicates(subset=["occupation_code", "skill_name"])


def _required(occupation_code):
    return occ_sk[occ_sk["occupation_code"] == occupation_code]


def gap_analysis(occupation_code, user_skills):
    required = _required(occupation_code)
    missing = required[~required["skill_name"].isin(user_skills)]
    missing = missing.sort_values(by=["is_trending", "relevance"], ascending=[False, False])
    return missing[["skill_id", "skill_name", "relevance", "is_trending"]].to_dict("records")


def readiness(occupation_code, user_skills):
    required = _required(occupation_code)
    total = required["relevance"].sum()
    if total == 0:
        return 0
    have = required[required["skill_name"].isin(user_skills)]["relevance"].sum()
    return round(100 * have / total)