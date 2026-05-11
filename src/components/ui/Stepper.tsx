import React from 'react'
import { t } from '../../design/tokens'

interface Step {
  id: number
  label: string
}

interface StepperProps {
  steps: Step[]
  current: number
  completed: number[]
  onStepClick: (id: number) => void
}

export function Stepper({ steps, current, completed, onStepClick }: StepperProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        padding: `${t.space[3]}px ${t.space[4]}px`,
        boxSizing: 'border-box',
      }}
    >
      {steps.map((step, index) => {
        const isCompleted = completed.includes(step.id)
        const isActive = step.id === current
        const isClickable = isCompleted
        const circleSize = isActive ? 14 : 10

        return (
          <React.Fragment key={step.id}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: t.space[2],
                flex: '0 0 auto',
                cursor: isClickable ? 'pointer' : 'default',
              }}
              onClick={() => isClickable && onStepClick(step.id)}
            >
              <div
                style={{
                  width: circleSize,
                  height: circleSize,
                  borderRadius: t.radius.full,
                  flexShrink: 0,
                  background: isCompleted ? t.color.brand[600] : t.color.neutral[0],
                  border: isCompleted
                    ? 'none'
                    : isActive
                    ? `2px solid ${t.color.brand[600]}`
                    : `1.5px solid ${t.color.neutral[300]}`,
                  transition: t.transition.smooth,
                  boxSizing: 'border-box',
                }}
              />
              <span
                style={{
                  fontSize: t.font.size.xs,
                  fontWeight: isActive ? t.font.weight.semibold : t.font.weight.normal,
                  fontFamily: t.font.family.sans,
                  color: isCompleted || isActive ? t.color.brand[600] : t.color.neutral[400],
                  whiteSpace: 'nowrap',
                  letterSpacing: '0.1px',
                }}
              >
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 1.5,
                  marginBottom: 19,
                  background: isCompleted ? t.color.brand[600] : t.color.neutral[200],
                  transition: t.transition.smooth,
                }}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
