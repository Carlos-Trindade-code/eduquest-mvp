import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Studdo <noreply@studdo.com.br>';

export async function sendWelcomeEmail(to: string, name: string) {
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Bem-vindo ao Studdo, ${name}! 🦉`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #1E1046; color: white; border-radius: 16px;">
          <h1 style="font-size: 24px; margin-bottom: 16px;">Olá, ${name}! 👋</h1>
          <p style="color: rgba(255,255,255,0.7); line-height: 1.6;">
            Sua conta no <strong>Studdo</strong> foi criada com sucesso! Agora você tem acesso ao nosso tutor IA com método socrático.
          </p>
          <p style="color: rgba(255,255,255,0.7); line-height: 1.6;">
            O Edu 🦉, nosso tutor, vai te guiar a pensar e descobrir as respostas — sem dar nada pronto.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="https://www.studdo.com.br/tutor" style="display: inline-block; background: #F5A623; color: #0D1B2A; padding: 14px 32px; border-radius: 12px; font-weight: bold; text-decoration: none;">
              Começar a estudar
            </a>
          </div>
          <p style="color: rgba(255,255,255,0.3); font-size: 12px; text-align: center;">
            Studdo — Tutor IA que ensina de verdade
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Welcome email error:', error);
  }
}

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Redefinir senha — Studdo',
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #1E1046; color: white; border-radius: 16px;">
          <h1 style="font-size: 24px; margin-bottom: 16px;">Redefinir senha 🔑</h1>
          <p style="color: rgba(255,255,255,0.7); line-height: 1.6;">
            Recebemos um pedido para redefinir sua senha no Studdo. Clique no botão abaixo para criar uma nova senha.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetLink}" style="display: inline-block; background: #7C3AED; color: white; padding: 14px 32px; border-radius: 12px; font-weight: bold; text-decoration: none;">
              Redefinir minha senha
            </a>
          </div>
          <p style="color: rgba(255,255,255,0.4); font-size: 13px;">
            Se você não pediu isso, pode ignorar este email. O link expira em 1 hora.
          </p>
          <p style="color: rgba(255,255,255,0.3); font-size: 12px; text-align: center; margin-top: 24px;">
            Studdo — Tutor IA que ensina de verdade
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Password reset email error:', error);
  }
}

export async function sendWeeklyDigestEmail(
  to: string,
  parentName: string,
  kidName: string,
  stats: { sessions: number; minutes: number; xp: number; streak: number }
) {
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Resumo semanal: ${kidName} no Studdo 📊`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #1E1046; color: white; border-radius: 16px;">
          <h1 style="font-size: 24px; margin-bottom: 8px;">Resumo semanal 📊</h1>
          <p style="color: rgba(255,255,255,0.5); margin-bottom: 24px;">Olá, ${parentName}! Veja como ${kidName} foi esta semana:</p>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px;">
            <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 12px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #8B5CF6;">${stats.sessions}</div>
              <div style="color: rgba(255,255,255,0.4); font-size: 12px;">Sessões</div>
            </div>
            <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 12px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #06B6D4;">${stats.minutes}min</div>
              <div style="color: rgba(255,255,255,0.4); font-size: 12px;">Estudados</div>
            </div>
            <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 12px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #F5A623;">${stats.xp}</div>
              <div style="color: rgba(255,255,255,0.4); font-size: 12px;">XP ganho</div>
            </div>
            <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 12px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #F97316;">🔥 ${stats.streak}</div>
              <div style="color: rgba(255,255,255,0.4); font-size: 12px;">Dias seguidos</div>
            </div>
          </div>

          <div style="text-align: center; margin: 24px 0;">
            <a href="https://www.studdo.com.br/parent/dashboard" style="display: inline-block; background: #F5A623; color: #0D1B2A; padding: 14px 32px; border-radius: 12px; font-weight: bold; text-decoration: none;">
              Ver dashboard completo
            </a>
          </div>
          <p style="color: rgba(255,255,255,0.3); font-size: 12px; text-align: center;">
            Studdo — Tutor IA que ensina de verdade
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Weekly digest email error:', error);
  }
}
