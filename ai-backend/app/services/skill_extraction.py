import spacy, pandas as pd
from spacy.matcher import PhraseMatcher
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))    
skills_path = os.path.join(BASE_DIR, "../../data/processed/skills.csv")

skills = pd.DataFrame(pd.read_csv(skills_path, usecols=['skill_name']))
skills = skills['skill_name'].tolist()

nlp = spacy.load("en_core_web_sm")
Matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
doc_list = [nlp.make_doc(s) for s in skills]
Matcher.add("SKILL", doc_list)

def extract_skills(text:str|None):
    doc = nlp(text)
    matches = Matcher(doc)

    keyword = set(doc[start:end].text.lower() for match_id, start, end in matches)
    return keyword

