import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { useFocusTrap } from './useFocusTrap'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

type ModalSize = 'sm' | 'md' | 'lg'

interface ModalProps {
  open:            boolean
  onClose:         () => void
  title?:          string
  subtitle?:       string
  size?:           ModalSize
  children:        React.ReactNode
  footer?:         React.ReactNode
  closeOnOverlay?: boolean
}

const sizeWidth: Record<ModalSize, number> = {
  sm: 400,
  md: 520,
  lg: 640,
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  size           = 'md',
  children,
  footer,
  closeOnOverlay = true,
}: ModalProps) {
  const { colors }      = useTheme()
  const reducedMotion   = usePrefersReducedMotion()
  // Prende o foco do teclado dentro do dialog enquanto aberto (e restaura ao fechar).
  const dialogRef       = useFocusTrap<HTMLDivElement>(open)

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Prevent scroll on body while open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [open])

  return (
    <>
      {/* Overlay */}
      <div
        aria-hidden="true"
        onClick={closeOnOverlay ? onClose : undefined}
        style={{
          position:      'fixed',
          inset:         0,
          background:    t.color.overlay.modal,
          zIndex:        t.zIndex.overlay,
          opacity:       open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition:    reducedMotion ? 'none' : `opacity ${t.animation.duration.normal} ${t.animation.easing.easeOut}`,
        }}
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        ref={dialogRef}
        tabIndex={-1}
        style={{
          position:      'fixed',
          inset:         0,
          display:       'flex',
          alignItems:    'center',
          justifyContent:'center',
          zIndex:        t.zIndex.drawer,
          pointerEvents: open ? 'auto' : 'none',
          outline:       'none',
        }}
      >
        <div
          style={{
            width:        sizeWidth[size],
            maxWidth:     `calc(100vw - ${t.space[8]}px)`,
            maxHeight:    `calc(100vh - ${t.space[8]}px)`,
            background:   colors.surfaceBg,
            borderRadius: t.radius.modal,
            boxShadow:    t.shadow.modal,
            border:       `1px solid ${colors.border}`,
            display:      'flex',
            flexDirection:'column',
            overflow:     'hidden',
            opacity:      open ? 1 : 0,
            transform:    open ? 'translateY(0) scale(1)' : 'translateY(-12px) scale(0.97)',
            transition:   reducedMotion ? 'none' : `opacity ${t.animation.duration.normal} ${t.animation.easing.easeOut}, transform ${t.animation.duration.normal} ${t.animation.easing.easeOut}`,
          }}
        >
          {/* Header */}
          {(title || subtitle) && (
            <div
              style={{
                display:        'flex',
                alignItems:     'flex-start',
                justifyContent: 'space-between',
                padding:        `${t.space[4]}px ${t.space[5]}px`,
                borderBottom:   `1px solid ${colors.border}`,
                gap:            t.space[3],
              }}
            >
              <div>
                {title && (
                  <h2
                    id="modal-title"
                    style={{
                      margin:     0,
                      fontSize:   t.font.size.md,
                      fontWeight: t.font.weight.semibold,
                      color:      colors.textPrimary,
                      fontFamily: t.font.family.sans,
                      lineHeight: t.font.lineHeight.snug,
                    }}
                  >
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p
                    style={{
                      margin:     `${t.space[1]}px 0 0`,
                      fontSize:   t.font.size.sm,
                      color:      colors.textMuted,
                      fontFamily: t.font.family.sans,
                    }}
                  >
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                type="button"
                className="gb-focusable"
                onClick={onClose}
                aria-label="Fechar modal"
                style={{
                  background:   'none',
                  border:       'none',
                  cursor:       'pointer',
                  color:        colors.textMuted,
                  display:      'flex',
                  alignItems:   'center',
                  padding:      t.space[1],
                  borderRadius: t.radius.md,
                  flexShrink:   0,
                  transition:   `background ${t.transition.fast}`,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = colors.surfaceSubtle }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Content */}
          <div
            style={{
              flex:      1,
              overflowY: 'auto',
              padding:   t.space[5],
            }}
          >
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div
              style={{
                padding:     `${t.space[4]}px ${t.space[5]}px`,
                borderTop:   `1px solid ${colors.border}`,
                display:     'flex',
                gap:         t.space[2],
                alignItems:  'center',
                justifyContent: 'flex-end',
              }}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
