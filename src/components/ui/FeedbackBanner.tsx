import type { ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'
import { t } from '../../design/tokens'
import { Button } from './Button'

export type FeedbackBannerVariant = 'success' | 'error' | 'warning' | 'info'

interface FeedbackBannerProps {
  variant?: FeedbackBannerVariant
  title: string
  description?: ReactNode
  action?: { label: string; onClick: () => void }
}

const config = {
  success: { Icon: CheckCircle2, colors: t.color.feedback.success },
  error: { Icon: XCircle, colors: t.color.feedback.error },
  warning: { Icon: AlertTriangle, colors: t.color.feedback.warning },
  info: { Icon: Info, colors: t.color.feedback.info },
}

export function FeedbackBanner({ variant = 'info', title, description, action }: FeedbackBannerProps) {
  const { Icon, colors } = config[variant]
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: t.space[3],
        padding: `${t.space[3]}px ${t.space[4]}px`,
        borderRadius: t.radius.base,
        border: `1px solid ${colors.border}`,
        background: colors.bg,
        color: colors.text,
      }}
    >
      <Icon size={t.icon.sm} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1, minWidth: 0, fontFamily: t.font.family.sans }}>
        <div style={{ fontSize: t.font.size.base, fontWeight: t.font.weight.semibold }}>{title}</div>
        {description && <div style={{ marginTop: t.space[1], fontSize: t.font.size.sm, lineHeight: t.font.lineHeight.normal }}>{description}</div>}
      </div>
      {action && <Button variant="ghost" size="sm" onClick={action.onClick}>{action.label}</Button>}
    </div>
  )
}
