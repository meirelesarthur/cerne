import React from 'react'

type BadgeVariant = 'success' | 'danger' | 'warning' | 'neutral'

interface BadgeProps {
  label: string
  variant: BadgeVariant
}

const variantStyles: Record<BadgeVariant, { background: string; color: string }> = {
  success: { background: '#d1fae5', color: '#059669' },
  danger: { background: '#fee2e2', color: '#dc2626' },
  warning: { background: '#fef3c7', color: '#d97706' },
  neutral: { background: '#f5f5f5', color: '#737373' },
}

export function Badge({ label, variant }: BadgeProps) {
  const style = variantStyles[variant]
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 9999,
        fontSize: 11,
        fontWeight: 500,
        fontFamily: "'Outfit', sans-serif",
        background: style.background,
        color: style.color,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}
