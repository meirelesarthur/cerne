import React from 'react'
import { HelpCircle } from 'lucide-react'
import { Tooltip } from '../Tooltip'
import { t } from '../../design/tokens'

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  required?: boolean
  error?: string
  hint?: string
}

export function FormField({ label, required, error, hint, style, ...inputProps }: FormFieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[1] }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: t.space[1], marginBottom: 2 }}>
        <span
          style={{
            fontSize: t.font.size.sm,
            fontWeight: t.font.weight.medium,
            color: t.color.neutral[800],
            fontFamily: t.font.family.sans,
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
            : `1.5px solid ${t.color.neutral[250]}`,
          borderRadius: t.radius.DEFAULT,
          padding: `0 ${t.space[2] + t.space[1] / 2}px`,
          fontSize: t.font.size.base,
          fontFamily: t.font.family.sans,
          color: t.color.neutral[800],
          background: t.color.neutral[0],
          outline: 'none',
          boxSizing: 'border-box',
          transition: `border-color ${t.transition.DEFAULT}`,
          ...style,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = error ? t.color.error.text : t.color.brand[600]
          inputProps.onFocus?.(e)
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? t.color.error.text : t.color.neutral[250]
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
