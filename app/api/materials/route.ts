import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { uploadMaterial, deleteMaterialFile } from '@/lib/storage/materials';
import { createMaterial, getKidMaterials, getMaterials, deleteMaterialRecord } from '@/lib/supabase/queries';
import { GoogleGenAI } from '@google/genai';
import mammoth from 'mammoth';

const DOCX_TYPES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

async function extractText(file: File): Promise<string | null> {
  const mimeType = file.type || 'application/octet-stream';
  const bytes = await file.arrayBuffer();

  // DOCX/DOC
  if (DOCX_TYPES.includes(mimeType) || file.name?.endsWith('.docx') || file.name?.endsWith('.doc')) {
    try {
      const result = await mammoth.extractRawText({ buffer: Buffer.from(bytes) });
      return result.value?.trim() || null;
    } catch {
      return null;
    }
  }

  // Images & PDF — Gemini Vision OCR
  if (!process.env.GEMINI_API_KEY) return null;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const base64 = Buffer.from(bytes).toString('base64');
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite',
      contents: [{
        role: 'user',
        parts: [
          { inlineData: { mimeType, data: base64 } },
          { text: 'Extraia todo o texto deste documento/imagem escolar brasileiro. Mantenha a formatação original. Retorne APENAS o texto extraído.' },
        ],
      }],
    });
    return response.text?.trim() || null;
  } catch {
    return null;
  }
}

// POST — upload material
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const title = (formData.get('title') as string) || file?.name || 'Material';
    const subject = formData.get('subject') as string | null;
    const kidId = formData.get('kid_id') as string | null;
    const ownerType = (formData.get('owner_type') as string) || 'kid';

    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    if (!profile) {
      return Response.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    if (!file) {
      return Response.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return Response.json({ error: 'Arquivo muito grande (max 50MB)' }, { status: 400 });
    }

    // Upload to storage
    const uploaded = await uploadMaterial(supabase, file, profile.id);
    if (!uploaded) {
      return Response.json({ error: 'Falha no upload do arquivo' }, { status: 500 });
    }

    // Extract text (OCR)
    const contentText = await extractText(file);

    // Save to DB
    const { data: material, error } = await createMaterial(supabase, {
      owner_id: profile.id,
      owner_type: ownerType as 'kid' | 'parent' | 'teacher',
      kid_id: kidId || (ownerType === 'kid' ? null : null),
      title,
      description: null,
      file_url: uploaded.url,
      file_type: file.type,
      file_name: file.name,
      file_size: file.size,
      content_text: contentText,
      subject,
      thumbnail_url: file.type.startsWith('image/') ? uploaded.url : null,
    });

    if (error) {
      console.error('Create material error:', error);
      return Response.json({ error: 'Falha ao salvar material' }, { status: 500 });
    }

    return Response.json({ material });
  } catch (error) {
    console.error('Materials POST error:', error);
    return Response.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// GET — list materials
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, user_type')
      .eq('auth_id', user.id)
      .single();

    if (!profile) {
      return Response.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    const url = new URL(request.url);
    const subject = url.searchParams.get('subject') || undefined;
    const kidId = url.searchParams.get('kid_id') || undefined;

    let result;
    if (kidId) {
      result = await getKidMaterials(supabase, kidId, { subject });
    } else {
      result = await getMaterials(supabase, profile.id, { subject, kidId });
    }

    return Response.json({ materials: result.data });
  } catch (error) {
    console.error('Materials GET error:', error);
    return Response.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// DELETE — remove material
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { materialId } = await request.json();
    if (!materialId) {
      return Response.json({ error: 'materialId obrigatório' }, { status: 400 });
    }

    // Get material to find file path
    const { data: material } = await supabase
      .from('materials')
      .select('file_url, owner_id')
      .eq('id', materialId)
      .single();

    if (material?.file_url) {
      // Extract path from URL
      const urlParts = material.file_url.split('/materials/');
      if (urlParts[1]) {
        await deleteMaterialFile(supabase, urlParts[1]);
      }
    }

    const { error } = await deleteMaterialRecord(supabase, materialId);
    if (error) {
      return Response.json({ error: 'Falha ao deletar material' }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Materials DELETE error:', error);
    return Response.json({ error: 'Erro interno' }, { status: 500 });
  }
}
