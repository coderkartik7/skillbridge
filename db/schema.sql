-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Skills table
CREATE TABLE IF NOT EXISTS skills (
    skill_id INTEGER PRIMARY KEY,
    skill_name TEXT NOT NULL,
    skill_type TEXT NOT NULL
);

-- 2. Occupations table
CREATE TABLE IF NOT EXISTS occupations (
    occupation_code TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT
);

-- 3. Occupation Skills junction table
CREATE TABLE IF NOT EXISTS occupation_skills (
    occupation_code TEXT REFERENCES occupations(occupation_code),
    skill_id INTEGER REFERENCES skills(skill_id),
    skill_name TEXT,
    skill_type TEXT,
    relevance NUMERIC,
    is_trending BOOLEAN,
    PRIMARY KEY (occupation_code, skill_id)
);

-- 4. Courses table
CREATE TABLE IF NOT EXISTS courses (
    skill_id INTEGER REFERENCES skills(skill_id),
    skill_name TEXT,
    course_name TEXT,
    course_url TEXT
);

-- 5. Embeddings table
CREATE TABLE IF NOT EXISTS embeddings (
    id SERIAL PRIMARY KEY,
    ref_type TEXT NOT NULL,   -- 'skill' or 'occupation'
    ref_id TEXT NOT NULL,
    embedding VECTOR(384)
);

-- 6. Matches table
CREATE TABLE IF NOT EXISTS matches (
    match_id SERIAL PRIMARY KEY,
    occupation_code TEXT REFERENCES occupations(occupation_code),
    score NUMERIC,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 7. Fairness audit logs table
CREATE TABLE IF NOT EXISTS bias_audit_logs (
    audit_id SERIAL PRIMARY KEY,
    run_at TIMESTAMP DEFAULT NOW(),
    demographic_group TEXT,
    metric_name TEXT,
    metric_value NUMERIC,
    notes TEXT
);
