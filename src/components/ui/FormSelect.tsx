import React from 'react'
import { HelpCircle, ChevronDown } from 'lucide-react'
import { Tooltip } from './Tooltip'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import type { BaseFieldProps } from './fieldTypes'

interface SelectOption {
  value: string
  label: string
}

// O `<select>` reserva a direita para o chevron nativo do controle, então
// `iconRight` não se aplica — daí o Omit. `iconLeft` é suportado normalmente.
interface FormSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement>, Omit<BaseFieldProps, 'iconRight'> {
  options: SelectOption[]
}

export function FormSelect({
  label,
  required,
  error,
  hint,
  status,
  iconLeft,
  options,
  style,
  className,
  ...selectProps
}: FormSelectProps) {
  const { colors } = useTheme()

  const isError = !!error || status === 'err'
  const isOk = !isError && status === 'ok'
  const borderColor = isError
    ? t.color.feedback.error.text
    : isOk
    ? t.color.feedback.success.text
    : colors.border.default

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[1] }}>
      {(label || required || hint) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: t.space[1], marginBottom: 2 }}>
          {label && (
            <span
              style={{
                fontSize: t.font.size.sm,
                fontWeight: t.font.weight.medium,
                color: colors.fg.default,
                fontFamily: t.font.family.sans,
                transition: 'color 0.2s',
              }}
            >
              {label}
            </span>
          )}
          {required && (
            <span style={{ color: t.color.feedback.error.text, fontSize: t.font.size.sm, lineHeight: 1 }}>*</span>
          )}
          {hint && (
            <Tooltip label={hint}>
              <span style={{ display: 'flex', alignItems: 'center', cursor: 'default' }}>
                <HelpCircle size={12} color={t.color.neutral[400]} />
              </span>
            </Tooltip>
          )}
        </div>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {iconLeft && (
          <span
            style={{
              position: 'absolute',
              left: 14,
              display: 'flex',
              alignItems: 'center',
              color: t.color.neutral[400],
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            {iconLeft}
          </span>
        )}
        <select
          {...selectProps}
          aria-invalid={isError || undefined}
          className={['gb-focusable', className].filter(Boolean).join(' ')}
          style={{
            width: '100%',
            height: t.size.control,
            border: `1.5px solid ${borderColor}`,
            borderRadius: t.radius.base,
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: iconLeft ? 44 : t.space[2] + t.space[1] / 2,
            paddingRight: t.space[8],
            fontSize: t.font.size.md,
            fontFamily: t.font.family.sans,
            color: selectProps.disabled ? t.color.state.disabled.text : colors.fg.default,
            background: selectProps.disabled ? t.color.state.disabled.bg : colors.bg.input,
            outline: 'none',
            boxSizing: 'border-box',
            appearance: 'none',
            cursor: selectProps.disabled ? 'not-allowed' : 'pointer',
            opacity: selectProps.disabled ? 0.7 : 1,
            transition: `border-color ${t.transition.base}, box-shadow ${t.transition.base}, background ${t.transition.smooth}, color ${t.transition.smooth}`,
            ...style,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = isError ? t.color.feedback.error.text : colors.accent.default
            e.currentTarget.style.boxShadow = isError ? t.glow.error : t.glow.brand
            selectProps.onFocus?.(e)
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = borderColor
            e.currentTarget.style.boxShadow = 'none'
            selectProps.onBlur?.(e)
          }}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          color={t.color.neutral[400]}
          style={{
            position: 'absolute',
            right: t.space[2] + t.space[1] / 2,
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
          }}
        />
      </div>
      {error && (
        <span
          role="alert"
          aria-live="polite"
          style={{ fontSize: t.font.size.xs, color: t.color.feedback.error.text, fontFamily: t.font.family.sans }}
        >
          {error}
        </span>
      )}
    </div>
  )
}
