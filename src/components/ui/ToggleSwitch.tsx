import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

interface ToggleSwitchProps {
  checked:    boolean
  onChange:   (v: boolean) => void
  label?:     string
  disabled?:  boolean
}

export function ToggleSwitch({ checked, onChange, label, disabled }: ToggleSwitchProps) {
  const { colors } = useTheme()

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <button
        type="button"
        className="gb-focusable"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        style={{
          position: 'relative',
          width: t.size.toggle.track,
          height: t.size.toggle.trackHeight,
          borderRadius: t.radius.full,
          background: checked ? t.color.brand[600] : colors.border.default,
          border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: `background ${t.transition.smooth}`,
          flexShrink: 0,
          opacity: disabled ? 0.5 : 1,
          padding: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 2,
            left: checked ? 20 : 2,
            width: t.size.toggle.thumb,
            height: t.size.toggle.thumb,
            borderRadius: '50%',
            background: 'white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
            transition: `left ${t.transition.smooth}`,
          }}
        />
      </button>
      {label && (
        <span style={{
          fontSize: t.font.size.sm,
          fontWeight: t.font.weight.medium,
          color: disabled ? colors.fg.subtle : colors.fg.default,
          fontFamily: t.font.family.sans,
          transition: 'color 0.2s',
        }}>
          {label}
        </span>
      )}
    </div>
  )
}
