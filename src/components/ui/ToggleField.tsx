import type { ReactNode } from 'react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { ToggleSwitch } from './ToggleSwitch'

interface ToggleFieldProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
  disabled?: boolean
  icon?: ReactNode
}

/**
 * Campo booleano para formulários densos. Mantém switch, rótulo e explicação
 * como uma única área visual, com estados tokenizados para light e GBMode.
 */
export function ToggleField({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  icon,
}: ToggleFieldProps) {
  const { colors } = useTheme()

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: t.space[3],
        minHeight: t.size.controlLg,
        padding: `${t.space[3]}px ${t.space[4]}px`,
        border: `${t.space[1] / 4}px solid ${checked ? colors.accent.default : colors.border.default}`,
        borderRadius: t.radius.lg,
        background: checked ? colors.accent.subtle : colors.bg.subtle,
        opacity: disabled ? 0.7 : 1,
        transition: `background ${t.transition.base}, border-color ${t.transition.base}, opacity ${t.transition.base}`,
      }}
    >
      {icon && (
        <span aria-hidden="true" style={{ display: 'flex', color: checked ? colors.accent.default : colors.fg.subtle }}>
          {icon}
        </span>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: t.font.family.sans,
            fontSize: t.font.size.sm,
            fontWeight: t.font.weight.semibold,
            color: disabled ? colors.fg.subtle : colors.fg.default,
          }}
        >
          {label}
        </div>
        {description && (
          <div
            style={{
              marginTop: t.space[1],
              fontFamily: t.font.family.sans,
              fontSize: t.font.size.xs,
              lineHeight: t.font.lineHeight.snug,
              color: colors.fg.subtle,
            }}
          >
            {description}
          </div>
        )}
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} disabled={disabled} ariaLabel={label} />
    </div>
  )
}
