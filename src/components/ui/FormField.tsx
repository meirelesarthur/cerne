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
}

export function FormField({ label, required, error, hint, style, ...inputProps }: FormFieldProps) {
  const { colors } = useTheme()
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
      <input
        {...inputProps}
        style={{
          width: '100%',
          height: 38,
          border: error
            ? `1.5px solid ${t.color.error.text}`
            : `1.5px solid ${colors.border}`,
          borderRadius: t.radius.DEFAULT,
          padding: `0 ${t.space[2] + t.space[1] / 2}px`,
          fontSize: t.font.size.base,
          fontFamily: t.font.family.sans,
          color: colors.textPrimary,
          background: colors.inputBg,
          outline: 'none',
          boxSizing: 'border-box',
          transition: `border-color ${t.transition.DEFAULT}, background 0.2s, color 0.2s`,
          ...style,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = error ? t.color.error.text : colors.brand
          inputProps.onFocus?.(e)
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? t.color.error.text : colors.border
          inputProps.onBlur?.(e)
        }}
      />
      {error && (
        <span style={{ fontSize: t.font.size.xs, color: t.color.error.text, fontFamily: t.font.family.sans }}>
          {error}
        </span>
      )}
    </div>
  )
}
