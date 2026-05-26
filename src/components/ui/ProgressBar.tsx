import { useEffect, useState } from 'react'
import { t } from '../../design/tokens'
import './ProgressBar.css'

export type ProgressState = 'idle' | 'loading' | 'success' | 'error'

interface ProgressBarProps {
  state: ProgressState
}

export function ProgressBar({ state }: ProgressBarProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (state === 'loading') {
      setVisible(true)
      return
    }
    if (state === 'success' || state === 'error') {
      const timer = setTimeout(() => setVisible(false), 700)
      return () => clearTimeout(timer)
    }
    setVisible(false)
  }, [state])

  if (state === 'idle' && !visible) return null

  const fillClass =
    state === 'loading' ? 'pb-fill--indeterminate' :
    state === 'success' ? 'pb-fill--complete' :
    state === 'error'   ? 'pb-fill--error' : ''

  const fillBg =
    state === 'error'
      ? t.color.error.solid
      : `linear-gradient(90deg, ${t.color.brand[600]}, ${t.color.brand[400]})`

  return (
    <div
      role="status"
      aria-label={state === 'loading' ? 'Autenticando…' : undefined}
      aria-busy={state === 'loading'}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: t.color.neutral[100],
        overflow: 'hidden',
        opacity: visible ? 1 : 0,
        transition: `opacity ${t.animation.duration.slow} ${t.animation.easing.easeOut}`,
        zIndex: t.zIndex.base,
      }}
    >
      <div
        className={fillClass}
        style={{ height: '100%', background: fillBg }}
      />
    </div>
  )
}
