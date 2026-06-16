import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import type { NavModule, NavSubItem, NavGroup } from '../../data/menuData'
import { useTheme } from '../../context/ThemeContext'
import { t } from '../../design/tokens'

// ─── sub-components ──────────────────────────────────────────────────────────

function NavHeader({ module }: { module: NavModule }) {
  const { colors } = useTheme()
  const Icon = module.icon
  return (
    <div style={{ padding: `${t.space[2]}px ${t.space[2]}px 0`, flexShrink: 0 }}>
      <div
        style={{
          height: 44,
          background: colors.brandBg,
          borderRadius: t.radius.lg,
          display: 'flex',
          alignItems: 'center',
          gap: t.space[2],
          padding: `0 ${t.space[3]}px`,
          transition: 'background 0.2s',
        }}
      >
        <Icon size={16} strokeWidth={2} color={colors.brand} style={{ flexShrink: 0 }} aria-hidden="true" />
        <span
          style={{
            fontSize: t.font.size.md,
            fontWeight: t.font.weight.bold,
            color: colors.brand,
            fontFamily: "'Outfit', sans-serif",
            letterSpacing: '-0.1px',
          }}
        >
          {module.label}
        </span>
      </div>
    </div>
  )
}

function NavItem({
  item,
  isActive,
  activeItemId,
  onClick,
  onChildClick,
}: {
  item:          NavSubItem
  isActive:      boolean
  activeItemId:  string | null
  onClick:       () => void
  onChildClick:  (id: string) => void
}) {
  const { colors } = useTheme()
  const hasChildren = item.children && item.children.length > 0
  const hasActiveChild = hasChildren && item.children!.some(c => c.id === activeItemId)
  const [expanded, setExpanded] = useState(hasActiveChild)

  const handleClick = () => {
    if (hasChildren) {
      setExpanded(prev => !prev)
    } else {
      onClick()
    }
  }

  return (
    <div>
      <button
        className={`nav-sub-btn ${isActive && !hasChildren ? 'active' : ''}`}
        onClick={handleClick}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <span>{item.label}</span>
        {hasChildren && (
          <ChevronRight
            size={10}
            strokeWidth={2.2}
            style={{
              flexShrink: 0,
              transform: expanded ? 'rotate(90deg)' : 'none',
              transition: 'transform 0.15s ease',
              color: colors.textMuted,
              marginLeft: 4,
            }}
          />
        )}
      </button>
      {expanded && hasChildren && (
        <div style={{ paddingBottom: 2 }}>
          {item.children!.map(child => (
            <button
              key={child.id}
              className={`nav-sub-btn ${activeItemId === child.id ? 'active' : ''}`}
              onClick={() => onChildClick(child.id)}
              style={{ paddingLeft: 22 }}
            >
              {child.label}
            </button>
          ))}
        </div>
      )}
    </div>
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
  const { colors } = useTheme()

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
          fontWeight: anyOpen ? 500 : 600,
          color: anyOpen ? colors.textMuted : colors.textPrimary,
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          padding: '6px 10px',
          fontFamily: "'Outfit', sans-serif",
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          borderRadius: 6,
          transition: 'background 0.1s, color 0.15s',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = colors.navItemHover }}
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
              activeItemId={activeItemId}
              onClick={() => onItemClick(item.id)}
              onChildClick={onItemClick}
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
          activeItemId={activeItemId}
          onClick={() => onItemClick(item.id)}
          onChildClick={onItemClick}
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
}

export default function SecondaryNav({
  module,
  activeItemId,
  onItemClick,
}: SecondaryNavProps) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const initial = new Set<string>()
    module.groups?.forEach((g) => {
      const matches = g.items.some(
        (i) => i.id === activeItemId || i.children?.some((c) => c.id === activeItemId)
      )
      if (matches) initial.add(g.id)
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

  const { colors } = useTheme()

  return (
    <div
      style={{
        width: 224,
        minWidth: 224,
        background: colors.surfaceBg,
        borderRadius: 12,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'background 0.2s',
      }}
    >
      <NavHeader module={module} />

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
