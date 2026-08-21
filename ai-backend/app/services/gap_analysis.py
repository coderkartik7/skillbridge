import pandas as pd
import os
from app.services.matching import match_occupation
from app.services.skill_extraction import extract_skills

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

occ_sk = pd.read_csv(os.path.join(BASE_DIR,'../../data/processed/occupation_skills.csv'))

def gap_analysis(occupation_code, user_skills):
    required = occ_sk[occ_sk['occupation_code'] == occupation_code]
    missing = required[~required['skill_name'].isin(user_skills)]
    missing = missing.sort_values(by=['is_trending', 'relevance'], ascending=[False, False])
    missing = missing.drop_duplicates(subset='skill_name')
    return missing[['skill_id', 'skill_name', 'relevance', 'is_trending']].to_dict('records')
