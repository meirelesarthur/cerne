import { useEffect } from 'react'
import t from '../design/tokens'

const DURATION_MS = 3000

// Marca CERNE — aperture C, variante GBMode (rampa brand 500→300 de tokens.ts)
// Paths gerados por scripts/gen-logos.mjs — manter em sincronia com src/assets/logo-min-white.svg
const MARK_WEDGES: Array<{ d: string; c: string }> = [
  { d: 'M 193.06 175.91 A 92 92 0 0 1 166.32 199.49 L 145.50 158.28 A 46 46 0 0 0 154.79 150.10 Z', c: '#86efac' },
  { d: 'M 156.50 204.45 A 92 92 0 0 1 121.65 211.99 L 123.58 165.86 A 46 46 0 0 0 135.68 163.24 Z', c: '#79eba2' },
  { d: 'M 110.66 211.52 A 92 92 0 0 1 76.56 201.10 L 100.75 161.78 A 46 46 0 0 0 112.59 165.40 Z', c: '#6be798' },
  { d: 'M 67.20 195.34 A 92 92 0 0 1 42.52 169.60 L 82.82 147.08 A 46 46 0 0 0 91.39 156.02 Z', c: '#5ee48f' },
  { d: 'M 37.15 160.00 A 92 92 0 0 1 28.16 125.50 L 74.33 125.50 A 46 46 0 0 0 77.45 137.48 Z', c: '#51e085' },
  { d: 'M 28.16 114.50 A 92 92 0 0 1 37.15 80.00 L 77.45 102.52 A 46 46 0 0 0 74.33 114.50 Z', c: '#46db7c' },
  { d: 'M 42.52 70.40 A 92 92 0 0 1 67.20 44.66 L 91.39 83.98 A 46 46 0 0 0 82.82 92.92 Z', c: '#3dd675' },
  { d: 'M 76.56 38.90 A 92 92 0 0 1 110.66 28.48 L 112.59 74.60 A 46 46 0 0 0 100.75 78.22 Z', c: '#34d06d' },
  { d: 'M 121.65 28.01 A 92 92 0 0 1 156.50 35.55 L 135.68 76.76 A 46 46 0 0 0 123.58 74.14 Z', c: '#2bcb66' },
  { d: 'M 166.32 40.51 A 92 92 0 0 1 193.06 64.09 L 154.79 89.90 A 46 46 0 0 0 145.50 81.72 Z', c: '#22c55e' },
]

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

          {/* Marca CERNE — aperture C */}
          <div
            style={{
              animation: 'sp-mark-in 0.65s cubic-bezier(0.34,1.56,0.64,1) 0.1s both',
            }}
          >
            <svg
              viewBox="0 0 240 240"
              width={84}
              height={84}
              fill="none"
              aria-hidden="true"
            >
              {MARK_WEDGES.map(w => (
                <path
                  key={w.c}
                  d={w.d}
                  fill={w.c}
                  stroke={w.c}
                  strokeWidth={7}
                  strokeLinejoin="round"
                />
              ))}
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
