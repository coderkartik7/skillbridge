-- Seed Script for SkillBridge PostgreSQL Database
-- Note: When running inside psql, ensure client paths point to the CSV files:

\copy skills(skill_id, skill_name, skill_type) FROM 'ai-backend/data/processed/skills.csv' DELIMITER ',' CSV HEADER;
\copy occupations(occupation_code, title, description) FROM 'ai-backend/data/processed/occupations.csv' DELIMITER ',' CSV HEADER;
\copy occupation_skills(occupation_code, skill_id, skill_name, skill_type, relevance, is_trending) FROM 'ai-backend/data/processed/occupation_skills.csv' DELIMITER ',' CSV HEADER;
\copy courses(skill_id, skill_name, course_name, course_url) FROM 'ai-backend/data/processed/courses.csv' DELIMITER ',' CSV HEADER;
