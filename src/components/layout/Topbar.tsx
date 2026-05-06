import { Bell, Search, ChevronRight } from 'lucide-react'
import type { NavModule } from '../../data/menuData'

interface TopbarProps {
  expandedModule?: NavModule
  activeItemId: string | null
}

export default function Topbar({ expandedModule, activeItemId }: TopbarProps) {
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
          color: '#1a1a1a',
        }}
      >
        <span style={{ color: '#616161' }}>Início</span>
        {expandedModule && (
          <>
            <ChevronRight size={13} style={{ color: '#d4d4d4', flexShrink: 0 }} />
            <span style={{ color: activeItem ? '#616161' : '#1a1a1a' }}>{expandedModule.label}</span>
          </>
        )}
        {activeItem && (
          <>
            <ChevronRight size={13} style={{ color: '#d4d4d4', flexShrink: 0 }} />
            <span style={{ color: '#1a1a1a', fontWeight: 400 }}>{activeItem.label}</span>
          </>
        )}
      </nav>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* Search */}
        <button
          style={{
            height: 32,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '0 12px',
            borderRadius: 8,
            border: '1px solid #e5e5e5',
            background: 'white',
            cursor: 'pointer',
            color: '#9ca3af',
            fontSize: 12,
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          <Search size={13} />
          <span>Buscar...</span>
          <kbd
            style={{
              fontSize: 10,
              background: '#f5f5f5',
              border: '1px solid #e5e5e5',
              borderRadius: 4,
              padding: '1px 4px',
              color: '#9ca3af',
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
            color: '#616161',
          }}
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
            background: 'linear-gradient(135deg, #059669, #34d399)',
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
