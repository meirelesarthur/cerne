import { useState } from 'react'
import { PanelLeftClose, ChevronRight } from 'lucide-react'
import type { NavModule, NavSubItem, NavGroup } from '../../data/menuData'

// ─── sub-components ──────────────────────────────────────────────────────────

function NavHeader({ module, onClose }: { module: NavModule; onClose: () => void }) {
  const Icon = module.icon
  return (
    <div
      style={{
        height: 44,
        minHeight: 44,
        background: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon size={14} color="#525252" strokeWidth={1.8} />
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#292929',
            fontFamily: "'Outfit', sans-serif",
            letterSpacing: '-0.1px',
          }}
        >
          {module.label}
        </span>
      </div>

      <button
        onClick={onClose}
        title="Recolher menu"
        style={{
          width: 26,
          height: 26,
          borderRadius: 6,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#525252',
          transition: 'background 0.1s',
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.07)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
        }}
      >
        <PanelLeftClose size={14} strokeWidth={1.8} />
      </button>
    </div>
  )
}

function NavItem({
  item,
  isActive,
  onClick,
}: {
  item: NavSubItem
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      className={`nav-sub-btn ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      {item.label}
    </button>
  )
}

function NavGroupSection({
  group,
  open,
  anyOpen,
  activeItemId,
  onToggle,
  onItemClick,
}: {
  group: NavGroup
  open: boolean
  anyOpen: boolean
  activeItemId: string | null
  onToggle: () => void
  onItemClick: (id: string) => void
}) {
  const GroupIcon = group.icon

  return (
    <div style={{ marginBottom: 4 }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          fontSize: 10,
          fontWeight: 600,
          color: anyOpen ? '#9ca3af' : '#1a1a1a',
          fontWeight: anyOpen ? 500 : 400,
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          padding: '6px 10px',
          fontFamily: "'Outfit', sans-serif",
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          borderRadius: 6,
          transition: 'background 0.1s, color 0.15s, font-weight 0.15s',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(115,115,115,0.06)' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
      >
        <GroupIcon size={10} strokeWidth={2} style={{ flexShrink: 0 }} />
        <span style={{ flex: 1, textAlign: 'left' }}>{group.label}</span>
        <ChevronRight
          size={11}
          strokeWidth={2.2}
          style={{
            flexShrink: 0,
            transform: open ? 'rotate(90deg)' : 'none',
            transition: 'transform 0.15s ease',
          }}
        />
      </button>

      {open && (
        <div style={{ paddingBottom: 8 }}>
          {group.items.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              isActive={activeItemId === item.id}
              onClick={() => onItemClick(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function NavFlatList({
  items,
  activeItemId,
  onItemClick,
}: {
  items: NavSubItem[]
  activeItemId: string | null
  onItemClick: (id: string) => void
}) {
  return (
    <div>
      {items.map((item) => (
        <NavItem
          key={item.id}
          item={item}
          isActive={activeItemId === item.id}
          onClick={() => onItemClick(item.id)}
        />
      ))}
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

interface SecondaryNavProps {
  module: NavModule
  activeItemId: string | null
  onItemClick: (id: string) => void
  onClose: () => void
}

export default function SecondaryNav({
  module,
  activeItemId,
  onItemClick,
  onClose,
}: SecondaryNavProps) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const initial = new Set<string>()
    module.groups?.forEach((g) => {
      if (g.items.some((i) => i.id === activeItemId)) initial.add(g.id)
    })
    return initial
  })

  const anyOpen = openGroups.size > 0

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div
      style={{
        width: 224,
        minWidth: 224,
        background: 'white',
        borderRadius: 12,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <NavHeader module={module} onClose={onClose} />

      <div className="nav-scroll" style={{ flex: 1, overflowY: 'auto', padding: '8px 8px 8px' }}>
        {module.flatItems ? (
          <NavFlatList
            items={module.flatItems}
            activeItemId={activeItemId}
            onItemClick={onItemClick}
          />
        ) : (
          module.groups?.map((group) => (
            <NavGroupSection
              key={group.id}
              group={group}
              open={openGroups.has(group.id)}
              anyOpen={anyOpen}
              activeItemId={activeItemId}
              onToggle={() => toggleGroup(group.id)}
              onItemClick={onItemClick}
            />
          ))
        )}
      </div>
    </div>
  )
}
