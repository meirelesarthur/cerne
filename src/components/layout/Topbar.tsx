import { Bell, Search, ChevronRight } from 'lucide-react'
import type { NavModule } from '../../data/menuData'
import { useTheme } from '../../context/ThemeContext'
import { t } from '../../design/tokens'

interface TopbarProps {
  expandedModule?: NavModule
  activeItemId: string | null
}

export default function Topbar({ expandedModule, activeItemId }: TopbarProps) {
  const { colors } = useTheme()

  const activeItem =
    expandedModule && activeItemId
      ? [
          ...(expandedModule.flatItems ?? []),
          ...(expandedModule.groups?.flatMap((g) => g.items) ?? []),
        ].find((i) => i.id === activeItemId)
      : null

  return (
    <div
      style={{
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `0 ${t.space[3]}px`,
        flexShrink: 0,
        background: 'transparent',
      }}
    >
      {/* Breadcrumb */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          fontFamily: t.font.family.sans,
          fontWeight: t.font.weight.normal,
          fontSize: t.font.size.sm,
          color: colors.textPrimary,
        }}
      >
        <span style={{ color: colors.textSecondary }}>Início</span>
        {expandedModule && (
          <>
            <ChevronRight size={13} style={{ color: colors.border, flexShrink: 0 }} />
            <span style={{ color: activeItem ? colors.textSecondary : colors.textPrimary }}>
              {expandedModule.label}
            </span>
          </>
        )}
        {activeItem && (
          <>
            <ChevronRight size={13} style={{ color: colors.border, flexShrink: 0 }} />
            <span style={{ color: colors.textPrimary, fontWeight: 400 }}>{activeItem.label}</span>
          </>
        )}
      </nav>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {/* Search */}
        <button
          style={{
            height: 32,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: `0 ${t.space[3]}px`,
            borderRadius: t.radius.DEFAULT,
            border: `1px solid ${colors.border}`,
            background: colors.surfaceBg,
            cursor: 'pointer',
            color: colors.textMuted,
            fontSize: t.font.size.sm,
            fontFamily: t.font.family.sans,
            transition: 'background 0.15s',
          }}
        >
          <Search size={13} />
          <span>Buscar...</span>
          <kbd
            style={{
              fontSize: t.font.size.xs - 1, // ~10px (abaixo do mínimo do token)
              background: colors.surfaceSubtle,
              border: `1px solid ${colors.border}`,
              borderRadius: t.radius.sm,
              padding: '1px 4px',
              color: colors.textMuted,
              fontFamily: 'monospace',
            }}
          >
            ⌘K
          </kbd>
        </button>

        {/* Notifications */}
        <button
          style={{
            position: 'relative',
            width: 34,
            height: 34,
            borderRadius: t.radius.DEFAULT,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.textSecondary,
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = colors.navItemHover }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        >
          <Bell size={16} />
          <span
            style={{
              position: 'absolute',
              top: 5,
              right: 5,
              background: t.color.notification,
              color: 'white',
              borderRadius: t.radius.full,
              width: 14,
              height: 14,
              fontSize: t.font.size.xs - 3, // ~8px (badge de notificação, abaixo do mínimo do token)
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: t.font.weight.bold,
            }}
          >
            3
          </span>
        </button>

        {/* Avatar */}
        <button
          style={{
            width: 34,
            height: 34,
            borderRadius: t.radius.full,
            background: `linear-gradient(135deg, ${colors.brand}, ${t.color.brand[300]})`,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: t.font.size.sm,
            fontWeight: t.font.weight.semibold,
            letterSpacing: '0.3px',
          }}
          title="Silvio Ventura"
        >
          SV
        </button>
      </div>
    </div>
  )
}
