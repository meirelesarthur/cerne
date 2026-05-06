import React from 'react'
import { HelpCircle } from 'lucide-react'
import { Tooltip } from '../Tooltip'

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  required?: boolean
  error?: string
  hint?: string
}

export function FormField({ label, required, error, hint, style, ...inputProps }: FormFieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: '#1a1a1a',
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          {label}
        </span>
        {required && (
          <span style={{ color: '#dc2626', fontSize: 12, lineHeight: 1 }}>*</span>
        )}
        {hint && (
          <Tooltip label={hint}>
            <span style={{ display: 'flex', alignItems: 'center', cursor: 'default' }}>
              <HelpCircle size={12} color="#9ca3af" />
            </span>
          </Tooltip>
        )}
      </div>
      <input
        {...inputProps}
        style={{
          width: '100%',
          height: 38,
          border: error ? '1.5px solid #dc2626' : '1.5px solid #e5e5e5',
          borderRadius: 8,
          padding: '0 10px',
          fontSize: 13,
          fontFamily: "'Outfit', sans-serif",
          color: '#1a1a1a',
          background: 'white',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s',
          ...style,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = error ? '#dc2626' : '#059669'
          inputProps.onFocus?.(e)
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? '#dc2626' : '#e5e5e5'
          inputProps.onBlur?.(e)
        }}
      />
      {error && (
        <span style={{ fontSize: 11, color: '#dc2626', fontFamily: "'Outfit', sans-serif" }}>
          {error}
        </span>
      )}
    </div>
  )
}
