import { useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'

interface TooltipProps {
  label: string
  children: React.ReactElement
}

export function Tooltip({ label, children }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const wrapperRef = useRef<HTMLDivElement>(null)

  const show = useCallback(() => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect()
      setPos({
        top: rect.top + rect.height / 2,
        left: rect.right + 10,
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
      style={{ display: 'flex', justifyContent: 'center' }}
    >
      {children}

      {visible &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              top: pos.top,
              left: pos.left,
              transform: 'translateY(-50%)',
              background: '#2a2a2a',
              color: '#ffffff',
              fontSize: 12,
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 500,
              letterSpacing: '0.1px',
              padding: '6px 11px',
              borderRadius: 8,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 9999,
              boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
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
                borderRight: '5px solid #2a2a2a',
              }}
            />
            {label}
          </div>,
          document.body
        )}
    </div>
  )
}
