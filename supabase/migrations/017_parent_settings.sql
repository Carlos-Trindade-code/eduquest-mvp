-- ===========================================
-- Migration 017: Parent settings (daily time limit + weekly goals)
-- ===========================================

-- Daily time limit in minutes (NULL = no limit)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS daily_time_limit_minutes INTEGER DEFAULT NULL;

-- Weekly session goal (number of sessions per week, NULL = no goal)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS weekly_session_goal INTEGER DEFAULT NULL;

-- Weekly subject focus (subject id to prioritize, NULL = any)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS weekly_subject_focus VARCHAR(50) DEFAULT NULL;
