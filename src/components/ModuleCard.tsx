import type { NavModule } from '../data/menuData'
import { useTheme } from '../context/ThemeContext'
import t from '../design/tokens'

export interface ModuleCardConfig {
  desc: string
}

interface ModuleCardProps {
  module: NavModule
  config: ModuleCardConfig
  onClick?: () => void
}

export function ModuleCard({ module, config, onClick }: ModuleCardProps) {
  const Icon = module.icon
  const { colors } = useTheme()

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
          background: t.color.brand[100],
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
        }}
      >
        <Icon size={19} color={t.color.brand[600]} strokeWidth={1.6} />
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: colors.textPrimary,
          marginBottom: 3,
          fontFamily: "'Outfit', sans-serif",
          transition: 'color 0.2s',
        }}
      >
        {module.label}
      </div>
      <div
        style={{
          fontSize: 11,
          color: colors.textSecondary,
          lineHeight: 1.4,
          fontFamily: "'Outfit', sans-serif",
          transition: 'color 0.2s',
        }}
      >
        {config.desc}
      </div>
    </div>
  )
}
