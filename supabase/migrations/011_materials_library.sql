-- ===========================================
-- Migration 011: Tabela materials (biblioteca de materiais)
-- EXECUTAR MANUALMENTE no Supabase SQL Editor
-- ===========================================

-- Helper function to get current user's profile id
CREATE OR REPLACE FUNCTION public.get_my_profile_id()
RETURNS UUID AS $$
  SELECT id FROM public.profiles WHERE auth_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Tabela principal de materiais
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  owner_type TEXT NOT NULL CHECK (owner_type IN ('kid', 'parent', 'teacher')),
  kid_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type TEXT,
  file_name TEXT,
  file_size INTEGER,
  content_text TEXT,
  subject TEXT,
  tags TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indices
CREATE INDEX idx_materials_owner ON materials(owner_id);
CREATE INDEX idx_materials_kid ON materials(kid_id);
CREATE INDEX idx_materials_subject ON materials(subject);

-- Habilitar RLS
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

-- Kids veem seus proprios materiais + materiais que pais enviaram para eles
CREATE POLICY "Kids view own and parent materials"
ON materials FOR SELECT
USING (
  owner_id = public.get_my_profile_id()
  OR kid_id = public.get_my_profile_id()
);

-- Kids podem inserir seus proprios materiais
CREATE POLICY "Kids insert own materials"
ON materials FOR INSERT
WITH CHECK (owner_id = public.get_my_profile_id());

-- Kids podem deletar seus proprios materiais
CREATE POLICY "Kids delete own materials"
ON materials FOR DELETE
USING (owner_id = public.get_my_profile_id());

-- Kids podem atualizar seus proprios materiais
CREATE POLICY "Kids update own materials"
ON materials FOR UPDATE
USING (owner_id = public.get_my_profile_id());

-- Pais veem materiais proprios + dos filhos linkados
CREATE POLICY "Parents view kid materials"
ON materials FOR SELECT
USING (
  owner_id = public.get_my_profile_id()
  OR kid_id IN (
    SELECT kid_id FROM parent_kid_links
    WHERE parent_id = public.get_my_profile_id()
  )
);

-- Pais podem inserir materiais para seus filhos
CREATE POLICY "Parents insert materials for kids"
ON materials FOR INSERT
WITH CHECK (
  owner_id = public.get_my_profile_id()
  AND (
    kid_id IS NULL
    OR kid_id IN (
      SELECT kid_id FROM parent_kid_links
      WHERE parent_id = public.get_my_profile_id()
    )
  )
);

-- Pais podem deletar materiais que eles mesmos enviaram
CREATE POLICY "Parents delete own materials"
ON materials FOR DELETE
USING (owner_id = public.get_my_profile_id());

-- Pais podem atualizar materiais que eles mesmos enviaram
CREATE POLICY "Parents update own materials"
ON materials FOR UPDATE
USING (owner_id = public.get_my_profile_id());
