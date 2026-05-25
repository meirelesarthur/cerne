import { Bell, Search, ChevronRight } from 'lucide-react'
import type { NavModule } from '../../data/menuData'
import { useTheme } from '../../context/ThemeContext'

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
        padding: '0 12px',
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
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 300,
          fontSize: 12,
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
            padding: '0 12px',
            borderRadius: 8,
            border: `1px solid ${colors.border}`,
            background: colors.surfaceBg,
            cursor: 'pointer',
            color: colors.textMuted,
            fontSize: 12,
            fontFamily: "'Outfit', sans-serif",
            transition: 'background 0.15s',
          }}
        >
          <Search size={13} />
          <span>Buscar...</span>
          <kbd
            style={{
              fontSize: 10,
              background: colors.surfaceSubtle,
              border: `1px solid ${colors.border}`,
              borderRadius: 4,
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
            borderRadius: 8,
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
              background: '#ff58ae',
              color: 'white',
              borderRadius: 9999,
              width: 14,
              height: 14,
              fontSize: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
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
            borderRadius: 9999,
            background: `linear-gradient(135deg, ${colors.brand}, #34d399)`,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 12,
            fontWeight: 600,
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
