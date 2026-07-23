import { Check, Circle, Clock3, X } from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

export type WorkflowStepStatus = 'completed' | 'current' | 'pending' | 'rejected'

export interface WorkflowStep {
  id: string
  label: string
  description?: string
  status: WorkflowStepStatus
}

interface WorkflowTimelineProps {
  steps: WorkflowStep[]
  ariaLabel?: string
}

const iconByStatus = {
  completed: Check,
  current: Clock3,
  pending: Circle,
  rejected: X,
}

export function WorkflowTimeline({ steps, ariaLabel = 'Etapas do processo' }: WorkflowTimelineProps) {
  const { colors } = useTheme()
  return (
    <ol aria-label={ariaLabel} style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
      {steps.map((step, index) => {
        const Icon = iconByStatus[step.status]
        const active = step.status === 'current' || step.status === 'completed'
        const rejected = step.status === 'rejected'
        const color = rejected ? t.color.feedback.error.text : active ? t.color.brand[600] : colors.fg.subtle
        return (
          <li key={step.id} aria-current={step.status === 'current' ? 'step' : undefined} style={{ position: 'relative', minWidth: 0, paddingRight: index < steps.length - 1 ? t.space[3] : 0 }}>
            {index < steps.length - 1 && (
              <span aria-hidden="true" style={{ position: 'absolute', left: t.size.iconBtn.md, right: 0, top: t.size.iconBtn.md / 2, height: 2, background: step.status === 'completed' ? t.color.brand[600] : colors.border.default }} />
            )}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: t.space[2] }}>
              <span style={{ width: t.size.iconBtn.md, height: t.size.iconBtn.md, flexShrink: 0, borderRadius: t.radius.full, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color, background: rejected ? t.color.feedback.error.bg : active ? t.color.feedback.success.bg : colors.bg.subtle, border: `1px solid ${color}` }}>
                <Icon size={t.icon.xs} aria-hidden="true" />
              </span>
              <span style={{ minWidth: 0, paddingTop: t.space[1] }}>
                <span style={{ display: 'block', color: colors.fg.default, fontFamily: t.font.family.sans, fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold }}>{step.label}</span>
                {step.description && <span style={{ display: 'block', marginTop: t.space[1], color: colors.fg.subtle, fontFamily: t.font.family.sans, fontSize: t.font.size.xs }}>{step.description}</span>}
              </span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
