ALTER TABLE session_summaries
  ADD COLUMN IF NOT EXISTS estimated_accuracy INTEGER,
  ADD COLUMN IF NOT EXISTS correct_concepts INTEGER,
  ADD COLUMN IF NOT EXISTS struggled_concepts INTEGER;
