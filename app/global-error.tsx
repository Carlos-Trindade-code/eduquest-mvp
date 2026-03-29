'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body style={{ background: 'linear-gradient(135deg, #1E1046 0%, #3B0764 100%)', margin: 0, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🦉</div>
          <h2 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Ops! Algo deu errado
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Tivemos um problema inesperado. Tente novamente.
          </p>
          <button
            onClick={reset}
            style={{
              background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              fontWeight: 'bold',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
