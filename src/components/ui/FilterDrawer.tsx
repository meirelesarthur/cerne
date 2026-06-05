import React, { useEffect } from 'react'
import { X, SlidersHorizontal } from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

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
  const { colors } = useTheme()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: t.color.overlay.drawer,
          zIndex: t.zIndex.overlay,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: `opacity ${t.transition.smooth}`,
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width: t.size.drawer,
          background: colors.surfaceBg,
          boxShadow: t.shadow.lg,
          zIndex: t.zIndex.drawer,
          display: 'flex',
          flexDirection: 'column',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: `transform ${t.transition.drawer}`,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${t.space[4]}px ${t.space[5]}px`,
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
            <SlidersHorizontal size={15} color={t.color.brand[600]} />
            <span
              style={{
                fontSize: t.font.size.md,
                fontWeight: t.font.weight.semibold,
                color: colors.textPrimary,
                fontFamily: t.font.family.sans,
              }}
            >
              {title}
            </span>
            {activeCount > 0 && (
              <span
                style={{
                  background: t.color.brand[600],
                  color: t.color.neutral[0],
                  fontSize: t.font.size.xs,
                  fontWeight: t.font.weight.bold,
                  padding: `1px ${t.space[1] + t.space[1] / 2}px`,
                  borderRadius: t.radius.full,
                  fontFamily: t.font.family.sans,
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
              color: colors.textMuted,
              display: 'flex',
              alignItems: 'center',
              padding: t.space[1],
              borderRadius: t.radius.md,
              transition: `background ${t.transition.fast}`,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = colors.surfaceSubtle }}
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
            padding: t.space[5],
            display: 'flex',
            flexDirection: 'column',
            gap: t.space[5],
          }}
        >
          {children}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: `${t.space[3] + t.space[1] / 2}px ${t.space[5]}px`,
            borderTop: `1px solid ${colors.border}`,
            display: 'flex',
            gap: t.space[2],
          }}
        >
          <button
            type="button"
            onClick={onClear}
            style={{
              flex: 1,
              height: 38,
              background: colors.surfaceBg,
              border: `1px solid ${colors.border}`,
              borderRadius: t.radius.DEFAULT,
              fontSize: t.font.size.base,
              fontWeight: t.font.weight.medium,
              color: colors.textSecondary,
              cursor: 'pointer',
              fontFamily: t.font.family.sans,
              transition: `background ${t.transition.fast}`,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = colors.surfaceSubtle }}
            onMouseLeave={(e) => { e.currentTarget.style.background = colors.surfaceBg }}
          >
            Limpar
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              height: 38,
              background: t.color.brand[600],
              border: 'none',
              borderRadius: t.radius.DEFAULT,
              fontSize: t.font.size.base,
              fontWeight: t.font.weight.semibold,
              color: t.color.neutral[0],
              cursor: 'pointer',
              fontFamily: t.font.family.sans,
              transition: `background ${t.transition.fast}`,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = t.color.brand[700] }}
            onMouseLeave={(e) => { e.currentTarget.style.background = t.color.brand[600] }}
          >
            Aplicar
          </button>
        </div>
      </div>
    </>
  )
}
