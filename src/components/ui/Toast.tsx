import React, { useState, useCallback, useEffect } from 'react'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { t } from '../../design/tokens'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastItem {
  id:       number
  message:  string
  type:     ToastType
  duration?: number
}

// ─── Design config ────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<ToastType, { bg: string; Icon: React.ElementType }> = {
  success: { bg: t.color.success.solid, Icon: CheckCircle2 },
  error:   { bg: t.color.error.solid,   Icon: XCircle      },
  info:    { bg: t.color.info.solid,    Icon: Info          },
  warning: { bg: t.color.warning.solid, Icon: AlertTriangle },
}

// ─── Keyframe injection (once) ────────────────────────────────────────────────

let _stylesInjected = false
function injectStyles() {
  if (_stylesInjected || typeof document === 'undefined') return
  if (document.getElementById('gb-toast-styles')) { _stylesInjected = true; return }
  const el = document.createElement('style')
  el.id = 'gb-toast-styles'
  el.textContent = `
    @keyframes gb-toast-in  { from { opacity:0; transform:translateX(12px); } to { opacity:1; transform:translateX(0); } }
    @keyframes gb-toast-out { from { opacity:1; transform:translateX(0);    } to { opacity:0; transform:translateX(12px); } }
    @media (prefers-reduced-motion: reduce) {
      @keyframes gb-toast-in  { from { opacity:0; } to { opacity:1; } }
      @keyframes gb-toast-out { from { opacity:1; } to { opacity:0; } }
    }
  `
  document.head.appendChild(el)
  _stylesInjected = true
}

// ─── Single toast item ────────────────────────────────────────────────────────

function ToastRow({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: number) => void }) {
  injectStyles()
  const [exiting, setExiting] = useState(false)
  const { bg, Icon } = TYPE_CONFIG[toast.type]

  const dismiss = useCallback(() => {
    setExiting(true)
    setTimeout(() => onDismiss(toast.id), parseInt(t.animation.duration.normal))
  }, [toast.id, onDismiss])

  useEffect(() => {
    const ms = toast.duration ?? 4000
    const timer = setTimeout(dismiss, ms)
    return () => clearTimeout(timer)
  }, [dismiss, toast.duration])

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display:      'flex',
        alignItems:   'center',
        gap:          t.space[2],
        background:   bg,
        color:        '#fff',
        padding:      `${t.space[2] + 2}px ${t.space[3]}px`,
        borderRadius: t.radius.lg,
        fontSize:     t.font.size.base,
        fontWeight:   t.font.weight.medium,
        fontFamily:   t.font.family.sans,
        boxShadow:    t.shadow.lg,
        pointerEvents:'auto',
        minWidth:     220,
        maxWidth:     360,
        animation:    exiting
          ? `gb-toast-out ${t.animation.duration.normal} ${t.animation.easing.easeIn} forwards`
          : `gb-toast-in  ${t.animation.duration.fast}   ${t.animation.easing.easeOut}`,
      }}
    >
      <Icon size={15} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1, lineHeight: t.font.lineHeight.snug }}>{toast.message}</span>
      <button
        onClick={dismiss}
        aria-label="Fechar notificação"
        style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          background:     'none',
          border:         'none',
          cursor:         'pointer',
          padding:        2,
          color:          'rgba(255,255,255,0.7)',
          borderRadius:   t.radius.sm,
          flexShrink:     0,
          lineHeight:     1,
        }}
      >
        <X size={13} />
      </button>
    </div>
  )
}

// ─── Container ────────────────────────────────────────────────────────────────

export interface ToastContainerProps {
  toasts:    ToastItem[]
  onDismiss: (id: number) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null
  return (
    <div
      style={{
        position:      'fixed',
        top:           72,          // below topbar (~56px) + 16px breathing room
        right:         t.space[6],  // 24px
        display:       'flex',
        flexDirection: 'column',
        gap:           t.space[2],
        zIndex:        t.zIndex.toast,
        pointerEvents: 'none',
      }}
    >
      {toasts.map(toast => (
        <ToastRow key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const show = useCallback((message: string, type: ToastType = 'success', duration?: number) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type, duration }])
  }, [])

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return { toasts, show, dismiss }
}
