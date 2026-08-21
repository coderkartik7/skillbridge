# SkillBridge Database Setup & Seeding

This directory contains the PostgreSQL + `pgvector` schema definition and data seeding utilities for SkillBridge.

## Schema Overview

The database contains tables for core skills, occupations, mapping junction tables, course recommendations, vector embeddings, and fairness logs:

1. `skills` (`skill_id`, `skill_name`, `skill_type`)
2. `occupations` (`occupation_code`, `title`, `description`)
3. `occupation_skills` (`occupation_code`, `skill_id`, `skill_name`, `skill_type`, `relevance`, `is_trending`)
4. `courses` (`skill_id`, `skill_name`, `course_name`, `course_url`)
5. `embeddings` (`id`, `ref_type`, `ref_id`, `embedding VECTOR(384)`)
6. `matches` (`match_id`, `occupation_code`, `score`, `created_at`)
7. `bias_audit_logs` (`audit_id`, `run_at`, `demographic_group`, `metric_name`, `metric_value`, `notes`)

## Quick Start (Docker Compose)

### 1. Launch PostgreSQL with pgvector
From the root directory:
```bash
docker compose up -d
```

### 2. Seed Data via `psql` or `seed.sql`
```bash
psql -h localhost -U postgres -d skillbridge -f db/schema.sql
psql -h localhost -U postgres -d skillbridge -f db/seed.sql
```

Alternatively, use the Python seeder script:
```bash
python db/seed.py
```

## Verification

Expected row counts:
- `skills`: ~296 rows
- `occupations`: ~1,016 rows
- `occupation_skills`: ~40,000+ rows
- `courses`: ~48 rows
- `embeddings`: 0 (populated by subsequent workflows)
- `matches`: 0
- `bias_audit_logs`: 0
