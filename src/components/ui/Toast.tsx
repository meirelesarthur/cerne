import React, { useState, useCallback, useEffect, useRef } from 'react'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { t } from '../../design/tokens'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastAction {
  label:   string
  onClick: () => void
}

export interface ToastItem {
  id:       number
  message:  string
  type:     ToastType
  duration?: number
  action?:  ToastAction
}

// ─── Design config ────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<ToastType, { bg: string; Icon: React.ElementType }> = {
  success: { bg: t.color.feedback.success.solid, Icon: CheckCircle2 },
  error:   { bg: t.color.feedback.error.solid,   Icon: XCircle      },
  info:    { bg: t.color.feedback.info.solid,    Icon: Info          },
  warning: { bg: t.color.feedback.warning.solid, Icon: AlertTriangle },
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
    @keyframes gb-toast-progress { from { transform:scaleX(1); } to { transform:scaleX(0); } }
    @media (prefers-reduced-motion: reduce) {
      @keyframes gb-toast-in  { from { opacity:0; } to { opacity:1; } }
      @keyframes gb-toast-out { from { opacity:1; } to { opacity:0; } }
      @keyframes gb-toast-progress { from { transform:scaleX(1); } to { transform:scaleX(1); } }
    }
  `
  document.head.appendChild(el)
  _stylesInjected = true
}

// ─── Single toast item ────────────────────────────────────────────────────────

function ToastRow({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: number) => void }) {
  injectStyles()
  const [exiting, setExiting] = useState(false)
  const reduced = usePrefersReducedMotion()
  const { bg, Icon } = TYPE_CONFIG[toast.type]
  const duration = toast.duration ?? 4000

  const dismiss = useCallback(() => {
    setExiting(true)
    setTimeout(() => onDismiss(toast.id), parseInt(t.animation.duration.normal))
  }, [toast.id, onDismiss])

  const handleAction = useCallback(() => {
    toast.action?.onClick()
    dismiss()
  }, [toast.action, dismiss])

  useEffect(() => {
    const timer = setTimeout(dismiss, duration)
    return () => clearTimeout(timer)
  }, [dismiss, duration])

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display:      'flex',
        flexDirection:'column',
        background:   bg,
        color:        '#fff',
        borderRadius: t.radius.lg,
        fontSize:     t.font.size.base,
        fontWeight:   t.font.weight.medium,
        fontFamily:   t.font.family.sans,
        boxShadow:    t.shadow.lg,
        pointerEvents:'auto',
        minWidth:     220,
        maxWidth:     360,
        overflow:     'hidden',
        animation:    exiting
          ? `gb-toast-out ${t.animation.duration.normal} ${t.animation.easing.easeIn} forwards`
          : `gb-toast-in  ${t.animation.duration.fast}   ${t.animation.easing.easeOut}`,
      }}
    >
      {/* Main row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2], padding: `${t.space[2] + 2}px ${t.space[3]}px` }}>
        <Icon size={15} style={{ flexShrink: 0 }} />
        <span style={{ flex: 1, lineHeight: t.font.lineHeight.snug }}>{toast.message}</span>
        {toast.action && (
          <button
            onClick={handleAction}
            style={{
              background:   'rgba(255,255,255,0.18)',
              border:       '1px solid rgba(255,255,255,0.3)',
              borderRadius: t.radius.sm,
              cursor:       'pointer',
              padding:      `${t.space[1]}px ${t.space[2]}px`,
              color:        '#fff',
              fontSize:     t.font.size.xs,
              fontWeight:   t.font.weight.semibold,
              fontFamily:   t.font.family.sans,
              flexShrink:   0,
              lineHeight:   1,
              whiteSpace:   'nowrap',
            }}
          >
            {toast.action.label}
          </button>
        )}
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

      {/* Progress bar — only when action is present */}
      {toast.action && !reduced && (
        <div style={{ height: 3, background: 'rgba(255,255,255,0.2)', position: 'relative' }}>
          <div
            style={{
              position:       'absolute',
              inset:          0,
              background:     'rgba(255,255,255,0.6)',
              transformOrigin:'left center',
              animation:      `gb-toast-progress ${duration}ms linear forwards`,
            }}
          />
        </div>
      )}
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

export interface ShowToastOptions {
  type?:     ToastType
  duration?: number
  action?:   ToastAction
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  /**
   * show(message)                          — success, default duration
   * show(message, 'error')                 — typed, default duration (retrocompat)
   * show(message, 'info', 3000)            — typed + custom duration (retrocompat)
   * show(message, { type, duration, action }) — options object (new)
   */
  const show = useCallback((
    message: string,
    typeOrOptions: ToastType | ShowToastOptions = 'success',
    duration?: number,
  ) => {
    const id = Date.now()
    if (typeof typeOrOptions === 'string') {
      setToasts(prev => [...prev, { id, message, type: typeOrOptions, duration }])
    } else {
      const { type = 'success', duration: dur, action } = typeOrOptions
      setToasts(prev => [...prev, { id, message, type, duration: dur, action }])
    }
  }, [])

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return { toasts, show, dismiss }
}
