import React from 'react'
import { HelpCircle, ChevronDown } from 'lucide-react'
import { Tooltip } from '../Tooltip'

interface SelectOption {
  value: string
  label: string
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  required?: boolean
  error?: string
  hint?: string
  options: SelectOption[]
}

export function FormSelect({ label, required, error, hint, options, style, ...selectProps }: FormSelectProps) {
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
      <div style={{ position: 'relative' }}>
        <select
          {...selectProps}
          style={{
            width: '100%',
            height: 38,
            border: error ? '1.5px solid #dc2626' : '1.5px solid #e5e5e5',
            borderRadius: 8,
            padding: '0 32px 0 10px',
            fontSize: 13,
            fontFamily: "'Outfit', sans-serif",
            color: '#1a1a1a',
            background: 'white',
            outline: 'none',
            boxSizing: 'border-box',
            appearance: 'none',
            cursor: 'pointer',
            transition: 'border-color 0.15s',
            ...style,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = error ? '#dc2626' : '#059669'
            selectProps.onFocus?.(e)
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? '#dc2626' : '#e5e5e5'
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
          color="#9ca3af"
          style={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
          }}
        />
      </div>
      {error && (
        <span style={{ fontSize: 11, color: '#dc2626', fontFamily: "'Outfit', sans-serif" }}>
          {error}
        </span>
      )}
    </div>
  )
}
