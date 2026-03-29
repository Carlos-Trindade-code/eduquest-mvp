import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
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
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(139, 92, 246, 0.08)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -60,
            left: -60,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.06)',
            display: 'flex',
          }}
        />

        {/* Logo */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #8B5CF6, #4F46E5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
            boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)',
          }}
        >
          <span style={{ color: 'white', fontSize: 44, fontWeight: 900 }}>S</span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 48,
            fontWeight: 800,
            color: '#FFFFFF',
            marginBottom: 12,
            display: 'flex',
          }}
        >
          Studdo
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 22,
            color: 'rgba(240, 244, 248, 0.6)',
            marginBottom: 40,
            display: 'flex',
          }}
        >
          Tutor IA que ensina de verdade
        </div>

        {/* Subject icons row */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            marginBottom: 40,
          }}
        >
          {['🔢', '📝', '🔬', '🏛️', '🌍', '🇬🇧'].map((icon, i) => (
            <div
              key={i}
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
              }}
            >
              {icon}
            </div>
          ))}
        </div>

        {/* Tagline */}
        <div
          style={{
            display: 'flex',
            gap: 24,
            color: 'rgba(240, 244, 248, 0.35)',
            fontSize: 14,
          }}
        >
          <span style={{ display: 'flex' }}>4-18 anos</span>
          <span style={{ display: 'flex' }}>Método Socrático</span>
          <span style={{ display: 'flex' }}>Gratuito</span>
        </div>

        {/* URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            color: 'rgba(139, 92, 246, 0.5)',
            fontSize: 14,
            display: 'flex',
          }}
        >
          www.studdo.com.br
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
