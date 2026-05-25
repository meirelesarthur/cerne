import { useEffect } from 'react'
import logoFull from '../assets/Logo.svg'
import t from '../design/tokens'

const DURATION_MS = 2800

const keyframes = `
  @keyframes splash-logo-in {
    from { transform: scale(0.72); opacity: 0; }
    to   { transform: scale(1);    opacity: 1; }
  }
  @keyframes splash-tag-in {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0);   }
  }
  @keyframes splash-out {
    from { opacity: 1; }
    to   { opacity: 0; }
  }
`

export function SplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, DURATION_MS)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <>
      <style>{keyframes}</style>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: t.color.brand[50],
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          fontFamily: t.font.family.sans,
          animation: `splash-out 0.35s ease ${DURATION_MS - 380}ms both`,
        }}
      >
        <div style={{ animation: 'splash-logo-in 0.55s cubic-bezier(0.34,1.56,0.64,1) both' }}>
          <img src={logoFull} alt="GB CERNE" style={{ height: 68, display: 'block' }} />
        </div>
        <div
          style={{
            animation: 'splash-tag-in 0.45s ease 0.45s both',
            fontSize: t.font.size.sm,
            color: t.color.brand[600],
            fontWeight: t.font.weight.medium,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Sistema de Gestão Agropecuária
        </div>
      </div>
    </>
  )
}
