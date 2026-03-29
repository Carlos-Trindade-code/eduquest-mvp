-- ===========================================
-- Migration 010: Supabase Storage bucket para materiais
-- EXECUTAR MANUALMENTE no Supabase SQL Editor
-- ===========================================

-- Criar bucket 'materials' (public read, authenticated upload)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'materials',
  'materials',
  true,
  52428800, -- 50MB
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
);

-- RLS: usuarios autenticados podem fazer upload
CREATE POLICY "Authenticated users can upload materials"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'materials');

-- RLS: qualquer um pode ver (public bucket)
CREATE POLICY "Anyone can view materials"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'materials');

-- RLS: usuarios podem deletar seus proprios arquivos
CREATE POLICY "Users can delete own materials"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'materials'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS: usuarios podem atualizar seus proprios arquivos
CREATE POLICY "Users can update own materials"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'materials'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
