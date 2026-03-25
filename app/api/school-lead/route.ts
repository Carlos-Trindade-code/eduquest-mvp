import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { schoolName, contactName, email, phone, role, studentCount, message } = body;

    if (!schoolName || !contactName || !email) {
      return NextResponse.json({ error: 'Campos obrigatorios: escola, nome e email' }, { status: 400 });
    }

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
