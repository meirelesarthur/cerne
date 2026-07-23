import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import type { BadgeVariant } from './Badge'

export interface StatusLegendItem {
  label: string
  variant: BadgeVariant
}

interface StatusLegendProps {
  items: StatusLegendItem[]
  label?: string
}

const dotColor: Record<BadgeVariant, string> = {
  success: t.color.feedback.success.solid,
  danger: t.color.feedback.error.solid,
  warning: t.color.feedback.warning.solid,
  info: t.color.feedback.info.solid,
  neutral: t.color.neutral[500],
  purple: t.color.accent.purple.text,
  cyan: t.color.accent.cyan.text,
}

export function StatusLegend({ items, label = 'Legenda de status' }: StatusLegendProps) {
  const { colors } = useTheme()
  return (
    <div aria-label={label} style={{ display: 'flex', alignItems: 'center', gap: t.space[3], flexWrap: 'wrap' }}>
      {items.map((item) => (
        <span key={item.label} style={{ display: 'inline-flex', alignItems: 'center', gap: t.space[1], color: colors.fg.muted, fontFamily: t.font.family.sans, fontSize: t.font.size.sm }}>
          <span aria-hidden="true" style={{ width: t.space[2], height: t.space[2], borderRadius: t.radius.full, background: dotColor[item.variant] }} />
          {item.label}
        </span>
      ))}
    </div>
  )
}
