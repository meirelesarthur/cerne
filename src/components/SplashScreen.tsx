import { useEffect } from 'react'
import t from '../design/tokens'

const DURATION_MS = 3000

const keyframes = `
  @keyframes sp-bg-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes sp-ring-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes sp-ring-spin-rev {
    from { transform: rotate(0deg); }
    to   { transform: rotate(-360deg); }
  }
  @keyframes sp-mark-in {
    0%   { transform: scale(0.5) rotate(-12deg); opacity: 0; }
    60%  { transform: scale(1.06) rotate(2deg);  opacity: 1; }
    100% { transform: scale(1)   rotate(0deg);   opacity: 1; }
  }
  @keyframes sp-name-in {
    from { opacity: 0; transform: translateY(14px) scale(0.96); letter-spacing: 0.35em; }
    to   { opacity: 1; transform: translateY(0)    scale(1);    letter-spacing: 0.22em; }
  }
  @keyframes sp-tag-in {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0);   }
  }
  @keyframes sp-dot-pulse {
    0%, 100% { opacity: 0.3; transform: scale(0.8); }
    50%       { opacity: 1;   transform: scale(1);   }
  }
  @keyframes sp-out {
    from { opacity: 1; }
    to   { opacity: 0; }
  }
`

export function SplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, DURATION_MS)
    return () => clearTimeout(timer)
  }, [onDone])

  const outDelay = `${DURATION_MS - 400}ms`

  return (
    <>
      <style>{keyframes}</style>
      <div
        role="status"
        aria-label="Carregando CERNE"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: '#081a12',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
          fontFamily: t.font.family.sans,
          animation: `sp-bg-in 0.4s ease both, sp-out 0.4s ease ${outDelay} both`,
          overflow: 'hidden',
        }}
      >
        {/* Radial glow ambiental */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: 520,
            height: 520,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(5,150,105,0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Anéis orbitais */}
        <div aria-hidden="true" style={{ position: 'absolute', width: 320, height: 320 }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              border: '1px solid rgba(5,150,105,0.14)',
              borderRadius: '50%',
              animation: 'sp-ring-spin 12s linear infinite',
            }}
          >
            {/* Ponto orbital */}
            <div style={{
              position: 'absolute',
              top: -3,
              left: '50%',
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: t.color.brand[400],
              transform: 'translateX(-50%)',
              boxShadow: `0 0 8px ${t.color.brand[400]}`,
            }} />
          </div>
        </div>
        <div aria-hidden="true" style={{ position: 'absolute', width: 220, height: 220 }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              border: '1px solid rgba(5,150,105,0.10)',
              borderRadius: '50%',
              animation: 'sp-ring-spin-rev 8s linear infinite',
            }}
          />
        </div>

        {/* Marca central + nome */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>

          {/* Ícone hexagonal */}
          <div
            style={{
              animation: 'sp-mark-in 0.65s cubic-bezier(0.34,1.56,0.64,1) 0.1s both',
            }}
          >
            <svg
              viewBox="0 0 64 64"
              width={72}
              height={72}
              fill="none"
              aria-hidden="true"
            >
              {/* Hexágono fundo */}
              <path
                d="M32 4L58 19v26L32 60 6 45V19L32 4z"
                fill="rgba(5,150,105,0.15)"
                stroke="rgba(5,150,105,0.6)"
                strokeWidth="1.5"
              />
              {/* Triângulo interno — simbologia agrícola/crescimento */}
              <path
                d="M32 16L48 44H16L32 16z"
                fill="none"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              {/* Barra central */}
              <path
                d="M24 38h16"
                stroke="rgba(5,150,105,0.9)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Nome CERNE */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                fontSize: 42,
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '0.22em',
                lineHeight: 1,
                animation: 'sp-name-in 0.55s cubic-bezier(0.22,1,0.36,1) 0.35s both',
              }}
            >
              CERNE
            </span>

            {/* Subtítulo */}
            <span
              style={{
                fontSize: t.font.size.xs,
                color: t.color.brand[400],
                fontWeight: t.font.weight.medium,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                animation: 'sp-tag-in 0.45s ease 0.75s both',
              }}
            >
              Sistema de Gestão Agropecuária
            </span>
          </div>

          {/* Indicador de carregamento — três pontos pulsantes */}
          <div
            style={{
              display: 'flex',
              gap: 7,
              animation: 'sp-tag-in 0.4s ease 1.0s both',
            }}
            aria-hidden="true"
          >
            {[0, 1, 2].map(i => (
              <div
                key={i}
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: t.color.brand[500],
                  animation: `sp-dot-pulse 1.2s ease ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
