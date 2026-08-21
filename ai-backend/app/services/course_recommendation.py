import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))    

courses = pd.read_csv(os.path.join(BASE_DIR, "../../data/processed/courses.csv"))

def recommend_corses(missing_skills):
    missing_skills_id = []
    for skill in missing_skills:
        missing_skills_id.append(skill['skill_id'])
    
    course = courses[courses['skill_id'].isin(missing_skills_id)]
    return course
