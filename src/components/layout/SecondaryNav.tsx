import { useState, useEffect, type MouseEvent } from 'react'
import { Icon } from '../ui/Icon'
import type { NavModule, NavSubItem, NavGroup } from '../../data/menuData'
import { useTheme } from '../../context/ThemeContext'
import { useFavorites } from '../../context/FavoritesContext'
import { IconButton } from '../ui/IconButton'
import { Tooltip } from '../ui/Tooltip'
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
  const icon = item.icon
  const hasChildren = item.children && item.children.length > 0
  const hasActiveChild = hasChildren && item.children!.some(c => c.id === activeItemId)
  const [expanded, setExpanded] = useState(hasActiveChild)
  const [hovered, setHovered] = useState(false)

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation()
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
          <Icon name={icon} size={14} color={isActive && !hasChildren ? colors.accent.default : colors.fg.subtle} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
        </span>
        {hasChildren && (
          <Icon name="chevron-right"
            size={10}
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
        <span
          onClick={(e) => e.stopPropagation()}
          style={{ position: 'absolute', right: 2, top: '50%', transform: 'translateY(-50%)' }}
        >
          <IconButton
            icon={
              <Icon
                name="star"
                size={12}
                color={favorited ? t.color.feedback.warning.solid : undefined}
                filled={favorited}
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
            const childIcon = child.icon
            const isChildActive = activeItemId === child.id
            return (
              <button
                key={child.id}
                className={`nav-sub-btn ${isChildActive ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); onChildClick(child.id) }}
                style={{ display: 'flex', alignItems: 'center', gap: t.space[1] + 3, paddingLeft: 22 }}
              >
                <Icon name={childIcon} size={13} color={isChildActive ? colors.accent.default : colors.fg.subtle} />
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
        onClick={(e) => { e.stopPropagation(); onToggle() }}
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
        <Icon name="chevron-right"
          size={11}
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

function collectAllItems(module: NavModule): NavSubItem[] {
  return [
    ...(module.flatItems ?? []),
    ...(module.groups?.flatMap((g) => g.items) ?? []),
  ]
}

function CollapsedIconList({
  module,
  activeItemId,
  onItemClick,
}: {
  module: NavModule
  activeItemId: string | null
  onItemClick: (id: string) => void
}) {
  const items = collectAllItems(module)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      {items.map((item) => {
        const icon = item.icon
        const hasActiveChild = item.children?.some((c) => c.id === activeItemId)
        const isActive = activeItemId === item.id || hasActiveChild
        const targetId = item.children?.length ? item.children[0].id : item.id

        return (
          <Tooltip key={item.id} label={item.label}>
            <button
              className={`nav-icon-btn ${isActive ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); onItemClick(targetId) }}
              aria-label={item.label}
            >
              <Icon name={icon} size={16} />
            </button>
          </Tooltip>
        )
      })}
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
  const [collapsed, setCollapsed] = useState(false)

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
  const w = collapsed ? 56 : 224

  return (
    <div
      onClick={() => setCollapsed((c) => !c)}
      style={{
        width: w,
        minWidth: w,
        background: colors.bg.surface,
        borderRadius: t.radius.xl,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'width 0.2s ease, min-width 0.2s ease, background 0.2s',
        cursor: 'default',
      }}
    >
      <div className="nav-scroll" style={{ flex: 1, overflowY: 'auto', padding: '8px 8px 8px' }}>
        {collapsed ? (
          <CollapsedIconList module={module} activeItemId={activeItemId} onItemClick={onItemClick} />
        ) : (
          <>
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
          </>
        )}
      </div>

      {/* Recolher/expandir segundo nível */}
      <div
        style={{
          display: 'flex',
          justifyContent: collapsed ? 'center' : 'flex-end',
          padding: `${t.space[1]}px ${t.space[2]}px ${t.space[2]}px`,
          flexShrink: 0,
        }}
      >
        <Tooltip label={collapsed ? 'Expandir menu' : 'Recolher menu'}>
          <button
            onClick={(e) => { e.stopPropagation(); setCollapsed((c) => !c) }}
            aria-label={collapsed ? 'Expandir segundo nível do menu' : 'Recolher segundo nível do menu'}
            style={{
              width: 24,
              height: 24,
              borderRadius: t.radius.full,
              border: `1px solid ${colors.border.default}`,
              background: colors.bg.surface,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.fg.subtle,
              flexShrink: 0,
              transition: `background ${t.transition.fast}, color ${t.transition.fast}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.nav.itemHover
              e.currentTarget.style.color = colors.nav.textActive
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.bg.surface
              e.currentTarget.style.color = colors.fg.subtle
            }}
          >
            {collapsed ? <Icon name="chevron-right" size={14} /> : <Icon name="chevron-left" size={14} />}
          </button>
        </Tooltip>
      </div>
    </div>
  )
}
