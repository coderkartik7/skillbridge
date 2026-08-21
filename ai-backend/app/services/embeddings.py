from sentence_transformers import SentenceTransformer
import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

sk_df = pd.read_csv(os.path.join(BASE_DIR, "../../data/processed/skills.csv"))
oc_df = pd.read_csv(os.path.join(BASE_DIR, "../../data/processed/occupations.csv"))

skills = sk_df['skill_name'].tolist()
occ = (oc_df['title'] + ". " + oc_df['description']).tolist()

model = SentenceTransformer('all-MiniLM-L6-v2')

skill_embeddings = model.encode(skills)
occ_embeddings = model.encode(occ)

def encode_text(text : str | None):
    return model.encode(text)
    