import os
import csv
import psycopg2
from psycopg2.extras import execute_batch
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:Kartik@07@localhost:5432/SkillBridge")

def seed_database():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    processed_dir = os.path.join(base_dir, "ai-backend", "data", "processed")

    print(f"Connecting to database at {DATABASE_URL}...")
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    # 1. Ensure schema
    schema_path = os.path.join(base_dir, "db", "schema.sql")
    print(f"Applying schema from {schema_path}...")
    with open(schema_path, "r", encoding="utf-8") as f:
        cur.execute(f.read())
    conn.commit()

    # 2. Seed skills
    skills_csv = os.path.join(processed_dir, "skills.csv")
    print(f"Seeding skills from {skills_csv}...")
    with open(skills_csv, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        skills_data = [(int(row["skill_id"]), row["skill_name"], row["skill_type"]) for row in reader]
    execute_batch(cur, """
        INSERT INTO skills (skill_id, skill_name, skill_type)
        VALUES (%s, %s, %s)
        ON CONFLICT (skill_id) DO NOTHING;
    """, skills_data)
    conn.commit()

    # 3. Seed occupations
    occupations_csv = os.path.join(processed_dir, "occupations.csv")
    print(f"Seeding occupations from {occupations_csv}...")
    with open(occupations_csv, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        occupations_data = [(row["occupation_code"], row["title"], row["description"]) for row in reader]
    execute_batch(cur, """
        INSERT INTO occupations (occupation_code, title, description)
        VALUES (%s, %s, %s)
        ON CONFLICT (occupation_code) DO NOTHING;
    """, occupations_data)
    conn.commit()

    # 4. Seed occupation_skills
    occ_skills_csv = os.path.join(processed_dir, "occupation_skills.csv")
    print(f"Seeding occupation_skills from {occ_skills_csv}...")
    with open(occ_skills_csv, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        occ_skills_data = [
            (
                row["occupation_code"],
                int(row["skill_id"]),
                row.get("skill_name"),
                row.get("skill_type"),
                float(row["relevance"]) if row.get("relevance") else None,
                row["is_trending"].strip().lower() in ["true", "1", "t"] if row.get("is_trending") else False
            )
            for row in reader
        ]
    execute_batch(cur, """
        INSERT INTO occupation_skills (occupation_code, skill_id, skill_name, skill_type, relevance, is_trending)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT (occupation_code, skill_id) DO NOTHING;
    """, occ_skills_data, page_size=1000)
    conn.commit()

    # 5. Seed courses
    courses_csv = os.path.join(processed_dir, "courses.csv")
    print(f"Seeding courses from {courses_csv}...")
    with open(courses_csv, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        courses_data = [
            (
                int(row["skill_id"]) if row.get("skill_id") else None,
                row.get("skill_name"),
                row.get("course_name"),
                row.get("course_url")
            )
            for row in reader
        ]
    execute_batch(cur, """
        INSERT INTO courses (skill_id, skill_name, course_name, course_url)
        VALUES (%s, %s, %s, %s);
    """, courses_data)
    conn.commit()

    # 6. Verify row counts
    print("\n--- Row Count Verification ---")
    for table in ["skills", "occupations", "occupation_skills", "courses", "embeddings", "matches", "bias_audit_logs"]:
        cur.execute(f"SELECT COUNT(*) FROM {table};")
        count = cur.fetchone()[0]
        print(f"Table '{table}': {count} rows")

    cur.close()
    conn.close()
    print("\nDatabase seeded and verified successfully!")

if __name__ == "__main__":
    seed_database()
