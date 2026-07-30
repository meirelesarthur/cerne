import React, { createContext, useState, useCallback, useContext, useEffect, useRef, type ReactNode } from 'react'
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

export interface ShowToastOptions {
  type?:     ToastType
  duration?: number
  action?:   ToastAction
}

interface ToastController {
  toasts: ToastItem[]
  show: (
    message: string,
    typeOrOptions?: ToastType | ShowToastOptions,
    duration?: number,
  ) => void
  dismiss: (id: number) => void
}

const ToastContext = createContext<ToastController | null>(null)

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
  const [paused, setPaused] = useState(false)
  const reduced = usePrefersReducedMotion()
  const { bg, Icon } = TYPE_CONFIG[toast.type]
  const duration = toast.duration ?? 4000
  // Erros exigem dismiss manual — sem auto-close (WCAG 2.2.1/2.2.2).
  const autoCloses = toast.type !== 'error'

  const timerRef     = useRef<ReturnType<typeof setTimeout> | null>(null)
  const remainingRef = useRef(duration)
  const startedAtRef = useRef(0)

  const dismiss = useCallback(() => {
    setExiting(true)
    setTimeout(() => onDismiss(toast.id), parseInt(t.animation.duration.normal))
  }, [toast.id, onDismiss])

  const handleAction = useCallback(() => {
    toast.action?.onClick()
    dismiss()
  }, [toast.action, dismiss])

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startTimer = useCallback((ms: number) => {
    clearTimer()
    startedAtRef.current = Date.now()
    timerRef.current = setTimeout(dismiss, ms)
  }, [clearTimer, dismiss])

  // Agenda (ou reagenda) o auto-close quando duration muda; toasts de erro nunca agendam.
  useEffect(() => {
    if (!autoCloses) return
    remainingRef.current = duration
    startTimer(duration)
    return clearTimer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, autoCloses])

  // Pausa/retoma o timer no hover/focus — dá tempo do usuário reagir (ex.: "Desfazer").
  const handlePause = useCallback(() => {
    if (!autoCloses || timerRef.current === null) return
    clearTimer()
    const elapsed = Date.now() - startedAtRef.current
    remainingRef.current = Math.max(remainingRef.current - elapsed, 0)
    setPaused(true)
  }, [autoCloses, clearTimer])

  const handleResume = useCallback(() => {
    if (!autoCloses) return
    setPaused(false)
    startTimer(remainingRef.current)
  }, [autoCloses, startTimer])

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      onMouseEnter={handlePause}
      onMouseLeave={handleResume}
      onFocus={handlePause}
      onBlur={handleResume}
      style={{
        display:      'flex',
        flexDirection:'column',
        background:   bg,
        color:        t.color.neutral[0],
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
        <div
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            width:          t.size.iconBtn.sm,
            height:         t.size.iconBtn.sm,
            borderRadius:   t.radius.sm,
            background:     'rgba(255,255,255,0.18)',
            flexShrink:     0,
          }}
        >
          <Icon size={t.icon.sm} />
        </div>
        <span style={{ flex: 1, lineHeight: t.font.lineHeight.snug }}>{toast.message}</span>
        {toast.action && (
          <button
            onClick={handleAction}
            className="gb-focusable"
            style={{
              background:   'rgba(255,255,255,0.16)',
              border:       '1px solid rgba(255,255,255,0.4)',
              borderRadius: t.radius.full,
              cursor:       'pointer',
              padding:      `${t.space[1]}px ${t.space[3]}px`,
              color:        t.color.neutral[0],
              fontSize:     t.font.size.xs,
              fontWeight:   t.font.weight.semibold,
              fontFamily:   t.font.family.sans,
              flexShrink:   0,
              lineHeight:   1,
              whiteSpace:   'nowrap',
              transition:   `background ${t.transition.fast}`,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.3)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.16)' }}
          >
            {toast.action.label}
          </button>
        )}
        <button
          onClick={dismiss}
          aria-label="Fechar notificação"
          className="gb-focusable"
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            background:     'none',
            border:         'none',
            cursor:         'pointer',
            width:          t.size.iconBtn.sm,
            height:         t.size.iconBtn.sm,
            color:          'rgba(255,255,255,0.7)',
            borderRadius:   t.radius.sm,
            flexShrink:     0,
            lineHeight:     1,
          }}
        >
          <X size={t.icon.xs} />
        </button>
      </div>

      {/* Barra de progresso — countdown do auto-close, sempre visível quando aplicável */}
      {!reduced && autoCloses && (
        <div style={{ height: 3, background: 'rgba(255,255,255,0.2)', position: 'relative' }}>
          <div
            style={{
              position:        'absolute',
              inset:           0,
              background:      'rgba(255,255,255,0.6)',
              transformOrigin: 'left center',
              animation:       `gb-toast-progress ${duration}ms linear forwards`,
              animationPlayState: paused ? 'paused' : 'running',
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

function ToastViewport({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null
  return (
    <div
      aria-label="Notificações"
      style={{
        position:      'fixed',
        top:           t.space[4],  // 16px
        right:         t.space[4],  // 16px
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

/**
 * Compatibilidade com telas e stories que ainda renderizam o container local.
 * Dentro de `ToastProvider`, o viewport global já é a única saída visual e os
 * containers locais não renderizam para impedir notificações duplicadas.
 */
export function ToastContainer(props: ToastContainerProps) {
  const globalController = useContext(ToastContext)
  if (globalController) return null
  return <ToastViewport {...props} />
}

// ─── Hook + provider global ───────────────────────────────────────────────────

function useToastController(): ToastController {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(0)

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
    nextId.current += 1
    const id = nextId.current
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

export function ToastProvider({ children }: { children: ReactNode }) {
  const controller = useToastController()

  return (
    <ToastContext.Provider value={controller}>
      {children}
      <ToastViewport toasts={controller.toasts} onDismiss={controller.dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast(): ToastController {
  const globalController = useContext(ToastContext)
  const localController = useToastController()
  return globalController ?? localController
}
