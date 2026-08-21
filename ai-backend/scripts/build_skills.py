import pandas as pd
import os

# Setting Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Reading required CSV Files
es = pd.read_csv(os.path.join(BASE_DIR, "../data/raw/essential_skills.csv"))
ss = pd.read_csv(os.path.join(BASE_DIR, "../data/raw/software_skills.csv"))
tech = pd.read_csv(os.path.join(BASE_DIR, "../data/processed/tech_skills.csv"))


# Extracting required essential_skills.csv data
unique_el_name = es["Element Name"].unique()
es_df = pd.DataFrame({'skill_name': unique_el_name, 'skill_type':'essential'})

# Extracting required software_skills.csv data
unique_ss_name = ss["Element Name"].unique()
ss_df = pd.DataFrame({'skill_name': unique_ss_name, 'skill_type':'software'})

# Combining both into a DataFrame
skill_df = pd.concat([es_df, ss_df])

# Make data case-insensitive lowercase + dedupe logic
skill_df['skill_name'] = skill_df['skill_name'].str.lower()
skill_df = skill_df.drop_duplicates(subset='skill_name')

# Adding skill_id column
skill_df['skill_id'] = range(1, len(skill_df) + 1)
skill_df = skill_df[['skill_id', 'skill_name', 'skill_type']]
skill_df = pd.concat([skill_df, tech], ignore_index=True)

# Exporting to processed/skills.csv
skill_df.to_csv(os.path.join(BASE_DIR, "../data/processed/skills.csv"), index=False)