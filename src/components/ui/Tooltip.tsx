import { useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { t } from '../../design/tokens'

interface TooltipProps {
  label: string
  children: React.ReactElement
}

const TOOLTIP_BG = t.color.neutral[800]

export function Tooltip({ label, children }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const wrapperRef = useRef<HTMLDivElement>(null)

  const show = useCallback(() => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect()
      setPos({
        top: rect.top + rect.height / 2,
        left: rect.right + t.space[2] + 2,
      })
    }
    setVisible(true)
  }, [])

  const hide = useCallback(() => setVisible(false), [])

  return (
    <div
      ref={wrapperRef}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      style={{ display: 'flex', justifyContent: 'center' }}
    >
      {children}

      {visible &&
        createPortal(
          <div
            role="tooltip"
            style={{
              position: 'fixed',
              top: pos.top,
              left: pos.left,
              transform: 'translateY(-50%)',
              background: TOOLTIP_BG,
              color: t.color.neutral[0],
              fontSize: t.font.size.sm,
              fontFamily: t.font.family.sans,
              fontWeight: t.font.weight.medium,
              letterSpacing: '0.1px',
              padding: `${t.space[1] + 2}px ${t.space[3] - 1}px`,
              borderRadius: t.radius.DEFAULT,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: t.zIndex.toast,
              boxShadow: t.shadow.lg,
            }}
          >
            {/* Arrow */}
            <div
              style={{
                position: 'absolute',
                right: '100%',
                top: '50%',
                transform: 'translateY(-50%)',
                width: 0,
                height: 0,
                borderTop: '5px solid transparent',
                borderBottom: '5px solid transparent',
                borderRight: `5px solid ${TOOLTIP_BG}`,
              }}
            />
            {label}
          </div>,
          document.body
        )}
    </div>
  )
}
