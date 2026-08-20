import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
od = pd.read_csv(os.path.join(BASE_DIR,"../data/raw/occupation_data.csv"))

df = pd.DataFrame(od.rename(columns={'O*NET-SOC Code':'occupation_code', 'Title':'title','Description':'description'}))

df.to_csv(os.path.join(BASE_DIR, "../data/processed/occupations.csv"), index=False)