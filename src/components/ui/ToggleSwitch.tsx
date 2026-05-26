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
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        style={{
          position: 'relative',
          width: 40,
          height: 22,
          borderRadius: t.radius.full,
          background: checked ? t.color.brand[600] : colors.border,
          border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'background 0.2s',
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
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: 'white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
            transition: 'left 0.2s',
          }}
        />
      </button>
      {label && (
        <span style={{
          fontSize: t.font.size.sm,
          fontWeight: t.font.weight.medium,
          color: disabled ? colors.textMuted : colors.textPrimary,
          fontFamily: t.font.family.sans,
          transition: 'color 0.2s',
        }}>
          {label}
        </span>
      )}
    </div>
  )
}
