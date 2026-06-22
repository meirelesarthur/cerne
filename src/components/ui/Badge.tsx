import React from 'react'
import { t } from '../../design/tokens'

export type BadgeVariant = 'success' | 'danger' | 'warning' | 'neutral' | 'info' | 'purple' | 'cyan'

interface BadgeProps {
  label:   string
  variant: BadgeVariant
}

const variantStyles: Record<BadgeVariant, { background: string; color: string }> = {
  success: { background: t.color.feedback.success.bg,   color: t.color.feedback.success.text },
  danger:  { background: t.color.feedback.error.bg,     color: t.color.feedback.error.text },
  warning: { background: t.color.feedback.warning.bg,   color: t.color.feedback.warning.text },
  neutral: { background: t.color.neutral[100], color: t.color.neutral[500] },
  info:    { background: t.color.feedback.info.bg,      color: t.color.feedback.info.text },
  purple:  { background: t.color.accent.purple.bg,    color: t.color.accent.purple.text },
  cyan:    { background: t.color.accent.cyan.bg,      color: t.color.accent.cyan.text },
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
