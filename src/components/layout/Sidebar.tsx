import { Bell, Settings, ChevronRight, PanelLeftClose, Moon, Sun } from 'lucide-react'
import logoFull from '../../assets/Logo.svg'
import logoFullWhite from '../../assets/Logo-white.svg'
import logoMin from '../../assets/logo-min.svg'
import logoMinWhite from '../../assets/logo-min-white.svg'
import { Tooltip } from '../Tooltip'
import type { NavModule } from '../../data/menuData'
import { useTheme } from '../../context/ThemeContext'
import { t } from '../../design/tokens'

interface SidebarProps {
  modules: NavModule[]
  mode: 'full' | 'icon-only'
  activeModuleId: string
  expandedModuleId: string | null
  onModuleClick: (module: NavModule) => void
  onToggle: () => void
}

export default function Sidebar({
  modules,
  mode,
  activeModuleId,
  expandedModuleId,
  onModuleClick,
  onToggle,
}: SidebarProps) {
  const { colors, isGbMode, toggle } = useTheme()
  const isIconOnly = mode === 'icon-only'
  const w = isIconOnly ? 56 : 240

  return (
    <div
      onClick={onToggle}
      style={{
        width: w,
        minWidth: w,
        background: colors.sidebarBg,
        borderRadius: t.radius['2xl'],
        display: 'flex',
        flexDirection: 'column',
        padding: `${t.space[3]}px ${t.space[2]}px`,
        transition: 'width 0.2s ease, min-width 0.2s ease, background 0.2s ease',
        overflow: 'hidden',
        cursor: 'default',
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isIconOnly ? 'center' : 'space-between',
          paddingLeft: isIconOnly ? 0 : 8,
          paddingRight: isIconOnly ? 0 : 4,
          marginBottom: t.space[2],
          flexShrink: 0,
        }}
      >
        {isIconOnly
          ? <img src={isGbMode ? logoMinWhite : logoMin} alt="GB" style={{ height: 28, width: 'auto', pointerEvents: 'none' }} />
          : <>
              <img src={isGbMode ? logoFullWhite : logoFull} alt="GB Agritech" style={{ height: 28, width: 'auto', pointerEvents: 'none' }} />
              <button
                onClick={(e) => { e.stopPropagation(); onToggle() }}
                title="Recolher menu"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: t.radius.md,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.textMuted,
                  flexShrink: 0,
                  transition: 'background 0.1s, color 0.1s',
                }}
                onMouseEnter={(e) => {
                  const b = e.currentTarget
                  b.style.background = colors.navItemHover
                  b.style.color = colors.navTextActive
                }}
                onMouseLeave={(e) => {
                  const b = e.currentTarget
                  b.style.background = 'transparent'
                  b.style.color = colors.textMuted
                }}
              >
                <PanelLeftClose size={15} strokeWidth={1.8} />
              </button>
            </>
        }
      </div>

      {/* Navigation */}
      <div className="nav-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {modules.map((module) => {
          const Icon = module.icon
          const isActive = activeModuleId === module.id
          const isExpanded = expandedModuleId === module.id
          const highlighted = isActive || isExpanded

          if (isIconOnly) {
            // Icon-only: stop propagation para não expandir o sidebar ao clicar no ícone
            return (
              <Tooltip key={module.id} label={module.label}>
                <button
                  className={`nav-icon-btn ${isActive ? 'active' : ''} ${isExpanded ? 'expanded' : ''}`}
                  onClick={(e) => { e.stopPropagation(); onModuleClick(module) }}
                  style={{ marginBottom: 2 }}
                >
                  <Icon size={16} />
                </button>
              </Tooltip>
            )
          }

          // Full: sem stopPropagation → clique no item abre secondary nav + colapsa sidebar via root onClick
          return (
            <button
              key={module.id}
              className={`nav-module-btn ${highlighted ? (isExpanded ? 'expanded' : 'active') : ''}`}
              onClick={() => onModuleClick(module)}
              style={{ marginBottom: 2 }}
            >
              <Icon size={15} style={{ flexShrink: 0, minWidth: 15 }} />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {module.label}
              </span>
              {(module.groups || module.flatItems) && (
                <ChevronRight
                  size={13}
                  style={{
                    flexShrink: 0,
                    color: highlighted ? colors.brand : colors.textMuted,
                    transform: isExpanded ? 'rotate(90deg)' : 'none',
                    transition: 'transform 0.15s ease',
                  }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: colors.navDivider, margin: `${t.space[2]}px 4px`, transition: 'background 0.2s' }} />

      {/* Bottom actions — sempre param propagação */}
      <div
        style={{
          display: 'flex',
          flexDirection: isIconOnly ? 'column' : 'row',
          alignItems: 'center',
          gap: 4,
          justifyContent: isIconOnly ? 'center' : 'flex-start',
          paddingLeft: isIconOnly ? 0 : 4,
        }}
      >
        <Tooltip label="Notificações">
          <button
            className="nav-icon-btn"
            style={{ position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            <Bell size={15} />
            <span
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                background: t.color.notification,
                color: 'white',
                borderRadius: t.radius.full,
                width: 13,
                height: 13,
                fontSize: t.font.size.xs - 3, // ~8px (badge de notificação)
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: t.font.weight.bold,
              }}
            >
              3
            </span>
          </button>
        </Tooltip>

        <Tooltip label={isGbMode ? 'Modo claro' : 'GB Mode'}>
          <button
            className="nav-icon-btn"
            onClick={(e) => { e.stopPropagation(); toggle() }}
            style={{ color: isGbMode ? colors.brand : undefined }}
          >
            {isGbMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </Tooltip>

        <Tooltip label="Configurações">
          <button
            className="nav-icon-btn"
            onClick={(e) => e.stopPropagation()}
          >
            <Settings size={15} />
          </button>
        </Tooltip>
      </div>
    </div>
  )
}
