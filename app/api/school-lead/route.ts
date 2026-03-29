import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { rateLimit, rateLimitResponse } from '@/lib/api/rate-limit';
import { schoolLeadSchema } from '@/lib/api/schemas';

export async function POST(request: NextRequest) {
  try {
    const rl = rateLimit(request, { maxRequests: 3, windowMs: 60_000 });
    if (!rl.success) return rateLimitResponse();

    const parsed = schoolLeadSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const { schoolName, contactName, email, phone, role, studentCount, message } = parsed.data;

    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.from('school_leads').insert({
      school_name: schoolName,
      contact_name: contactName,
      email,
      phone: phone || null,
      role: role || 'professor',
      student_count: studentCount || null,
      message: message || null,
    });

    if (error) {
      console.error('School lead error:', error);
      return NextResponse.json({ error: 'Erro ao enviar. Tente novamente.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
