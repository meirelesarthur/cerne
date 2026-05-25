import React from 'react'
import { HelpCircle } from 'lucide-react'
import { Tooltip } from '../Tooltip'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  required?: boolean
  error?: string
  hint?: string
  /** Ícone posicionado à esquerda do input */
  iconLeft?: React.ReactNode
  /** Ícone ou botão posicionado à direita do input */
  iconRight?: React.ReactNode
  /** Estado visual: 'ok' = borda verde, 'err' = borda vermelha */
  status?: 'idle' | 'ok' | 'err'
}

export function FormField({
  label,
  required,
  error,
  hint,
  iconLeft,
  iconRight,
  status,
  style,
  ...inputProps
}: FormFieldProps) {
  const { colors } = useTheme()

  const isError = !!error || status === 'err'
  const isOk = !isError && status === 'ok'
  const borderColor = isError
    ? t.color.error.text
    : isOk
    ? t.color.success.text
    : colors.border

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[1] }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: t.space[1], marginBottom: 2 }}>
        <span
          style={{
            fontSize: t.font.size.sm,
            fontWeight: t.font.weight.medium,
            color: colors.textPrimary,
            fontFamily: t.font.family.sans,
            transition: 'color 0.2s',
          }}
        >
          {label}
        </span>
        {required && (
          <span style={{ color: t.color.error.text, fontSize: t.font.size.sm, lineHeight: 1 }}>*</span>
        )}
        {hint && (
          <Tooltip label={hint}>
            <span style={{ display: 'flex', alignItems: 'center', cursor: 'default' }}>
              <HelpCircle size={12} color={t.color.neutral[400]} />
            </span>
          </Tooltip>
        )}
      </div>

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

        <input
          {...inputProps}
          style={{
            width: '100%',
            height: 38,
            border: `1.5px solid ${borderColor}`,
            borderRadius: t.radius.DEFAULT,
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: iconLeft ? 44 : t.space[2] + t.space[1] / 2,
            paddingRight: iconRight ? 46 : t.space[2] + t.space[1] / 2,
            fontSize: t.font.size.base,
            fontFamily: t.font.family.sans,
            color: colors.textPrimary,
            background: isError ? t.color.error.bg : colors.inputBg,
            outline: 'none',
            boxSizing: 'border-box',
            transition: `border-color ${t.transition.DEFAULT}, background ${t.transition.smooth}`,
            ...style,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = isError ? t.color.error.text : colors.brand
            e.currentTarget.style.boxShadow = isError
              ? '0 0 0 3px rgba(239,68,68,.1)'
              : '0 0 0 3.5px rgba(34,197,94,.12)'
            inputProps.onFocus?.(e)
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = borderColor
            e.currentTarget.style.boxShadow = 'none'
            inputProps.onBlur?.(e)
          }}
        />

        {iconRight && (
          <span
            style={{
              position: 'absolute',
              right: 12,
              display: 'flex',
              alignItems: 'center',
              zIndex: 1,
            }}
          >
            {iconRight}
          </span>
        )}
      </div>

      {isError && error && (
        <span
          style={{
            fontSize: t.font.size.xs,
            color: t.color.error.text,
            fontFamily: t.font.family.sans,
          }}
        >
          {error}
        </span>
      )}
    </div>
  )
}
