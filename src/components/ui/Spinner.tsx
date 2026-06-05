import { t } from '../../design/tokens'

type SpinnerSize = 'sm' | 'md' | 'lg'

interface SpinnerProps {
  size?:  SpinnerSize
  color?: string
  label?: string
}

const sizePx: Record<SpinnerSize, number> = {
  sm: 14,
  md: 18,
  lg: 24,
}

let _injected = false
function injectKeyframes() {
  if (_injected || typeof document === 'undefined') return
  if (document.getElementById('gb-spinner-styles')) { _injected = true; return }
  const el = document.createElement('style')
  el.id = 'gb-spinner-styles'
  el.textContent = `
    @keyframes gb-spin { to { transform: rotate(360deg); } }
    @media (prefers-reduced-motion: reduce) {
      .gb-spinner { animation-duration: 1.5s !important; }
    }
  `
  document.head.appendChild(el)
  _injected = true
}

/**
 * Indicador de carregamento rotativo. Tokenizado, com cor herdável via
 * `currentColor` (default) para se adaptar ao contexto (botões, overlays).
 */
export function Spinner({ size = 'md', color = 'currentColor', label = 'Carregando' }: SpinnerProps) {
  injectKeyframes()
  const px = sizePx[size]
  return (
    <span
      role="status"
      aria-label={label}
      style={{ display: 'inline-flex', lineHeight: 0 }}
    >
      <svg
        className="gb-spinner"
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill="none"
        style={{ animation: `gb-spin 0.7s linear infinite`, transformOrigin: 'center' }}
      >
        <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2.5" strokeOpacity="0.25" />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  )
}
