import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const score = parseInt(searchParams.get('score') || '0');
  const total = parseInt(searchParams.get('total') || '10');
  const subject = searchParams.get('subject') || 'Quiz';
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  const emoji = percentage >= 80 ? '🏆' : percentage >= 60 ? '⭐' : percentage >= 40 ? '💪' : '📚';
  const message = percentage >= 80 ? 'Excelente!' : percentage >= 60 ? 'Muito bom!' : percentage >= 40 ? 'Bom esforco!' : 'Praticando!';
  const barColor = percentage >= 60 ? '#10B981' : '#F59E0B';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0D1B2A 0%, #1B2838 50%, #0D1B2A 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: 40,
        }}
      >
        {/* Decorative */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 250, height: 250, borderRadius: '50%', background: 'rgba(139,92,246,0.06)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(16,185,129,0.05)', display: 'flex' }} />

        {/* Emoji */}
        <div style={{ fontSize: 80, marginBottom: 16, display: 'flex' }}>{emoji}</div>

        {/* Message */}
        <div style={{ fontSize: 36, fontWeight: 800, color: '#FFFFFF', marginBottom: 8, display: 'flex' }}>
          {message}
        </div>

        {/* Subject */}
        <div style={{ fontSize: 18, color: 'rgba(240,244,248,0.5)', marginBottom: 32, display: 'flex' }}>
          Quiz de {subject}
        </div>

        {/* Score box */}
        <div
          style={{
            display: 'flex',
            gap: 24,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '20px 40px',
              borderRadius: 20,
              background: 'rgba(16,185,129,0.1)',
              border: '2px solid rgba(16,185,129,0.2)',
            }}
          >
            <div style={{ fontSize: 48, fontWeight: 800, color: '#10B981', display: 'flex' }}>
              {score}/{total}
            </div>
            <div style={{ fontSize: 14, color: 'rgba(240,244,248,0.4)', marginTop: 4, display: 'flex' }}>acertos</div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '20px 40px',
              borderRadius: 20,
              background: 'rgba(245,166,35,0.1)',
              border: '2px solid rgba(245,166,35,0.2)',
            }}
          >
            <div style={{ fontSize: 48, fontWeight: 800, color: '#F5A623', display: 'flex' }}>
              {percentage}%
            </div>
            <div style={{ fontSize: 14, color: 'rgba(240,244,248,0.4)', marginTop: 4, display: 'flex' }}>nota</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ width: 400, height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.05)', display: 'flex', overflow: 'hidden' }}>
          <div style={{ width: `${percentage}%`, height: '100%', borderRadius: 6, background: barColor, display: 'flex' }} />
        </div>

        {/* CTA */}
        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#8B5CF6', display: 'flex' }}>
            Teste voce tambem!
          </div>
          <div style={{ fontSize: 14, color: 'rgba(240,244,248,0.35)', display: 'flex' }}>
            www.studdo.com.br/quiz
          </div>
        </div>

        {/* Logo */}
        <div style={{ position: 'absolute', top: 24, left: 32, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#8B5CF6,#4F46E5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontSize: 20, fontWeight: 900 }}>S</span>
          </div>
          <span style={{ color: 'rgba(240,244,248,0.5)', fontSize: 16, fontWeight: 700 }}>Studdo</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
