import { Bell, Settings, ChevronRight } from 'lucide-react'
import logoFull from '../../assets/Logo.svg'
import logoMin from '../../assets/logo-min.svg'
import { Tooltip } from '../Tooltip'
import type { NavModule } from '../../data/menuData'

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
  const isIconOnly = mode === 'icon-only'
  const w = isIconOnly ? 56 : 240

  return (
    <div
      onClick={onToggle}
      style={{
        width: w,
        minWidth: w,
        background: 'white',
        borderRadius: 16,
        display: 'flex',
        flexDirection: 'column',
        padding: '12px 8px',
        transition: 'width 0.2s ease, min-width 0.2s ease',
        overflow: 'hidden',
        cursor: 'default',
      }}
    >
      {/* Logo — sem botão, clique bubbles para o root */}
      <div
        style={{
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isIconOnly ? 'center' : 'flex-start',
          paddingLeft: isIconOnly ? 0 : 8,
          marginBottom: 8,
          flexShrink: 0,
        }}
      >
        {isIconOnly
          ? <img src={logoMin} alt="GB" style={{ height: 28, width: 'auto', pointerEvents: 'none' }} />
          : <img src={logoFull} alt="GB Agritech" style={{ height: 28, width: 'auto', pointerEvents: 'none' }} />
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
                    color: highlighted ? '#059669' : '#9ca3af',
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
      <div style={{ height: 1, background: '#f0f0f0', margin: '8px 4px' }} />

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
                background: '#ff58ae',
                color: 'white',
                borderRadius: 9999,
                width: 13,
                height: 13,
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
