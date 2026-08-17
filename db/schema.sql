-- ============================================
-- SKILLBRIDGE - DATABASE SCHEMA
-- ============================================

CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- 1. USERS TABLE (Login ke liye)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. USER PROFILES TABLE (Resume aur skills yahan store honge)
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    raw_resume_text TEXT,                           -- Original resume ka text
    extracted_skills TEXT[],                        -- NLP se nikali hui skills (list)
    skill_embedding vector(384),                    -- Skills ka fingerprint (384 numbers)
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. JOBS TABLE (Market se aayi jobs yahan store hongi)
-- ============================================
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    required_skills TEXT[],                         -- Job ke liye chahiye skills
    embedding vector(384),                          -- Job description ka fingerprint
    location VARCHAR(100),
    salary_range JSONB,                             -- {min: 50000, max: 80000}
    demand_score FLOAT,                             -- Market demand (0 to 1)
    source VARCHAR(50),                             -- Indeed/LinkedIn etc
    ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. COURSES TABLE (Reskilling ke liye courses)
-- ============================================
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    skills_taught TEXT[],                           -- Is course mein kaunsi skills aayengi
    embedding vector(384),                          -- Course ka fingerprint
    provider VARCHAR(100),                          -- Udemy/Coursera etc
    url VARCHAR(500),
    duration_hours INT,
    price FLOAT
);

-- ============================================
-- 5. MATCHES TABLE (Har match ka record + feedback)
-- ============================================
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    similarity_score FLOAT,                         -- 0 to 1 match percentage
    skill_gap TEXT[],                               -- Kaunsi skills missing hain
    recommended_courses UUID[],                     -- Suggested courses ke IDs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_feedback BOOLEAN,                          -- TRUE = helpful, FALSE = not helpful
    feedback_comment TEXT
);

-- ============================================
-- 6. INDEXES (Speed badhane ke liye)
-- ============================================

-- Users ka email pe index (login fast ho)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Vector pe index (ivfflat) taaki matching tez ho
-- Note: Isko baad mein bhi laga sakte ho, pehle table ban jaye bas
CREATE INDEX IF NOT EXISTS idx_jobs_embedding ON jobs 
    USING ivfflat (embedding vector_cosine_ops) 
    WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_courses_embedding ON courses 
    USING ivfflat (embedding vector_cosine_ops) 
    WITH (lists = 100);

-- Foreign keys pe index (join tez karne ke liye)
CREATE INDEX IF NOT EXISTS idx_matches_user_id ON matches(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_job_id ON matches(job_id);

-- ============================================
-- 7. SAMPLE DATA (Test karne ke liye kuch demo jobs)
-- ============================================

-- Kuch sample jobs daal rahe hain, embedding abhi 0 daal rahe
-- Baad mein AI se update kar denge
INSERT INTO jobs (id, title, description, required_skills, embedding, location, demand_score)
VALUES 
    (gen_random_uuid(), 'Logistics Coordinator', 'Manage supply chain, inventory control, and coordinate with assembly line teams.', 
     ARRAY['Inventory Management', 'Supply Chain', 'Team Coordination'], 
     array_fill(0::real, ARRAY[384])::vector, 'Mumbai', 0.85),
    
    (gen_random_uuid(), 'Data Scientist', 'Analyze large datasets using Python, Machine Learning, and statistical modeling.', 
     ARRAY['Python', 'Machine Learning', 'Statistics', 'SQL'], 
     array_fill(0::real, ARRAY[384])::vector, 'Bangalore', 0.95),
    
    (gen_random_uuid(), 'Customer Support Executive', 'Handle customer queries, resolve complaints, and maintain communication logs.', 
     ARRAY['Communication', 'Problem Solving', 'CRM'], 
     array_fill(0::real, ARRAY[384])::vector, 'Delhi', 0.70)
ON CONFLICT DO NOTHING;

-- ============================================
-- ✅ DONE! Database ready hai.
-- ============================================