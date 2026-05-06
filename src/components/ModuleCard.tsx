import type { NavModule } from '../data/menuData'

export interface ModuleCardConfig {
  desc: string
  iconBg: string
  iconColor: string
}

interface ModuleCardProps {
  module: NavModule
  config: ModuleCardConfig
  onClick?: () => void
}

export function ModuleCard({ module, config, onClick }: ModuleCardProps) {
  const Icon = module.icon
  return (
    <div
      className="module-card"
      style={{ width: 180, flexShrink: 0 }}
      onClick={onClick}
    >
      <div
        style={{
          width: 40,
          height: 40,
          background: config.iconBg,
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
        }}
      >
        <Icon size={19} color={config.iconColor} strokeWidth={1.6} />
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: '#1a1a1a',
          marginBottom: 3,
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        {module.label}
      </div>
      <div
        style={{
          fontSize: 11,
          color: '#737373',
          lineHeight: 1.4,
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        {config.desc}
      </div>
    </div>
  )
}
