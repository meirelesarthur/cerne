import React from 'react'
import { t } from '../../design/tokens'

type BadgeVariant = 'success' | 'danger' | 'warning' | 'neutral'

interface BadgeProps {
  label: string
  variant: BadgeVariant
}

const variantStyles: Record<BadgeVariant, { background: string; color: string }> = {
  success: { background: t.color.success.bg,   color: t.color.success.text },
  danger:  { background: t.color.error.bg,     color: t.color.error.text },
  warning: { background: t.color.warning.bg,   color: t.color.warning.text },
  neutral: { background: t.color.neutral[100], color: t.color.neutral[500] },
}

export function Badge({ label, variant }: BadgeProps) {
  const style = variantStyles[variant]
  return (
    <span
      style={{
        display: 'inline-block',
        padding: `${t.space[1] / 2}px ${t.space[2] + t.space[1] / 2}px`,
        borderRadius: t.radius.full,
        fontSize: t.font.size.xs,
        fontWeight: t.font.weight.medium,
        fontFamily: t.font.family.sans,
        background: style.background,
        color: style.color,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}
