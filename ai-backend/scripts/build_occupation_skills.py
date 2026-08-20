import pandas as pd
import os

# Setting Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Reading required CSV Files
es = pd.read_csv(os.path.join(BASE_DIR, "../data/raw/essential_skills.csv"))
ss = pd.read_csv(os.path.join(BASE_DIR, "../data/raw/software_skills.csv"))

# Extracting Required Columns
es = es[['O*NET-SOC Code', 'Title', 'Element ID', 'Element Name', 'Scale ID', 'Scale Name', 'Data Value']]
es = es[es['Scale ID']=='IM']
es = es[['O*NET-SOC Code', 'Element Name', 'Data Value']]

# Making DataFrame from es and adding some data
df1 = pd.DataFrame(es.rename(columns={'O*NET-SOC Code':'occupation_code', 'Element Name':'skill_name','Data Value':'relevance'}))
df1['is_trending'] = False
df1['skill_type'] = 'essential'
df1 = df1[['occupation_code','skill_name','skill_type','relevance','is_trending']]

# Extracting & Adding some required data from ss
df2 = pd.DataFrame(ss.rename(columns={'O*NET-SOC Code':'occupation_code', 'Element Name':'skill_name'}))
df2['skill_type'] = 'software'
df2['is_trending'] = (ss['Hot Technology'] == 'Y') | (ss['In Demand'] == 'Y')
df2['relevance'] = 4 + (ss['Hot Technology']=='Y') + (ss['In Demand']=='Y')
df2 = df2[['occupation_code','skill_name','skill_type','relevance','is_trending']]

# Final DataFrame(Merged)
df = pd.concat([df1, df2])
df['skill_name'] = df['skill_name'].str.lower()

# Adding skill_id from skills.csv
skills = pd.DataFrame(pd.read_csv(os.path.join(BASE_DIR, "../data/processed/skills.csv")))
df = pd.merge(df, skills[['skill_id', 'skill_name']], on='skill_name', how='left')
df = df[['occupation_code','skill_id','skill_name','skill_type','relevance','is_trending']]

# Generating CSV
df.to_csv(os.path.join(BASE_DIR, "../data/processed/occupation_skills.csv"), index=False)
