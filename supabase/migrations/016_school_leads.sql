-- ===========================================
-- Migration 016: School Leads (formulario de contato escolas)
-- EXECUTAR MANUALMENTE no Supabase SQL Editor
-- ===========================================

-- =============================================
-- 1. SCHOOL_LEADS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS school_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT,
  student_count TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- INDICES
-- =============================================
CREATE INDEX idx_school_leads_email ON school_leads(email);
CREATE INDEX idx_school_leads_created_at ON school_leads(created_at DESC);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE school_leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (landing page form — no auth required)
CREATE POLICY "Anyone can insert school leads"
  ON school_leads FOR INSERT
  WITH CHECK (true);

-- Only admin can view leads
CREATE POLICY "Admin can view school leads"
  ON school_leads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE auth_id = auth.uid() AND email = 'carlostrindade@me.com'
    )
  );
