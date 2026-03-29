-- Migration 013: Add missing columns to profiles table
-- These columns are referenced in code (types.ts) but not yet in the DB schema

-- age_group: stores the user's age bracket (used for adaptive UI and tutor prompts)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age_group VARCHAR(5) DEFAULT '10-12';

-- behavioral_profile: adaptive learning profile (default, tdah, anxiety, gifted)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS behavioral_profile VARCHAR(20) DEFAULT 'default';

-- Add comment for documentation
COMMENT ON COLUMN profiles.age_group IS 'Age bracket: 4-6, 7-9, 10-12, 13-15, 16-18';
COMMENT ON COLUMN profiles.behavioral_profile IS 'Learning profile: default, tdah, anxiety, gifted';
