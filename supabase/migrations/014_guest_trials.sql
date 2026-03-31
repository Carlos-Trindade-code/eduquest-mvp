-- Migration 014: Guest trial tracking (server-side)
-- Tracks guest sessions by browser fingerprint to prevent trial bypass via localStorage clearing

CREATE TABLE IF NOT EXISTS guest_trials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fingerprint TEXT NOT NULL UNIQUE,
  session_count INTEGER NOT NULL DEFAULT 0,
  last_session_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast fingerprint lookups
CREATE INDEX IF NOT EXISTS idx_guest_trials_fingerprint ON guest_trials (fingerprint);

-- RLS: allow anonymous access for inserts and selects
ALTER TABLE guest_trials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous select on guest_trials"
  ON guest_trials FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert on guest_trials"
  ON guest_trials FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update on guest_trials"
  ON guest_trials FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- RPC function: upsert fingerprint and increment session count, return new count
CREATE OR REPLACE FUNCTION increment_guest_trial(fingerprint_hash TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  INSERT INTO guest_trials (fingerprint, session_count, last_session_at)
  VALUES (fingerprint_hash, 1, now())
  ON CONFLICT (fingerprint)
  DO UPDATE SET
    session_count = guest_trials.session_count + 1,
    last_session_at = now();

  SELECT session_count INTO new_count
  FROM guest_trials
  WHERE fingerprint = fingerprint_hash;

  RETURN new_count;
END;
$$;

-- RPC function: get current trial count for a fingerprint
CREATE OR REPLACE FUNCTION get_guest_trial_count(fingerprint_hash TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_count INTEGER;
BEGIN
  SELECT session_count INTO current_count
  FROM guest_trials
  WHERE fingerprint = fingerprint_hash;

  RETURN COALESCE(current_count, 0);
END;
$$;
