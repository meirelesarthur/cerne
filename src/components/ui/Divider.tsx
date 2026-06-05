import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

interface DividerProps {
  label?: string
}

export function Divider({ label }: DividerProps) {
  const { colors } = useTheme()
  return (
    <div
      role="separator"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: t.space[3],
      }}
    >
      <div
        aria-hidden="true"
        style={{ flex: 1, height: 1, background: colors.border }}
      />
      {label && (
        <span
          style={{
            fontSize: t.font.size.xs,
            fontFamily: t.font.family.sans,
            color: colors.textMuted,
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {label}
        </span>
      )}
      <div
        aria-hidden="true"
        style={{ flex: 1, height: 1, background: colors.border }}
      />
    </div>
  )
}
