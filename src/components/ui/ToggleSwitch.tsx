import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

interface ToggleSwitchProps {
  checked:    boolean
  onChange:   (v: boolean) => void
  label?:     string
  disabled?:  boolean
  ariaLabel?: string
}

export function ToggleSwitch({ checked, onChange, label, disabled, ariaLabel }: ToggleSwitchProps) {
  const { colors } = useTheme()

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] + t.space[1] / 2 }}>
      <button
        type="button"
        className="gb-focusable"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel ?? label}
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
            top: t.space[1] / 2,
            left: t.space[1] / 2,
            width: t.size.toggle.thumb,
            height: t.size.toggle.thumb,
            borderRadius: t.radius.full,
            background: t.color.neutral[0],
            boxShadow: t.shadow.base,
            transform: checked ? `translateX(${t.space[5]}px)` : 'translateX(0)',
            transition: `transform ${t.transition.smooth}`,
          }}
        />
      </button>
      {label && (
        <span style={{
          fontSize: t.font.size.sm,
          fontWeight: t.font.weight.medium,
          color: disabled ? colors.fg.subtle : colors.fg.default,
          fontFamily: t.font.family.sans,
          transition: `color ${t.transition.smooth}`,
        }}>
          {label}
        </span>
      )}
    </div>
  )
}
