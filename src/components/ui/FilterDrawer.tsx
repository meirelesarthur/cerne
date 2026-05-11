import React, { useEffect } from 'react'
import { X, SlidersHorizontal } from 'lucide-react'

interface FilterDrawerProps {
  open: boolean
  onClose: () => void
  onClear: () => void
  title?: string
  children: React.ReactNode
  activeCount?: number
}

export function FilterDrawer({
  open,
  onClose,
  onClear,
  title = 'Filtros',
  children,
  activeCount = 0,
}: FilterDrawerProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.18)',
          zIndex: 200,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.2s',
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width: 320,
          background: 'white',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.10)',
          zIndex: 201,
          display: 'flex',
          flexDirection: 'column',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SlidersHorizontal size={15} color="#059669" />
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#171717',
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {title}
            </span>
            {activeCount > 0 && (
              <span
                style={{
                  background: '#059669',
                  color: 'white',
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '1px 7px',
                  borderRadius: 9999,
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                {activeCount}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#9ca3af',
              display: 'flex',
              alignItems: 'center',
              padding: 4,
              borderRadius: 6,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f5f5f5' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          {children}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid #f0f0f0',
            display: 'flex',
            gap: 8,
          }}
        >
          <button
            type="button"
            onClick={onClear}
            style={{
              flex: 1,
              height: 38,
              background: 'white',
              border: '1px solid #e5e5e5',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              color: '#616161',
              cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'white' }}
          >
            Limpar
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              height: 38,
              background: '#059669',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: 'white',
              cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#047857' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#059669' }}
          >
            Aplicar
          </button>
        </div>
      </div>
    </>
  )
}
