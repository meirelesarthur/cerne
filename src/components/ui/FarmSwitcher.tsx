import { ChevronDown } from 'lucide-react'
import { useFarm } from '../../context/FarmContext'
import { useTheme } from '../../context/ThemeContext'
import { t } from '../../design/tokens'
import { DropdownMenu } from './DropdownMenu'

export function FarmSwitcher() {
  const { currentFarm, farms, setCurrentFarm } = useFarm()
  const { colors } = useTheme()

  return (
    <DropdownMenu
      trigger={
        <button
          style={{
            height: 32,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: `0 ${t.space[3]}px`,
            borderRadius: t.radius.base,
            border: `1px solid ${colors.border.default}`,
            background: colors.bg.surface,
            cursor: 'pointer',
            color: colors.fg.default,
            fontSize: t.font.size.sm,
            fontFamily: t.font.family.sans,
            transition: 'background 0.15s',
            fontWeight: t.font.weight.medium,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.bg.subtle
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = colors.bg.surface
          }}
          title={currentFarm?.name}
        >
          <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentFarm?.name}
          </span>
          <ChevronDown size={14} />
        </button>
      }
      items={farms.map((farm) => ({
        label: farm.name,
        sublabel: farm.code,
        onSelect: () => setCurrentFarm(farm),
        isActive: currentFarm?.id === farm.id,
      }))}
    />
  )
}
