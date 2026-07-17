import { useState, useEffect } from 'react'
import { ChevronRight, Star } from 'lucide-react'
import type { NavModule, NavSubItem, NavGroup } from '../../data/menuData'
import { useTheme } from '../../context/ThemeContext'
import { useFavorites } from '../../context/FavoritesContext'
import { IconButton } from '../ui/IconButton'
import { t } from '../../design/tokens'

// ─── sub-components ──────────────────────────────────────────────────────────

function NavHeader({ module }: { module: NavModule }) {
  const { colors } = useTheme()
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: `6px 10px 6px ${t.space[1]}px`,
      }}
    >
      <span
        style={{
          fontSize: t.font.size['2xs'],
          fontWeight: t.font.weight.medium,
          color: colors.fg.subtle,
          fontFamily: t.font.family.sans,
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
        }}
      >
        {module.label}
      </span>
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
  const { isFavorite, toggleFavorite } = useFavorites()
  const Icon = item.icon
  const hasChildren = item.children && item.children.length > 0
  const hasActiveChild = hasChildren && item.children!.some(c => c.id === activeItemId)
  const [expanded, setExpanded] = useState(hasActiveChild)
  const [hovered, setHovered] = useState(false)

  const handleClick = () => {
    if (hasChildren) {
      setExpanded(prev => !prev)
    } else {
      onClick()
    }
  }

  const favorited = !hasChildren && isFavorite(item.id)
  const showStar = !hasChildren && (hovered || favorited)

  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        className={`nav-sub-btn ${isActive && !hasChildren ? 'active' : ''}`}
        onClick={handleClick}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: t.space[1] + 2, paddingRight: !hasChildren ? 28 : undefined }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: t.space[1] + 3, minWidth: 0 }}>
          <Icon size={14} strokeWidth={2} style={{ flexShrink: 0, color: isActive && !hasChildren ? colors.accent.default : colors.fg.subtle }} aria-hidden="true" />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
        </span>
        {hasChildren && (
          <ChevronRight
            size={10}
            strokeWidth={2.2}
            style={{
              flexShrink: 0,
              transform: expanded ? 'rotate(90deg)' : 'none',
              transition: 'transform 0.15s ease',
              color: colors.fg.subtle,
              marginLeft: 4,
            }}
          />
        )}
      </button>
      {showStar && (
        <span style={{ position: 'absolute', right: 2, top: '50%', transform: 'translateY(-50%)' }}>
          <IconButton
            icon={
              <Star
                size={12}
                color={favorited ? t.color.feedback.warning.solid : undefined}
                fill={favorited ? t.color.feedback.warning.solid : 'none'}
              />
            }
            aria-label={favorited ? `Remover ${item.label} dos favoritos` : `Adicionar ${item.label} aos favoritos`}
            size="xs"
            onClick={() => toggleFavorite(item.id)}
          />
        </span>
      )}
      {expanded && hasChildren && (
        <div style={{ paddingBottom: 2 }}>
          {item.children!.map(child => {
            const ChildIcon = child.icon
            const isChildActive = activeItemId === child.id
            return (
              <button
                key={child.id}
                className={`nav-sub-btn ${isChildActive ? 'active' : ''}`}
                onClick={() => onChildClick(child.id)}
                style={{ display: 'flex', alignItems: 'center', gap: t.space[1] + 3, paddingLeft: 22 }}
              >
                <ChildIcon size={13} strokeWidth={2} style={{ flexShrink: 0, color: isChildActive ? colors.accent.default : colors.fg.subtle }} aria-hidden="true" />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{child.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function NavGroupSection({
  group,
  open,
  activeItemId,
  onToggle,
  onItemClick,
}: {
  group: NavGroup
  open: boolean
  activeItemId: string | null
  onToggle: () => void
  onItemClick: (id: string) => void
}) {
  const { colors } = useTheme()

  return (
    <div style={{ marginBottom: 4 }}>
      {/* Divisão/contexto — apenas rótulo (sem ícone), permanece colapsável */}
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: t.space[1],
          fontSize: t.font.size['2xs'],
          fontWeight: 500,
          color: colors.fg.subtle,
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          padding: `6px 10px 6px ${t.space[1]}px`,
          fontFamily: t.font.family.sans,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          borderRadius: t.radius.md,
          transition: 'background 0.1s, color 0.15s',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = colors.nav.itemHover }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
      >
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

function computeOpenGroup(module: NavModule, activeItemId: string | null): string | null {
  const match = module.groups?.find((g) =>
    g.items.some((i) => i.id === activeItemId || i.children?.some((c) => c.id === activeItemId))
  )
  return match?.id ?? null
}

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
  const [openGroupId, setOpenGroupId] = useState<string | null>(() => computeOpenGroup(module, activeItemId))

  // Recalcula apenas na troca de módulo — preserva o grupo aberto manualmente
  // quando o usuário apenas seleciona outro item dentro do mesmo módulo.
  useEffect(() => {
    setOpenGroupId(computeOpenGroup(module, activeItemId))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [module.id])

  // Acordeão: abrir um grupo fecha qualquer outro que estivesse aberto.
  const toggleGroup = (id: string) => {
    setOpenGroupId((prev) => (prev === id ? null : id))
  }

  const { colors } = useTheme()

  return (
    <div
      style={{
        width: 224,
        minWidth: 224,
        background: colors.bg.surface,
        borderRadius: t.radius.xl,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'background 0.2s',
      }}
    >
      <div className="nav-scroll" style={{ flex: 1, overflowY: 'auto', padding: '8px 8px 8px' }}>
        {module.flatItems && <NavHeader module={module} />}
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
              open={openGroupId === group.id}
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
